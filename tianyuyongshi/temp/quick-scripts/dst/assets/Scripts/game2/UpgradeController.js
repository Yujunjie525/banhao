
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/UpgradeController.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXFVwZ3JhZGVDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBcUQ7QUFDckQseUNBQW9DO0FBQ3BDLDZDQUF3QztBQUN4QyxtREFBOEM7QUFFeEMsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFFNUMsa0NBQWtDO0FBQ2xDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN4QixRQUFRO0FBQ1IsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzVCLElBQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0FBQ2pDLElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7QUFDekIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLDBDQUEwQztBQUMxQyxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFDNUIsaURBQWlEO0FBQ2pELElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUd0QjtJQUErQyxxQ0FBWTtJQUEzRDtRQUFBLHFFQXNoQkM7UUFwaEJ1QixhQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFDekIsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFDNUIsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFDNUIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUMxQixlQUFTLEdBQVksSUFBSSxDQUFDO1FBQzFCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRTNCLGlCQUFXLEdBQWEsSUFBSSxDQUFDLENBQUksT0FBTztRQUN4QyxtQkFBYSxHQUFhLElBQUksQ0FBQztRQUMvQixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBQzNCLGlCQUFXLEdBQWEsSUFBSSxDQUFDO1FBQzdCLGtCQUFZLEdBQWEsSUFBSSxDQUFDO1FB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RUFBRSxDQUFDLElBQUksQ0FBQzswREFBOEI7SUFDNUI7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7d0RBQTRCO0lBQzFCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3dEQUE0QjtJQUMxQjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzt5REFBNkI7SUFFM0I7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7MERBQThCO0lBQzdCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzREQUFnQztJQUMvQjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt3REFBNEI7SUFDM0I7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7MERBQThCO0lBQzdCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzJEQUErQjtJQUM5QjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs2REFBaUM7SUFDaEM7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7OERBQWtDO0lBQ2pDO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzZEQUFpQztJQUNoQztRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs4REFBa0M7SUFFakM7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkRBQWlDO0lBcEJsQyxpQkFBaUI7UUFEckMsT0FBTztPQUNhLGlCQUFpQixDQXNoQnJDO0lBQUQsd0JBQUM7Q0F0aEJELEFBc2hCQyxDQXRoQjhDLEVBQUUsQ0FBQyxTQUFTLEdBc2hCMUQ7a0JBdGhCb0IsaUJBQWlCIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZENvbmZpZywgQ0ZHLCBTY2VuZSB9IGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IEdhbWVTdGF0ZSBmcm9tICcuL0dhbWVTdGF0ZSc7XHJcbmltcG9ydCBTdGF0ZUJyaWRnZSBmcm9tICcuL1N0YXRlQnJpZGdlJztcclxuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gJy4uL0xvYWQvVGlwc01hbmFnZXInO1xyXG5cclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbi8vIOWLh+Wjq+WbvueJh+WuveW6pu+8iOS4jiAuZmlyZSDph4wgSGVyb0l0ZW0g5a695bqm5LiA6Ie077yJXHJcbmNvbnN0IEhFUk9fSVRFTV9XID0gMjAwO1xyXG4vLyDpgInkuK3ml7bnvKnmlL5cclxuY29uc3QgU0VMRUNURURfU0NBTEUgPSAxLjE1O1xyXG5jb25zdCBTV0lQRV9TV0lUQ0hfRElTVEFOQ0UgPSA4MDtcclxuY29uc3QgSEVST19BUlRfQ09VTlQgPSA2O1xyXG5jb25zdCBIRVJPX1RPVUNIX1cgPSAzMjA7XHJcbmNvbnN0IEhFUk9fVE9VQ0hfSCA9IDI3MDtcclxuLy8g5pW05Liq5Lq654mp5pi+56S65Yy65Z+f55qE6auY5bqm5Z2Q5qCH77yM5oOz5pW05L2T5LiKL+S4i+enu+WKqOWwseiwg+i/memHjOOAguaVsOWAvOWPmOWwjyA9IOaVtOS9k+S4i+enu+OAglxuY29uc3QgSEVST19BUkVBX1kgPSAxNjcuMjIyO1xuLy8g5Lq654mp5Zyo5pi+56S65Yy65Z+f6YeM55qE6auY5bqm5Z2Q5qCH77yM5oOz5Y2V54us6LCD5Lq654mp5Zyo6KOB5Ymq5qGG5YaF5LiKL+S4i+Wwseiwg+i/memHjO+8m+WkquWwj+S8muiiqyBNYXNrIOijgeaOieOAglxuY29uc3QgSEVST19JVEVNX1kgPSAwO1xuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwZ3JhZGVDb250cm9sbGVyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGJhY2tCdG46IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICB0aXRsZUJhcjogY2MuTm9kZSA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGN1cnJlbmN5QmFyOiBjYy5Ob2RlID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgaGVyb0Rpc3BsYXk6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBhdHRyUGFuZWw6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBjb3N0UGFuZWw6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICB1cGdyYWRlQnRuOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIHNoZW5wb0xhYmVsOiBjYy5MYWJlbCA9IG51bGw7ICAgIC8vIOelnumthOaVsOmHj1xyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSBoZXJvTmFtZUxhYmVsOiBjYy5MYWJlbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIHRpZXJMYWJlbDogY2MuTGFiZWwgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSBhdGtDdXJMYWJlbDogY2MuTGFiZWwgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSBhdGtOZXh0TGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbCkgZW5lcmd5Q3VyTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbCkgZW5lcmd5TmV4dExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIHNoYXJkQ29zdExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIHNoZW5wb0Nvc3RMYWJlbDogY2MuTGFiZWwgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgaGVyb1Njcm9sbFZpZXc6IGNjLk5vZGUgPSBudWxsOyAgLy8gSGVyb1Njcm9sbFZpZXdcclxuXHJcbiAgICBwcml2YXRlIF9pY29uU3A6IHsgW25hbWU6IHN0cmluZ106IGNjLlNwcml0ZUZyYW1lIH0gPSB7fTtcclxuICAgIHByaXZhdGUgX3NwOiB7IFtuYW1lOiBzdHJpbmddOiBjYy5TcHJpdGVGcmFtZSB9ID0ge307XHJcbiAgICBwcml2YXRlIF96ekltZ1NwOiB7IFtuYW1lOiBzdHJpbmddOiBjYy5TcHJpdGVGcmFtZSB9ID0ge307XHJcbiAgICBwcml2YXRlIF9zZWxlY3RlZEhlcm9JZHg6IG51bWJlciA9IDA7ICAgLy8g6buY6K6k6YCJ5Lit56ysMeS4qlxyXG4gICAgcHJpdmF0ZSBfaGVyb0l0ZW1zOiBjYy5Ob2RlW10gPSBbXTsgICAgICAvLyBIZXJvQ29udGVudCDkuIvnmoQ25LiqIEhlcm9JdGVtXHJcbiAgICBwcml2YXRlIF9pc0NlbnRlcmluZ0hlcm86IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3N1cHByZXNzSXRlbUNsaWNrOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF90b3VjaFN0YXJ0WDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX3BvcHVwTW9kZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbGVmdEJ0bjogY2MuTm9kZSA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9yaWdodEJ0bjogY2MuTm9kZSA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9pdGVtSWNvbjE6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfaXRlbUljb24yOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBvbkxvYWQoKSB7XHJcbiAgICAgICAgbG9hZENvbmZpZyhyZXF1aXJlKCdjb25maWcnKSk7XHJcbiAgICAgICAgdGhpcy5fanVtcFRvSGVybyh0aGlzLl9zZWxlY3RlZEhlcm9JZHgpO1xyXG5cclxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcigndGV4dHVyZXMvcWlhbmdodWEnLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogYW55LCBmcmFtZXM6IGNjLlNwcml0ZUZyYW1lW10pID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycikgeyBjYy5lcnJvcignW1VwZ3JhZGVdIOi0tOWbvuWKoOi9veWksei0pScsIGVycik7IHJldHVybjsgfVxyXG4gICAgICAgICAgICBmcmFtZXMuZm9yRWFjaChmID0+IHsgdGhpcy5fc3BbZi5uYW1lXSA9IGY7IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9hcHBseUFzc2V0cygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignenpJbWcnLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogYW55LCBmcmFtZXM6IGNjLlNwcml0ZUZyYW1lW10pID0+IHtcclxuICAgICAgICAgICAgaWYgKCFlcnIgJiYgZnJhbWVzKSBmcmFtZXMuZm9yRWFjaChmID0+IHsgdGhpcy5fenpJbWdTcFtmLm5hbWVdID0gZjsgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hIZXJvQXJ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hJdGVtSWNvbnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaEhlcm9MaXN0QXJ0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzRGlyKCd0ZXh0dXJlcy9pY29uJywgY2MuU3ByaXRlRnJhbWUsIChlcnI6IGFueSwgZnJhbWVzOiBjYy5TcHJpdGVGcmFtZVtdKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZXJyICYmIGZyYW1lcykgZnJhbWVzLmZvckVhY2goZiA9PiB7IHRoaXMuX2ljb25TcFtmLm5hbWVdID0gZjsgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSGVyb0xpc3QoKTtcclxuICAgICAgICAgICAgLy8g5YWI5Yi35paw5L+h5oGv77yI5LiN5rua5Yqo77yJ77yM5bu25Lik5bin5ZCO5YaN5rua5Yqo5bGF5LitXHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdEhlcm8odGhpcy5fc2VsZWN0ZWRIZXJvSWR4LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1Njcm9sbFRvSGVybyh0aGlzLl9zZWxlY3RlZEhlcm9JZHgpO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maXRIZXJvVG91Y2hBcmVhKCk7XHJcbiAgICAgICAgdGhpcy5fYmluZEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVuYWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5faGVyb0l0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaFNoZW5wbygpO1xyXG4gICAgICAgICAgICBjb25zdCBoZXJvZXMgPSBDRkcuaGVyb0NvbmZpZztcclxuICAgICAgICAgICAgaWYgKGhlcm9lcyAmJiBoZXJvZXNbdGhpcy5fc2VsZWN0ZWRIZXJvSWR4XSkgdGhpcy5fcmVmcmVzaEluZm8oaGVyb2VzW3RoaXMuX3NlbGVjdGVkSGVyb0lkeF0pO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoSGVyb0FydCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoSXRlbUljb25zKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUFycm93VmlzaWJsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxUb0hlcm8odGhpcy5fc2VsZWN0ZWRIZXJvSWR4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dBc1BvcHVwKCkge1xyXG4gICAgICAgIHRoaXMuX3BvcHVwTW9kZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNoZW5wbygpO1xyXG4gICAgICAgIGNvbnN0IGhlcm9lcyA9IENGRy5oZXJvQ29uZmlnO1xyXG4gICAgICAgIGlmIChoZXJvZXMgJiYgaGVyb2VzW3RoaXMuX3NlbGVjdGVkSGVyb0lkeF0pIHRoaXMuX3JlZnJlc2hJbmZvKGhlcm9lc1t0aGlzLl9zZWxlY3RlZEhlcm9JZHhdKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoSGVyb0FydCgpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hJdGVtSWNvbnMoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVBcnJvd1Zpc2libGUoKTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB0aGlzLl91cGRhdGVBcnJvd1Zpc2libGUoKSwgMCk7XHJcbiAgICAgICAgdGhpcy5fc2Nyb2xsVG9IZXJvKHRoaXMuX3NlbGVjdGVkSGVyb0lkeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLSDpnZnmgIHotLTlm74gLS0tLVxyXG5cclxuICAgIHByaXZhdGUgX2FwcGx5QXNzZXRzKCkge1xyXG4gICAgICAgIC8vIHRoaXMuX3NldFNwKHRoaXMuYmFja0J0biwgICAgICd1aV8xJyk7XHJcbiAgICAgICAgLy8gdGhpcy5fc2V0U3AodGhpcy50aXRsZUJhciwgICAgJ3VpXzInKTtcclxuICAgICAgICAvLyB0aGlzLl9zZXRTcCh0aGlzLmN1cnJlbmN5QmFyLCAndWlfMycpO1xyXG4gICAgICAgIC8vIHRoaXMuX3NldFNwKHRoaXMuaGVyb0Rpc3BsYXksICd1aV80Jyk7XHJcbiAgICAgICAgLy8gdGhpcy5fc2V0U3AodGhpcy5hdHRyUGFuZWwsICAgJ3VpXzUnKTtcclxuICAgICAgICAvLyB0aGlzLl9zZXRTcCh0aGlzLmNvc3RQYW5lbCwgICAndWlfNicpO1xyXG4gICAgICAgIC8vIHRoaXMuX3NldFNwKHRoaXMudXBncmFkZUJ0biwgICd1aV83Jyk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNoZW5wbygpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hIZXJvQXJ0KCk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaEl0ZW1JY29ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFNwKG5vZGU6IGNjLk5vZGUsIGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFub2RlIHx8ICF0aGlzLl9zcFtrZXldKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHMgPSBub2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xyXG4gICAgICAgIGlmICghcykgcyA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgcy5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XHJcbiAgICAgICAgcy5zcHJpdGVGcmFtZSA9IHRoaXMuX3NwW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaFNoZW5wbygpIHtcclxuICAgICAgICBpZiAodGhpcy5zaGVucG9MYWJlbCkgdGhpcy5zaGVucG9MYWJlbC5zdHJpbmcgPSBTdHJpbmcoR2FtZVN0YXRlLnNoZW5wbyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0U3ByaXRlRnJhbWUobm9kZTogY2MuTm9kZSwgc2Y6IGNjLlNwcml0ZUZyYW1lKSB7XHJcbiAgICAgICAgaWYgKCFub2RlIHx8ICFzZikgcmV0dXJuO1xyXG4gICAgICAgIGxldCBzcCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgaWYgKCFzcCkgc3AgPSBub2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xyXG4gICAgICAgIHNwLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuICAgICAgICBzcC5zcHJpdGVGcmFtZSA9IHNmO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbmRDaGlsZChwYXJlbnQ6IGNjLk5vZGUsIG5hbWU6IHN0cmluZyk6IGNjLk5vZGUge1xyXG4gICAgICAgIGlmICghcGFyZW50KSByZXR1cm4gbnVsbDtcclxuICAgICAgICBpZiAocGFyZW50Lm5hbWUgPT09IG5hbWUpIHJldHVybiBwYXJlbnQ7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJlbnQuY2hpbGRyZW5Db3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5fZmluZENoaWxkKHBhcmVudC5jaGlsZHJlbltpXSwgbmFtZSk7XHJcbiAgICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRIZXJvQXJ0S2V5KGlkeDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gJ3lpbmd4aW9uZycgKyAoaWR4ICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0SGVyb1NoYXJkS2V5KGlkeDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gJ3lpbmd4aW9uZ3N1aXBpYW4nICsgKGlkeCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3JlZnJlc2hIZXJvQXJ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhlcm9TY3JvbGxWaWV3KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oZXJvSXRlbXMubGVuZ3RoID4gMCkgdGhpcy5fcmVmcmVzaEhlcm9MaXN0QXJ0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5YW85a655rKh5pyJ5rua5Yqo5YiX6KGo55qE5pen5Zy65pmv77yM5q2j5bi45paw5by556qX6LWwIEhlcm9JdGVtMC01IOaYvuekuuS6uueJqeWbvuOAglxyXG4gICAgICAgIHRoaXMuX3NldFNwcml0ZUZyYW1lKHRoaXMuaGVyb0Rpc3BsYXksIHRoaXMuX3p6SW1nU3BbdGhpcy5fZ2V0SGVyb0FydEtleSh0aGlzLl9zZWxlY3RlZEhlcm9JZHgpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaEl0ZW1JY29ucygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2l0ZW1JY29uMSkgdGhpcy5faXRlbUljb24xID0gdGhpcy5fZmluZENoaWxkKHRoaXMubm9kZSwgJ2l0ZW1faWNvbjEnKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2l0ZW1JY29uMikgdGhpcy5faXRlbUljb24yID0gdGhpcy5fZmluZENoaWxkKHRoaXMubm9kZSwgJ2l0ZW1faWNvbjInKTtcclxuICAgICAgICB0aGlzLl9zZXRTcHJpdGVGcmFtZSh0aGlzLl9pdGVtSWNvbjEsIHRoaXMuX3p6SW1nU3BbJ3lhbnNoaSddKTtcclxuICAgICAgICB0aGlzLl9zZXRTcHJpdGVGcmFtZSh0aGlzLl9pdGVtSWNvbjIsIHRoaXMuX3p6SW1nU3BbdGhpcy5fZ2V0SGVyb1NoYXJkS2V5KHRoaXMuX3NlbGVjdGVkSGVyb0lkeCldKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoSGVyb0xpc3RBcnQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9oZXJvSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0U3ByaXRlRnJhbWUodGhpcy5faGVyb0l0ZW1zW2ldLCB0aGlzLl96ekltZ1NwW3RoaXMuX2dldEhlcm9BcnRLZXkoaSldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZml0SGVyb1RvdWNoQXJlYSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGVyb1Njcm9sbFZpZXcpIHJldHVybjtcclxuICAgICAgICBjb25zdCB0YXJnZXRXID0gTWF0aC5taW4oSEVST19UT1VDSF9XLCB0aGlzLmhlcm9TY3JvbGxWaWV3LndpZHRoIHx8IEhFUk9fVE9VQ0hfVyk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0SCA9IEhFUk9fVE9VQ0hfSDtcclxuICAgICAgICB0aGlzLmhlcm9TY3JvbGxWaWV3LndpZHRoID0gdGFyZ2V0VztcclxuICAgICAgICB0aGlzLmhlcm9TY3JvbGxWaWV3LmhlaWdodCA9IHRhcmdldEg7XHJcbiAgICAgICAgdGhpcy5oZXJvU2Nyb2xsVmlldy55ID0gSEVST19BUkVBX1k7XHJcbiAgICAgICAgY29uc3Qgc3YgPSB0aGlzLmhlcm9TY3JvbGxWaWV3LmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcclxuICAgICAgICBjb25zdCB2aWV3ID0gc3YgJiYgc3YuY29udGVudCA/IHN2LmNvbnRlbnQucGFyZW50IDogbnVsbDtcclxuICAgICAgICBpZiAoc3YpIHtcclxuICAgICAgICAgICAgc3YuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzdi5ob3Jpem9udGFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHN2LmluZXJ0aWEgPSBmYWxzZTtcclxuICAgICAgICAgICAgc3YuZWxhc3RpYyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzdi5jYW5jZWxJbm5lckV2ZW50cyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlldykge1xyXG4gICAgICAgICAgICB2aWV3LndpZHRoID0gdGFyZ2V0VztcclxuICAgICAgICAgICAgdmlldy5oZWlnaHQgPSB0YXJnZXRIO1xyXG4gICAgICAgICAgICB2aWV3LnggPSAtdGFyZ2V0VyAqIHRoaXMuaGVyb1Njcm9sbFZpZXcuYW5jaG9yWDtcclxuICAgICAgICAgICAgdmlldy55ID0gLXRhcmdldEggKiB0aGlzLmhlcm9TY3JvbGxWaWV3LmFuY2hvclk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdiAmJiBzdi5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIHN2LmNvbnRlbnQuaGVpZ2h0ID0gdGFyZ2V0SDtcclxuICAgICAgICAgICAgc3YuY29udGVudC55ID0gdGFyZ2V0SCAqIDAuNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0SGVyb1RvdGFsKCk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgaGVyb2VzID0gQ0ZHLmhlcm9Db25maWc7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKEhFUk9fQVJUX0NPVU5ULCBoZXJvZXMgPyBoZXJvZXMubGVuZ3RoIDogSEVST19BUlRfQ09VTlQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUFycm93VmlzaWJsZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xlZnRCdG4pIHRoaXMuX2xlZnRCdG4gPSB0aGlzLl9maW5kQ2hpbGQodGhpcy5ub2RlLCAnenVvJyk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9yaWdodEJ0bikgdGhpcy5fcmlnaHRCdG4gPSB0aGlzLl9maW5kQ2hpbGQodGhpcy5ub2RlLCAneW91Jyk7XHJcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLl9nZXRIZXJvVG90YWwoKTtcclxuICAgICAgICB0aGlzLl9zZXRBcnJvd1Zpc2libGUodGhpcy5fbGVmdEJ0biwgdGhpcy5fc2VsZWN0ZWRIZXJvSWR4ID4gMCk7XHJcbiAgICAgICAgdGhpcy5fc2V0QXJyb3dWaXNpYmxlKHRoaXMuX3JpZ2h0QnRuLCB0b3RhbCA+IDAgJiYgdGhpcy5fc2VsZWN0ZWRIZXJvSWR4IDwgdG90YWwgLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRBcnJvd1Zpc2libGUobm9kZTogY2MuTm9kZSwgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuO1xyXG4gICAgICAgIG5vZGUuYWN0aXZlID0gdmlzaWJsZTtcclxuICAgICAgICBub2RlLm9wYWNpdHkgPSB2aXNpYmxlID8gMjU1IDogMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tIOWLh+Wjq+WIl+ihqCAtLS0tXHJcblxyXG4gICAgcHJpdmF0ZSBfYnVpbGRIZXJvTGlzdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGVyb1Njcm9sbFZpZXcpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9maXRIZXJvVG91Y2hBcmVhKCk7XHJcbiAgICAgICAgY29uc3Qgc3YgPSB0aGlzLmhlcm9TY3JvbGxWaWV3LmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcclxuICAgICAgICBpZiAoIXN2IHx8ICFzdi5jb250ZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzdi5jb250ZW50O1xyXG4gICAgICAgIGNvbnN0IGhlcm9lcyA9IENGRy5oZXJvQ29uZmlnO1xyXG4gICAgICAgIGlmICghaGVyb2VzIHx8IGhlcm9lcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuICAgICAgICBjb25zdCBwYWdlVyA9IHRoaXMuaGVyb1Njcm9sbFZpZXcud2lkdGggPiAwID8gdGhpcy5oZXJvU2Nyb2xsVmlldy53aWR0aCA6IEhFUk9fSVRFTV9XO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1Db3VudCA9IE1hdGgubWluKGNvbnRlbnQuY2hpbGRyZW5Db3VudCwgSEVST19BUlRfQ09VTlQsIGhlcm9lcy5sZW5ndGgpO1xyXG4gICAgICAgIGNvbnRlbnQud2lkdGggPSBwYWdlVyAqIGl0ZW1Db3VudDtcclxuICAgICAgICBjb250ZW50LmhlaWdodCA9IEhFUk9fVE9VQ0hfSDtcclxuXHJcbiAgICAgICAgLy8g5pS26ZuGIEhlcm9JdGVtIOiKgueCue+8iOW3suWcqCAuZmlyZSDph4zlu7rlpb3vvIlcclxuICAgICAgICB0aGlzLl9oZXJvSXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1Db3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjb250ZW50LmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB0aGlzLl9oZXJvSXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgaXRlbS54ID0gcGFnZVcgKiAoaSArIDAuNSk7XHJcbiAgICAgICAgICAgIGl0ZW0ueSA9IEhFUk9fSVRFTV9ZO1xyXG5cclxuICAgICAgICAgICAgLy8g6LWL5Zu+5qCH6LS05Zu+XHJcbiAgICAgICAgICAgIGNvbnN0IGhlcm8gPSBoZXJvZXNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGhlcm9TZiA9IHRoaXMuX3p6SW1nU3BbdGhpcy5fZ2V0SGVyb0FydEtleShpKV07XHJcbiAgICAgICAgICAgIGlmIChoZXJvU2YpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldFNwcml0ZUZyYW1lKGl0ZW0sIGhlcm9TZik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGVybykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbk5hbWUgPSAoaGVyby5pY29uIHx8ICcnKS5yZXBsYWNlKC9cXC5bXi5dKyQvLCAnJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZiA9IHRoaXMuX2ljb25TcFtpY29uTmFtZV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTcHJpdGVGcmFtZShpdGVtLCBzZik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOeCueWHu+S6i+S7tlxyXG4gICAgICAgICAgICBjb25zdCBpZHggPSBpO1xyXG4gICAgICAgICAgICBpdGVtLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKGU6IGNjLkV2ZW50LkV2ZW50VG91Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3VwcHJlc3NJdGVtQ2xpY2spIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdEhlcm8oaWR4LCB0cnVlKTtcclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NlbGVjdEhlcm8oaWR4OiBudW1iZXIsIHNjcm9sbDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGhlcm9lcyA9IENGRy5oZXJvQ29uZmlnO1xyXG4gICAgICAgIGlmICghaGVyb2VzIHx8IGlkeCA8IDAgfHwgaWR4ID49IGhlcm9lcy5sZW5ndGgpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRIZXJvSWR4ID0gaWR4O1xyXG5cclxuICAgICAgICAvLyDmm7TmlrDmiYDmnIkgaXRlbSDnmoTnvKnmlL5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2hlcm9JdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpID09PSBpZHggPyBTRUxFQ1RFRF9TQ0FMRSA6IDE7XHJcbiAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXMuX2hlcm9JdGVtc1tpXSlcclxuICAgICAgICAgICAgICAgIC50bygwLjE1LCB7IHNjYWxlOiB0YXJnZXQgfSlcclxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5rua5Yqo6K6p6YCJ5Lit6aG55bGF5LitXHJcbiAgICAgICAgaWYgKHNjcm9sbCkgdGhpcy5fc2Nyb2xsVG9IZXJvKGlkeCk7XHJcblxyXG4gICAgICAgIC8vIOWIt+aWsOS4i+aWuei/m+mYtuS/oeaBr1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hJbmZvKGhlcm9lc1tpZHhdKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoSGVyb0FydCgpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hJdGVtSWNvbnMoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVBcnJvd1Zpc2libGUoKTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB0aGlzLl91cGRhdGVBcnJvd1Zpc2libGUoKSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYmluZFNjcm9sbFNlbGVjdGlvbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGVyb1Njcm9sbFZpZXcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5oZXJvU2Nyb2xsVmlldy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgKGU6IGNjLkV2ZW50LkV2ZW50VG91Y2gpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5faXNDZW50ZXJpbmdIZXJvID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3RvdWNoU3RhcnRYID0gZS5nZXRMb2NhdGlvblgoKTtcclxuICAgICAgICB9LCB0aGlzLCB0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5oZXJvU2Nyb2xsVmlldy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIChlOiBjYy5FdmVudC5FdmVudFRvdWNoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdEhlcm9CeVN3aXBlKGUuZ2V0TG9jYXRpb25YKCkgLSB0aGlzLl90b3VjaFN0YXJ0WCk7XHJcbiAgICAgICAgfSwgdGhpcywgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuaGVyb1Njcm9sbFZpZXcub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCAoZTogY2MuRXZlbnQuRXZlbnRUb3VjaCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RIZXJvQnlTd2lwZShlLmdldExvY2F0aW9uWCgpIC0gdGhpcy5fdG91Y2hTdGFydFgpO1xyXG4gICAgICAgIH0sIHRoaXMsIHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLmhlcm9TY3JvbGxWaWV3Lm9uKCdzY3JvbGwtZW5kZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0NlbnRlcmluZ0hlcm8pIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3YgPSB0aGlzLmhlcm9TY3JvbGxWaWV3LmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcclxuICAgICAgICAgICAgaWYgKHN2KSBzdi5zdG9wQXV0b1Njcm9sbCgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NlbGVjdEhlcm9CeVN3aXBlKGRlbHRhWDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ2VudGVyaW5nSGVybykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy5oZXJvU2Nyb2xsVmlldykgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBpc1N3aXBlID0gTWF0aC5hYnMoZGVsdGFYKSA+PSBTV0lQRV9TV0lUQ0hfRElTVEFOQ0U7XHJcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NJdGVtQ2xpY2sgPSBpc1N3aXBlO1xyXG5cclxuICAgICAgICBpZiAoIWlzU3dpcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3VwcHJlc3NJdGVtQ2xpY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN2ID0gdGhpcy5oZXJvU2Nyb2xsVmlldy5nZXRDb21wb25lbnQoY2MuU2Nyb2xsVmlldyk7XHJcbiAgICAgICAgaWYgKHN2KSBzdi5zdG9wQXV0b1Njcm9sbCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9zZWxlY3RlZEhlcm9JZHggKyAoZGVsdGFYIDwgMCA/IDEgOiAtMSk7XHJcbiAgICAgICAgaWYgKGlkeCA8IDAgfHwgaWR4ID49IHRoaXMuX2dldEhlcm9Ub3RhbCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N1cHByZXNzSXRlbUNsaWNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sIDAuMSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0SGVybyhpZHgsIHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1cHByZXNzSXRlbUNsaWNrID0gZmFsc2U7XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9qdW1wVG9IZXJvKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhlcm9TY3JvbGxWaWV3KSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc3YgPSB0aGlzLmhlcm9TY3JvbGxWaWV3LmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcclxuICAgICAgICBpZiAoIXN2IHx8ICFzdi5jb250ZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBzdi5jb250ZW50LmNoaWxkcmVuW2lkeF07XHJcbiAgICAgICAgaWYgKCFpdGVtKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdXID0gdGhpcy5oZXJvU2Nyb2xsVmlldy53aWR0aDtcclxuICAgICAgICBjb25zdCBjb250ZW50VyA9IHN2LmNvbnRlbnQud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbWF4T2Zmc2V0ID0gTWF0aC5tYXgoMCwgY29udGVudFcgLSB2aWV3Vyk7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oaXRlbS54IC0gdmlld1cgLyAyLCBtYXhPZmZzZXQpKTtcclxuICAgICAgICBzdi5zdG9wQXV0b1Njcm9sbCgpO1xyXG4gICAgICAgIHN2LmNvbnRlbnQueCA9IC1vZmZzZXQ7XHJcbiAgICAgICAgc3Yuc2Nyb2xsVG9PZmZzZXQoY2MudjIob2Zmc2V0LCAwKSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2Nyb2xsVG9IZXJvKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5faXNDZW50ZXJpbmdIZXJvID0gdHJ1ZTtcclxuICAgICAgICAvLyDlu7bkuKTluKfvvIznrYkgU2Nyb2xsVmlldyDluIPlsYDlrozmiJDlkI7lho3mu5rliqhcclxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RvU2Nyb2xsVG9IZXJvKGlkeCk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RvU2Nyb2xsVG9IZXJvKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhlcm9TY3JvbGxWaWV3KSB7IGNjLmxvZygnW1VwZ3JhZGVdIGhlcm9TY3JvbGxWaWV3IOacque7keWumicpOyByZXR1cm47IH1cclxuICAgICAgICBjb25zdCBzdiA9IHRoaXMuaGVyb1Njcm9sbFZpZXcuZ2V0Q29tcG9uZW50KGNjLlNjcm9sbFZpZXcpO1xyXG4gICAgICAgIGlmICghc3YpIHsgY2MubG9nKCdbVXBncmFkZV0g5om+5LiN5YiwIGNjLlNjcm9sbFZpZXcg57uE5Lu2Jyk7IHJldHVybjsgfVxyXG4gICAgICAgIGlmICghc3YuY29udGVudCkgeyBjYy5sb2coJ1tVcGdyYWRlXSBzdi5jb250ZW50IOS4uuepuicpOyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX2hlcm9JdGVtc1tpZHhdO1xyXG4gICAgICAgIGlmICghaXRlbSkgeyBjYy5sb2coJ1tVcGdyYWRlXSBoZXJvSXRlbVsnICsgaWR4ICsgJ10g5LiN5a2Y5ZyoJyk7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAvLyDnlKggaXRlbSDnmoTlrp7pmYUgeCDlnZDmoIfvvIjnm7jlr7nkuo4gY29udGVudO+8iVxyXG4gICAgICAgIC8vIGNvbnRlbnQgYW5jaG9yPSgwLDAuNSnvvIxpdGVtIGFuY2hvcj0oMC41LDAuNSlcclxuICAgICAgICAvLyBpdGVtIOS4reW/g+WcqCBjb250ZW50IOWdkOagh+ezu+eahCB4ID0gaXRlbS54XHJcbiAgICAgICAgY29uc3QgaXRlbUNlbnRlclggPSBpdGVtLng7XHJcbiAgICAgICAgY29uc3Qgdmlld1cgPSB0aGlzLmhlcm9TY3JvbGxWaWV3LndpZHRoO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnRXID0gc3YuY29udGVudC53aWR0aDtcclxuICAgICAgICBjb25zdCBtYXhPZmZzZXQgPSBNYXRoLm1heCgwLCBjb250ZW50VyAtIHZpZXdXKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gaXRlbUNlbnRlclggLSB2aWV3VyAvIDI7XHJcbiAgICAgICAgY29uc3QgY2xhbXBlZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG9mZnNldCwgbWF4T2Zmc2V0KSk7XHJcblxyXG4gICAgICAgIGNjLmxvZygnW1VwZ3JhZGVdIHNjcm9sbFRvSGVybyBpZHg9JyArIGlkeCArICcgaXRlbVg9JyArIGl0ZW1DZW50ZXJYICsgJyB2aWV3Vz0nICsgdmlld1cgKyAnIGNvbnRlbnRXPScgKyBjb250ZW50VyArICcgb2Zmc2V0PScgKyBjbGFtcGVkKTtcclxuICAgICAgICBpZiAoc3YuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICBzdi5zdG9wQXV0b1Njcm9sbCgpO1xyXG4gICAgICAgICAgICBzdi5zY3JvbGxUb09mZnNldChjYy52MihjbGFtcGVkLCAwKSwgMC4zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdi5jb250ZW50LnggPSAtY2xhbXBlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0NlbnRlcmluZ0hlcm8gPSBmYWxzZTtcclxuICAgICAgICB9LCAwLjM1KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tIOi/m+mYtuS/oeaBryAtLS0tXHJcblxyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaEluZm8oaGVybzogYW55KSB7XHJcbiAgICAgICAgY29uc3QgZ3MgPSBHYW1lU3RhdGUgYXMgYW55O1xyXG4gICAgICAgIGlmICghZ3MuaGVyb1RpZXJzKSBncy5oZXJvVGllcnMgPSB7fTtcclxuICAgICAgICAvLyBjdXJMdjog5b2T5YmN562J57qn77yI5LuOIDEg5byA5aeL77yM5LiOIGNvbmZpZyDph4wgbHYg5a2X5q615LiA6Ie077yJXHJcbiAgICAgICAgY29uc3QgY3VyTHY6IG51bWJlciA9IGdzLmhlcm9UaWVyc1toZXJvLmlkXSB8fCAxO1xyXG4gICAgICAgIGNvbnN0IG5leHRMdiA9IGN1ckx2ICsgMTtcclxuXHJcbiAgICAgICAgY29uc3QgY3VyUm93ICA9IHRoaXMuX2dldFVwZ3JhZGVSb3coaGVyby5pZCwgY3VyTHYpO1xyXG4gICAgICAgIGNvbnN0IG5leHRSb3cgPSB0aGlzLl9nZXRVcGdyYWRlUm93KGhlcm8uaWQsIG5leHRMdik7XHJcbiAgICAgICAgY29uc3QgbWF4VGllciA9IHRoaXMuX2dldE1heFRpZXIoaGVyby5pZCk7XHJcbiAgICAgICAgY29uc3QgYXRGdWxsICA9IGN1ckx2ID49IG1heFRpZXI7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTaGVucG8oKTtcclxuICAgICAgICBpZiAodGhpcy5oZXJvTmFtZUxhYmVsKSB0aGlzLmhlcm9OYW1lTGFiZWwuc3RyaW5nID0gaGVyby5uYW1lO1xyXG4gICAgICAgIC8vIFRpZXJMYWJlbCDlj6rmmL7npLrmlbDlrZdcclxuICAgICAgICBjb25zdCBkaXNwbGF5THYgPSBjdXJSb3cgPyBjdXJSb3cubHYgOiAxO1xyXG4gICAgICAgIGlmICh0aGlzLnRpZXJMYWJlbCkgdGhpcy50aWVyTGFiZWwuc3RyaW5nID0gU3RyaW5nKGRpc3BsYXlMdik7XHJcblxyXG4gICAgICAgIGlmIChjdXJSb3cpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXRrQ3VyTGFiZWwpICAgIHRoaXMuYXRrQ3VyTGFiZWwuc3RyaW5nICAgID0gYCR7Y3VyUm93LmF0a0JvbnVzUGN0fWA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZXJneUN1ckxhYmVsKSB0aGlzLmVuZXJneUN1ckxhYmVsLnN0cmluZyA9IGAke2N1clJvdy5tcEJvbnVzUGN0fWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOa2iOiAl+ivu+S4i+S4gOe6p++8iG5leHRSb3cgPSBsdisx77yJXHJcbiAgICAgICAgaWYgKCFhdEZ1bGwgJiYgbmV4dFJvdykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hdGtOZXh0TGFiZWwpICAgIHRoaXMuYXRrTmV4dExhYmVsLnN0cmluZyAgICA9IGAke25leHRSb3cuYXRrQm9udXNQY3R9YDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW5lcmd5TmV4dExhYmVsKSB0aGlzLmVuZXJneU5leHRMYWJlbC5zdHJpbmcgPSBgJHtuZXh0Um93Lm1wQm9udXNQY3R9YDtcclxuICAgICAgICAgICAgY29uc3Qgb3duZWRTaGFyZHMgPSAoZ3MuaGVyb1NoYXJkcyAmJiBncy5oZXJvU2hhcmRzW2hlcm8uZnJhZ21lbnRJZF0pIHx8IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IG93bmVkU2hlbnBvID0gR2FtZVN0YXRlLnNoZW5wbztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hhcmRDb3N0TGFiZWwpICB0aGlzLnNoYXJkQ29zdExhYmVsLnN0cmluZyAgPSBgJHtvd25lZFNoYXJkc30vJHtuZXh0Um93LmZyYWdtZW50Q29zdH1gO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaGVucG9Db3N0TGFiZWwpIHRoaXMuc2hlbnBvQ29zdExhYmVsLnN0cmluZyA9IGAke293bmVkU2hlbnBvfS8ke25leHRSb3cuZ29sZENvc3R9YDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hdGtOZXh0TGFiZWwpICAgIHRoaXMuYXRrTmV4dExhYmVsLnN0cmluZyAgICA9ICflt7Lmu6HpmLYnO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbmVyZ3lOZXh0TGFiZWwpIHRoaXMuZW5lcmd5TmV4dExhYmVsLnN0cmluZyA9ICflt7Lmu6HpmLYnO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaGFyZENvc3RMYWJlbCkgIHRoaXMuc2hhcmRDb3N0TGFiZWwuc3RyaW5nICA9ICctJztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hlbnBvQ29zdExhYmVsKSB0aGlzLnNoZW5wb0Nvc3RMYWJlbC5zdHJpbmcgPSAnLSc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFVwZ3JhZGVSb3coaGVyb0lkOiBzdHJpbmcsIGx2OiBudW1iZXIpOiBhbnkge1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSBDRkcuaGVyb1VwZ3JhZGVDb25maWc7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLkhlcm9faWQgPT09IGhlcm9JZCAmJiBsaXN0W2ldLmx2ID09PSBsdikgcmV0dXJuIGxpc3RbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldE1heFRpZXIoaGVyb0lkOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSBDRkcuaGVyb1VwZ3JhZGVDb25maWc7XHJcbiAgICAgICAgbGV0IG1heCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLkhlcm9faWQgPT09IGhlcm9JZCAmJiBsaXN0W2ldLmx2ID4gbWF4KSBtYXggPSBsaXN0W2ldLmx2O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF4O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NsYW1wSGVyb0lkeChpZHg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLl9nZXRIZXJvVG90YWwoKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oaWR4LCB0b3RhbCAtIDEpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zd2l0Y2hIZXJvKGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9zZWxlY3RlZEhlcm9JZHggKyBkZWx0YTtcclxuICAgICAgICBpZiAoaWR4IDwgMCB8fCBpZHggPj0gdGhpcy5fZ2V0SGVyb1RvdGFsKCkpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9zZWxlY3RIZXJvKGlkeCwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLSDmjInpkq4gLS0tLVxyXG5cclxuICAgIHByaXZhdGUgX2JpbmRCdXR0b25zKCkge1xyXG4gICAgICAgIGNjLmxvZygnW1VwZ3JhZGVdIF9iaW5kQnV0dG9ucyBiYWNrQnRuPScgKyAodGhpcy5iYWNrQnRuID8gJ29rJyA6ICdudWxsJykgKyAnIHVwZ3JhZGVCdG49JyArICh0aGlzLnVwZ3JhZGVCdG4gPyAnb2snIDogJ251bGwnKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFja0J0bikgICAgdGhpcy5iYWNrQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5fb25CYWNrLCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy51cGdyYWRlQnRuKSB0aGlzLnVwZ3JhZGVCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLl9vblVwZ3JhZGUsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2xlZnRCdG4gPSB0aGlzLl9maW5kQ2hpbGQodGhpcy5ub2RlLCAnenVvJyk7XHJcbiAgICAgICAgdGhpcy5fcmlnaHRCdG4gPSB0aGlzLl9maW5kQ2hpbGQodGhpcy5ub2RlLCAneW91Jyk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xlZnRCdG4pIHRoaXMuX2xlZnRCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLl9zd2l0Y2hIZXJvKC0xKSwgdGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3JpZ2h0QnRuKSB0aGlzLl9yaWdodEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMuX3N3aXRjaEhlcm8oMSksIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUFycm93VmlzaWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uVXBncmFkZSgpIHtcclxuICAgICAgICBjb25zdCBoZXJvZXMgPSBDRkcuaGVyb0NvbmZpZztcclxuICAgICAgICBpZiAoIWhlcm9lcyB8fCBoZXJvZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGhlcm8gPSBoZXJvZXNbdGhpcy5fc2VsZWN0ZWRIZXJvSWR4XTtcclxuICAgICAgICBjb25zdCBncyA9IEdhbWVTdGF0ZSBhcyBhbnk7XHJcbiAgICAgICAgaWYgKCFncy5oZXJvVGllcnMpIGdzLmhlcm9UaWVycyA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGN1ckx2OiBudW1iZXIgPSBncy5oZXJvVGllcnNbaGVyby5pZF0gfHwgMTtcclxuICAgICAgICBjb25zdCBuZXh0Um93ID0gdGhpcy5fZ2V0VXBncmFkZVJvdyhoZXJvLmlkLCBjdXJMdiArIDEpO1xyXG5cclxuICAgICAgICBpZiAoIW5leHRSb3cpIHsgdGhpcy5fc2hvd1RvYXN0KCflt7Lmu6HpmLbjgIInKTsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGNvbnN0IG93bmVkU2hhcmRzID0gKGdzLmhlcm9TaGFyZHMgJiYgZ3MuaGVyb1NoYXJkc1toZXJvLmZyYWdtZW50SWRdKSB8fCAwO1xyXG4gICAgICAgIGNvbnN0IG93bmVkU2hlbnBvID0gR2FtZVN0YXRlLnNoZW5wbztcclxuICAgICAgICBjb25zdCBuZWVkU2hhcmRzICA9IG5leHRSb3cuZnJhZ21lbnRDb3N0IHx8IDA7XHJcbiAgICAgICAgY29uc3QgbmVlZFNoZW5wbyAgPSBuZXh0Um93LmdvbGRDb3N0ICAgICB8fCAwO1xyXG5cclxuICAgICAgICBjb25zdCBsYWNrU2hhcmQgID0gb3duZWRTaGFyZHMgPCBuZWVkU2hhcmRzO1xyXG4gICAgICAgIGNvbnN0IGxhY2tTaGVucG8gPSBvd25lZFNoZW5wbyA8IG5lZWRTaGVucG87XHJcblxyXG4gICAgICAgIGlmIChsYWNrU2hhcmQgJiYgbGFja1NoZW5wbykge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93VG9hc3QoJ+eijueJh+S4jei2s+OAgicpO1xyXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB0aGlzLl9zaG93VG9hc3QoJ+elnumthOS4jei2s+OAgicpLCAwLjI1KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGFja1NoYXJkKSAgeyB0aGlzLl9zaG93VG9hc3QoJ+eijueJh+S4jei2s+OAgicpOyByZXR1cm47IH1cclxuICAgICAgICBpZiAobGFja1NoZW5wbykgeyB0aGlzLl9zaG93VG9hc3QoJ+elnumthOS4jei2s+OAgicpOyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgLy8g5ZCM5pe25omj6ZmkXHJcbiAgICAgICAgZ3MuaGVyb1NoYXJkc1toZXJvLmZyYWdtZW50SWRdID0gb3duZWRTaGFyZHMgLSBuZWVkU2hhcmRzO1xyXG4gICAgICAgIEdhbWVTdGF0ZS5zaGVucG8gLT0gbmVlZFNoZW5wbztcclxuICAgICAgICBncy5oZXJvVGllcnNbaGVyby5pZF0gPSBjdXJMdiArIDE7XHJcbiAgICAgICAgR2FtZVN0YXRlLnNhdmUoKTtcclxuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jTmV3VG9PbGQoKTtcclxuXHJcbiAgICAgICAgY2MudHdlZW4odGhpcy51cGdyYWRlQnRuKVxyXG4gICAgICAgICAgICAudG8oMC4wNSwgeyBzY2FsZTogMC45MiB9KVxyXG4gICAgICAgICAgICAudG8oMC4xLCAgeyBzY2FsZTogMS4wIH0pXHJcbiAgICAgICAgICAgIC5jYWxsKCgpID0+IHRoaXMuX3JlZnJlc2hJbmZvKGhlcm8pKVxyXG4gICAgICAgICAgICAuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9vbkJhY2soKSB7XHJcbiAgICAgICAgU3RhdGVCcmlkZ2Uuc3luY05ld1RvT2xkKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3BvcHVwTW9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdTdGFydCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3Nob3dUb2FzdChtc2c6IHN0cmluZykge1xyXG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3cobXNnKTtcclxuICAgIH1cclxufVxyXG4iXX0=