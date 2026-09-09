import GameApp from "../Game/GameApp";
import mGameData from "../Load/GameData";
import TipsManager from "../Load/TipsManager";
import TipsWndManager from "../Load/TipsWnd";
import { APP_ID } from "../Common/AppConfig";
import UserDataSyncManager from "./UserDataSyncManager";

const {ccclass, property} = cc._decorator;


@ccclass
export default class LoadManager extends cc.Component {
    @property(cc.Button)
    BtnStart:cc.Button = null;
    
    @property(cc.Node)
    NO18Panel:cc.Node = null;
    @property(cc.Label)
    tips_label:cc.Label = null;
    @property(cc.Node)
    btn_qd:cc.Node = null;

    // 是否已经显示过二十点四十五分的弹窗
    private hasShownTimePopup: boolean = false;
    
    // 本地存储key
    // 年龄状态存储key，1=成年人，其他=未成年人
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
    
    // 跟踪用户手动隐藏recoverTimerLabel的状态
    // 初始设置为true，确保recoverTimerLabel默认是隐藏的
    private isRecoverTimerManuallyHidden: boolean = true;

    // 剧情文本数组
    private storyLines: string[] = [];
    // 当前显示的行索引
    private currentLineIndex: number = 0;
    // 文本显示间隔时间（秒）
    private lineInterval: number = 0.5;
    // 字符显示间隔时间（秒）
    private charInterval: number = 0.05;
    // 当前行的字符索引
    private currentCharIndex: number = 0;
    // 文本显示定时器ID数组
    private textTimers: NodeJS.Timeout[] = [];
    // 跳过按钮启用定时器ID
    private jumpButtonTimer: NodeJS.Timeout = null;
    
    // 防沉迷检查间隔时间（秒）
    private antiAddictionInterval: number = 5; // 默认5秒检查一次

    @property(cc.Button)
    BtnStart2:cc.Button = null;

    @property(cc.Button)
    BtnBGM:cc.Button = null;

    @property(cc.Node)
    BtnShop:cc.Node = null;

    @property(cc.Node)
    shopPanel:cc.Node = null;

    @property(cc.Node)
    BtnRank:cc.Node = null;

    @property(cc.Node)
    BtnClose:cc.Node = null;

    @property(cc.Sprite)
    weixin:cc.Sprite = null;

    @property(cc.Node)
    weixinNode:cc.Node = null;

    @property(cc.Node)
    SpOn:cc.Node = null;

    @property(cc.Node)
    SpOff:cc.Node = null;

    @property(cc.AudioClip)
    Bgm:cc.AudioClip = null;

    @property(cc.AudioClip)
    ClickEffect:cc.AudioClip = null;
    
    @property(cc.Label)
    staminaLabel:cc.Label = null; //体力显示标签
    
    @property(cc.Label)
    recoverTimerLabel:cc.Label = null; //恢复倒计时显示标签

    @property(cc.Label)
    gold_lb:cc.Label = null; //当前钻石显示标签
    
    @property(cc.Label)
    cur_level:cc.Label = null; //当前关卡显示标签

    @property(cc.Button)
    BtnResetLevel:cc.Button = null; //重置关卡按钮
    
    @property(cc.Node)
    levelSelectPanel: cc.Node = null; //关卡选择界面节点

    @property(cc.Label)
    user_label:cc.Label = null; //当前用户名

    @property(cc.Node)
    BtnReset:cc.Node = null; //重置按钮

    // 剧情弹窗节点
    @property(cc.Node)
    Story_node:cc.Node = null;
    // 剧情文本节点
    @property(cc.RichText)
    r_story:cc.RichText = null;
    // 跳过按钮节点
    @property(cc.Node)
    btn_jump:cc.Node = null;

    @property(cc.Node)
    rankPanel:cc.Node = null;

    @property(cc.Node)
    BtnCharge:cc.Node = null; //充值按钮
    @property(cc.Node)
    ChargePanel:cc.Node = null; //充值界面
    
