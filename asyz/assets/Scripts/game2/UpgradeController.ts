import { loadConfig, CFG, Scene } from './Constants';
import GameState from './GameState';
import StateBridge from './StateBridge';
import TipsManager from '../Load/TipsManager';

const { ccclass, property } = cc._decorator;

// 勇士图片宽度（与 .fire 里 HeroItem 宽度一致）
const HERO_ITEM_W = 200;
// 选中时缩放
const SELECTED_SCALE = 1.15;
const SWIPE_SWITCH_DISTANCE = 80;
const HERO_ART_COUNT = 6;
const HERO_TOUCH_W = 320;
const HERO_TOUCH_H = 270;
// 整个人物显示区域的高度坐标，想整体上/下移动就调这里。数值变小 = 整体下移。
const HERO_AREA_Y = 167.222;
// 人物在显示区域里的高度坐标，想单独调人物在裁剪框内上/下就调这里；太小会被 Mask 裁掉。
const HERO_ITEM_Y = 0;

@ccclass
export default class UpgradeController extends cc.Component {

    @property(cc.Node)  backBtn: cc.Node = null;
    @property(cc.Node)  titleBar: cc.Node = null;
    @property(cc.Node)  currencyBar: cc.Node = null;
    @property(cc.Node)  heroDisplay: cc.Node = null;
    @property(cc.Node)  attrPanel: cc.Node = null;
    @property(cc.Node)  costPanel: cc.Node = null;
    @property(cc.Node)  upgradeBtn: cc.Node = null;

    @property(cc.Label) shenpoLabel: cc.Label = null;    // 神魄数量
    @property(cc.Label) heroNameLabel: cc.Label = null;
    @property(cc.Label) tierLabel: cc.Label = null;
    @property(cc.Label) atkCurLabel: cc.Label = null;
    @property(cc.Label) atkNextLabel: cc.Label = null;
    @property(cc.Label) energyCurLabel: cc.Label = null;
    @property(cc.Label) energyNextLabel: cc.Label = null;
    @property(cc.Label) shardCostLabel: cc.Label = null;
    @property(cc.Label) shenpoCostLabel: cc.Label = null;

    @property(cc.Node)  heroScrollView: cc.Node = null;  // HeroScrollView

    private _iconSp: { [name: string]: cc.SpriteFrame } = {};
    private _sp: { [name: string]: cc.SpriteFrame } = {};
    private _zzImgSp: { [name: string]: cc.SpriteFrame } = {};
    private _selectedHeroIdx: number = 0;   // 默认选中第1个
    private _heroItems: cc.Node[] = [];      // HeroContent 下的6个 HeroItem
    private _isCenteringHero: boolean = false;
    private _suppressItemClick: boolean = false;
    private _touchStartX: number = 0;
    private _popupMode: boolean = false;
    private _leftBtn: cc.Node = null;
    private _rightBtn: cc.Node = null;
    private _itemIcon1: cc.Node = null;
    private _itemIcon2: cc.Node = null;

