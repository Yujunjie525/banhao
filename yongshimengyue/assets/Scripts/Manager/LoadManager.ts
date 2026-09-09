const { ccclass, property } = cc._decorator;
import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import OnlineRewardManager from './OnlineRewardManager';
import StrengthenBossManager from './StrengthenBossManager';
import TipsManager from './TipsManager';
import TipsWndManager from './TipsWnd';
import WeekRewardManager from './WeekRewardManager';
import CoinShopManager from './CoinShopManager';
import ShopManager from './ShopManager';
import AchievementManager from './AchievementManager';
import { GameBackendApi } from '../../script/Api/GameBackendApi';
import GameController from '../../script/gameframe/GameController';
import { soundManager } from '../../script/common/manager/SoundManager';
@ccclass
export default class LoadManager extends cc.Component {
    @property(cc.Button)
    BtnStart: cc.Button = null;

    @property(cc.Node)
    NO18Panel: cc.Node = null;
    @property(cc.Label)
    tips_label: cc.Label = null;
    @property(cc.Node)
    btn_qd: cc.Node = null;
    private no18Btn: cc.Node = null;

    // 是否已经显示过二十点四十五分的弹窗
    private hasShownTimePopup: boolean = false;

    // 本地存储key
    // 年龄状态存储key，1=成年人，其他=未成年人
    private readonly STORAGE_KEY_AGE_STATUS = LocalStorageKeys.appKey('SLS_AGE_STATUS');

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
    // 剧情关闭后是否进入关卡。首页自动剧情只关闭面板，开始游戏触发的剧情才进关卡。
    private storyShouldStartGameAfterSkip: boolean = false;

    // 防沉迷检查间隔时间（秒）
    private antiAddictionInterval: number = 5; // 默认5秒检查一次

    @property(cc.Button)
    BtnStart2: cc.Button = null;

    @property(cc.Button)
    BtnBGM: cc.Button = null;

    @property(cc.Node)
    BtnShare: cc.Node = null;

    @property(cc.Node)
    BtnShop: cc.Node = null;

    @property(cc.Node)
    shopPanel: cc.Node = null;

    private achievementPanelNode: cc.Node = null;
    private strengthenPanelNode: cc.Node = null;
    private strengthenBossPanelNode: cc.Node = null;
    private weekRewardPanelNode: cc.Node = null;
    private onlineRewardPanelNode: cc.Node = null;
    private coinPanelNode: cc.Node = null;
    private addGoldBtnNode: cc.Node = null;
    private btnStrengthen: cc.Node = null;
    private btnStrengthenBoss: cc.Node = null;
    private btnWeekReward: cc.Node = null;
    private btnOnlineReward: cc.Node = null;
    private btnReward: cc.Node = null;
    private rewardMenuNode: cc.Node = null;

    @property(cc.Node)
    BtnRank: cc.Node = null;

    @property(cc.Node)
    BtnClose: cc.Node = null;

    @property(cc.Sprite)
    weixin: cc.Sprite = null;

    @property(cc.Node)
    weixinNode: cc.Node = null;

    @property(cc.Node)
    SpOn: cc.Node = null;

    @property(cc.Node)
    SpOff: cc.Node = null;

    @property(cc.AudioClip)
    Bgm: cc.AudioClip = null;

    @property(cc.Label)
    staminaLabel: cc.Label = null; //体力显示标签

    @property(cc.Label)
    recoverTimerLabel: cc.Label = null; //恢复倒计时显示标签

    @property(cc.Label)
    gold_lb: cc.Label = null; //当前钻石显示标签

    @property(cc.Label)
    cur_level: cc.Label = null; //当前关卡显示标签

    @property(cc.Button)
    BtnResetLevel: cc.Button = null; //重置关卡按钮

    @property(cc.Node)
    levelSelectPanel: cc.Node = null; //关卡选择界面节点

    @property(cc.Label)
    user_label: cc.Label = null; //当前用户名

    @property(cc.Node)
    BtnReset: cc.Node = null; //重置按钮

    // 剧情弹窗节点
    @property(cc.Node)
    Story_node: cc.Node = null;
    // 剧情文本节点
    @property(cc.RichText)
    r_story: cc.RichText = null;
    // 跳过按钮节点
    @property(cc.Node)
    btn_jump: cc.Node = null;

    @property(cc.Node)
    rankPanel: cc.Node = null;

    @property(cc.Node)
    BtnCharge: cc.Node = null; //充值按钮

