const Global = require('Global');
const { mGameData } = require('../GameData');

cc.Class({
    extends: cc.Component,

    properties: {
        onVoiceBtn: cc.Node,
        offVoiceBtn: cc.Node,
    },

    // 再玩一次
    playAgain:function() {
        //cc.Mgr.AdsMgr.HideBannerAd();
        if (mGameData.ConsumeStamina(1)) {
            cc.Mgr.AudioMgr.playSFX("click");
            cc.director.resume();
            Global.restData();
            cc.director.loadScene('Game');
        } else {
            this.showPrompt("体力不足，请稍后再试。");
        }
        
    },

    // 返回首页按钮
    backHomeScene:function() {
        cc.Mgr.AdsMgr.ShowInsertAds(2);
        cc.Mgr.AudioMgr.playSFX("click");
        cc.director.resume();
        Global.restData();
        cc.director.loadScene('Home');
    },

    // 返回首页按钮
    closeBox:function() {
        //cc.Mgr.AdsMgr.HideBannerAd();
        cc.Mgr.AudioMgr.playSFX("click");
        cc.director.resume();
        this.node.destroy();
    },

    musicTog:function(e, type) {
        cc.Mgr.AudioMgr.playSFX("click");
        if (type == 'on') {
            cc.Mgr.AudioMgr.pauseAll();
            this.onVoiceBtn.active = false;
            this.offVoiceBtn.active = true;
        } else {
            cc.Mgr.AudioMgr.resumeAll();
            this.onVoiceBtn.active = true;
            this.offVoiceBtn.active = false;
        }
    },

    show:function(){
        cc.Mgr.AdsMgr.showNativeAds(1);
        cc.Mgr.AdsMgr.RecoverShowBanner();
        if (cc.Mgr.AudioMgr.musicState == 0) {
            //this.onVoiceBtn.active = false;
            //this.offVoiceBtn.active = true;
        } else {
            //this.onVoiceBtn.active = true;
            //this.offVoiceBtn.active = false;
        }
    },

    onLoad () {
        this.node.zIndex = 10;
        this.show();
    },
});
