
import { sys } from "cc";
import { AdParam } from "./AdParam";

import { shareDt } from "./shareDt";

export default class TTHelper {
    //激励视频相关参数和回调
    private videoAd = null;
    private videoSucceedCallBack;
    private videoFailCallBack;
    //banner 相关参数
    private bannerAd = null;
    private adIntervals = 30;
    //插屏
    private interstitialAd = null;


    //录屏
    startRecordTime = 0;
    endRecordTime = 0;
    private recorder;
    private videoPath = null;

    isHide = false;

    canReward=true;

    closeHandler({ isEnded }) {
        if(!this.canReward){
            console.log("不知为何重复领取");
            return;
        }
        this.videoAd.offClose(this.closeHandler.bind(this))
        if (!isEnded) {
            this.videoFailCallBack && this.videoFailCallBack();
        } else {
            console.log("isEnd");
            window.maidianback && window.maidianback();
            this.canReward=false;
            setTimeout(() => {
                this.canReward=true;
            }, 3000);
            
            
            this.videoSucceedCallBack && this.videoSucceedCallBack();
            this.videoAd=null;
        }
    }

    showBanner(wid) {
        if(sys.platform != sys.Platform.BYTEDANCE_MINI_GAME){
            return;
        }
        this.isHide = false;
        const { windowWidth, windowHeight } = (window as any).tt.getSystemInfoSync();
        let targetWid = 1000//wid;
        if (this.bannerAd == null) {
            let id = AdParam.tt_params.banner_id;
            this.bannerAd = (window as any).tt.createBannerAd({
                adUnitId: id,
                adIntervals: this.adIntervals,
                style: {
                    width: targetWid,
                    //left: (windowWidth - targetWid) / 2,
                    top: windowHeight - (targetWid / 16 * 9)
                }
            })
        } else {
            if (this.bannerAd.destroy) {
                this.bannerAd.destroy();
                this.bannerAd = null;
                this.showBanner(wid);
                return;
            }
        }
        this.bannerAd.onError((err) => {
            console.log("banner 加载失败", err);
        });
        this.bannerAd.onLoad((err) => {
            if (!this.isHide) {
                if (this.bannerAd.show) {
                    this.bannerAd.show();
                }
            }
            console.log("banner 加载成功", err);
        });
        this.bannerAd.onResize((res) => {
            console.log("onresize  调整尺寸:res.width",res.width,"   res.heigth:",res.heigth);
            if (targetWid != res.width) {
               // targetWid = res.width;
               this.bannerAd.style.width=targetWid 
               this.bannerAd.style.top = windowHeight - res.height;
                this.bannerAd.style.left = (windowWidth - res.width) / 2;
            }
            if (res.height > 50) this.bannerAd.style.top = windowHeight - res.height;
        });
    }

    showRewardedVideo(SucceedCallBack: Function, FailCallback: Function, showCallback?: Function) {
        if(sys.platform != sys.Platform.BYTEDANCE_MINI_GAME){
            return;
        }
        if (this.videoAd == null) {
            let id = AdParam.tt_params.rewarded_video_id0
            console.log("激励视频广告id",id);
            this.videoAd = (window as any).tt.createRewardedVideoAd({
                adUnitId: id,
            });
            this.videoAd.onClose(this.closeHandler.bind(this));
        }
        this.videoSucceedCallBack = SucceedCallBack;
        this.videoFailCallBack = FailCallback;

        // 监听错误
        this.videoAd.onError((err) => {
            console.log("errCode:",err.errCode);
            // Global.showNoAd();
            this.videoFailCallBack && this.videoFailCallBack();
            switch (err.errCode) {
                case 1004:
                    // 无合适的广告
                    break;
                default:
                // 更多请参考错误码文档
            }
        });

        this.videoAd.load()
            .then(() => {
                console.log("激励视频加载成功")
                this.videoAd.show()
                    .then(() => {
                        //播放成功
                        // showCallback && showCallback();
                    })
            })
            .catch((e) => {
                console.log("激励视频加载失败  ", e)
                // Global.showNoAd();
                this.videoFailCallBack && this.videoFailCallBack();
            })
    }

