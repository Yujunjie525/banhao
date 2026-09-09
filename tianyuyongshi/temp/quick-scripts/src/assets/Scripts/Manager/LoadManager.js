"use strict";
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