    @property(cc.Node)
    settingsPanel:cc.Node = null; //设置面板
    @property(cc.Node)
    BtnCloseSettings:cc.Node = null; //关闭设置面板按钮
    @property(cc.Node)
    musicBtn:cc.Node = null; //音乐开关按钮
    @property(cc.Node)
    musicOn:cc.Node = null; //音乐开启精灵
    @property(cc.Node)
    musicOff:cc.Node = null; //音乐关闭精灵
    @property(cc.Node)
    soundBtn:cc.Node = null; //音效开关按钮
    @property(cc.Node)
    soundOn:cc.Node = null; //音效开启精灵
    @property(cc.Node)
    soundOff:cc.Node = null; //音效关闭精灵
    @property(cc.Node)
    TipsPanel:cc.Node = null; //弹窗
    @property(cc.Label)
    L_tips:cc.Label = null; // 弹窗文本

    @property(cc.Node)
    Btn_closeCharge:cc.Node = null;  
    @property(cc.Node)
    Btn_1:cc.Node = null; //充值按钮1
    @property(cc.Node)
    Btn_2:cc.Node = null; //充值按钮2
    @property(cc.Node)
    Btn_3:cc.Node = null; //充值按钮3
    @property(cc.Node)
    Btn_4:cc.Node = null; //充值按钮4
    @property(cc.Node)
    Btn_5:cc.Node = null; //充值按钮5
    @property(cc.Node)
    Btn_6:cc.Node = null; //充值按钮6
    @property(cc.Label)
    gem_tips:cc.Label = null; // 弹窗文本

    @property(cc.Node)
    TipsPanelClose:cc.Node = null; //弹窗关闭按钮
    @property(cc.Node)
    TipsPanelOk:cc.Node = null; //弹窗确定按钮

    @property(cc.Node)
    BtnQH:cc.Node = null; //强化按钮
    @property(cc.Node)
    SkillPanel:cc.Node = null; //强化弹窗
   
    @property(cc.Node)
    BtnCJ:cc.Node = null; //成就按钮
    @property(cc.Node)
    CJPanel:cc.Node = null; //成就弹窗

    @property(cc.Node)
    BtnWeek:cc.Node = null; //周奖励按钮
    @property(cc.Node)
    WeekPanel:cc.Node = null; //周奖励弹窗

    @property(cc.Node)
    BtnDaily:cc.Node = null; //日奖励按钮
    @property(cc.Node)
    DailyPanel:cc.Node = null; //日奖励弹窗
    // 当前选择的充值选项
    private currentRechargeOption: {price: number, diamonds: number} = null;
    // 充值配置
    private rechargeConfig = {
        1: {price: 6, diamonds: 60},
        2: {price: 30, diamonds: 300},
        3: {price: 68, diamonds: 680},
        4: {price: 198, diamonds: 1980},
        5: {price: 328, diamonds: 3280},
        6: {price: 648, diamonds: 6480}
    };


    onLoad () {
        // 进行防沉迷检查
        this.checkAntiAddiction();
        
        // 设置定期防沉迷检查定时器
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);
        
        this.GetData();
        this.GetStaminaData(); // 获取体力数据
        this.GetLevelData(); // 获取关卡数据
        this.BtnStart.node.on(cc.Node.EventType.TOUCH_END,this.StartGame,this);
        this.BtnStart2.node.on(cc.Node.EventType.TOUCH_END,this.StartGame2,this);
        this.BtnBGM.node.on(cc.Node.EventType.TOUCH_END,this.CheckBGM,this);
        this.BtnRank.on(cc.Node.EventType.TOUCH_END,this.ShowRank,this);
        this.BtnClose.on(cc.Node.EventType.TOUCH_END,this.HideRank,this);
        this.BtnShop.on(cc.Node.EventType.TOUCH_END,this.ShowShop,this);
        this.BtnQH.on(cc.Node.EventType.TOUCH_END,this.ShowQH,this);
        this.BtnCJ.on(cc.Node.EventType.TOUCH_END,this.ShowCJ,this);
        this.BtnWeek.on(cc.Node.EventType.TOUCH_END,this.ShowWeek,this);
        this.BtnDaily.on(cc.Node.EventType.TOUCH_END,this.ShowDaily,this);

