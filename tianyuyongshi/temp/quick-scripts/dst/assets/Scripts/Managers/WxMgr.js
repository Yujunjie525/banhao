
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/WxMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ad0dbcSH0NCNZYXxRmmtQrR', 'WxMgr');
// Scripts/Managers/WxMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var WxMgr = /** @class */ (function (_super) {
    __extends(WxMgr, _super);
    function WxMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //判断转发三个参数
        _this.isShared = false;
        _this.isTimeline = false;
        _this.shareTag = "";
        _this.closeTime = 0;
        _this.text = "这款空战游戏,我最多打到第6关";
        //分享时候的封面图片 放你自己的地址
        _this.picUrl = '';
        _this.videoAd = null; // 激励视频广告
        _this.interstitialAd = null; //插屏广告
        _this.keyTag = null; //激励视频获取奖励类型
        //回调方法
        _this.endFunc = null; //函数
        _this.caller = null; //this
        return _this;
        // update (dt) {}
    }
    WxMgr_1 = WxMgr;
    WxMgr.prototype.onLoad = function () {
        if (!WxMgr_1.Instance || !cc.isValid(WxMgr_1.Instance)) {
            WxMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.initGame(); //分享的逻辑
            this.initVideoAd(); //视频广告
            this.initInterstitialAd(); //插屏广告
        }
    };
    // 显示复活视频广告
    WxMgr.prototype.showVideoAd = function (key, endf, mcaller) {
        var _this = this;
        if (!this.videoAd) {
            return;
        }
        this.keyTag = key;
        if (endf != null && mcaller != null) {
            this.caller = mcaller;
            this.endFunc = endf;
        }
        // 用户触发广告后，显示激励视频广告
        this.videoAd.show().catch(function () {
            // 失败重试
            _this.videoAd.load()
                .then(function () { return _this.videoAd.show(); })
                .catch(function (err) {
                console.log('激励视频 广告显示失败');
            });
        });
    };
    WxMgr.prototype.showInterstitialAd = function () {
        //  console.log('插屏 广告拉取1')
        // 在适合的场景显示插屏广告
        if (this.interstitialAd) {
            //  console.log('插屏 广告拉取')
            this.interstitialAd.show().catch(function (err) {
                console.log('插屏 广告拉取失败');
                console.error(err);
            });
        }
    };
    WxMgr.prototype.initInterstitialAd = function () {
        // 创建插屏广告实例，提前初始化
        if (wx.createInterstitialAd) {
            console.log("广告被创建");
            this.interstitialAd = wx.createInterstitialAd({
                adUnitId: '填写你自己的id'
            });
        }
        this.interstitialAd.onClose(function (res) {
            console.log('插屏 广告关闭');
        });
        this.interstitialAd.onLoad(function () {
            console.log('插屏 广告加载成功');
        });
        this.interstitialAd.onError(function (err) {
            console.log('插屏 广告加载失败');
            console.log(err);
        });
    };
    //激励视频广告
    WxMgr.prototype.initVideoAd = function () {
        var self = this;
        // 创建激励视频广告实例，提前初始化
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: '填写你自己的id'
        });
        this.videoAd.onError(function (err) {
            console.log('激励视频展示失败');
            console.log(err);
        });
        this.videoAd.onClose(function (res) {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                switch (self.keyTag) {
                    case "fuhuo":
                        self.endFunc.call(self.caller);
                        break;
                    case "game_medal":
                        self.endFunc.call(self.caller, self.keyTag, 80); //看视频给勋章
                        break;
                    case "game_gold":
                        self.endFunc.call(self.caller, self.keyTag, 300); //看视频给金币
                        break;
                    case "keys_shuangbei":
                        self.endFunc.call(self.caller); //双倍领取
                        break;
                    default:
                        // self.endFunc.call(self.caller)//双倍领取
                        break;
                }
                // 正常播放结束，可以下发游戏奖励
                console.log('奖励已经发放');
                self.endFunc = null;
                self.caller = null;
                self.keyTag = null;
            }
            else {
                // 提前关闭广告，不发放奖励
                console.log('因播放中途退出，所以不下发游戏奖励');
            }
            cc.audioEngine.pauseMusic(); // 先强制暂停
            cc.audioEngine.resumeMusic(); // 再恢复播放音乐 
        });
    };
    //游戏分享登录初始化
    WxMgr.prototype.initGame = function () {
        var self = this;
        //初始化右上角分享
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        wx.onShareAppMessage(function () {
            return {
                title: self.text,
                //转发显示图片的链接,图片长宽比是 5:4
                //网路图片=>'https://...'
                //  imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
                imageUrl: self.picUrl,
            };
        });
        wx.onShareTimeline(function () {
            // self.isShared=true
            self.closeTime = new Date().getTime();
            self.isTimeline = true;
            return {
                title: self.text,
                //   query: {
                //     key: value
                //   },
                imageUrl: self.picUrl,
            };
        });
        //开启监听 返回小程序启动参数（只有第一次激活生效）
        var launchOption = wx.getLaunchOptionsSync();
        console.log('首次开启 launchOption');
        console.log(launchOption);
        //开启监听小游戏回到前台的事件 (分享返回，下拉框返回)
        wx.onShow(function (dt) {
            console.log('回到前台onShow' + "是否分享：" + self.shareTag + "分享的key：" + self.isShared);
            var curTime = new Date().getTime();
            if (curTime - self.closeTime <= 3000) {
                self.isTimeline = false;
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                console.log("分享不成功提示<3000");
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                    duration: 1500 //持续的时间
                });
                return;
            }
            if (self.isTimeline) {
                self.closeTime = curTime;
                self.isTimeline = false;
                console.log("分享朋友圈成功提示");
                wx.showToast({
                    title: '获得双倍奖励',
                    icon: 'none',
                    duration: 1500 //持续的时间
                });
            }
            if (self.isShared && self.shareTag == "keys_fuhuo") {
                //复活操作
                if (self.endFunc) {
                    var caller = self.caller;
                    self.endFunc.call(caller);
                }
                //分享成功
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                self.endFunc = null;
                self.caller = null;
            }
            else if (self.isShared && self.shareTag == "keys_shuangbei") {
                //获得双倍奖励
                if (self.endFunc) {
                    var caller = self.caller;
                    self.endFunc.call(caller);
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                self.endFunc = null;
                self.caller = null;
                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({
                    title: '获得了双倍奖励！',
                    icon: 'none',
                    duration: 1500 //持续的时间
                });
            }
            else if (self.isShared && self.shareTag == "game_medal") { //获得勋章
                //获得双倍奖励
                if (self.endFunc) {
                    var caller = self.caller;
                    self.endFunc.call(caller, self.shareTag, 80); //加50勋章
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                self.endFunc = null;
                self.caller = null;
                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({
                    title: '获得勋章',
                    icon: 'none',
                    duration: 1500 //持续的时间
                });
            }
            else if (self.isShared && self.shareTag == "game_gold") { //获得金币
                if (self.endFunc) {
                    var caller = self.caller;
                    self.endFunc.call(caller, self.shareTag, 300); //加200金币
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                //获得双倍奖励
                self.endFunc = null;
                self.caller = null;
                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({
                    title: '获得金币',
                    icon: 'none',
                    duration: 1500 //持续的时间
                });
            }
        });
    };
    //主动转发好友
    WxMgr.prototype.shareAppMessage = function (key, endf, mcaller) {
        this.isShared = true;
        this.closeTime = new Date().getTime();
        this.shareTag = key;
        if (endf != null && mcaller != null) {
            this.caller = mcaller;
            this.endFunc = endf;
        }
        var self = this;
        switch (this.shareTag) {
            case "keys_fuhuo":
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });
                break;
            case "keys_shuangbei":
                console.log("我是双倍奖励的分享！");
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });
                break;
            case "game_medal": //获得勋章
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    //  imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
                    query: 'openid=110',
                });
                break;
            case "game_gold": //获得金币
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });
                break;
            case "keys_xuanyao":
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });
                break;
            default:
                break;
        }
        //    // this.isfx=true;
        //    if(this.shareTag == "keys_fuhuo"){
        //        wx.shareAppMessage({
        //            title:"这款碰球游戏，我打到了"+ this.score+"分，你也来试试！" ,
        //           imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
        //             query: 'openid=110',
        //              });
        //    }else if(this.shareTag == "keys_jiaqiu"){
        //             wx.shareAppMessage({
        //            title:"一款好玩的空战游戏" ,
        //           imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
        //             query: 'openid=110',
        //              });
        //    }else if(this.shareTag=="keys_shuangbei"){
        //        console.log("我是加钻石的分享")
        //        wx.shareAppMessage({
        //            title:"一款好玩的空战游戏" ,
        //          // imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
        //             query: 'openid=110',
        //            });
        //    }
    };
    WxMgr.prototype.start = function () {
    };
    WxMgr.prototype.onDestroy = function () {
        if (WxMgr_1.Instance === this) {
            WxMgr_1.Instance = null;
        }
    };
    var WxMgr_1;
    WxMgr.Instance = null;
    WxMgr = WxMgr_1 = __decorate([
        ccclass
    ], WxMgr);
    return WxMgr;
}(cc.Component));
exports.default = WxMgr;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFd4TWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUFtQyx5QkFBWTtJQUEvQztRQUFBLHFFQTJmQztRQXpmRyxVQUFVO1FBQ0YsY0FBUSxHQUFZLEtBQUssQ0FBQTtRQUN6QixnQkFBVSxHQUFZLEtBQUssQ0FBQTtRQUMzQixjQUFRLEdBQVcsRUFBRSxDQUFBO1FBQ3JCLGVBQVMsR0FBVyxDQUFDLENBQUE7UUFFckIsVUFBSSxHQUFXLGlCQUFpQixDQUFBO1FBQ3hDLG1CQUFtQjtRQUNYLFlBQU0sR0FBVyxFQUFFLENBQUE7UUFFbkIsYUFBTyxHQUFHLElBQUksQ0FBQSxDQUFLLFNBQVM7UUFDNUIsb0JBQWMsR0FBRyxJQUFJLENBQUEsQ0FBRyxNQUFNO1FBQzlCLFlBQU0sR0FBVyxJQUFJLENBQUEsQ0FBRyxZQUFZO1FBQzVDLE1BQU07UUFDRSxhQUFPLEdBQVEsSUFBSSxDQUFDLENBQUEsSUFBSTtRQUN4QixZQUFNLEdBQVEsSUFBSSxDQUFBLENBQUEsTUFBTTs7UUF5ZWhDLGlCQUFpQjtJQUNyQixDQUFDO2NBM2ZvQixLQUFLO0lBa0J0QixzQkFBTSxHQUFOO1FBR0ksSUFBSSxDQUFDLE9BQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNoRCxPQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUN6QjthQUNJO1lBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsT0FBTztTQUNWO1FBRUQsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtZQUN4QyxJQUFJLENBQUMsUUFB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UUFDL0MsbUNBQW1DO1FBQ25DLGlDQUFpQztRQUNqQyxxRUFBcUU7UUFDckUsbUNBQW1DO1FBQ25DLG1CQUFtQjtRQUNuQixnREFBZ0Q7UUFDaEQsaUNBQWlDO1FBQ2pDLDhCQUE4QjtRQUM5QixpQ0FBaUM7UUFDakMsdUVBQXVFO1FBQ3ZFLG1DQUFtQztRQUNuQyxpQkFBaUI7UUFDakIsT0FBTztJQUVYLENBQUM7SUFNRCxxQkFBSyxHQUFMO0lBR0EsQ0FBQztJQUVELHlCQUFTLEdBQVQ7UUFDSSxJQUFJLE9BQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE9BQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQzs7SUF2ZmEsY0FBUSxHQUFVLElBQUksQ0FBQztJQURwQixLQUFLO1FBRHpCLE9BQU87T0FDYSxLQUFLLENBMmZ6QjtJQUFELFlBQUM7Q0EzZkQsQUEyZkMsQ0EzZmtDLEVBQUUsQ0FBQyxTQUFTLEdBMmY5QztrQkEzZm9CLEtBQUsiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFd4TWdyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICAgIHB1YmxpYyBzdGF0aWMgSW5zdGFuY2U6IFd4TWdyID0gbnVsbDtcclxuICAgIC8v5Yik5pat6L2s5Y+R5LiJ5Liq5Y+C5pWwXHJcbiAgICBwcml2YXRlIGlzU2hhcmVkOiBib29sZWFuID0gZmFsc2VcclxuICAgIHByaXZhdGUgaXNUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICBwcml2YXRlIHNoYXJlVGFnOiBzdHJpbmcgPSBcIlwiXHJcbiAgICBwcml2YXRlIGNsb3NlVGltZTogbnVtYmVyID0gMFxyXG5cclxuICAgIHByaXZhdGUgdGV4dDogc3RyaW5nID0gXCLov5nmrL7nqbrmiJjmuLjmiI8s5oiR5pyA5aSa5omT5Yiw56ysNuWFs1wiXHJcbiAgICAvL+WIhuS6q+aXtuWAmeeahOWwgemdouWbvueJhyDmlL7kvaDoh6rlt7HnmoTlnLDlnYBcclxuICAgIHByaXZhdGUgcGljVXJsOiBzdHJpbmcgPSAnJ1xyXG5cclxuICAgIHByaXZhdGUgdmlkZW9BZCA9IG51bGwgICAgIC8vIOa/gOWKseinhumikeW5v+WRilxyXG4gICAgcHJpdmF0ZSBpbnRlcnN0aXRpYWxBZCA9IG51bGwgICAvL+aPkuWxj+W5v+WRilxyXG4gICAgcHJpdmF0ZSBrZXlUYWc6IHN0cmluZyA9IG51bGwgICAvL+a/gOWKseinhumikeiOt+WPluWlluWKseexu+Wei1xyXG4gICAgLy/lm57osIPmlrnms5VcclxuICAgIHByaXZhdGUgZW5kRnVuYzogYW55ID0gbnVsbDsvL+WHveaVsFxyXG4gICAgcHJpdmF0ZSBjYWxsZXI6IGFueSA9IG51bGwvL3RoaXNcclxuICAgIG9uTG9hZCgpIHtcclxuXHJcblxyXG4gICAgICAgIGlmICghV3hNZ3IuSW5zdGFuY2UgfHwgIWNjLmlzVmFsaWQoV3hNZ3IuSW5zdGFuY2UpKSB7XG4gICAgICAgICAgICBXeE1nci5JbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2Muc3lzLnBsYXRmb3JtID09PSBjYy5zeXMuV0VDSEFUX0dBTUUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0R2FtZSgpLy/liIbkuqvnmoTpgLvovpFcclxuICAgICAgICAgICAgdGhpcy5pbml0VmlkZW9BZCgpLy/op4bpopHlub/lkYpcclxuICAgICAgICAgICAgdGhpcy5pbml0SW50ZXJzdGl0aWFsQWQoKS8v5o+S5bGP5bm/5ZGKXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8g5pi+56S65aSN5rS76KeG6aKR5bm/5ZGKXHJcbiAgICBwdWJsaWMgc2hvd1ZpZGVvQWQoa2V5OiBzdHJpbmcsIGVuZGY/OiBhbnksIG1jYWxsZXI/KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnZpZGVvQWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmtleVRhZyA9IGtleVxyXG4gICAgICAgIGlmIChlbmRmICE9IG51bGwgJiYgbWNhbGxlciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGVyID0gbWNhbGxlclxyXG4gICAgICAgICAgICB0aGlzLmVuZEZ1bmMgPSBlbmRmXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g55So5oi36Kem5Y+R5bm/5ZGK5ZCO77yM5pi+56S65r+A5Yqx6KeG6aKR5bm/5ZGKXHJcbiAgICAgICAgdGhpcy52aWRlb0FkLnNob3coKS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWksei0pemHjeivlVxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvQWQubG9hZCgpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLnZpZGVvQWQuc2hvdygpKVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+a/gOWKseinhumikSDlub/lkYrmmL7npLrlpLHotKUnKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2hvd0ludGVyc3RpdGlhbEFkKCkge1xyXG4gICAgICAvLyAgY29uc29sZS5sb2coJ+aPkuWxjyDlub/lkYrmi4nlj5YxJylcclxuICAgICAgICAvLyDlnKjpgILlkIjnmoTlnLrmma/mmL7npLrmj5LlsY/lub/lkYpcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnN0aXRpYWxBZCkge1xyXG4gICAgICAgICAgLy8gIGNvbnNvbGUubG9nKCfmj5LlsY8g5bm/5ZGK5ouJ5Y+WJylcclxuICAgICAgICAgICAgdGhpcy5pbnRlcnN0aXRpYWxBZC5zaG93KCkuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aPkuWxjyDlub/lkYrmi4nlj5blpLHotKUnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdEludGVyc3RpdGlhbEFkKCkge1xyXG5cclxuXHJcblxyXG4gICAgICAgIC8vIOWIm+W7uuaPkuWxj+W5v+WRiuWunuS+i++8jOaPkOWJjeWIneWni+WMllxyXG4gICAgICAgIGlmICh3eC5jcmVhdGVJbnRlcnN0aXRpYWxBZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuW5v+WRiuiiq+WIm+W7ulwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJzdGl0aWFsQWQgPSB3eC5jcmVhdGVJbnRlcnN0aXRpYWxBZCh7XHJcbiAgICAgICAgICAgICAgICBhZFVuaXRJZDogJ+Whq+WGmeS9oOiHquW3seeahGlkJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcnN0aXRpYWxBZC5vbkNsb3NlKHJlcyA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmj5LlsY8g5bm/5ZGK5YWz6ZetJylcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgIHRoaXMuIGludGVyc3RpdGlhbEFkLm9uTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmj5LlsY8g5bm/5ZGK5Yqg6L295oiQ5YqfJylcclxuICAgICAgICB9KVxyXG4gICAgICAgdGhpcy4gaW50ZXJzdGl0aWFsQWQub25FcnJvcihlcnIgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfmj5LlsY8g5bm/5ZGK5Yqg6L295aSx6LSlJylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgLy/mv4DlirHop4bpopHlub/lkYpcclxuICAgIHB1YmxpYyBpbml0VmlkZW9BZCgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcclxuXHJcblxyXG4gICAgICAgIC8vIOWIm+W7uua/gOWKseinhumikeW5v+WRiuWunuS+i++8jOaPkOWJjeWIneWni+WMllxyXG4gICAgICAgIHRoaXMudmlkZW9BZCA9IHd4LmNyZWF0ZVJld2FyZGVkVmlkZW9BZCh7XHJcbiAgICAgICAgICAgIGFkVW5pdElkOiAn5aGr5YaZ5L2g6Ieq5bex55qEaWQnXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb0FkLm9uRXJyb3IoZXJyID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+a/gOWKseinhumikeWxleekuuWksei0pScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG5cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudmlkZW9BZC5vbkNsb3NlKHJlcyA9PiB7XHJcbiAgICAgICAgICAgIC8vIOeUqOaIt+eCueWHu+S6huOAkOWFs+mXreW5v+WRiuOAkeaMiemSrlxyXG4gICAgICAgICAgICAvLyDlsI/kuo4gMi4xLjAg55qE5Z+656GA5bqT54mI5pys77yMcmVzIOaYr+S4gOS4qiB1bmRlZmluZWRcclxuICAgICAgICAgICAgaWYgKHJlcyAmJiByZXMuaXNFbmRlZCB8fCByZXMgPT09IHVuZGVmaW5lZCkge1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChzZWxmLmtleVRhZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmdWh1b1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChzZWxmLmNhbGxlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZV9tZWRhbFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChzZWxmLmNhbGxlciwgc2VsZi5rZXlUYWcsIDgwKS8v55yL6KeG6aKR57uZ5YuL56ugXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImdhbWVfZ29sZFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChzZWxmLmNhbGxlciwgc2VsZi5rZXlUYWcsIDMwMCkvL+eci+inhumikee7memHkeW4gVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwia2V5c19zaHVhbmdiZWlcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbmRGdW5jLmNhbGwoc2VsZi5jYWxsZXIpLy/lj4zlgI3pooblj5ZcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbGYuZW5kRnVuYy5jYWxsKHNlbGYuY2FsbGVyKS8v5Y+M5YCN6aKG5Y+WXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDmraPluLjmkq3mlL7nu5PmnZ/vvIzlj6/ku6XkuIvlj5HmuLjmiI/lpZblirFcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflpZblirHlt7Lnu4/lj5HmlL4nKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZW5kRnVuYyA9IG51bGxcclxuICAgICAgICAgICAgICAgIHNlbGYuY2FsbGVyID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgc2VsZi5rZXlUYWcgPSBudWxsXHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5o+Q5YmN5YWz6Zet5bm/5ZGK77yM5LiN5Y+R5pS+5aWW5YqxXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Zug5pKt5pS+5Lit6YCU6YCA5Ye677yM5omA5Lul5LiN5LiL5Y+R5ri45oiP5aWW5YqxJyk7XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGF1c2VNdXNpYygpOyAgICAgICAgICAgIC8vIOWFiOW8uuWItuaaguWBnFxyXG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5yZXN1bWVNdXNpYygpOyAgICAgICAgICAgLy8g5YaN5oGi5aSN5pKt5pS+6Z+z5LmQIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIC8v5ri45oiP5YiG5Lqr55m75b2V5Yid5aeL5YyWXHJcbiAgICBwcml2YXRlIGluaXRHYW1lKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAvL+WIneWni+WMluWPs+S4iuinkuWIhuS6q1xyXG5cclxuICAgICAgICB3eC5zaG93U2hhcmVNZW51KHtcclxuICAgICAgICAgICAgd2l0aFNoYXJlVGlja2V0OiB0cnVlLFxyXG4gICAgICAgICAgICBtZW51czogWydzaGFyZUFwcE1lc3NhZ2UnLCAnc2hhcmVUaW1lbGluZSddXHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgd3gub25TaGFyZUFwcE1lc3NhZ2UoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHNlbGYudGV4dCxcclxuXHJcbiAgICAgICAgICAgICAgICAvL+i9rOWPkeaYvuekuuWbvueJh+eahOmTvuaOpSzlm77niYfplb/lrr3mr5TmmK8gNTo0XHJcbiAgICAgICAgICAgICAgICAvL+e9kei3r+WbvueJhz0+J2h0dHBzOi8vLi4uJ1xyXG4gICAgICAgICAgICAgICAgLy8gIGltYWdlVXJsOiBjYy51cmwucmF3KCdyZXNvdXJjZXMvaW1nL2dhbWVQbGF5aW5nLzEucG5nJyksXHJcbiAgICAgICAgICAgICAgICBpbWFnZVVybDogc2VsZi5waWNVcmwsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3gub25TaGFyZVRpbWVsaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gc2VsZi5pc1NoYXJlZD10cnVlXHJcbiAgICAgICAgICAgIHNlbGYuY2xvc2VUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHNlbGYuaXNUaW1lbGluZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogc2VsZi50ZXh0LFxyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgcXVlcnk6IHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBrZXk6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAvLyAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbWFnZVVybDogc2VsZi5waWNVcmwsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy/lvIDlkK/nm5HlkKwg6L+U5Zue5bCP56iL5bqP5ZCv5Yqo5Y+C5pWw77yI5Y+q5pyJ56ys5LiA5qyh5r+A5rS755Sf5pWI77yJXHJcbiAgICAgICAgbGV0IGxhdW5jaE9wdGlvbiA9IHd4LmdldExhdW5jaE9wdGlvbnNTeW5jKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+mmluasoeW8gOWQryBsYXVuY2hPcHRpb24nKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGxhdW5jaE9wdGlvbik7XHJcblxyXG4gICAgICAgIC8v5byA5ZCv55uR5ZCs5bCP5ri45oiP5Zue5Yiw5YmN5Y+w55qE5LqL5Lu2ICjliIbkuqvov5Tlm57vvIzkuIvmi4nmoYbov5Tlm54pXHJcbiAgICAgICAgd3gub25TaG93KGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5Zue5Yiw5YmN5Y+wb25TaG93JyArIFwi5piv5ZCm5YiG5Lqr77yaXCIgKyBzZWxmLnNoYXJlVGFnICsgXCLliIbkuqvnmoRrZXnvvJpcIiArIHNlbGYuaXNTaGFyZWQpO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICBsZXQgY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICBpZiAoY3VyVGltZSAtIHNlbGYuY2xvc2VUaW1lIDw9IDMwMDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmlzVGltZWxpbmUgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgc2VsZi5pc1NoYXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaGFyZVRhZyA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlVGltZSA9IGN1clRpbWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+S4jeaIkOWKn+aPkOekujwzMDAwXCIpO1xyXG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliIbkuqvlpLHotKUnLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnbm9uZScsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxNTAwLy/mjIHnu63nmoTml7bpl7RcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaXNUaW1lbGluZSkge1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VUaW1lID0gY3VyVGltZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuaXNUaW1lbGluZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+aci+WPi+WciOaIkOWKn+aPkOekulwiKTtcclxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6I635b6X5Y+M5YCN5aWW5YqxJyxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ25vbmUnLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTUwMC8v5oyB57ut55qE5pe26Ze0XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaXNTaGFyZWQgJiYgc2VsZi5zaGFyZVRhZyA9PSBcImtleXNfZnVodW9cIikge1xyXG4gICAgICAgICAgICAgICAgLy/lpI3mtLvmk43kvZxcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmVuZEZ1bmMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FsbGVyID0gc2VsZi5jYWxsZXJcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChjYWxsZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL+WIhuS6q+aIkOWKn1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLliIbkuqvmiJDlip/mj5DnpLpcIik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmlzU2hhcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNoYXJlVGFnID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VUaW1lID0gY3VyVGltZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuZW5kRnVuYyA9IG51bGxcclxuICAgICAgICAgICAgICAgIHNlbGYuY2FsbGVyID0gbnVsbFxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5pc1NoYXJlZCAmJiBzZWxmLnNoYXJlVGFnID09IFwia2V5c19zaHVhbmdiZWlcIikge1xyXG4gICAgICAgICAgICAgICAgLy/ojrflvpflj4zlgI3lpZblirFcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmVuZEZ1bmMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FsbGVyID0gc2VsZi5jYWxsZXJcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChjYWxsZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+aIkOWKn+aPkOekulwiKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuaXNTaGFyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hhcmVUYWcgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZVRpbWUgPSBjdXJUaW1lO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLmVuZEZ1bmMgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBzZWxmLmNhbGxlciA9IG51bGxcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gIHNlbGYuc2h1YXhaaHVhblNoaSg1MDAsdHJ1ZSkvL+e7mTUwMOS4qumSu+efs1xyXG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfojrflvpfkuoblj4zlgI3lpZblirHvvIEnLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnbm9uZScsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxNTAwLy/mjIHnu63nmoTml7bpl7RcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuaXNTaGFyZWQgJiYgc2VsZi5zaGFyZVRhZyA9PSBcImdhbWVfbWVkYWxcIikgey8v6I635b6X5YuL56ugXHJcbiAgICAgICAgICAgICAgICAvL+iOt+W+l+WPjOWAjeWlluWKsVxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZW5kRnVuYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjYWxsZXIgPSBzZWxmLmNhbGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW5kRnVuYy5jYWxsKGNhbGxlciwgc2VsZi5zaGFyZVRhZywgODApLy/liqA1MOWLi+eroFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLliIbkuqvmiJDlip/mj5DnpLpcIik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmlzU2hhcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNoYXJlVGFnID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VUaW1lID0gY3VyVGltZTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5lbmRGdW5jID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsZXIgPSBudWxsXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vICBzZWxmLnNodWF4Wmh1YW5TaGkoNTAwLHRydWUpLy/nu5k1MDDkuKrpkrvnn7NcclxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6I635b6X5YuL56ugJyxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ25vbmUnLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTUwMC8v5oyB57ut55qE5pe26Ze0XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5pc1NoYXJlZCAmJiBzZWxmLnNoYXJlVGFnID09IFwiZ2FtZV9nb2xkXCIpIHsvL+iOt+W+l+mHkeW4gVxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZW5kRnVuYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjYWxsZXIgPSBzZWxmLmNhbGxlclxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW5kRnVuYy5jYWxsKGNhbGxlciwgc2VsZi5zaGFyZVRhZywgMzAwKS8v5YqgMjAw6YeR5biBXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+aIkOWKn+aPkOekulwiKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuaXNTaGFyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hhcmVUYWcgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZVRpbWUgPSBjdXJUaW1lO1xyXG4gICAgICAgICAgICAgICAgLy/ojrflvpflj4zlgI3lpZblirFcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5lbmRGdW5jID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgc2VsZi5jYWxsZXIgPSBudWxsXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vICBzZWxmLnNodWF4Wmh1YW5TaGkoNTAwLHRydWUpLy/nu5k1MDDkuKrpkrvnn7NcclxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6I635b6X6YeR5biBJyxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ25vbmUnLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTUwMC8v5oyB57ut55qE5pe26Ze0XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8v5Li75Yqo6L2s5Y+R5aW95Y+LXHJcbiAgICBwdWJsaWMgc2hhcmVBcHBNZXNzYWdlKGtleTogc3RyaW5nLCBlbmRmPzogYW55LCBtY2FsbGVyPykge1xyXG4gICAgICAgIHRoaXMuaXNTaGFyZWQgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5jbG9zZVRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICB0aGlzLnNoYXJlVGFnID0ga2V5O1xyXG5cclxuICAgICAgICBpZiAoZW5kZiAhPSBudWxsICYmIG1jYWxsZXIgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxlciA9IG1jYWxsZXJcclxuICAgICAgICAgICAgdGhpcy5lbmRGdW5jID0gZW5kZlxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuc2hhcmVUYWcpIHtcclxuICAgICAgICAgICAgY2FzZSBcImtleXNfZnVodW9cIjpcclxuICAgICAgICAgICAgICAgIHd4LnNoYXJlQXBwTWVzc2FnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHNlbGYudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogc2VsZi5waWNVcmwsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiAnb3BlbmlkPTExMCcsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIFwia2V5c19zaHVhbmdiZWlcIjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5oiR5piv5Y+M5YCN5aWW5Yqx55qE5YiG5Lqr77yBXCIpXHJcbiAgICAgICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzZWxmLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IHNlbGYucGljVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiAnb3BlbmlkPTExMCcsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcblxyXG4gICAgICAgICAgICBjYXNlIFwiZ2FtZV9tZWRhbFwiOi8v6I635b6X5YuL56ugXHJcbiAgICAgICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzZWxmLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IHNlbGYucGljVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICBpbWFnZVVybDogY2MudXJsLnJhdygncmVzb3VyY2VzL2ltZy9nYW1lUGxheWluZy8xLnBuZycpLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiAnb3BlbmlkPTExMCcsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIFwiZ2FtZV9nb2xkXCI6Ly/ojrflvpfph5HluIFcclxuICAgICAgICAgICAgICAgIHd4LnNoYXJlQXBwTWVzc2FnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHNlbGYudGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogc2VsZi5waWNVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6ICdvcGVuaWQ9MTEwJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJrZXlzX3h1YW55YW9cIjpcclxuXHJcbiAgICAgICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogc2VsZi50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogc2VsZi5waWNVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6ICdvcGVuaWQ9MTEwJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgLy8gICAgLy8gdGhpcy5pc2Z4PXRydWU7XHJcbiAgICAgICAgLy8gICAgaWYodGhpcy5zaGFyZVRhZyA9PSBcImtleXNfZnVodW9cIil7XHJcbiAgICAgICAgLy8gICAgICAgIHd4LnNoYXJlQXBwTWVzc2FnZSh7XHJcbiAgICAgICAgLy8gICAgICAgICAgICB0aXRsZTpcIui/measvueisOeQg+a4uOaIj++8jOaIkeaJk+WIsOS6hlwiKyB0aGlzLnNjb3JlK1wi5YiG77yM5L2g5Lmf5p2l6K+V6K+V77yBXCIgLFxyXG4gICAgICAgIC8vICAgICAgICAgICBpbWFnZVVybDogY2MudXJsLnJhdygncmVzb3VyY2VzL2ltZy9nYW1lUGxheWluZy8xLnBuZycpLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIHF1ZXJ5OiAnb3BlbmlkPTExMCcsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIC8vICAgIH1lbHNlIGlmKHRoaXMuc2hhcmVUYWcgPT0gXCJrZXlzX2ppYXFpdVwiKXtcclxuICAgICAgICAvLyAgICAgICAgICAgICB3eC5zaGFyZUFwcE1lc3NhZ2Uoe1xyXG4gICAgICAgIC8vICAgICAgICAgICAgdGl0bGU6XCLkuIDmrL7lpb3njqnnmoTnqbrmiJjmuLjmiI9cIiAsXHJcbiAgICAgICAgLy8gICAgICAgICAgIGltYWdlVXJsOiBjYy51cmwucmF3KCdyZXNvdXJjZXMvaW1nL2dhbWVQbGF5aW5nLzEucG5nJyksXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgcXVlcnk6ICdvcGVuaWQ9MTEwJyxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gICAgfWVsc2UgaWYodGhpcy5zaGFyZVRhZz09XCJrZXlzX3NodWFuZ2JlaVwiKXtcclxuICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCLmiJHmmK/liqDpkrvnn7PnmoTliIbkuqtcIilcclxuICAgICAgICAvLyAgICAgICAgd3guc2hhcmVBcHBNZXNzYWdlKHtcclxuICAgICAgICAvLyAgICAgICAgICAgIHRpdGxlOlwi5LiA5qy+5aW9546p55qE56m65oiY5ri45oiPXCIgLFxyXG4gICAgICAgIC8vICAgICAgICAgIC8vIGltYWdlVXJsOiBjYy51cmwucmF3KCdyZXNvdXJjZXMvaW1nL2dhbWVQbGF5aW5nLzEucG5nJyksXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgcXVlcnk6ICdvcGVuaWQ9MTEwJyxcclxuICAgICAgICAvLyAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIC8vICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cbiAgICBzdGFydCgpIHtcblxuXG4gICAgfVxuXG4gICAgb25EZXN0cm95KCkge1xuICAgICAgICBpZiAoV3hNZ3IuSW5zdGFuY2UgPT09IHRoaXMpIHtcbiAgICAgICAgICAgIFd4TWdyLkluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9XG59XG4iXX0=