    onLoad() {
        loadConfig(require('config'));
        this._jumpToHero(this._selectedHeroIdx);

        cc.loader.loadResDir('textures/qianghua', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Upgrade] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._applyAssets();
        });

        cc.loader.loadResDir('zzImg', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (!err && frames) frames.forEach(f => { this._zzImgSp[f.name] = f; });
            this._refreshHeroArt();
            this._refreshItemIcons();
            this._refreshHeroListArt();
        });

        cc.loader.loadResDir('textures/icon', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (!err && frames) frames.forEach(f => { this._iconSp[f.name] = f; });
            this._buildHeroList();
            // 先刷新信息（不滚动），延两帧后再滚动居中
            this._selectHero(this._selectedHeroIdx, false);
            this.scheduleOnce(() => {
                this.scheduleOnce(() => {
                    this._doScrollToHero(this._selectedHeroIdx);
                }, 0);
            }, 0);
        });

        this._fitHeroTouchArea();
        this._bindButtons();
    }

    onEnable() {
        if (this._heroItems.length > 0) {
            this._refreshShenpo();
            const heroes = CFG.heroConfig;
            if (heroes && heroes[this._selectedHeroIdx]) this._refreshInfo(heroes[this._selectedHeroIdx]);
            this._refreshHeroArt();
            this._refreshItemIcons();
            this._updateArrowVisible();
            this._scrollToHero(this._selectedHeroIdx);
        }
    }

    public showAsPopup() {
        this._popupMode = true;
        this.node.active = true;
        this._refreshShenpo();
        const heroes = CFG.heroConfig;
        if (heroes && heroes[this._selectedHeroIdx]) this._refreshInfo(heroes[this._selectedHeroIdx]);
        this._refreshHeroArt();
        this._refreshItemIcons();
        this._updateArrowVisible();
        this.scheduleOnce(() => this._updateArrowVisible(), 0);
        this._scrollToHero(this._selectedHeroIdx);
    }

    // ---- 静态贴图 ----

    private _applyAssets() {
        // this._setSp(this.backBtn,     'ui_1');
        // this._setSp(this.titleBar,    'ui_2');
        // this._setSp(this.currencyBar, 'ui_3');
        // this._setSp(this.heroDisplay, 'ui_4');
        // this._setSp(this.attrPanel,   'ui_5');
        // this._setSp(this.costPanel,   'ui_6');
        // this._setSp(this.upgradeBtn,  'ui_7');
        this._refreshShenpo();
        this._refreshHeroArt();
        this._refreshItemIcons();
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        let s = node.getComponent(cc.Sprite);
        if (!s) s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    }

    private _refreshShenpo() {
        if (this.shenpoLabel) this.shenpoLabel.string = String(GameState.shenpo);
    }

    private _setSpriteFrame(node: cc.Node, sf: cc.SpriteFrame) {
        if (!node || !sf) return;
        let sp = node.getComponent(cc.Sprite);
        if (!sp) sp = node.addComponent(cc.Sprite);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.spriteFrame = sf;
    }

    private _findChild(parent: cc.Node, name: string): cc.Node {
        if (!parent) return null;
        if (parent.name === name) return parent;
        for (let i = 0; i < parent.childrenCount; i++) {
            const found = this._findChild(parent.children[i], name);
            if (found) return found;
        }
        return null;
    }

    private _getHeroArtKey(idx: number): string {
        return 'yingxiong' + (idx + 1);
    }

    private _getHeroShardKey(idx: number): string {
        return 'yingxiongsuipian' + (idx + 1);
    }

    private _refreshHeroArt() {
        if (this.heroScrollView) {
            if (this._heroItems.length > 0) this._refreshHeroListArt();
            return;
        }
        // 兼容没有滚动列表的旧场景，正常新弹窗走 HeroItem0-5 显示人物图。
        this._setSpriteFrame(this.heroDisplay, this._zzImgSp[this._getHeroArtKey(this._selectedHeroIdx)]);
    }

    private _refreshItemIcons() {
        if (!this._itemIcon1) this._itemIcon1 = this._findChild(this.node, 'item_icon1');
        if (!this._itemIcon2) this._itemIcon2 = this._findChild(this.node, 'item_icon2');
        this._setSpriteFrame(this._itemIcon1, this._zzImgSp['yanshi']);
        this._setSpriteFrame(this._itemIcon2, this._zzImgSp[this._getHeroShardKey(this._selectedHeroIdx)]);
    }

    private _refreshHeroListArt() {
        for (let i = 0; i < this._heroItems.length; i++) {
            this._setSpriteFrame(this._heroItems[i], this._zzImgSp[this._getHeroArtKey(i)]);
        }
    }

    private _fitHeroTouchArea() {
        if (!this.heroScrollView) return;
        const targetW = Math.min(HERO_TOUCH_W, this.heroScrollView.width || HERO_TOUCH_W);
        const targetH = HERO_TOUCH_H;
        this.heroScrollView.width = targetW;
        this.heroScrollView.height = targetH;
        this.heroScrollView.y = HERO_AREA_Y;
        const sv = this.heroScrollView.getComponent(cc.ScrollView);
        const view = sv && sv.content ? sv.content.parent : null;
        if (sv) {
            sv.enabled = false;
            sv.horizontal = false;
            sv.inertia = false;
            sv.elastic = false;
            sv.cancelInnerEvents = false;
        }
        if (view) {
            view.width = targetW;
            view.height = targetH;
            view.x = -targetW * this.heroScrollView.anchorX;
            view.y = -targetH * this.heroScrollView.anchorY;
        }
        if (sv && sv.content) {
            sv.content.height = targetH;
            sv.content.y = targetH * 0.5;
        }
    }

    private _getHeroTotal(): number {
        const heroes = CFG.heroConfig;
        return Math.min(HERO_ART_COUNT, heroes ? heroes.length : HERO_ART_COUNT);
    }

    private _updateArrowVisible() {
        if (!this._leftBtn) this._leftBtn = this._findChild(this.node, 'zuo');
        if (!this._rightBtn) this._rightBtn = this._findChild(this.node, 'you');
        const total = this._getHeroTotal();
        this._setArrowVisible(this._leftBtn, this._selectedHeroIdx > 0);
        this._setArrowVisible(this._rightBtn, total > 0 && this._selectedHeroIdx < total - 1);
    }

    private _setArrowVisible(node: cc.Node, visible: boolean) {
        if (!node) return;
        node.active = visible;
        node.opacity = visible ? 255 : 0;
    }

    // ---- 勇士列表 ----

    private _buildHeroList() {
        if (!this.heroScrollView) return;
        this._fitHeroTouchArea();
        const sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv || !sv.content) return;

        const content = sv.content;
        const heroes = CFG.heroConfig;
        if (!heroes || heroes.length === 0) return;
        const pageW = this.heroScrollView.width > 0 ? this.heroScrollView.width : HERO_ITEM_W;
        const itemCount = Math.min(content.childrenCount, HERO_ART_COUNT, heroes.length);
        content.width = pageW * itemCount;
        content.height = HERO_TOUCH_H;

        // 收集 HeroItem 节点（已在 .fire 里建好）
        this._heroItems = [];
        for (let i = 0; i < itemCount; i++) {
            const item = content.children[i];
            this._heroItems.push(item);
            item.x = pageW * (i + 0.5);
            item.y = HERO_ITEM_Y;

            // 赋图标贴图
            const hero = heroes[i];
            const heroSf = this._zzImgSp[this._getHeroArtKey(i)];
            if (heroSf) {
                this._setSpriteFrame(item, heroSf);
            } else if (hero) {
                const iconName = (hero.icon || '').replace(/\.[^.]+$/, '');
                const sf = this._iconSp[iconName];
                this._setSpriteFrame(item, sf);
            }

            // 点击事件
            const idx = i;
            item.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
                if (this._suppressItemClick) return;
                this._selectHero(idx, true);
            }, this);
        }
    }

    private _selectHero(idx: number, scroll: boolean) {
        const heroes = CFG.heroConfig;
        if (!heroes || idx < 0 || idx >= heroes.length) return;

        this._selectedHeroIdx = idx;

        // 更新所有 item 的缩放
        for (let i = 0; i < this._heroItems.length; i++) {
            const target = i === idx ? SELECTED_SCALE : 1;
            cc.tween(this._heroItems[i])
                .to(0.15, { scale: target })
                .start();
        }

        // 滚动让选中项居中
        if (scroll) this._scrollToHero(idx);

        // 刷新下方进阶信息
        this._refreshInfo(heroes[idx]);
        this._refreshHeroArt();
        this._refreshItemIcons();
        this._updateArrowVisible();
        this.scheduleOnce(() => this._updateArrowVisible(), 0);
    }

    private _bindScrollSelection() {
        if (!this.heroScrollView) return;

        this.heroScrollView.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            this._isCenteringHero = false;
            this._touchStartX = e.getLocationX();
        }, this, true);

        this.heroScrollView.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            this._selectHeroBySwipe(e.getLocationX() - this._touchStartX);
        }, this, true);

        this.heroScrollView.on(cc.Node.EventType.TOUCH_CANCEL, (e: cc.Event.EventTouch) => {
            this._selectHeroBySwipe(e.getLocationX() - this._touchStartX);
        }, this, true);

        this.heroScrollView.on('scroll-ended', () => {
            if (this._isCenteringHero) return;
            const sv = this.heroScrollView.getComponent(cc.ScrollView);
            if (sv) sv.stopAutoScroll();
        }, this);
    }

    private _selectHeroBySwipe(deltaX: number) {
        if (this._isCenteringHero) return;
        if (!this.heroScrollView) return;

        const isSwipe = Math.abs(deltaX) >= SWIPE_SWITCH_DISTANCE;
        this._suppressItemClick = isSwipe;

        if (!isSwipe) {
            this.scheduleOnce(() => {
                this._suppressItemClick = false;
            }, 0);
            return;
        }

        const sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (sv) sv.stopAutoScroll();

        const idx = this._selectedHeroIdx + (deltaX < 0 ? 1 : -1);
        if (idx < 0 || idx >= this._getHeroTotal()) {
            this.scheduleOnce(() => {
                this._suppressItemClick = false;
            }, 0.1);
            return;
        }
        this._selectHero(idx, true);

        this.scheduleOnce(() => {
            this._suppressItemClick = false;
        }, 0.1);
    }

    private _jumpToHero(idx: number) {
        if (!this.heroScrollView) return;
        const sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv || !sv.content) return;

        const item = sv.content.children[idx];
        if (!item) return;

        const viewW = this.heroScrollView.width;
        const contentW = sv.content.width;
        const maxOffset = Math.max(0, contentW - viewW);
        const offset = Math.max(0, Math.min(item.x - viewW / 2, maxOffset));
        sv.stopAutoScroll();
        sv.content.x = -offset;
        sv.scrollToOffset(cc.v2(offset, 0), 0);
    }

    private _scrollToHero(idx: number) {
        this._isCenteringHero = true;
        // 延两帧，等 ScrollView 布局完成后再滚动
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                this._doScrollToHero(idx);
            }, 0);
        }, 0);
    }

    private _doScrollToHero(idx: number) {
        if (!this.heroScrollView) { cc.log('[Upgrade] heroScrollView 未绑定'); return; }
        const sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv) { cc.log('[Upgrade] 找不到 cc.ScrollView 组件'); return; }
        if (!sv.content) { cc.log('[Upgrade] sv.content 为空'); return; }

        const item = this._heroItems[idx];
        if (!item) { cc.log('[Upgrade] heroItem[' + idx + '] 不存在'); return; }

        // 用 item 的实际 x 坐标（相对于 content）
        // content anchor=(0,0.5)，item anchor=(0.5,0.5)
        // item 中心在 content 坐标系的 x = item.x
        const itemCenterX = item.x;
        const viewW = this.heroScrollView.width;
        const contentW = sv.content.width;
        const maxOffset = Math.max(0, contentW - viewW);

        const offset = itemCenterX - viewW / 2;
        const clamped = Math.max(0, Math.min(offset, maxOffset));

        cc.log('[Upgrade] scrollToHero idx=' + idx + ' itemX=' + itemCenterX + ' viewW=' + viewW + ' contentW=' + contentW + ' offset=' + clamped);
        if (sv.enabled) {
            sv.stopAutoScroll();
            sv.scrollToOffset(cc.v2(clamped, 0), 0.3);
        } else {
            sv.content.x = -clamped;
        }
        this.scheduleOnce(() => {
            this._isCenteringHero = false;
        }, 0.35);
    }

    // ---- 进阶信息 ----

    private _refreshInfo(hero: any) {
        const gs = GameState as any;
        if (!gs.heroTiers) gs.heroTiers = {};
        // curLv: 当前等级（从 1 开始，与 config 里 lv 字段一致）
        const curLv: number = gs.heroTiers[hero.id] || 1;
        const nextLv = curLv + 1;

        const curRow  = this._getUpgradeRow(hero.id, curLv);
        const nextRow = this._getUpgradeRow(hero.id, nextLv);
        const maxTier = this._getMaxTier(hero.id);
        const atFull  = curLv >= maxTier;

        this._refreshShenpo();
        if (this.heroNameLabel) this.heroNameLabel.string = hero.name;
        // TierLabel 只显示数字
        const displayLv = curRow ? curRow.lv : 1;
        if (this.tierLabel) this.tierLabel.string = String(displayLv);

        if (curRow) {
            if (this.atkCurLabel)    this.atkCurLabel.string    = `${curRow.atkBonusPct}`;
            if (this.energyCurLabel) this.energyCurLabel.string = `${curRow.mpBonusPct}`;
        }
        // 消耗读下一级（nextRow = lv+1）
        if (!atFull && nextRow) {
            if (this.atkNextLabel)    this.atkNextLabel.string    = `${nextRow.atkBonusPct}`;
            if (this.energyNextLabel) this.energyNextLabel.string = `${nextRow.mpBonusPct}`;
            const ownedShards = (gs.heroShards && gs.heroShards[hero.fragmentId]) || 0;
            const ownedShenpo = GameState.shenpo;
            if (this.shardCostLabel)  this.shardCostLabel.string  = `${ownedShards}/${nextRow.fragmentCost}`;
            if (this.shenpoCostLabel) this.shenpoCostLabel.string = `${ownedShenpo}/${nextRow.goldCost}`;
        } else {
            if (this.atkNextLabel)    this.atkNextLabel.string    = '已满阶';
            if (this.energyNextLabel) this.energyNextLabel.string = '已满阶';
            if (this.shardCostLabel)  this.shardCostLabel.string  = '-';
            if (this.shenpoCostLabel) this.shenpoCostLabel.string = '-';
        }
    }

    private _getUpgradeRow(heroId: string, lv: number): any {
        const list = CFG.heroUpgradeConfig;
        for (let i = 0; i < list.length; i++) {
            if (list[i].Hero_id === heroId && list[i].lv === lv) return list[i];
        }
        return null;
    }

    private _getMaxTier(heroId: string): number {
        const list = CFG.heroUpgradeConfig;
        let max = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].Hero_id === heroId && list[i].lv > max) max = list[i].lv;
        }
        return max;
    }

    private _clampHeroIdx(idx: number): number {
        const total = this._getHeroTotal();
        return Math.max(0, Math.min(idx, total - 1));
    }

    private _switchHero(delta: number) {
        const idx = this._selectedHeroIdx + delta;
        if (idx < 0 || idx >= this._getHeroTotal()) return;
        this._selectHero(idx, true);
    }

    // ---- 按钮 ----

    private _bindButtons() {
        cc.log('[Upgrade] _bindButtons backBtn=' + (this.backBtn ? 'ok' : 'null') + ' upgradeBtn=' + (this.upgradeBtn ? 'ok' : 'null'));
        if (this.backBtn)    this.backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        if (this.upgradeBtn) this.upgradeBtn.on(cc.Node.EventType.TOUCH_END, this._onUpgrade, this);
        this._leftBtn = this._findChild(this.node, 'zuo');
        this._rightBtn = this._findChild(this.node, 'you');
        if (this._leftBtn) this._leftBtn.on(cc.Node.EventType.TOUCH_END, () => this._switchHero(-1), this);
        if (this._rightBtn) this._rightBtn.on(cc.Node.EventType.TOUCH_END, () => this._switchHero(1), this);
        this._updateArrowVisible();
    }

    private _onUpgrade() {
        const heroes = CFG.heroConfig;
        if (!heroes || heroes.length === 0) return;

        const hero = heroes[this._selectedHeroIdx];
        const gs = GameState as any;
        if (!gs.heroTiers) gs.heroTiers = {};
        const curLv: number = gs.heroTiers[hero.id] || 1;
        const nextRow = this._getUpgradeRow(hero.id, curLv + 1);

        if (!nextRow) { this._showToast('已满阶。'); return; }

        const ownedShards = (gs.heroShards && gs.heroShards[hero.fragmentId]) || 0;
        const ownedShenpo = GameState.shenpo;
        const needShards  = nextRow.fragmentCost || 0;
        const needShenpo  = nextRow.goldCost     || 0;

        const lackShard  = ownedShards < needShards;
        const lackShenpo = ownedShenpo < needShenpo;

        if (lackShard && lackShenpo) {
            this._showToast('碎片不足。');
            this.scheduleOnce(() => this._showToast('神魄不足。'), 0.25);
            return;
        }
        if (lackShard)  { this._showToast('碎片不足。'); return; }
        if (lackShenpo) { this._showToast('神魄不足。'); return; }

        // 同时扣除
        gs.heroShards[hero.fragmentId] = ownedShards - needShards;
        GameState.shenpo -= needShenpo;
        gs.heroTiers[hero.id] = curLv + 1;
        GameState.save();
        StateBridge.syncNewToOld();

        cc.tween(this.upgradeBtn)
            .to(0.05, { scale: 0.92 })
            .to(0.1,  { scale: 1.0 })
            .call(() => this._refreshInfo(hero))
            .start();
    }

    private _onBack() {
        StateBridge.syncNewToOld();
        if (this._popupMode) {
            this.node.active = false;
            return;
        }
        cc.director.loadScene('Start');
    }

    private _showToast(msg: string) {
        TipsManager.show(msg);
    }
}
