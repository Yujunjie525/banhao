
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Load/TipsWnd.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcVGlwc1duZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ00sSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFFMUMsSUFBSSxHQUFHLENBQUM7QUFFUjtJQUE0QyxrQ0FBWTtJQUF4RDtRQUFBLHFFQStMQztRQTlMRyxPQUFPO1FBRVAsbUJBQWEsR0FBYyxJQUFJLENBQUM7UUFFaEMsT0FBTztRQUNQLHVCQUFpQixHQUFXLGNBQWMsQ0FBQztRQUUzQyxTQUFTO1FBQ1Qsa0JBQVksR0FBVyxPQUFPLENBQUM7UUFFL0IsV0FBVztRQUNILG9CQUFjLEdBQVksSUFBSSxDQUFDO1FBRXZDLFVBQVU7UUFDRixlQUFTLEdBQVksS0FBSyxDQUFDO1FBRW5DLFNBQVM7UUFDRCxlQUFTLEdBQVEsQ0FBQyxDQUFDLENBQUM7O0lBNktoQyxDQUFDO0lBM0tVLHFCQUFNLEdBQWI7UUFDSSxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCwrQkFBTSxHQUFOO1FBQ0ksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNYLDBCQUEwQjtRQUMxQix5Q0FBeUM7SUFDN0MsQ0FBQztJQUVELDhCQUFLLEdBQUw7SUFDQSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDZCQUFJLEdBQUosVUFBSyxPQUFlLEVBQUUsUUFBb0I7UUFBMUMsaUJBbURDO1FBbkRxQix5QkFBQSxFQUFBLFlBQW9CO1FBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUM3QyxPQUFPO1NBQ1Y7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosWUFBWTtRQUNaLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekQsY0FBYztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4QyxVQUFVO1FBQ1YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLFVBQVU7UUFDVixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFbkMsYUFBYTtRQUNiLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVFLElBQUksUUFBUSxFQUFFO1lBQ1YsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7YUFDMUI7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO2FBQ3BFO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQW1CLElBQUksQ0FBQyxpQkFBaUIsK0JBQTRCLENBQUMsQ0FBQztTQUN2RjtRQUVELGVBQWU7UUFDZixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkUsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFpQixJQUFJLENBQUMsWUFBWSwrQkFBNEIsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsU0FBUztRQUNULElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBRXRCLG1CQUFtQjtRQUNuQixJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDZCxVQUFVO1lBQ1YsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLFNBQVM7WUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLENBQUMsRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdkI7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCw2QkFBSSxHQUFKO1FBQ0ksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLFlBQVk7WUFDWixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkUsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM5RDtZQUVELFFBQVE7WUFDUixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1NBQzlCO1FBRUQsUUFBUTtRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRXZCLE9BQU87UUFDUCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCwrQkFBTSxHQUFOLFVBQU8sT0FBZ0IsRUFBRSxRQUFvQjtRQUFwQix5QkFBQSxFQUFBLFlBQW9CO1FBQ3pDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjthQUFNLElBQUksT0FBTyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssdUNBQWMsR0FBdEI7UUFDSSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDdkIsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxtQkFBSSxHQUFYLFVBQVksT0FBZSxFQUFFLFFBQW9CO1FBQXBCLHlCQUFBLEVBQUEsWUFBb0I7UUFDN0MsSUFBSSxHQUFHLEVBQUU7WUFDTCxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvQjthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksbUJBQUksR0FBWDtRQUNJLElBQUksR0FBRyxFQUFFO1lBQ0wsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2Q7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNoRDtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0kscUJBQU0sR0FBYixVQUFjLE9BQWdCLEVBQUUsUUFBb0I7UUFBcEIseUJBQUEsRUFBQSxZQUFvQjtRQUNoRCxJQUFJLEdBQUcsRUFBRTtZQUNMLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDaEQ7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksd0JBQVMsR0FBaEI7UUFDSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxrQ0FBUyxHQUFUO1FBQ0ksT0FBTztRQUNQLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV0QixRQUFRO1FBQ1IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosR0FBRyxHQUFHLElBQUksQ0FBQztJQUNmLENBQUM7SUEzTEQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzt5REFDWTtJQUhmLGNBQWM7UUFEbEMsT0FBTztPQUNhLGNBQWMsQ0ErTGxDO0lBQUQscUJBQUM7Q0EvTEQsQUErTEMsQ0EvTDJDLEVBQUUsQ0FBQyxTQUFTLEdBK0x2RDtrQkEvTG9CLGNBQWMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG52YXIgaW5zO1xyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaXBzV25kTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICAvL+W8ueeql+mihOWItuS9k1xyXG4gICAgQHByb3BlcnR5KGNjLlByZWZhYilcclxuICAgIFRpcHNXbmRQcmVmYWI6IGNjLlByZWZhYiA9IG51bGw7XHJcbiAgICBcclxuICAgIC8v5paH5pys57uE5Lu25ZCNXHJcbiAgICB0ZXh0Q29tcG9uZW50TmFtZTogc3RyaW5nID0gXCJ0aXBzX2NvbnRlbnRcIjtcclxuICAgIFxyXG4gICAgLy/lhbPpl63mjInpkq7oioLngrnlkI1cclxuICAgIGNsb3NlQnRuTmFtZTogc3RyaW5nID0gXCJCdG5RUlwiO1xyXG4gICAgXHJcbiAgICAvL+W9k+WJjeaYvuekuueahOW8ueeql+iKgueCuVxyXG4gICAgcHJpdmF0ZSBjdXJyZW50V25kTm9kZTogY2MuTm9kZSA9IG51bGw7XHJcbiAgICBcclxuICAgIC8v5b2T5YmN5piv5ZCm5q2j5Zyo5pi+56S6XHJcbiAgICBwcml2YXRlIGlzU2hvd2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICAvL+iHquWKqOmakOiXj+WumuaXtuWZqFxyXG4gICAgcHJpdmF0ZSBoaWRlVGltZXI6IGFueSA9IC0xO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgR2V0SW5zKCl7XHJcbiAgICAgICAgcmV0dXJuIGlucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgb25Mb2FkICgpIHtcclxuICAgICAgICBpbnMgPSB0aGlzO1xyXG4gICAgICAgIC8v5bCG6IqC54K56K6+572u5Li65bi46am76IqC54K577yM56Gu5L+d5Zyo5Zy65pmv5YiH5o2i5pe25LiN5Lya6KKr6ZSA5q+BXHJcbiAgICAgICAgLy8gY2MuZ2FtZS5hZGRQZXJzaXN0Um9vdE5vZGUodGhpcy5ub2RlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhcnQgKCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQg6KaB5pi+56S655qE5paH5pys5YaF5a65XHJcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24g5pi+56S65pe26ZW/77yI56eS77yJ77yM6buY6K6kMuenku+8jDDooajnpLrkuI3oh6rliqjpmpDol49cclxuICAgICAqL1xyXG4gICAgc2hvdyhjb250ZW50OiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLlRpcHNXbmRQcmVmYWIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRpcHNQcmVmYWIgaXMgbm90IGFzc2lnbmVkIVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL+WmguaenOW9k+WJjeW3suacieW8ueeql+aYvuekuu+8jOWFiOmakOiXj1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8v5LuO6aKE5Yi25L2T5Yib5bu65by556qX6IqC54K5XHJcbiAgICAgICAgdGhpcy5jdXJyZW50V25kTm9kZSA9IGNjLmluc3RhbnRpYXRlKHRoaXMuVGlwc1duZFByZWZhYik7XHJcbiAgICAgICAgLy/lsIblvLnnqpfoioLngrnmt7vliqDliLDlvZPliY3oioLngrlcclxuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQodGhpcy5jdXJyZW50V25kTm9kZSk7XHJcbiAgICAgICAgLy/orr7nva7lvLnnqpfoioLngrnkvY3nva5cclxuICAgICAgICB0aGlzLmN1cnJlbnRXbmROb2RlLnNldFBvc2l0aW9uKDAsIDApO1xyXG4gICAgICAgIC8v6K6+572u5by556qX6IqC54K55bGC57qnXHJcbiAgICAgICAgdGhpcy5jdXJyZW50V25kTm9kZS56SW5kZXggPSAxMDAwMDtcclxuICAgICAgICBcclxuICAgICAgICAvL+afpeaJvuaWh+acrOe7hOS7tuW5tuiuvue9ruWGheWuuVxyXG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gdGhpcy5jdXJyZW50V25kTm9kZS5nZXRDaGlsZEJ5TmFtZSh0aGlzLnRleHRDb21wb25lbnROYW1lKTtcclxuICAgICAgICBpZiAodGV4dE5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSB0ZXh0Tm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUZXh0IGNvbXBvbmVudCBkb2VzIG5vdCBoYXZlIGNjLkxhYmVsIGNvbXBvbmVudCFcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFRleHQgY29tcG9uZW50ICcke3RoaXMudGV4dENvbXBvbmVudE5hbWV9JyBub3QgZm91bmQgaW4gVGlwc1ByZWZhYiFgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy/mn6Xmib7lhbPpl63mjInpkq7lubbmt7vliqDkuovku7bnm5HlkKxcclxuICAgICAgICBjb25zdCBjbG9zZUJ0biA9IHRoaXMuY3VycmVudFduZE5vZGUuZ2V0Q2hpbGRCeU5hbWUodGhpcy5jbG9zZUJ0bk5hbWUpO1xyXG4gICAgICAgIGlmIChjbG9zZUJ0bikge1xyXG4gICAgICAgICAgICBjbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMuaGlkZSwgdGhpcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDbG9zZSBidXR0b24gJyR7dGhpcy5jbG9zZUJ0bk5hbWV9JyBub3QgZm91bmQgaW4gVGlwc1ByZWZhYiFgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy/moIforrDkuLrmraPlnKjmmL7npLpcclxuICAgICAgICB0aGlzLmlzU2hvd2luZyA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy/lpoLmnpzorr7nva7kuoboh6rliqjpmpDol4/ml7bplb/vvIzlkK/liqjlrprml7blmahcclxuICAgICAgICBpZiAoZHVyYXRpb24gPiAwKSB7XHJcbiAgICAgICAgICAgIC8v5riF6Zmk5LmL5YmN55qE5a6a5pe25ZmoXHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJIaWRlVGltZXIoKTtcclxuICAgICAgICAgICAgLy/orr7nva7mlrDnmoTlrprml7blmahcclxuICAgICAgICAgICAgdGhpcy5oaWRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9LCBkdXJhdGlvbiAqIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol4/lvLnnqpdcclxuICAgICAqL1xyXG4gICAgaGlkZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50V25kTm9kZSkge1xyXG4gICAgICAgICAgICAvL+enu+mZpOWFs+mXreaMiemSruS6i+S7tuebkeWQrFxyXG4gICAgICAgICAgICBjb25zdCBjbG9zZUJ0biA9IHRoaXMuY3VycmVudFduZE5vZGUuZ2V0Q2hpbGRCeU5hbWUodGhpcy5jbG9zZUJ0bk5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VCdG4pIHtcclxuICAgICAgICAgICAgICAgIGNsb3NlQnRuLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMuaGlkZSwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8v6ZSA5q+B5by556qX6IqC54K5XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFduZE5vZGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRXbmROb2RlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy/moIforrDkuLrmnKrmmL7npLpcclxuICAgICAgICB0aGlzLmlzU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8v5riF6Zmk5a6a5pe25ZmoXHJcbiAgICAgICAgdGhpcy5jbGVhckhpZGVUaW1lcigpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWIh+aNouW8ueeql+aYvuekuueKtuaAgVxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQg6KaB5pi+56S655qE5paH5pys5YaF5a6577yM5aaC5p6c5LiN5o+Q5L6b5YiZ5Y+q5YiH5o2i5pi+56S654q25oCBXHJcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24g5pi+56S65pe26ZW/77yI56eS77yJ77yM6buY6K6kMuenklxyXG4gICAgICovXHJcbiAgICB0b2dnbGUoY29udGVudD86IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDApIHtcclxuICAgICAgICBpZiAodGhpcy5pc1Nob3dpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdyhjb250ZW50LCBkdXJhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOa4hemZpOiHquWKqOmakOiXj+WumuaXtuWZqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNsZWFySGlkZVRpbWVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhpZGVUaW1lciAhPT0gLTEpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGlkZVRpbWVyKTtcclxuICAgICAgICAgICAgdGhpcy5oaWRlVGltZXIgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5YWo5bGA6Z2Z5oCB5pa55rOV77yM5pa55L6/5YW25LuW57G755u05o6l6LCD55SoXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCDopoHmmL7npLrnmoTmlofmnKzlhoXlrrlcclxuICAgICAqIEBwYXJhbSBkdXJhdGlvbiDmmL7npLrml7bplb/vvIjnp5LvvInvvIzpu5jorqQy56eSXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzaG93KGNvbnRlbnQ6IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDApIHtcclxuICAgICAgICBpZiAoaW5zKSB7XHJcbiAgICAgICAgICAgIGlucy5zaG93KGNvbnRlbnQsIGR1cmF0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGlwc1duZCBpbnN0YW5jZSBub3QgZm91bmQhXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlhajlsYDpnZnmgIHmlrnms5XvvIzmlrnkvr/lhbbku5bnsbvnm7TmjqXosIPnlKhcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGhpZGUoKSB7XHJcbiAgICAgICAgaWYgKGlucykge1xyXG4gICAgICAgICAgICBpbnMuaGlkZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaXBzV25kIGluc3RhbmNlIG5vdCBmb3VuZCFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWFqOWxgOmdmeaAgeaWueazle+8jOaWueS+v+WFtuS7luexu+ebtOaOpeiwg+eUqFxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQg6KaB5pi+56S655qE5paH5pys5YaF5a6577yM5aaC5p6c5LiN5o+Q5L6b5YiZ5Y+q5YiH5o2i5pi+56S654q25oCBXHJcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24g5pi+56S65pe26ZW/77yI56eS77yJ77yM6buY6K6kMuenklxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdG9nZ2xlKGNvbnRlbnQ/OiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgaWYgKGlucykge1xyXG4gICAgICAgICAgICBpbnMudG9nZ2xlKGNvbnRlbnQsIGR1cmF0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGlwc1duZCBpbnN0YW5jZSBub3QgZm91bmQhXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XlvLnnqpfmmK/lkKbmraPlnKjmmL7npLpcclxuICAgICAqIEByZXR1cm5zIOaYr+WQpuato+WcqOaYvuekulxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBpbnMgPyBpbnMuaXNTaG93aW5nIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG9uRGVzdHJveSgpIHtcclxuICAgICAgICAvL+a4hemZpOWumuaXtuWZqFxyXG4gICAgICAgIHRoaXMuY2xlYXJIaWRlVGltZXIoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL+makOiXj+W9k+WJjeW8ueeql1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlucyA9IG51bGw7XHJcbiAgICB9XHJcbn0iXX0=