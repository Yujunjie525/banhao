import { loadConfig, CFG, Scene, getItemIcon } from './Constants';
import GameState from './GameState';
import StateBridge from './StateBridge';
import SoundMgr from '../Managers/SoundMgr';

const { ccclass, property } = cc._decorator;

// 每个 LevelNode 行高（与编辑器里 LevelNode1 的高度一致）
const ROW_H = 200;
const ROW_GAP = 20;

const SF_CLEARED = '1b2fb13f-da3a-4385-a2fa-d60ac517f6ac';  // ui_2 已通关
const SF_CURRENT = '64cc429b-124a-456a-9405-89bc06e2d0ae';  // ui_4 当前选中
const SF_LOCKED  = '09861065-928b-4cc4-b26f-dbe425b55cfc';  // ui_6 未解锁
const SF_STAR    = 'ddd8fa7f-b741-47bb-83b7-77e915e6591b';  // ui_3 单颗星

@ccclass
export default class LevelController extends cc.Component {

    @property(cc.Node)  topBar: cc.Node = null;
    @property(cc.Node)  levelNode1: cc.Node = null;
    @property(cc.Node)  levelNode2: cc.Node = null;
    @property(cc.Node)  levelNode3: cc.Node = null;
    @property(cc.Node)  infoPanel: cc.Node = null;
    @property(cc.Label) levelNameLabel: cc.Label = null;
    @property(cc.Label) waveLabel: cc.Label = null;
    @property(cc.Node)  dropIcon1: cc.Node = null;
    @property(cc.Node)  dropIcon2: cc.Node = null;
    @property(cc.Node)  dropIcon3: cc.Node = null;
    @property(cc.Node)  dropIcon4: cc.Node = null;
    @property(cc.Node)  dropIcon5: cc.Node = null;
    @property(cc.Node)  startBtn: cc.Node = null;
    @property(cc.Node)  backBtn: cc.Node = null;
    @property(cc.Node)  scrollViewNode: cc.Node = null;
    @property(cc.Node)  levelItemTemplate: cc.Node = null;
    @property(cc.Node)  levelNodeTemplate: cc.Node = null;
    @property(cc.Node)  arrow1: cc.Node = null;
    @property(cc.Node)  arrow2: cc.Node = null;
    @property(cc.Node)  arrow3: cc.Node = null;
    @property(cc.AudioClip) clickEffect: cc.AudioClip = null;

    // icon 图集（textures/icon 目录）
    private _iconSp: { [name: string]: cc.SpriteFrame } = {};

    private _sfMap: { [uuid: string]: cc.SpriteFrame } = {};
    private _sp: { [name: string]: cc.SpriteFrame } = {};
    private _zzImgSp: { [name: string]: cc.SpriteFrame } = {};
    private _selectedIdx: number = 0;
    private _rowNodes: cc.Node[] = [];   // 每关对应的 LevelNode 节点
    private _starting: boolean = false;

