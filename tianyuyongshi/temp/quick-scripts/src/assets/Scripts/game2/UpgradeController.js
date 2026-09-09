"use strict";
cc._RF.push(module, 'a6fecuc3G1L6J2YDZfvSo1S', 'UpgradeController');
// Scripts/game2/UpgradeController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./Constants");
var GameState_1 = require("./GameState");
var StateBridge_1 = require("./StateBridge");
var TipsManager_1 = require("../Load/TipsManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 勇士图片宽度（与 .fire 里 HeroItem 宽度一致）
var HERO_ITEM_W = 200;
// 选中时缩放
var SELECTED_SCALE = 1.15;
var SWIPE_SWITCH_DISTANCE = 80;
var HERO_ART_COUNT = 6;
var HERO_TOUCH_W = 320;
var HERO_TOUCH_H = 270;
// 整个人物显示区域的高度坐标，想整体上/下移动就调这里。数值变小 = 整体下移。
var HERO_AREA_Y = 167.222;
// 人物在显示区域里的高度坐标，想单独调人物在裁剪框内上/下就调这里；太小会被 Mask 裁掉。
var HERO_ITEM_Y = 0;
var UpgradeController = /** @class */ (function (_super) {
    __extends(UpgradeController, _super);
    function UpgradeController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.backBtn = null;
        _this.titleBar = null;
        _this.currencyBar = null;
        _this.heroDisplay = null;
        _this.attrPanel = null;
        _this.costPanel = null;
        _this.upgradeBtn = null;
        _this.shenpoLabel = null; // 神魄数量
        _this.heroNameLabel = null;
        _this.tierLabel = null;
        _this.atkCurLabel = null;
        _this.atkNextLabel = null;
        _this.energyCurLabel = null;
        _this.energyNextLabel = null;
        _this.shardCostLabel = null;
        _this.shenpoCostLabel = null;
        _this.heroScrollView = null; // HeroScrollView
        _this._iconSp = {};
        _this._sp = {};
        _this._zzImgSp = {};
        _this._selectedHeroIdx = 0; // 默认选中第1个
        _this._heroItems = []; // HeroContent 下的6个 HeroItem
        _this._isCenteringHero = false;
        _this._suppressItemClick = false;
        _this._touchStartX = 0;
        _this._popupMode = false;
        _this._leftBtn = null;
        _this._rightBtn = null;
        _this._itemIcon1 = null;
        _this._itemIcon2 = null;
        return _this;
    }
    UpgradeController.prototype.onLoad = function () {
        var _this = this;
        Constants_1.loadConfig(require('config'));
        this._jumpToHero(this._selectedHeroIdx);
        cc.loader.loadResDir('textures/qianghua', cc.SpriteFrame, function (err, frames) {
            if (err) {
                cc.error('[Upgrade] 贴图加载失败', err);
                return;
            }
            frames.forEach(function (f) { _this._sp[f.name] = f; });
            _this._applyAssets();
        });
        cc.loader.loadResDir('zzImg', cc.SpriteFrame, function (err, frames) {
            if (!err && frames)
                frames.forEach(function (f) { _this._zzImgSp[f.name] = f; });
            _this._refreshHeroArt();
            _this._refreshItemIcons();
            _this._refreshHeroListArt();
        });
        cc.loader.loadResDir('textures/icon', cc.SpriteFrame, function (err, frames) {
            if (!err && frames)
                frames.forEach(function (f) { _this._iconSp[f.name] = f; });
            _this._buildHeroList();
            // 先刷新信息（不滚动），延两帧后再滚动居中
            _this._selectHero(_this._selectedHeroIdx, false);
            _this.scheduleOnce(function () {
                _this.scheduleOnce(function () {
                    _this._doScrollToHero(_this._selectedHeroIdx);
                }, 0);
            }, 0);
        });
        this._fitHeroTouchArea();
        this._bindButtons();
    };
    UpgradeController.prototype.onEnable = function () {
        if (this._heroItems.length > 0) {
            this._refreshShenpo();
            var heroes = Constants_1.CFG.heroConfig;
            if (heroes && heroes[this._selectedHeroIdx])
                this._refreshInfo(heroes[this._selectedHeroIdx]);
            this._refreshHeroArt();
            this._refreshItemIcons();
            this._updateArrowVisible();
            this._scrollToHero(this._selectedHeroIdx);
        }
    };
    UpgradeController.prototype.showAsPopup = function () {
        var _this = this;
        this._popupMode = true;
        this.node.active = true;
        this._refreshShenpo();
        var heroes = Constants_1.CFG.heroConfig;
        if (heroes && heroes[this._selectedHeroIdx])
            this._refreshInfo(heroes[this._selectedHeroIdx]);
        this._refreshHeroArt();
        this._refreshItemIcons();
        this._updateArrowVisible();
        this.scheduleOnce(function () { return _this._updateArrowVisible(); }, 0);
        this._scrollToHero(this._selectedHeroIdx);
    };
    // ---- 静态贴图 ----
    UpgradeController.prototype._applyAssets = function () {
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
    };
    UpgradeController.prototype._setSp = function (node, key) {
        if (!node || !this._sp[key])
            return;
        var s = node.getComponent(cc.Sprite);
        if (!s)
            s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    };
    UpgradeController.prototype._refreshShenpo = function () {
        if (this.shenpoLabel)
            this.shenpoLabel.string = String(GameState_1.default.shenpo);
    };
    UpgradeController.prototype._setSpriteFrame = function (node, sf) {
        if (!node || !sf)
            return;
        var sp = node.getComponent(cc.Sprite);
        if (!sp)
            sp = node.addComponent(cc.Sprite);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.spriteFrame = sf;
    };
    UpgradeController.prototype._findChild = function (parent, name) {
        if (!parent)
            return null;
        if (parent.name === name)
            return parent;
        for (var i = 0; i < parent.childrenCount; i++) {
            var found = this._findChild(parent.children[i], name);
            if (found)
                return found;
        }
        return null;
    };
    UpgradeController.prototype._getHeroArtKey = function (idx) {
        return 'yingxiong' + (idx + 1);
    };
    UpgradeController.prototype._getHeroShardKey = function (idx) {
        return 'yingxiongsuipian' + (idx + 1);
    };
    UpgradeController.prototype._refreshHeroArt = function () {
        if (this.heroScrollView) {
            if (this._heroItems.length > 0)
                this._refreshHeroListArt();
            return;
        }
        // 兼容没有滚动列表的旧场景，正常新弹窗走 HeroItem0-5 显示人物图。
        this._setSpriteFrame(this.heroDisplay, this._zzImgSp[this._getHeroArtKey(this._selectedHeroIdx)]);
    };
    UpgradeController.prototype._refreshItemIcons = function () {
        if (!this._itemIcon1)
            this._itemIcon1 = this._findChild(this.node, 'item_icon1');
        if (!this._itemIcon2)
            this._itemIcon2 = this._findChild(this.node, 'item_icon2');
        this._setSpriteFrame(this._itemIcon1, this._zzImgSp['yanshi']);
        this._setSpriteFrame(this._itemIcon2, this._zzImgSp[this._getHeroShardKey(this._selectedHeroIdx)]);
    };
    UpgradeController.prototype._refreshHeroListArt = function () {
        for (var i = 0; i < this._heroItems.length; i++) {
            this._setSpriteFrame(this._heroItems[i], this._zzImgSp[this._getHeroArtKey(i)]);
        }
    };
    UpgradeController.prototype._fitHeroTouchArea = function () {
        if (!this.heroScrollView)
            return;
        var targetW = Math.min(HERO_TOUCH_W, this.heroScrollView.width || HERO_TOUCH_W);
        var targetH = HERO_TOUCH_H;
        this.heroScrollView.width = targetW;
        this.heroScrollView.height = targetH;
        this.heroScrollView.y = HERO_AREA_Y;
        var sv = this.heroScrollView.getComponent(cc.ScrollView);
        var view = sv && sv.content ? sv.content.parent : null;
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
    };
    UpgradeController.prototype._getHeroTotal = function () {
        var heroes = Constants_1.CFG.heroConfig;
        return Math.min(HERO_ART_COUNT, heroes ? heroes.length : HERO_ART_COUNT);
    };
    UpgradeController.prototype._updateArrowVisible = function () {
        if (!this._leftBtn)
            this._leftBtn = this._findChild(this.node, 'zuo');
        if (!this._rightBtn)
            this._rightBtn = this._findChild(this.node, 'you');
        var total = this._getHeroTotal();
        this._setArrowVisible(this._leftBtn, this._selectedHeroIdx > 0);
        this._setArrowVisible(this._rightBtn, total > 0 && this._selectedHeroIdx < total - 1);
    };
    UpgradeController.prototype._setArrowVisible = function (node, visible) {
        if (!node)
            return;
        node.active = visible;
        node.opacity = visible ? 255 : 0;
    };
    // ---- 勇士列表 ----
    UpgradeController.prototype._buildHeroList = function () {
        var _this = this;
        if (!this.heroScrollView)
            return;
        this._fitHeroTouchArea();
        var sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv || !sv.content)
            return;
        var content = sv.content;
        var heroes = Constants_1.CFG.heroConfig;
        if (!heroes || heroes.length === 0)
            return;
        var pageW = this.heroScrollView.width > 0 ? this.heroScrollView.width : HERO_ITEM_W;
        var itemCount = Math.min(content.childrenCount, HERO_ART_COUNT, heroes.length);
        content.width = pageW * itemCount;
        content.height = HERO_TOUCH_H;
        // 收集 HeroItem 节点（已在 .fire 里建好）
        this._heroItems = [];
        var _loop_1 = function (i) {
            var item = content.children[i];
            this_1._heroItems.push(item);
            item.x = pageW * (i + 0.5);
            item.y = HERO_ITEM_Y;
            // 赋图标贴图
            var hero = heroes[i];
            var heroSf = this_1._zzImgSp[this_1._getHeroArtKey(i)];
            if (heroSf) {
                this_1._setSpriteFrame(item, heroSf);
            }
            else if (hero) {
                var iconName = (hero.icon || '').replace(/\.[^.]+$/, '');
                var sf = this_1._iconSp[iconName];
                this_1._setSpriteFrame(item, sf);
            }
            // 点击事件
            var idx = i;
            item.on(cc.Node.EventType.TOUCH_END, function (e) {
                e.stopPropagation();
                if (_this._suppressItemClick)
                    return;
                _this._selectHero(idx, true);
            }, this_1);
        };
        var this_1 = this;
        for (var i = 0; i < itemCount; i++) {
            _loop_1(i);
        }
    };
    UpgradeController.prototype._selectHero = function (idx, scroll) {
        var _this = this;
        var heroes = Constants_1.CFG.heroConfig;
        if (!heroes || idx < 0 || idx >= heroes.length)
            return;
        this._selectedHeroIdx = idx;
        // 更新所有 item 的缩放
        for (var i = 0; i < this._heroItems.length; i++) {
            var target = i === idx ? SELECTED_SCALE : 1;
            cc.tween(this._heroItems[i])
                .to(0.15, { scale: target })
                .start();
        }
        // 滚动让选中项居中
        if (scroll)
            this._scrollToHero(idx);
        // 刷新下方进阶信息
        this._refreshInfo(heroes[idx]);
        this._refreshHeroArt();
        this._refreshItemIcons();
        this._updateArrowVisible();
        this.scheduleOnce(function () { return _this._updateArrowVisible(); }, 0);
    };
    UpgradeController.prototype._bindScrollSelection = function () {
        var _this = this;
        if (!this.heroScrollView)
            return;
        this.heroScrollView.on(cc.Node.EventType.TOUCH_START, function (e) {
            _this._isCenteringHero = false;
            _this._touchStartX = e.getLocationX();
        }, this, true);
        this.heroScrollView.on(cc.Node.EventType.TOUCH_END, function (e) {
            _this._selectHeroBySwipe(e.getLocationX() - _this._touchStartX);
        }, this, true);
        this.heroScrollView.on(cc.Node.EventType.TOUCH_CANCEL, function (e) {
            _this._selectHeroBySwipe(e.getLocationX() - _this._touchStartX);
        }, this, true);
        this.heroScrollView.on('scroll-ended', function () {
            if (_this._isCenteringHero)
                return;
            var sv = _this.heroScrollView.getComponent(cc.ScrollView);
            if (sv)
                sv.stopAutoScroll();
        }, this);
    };
    UpgradeController.prototype._selectHeroBySwipe = function (deltaX) {
        var _this = this;
        if (this._isCenteringHero)
            return;
        if (!this.heroScrollView)
            return;
        var isSwipe = Math.abs(deltaX) >= SWIPE_SWITCH_DISTANCE;
        this._suppressItemClick = isSwipe;
        if (!isSwipe) {
            this.scheduleOnce(function () {
                _this._suppressItemClick = false;
            }, 0);
            return;
        }
        var sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (sv)
            sv.stopAutoScroll();
        var idx = this._selectedHeroIdx + (deltaX < 0 ? 1 : -1);
        if (idx < 0 || idx >= this._getHeroTotal()) {
            this.scheduleOnce(function () {
                _this._suppressItemClick = false;
            }, 0.1);
            return;
        }
        this._selectHero(idx, true);
        this.scheduleOnce(function () {
            _this._suppressItemClick = false;
        }, 0.1);
    };
    UpgradeController.prototype._jumpToHero = function (idx) {
        if (!this.heroScrollView)
            return;
        var sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv || !sv.content)
            return;
        var item = sv.content.children[idx];
        if (!item)
            return;
        var viewW = this.heroScrollView.width;
        var contentW = sv.content.width;
        var maxOffset = Math.max(0, contentW - viewW);
        var offset = Math.max(0, Math.min(item.x - viewW / 2, maxOffset));
        sv.stopAutoScroll();
        sv.content.x = -offset;
        sv.scrollToOffset(cc.v2(offset, 0), 0);
    };
    UpgradeController.prototype._scrollToHero = function (idx) {
        var _this = this;
        this._isCenteringHero = true;
        // 延两帧，等 ScrollView 布局完成后再滚动
        this.scheduleOnce(function () {
            _this.scheduleOnce(function () {
                _this._doScrollToHero(idx);
            }, 0);
        }, 0);
    };
    UpgradeController.prototype._doScrollToHero = function (idx) {
        var _this = this;
        if (!this.heroScrollView) {
            cc.log('[Upgrade] heroScrollView 未绑定');
            return;
        }
        var sv = this.heroScrollView.getComponent(cc.ScrollView);
        if (!sv) {
            cc.log('[Upgrade] 找不到 cc.ScrollView 组件');
            return;
        }
        if (!sv.content) {
            cc.log('[Upgrade] sv.content 为空');
            return;
        }
        var item = this._heroItems[idx];
        if (!item) {
            cc.log('[Upgrade] heroItem[' + idx + '] 不存在');
            return;
        }
        // 用 item 的实际 x 坐标（相对于 content）
        // content anchor=(0,0.5)，item anchor=(0.5,0.5)
        // item 中心在 content 坐标系的 x = item.x
        var itemCenterX = item.x;
        var viewW = this.heroScrollView.width;
        var contentW = sv.content.width;
        var maxOffset = Math.max(0, contentW - viewW);
        var offset = itemCenterX - viewW / 2;
        var clamped = Math.max(0, Math.min(offset, maxOffset));
        cc.log('[Upgrade] scrollToHero idx=' + idx + ' itemX=' + itemCenterX + ' viewW=' + viewW + ' contentW=' + contentW + ' offset=' + clamped);
        if (sv.enabled) {
            sv.stopAutoScroll();
            sv.scrollToOffset(cc.v2(clamped, 0), 0.3);
        }
        else {
            sv.content.x = -clamped;
        }
        this.scheduleOnce(function () {
            _this._isCenteringHero = false;
        }, 0.35);
    };
    // ---- 进阶信息 ----
    UpgradeController.prototype._refreshInfo = function (hero) {
        var gs = GameState_1.default;
        if (!gs.heroTiers)
            gs.heroTiers = {};
        // curLv: 当前等级（从 1 开始，与 config 里 lv 字段一致）
        var curLv = gs.heroTiers[hero.id] || 1;
        var nextLv = curLv + 1;
        var curRow = this._getUpgradeRow(hero.id, curLv);
        var nextRow = this._getUpgradeRow(hero.id, nextLv);
        var maxTier = this._getMaxTier(hero.id);
        var atFull = curLv >= maxTier;
        this._refreshShenpo();
        if (this.heroNameLabel)
            this.heroNameLabel.string = hero.name;
        // TierLabel 只显示数字
        var displayLv = curRow ? curRow.lv : 1;
        if (this.tierLabel)
            this.tierLabel.string = String(displayLv);
        if (curRow) {
            if (this.atkCurLabel)
                this.atkCurLabel.string = "" + curRow.atkBonusPct;
            if (this.energyCurLabel)
                this.energyCurLabel.string = "" + curRow.mpBonusPct;
        }
        // 消耗读下一级（nextRow = lv+1）
        if (!atFull && nextRow) {
            if (this.atkNextLabel)
                this.atkNextLabel.string = "" + nextRow.atkBonusPct;
            if (this.energyNextLabel)
                this.energyNextLabel.string = "" + nextRow.mpBonusPct;
            var ownedShards = (gs.heroShards && gs.heroShards[hero.fragmentId]) || 0;
            var ownedShenpo = GameState_1.default.shenpo;
            if (this.shardCostLabel)
                this.shardCostLabel.string = ownedShards + "/" + nextRow.fragmentCost;
            if (this.shenpoCostLabel)
                this.shenpoCostLabel.string = ownedShenpo + "/" + nextRow.goldCost;
        }
        else {
            if (this.atkNextLabel)
                this.atkNextLabel.string = '已满阶';
            if (this.energyNextLabel)
                this.energyNextLabel.string = '已满阶';
            if (this.shardCostLabel)
                this.shardCostLabel.string = '-';
            if (this.shenpoCostLabel)
                this.shenpoCostLabel.string = '-';
        }
    };
    UpgradeController.prototype._getUpgradeRow = function (heroId, lv) {
        var list = Constants_1.CFG.heroUpgradeConfig;
        for (var i = 0; i < list.length; i++) {
            if (list[i].Hero_id === heroId && list[i].lv === lv)
                return list[i];
        }
        return null;
    };
    UpgradeController.prototype._getMaxTier = function (heroId) {
        var list = Constants_1.CFG.heroUpgradeConfig;
        var max = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i].Hero_id === heroId && list[i].lv > max)
                max = list[i].lv;
        }
        return max;
    };
    UpgradeController.prototype._clampHeroIdx = function (idx) {
        var total = this._getHeroTotal();
        return Math.max(0, Math.min(idx, total - 1));
    };
    UpgradeController.prototype._switchHero = function (delta) {
        var idx = this._selectedHeroIdx + delta;
        if (idx < 0 || idx >= this._getHeroTotal())
            return;
        this._selectHero(idx, true);
    };
    // ---- 按钮 ----
    UpgradeController.prototype._bindButtons = function () {
        var _this = this;
        cc.log('[Upgrade] _bindButtons backBtn=' + (this.backBtn ? 'ok' : 'null') + ' upgradeBtn=' + (this.upgradeBtn ? 'ok' : 'null'));
        if (this.backBtn)
            this.backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        if (this.upgradeBtn)
            this.upgradeBtn.on(cc.Node.EventType.TOUCH_END, this._onUpgrade, this);
        this._leftBtn = this._findChild(this.node, 'zuo');
        this._rightBtn = this._findChild(this.node, 'you');
        if (this._leftBtn)
            this._leftBtn.on(cc.Node.EventType.TOUCH_END, function () { return _this._switchHero(-1); }, this);
        if (this._rightBtn)
            this._rightBtn.on(cc.Node.EventType.TOUCH_END, function () { return _this._switchHero(1); }, this);
        this._updateArrowVisible();
    };
    UpgradeController.prototype._onUpgrade = function () {
        var _this = this;
        var heroes = Constants_1.CFG.heroConfig;
        if (!heroes || heroes.length === 0)
            return;
        var hero = heroes[this._selectedHeroIdx];
        var gs = GameState_1.default;
        if (!gs.heroTiers)
            gs.heroTiers = {};
        var curLv = gs.heroTiers[hero.id] || 1;
        var nextRow = this._getUpgradeRow(hero.id, curLv + 1);
        if (!nextRow) {
            this._showToast('已满阶。');
            return;
        }
        var ownedShards = (gs.heroShards && gs.heroShards[hero.fragmentId]) || 0;
        var ownedShenpo = GameState_1.default.shenpo;
        var needShards = nextRow.fragmentCost || 0;
        var needShenpo = nextRow.goldCost || 0;
        var lackShard = ownedShards < needShards;
        var lackShenpo = ownedShenpo < needShenpo;
        if (lackShard && lackShenpo) {
            this._showToast('碎片不足。');
            this.scheduleOnce(function () { return _this._showToast('神魄不足。'); }, 0.25);
            return;
        }
        if (lackShard) {
            this._showToast('碎片不足。');
            return;
        }
        if (lackShenpo) {
            this._showToast('神魄不足。');
            return;
        }
        // 同时扣除
        gs.heroShards[hero.fragmentId] = ownedShards - needShards;
        GameState_1.default.shenpo -= needShenpo;
        gs.heroTiers[hero.id] = curLv + 1;
        GameState_1.default.save();
        StateBridge_1.default.syncNewToOld();
        cc.tween(this.upgradeBtn)
            .to(0.05, { scale: 0.92 })
            .to(0.1, { scale: 1.0 })
            .call(function () { return _this._refreshInfo(hero); })
            .start();
    };
    UpgradeController.prototype._onBack = function () {
        StateBridge_1.default.syncNewToOld();
        if (this._popupMode) {
            this.node.active = false;
            return;
        }
        cc.director.loadScene('Start');
    };
    UpgradeController.prototype._showToast = function (msg) {
        TipsManager_1.default.show(msg);
    };
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "backBtn", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "titleBar", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "currencyBar", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "heroDisplay", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "attrPanel", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "costPanel", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "upgradeBtn", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "shenpoLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "heroNameLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "tierLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "atkCurLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "atkNextLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "energyCurLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "energyNextLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "shardCostLabel", void 0);
    __decorate([
        property(cc.Label)
    ], UpgradeController.prototype, "shenpoCostLabel", void 0);
    __decorate([
        property(cc.Node)
    ], UpgradeController.prototype, "heroScrollView", void 0);
    UpgradeController = __decorate([
        ccclass
    ], UpgradeController);
    return UpgradeController;
}(cc.Component));
exports.default = UpgradeController;

cc._RF.pop();