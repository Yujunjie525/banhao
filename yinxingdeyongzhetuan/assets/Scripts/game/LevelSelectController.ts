import { saveProgress, getProgress } from './GameState';
import GameState from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
import { getWarriorRunTotalLevels } from './WarriorRunLevelConfig';
const { ccclass } = cc._decorator;

const TOTAL_LEVELS = getWarriorRunTotalLevels();
const COLS = 3;
const CELL_W = 160;
const CELL_H = 160;
const GAP_X = 10;
const GAP_Y = 10;
const TOP_PAD = 20;
const ROW_H = CELL_H + GAP_Y;
const TOTAL_ROWS = Math.ceil(TOTAL_LEVELS / COLS);
const MIN_POOL_ROWS = 5;
const EXTRA_POOL_ROWS = 4;
const LEVEL_NUM_Y = 5;
const CURRENT_LEVEL_NUM_Y = 16;

@ccclass
export default class LevelSelectController extends cc.Component {

    private _sp: Record<string, cc.SpriteFrame> = {};
    private _canvas: cc.Node = null;
    private _scrollView: cc.ScrollView = null;
    private _content: cc.Node = null;
    private _pool: cc.Node[] = [];
    // Which level each pool node is currently showing (-1 = unassigned).
    private _poolRow: number[] = [];
    private _numDefaultY: number[] = [];