    onLoad() {
        SoundMgr.bindButtonClicks(this.node.parent || this.node, this.clickEffect);
        loadConfig(require('config'));
        this._selectedIdx = GameState.maxUnlockedLevel;

        if (this.scrollViewNode) this.scrollViewNode.active = false;
        if (this.levelNode2) this.levelNode2.active = false;
        if (this.levelNode3) this.levelNode3.active = false;
        if (this.arrow1) this.arrow1.active = false;
        if (this.arrow2) this.arrow2.active = false;
        if (this.arrow3) this.arrow3.active = false;

        cc.loader.loadResDir('textures/level', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Level] level 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._buildSfMap();
            this._applyStaticAssets();

            // 加载 icon 目录后再构建列表
            cc.loader.loadResDir('textures/icon', cc.SpriteFrame, (err2: any, iconFrames: cc.SpriteFrame[]) => {
                if (!err2 && iconFrames) {
                    iconFrames.forEach(f => { this._iconSp[f.name] = f; });
                }
                this._loadNewLevelAssets(() => {
                    this._buildList();
                    this._selectLevel(this._selectedIdx, false);
                });
            });
        });

        this._bindButtons();
    }

    private _loadNewLevelAssets(done: Function) {
        cc.loader.loadResDir('zzImg', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (!err && frames) frames.forEach(f => { this._zzImgSp[f.name] = f; });
            done();
        });
    }

    private _buildSfMap() {
        const map: { [name: string]: string } = {
            'ui_2': SF_CLEARED, 'ui_4': SF_CURRENT,
            'ui_6': SF_LOCKED,  'ui_3': SF_STAR,
        };
        for (const name in map) {
            if (this._sp[name]) this._sfMap[map[name]] = this._sp[name];
        }
    }

    private _applyStaticAssets() {
        this._setSp(this.topBar,    'ui_1');
        this._setSp(this.infoPanel, 'ui_7');
        this._setSp(this.startBtn,  'ui_15');
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        let s = node.getComponent(cc.Sprite);
        if (!s) s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    }

    private _setSpByUuid(node: cc.Node, uuid: string) {
        if (!node) return;
        const sf = this._sfMap[uuid];
        if (!sf) return;
        let s = node.getComponent(cc.Sprite);
        if (!s) s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = sf;
        // ui_2（已通关）图片原尺寸偏大，整体缩小到 80%
        node.scale = (uuid === SF_CLEARED) ? 0.8 : 1.0;
    }

    // ---- 构建列表 ----

    private _buildList() {
        const sv = this.scrollViewNode
            ? this.scrollViewNode.getComponent(cc.ScrollView) : null;
        if (!sv || !sv.content) return;
        this.scrollViewNode.active = false;

        const tmpl = this.levelItemTemplate;   // LevelItemTemplate 作为行模板
        if (!tmpl) return;

        const levels = CFG.levels;
        if (!levels || levels.length === 0) {
            cc.warn('[Level] CFG.levels 为空');
            return;
        }

        this._selectedIdx = Math.max(0, Math.min(this._selectedIdx, levels.length - 1));

        const maxUnlocked = GameState.maxUnlockedLevel;
        const rowH = (tmpl.height || ROW_H) + ROW_GAP;
        const totalH = levels.length * rowH;

        this._rowNodes = [];
        sv.content.children.slice().forEach((child) => {
            if (child !== tmpl) child.destroy();
        });

        tmpl.parent = sv.content;
        tmpl.active = true;

        // content 高度
        sv.content.setContentSize(sv.content.width, totalH);

        for (let i = 0; i < levels.length; i++) {
            const row = i === 0 ? tmpl : cc.instantiate(tmpl);
            row.active = true;
            row.parent = sv.content;
            this._setupRow(row, i, levels[i], maxUnlocked);
            this._rowNodes.push(row);
        }

        // 排列所有行：content anchor=(0.5,0.5)，第 i 行从顶部往下
        for (let i = 0; i < this._rowNodes.length; i++) {
            this._rowNodes[i].y = totalH / 2 - i * rowH - rowH / 2;
            this._rowNodes[i].x = 0;
        }

        this._scrollToIdx(this._selectedIdx, true);
        this.scrollViewNode.active = true;
    }

    private _setupRow(row: cc.Node, i: number, lv: any, maxUnlocked: number) {
        const locked = i > maxUnlocked;

        const view = this._getRowView(row);
        row.scale = 1;
        row.opacity = 255;
        view.opacity = 255;
        this._setSpriteFrame(view, this._zzImgSp[this._getLevelImageName(i)]);

        // LevelIdLabel
        const idLabel = this._findChild(row, 'LevelIdLabel');
        if (idLabel) {
            const lb = idLabel.getComponent(cc.Label);
            if (lb) {
                lb.string = `第${lv.level_id}关`;
            }
            idLabel.opacity = 255;
        }

        const monsterIcon = this._findChild(view, 'MonsterIcon');
        if (monsterIcon) monsterIcon.active = false;

        const lock = this._findChild(row, 'Lock');
        if (lock) lock.active = locked;

        // Arrow1/2/3（星级）：未获得的星显示灰星
        const cleared = i < maxUnlocked;
        const levelId = String(lv.level_id);
        const stars = cleared ? (GameState.levelStars[levelId] || 0) : 0;
        const starNodes = [
            this._findChild(row, 'Arrow1'),
            this._findChild(row, 'Arrow2'),
            this._findChild(row, 'Arrow3'),
        ];
        for (let n = 0; n < starNodes.length; n++) {
            const star = starNodes[n];
            if (!star) continue;
            star.active = true;
            this._setSpriteFrame(star, this._zzImgSp[n < stars ? 'xingji' : 'xingjihui']);
            star.opacity = 255;
        }

        // 点击事件
        row.off(cc.Node.EventType.TOUCH_END);
        const idx = i;
        row.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (!locked) {
                this._selectLevel(idx, false);
                this._onStart();
            }
        }, this);
    }

    private _scrollToIdx(idx: number, instant: boolean = false) {
        const sv = this.scrollViewNode
            ? this.scrollViewNode.getComponent(cc.ScrollView) : null;
        if (!sv || !sv.content) return;

        const rowH = this.levelItemTemplate ? ((this.levelItemTemplate.height || ROW_H) + ROW_GAP) : ROW_H;
        const totalH = CFG.levels.length * rowH;
        const viewH = this.scrollViewNode.height;

        // 第 idx 行中心距 content 顶部的距离
        const rowCenter = idx * rowH + rowH / 2;
        // 让该行居中：content 需要向上滚动的距离
        const offset = rowCenter - viewH / 2;
        const maxOffset = Math.max(0, totalH - viewH);
        const finalOffset = Math.max(0, Math.min(offset, maxOffset));

        sv.stopAutoScroll();
        if (instant) {
            sv.scrollToOffset(cc.v2(0, finalOffset), 0);
        } else {
            sv.scrollToOffset(cc.v2(0, finalOffset), 0.3);
        }
    }

    private _getRowView(row: cc.Node): cc.Node {
        return row.getChildByName('LevelNode1') || row;
    }

    private _findChild(parent: cc.Node, name: string): cc.Node {
        if (!parent) return null;
        if (parent.name === name) return parent;
        for (let i = 0; i < parent.children.length; i++) {
            const found = this._findChild(parent.children[i], name);
            if (found) return found;
        }
        return null;
    }

    private _setSpriteFrame(node: cc.Node, sf: cc.SpriteFrame) {
        if (!node || !sf) return;
        let sp = node.getComponent(cc.Sprite);
        if (!sp) sp = node.addComponent(cc.Sprite);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.spriteFrame = sf;
    }

    private _getLevelImageName(idx: number): string {
        const group = Math.floor(idx / 20) + 1;
        const imageIdx = Math.max(1, Math.min(5, group));
        return `guanqiapeitu${imageIdx}`;
    }

    // ---- 选中 ----

    private _selectLevel(idx: number, scroll: boolean) {
        const levels = CFG.levels;
        if (!levels || idx < 0 || idx >= levels.length) return;
        if (idx > GameState.maxUnlockedLevel) return;

        // 恢复上一个
        const prev = this._rowNodes[this._selectedIdx];
        if (prev) prev.scale = 1;

        this._selectedIdx = idx;
        GameState.selectedLevelIdx = idx;
        GameState.selectedLevelId = String(levels[idx].level_id);

        // 高亮当前
        const cur = this._rowNodes[idx];
        if (cur) cur.scale = 1;

        this._refreshInfoPanel(levels[idx]);
        if (scroll) this._scrollToIdx(idx);
    }

    private _refreshInfoPanel(lv: any) {
        if (this.levelNameLabel) this.levelNameLabel.string = `第 ${lv.level_id} 关`;
        if (this.waveLabel)      this.waveLabel.string = String(lv.total_waves);

        const dropNodes = [this.dropIcon1, this.dropIcon2, this.dropIcon3, this.dropIcon4, this.dropIcon5];
        dropNodes.forEach(n => { if (n) n.active = false; });

        let slot = 0;

        // DropIcon1：fixed_rewards 的 currency_id
        if (lv.fixed_rewards && lv.fixed_rewards.length && slot < dropNodes.length && dropNodes[slot]) {
            const iconName = this._getIconName(lv.fixed_rewards[0].currency_id);
            this._setIconSp(dropNodes[slot], iconName);
            dropNodes[slot].active = false;
            slot++;
        }

        // DropIcon2~5：random_rewards 的每个 item_id
        if (lv.random_rewards) {
            for (let i = 0; i < lv.random_rewards.length && slot < dropNodes.length; i++) {
                if (!dropNodes[slot]) { slot++; continue; }
                const iconName = this._getIconName(lv.random_rewards[i].item_id);
                this._setIconSp(dropNodes[slot], iconName);
                dropNodes[slot].active = false;
                slot++;
            }
        }
    }

    private _getIconName(itemId: string): string {
        for (let i = 0; i < CFG.itemConfig.length; i++) {
            if (CFG.itemConfig[i].id === itemId) {
                const icon: string = CFG.itemConfig[i].icon || '';
                return icon.replace(/\.[^.]+$/, '');
            }
        }
        return '';
    }

    private _setIconSp(node: cc.Node, name: string) {
        if (!node || !name) return;
        const sf = this._iconSp[name];
        if (!sf) return;
        let s = node.getComponent(cc.Sprite);
        if (!s) s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = sf;
    }

    // ---- 按钮 ----

    private _bindButtons() {
        if (this.startBtn) this.startBtn.on(cc.Node.EventType.TOUCH_END, this._onStart, this);
        if (this.backBtn)  this.backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
    }

    private _onStart() {
        if (this._starting) return;
        this._starting = true;

        if (!StateBridge.consumeStamina()) {
            cc.log('[Level] 体力不足');
            this._starting = false;
            return;
        }

        const levels = CFG.levels;
        const lv = levels[this._selectedIdx];
        if (!lv) {
            this._starting = false;
            return;
        }

        // 记录进入的关卡
        GameState.selectedLevelId = String(lv.level_id);
        GameState.selectedLevelIdx = this._selectedIdx;

        const btn = (this.startBtn && this.startBtn.active) ? this.startBtn : this._rowNodes[this._selectedIdx];
        if (btn) {
            cc.tween(btn)
                .to(0.05, { scale: 0.96 })
                .to(0.05, { scale: 1.0 })
                .call(() => {
                    cc.director.loadScene(Scene.Youxi);
                })
                .start();
        } else {
            cc.director.loadScene(Scene.Youxi);
        }
    }

    private _onBack() {
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }
}
