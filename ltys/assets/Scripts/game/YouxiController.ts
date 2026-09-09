import { saveProgress, getProgress } from './GameState';
import GameState from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
const { ccclass, property } = cc._decorator;

// camp: 0=Han(black), 1=Chu(red)
interface NodeState {
    node_id: number;
    camp: number;
    x: number; // 0-100 relative
    y: number;
    displayNode: cc.Node;
    spriteKey: string;
}

interface EdgeState {
    start_node: number;
    end_node: number;
    used: boolean;
}

@ccclass
export default class YouxiController extends cc.Component {

    @property(cc.Node)
    winResultPopup: cc.Node = null;

    @property(cc.Node)
    loseResultPopup: cc.Node = null;

    @property(cc.Node)
    pausePopup: cc.Node = null;

    @property(cc.Node)
    xuguanPopup: cc.Node = null;

    @property([cc.Node])
    winStarNodes: cc.Node[] = [];

    @property([cc.Node])
    loseStarNodes: cc.Node[] = [];

    @property(cc.Node)
    winBackBtn: cc.Node = null;

    @property(cc.Node)
    winNextBtn: cc.Node = null;

    @property(cc.Node)
    loseBackBtn: cc.Node = null;

    @property(cc.Node)
    loseRetryBtn: cc.Node = null;

    @property(cc.Node)
    pauseBackBtn: cc.Node = null;

    @property(cc.Node)
    pauseContinueBtn: cc.Node = null;

    @property(cc.Node)
    xuguanBackBtn: cc.Node = null;

    @property(cc.Node)
    xuguanContinueBtn: cc.Node = null;

    private _sp: Record<string, cc.SpriteFrame> = {};
    private _starFullFrame: cc.SpriteFrame = null;
    private _starGrayFrame: cc.SpriteFrame = null;
    private _canvas: cc.Node = null;
    private _gameArea: cc.Node = null;
    private _bridgeTemplate: cc.Node = null;
    private _nodeTemplate: cc.Node = null;
    private _hanFlag: cc.Node = null;
    private _chuFlag: cc.Node = null;

    private _levelId: number = 1;
    private _nodes: NodeState[] = [];
    private _edges: EdgeState[] = [];
    private _nodeMap: Record<number, NodeState> = {};

    // Path planning
    private _path: number[] = [];
    private _usedEdges: Set<string> = new Set();
    private _startSelected: boolean = false;
    private _currentStars: number = 3;
    private _hasUsedHint: boolean = false;
    private _hasReset: boolean = false;
    private _paused: boolean = false;
    private _hasUsedFreeContinue: boolean = false;

    // Touch state
    private _touching: boolean = false;
    private _lastNodeId: number = -1;

    // March animation state
    private _marching: boolean = false;
    private _marchStep: number = 0;       // current step index in path
    private _marchTimer: number = 0;
    private _marchStepDur: number = 0.6; // seconds per step
    // bridge nodes spawned during this level, keyed by plank_id
    private _bridgeNodes: Record<string, cc.Node[]> = {};
    private _drawNode: cc.Graphics = null;

