const Global = require('Global');
var rewardTip = cc.Class({
    extends: cc.Component,

    properties: {
        rewardLbl:cc.Label,

        prompt: cc.Prefab,

        contentNode:cc.Node,

        rewardNum:300,

        closeNode:cc.Node,
    },

    showTip:function(num){
        this.closeNode.active = false;
        this.scheduleOnce(function(){
            this.closeNode.active = true;
        }, 3);
        cc.Mgr.AdsMgr.ShowInsertAds(1);
        cc.Mgr.AdsMgr.RecoverShowBanner();
        this.rewardNum = num;
        this.rewardLbl.string = this.rewardNum;

        var act1 = cc.scaleTo(0.4, 1);
        var act2 = cc.rotateBy(0.4, 360);
        let actionOut = cc.spawn(act1, act2);
        actionOut.easing(cc.easeExponentialOut(3.0));
        this.contentNode.runAction(cc.sequence(actionOut, cc.callFunc(() => {
            
        })));
    },

    // 提示
    showPrompt:function(str) {
        let tipBox = cc.instantiate(this.prompt)
        tipBox.y = -(this.node.height / 2 - tipBox.height / 2);
        tipBox.parent = this.node;
        tipBox.getComponent("tipBox").showDes(str);
        var act1 = cc.moveBy(0.2, 0, 150);
        var act2 = cc.moveBy(0.8, 0, 0);
        var act3 = cc.moveBy(0.2, 0, 150);
        var act4 = cc.fadeOut(0.2);
        tipBox.runAction(cc.sequence(act1, act2, cc.callFunc(() => {
            tipBox.runAction(cc.sequence(cc.spawn(act3, act4), cc.callFunc(() => {
                tipBox.destroy();
            })))
        })));
    },

    AdsGetGem:function(){
        var self = this;
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.Utils.GetSysTime() - Global.gameInfo.lastVideoTime <= 60)
        {
            this.showPrompt("广告资源尚未准备就绪。");
            return;
        }
        cc.Mgr.AdsMgr.ShowVideoAds(1, function(out){
            if(out == 0)
            {
                Global.userData.gem += self.rewardNum;
                cc.Mgr.PlatformController.showToast("获得"+self.rewardNum+"钻石奖励。");
                self.showPrompt("获得"+self.rewardNum+"钻石奖励。");
                self.CloseUI();
            }
        });
    },

    CloseUI:function(){
        cc.Mgr.AdsMgr.HideBannerAd();
        this.node.active = false;
        // 保存一下数据
        Global.saveData();
    },
});
module.exports = rewardTip;
