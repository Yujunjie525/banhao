const Global = require('Global');
const { mGameData } = require('../GameData');

cc.Class({
    extends: cc.Component,

    properties: {
        content:cc.Node,

        scoreLbl: cc.Label,
        // 历史最高
        highScoreLbl: cc.Label,
        // 本局获取钻石数量
        gemGetLbl: cc.Label,
        // 钻石加成
        moreGemLbl: cc.Label,

        shopPre:cc.Prefab,

        // 提示条
        promptPre: cc.Prefab,

        replayBtn:cc.Node,

        backHomeBtn:cc.Node,

        shopBtn:cc.Node,

        FkNode:cc.Node,

        MsNode:cc.Node,
        
        // 是否已经领取三倍奖励
        isDoubleGemClaimed: false,
    },
    // 提示
    showPrompt:function(str) {
        var tipBox = cc.instantiate(this.promptPre)
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


    show:function(callBack) {
        // this.replayBtn.active = false;
        // this.backHomeBtn.active = false;

        // this.backHomeBtn.opacity = 0;
        // this.replayBtn.opacity = 0;

        // this.scheduleOnce(function(){
            // this.replayBtn.active = true;
            // this.backHomeBtn.active = true;
            // this.replayBtn.runAction(cc.fadeIn(0.5));
            // this.backHomeBtn.runAction(cc.fadeIn(0.5));
        // }, 0);
        cc.Mgr.AdsMgr.showNativeAds(1);
        cc.Mgr.AdsMgr.RecoverShowBanner();
        var act1 = cc.scaleTo(0.4, 1);
        var act2 = cc.rotateBy(0.4, 360);
        let actionOut = cc.spawn(act1, act2);
        actionOut.easing(cc.easeExponentialOut(3.0));
        this.content.runAction(cc.sequence(actionOut, cc.callFunc(() => {
            if(callBack && typeof callBack == "function") 
                callBack();
            // this.openShopUI();
        })));

        if(cc.Mgr.PlatformController.platform == "qg_oppo"){
            if(qg.getSystemInfoSync().platformVersionCode < 1050)
            {
                this.MsNode.active = false;
                this.FkNode.active = false;
            }
            else
            {
                this.MsNode.active = false;
                this.FkNode.active = false;
            }

        }
        else{
            this.MsNode.active = false;
            this.FkNode.active = false;
        }
    },

    // 返回首页按钮
    backHomeScene:function() {
        cc.Mgr.AdsMgr.ShowInsertAds(1);
        cc.Mgr.AudioMgr.playSFX("click");
        Global.restData();
        cc.director.loadScene('Home');
    },

    // 再玩一次
    playAgain:function() {
        //cc.Mgr.AdsMgr.HideBannerAd();
        if (mGameData.ConsumeStamina(1)) {
            cc.Mgr.AudioMgr.playSFX("click");
            Global.restData();
            cc.director.loadScene('Game');
        } else {
            this.showPrompt("体力不足，请稍后再试。");
        }
        
    },

    // 分享
    shareMyScore:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        var str = "我在-疯狂大冒险-中疯狂奔跑"+Global.gameInfo.score+" M,来一起挑战吧";
        cc.Mgr.PlatformController.ShareToFriendTxt(str);
    },

    openShopUI:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.shopUI) {
            this.shopUI.active = true;
            this.shopUI.zIndex = 11;
            this.shopUI.getComponent('shop').refreshGemLabel();
        } else {
            this.shopUI = cc.instantiate(this.shopPre);
            this.shopUI.parent = Global.game.uiRoot;
            this.shopUI.zIndex = 11;
        }
    },

    doubleGem:function(){
        var self = this;
        // 检查是否已经领取过三倍奖励
        if (this.isDoubleGemClaimed) {
            this.showPrompt("你已经领取三倍奖励。");
            return;
        }
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.Utils.GetSysTime() - Global.gameInfo.lastVideoTime <= 60)
        {
            this.showPrompt("广告资源尚未准备就绪。");
            return;
        }
        cc.Mgr.AdsMgr.ShowVideoAds(3, function(out){
            if(out == 0)
            {
                Global.userData.gem += 2 * Global.game.gemNum;
                self.gemGetLbl.string = 3 * Global.game.gemNum;
                // 标记为已领取
                self.isDoubleGemClaimed = true;
                Global.saveData();
                // 更新游戏界面的钻石数量
                if (Global.game && Global.game.gemBox) {
                    Global.game.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;
                }
                // cc.Mgr.PlatformController.showToast("获得三倍奖励");
                self.showPrompt("获得三倍钻石奖励。");
            }
        });
        // 保存下数据
        Global.saveData();
    },

    JumpAppMS:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.msxxl.nearme.gamecenter");
    },

    JumpAppFK:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.fkqgz.nearme.gamecenter");
    },

    JumpAppQB:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.qbtw.qh.gamecenter");
    },

    JumpAppZXC:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.creazybike.net.nearme.gamecenter");
    },

    JumpAppCG:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.xfs.qmcg.nearme.gamecenter");
    },

    JumpAppGC:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.cszs.scqd.nearme.gamecenter");
    },

    // 通关上报
    postPass(appid, username, rank, star) {
        const url = "https://pay.szvi-bo.com/v1/testapp/PassLevel";
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log("通关上报成功:", data);
                } catch (e) {
                    console.error("JSON解析错误:", e.message);
                }
            } else {
                console.error("HTTP错误:", xhr.status);
            }
        };
        
        xhr.onerror = function() {
            console.error("网络请求失败");
        };
        
        xhr.ontimeout = function() {
            console.error("网络请求超时");
        };
        
        xhr.send(JSON.stringify({ appid, username, rank, star}));
    },

    onLoad () {
        // 判断是否钻石加成
        if (Global.game.moreGem) {
            // this.moreGemLbl.node.active = true;
            var num = parseInt(Global.game.gemNum / 6);
            Global.userData.gem += num;
            this.moreGemLbl.string = '角色奖励：+' + num;
            Global.game.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;
        }
        this.scoreLbl.string = Global.gameInfo.score;
        this.highScoreLbl.string = Global.userData.maxScore;
        this.gemGetLbl.string = Global.game.gemNum;

        this.content.scale = 0;
        this.content.rotaion = -360;
        this.show();

        // 检查当前角色是否是未解锁的角色（通过广告使用的）
        if (!Global.userData.skinList.some(item => item == Global.userData.skin)) {
            // 重置为默认角色
            Global.userData.skin = 0;
        }

        // 保存原始的最高分，用于判断是否突破了最佳成绩
        const originalMaxScore = Global.userData.maxScore;
        // 保存下数据
        Global.saveData();
        // console.log("通关上报", Global.gameInfo.score, originalMaxScore, Global.userData.maxScore);
        // 检查是否获得新的最佳成绩，如果是则上报
        if (Global.gameInfo.score >= originalMaxScore) {
            const appid = "app.yongshixunzhang1";
            // 确保使用正确的用户标识，使用直接的 localStorage
            let userId = '0';
            try {
                userId = localStorage.getItem('SLS_USERNAME') || '0';
            } catch (e) {
                console.error("获取用户ID失败:", e);
            }
            const username = userId;
            const rank = Global.gameInfo.score;
            const star = 1;
            // console.log("通关上报", username, rank, star);
            // 直接调用 postPass 方法，不需要使用 then/catch
            this.postPass(appid, username, rank, star);
        }
    },
});