    onLoad() {
        StateBridge.syncForStartScene();
        this._canvas = this.node.parent;
        this._gameArea = this._canvas.getChildByName('gameArea');
        this._bridgeTemplate = this._gameArea.getChildByName('bridgeTemplate');
        this._nodeTemplate   = this._gameArea.getChildByName('nodeIcon_r1c2');
        this._hanFlag        = this._gameArea.getChildByName('hanFlag');
        this._chuFlag        = this._gameArea.getChildByName('chuFlag');
        this._setupResultPopups();

        // Hide all templates on start
        if (this._bridgeTemplate) this._bridgeTemplate.active = false;
        if (this._nodeTemplate)   this._nodeTemplate.active   = false;
        if (this._hanFlag)        this._hanFlag.active        = false;
        if (this._chuFlag)        this._chuFlag.active        = false;

        const nodeIcon2 = this._gameArea.getChildByName('nodeIcon_r1c1');
        if (nodeIcon2) nodeIcon2.active = false;

        const p = getProgress();
        this._levelId = Math.max(1, Math.min(cfg.levels.length, Math.floor(Number(GameState.selectedLevel) || 1)));
        GameState.selectedLevel = this._levelId;

        // Star eligibility: start at 3, reduce if failed before
        const failed = p.failed_levels || [];
        this._currentStars = failed.indexOf(this._levelId) !== -1 ? 2 : 3;
        this._hasReset = false;
        this._hasUsedHint = false;
        this._hasUsedFreeContinue = false;

        // Bind buttons
        const attackBtn = this._canvas.getChildByName('attackBtn');
        if (attackBtn) attackBtn.on(cc.Node.EventType.TOUCH_END, this._onAttack, this);

        const resetBtn = this._canvas.getChildByName('resetBtn');
        if (resetBtn) resetBtn.on(cc.Node.EventType.TOUCH_END, this._onReset, this);

        const hintBtn = this._canvas.getChildByName('hintBtn');
        if (hintBtn) hintBtn.on(cc.Node.EventType.TOUCH_END, this._onHint, this);

        const quitBtn = this._canvas.getChildByName('quitBtn');
        if (quitBtn) quitBtn.on(cc.Node.EventType.TOUCH_END, this._onQuit, this);

        cc.loader.loadResDir('textures/youxi', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Youxi] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._loadStarFrames(() => {
                this._applyStaticAssets();
                this._initLevel();
            });
        });
    }

    private _loadStarFrames(done: () => void) {
        const framePaths = [
            'zzzImg/wujiaoxing1',
            'zzzImg/wujiaoxing2',
            'zzzImg/zhenyinghong',
            'zzzImg/zhenyinglv',
            'zzzImg/hongdui',
            'zzzImg/lvdui',
            'zzzImg/bg1',
            'zzzImg/bg2',
            'zzzImg/bg3',
            'zzzImg/bg4',
            'zzzImg/bg5',
        ];
        let pending = framePaths.length;
        const finish = () => {
            pending--;
            if (pending <= 0) done();
        };

        framePaths.forEach((path: string) => {
            cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
                const key = path.substr(path.lastIndexOf('/') + 1);
                if (err) {
                    cc.warn('[Youxi] load ' + key + ' failed', err);
                } else {
                    this._sp[key] = frame;
                    if (key === 'wujiaoxing1') this._starFullFrame = frame;
                    if (key === 'wujiaoxing2') this._starGrayFrame = frame;
                }
                finish();
            });
        });
    }

    private _applyStaticAssets() {
        this._setLevelBackground();
        this._setSp(this._hanFlag, 'lvdui');
        this._setSp(this._chuFlag, 'hongdui');
    }

    private _setLevelBackground() {
        const bgNode = this._canvas && this._canvas.getChildByName('bg');
        const groupSize = Math.max(1, Math.ceil(cfg.levels.length / 5));
        const bgIndex = Math.max(1, Math.min(5, Math.ceil(this._levelId / groupSize)));
        this._setSp(bgNode, 'bg' + bgIndex);
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        const s = node.getComponent(cc.Sprite);
        if (!s) return;
        s.spriteFrame = this._sp[key];
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    // ── Level init ───────────────────────────────────────────────────────────

    private _initLevel() {
        const levelData = cfg.levels.find((l: any) => l.level_id === this._levelId);
        if (!levelData) { cc.error('[Youxi] level not found:', this._levelId); return; }
        cc.log('[Youxi] levelData keys:', Object.keys(levelData).join(','));

        this._nodes = [];
        this._edges = [];
        this._nodeMap = {};
        this._path = [];
        this._usedEdges = new Set();
        this._startSelected = false;
        this._marching = false;
        this._bridgeNodes = {};

        // Remove only dynamic nodes, keep templates and flags
        const keep = ['bridgeTemplate', 'nodeIcon_r1c2', 'nodeIcon_r1c1', 'hanFlag', 'chuFlag', 'pathDraw'];
        const toRemove: cc.Node[] = [];
        this._gameArea.children.forEach((child: cc.Node) => {
            if (keep.indexOf(child.name) === -1) toRemove.push(child);
        });
        toRemove.forEach((n: cc.Node) => n.destroy());

        // Graphics component for path lines (reuse if exists)
        if (!this._drawNode) {
            const drawNode = new cc.Node('pathDraw');
            drawNode.zIndex = 20; // above bridges and nodes
            this._gameArea.addChild(drawNode);
            this._drawNode = drawNode.addComponent(cc.Graphics);
            this._drawNode.lineWidth = 6;
            this._drawNode.strokeColor = new cc.Color(255, 215, 0, 255);
        }
        this._drawNode.clear();

        // Build node states
        levelData.nodes_config.forEach((nc: any) => {
            const spriteKey = nc.camp === 0 ? 'zhenyinglv' : 'zhenyinghong';
            const state: NodeState = {
                node_id: nc.node_id,
                camp: nc.camp,
                x: nc.x,
                y: nc.y,
                displayNode: null,
                spriteKey: spriteKey,
            };
            this._nodes.push(state);
            this._nodeMap[nc.node_id] = state;
        });

        // edges_config: only for path validation, not rendering
        const edges = (levelData as any).edges_config || [];
        edges.forEach((ec: any) => {
            this._edges.push({ start_node: ec.start_node, end_node: ec.end_node, used: false });
        });

        this._renderNodes();
        this._updateUI();
        this._bindTouchOnGameArea();
    }

    private _renderNodes() {
        const areaW = this._gameArea.width;
        const areaH = this._gameArea.height;

        // Draw bridges from planks_config (below nodes)
        const planks = (cfg.levels.find((l: any) => l.level_id === this._levelId) as any).planks_config || [];
        planks.forEach((plank: any) => {
            const na = this._nodeMap[plank.locked_edge.node_a];
            const nb = this._nodeMap[plank.locked_edge.node_b];
            if (!na || !nb) return;

            const x1 = (na.x / 10) * areaW - areaW / 2;
            const y1 = areaH / 2 - (na.y / 10) * areaH;
            const x2 = (nb.x / 10) * areaW - areaW / 2;
            const y2 = areaH / 2 - (nb.y / 10) * areaH;

            const dist = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

            // Template is vertical (width=35, height=100), rotated 90deg to lay horizontal
            // So tile length = template.height, tile thickness = template.width
            const TILE_W = this._bridgeTemplate.height;
            const count = Math.ceil(dist / TILE_W);
            const actualTileW = dist / count;

            for (let i = 0; i < count; i++) {
                const t = (i + 0.5) / count;
                const bx = x1 + (x2 - x1) * t;
                const by = y1 + (y2 - y1) * t;

                const bridge = cc.instantiate(this._bridgeTemplate);
                bridge.name = 'bridge_' + plank.plank_id + '_' + i;
                bridge.height = actualTileW; // height becomes the length after 90deg rotation
                bridge.x = bx;
                bridge.y = by;
                bridge.angle = angle + 90;
                bridge.active = true;

                this._gameArea.addChild(bridge);
                if (!this._bridgeNodes[plank.plank_id]) this._bridgeNodes[plank.plank_id] = [];
                this._bridgeNodes[plank.plank_id].push(bridge);
            }
        });

        // Draw nodes on top
        this._nodes.forEach(state => {
            const nx = (state.x / 10) * areaW - areaW / 2;
            const ny = areaH / 2 - (state.y / 10) * areaH;

            const n = cc.instantiate(this._nodeTemplate);
            n.name = 'node_' + state.node_id;
            n.x = nx;
            n.y = ny;
            n.active = true;

            const sp = n.getComponent(cc.Sprite);
            if (sp) {
                sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this._applyNodeSprite(sp, state);
            }

            state.displayNode = n;
            this._gameArea.addChild(n);
        });
    }

    private _applyNodeSprite(sp: cc.Sprite, state: NodeState) {
        if (this._sp[state.spriteKey]) sp.spriteFrame = this._sp[state.spriteKey];
    }

    private _flipNodeSprite(state: NodeState) {
        const flipMap: Record<string, string> = {
            'zhenyinglv': 'zhenyinghong',
            'zhenyinghong': 'zhenyinglv',
        };
        state.spriteKey = flipMap[state.spriteKey] || state.spriteKey;
        state.camp = state.camp === 0 ? 1 : 0;
        const sp = state.displayNode && state.displayNode.getComponent(cc.Sprite);
        if (sp) this._applyNodeSprite(sp, state);
    }

    // ── Touch handling ───────────────────────────────────────────────────────

    private _bindTouchOnGameArea() {
        this._gameArea.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._gameArea.off(cc.Node.EventType.TOUCH_MOVE,  this._onTouchMove,  this);
        this._gameArea.off(cc.Node.EventType.TOUCH_END,   this._onTouchEnd,   this);
        this._gameArea.off(cc.Node.EventType.TOUCH_CANCEL,this._onTouchEnd,   this);

        this._gameArea.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._gameArea.on(cc.Node.EventType.TOUCH_MOVE,  this._onTouchMove,  this);
        this._gameArea.on(cc.Node.EventType.TOUCH_END,   this._onTouchEnd,   this);
        this._gameArea.on(cc.Node.EventType.TOUCH_CANCEL,this._onTouchEnd,   this);
    }

    private _getTouchedNode(touch: cc.Touch): number {
        const pos = this._gameArea.convertToNodeSpaceAR(touch.getLocation());
        let closest = -1;
        let closestDist = 999;
        for (const state of this._nodes) {
            if (!state.displayNode) continue;
            const dx = pos.x - state.displayNode.x;
            const dy = pos.y - state.displayNode.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            const radius = state.displayNode.width * 0.6;
            if (d < radius && d < closestDist) {
                closest = state.node_id;
                closestDist = d;
            }
        }
        return closest;
    }

    // Check if a plank (bridge) exists between two nodes
    private _hasPlank(nodeA: number, nodeB: number): boolean {
        const levelData = cfg.levels.find((l: any) => l.level_id === this._levelId);
        if (!levelData) return false;
        const planks = levelData.planks_config || [];
        return planks.some((p: any) =>
            (p.locked_edge.node_a === nodeA && p.locked_edge.node_b === nodeB) ||
            (p.locked_edge.node_a === nodeB && p.locked_edge.node_b === nodeA)
        );
    }

    private _onTouchStart(e: cc.Event.EventTouch) {
        const nodeId = this._getTouchedNode(e.touch);
        cc.log('[Youxi] touchStart nodeId=', nodeId, 'nodes=', this._nodes.length);
        if (nodeId === -1) return;

        if (this._nodeMap[nodeId].camp !== 0) {
            cc.log('[Youxi] not Han camp, ignored');
            return;
        }

        this._path = [nodeId];
        this._usedEdges = new Set();
        this._startSelected = true;
        this._touching = true;
        this._lastNodeId = nodeId;
        this._redrawPath();
    }

    private _onTouchMove(e: cc.Event.EventTouch) {
        if (!this._touching || !this._startSelected) return;
        const nodeId = this._getTouchedNode(e.touch);
        if (nodeId === -1 || nodeId === this._lastNodeId) return;

        const edgeKey  = this._lastNodeId + '_' + nodeId;
        const edgeKeyR = nodeId + '_' + this._lastNodeId;

        // Backtrack: undo last step
        if (this._path.length >= 2 && this._path[this._path.length - 2] === nodeId) {
            const removedId = this._path.pop();
            this._usedEdges.delete(removedId + '_' + nodeId);
            this._usedEdges.delete(nodeId + '_' + removedId);
            this._lastNodeId = nodeId;
            this._redrawPath();
            return;
        }

        // Must have a plank between nodes and not already used
        if (!this._hasPlank(this._lastNodeId, nodeId)) return;
        if (this._usedEdges.has(edgeKey) || this._usedEdges.has(edgeKeyR)) return;

        this._path.push(nodeId);
        this._usedEdges.add(edgeKey);
        this._lastNodeId = nodeId;
        this._redrawPath();
    }

    private _onTouchEnd(e: cc.Event.EventTouch) {
        this._touching = false;
        // Do NOT settle on release - player must tap 全军出击
    }

    // ── Path drawing ─────────────────────────────────────────────────────────

    private _redrawPath() {
        if (!this._drawNode) return;
        this._drawNode.clear();
        if (this._path.length < 2) return;

        const areaW = this._gameArea.width;
        const areaH = this._gameArea.height;

        const toPos = (nodeId: number): cc.Vec2 => {
            const s = this._nodeMap[nodeId];
            return cc.v2(
                (s.x / 10) * areaW - areaW / 2,
                areaH / 2 - (s.y / 10) * areaH
            );
        };

        const p0 = toPos(this._path[0]);
        this._drawNode.moveTo(p0.x, p0.y);
        for (let i = 1; i < this._path.length; i++) {
            const p = toPos(this._path[i]);
            this._drawNode.lineTo(p.x, p.y);
        }
        this._drawNode.stroke();
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    private _onReset() {
        if (this._path.length > 0 && this._currentStars === 3) {
            this._currentStars = 2;
        }
        this._hasReset = true;
        this._path = [];
        this._usedEdges = new Set();
        this._startSelected = false;
        this._lastNodeId = -1;
        this._touching = false;
        if (this._drawNode) this._drawNode.clear();
        this._updateUI();
    }

    private _onHint() {
        if (this._hasUsedHint) return;
        this._hasUsedHint = true;
        // 锦囊：有历史失败记录→1星，无历史失败→2星
        const p = getProgress();
        const failed = p.failed_levels || [];
        this._currentStars = failed.indexOf(this._levelId) !== -1 ? 1 : 2;
        this._updateUI();

        // Show unique_solution path
        const levelData = cfg.levels.find((l: any) => l.level_id === this._levelId);
        const solution: number[] = levelData && levelData.unique_solution ? levelData.unique_solution : [];
        if (solution.length >= 2 && this._drawNode) {
            this._drawNode.clear();
            const areaW = this._gameArea.width;
            const areaH = this._gameArea.height;
            this._drawNode.strokeColor = new cc.Color(100, 200, 255, 200);
            this._drawNode.lineWidth = 8;
            const p0 = this._nodePos(solution[0]);
            this._drawNode.moveTo(p0.x, p0.y);
            for (let i = 1; i < solution.length; i++) {
                const p = this._nodePos(solution[i]);
                this._drawNode.lineTo(p.x, p.y);
            }
            this._drawNode.stroke();
            // Restore color for player path
            this._drawNode.strokeColor = new cc.Color(255, 215, 0, 255);
            this._drawNode.lineWidth = 6;
        }
    }

    private _onQuit() {
        this._showPausePopup();
    }

    private _setupResultPopups() {
        this.winResultPopup = this.winResultPopup || this._canvas.getChildByName('WinResultPopup');
        this.loseResultPopup = this.loseResultPopup || this._canvas.getChildByName('LoseResultPopup');
        this.pausePopup = this.pausePopup || this._canvas.getChildByName('PausePopup');
        this.xuguanPopup = this.xuguanPopup || this._canvas.getChildByName('XuGuanPopup');

        this.winBackBtn = this.winBackBtn || this._findDeep(this.winResultPopup, 'backBtn');
        this.winNextBtn = this.winNextBtn || this._findDeep(this.winResultPopup, 'nextBtn');
        this.loseBackBtn = this.loseBackBtn || this._findDeep(this.loseResultPopup, 'backBtn');
        this.loseRetryBtn = this.loseRetryBtn || this._findDeep(this.loseResultPopup, 'retryBtn');
        this.pauseBackBtn = this.pauseBackBtn || this._findDeep(this.pausePopup, 'backBtn');
        this.pauseContinueBtn = this.pauseContinueBtn || this._findDeep(this.pausePopup, 'continueBtn');
        this.xuguanBackBtn = this.xuguanBackBtn || this._findDeep(this.xuguanPopup, 'backBtn');
        this.xuguanContinueBtn = this.xuguanContinueBtn || this._findDeep(this.xuguanPopup, 'continueBtn');

        if (!this.winStarNodes || this.winStarNodes.length === 0) {
            const starsRoot = this._findDeep(this.winResultPopup, 'Stars');
            this.winStarNodes = (starsRoot || this.winResultPopup)
                ? this._getStarIconNodes(starsRoot || this.winResultPopup)
                : [];
        }
        if (!this.loseStarNodes || this.loseStarNodes.length === 0) {
            const starsRoot = this._findDeep(this.loseResultPopup, 'Stars');
            this.loseStarNodes = (starsRoot || this.loseResultPopup)
                ? this._getStarIconNodes(starsRoot || this.loseResultPopup)
                : [];
        }

        this._bindResultButton(this.winBackBtn, this._returnToStart);
        this._bindResultButton(this.winNextBtn, this._goNextLevel);
        this._bindResultButton(this.loseBackBtn, this._returnToStart);
        this._bindResultButton(this.loseRetryBtn, this._retryLevel);
        this._bindResultButton(this.pauseBackBtn, this._returnToStart);
        this._bindResultButton(this.pauseContinueBtn, this._hidePausePopup);
        this._bindResultButton(this.xuguanBackBtn, this._returnToStart);
        this._bindResultButton(this.xuguanContinueBtn, this._continueCurrentLevelFree);

        if (this.winResultPopup) {
            this.winResultPopup.active = false;
            this.winResultPopup.zIndex = 1000;
            this._fitPopupOverlay(this.winResultPopup);
        }
        if (this.loseResultPopup) {
            this.loseResultPopup.active = false;
            this.loseResultPopup.zIndex = 1000;
            this._fitPopupOverlay(this.loseResultPopup);
        }
        if (this.pausePopup) {
            this.pausePopup.active = false;
            this.pausePopup.zIndex = 1000;
            this._fitPopupOverlay(this.pausePopup);
        }
        if (this.xuguanPopup) {
            this.xuguanPopup.active = false;
            this.xuguanPopup.zIndex = 1000;
            this._fitPopupOverlay(this.xuguanPopup);
        }
    }

    private _findDeep(root: cc.Node, name: string): cc.Node {
        if (!root) return null;
        if (root.name === name) return root;
        for (let i = 0; i < root.children.length; i++) {
            const found = this._findDeep(root.children[i], name);
            if (found) return found;
        }
        return null;
    }

    private _bindResultButton(node: cc.Node, cb: () => void) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END, cb, this);
        node.on(cc.Node.EventType.TOUCH_END, cb, this);
    }

    private _fitPopupOverlay(popup: cc.Node) {
        if (!popup) return;

        const visibleSize = cc.view.getVisibleSize ? cc.view.getVisibleSize() : cc.winSize;
        const width = Math.max(this._canvas ? this._canvas.width : 0, cc.winSize.width, visibleSize.width, 2000);
        const height = Math.max(this._canvas ? this._canvas.height : 0, cc.winSize.height, visibleSize.height, 2000);

        popup.setPosition(0, 0);
        popup.setContentSize(width, height);

        const mask = this._findPopupMask(popup);
        if (!mask) return;

        const widget = mask.getComponent(cc.Widget);
        if (widget) widget.enabled = false;

        mask.setPosition(0, 0);
        mask.setContentSize(width, height);

        const sprite = mask.getComponent(cc.Sprite);
        if (sprite) sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    private _findPopupMask(popup: cc.Node): cc.Node {
        const maskByName = this._findDeep(popup, '遮罩');
        if (maskByName) return maskByName;

        for (let i = 0; i < popup.children.length; i++) {
            const child = popup.children[i];
            if (child.getComponent(cc.BlockInputEvents) || child.getComponent(cc.Widget)) {
                return child;
            }
        }
        return null;
    }

    private _showPausePopup() {
        if (!this.pausePopup) {
            cc.warn('[Youxi] pause popup node not found: PausePopup');
            return;
        }

        this._paused = true;
        this._setGameInputEnabled(false);
        this._fitPopupOverlay(this.pausePopup);
        this.pausePopup.active = true;
        this.pausePopup.stopAllActions();
        this.pausePopup.opacity = 255;

        const panel = this._findDeep(this.pausePopup, 'panel') || this.pausePopup;
        panel.stopAllActions();
        panel.scale = 0.9;
        panel.opacity = 0;
        panel.runAction(cc.spawn(cc.scaleTo(0.15, 1), cc.fadeIn(0.15)));
    }

    private _hidePausePopup() {
        if (this.pausePopup) this.pausePopup.active = false;
        this._paused = false;
        this._setGameInputEnabled(true);
    }

    private _onAttack() {
        if (this._path.length < 2 || this._marching) return;
        this._startMarch();
    }

    private _startMarch() {
        if (this._drawNode) this._drawNode.clear();
        this._marching = true;
        this._marchStep = 0;
        this._marchTimer = 0;

        // Position hanFlag at start node, chuFlag one step behind (at start too initially)
        const startPos = this._nodePos(this._path[0]);
        if (this._hanFlag) {
            this._setSp(this._hanFlag, 'lvdui');
            this._hanFlag.active = true;
            this._hanFlag.x = startPos.x;
            this._hanFlag.y = startPos.y;
            this._hanFlag.zIndex = 15;
        }
        if (this._chuFlag) {
            this._setSp(this._chuFlag, 'hongdui');
            this._chuFlag.active = true;
            this._chuFlag.x = startPos.x;
            this._chuFlag.y = startPos.y;
            this._chuFlag.zIndex = 14;
        }
    }

    update(dt: number) {
        if (this._paused) return;
        if (!this._marching) return;

        this._marchTimer += dt;
        if (this._marchTimer < this._marchStepDur) {
            // Interpolate flag positions
            const t = this._marchTimer / this._marchStepDur;
            const hanStep = this._marchStep + 1;
            const chuStep = this._marchStep;

            if (hanStep < this._path.length) {
                const from = this._nodePos(this._path[chuStep]);
                const to   = this._nodePos(this._path[hanStep]);
                if (this._hanFlag) {
                    this._hanFlag.x = from.x + (to.x - from.x) * t;
                    this._hanFlag.y = from.y + (to.y - from.y) * t;
                }
            }
            if (chuStep > 0) {
                const from = this._nodePos(this._path[chuStep - 1]);
                const to   = this._nodePos(this._path[chuStep]);
                if (this._chuFlag) {
                    this._chuFlag.x = from.x + (to.x - from.x) * t;
                    this._chuFlag.y = from.y + (to.y - from.y) * t;
                }
            }
            return;
        }

        // Step complete
        this._marchTimer = 0;
        const hanStep = this._marchStep + 1;

        // Flip node that hanFlag just arrived at
        const arrivedId = this._path[hanStep];
        if (arrivedId !== undefined) {
            const state = this._nodeMap[arrivedId];
            this._flipNodeSprite(state);
        }

        // Destroy bridges behind chuFlag (between step-1 and step)
        if (this._marchStep > 0) {
            this._destroyBridgeBetween(this._path[this._marchStep - 1], this._path[this._marchStep]);
        }

        // Snap flags to node positions
        if (hanStep < this._path.length && this._hanFlag) {
            const p = this._nodePos(this._path[hanStep]);
            this._hanFlag.x = p.x; this._hanFlag.y = p.y;
        }
        if (this._marchStep < this._path.length && this._chuFlag) {
            const p = this._nodePos(this._path[this._marchStep]);
            this._chuFlag.x = p.x; this._chuFlag.y = p.y;
        }

        this._marchStep++;

        // March complete when hanFlag reaches last node
        if (this._marchStep >= this._path.length - 1) {
            // Destroy last bridge
            this._destroyBridgeBetween(this._path[this._path.length - 2], this._path[this._path.length - 1]);

            this._marching = false;
            if (this._hanFlag) this._hanFlag.active = false;
            if (this._chuFlag) this._chuFlag.active = false;

            this.scheduleOnce(() => { this._settle(); }, 0.3);
        }
    }

    private _nodePos(nodeId: number): cc.Vec2 {
        const s = this._nodeMap[nodeId];
        const areaW = this._gameArea.width;
        const areaH = this._gameArea.height;
        return cc.v2(
            (s.x / 10) * areaW - areaW / 2,
            areaH / 2 - (s.y / 10) * areaH
        );
    }

    private _destroyBridgeBetween(nodeA: number, nodeB: number) {
        const levelData = cfg.levels.find((l: any) => l.level_id === this._levelId);
        if (!levelData) return;
        const planks = levelData.planks_config || [];
        planks.forEach((p: any) => {
            if ((p.locked_edge.node_a === nodeA && p.locked_edge.node_b === nodeB) ||
                (p.locked_edge.node_a === nodeB && p.locked_edge.node_b === nodeA)) {
                const nodes = this._bridgeNodes[p.plank_id] || [];
                nodes.forEach(n => {
                    n.runAction(cc.sequence(
                        cc.fadeOut(0.15),
                        cc.callFunc(() => n.destroy())
                    ));
                });
                this._bridgeNodes[p.plank_id] = [];
            }
        });
    }

    private _settle() {
        if (this._drawNode) this._drawNode.clear();

        // Check win: all nodes must be Han (camp=0)
        // Nodes were already flipped during march animation
        const allHan = this._nodes.every(s => s.camp === 0);

        if (allHan) {
            this._onWin();
        } else {
            this._onLose();
        }
    }

    private _onWin() {
        const p = getProgress();
        const prevStars = (p.level_stars || {})[String(this._levelId)] || 0;
        if (this._currentStars > prevStars) {
            if (!p.level_stars) p.level_stars = {};
            p.level_stars[String(this._levelId)] = this._currentStars;
        }
        if (p.unlocked_level <= this._levelId) {
            p.unlocked_level = Math.min(cfg.levels.length, this._levelId + 1);
        }
        saveProgress();
        StateBridge.syncNewToOld();
        GameState.lastStars = this._currentStars;

        this.scheduleOnce(() => { this._showResultPopup(true); }, 0.5);
    }

    private _onLose() {
        const p = getProgress();
        if (!p.failed_levels) p.failed_levels = [];
        if (p.failed_levels.indexOf(this._levelId) === -1) {
            p.failed_levels.push(this._levelId);
        }
        saveProgress();
        StateBridge.syncNewToOld();

        if (!this._hasUsedFreeContinue) {
            this.scheduleOnce(() => { this._showXuGuanPopup(); }, 0.5);
        } else {
            this.scheduleOnce(() => { this._showResultPopup(false); }, 0.5);
        }
    }

    private _showXuGuanPopup() {
        if (!this.xuguanPopup) {
            cc.warn('[Youxi] xuguan popup node not found: XuGuanPopup');
            this._showResultPopup(false);
            return;
        }

        this._setGameInputEnabled(false);
        this._fitPopupOverlay(this.xuguanPopup);
        this.xuguanPopup.active = true;
        this.xuguanPopup.stopAllActions();
        this.xuguanPopup.opacity = 255;

        const panel = this._findDeep(this.xuguanPopup, 'panel') || this.xuguanPopup;
        panel.stopAllActions();
        panel.scale = 0.9;
        panel.opacity = 0;
        panel.runAction(cc.spawn(cc.scaleTo(0.15, 1), cc.fadeIn(0.15)));
    }

    private _continueCurrentLevelFree() {
        this._hasUsedFreeContinue = true;
        if (this.xuguanPopup) this.xuguanPopup.active = false;

        const p = getProgress();
        const failed = p.failed_levels || [];
        this._currentStars = failed.indexOf(this._levelId) !== -1 ? 2 : 3;
        this._hasReset = false;
        this._hasUsedHint = false;
        this._touching = false;
        this._lastNodeId = -1;
        if (this._drawNode) this._drawNode.clear();

        this._initLevel();
        this._setGameInputEnabled(true);
    }

    private _showResultPopup(isWin: boolean) {
        this._setGameInputEnabled(false);

        if (this.winResultPopup) this.winResultPopup.active = false;
        if (this.loseResultPopup) this.loseResultPopup.active = false;
        if (this.xuguanPopup) this.xuguanPopup.active = false;

        const popup = isWin ? this.winResultPopup : this.loseResultPopup;
        if (!popup) {
            cc.warn('[Youxi] result popup node not found:', isWin ? 'WinResultPopup' : 'LoseResultPopup');
            return;
        }

        this._fitPopupOverlay(popup);
        this._updateResultStars(
            isWin ? this.winStarNodes : this.loseStarNodes,
            isWin ? (GameState.lastStars || this._currentStars) : Math.min(this._currentStars, 2)
        );

        popup.active = true;
        popup.stopAllActions();
        popup.opacity = 255;

        const panel = this._findDeep(popup, 'panel') || popup;
        panel.stopAllActions();
        panel.scale = 0.9;
        panel.opacity = 0;
        panel.runAction(cc.spawn(cc.scaleTo(0.15, 1), cc.fadeIn(0.15)));
    }

    private _updateResultStars(resultStarNodes: cc.Node[], stars: number) {
        const safeStars = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
        const starNodes = (resultStarNodes || []).filter((node: cc.Node) => !!node).slice(0, 3);
        for (let i = 0; i < starNodes.length; i++) {
            const sprite = starNodes[i].getComponent(cc.Sprite);
            if (!sprite) continue;
            const frame = i < safeStars ? this._starFullFrame : this._starGrayFrame;
            if (frame) sprite.spriteFrame = frame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            starNodes[i].active = true;
        }
    }

    private _returnToStart() {
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }

    private _goNextLevel() {
        const nextLevel = (GameState.selectedLevel || this._levelId) + 1;
        if (nextLevel > cfg.levels.length) {
            StateBridge.syncNewToOld();
            mGameData.shouldOpenLevelSelect = true;
            cc.director.loadScene('Start');
            return;
        }

        const p = getProgress();
        if (p.stamina < cfg.levelCost) {
            cc.director.loadScene('Start');
            return;
        }

        GameState.selectedLevel = nextLevel;
        p.stamina -= cfg.levelCost;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        this._restartCurrentScene();
    }

    private _retryLevel() {
        const p = getProgress();
        if (p.stamina < cfg.levelCost) {
            cc.director.loadScene('Start');
            return;
        }

        p.stamina -= cfg.levelCost;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        this._restartCurrentScene();
    }

    private _restartCurrentScene() {
        cc.director.loadScene('youxi');
    }

    private _setGameInputEnabled(enabled: boolean) {
        ['attackBtn', 'resetBtn', 'hintBtn', 'quitBtn'].forEach((name: string) => {
            const node = this._canvas.getChildByName(name);
            if (node) node.active = enabled;
        });
    }

    private _updateStarIcons(starRoot: cc.Node) {
        const stars = Math.max(0, Math.min(3, Math.floor(Number(this._currentStars) || 0)));
        const starNodes = this._getStarIconNodes(starRoot);
        for (let i = 0; i < starNodes.length; i++) {
            const node = starNodes[i];
            node.active = true;
            node.color = cc.Color.WHITE;

            const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
            const frame = i < stars ? this._starFullFrame : this._starGrayFrame;
            if (frame) sprite.spriteFrame = frame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
    }

    private _getStarIconNodes(starRoot: cc.Node): cc.Node[] {
        if (!starRoot) return [];
        return starRoot.children
            .filter((child: cc.Node) => !!child.getComponent(cc.Sprite))
            .sort((a: cc.Node, b: cc.Node) => a.x - b.x)
            .slice(0, 3);
    }

    private _updateUI() {
        const lvlLbl = this._canvas.getChildByName('levelLabel');
        if (lvlLbl) {
            const l = lvlLbl.getComponent(cc.Label);
            if (l) l.string = '第' + String(this._levelId) + '关';
        }
        const starLbl = this._canvas.getChildByName('starLabel');
        if (starLbl) {
            const l = starLbl.getComponent(cc.Label);
            if (l) l.enabled = false;
            this._updateStarIcons(starLbl);
        }
    }
}