        if(this.BtnResetLevel){
            this.BtnResetLevel.node.on(cc.Node.EventType.TOUCH_END,this.ResetLevel,this);
        }
        if(this.BtnReset){
            this.BtnReset.on(cc.Node.EventType.TOUCH_END,this.ResetAccount,this);
        }
        // 为防沉迷提示面板的确定按钮添加事件监听
        this.NO18Panel.active = false
        if(this.btn_qd){
            this.btn_qd.on(cc.Node.EventType.TOUCH_END,this.onConfirmNo18,this);
        }

        //充值相关
        if(this.BtnCharge){
            this.BtnCharge.on(cc.Node.EventType.TOUCH_END,this.OnCharge,this);
        }
        if(this.Btn_closeCharge){
            this.Btn_closeCharge.on(cc.Node.EventType.TOUCH_END,this.OnCloseCharge,this);
        }

        // 为充值按钮添加点击事件
        if(this.Btn_1){
            this.Btn_1.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(1), this);
        }
        if(this.Btn_2){
            this.Btn_2.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(2), this);
        }
        if(this.Btn_3){
            this.Btn_3.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(3), this);
        }
        if(this.Btn_4){
            this.Btn_4.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(4), this);
        }
        if(this.Btn_5){
            this.Btn_5.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(5), this);
        }
        if(this.Btn_6){
            this.Btn_6.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(6), this);
        }

        if(this.TipsPanelClose){
            this.TipsPanelClose.on(cc.Node.EventType.TOUCH_END,this.OnCloseTips,this);
        }
        if(this.TipsPanelOk){
            this.TipsPanelOk.on(cc.Node.EventType.TOUCH_END,this.OnOkTips,this);
        }

        cc.director.preloadScene('Game');
        this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        this.weixinNode.active = false;
        if(mGameData.isBGMOn){
            // this.SpOn.active = true;
            // this.SpOff.active = false;
            cc.audioEngine.playMusic(this.Bgm, true);
            console.log('音乐开始播放');
        }else{
            // this.SpOn.active = false;
            // this.SpOff.active = true;
        }
        
        // 初始化时只需要调用一次UpdateRecoverTimerDisplay，它会处理所有初始化显示
        this.UpdateRecoverTimerDisplay();
        // 设置单个定时器，每秒更新一次倒计时和检查体力恢复
        this.schedule(this.UpdateRecoverTimerDisplay, 1);
        
        // 为staminaLabel添加点击事件监听器，用于切换recoverTimerLabel的可见性
        if(this.staminaLabel && this.staminaLabel.node){
            this.staminaLabel.node.on(cc.Node.EventType.TOUCH_END, this.toggleRecoverTimerVisibility, this);
        }
        
        // 明确设置recoverTimerLabel的初始状态为隐藏
        if(this.recoverTimerLabel && this.recoverTimerLabel.node){
            this.recoverTimerLabel.node.active = false;
        }
        
        // 初始化设置面板
        if(this.settingsPanel){
            this.settingsPanel.active = false;
        }
        
        // 为设置面板相关按钮添加事件监听
        if(this.BtnCloseSettings){
            this.BtnCloseSettings.on(cc.Node.EventType.TOUCH_END, this.closeSettings, this);
        }
        
        // 初始化音乐开关状态
        if(this.musicBtn){
            this.musicBtn.on(cc.Node.EventType.TOUCH_END, this.onMusicBtnClick, this);
        }
        if(this.musicOn && this.musicOff){
            this.musicOn.active = mGameData.isBGMOn;
            this.musicOff.active = !mGameData.isBGMOn;
        }
        
        // 初始化音效开关状态
        if(this.soundBtn){
            this.soundBtn.on(cc.Node.EventType.TOUCH_END, this.onSoundBtnClick, this);
        }
        if(this.soundOn && this.soundOff){
            this.soundOn.active = mGameData.isSoundOn;
            this.soundOff.active = !mGameData.isSoundOn;
        }
        
        // 更新当前关卡显示
        this.updateLevelDisplay();
        
        // 更新用户名显示
        this.updateUserDisplay();
        
        // 监听钻石数量更新事件
        cc.director.on('goldUpdated', this.UpdateGoldLabel, this);
        
        // 检查是否需要自动打开关卡选择界面
        if(mGameData.shouldOpenLevelSelect){
            console.log('自动打开关卡选择界面');
            // 明确设置为关卡模式
            mGameData.isInfiniteMode = false;
            // 显示关卡选择界面
            if(this.levelSelectPanel){
                this.levelSelectPanel.active = true;
            }else{
                console.error('关卡选择界面节点未设置');
            }
            // 重置标志位
            mGameData.shouldOpenLevelSelect = false;
        }
        
        // 检查是否是首次登录（剧情弹窗未显示过），如果是则显示剧情弹窗
        if (!mGameData.isStoryPopupShown()) {
            console.log('首次登录，显示剧情弹窗');
            this.initStoryPopup();
            mGameData.setStoryPopupShown();
        }
    }

    start(){
        // if(mGameData.isBGMOn){
        //     this.SpOn.active = true;
        //     this.SpOff.active = false;
        //     cc.audioEngine.play(this.Bgm,false,1);
        //     console.log('音乐开始播放');
        // }else{
        //     this.SpOn.active = false;
        //     this.SpOff.active = true;
        // }
    }
    /**
     * 开始游戏，点击事件
     */
    /**
     * 获取体力数据
     */
    GetStaminaData(){
        mGameData.GetStaminaData();
        // 获取钻石数据
        mGameData.GetGoldData();
        // 获取道具库存数据
        mGameData.GetItemStockData();
        // 更新钻石显示
        this.UpdateGoldLabel();
    }

    GetLevelData(){
        mGameData.GetLevelData();
    }
    
    /**
     * 更新恢复倒计时显示
     */
    UpdateRecoverTimerDisplay(){
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
    }
    
    /**
     * 更新主界面当前关卡显示
     */
    updateLevelDisplay(){        
        // 显示下一个要挑战的关卡（已解锁的关卡）
        const nextLevel = mGameData.unlockedLevel;
        console.log('unlockedLevel in mGameData:', nextLevel);
        
        if(this.cur_level){
            this.cur_level.string = '当前关卡：'+ nextLevel;   //显示下一个要挑战的关卡
        } else {
            console.error('主界面cur_level标签未赋值!');
        }
    }
    
    /**
     * 更新用户名显示
     */
    updateUserDisplay(){
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        if(this.user_label){
            if(userId){
                this.user_label.string = '玩家' + userId;
            } else {
                this.user_label.string = '未登录';
            }
        } else {
            console.error('主界面user_label标签未赋值!');
        }
    }
    
    /**
     * 重置关卡进度
     */
    ResetLevel(){        
        // 调用GameData中的重置方法
        mGameData.resetLevelProgress();
        // 更新主界面关卡显示
        this.updateLevelDisplay();
        
        // 刷新关卡选择界面（如果存在）
        if (this.levelSelectPanel) {
            const levelSelectManager = this.levelSelectPanel.getComponent('LevelSelectManager');
            if (levelSelectManager) {
                levelSelectManager.initLevelList();
            }
        }
        
        console.log('关卡进度已重置，当前关卡:', mGameData.currentLevel);
    }
    
    /**
     * 关闭关卡选择界面
     */
    closeLevelSelect(){
        if(this.levelSelectPanel){
            this.levelSelectPanel.active = false;
        }
    }
    
    /**
     * 仅更新体力标签显示
     */
    UpdateStaminaLabel(){
        if(this.staminaLabel){
            this.staminaLabel.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
        }
    }
    
    /**
     * 切换recoverTimerLabel的可见性
     */
    toggleRecoverTimerVisibility(){
        if(this.recoverTimerLabel && this.recoverTimerLabel.node){
            // 切换recoverTimerLabel的可见性
            this.recoverTimerLabel.node.active = !this.recoverTimerLabel.node.active;
            // 更新手动隐藏状态
            this.isRecoverTimerManuallyHidden = !this.recoverTimerLabel.node.active;
        }
    }
    
    /**
     * 更新充值界面钻石显示
     */
    updateGemTips(){
        if(this.gem_tips){
            this.gem_tips.string = `${mGameData.currentGold}`;
        }
    }
    
    /**
     * 更新钻石标签显示
     */
    UpdateGoldLabel(){
        if(this.gold_lb){
            this.gold_lb.string = `${mGameData.currentGold}`;
            console.log('currentGold:', mGameData.currentGold);
        }
        // 同时更新充值界面的钻石显示
        this.updateGemTips();
    }
    
    StartGame(){
        //  无限模式
        // cc.audioEngine.stopAll();
        // cc.director.loadScene('Game');
        // mGameData.initGame();

        if(mGameData.HasEnoughStamina()){
            //消耗体力
            if (mGameData.ConsumeStamina()) {
                UserDataSyncManager.recordConsumedStamina();
            }
            
            // 明确设置为无限模式
            mGameData.isInfiniteMode = true;
            
            // 无限模式直接加载游戏场景
            cc.audioEngine.stopMusic();
            cc.director.loadScene('Game');
            mGameData.initGame();
        }else{
            //体力不足，使用TipsManager显示提示
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
    }

    StartGame2(){
        //关卡模式
        if(mGameData.HasEnoughStamina()){
            // 明确设置为关卡模式
            mGameData.isInfiniteMode = false;
            //显示关卡选择界面
            if(this.levelSelectPanel){
                this.levelSelectPanel.active = true;
            }else{
                console.error('关卡选择界面节点未设置');
            }
        }else{
            //体力不足，使用TipsManager显示提示
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
    }

    ShowShop(){
        if(this.shopPanel){
            this.shopPanel.active = true;
        }else{
            console.error('商店界面节点未设置');
        }
    }
    
    /**
     * 打开设置面板，点击事件
     */
    CheckBGM(){
        if(this.settingsPanel){
            this.settingsPanel.active = true;
        }
    }

    /**
     * 获取微信存储的数据
     */
    GetData(){
        if(cc.sys.platform != cc.sys.WECHAT_GAME){
            return;
        }

        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const bestScoreKey = userId ? `${mGameData.BestScoreKey}_${userId}` : mGameData.BestScoreKey;
        
        (window as any).wx.getStorage({
            key:bestScoreKey,
            success:function(res){
                mGameData.BestScore = res.data;
            },
        })
    }
    /**
     * 微信分享
     */
    wxShare(){
    }

    /**
     * 打开排行榜
     */
    ShowRank(){
        if(this.rankPanel){
            this.rankPanel.active = true;
        }else{
            console.error('排行榜界面节点未设置');
        }
    }
    /**
     * 重置账号，切换账号
     */
    ResetAccount(){
        cc.sys.localStorage.removeItem('SLS_USERNAME');
        cc.sys.localStorage.removeItem('SLS_PASSWORD');
        cc.sys.localStorage.removeItem('SLS_USER_ID');
        cc.sys.localStorage.setItem('SLS_REALNAME', 'false');

        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        
        cc.director.loadScene('Load');
    }

    /**
     * 关闭微信排行榜
     */
    HideRank(){
        
    }
    
    /**
     * 初始化剧情弹窗
     */
    initStoryPopup(){
        // 设置游戏状态为未开始，阻止游戏逻辑执行
        mGameData.isGameBegin = false;
        
        // 显示剧情弹窗
        if(this.Story_node){
            this.Story_node.active = true;
        }
        
        // 初始化剧情文本数组（示例为十几行文本）
        this.storyLines = [
            "曾几何时，驾驭神龙的“龙骑士团”是这片星域的和平守卫者。然而，一场名为“虚空狂潮”的未知维度入侵，在短短数月内吞噬了所有的文明星球。",
            "龙骑士团在抵抗中全军覆没，宏伟的圣殿化为星际尘埃。现在，你是全宇宙仅存的一名龙骑士——最后的勇者。",
            "骑乘着浴火的红色巨龙，你孤独地悬浮于这片被死亡笼罩的深空。你的身后，是宇宙中最后一颗尚未被感染的生命之星；",
            "撕裂星际的密集激光弹幕瞬间将你无情笼罩，退无可退的绝境之下，唯有迎战！",
            "这不仅是为了生存，更是为了文明的延续。在这场紧张刺激的奇幻太空空战中，点燃你的热血，用龙息照亮这最黑暗的时代！",
        ];
        
        // 重置当前行索引和字符索引
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        
        // 清空当前文本
        if(this.r_story){
            this.r_story.string = "";
        }
        
        // 开始逐行显示文本
        this.showNextLine();
        
        // 禁用跳过按钮
        if(this.btn_jump){
            this.btn_jump.active = false;
            // 3秒后启用跳过按钮
            this.jumpButtonTimer = setTimeout(()=>{
                this.btn_jump.active = true;
                this.btn_jump.on(cc.Node.EventType.TOUCH_END,this.skipStory,this);
            }, 3000); // setTimeout使用毫秒
        }
    }
    
    /**
     * 逐行逐字显示剧情文本
     */
    private showNextLine(){
        if(this.currentLineIndex < this.storyLines.length && this.r_story){
            const currentLine = this.storyLines[this.currentLineIndex];
            
            if(this.currentCharIndex < currentLine.length){
                // 显示当前行的下一个字符
                this.r_story.string += currentLine.charAt(this.currentCharIndex);
                this.currentCharIndex++;
                
                // 调度显示下一个字符
                const timerId = setTimeout(() => {
                    this.showNextLine();
                }, this.charInterval * 1000); // setTimeout使用毫秒
                
                // 存储定时器ID，以便后续清除
                this.textTimers.push(timerId);
            } else {
                // 当前行显示完成，添加换行符（如果不是最后一行）
                if(this.currentLineIndex < this.storyLines.length - 1){
                    this.r_story.string += "<br/>";
                }
                
                // 重置字符索引，准备显示下一行
                this.currentCharIndex = 0;
                
                // 增加行索引
                this.currentLineIndex++;
                
                // 调度显示下一行
                if(this.currentLineIndex < this.storyLines.length){
                    const timerId = setTimeout(() => {
                        this.showNextLine();
                    }, this.lineInterval * 500); // setTimeout使用毫秒
                
                    // 存储定时器ID，以便后续清除
                    this.textTimers.push(timerId);
                } else {
                    // 所有文本显示完成，延迟1秒后自动开始游戏
                    const timerId = setTimeout(() => {
                        this.skipStory();
                    }, 1000);
                    this.textTimers.push(timerId);
                }
            }
        }
    }
    
    /**
     * 跳过剧情
     */
    skipStory(){
        // 清除所有JavaScript定时器
        this.textTimers.forEach(timerId => {
            clearTimeout(timerId);
        });
        this.textTimers = [];
        
        // 清除跳过按钮启用定时器
        if(this.jumpButtonTimer){
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
        
        // 隐藏剧情弹窗
        if(this.Story_node){
            this.Story_node.active = false;
        }
        
        // 移除跳过按钮的点击事件
        if(this.btn_jump){
            this.btn_jump.off(cc.Node.EventType.TOUCH_END,this.skipStory,this);
        }
        
        // 设置游戏状态为已开始
        mGameData.isGameBegin = true;
        // 回到主界面，不加载游戏场景
    }

    /**
     * 防沉迷检查
     */
    async checkAntiAddiction() {
        // 获取本地存储的用户名
        const username = cc.sys.localStorage.getItem('SLS_USERNAME');
        if (!username) {
            console.log('未找到用户名，跳过防沉迷检查');
            return;
        }
        
        try {
            const antiAddictionResult = await this.PostBreathe(APP_ID, username);
            console.log("主界面防沉迷检查结果:", antiAddictionResult);
            
            if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                // 显示防沉迷提示面板
                if (this.NO18Panel) {
                    this.NO18Panel.active = true;
                    if (this.tips_label) {
                        this.tips_label.string = antiAddictionResult.msg;
                    } else {
                        console.error('tips_label节点未设置');
                    }
                } else {
                    console.error('NO18Panel节点未设置');
                }
                return;
            }
            // 防沉迷检查通过，继续游戏
            console.log('主界面防沉迷检查通过');

            // 检查返回的时间是否到达二十点四十五分（仅未成年人检测）
            if (antiAddictionResult.data !== undefined && antiAddictionResult.data !== null) {
                // 读取年龄状态，仅未成年人执行检测
                const savedAgeStatus = cc.sys.localStorage.getItem(this.STORAGE_KEY_AGE_STATUS);
                if (savedAgeStatus !== '1') { // 1=成年人，其他=未成年人
                    // 后端明确返回10位数数字时间戳，直接传递
                    this.checkTimeAndShowPopup(antiAddictionResult.data as number);
                }
            }
        } catch (error) {
            console.error("主界面防沉迷检查失败:", error);
            // TipsManager.show('防沉迷检查失败，请重试');
            // 可以选择不阻止游戏，但应该提示用户
        }
    }
    
    /**
     * 请求心跳接口（防沉迷检查）
     */
    async PostBreathe(appid: string, username: string): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/Breathe";
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            
            xhr.send(JSON.stringify({ appid, username }));
        });
    }

    /**
     * 防沉迷提示面板确定按钮点击事件
     */
    onConfirmNo18() {
        // 隐藏防沉迷提示面板
        if (this.NO18Panel) {
            this.NO18Panel.active = false;
        }
        
        // 清除用户登录状态，防止返回登录界面后自动登录
        cc.sys.localStorage.removeItem('SLS_USERNAME');
        cc.sys.localStorage.removeItem('SLS_PASSWORD');
        
        // 返回登录界面
        cc.director.loadScene('Load');
    }

    OnCharge(){
        // 跳转到充值界面
        this.ChargePanel.active = true;
        // 更新充值界面的钻石显示
        this.updateGemTips();
    }

    OnCloseCharge(){
        // 关闭弹窗
        this.ChargePanel.active = false;
    }

    OnCloseTips(){
        // 关闭弹窗
        this.TipsPanel.active = false;
    }

    /**
     * 充值按钮点击事件处理
     * @param buttonId 按钮ID
     */
    onRechargeBtnClick(buttonId: number){
        // 获取当前选择的充值选项
        this.currentRechargeOption = this.rechargeConfig[buttonId];
        if(this.currentRechargeOption){
            // 设置提示文本
            if(this.L_tips){
                this.L_tips.string = `是否确认支付${this.currentRechargeOption.price}元人民币兑换${this.currentRechargeOption.diamonds}个钻石？`;
            }
            // 显示确认弹窗
            if(this.TipsPanel){
                this.TipsPanel.active = true;
            }
        }
    }

    async OnOkTips(){
        // 确认充值
        if(this.currentRechargeOption){
            // 在这里添加实际的充值处理逻辑
            try {
                const username = cc.sys.localStorage.getItem('SLS_USERNAME');
                const result = await this.PostPayDiamond(APP_ID, username, this.currentRechargeOption.diamonds);
                console.log("购买结果:", result);
                if(result.code === -1){
                    TipsWndManager.show(result.msg + '');
                    return;
                }
                if (result.code === 0) {
                    // 模拟充值成功，添加钻石
                    mGameData.addGold(this.currentRechargeOption.diamonds);
                    // 更新钻石显示
                    this.UpdateGoldLabel();
                    
                    // 显示充值成功提示
                    TipsManager.show(`兑换成功！获得${this.currentRechargeOption.diamonds}个钻石。`);
                    
                    // 重置当前选择的充值选项
                    this.currentRechargeOption = null;
                }
            } catch (error) {
                console.error("购买过程中出错:", error);
            }

            // // 模拟充值成功，添加钻石
            // mGameData.currentGold += this.currentRechargeOption.diamonds;
            // // 更新钻石显示
            // this.UpdateGoldLabel();
            // // 发送钻石更新事件
            // cc.director.emit('goldUpdated');
            
            // // 显示充值成功提示
            // TipsManager.show(`兑换成功！获得${this.currentRechargeOption.diamonds}个钻石。`);
            
            // // 重置当前选择的充值选项
            // this.currentRechargeOption = null;
        }
        // 关闭弹窗
        this.TipsPanel.active = false;
    }


    /**
     * 充值钻石接口
     */
    async PostPayDiamond(appid: string, username: string, diamond: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/PayDiamond";
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            
            xhr.send(JSON.stringify({ appid, username, diamond}));
        });
    }



    /**
     * 检查返回的时间是否到达二十点四十五分，如果到达则显示弹窗
     * @param timestamp 后端返回的10位数秒级时间戳
     */
     checkTimeAndShowPopup(timestamp: number): void {
        try {
            // 后端确定返回的是10位数秒级时间戳，直接转换为毫秒级
            const milliseconds = timestamp * 1000;
            // 创建Date对象
            const date = new Date(milliseconds);
            
            const hours: number = date.getHours();
            const minutes: number = date.getMinutes();
            console.log(date, hours, minutes,"bbbbbbbbb")
            // 目标时间：二十点四十五分
            const targetHour: number = 20;
            const targetMinute: number = 45;
            
            // 超过二十点四十六分不再检查
            const endHour: number = 20;
            const endMinute: number = 46;
            
            // 如果时间超过二十点四十六分，直接返回
            if (hours > endHour || (hours === endHour && minutes > endMinute)) {
                console.log('时间已超过二十点四十六分，不再执行检查');
                return;
            }
            
            // 如果已经显示过弹窗，直接返回
            if (this.hasShownTimePopup) {
                console.log('已经显示过二十点四十五分弹窗，不再显示');
                return;
            }

            // 判断是否到达目标时间
            if (hours > targetHour || (hours === targetHour && minutes >= targetMinute)) {
                console.log('时间已到达二十点四十五分，显示弹窗');
                // 调用TipsWndManager.show方法显示弹窗
                TipsWndManager.show('您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。');
                // 标记为已显示
                this.hasShownTimePopup = true;
            } else {
                console.log('时间尚未到达二十点四十五分');
            }
        } catch (error) {
            console.error('时间解析失败:', error);
        }
    }

    /**
     * 关闭设置面板
     */
    closeSettings(){
        if(this.settingsPanel){
            this.settingsPanel.active = false;
        }
    }
    
    /**
     * 音乐开关按钮点击回调
     */
    onMusicBtnClick(){
        mGameData.isBGMOn = !mGameData.isBGMOn;
        mGameData.SaveBGMOnData();
        
        // 更新精灵显示状态
        if(this.musicOn && this.musicOff){
            this.musicOn.active = mGameData.isBGMOn;
            this.musicOff.active = !mGameData.isBGMOn;
        }
        
        // 控制背景音乐
        if(mGameData.isBGMOn){
            cc.audioEngine.playMusic(this.Bgm, true);
        }else{
            cc.audioEngine.stopMusic();
        }
    }

    private onButtonTouchEnd(event: cc.Event.EventTouch): void {
        if (!mGameData.isSoundOn || !this.ClickEffect) {
            return;
        }

        let current = event.target as cc.Node;
        while (current && current !== this.node.parent) {
            const button = current.getComponent(cc.Button);
            if (button) {
                if (button.enabled && button.interactable && current.activeInHierarchy) {
                    cc.audioEngine.playEffect(this.ClickEffect, false);
                }
                return;
            }
            current = current.parent;
        }
    }

    onDestroy(): void {
        if (this.node.parent) {
            this.node.parent.off(cc.Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        }
    }
    
    /**
     * 音效开关按钮点击回调
     */
    onSoundBtnClick(){
        mGameData.isSoundOn = !mGameData.isSoundOn;
        mGameData.SaveSoundOnData();
        
        // 更新精灵显示状态
        if(this.soundOn && this.soundOff){
            this.soundOn.active = mGameData.isSoundOn;
            this.soundOff.active = !mGameData.isSoundOn;
        }
    }

    ShowQH(){
       if(this.SkillPanel){
            this.SkillPanel.active = true;
        }else{
            console.error('技能界面节点未设置');
        }
    }

    ShowCJ(){
       if(this.CJPanel){
            const achieveManager = this.CJPanel.getComponent('AchieveManager') as any;
            if (achieveManager && achieveManager.show) {
                achieveManager.show();
            } else {
                this.CJPanel.active = true;
            }
        }else{
            console.error('成就界面节点未设置');
        }
    }

    ShowWeek(){
       if(this.WeekPanel){
            this.WeekPanel.active = true;
        }else{
            console.error('周奖励界面节点未设置');
        }
    }

    ShowDaily(){
       if(this.DailyPanel){
            this.DailyPanel.active = true;
        }else{
            console.error('日奖励界面节点未设置');
        }
    }
}
