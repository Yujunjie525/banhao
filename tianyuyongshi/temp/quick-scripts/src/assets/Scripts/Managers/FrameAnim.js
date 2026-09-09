"use strict";
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