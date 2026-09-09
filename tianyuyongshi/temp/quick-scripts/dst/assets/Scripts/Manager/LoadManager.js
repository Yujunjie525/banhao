
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/LoadManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b1c79fh2ttElqkrUtfVQQI+', 'LoadManager');
// Scripts/Manager/LoadManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../Load/GameData");
var TipsManager_1 = require("../Load/TipsManager");
var TipsWnd_1 = require("../Load/TipsWnd");
var AppConfig_1 = require("../Common/AppConfig");
var StateBridge_1 = require("../game2/StateBridge");
var Constants_1 = require("../game2/Constants");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var LoadManager = /** @class */ (function (_super) {
    __extends(LoadManager, _super);
    function LoadManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.BtnStart = null;
        _this.NO18Panel = null;
        _this.tips_label = null;
        _this.btn_qd = null;
        // 是否已经显示过二十点四十五分的弹窗
        _this.hasShownTimePopup = false;
        // 本地存储key
        // 年龄状态存储key，1=成年人，其他=未成年人
        _this.STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
        // 跟踪用户手动隐藏recoverTimerLabel的状态
        // 初始设置为true，确保recoverTimerLabel默认是隐藏的
        _this.isRecoverTimerManuallyHidden = true;
        // 剧情文本数组
        _this.storyLines = [];
        // 当前显示的行索引
        _this.currentLineIndex = 0;
        // 文本显示间隔时间（秒）
        _this.lineInterval = 0.5;
        // 字符显示间隔时间（秒）
        _this.charInterval = 0.05;
        // 当前行的字符索引
        _this.currentCharIndex = 0;
        // 文本显示定时器ID数组
        _this.textTimers = [];
        // 跳过按钮启用定时器ID
        _this.jumpButtonTimer = null;
        // 防沉迷检查间隔时间（秒）
        _this.antiAddictionInterval = 5; // 默认5秒检查一次
        _this.BtnStart2 = null;
        _this.BtnBGM = null;
        _this.BtnShop = null;
        _this.shopPanel = null;
        _this.BtnRank = null;
        _this.BtnClose = null;
        _this.weixin = null;
        _this.weixinNode = null;
        _this.SpOn = null;
        _this.SpOff = null;
        _this.Bgm = null;
        _this.staminaLabel = null; //体力显示标签
        _this.recoverTimerLabel = null; //恢复倒计时显示标签
        _this.gold_lb = null; //当前钻石显示标签
        _this.shenpoLabel = null;
        _this.cur_level = null; //当前关卡显示标签
        _this.BtnResetLevel = null; //重置关卡按钮
        _this.levelSelectPanel = null; //关卡选择界面节点
        _this.user_label = null; //当前用户名
        _this.BtnReset = null; //重置按钮
        // 剧情弹窗节点
        _this.Story_node = null;
        // 剧情文本节点
        _this.r_story = null;
        // 跳过按钮节点
        _this.btn_jump = null;
        _this.rankPanel = null;
        _this.BtnCharge = null; //充值按钮
        _this.ChargePanel = null; //充值界面
        _this.settingsPanel = null; //设置面板
        _this.BtnCloseSettings = null; //关闭设置面板按钮
        _this.musicBtn = null; //音乐开关按钮
        _this.musicOn = null; //音乐开启精灵
        _this.musicOff = null; //音乐关闭精灵
        _this.soundBtn = null; //音效开关按钮
        _this.soundOn = null; //音效开启精灵
        _this.soundOff = null; //音效关闭精灵
        _this.TipsPanel = null; //弹窗
        _this.L_tips = null; // 弹窗文本
        _this.Btn_closeCharge = null;
        _this.Btn_1 = null; //充值按钮1
        _this.Btn_2 = null; //充值按钮2
        _this.Btn_3 = null; //充值按钮3
        _this.Btn_4 = null; //充值按钮4
        _this.Btn_5 = null; //充值按钮5
        _this.Btn_6 = null; //充值按钮6
        _this.gem_tips = null; // 弹窗文本
        _this.TipsPanelClose = null; //弹窗关闭按钮
        _this.TipsPanelOk = null; //弹窗确定按钮
        _this.BtnQH = null; //强化按钮
        _this.SkillPanel = null; //强化弹窗
        _this.QianghuaPanel = null; //新强化弹窗
        _this.BtnCJ = null; //成就按钮
        _this.CJPanel = null; //成就弹窗
        _this.BtnWeek = null; //周奖励按钮
        _this.WeekPanel = null; //周奖励弹窗
        _this.BtnDaily = null; //日奖励按钮
        _this.DailyPanel = null; //日奖励弹窗
        // 当前选择的充值选项
        _this.currentRechargeOption = null;
        // 充值配置
        _this.rechargeConfig = {
            1: { price: 6, diamonds: 60 },
            2: { price: 30, diamonds: 300 },
            3: { price: 68, diamonds: 680 },
            4: { price: 198, diamonds: 1980 },
            5: { price: 328, diamonds: 3280 },
            6: { price: 648, diamonds: 6480 }
        };
        _this._xuanPreloaded = false;
        _this._xuanPreloading = false;
        _this._xuanAssetsPreloaded = false;
        return _this;
    }
    LoadManager.prototype.onLoad = function () {
        var _this = this;
        // 进行防沉迷检查
        this.checkAntiAddiction();
        // 设置定期防沉迷检查定时器
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);
        this.GetData();
        this.GetStaminaData(); // 获取体力数据
        this.GetLevelData(); // 获取关卡数据
        StateBridge_1.default.syncForStartScene();
        this.BtnStart.node.on(cc.Node.EventType.TOUCH_END, this.StartGame, this);
        this.BtnStart2.node.on(cc.Node.EventType.TOUCH_END, this.StartGame2, this);
        this.BtnBGM.node.on(cc.Node.EventType.TOUCH_END, this.CheckBGM, this);
        this.BtnRank.on(cc.Node.EventType.TOUCH_END, this.ShowRank, this);
        this.BtnClose.on(cc.Node.EventType.TOUCH_END, this.HideRank, this);
        this.BtnShop.on(cc.Node.EventType.TOUCH_END, this.ShowShop, this);
        this.BtnQH.on(cc.Node.EventType.TOUCH_END, this.ShowQH, this);
        this.BtnCJ.on(cc.Node.EventType.TOUCH_END, this.ShowCJ, this);
        this.BtnWeek.on(cc.Node.EventType.TOUCH_END, this.ShowWeek, this);
        this.BtnDaily.on(cc.Node.EventType.TOUCH_END, this.ShowDaily, this);
        cc.loader.loadResDir('zzImg2', cc.SpriteFrame, function () { });
        cc.director.preloadScene(Constants_1.Scene.Youxi);
        if (this.BtnResetLevel) {
            this.BtnResetLevel.node.on(cc.Node.EventType.TOUCH_END, this.ResetLevel, this);
        }
        if (this.BtnReset) {
            this.BtnReset.on(cc.Node.EventType.TOUCH_END, this.ResetAccount, this);
        }
        // 为防沉迷提示面板的确定按钮添加事件监听
        this.NO18Panel.active = false;
        if (this.btn_qd) {
            this.btn_qd.on(cc.Node.EventType.TOUCH_END, this.onConfirmNo18, this);
        }
        //充值相关
        if (this.BtnCharge) {
            this.BtnCharge.on(cc.Node.EventType.TOUCH_END, this.OnCharge, this);
        }
        if (this.Btn_closeCharge) {
            this.Btn_closeCharge.on(cc.Node.EventType.TOUCH_END, this.OnCloseCharge, this);
        }
        // 为充值按钮添加点击事件
        if (this.Btn_1) {
            this.Btn_1.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(1); }, this);
        }
        if (this.Btn_2) {
            this.Btn_2.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(2); }, this);
        }
        if (this.Btn_3) {
            this.Btn_3.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(3); }, this);
        }
        if (this.Btn_4) {
            this.Btn_4.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(4); }, this);
        }
        if (this.Btn_5) {
            this.Btn_5.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(5); }, this);
        }
        if (this.Btn_6) {
            this.Btn_6.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRechargeBtnClick(6); }, this);
        }
        if (this.TipsPanelClose) {
            this.TipsPanelClose.on(cc.Node.EventType.TOUCH_END, this.OnCloseTips, this);
        }
        if (this.TipsPanelOk) {
            this.TipsPanelOk.on(cc.Node.EventType.TOUCH_END, this.OnOkTips, this);
        }
        cc.director.preloadScene(Constants_1.Scene.Youxi);
        this.weixinNode.active = false;
        if (GameData_1.default.isBGMOn) {
            // this.SpOn.active = true;
            // this.SpOff.active = false;
            cc.audioEngine.play(this.Bgm, false, 1);
            console.log('音乐开始播放');
        }
        else {
            // this.SpOn.active = false;
            // this.SpOff.active = true;
        }
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
            this.musicOn.active = GameData_1.default.isBGMOn;
            this.musicOff.active = !GameData_1.default.isBGMOn;
        }
        // 初始化音效开关状态
        if (this.soundBtn) {
            this.soundBtn.on(cc.Node.EventType.TOUCH_END, this.onSoundBtnClick, this);
        }
        if (this.soundOn && this.soundOff) {
            this.soundOn.active = GameData_1.default.isSoundOn;
            this.soundOff.active = !GameData_1.default.isSoundOn;
        }
        // 更新当前关卡显示
        this.updateLevelDisplay();
        // 更新用户名显示
        this.updateUserDisplay();
        // 监听钻石数量更新事件
        cc.director.on('goldUpdated', this.UpdateGoldLabel, this);
        cc.director.on('shenpoUpdated', this.UpdateShenpoLabel, this);
        // 检查是否需要自动打开关卡选择界面
        if (GameData_1.default.shouldOpenLevelSelect) {
            console.log('自动打开关卡选择界面');
            // 明确设置为关卡模式
            GameData_1.default.isInfiniteMode = false;
            // 显示关卡选择界面
            if (this.levelSelectPanel) {
                this.levelSelectPanel.active = true;
            }
            else {
                console.error('关卡选择界面节点未设置');
            }
            // 重置标志位
            GameData_1.default.shouldOpenLevelSelect = false;
        }
        // 检查是否是首次登录（剧情弹窗未显示过），如果是则显示剧情弹窗
        if (!GameData_1.default.isStoryPopupShown()) {
            console.log('首次登录，显示剧情弹窗');
            this.initStoryPopup();
            GameData_1.default.setStoryPopupShown();
        }
    };
    LoadManager.prototype.start = function () {
        // if(mGameData.isBGMOn){
        //     this.SpOn.active = true;
        //     this.SpOff.active = false;
        //     cc.audioEngine.play(this.Bgm,false,1);
        //     console.log('音乐开始播放');
        // }else{
        //     this.SpOn.active = false;
        //     this.SpOff.active = true;
        // }
    };
    /**
     * 开始游戏，点击事件
     */
    /**
     * 获取体力数据
     */
    LoadManager.prototype.GetStaminaData = function () {
        GameData_1.default.GetStaminaData();
        // 获取钻石数据
        GameData_1.default.GetGoldData();
        // 获取道具库存数据
        GameData_1.default.GetItemStockData();
        // 更新钻石显示
        this.UpdateGoldLabel();
        this.UpdateShenpoLabel();
    };
    LoadManager.prototype.GetLevelData = function () {
        GameData_1.default.GetLevelData();
    };
    /**
     * 更新恢复倒计时显示
     */
    LoadManager.prototype.UpdateRecoverTimerDisplay = function () {
        // 先检查体力恢复
        GameData_1.default.CheckAndRecoverStamina();
        // 更新体力显示
        this.UpdateStaminaLabel();
        // 检查体力是否已满
        var isStaminaFull = GameData_1.default.currentStamina >= GameData_1.default.maxStamina;
        if (this.recoverTimerLabel) {
            if (isStaminaFull) {
                this.recoverTimerLabel.string = "体力已满";
            }
            else {
                // 体力未满时，更新倒计时文本内容
                var timeString = GameData_1.default.GetFormattedRecoverTime();
                this.recoverTimerLabel.string = "\u4E0B\u6B21\u4F53\u529B\u6062\u590D\uFF1A" + timeString;
                // 根据用户手动隐藏状态决定是否显示
                if (!this.isRecoverTimerManuallyHidden) {
                    this.recoverTimerLabel.node.active = true;
                }
            }
        }
    };
    /**
     * 更新主界面当前关卡显示
     */
    LoadManager.prototype.updateLevelDisplay = function () {
        GameData_1.default.GetBestScoreData();
        if (this.cur_level) {
            this.cur_level.string = '最高分：' + (GameData_1.default.BestScore || 0);
        }
        else {
            console.error('主界面cur_level标签未赋值!');
        }
    };
    /**
     * 更新用户名显示
     */
    LoadManager.prototype.updateUserDisplay = function () {
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        if (this.user_label) {
            if (userId) {
                this.user_label.string = '玩家' + userId;
            }
            else {
                this.user_label.string = '未登录';
            }
        }
        else {
            console.error('主界面user_label标签未赋值!');
        }
    };
    /**
     * 重置关卡进度
     */
    LoadManager.prototype.ResetLevel = function () {
        // 调用GameData中的重置方法
        GameData_1.default.resetLevelProgress();
        // 更新主界面关卡显示
        this.updateLevelDisplay();
        // 刷新关卡选择界面（如果存在）
        console.log('关卡进度已重置，当前关卡:', GameData_1.default.currentLevel);
    };
    /**
     * 关闭关卡选择界面
     */
    LoadManager.prototype.closeLevelSelect = function () {
        if (this.levelSelectPanel) {
            this.levelSelectPanel.active = false;
        }
    };
    /**
     * 仅更新体力标签显示
     */
    LoadManager.prototype.UpdateStaminaLabel = function () {
        if (this.staminaLabel) {
            this.staminaLabel.string = GameData_1.default.currentStamina + "/" + GameData_1.default.maxStamina;
        }
    };
    /**
     * 切换recoverTimerLabel的可见性
     */
    LoadManager.prototype.toggleRecoverTimerVisibility = function () {
        if (this.recoverTimerLabel && this.recoverTimerLabel.node) {
            // 切换recoverTimerLabel的可见性
            this.recoverTimerLabel.node.active = !this.recoverTimerLabel.node.active;
            // 更新手动隐藏状态
            this.isRecoverTimerManuallyHidden = !this.recoverTimerLabel.node.active;
        }
    };
    /**
     * 更新充值界面钻石显示
     */
    LoadManager.prototype.updateGemTips = function () {
        if (this.gem_tips) {
            this.gem_tips.string = "" + GameData_1.default.currentGold;
        }
    };
    /**
     * 更新钻石标签显示
     */
    LoadManager.prototype.UpdateGoldLabel = function () {
        if (this.gold_lb) {
            this.gold_lb.string = "" + GameData_1.default.currentGold;
            console.log('currentGold:', GameData_1.default.currentGold);
        }
        // 同时更新充值界面的钻石显示
        this.updateGemTips();
    };
    LoadManager.prototype.UpdateShenpoLabel = function () {
        if (!this.shenpoLabel) {
            return;
        }
        this.shenpoLabel.string = "" + StateBridge_1.default.getShenpo();
    };
    LoadManager.prototype.StartGame = function () {
        //  无限模式
        // cc.audioEngine.stopAll();
        if (StateBridge_1.default.consumeStamina()) {
            //消耗体力
            // 明确设置为无限模式
            GameData_1.default.isInfiniteMode = true;
            // 无限模式直接加载游戏场景
            cc.audioEngine.stopAll();
            StateBridge_1.default.prepareLevelSelection();
            cc.director.loadScene(Constants_1.Scene.Youxi);
        }
        else {
            //体力不足，使用TipsManager显示提示
            TipsManager_1.default.show('体力不足，无法开始游戏。');
            return;
        }
    };
    LoadManager.prototype.StartGame2 = function () {
        //关卡模式
        if (StateBridge_1.default.consumeStamina()) {
            // 明确设置为关卡模式
            GameData_1.default.isInfiniteMode = true;
            StateBridge_1.default.prepareLevelSelection();
            cc.audioEngine.stopAll();
            cc.director.loadScene(Constants_1.Scene.Youxi);
        }
        else {
            //体力不足，使用TipsManager显示提示
            TipsManager_1.default.show('体力不足，无法开始游戏。');
            return;
        }
    };
    LoadManager.prototype.preloadXuanScene = function () {
        var _this = this;
        if (this._xuanPreloaded || this._xuanPreloading)
            return;
        this._xuanPreloading = true;
        this.preloadXuanAssets();
        cc.director.preloadScene('xuan', function () {
            _this._xuanPreloaded = true;
            _this._xuanPreloading = false;
        });
    };
    LoadManager.prototype.loadXuanScene = function () {
        var _this = this;
        if (this._xuanPreloaded) {
            cc.director.loadScene('xuan');
            return;
        }
        this._xuanPreloading = true;
        this.preloadXuanAssets();
        cc.director.preloadScene('xuan', function () {
            _this._xuanPreloaded = true;
            _this._xuanPreloading = false;
            cc.director.loadScene('xuan');
        });
    };
    LoadManager.prototype.preloadXuanAssets = function () {
        if (this._xuanAssetsPreloaded)
            return;
        this._xuanAssetsPreloaded = true;
        cc.loader.loadResDir('zzImg', cc.SpriteFrame, function () { });
    };
    LoadManager.prototype.ShowShop = function () {
        if (this.shopPanel) {
            this.shopPanel.active = true;
        }
        else {
            console.error('商店界面节点未设置');
        }
    };
    /**
     * 打开设置面板，点击事件
     */
    LoadManager.prototype.CheckBGM = function () {
        if (this.settingsPanel) {
            this.settingsPanel.active = true;
        }
    };
    /**
     * 获取微信存储的数据
     */
    LoadManager.prototype.GetData = function () {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        var bestScoreKey = userId ? GameData_1.default.BestScoreKey + "_" + userId : GameData_1.default.BestScoreKey;
        window.wx.getStorage({
            key: bestScoreKey,
            success: function (res) {
                GameData_1.default.BestScore = res.data;
            },
        });
    };
    /**
     * 微信分享
     */
    LoadManager.prototype.wxShare = function () {
    };
    /**
     * 打开排行榜
     */
    LoadManager.prototype.ShowRank = function () {
        if (this.rankPanel) {
            this.rankPanel.active = true;
        }
        else {
            console.error('排行榜界面节点未设置');
        }
    };
    /**
     * 重置账号，切换账号
     */
    LoadManager.prototype.ResetAccount = function () {
        cc.sys.localStorage.removeItem('SLS_USERNAME');
        cc.sys.localStorage.removeItem('SLS_PASSWORD');
        cc.sys.localStorage.removeItem('SLS_USER_ID');
        cc.sys.localStorage.setItem('SLS_REALNAME', 'false');
        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        cc.director.loadScene('Load');
    };
    /**
     * 关闭微信排行榜
     */
    LoadManager.prototype.HideRank = function () {
    };
    /**
     * 初始化剧情弹窗
     */
    LoadManager.prototype.initStoryPopup = function () {
        var _this = this;
        // 设置游戏状态为未开始，阻止游戏逻辑执行
        GameData_1.default.isGameBegin = false;
        // 显示剧情弹窗
        if (this.Story_node) {
            this.Story_node.active = true;
            this.fitStoryPopupToScreen();
            this.scheduleOnce(function () { return _this.fitStoryPopupToScreen(); }, 0);
        }
        // 初始化剧情文本数组（示例为十几行文本）
        this.storyLines = [
            "苍穹崩裂，狂风呼啸，妖魔的嘶吼震碎了东方玄幻世界的宁静，凡间瞬间沦为炼狱。在那巍峨的神核之上，阴阳法阵流转着古老而神圣的光辉，无数天御勇士身披流光铠甲，如星辰般环绕，誓死守护这最后的希望。他们背对神核，直面来自四面八方的滔天妖魔浪潮，以血肉之躯铸就钢铁防线，只为护佑苍生，捍卫天道秩序的永恒，直至最后一息。",
        ];
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
            this.btn_jump.active = false;
            // 3秒后启用跳过按钮
            this.jumpButtonTimer = setTimeout(function () {
                _this.btn_jump.active = true;
                _this.btn_jump.on(cc.Node.EventType.TOUCH_END, _this.skipStory, _this);
            }, 3000); // setTimeout使用毫秒
        }
    };
    /**
     * Fit story popup backgrounds to current Canvas size.
     */
    LoadManager.prototype.fitStoryPopupToScreen = function () {
        if (!this.Story_node)
            return;
        this.fitNodeToParent(this.Story_node);
        this.fitNodeToParent(this.Story_node.getChildByName('story_bg'));
        this.fitNodeToParent(this.Story_node.getChildByName('beijing3'));
    };
    LoadManager.prototype.fitNodeToParent = function (node) {
        if (!node || !node.parent)
            return;
        var parentSize = node.parent.getContentSize();
        if (parentSize.width <= 0 || parentSize.height <= 0)
            return;
        node.setContentSize(parentSize);
        node.setPosition((0.5 - node.parent.anchorX) * parentSize.width, (0.5 - node.parent.anchorY) * parentSize.height);
        var sprite = node.getComponent(cc.Sprite);
        if (sprite)
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignHorizontalCenter = false;
            widget.isAlignVerticalCenter = false;
            widget.left = 0;
            widget.right = 0;
            widget.top = 0;
            widget.bottom = 0;
            widget.updateAlignment();
        }
    };
    /**
     * 逐行逐字显示剧情文本
     */
    LoadManager.prototype.showNextLine = function () {
        var _this = this;
        if (this.currentLineIndex < this.storyLines.length && this.r_story) {
            var currentLine = this.storyLines[this.currentLineIndex];
            if (this.currentCharIndex < currentLine.length) {
                // 显示当前行的下一个字符
                this.r_story.string += currentLine.charAt(this.currentCharIndex);
                this.currentCharIndex++;
                // 调度显示下一个字符
                var timerId = setTimeout(function () {
                    _this.showNextLine();
                }, this.charInterval * 1000); // setTimeout使用毫秒
                // 存储定时器ID，以便后续清除
                this.textTimers.push(timerId);
            }
            else {
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
                    var timerId = setTimeout(function () {
                        _this.showNextLine();
                    }, this.lineInterval * 500); // setTimeout使用毫秒
                    // 存储定时器ID，以便后续清除
                    this.textTimers.push(timerId);
                }
                else {
                    // 所有文本显示完成后保持弹窗，等待玩家手动点击跳过按钮。
                }
            }
        }
    };
    /**
     * 跳过剧情
     */
    LoadManager.prototype.skipStory = function () {
        // 清除所有JavaScript定时器
        this.textTimers.forEach(function (timerId) {
            clearTimeout(timerId);
        });
        this.textTimers = [];
        // 清除跳过按钮启用定时器
        if (this.jumpButtonTimer) {
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
        // 隐藏剧情弹窗
        if (this.Story_node) {
            this.Story_node.active = false;
        }
        // 移除跳过按钮的点击事件
        if (this.btn_jump) {
            this.btn_jump.off(cc.Node.EventType.TOUCH_END, this.skipStory, this);
        }
        // 设置游戏状态为已开始
        GameData_1.default.isGameBegin = true;
        // 回到主界面，不加载游戏场景
    };
    /**
     * 防沉迷检查
     */
    LoadManager.prototype.checkAntiAddiction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var username, antiAddictionResult, savedAgeStatus, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        username = cc.sys.localStorage.getItem('SLS_USERNAME');
                        if (!username) {
                            console.log('未找到用户名，跳过防沉迷检查');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.PostBreathe(AppConfig_1.APP_ID, username)];
                    case 2:
                        antiAddictionResult = _a.sent();
                        console.log("主界面防沉迷检查结果:", antiAddictionResult);
                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // 显示防沉迷提示面板
                            if (this.NO18Panel) {
                                this.NO18Panel.active = true;
                                if (this.tips_label) {
                                    this.tips_label.string = antiAddictionResult.msg;
                                }
                                else {
                                    console.error('tips_label节点未设置');
                                }
                            }
                            else {
                                console.error('NO18Panel节点未设置');
                            }
                            return [2 /*return*/];
                        }
                        // 防沉迷检查通过，继续游戏
                        console.log('主界面防沉迷检查通过');
                        // 检查返回的时间是否到达二十点四十五分（仅未成年人检测）
                        if (antiAddictionResult.data !== undefined && antiAddictionResult.data !== null) {
                            savedAgeStatus = cc.sys.localStorage.getItem(this.STORAGE_KEY_AGE_STATUS);
                            if (savedAgeStatus !== '1') { // 1=成年人，其他=未成年人
                                // 后端明确返回10位数数字时间戳，直接传递
                                this.checkTimeAndShowPopup(antiAddictionResult.data);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("主界面防沉迷检查失败:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 请求心跳接口（防沉迷检查）
     */
    LoadManager.prototype.PostBreathe = function (appid, username) {
        return __awaiter(this, void 0, Promise, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://pay.szvi-bo.com/v1/testapp/Breathe";
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.onload = function () {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    var data = JSON.parse(xhr.responseText);
                                    resolve(data);
                                }
                                catch (e) {
                                    reject(new Error("JSON\u89E3\u6790\u9519\u8BEF: " + e.message));
                                }
                            }
                            else {
                                reject(new Error("HTTP\u9519\u8BEF: " + xhr.status));
                            }
                        };
                        xhr.onerror = function () { return reject(new Error('网络请求失败')); };
                        xhr.ontimeout = function () { return reject(new Error('网络请求超时')); };
                        xhr.send(JSON.stringify({ appid: appid, username: username }));
                    })];
            });
        });
    };
    /**
     * 防沉迷提示面板确定按钮点击事件
     */
    LoadManager.prototype.onConfirmNo18 = function () {
        // 隐藏防沉迷提示面板
        if (this.NO18Panel) {
            this.NO18Panel.active = false;
        }
        // 清除用户登录状态，防止返回登录界面后自动登录
        cc.sys.localStorage.removeItem('SLS_USERNAME');
        cc.sys.localStorage.removeItem('SLS_PASSWORD');
        // 返回登录界面
        cc.director.loadScene('Load');
    };
    LoadManager.prototype.OnCharge = function () {
        // 跳转到充值界面
        this.ChargePanel.active = true;
        // 更新充值界面的钻石显示
        this.updateGemTips();
    };
    LoadManager.prototype.OnCloseCharge = function () {
        // 关闭弹窗
        this.ChargePanel.active = false;
    };
    LoadManager.prototype.OnCloseTips = function () {
        // 关闭弹窗
        this.TipsPanel.active = false;
    };
    /**
     * 充值按钮点击事件处理
     * @param buttonId 按钮ID
     */
    LoadManager.prototype.onRechargeBtnClick = function (buttonId) {
        // 获取当前选择的充值选项
        this.currentRechargeOption = this.rechargeConfig[buttonId];
        if (this.currentRechargeOption) {
            // 设置提示文本
            if (this.L_tips) {
                this.L_tips.string = "\u662F\u5426\u786E\u8BA4\u652F\u4ED8" + this.currentRechargeOption.price + "\u5143\u4EBA\u6C11\u5E01\u5151\u6362" + this.currentRechargeOption.diamonds + "\u4E2A\u94BB\u77F3\uFF1F";
            }
            // 显示确认弹窗
            if (this.TipsPanel) {
                this.TipsPanel.active = true;
            }
        }
    };
    LoadManager.prototype.OnOkTips = function () {
        return __awaiter(this, void 0, void 0, function () {
            var username, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentRechargeOption) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        username = cc.sys.localStorage.getItem('SLS_USERNAME');
                        return [4 /*yield*/, this.PostPayDiamond(AppConfig_1.APP_ID, username, this.currentRechargeOption.diamonds)];
                    case 2:
                        result = _a.sent();
                        console.log("购买结果:", result);
                        if (result.code === -1) {
                            TipsWnd_1.default.show(result.msg + '');
                            return [2 /*return*/];
                        }
                        if (result.code === 0) {
                            // 模拟充值成功，添加钻石
                            GameData_1.default.addGold(this.currentRechargeOption.diamonds);
                            // 更新钻石显示
                            this.UpdateGoldLabel();
                            // 显示充值成功提示
                            TipsManager_1.default.show("\u5151\u6362\u6210\u529F\uFF01\u83B7\u5F97" + this.currentRechargeOption.diamonds + "\u4E2A\u94BB\u77F3\u3002");
                            // 重置当前选择的充值选项
                            this.currentRechargeOption = null;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("购买过程中出错:", error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        // 关闭弹窗
                        this.TipsPanel.active = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 充值钻石接口
     */
    LoadManager.prototype.PostPayDiamond = function (appid, username, diamond) {
        return __awaiter(this, void 0, Promise, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://pay.szvi-bo.com/v1/testapp/PayDiamond";
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.onload = function () {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    var data = JSON.parse(xhr.responseText);
                                    resolve(data);
                                }
                                catch (e) {
                                    reject(new Error("JSON\u89E3\u6790\u9519\u8BEF: " + e.message));
                                }
                            }
                            else {
                                reject(new Error("HTTP\u9519\u8BEF: " + xhr.status));
                            }
                        };
                        xhr.onerror = function () { return reject(new Error('网络请求失败')); };
                        xhr.ontimeout = function () { return reject(new Error('网络请求超时')); };
                        xhr.send(JSON.stringify({ appid: appid, username: username, diamond: diamond }));
                    })];
            });
        });
    };
    /**
     * 检查返回的时间是否到达二十点四十五分，如果到达则显示弹窗
     * @param timestamp 后端返回的10位数秒级时间戳
     */
    LoadManager.prototype.checkTimeAndShowPopup = function (timestamp) {
        try {
            // 后端确定返回的是10位数秒级时间戳，直接转换为毫秒级
            var milliseconds = timestamp * 1000;
            // 创建Date对象
            var date = new Date(milliseconds);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            console.log(date, hours, minutes, "bbbbbbbbb");
            // 目标时间：二十点四十五分
            var targetHour = 20;
            var targetMinute = 45;
            // 超过二十点四十六分不再检查
            var endHour = 20;
            var endMinute = 46;
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
                TipsWnd_1.default.show('您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。');
                // 标记为已显示
                this.hasShownTimePopup = true;
            }
            else {
                console.log('时间尚未到达二十点四十五分');
            }
        }
        catch (error) {
            console.error('时间解析失败:', error);
        }
    };
    /**
     * 关闭设置面板
     */
    LoadManager.prototype.closeSettings = function () {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
    };
    /**
     * 音乐开关按钮点击回调
     */
    LoadManager.prototype.onMusicBtnClick = function () {
        GameData_1.default.isBGMOn = !GameData_1.default.isBGMOn;
        GameData_1.default.SaveBGMOnData();
        // 更新精灵显示状态
        if (this.musicOn && this.musicOff) {
            this.musicOn.active = GameData_1.default.isBGMOn;
            this.musicOff.active = !GameData_1.default.isBGMOn;
        }
        // 控制背景音乐
        if (GameData_1.default.isBGMOn) {
            cc.audioEngine.play(this.Bgm, false, 1);
        }
        else {
            cc.audioEngine.stopAll();
        }
    };
    /**
     * 音效开关按钮点击回调
     */
    LoadManager.prototype.onSoundBtnClick = function () {
        GameData_1.default.isSoundOn = !GameData_1.default.isSoundOn;
        GameData_1.default.SaveSoundOnData();
        // 更新精灵显示状态
        if (this.soundOn && this.soundOff) {
            this.soundOn.active = GameData_1.default.isSoundOn;
            this.soundOff.active = !GameData_1.default.isSoundOn;
        }
    };
    LoadManager.prototype.ShowQH = function () {
        var _this = this;
        StateBridge_1.default.prepareUpgrade();
        if (this.QianghuaPanel) {
            this.QianghuaPanel.active = true;
            this.scheduleOnce(function () {
                var upgradeController = _this.QianghuaPanel.getComponent('UpgradeController');
                if (upgradeController && upgradeController.showAsPopup) {
                    upgradeController.showAsPopup();
                }
            }, 0);
        }
        else {
            console.error('新强化弹窗节点未设置');
        }
    };
    LoadManager.prototype.ShowCJ = function () {
        if (this.CJPanel) {
            var achieveManager = this.CJPanel.getComponent('AchieveManager');
            if (achieveManager && achieveManager.show) {
                achieveManager.show();
            }
            else {
                this.CJPanel.active = true;
            }
        }
        else {
            console.error('成就界面节点未设置');
        }
    };
    LoadManager.prototype.ShowWeek = function () {
        if (this.WeekPanel) {
            this.WeekPanel.active = true;
        }
        else {
            console.error('周奖励界面节点未设置');
        }
    };
    LoadManager.prototype.ShowDaily = function () {
        if (this.DailyPanel) {
            this.DailyPanel.active = true;
        }
        else {
            console.error('日奖励界面节点未设置');
        }
    };
    __decorate([
        property(cc.Button)
    ], LoadManager.prototype, "BtnStart", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "NO18Panel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "tips_label", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "btn_qd", void 0);
    __decorate([
        property(cc.Button)
    ], LoadManager.prototype, "BtnStart2", void 0);
    __decorate([
        property(cc.Button)
    ], LoadManager.prototype, "BtnBGM", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnShop", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "shopPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnRank", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnClose", void 0);
    __decorate([
        property(cc.Sprite)
    ], LoadManager.prototype, "weixin", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "weixinNode", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "SpOn", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "SpOff", void 0);
    __decorate([
        property(cc.AudioClip)
    ], LoadManager.prototype, "Bgm", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "staminaLabel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "recoverTimerLabel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "gold_lb", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "shenpoLabel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "cur_level", void 0);
    __decorate([
        property(cc.Button)
    ], LoadManager.prototype, "BtnResetLevel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "levelSelectPanel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "user_label", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnReset", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Story_node", void 0);
    __decorate([
        property(cc.RichText)
    ], LoadManager.prototype, "r_story", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "btn_jump", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "rankPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnCharge", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "ChargePanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "settingsPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnCloseSettings", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "musicBtn", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "musicOn", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "musicOff", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "soundBtn", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "soundOn", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "soundOff", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "TipsPanel", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "L_tips", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_closeCharge", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_1", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_2", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_3", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_4", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_5", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "Btn_6", void 0);
    __decorate([
        property(cc.Label)
    ], LoadManager.prototype, "gem_tips", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "TipsPanelClose", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "TipsPanelOk", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnQH", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "SkillPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "QianghuaPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnCJ", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "CJPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnWeek", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "WeekPanel", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "BtnDaily", void 0);
    __decorate([
        property(cc.Node)
    ], LoadManager.prototype, "DailyPanel", void 0);
    LoadManager = __decorate([
        ccclass
    ], LoadManager);
    return LoadManager;
}(cc.Component));
exports.default = LoadManager;

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcTG9hZE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUF5QztBQUN6QyxtREFBOEM7QUFDOUMsMkNBQTZDO0FBQzdDLGlEQUE2QztBQUU3QyxvREFBK0M7QUFDL0MsZ0RBQTJDO0FBRXJDLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBSTFDO0lBQXlDLCtCQUFZO0lBQXJEO1FBQUEscUVBd29DQztRQXRvQ0csY0FBUSxHQUFhLElBQUksQ0FBQztRQUcxQixlQUFTLEdBQVcsSUFBSSxDQUFDO1FBRXpCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBRTNCLFlBQU0sR0FBVyxJQUFJLENBQUM7UUFFdEIsb0JBQW9CO1FBQ1osdUJBQWlCLEdBQVksS0FBSyxDQUFDO1FBRTNDLFVBQVU7UUFDViwwQkFBMEI7UUFDVCw0QkFBc0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUUzRCwrQkFBK0I7UUFDL0Isc0NBQXNDO1FBQzlCLGtDQUE0QixHQUFZLElBQUksQ0FBQztRQUVyRCxTQUFTO1FBQ0QsZ0JBQVUsR0FBYSxFQUFFLENBQUM7UUFDbEMsV0FBVztRQUNILHNCQUFnQixHQUFXLENBQUMsQ0FBQztRQUNyQyxjQUFjO1FBQ04sa0JBQVksR0FBVyxHQUFHLENBQUM7UUFDbkMsY0FBYztRQUNOLGtCQUFZLEdBQVcsSUFBSSxDQUFDO1FBQ3BDLFdBQVc7UUFDSCxzQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDckMsY0FBYztRQUNOLGdCQUFVLEdBQXFCLEVBQUUsQ0FBQztRQUMxQyxjQUFjO1FBQ04scUJBQWUsR0FBbUIsSUFBSSxDQUFDO1FBRS9DLGVBQWU7UUFDUCwyQkFBcUIsR0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXO1FBR3RELGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsWUFBTSxHQUFhLElBQUks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QyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLGNBQU8sQ0FBQyxDQUFDLENBQUM7UUFDekQsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsaUJBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0QyxJQUFHLElBQUksQ0FBQyxhQUFhLEVBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEU7UUFDRCxzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1FBQzdCLElBQUcsSUFBSSxDQUFDLE1BQU0sRUFBQztZQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsYUFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsTUFBTTtRQUNOLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsSUFBRyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3BCLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsYUFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsY0FBYztRQUNkLElBQUcsSUFBSSxDQUFDLEtBQUssRUFBQztZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsSUFBRyxJQUFJLENBQUMsS0FBSyxFQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUM7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN0RjtRQUNELElBQUcsSUFBSSxDQUFDLEtBQUssRUFBQztZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsSUFBRyxJQUFJLENBQUMsS0FBSyxFQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUM7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN0RjtRQUVELElBQUcsSUFBSSxDQUFDLGNBQWMsRUFBQztZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUM3RTtRQUNELElBQUcsSUFBSSxDQUFDLFdBQVcsRUFBQztZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUN2RTtRQUVELEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUcsa0JBQVMsQ0FBQyxPQUFPLEVBQUM7WUFDakIsMkJBQTJCO1lBQzNCLDZCQUE2QjtZQUM3QixFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pCO2FBQUk7WUFDRCw0QkFBNEI7WUFDNUIsNEJBQTRCO1NBQy9CO1FBRUQsbURBQW1EO1FBQ25ELElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2pDLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqRCxtREFBbUQ7UUFDbkQsSUFBRyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFDO1lBQzNDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ25HO1FBRUQsZ0NBQWdDO1FBQ2hDLElBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUM7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQzlDO1FBRUQsVUFBVTtRQUNWLElBQUcsSUFBSSxDQUFDLGFBQWEsRUFBQztZQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDckM7UUFFRCxrQkFBa0I7UUFDbEIsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUM7WUFDckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNuRjtRQUVELFlBQVk7UUFDWixJQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7WUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM3RTtRQUNELElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsT0FBTyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7U0FDN0M7UUFFRCxZQUFZO1FBQ1osSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDN0U7UUFDRCxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztZQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO1NBQy9DO1FBRUQsV0FBVztRQUNYLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLFVBQVU7UUFDVixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixhQUFhO1FBQ2IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU5RCxtQkFBbUI7UUFDbkIsSUFBRyxrQkFBUyxDQUFDLHFCQUFxQixFQUFDO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsWUFBWTtZQUNaLGtCQUFTLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUNqQyxXQUFXO1lBQ1gsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUM7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ3ZDO2lCQUFJO2dCQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDaEM7WUFDRCxRQUFRO1lBQ1Isa0JBQVMsQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7U0FDM0M7UUFFRCxpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLGtCQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixrQkFBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBRUQsMkJBQUssR0FBTDtRQUNJLHlCQUF5QjtRQUN6QiwrQkFBK0I7UUFDL0IsaUNBQWlDO1FBQ2pDLDZDQUE2QztRQUM3Qyw2QkFBNkI7UUFDN0IsU0FBUztRQUNULGdDQUFnQztRQUNoQyxnQ0FBZ0M7UUFDaEMsSUFBSTtJQUNSLENBQUM7SUFDRDs7T0FFRztJQUNIOztPQUVHO0lBQ0gsb0NBQWMsR0FBZDtRQUNJLGtCQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsU0FBUztRQUNULGtCQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEIsV0FBVztRQUNYLGtCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM3QixTQUFTO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxrQ0FBWSxHQUFaO1FBQ0ksa0JBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7O09BRUc7SUFDSCwrQ0FBeUIsR0FBekI7UUFDSSxVQUFVO1FBQ1Ysa0JBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ25DLFNBQVM7UUFDVCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixXQUFXO1FBQ1gsSUFBTSxhQUFhLEdBQUcsa0JBQVMsQ0FBQyxjQUFjLElBQUksa0JBQVMsQ0FBQyxVQUFVLENBQUM7UUFFdkUsSUFBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUM7WUFDdEIsSUFBRyxhQUFhLEVBQUM7Z0JBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7YUFDMUM7aUJBQUk7Z0JBQ0Qsa0JBQWtCO2dCQUNsQixJQUFNLFVBQVUsR0FBRyxrQkFBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsK0NBQVUsVUFBWSxDQUFDO2dCQUV2RCxtQkFBbUI7Z0JBQ25CLElBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUM7b0JBQ2xDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDN0M7YUFDSjtTQUNKO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsd0NBQWtCLEdBQWxCO1FBQ0ksa0JBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTdCLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLGtCQUFTLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQy9EO2FBQU07WUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCx1Q0FBaUIsR0FBakI7UUFDSSxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUQsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO1lBQ2YsSUFBRyxNQUFNLEVBQUM7Z0JBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQzthQUMxQztpQkFBTTtnQkFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDbEM7U0FDSjthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0NBQVUsR0FBVjtRQUNJLG1CQUFtQjtRQUNuQixrQkFBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDL0IsWUFBWTtRQUNaLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLGlCQUFpQjtRQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRDs7T0FFRztJQUNILHNDQUFnQixHQUFoQjtRQUNJLElBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFDO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsd0NBQWtCLEdBQWxCO1FBQ0ksSUFBRyxJQUFJLENBQUMsWUFBWSxFQUFDO1lBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFNLGtCQUFTLENBQUMsY0FBYyxTQUFJLGtCQUFTLENBQUMsVUFBWSxDQUFDO1NBQ3BGO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0RBQTRCLEdBQTVCO1FBQ0ksSUFBRyxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBQztZQUNyRCwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN6RSxXQUFXO1lBQ1gsSUFBSSxDQUFDLDRCQUE0QixHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDM0U7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBYSxHQUFiO1FBQ0ksSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsS0FBRyxrQkFBUyxDQUFDLFdBQWEsQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFlLEdBQWY7UUFDSSxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7WUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFHLGtCQUFTLENBQUMsV0FBYSxDQUFDO1lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGtCQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCx1Q0FBaUIsR0FBakI7UUFDSSxJQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBQztZQUNqQixPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFHLHFCQUFXLENBQUMsU0FBUyxFQUFJLENBQUM7SUFDM0QsQ0FBQztJQUVELCtCQUFTLEdBQVQ7UUFDSSxRQUFRO1FBQ1IsNEJBQTRCO1FBQzVCLElBQUcscUJBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBQztZQUM1QixNQUFNO1lBQ04sWUFBWTtZQUNaLGtCQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUVoQyxlQUFlO1lBQ2YsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN6QixxQkFBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDcEMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsaUJBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0QzthQUFJO1lBQ0Qsd0JBQXdCO1lBQ3hCLHFCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDVjtJQUNMLENBQUM7SUFFRCxnQ0FBVSxHQUFWO1FBQ0ksTUFBTTtRQUNOLElBQUcscUJBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBQztZQUM1QixZQUFZO1lBQ1osa0JBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLHFCQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNwQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEM7YUFBSTtZQUNELHdCQUF3QjtZQUN4QixxQkFBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNqQyxPQUFPO1NBQ1Y7SUFDTCxDQUFDO0lBRU8sc0NBQWdCLEdBQXhCO1FBQUEsaUJBUUM7UUFQRyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPO1FBQ3hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUM3QixLQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUMzQixLQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxtQ0FBYSxHQUFyQjtRQUFBLGlCQWFDO1FBWkcsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUM3QixLQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUMzQixLQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM3QixFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx1Q0FBaUIsR0FBekI7UUFDSSxJQUFJLElBQUksQ0FBQyxvQkFBb0I7WUFBRSxPQUFPO1FBQ3RDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDakMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsY0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsOEJBQVEsR0FBUjtRQUNJLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNoQzthQUFJO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM5QjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILDhCQUFRLEdBQVI7UUFDSSxJQUFHLElBQUksQ0FBQyxhQUFhLEVBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsNkJBQU8sR0FBUDtRQUNJLElBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUM7WUFDckMsT0FBTztTQUNWO1FBRUQsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFELElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUksa0JBQVMsQ0FBQyxZQUFZLFNBQUksTUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBUyxDQUFDLFlBQVksQ0FBQztRQUU1RixNQUFjLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUMxQixHQUFHLEVBQUMsWUFBWTtZQUNoQixPQUFPLEVBQUMsVUFBUyxHQUFHO2dCQUNoQixrQkFBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ25DLENBQUM7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDO0lBQ0Q7O09BRUc7SUFDSCw2QkFBTyxHQUFQO0lBQ0EsQ0FBQztJQUVEOztPQUVHO0lBQ0gsOEJBQVEsR0FBUjtRQUNJLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNoQzthQUFJO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFDRDs7T0FFRztJQUNILGtDQUFZLEdBQVo7UUFDSSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0MsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM5QyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXJELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUV4QyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCw4QkFBUSxHQUFSO0lBRUEsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0NBQWMsR0FBZDtRQUFBLGlCQXFDQztRQXBDRyxzQkFBc0I7UUFDdEIsa0JBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBRTlCLFNBQVM7UUFDVCxJQUFHLElBQUksQ0FBQyxVQUFVLEVBQUM7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLHFCQUFxQixFQUFFLEVBQTVCLENBQTRCLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUNkLDJKQUEySjtTQUM5SixDQUFDO1FBRUYsZUFBZTtRQUNmLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUUxQixTQUFTO1FBQ1QsSUFBRyxJQUFJLENBQUMsT0FBTyxFQUFDO1lBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1NBQzVCO1FBRUQsV0FBVztRQUNYLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixTQUFTO1FBQ1QsSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzdCLFlBQVk7WUFDWixJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQztnQkFDOUIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixLQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsS0FBSSxDQUFDLFNBQVMsRUFBQyxLQUFJLENBQUMsQ0FBQztZQUN0RSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7U0FDOUI7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSywyQ0FBcUIsR0FBN0I7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPO1FBRTdCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVPLHFDQUFlLEdBQXZCLFVBQXdCLElBQWE7UUFDakMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUVsQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2hELElBQUksVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTztRQUU1RCxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxXQUFXLENBQ1osQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUM5QyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQ2xELENBQUM7UUFFRixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLE1BQU07WUFBRSxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUV4RCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzVCLE1BQU0sQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUM7WUFDdkMsTUFBTSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUNyQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLGtDQUFZLEdBQXBCO1FBQUEsaUJBeUNDO1FBeENHLElBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUM7WUFDOUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUzRCxJQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFDO2dCQUMxQyxjQUFjO2dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUV4QixZQUFZO2dCQUNaLElBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQztvQkFDdkIsS0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtnQkFFL0MsaUJBQWlCO2dCQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztpQkFBTTtnQkFDSCwwQkFBMEI7Z0JBQzFCLElBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztvQkFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO2lCQUNsQztnQkFFRCxpQkFBaUI7Z0JBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7Z0JBRTFCLFFBQVE7Z0JBQ1IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBRXhCLFVBQVU7Z0JBQ1YsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUM7b0JBQzlDLElBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQzt3QkFDdkIsS0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN4QixDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtvQkFFOUMsaUJBQWlCO29CQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDakM7cUJBQU07b0JBQ0gsOEJBQThCO2lCQUNqQzthQUNKO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCwrQkFBUyxHQUFUO1FBQ0ksb0JBQW9CO1FBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztZQUMzQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixjQUFjO1FBQ2QsSUFBRyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3BCLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDL0I7UUFFRCxTQUFTO1FBQ1QsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO1lBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO1FBRUQsY0FBYztRQUNkLElBQUcsSUFBSSxDQUFDLFFBQVEsRUFBQztZQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsYUFBYTtRQUNiLGtCQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUM3QixnQkFBZ0I7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0csd0NBQWtCLEdBQXhCOzs7Ozs7d0JBRVUsUUFBUSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDN0QsSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQzlCLHNCQUFPO3lCQUNWOzs7O3dCQUcrQixxQkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUE5RCxtQkFBbUIsR0FBRyxTQUF3Qzt3QkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFFaEQsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFOzRCQUM3RCxZQUFZOzRCQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQ0FDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dDQUM3QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7b0NBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztpQ0FDcEQ7cUNBQU07b0NBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lDQUNwQzs2QkFDSjtpQ0FBTTtnQ0FDSCxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NkJBQ25DOzRCQUNELHNCQUFPO3lCQUNWO3dCQUNELGVBQWU7d0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFFMUIsOEJBQThCO3dCQUM5QixJQUFJLG1CQUFtQixDQUFDLElBQUksS0FBSyxTQUFTLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTs0QkFFdkUsY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs0QkFDaEYsSUFBSSxjQUFjLEtBQUssR0FBRyxFQUFFLEVBQUUsZ0JBQWdCO2dDQUMxQyx1QkFBdUI7Z0NBQ3ZCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFjLENBQUMsQ0FBQzs2QkFDbEU7eUJBQ0o7Ozs7d0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsT0FBSyxDQUFDLENBQUM7Ozs7OztLQUkzQztJQUVEOztPQUVHO0lBQ0csaUNBQVcsR0FBakIsVUFBa0IsS0FBYSxFQUFFLFFBQWdCO3VDQUFHLE9BQU87OztnQkFDakQsR0FBRyxHQUFHLDRDQUE0QyxDQUFDO2dCQUN6RCxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO3dCQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzVCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFFekQsR0FBRyxDQUFDLE1BQU0sR0FBRzs0QkFDVCxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dDQUN2QyxJQUFJO29DQUNBLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29DQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUNBQ2pCO2dDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUNSLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQ0FBYSxDQUFDLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztpQ0FDL0M7NkJBQ0o7aUNBQU07Z0NBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUFXLEdBQUcsQ0FBQyxNQUFRLENBQUMsQ0FBQyxDQUFDOzZCQUM5Qzt3QkFDTCxDQUFDLENBQUM7d0JBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQTNCLENBQTJCLENBQUM7d0JBQ2hELEdBQUcsQ0FBQyxTQUFTLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUEzQixDQUEyQixDQUFDO3dCQUVsRCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBRUQ7O09BRUc7SUFDSCxtQ0FBYSxHQUFiO1FBQ0ksWUFBWTtRQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDakM7UUFFRCx5QkFBeUI7UUFDekIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUUvQyxTQUFTO1FBQ1QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELDhCQUFRLEdBQVI7UUFDSSxVQUFVO1FBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQy9CLGNBQWM7UUFDZCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELG1DQUFhLEdBQWI7UUFDSSxPQUFPO1FBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxpQ0FBVyxHQUFYO1FBQ0ksT0FBTztRQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQWtCLEdBQWxCLFVBQW1CLFFBQWdCO1FBQy9CLGNBQWM7UUFDZCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxJQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBQztZQUMxQixTQUFTO1lBQ1QsSUFBRyxJQUFJLENBQUMsTUFBTSxFQUFDO2dCQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLHlDQUFTLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLDRDQUFTLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLDZCQUFNLENBQUM7YUFDcEg7WUFDRCxTQUFTO1lBQ1QsSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFDO2dCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNoQztTQUNKO0lBQ0wsQ0FBQztJQUVLLDhCQUFRLEdBQWQ7Ozs7Ozs2QkFFTyxJQUFJLENBQUMscUJBQXFCLEVBQTFCLHdCQUEwQjs7Ozt3QkFHZixRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUM5QyxxQkFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsRUFBQTs7d0JBQXpGLE1BQU0sR0FBRyxTQUFnRjt3QkFDL0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzdCLElBQUcsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBQzs0QkFDbEIsaUJBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQzs0QkFDckMsc0JBQU87eUJBQ1Y7d0JBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDbkIsY0FBYzs0QkFDZCxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ3ZELFNBQVM7NEJBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOzRCQUV2QixXQUFXOzRCQUNYLHFCQUFXLENBQUMsSUFBSSxDQUFDLCtDQUFVLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLDZCQUFNLENBQUMsQ0FBQzs0QkFFdEUsY0FBYzs0QkFDZCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO3lCQUNyQzs7Ozt3QkFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFLLENBQUMsQ0FBQzs7O3dCQWdCekMsT0FBTzt3QkFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Ozs7O0tBQ2pDO0lBR0Q7O09BRUc7SUFDRyxvQ0FBYyxHQUFwQixVQUFxQixLQUFhLEVBQUUsUUFBZ0IsRUFBRSxPQUFlO3VDQUFHLE9BQU87OztnQkFDckUsR0FBRyxHQUFHLCtDQUErQyxDQUFDO2dCQUM1RCxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO3dCQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzVCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFFekQsR0FBRyxDQUFDLE1BQU0sR0FBRzs0QkFDVCxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dDQUN2QyxJQUFJO29DQUNBLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29DQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUNBQ2pCO2dDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUNSLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQ0FBYSxDQUFDLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztpQ0FDL0M7NkJBQ0o7aUNBQU07Z0NBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUFXLEdBQUcsQ0FBQyxNQUFRLENBQUMsQ0FBQyxDQUFDOzZCQUM5Qzt3QkFDTCxDQUFDLENBQUM7d0JBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQTNCLENBQTJCLENBQUM7d0JBQ2hELEdBQUcsQ0FBQyxTQUFTLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUEzQixDQUEyQixDQUFDO3dCQUVsRCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBSUQ7OztPQUdHO0lBQ0YsMkNBQXFCLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ3BDLElBQUk7WUFDQSw2QkFBNkI7WUFDN0IsSUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QyxXQUFXO1lBQ1gsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFcEMsSUFBTSxLQUFLLEdBQVcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLElBQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzdDLGVBQWU7WUFDZixJQUFNLFVBQVUsR0FBVyxFQUFFLENBQUM7WUFDOUIsSUFBTSxZQUFZLEdBQVcsRUFBRSxDQUFDO1lBRWhDLGdCQUFnQjtZQUNoQixJQUFNLE9BQU8sR0FBVyxFQUFFLENBQUM7WUFDM0IsSUFBTSxTQUFTLEdBQVcsRUFBRSxDQUFDO1lBRTdCLHFCQUFxQjtZQUNyQixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsRUFBRTtnQkFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPO2FBQ1Y7WUFFRCxpQkFBaUI7WUFDakIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDbkMsT0FBTzthQUNWO1lBRUQsYUFBYTtZQUNiLElBQUksS0FBSyxHQUFHLFVBQVUsSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLElBQUksT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFO2dCQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2pDLDhCQUE4QjtnQkFDOUIsaUJBQWMsQ0FBQyxJQUFJLENBQUMsdUhBQXVILENBQUMsQ0FBQztnQkFDN0ksU0FBUztnQkFDVCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDaEM7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbkM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBYSxHQUFiO1FBQ0ksSUFBRyxJQUFJLENBQUMsYUFBYSxFQUFDO1lBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFlLEdBQWY7UUFDSSxrQkFBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLGtCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFMUIsV0FBVztRQUNYLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsT0FBTyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7U0FDN0M7UUFFRCxTQUFTO1FBQ1QsSUFBRyxrQkFBUyxDQUFDLE9BQU8sRUFBQztZQUNqQixFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMzQzthQUFJO1lBQ0QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFlLEdBQWY7UUFDSSxrQkFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO1FBQzNDLGtCQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFNUIsV0FBVztRQUNYLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsU0FBUyxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7U0FDL0M7SUFDTCxDQUFDO0lBRUQsNEJBQU0sR0FBTjtRQUFBLGlCQWFDO1FBWkcscUJBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QixJQUFHLElBQUksQ0FBQyxhQUFhLEVBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ2QsSUFBTSxpQkFBaUIsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBUSxDQUFDO2dCQUN0RixJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLFdBQVcsRUFBRTtvQkFDcEQsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ25DO1lBQ0wsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1Q7YUFBSTtZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBRUQsNEJBQU0sR0FBTjtRQUNHLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQztZQUNYLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFRLENBQUM7WUFDMUUsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDdkMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUM5QjtTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVELDhCQUFRLEdBQVI7UUFDRyxJQUFHLElBQUksQ0FBQyxTQUFTLEVBQUM7WUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDaEM7YUFBSTtZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBRUQsK0JBQVMsR0FBVDtRQUNHLElBQUcsSUFBSSxDQUFDLFVBQVUsRUFBQztZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNqQzthQUFJO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFyb0NEO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7aURBQ007SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUV6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO21EQUNRO0lBRTNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7K0NBQ0k7SUFnQ3RCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7a0RBQ087SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzsrQ0FDSTtJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztnREFDSztJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7K0NBQ0k7SUFHeEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDUTtJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzZDQUNFO0lBR3BCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0c7SUFHckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQzs0Q0FDQztJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3FEQUNVO0lBRzdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7MERBQ2U7SUFHbEM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztnREFDSztJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO29EQUNVO0lBRzdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7a0RBQ087SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztzREFDVztJQUcvQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3lEQUNlO0lBR2pDO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7bURBQ1E7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUl4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNRO0lBRzFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0RBQ0s7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNPO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ087SUFFekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3NEQUNXO0lBRTdCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7eURBQ2M7SUFFaEM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUV4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBRXZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ007SUFFeEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUV4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBRXZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ007SUFFeEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUV6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOytDQUNJO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7d0RBQ2E7SUFFL0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNHO0lBRXJCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0c7SUFFckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNHO0lBRXJCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0c7SUFFckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztpREFDTTtJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3VEQUNZO0lBRTlCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7b0RBQ1M7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNRO0lBRTFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7c0RBQ1c7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0RBQ0s7SUFFdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBRXhCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ1E7SUFyTFQsV0FBVztRQUQvQixPQUFPO09BQ2EsV0FBVyxDQXdvQy9CO0lBQUQsa0JBQUM7Q0F4b0NELEFBd29DQyxDQXhvQ3dDLEVBQUUsQ0FBQyxTQUFTLEdBd29DcEQ7a0JBeG9Db0IsV0FBVyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtR2FtZURhdGEgZnJvbSBcIi4uL0xvYWQvR2FtZURhdGFcIjtcclxuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gXCIuLi9Mb2FkL1RpcHNNYW5hZ2VyXCI7XHJcbmltcG9ydCBUaXBzV25kTWFuYWdlciBmcm9tIFwiLi4vTG9hZC9UaXBzV25kXCI7XHJcbmltcG9ydCB7IEFQUF9JRCB9IGZyb20gXCIuLi9Db21tb24vQXBwQ29uZmlnXCI7XHJcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gXCIuL1VzZXJEYXRhU3luY01hbmFnZXJcIjtcbmltcG9ydCBTdGF0ZUJyaWRnZSBmcm9tIFwiLi4vZ2FtZTIvU3RhdGVCcmlkZ2VcIjtcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4uL2dhbWUyL0NvbnN0YW50c1wiO1xuXHJcbmNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYWRNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXHJcbiAgICBCdG5TdGFydDpjYy5CdXR0b24gPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIE5PMThQYW5lbDpjYy5Ob2RlID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIHRpcHNfbGFiZWw6Y2MuTGFiZWwgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBidG5fcWQ6Y2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgLy8g5piv5ZCm5bey57uP5pi+56S66L+H5LqM5Y2B54K55Zub5Y2B5LqU5YiG55qE5by556qXXHJcbiAgICBwcml2YXRlIGhhc1Nob3duVGltZVBvcHVwOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBcclxuICAgIC8vIOacrOWcsOWtmOWCqGtleVxyXG4gICAgLy8g5bm06b6E54q25oCB5a2Y5YKoa2V577yMMT3miJDlubTkurrvvIzlhbbku5Y95pyq5oiQ5bm05Lq6XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IFNUT1JBR0VfS0VZX0FHRV9TVEFUVVMgPSAnU0xTX0FHRV9TVEFUVVMnO1xyXG4gICAgXHJcbiAgICAvLyDot5/ouKrnlKjmiLfmiYvliqjpmpDol49yZWNvdmVyVGltZXJMYWJlbOeahOeKtuaAgVxyXG4gICAgLy8g5Yid5aeL6K6+572u5Li6dHJ1Ze+8jOehruS/nXJlY292ZXJUaW1lckxhYmVs6buY6K6k5piv6ZqQ6JeP55qEXHJcbiAgICBwcml2YXRlIGlzUmVjb3ZlclRpbWVyTWFudWFsbHlIaWRkZW46IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIC8vIOWJp+aDheaWh+acrOaVsOe7hFxyXG4gICAgcHJpdmF0ZSBzdG9yeUxpbmVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgLy8g5b2T5YmN5pi+56S655qE6KGM57Si5byVXHJcbiAgICBwcml2YXRlIGN1cnJlbnRMaW5lSW5kZXg6IG51bWJlciA9IDA7XHJcbiAgICAvLyDmlofmnKzmmL7npLrpl7TpmpTml7bpl7TvvIjnp5LvvIlcclxuICAgIHByaXZhdGUgbGluZUludGVydmFsOiBudW1iZXIgPSAwLjU7XHJcbiAgICAvLyDlrZfnrKbmmL7npLrpl7TpmpTml7bpl7TvvIjnp5LvvIlcclxuICAgIHByaXZhdGUgY2hhckludGVydmFsOiBudW1iZXIgPSAwLjA1O1xyXG4gICAgLy8g5b2T5YmN6KGM55qE5a2X56ym57Si5byVXHJcbiAgICBwcml2YXRlIGN1cnJlbnRDaGFySW5kZXg6IG51bWJlciA9IDA7XHJcbiAgICAvLyDmlofmnKzmmL7npLrlrprml7blmahJROaVsOe7hFxyXG4gICAgcHJpdmF0ZSB0ZXh0VGltZXJzOiBOb2RlSlMuVGltZW91dFtdID0gW107XHJcbiAgICAvLyDot7Pov4fmjInpkq7lkK/nlKjlrprml7blmahJRFxyXG4gICAgcHJpdmF0ZSBqdW1wQnV0dG9uVGltZXI6IE5vZGVKUy5UaW1lb3V0ID0gbnVsbDtcclxuICAgIFxyXG4gICAgLy8g6Ziy5rKJ6L+35qOA5p+l6Ze06ZqU5pe26Ze077yI56eS77yJXHJcbiAgICBwcml2YXRlIGFudGlBZGRpY3Rpb25JbnRlcnZhbDogbnVtYmVyID0gNTsgLy8g6buY6K6kNeenkuajgOafpeS4gOasoVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXHJcbiAgICBCdG5TdGFydDI6Y2MuQnV0dG9uID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxyXG4gICAgQnRuQkdNOmNjLkJ1dHRvbiA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5TaG9wOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgc2hvcFBhbmVsOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuUmFuazpjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bkNsb3NlOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXHJcbiAgICB3ZWl4aW46Y2MuU3ByaXRlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHdlaXhpbk5vZGU6Y2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBTcE9uOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgU3BPZmY6Y2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkF1ZGlvQ2xpcClcclxuICAgIEJnbTpjYy5BdWRpb0NsaXAgPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXHJcbiAgICBzdGFtaW5hTGFiZWw6Y2MuTGFiZWwgPSBudWxsOyAvL+S9k+WKm+aYvuekuuagh+etvlxyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXHJcbiAgICByZWNvdmVyVGltZXJMYWJlbDpjYy5MYWJlbCA9IG51bGw7IC8v5oGi5aSN5YCS6K6h5pe25pi+56S65qCH562+XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgZ29sZF9sYjpjYy5MYWJlbCA9IG51bGw7IC8v5b2T5YmN6ZK755+z5pi+56S65qCH562+XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgc2hlbnBvTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgY3VyX2xldmVsOmNjLkxhYmVsID0gbnVsbDsgLy/lvZPliY3lhbPljaHmmL7npLrmoIfnrb5cclxuXHJcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxyXG4gICAgQnRuUmVzZXRMZXZlbDpjYy5CdXR0b24gPSBudWxsOyAvL+mHjee9ruWFs+WNoeaMiemSrlxyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGxldmVsU2VsZWN0UGFuZWw6IGNjLk5vZGUgPSBudWxsOyAvL+WFs+WNoemAieaLqeeVjOmdouiKgueCuVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIHVzZXJfbGFiZWw6Y2MuTGFiZWwgPSBudWxsOyAvL+W9k+WJjeeUqOaIt+WQjVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuUmVzZXQ6Y2MuTm9kZSA9IG51bGw7IC8v6YeN572u5oyJ6ZKuXHJcblxyXG4gICAgLy8g5Ymn5oOF5by556qX6IqC54K5XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIFN0b3J5X25vZGU6Y2MuTm9kZSA9IG51bGw7XHJcbiAgICAvLyDliafmg4XmlofmnKzoioLngrlcclxuICAgIEBwcm9wZXJ0eShjYy5SaWNoVGV4dClcclxuICAgIHJfc3Rvcnk6Y2MuUmljaFRleHQgPSBudWxsO1xyXG4gICAgLy8g6Lez6L+H5oyJ6ZKu6IqC54K5XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGJ0bl9qdW1wOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgcmFua1BhbmVsOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuQ2hhcmdlOmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBDaGFyZ2VQYW5lbDpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLznlYzpnaJcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzZXR0aW5nc1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+iuvue9rumdouadv1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5DbG9zZVNldHRpbmdzOmNjLk5vZGUgPSBudWxsOyAvL+WFs+mXreiuvue9rumdouadv+aMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBtdXNpY0J0bjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PkuZDlvIDlhbPmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgbXVzaWNPbjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PkuZDlvIDlkK/nsr7ngbVcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgbXVzaWNPZmY6Y2MuTm9kZSA9IG51bGw7IC8v6Z+z5LmQ5YWz6Zet57K+54G1XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHNvdW5kQnRuOmNjLk5vZGUgPSBudWxsOyAvL+mfs+aViOW8gOWFs+aMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzb3VuZE9uOmNjLk5vZGUgPSBudWxsOyAvL+mfs+aViOW8gOWQr+eyvueBtVxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzb3VuZE9mZjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PmlYjlhbPpl63nsr7ngbVcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgVGlwc1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+W8ueeql1xyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgTF90aXBzOmNjLkxhYmVsID0gbnVsbDsgLy8g5by556qX5paH5pysXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fY2xvc2VDaGFyZ2U6Y2MuTm9kZSA9IG51bGw7ICBcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuXzE6Y2MuTm9kZSA9IG51bGw7IC8v5YWF5YC85oyJ6ZKuMVxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fMjpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLzmjInpkq4yXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bl8zOmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrjNcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuXzQ6Y2MuTm9kZSA9IG51bGw7IC8v5YWF5YC85oyJ6ZKuNFxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fNTpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLzmjInpkq41XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bl82OmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrjZcclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIGdlbV90aXBzOmNjLkxhYmVsID0gbnVsbDsgLy8g5by556qX5paH5pysXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBUaXBzUGFuZWxDbG9zZTpjYy5Ob2RlID0gbnVsbDsgLy/lvLnnqpflhbPpl63mjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgVGlwc1BhbmVsT2s6Y2MuTm9kZSA9IG51bGw7IC8v5by556qX56Gu5a6a5oyJ6ZKuXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5RSDpjYy5Ob2RlID0gbnVsbDsgLy/lvLrljJbmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgU2tpbGxQYW5lbDpjYy5Ob2RlID0gbnVsbDsgLy/lvLrljJblvLnnqpdcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgUWlhbmdodWFQYW5lbDpjYy5Ob2RlID0gbnVsbDsgLy/mlrDlvLrljJblvLnnqpdcclxuICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bkNKOmNjLk5vZGUgPSBudWxsOyAvL+aIkOWwseaMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBDSlBhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+aIkOWwseW8ueeql1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuV2VlazpjYy5Ob2RlID0gbnVsbDsgLy/lkajlpZblirHmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgV2Vla1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+WRqOWlluWKseW8ueeql1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuRGFpbHk6Y2MuTm9kZSA9IG51bGw7IC8v5pel5aWW5Yqx5oyJ6ZKuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIERhaWx5UGFuZWw6Y2MuTm9kZSA9IG51bGw7IC8v5pel5aWW5Yqx5by556qXXHJcbiAgICAvLyDlvZPliY3pgInmi6nnmoTlhYXlgLzpgInpoblcclxuICAgIHByaXZhdGUgY3VycmVudFJlY2hhcmdlT3B0aW9uOiB7cHJpY2U6IG51bWJlciwgZGlhbW9uZHM6IG51bWJlcn0gPSBudWxsO1xyXG4gICAgLy8g5YWF5YC86YWN572uXHJcbiAgICBwcml2YXRlIHJlY2hhcmdlQ29uZmlnID0ge1xyXG4gICAgICAgIDE6IHtwcmljZTogNiwgZGlhbW9uZHM6IDYwfSxcclxuICAgICAgICAyOiB7cHJpY2U6IDMwLCBkaWFtb25kczogMzAwfSxcclxuICAgICAgICAzOiB7cHJpY2U6IDY4LCBkaWFtb25kczogNjgwfSxcclxuICAgICAgICA0OiB7cHJpY2U6IDE5OCwgZGlhbW9uZHM6IDE5ODB9LFxyXG4gICAgICAgIDU6IHtwcmljZTogMzI4LCBkaWFtb25kczogMzI4MH0sXHJcbiAgICAgICAgNjoge3ByaWNlOiA2NDgsIGRpYW1vbmRzOiA2NDgwfVxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3h1YW5QcmVsb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3h1YW5QcmVsb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF94dWFuQXNzZXRzUHJlbG9hZGVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cclxuICAgIG9uTG9hZCAoKSB7XHJcbiAgICAgICAgLy8g6L+b6KGM6Ziy5rKJ6L+35qOA5p+lXHJcbiAgICAgICAgdGhpcy5jaGVja0FudGlBZGRpY3Rpb24oKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDorr7nva7lrprmnJ/pmLLmsonov7fmo4Dmn6Xlrprml7blmahcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuY2hlY2tBbnRpQWRkaWN0aW9uLCB0aGlzLmFudGlBZGRpY3Rpb25JbnRlcnZhbCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5HZXREYXRhKCk7XHJcbiAgICAgICAgdGhpcy5HZXRTdGFtaW5hRGF0YSgpOyAvLyDojrflj5bkvZPlipvmlbDmja5cclxuICAgICAgICB0aGlzLkdldExldmVsRGF0YSgpOyAvLyDojrflj5blhbPljaHmlbDmja5cclxuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jRm9yU3RhcnRTY2VuZSgpO1xyXG4gICAgICAgIHRoaXMuQnRuU3RhcnQubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TdGFydEdhbWUsdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5TdGFydDIubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TdGFydEdhbWUyLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQkdNLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuQ2hlY2tCR00sdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5SYW5rLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dSYW5rLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQ2xvc2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuSGlkZVJhbmssdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5TaG9wLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dTaG9wLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuUUgub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuU2hvd1FILHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQ0oub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuU2hvd0NKLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuV2Vlay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TaG93V2Vlayx0aGlzKTtcclxuICAgICAgICB0aGlzLkJ0bkRhaWx5Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dEYWlseSx0aGlzKTtcclxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignenpJbWcyJywgY2MuU3ByaXRlRnJhbWUsICgpID0+IHt9KTtcbiAgICAgICAgY2MuZGlyZWN0b3IucHJlbG9hZFNjZW5lKFNjZW5lLllvdXhpKTtcblxyXG4gICAgICAgIGlmKHRoaXMuQnRuUmVzZXRMZXZlbCl7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuUmVzZXRMZXZlbC5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlJlc2V0TGV2ZWwsdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuQnRuUmVzZXQpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0blJlc2V0Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlJlc2V0QWNjb3VudCx0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5Li66Ziy5rKJ6L+35o+Q56S66Z2i5p2/55qE56Gu5a6a5oyJ6ZKu5re75Yqg5LqL5Lu255uR5ZCsXHJcbiAgICAgICAgdGhpcy5OTzE4UGFuZWwuYWN0aXZlID0gZmFsc2VcclxuICAgICAgICBpZih0aGlzLmJ0bl9xZCl7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX3FkLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLm9uQ29uZmlybU5vMTgsdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+WFheWAvOebuOWFs1xyXG4gICAgICAgIGlmKHRoaXMuQnRuQ2hhcmdlKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5DaGFyZ2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuT25DaGFyZ2UsdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuQnRuX2Nsb3NlQ2hhcmdlKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5fY2xvc2VDaGFyZ2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuT25DbG9zZUNoYXJnZSx0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOS4uuWFheWAvOaMiemSrua3u+WKoOeCueWHu+S6i+S7tlxyXG4gICAgICAgIGlmKHRoaXMuQnRuXzEpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bl8xLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblJlY2hhcmdlQnRuQ2xpY2soMSksIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLkJ0bl8yKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5fMi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25SZWNoYXJnZUJ0bkNsaWNrKDIpLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5CdG5fMyl7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuXzMub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uUmVjaGFyZ2VCdG5DbGljaygzKSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuQnRuXzQpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bl80Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblJlY2hhcmdlQnRuQ2xpY2soNCksIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLkJ0bl81KXtcclxuICAgICAgICAgICAgdGhpcy5CdG5fNS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25SZWNoYXJnZUJ0bkNsaWNrKDUpLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5CdG5fNil7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuXzYub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uUmVjaGFyZ2VCdG5DbGljayg2KSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLlRpcHNQYW5lbENsb3NlKXtcclxuICAgICAgICAgICAgdGhpcy5UaXBzUGFuZWxDbG9zZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5PbkNsb3NlVGlwcyx0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5UaXBzUGFuZWxPayl7XHJcbiAgICAgICAgICAgIHRoaXMuVGlwc1BhbmVsT2sub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuT25Pa1RpcHMsdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYy5kaXJlY3Rvci5wcmVsb2FkU2NlbmUoU2NlbmUuWW91eGkpO1xuICAgICAgICB0aGlzLndlaXhpbk5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgaWYobUdhbWVEYXRhLmlzQkdNT24pe1xyXG4gICAgICAgICAgICAvLyB0aGlzLlNwT24uYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gdGhpcy5TcE9mZi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLkJnbSxmYWxzZSwxKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mfs+S5kOW8gOWni+aSreaUvicpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAvLyB0aGlzLlNwT24uYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuU3BPZmYuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5pe25Y+q6ZyA6KaB6LCD55So5LiA5qyhVXBkYXRlUmVjb3ZlclRpbWVyRGlzcGxhee+8jOWug+S8muWkhOeQhuaJgOacieWIneWni+WMluaYvuekulxyXG4gICAgICAgIHRoaXMuVXBkYXRlUmVjb3ZlclRpbWVyRGlzcGxheSgpO1xyXG4gICAgICAgIC8vIOiuvue9ruWNleS4quWumuaXtuWZqO+8jOavj+enkuabtOaWsOS4gOasoeWAkuiuoeaXtuWSjOajgOafpeS9k+WKm+aBouWkjVxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5VcGRhdGVSZWNvdmVyVGltZXJEaXNwbGF5LCAxKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDkuLpzdGFtaW5hTGFiZWzmt7vliqDngrnlh7vkuovku7bnm5HlkKzlmajvvIznlKjkuo7liIfmjaJyZWNvdmVyVGltZXJMYWJlbOeahOWPr+ingeaAp1xyXG4gICAgICAgIGlmKHRoaXMuc3RhbWluYUxhYmVsICYmIHRoaXMuc3RhbWluYUxhYmVsLm5vZGUpe1xyXG4gICAgICAgICAgICB0aGlzLnN0YW1pbmFMYWJlbC5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy50b2dnbGVSZWNvdmVyVGltZXJWaXNpYmlsaXR5LCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5piO56Gu6K6+572ucmVjb3ZlclRpbWVyTGFiZWznmoTliJ3lp4vnirbmgIHkuLrpmpDol49cclxuICAgICAgICBpZih0aGlzLnJlY292ZXJUaW1lckxhYmVsICYmIHRoaXMucmVjb3ZlclRpbWVyTGFiZWwubm9kZSl7XHJcbiAgICAgICAgICAgIHRoaXMucmVjb3ZlclRpbWVyTGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6K6+572u6Z2i5p2/XHJcbiAgICAgICAgaWYodGhpcy5zZXR0aW5nc1BhbmVsKXtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5nc1BhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDkuLrorr7nva7pnaLmnb/nm7jlhbPmjInpkq7mt7vliqDkuovku7bnm5HlkKxcclxuICAgICAgICBpZih0aGlzLkJ0bkNsb3NlU2V0dGluZ3Mpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bkNsb3NlU2V0dGluZ3Mub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLmNsb3NlU2V0dGluZ3MsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDliJ3lp4vljJbpn7PkuZDlvIDlhbPnirbmgIFcclxuICAgICAgICBpZih0aGlzLm11c2ljQnRuKXtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY0J0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25NdXNpY0J0bkNsaWNrLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5tdXNpY09uICYmIHRoaXMubXVzaWNPZmYpe1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljT24uYWN0aXZlID0gbUdhbWVEYXRhLmlzQkdNT247XHJcbiAgICAgICAgICAgIHRoaXMubXVzaWNPZmYuYWN0aXZlID0gIW1HYW1lRGF0YS5pc0JHTU9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDliJ3lp4vljJbpn7PmlYjlvIDlhbPnirbmgIFcclxuICAgICAgICBpZih0aGlzLnNvdW5kQnRuKXtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25Tb3VuZEJ0bkNsaWNrLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5zb3VuZE9uICYmIHRoaXMuc291bmRPZmYpe1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kT24uYWN0aXZlID0gbUdhbWVEYXRhLmlzU291bmRPbjtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE9mZi5hY3RpdmUgPSAhbUdhbWVEYXRhLmlzU291bmRPbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5pu05paw5b2T5YmN5YWz5Y2h5pi+56S6XHJcbiAgICAgICAgdGhpcy51cGRhdGVMZXZlbERpc3BsYXkoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmm7TmlrDnlKjmiLflkI3mmL7npLpcclxuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJEaXNwbGF5KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g55uR5ZCs6ZK755+z5pWw6YeP5pu05paw5LqL5Lu2XHJcbiAgICAgICAgY2MuZGlyZWN0b3Iub24oJ2dvbGRVcGRhdGVkJywgdGhpcy5VcGRhdGVHb2xkTGFiZWwsIHRoaXMpO1xyXG4gICAgICAgIGNjLmRpcmVjdG9yLm9uKCdzaGVucG9VcGRhdGVkJywgdGhpcy5VcGRhdGVTaGVucG9MYWJlbCwgdGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm6ZyA6KaB6Ieq5Yqo5omT5byA5YWz5Y2h6YCJ5oup55WM6Z2iXHJcbiAgICAgICAgaWYobUdhbWVEYXRhLnNob3VsZE9wZW5MZXZlbFNlbGVjdCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoh6rliqjmiZPlvIDlhbPljaHpgInmi6nnlYzpnaInKTtcclxuICAgICAgICAgICAgLy8g5piO56Gu6K6+572u5Li65YWz5Y2h5qih5byPXHJcbiAgICAgICAgICAgIG1HYW1lRGF0YS5pc0luZmluaXRlTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyDmmL7npLrlhbPljaHpgInmi6nnlYzpnaJcclxuICAgICAgICAgICAgaWYodGhpcy5sZXZlbFNlbGVjdFBhbmVsKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxTZWxlY3RQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WFs+WNoemAieaLqeeVjOmdouiKgueCueacquiuvue9ricpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOmHjee9ruagh+W/l+S9jVxyXG4gICAgICAgICAgICBtR2FtZURhdGEuc2hvdWxkT3BlbkxldmVsU2VsZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuaYr+mmluasoeeZu+W9le+8iOWJp+aDheW8ueeql+acquaYvuekuui/h++8ie+8jOWmguaenOaYr+WImeaYvuekuuWJp+aDheW8ueeql1xyXG4gICAgICAgIGlmICghbUdhbWVEYXRhLmlzU3RvcnlQb3B1cFNob3duKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mmluasoeeZu+W9le+8jOaYvuekuuWJp+aDheW8ueeqlycpO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRTdG9yeVBvcHVwKCk7XHJcbiAgICAgICAgICAgIG1HYW1lRGF0YS5zZXRTdG9yeVBvcHVwU2hvd24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKXtcclxuICAgICAgICAvLyBpZihtR2FtZURhdGEuaXNCR01Pbil7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuU3BPbi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICB0aGlzLlNwT2ZmLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIC8vICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KHRoaXMuQmdtLGZhbHNlLDEpO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygn6Z+z5LmQ5byA5aeL5pKt5pS+Jyk7XHJcbiAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuU3BPbi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAvLyAgICAgdGhpcy5TcE9mZi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5byA5aeL5ri45oiP77yM54K55Ye75LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5L2T5Yqb5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldFN0YW1pbmFEYXRhKCl7XHJcbiAgICAgICAgbUdhbWVEYXRhLkdldFN0YW1pbmFEYXRhKCk7XHJcbiAgICAgICAgLy8g6I635Y+W6ZK755+z5pWw5o2uXHJcbiAgICAgICAgbUdhbWVEYXRhLkdldEdvbGREYXRhKCk7XHJcbiAgICAgICAgLy8g6I635Y+W6YGT5YW35bqT5a2Y5pWw5o2uXHJcbiAgICAgICAgbUdhbWVEYXRhLkdldEl0ZW1TdG9ja0RhdGEoKTtcclxuICAgICAgICAvLyDmm7TmlrDpkrvnn7PmmL7npLpcclxuICAgICAgICB0aGlzLlVwZGF0ZUdvbGRMYWJlbCgpO1xyXG4gICAgICAgIHRoaXMuVXBkYXRlU2hlbnBvTGFiZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBHZXRMZXZlbERhdGEoKXtcclxuICAgICAgICBtR2FtZURhdGEuR2V0TGV2ZWxEYXRhKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5pu05paw5oGi5aSN5YCS6K6h5pe25pi+56S6XHJcbiAgICAgKi9cclxuICAgIFVwZGF0ZVJlY292ZXJUaW1lckRpc3BsYXkoKXtcclxuICAgICAgICAvLyDlhYjmo4Dmn6XkvZPlipvmgaLlpI1cclxuICAgICAgICBtR2FtZURhdGEuQ2hlY2tBbmRSZWNvdmVyU3RhbWluYSgpO1xyXG4gICAgICAgIC8vIOabtOaWsOS9k+WKm+aYvuekulxyXG4gICAgICAgIHRoaXMuVXBkYXRlU3RhbWluYUxhYmVsKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5qOA5p+l5L2T5Yqb5piv5ZCm5bey5ruhXHJcbiAgICAgICAgY29uc3QgaXNTdGFtaW5hRnVsbCA9IG1HYW1lRGF0YS5jdXJyZW50U3RhbWluYSA+PSBtR2FtZURhdGEubWF4U3RhbWluYTtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLnJlY292ZXJUaW1lckxhYmVsKXtcclxuICAgICAgICAgICAgaWYoaXNTdGFtaW5hRnVsbCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY292ZXJUaW1lckxhYmVsLnN0cmluZyA9IFwi5L2T5Yqb5bey5ruhXCI7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy8g5L2T5Yqb5pyq5ruh5pe277yM5pu05paw5YCS6K6h5pe25paH5pys5YaF5a65XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lU3RyaW5nID0gbUdhbWVEYXRhLkdldEZvcm1hdHRlZFJlY292ZXJUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY292ZXJUaW1lckxhYmVsLnN0cmluZyA9IGDkuIvmrKHkvZPlipvmgaLlpI3vvJoke3RpbWVTdHJpbmd9YDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g5qC55o2u55So5oi35omL5Yqo6ZqQ6JeP54q25oCB5Yaz5a6a5piv5ZCm5pi+56S6XHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5pc1JlY292ZXJUaW1lck1hbnVhbGx5SGlkZGVuKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDkuLvnlYzpnaLlvZPliY3lhbPljaHmmL7npLpcclxuICAgICAqL1xyXG4gICAgdXBkYXRlTGV2ZWxEaXNwbGF5KCl7XG4gICAgICAgIG1HYW1lRGF0YS5HZXRCZXN0U2NvcmVEYXRhKCk7XG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuY3VyX2xldmVsKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJfbGV2ZWwuc3RyaW5nID0gJ+acgOmrmOWIhu+8micgKyAobUdhbWVEYXRhLkJlc3RTY29yZSB8fCAwKTtcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Li755WM6Z2iY3VyX2xldmVs5qCH562+5pyq6LWL5YC8IScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDnlKjmiLflkI3mmL7npLpcclxuICAgICAqL1xyXG4gICAgdXBkYXRlVXNlckRpc3BsYXkoKXtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICAgICAgaWYodGhpcy51c2VyX2xhYmVsKXtcclxuICAgICAgICAgICAgaWYodXNlcklkKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlcl9sYWJlbC5zdHJpbmcgPSAn546p5a62JyArIHVzZXJJZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlcl9sYWJlbC5zdHJpbmcgPSAn5pyq55m75b2VJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+S4u+eVjOmdonVzZXJfbGFiZWzmoIfnrb7mnKrotYvlgLwhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOmHjee9ruWFs+WNoei/m+W6plxyXG4gICAgICovXHJcbiAgICBSZXNldExldmVsKCl7ICAgICAgICBcclxuICAgICAgICAvLyDosIPnlKhHYW1lRGF0YeS4reeahOmHjee9ruaWueazlVxyXG4gICAgICAgIG1HYW1lRGF0YS5yZXNldExldmVsUHJvZ3Jlc3MoKTtcclxuICAgICAgICAvLyDmm7TmlrDkuLvnlYzpnaLlhbPljaHmmL7npLpcclxuICAgICAgICB0aGlzLnVwZGF0ZUxldmVsRGlzcGxheSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWIt+aWsOWFs+WNoemAieaLqeeVjOmdou+8iOWmguaenOWtmOWcqO+8iVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCflhbPljaHov5vluqblt7Lph43nva7vvIzlvZPliY3lhbPljaE6JywgbUdhbWVEYXRhLmN1cnJlbnRMZXZlbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5YWz6Zet5YWz5Y2h6YCJ5oup55WM6Z2iXHJcbiAgICAgKi9cclxuICAgIGNsb3NlTGV2ZWxTZWxlY3QoKXtcclxuICAgICAgICBpZih0aGlzLmxldmVsU2VsZWN0UGFuZWwpe1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsU2VsZWN0UGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOS7heabtOaWsOS9k+WKm+agh+etvuaYvuekulxyXG4gICAgICovXHJcbiAgICBVcGRhdGVTdGFtaW5hTGFiZWwoKXtcclxuICAgICAgICBpZih0aGlzLnN0YW1pbmFMYWJlbCl7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhbWluYUxhYmVsLnN0cmluZyA9IGAke21HYW1lRGF0YS5jdXJyZW50U3RhbWluYX0vJHttR2FtZURhdGEubWF4U3RhbWluYX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDliIfmjaJyZWNvdmVyVGltZXJMYWJlbOeahOWPr+ingeaAp1xyXG4gICAgICovXHJcbiAgICB0b2dnbGVSZWNvdmVyVGltZXJWaXNpYmlsaXR5KCl7XHJcbiAgICAgICAgaWYodGhpcy5yZWNvdmVyVGltZXJMYWJlbCAmJiB0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUpe1xyXG4gICAgICAgICAgICAvLyDliIfmjaJyZWNvdmVyVGltZXJMYWJlbOeahOWPr+ingeaAp1xyXG4gICAgICAgICAgICB0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUuYWN0aXZlID0gIXRoaXMucmVjb3ZlclRpbWVyTGFiZWwubm9kZS5hY3RpdmU7XHJcbiAgICAgICAgICAgIC8vIOabtOaWsOaJi+WKqOmakOiXj+eKtuaAgVxyXG4gICAgICAgICAgICB0aGlzLmlzUmVjb3ZlclRpbWVyTWFudWFsbHlIaWRkZW4gPSAhdGhpcy5yZWNvdmVyVGltZXJMYWJlbC5ub2RlLmFjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5pu05paw5YWF5YC855WM6Z2i6ZK755+z5pi+56S6XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUdlbVRpcHMoKXtcclxuICAgICAgICBpZih0aGlzLmdlbV90aXBzKXtcclxuICAgICAgICAgICAgdGhpcy5nZW1fdGlwcy5zdHJpbmcgPSBgJHttR2FtZURhdGEuY3VycmVudEdvbGR9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5pu05paw6ZK755+z5qCH562+5pi+56S6XHJcbiAgICAgKi9cclxuICAgIFVwZGF0ZUdvbGRMYWJlbCgpe1xyXG4gICAgICAgIGlmKHRoaXMuZ29sZF9sYil7XHJcbiAgICAgICAgICAgIHRoaXMuZ29sZF9sYi5zdHJpbmcgPSBgJHttR2FtZURhdGEuY3VycmVudEdvbGR9YDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnRHb2xkOicsIG1HYW1lRGF0YS5jdXJyZW50R29sZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWQjOaXtuabtOaWsOWFheWAvOeVjOmdoueahOmSu+efs+aYvuekulxyXG4gICAgICAgIHRoaXMudXBkYXRlR2VtVGlwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIFVwZGF0ZVNoZW5wb0xhYmVsKCl7XHJcbiAgICAgICAgaWYoIXRoaXMuc2hlbnBvTGFiZWwpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hlbnBvTGFiZWwuc3RyaW5nID0gYCR7U3RhdGVCcmlkZ2UuZ2V0U2hlbnBvKCl9YDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgU3RhcnRHYW1lKCl7XHJcbiAgICAgICAgLy8gIOaXoOmZkOaooeW8j1xyXG4gICAgICAgIC8vIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcclxuICAgICAgICBpZihTdGF0ZUJyaWRnZS5jb25zdW1lU3RhbWluYSgpKXtcbiAgICAgICAgICAgIC8v5raI6ICX5L2T5YqbXHJcbiAgICAgICAgICAgIC8vIOaYjuehruiuvue9ruS4uuaXoOmZkOaooeW8j1xyXG4gICAgICAgICAgICBtR2FtZURhdGEuaXNJbmZpbml0ZU1vZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5peg6ZmQ5qih5byP55u05o6l5Yqg6L295ri45oiP5Zy65pmvXHJcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcclxuICAgICAgICAgICAgU3RhdGVCcmlkZ2UucHJlcGFyZUxldmVsU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShTY2VuZS5Zb3V4aSk7XG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAvL+S9k+WKm+S4jei2s++8jOS9v+eUqFRpcHNNYW5hZ2Vy5pi+56S65o+Q56S6XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+S9k+WKm+S4jei2s++8jOaXoOazleW8gOWni+a4uOaIj+OAgicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFN0YXJ0R2FtZTIoKXtcclxuICAgICAgICAvL+WFs+WNoeaooeW8j1xyXG4gICAgICAgIGlmKFN0YXRlQnJpZGdlLmNvbnN1bWVTdGFtaW5hKCkpe1xuICAgICAgICAgICAgLy8g5piO56Gu6K6+572u5Li65YWz5Y2h5qih5byPXHJcbiAgICAgICAgICAgIG1HYW1lRGF0YS5pc0luZmluaXRlTW9kZSA9IHRydWU7XG4gICAgICAgICAgICBTdGF0ZUJyaWRnZS5wcmVwYXJlTGV2ZWxTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xyXG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoU2NlbmUuWW91eGkpO1xuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgLy/kvZPlipvkuI3otrPvvIzkvb/nlKhUaXBzTWFuYWdlcuaYvuekuuaPkOekulxyXG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfkvZPlipvkuI3otrPvvIzml6Dms5XlvIDlp4vmuLjmiI/jgIInKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByZWxvYWRYdWFuU2NlbmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3h1YW5QcmVsb2FkZWQgfHwgdGhpcy5feHVhblByZWxvYWRpbmcpIHJldHVybjtcclxuICAgICAgICB0aGlzLl94dWFuUHJlbG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkWHVhbkFzc2V0cygpO1xyXG4gICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZSgneHVhbicsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5feHVhblByZWxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3h1YW5QcmVsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBsb2FkWHVhblNjZW5lKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl94dWFuUHJlbG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgneHVhbicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl94dWFuUHJlbG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkWHVhbkFzc2V0cygpO1xyXG4gICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZSgneHVhbicsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5feHVhblByZWxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3h1YW5QcmVsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgneHVhbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcHJlbG9hZFh1YW5Bc3NldHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3h1YW5Bc3NldHNQcmVsb2FkZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl94dWFuQXNzZXRzUHJlbG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignenpJbWcnLCBjYy5TcHJpdGVGcmFtZSwgKCkgPT4ge30pO1xyXG4gICAgfVxyXG5cclxuICAgIFNob3dTaG9wKCl7XHJcbiAgICAgICAgaWYodGhpcy5zaG9wUGFuZWwpe1xyXG4gICAgICAgICAgICB0aGlzLnNob3BQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfllYblupfnlYzpnaLoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5omT5byA6K6+572u6Z2i5p2/77yM54K55Ye75LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIENoZWNrQkdNKCl7XHJcbiAgICAgICAgaWYodGhpcy5zZXR0aW5nc1BhbmVsKXtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5nc1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5b6u5L+h5a2Y5YKo55qE5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldERhdGEoKXtcclxuICAgICAgICBpZihjYy5zeXMucGxhdGZvcm0gIT0gY2Muc3lzLldFQ0hBVF9HQU1FKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTTFNfVVNFUl9JRCcpO1xyXG4gICAgICAgIGNvbnN0IGJlc3RTY29yZUtleSA9IHVzZXJJZCA/IGAke21HYW1lRGF0YS5CZXN0U2NvcmVLZXl9XyR7dXNlcklkfWAgOiBtR2FtZURhdGEuQmVzdFNjb3JlS2V5O1xyXG4gICAgICAgIFxyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS53eC5nZXRTdG9yYWdlKHtcclxuICAgICAgICAgICAga2V5OmJlc3RTY29yZUtleSxcclxuICAgICAgICAgICAgc3VjY2VzczpmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLkJlc3RTY29yZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOW+ruS/oeWIhuS6q1xyXG4gICAgICovXHJcbiAgICB3eFNoYXJlKCl7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiZPlvIDmjpLooYzmppxcclxuICAgICAqL1xyXG4gICAgU2hvd1JhbmsoKXtcclxuICAgICAgICBpZih0aGlzLnJhbmtQYW5lbCl7XHJcbiAgICAgICAgICAgIHRoaXMucmFua1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aOkuihjOamnOeVjOmdouiKgueCueacquiuvue9ricpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6YeN572u6LSm5Y+377yM5YiH5o2i6LSm5Y+3XHJcbiAgICAgKi9cclxuICAgIFJlc2V0QWNjb3VudCgpe1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnU0xTX1VTRVJOQU1FJyk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdTTFNfUEFTU1dPUkQnKTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdTTFNfUkVBTE5BTUUnLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+i0puWPt+S/oeaBr+W3sua4hemZpO+8jOWunuWQjeiupOivgeS/oeaBr+S/neeVme+8jOi3s+i9rOWIsOeZu+W9leeVjOmdoicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnTG9hZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWz6Zet5b6u5L+h5o6S6KGM5qacXHJcbiAgICAgKi9cclxuICAgIEhpZGVSYW5rKCl7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyW5Ymn5oOF5by556qXXHJcbiAgICAgKi9cclxuICAgIGluaXRTdG9yeVBvcHVwKCl7XHJcbiAgICAgICAgLy8g6K6+572u5ri45oiP54q25oCB5Li65pyq5byA5aeL77yM6Zi75q2i5ri45oiP6YC76L6R5omn6KGMXHJcbiAgICAgICAgbUdhbWVEYXRhLmlzR2FtZUJlZ2luID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5pi+56S65Ymn5oOF5by556qXXHJcbiAgICAgICAgaWYodGhpcy5TdG9yeV9ub2RlKXtcclxuICAgICAgICAgICAgdGhpcy5TdG9yeV9ub2RlLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZml0U3RvcnlQb3B1cFRvU2NyZWVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHRoaXMuZml0U3RvcnlQb3B1cFRvU2NyZWVuKCksIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDliJ3lp4vljJbliafmg4XmlofmnKzmlbDnu4TvvIjnpLrkvovkuLrljYHlh6DooYzmlofmnKzvvIlcclxuICAgICAgICB0aGlzLnN0b3J5TGluZXMgPSBbXHJcbiAgICAgICAgICAgIFwi6IuN56m55bSp6KOC77yM54uC6aOO5ZG85ZW477yM5aaW6a2U55qE5Zi25ZC86ZyH56KO5LqG5Lic5pa5546E5bm75LiW55WM55qE5a6B6Z2Z77yM5Yeh6Ze0556s6Ze05rKm5Li654K854ux44CC5Zyo6YKj5beN5bOo55qE56We5qC45LmL5LiK77yM6Zi06Ziz5rOV6Zi15rWB6L2s552A5Y+k6ICB6ICM56We5Zyj55qE5YWJ6L6J77yM5peg5pWw5aSp5b6h5YuH5aOr6Lqr5oqr5rWB5YWJ6ZOg55Sy77yM5aaC5pif6L6w6Iis546v57uV77yM6KqT5q275a6I5oqk6L+Z5pyA5ZCO55qE5biM5pyb44CC5LuW5Lus6IOM5a+556We5qC477yM55u06Z2i5p2l6Ieq5Zub6Z2i5YWr5pa555qE5ruU5aSp5aaW6a2U5rWq5r2u77yM5Lul6KGA6IKJ5LmL6Lqv6ZO45bCx6ZKi6ZOB6Ziy57q/77yM5Y+q5Li65oqk5L2R6IuN55Sf77yM5o2N5Y2r5aSp6YGT56ep5bqP55qE5rC45oGS77yM55u06Iez5pyA5ZCO5LiA5oGv44CCXCIsXHJcbiAgICAgICAgXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDph43nva7lvZPliY3ooYzntKLlvJXlkozlrZfnrKbntKLlvJVcclxuICAgICAgICB0aGlzLmN1cnJlbnRMaW5lSW5kZXggPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJJbmRleCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5riF56m65b2T5YmN5paH5pysXHJcbiAgICAgICAgaWYodGhpcy5yX3N0b3J5KXtcclxuICAgICAgICAgICAgdGhpcy5yX3N0b3J5LnN0cmluZyA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOW8gOWni+mAkOihjOaYvuekuuaWh+acrFxyXG4gICAgICAgIHRoaXMuc2hvd05leHRMaW5lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g56aB55So6Lez6L+H5oyJ6ZKuXHJcbiAgICAgICAgaWYodGhpcy5idG5fanVtcCl7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX2p1bXAuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIDPnp5LlkI7lkK/nlKjot7Pov4fmjInpkq5cclxuICAgICAgICAgICAgdGhpcy5qdW1wQnV0dG9uVGltZXIgPSBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ0bl9qdW1wLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ0bl9qdW1wLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLnNraXBTdG9yeSx0aGlzKTtcclxuICAgICAgICAgICAgfSwgMzAwMCk7IC8vIHNldFRpbWVvdXTkvb/nlKjmr6vnp5JcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogRml0IHN0b3J5IHBvcHVwIGJhY2tncm91bmRzIHRvIGN1cnJlbnQgQ2FudmFzIHNpemUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZml0U3RvcnlQb3B1cFRvU2NyZWVuKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5TdG9yeV9ub2RlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuZml0Tm9kZVRvUGFyZW50KHRoaXMuU3Rvcnlfbm9kZSk7XHJcbiAgICAgICAgdGhpcy5maXROb2RlVG9QYXJlbnQodGhpcy5TdG9yeV9ub2RlLmdldENoaWxkQnlOYW1lKCdzdG9yeV9iZycpKTtcclxuICAgICAgICB0aGlzLmZpdE5vZGVUb1BhcmVudCh0aGlzLlN0b3J5X25vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2JlaWppbmczJykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZml0Tm9kZVRvUGFyZW50KG5vZGU6IGNjLk5vZGUpIHtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUucGFyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudFNpemUgPSBub2RlLnBhcmVudC5nZXRDb250ZW50U2l6ZSgpO1xyXG4gICAgICAgIGlmIChwYXJlbnRTaXplLndpZHRoIDw9IDAgfHwgcGFyZW50U2l6ZS5oZWlnaHQgPD0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBub2RlLnNldENvbnRlbnRTaXplKHBhcmVudFNpemUpO1xyXG4gICAgICAgIG5vZGUuc2V0UG9zaXRpb24oXHJcbiAgICAgICAgICAgICgwLjUgLSBub2RlLnBhcmVudC5hbmNob3JYKSAqIHBhcmVudFNpemUud2lkdGgsXHJcbiAgICAgICAgICAgICgwLjUgLSBub2RlLnBhcmVudC5hbmNob3JZKSAqIHBhcmVudFNpemUuaGVpZ2h0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcclxuICAgICAgICBpZiAoc3ByaXRlKSBzcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xyXG5cclxuICAgICAgICBjb25zdCB3aWRnZXQgPSBub2RlLmdldENvbXBvbmVudChjYy5XaWRnZXQpO1xyXG4gICAgICAgIGlmICh3aWRnZXQpIHtcclxuICAgICAgICAgICAgd2lkZ2V0LmlzQWxpZ25MZWZ0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmlzQWxpZ25SaWdodCA9IHRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldC5pc0FsaWduVG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmlzQWxpZ25Cb3R0b20gPSB0cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQuaXNBbGlnbkhvcml6b250YWxDZW50ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmlzQWxpZ25WZXJ0aWNhbENlbnRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB3aWRnZXQubGVmdCA9IDA7XHJcbiAgICAgICAgICAgIHdpZGdldC5yaWdodCA9IDA7XHJcbiAgICAgICAgICAgIHdpZGdldC50b3AgPSAwO1xyXG4gICAgICAgICAgICB3aWRnZXQuYm90dG9tID0gMDtcclxuICAgICAgICAgICAgd2lkZ2V0LnVwZGF0ZUFsaWdubWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAkOihjOmAkOWtl+aYvuekuuWJp+aDheaWh+acrFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNob3dOZXh0TGluZSgpe1xyXG4gICAgICAgIGlmKHRoaXMuY3VycmVudExpbmVJbmRleCA8IHRoaXMuc3RvcnlMaW5lcy5sZW5ndGggJiYgdGhpcy5yX3N0b3J5KXtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudExpbmUgPSB0aGlzLnN0b3J5TGluZXNbdGhpcy5jdXJyZW50TGluZUluZGV4XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudENoYXJJbmRleCA8IGN1cnJlbnRMaW5lLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAvLyDmmL7npLrlvZPliY3ooYznmoTkuIvkuIDkuKrlrZfnrKZcclxuICAgICAgICAgICAgICAgIHRoaXMucl9zdG9yeS5zdHJpbmcgKz0gY3VycmVudExpbmUuY2hhckF0KHRoaXMuY3VycmVudENoYXJJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFySW5kZXgrKztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g6LCD5bqm5pi+56S65LiL5LiA5Liq5a2X56ymXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TmV4dExpbmUoKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuY2hhckludGVydmFsICogMTAwMCk7IC8vIHNldFRpbWVvdXTkvb/nlKjmr6vnp5JcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g5a2Y5YKo5a6a5pe25ZmoSUTvvIzku6Xkvr/lkI7nu63muIXpmaRcclxuICAgICAgICAgICAgICAgIHRoaXMudGV4dFRpbWVycy5wdXNoKHRpbWVySWQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5b2T5YmN6KGM5pi+56S65a6M5oiQ77yM5re75Yqg5o2i6KGM56ym77yI5aaC5p6c5LiN5piv5pyA5ZCO5LiA6KGM77yJXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRMaW5lSW5kZXggPCB0aGlzLnN0b3J5TGluZXMubGVuZ3RoIC0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yX3N0b3J5LnN0cmluZyArPSBcIjxici8+XCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIOmHjee9ruWtl+espue0ouW8le+8jOWHhuWkh+aYvuekuuS4i+S4gOihjFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhckluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g5aKe5Yqg6KGM57Si5byVXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRMaW5lSW5kZXgrKztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g6LCD5bqm5pi+56S65LiL5LiA6KGMXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRMaW5lSW5kZXggPCB0aGlzLnN0b3J5TGluZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd05leHRMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5saW5lSW50ZXJ2YWwgKiA1MDApOyAvLyBzZXRUaW1lb3V05L2/55So5q+r56eSXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyDlrZjlgqjlrprml7blmahJRO+8jOS7peS+v+WQjue7rea4hemZpFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGV4dFRpbWVycy5wdXNoKHRpbWVySWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmiYDmnInmlofmnKzmmL7npLrlrozmiJDlkI7kv53mjIHlvLnnqpfvvIznrYnlvoXnjqnlrrbmiYvliqjngrnlh7vot7Pov4fmjInpkq7jgIJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDot7Pov4fliafmg4VcclxuICAgICAqL1xyXG4gICAgc2tpcFN0b3J5KCl7XHJcbiAgICAgICAgLy8g5riF6Zmk5omA5pyJSmF2YVNjcmlwdOWumuaXtuWZqFxyXG4gICAgICAgIHRoaXMudGV4dFRpbWVycy5mb3JFYWNoKHRpbWVySWQgPT4ge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50ZXh0VGltZXJzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5riF6Zmk6Lez6L+H5oyJ6ZKu5ZCv55So5a6a5pe25ZmoXHJcbiAgICAgICAgaWYodGhpcy5qdW1wQnV0dG9uVGltZXIpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5qdW1wQnV0dG9uVGltZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmp1bXBCdXR0b25UaW1lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOmakOiXj+WJp+aDheW8ueeql1xyXG4gICAgICAgIGlmKHRoaXMuU3Rvcnlfbm9kZSl7XHJcbiAgICAgICAgICAgIHRoaXMuU3Rvcnlfbm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g56e76Zmk6Lez6L+H5oyJ6ZKu55qE54K55Ye75LqL5Lu2XHJcbiAgICAgICAgaWYodGhpcy5idG5fanVtcCl7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX2p1bXAub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLnNraXBTdG9yeSx0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6K6+572u5ri45oiP54q25oCB5Li65bey5byA5aeLXHJcbiAgICAgICAgbUdhbWVEYXRhLmlzR2FtZUJlZ2luID0gdHJ1ZTtcclxuICAgICAgICAvLyDlm57liLDkuLvnlYzpnaLvvIzkuI3liqDovb3muLjmiI/lnLrmma9cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmYsuayiei/t+ajgOafpVxyXG4gICAgICovXHJcbiAgICBhc3luYyBjaGVja0FudGlBZGRpY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g6I635Y+W5pys5Zyw5a2Y5YKo55qE55So5oi35ZCNXHJcbiAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSTkFNRScpO1xyXG4gICAgICAgIGlmICghdXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+acquaJvuWIsOeUqOaIt+WQje+8jOi3s+i/h+mYsuayiei/t+ajgOafpScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFudGlBZGRpY3Rpb25SZXN1bHQgPSBhd2FpdCB0aGlzLlBvc3RCcmVhdGhlKEFQUF9JRCwgdXNlcm5hbWUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuS4u+eVjOmdoumYsuayiei/t+ajgOafpee7k+aenDpcIiwgYW50aUFkZGljdGlvblJlc3VsdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoYW50aUFkZGljdGlvblJlc3VsdC5kYXRhICYmIGFudGlBZGRpY3Rpb25SZXN1bHQuY29kZSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIOaYvuekuumYsuayiei/t+aPkOekuumdouadv1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuTk8xOFBhbmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5OTzE4UGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50aXBzX2xhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGlwc19sYWJlbC5zdHJpbmcgPSBhbnRpQWRkaWN0aW9uUmVzdWx0Lm1zZztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0aXBzX2xhYmVs6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdOTzE4UGFuZWzoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDpmLLmsonov7fmo4Dmn6XpgJrov4fvvIznu6fnu63muLjmiI9cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+S4u+eVjOmdoumYsuayiei/t+ajgOafpemAmui/hycpO1xyXG5cclxuICAgICAgICAgICAgLy8g5qOA5p+l6L+U5Zue55qE5pe26Ze05piv5ZCm5Yiw6L6+5LqM5Y2B54K55Zub5Y2B5LqU5YiG77yI5LuF5pyq5oiQ5bm05Lq65qOA5rWL77yJXHJcbiAgICAgICAgICAgIGlmIChhbnRpQWRkaWN0aW9uUmVzdWx0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiBhbnRpQWRkaWN0aW9uUmVzdWx0LmRhdGEgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIOivu+WPluW5tOm+hOeKtuaAge+8jOS7heacquaIkOW5tOS6uuaJp+ihjOajgOa1i1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZWRBZ2VTdGF0dXMgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9BR0VfU1RBVFVTKTtcclxuICAgICAgICAgICAgICAgIGlmIChzYXZlZEFnZVN0YXR1cyAhPT0gJzEnKSB7IC8vIDE95oiQ5bm05Lq677yM5YW25LuWPeacquaIkOW5tOS6ulxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWQjuerr+aYjuehrui/lOWbnjEw5L2N5pWw5pWw5a2X5pe26Ze05oiz77yM55u05o6l5Lyg6YCSXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1RpbWVBbmRTaG93UG9wdXAoYW50aUFkZGljdGlvblJlc3VsdC5kYXRhIGFzIG51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5Li755WM6Z2i6Ziy5rKJ6L+35qOA5p+l5aSx6LSlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIC8vIFRpcHNNYW5hZ2VyLnNob3coJ+mYsuayiei/t+ajgOafpeWksei0pe+8jOivt+mHjeivlScpO1xyXG4gICAgICAgICAgICAvLyDlj6/ku6XpgInmi6nkuI3pmLvmraLmuLjmiI/vvIzkvYblupTor6Xmj5DnpLrnlKjmiLdcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5b+D6Lez5o6l5Y+j77yI6Ziy5rKJ6L+35qOA5p+l77yJXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIFBvc3RCcmVhdGhlKGFwcGlkOiBzdHJpbmcsIHVzZXJuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9CcmVhdGhlXCI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT07op6PmnpDplJnor686ICR7ZS5tZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFDplJnor686ICR7eGhyLnN0YXR1c31gKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axguWksei0pScpKTtcclxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYXBwaWQsIHVzZXJuYW1lIH0pKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmYsuayiei/t+aPkOekuumdouadv+ehruWumuaMiemSrueCueWHu+S6i+S7tlxyXG4gICAgICovXHJcbiAgICBvbkNvbmZpcm1ObzE4KCkge1xyXG4gICAgICAgIC8vIOmakOiXj+mYsuayiei/t+aPkOekuumdouadv1xyXG4gICAgICAgIGlmICh0aGlzLk5PMThQYW5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLk5PMThQYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5riF6Zmk55So5oi355m75b2V54q25oCB77yM6Ziy5q2i6L+U5Zue55m75b2V55WM6Z2i5ZCO6Ieq5Yqo55m75b2VXHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdTTFNfVVNFUk5BTUUnKTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ1NMU19QQVNTV09SRCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOi/lOWbnueZu+W9leeVjOmdolxyXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnTG9hZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2hhcmdlKCl7XHJcbiAgICAgICAgLy8g6Lez6L2s5Yiw5YWF5YC855WM6Z2iXHJcbiAgICAgICAgdGhpcy5DaGFyZ2VQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vIOabtOaWsOWFheWAvOeVjOmdoueahOmSu+efs+aYvuekulxyXG4gICAgICAgIHRoaXMudXBkYXRlR2VtVGlwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2xvc2VDaGFyZ2UoKXtcclxuICAgICAgICAvLyDlhbPpl63lvLnnqpdcclxuICAgICAgICB0aGlzLkNoYXJnZVBhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2xvc2VUaXBzKCl7XHJcbiAgICAgICAgLy8g5YWz6Zet5by556qXXHJcbiAgICAgICAgdGhpcy5UaXBzUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhYXlgLzmjInpkq7ngrnlh7vkuovku7blpITnkIZcclxuICAgICAqIEBwYXJhbSBidXR0b25JZCDmjInpkq5JRFxyXG4gICAgICovXHJcbiAgICBvblJlY2hhcmdlQnRuQ2xpY2soYnV0dG9uSWQ6IG51bWJlcil7XHJcbiAgICAgICAgLy8g6I635Y+W5b2T5YmN6YCJ5oup55qE5YWF5YC86YCJ6aG5XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24gPSB0aGlzLnJlY2hhcmdlQ29uZmlnW2J1dHRvbklkXTtcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbil7XHJcbiAgICAgICAgICAgIC8vIOiuvue9ruaPkOekuuaWh+acrFxyXG4gICAgICAgICAgICBpZih0aGlzLkxfdGlwcyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxfdGlwcy5zdHJpbmcgPSBg5piv5ZCm56Gu6K6k5pSv5LuYJHt0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5wcmljZX3lhYPkurrmsJHluIHlhZHmjaIke3RoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzfeS4qumSu+efs++8n2A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5pi+56S656Gu6K6k5by556qXXHJcbiAgICAgICAgICAgIGlmKHRoaXMuVGlwc1BhbmVsKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuVGlwc1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgT25Pa1RpcHMoKXtcclxuICAgICAgICAvLyDnoa7orqTlhYXlgLxcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbil7XHJcbiAgICAgICAgICAgIC8vIOWcqOi/memHjOa3u+WKoOWunumZheeahOWFheWAvOWkhOeQhumAu+i+kVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSTkFNRScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5Qb3N0UGF5RGlhbW9uZChBUFBfSUQsIHVzZXJuYW1lLCB0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5kaWFtb25kcyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui0reS5sOe7k+aenDpcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5jb2RlID09PSAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgVGlwc1duZE1hbmFnZXIuc2hvdyhyZXN1bHQubXNnICsgJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaooeaLn+WFheWAvOaIkOWKn++8jOa3u+WKoOmSu+efs1xyXG4gICAgICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5hZGRHb2xkKHRoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDpkrvnn7PmmL7npLpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZUdvbGRMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaYvuekuuWFheWAvOaIkOWKn+aPkOekulxyXG4gICAgICAgICAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coYOWFkeaNouaIkOWKn++8geiOt+W+lyR7dGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24uZGlhbW9uZHN95Liq6ZK755+z44CCYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6YeN572u5b2T5YmN6YCJ5oup55qE5YWF5YC86YCJ6aG5XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIui0reS5sOi/h+eoi+S4reWHuumUmTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAvLyDmqKHmi5/lhYXlgLzmiJDlip/vvIzmt7vliqDpkrvnn7NcclxuICAgICAgICAgICAgLy8gbUdhbWVEYXRhLmN1cnJlbnRHb2xkICs9IHRoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzO1xyXG4gICAgICAgICAgICAvLyAvLyDmm7TmlrDpkrvnn7PmmL7npLpcclxuICAgICAgICAgICAgLy8gdGhpcy5VcGRhdGVHb2xkTGFiZWwoKTtcclxuICAgICAgICAgICAgLy8gLy8g5Y+R6YCB6ZK755+z5pu05paw5LqL5Lu2XHJcbiAgICAgICAgICAgIC8vIGNjLmRpcmVjdG9yLmVtaXQoJ2dvbGRVcGRhdGVkJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyAvLyDmmL7npLrlhYXlgLzmiJDlip/mj5DnpLpcclxuICAgICAgICAgICAgLy8gVGlwc01hbmFnZXIuc2hvdyhg5YWR5o2i5oiQ5Yqf77yB6I635b6XJHt0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5kaWFtb25kc33kuKrpkrvnn7PjgIJgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIC8vIOmHjee9ruW9k+WJjemAieaLqeeahOWFheWAvOmAiemhuVxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWFs+mXreW8ueeql1xyXG4gICAgICAgIHRoaXMuVGlwc1BhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWFheWAvOmSu+efs+aOpeWPo1xyXG4gICAgICovXHJcbiAgICBhc3luYyBQb3N0UGF5RGlhbW9uZChhcHBpZDogc3RyaW5nLCB1c2VybmFtZTogc3RyaW5nLCBkaWFtb25kOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9QYXlEaWFtb25kXCI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT07op6PmnpDplJnor686ICR7ZS5tZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFDplJnor686ICR7eGhyLnN0YXR1c31gKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axguWksei0pScpKTtcclxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYXBwaWQsIHVzZXJuYW1lLCBkaWFtb25kfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6Xov5Tlm57nmoTml7bpl7TmmK/lkKbliLDovr7kuozljYHngrnlm5vljYHkupTliIbvvIzlpoLmnpzliLDovr7liJnmmL7npLrlvLnnqpdcclxuICAgICAqIEBwYXJhbSB0aW1lc3RhbXAg5ZCO56uv6L+U5Zue55qEMTDkvY3mlbDnp5Lnuqfml7bpl7TmiLNcclxuICAgICAqL1xyXG4gICAgIGNoZWNrVGltZUFuZFNob3dQb3B1cCh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOWQjuerr+ehruWumui/lOWbnueahOaYrzEw5L2N5pWw56eS57qn5pe26Ze05oiz77yM55u05o6l6L2s5o2i5Li65q+r56eS57qnXHJcbiAgICAgICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRpbWVzdGFtcCAqIDEwMDA7XHJcbiAgICAgICAgICAgIC8vIOWIm+W7ukRhdGXlr7nosaFcclxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKG1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBob3VyczogbnVtYmVyID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXCJiYmJiYmJiYmJcIilcclxuICAgICAgICAgICAgLy8g55uu5qCH5pe26Ze077ya5LqM5Y2B54K55Zub5Y2B5LqU5YiGXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhvdXI6IG51bWJlciA9IDIwO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRNaW51dGU6IG51bWJlciA9IDQ1O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g6LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG5LiN5YaN5qOA5p+lXHJcbiAgICAgICAgICAgIGNvbnN0IGVuZEhvdXI6IG51bWJlciA9IDIwO1xyXG4gICAgICAgICAgICBjb25zdCBlbmRNaW51dGU6IG51bWJlciA9IDQ2O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5aaC5p6c5pe26Ze06LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG77yM55u05o6l6L+U5ZueXHJcbiAgICAgICAgICAgIGlmIChob3VycyA+IGVuZEhvdXIgfHwgKGhvdXJzID09PSBlbmRIb3VyICYmIG1pbnV0ZXMgPiBlbmRNaW51dGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pe26Ze05bey6LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG77yM5LiN5YaN5omn6KGM5qOA5p+lJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOWmguaenOW3sue7j+aYvuekuui/h+W8ueeql++8jOebtOaOpei/lOWbnlxyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNTaG93blRpbWVQb3B1cCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W3sue7j+aYvuekuui/h+S6jOWNgeeCueWbm+WNgeS6lOWIhuW8ueeql++8jOS4jeWGjeaYvuekuicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDliKTmlq3mmK/lkKbliLDovr7nm67moIfml7bpl7RcclxuICAgICAgICAgICAgaWYgKGhvdXJzID4gdGFyZ2V0SG91ciB8fCAoaG91cnMgPT09IHRhcmdldEhvdXIgJiYgbWludXRlcyA+PSB0YXJnZXRNaW51dGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pe26Ze05bey5Yiw6L6+5LqM5Y2B54K55Zub5Y2B5LqU5YiG77yM5pi+56S65by556qXJyk7XHJcbiAgICAgICAgICAgICAgICAvLyDosIPnlKhUaXBzV25kTWFuYWdlci5zaG935pa55rOV5pi+56S65by556qXXHJcbiAgICAgICAgICAgICAgICBUaXBzV25kTWFuYWdlci5zaG93KCfmgqjnm67liY3kuLrmnKrmiJDlubTkurrotKblj7fvvIzlt7LooqvnurPlhaXpmLLmsonov7fns7vnu5/jgILmoLnmja7jgIrlm73lrrbmlrDpl7vlh7rniYjnvbLlhbPkuo7ov5vkuIDmraXkuKXmoLznrqHnkIYg5YiH5a6e6Ziy5q2i5pyq5oiQ5bm05Lq65rKJ6L+3572R57uc5ri45oiP55qE6YCa55+l44CL77yM5q+P5ZGo5LqU44CB5ZGo5YWt44CB5ZGo5pel5ZKM5rOV5a6a6IqC5YGH5pel5q+P5pelMjDml7boh7MyMeaXtuWQkeacquaIkOW5tOS6uuaPkOS+mzHlsI/ml7bnvZHnu5zmuLjmiI/mnI3liqHjgIJcXG7mgqjlvZPml6XliankvZnml7bplb/kuI3otrMxNeWIhumSn+OAgicpO1xyXG4gICAgICAgICAgICAgICAgLy8g5qCH6K6w5Li65bey5pi+56S6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Nob3duVGltZVBvcHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfml7bpl7TlsJrmnKrliLDovr7kuozljYHngrnlm5vljYHkupTliIYnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aXtumXtOino+aekOWksei0pTonLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWz6Zet6K6+572u6Z2i5p2/XHJcbiAgICAgKi9cclxuICAgIGNsb3NlU2V0dGluZ3MoKXtcclxuICAgICAgICBpZih0aGlzLnNldHRpbmdzUGFuZWwpe1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOmfs+S5kOW8gOWFs+aMiemSrueCueWHu+Wbnuiwg1xyXG4gICAgICovXHJcbiAgICBvbk11c2ljQnRuQ2xpY2soKXtcclxuICAgICAgICBtR2FtZURhdGEuaXNCR01PbiA9ICFtR2FtZURhdGEuaXNCR01PbjtcclxuICAgICAgICBtR2FtZURhdGEuU2F2ZUJHTU9uRGF0YSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOabtOaWsOeyvueBteaYvuekuueKtuaAgVxyXG4gICAgICAgIGlmKHRoaXMubXVzaWNPbiAmJiB0aGlzLm11c2ljT2ZmKXtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY09uLmFjdGl2ZSA9IG1HYW1lRGF0YS5pc0JHTU9uO1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljT2ZmLmFjdGl2ZSA9ICFtR2FtZURhdGEuaXNCR01PbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5o6n5Yi26IOM5pmv6Z+z5LmQXHJcbiAgICAgICAgaWYobUdhbWVEYXRhLmlzQkdNT24pe1xyXG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KHRoaXMuQmdtLCBmYWxzZSwgMSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6Z+z5pWI5byA5YWz5oyJ6ZKu54K55Ye75Zue6LCDXHJcbiAgICAgKi9cclxuICAgIG9uU291bmRCdG5DbGljaygpe1xyXG4gICAgICAgIG1HYW1lRGF0YS5pc1NvdW5kT24gPSAhbUdhbWVEYXRhLmlzU291bmRPbjtcclxuICAgICAgICBtR2FtZURhdGEuU2F2ZVNvdW5kT25EYXRhKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5pu05paw57K+54G15pi+56S654q25oCBXHJcbiAgICAgICAgaWYodGhpcy5zb3VuZE9uICYmIHRoaXMuc291bmRPZmYpe1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kT24uYWN0aXZlID0gbUdhbWVEYXRhLmlzU291bmRPbjtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE9mZi5hY3RpdmUgPSAhbUdhbWVEYXRhLmlzU291bmRPbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgU2hvd1FIKCl7XHJcbiAgICAgICAgU3RhdGVCcmlkZ2UucHJlcGFyZVVwZ3JhZGUoKTtcclxuICAgICAgICBpZih0aGlzLlFpYW5naHVhUGFuZWwpe1xyXG4gICAgICAgICAgICB0aGlzLlFpYW5naHVhUGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBncmFkZUNvbnRyb2xsZXIgPSB0aGlzLlFpYW5naHVhUGFuZWwuZ2V0Q29tcG9uZW50KCdVcGdyYWRlQ29udHJvbGxlcicpIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGdyYWRlQ29udHJvbGxlciAmJiB1cGdyYWRlQ29udHJvbGxlci5zaG93QXNQb3B1cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVDb250cm9sbGVyLnNob3dBc1BvcHVwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmlrDlvLrljJblvLnnqpfoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgU2hvd0NKKCl7XHJcbiAgICAgICBpZih0aGlzLkNKUGFuZWwpe1xyXG4gICAgICAgICAgICBjb25zdCBhY2hpZXZlTWFuYWdlciA9IHRoaXMuQ0pQYW5lbC5nZXRDb21wb25lbnQoJ0FjaGlldmVNYW5hZ2VyJykgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZU1hbmFnZXIgJiYgYWNoaWV2ZU1hbmFnZXIuc2hvdykge1xyXG4gICAgICAgICAgICAgICAgYWNoaWV2ZU1hbmFnZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5DSlBhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5oiQ5bCx55WM6Z2i6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFNob3dXZWVrKCl7XHJcbiAgICAgICBpZih0aGlzLldlZWtQYW5lbCl7XHJcbiAgICAgICAgICAgIHRoaXMuV2Vla1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WRqOWlluWKseeVjOmdouiKgueCueacquiuvue9ricpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBTaG93RGFpbHkoKXtcclxuICAgICAgIGlmKHRoaXMuRGFpbHlQYW5lbCl7XHJcbiAgICAgICAgICAgIHRoaXMuRGFpbHlQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfml6XlpZblirHnlYzpnaLoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19