    @property(cc.Node)
    settingsPanel: cc.Node = null; //设置面板
    @property(cc.Node)
    BtnCloseSettings: cc.Node = null; //关闭设置面板按钮
    @property(cc.Node)
    musicBtn: cc.Node = null; //音乐开关按钮
    @property(cc.Node)
    musicOn: cc.Node = null; //音乐开启精灵
    @property(cc.Node)
    musicOff: cc.Node = null; //音乐关闭精灵
    @property(cc.Node)
    soundBtn: cc.Node = null; //音效开关按钮
    @property(cc.Node)
    soundOn: cc.Node = null; //音效开启精灵
    @property(cc.Node)
    soundOff: cc.Node = null; //音效关闭精灵
    @property(cc.Node)
    achievement: cc.Node = null; //弹窗确定按钮

    private initialStoryLines: string[] = [
        "幽绿的致命毒沼正一点点吞噬昔日的王城，深渊的阴影中，矗立着最后那座破败的哥特古堡。当凡间沦为炼狱，一记古老而神圣的誓言在废墟中亮起——那便是《勇士盟约》。",
        " 幽蓝的魔法锁链，将身披暗甲的勇士与一袭红裙的公主死死相连，命运自此休戚与共。",
        "面对脚下疯狂翻涌、步步紧逼的深渊毒液，他们已退无可退。",
        "在这条悬浮于生与死边缘的破碎石阶上，勇士横跃深涧以命开路，公主凌空借力一飞冲天。",
        "两人唯有绝对的默契，向着古堡顶端那象征希望的星光绝命攀登。 只要盟约不断，希望便不会熄灭！",
    ];

    onLoad() {
        this.storyLines = this.initialStoryLines.slice();
        soundManager.installButtonClickSound();

        // localStorage.clear(); // 清除所有本地存储数据，重置游戏状态
        // 进行防沉迷检查
        this.checkAntiAddiction();

        // 设置定期防沉迷检查定时器
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);

        this.GetData();
        this.GetStaminaData(); // 获取体力数据
        this.GetLevelData(); // 获取关卡数据
        this.onlineRewardPanelNode = OnlineRewardManager.ensureTracker(this.node.parent || this.node).node;
        this.initCoinShopEntry();
        this.initItemShopEntry();
        this.initAchievementEntry();
        // 这些入口可能因预制体重新序列化而丢失拖拽引用，运行时按节点路径补回。
        const uiRoot = this.node.parent || this.node;
        if (!this.BtnShop) {
            this.BtnShop = cc.find('Bg/BtnShop', uiRoot) || this.findNodeByName(uiRoot, 'BtnShop');
        }
        if (!this.achievement) {
            this.achievement = this.findNodeByName(uiRoot, 'achievement');
        }
        // this.BtnStart.node.on(cc.Node.EventType.TOUCH_END, this.StartGame, this);
        this.BtnStart2.node.on(cc.Node.EventType.TOUCH_END, this.StartGame2, this);
        this.BtnBGM.node.on(cc.Node.EventType.TOUCH_END, this.CheckBGM, this);
        // this.BtnShare.on(cc.Node.EventType.TOUCH_END, this.wxShare, this);
        this.BtnRank.on(cc.Node.EventType.TOUCH_END, this.ShowRank, this);
        // this.BtnClose.on(cc.Node.EventType.TOUCH_END, this.HideRank, this);
        if (this.BtnShop) {
            this.BtnShop.on(cc.Node.EventType.TOUCH_END, this.ShowShop, this);
        } else {
            cc.warn('LoadManager: BtnShop 节点未找到，商店入口未绑定。');
        }