    hideBanner() {
        this.isHide = true;
        if (this.bannerAd != null) {
            if (this.bannerAd.hide) {
                this.bannerAd.hide();
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
        }
    }

    showInteraction() {
        if(sys.platform != sys.Platform.BYTEDANCE_MINI_GAME){
            return;
        }
        console.log("加载插屏广告")
        const interstitialAd = (window as any).tt.createInterstitialAd({
            adUnitId: AdParam.tt_params.interstitial_id,
        });
        console.log("头条插屏广告创建")
        interstitialAd
            .load()
            .then(() => {
                console.log("广告加载成功");
                interstitialAd.show();
            })
            .catch((err) => {
                console.error("广告组件加载出现问题", err.code);
                console.error("广告组件加载出现问题", err);
            });

        interstitialAd.onError(async (err) => {
            console.log("onError", err);
        });
    }


    shareApp(shareTitle?,shareContent?,shareQuery?) {
        (window as any).tt.shareAppMessage({
            channel: "",
            title: shareTitle?shareTitle:shareDt.getShareTitle(),
            desc: shareContent?shareContent:shareDt.getShareContent(),
            query: shareQuery,

        })
    }

    /** 录屏开始 */
    startRecord() {

        this.startRecordTime = new Date().getTime();
        this.recorder = (window as any).tt.getGameRecorderManager();

        this.recorder.onStart((s) => {
            console.log("ttManager录屏开始：", s);
        })

        this.recorder.onError((s) => {
            console.log("录屏错误：", s);

        })
        //添加水印并且居中处理
        this.recorder.start({
            duration: 300,
            isMarkOpen: false,
            locLeft: 0,
            locTop: 0,
        });
        this.recorder.onStop((res) => {
            this.videoPath = res.videoPath;
        })
    }

    /**
     * 头条结束录屏
     * @returns 
     */
    endRecord() {
        this.endRecordTime = new Date().getTime();
        if (!this.recorder)
            return;
        this.recorder.stop();
    }

    public shareRecord() {
        if (!this.endRecordTime || !this.startRecordTime) {
            // Global.showAlertBox("当前无录屏资源");
            return;
        }
        if (this.endRecordTime - this.startRecordTime <= 3000) {
            // Global.showAlertBox("录屏时间小于3s");
            return;
        }
        
        (window as any).tt.shareAppMessage({
            channel: "video",
            title: shareDt.getShareTitle(),
            desc: shareDt.getShareContent(),
            imageUrl: "",
            templateId: "", // 替换成通过审核的分享ID
            query: "",
            extra: {
                videoPath: this.videoPath, // 录屏得到的视频地址
                videoTopics: ["清洁小能手", "清洁小能手"], //该字段已经被hashtag_list代替，为保证兼容性，建议两个都填写。
                hashtag_list: ["清洁小能手", "清洁小能手"],
                video_title: shareDt.getShareTitle(), //生成的默认内容
            },

            success() {
                console.log("shareAppMessage succeed");
            },

            fail(e) {
                console.log("shareAppMessage fail");
                console.log(e);
                if(e.errNo==21105){
                //    Global.showAlertBox("当前无录屏资源");
                }else{
                    // Global.showAlertBox("分享失败")
                }
            },

        });
    }

    sceneSuccessCallBack:Function=null;
    sceneSuccessCaller=null;
    public onShow(){
        (window as any).tt.onShow((res)=>{
            // Global.refererInfo=res.refererInfo;
            this.sceneSuccessCallBack&&this.sceneSuccessCallBack.call(this.sceneSuccessCaller);

            console.log("启动参数：", res.query);
            console.log("来源信息：", res.refererInfo);
            console.log("场景值：", res.scene);
            console.log("启动场景字段：", res.launch_from, ", ", res.location);
        })
    }

    setSceneCallBack(success,caller){
        this.sceneSuccessCallBack=success;
        this.sceneSuccessCaller=caller;
    }
    public checkScene(success,caller){
        (window as any).tt.checkScene({
            scene:"sidebar",
            success:(res)=>{
                console.log("isExist:",res.isExist);
                success&&success.call(caller)
            },
            fail:()=>{

            }
        })
    }


    public navigateToScene(success,caller){
        (window as any).tt.navigateToScene({
            scene:"sidebar",
            success:(res)=>{
                console.log("isExist:",res.isExist);
                success&&success.call(caller)
            },
            fail:()=>{

            }
        })
    }

}