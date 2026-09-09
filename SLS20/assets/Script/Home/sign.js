var Global = require("Global");
cc.Class({
    extends: cc.Component,

    properties: {
        signToggle:cc.Button,
        signToggleSp:cc.Node,
        douSignToggle:cc.Button,
        douSignToggleSp:cc.Node,
        daysParents:cc.Node,

        closeBtn:cc.Node,

        // 提示条
        promptPre: cc.Prefab,

        onlySign:0,
    },

    start(){
        this.closeBtn.active = false;
        this.signToggle.node.active = false;
        this.refreshSignState();
    },

    // 提示
    showPrompt:function(str) {
        var tipBox = cc.instantiate(this.promptPre)
        tipBox.y = -(this.node.height / 2 - tipBox.height / 2);
        tipBox.parent = this.node;
        tipBox.getComponent("tipBox").showDes(str);
        var act1 = cc.moveBy(0.32, 0, 150);
        var act2 = cc.moveBy(0.5, 0, 0);
        var act3 = cc.moveBy(0.4, 0, 150);
        var act4 = cc.fadeOut(0.3);
        tipBox.runAction(cc.sequence(act1, act2, cc.callFunc(() => {
            tipBox.runAction(cc.sequence(cc.spawn(act3, act4), cc.callFunc(() => {
                tipBox.destroy();
            })))
        })));
    },

    getDate:function(){
        var dayTime = Math.round(Math.round(new Date() / 1000) / 3600 / 24) - (49 * 365);
        return dayTime;
    },

    refreshSignState:function(){
        var today = this.getDate();
        cc.log("现在的时间 = " + today + "  上次签到时间 = " + Global.userData.lastSignTime);
        if(today - Global.userData.lastSignTime > 1 || (Global.userData.keepSignTimes == 7 && (today - Global.userData.lastSignTime >= 1)))
        {
            Global.userData.keepSignTimes = 0;
        }

        if(today - Global.userData.lastSignTime <= 0)
        {
            this.closeBtn.active = true;
            this.signToggle.node.active = true;
        }
        else
        {
            this.closeBtn.active = true;
            this.signToggle.node.active = true;
            this.closeBtn.opacity = 255;
            this.signToggle.node.opacity = 255;
        }

        // this.douSignToggle.interactable = ((today - Global.userData.lastSignTime <= 0)?false:true);
        // this.douSignToggleSp.active = ((today - Global.userData.lastSignTime <= 0)?true:false);

        // this.signToggle.interactable = ((today - Global.userData.lastSignTime <= 0)?false:true);
        // this.signToggleSp.active = ((today - Global.userData.lastSignTime <= 0)?true:false);

        for(var i=0;i<7;i++){
            var nd = this.daysParents.getChildByName('day'+(i+1));

            var signed = nd.getChildByName('sign_tag');
            var sbt = nd.getComponent(cc.Button);
            if(i+1 > Global.userData.keepSignTimes){
                signed.active = false;
                if(((i+1) - Global.userData.keepSignTimes == 1) && (today - Global.userData.lastSignTime >= 1))
                    sbt.interactable = true;
                else
                    sbt.interactable = false;
            }else{
                signed.active = true;
                sbt.interactable = false;
            } 

        }
    },

    closePanel:function() {
        
        cc.Mgr.AudioMgr.playSFX("click");
        this.node.active = false;
    },

    showPanel:function() {
        this.closeBtn.active = false;
        this.signToggle.node.active = false;
        cc.Mgr.AdsMgr.showNativeAds(1);
        this.refreshSignState();
        this.onlySign = 0;
    },

    signToDay:function(ev){
        if(this.getDate() - Global.userData.lastSignTime < 1){
            this.showPrompt("没有可领取奖励。");
            return;
        }

        if(this.onlySign == 2)
            return;

        this.onlySign = 1;

        cc.Mgr.AudioMgr.playSFX("click");

        var rewards=[{5:50},{5:100},{5:200},{5:300},{5:400},{5:500},{5:1000}];
        
        var thisReward = rewards[Global.userData.keepSignTimes];
        var rewardNum = 0;
        for(var k in thisReward){
            if(k == 5)
            {
                Global.userData.gem += thisReward[k];
                rewardNum = thisReward[k];
            }
            else{
                //cc.Mgr.UserMgr.skillsNum[k] += thisReward[k];
            }
            cc.log("增加 double k = " + k + "  thisReward[k] = " + thisReward[k]);
        }
        this.showPrompt("签到完成,获得" + rewardNum + "钻石。");
        
        Global.userData.lastSignTime = this.getDate();
        Global.userData.keepSignTimes += 1;

        cc.log("已经签到次数 = " + Global.userData.keepSignTimes);
        Global.saveData();


        this.refreshSignState();
    },

    signToDayDou:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        if(this.getDate() - Global.userData.lastSignTime < 1){
            this.showPrompt("没有可领取奖励。");
            return;
        }

        if(this.onlySign == 1)
            return;

        this.onlySign = 2;

    
        var rewards=[{5:50},{5:100},{5:200},{5:300},{5:400},{5:500},{5:1000}];
        
        var thisReward = rewards[Global.userData.keepSignTimes];
        var rewardNum = 0;
        for(var k in thisReward){
            if(k == 5)
            {
                Global.userData.gem += 3 * thisReward[k];
                rewardNum = 3 * thisReward[k];
            }
            else{
                //cc.Mgr.UserMgr.skillsNum[k] += thisReward[k];
            }
            cc.log("增加 double k = " + k + "  thisReward[k] = " + thisReward[k]);
        }
        this.showPrompt("签到完成,获得" + rewardNum + "钻石。");
        
        Global.userData.lastSignTime = this.getDate();
        Global.userData.keepSignTimes += 1;

        cc.log("已经签到次数 = " + Global.userData.keepSignTimes);
        Global.saveData();

        this.refreshSignState();
    },

    doubleSignGet:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        var self = this;
        if(cc.Mgr.Utils.GetSysTime() - Global.gameInfo.lastVideoTime <= 60)
        {
            this.showPrompt("广告资源尚未准备就绪。");
            return;
        }
        cc.Mgr.AdsMgr.ShowVideoAds(1, function(out){
            if(out == 0)
            {
                self.signToDayDou();
            }
        });
    },
});
