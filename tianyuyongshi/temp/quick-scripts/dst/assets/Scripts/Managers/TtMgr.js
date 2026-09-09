
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/TtMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '6fa822kty9Gg7AizRBUp5e1', 'TtMgr');
// Scripts/Managers/TtMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TtMgr = /** @class */ (function (_super) {
    __extends(TtMgr, _super);
    function TtMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.text = "这款空战游戏,我最多打到第6关";
        //回调方法
        _this.endFunc = null; //函数
        _this.caller = null; //this
        _this.recorder = null; //录屏
        _this.videoPath = null; //录屏地址
        _this.videoAd = null; // 激励视频广告
        _this.bannerAd = null; //banner广告
        _this.windowWidth = null;
        _this.windowHeight = null;
        _this.interstitialAd = null; //插屏广告
        _this.keyTag = null;
        return _this;
        // update (dt) {}
    }
    TtMgr_1 = TtMgr;
    // LIFE-CYCLE CALLBACKS:
    TtMgr.prototype.onLoad = function () {
        if (!TtMgr_1.Instance || !cc.isValid(TtMgr_1.Instance)) {
            TtMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
        if (window.tt) {
            this.initGame();
        }
    };
    TtMgr.prototype.start = function () {
    };
    TtMgr.prototype.initGame = function () {
        //  var self = this
        //   this.login_app(false)//判断登录
        this.initVideoAd(); // 激励视频初始化      
        // this.initBannerAd()               //banner初始化
        this.InterstitialAd(); //插屏广告初始化
    };
    // this.gameRecorder()
    TtMgr.prototype.onLoad_video = function () {
        var _this = this;
        console.log("广告组件加载成功");
        this.videoAd.load()
            .then(function () { return _this.videoAd.show(); })
            .catch(function (err) { return console.log(err.errMsg); });
    };
    TtMgr.prototype.offLoad_vodeo = function () {
        this.videoAd.offLoad(function () {
            console.log("load 监听器卸载成功");
        });
    };
    //插屏广告
    TtMgr.prototype.InterstitialAd = function () {
        var self = this;
        this.interstitialAd = tt.createInterstitialAd({
            adUnitId: "填写你自己的id",
        });
        //  this.interstitialAd.load()
        this.interstitialAd.onClose(function () {
            self.interstitialAd.load();
        });
    };
    TtMgr.prototype.showInterstitialAd = function () {
        var self = this;
        this.interstitialAd.load()
            .then(function () {
            self.interstitialAd.show().then(function () {
                console.log("插屏广告展示成功");
            });
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    //banner广告
    TtMgr.prototype.initBannerAd = function () {
        var self = this;
        var _a = tt.getSystemInfoSync(), windowWidth = _a.windowWidth, windowHeight = _a.windowHeight;
        var targetBannerAdWidth = 200;
        // 创建一个居于屏幕底部正中的广告
        self.bannerAd = tt.createBannerAd({
            adUnitId: "填写你自己的id",
            style: {
                width: targetBannerAdWidth,
                top: windowHeight - (targetBannerAdWidth / 16) * 9,
            },
        });
        // 也可以手动修改属性以调整广告尺寸
        self.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;
        // 尺寸调整时会触发回调，通过回调拿到的广告真实宽高再进行定位适配处理
        // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
        self.bannerAd.onResize(function (size) {
            // good
            console.log(size.width, size.height);
            self.bannerAd.style.top = windowHeight - size.height;
            self.bannerAd.style.left = (windowWidth - size.width) / 2;
            // bad，会触发死循环
            // bannerAd.style.width++;
        });
        self.bannerAd.onLoad(function () {
            self.bannerAd
                .show()
                .then(function () {
                console.log("广告显示成功");
            })
                .catch(function (err) {
                console.log("广告组件出现问题", err);
            });
        });
    };
    //关闭激励视频的回调、、复活
    // public  onClose_video() {
    //   this.videoAd.onClose(res => {
    //     console.log('第一个视频回调')
    //     if (res && res.isEnded || res === undefined) {
    //     //  this.fuHuo()
    //       console.log("视频回调成功");
    //     } else {
    //       console.log("复活视频回调失败");
    //     }
    //   })
    // }
    //激励视频广告
    TtMgr.prototype.initVideoAd = function () {
        var self = this;
        // if (typeof tt === 'undefined') {
        //     return;
        // }
        // 创建激励视频广告实例，提前初始化
        this.videoAd = tt.createRewardedVideoAd({
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
    //停止录屏
    TtMgr.prototype.stopRecorder = function () {
        console.log("停止录屏了！：" + this.videoPath);
        this.recorder.stop();
    };
    //开始录屏
    TtMgr.prototype.startRecorder = function () {
        var self = this;
        tt.getSystemInfo({
            success: function (res) {
                var screenWidth = res.screenWidth;
                var screenHeight = res.screenHeight;
                self.recorder = tt.getGameRecorderManager();
                var maskInfo = self.recorder.getMark();
                var x = (screenWidth - maskInfo.markWidth) / 2; //提出来
                var y = (screenHeight - maskInfo.markHeight) / 2; //提出来
                self.recorder.onStart(function (res) {
                    console.log("录屏开始");
                    // do something;
                });
                self.recorder.onStop(function (res) {
                    console.log("地址：" + res.videoPath);
                    self.videoPath = res.videoPath;
                    // do somethine;
                });
                //添加水印并且居中处理
                self.recorder.start({
                    duration: 300,
                    isMarkOpen: true,
                    locLeft: x,
                    locTop: y,
                });
            },
        });
    };
    //分享录屏
    TtMgr.prototype.shareVideo = function (endf, mcaller) {
        var self = this;
        if (endf != null && mcaller != null) {
            this.caller = mcaller;
            this.endFunc = endf;
        }
        tt.shareAppMessage({
            title: "这款空战游戏，太好玩了。",
            channel: "video",
            desc: "这个空战游戏有难度，多数人卡在了第三关。",
            extra: {
                videoPath: self.videoPath,
                videoTopics: ["解压小游戏", "休闲游戏", "烧脑挑战大游戏", "怀旧游戏", "手游", "战斗", "飞机大战"],
            },
            success: function (res) {
                self.endFunc.call(self.caller);
                self.videoPath = null;
                self.caller = null;
                self.endFunc = null;
            },
            fail: function (e) {
                tt.showModal({
                    title: "分享失败",
                    //   content: JSON.stringify(e),
                    content: "视频分享失败"
                });
            },
        });
        // // 视频分享
        // tt.shareAppMessage({
        //   channel: "video",
        //   query: "",
        //   templateId: "输入你自己的", // 替换成通过审核的分享ID
        //   title: "这款空战游戏，太好玩了。",
        //   desc: "这个空战游戏有难度，多数人卡在了第三关。",
        //   extra: {
        //     videoPath: self.videoPath, // 可用录屏得到的本地文件路径
        //     videoTopics: ["反正我最多打8900分，你不服来试试。"],
        //     withVideoId: true,
        //     defaultBgm: "https://v.douyin.com/ePWkgEC/", //这里传入你获取的 PGC 音乐地址
        //   },
        //   success() {
        //     console.log("分享视频成功");
        //    self.videoPath=null
        //    self.endFunc.call(self.caller)
        //    self.caller=null
        //    self.endFunc=null
        //     // tt.showToast({
        //     // //  title: "满血复活",
        //     //   duration: 2000,
        //     //   success(res) {
        //     //     // console.log(`${res}`);
        //     //   },
        //     //   fail(res) {
        //     //     console.log(`showToast调用失败`);
        //     //   },
        //     // });
        //   },
        //   fail(e) {
        //     console.log("分享视频失败", e);
        //   },
        // });
    };
    //分享奖励
    TtMgr.prototype.shareAppMessage = function (str) {
        // var what = str
        // var self = this
        // tt.shareAppMessage({
        //   templateId: "输入你自己的", // 替换成通过审核的分享ID
        //   query: "",
        //   // title: "一款魔性的弹球游戏",
        //   // desc: "反正我只能打到"+self.num_score+"分",
        //   // imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
        //   success() {
        //     console.log("分享成功");
        //     switch (what) {
        //       case "jiaqiu":
        //         self.isJiaQiu = true
        //         self.layer_home.getChildByName("jiaqiu").getComponent(cc.Label).string = "已获取开局奖励！"
        //         tt.showToast({
        //           title: "开局加5个球",
        //           duration: 2000,
        //           success(res) {
        //             // console.log(`${res}`);
        //           },
        //           fail(res) {
        //             console.log(`showToast调用失败`);
        //           },
        //         });
        //         break
        //       case "jiabaoshi":
        //      //   self.shuaxZhuanShi(150, true)
        //         tt.showToast({
        //           title: "获得150钻石！！！",
        //           duration: 2000,
        //           success(res) {
        //             // console.log(`${res}`);
        //           },
        //           fail(res) {
        //             console.log(`showToast调用失败`);
        //           },
        //         });
        //         break
        //       default:
        //         break
        //     }
        //   },
        //   fail(e) {
        //     console.log("分享失败");
        //   },
        // });
    };
    // Video.js//显示复活视频广告
    TtMgr.prototype.showVideoAd = function (key, endf, mcaller) {
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
                console.log(err);
                console.log('激励视频 广告显示失败');
                // this.adResult.string = '激励视频 广告显示失败';
                // this.adResult.node.parent.active = true;
            });
        });
    };
    TtMgr.prototype.login_app = function (isForce, endf, mcaller) {
        var self = this;
        if (endf != null && mcaller != null) {
            self.caller = mcaller;
            self.endFunc = endf;
        }
        console.log("登录操作");
        tt.login({
            force: isForce,
            success: function (res) {
                console.log("login 调用成功");
                self.endFunc.call(self.caller, res.isLogin);
                self.caller = null;
                self.endFunc = null;
            },
            fail: function (res) {
                self.endFunc.call(self.caller, false);
                self.caller = null;
                self.endFunc = null;
                console.log("login 调用失败" + res.errMsg);
            },
            complete: function (res) {
                console.log("login complete");
            }
        });
    };
    // //实名认证
    TtMgr.prototype.realNameAuth = function () {
        tt.authenticateRealName({
            success: function (_res) {
                console.log("用户实名认证成功");
            },
            fail: function (res) {
                console.log("用户实名认证失败", res.errMsg);
            },
        });
    };
    TtMgr.prototype.onDestroy = function () {
        if (TtMgr_1.Instance === this) {
            TtMgr_1.Instance = null;
        }
    };
    var TtMgr_1;
    TtMgr.Instance = null;
    TtMgr = TtMgr_1 = __decorate([
        ccclass
    ], TtMgr);
    return TtMgr;
}(cc.Component));
exports.default = TtMgr;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFR0TWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUFtQyx5QkFBWTtJQUEvQztRQUFBLHFFQW9lQztRQS9kUyxVQUFJLEdBQVcsaUJBQWlCLENBQUE7UUFHeEMsTUFBTTtRQUNFLGFBQU8sR0FBUSxJQUFJLENBQUMsQ0FBQSxJQUFJO1FBQ3hCLFlBQU0sR0FBUSxJQUFJLENBQUEsQ0FBQSxNQUFNO1FBRXhCLGNBQVEsR0FBRyxJQUFJLENBQUEsQ0FBQyxJQUFJO1FBQ3BCLGVBQVMsR0FBRyxJQUFJLENBQUEsQ0FBRSxNQUFNO1FBQ3hCLGFBQU8sR0FBRyxJQUFJLENBQUEsQ0FBSyxTQUFTO1FBQzVCLGNBQVEsR0FBRyxJQUFJLENBQUEsQ0FBTSxVQUFVO1FBQy9CLGlCQUFXLEdBQUcsSUFBSSxDQUFBO1FBQ2xCLGtCQUFZLEdBQUcsSUFBSSxDQUFBO1FBQ25CLG9CQUFjLEdBQUcsSUFBSSxDQUFBLENBQUssTUFBTTtRQUVoQyxZQUFNLEdBQVcsSUFBSSxDQUFBOztRQStjN0IsaUJBQWlCO0lBQ25CLENBQUM7Y0FwZW9CLEtBQUs7SUF1QnhCLHdCQUF3QjtJQUV4QixzQkFBTSxHQUFOO1FBQ0UsSUFBSSxDQUFDLE9BQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNsRCxPQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUN2QjthQUNJO1lBQ0gsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsT0FBTztTQUNSO1FBRUQsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFO1lBQ2IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1NBQ2hCO0lBQ0gsQ0FBQztJ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RyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxRQUFRLFlBQUMsR0FBRztnQkFFVixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFaEMsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxTQUFTO0lBQ0QsNEJBQVksR0FBcEI7UUFDRSxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDdEIsT0FBTyxZQUFDLElBQUk7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBQ0QsSUFBSSxZQUFDLEdBQUc7Z0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QseUJBQVMsR0FBVDtRQUNFLElBQUksT0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDM0IsT0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDdkI7SUFDSCxDQUFDOztJQWplYSxjQUFRLEdBQVUsSUFBSSxDQUFDO0lBRGxCLEtBQUs7UUFEekIsT0FBTztPQUNhLEtBQUssQ0FvZXpCO0lBQUQsWUFBQztDQXBlRCxBQW9lQyxDQXBla0MsRUFBRSxDQUFDLFNBQVMsR0FvZTlDO2tCQXBlb0IsS0FBSyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR0TWdyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBUdE1nciA9IG51bGw7XHJcblxyXG5cclxuXHJcbiAgcHJpdmF0ZSB0ZXh0OiBzdHJpbmcgPSBcIui/measvuepuuaImOa4uOaIjyzmiJHmnIDlpJrmiZPliLDnrKw25YWzXCJcclxuXHJcblxyXG4gIC8v5Zue6LCD5pa55rOVXHJcbiAgcHJpdmF0ZSBlbmRGdW5jOiBhbnkgPSBudWxsOy8v5Ye95pWwXHJcbiAgcHJpdmF0ZSBjYWxsZXI6IGFueSA9IG51bGwvL3RoaXNcclxuXHJcbiAgcHJpdmF0ZSByZWNvcmRlciA9IG51bGwgLy/lvZXlsY9cclxuICBwcml2YXRlIHZpZGVvUGF0aCA9IG51bGwgIC8v5b2V5bGP5Zyw5Z2AXHJcbiAgcHJpdmF0ZSB2aWRlb0FkID0gbnVsbCAgICAgLy8g5r+A5Yqx6KeG6aKR5bm/5ZGKXHJcbiAgcHJpdmF0ZSBiYW5uZXJBZCA9IG51bGwgICAgICAvL2Jhbm5lcuW5v+WRilxyXG4gIHByaXZhdGUgd2luZG93V2lkdGggPSBudWxsXHJcbiAgcHJpdmF0ZSB3aW5kb3dIZWlnaHQgPSBudWxsXHJcbiAgcHJpdmF0ZSBpbnRlcnN0aXRpYWxBZCA9IG51bGwgICAgIC8v5o+S5bGP5bm/5ZGKXHJcblxyXG4gIHByaXZhdGUga2V5VGFnOiBzdHJpbmcgPSBudWxsXHJcblxyXG5cclxuICAvLyBMSUZFLUNZQ0xFIENBTExCQUNLUzpcclxuXHJcbiAgb25Mb2FkKCkge1xuICAgIGlmICghVHRNZ3IuSW5zdGFuY2UgfHwgIWNjLmlzVmFsaWQoVHRNZ3IuSW5zdGFuY2UpKSB7XG4gICAgICBUdE1nci5JbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpbmRvdy50dCkge1xyXG4gICAgICB0aGlzLmluaXRHYW1lKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXJ0KCkge1xyXG5cclxuICB9XHJcbiAgcHJpdmF0ZSBpbml0R2FtZSgpIHtcclxuICAgIC8vICB2YXIgc2VsZiA9IHRoaXNcclxuXHJcblxyXG4gICAgLy8gICB0aGlzLmxvZ2luX2FwcChmYWxzZSkvL+WIpOaWreeZu+W9lVxyXG5cclxuXHJcblxyXG5cclxuICAgIHRoaXMuaW5pdFZpZGVvQWQoKTsgICAgICAgICAgICAgICAgIC8vIOa/gOWKseinhumikeWIneWni+WMliAgICAgIFxyXG4gICAgLy8gdGhpcy5pbml0QmFubmVyQWQoKSAgICAgICAgICAgICAgIC8vYmFubmVy5Yid5aeL5YyWXHJcbiAgICB0aGlzLkludGVyc3RpdGlhbEFkKCkgICAgICAgICAgICAgIC8v5o+S5bGP5bm/5ZGK5Yid5aeL5YyWXHJcblxyXG4gIH1cclxuXHJcblxyXG5cclxuICAvLyB0aGlzLmdhbWVSZWNvcmRlcigpXHJcblxyXG5cclxuICBwdWJsaWMgb25Mb2FkX3ZpZGVvKCkge1xyXG4gICAgY29uc29sZS5sb2coXCLlub/lkYrnu4Tku7bliqDovb3miJDlip9cIik7XHJcblxyXG4gICAgdGhpcy52aWRlb0FkLmxvYWQoKVxyXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnZpZGVvQWQuc2hvdygpKVxyXG4gICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVyci5lcnJNc2cpKTtcclxuXHJcbiAgfVxyXG5cclxuXHJcbiAgcHVibGljIG9mZkxvYWRfdm9kZW8oKSB7XHJcbiAgICB0aGlzLnZpZGVvQWQub2ZmTG9hZCgoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwibG9hZCDnm5HlkKzlmajljbjovb3miJDlip9cIik7XHJcblxyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gIH1cclxuICAvL+aPkuWxj+W5v+WRilxyXG4gIHB1YmxpYyBJbnRlcnN0aXRpYWxBZCgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpc1xyXG4gICAgdGhpcy5pbnRlcnN0aXRpYWxBZCA9IHR0LmNyZWF0ZUludGVyc3RpdGlhbEFkKHtcclxuICAgICAgYWRVbml0SWQ6IFwi5aGr5YaZ5L2g6Ieq5bex55qEaWRcIixcclxuICAgIH0pO1xyXG4gICAgLy8gIHRoaXMuaW50ZXJzdGl0aWFsQWQubG9hZCgpXHJcbiAgICB0aGlzLmludGVyc3RpdGlhbEFkLm9uQ2xvc2UoKCkgPT4ge1xyXG4gICAgICBzZWxmLmludGVyc3RpdGlhbEFkLmxvYWQoKTtcclxuICAgIH0pXHJcblxyXG4gIH1cclxuICBwdWJsaWMgc2hvd0ludGVyc3RpdGlhbEFkKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzXHJcblxyXG4gICAgdGhpcy5pbnRlcnN0aXRpYWxBZC5sb2FkKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHNlbGYuaW50ZXJzdGl0aWFsQWQuc2hvdygpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCLmj5LlsY/lub/lkYrlsZXnpLrmiJDlip9cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvL2Jhbm5lcuW5v+WRilxyXG4gIHB1YmxpYyBpbml0QmFubmVyQWQoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXNcclxuICAgIGNvbnN0IHsgd2luZG93V2lkdGgsIHdpbmRvd0hlaWdodCB9ID0gdHQuZ2V0U3lzdGVtSW5mb1N5bmMoKTtcclxuICAgIGNvbnN0IHRhcmdldEJhbm5lckFkV2lkdGggPSAyMDA7XHJcblxyXG4gICAgLy8g5Yib5bu65LiA5Liq5bGF5LqO5bGP5bmV5bqV6YOo5q2j5Lit55qE5bm/5ZGKXHJcblxyXG4gICAgc2VsZi5iYW5uZXJBZCA9IHR0LmNyZWF0ZUJhbm5lckFkKHtcclxuICAgICAgYWRVbml0SWQ6IFwi5aGr5YaZ5L2g6Ieq5bex55qEaWRcIixcclxuICAgICAgc3R5bGU6IHtcclxuICAgICAgICB3aWR0aDogdGFyZ2V0QmFubmVyQWRXaWR0aCxcclxuICAgICAgICB0b3A6IHdpbmRvd0hlaWdodCAtICh0YXJnZXRCYW5uZXJBZFdpZHRoIC8gMTYpICogOSwgLy8g5qC55o2u57O757uf57qm5a6a5bC65a+46K6h566X5Ye65bm/5ZGK6auY5bqmXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIC8vIOS5n+WPr+S7peaJi+WKqOS/ruaUueWxnuaAp+S7peiwg+aVtOW5v+WRiuWwuuWvuFxyXG4gICAgc2VsZi5iYW5uZXJBZC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1dpZHRoIC0gdGFyZ2V0QmFubmVyQWRXaWR0aCkgLyAyO1xyXG5cclxuICAgIC8vIOWwuuWvuOiwg+aVtOaXtuS8muinpuWPkeWbnuiwg++8jOmAmui/h+Wbnuiwg+aLv+WIsOeahOW5v+WRiuecn+WunuWuvemrmOWGjei/m+ihjOWumuS9jemAgumFjeWkhOeQhlxyXG4gICAgLy8g5rOo5oSP77ya5aaC5p6c5Zyo5Zue6LCD6YeM5YaN5qyh6LCD5pW05bC65a+477yM6KaB56Gu5L+d5LiN6KaB6Kem5Y+R5q275b6q546v77yB77yB77yBXHJcbiAgICBzZWxmLmJhbm5lckFkLm9uUmVzaXplKChzaXplKSA9PiB7XHJcbiAgICAgIC8vIGdvb2RcclxuICAgICAgY29uc29sZS5sb2coc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xyXG4gICAgICBzZWxmLmJhbm5lckFkLnN0eWxlLnRvcCA9IHdpbmRvd0hlaWdodCAtIHNpemUuaGVpZ2h0O1xyXG4gICAgICBzZWxmLmJhbm5lckFkLnN0eWxlLmxlZnQgPSAod2luZG93V2lkdGggLSBzaXplLndpZHRoKSAvIDI7XHJcblxyXG4gICAgICAvLyBiYWTvvIzkvJrop6blj5Hmrbvlvqrnjq9cclxuICAgICAgLy8gYmFubmVyQWQuc3R5bGUud2lkdGgrKztcclxuICAgIH0pO1xyXG4gICAgc2VsZi5iYW5uZXJBZC5vbkxvYWQoKCkgPT4ge1xyXG4gICAgICBzZWxmLmJhbm5lckFkXHJcbiAgICAgICAgLnNob3coKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5bm/5ZGK5pi+56S65oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5bm/5ZGK57uE5Lu25Ye6546w6Zeu6aKYXCIsIGVycik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuXHJcbiAgLy/lhbPpl63mv4DlirHop4bpopHnmoTlm57osIPjgIHjgIHlpI3mtLtcclxuICAvLyBwdWJsaWMgIG9uQ2xvc2VfdmlkZW8oKSB7XHJcbiAgLy8gICB0aGlzLnZpZGVvQWQub25DbG9zZShyZXMgPT4ge1xyXG4gIC8vICAgICBjb25zb2xlLmxvZygn56ys5LiA5Liq6KeG6aKR5Zue6LCDJylcclxuICAvLyAgICAgaWYgKHJlcyAmJiByZXMuaXNFbmRlZCB8fCByZXMgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vICAgICAvLyAgdGhpcy5mdUh1bygpXHJcbiAgLy8gICAgICAgY29uc29sZS5sb2coXCLop4bpopHlm57osIPmiJDlip9cIik7XHJcbiAgLy8gICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgY29uc29sZS5sb2coXCLlpI3mtLvop4bpopHlm57osIPlpLHotKVcIik7XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH0pXHJcblxyXG4gIC8vIH1cclxuICAvL+a/gOWKseinhumikeW5v+WRilxyXG4gIHB1YmxpYyBpbml0VmlkZW9BZCgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpc1xyXG4gICAgLy8gaWYgKHR5cGVvZiB0dCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8g5Yib5bu65r+A5Yqx6KeG6aKR5bm/5ZGK5a6e5L6L77yM5o+Q5YmN5Yid5aeL5YyWXHJcbiAgICB0aGlzLnZpZGVvQWQgPSB0dC5jcmVhdGVSZXdhcmRlZFZpZGVvQWQoe1xyXG4gICAgICBhZFVuaXRJZDogJ+Whq+WGmeS9oOiHquW3seeahGlkJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy52aWRlb0FkLm9uRXJyb3IoZXJyID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ+a/gOWKseinhumikeWxleekuuWksei0pScpO1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG5cclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnZpZGVvQWQub25DbG9zZShyZXMgPT4ge1xyXG4gICAgICAvLyDnlKjmiLfngrnlh7vkuobjgJDlhbPpl63lub/lkYrjgJHmjInpkq5cclxuICAgICAgLy8g5bCP5LqOIDIuMS4wIOeahOWfuuehgOW6k+eJiOacrO+8jHJlcyDmmK/kuIDkuKogdW5kZWZpbmVkXHJcbiAgICAgIGlmIChyZXMgJiYgcmVzLmlzRW5kZWQgfHwgcmVzID09PSB1bmRlZmluZWQpIHtcclxuXHJcblxyXG5cclxuICAgICAgICBzd2l0Y2ggKHNlbGYua2V5VGFnKSB7XHJcbiAgICAgICAgICBjYXNlIFwiZnVodW9cIjpcclxuICAgICAgICAgICAgc2VsZi5lbmRGdW5jLmNhbGwoc2VsZi5jYWxsZXIpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIFwiZ2FtZV9tZWRhbFwiOlxyXG4gICAgICAgICAgICBzZWxmLmVuZEZ1bmMuY2FsbChzZWxmLmNhbGxlciwgc2VsZi5rZXlUYWcsIDgwKS8v55yL6KeG6aKR57uZ5YuL56ugXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIFwiZ2FtZV9nb2xkXCI6XHJcbiAgICAgICAgICAgIHNlbGYuZW5kRnVuYy5jYWxsKHNlbGYuY2FsbGVyLCBzZWxmLmtleVRhZywgMzAwKS8v55yL6KeG6aKR57uZ6YeR5biBXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgY2FzZSBcImtleXNfc2h1YW5nYmVpXCI6XHJcbiAgICAgICAgICAgIHNlbGYuZW5kRnVuYy5jYWxsKHNlbGYuY2FsbGVyKS8v5Y+M5YCN6aKG5Y+WXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG5cclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHNlbGYuZW5kRnVuYy5jYWxsKHNlbGYuY2FsbGVyKS8v5Y+M5YCN6aKG5Y+WXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIOato+W4uOaSreaUvue7k+adn++8jOWPr+S7peS4i+WPkea4uOaIj+WlluWKsVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCflpZblirHlt7Lnu4/lj5HmlL4nKTtcclxuICAgICAgICBzZWxmLmVuZEZ1bmMgPSBudWxsXHJcbiAgICAgICAgc2VsZi5jYWxsZXIgPSBudWxsXHJcbiAgICAgICAgc2VsZi5rZXlUYWcgPSBudWxsXHJcblxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIOaPkOWJjeWFs+mXreW5v+WRiu+8jOS4jeWPkeaUvuWlluWKsVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCflm6Dmkq3mlL7kuK3pgJTpgIDlh7rvvIzmiYDku6XkuI3kuIvlj5HmuLjmiI/lpZblirEnKTtcclxuXHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBjYy5hdWRpb0VuZ2luZS5wYXVzZU11c2ljKCk7ICAgICAgICAgICAgLy8g5YWI5by65Yi25pqC5YGcXHJcbiAgICAgIGNjLmF1ZGlvRW5naW5lLnJlc3VtZU11c2ljKCk7ICAgICAgICAgICAvLyDlho3mgaLlpI3mkq3mlL7pn7PkuZAgXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvL+WBnOatouW9leWxj1xyXG4gIHB1YmxpYyBzdG9wUmVjb3JkZXIoKSB7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCLlgZzmraLlvZXlsY/kuobvvIHvvJpcIiArIHRoaXMudmlkZW9QYXRoKTtcclxuXHJcblxyXG5cclxuICAgIHRoaXMucmVjb3JkZXIuc3RvcCgpO1xyXG4gIH1cclxuICAvL+W8gOWni+W9leWxj1xyXG4gIHB1YmxpYyBzdGFydFJlY29yZGVyKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdHQuZ2V0U3lzdGVtSW5mbyh7XHJcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XHJcbiAgICAgICAgY29uc3Qgc2NyZWVuV2lkdGggPSByZXMuc2NyZWVuV2lkdGg7XHJcbiAgICAgICAgY29uc3Qgc2NyZWVuSGVpZ2h0ID0gcmVzLnNjcmVlbkhlaWdodDtcclxuICAgICAgICBzZWxmLnJlY29yZGVyID0gdHQuZ2V0R2FtZVJlY29yZGVyTWFuYWdlcigpO1xyXG4gICAgICAgIHZhciBtYXNrSW5mbyA9IHNlbGYucmVjb3JkZXIuZ2V0TWFyaygpO1xyXG4gICAgICAgIHZhciB4ID0gKHNjcmVlbldpZHRoIC0gbWFza0luZm8ubWFya1dpZHRoKSAvIDI7ICAvL+aPkOWHuuadpVxyXG4gICAgICAgIHZhciB5ID0gKHNjcmVlbkhlaWdodCAtIG1hc2tJbmZvLm1hcmtIZWlnaHQpIC8gMjsvL+aPkOWHuuadpVxyXG5cclxuICAgICAgICBzZWxmLnJlY29yZGVyLm9uU3RhcnQoKHJlcykgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCLlvZXlsY/lvIDlp4tcIik7XHJcbiAgICAgICAgICAvLyBkbyBzb21ldGhpbmc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5yZWNvcmRlci5vblN0b3AoKHJlcykgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCLlnLDlnYDvvJpcIiArIHJlcy52aWRlb1BhdGgpO1xyXG4gICAgICAgICAgc2VsZi52aWRlb1BhdGggPSByZXMudmlkZW9QYXRoXHJcbiAgICAgICAgICAvLyBkbyBzb21ldGhpbmU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy/mt7vliqDmsLTljbDlubbkuJTlsYXkuK3lpITnkIZcclxuICAgICAgICBzZWxmLnJlY29yZGVyLnN0YXJ0KHtcclxuICAgICAgICAgIGR1cmF0aW9uOiAzMDAsXHJcbiAgICAgICAgICBpc01hcmtPcGVuOiB0cnVlLFxyXG4gICAgICAgICAgbG9jTGVmdDogeCwvL+aPkOWHuuadpVxyXG4gICAgICAgICAgbG9jVG9wOiB5LC8v5o+Q5Ye65p2lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8v5YiG5Lqr5b2V5bGPXHJcbiAgcHVibGljIHNoYXJlVmlkZW8oZW5kZj86IGFueSwgbWNhbGxlcj8pIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzXHJcbiAgICBpZiAoZW5kZiAhPSBudWxsICYmIG1jYWxsZXIgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmNhbGxlciA9IG1jYWxsZXJcclxuICAgICAgdGhpcy5lbmRGdW5jID0gZW5kZlxyXG5cclxuICAgIH1cclxuICAgIHR0LnNoYXJlQXBwTWVzc2FnZSh7XHJcbiAgICAgIHRpdGxlOiBcIui/measvuepuuaImOa4uOaIj++8jOWkquWlveeOqeS6huOAglwiLFxyXG4gICAgICBjaGFubmVsOiBcInZpZGVvXCIsXHJcbiAgICAgIGRlc2M6IFwi6L+Z5Liq56m65oiY5ri45oiP5pyJ6Zq+5bqm77yM5aSa5pWw5Lq65Y2h5Zyo5LqG56ys5LiJ5YWz44CCXCIsXHJcbiAgICAgIGV4dHJhOiB7XHJcbiAgICAgICAgdmlkZW9QYXRoOiBzZWxmLnZpZGVvUGF0aCwgLy8g5Y+v55So5b2V5bGP5b6X5Yiw55qE5pys5Zyw5paH5Lu26Lev5b6EXHJcbiAgICAgICAgdmlkZW9Ub3BpY3M6IFtcIuino+WOi+Wwj+a4uOaIj1wiLFwi5LyR6Zey5ri45oiPXCIsXCLng6fohJHmjJHmiJjlpKfmuLjmiI9cIixcIuaAgOaXp+a4uOaIj1wiLCBcIuaJi+a4uFwiLCBcIuaImOaWl1wiLCBcIumjnuacuuWkp+aImFwiXSxcclxuICAgICAgIC8vIHdpdGhWaWRlb0lkOiB0cnVlLFxyXG4gICAgICAgLy8gZGVmYXVsdEJnbTogXCJodHRwczovL3YuZG91eWluLmNvbS9lUFdrZ0VDL1wiLCAvL+i/memHjOS8oOWFpeS9oOiOt+WPlueahCBQR0Mg6Z+z5LmQ5Zyw5Z2AXHJcbiAgICAgIH0sXHJcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XHJcbiAgICAgICAgc2VsZi5lbmRGdW5jLmNhbGwoc2VsZi5jYWxsZXIpXHJcbiAgICAgICAgc2VsZi52aWRlb1BhdGggPSBudWxsXHJcbiAgICAgICAgc2VsZi5jYWxsZXIgPSBudWxsXHJcbiAgICAgICAgc2VsZi5lbmRGdW5jID0gbnVsbFxyXG5cclxuICAgICAgfSxcclxuICAgICAgZmFpbChlKSB7XHJcbiAgICAgICAgdHQuc2hvd01vZGFsKHtcclxuICAgICAgICAgIHRpdGxlOiBcIuWIhuS6q+Wksei0pVwiLFxyXG4gICAgICAgICAgLy8gICBjb250ZW50OiBKU09OLnN0cmluZ2lmeShlKSxcclxuICAgICAgICAgIGNvbnRlbnQ6IFwi6KeG6aKR5YiG5Lqr5aSx6LSlXCJcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyAvLyDop4bpopHliIbkuqtcclxuICAgIC8vIHR0LnNoYXJlQXBwTWVzc2FnZSh7XHJcbiAgICAvLyAgIGNoYW5uZWw6IFwidmlkZW9cIixcclxuICAgIC8vICAgcXVlcnk6IFwiXCIsXHJcbiAgICAvLyAgIHRlbXBsYXRlSWQ6IFwi6L6T5YWl5L2g6Ieq5bex55qEXCIsIC8vIOabv+aNouaIkOmAmui/h+WuoeaguOeahOWIhuS6q0lEXHJcbiAgICAvLyAgIHRpdGxlOiBcIui/measvuepuuaImOa4uOaIj++8jOWkquWlveeOqeS6huOAglwiLFxyXG4gICAgLy8gICBkZXNjOiBcIui/meS4quepuuaImOa4uOaIj+aciemavuW6pu+8jOWkmuaVsOS6uuWNoeWcqOS6huesrOS4ieWFs+OAglwiLFxyXG4gICAgLy8gICBleHRyYToge1xyXG4gICAgLy8gICAgIHZpZGVvUGF0aDogc2VsZi52aWRlb1BhdGgsIC8vIOWPr+eUqOW9leWxj+W+l+WIsOeahOacrOWcsOaWh+S7tui3r+W+hFxyXG4gICAgLy8gICAgIHZpZGVvVG9waWNzOiBbXCLlj43mraPmiJHmnIDlpJrmiZM4OTAw5YiG77yM5L2g5LiN5pyN5p2l6K+V6K+V44CCXCJdLFxyXG4gICAgLy8gICAgIHdpdGhWaWRlb0lkOiB0cnVlLFxyXG4gICAgLy8gICAgIGRlZmF1bHRCZ206IFwiaHR0cHM6Ly92LmRvdXlpbi5jb20vZVBXa2dFQy9cIiwgLy/ov5nph4zkvKDlhaXkvaDojrflj5bnmoQgUEdDIOmfs+S5kOWcsOWdgFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBzdWNjZXNzKCkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwi5YiG5Lqr6KeG6aKR5oiQ5YqfXCIpO1xyXG5cclxuICAgIC8vICAgIHNlbGYudmlkZW9QYXRoPW51bGxcclxuXHJcbiAgICAvLyAgICBzZWxmLmVuZEZ1bmMuY2FsbChzZWxmLmNhbGxlcilcclxuICAgIC8vICAgIHNlbGYuY2FsbGVyPW51bGxcclxuICAgIC8vICAgIHNlbGYuZW5kRnVuYz1udWxsXHJcblxyXG5cclxuICAgIC8vICAgICAvLyB0dC5zaG93VG9hc3Qoe1xyXG4gICAgLy8gICAgIC8vIC8vICB0aXRsZTogXCLmu6HooYDlpI3mtLtcIixcclxuICAgIC8vICAgICAvLyAgIGR1cmF0aW9uOiAyMDAwLFxyXG4gICAgLy8gICAgIC8vICAgc3VjY2VzcyhyZXMpIHtcclxuXHJcbiAgICAvLyAgICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGAke3Jlc31gKTtcclxuICAgIC8vICAgICAvLyAgIH0sXHJcbiAgICAvLyAgICAgLy8gICBmYWlsKHJlcykge1xyXG4gICAgLy8gICAgIC8vICAgICBjb25zb2xlLmxvZyhgc2hvd1RvYXN06LCD55So5aSx6LSlYCk7XHJcbiAgICAvLyAgICAgLy8gICB9LFxyXG4gICAgLy8gICAgIC8vIH0pO1xyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBmYWlsKGUpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+inhumikeWksei0pVwiLCBlKTtcclxuXHJcblxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG4gIC8v5YiG5Lqr5aWW5YqxXHJcbiAgcHVibGljIHNoYXJlQXBwTWVzc2FnZShzdHIpIHtcclxuXHJcbiAgICAvLyB2YXIgd2hhdCA9IHN0clxyXG4gICAgLy8gdmFyIHNlbGYgPSB0aGlzXHJcbiAgICAvLyB0dC5zaGFyZUFwcE1lc3NhZ2Uoe1xyXG4gICAgLy8gICB0ZW1wbGF0ZUlkOiBcIui+k+WFpeS9oOiHquW3seeahFwiLCAvLyDmm7/mjaLmiJDpgJrov4flrqHmoLjnmoTliIbkuqtJRFxyXG4gICAgLy8gICBxdWVyeTogXCJcIixcclxuICAgIC8vICAgLy8gdGl0bGU6IFwi5LiA5qy+6a2U5oCn55qE5by555CD5ri45oiPXCIsXHJcbiAgICAvLyAgIC8vIGRlc2M6IFwi5Y+N5q2j5oiR5Y+q6IO95omT5YiwXCIrc2VsZi5udW1fc2NvcmUrXCLliIZcIixcclxuICAgIC8vICAgLy8gaW1hZ2VVcmw6IGNjLnVybC5yYXcoJ3Jlc291cmNlcy9pbWcvZ2FtZVBsYXlpbmcvMS5wbmcnKSxcclxuXHJcbiAgICAvLyAgIHN1Y2Nlc3MoKSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCLliIbkuqvmiJDlip9cIik7XHJcbiAgICAvLyAgICAgc3dpdGNoICh3aGF0KSB7XHJcbiAgICAvLyAgICAgICBjYXNlIFwiamlhcWl1XCI6XHJcblxyXG4gICAgLy8gICAgICAgICBzZWxmLmlzSmlhUWl1ID0gdHJ1ZVxyXG4gICAgLy8gICAgICAgICBzZWxmLmxheWVyX2hvbWUuZ2V0Q2hpbGRCeU5hbWUoXCJqaWFxaXVcIikuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBcIuW3suiOt+WPluW8gOWxgOWlluWKse+8gVwiXHJcblxyXG4gICAgLy8gICAgICAgICB0dC5zaG93VG9hc3Qoe1xyXG4gICAgLy8gICAgICAgICAgIHRpdGxlOiBcIuW8gOWxgOWKoDXkuKrnkINcIixcclxuICAgIC8vICAgICAgICAgICBkdXJhdGlvbjogMjAwMCxcclxuXHJcbiAgICAvLyAgICAgICAgICAgc3VjY2VzcyhyZXMpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAke3Jlc31gKTtcclxuICAgIC8vICAgICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICAgIGZhaWwocmVzKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhgc2hvd1RvYXN06LCD55So5aSx6LSlYCk7XHJcbiAgICAvLyAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vICAgICAgICAgYnJlYWtcclxuICAgIC8vICAgICAgIGNhc2UgXCJqaWFiYW9zaGlcIjpcclxuICAgIC8vICAgICAgLy8gICBzZWxmLnNodWF4Wmh1YW5TaGkoMTUwLCB0cnVlKVxyXG4gICAgLy8gICAgICAgICB0dC5zaG93VG9hc3Qoe1xyXG4gICAgLy8gICAgICAgICAgIHRpdGxlOiBcIuiOt+W+lzE1MOmSu+efs++8ge+8ge+8gVwiLFxyXG4gICAgLy8gICAgICAgICAgIGR1cmF0aW9uOiAyMDAwLFxyXG4gICAgLy8gICAgICAgICAgIHN1Y2Nlc3MocmVzKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtyZXN9YCk7XHJcbiAgICAvLyAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgICBmYWlsKHJlcykge1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coYHNob3dUb2FzdOiwg+eUqOWksei0pWApO1xyXG4gICAgLy8gICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgICAgICBicmVha1xyXG4gICAgLy8gICAgICAgZGVmYXVsdDpcclxuICAgIC8vICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBmYWlsKGUpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIuWIhuS6q+Wksei0pVwiKTtcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIFZpZGVvLmpzLy/mmL7npLrlpI3mtLvop4bpopHlub/lkYpcclxuICBwdWJsaWMgc2hvd1ZpZGVvQWQoa2V5OiBzdHJpbmcsIGVuZGY/OiBhbnksIG1jYWxsZXI/KSB7XHJcbiAgICBpZiAoIXRoaXMudmlkZW9BZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleVRhZyA9IGtleVxyXG4gICAgaWYgKGVuZGYgIT0gbnVsbCAmJiBtY2FsbGVyICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5jYWxsZXIgPSBtY2FsbGVyXHJcbiAgICAgIHRoaXMuZW5kRnVuYyA9IGVuZGZcclxuXHJcbiAgICB9XHJcbiAgICAvLyDnlKjmiLfop6blj5Hlub/lkYrlkI7vvIzmmL7npLrmv4DlirHop4bpopHlub/lkYpcclxuICAgIHRoaXMudmlkZW9BZC5zaG93KCkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAvLyDlpLHotKXph43or5VcclxuICAgICAgdGhpcy52aWRlb0FkLmxvYWQoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHRoaXMudmlkZW9BZC5zaG93KCkpXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ+a/gOWKseinhumikSDlub/lkYrmmL7npLrlpLHotKUnKTtcclxuXHJcbiAgICAgICAgICAvLyB0aGlzLmFkUmVzdWx0LnN0cmluZyA9ICfmv4DlirHop4bpopEg5bm/5ZGK5pi+56S65aSx6LSlJztcclxuICAgICAgICAgIC8vIHRoaXMuYWRSZXN1bHQubm9kZS5wYXJlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbG9naW5fYXBwKGlzRm9yY2U6IGJvb2xlYW4sIGVuZGY/OiBhbnksIG1jYWxsZXI/KSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXNcclxuICAgIGlmIChlbmRmICE9IG51bGwgJiYgbWNhbGxlciAhPSBudWxsKSB7XHJcbiAgICAgIHNlbGYuY2FsbGVyID0gbWNhbGxlclxyXG4gICAgICBzZWxmLmVuZEZ1bmMgPSBlbmRmXHJcblxyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCLnmbvlvZXmk43kvZxcIilcclxuICAgIHR0LmxvZ2luKHtcclxuICAgICAgZm9yY2U6IGlzRm9yY2UsLy/lvLrliLbosIPnlKhcclxuICAgICAgc3VjY2VzcyhyZXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luIOiwg+eUqOaIkOWKn1wiKTtcclxuXHJcblxyXG4gICAgICAgIHNlbGYuZW5kRnVuYy5jYWxsKHNlbGYuY2FsbGVyLCByZXMuaXNMb2dpbilcclxuICAgICAgICBzZWxmLmNhbGxlciA9IG51bGxcclxuICAgICAgICBzZWxmLmVuZEZ1bmMgPSBudWxsXHJcbiAgICAgIH0sXHJcbiAgICAgIGZhaWwocmVzKSB7XHJcbiAgICAgICAgc2VsZi5lbmRGdW5jLmNhbGwoc2VsZi5jYWxsZXIsIGZhbHNlKVxyXG4gICAgICAgIHNlbGYuY2FsbGVyID0gbnVsbFxyXG4gICAgICAgIHNlbGYuZW5kRnVuYyA9IG51bGxcclxuICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luIOiwg+eUqOWksei0pVwiICsgcmVzLmVyck1zZyk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXBsZXRlKHJlcykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luIGNvbXBsZXRlXCIpO1xyXG5cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIC8v5a6e5ZCN6K6k6K+BXHJcbiAgcHJpdmF0ZSByZWFsTmFtZUF1dGgoKSB7XG4gICAgdHQuYXV0aGVudGljYXRlUmVhbE5hbWUoe1xyXG4gICAgICBzdWNjZXNzKF9yZXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIueUqOaIt+WunuWQjeiupOivgeaIkOWKn1wiKTtcclxuICAgICAgfSxcclxuICAgICAgZmFpbChyZXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIueUqOaIt+WunuWQjeiupOivgeWksei0pVwiLCByZXMuZXJyTXNnKTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cbiAgb25EZXN0cm95KCkge1xuICAgIGlmIChUdE1nci5JbnN0YW5jZSA9PT0gdGhpcykge1xuICAgICAgVHRNZ3IuSW5zdGFuY2UgPSBudWxsO1xuICAgIH1cbiAgfVxuICAvLyB1cGRhdGUgKGR0KSB7fVxufVxuIl19