const { ccclass, property } = cc._decorator;

import { UICtrl } from "./../../Managers/UIMgr";
import EventMgr from "../../Managers/EventMgr";

@ccclass // 注意修改类名
export default class ResLoading_Ctrl extends UICtrl {
    private progressBar: cc.Sprite = null;

    onLoad() {
        super.onLoad();

        this.progressBar = this.view["UIProgress/value"].getComponent(cc.Sprite);
        this.progressBar.fillRange = 0;

        // 适配屏幕
        this.resetSize(this.node.getParent());

        EventMgr.Instance.add_event_listenner("ResLoadProgress", this, this.onProgress);
    }

    /**
     * 手机屏幕适配
     * @param cav 
     */
    resetSize(cav) {
        let frameSize = cc.view.getFrameSize();
        let designSize = cc.view.getDesignResolutionSize();
        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
    }

    private onProgress(uname, udata) {
        var per = udata;
        this.progressBar.fillRange = per;
    }

    onDestroy() {
        if (EventMgr.Instance) {
            EventMgr.Instance.remove_event_listenner("ResLoadProgress", this, this.onProgress);
        }
    }
}