    onLoad() {
        this._canvas = this.node.parent;
        const c = this._canvas;

        const svNode = c.getChildByName('scrollView');
        this._scrollView = svNode.getComponent(cc.ScrollView);
        this._content = svNode.getChildByName('view').getChildByName('content');

        // Content height covers all rows
        this._content.height = TOP_PAD + TOTAL_ROWS * CELL_H + (TOTAL_ROWS - 1) * GAP_Y + TOP_PAD;

        // Back button
        const topBar = c.getChildByName('topBar');
        if (topBar) {
            const backBtn = topBar.getChildByName('backBtn');
            if (backBtn) backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        }

        StateBridge.syncForStartScene();
        cc.loader.loadResDir('textures/xuan', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Xuan] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._initPool();
            this._populate(0);
            this._scrollView.node.on('scrolling', this._onScrolling, this);
            // Scroll to the highest unlocked level after layout is ready.
            this.scheduleOnce(() => {
                this._scrollToUnlockedLevel();
            }, 0);
            this.scheduleOnce(() => {
                this._scrollToUnlockedLevel();
            }, 0.05);
        });
    }

    // ── Pool ─────────────────────────────────────────────────────────────────

    private _initPool() {
        const visibleRows = Math.ceil(this._getViewHeight() / ROW_H);
        const poolRows = Math.max(MIN_POOL_ROWS, visibleRows + EXTRA_POOL_ROWS);
        const poolSize = Math.min(TOTAL_LEVELS, poolRows * COLS);
        this._poolRow = new Array(poolSize).fill(-1);

        // Reuse the pre-built nodes, then create enough nodes for the current viewport.
        for (let i = 0; i < poolSize; i++) {
            const cell = this._createPoolCell(i);
            this._pool.push(cell);
            this._numDefaultY[i] = this._getNumLabelY(cell);
        }
    }

    private _ensurePoolSize(poolSize: number) {
        poolSize = Math.min(TOTAL_LEVELS, Math.max(0, poolSize));
        while (this._pool.length < poolSize) {
            const cell = this._createPoolCell(this._pool.length);
            this._pool.push(cell);
            this._numDefaultY.push(this._getNumLabelY(cell));
            this._poolRow.push(-1);
        }
    }

    private _getNumLabelY(cell: cc.Node): number {
        const numNode = cell && cell.getChildByName('numLabel');
        return numNode ? numNode.y : 0;
    }

    private _createPoolCell(index: number): cc.Node {
        const prebuilt = this._content.getChildByName(`cell_${index + 1}`);
        if (prebuilt) return prebuilt;

        const cell = new cc.Node(`pool_${index}`);
        cell.width = CELL_W;
        cell.height = CELL_H;
        cell.addComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const numNode = new cc.Node('numLabel');
        numNode.width = CELL_W;
        numNode.height = 40;
        numNode.x = 0;
        numNode.y = LEVEL_NUM_Y;
        numNode.color = new cc.Color(0, 0, 0, 255);

        const lbl = numNode.addComponent(cc.Label);
        lbl.fontSize = 24;
        lbl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lbl.verticalAlign = cc.Label.VerticalAlign.CENTER;

        cell.addChild(numNode);
        this._content.addChild(cell);
        return cell;
    }

    // ── Virtual scroll ───────────────────────────────────────────────────────

    private _scrollToUnlockedLevel() {
        const p = getProgress();
        const unlockedLevel = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(p.unlocked_level) || 1)));
        const row = Math.floor((unlockedLevel - 1) / COLS);
        const viewH = this._getViewHeight();
        const maxScrollY = this._getMaxScrollY();
        if (maxScrollY <= 0) {
            this._scrollView.scrollToTop(0);
            this._populate(0);
            return;
        }

        const targetY = this._normalizeScrollY(TOP_PAD + row * ROW_H);
        this._scrollView.scrollToOffset(cc.v2(0, targetY), 0.35);
        this._populate(targetY);
    }

    private _onScrolling() {
        const offset = this._scrollView.getScrollOffset();
        this._populate(offset.y);
    }

    private _getMaxScrollY(): number {
        if (!this._content || !this._scrollView) return 0;
        return Math.max(0, this._content.height - this._getViewHeight());
    }

    private _getViewHeight(): number {
        if (!this._scrollView) return 0;
        const view = this._scrollView.node.getChildByName('view');
        const viewH = view ? view.height : 0;
        return Math.max(this._scrollView.node.height, viewH);
    }

    private _normalizeScrollY(scrollY: number): number {
        if (!Number.isFinite(scrollY)) return 0;
        return Math.max(0, Math.min(this._getMaxScrollY(), scrollY));
    }

    private _populate(scrollY: number) {
        scrollY = this._normalizeScrollY(scrollY);
        const viewH = this._getViewHeight();
        const firstRow = Math.max(0, Math.min(TOTAL_ROWS - 1, Math.floor((scrollY - TOP_PAD) / ROW_H) - 1));
        const lastRow  = Math.max(firstRow, Math.min(TOTAL_ROWS - 1, Math.ceil((scrollY + viewH - TOP_PAD) / ROW_H) + 1));
        const p = getProgress();
        const totalW = COLS * CELL_W + (COLS - 1) * GAP_X;
        const startX = -(totalW / 2) + CELL_W / 2;
        this._populateCells(firstRow, lastRow, p, startX);
    }

    private _populateCells(firstRow: number, lastRow: number, p: any, startX: number) {
        const neededLevels: number[] = [];
        for (let row = firstRow; row <= lastRow; row++) {
            for (let col = 0; col < COLS; col++) {
                const lvl = row * COLS + col + 1;
                if (lvl <= TOTAL_LEVELS) neededLevels.push(lvl);
            }
        }
        this._ensurePoolSize(neededLevels.length);

        // Release cells not needed
        for (let pi = 0; pi < this._poolRow.length; pi++) {
            const showing = this._poolRow[pi];
            if (showing !== -1 && neededLevels.indexOf(showing) === -1) {
                this._pool[pi].active = false;
                this._poolRow[pi] = -1;
            }
        }

        // Assign cells
        for (const levelId of neededLevels) {
            if (this._poolRow.indexOf(levelId) !== -1) continue;
            const pi = this._poolRow.indexOf(-1);
            if (pi === -1) break;

            this._poolRow[pi] = levelId;
            const cell = this._pool[pi];
            cell.active = true;

            const row = Math.floor((levelId - 1) / COLS);
            const col = (levelId - 1) % COLS;
            cell.x = startX + col * (CELL_W + GAP_X);
            cell.y = -(TOP_PAD + row * ROW_H + CELL_H / 2);

            const sp = cell.getComponent(cc.Sprite);
            if (sp) {
                sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                if (levelId < p.unlocked_level) {
                    const stars = p.level_stars[String(levelId)] || 0;
                    sp.spriteFrame = this._sp[stars >= 3 ? 'ui_5' : stars >= 2 ? 'ui_4' : 'ui_3'] || null;
                    cell.opacity = 255;
                } else if (levelId === p.unlocked_level) {
                    sp.spriteFrame = this._sp['ui_2'] || null;
                    cell.opacity = 255;
                } else {
                    sp.spriteFrame = this._sp['ui_1'] || null;
                    cell.opacity = 255;
                }
            }

            const lbl = cell.getChildByName('numLabel') && cell.getChildByName('numLabel').getComponent(cc.Label);
            if (lbl) lbl.string = String(levelId);
            const numNode = cell.getChildByName('numLabel');
            if (numNode) {
                if (levelId === p.unlocked_level) {
                    numNode.y = CURRENT_LEVEL_NUM_Y;
                } else {
                    numNode.y = this._numDefaultY[pi];
                }
            }

            cell.targetOff(this);
            if (!cell.getComponent(cc.Button)) cell.addComponent(cc.Button);
            cell.on(cc.Node.EventType.TOUCH_END, () => this._onSelectLevel(levelId), this);
        }
    }

    // ── Events ───────────────────────────────────────────────────────────────

    private _onBack() {
        cc.director.loadScene('Start');
    }

    private _onSelectLevel(levelId: number) {
        const p = getProgress();
        if (levelId > p.unlocked_level) return;
        if (p.stamina < cfg.levelCost) {
            this._showStaminaPopup();
            return;
        }
        GameState.selectedLevel = levelId;
        p.stamina -= cfg.levelCost;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        cc.director.loadScene('WarriorRun');
    }

    // ── Stamina popup ────────────────────────────────────────────────────────

    private _showStaminaPopup() {
        if (this._canvas.getChildByName('staminaPopup')) return;

        const overlay = new cc.Node('staminaPopup');
        overlay.width = this._canvas.width;
        overlay.height = this._canvas.height;
        overlay.color = cc.Color.BLACK;
        overlay.opacity = 160;
        overlay.zIndex = 100;
        this._canvas.addChild(overlay);

        const popup = new cc.Node('popupBox');
        popup.width = this._canvas.width * 0.75;
        popup.height = this._canvas.height * 0.40;
        popup.color = new cc.Color(40, 20, 10);
        popup.zIndex = 101;
        overlay.addChild(popup);

        this._addLabel(popup, '军情告急', 36, 0, popup.height * 0.35);
        this._addLabel(popup, '统帅，我军粮草已尽，\n无法继续行军！', 22, 0, popup.height * 0.05);
        this._addBtn(popup, '📺 筹集粮草', 28, 0, -popup.height * 0.20,
            new cc.Color(180, 60, 30), () => this._onWatchAd(overlay));
        this._addBtn(popup, '暂且休整', 20, 0, -popup.height * 0.38,
            new cc.Color(80, 80, 80), () => {
                overlay.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(() => overlay.destroy())));
            });

        popup.scale = 0;
        popup.runAction(cc.sequence(cc.scaleTo(0.15, 1.05), cc.scaleTo(0.05, 1.0)));
    }

    private _addLabel(parent: cc.Node, text: string, fontSize: number, x: number, y: number): cc.Node {
        const node = new cc.Node();
        node.x = x; node.y = y;
        node.width = parent.width * 0.9;
        node.height = fontSize * 3;
        const lbl = node.addComponent(cc.Label);
        lbl.string = text; lbl.fontSize = fontSize;
        lbl.overflow = cc.Label.Overflow.CLAMP;
        lbl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lbl.verticalAlign = cc.Label.VerticalAlign.CENTER;
        parent.addChild(node);
        return node;
    }

    private _addBtn(parent: cc.Node, text: string, fontSize: number, x: number, y: number, color: cc.Color, cb: () => void): cc.Node {
        const btn = new cc.Node();
        btn.x = x; btn.y = y;
        btn.width = parent.width * 0.75;
        btn.height = fontSize * 2.2;
        btn.color = color;
        btn.addComponent(cc.Button);
        this._addLabel(btn, text, fontSize, 0, 0);
        btn.on(cc.Node.EventType.TOUCH_END, cb, this);
        parent.addChild(btn);
        return btn;
    }

    private _onWatchAd(overlay: cc.Node) {
        const p = getProgress();
        p.stamina = Math.min(cfg.stamina.max, p.stamina + cfg.stamina.adReward);
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        overlay.destroy();
        const offset = this._scrollView.getScrollOffset();
        this._populate(offset.y);
    }
}
