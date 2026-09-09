
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/FrameAnim.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'fff9bqLmFFGOY0yWNU1rBNI', 'FrameAnim');
// Scripts/Managers/FrameAnim.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var FrameAnim = /** @class */ (function (_super) {
    __extends(FrameAnim, _super);
    function FrameAnim() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.spriteFrames = [];
        _this.duration = 0.1;
        _this.node_scale = 1;
        // @property({tooltip:"缩放比例"})
        // spriteScale : number = 1;
        _this.loop = false;
        _this.playOnload = false;
        // 播放完后的回调函数
        _this.endFunc = null;
        // 动画播放的状态，正在播放还是停止
        _this.isPlaying = false;
        // 记录已经播放的时间
        _this.playTime = 0;
        _this.caller = null;
        return _this;
    }
    // public firstSpriteFrame:cc.SpriteFrame=null//起始的图片
    // private selfSprite:cc.SpriteFrame=null
    // private startScale=null;
    FrameAnim.prototype.onLoad = function () {
        // 获取当前动画组件挂载的节点上的Sprite组件，如果没有则添加
        this.sprite = this.node.getComponent(cc.Sprite);
        if (!this.sprite) {
            this.sprite = this.node.addComponent(cc.Sprite);
        }
        //    this.firstSpriteFrame= this.sprite.spriteFrame.clone()//把默认子弹图标记录进去
        //   console.log("子弹图标：",this.firstSpriteFrame);
        // 判断是否是预加载播放
        if (this.playOnload) {
            if (this.loop) {
                this.playLoop(); // 循环播放
            }
            else {
                this.playOnce(this.caller, null); // 只播放一次
            }
        }
    };
    // public setIsPlay(isPlay:boolean){
    //       if(isPlay){
    //           this.isPlaying=true
    //       }else{
    //           this.isPlaying=false
    //       }
    // }
    FrameAnim.prototype.playLoop = function () {
        this.initFrame(true, null);
    };
    FrameAnim.prototype.playOnce = function (endf, caller) {
        this.caller = caller;
        this.initFrame(false, endf);
    };
    FrameAnim.prototype.initFrame = function (loop, endf) {
        if (this.spriteFrames.length <= 0) {
            return;
        }
        this.isPlaying = true;
        this.playTime = 0;
        this.sprite.spriteFrame = this.spriteFrames[0];
        this.loop = loop;
        this.endFunc = endf;
    };
    FrameAnim.prototype.start = function () {
    };
    FrameAnim.prototype.update = function (dt) {
        if (!this.isPlaying) {
            return;
        }
        // 累计时间，通过时间计算应该取哪一张图片展示
        this.playTime += dt;
        var index = Math.floor(this.playTime / this.duration);
        this.node.scale = this.node_scale;
        if (this.loop) { // 循环播放
            if (index >= this.spriteFrames.length) {
                index -= this.spriteFrames.length;
                this.playTime -= (this.duration * this.spriteFrames.length);
            }
            this.sprite.spriteFrame = this.spriteFrames[index];
        }
        else { // 播放一次
            if (index >= this.spriteFrames.length) {
                this.isPlaying = false;
                // 如果有回调函数的处理，则调用回调函数
                if (this.endFunc) {
                    //   this.node.scale=this.startScale
                    this.endFunc.call(this.caller);
                }
            }
            else {
                this.sprite.spriteFrame = this.spriteFrames[index];
            }
        }
    };
    __decorate([
        property({ type: [cc.SpriteFrame], tooltip: "帧动画图片数组" })
    ], FrameAnim.prototype, "spriteFrames", void 0);
    __decorate([
        property({ tooltip: "每一帧的时长" })
    ], FrameAnim.prototype, "duration", void 0);
    __decorate([
        property({ tooltip: "动画缩放比例" })
    ], FrameAnim.prototype, "node_scale", void 0);
    __decorate([
        property({ tooltip: "是否循环播放" })
    ], FrameAnim.prototype, "loop", void 0);
    __decorate([
        property({ tooltip: "是否在加载的时候就开始播放" })
    ], FrameAnim.prototype, "playOnload", void 0);
    FrameAnim = __decorate([
        ccclass
    ], FrameAnim);
    return FrameAnim;
}(cc.Component));
exports.default = FrameAnim;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXEZyYW1lQW5pbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFHMUM7SUFBdUMsNkJBQVk7SUFBbkQ7UUFBQSxxRUE4SEM7UUEzSEcsa0JBQVksR0FBMkIsRUFBRSxDQUFDO1FBRzFDLGNBQVEsR0FBWSxHQUFHLENBQUM7UUFJeEIsZ0JBQVUsR0FBWSxDQUFDLENBQUM7UUFHeEIsOEJBQThCO1FBQzlCLDRCQUE0QjtRQUc1QixVQUFJLEdBQWEsS0FBSyxDQUFDO1FBR3ZCLGdCQUFVLEdBQWEsS0FBSyxDQUFDO1FBRTdCLFlBQVk7UUFDSixhQUFPLEdBQVMsSUFBSSxDQUFDO1FBRzdCLG1CQUFtQjtRQUNYLGVBQVMsR0FBYSxLQUFLLENBQUM7UUFDcEMsWUFBWTtRQUNKLGNBQVEsR0FBWSxDQUFDLENBQUM7UUFDdEIsWUFBTSxHQUFLLElBQUksQ0FBQTs7SUFnRzNCLENBQUM7SUE3RkMscURBQXFEO0lBRXBELHlDQUF5QztJQUV6QywyQkFBMkI7SUFFMUIsMEJBQU0sR0FBTjtRQUVJLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQztZQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ25EO1FBRUwseUVBQXlFO1FBQ3hFLGdEQUFnRDtRQUU3QyxhQUFhO1FBQ2IsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO1lBQ2YsSUFBRyxJQUFJLENBQUMsSUFBSSxFQUFDO2dCQUNULElBQUksQ0FB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USxDQUFDLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxDQUFDOytDQUNMO0lBSXhCO1FBREMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxDQUFDO2lEQUNMO0lBT3hCO1FBREMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxDQUFDOzJDQUNOO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxDQUFDO2lEQUNQO0lBcEJaLFNBQVM7UUFEN0IsT0FBTztPQUNhLFNBQVMsQ0E4SDdCO0lBQUQsZ0JBQUM7Q0E5SEQsQUE4SEMsQ0E5SHNDLEVBQUUsQ0FBQyxTQUFTLEdBOEhsRDtrQkE5SG9CLFNBQVMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZyYW1lQW5pbSBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcblxyXG4gICAgQHByb3BlcnR5KHt0eXBlOiBbY2MuU3ByaXRlRnJhbWVdLCB0b29sdGlwOlwi5bin5Yqo55S75Zu+54mH5pWw57uEXCJ9KVxyXG4gICAgc3ByaXRlRnJhbWVzIDogQXJyYXk8Y2MuU3ByaXRlRnJhbWU+ID0gW107XHJcblxyXG4gICAgQHByb3BlcnR5KHt0b29sdGlwOlwi5q+P5LiA5bin55qE5pe26ZW/XCJ9KVxyXG4gICAgZHVyYXRpb24gOiBudW1iZXIgPSAwLjE7XHJcblxyXG5cclxuICAgIEBwcm9wZXJ0eSh7dG9vbHRpcDpcIuWKqOeUu+e8qeaUvuavlOS+i1wifSlcclxuICAgIG5vZGVfc2NhbGUgOiBudW1iZXIgPSAxO1xyXG5cclxuXHJcbiAgICAvLyBAcHJvcGVydHkoe3Rvb2x0aXA6XCLnvKnmlL7mr5TkvotcIn0pXHJcbiAgICAvLyBzcHJpdGVTY2FsZSA6IG51bWJlciA9IDE7XHJcblxyXG4gICAgQHByb3BlcnR5KHt0b29sdGlwOlwi5piv5ZCm5b6q546v5pKt5pS+XCJ9KVxyXG4gICAgbG9vcCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KHt0b29sdGlwOlwi5piv5ZCm5Zyo5Yqg6L2955qE5pe25YCZ5bCx5byA5aeL5pKt5pS+XCJ9KVxyXG4gICAgcGxheU9ubG9hZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAvLyDmkq3mlL7lrozlkI7nmoTlm57osIPlh73mlbBcclxuICAgIHByaXZhdGUgZW5kRnVuYyA6IGFueSA9IG51bGw7XHJcbiAgICAvLyDliqjnlLvmkq3mlL7pnIDopoHnmoTnsr7ngbXnu4Tku7ZcclxuICAgIHByaXZhdGUgc3ByaXRlIDogY2MuU3ByaXRlO1xyXG4gICAgLy8g5Yqo55S75pKt5pS+55qE54q25oCB77yM5q2j5Zyo5pKt5pS+6L+Y5piv5YGc5q2iXHJcbiAgICBwcml2YXRlIGlzUGxheWluZyA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIC8vIOiusOW9leW3sue7j+aSreaUvueahOaXtumXtFxyXG4gICAgcHJpdmF0ZSBwbGF5VGltZSA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGNhbGxlcjphbnk9bnVsbFxyXG5cclxuXHJcbiAgLy8gcHVibGljIGZpcnN0U3ByaXRlRnJhbWU6Y2MuU3ByaXRlRnJhbWU9bnVsbC8v6LW35aeL55qE5Zu+54mHXHJcblxyXG4gICAvLyBwcml2YXRlIHNlbGZTcHJpdGU6Y2MuU3ByaXRlRnJhbWU9bnVsbFxyXG5cclxuICAgLy8gcHJpdmF0ZSBzdGFydFNjYWxlPW51bGw7XHJcblxyXG4gICAgb25Mb2FkICgpIHtcclxuXHJcbiAgICAgICAgLy8g6I635Y+W5b2T5YmN5Yqo55S757uE5Lu25oyC6L2955qE6IqC54K55LiK55qEU3ByaXRl57uE5Lu277yM5aaC5p6c5rKh5pyJ5YiZ5re75YqgXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgaWYoIXRoaXMuc3ByaXRlKXtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUgPSB0aGlzLm5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgLy8gICAgdGhpcy5maXJzdFNwcml0ZUZyYW1lPSB0aGlzLnNwcml0ZS5zcHJpdGVGcmFtZS5jbG9uZSgpLy/miorpu5jorqTlrZDlvLnlm77moIforrDlvZXov5vljrtcclxuICAgICAvLyAgIGNvbnNvbGUubG9nKFwi5a2Q5by55Zu+5qCH77yaXCIsdGhpcy5maXJzdFNwcml0ZUZyYW1lKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDliKTmlq3mmK/lkKbmmK/pooTliqDovb3mkq3mlL5cclxuICAgICAgICBpZih0aGlzLnBsYXlPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLmxvb3Ape1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5TG9vcCgpOyAgICAgICAgLy8g5b6q546v5pKt5pS+XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5T25jZSh0aGlzLmNhbGxlcixudWxsKTsgICAgLy8g5Y+q5pKt5pS+5LiA5qyhXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBwdWJsaWMgc2V0SXNQbGF5KGlzUGxheTpib29sZWFuKXtcclxuICAgIC8vICAgICAgIGlmKGlzUGxheSl7XHJcbiAgICAvLyAgICAgICAgICAgdGhpcy5pc1BsYXlpbmc9dHJ1ZVxyXG4gICAgLy8gICAgICAgfWVsc2V7XHJcbiAgICAvLyAgICAgICAgICAgdGhpcy5pc1BsYXlpbmc9ZmFsc2VcclxuICAgIC8vICAgICAgIH1cclxuICAgIC8vIH1cclxuXHJcblxyXG4gICAgcHVibGljIHBsYXlMb29wKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmluaXRGcmFtZSh0cnVlLCBudWxsKTtcclxuICAgIH0gICBcclxuXHJcbiAgICBwdWJsaWMgcGxheU9uY2UoZW5kZiA6IGFueSxjYWxsZXI/OmFueSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNhbGxlcj1jYWxsZXJcclxuICAgICAgICB0aGlzLmluaXRGcmFtZShmYWxzZSwgZW5kZik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0RnJhbWUobG9vcDpib29sZWFuLCBlbmRmIDogYW55KSA6IHZvaWR7XHJcbiAgICAgICAgaWYodGhpcy5zcHJpdGVGcmFtZXMubGVuZ3RoIDw9IDApe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnBsYXlUaW1lID0gMDtcclxuICAgICAgICB0aGlzLnNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuc3ByaXRlRnJhbWVzWzBdO1xyXG4gICAgICAgIHRoaXMubG9vcCA9IGxvb3A7XHJcbiAgICAgICAgdGhpcy5lbmRGdW5jID0gZW5kZjtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCAoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoZHQpIHtcclxuICAgXHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmlzUGxheWluZyl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOe0r+iuoeaXtumXtO+8jOmAmui/h+aXtumXtOiuoeeul+W6lOivpeWPluWTquS4gOW8oOWbvueJh+WxleekulxyXG4gICAgICAgIHRoaXMucGxheVRpbWUgKz0gZHQ7XHJcbiAgICAgICAgbGV0IGluZGV4IDogbnVtYmVyID0gTWF0aC5mbG9vcih0aGlzLnBsYXlUaW1lIC8gdGhpcy5kdXJhdGlvbik7XHJcbiAgICAgXHJcbiAgICAgICAgICB0aGlzLm5vZGUuc2NhbGU9dGhpcy5ub2RlX3NjYWxlXHJcbiAgICBcclxuICAgICAgICBpZih0aGlzLmxvb3ApeyAgLy8g5b6q546v5pKt5pS+XHJcbiAgICAgICAgICAgIGlmKGluZGV4ID49IHRoaXMuc3ByaXRlRnJhbWVzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICBpbmRleCAtPSB0aGlzLnNwcml0ZUZyYW1lcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlUaW1lIC09ICh0aGlzLmR1cmF0aW9uICogdGhpcy5zcHJpdGVGcmFtZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuc3ByaXRlRnJhbWVzW2luZGV4XTtcclxuICAgICAgICB9ZWxzZXsgICAgICAgICAgLy8g5pKt5pS+5LiA5qyhXHJcbiAgICAgICAgICAgIGlmKGluZGV4ID49IHRoaXMuc3ByaXRlRnJhbWVzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5pyJ5Zue6LCD5Ye95pWw55qE5aSE55CG77yM5YiZ6LCD55So5Zue6LCD5Ye95pWwXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmVuZEZ1bmMpe1xyXG4gICAgICAgICAgICAgICAgIC8vICAgdGhpcy5ub2RlLnNjYWxlPXRoaXMuc3RhcnRTY2FsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kRnVuYy5jYWxsKHRoaXMuY2FsbGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUuc3ByaXRlRnJhbWUgPSB0aGlzLnNwcml0ZUZyYW1lc1tpbmRleF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19