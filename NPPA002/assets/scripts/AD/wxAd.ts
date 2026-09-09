import { _decorator, Component, Node } from 'cc';
import { audioTool } from '../untils/audioTool';
import { bgmName } from '../data/enmus';
import {mySdk} from '../../mySdk/mySdk';
const { ccclass, property } = _decorator;

@ccclass('wxAd')
export class wxAd extends Component {
    private bannerAd: any;
    private bannerAd2: any;
    private CustomAd: any;
    videoAd: any;
    // 单例
    static _ins: wxAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new wxAd();
        return this._ins;
    }
    public wx = window['wx'];
    bgmZd(callback: Function) {
        // 监听音频中断结束事件
        // this.wx.onAudioInterruptionEnd(() => {
        //     // console.log('音频中断结束');
        //     callback()
        // })
    }
    /**
  * 打开右上角转发功能
  */
    topZhuanfa() {
        // this.wx.showShareMenu();
    }
    /**
   * 转发
   */
    zhuanfa() {
        audioTool.ins.stopMusic()
        // this.wx.shareAppMessage({
        //     title: '猫咪萌宠消除',
        // });
    }
    /**
 * banner广告
 */
    loadBannerAd() {
        // 获取屏幕宽高
        let { screenWidth, screenHeight } = this.wx.getSystemInfoSync();
        // 创建 Banner 广告实例，提前初始化
        this.bannerAd = this.wx.createBannerAd({
            adUnitId: 'adunit',
            adIntervals: 30,
            style: {
                left: 0,
                top: 0,
                width: 350,
            },
        });
        if(!this.bannerAd){
            return;
        }
        // 监听 banner 广告错误事件
        this.bannerAd.onError((err) => {
            console.error(err.errMsg);
        });
        this.bannerAd.onResize((res) => {
            this.bannerAd.style.left =
                (screenWidth - this.bannerAd.style.realWidth) / 2;
            this.bannerAd.style.top = screenHeight - this.bannerAd.style.realHeight;
            this.bannerAd.style.width = screenWidth;
        });
    }
    // 显示banner广告
    showBanner() {
        // this.bannerAd.show();
    }
    // 隐藏banner广告
    hideBanner() {
        // this.bannerAd.hide();
    }

    /**
    * banner广告2
    */
    loadBannerAd2() {
        // 获取屏幕宽高
        let { screenWidth, screenHeight } = this.wx.getSystemInfoSync();
        // 创建 Banner 广告实例，提前初始化
        this.bannerAd2 = this.wx.createBannerAd({
            adUnitId: 'adunit-',
            style: {
                left: 0,
                top: 0,
                width: 350
            }
        })
        if(!this.bannerAd2){
            return;
        }
        // 监听 banner 广告错误事件
        this.bannerAd2.onError((err) => {
            console.error(err.errMsg);
        });
        this.bannerAd2.onResize((res) => {
            this.bannerAd2.style.left =
                (screenWidth - this.bannerAd2.style.realWidth) / 2;
            this.bannerAd2.style.top = screenHeight - this.bannerAd2.style.realHeight;
            this.bannerAd2.style.width = screenWidth;
        });
    }
    // 显示banner广告
    showBanner2() {
        // this.bannerAd2.show();
    }
    // 隐藏banner广告
    hideBanner2() {
        // this.bannerAd2.hide();
    }
    /**
      * 格子广告
      */
    loadCustomAd() {
        // 获取屏幕宽高
        // let { screenWidth, screenHeight } = this.wx.getSystemInfoSync();
        // // 创建 原生模板 广告实例，提前初始化
        // this.CustomAd = this.wx.createCustomAd({
        //     adUnitId: 'adunit-',
        //     style: {
        //         left: 0,
        //         top: 30,
        //         width: 350
        //     }
        // })
        // // 监听 原生模板 广告错误事件
        // this.CustomAd.onError((err) => {
        //     console.error(err.errMsg);
        // });
    }
    // 显示格子广告
    showCustomAd() {
        // this.CustomAd.show();
    }
    // 隐藏格子广告
    hideCustomAd() {
        // this.CustomAd.hide();
    }

    /**
     * 插屏广告
     */
    chapingAd() {
        // 定义插屏广告
        window['mysdk'].showInteraction()
        
        // let interstitialAd = null

        // // 创建插屏广告实例，提前初始化
        // if (this.wx.createInterstitialAd) {
        //     interstitialAd = this.wx.createInterstitialAd({
        //         adUnitId: 'adunit-'
        //     })
        // }

        // // 在适合的场景显示插屏广告
        // if (interstitialAd) {
        //     interstitialAd.show().catch((err) => {
        //         console.error('插屏广告显示失败', err)
        //     })
        // }
    }
    /**
   * 激励视频广告
   */
    loadVideoAd(callback: Function) {
        window['mysdk'].showVideo(callback)
        // this.videoAd = this.wx.createRewardedVideoAd({
        //     adUnitId: 'adunit-',
        // });
        // // 用户触发广告后，显示激励视频广告
        // this.videoAd.show().catch(() => {
        //     // 失败重试
        //     this.videoAd
        //         .load()
        //         .then(() => this.videoAd.show())
        //         .catch((err) => {
        //             console.error('激励视频 广告显示失败', err);
        //         });
        // });
        // this.videoAd.onLoad(() => {
        //     console.log('激励视频 广告加载成功');
        // });

        // this.videoAd.show().then(() => console.log('激励视频 广告显示'));
        // this.videoAd.onError((err) => {
        //     console.log(err);
        // });
        // this.videoAd.onClose((res) => {
        //     // 用户点击了【关闭广告】按钮
        //     if ((res && res.isEnded) || res === undefined) {
        //         callback()
        //         // 正常播放结束，可以下发游戏奖励
        //         this.videoAd.offClose();
        //     } else {
        //         // 播放中途退出，不下发游戏奖励
        //         this.videoAd.offClose();
        //     }
        // });
    }
}


