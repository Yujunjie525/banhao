
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/MainController.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXE1haW5Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBcUQ7QUFDckQseUNBQW9DO0FBQ3BDLDZDQUF3QztBQUVsQyxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxzQ0FBc0M7QUFDdEMsSUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUN0QixlQUFlO0FBQ2YsSUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUd0QjtJQUE0QyxrQ0FBWTtJQUF4RDtRQUFBLHFFQTJJQztRQXpJRyxrQkFBa0I7UUFFbEIsa0JBQVksR0FBWSxJQUFJLENBQUM7UUFHN0IsbUJBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUcxQixpQkFBVyxHQUFZLElBQUksQ0FBQztRQUc1QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUczQixhQUFPLEdBQVksSUFBSSxDQUFDO1FBR3hCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsYUFBTyxHQUFZLElBQUksQ0FBQztRQUd4QixrQkFBWSxHQUFhLElBQUksQ0FBQztRQUc5QixtQkFBYSxHQUFhLElBQUksQ0FBQztRQUUvQixhQUFhO1FBQ0wsU0FBRyxHQUFzQyxFQUFFLENBQUM7O0lBeUd4RCxDQUFDO0lBeEdHLCtCQUFNLEdBQU47UUFBQSxpQkFlQztRQWRHLHNCQUFzQjtRQUN0QixzQkFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlCLHFCQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFM0IsWUFBWTtRQUNaLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFB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USxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ007SUFHeEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNNO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7d0RBQ1c7SUFHOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt5REFDWTtJQS9CZCxjQUFjO1FBRGxDLE9BQU87T0FDYSxjQUFjLENBMklsQztJQUFELHFCQUFDO0NBM0lELEFBMklDLENBM0kyQyxFQUFFLENBQUMsU0FBUyxHQTJJdkQ7a0JBM0lvQixjQUFjIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZENvbmZpZywgQ0ZHLCBTY2VuZSB9IGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBHYW1lU3RhdGUgZnJvbSAnLi9HYW1lU3RhdGUnO1xuaW1wb3J0IFN0YXRlQnJpZGdlIGZyb20gJy4vU3RhdGVCcmlkZ2UnO1xuXHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG4vLyDorr7orqHnqL/lsLrlr7jvvIjkuI4gZGF0YS5qc29uIG9yaWdpbmFsX3NpemUg5LiA6Ie077yJXHJcbmNvbnN0IERFU0lHTl9XID0gOTQxO1xyXG5jb25zdCBERVNJR05fSCA9IDE2NzI7XHJcbi8vIENhbnZhcyDorr7orqHliIbovqjnjodcclxuY29uc3QgQ0FOVkFTX1cgPSA3NTA7XHJcbmNvbnN0IENBTlZBU19IID0gMTMzNDtcclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW5Db250cm9sbGVyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuXHJcbiAgICAvLyAtLS0g57yW6L6R5Zmo5ouW5ou957uR5a6aIC0tLVxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzdGFtaW5hUGFuZWw6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgY3VycmVuY3lQYW5lbDogY2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBsb2dvVGl0bGU6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgY29yZURpc3BsYXk6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgdXBncmFkZUJ0bjogY2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBjb3JlQnRuOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHN0YXJ0QnRuOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHNob3BCdG46IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIHN0YW1pbmFMYWJlbDogY2MuTGFiZWwgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIGN1cnJlbmN5TGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcclxuXHJcbiAgICAvLyAtLS0g56eB5pyJIC0tLVxyXG4gICAgcHJpdmF0ZSBfc3A6IHsgW2tleTogc3RyaW5nXTogY2MuU3ByaXRlRnJhbWUgfSA9IHt9O1xyXG4gICAgb25Mb2FkKCkge1xuICAgICAgICAvLyAxLiDlkIzmraXliqDovb3phY3nva7vvIjml6nkuo7ku7vkvZXlvILmraXmk43kvZzvvIlcbiAgICAgICAgbG9hZENvbmZpZyhyZXF1aXJlKCdjb25maWcnKSk7XG4gICAgICAgIFN0YXRlQnJpZGdlLnN5bmNPbGRUb05ldygpO1xuXHJcbiAgICAgICAgLy8gMi4g5byC5q2l5Yqg6L296LS05Zu+XHJcbiAgICAgICAgY2MubG9hZGVyLmxvYWRSZXNEaXIoJ3RleHR1cmVzL21haW4nLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogYW55LCBmcmFtZXM6IGNjLlNwcml0ZUZyYW1lW10pID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycikgeyBjYy5lcnJvcignW01haW5dIOi0tOWbvuWKoOi9veWksei0pScsIGVycik7IHJldHVybjsgfVxyXG4gICAgICAgICAgICBmcmFtZXMuZm9yRWFjaChmID0+IHsgdGhpcy5fc3BbZi5uYW1lXSA9IGY7IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9hcHBseUFzc2V0cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIDMuIOe7keWumuaMiemSruS6i+S7tlxyXG4gICAgICAgIHRoaXMuX2JpbmRCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLSDnp4HmnInmlrnms5UgLS0tLVxyXG5cclxuICAgIHByaXZhdGUgX2FwcGx5QXNzZXRzKCkge1xyXG4gICAgICAgIHRoaXMuX3NldFNwKHRoaXMuc3RhbWluYVBhbmVsLCAgJ3VpXzEnKTtcclxuICAgICAgICB0aGlzLl9zZXRTcCh0aGlzLmN1cnJlbmN5UGFuZWwsICd1aV8yJyk7XHJcbiAgICAgICAgdGhpcy5fc2V0U3AodGhpcy5sb2dvVGl0bGUsICAgICAndWlfMycpO1xyXG4gICAgICAgIHRoaXMuX3NldFNwKHRoaXMuY29yZURpc3BsYXksICAgJ3VpXzQnKTtcclxuICAgICAgICB0aGlzLl9zZXRTcCh0aGlzLnVwZ3JhZGVCdG4sICAgICd1aV81Jyk7XHJcbiAgICAgICAgdGhpcy5fc2V0U3AodGhpcy5jb3JlQnRuLCAgICAgICAndWlfNicpO1xyXG4gICAgICAgIHRoaXMuX3NldFNwKHRoaXMuc3RhcnRCdG4sICAgICAgJ3VpXzcnKTtcclxuICAgICAgICB0aGlzLl9zZXRTcCh0aGlzLnNob3BCdG4sICAgICAgICd1aV84Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0U3Aobm9kZTogY2MuTm9kZSwga2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgIXRoaXMuX3NwW2tleV0pIHJldHVybjtcclxuICAgICAgICBsZXQgcyA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgaWYgKCFzKSBzID0gbm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcclxuICAgICAgICBzLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuICAgICAgICBzLnNwcml0ZUZyYW1lID0gdGhpcy5fc3Bba2V5XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoKCkge1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTdGFtaW5hKCk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaEN1cnJlbmN5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaFN0YW1pbmEoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhbWluYUxhYmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhbWluYUxhYmVsLnN0cmluZyA9IGAke0dhbWVTdGF0ZS5zdGFtaW5hfS8ke0NGRy5zdGFtaW5hLm1heH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoQ3VycmVuY3koKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVuY3lMYWJlbCkge1xyXG4gICAgICAgICAgICAvLyDljYPkvY3liIbpmpTnrKbmoLzlvI/vvIzlpoIgNTAsMDAwXHJcbiAgICAgICAgICAgIGNvbnN0IG4gPSBHYW1lU3RhdGUuc2hlbnBvO1xyXG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBzdHIgPSBTdHJpbmcobik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA+IDAgJiYgKHN0ci5sZW5ndGggLSBpKSAlIDMgPT09IDApIHMgKz0gJywnO1xyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW5jeUxhYmVsLnN0cmluZyA9IHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2JpbmRCdXR0b25zKCkge1xyXG4gICAgICAgIHRoaXMuX2FkZFRhcCh0aGlzLnN0YXJ0QnRuLCAgIHRoaXMuX29uU3RhcnRCdG4uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fYWRkVGFwKHRoaXMudXBncmFkZUJ0biwgdGhpcy5fb25VcGdyYWRlQnRuLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuX2FkZFRhcCh0aGlzLmNvcmVCdG4sICAgIHRoaXMuX29uQ29yZUJ0bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9hZGRUYXAodGhpcy5zaG9wQnRuLCAgICB0aGlzLl9vblNob3BCdG4uYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVGFwKG5vZGU6IGNjLk5vZGUsIGNiOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm47XHJcbiAgICAgICAgbm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGNiLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9vblN0YXJ0QnRuKCkge1xuICAgICAgICBjYy50d2Vlbih0aGlzLnN0YXJ0QnRuKVxuICAgICAgICAgICAgLnRvKDAuMDUsIHsgc2NhbGU6IDAuOSB9KVxuICAgICAgICAgICAgLnRvKDAuMDUsIHsgc2NhbGU6IDEuMCB9KVxuICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIFN0YXRlQnJpZGdlLnN5bmNPbGRUb05ldygpO1xuICAgICAgICAgICAgICAgIGlmIChTdGF0ZUJyaWRnZS5jb25zdW1lU3RhbWluYSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShTY2VuZS5Zb3V4aSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2MubG9nKCdbTWFpbl0g5L2T5Yqb5LiN6Laz77yM5peg5rOV5byA5aeL5ri45oiP44CCJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29uVXBncmFkZUJ0bigpIHtcbiAgICAgICAgU3RhdGVCcmlkZ2Uuc3luY05ld1RvT2xkKCk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShTY2VuZS5VcGdyYWRlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkNvcmVCdG4oKSB7XG4gICAgICAgIFN0YXRlQnJpZGdlLnN5bmNOZXdUb09sZCgpO1xuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoU2NlbmUuVXBncmFkZSk7XG4gICAgfVxuXHJcbiAgICBwcml2YXRlIF9vblNob3BCdG4oKSB7XHJcbiAgICAgICAgLy8g5ZWG5bqX55WM6Z2i77yI5ZCO57ut5a6e546w77yJXHJcbiAgICAgICAgY2MubG9nKCdbTWFpbl0g5ZWG5bqX5oyJ6ZKuJyk7XHJcbiAgICB9XHJcbn1cclxuIl19