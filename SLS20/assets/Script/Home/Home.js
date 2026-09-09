//是否完成过管理工具的初始化
cc.director.initMgr = false;
var configUrl = "http://baidu.com/GameConfig/bpbxee.txt";
function initMgr(){
    cc.Mgr = {};
    cc.Mgr.Global = require("Global");
    cc.Mgr.Utils = require("Utils");

    cc.Mgr.HttpMgr = require("HttpMgr");
    //声音
    var AudioMgr = require("AudioMgr");
    cc.Mgr.AudioMgr = new AudioMgr();
    cc.Mgr.AudioMgr.init();

    

    cc.Mgr.AdsMgr = require("AdsMgr");
    cc.Mgr.AdsMgr.Init();


    cc.Mgr.ShareInfos = require("ShareInfos");
    cc.Mgr.ShareInfos.init();
    cc.Mgr.PlatformController = require("PlatformController");
    cc.Mgr.PlatformController.Init();
}

const Global = require('Global');
var UIMgr = require("UIMgr");
const { mGameData } = require('../GameData');
cc.Class({
    extends: cc.Component,

    properties: {
        playerBone: {
            default: null,
            type: dragonBones.ArmatureDisplay
        },

        playerAnimation: cc.Animation, // 新增 Animation 组件引用

        Atlas:cc.SpriteAtlas,

        screenSpA:cc.Sprite,

        uiMgr:UIMgr,

        topM:cc.Label,

        appEE:cc.Node,
        appXX:cc.Node,
        
        time_node: {
            default: null,
            type: cc.Node
        },
        
        staminaLabel: {
            default: null,
            type: cc.Label
        },
        
        recoverTimerLabel: {
            default: null,
            type: cc.Label
        },
    },

    SetScreenSps:function(){
        if(cc.Mgr.PlatformController.IsScreenRecord == false)
        {
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_off");
        }
        else
        {
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_on");
        }
    },

    ScreenRecord:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.PlatformController.IsScreenRecord == false)
        {
            cc.Mgr.PlatformController.StartRecordScreen();
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_on");
        }
        else
        {
            cc.Mgr.PlatformController.StopRecordScreen();
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_off");
        }
    },

    // 皮肤选择
    skinSelect:function() {
        // this.playerBone.armatureName = Global.gameInfo.skinName[Global.userData.skin];
        // 播放当前选中角色的land动画
        if (this.playerAnimation) {
            const skinName = Global.gameInfo.skinName[Global.userData.skin];
            this.playerAnimation.play(skinName + '_land');
        }
    },

    // 主题选择
    themeSelect:function() {
        // 先清空再赋值
        Global.gameInfo.images = {};
        // 直接加载整个主题文件夹的图片 这里可以放在home场景中预先加载
        cc.loader.loadResDir(`theme${Global.gameInfo.theme}`, cc.SpriteFrame, (errs, res) => {
            for (let i = 0; i < res.length; i++) {
                Global.gameInfo.images[res[i]._name] = res[i];
            }
            // console.log(Global.gameInfo.images);
        });
    },

    openGame:function() {
        // 检查剧情弹窗是否正在显示
        if (this.uiMgr && this.uiMgr.Story_node && this.uiMgr.Story_node.active) {
            return; // 剧情弹窗正在显示，不进入游戏
        }

        // 检查体力是否足够
        if (mGameData.ConsumeStamina(1)) {
            // 检查是否需要显示剧情弹窗
            if (this.uiMgr && !this.uiMgr.isStoryPopupShown()) {
                this.uiMgr.initStoryPopup();
                return; // 显示剧情弹窗，不立即进入游戏
            }
            
            cc.Mgr.AdsMgr.HideBannerAd();
            cc.Mgr.AudioMgr.playSFX("click");
            this.unschedule(this.setAppNodes);
            cc.director.loadScene('Game');
        } else {
            // 体力不足，显示提示
            if (this.uiMgr && this.uiMgr.showPrompt) {
                this.uiMgr.showPrompt("体力不足，请稍后再试。");
            } else {
                console.error('uiMgr or showPrompt method not found');
            }
        }
    },

    findNodeByName:function(root, name) {
        if (!root) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const result = this.findNodeByName(root.children[i], name);
            if (result) {
                return result;
            }
        }
        return null;
    },

    formatGemCount:function(value) {
        const gemCount = Number(value) || 0;
        if (gemCount >= 100000000) {
            return (gemCount / 100000000).toFixed(1) + '\u4ebf';
        }
        if (gemCount >= 10000) {
            return (gemCount / 10000).toFixed(1) + '\u4e07';
        }
        return String(gemCount);
    },

    initGoldUI:function() {
        const labelNode = this.findNodeByName(this.node, 'Lable_gold');
        this.goldLabel = labelNode ? labelNode.getComponent(cc.Label) : null;
        this.goldButton = this.findNodeByName(this.node, 'btn_gold');
        if (this.goldButton) {
            this.goldButton.off(cc.Node.EventType.TOUCH_END, this.openChargeUI, this);
            this.goldButton.on(cc.Node.EventType.TOUCH_END, this.openChargeUI, this);
        }
        this.UpdateGoldLabel(true);
        this.schedule(this.UpdateGoldLabel, 0.5);
    },

    UpdateGoldLabel:function(force) {
        const gemCount = Number(Global.userData.gem) || 0;
        if (this.goldLabel && (force === true || this.lastDisplayedGem !== gemCount)) {
            this.goldLabel.string = this.formatGemCount(gemCount);
            this.lastDisplayedGem = gemCount;
        }
    },

    openChargeUI:function() {
        if (this.uiMgr && this.uiMgr.openChargeUI) {
            this.uiMgr.openChargeUI();
        }
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //cc.sys.localStorage.clear();
        if(cc.director.initMgr == false)
        {
            // cc.log("还没有初始化过");
            initMgr();

            if(cc.Mgr.PlatformController.platform == "qg_oppo")
            {
                cc.Mgr.HttpMgr.sendRequest(configUrl, function(state, res){
                    console.log("数据返回=============== " + JSON.stringify(res));
                    if(state)
                    {
                        cc.Mgr.Global.insertAdsRate = res.insertAdsRate;
                        cc.Mgr.Global.openNative = res.openNative;
                    }
                    else
                    {
                        cc.Mgr.Global.insertAdsRate = 1;
                        cc.Mgr.Global.openNative = 1;
                    }
                    console.log("数据返回=============== insertAdsRate " + cc.Mgr.Global.insertAdsRate);
                });
            }

            cc.Mgr.AudioMgr.playBGM("bgm");
            cc.director.initMgr = true;
            cc.director.preloadScene('Game', () => console.log('预加载游戏场景成功'));

            //首先监听右上角的按钮
            cc.Mgr.PlatformController.ShareTopNav();
            cc.Mgr.PlatformController.CreateGameClub();

            this.scheduleOnce(function(){
                cc.Mgr.AdsMgr.ShowBannerAds();

                //cc.Mgr.AdsMgr.initNativeAd();
            }, 5);
            
            //cc.Mgr.PlatformController.CreateMoreGameBtn();
        }
        else
        {
            cc.director.initMgr = true;
            cc.Mgr.AdsMgr.RecoverShowBanner();
        }

        Global.gameInfo.gameScene = "home";
        Global.home = this;
        // 更新数据
        if (Global.updateUserData()) {
            Global.userData = Global.updateUserData();
            console.log('更新数据', Global.userData);
        }

        this.initGoldUI();
        
        // 检查当前角色是否是未解锁的角色（通过广告使用的）
        if (!Global.userData.skinList.some(item => item == Global.userData.skin)) {
            // 重置为默认角色
            Global.userData.skin = 0;
            // 保存数据
            Global.saveData();
        }

        if (!Global.gameInfo.images) {
            console.log('首次加载资源');
            this.themeSelect();
        }

        this.uiMgr.JudeAutoOpenSign();

        if (this.node.height >= 1500) {
            Global.gameInfo.isMaxPhone = 10;
            // console.log('针对全面屏手机做的地板冰块增加');
        }
        this.skinSelect();

        this.topM.string = "历史最佳：" + Global.userData.maxScore + "米";

        this.SetScreenSps();

        // 初始化体力系统
        this.initStaminaSystem();

        cc.Mgr.Utils.sceneA = true;
    },

    // 初始化体力系统
    initStaminaSystem: function() {
        // 重新加载当前账户的体力数据
        mGameData.ReloadStamina();
        
        // 初始化时只需要调用一次UpdateRecoverTimerDisplay，它会处理所有初始化显示
        this.UpdateRecoverTimerDisplay();
        // 设置单个定时器，每秒更新一次倒计时和检查体力恢复
        this.schedule(this.UpdateRecoverTimerDisplay, 1);
        
        // 为time_node添加点击事件监听器，用于切换recoverTimerLabel的可见性
        if(this.time_node){
            this.time_node.on('touchend', this.toggleRecoverTimerVisibility, this);
        }
        
        // 明确设置recoverTimerLabel的初始状态为隐藏
        if(this.recoverTimerLabel && this.recoverTimerLabel.node){
            this.recoverTimerLabel.node.active = false;
            // 跟踪用户手动隐藏recoverTimerLabel的状态
            // 初始设置为true，确保recoverTimerLabel默认是隐藏的
            this.isRecoverTimerManuallyHidden = true;
        }
    },

    /**
     * 切换recoverTimerLabel的可见性
     */
    toggleRecoverTimerVisibility: function(){
        if(this.recoverTimerLabel && this.recoverTimerLabel.node){
            // 切换recoverTimerLabel的可见性
            this.recoverTimerLabel.node.active = !this.recoverTimerLabel.node.active;
            // 更新手动隐藏状态
            this.isRecoverTimerManuallyHidden = !this.recoverTimerLabel.node.active;
        }
    },

    /**
     * 更新恢复倒计时显示
     */
    UpdateRecoverTimerDisplay: function(){
        // 先检查体力恢复
        mGameData.CheckAndRecoverStamina();
        // 更新体力显示
        this.UpdateStaminaLabel();
        
        // 检查体力是否已满
        const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
        
        if(this.recoverTimerLabel){
            if(isStaminaFull){
                this.recoverTimerLabel.string = "体力已满";
            }else{
                // 体力未满时，更新倒计时文本内容
                const timeString = mGameData.GetFormattedRecoverTime();
                this.recoverTimerLabel.string = `下次体力恢复：${timeString}`;
                
                // 根据用户手动隐藏状态决定是否显示
                if(!this.isRecoverTimerManuallyHidden){
                    this.recoverTimerLabel.node.active = true;
                }
            }
        }
    },

    /**
     * 仅更新体力标签显示
     */
    UpdateStaminaLabel: function(){
        if(this.staminaLabel){
            this.staminaLabel.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
        }
    },

    setAppNodes:function(){
        if(this.appEE.active == true)
        {
            this.appEE.active = false;
            this.appXX.active = true;
        }
        else
        {
            this.appEE.active = true;
            this.appXX.active = false;
        }
    },

    InstallShortCut:function(){
        cc.Mgr.PlatformController.InstallShortCut();
    },

    start(){
        cc.Mgr.PlatformController.ShowClubButton(true);
        this.appEE.active = true;
        this.appXX.active = true;
        //if(cc.Mgr.PlatformController.platform == "qg_oppo")
        //    this.schedule(this.setAppNodes, 5);
    },
});
