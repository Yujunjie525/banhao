// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, sys } from "cc";

const {ccclass} = _decorator;

@ccclass
export default class KSAdMgr {
    private videoID: string = '2300023426_01';

    private static _instance: any;
    public static get Instance(): KSAdMgr {
        if (KSAdMgr._instance == null) {
            KSAdMgr._instance = new KSAdMgr();
            KSAdMgr._instance.init();
        }
        return KSAdMgr._instance;
    }

    private callBack: Function = ()=>{ console.log("@@@ KSAdMgr init callBack.") };
    private videoAd: any = null;
    init(): void {
        if(sys.platform !== sys.Platform.WECHAT_GAME){
            return;
        }
        console.log("@@@ this.videoID: ", this.videoID)
        this.videoAd = wx.createRewardedVideoAd({ adUnitId: this.videoID });
        console.log("@@@ this.videoAd: ", this.videoAd);
        // 用户触发广告后，显示激励视频广告
        this.videoAd.onLoad(() => {console.log('激励视频 广告加载成功');});
        this.videoAd.onError(err => {console.log('videoAd error ', err)});
        this.videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            if (res && res.isEnded || res === undefined) {
              // 正常播放结束，可以下发游戏奖励
              this.callBack();
            }
            else {
                // 播放中途退出，不下发游戏奖励
            }
        });
    }

    videoReward(callBk: Function): void {
        this.videoAd.show();
        console.log("@@@ 展示激励视频")
        this.callBack = callBk;
    }

}
