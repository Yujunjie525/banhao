


import { AdParam } from "./AdParam";

import { Platform } from "./platform";
import { shareDt } from "./shareDt";
import TTHelper from "./TTHelper";

import { platformNum, serverDt } from "./severDt";

export class mySdk {
    private static instance: mySdk = null;

    public static getInstance(): mySdk {
        if (mySdk.instance == null) {
            mySdk.instance = new mySdk();
        }
        return mySdk.instance;
    }

    //头条
    public ttHelper: TTHelper = new TTHelper();


 
    /**
     * 
     * @param showCallback 显示成功回调  安卓不需要
     * @param SucceedCallBack 成功回调
     * @param FailCallback 失败回调
     */
    public showVideo(SucceedCallBack: Function, FailCallback: Function, showCallback?: Function) {
        console.log("看激励视频广告====.",cc.sys.platform ,cc.sys.BYTEDANCE_GAME);
        
        if(Platform.isBrowser() || Platform.isAndroid()){
            SucceedCallBack();
            return;
        }

        else {
            this.ttHelper.showRewardedVideo(SucceedCallBack, FailCallback, showCallback);
        } 
    }

    /**
      * 显示插屏广告
      * @param wid 宽度
      * @param heigth 高度
      */
    showInteraction(wid?: number, heigth?: number) {
        // console.log("插屏广告：：：：：")
        if (Platform.isBrowser()) {
            return;
        }
        else {
            this.ttHelper.showInteraction();
        }

    }



    registerHide(call: Function) {
        // let self = this;
        // cc.game.on(cc.Game.EVENT_HIDE, function () {
        //     console.log("游戏进入后台");
        //     call && call();
        //     self.wechatHelper.hide();
        // }, this);
    }

    registerShow(call: Function) {
        // let self = this;
        // game.on(Game.EVENT_SHOW, function () {
        //     console.log("游戏返回前台");
        //     call && call();
        //     self.wechatHelper.show();
        // }, this);
    }
    registerTtOnShow(){
        if(!Platform.isByteDance()){
            return;
        }
        this.ttHelper.onShow();
        
    }

    /**是否支持侧边栏 */
    checkScene(success,caller){
        if(!Platform.isByteDance()){
            return;
        }
        this.ttHelper.checkScene(success,caller);
    }

    navigateToScene(success,caller){
        if(!Platform.isByteDance()){
            return;
        }
        this.ttHelper.navigateToScene(success,caller);
    }

   

}


window['mysdk']=mySdk.getInstance();
