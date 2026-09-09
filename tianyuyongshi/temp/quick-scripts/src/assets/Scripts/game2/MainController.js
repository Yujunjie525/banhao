"use strict";
cc._RF.push(module, '82a2feHnkBKcLXloVhXqtYN', 'MainController');
// Scripts/game2/MainController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./Constants");
var GameState_1 = require("./GameState");
var StateBridge_1 = require("./StateBridge");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 设计稿尺寸（与 data.json original_size 一致）
var DESIGN_W = 941;
var DESIGN_H = 1672;
// Canvas 设计分辨率
var CANVAS_W = 750;
var CANVAS_H = 1334;
var MainController = /** @class */ (function (_super) {
    __extends(MainController, _super);
    function MainController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // --- 编辑器拖拽绑定 ---
        _this.staminaPanel = null;
        _this.currencyPanel = null;
        _this.logoTitle = null;
        _this.coreDisplay = null;
        _this.upgradeBtn = null;
        _this.coreBtn = null;
        _this.startBtn = null;
        _this.shopBtn = null;
        _this.staminaLabel = null;
        _this.currencyLabel = null;
        // --- 私有 ---
        _this._sp = {};
        return _this;
    }
    MainController.prototype.onLoad = function () {
        var _this = this;
        // 1. 同步加载配置（早于任何异步操作）
        Constants_1.loadConfig(require('config'));
        StateBridge_1.default.syncOldToNew();
        // 2. 异步加载贴图
        cc.loader.loadResDir('textures/main', cc.SpriteFrame, function (err, frames) {
            if (err) {
                cc.error('[Main] 贴图加载失败', err);
                return;
            }
            frames.forEach(function (f) { _this._sp[f.name] = f; });
            _this._applyAssets();
            _this._refresh();
        });
        // 3. 绑定按钮事件
        this._bindButtons();
    };
    // ---- 私有方法 ----
    MainController.prototype._applyAssets = function () {
        this._setSp(this.staminaPanel, 'ui_1');
        this._setSp(this.currencyPanel, 'ui_2');
        this._setSp(this.logoTitle, 'ui_3');
        this._setSp(this.coreDisplay, 'ui_4');
        this._setSp(this.upgradeBtn, 'ui_5');
        this._setSp(this.coreBtn, 'ui_6');
        this._setSp(this.startBtn, 'ui_7');
        this._setSp(this.shopBtn, 'ui_8');
    };
    MainController.prototype._setSp = function (node, key) {
        if (!node || !this._sp[key])
            return;
        var s = node.getComponent(cc.Sprite);
        if (!s)
            s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    };
    MainController.prototype._refresh = function () {
        this._refreshStamina();
        this._refreshCurrency();
    };
    MainController.prototype._refreshStamina = function () {
        if (this.staminaLabel) {
            this.staminaLabel.string = GameState_1.default.stamina + "/" + Constants_1.CFG.stamina.max;
        }
    };
    MainController.prototype._refreshCurrency = function () {
        if (this.currencyLabel) {
            // 千位分隔符格式，如 50,000
            var n = GameState_1.default.shenpo;
            var s = '';
            var str = String(n);
            for (var i = 0; i < str.length; i++) {
                if (i > 0 && (str.length - i) % 3 === 0)
                    s += ',';
                s += str[i];
            }
            this.currencyLabel.string = s;
        }
    };
    MainController.prototype._bindButtons = function () {
        this._addTap(this.startBtn, this._onStartBtn.bind(this));
        this._addTap(this.upgradeBtn, this._onUpgradeBtn.bind(this));
        this._addTap(this.coreBtn, this._onCoreBtn.bind(this));
        this._addTap(this.shopBtn, this._onShopBtn.bind(this));
    };
    MainController.prototype._addTap = function (node, cb) {
        if (!node)
            return;
        node.on(cc.Node.EventType.TOUCH_END, cb, this);
    };
    MainController.prototype._onStartBtn = function () {
        cc.tween(this.startBtn)
            .to(0.05, { scale: 0.9 })
            .to(0.05, { scale: 1.0 })
            .call(function () {
            StateBridge_1.default.syncOldToNew();
            if (StateBridge_1.default.consumeStamina()) {
                cc.director.loadScene(Constants_1.Scene.Youxi);
            }
            else {
                cc.log('[Main] 体力不足，无法开始游戏。');
            }
        })
            .start();
    };
    MainController.prototype._onUpgradeBtn = function () {
        StateBridge_1.default.syncNewToOld();
        cc.director.loadScene(Constants_1.Scene.Upgrade);
    };
    MainController.prototype._onCoreBtn = function () {
        StateBridge_1.default.syncNewToOld();
        cc.director.loadScene(Constants_1.Scene.Upgrade);
    };
    MainController.prototype._onShopBtn = function () {
        // 商店界面（后续实现）
        cc.log('[Main] 商店按钮');
    };
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "staminaPanel", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "currencyPanel", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "logoTitle", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "coreDisplay", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "upgradeBtn", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "coreBtn", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "startBtn", void 0);
    __decorate([
        property(cc.Node)
    ], MainController.prototype, "shopBtn", void 0);
    __decorate([
        property(cc.Label)
    ], MainController.prototype, "staminaLabel", void 0);
    __decorate([
        property(cc.Label)
    ], MainController.prototype, "currencyLabel", void 0);
    MainController = __decorate([
        ccclass
    ], MainController);
    return MainController;
}(cc.Component));
exports.default = MainController;

cc._RF.pop();