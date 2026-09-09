const { ccclass, property } = cc._decorator;

@ccclass
export default class WxMgr extends cc.Component {
    public static Instance: WxMgr = null;
    //判断转发三个参数
    private isShared: boolean = false
    private isTimeline: boolean = false
    private shareTag: string = ""
    private closeTime: number = 0

    private text: string = "这款空战游戏,我最多打到第6关"
    //分享时候的封面图片 放你自己的地址
    private picUrl: string = ''

    private videoAd = null     // 激励视频广告
    private interstitialAd = null   //插屏广告
    private keyTag: string = null   //激励视频获取奖励类型
    //回调方法
    private endFunc: any = null;//函数
    private caller: any = null//this
    onLoad() {


        if (!WxMgr.Instance || !cc.isValid(WxMgr.Instance)) {
            WxMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.initGame()//分享的逻辑
            this.initVideoAd()//视频广告
            this.initInterstitialAd()//插屏广告
        }

    }


    // 显示复活视频广告
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
                    console.log('激励视频 广告显示失败')
                })
        })











    }
    public showInterstitialAd() {
      //  console.log('插屏 广告拉取1')
        // 在适合的场景显示插屏广告
        if (this.interstitialAd) {
          //  console.log('插屏 广告拉取')
            this.interstitialAd.show().catch((err) => {
                console.log('插屏 广告拉取失败')
                console.error(err)
            })
        }
    }

    private initInterstitialAd() {



        // 创建插屏广告实例，提前初始化
        if (wx.createInterstitialAd) {
            console.log("广告被创建");

            this.interstitialAd = wx.createInterstitialAd({
                adUnitId: '填写你自己的id'
            })
        }

        this.interstitialAd.onClose(res => {
            console.log('插屏 广告关闭')
        })

       this. interstitialAd.onLoad(() => {
            console.log('插屏 广告加载成功')
        })
       this. interstitialAd.onError(err => {
        console.log('插屏 广告加载失败')
            console.log(err)
        })
    }




    //激励视频广告
    public initVideoAd() {
        var self = this


        // 创建激励视频广告实例，提前初始化
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: '填写你自己的id'
        })

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
                        self.endFunc.call(self.caller, self.keyTag, 300)//看视频给钻石
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




    //游戏分享登录初始化
    private initGame() {
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
            }
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
            }
        });

        //开启监听 返回小程序启动参数（只有第一次激活生效）
        let launchOption = wx.getLaunchOptionsSync();
        console.log('首次开启 launchOption')
        console.log(launchOption);

        //开启监听小游戏回到前台的事件 (分享返回，下拉框返回)
        wx.onShow(function (dt) {
            console.log('回到前台onShow' + "是否分享：" + self.shareTag + "分享的key：" + self.isShared);



            let curTime = new Date().getTime();
            if (curTime - self.closeTime <= 3000) {

                self.isTimeline = false
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                console.log("分享不成功提示<3000");
                wx.showToast({

                    title: '分享失败',

                    icon: 'none',

                    duration: 1500//持续的时间


                })
                return
            }


            if (self.isTimeline) {




                self.closeTime = curTime;
                self.isTimeline = false
                console.log("分享朋友圈成功提示");
                wx.showToast({

                    title: '获得双倍奖励',

                    icon: 'none',

                    duration: 1500//持续的时间


                })

            }


            if (self.isShared && self.shareTag == "keys_fuhuo") {
                //复活操作
                if (self.endFunc) {
                    var caller = self.caller
                    self.endFunc.call(caller)
                }
                //分享成功
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;



                self.endFunc = null
                self.caller = null








            } else if (self.isShared && self.shareTag == "keys_shuangbei") {
                //获得双倍奖励
                if (self.endFunc) {
                    var caller = self.caller
                    self.endFunc.call(caller)
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;


                self.endFunc = null
                self.caller = null


                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({

                    title: '获得了双倍奖励！',

                    icon: 'none',

                    duration: 1500//持续的时间


                })


            } else if (self.isShared && self.shareTag == "game_medal") {//获得勋章
                //获得双倍奖励
                if (self.endFunc) {
                    var caller = self.caller
                    self.endFunc.call(caller, self.shareTag, 80)//加50勋章
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;


                self.endFunc = null
                self.caller = null


                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({

                    title: '获得勋章',

                    icon: 'none',

                    duration: 1500//持续的时间


                })
            } else if (self.isShared && self.shareTag == "game_gold") {//获得钻石
                if (self.endFunc) {
                    var caller = self.caller
                    self.endFunc.call(caller, self.shareTag, 300)//加200钻石
                }
                console.log("分享成功提示");
                self.isShared = false;
                self.shareTag = "";
                self.closeTime = curTime;
                //获得双倍奖励


                self.endFunc = null
                self.caller = null


                //  self.shuaxZhuanShi(500,true)//给500个钻石
                wx.showToast({

                    title: '获得钻石',

                    icon: 'none',

                    duration: 1500//持续的时间


                })
            }

        });


    }



    //主动转发好友
    public shareAppMessage(key: string, endf?: any, mcaller?) {
        this.isShared = true
        this.closeTime = new Date().getTime();
        this.shareTag = key;

        if (endf != null && mcaller != null) {
            this.caller = mcaller
            this.endFunc = endf
        }


        var self = this

        switch (this.shareTag) {
            case "keys_fuhuo":
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,

                    query: 'openid=110',
                });

                break
            case "keys_shuangbei":
                console.log("我是双倍奖励的分享！")
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });


                break


            case "game_medal"://获得勋章
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    //  imageUrl: cc.url.raw('resources/img/gamePlaying/1.png'),
                    query: 'openid=110',
                });

                break
            case "game_gold"://获得钻石
                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });
                break

            case "keys_xuanyao":

                wx.shareAppMessage({
                    title: self.text,
                    imageUrl: self.picUrl,
                    query: 'openid=110',
                });



                break
            default:
                break
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

    }





    start() {


    }

    onDestroy() {
        if (WxMgr.Instance === this) {
            WxMgr.Instance = null;
        }
    }

    // update (dt) {}
}
