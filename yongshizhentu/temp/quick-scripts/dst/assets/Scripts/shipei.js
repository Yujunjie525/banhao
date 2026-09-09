
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/shipei.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcc2hpcGVpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTSxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUcxQztJQUFvQywwQkFBWTtJQUFoRDs7SUF3REEsQ0FBQztJQXJERSx1QkFBTSxHQUFOO1FBQ0QsSUFBSSxDQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVBLHNCQUFLLEdBQUw7SUFFQSxDQUFDO0lBQ0ssYUFBYTtJQUNMLDhCQUFhLEdBQXJCO1FBQ0UscUZBQXFGO1FBQ3JGLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFBO1FBQzlFLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUE7UUFDeEcsSUFBSSxDQUFDLEdBQUcsV0FBVyxJQUFJLFdBQVcsQ0FBQTtRQUNsQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO1FBQ2hDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBR0QsMEJBQVMsR0FBVCxVQUFVLEdBQUc7UUFDVCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUVuRCxJQUFJLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDM0UsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNuRSxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqRjthQUFNO1lBQ0gsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDbkUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqRjtRQUNGLG1DQUFtQztJQUN0QyxDQUFDO0lBQ0Y7Ozs7SUFJQTtJQUNILDBCQUFTLEdBQVQsVUFBVSxVQUFVLEVBQUUsVUFBVTtRQUM1QixJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDakQsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBRW5ELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1FBQ3pCLElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRTtZQUNqQixPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQXREZ0IsTUFBTTtRQUQxQixPQUFPO09BQ2EsTUFBTSxDQXdEMUI7SUFBRCxhQUFDO0NBeERELEFBd0RDLENBeERtQyxFQUFFLENBQUMsU0FBUyxHQXdEL0M7a0JBeERvQixNQUFNIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG5jb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHNoaXBlaSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcblxyXG5cclxuICAgb25Mb2FkICgpIHtcclxuICB0aGlzLiAgcmVzZXRTaXplKHRoaXMubm9kZSlcclxuICAgfVxyXG5cclxuICAgIHN0YXJ0ICgpIHtcclxuXHJcbiAgICB9XHJcbiAgICAgICAgICAvKiog6LCD5pW05bGP5bmV6YCC6YWNICovXHJcbiAgICAgICAgICBwcml2YXRlIGFkanVzdF9zY3JlZW4oKSB7XHJcbiAgICAgICAgICAgIC8vIOazqOaEj2NjLndpblNpemXlj6rmnInlnKjpgILphY3lkI4o5L+u5pS5Zml0SGVpZ2h0L2ZpdFdpZHRo5ZCOKeaJjeiDveiOt+WPluWIsOato+ehrueahOWAvCzlm6DmraTkvb/nlKhjYy5nZXRGcmFtZVNpemUoKeadpeiOt+WPluWIneWni+eahOWxj+W5leWkp+Wwj1xyXG4gICAgICAgICAgICBsZXQgc2NyZWVuX3NpemUgPSBjYy52aWV3LmdldEZyYW1lU2l6ZSgpLndpZHRoIC8gY2Mudmlldy5nZXRGcmFtZVNpemUoKS5oZWlnaHRcclxuICAgICAgICAgICAgbGV0IGRlc2lnbl9zaXplID0gY2MuQ2FudmFzLmluc3RhbmNlLmRlc2lnblJlc29sdXRpb24ud2lkdGggLyBjYy5DYW52YXMuaW5zdGFuY2UuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHRcclxuICAgICAgICAgICAgbGV0IGYgPSBzY3JlZW5fc2l6ZSA+PSBkZXNpZ25fc2l6ZVxyXG4gICAgICAgICAgICBjYy5DYW52YXMuaW5zdGFuY2UuZml0SGVpZ2h0ID0gZlxyXG4gICAgICAgICAgICBjYy5DYW52YXMuaW5zdGFuY2UuZml0V2lkdGggPSAhZlxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHJlc2V0U2l6ZShjYXYpIHtcclxuICAgICAgICAgICAgbGV0IGZyYW1lU2l6ZSA9IGNjLnZpZXcuZ2V0RnJhbWVTaXplKCk7XHJcbiAgICAgICAgICAgIGxldCBkZXNpZ25TaXplID0gY2Mudmlldy5nZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgpO1xyXG4gICAgXHJcbiAgICAgICAgICAgIGlmIChmcmFtZVNpemUud2lkdGggLyBmcmFtZVNpemUuaGVpZ2h0ID4gZGVzaWduU2l6ZS53aWR0aCAvIGRlc2lnblNpemUuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBjYXYud2lkdGggPSBkZXNpZ25TaXplLmhlaWdodCAqIGZyYW1lU2l6ZS53aWR0aCAvIGZyYW1lU2l6ZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBjYXYuaGVpZ2h0ID0gZGVzaWduU2l6ZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBjYXYuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykuZGVzaWduUmVzb2x1dGlvbiA9IGNjLnNpemUoY2F2LndpZHRoLCBjYXYuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNhdi53aWR0aCA9IGRlc2lnblNpemUud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjYXYuaGVpZ2h0ID0gZGVzaWduU2l6ZS53aWR0aCAqIGZyYW1lU2l6ZS5oZWlnaHQgLyBmcmFtZVNpemUud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjYXYuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykuZGVzaWduUmVzb2x1dGlvbiA9IGNjLnNpemUoY2F2LndpZHRoLCBjYXYuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIC8vIHRoaXMuZml0U2NyZWVuKGNhdiwgZGVzaWduU2l6ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgLyoqXHJcbiAgICAgKiDog4zmma/pgILphY1cclxuICAgICAqIEBwYXJhbSBjYW52YXNub2RlIFxyXG4gICAgICogQHBhcmFtIGRlc2lnblNpemUgXHJcbiAgICAgKi9cclxuICAgIGZpdFNjcmVlbihjYW52YXNub2RlLCBkZXNpZ25TaXplKSB7XHJcbiAgICAgICAgbGV0IHNjYWxlVyA9IGNhbnZhc25vZGUud2lkdGggLyBkZXNpZ25TaXplLndpZHRoO1xyXG4gICAgICAgIGxldCBzY2FsZUggPSBjYW52YXNub2RlLmhlaWdodCAvIGRlc2lnblNpemUuaGVpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgYmdOb2RlID0gY2FudmFzbm9kZS5nZXRDaGlsZEJ5TmFtZSgnYmFja2dyb3VuZCcpO1xyXG4gICAgICAgIGxldCBiZ1NjYWxlID0gY2FudmFzbm9kZS5oZWlnaHQgLyBiZ05vZGUuaGVpZ2h0O1xyXG4gICAgICAgIGJnTm9kZS53aWR0aCAqPSBiZ1NjYWxlO1xyXG4gICAgICAgIGJnTm9kZS5oZWlnaHQgKj0gYmdTY2FsZTtcclxuICAgICAgICBpZiAoc2NhbGVXID4gc2NhbGVIKSB7XHJcbiAgICAgICAgICAgIGJnU2NhbGUgPSBjYW52YXNub2RlLndpZHRoIC8gYmdOb2RlLndpZHRoO1xyXG4gICAgICAgICAgICBiZ05vZGUud2lkdGggKj0gYmdTY2FsZTtcclxuICAgICAgICAgICAgYmdOb2RlLmhlaWdodCAqPSBiZ1NjYWxlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XHJcbn1cclxuIl19