        if (this.achievement) {
            this.achievement.on(cc.Node.EventType.TOUCH_END, this.ShowAchievement, this);
        } else {
            cc.warn('LoadManager: achievement 节点未找到，成就入口未绑定。');
        }
        this.btnStrengthen = cc.find('Bg/Btnstrengthen', this.node.parent);
        if (this.btnStrengthen) {
            this.btnStrengthen.on(cc.Node.EventType.TOUCH_END, this.ShowStrengthen, this);
        }
        this.btnStrengthenBoss = cc.find('Bg/BtnstrengthenBoss', this.node.parent);
        if (this.btnStrengthenBoss) {
            this.btnStrengthenBoss.on(cc.Node.EventType.TOUCH_END, this.ShowStrengthenBoss, this);
        }
        this.strengthenBossPanelNode = cc.find('StrengthenBossPanel', this.node.parent);
        if (this.strengthenBossPanelNode) {
            this.strengthenBossPanelNode.active = false;
        }
        this.btnReward = cc.find('Bg/BtnReward', this.node.parent);
        this.rewardMenuNode = cc.find('Bg/BtnReward/RewardMenu', this.node.parent);
        this.btnWeekReward = cc.find('Bg/BtnReward/RewardMenu/BtnweekReward', this.node.parent);
        if (this.btnWeekReward) {
            this.btnWeekReward.on(cc.Node.EventType.TOUCH_END, this.ShowWeekReward, this);
        }
        this.btnOnlineReward = cc.find('Bg/BtnReward/RewardMenu/BtnonLineReward', this.node.parent);
        if (this.btnOnlineReward) {
            this.btnOnlineReward.on(cc.Node.EventType.TOUCH_END, this.ShowOnlineReward, this);
        }
        if (this.rewardMenuNode) {
            this.rewardMenuNode.active = false;
        }
        if (this.btnReward) {
            this.btnReward.on(cc.Node.EventType.TOUCH_END, this.ToggleRewardMenu, this);
        }
        if (this.BtnResetLevel) {
            this.BtnResetLevel.node.on(cc.Node.EventType.TOUCH_END, this.ResetLevel, this);
        }
        if (this.BtnReset) {
            this.BtnReset.on(cc.Node.EventType.TOUCH_END, this.ResetAccount, this);
        }
        // 为防沉迷提示面板的确定按钮添加事件监听
        this.NO18Panel.active = false
        this.bindNo18Buttons();

        //充值相关
        if (this.BtnCharge) {
            this.BtnCharge.on(cc.Node.EventType.TOUCH_END, this.OnCharge, this);
        }

        // cc.director.preloadScene('Level');
        // this.weixinNode.active = false;

        // 初始化时只需要调用一次UpdateRecoverTimerDisplay，它会处理所有初始化显示
        this.UpdateRecoverTimerDisplay();
        // 设置单个定时器，每秒更新一次倒计时和检查体力恢复
        this.schedule(this.UpdateRecoverTimerDisplay, 1);

        // 为staminaLabel添加点击事件监听器，用于切换recoverTimerLabel的可见性
        if (this.staminaLabel && this.staminaLabel.node) {
            this.staminaLabel.node.on(cc.Node.EventType.TOUCH_END, this.toggleRecoverTimerVisibility, this);
        }

        // 明确设置recoverTimerLabel的初始状态为隐藏
        if (this.recoverTimerLabel && this.recoverTimerLabel.node) {
            this.recoverTimerLabel.node.active = false;
        }

