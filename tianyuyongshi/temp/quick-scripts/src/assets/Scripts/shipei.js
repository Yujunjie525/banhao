"use strict";
cc._RF.push(module, '2f585qgoqtG9oX+jsJRzCF3', 'shipei');
// Scripts/shipei.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var shipei = /** @class */ (function (_super) {
    __extends(shipei, _super);
    function shipei() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    shipei.prototype.onLoad = function () {
        this.resetSize(this.node);
    };
    shipei.prototype.start = function () {
    };
    /** 调整屏幕适配 */
    shipei.prototype.adjust_screen = function () {
        // 注意cc.winSize只有在适配后(修改fitHeight/fitWidth后)才能获取到正确的值,因此使用cc.getFrameSize()来获取初始的屏幕大小
        var screen_size = cc.view.getFrameSize().width / cc.view.getFrameSize().height;
        var design_size = cc.Canvas.instance.designResolution.width / cc.Canvas.instance.designResolution.height;
        var f = screen_size >= design_size;
        cc.Canvas.instance.fitHeight = f;
        cc.Canvas.instance.fitWidth = !f;
    };
    shipei.prototype.resetSize = function (cav) {
        var frameSize = cc.view.getFrameSize();
        var designSize = cc.view.getDesignResolutionSize();
        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        // this.fitScreen(cav, designSize);
    };
    /**
  * 背景适配
  * @param canvasnode
  * @param designSize
  */
    shipei.prototype.fitScreen = function (canvasnode, designSize) {
        var scaleW = canvasnode.width / designSize.width;
        var scaleH = canvasnode.height / designSize.height;
        var bgNode = canvasnode.getChildByName('background');
        var bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    };
    shipei = __decorate([
        ccclass
    ], shipei);
    return shipei;
}(cc.Component));
exports.default = shipei;

cc._RF.pop();