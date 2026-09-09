"use strict";
cc._RF.push(module, 'c694cfwI3JOd63BekndxUq7', 'TipsWnd');
// Scripts/Load/TipsWnd.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ins;
var TipsWndManager = /** @class */ (function (_super) {
    __extends(TipsWndManager, _super);
    function TipsWndManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //弹窗预制体
        _this.TipsWndPrefab = null;
        //文本组件名
        _this.textComponentName = "tips_content";
        //关闭按钮节点名
        _this.closeBtnName = "BtnQR";
        //当前显示的弹窗节点
        _this.currentWndNode = null;
        //当前是否正在显示
        _this.isShowing = false;
        //自动隐藏定时器
        _this.hideTimer = -1;
        return _this;
    }
    TipsWndManager.GetIns = function () {
        return ins;
    };
    TipsWndManager.prototype.onLoad = function () {
        ins = this;
        //将节点设置为常驻节点，确保在场景切换时不会被销毁
        // cc.game.addPersistRootNode(this.node);
    };
    TipsWndManager.prototype.start = function () {
    };
    /**
     * 显示弹窗
     * @param content 要显示的文本内容
     * @param duration 显示时长（秒），默认2秒，0表示不自动隐藏
     */
    TipsWndManager.prototype.show = function (content, duration) {
        var _this = this;
        if (duration === void 0) { duration = 0; }
        if (!this.TipsWndPrefab) {
            console.error("TipsPrefab is not assigned!");
            return;
        }
        //如果当前已有弹窗显示，先隐藏
        this.hide();
        //从预制体创建弹窗节点
        this.currentWndNode = cc.instantiate(this.TipsWndPrefab);
        //将弹窗节点添加到当前节点
        this.node.addChild(this.currentWndNode);
        //设置弹窗节点位置
        this.currentWndNode.setPosition(0, 0);
        //设置弹窗节点层级
        this.currentWndNode.zIndex = 10000;
        //查找文本组件并设置内容
        var textNode = this.currentWndNode.getChildByName(this.textComponentName);
        if (textNode) {
            var label = textNode.getComponent(cc.Label);
            if (label) {
                label.string = content;
            }
            else {
                console.warn("Text component does not have cc.Label component!");
            }
        }
        else {
            console.warn("Text component '" + this.textComponentName + "' not found in TipsPrefab!");
        }
        //查找关闭按钮并添加事件监听
        var closeBtn = this.currentWndNode.getChildByName(this.closeBtnName);
        if (closeBtn) {
            closeBtn.on(cc.Node.EventType.TOUCH_END, this.hide, this);
        }
        else {
            console.warn("Close button '" + this.closeBtnName + "' not found in TipsPrefab!");
        }
        //标记为正在显示
        this.isShowing = true;
        //如果设置了自动隐藏时长，启动定时器
        if (duration > 0) {
            //清除之前的定时器
            this.clearHideTimer();
            //设置新的定时器
            this.hideTimer = setTimeout(function () {
                _this.hide();
            }, duration * 1000);
        }
    };
    /**
     * 隐藏弹窗
     */
    TipsWndManager.prototype.hide = function () {
        if (this.currentWndNode) {
            //移除关闭按钮事件监听
            var closeBtn = this.currentWndNode.getChildByName(this.closeBtnName);
            if (closeBtn) {
                closeBtn.off(cc.Node.EventType.TOUCH_END, this.hide, this);
            }
            //销毁弹窗节点
            this.currentWndNode.destroy();
            this.currentWndNode = null;
        }
        //标记为未显示
        this.isShowing = false;
        //清除定时器
        this.clearHideTimer();
    };
    /**
     * 切换弹窗显示状态
     * @param content 要显示的文本内容，如果不提供则只切换显示状态
     * @param duration 显示时长（秒），默认2秒
     */
    TipsWndManager.prototype.toggle = function (content, duration) {
        if (duration === void 0) { duration = 0; }
        if (this.isShowing) {
            this.hide();
        }
        else if (content) {
            this.show(content, duration);
        }
    };
    /**
     * 清除自动隐藏定时器
     */
    TipsWndManager.prototype.clearHideTimer = function () {
        if (this.hideTimer !== -1) {
            clearTimeout(this.hideTimer);
            this.hideTimer = -1;
        }
    };
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content 要显示的文本内容
     * @param duration 显示时长（秒），默认2秒
     */
    TipsWndManager.show = function (content, duration) {
        if (duration === void 0) { duration = 0; }
        if (ins) {
            ins.show(content, duration);
        }
        else {
            console.error("TipsWnd instance not found!");
        }
    };
    /**
     * 全局静态方法，方便其他类直接调用
     */
    TipsWndManager.hide = function () {
        if (ins) {
            ins.hide();
        }
        else {
            console.error("TipsWnd instance not found!");
        }
    };
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content 要显示的文本内容，如果不提供则只切换显示状态
     * @param duration 显示时长（秒），默认2秒
     */
    TipsWndManager.toggle = function (content, duration) {
        if (duration === void 0) { duration = 0; }
        if (ins) {
            ins.toggle(content, duration);
        }
        else {
            console.error("TipsWnd instance not found!");
        }
    };
    /**
     * 检查弹窗是否正在显示
     * @returns 是否正在显示
     */
    TipsWndManager.isVisible = function () {
        return ins ? ins.isShowing : false;
    };
    TipsWndManager.prototype.onDestroy = function () {
        //清除定时器
        this.clearHideTimer();
        //隐藏当前弹窗
        this.hide();
        ins = null;
    };
    __decorate([
        property(cc.Prefab)
    ], TipsWndManager.prototype, "TipsWndPrefab", void 0);
    TipsWndManager = __decorate([
        ccclass
    ], TipsWndManager);
    return TipsWndManager;
}(cc.Component));
exports.default = TipsWndManager;

cc._RF.pop();