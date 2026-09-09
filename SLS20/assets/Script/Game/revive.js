const Global = require('Global');
var self = null;
cc.Class({
    extends: cc.Component,

    properties: {
        contentNode: cc.Node,

        titleLbl: cc.Label,

        gemLbl: cc.Label,
        // 视频按钮文字
        adsDesLbl: cc.Label,

        promptPre: cc.Prefab,
        // 结算窗口
        overBox: cc.Prefab,

        desLbl:cc.Label,

        gemsBtn:cc.Node,

        adsBtn:cc.Node,

        freeBtn:cc.Node,

        state:5,
    },

    hideBox:function(callBack) {
        cc.Mgr.AdsMgr.HideBannerAd();
        var act1 = cc.scaleTo(0.4, 0);
        var act2 = cc.rotateBy(0.4, -360)
        var actionOut = cc.spawn(act1, act2);
        actionOut.easing(cc.easeExponentialOut(3.0));
        this.contentNode.runAction(cc.sequence(actionOut, cc.callFunc(() => {
            if (callBack) callBack();
        })));
    },

    showBox:function(callBack) {
        if(Global.gameInfo.score < 1)
        {
            this.freeBtn.active = true;
            this.adsBtn.active = false;
            this.gemsBtn.active = false;
        }
        else
        {
            this.freeBtn.active = false;
            this.adsBtn.active = true;
            this.gemsBtn.active = true;
        }
        cc.Mgr.AdsMgr.ShowInsertAds(2);
        cc.Mgr.AdsMgr.RecoverShowBanner();
        var act1 = cc.scaleTo(0.4, 1);
        var act2 = cc.rotateBy(0.4, 360);
        let actionOut = cc.spawn(act1, act2);
        actionOut.easing(cc.easeExponentialOut(3.0));
        this.contentNode.runAction(cc.sequence(actionOut, cc.callFunc(() => {
            if (callBack) callBack();
        })));
    },


    justReviveGame:function(){
        Global.game.reviveGame();
        cc.Mgr.AudioMgr.resumeAll();
    },

    // 更新视图
    upDataReviveUI:function() {
        if (this.state < 1) {
            this.gemLbl.string = 100;
            this.adsDesLbl.string = '飞呀';
            this.titleLbl.string = '飞起来吧！';
            this.showBox();
            this.desLbl.string = "飞起来吧！让本次游戏奔跑距离更远。";
        }
        else
        {
            this.gemLbl.string = 200;
            this.adsDesLbl.string = '免费续关';
            this.titleLbl.string = '是否续关？';
            this.showBox();
            this.desLbl.string = "剩余续关次数:" + this.state + "。";
        }
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

    // 关闭按钮
    closeBox:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        var self = this;
        this.hideBox(() => {
            let overBox = cc.instantiate(self.overBox);
            overBox.parent = Global.game.uiRoot;
            overBox.zIndex = 10;
            self.node.destroy();
        });
    },

    // 使用钻石按钮
    useGemReviveOrFly:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.state < 1) {
            if (Global.userData.gem >= 100) {
                this.hideBox(() => {
                    this.state -= 1;
                    Global.userData.gem -= 100;
                    Global.game.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;
                    Global.saveData();
                    // 死亡冲刺
                    Global.game.dieFly();
                });
            } else {
                this.showPrompt('钻石不足，冲刺失败。');
            }
        } else {
            if (Global.userData.gem >= 200) {
                this.hideBox(() => {
                    this.state -= 1;
                    Global.userData.gem -= 200;
                    Global.game.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;
                    Global.saveData();
                    Global.game.reviveGame();
                    cc.Mgr.AudioMgr.resumeAll();
                });
            } else {
                this.showPrompt('钻石不足，续关失败。');
            }
        }
    },

    // 看视频按钮
    adsReviveOrFly:function() {   
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.Utils.GetSysTime() - Global.gameInfo.lastVideoTime <= 60)
        {
            this.showPrompt("广告资源尚未准备就绪。");
            return;
        }
        cc.Mgr.AdsMgr.ShowVideoAds(2, function(out){
            if (out == 0) {
                self.callBackFlyOrReborn();
            }
        });
    },

    callBackFlyOrReborn:function(){
        if (this.state < 1) {
            this.hideBox(() => {
                // 死亡冲刺
                Global.game.dieFly();
            });
        } else {
            this.hideBox(() => {
                this.state -= 1;
                Global.game.reviveGame();
                if (cc.Mgr.AudioMgr.musicState == 0) {
                    cc.Mgr.AudioMgr.resumeAll();
                }
            });
        }
    },

    onLoad () {
        self = this;
        this.state = 5;
        this.contentNode.scale = 0;
        this.contentNode.rotaion = -360;
        this.showBox();
    },
});
