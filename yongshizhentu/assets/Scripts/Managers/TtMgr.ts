

const { ccclass, property } = cc._decorator;

@ccclass
export default class TtMgr extends cc.Component {
  public static Instance: TtMgr = null;



  private text: string = "这款空战游戏,我最多打到第6关"


  //回调方法
  private endFunc: any = null;//函数
  private caller: any = null//this

  private recorder = null //录屏
  private videoPath = null  //录屏地址
  private videoAd = null     // 激励视频广告
  private bannerAd = null      //banner广告
  private windowWidth = null
  private windowHeight = null
  private interstitialAd = null     //插屏广告

  private keyTag: string = null


  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    if (!TtMgr.Instance || !cc.isValid(TtMgr.Instance)) {
      TtMgr.Instance = this;
    }
    else {
      this.destroy();
      return;
    }

    if (window.tt) {
      this.initGame()
    }
  }

  start() {

  }
  private initGame() {
    //  var self = this


    //   this.login_app(false)//判断登录




    this.initVideoAd();                 // 激励视频初始化      
    // this.initBannerAd()               //banner初始化
    this.InterstitialAd()              //插屏广告初始化

  }



  // this.gameRecorder()


  public onLoad_video() {
    console.log("广告组件加载成功");

    this.videoAd.load()
      .then(() => this.videoAd.show())
      .catch(err => console.log(err.errMsg));

  }


  public offLoad_vodeo() {
    this.videoAd.offLoad(() => {
      console.log("load 监听器卸载成功");

    });




  }
  //插屏广告
  public InterstitialAd() {
    var self = this
    this.interstitialAd = tt.createInterstitialAd({
      adUnitId: "填写你自己的id",
    });
    //  this.interstitialAd.load()
    this.interstitialAd.onClose(() => {
      self.interstitialAd.load();
    })

  }
  public showInterstitialAd() {
    var self = this

    this.interstitialAd.load()
      .then(() => {
        self.interstitialAd.show().then(() => {
          console.log("插屏广告展示成功");
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //banner广告
  public initBannerAd() {
    var self = this
    const { windowWidth, windowHeight } = tt.getSystemInfoSync();
    const targetBannerAdWidth = 200;

    // 创建一个居于屏幕底部正中的广告

    self.bannerAd = tt.createBannerAd({
      adUnitId: "填写你自己的id",
      style: {
        width: targetBannerAdWidth,
        top: windowHeight - (targetBannerAdWidth / 16) * 9, // 根据系统约定尺寸计算出广告高度
      },
    });
    // 也可以手动修改属性以调整广告尺寸
    self.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;

    // 尺寸调整时会触发回调，通过回调拿到的广告真实宽高再进行定位适配处理
    // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
    self.bannerAd.onResize((size) => {
      // good
      console.log(size.width, size.height);
      self.bannerAd.style.top = windowHeight - size.height;
      self.bannerAd.style.left = (windowWidth - size.width) / 2;

      // bad，会触发死循环
      // bannerAd.style.width++;
    });
    self.bannerAd.onLoad(() => {
      self.bannerAd
        .show()
        .then(() => {
          console.log("广告显示成功");
        })
        .catch((err) => {
          console.log("广告组件出现问题", err);
        });
    });

  }


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
  public initVideoAd() {
    var self = this
    // if (typeof tt === 'undefined') {
    //     return;
    // }

    // 创建激励视频广告实例，提前初始化
    this.videoAd = tt.createRewardedVideoAd({
      adUnitId: '填写你自己的id'
    });

    this.videoAd.onError(err => {
      console.log('激励视频展示失败');
      console.log(err);


    });

    this.videoAd.onClose(res => {
      // 用户点击了【关闭广告】按钮
      // 小于 2.1.0 的基础库版本，res 是一个 undefined
      if (res && res.isEnded || res === undefined) {



        switch (self.keyTag) {
          case "fuhuo":
            self.endFunc.call(self.caller)
            break
          case "game_medal":
            self.endFunc.call(self.caller, self.keyTag, 80)//看视频给勋章
            break
          case "game_gold":
            self.endFunc.call(self.caller, self.keyTag, 300)//看视频给金币
            break

          case "keys_shuangbei":
            self.endFunc.call(self.caller)//双倍领取
            break


          default:
            // self.endFunc.call(self.caller)//双倍领取
            break

        }


        // 正常播放结束，可以下发游戏奖励
        console.log('奖励已经发放');
        self.endFunc = null
        self.caller = null
        self.keyTag = null

      }
      else {
        // 提前关闭广告，不发放奖励
        console.log('因播放中途退出，所以不下发游戏奖励');


      }

      cc.audioEngine.pauseMusic();            // 先强制暂停
      cc.audioEngine.resumeMusic();           // 再恢复播放音乐 
    });
  }


  //停止录屏
  public stopRecorder() {

    console.log("停止录屏了！：" + this.videoPath);



    this.recorder.stop();
  }
  //开始录屏
  public startRecorder() {
    var self = this;
    tt.getSystemInfo({
      success(res) {
        const screenWidth = res.screenWidth;
        const screenHeight = res.screenHeight;
        self.recorder = tt.getGameRecorderManager();
        var maskInfo = self.recorder.getMark();
        var x = (screenWidth - maskInfo.markWidth) / 2;  //提出来
        var y = (screenHeight - maskInfo.markHeight) / 2;//提出来

        self.recorder.onStart((res) => {
          console.log("录屏开始");
          // do something;
        });
        self.recorder.onStop((res) => {
          console.log("地址：" + res.videoPath);
          self.videoPath = res.videoPath
          // do somethine;
        });
        //添加水印并且居中处理
        self.recorder.start({
          duration: 300,
          isMarkOpen: true,
          locLeft: x,//提出来
          locTop: y,//提出来
        });
      },
    });
  }

  //分享录屏
  public shareVideo(endf?: any, mcaller?) {
    const self = this
    if (endf != null && mcaller != null) {
      this.caller = mcaller
      this.endFunc = endf

    }
    tt.shareAppMessage({
      title: "这款空战游戏，太好玩了。",
      channel: "video",
      desc: "这个空战游戏有难度，多数人卡在了第三关。",
      extra: {
        videoPath: self.videoPath, // 可用录屏得到的本地文件路径
        videoTopics: ["解压小游戏","休闲游戏","烧脑挑战大游戏","怀旧游戏", "手游", "战斗", "飞机大战"],
       // withVideoId: true,
       // defaultBgm: "https://v.douyin.com/ePWkgEC/", //这里传入你获取的 PGC 音乐地址
      },
      success(res) {
        self.endFunc.call(self.caller)
        self.videoPath = null
        self.caller = null
        self.endFunc = null

      },
      fail(e) {
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
  }
  //分享奖励
  public shareAppMessage(str) {

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
  }


  // Video.js//显示复活视频广告
  public showVideoAd(key: string, endf?: any, mcaller?) {
    if (!this.videoAd) {
      return;
    }
    this.keyTag = key
    if (endf != null && mcaller != null) {
      this.caller = mcaller
      this.endFunc = endf

    }
    // 用户触发广告后，显示激励视频广告
    this.videoAd.show().catch(() => {
      // 失败重试
      this.videoAd.load()
        .then(() => this.videoAd.show())
        .catch(err => {
          console.log(err);
          console.log('激励视频 广告显示失败');

          // this.adResult.string = '激励视频 广告显示失败';
          // this.adResult.node.parent.active = true;
        })
    });
  }

  public login_app(isForce: boolean, endf?: any, mcaller?) {
    var self = this
    if (endf != null && mcaller != null) {
      self.caller = mcaller
      self.endFunc = endf

    }
    console.log("登录操作")
    tt.login({
      force: isForce,//强制调用
      success(res) {
        console.log("login 调用成功");


        self.endFunc.call(self.caller, res.isLogin)
        self.caller = null
        self.endFunc = null
      },
      fail(res) {
        self.endFunc.call(self.caller, false)
        self.caller = null
        self.endFunc = null
        console.log("login 调用失败" + res.errMsg);
      },
      complete(res) {

        console.log("login complete");

      }
    });
  }
  // //实名认证
  private realNameAuth() {
    tt.authenticateRealName({
      success(_res) {
        console.log("用户实名认证成功");
      },
      fail(res) {
        console.log("用户实名认证失败", res.errMsg);
      },
    });
  }
  onDestroy() {
    if (TtMgr.Instance === this) {
      TtMgr.Instance = null;
    }
  }
  // update (dt) {}
}