        // 初始化设置面板
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }

        // 为设置面板相关按钮添加事件监听
        if (this.BtnCloseSettings) {
            this.BtnCloseSettings.on(cc.Node.EventType.TOUCH_END, this.closeSettings, this);
        }

        // 初始化音乐开关状态
        if (this.musicBtn) {
            this.musicBtn.on(cc.Node.EventType.TOUCH_END, this.onMusicBtnClick, this);
        }
        if (this.musicOn && this.musicOff) {
            this.musicOn.active = mGameData.isBGMOn;
            this.musicOff.active = !mGameData.isBGMOn;
        }

        // 初始化音效开关状态
        if (this.soundBtn) {
            this.soundBtn.on(cc.Node.EventType.TOUCH_END, this.onSoundBtnClick, this);
        }
        if (this.soundOn && this.soundOff) {
            this.soundOn.active = mGameData.isSoundOn;
            this.soundOff.active = !mGameData.isSoundOn;
        }

        // 更新当前关卡显示
        this.updateLevelDisplay();

        // 更新用户名显示
        this.updateUserDisplay();

        // 监听钻石数量更新事件
        cc.director.on('goldUpdated', this.UpdateGoldLabel, this);
        cc.director.on('staminaUpdated', this.UpdateStaminaLabel, this);
        cc.director.on('levelUpdated', this.updateLevelDisplay, this);

        // 检查是否需要自动打开关卡选择界面
        if (mGameData.shouldOpenLevelSelect) {
            console.log('自动打开关卡选择界面');
            // 明确设置为关卡模式
            mGameData.isInfiniteMode = false;
            // 显示关卡选择界面
            if (this.levelSelectPanel) {
                this.levelSelectPanel.active = true;
            } else {
                console.error('关卡选择界面节点未设置');
            }
            // 重置标志位
            mGameData.shouldOpenLevelSelect = false;
        }
    }

    start() {
        // if(mGameData.isBGMOn){
        //     this.SpOn.active = true;
        //     this.SpOff.active = false;
        //     cc.audioEngine.play(this.Bgm,false,1);
        //     console.log('音乐开始播放');
        // }else{
        //     this.SpOn.active = false;
        //     this.SpOff.active = true;
        // }
        this.scheduleOnce(() => {
            if (!this.node || !this.node.isValid) {
                return;
            }
            if (this.shouldAutoShowInitialStory()) {
                this.tryShowInitialStory();
            }
        }, 0);
    }
    /**
     * 开始游戏，点击事件
     */
    /**
     * 获取体力数据
     */
    GetStaminaData() {
        mGameData.GetStaminaData();
        // 获取钻石数据
        mGameData.GetGoldData();
        mGameData.GetSoulStoneData();
        // 获取道具库存数据
        mGameData.GetItemStockData();
        mGameData.GetGoodsInventoryData();
        // 更新钻石显示
        this.UpdateGoldLabel();
    }

    GetLevelData() {
        mGameData.GetLevelData();
    }

    /**
     * 更新恢复倒计时显示
     */
    UpdateRecoverTimerDisplay() {
        // 先检查体力恢复
        mGameData.CheckAndRecoverStamina();
        // 更新体力显示
        this.UpdateStaminaLabel();

        // 检查体力是否已满
        const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;

        if (this.recoverTimerLabel) {
            if (isStaminaFull) {
                this.recoverTimerLabel.string = "体力已满";
            } else {
                // 体力未满时，更新倒计时文本内容
                const timeString = mGameData.GetFormattedRecoverTime();
                this.recoverTimerLabel.string = `下次体力恢复：${timeString}`;

                // 根据用户手动隐藏状态决定是否显示
                if (!this.isRecoverTimerManuallyHidden) {
                    this.recoverTimerLabel.node.active = true;
                }
            }
        }
    }

    /**
     * 更新主界面当前关卡显示
     */
    updateLevelDisplay() {
        const playableMaxLevel = Math.max(1, Number(mGameData.getHighestUnlockedLevel()) || Number(mGameData.unlockedLevel) || 1);
        console.log('playableMaxLevel in mGameData:', playableMaxLevel);

        if (this.cur_level) {
            this.cur_level.string = '当前关卡：' + playableMaxLevel;
        } else {
            console.error('主界面cur_level标签未赋值!');
        }
    }

    /**
     * 更新用户名显示
     */
    updateUserDisplay() {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        if (this.user_label) {
            if (userId) {
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
    ResetLevel() {
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
    closeLevelSelect() {
        if (this.levelSelectPanel) {
            this.levelSelectPanel.active = false;
        }
    }

    /**
     * 仅更新体力标签显示
     */
    UpdateStaminaLabel() {
        if (this.staminaLabel) {
            this.staminaLabel.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
        }
    }

    /**
     * 切换recoverTimerLabel的可见性
     */
    toggleRecoverTimerVisibility() {
        if (this.recoverTimerLabel && this.recoverTimerLabel.node) {
            // 切换recoverTimerLabel的可见性
            this.recoverTimerLabel.node.active = !this.recoverTimerLabel.node.active;
            // 更新手动隐藏状态
            this.isRecoverTimerManuallyHidden = !this.recoverTimerLabel.node.active;
        }
    }

    /**
     * 更新钻石标签显示
     */
    UpdateGoldLabel() {
        if (this.gold_lb) {
            this.gold_lb.string = `${mGameData.currentGold}`;
        }
    }

    StartGame() {
        //  无限模式
        // cc.audioEngine.stopAll();
        // cc.director.loadScene('Game');
        // mGameData.initGame();

        if (mGameData.HasEnoughStamina()) {
            //消耗体力
            mGameData.ConsumeStamina();

            // 明确设置为无限模式
            mGameData.isInfiniteMode = true;
            this.refreshBattleConfig();

            if (this.tryShowInitialStory(true)) {
                return;
            }

            // 无限模式直接加载游戏场景
            cc.audioEngine.stopAll();
            cc.director.loadScene('Level');
            mGameData.initGame();
        } else {
            //体力不足，使用TipsManager显示提示
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
    }

    StartGame2() {
        //关卡模式
        if (mGameData.HasEnoughStamina()) {
            // 明确设置为关卡模式
            mGameData.isInfiniteMode = false;
            //显示关卡选择界面
            if (this.levelSelectPanel) {
                this.levelSelectPanel.active = true;
            } else {
                console.error('关卡选择界面节点未设置');
            }
        } else {
            //体力不足，使用TipsManager显示提示
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
    }

    private refreshBattleConfig() {
        const level = Math.max(1, Number(mGameData.currentLevel) || Number(GameController.curLevel) || 1);
        GameController.refreshCurrentConfig(level);
    }

    ShowShop() {
        this.showItemShop();
    }

    ShowAchievement() {
        if (!this.achievementPanelNode || !cc.isValid(this.achievementPanelNode)) {
            this.achievementPanelNode = cc.find('AchievementPanel', this.node.parent);
        }

        if (this.achievementPanelNode) {
            this.ensureAchievementManager(this.achievementPanelNode);
            this.achievementPanelNode.active = true;
        } else {
            console.error('AchievementPanel not found');
        }
    }

    ShowStrengthen() {
        if (!this.strengthenPanelNode || !cc.isValid(this.strengthenPanelNode)) {
            this.strengthenPanelNode = cc.find('StrengthenPanel', this.node.parent);
        }

        if (this.strengthenPanelNode) {
            this.strengthenPanelNode.active = true;
        } else {
            console.error('StrengthenPanel not found');
        }
    }

    ShowStrengthenBoss() {
        if (!this.strengthenBossPanelNode || !cc.isValid(this.strengthenBossPanelNode)) {
            this.strengthenBossPanelNode = cc.find('StrengthenBossPanel', this.node.parent);
        }

        if (this.strengthenBossPanelNode) {
            if (!this.strengthenBossPanelNode.getComponent(StrengthenBossManager)) {
                this.strengthenBossPanelNode.addComponent(StrengthenBossManager);
            }
            this.strengthenBossPanelNode.active = true;
        } else {
            console.error('StrengthenBossPanel not found');
        }
    }

    private ToggleRewardMenu(event: cc.Event.EventTouch): void {
        // RewardMenu 目前位于 BtnReward 下，忽略由两个子按钮冒泡上来的触摸。
        if (event && event.target !== this.btnReward) {
            return;
        }
        if (!this.rewardMenuNode || !cc.isValid(this.rewardMenuNode)) {
            return;
        }
        event.stopPropagation();
        this.rewardMenuNode.active = !this.rewardMenuNode.active;
    }

    private ensureWeekRewardPanel(): cc.Node {
        if (this.weekRewardPanelNode && cc.isValid(this.weekRewardPanelNode)) {
            if (!this.weekRewardPanelNode.getComponent(WeekRewardManager)) {
                this.weekRewardPanelNode.addComponent(WeekRewardManager);
            }
            return this.weekRewardPanelNode;
        }

        const parentNode = this.node.parent || this.node;
        this.weekRewardPanelNode = cc.find('weekRewardPanel', parentNode);
        if (!this.weekRewardPanelNode) {
            this.weekRewardPanelNode = new cc.Node('weekRewardPanel');
            this.weekRewardPanelNode.parent = parentNode;
            this.weekRewardPanelNode.setContentSize(parentNode.getContentSize());
            this.weekRewardPanelNode.setPosition(0, 0);
            this.weekRewardPanelNode.active = false;
        }

        if (!this.weekRewardPanelNode.getComponent(WeekRewardManager)) {
            this.weekRewardPanelNode.addComponent(WeekRewardManager);
        }

        return this.weekRewardPanelNode;
    }

    ShowWeekReward() {
        const panelNode = this.ensureWeekRewardPanel();
        if (panelNode) {
            const manager = panelNode.getComponent(WeekRewardManager);
            if (manager) {
                if ((manager as any).isReady) {
                    panelNode.active = true;
                } else {
                    this.scheduleOnce(() => {
                        if (cc.isValid(panelNode)) {
                            panelNode.active = true;
                        }
                    }, 0.02);
                }
            } else {
                panelNode.active = true;
            }
        } else {
            console.error('周奖励界面节点未设置');
        }
    }

    private ensureOnlineRewardPanel(): cc.Node {
        const manager = OnlineRewardManager.ensureTracker(this.node.parent || this.node);
        this.onlineRewardPanelNode = manager ? manager.node : null;
        return this.onlineRewardPanelNode;
    }

    ShowOnlineReward() {
        const panelNode = this.ensureOnlineRewardPanel();
        if (panelNode) {
            const manager = panelNode.getComponent(OnlineRewardManager);
            if (manager) {
                // 如果 manager 尚未完成 onLoad 初始化，延迟到下一帧再打开，避免第一次点击无效
                if ((manager as any).isReady) {
                    manager.showPanel();
                } else {
                    this.scheduleOnce(() => {
                        if (cc.isValid(manager) && typeof (manager as any).showPanel === 'function') {
                            (manager as any).showPanel();
                        }
                    }, 0.02);
                }
            } else {
                panelNode.active = true;
            }
        } else {
            console.error('在线奖励界面节点未设置');
        }
    }

    /**
     * 打开设置面板，点击事件
     */
    CheckBGM() {
        if (this.settingsPanel) {
            this.settingsPanel.active = true;
        }
    }

    /**
     * 获取微信存储的数据
     */
    GetData() {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }

        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const bestScoreKey = LocalStorageKeys.userKey(mGameData.BestScoreKey, userId);

        wx.getStorage({
            key: bestScoreKey,
            success: function (res) {
                mGameData.BestScore = res.data;
            },
        })
    }
    /**
     * 微信分享
     */
    wxShare() {
    }

    /**
     * 打开排行榜
     */
    ShowRank() {
        if (this.rankPanel) {
            this.rankPanel.active = true;
        } else {
            console.error('排行榜界面节点未设置');
        }
    }
    /**
     * 重置账号，切换账号
     */
    ResetAccount() {
        mGameData.clearAllLocalSavedData();
        cc.sys.localStorage.setItem(LocalStorageKeys.appKey('SLS_LOCAL_RESET_PENDING'), 'true');

        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');

        cc.director.loadScene('Splash');
    }

    /**
     * 关闭微信排行榜
     */
    HideRank() {

    }

    public tryShowInitialStory(startGameAfterSkip: boolean = false): boolean {
        if (mGameData.isStoryPopupShown()) {
            return false;
        }

        this.storyShouldStartGameAfterSkip = startGameAfterSkip;
        this.initStoryPopup();
        mGameData.setStoryPopupShown();
        return true;
    }

    private shouldAutoShowInitialStory(): boolean {
        if (mGameData.isStoryPopupShown()) {
            return false;
        }

        const currentLevel = Math.max(1, Number(mGameData.currentLevel) || 1);
        const unlockedLevel = Math.max(1, Number(mGameData.unlockedLevel) || 1);
        return currentLevel <= 1 && unlockedLevel <= 1;
    }

    /**
     * 初始化剧情弹窗
     */
    initStoryPopup() {
        // 设置游戏状态为未开始，阻止游戏逻辑执行
        mGameData.isGameBegin = false;
        this.clearStoryTimers();

        // 显示剧情弹窗
        if (this.Story_node) {
            this.Story_node.active = true;
        }



        // 重置当前行索引和字符索引
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;

        // 清空当前文本
        if (this.r_story) {
            this.r_story.string = "";
        }

        // 开始逐行显示文本
        this.showNextLine();

        // 禁用跳过按钮
        if (this.btn_jump) {
            this.btn_jump.off(cc.Node.EventType.TOUCH_END, this.skipStory, this);
            this.btn_jump.active = false;
            // 3秒后启用跳过按钮
            this.jumpButtonTimer = setTimeout(() => {
                this.btn_jump.active = true;
                this.btn_jump.on(cc.Node.EventType.TOUCH_END, this.skipStory, this);
            }, 3000); // setTimeout使用毫秒
        }
    }

    /**
     * 逐行逐字显示剧情文本
     */
    private showNextLine() {
        if (this.currentLineIndex < this.storyLines.length && this.r_story) {
            const currentLine = this.storyLines[this.currentLineIndex];

            if (this.currentCharIndex < currentLine.length) {
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
                if (this.currentLineIndex < this.storyLines.length - 1) {
                    this.r_story.string += "<br/>";
                }

                // 重置字符索引，准备显示下一行
                this.currentCharIndex = 0;

                // 增加行索引
                this.currentLineIndex++;

                // 调度显示下一行
                if (this.currentLineIndex < this.storyLines.length) {
                    const timerId = setTimeout(() => {
                        this.showNextLine();
                    }, this.lineInterval * 500); // setTimeout使用毫秒

                    // 存储定时器ID，以便后续清除
                    this.textTimers.push(timerId);
                } else {
                    // 所有文本显示完成后停留在剧情面板，等待玩家手动点击跳过。
                    if (this.btn_jump) {
                        this.btn_jump.active = true;
                    }
                }
            }
        }
    }

    /**
     * 进入独立的盟约追逐灰盒场景。
     * 副玩法不复用主玩法的关卡选择和体力扣除流程，避免状态互相污染。
     */

    private clearStoryTimers() {
        this.textTimers.forEach(timerId => {
            clearTimeout(timerId);
        });
        this.textTimers = [];

        if (this.jumpButtonTimer) {
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
    }

    /**
     * 跳过剧情
     */
    skipStory() {
        // 清除所有JavaScript定时器
        this.clearStoryTimers();

        // 隐藏剧情弹窗
        if (this.Story_node) {
            this.Story_node.active = false;
        }

        // 移除跳过按钮的点击事件
        if (this.btn_jump) {
            this.btn_jump.off(cc.Node.EventType.TOUCH_END, this.skipStory, this);
        }

        // 开始游戏
        mGameData.isGameBegin = true;
        if (!this.storyShouldStartGameAfterSkip) {
            return;
        }

        this.storyShouldStartGameAfterSkip = false;
        this.refreshBattleConfig();

        // 加载游戏场景
        cc.audioEngine.stopAll();
        cc.director.loadScene('Level');
        mGameData.initGame();
    }

    /**
     * 防沉迷检查
     */
    async checkAntiAddiction() {
        // 获取本地存储的用户名
        const username = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USERNAME'));
        if (!username) {
            console.log('未找到用户名，跳过防沉迷检查');
            return;
        }

        try {
            const antiAddictionResult = await GameBackendApi.breathe(username);
            // const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", username);
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
     * 防沉迷提示面板确定按钮点击事件
     */
    onConfirmNo18() {
        // 隐藏防沉迷提示面板
        if (this.NO18Panel) {
            this.NO18Panel.active = false;
        }

        // 清除用户登录状态，防止返回登录界面后自动登录
        mGameData.clearAllLocalSavedData();
        cc.sys.localStorage.setItem(LocalStorageKeys.appKey('SLS_LOCAL_RESET_PENDING'), 'true');

        // 返回登录界面
        cc.director.loadScene('Splash');
    }

    private bindNo18Buttons(): void {
        this.no18Btn = this.NO18Panel ? this.NO18Panel.getChildByName('btn') : null;
        this.bindNo18Button(this.btn_qd);
        this.bindNo18Button(this.no18Btn);
    }

    private initCoinShopEntry(): void {
        const root = this.node.parent || this.node;
        this.coinPanelNode = cc.find('CoinPanel', root);
        if (this.coinPanelNode) {
            this.coinPanelNode.active = false;
            this.ensureCoinShopManager(this.coinPanelNode);
        }

        this.addGoldBtnNode = cc.find('Bg/addBtn', root) || this.findNodeByName(root, 'addBtn');
        if (this.addGoldBtnNode) {
            this.addGoldBtnNode.off(cc.Node.EventType.TOUCH_END, this.showCoinShop, this);
            this.addGoldBtnNode.on(cc.Node.EventType.TOUCH_END, this.showCoinShop, this);
        }
    }

    private initItemShopEntry(): void {
        const root = this.node.parent || this.node;
        this.shopPanel = cc.find('ShopPanel', root);
        if (!this.shopPanel) {
            this.shopPanel = new cc.Node('ShopPanel');
            root.addChild(this.shopPanel, 999);
            this.shopPanel.setContentSize(Math.min(580, cc.winSize.width - 36), Math.min(760, cc.winSize.height - 100));
        }
        if (this.shopPanel) {
            this.shopPanel.active = false;
            this.ensureItemShopManager(this.shopPanel);
        }
    }

    private initAchievementEntry(): void {
        const root = this.node.parent || this.node;
        this.achievementPanelNode = cc.find('AchievementPanel', root);
        if (!this.achievementPanelNode) {
            this.achievementPanelNode = new cc.Node('AchievementPanel');
            root.addChild(this.achievementPanelNode, 998);
            this.achievementPanelNode.setContentSize(Math.min(580, cc.winSize.width - 36), Math.min(800, cc.winSize.height - 80));
        }
        if (this.achievementPanelNode) {
            this.achievementPanelNode.active = false;
            this.ensureAchievementManager(this.achievementPanelNode);
        }
    }

    private ensureAchievementManager(panel: cc.Node): void {
        if (!panel || !cc.isValid(panel)) {
            return;
        }
        let manager = panel.getComponent(AchievementManager);
        if (!manager) {
            manager = panel.addComponent(AchievementManager);
        }
        manager.enabled = true;
    }

    private showItemShop(): void {
        if (!this.shopPanel || !cc.isValid(this.shopPanel)) {
            this.shopPanel = cc.find('ShopPanel', this.node.parent || this.node);
        }
        if (!this.shopPanel) {
            console.error('ShopPanel node not found.');
            return;
        }
        this.ensureItemShopManager(this.shopPanel);
        this.shopPanel.active = true;
        if (this.shopPanel.parent) {
            this.shopPanel.setSiblingIndex(this.shopPanel.parent.childrenCount - 1);
        }
    }

    private ensureItemShopManager(panel: cc.Node): void {
        if (!panel || !cc.isValid(panel)) {
            return;
        }
        // 通过类名获取，避免商店脚本的编辑器缓存问题阻断 LoadManager 主流程。
        const managerClass: any = cc.js.getClassByName('ItemShopManager');
        if (!managerClass) {
            cc.warn('LoadManager: ItemShopManager 尚未加载，商店面板暂不可用。');
            return;
        }
        let manager = panel.getComponent(managerClass);
        if (!manager) {
            manager = panel.addComponent(managerClass);
        }
        manager.enabled = true;
    }

    private showCoinShop(): void {
        if (!this.coinPanelNode || !cc.isValid(this.coinPanelNode)) {
            this.coinPanelNode = cc.find('CoinPanel', this.node.parent || this.node);
        }
        if (!this.coinPanelNode) {
            console.error('CoinPanel node not found.');
            return;
        }
        this.ensureCoinShopManager(this.coinPanelNode);
        this.coinPanelNode.active = true;
        if (this.coinPanelNode.parent) {
            this.coinPanelNode.setSiblingIndex(this.coinPanelNode.parent.childrenCount - 1);
        }
    }

    private ensureCoinShopManager(panel: cc.Node): void {
        if (!panel || !cc.isValid(panel)) {
            return;
        }

        const shopManager = panel.getComponent(ShopManager);
        if (shopManager) {
            shopManager.enabled = false;
        }

        if (!panel.getComponent(CoinShopManager)) {
            panel.addComponent(CoinShopManager);
        }
    }

    private findNodeByName(root: cc.Node, nodeName: string): cc.Node {
        if (!root || !cc.isValid(root)) {
            return null;
        }
        if (root.name === nodeName) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findNodeByName(root.children[i], nodeName);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private unbindNo18Buttons(): void {
        this.unbindNo18Button(this.btn_qd);
        this.unbindNo18Button(this.no18Btn);
        this.no18Btn = null;
    }

    private bindNo18Button(button: cc.Node): void {
        if (!button || !button.isValid) {
            return;
        }
        button.off(cc.Node.EventType.TOUCH_END, this.onConfirmNo18, this);
        button.on(cc.Node.EventType.TOUCH_END, this.onConfirmNo18, this);
    }

    private unbindNo18Button(button: cc.Node): void {
        if (!button || !button.isValid) {
            return;
        }
        button.off(cc.Node.EventType.TOUCH_END, this.onConfirmNo18, this);
    }

    OnCharge() {
        this.showCoinShop();
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
            console.log(date, hours, minutes, "bbbbbbbbb")
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
    closeSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
    }

    /**
     * 音乐开关按钮点击回调
     */
    onMusicBtnClick() {
        mGameData.isBGMOn = !mGameData.isBGMOn;
        mGameData.SaveBGMOnData();

        // 更新精灵显示状态
        if (this.musicOn && this.musicOff) {
            this.musicOn.active = mGameData.isBGMOn;
            this.musicOff.active = !mGameData.isBGMOn;
        }

        // 控制背景音乐
        // 背景音乐只在战场内播放，这里只保存开关状态并刷新图标。
    }

    /**
     * 音效开关按钮点击回调
     */
    onSoundBtnClick() {
        mGameData.isSoundOn = !mGameData.isSoundOn;
        mGameData.SaveSoundOnData();

        // 更新精灵显示状态
        if (this.soundOn && this.soundOff) {
            this.soundOn.active = mGameData.isSoundOn;
            this.soundOff.active = !mGameData.isSoundOn;
        }
    }

    onDestroy() {
        this.clearStoryTimers();
        if (this.btnReward) {
            this.btnReward.off(cc.Node.EventType.TOUCH_END, this.ToggleRewardMenu, this);
        }
        if (this.btnWeekReward) {
            this.btnWeekReward.off(cc.Node.EventType.TOUCH_END, this.ShowWeekReward, this);
        }
        if (this.btnOnlineReward) {
            this.btnOnlineReward.off(cc.Node.EventType.TOUCH_END, this.ShowOnlineReward, this);
        }
        if (this.addGoldBtnNode) {
            this.addGoldBtnNode.off(cc.Node.EventType.TOUCH_END, this.showCoinShop, this);
        }
        this.unbindNo18Buttons();
        cc.director.off('goldUpdated', this.UpdateGoldLabel, this);
        cc.director.off('staminaUpdated', this.UpdateStaminaLabel, this);
        cc.director.off('levelUpdated', this.updateLevelDisplay, this);
    }
}
