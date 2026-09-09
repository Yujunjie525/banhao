
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
var StateBridge_1 = require("../game/StateBridge");
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
        this.weixinNode.active = false;
        if (GameData_1.default.isBGMOn) {
            // this.SpOn.active = true;
            // this.SpOff.active = false;
            cc.audioEngine.play(this.Bgm, true, 1);
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
        if (GameData_1.default.shouldOpenLevelSelect) {
            GameData_1.default.shouldOpenLevelSelect = false;
        }
        // 检查是否是首次登录（剧情弹窗未显示过），如果是则显示剧情弹窗
        if (!GameData_1.default.isStoryPopupShown()) {
            console.log('首次登录，显示剧情弹窗');
            this.initStoryPopup();
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
    LoadManager.prototype.onDestroy = function () {
        cc.director.off('goldUpdated', this.UpdateGoldLabel, this);
        cc.director.off('shenpoUpdated', this.UpdateShenpoLabel, this);
        this.textTimers.forEach(function (timerId) {
            clearTimeout(timerId);
        });
        this.textTimers = [];
        if (this.jumpButtonTimer) {
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
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
        if (this.cur_level) {
            this.cur_level.string = '最远距离：' + this._getWarriorRunBestDistance() + '米。';
        }
        else {
            console.error('主界面cur_level标签未赋值');
        }
    };
    LoadManager.prototype._getWarriorRunBestDistance = function () {
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        var scopedKey = userId ? 'WarriorRunBestDistance_' + userId : 'WarriorRunBestDistance';
        var raw = cc.sys.localStorage.getItem(scopedKey) || cc.sys.localStorage.getItem('WarriorRunBestDistance');
        return Math.max(0, Math.floor(Number(raw) || 0));
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
        this.startEndlessRun();
    };
    LoadManager.prototype.StartGame2 = function () {
        this.startEndlessRun();
    };
    LoadManager.prototype.startEndlessRun = function () {
        StateBridge_1.default.syncForStartScene();
        if (!GameData_1.default.HasEnoughStamina()) {
            TipsManager_1.default.show('体力不足，无法开始游戏。');
            return;
        }
        if (!StateBridge_1.default.consumeStamina()) {
            TipsManager_1.default.show('体力不足，无法开始游戏。');
            return;
        }
        GameData_1.default.isInfiniteMode = true;
        GameData_1.default.shouldOpenLevelSelect = false;
        cc.director.loadScene('WarriorRun');
    };
    LoadManager.prototype.openLevelSelectPanel = function () {
        this.startEndlessRun();
    };
    LoadManager.prototype.ShowShop = function () {
        if (this.shopPanel) {
            var shopManager = this.shopPanel.getComponent('ShopManager');
            if (shopManager && shopManager.show) {
                shopManager.show();
            }
            else {
                this.shopPanel.active = true;
            }
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
            var rankManager = this.rankPanel.getComponent('RankManager');
            if (rankManager && rankManager.show) {
                rankManager.show();
            }
            else {
                this.rankPanel.active = true;
            }
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
        if (this.rankPanel) {
            var rankManager = this.rankPanel.getComponent('RankManager');
            if (rankManager && rankManager.hide) {
                rankManager.hide();
            }
            else {
                this.rankPanel.active = false;
            }
        }
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
            "曾几何时，这片辽阔大陆安宁祥和，城邦林立、生灵安居乐业。一场名为「虚空狂潮」的异界灾乱凭空爆发，黑雾撕裂大地，无数魔物从裂隙中涌出，一座座城池接连沦陷。守护四方的远征卫队全军覆没，古老神殿化为断壁残垣。如今，你是这片大陆仅存的勇者，是文明最后的希望。你孤身踏上无尽征途，身后是大陆最后一片未被魔物侵染的净土；前方前路遍布魔物，成群怪物层层围堵，早已退无可退。前行不只为自保求生，更为守护世间残存的生机。在这场奇幻闯关冒险中，握紧武器冲破魔物封锁，以勇气劈开黑暗，走完属于你的勇士征途！",
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
        GameData_1.default.setStoryPopupShown();
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
            cc.audioEngine.play(this.Bgm, true, 1);
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
        StateBridge_1.default.prepareUpgrade();
        if (this.SkillPanel) {
            var skillManager = this.SkillPanel.getComponent('SkillManager');
            if (skillManager && skillManager.show) {
                skillManager.show();
            }
            else {
                this.SkillPanel.active = true;
            }
            return;
        }
        TipsManager_1.default.show('功能暂未开放');
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
            var weeklyRewardManager = this.WeekPanel.getComponent('WeeklyRewardManager');
            if (weeklyRewardManager && weeklyRewardManager.show) {
                weeklyRewardManager.show();
            }
            else {
                this.WeekPanel.active = true;
            }
        }
        else {
            console.error('周奖励界面节点未设置');
        }
    };
    LoadManager.prototype.ShowDaily = function () {
        if (this.DailyPanel) {
            var dailyRewardManager = this.DailyPanel.getComponent('DailyRewardManager');
            if (dailyRewardManager && dailyRewardManager.show) {
                dailyRewardManager.show();
            }
            else {
                this.DailyPanel.active = true;
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcTG9hZE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFDLDZDQUF5QztBQUMxQyxtREFBOEM7QUFDOUMsMkNBQTZDO0FBQzdDLGlEQUE2QztBQUU3QyxtREFBOEM7QUFFeEMsSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFJMUM7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFnbkNDO1FBOW1DRyxjQUFRLEdBQWEsSUFBSSxDQUFDO1FBRzFCLGVBQVMsR0FBVyxJQUFJLENBQUM7UUFFekIsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFFM0IsWUFBTSxHQUFXLElBQUksQ0FBQztRQUV0QixvQkFBb0I7UUFDWix1QkFBaUIsR0FBWSxLQUFLLENBQUM7UUFFM0MsVUFBVTtRQUNWLDBCQUEwQjtRQUNULDRCQUFzQixHQUFHLGdCQUFnQixDQUFDO1FBRTNELCtCQUErQjtRQUMvQixzQ0FBc0M7UUFDOUIsa0NBQTRCLEdBQVksSUFBSSxDQUFDO1FBRXJELFNBQVM7UUFDRCxnQkFBVSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxXQUFXO1FBQ0gsc0JBQWdCLEdBQVcsQ0FBQyxDQUFDO1FBQ3JDLGNBQWM7UUFDTixrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUNuQyxjQUFjO1FBQ04sa0JBQVksR0FBVyxJQUFJLENBQUM7UUFDcEMsV0FBVztRQUNILHNCQUFnQixHQUFXLENBQUMsQ0FBQztRQUNyQyxjQUFjO1FBQ04sZ0JBQVUsR0FBVSxFQUFFLENBQUM7UUFDL0IsY0FBYztRQUNOLHFCQUFlLEdBQVEsSUFBSSxDQUFDO1FBRXBDLGVBQWU7UUFDUCwyQkFBcUIsR0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXO1FBR3RELGVBQVMsR0FBYSxJQUFJLENBQUM7UUFHM0IsWUFBTSxHQUFhLElBQUksQ0FBQztRQUd4QixhQUFP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Q0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUVsRSxJQUFHLElBQUksQ0FBQyxhQUFhLEVBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEU7UUFDRCxzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1FBQzdCLElBQUcsSUFBSSxDQUFDLE1BQU0sRUFBQztZQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsYUFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsTUFBTTtRQUNOLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsSUFBRyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3BCLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsYUFBYSxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsY0FBYztRQUNkLElBQUcsSUFBSSxDQUFDLEtBQUssRUFBQztZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsSUFBRyxJQUFJLENBQUMsS0FBSyxFQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUM7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN0RjtRQUNELElBQUcsSUFBSSxDQUFDLEtBQUssRUFBQztZQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsSUFBRyxJQUFJLENBQUMsS0FBSyxFQUFDO1lBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLEVBQUM7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN0RjtRQUVELElBQUcsSUFBSSxDQUFDLGNBQWMsRUFBQztZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUM3RTtRQUNELElBQUcsSUFBSSxDQUFDLFdBQVcsRUFBQztZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFHLGtCQUFTLENBQUMsT0FBTyxFQUFDO1lBQ2pCLDJCQUEyQjtZQUMzQiw2QkFBNkI7WUFDN0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN6QjthQUFJO1lBQ0QsNEJBQTRCO1lBQzVCLDRCQUE0QjtTQUMvQjtRQUVELG1EQUFtRDtRQUNuRCxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUNqQywyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFakQsbURBQW1EO1FBQ25ELElBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBQztZQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNuRztRQUVELGdDQUFnQztRQUNoQyxJQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFDO1lBQ3JELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUM5QztRQUVELFVBQVU7UUFDVixJQUFHLElBQUksQ0FBQyxhQUFhLEVBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3JDO1FBRUQsa0JBQWtCO1FBQ2xCLElBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFDO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbkY7UUFFRCxZQUFZO1FBQ1osSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDN0U7UUFDRCxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxrQkFBUyxDQUFDLE9BQU8sQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDO1NBQzdDO1FBRUQsWUFBWTtRQUNaLElBQUcsSUFBSSxDQUFDLFFBQVEsRUFBQztZQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdFO1FBQ0QsSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUM7WUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsa0JBQVMsQ0FBQyxTQUFTLENBQUM7WUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztTQUMvQztRQUVELFdBQVc7UUFDWCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixVQUFVO1FBQ1YsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsYUFBYTtRQUNiLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFELEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFOUQsSUFBRyxrQkFBUyxDQUFDLHFCQUFxQixFQUFDO1lBQy9CLGtCQUFTLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1NBQzNDO1FBRUQsaUNBQWlDO1FBQ2pDLElBQUksQ0FBQyxrQkFBUyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBRUQsMkJBQUssR0FBTDtRQUNJLHlCQUF5QjtRQUN6QiwrQkFBK0I7UUFDL0IsaUNBQWlDO1FBQ2pDLDZDQUE2QztRQUM3Qyw2QkFBNkI7UUFDN0IsU0FBUztRQUNULGdDQUFnQztRQUNoQyxnQ0FBZ0M7UUFDaEMsSUFBSTtJQUNSLENBQUM7SUFFRCwrQkFBUyxHQUFUO1FBQ0ksRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87WUFDM0IsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFFckIsSUFBRyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3BCLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBQ0Q7O09BRUc7SUFDSDs7T0FFRztJQUNILG9DQUFjLEdBQWQ7UUFDSSxrQkFBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzNCLFNBQVM7UUFDVCxrQkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hCLFdBQVc7UUFDWCxrQkFBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDN0IsU0FBUztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsa0NBQVksR0FBWjtRQUNJLGtCQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsK0NBQXlCLEdBQXpCO1FBQ0ksVUFBVTtRQUNWLGtCQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNuQyxTQUFTO1FBQ1QsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsV0FBVztRQUNYLElBQU0sYUFBYSxHQUFHLGtCQUFTLENBQUMsY0FBYyxJQUFJLGtCQUFTLENBQUMsVUFBVSxDQUFDO1FBRXZFLElBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFDO1lBQ3RCLElBQUcsYUFBYSxFQUFDO2dCQUNiLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2FBQzFDO2lCQUFJO2dCQUNELGtCQUFrQjtnQkFDbEIsSUFBTSxVQUFVLEdBQUcsa0JBQVMsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLCtDQUFVLFVBQVksQ0FBQztnQkFFdkQsbUJBQW1CO2dCQUNuQixJQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFDO29CQUNsQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7aUJBQzdDO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHdDQUFrQixHQUFsQjtRQUNJLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxJQUFJLENBQUM7U0FDOUU7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN0QztJQUNMLENBQUM7SUFFTyxnREFBMEIsR0FBbEM7UUFDSSxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUQsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDO1FBQ3pGLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1RyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNEOztPQUVHO0lBQ0gsdUNBQWlCLEdBQWpCO1FBQ0ksSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFELElBQUcsSUFBSSxDQUFDLFVBQVUsRUFBQztZQUNmLElBQUcsTUFBTSxFQUFDO2dCQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7YUFDMUM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2xDO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILGdDQUFVLEdBQVY7UUFDSSxtQkFBbUI7UUFDbkIsa0JBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQy9CLFlBQVk7UUFDWixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixpQkFBaUI7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsa0JBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCx3Q0FBa0IsR0FBbEI7UUFDSSxJQUFHLElBQUksQ0FBQyxZQUFZLEVBQUM7WUFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQU0sa0JBQVMsQ0FBQyxjQUFjLFNBQUksa0JBQVMsQ0FBQyxVQUFZLENBQUM7U0FDcEY7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxrREFBNEIsR0FBNUI7UUFDSSxJQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFDO1lBQ3JELDBCQUEwQjtZQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3pFLFdBQVc7WUFDWCxJQUFJLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUMzRTtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILG1DQUFhLEdBQWI7UUFDSSxJQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7WUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFHLGtCQUFTLENBQUMsV0FBYSxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUNBQWUsR0FBZjtRQUNJLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQztZQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUcsa0JBQVMsQ0FBQyxXQUFhLENBQUM7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsa0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN0RDtRQUNELGdCQUFnQjtRQUNoQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELHVDQUFpQixHQUFqQjtRQUNJLElBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDO1lBQ2pCLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUcscUJBQVcsQ0FBQyxTQUFTLEVBQUksQ0FBQztJQUMzRCxDQUFDO0lBRUQsK0JBQVMsR0FBVDtRQUNJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0NBQVUsR0FBVjtRQUNJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQscUNBQWUsR0FBZjtRQUNJLHFCQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNoQyxJQUFHLENBQUMsa0JBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDO1lBQzdCLHFCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDVjtRQUNELElBQUcsQ0FBQyxxQkFBVyxDQUFDLGNBQWMsRUFBRSxFQUFDO1lBQzdCLHFCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDVjtRQUNELGtCQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUNoQyxrQkFBUyxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztRQUN4QyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsMENBQW9CLEdBQXBCO1FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFDRCw4QkFBUSxHQUFSO1FBQ0ksSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFDO1lBQ2QsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFRLENBQUM7WUFDdEUsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDakMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNoQztTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsOEJBQVEsR0FBUjtRQUNJLElBQUcsSUFBSSxDQUFDLGFBQWEsRUFBQztZQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDcEM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCw2QkFBTyxHQUFQO1FBQ0ksSUFBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBQztZQUNyQyxPQUFPO1NBQ1Y7UUFFRCxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUQsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBSSxrQkFBUyxDQUFDLFlBQVksU0FBSSxNQUFRLENBQUMsQ0FBQyxDQUFDLGtCQUFTLENBQUMsWUFBWSxDQUFDO1FBRTVGLE1BQWMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQzFCLEdBQUcsRUFBQyxZQUFZO1lBQ2hCLE9BQU8sRUFBQyxVQUFTLEdBQUc7Z0JBQ2hCLGtCQUFTLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDbkMsQ0FBQztTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFPLEdBQVA7SUFDQSxDQUFDO0lBRUQ7O09BRUc7SUFDSCw4QkFBUSxHQUFSO1FBQ0ksSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFDO1lBQ2QsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFRLENBQUM7WUFDdEUsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDakMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNoQztTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0gsa0NBQVksR0FBWjtRQUNJLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMvQyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0MsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzlDLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBRXhDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNILDhCQUFRLEdBQVI7UUFDSSxJQUFHLElBQUksQ0FBQyxTQUFTLEVBQUM7WUFDZCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQVEsQ0FBQztZQUN0RSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFO2dCQUNqQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2pDO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxvQ0FBYyxHQUFkO1FBQUEsaUJBcUNDO1FBcENHLHNCQUFzQjtRQUN0QixrQkFBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFFOUIsU0FBUztRQUNULElBQUcsSUFBSSxDQUFDLFVBQVUsRUFBQztZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBNUIsQ0FBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUVELHNCQUFzQjtRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHO1lBQ2Qsb1BBQW9QO1NBQ3ZQLENBQUM7UUFFRixlQUFlO1FBQ2YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBRTFCLFNBQVM7UUFDVCxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7WUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7U0FDNUI7UUFFRCxXQUFXO1FBQ1gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLFNBQVM7UUFDVCxJQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7WUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDN0IsWUFBWTtZQUNaLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO2dCQUM5QixLQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQzVCLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBQyxLQUFJLENBQUMsU0FBUyxFQUFDLEtBQUksQ0FBQyxDQUFDO1lBQ3RFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtTQUM5QjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLDJDQUFxQixHQUE3QjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU87UUFFN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU8scUNBQWUsR0FBdkIsVUFBd0IsSUFBYTtRQUNqQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRWxDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDaEQsSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPO1FBRTVELElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FDWixDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQzlDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FDbEQsQ0FBQztRQUVGLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLElBQUksTUFBTTtZQUFFLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXhELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDMUIsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDM0IsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDekIsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDNUIsTUFBTSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztZQUN2QyxNQUFNLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssa0NBQVksR0FBcEI7UUFBQSxpQkF5Q0M7UUF4Q0csSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBQztZQUM5RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRTNELElBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUM7Z0JBQzFDLGNBQWM7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBRXhCLFlBQVk7Z0JBQ1osSUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDO29CQUN2QixLQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWlCO2dCQUUvQyxpQkFBaUI7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNILDBCQUEwQjtnQkFDMUIsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO29CQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUM7aUJBQ2xDO2dCQUVELGlCQUFpQjtnQkFDakIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztnQkFFMUIsUUFBUTtnQkFDUixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFFeEIsVUFBVTtnQkFDVixJQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBQztvQkFDOUMsSUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDO3dCQUN2QixLQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3hCLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCO29CQUU5QyxpQkFBaUI7b0JBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNqQztxQkFBTTtvQkFDSCw4QkFBOEI7aUJBQ2pDO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILCtCQUFTLEdBQVQ7UUFDSSxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO1lBQzNCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBRXJCLGNBQWM7UUFDZCxJQUFHLElBQUksQ0FBQyxlQUFlLEVBQUM7WUFDcEIsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztTQUMvQjtRQUVELFNBQVM7UUFDVCxJQUFHLElBQUksQ0FBQyxVQUFVLEVBQUM7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDbEM7UUFFRCxjQUFjO1FBQ2QsSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEU7UUFFRCxhQUFhO1FBQ2Isa0JBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzdCLGtCQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMvQixnQkFBZ0I7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0csd0NBQWtCLEdBQXhCOzs7Ozs7d0JBRVUsUUFBUSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDN0QsSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQzlCLHNCQUFPO3lCQUNWOzs7O3dCQUcrQixxQkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUE5RCxtQkFBbUIsR0FBRyxTQUF3Qzt3QkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFFaEQsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFOzRCQUM3RCxZQUFZOzRCQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQ0FDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dDQUM3QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7b0NBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztpQ0FDcEQ7cUNBQU07b0NBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lDQUNwQzs2QkFDSjtpQ0FBTTtnQ0FDSCxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NkJBQ25DOzRCQUNELHNCQUFPO3lCQUNWO3dCQUNELGVBQWU7d0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFFMUIsOEJBQThCO3dCQUM5QixJQUFJLG1CQUFtQixDQUFDLElBQUksS0FBSyxTQUFTLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTs0QkFFdkUsY0FBYyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs0QkFDaEYsSUFBSSxjQUFjLEtBQUssR0FBRyxFQUFFLEVBQUUsZ0JBQWdCO2dDQUMxQyx1QkFBdUI7Z0NBQ3ZCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFjLENBQUMsQ0FBQzs2QkFDbEU7eUJBQ0o7Ozs7d0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsT0FBSyxDQUFDLENBQUM7Ozs7OztLQUkzQztJQUVEOztPQUVHO0lBQ0csaUNBQVcsR0FBakIsVUFBa0IsS0FBYSxFQUFFLFFBQWdCO3VDQUFHLE9BQU87OztnQkFDakQsR0FBRyxHQUFHLDRDQUE0QyxDQUFDO2dCQUN6RCxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO3dCQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzVCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFFekQsR0FBRyxDQUFDLE1BQU0sR0FBRzs0QkFDVCxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dDQUN2QyxJQUFJO29DQUNBLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29DQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUNBQ2pCO2dDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUNSLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQ0FBYSxDQUFDLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztpQ0FDL0M7NkJBQ0o7aUNBQU07Z0NBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUFXLEdBQUcsQ0FBQyxNQUFRLENBQUMsQ0FBQyxDQUFDOzZCQUM5Qzt3QkFDTCxDQUFDLENBQUM7d0JBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQTNCLENBQTJCLENBQUM7d0JBQ2hELEdBQUcsQ0FBQyxTQUFTLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUEzQixDQUEyQixDQUFDO3dCQUVsRCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBRUQ7O09BRUc7SUFDSCxtQ0FBYSxHQUFiO1FBQ0ksWUFBWTtRQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDakM7UUFFRCx5QkFBeUI7UUFDekIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUUvQyxTQUFTO1FBQ1QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELDhCQUFRLEdBQVI7UUFDSSxVQUFVO1FBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQy9CLGNBQWM7UUFDZCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELG1DQUFhLEdBQWI7UUFDSSxPQUFPO1FBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxpQ0FBVyxHQUFYO1FBQ0ksT0FBTztRQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQWtCLEdBQWxCLFVBQW1CLFFBQWdCO1FBQy9CLGNBQWM7UUFDZCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxJQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBQztZQUMxQixTQUFTO1lBQ1QsSUFBRyxJQUFJLENBQUMsTUFBTSxFQUFDO2dCQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLHlDQUFTLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLDRDQUFTLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLDZCQUFNLENBQUM7YUFDcEg7WUFDRCxTQUFTO1lBQ1QsSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFDO2dCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNoQztTQUNKO0lBQ0wsQ0FBQztJQUVLLDhCQUFRLEdBQWQ7Ozs7Ozs2QkFFTyxJQUFJLENBQUMscUJBQXFCLEVBQTFCLHdCQUEwQjs7Ozt3QkFHZixRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUM5QyxxQkFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsRUFBQTs7d0JBQXpGLE1BQU0sR0FBRyxTQUFnRjt3QkFDL0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzdCLElBQUcsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBQzs0QkFDbEIsaUJBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQzs0QkFDckMsc0JBQU87eUJBQ1Y7d0JBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDbkIsY0FBYzs0QkFDZCxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ3ZELFNBQVM7NEJBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOzRCQUV2QixXQUFXOzRCQUNYLHFCQUFXLENBQUMsSUFBSSxDQUFDLCtDQUFVLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLDZCQUFNLENBQUMsQ0FBQzs0QkFFdEUsY0FBYzs0QkFDZCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO3lCQUNyQzs7Ozt3QkFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFLLENBQUMsQ0FBQzs7O3dCQWdCekMsT0FBTzt3QkFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Ozs7O0tBQ2pDO0lBR0Q7O09BRUc7SUFDRyxvQ0FBYyxHQUFwQixVQUFxQixLQUFhLEVBQUUsUUFBZ0IsRUFBRSxPQUFlO3VDQUFHLE9BQU87OztnQkFDckUsR0FBRyxHQUFHLCtDQUErQyxDQUFDO2dCQUM1RCxzQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO3dCQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzVCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFFekQsR0FBRyxDQUFDLE1BQU0sR0FBRzs0QkFDVCxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dDQUN2QyxJQUFJO29DQUNBLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29DQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUNBQ2pCO2dDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUNSLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQ0FBYSxDQUFDLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztpQ0FDL0M7NkJBQ0o7aUNBQU07Z0NBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUFXLEdBQUcsQ0FBQyxNQUFRLENBQUMsQ0FBQyxDQUFDOzZCQUM5Qzt3QkFDTCxDQUFDLENBQUM7d0JBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQTNCLENBQTJCLENBQUM7d0JBQ2hELEdBQUcsQ0FBQyxTQUFTLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUEzQixDQUEyQixDQUFDO3dCQUVsRCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBSUQ7OztPQUdHO0lBQ0YsMkNBQXFCLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ3BDLElBQUk7WUFDQSw2QkFBNkI7WUFDN0IsSUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QyxXQUFXO1lBQ1gsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFcEMsSUFBTSxLQUFLLEdBQVcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLElBQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzdDLGVBQWU7WUFDZixJQUFNLFVBQVUsR0FBVyxFQUFFLENBQUM7WUFDOUIsSUFBTSxZQUFZLEdBQVcsRUFBRSxDQUFDO1lBRWhDLGdCQUFnQjtZQUNoQixJQUFNLE9BQU8sR0FBVyxFQUFFLENBQUM7WUFDM0IsSUFBTSxTQUFTLEdBQVcsRUFBRSxDQUFDO1lBRTdCLHFCQUFxQjtZQUNyQixJQUFJLEtBQUssR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsRUFBRTtnQkFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPO2FBQ1Y7WUFFRCxpQkFBaUI7WUFDakIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDbkMsT0FBTzthQUNWO1lBRUQsYUFBYTtZQUNiLElBQUksS0FBSyxHQUFHLFVBQVUsSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLElBQUksT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFO2dCQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2pDLDhCQUE4QjtnQkFDOUIsaUJBQWMsQ0FBQyxJQUFJLENBQUMsdUhBQXVILENBQUMsQ0FBQztnQkFDN0ksU0FBUztnQkFDVCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDaEM7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbkM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBYSxHQUFiO1FBQ0ksSUFBRyxJQUFJLENBQUMsYUFBYSxFQUFDO1lBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFlLEdBQWY7UUFDSSxrQkFBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLGtCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFMUIsV0FBVztRQUNYLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsT0FBTyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7U0FDN0M7UUFFRCxTQUFTO1FBQ1QsSUFBRyxrQkFBUyxDQUFDLE9BQU8sRUFBQztZQUNqQixFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMxQzthQUFJO1lBQ0QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILHFDQUFlLEdBQWY7UUFDSSxrQkFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO1FBQzNDLGtCQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFNUIsV0FBVztRQUNYLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsU0FBUyxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7U0FDL0M7SUFDTCxDQUFDO0lBRUQsNEJBQU0sR0FBTjtRQUNJLHFCQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBUSxDQUFDO1lBQ3pFLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN2QjtpQkFBTTtnQkFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDakM7WUFDRCxPQUFPO1NBQ1Y7UUFDRCxxQkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsNEJBQU0sR0FBTjtRQUNHLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQztZQUNYLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFRLENBQUM7WUFDMUUsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDdkMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUM5QjtTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVELDhCQUFRLEdBQVI7UUFDRyxJQUFHLElBQUksQ0FBQyxTQUFTLEVBQUM7WUFDYixJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFRLENBQUM7WUFDdEYsSUFBSSxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pELG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO2FBQzlCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNoQztTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztJQUVELCtCQUFTLEdBQVQ7UUFDRyxJQUFHLElBQUksQ0FBQyxVQUFVLEVBQUM7WUFDZCxJQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFRLENBQUM7WUFDckYsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUU7Z0JBQy9DLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO2FBQzdCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNqQztTQUNKO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztJQTdtQ0Q7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztpREFDTTtJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNPO0lBRXpCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7bURBQ1E7SUFFM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzsrQ0FDSTtJQWdDdEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztrREFDTztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOytDQUNJO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0RBQ0s7SUFHdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ007SUFHeEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzsrQ0FDSTtJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUNRO0lBRzFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7NkNBQ0U7SUFHcEI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUdyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDOzRDQUNDO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7cURBQ1U7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzswREFDZTtJQUdsQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2dEQUNLO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7b0RBQ1U7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztrREFDTztJQUcxQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO3NEQUNXO0lBRy9CO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7eURBQ2U7SUFHakM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzttREFDUTtJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBSXhCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ1E7SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQztnREFDSztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7a0RBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUV6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO29EQUNTO0lBRzNCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7c0RBQ1c7SUFFN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzt5REFDYztJQUVoQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBRXhCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0RBQ0s7SUFFdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUV4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBRXhCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0RBQ0s7SUFFdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDTTtJQUV4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNPO0lBRXpCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7K0NBQ0k7SUFHdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzt3REFDYTtJQUUvQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNHO0lBRXJCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0c7SUFFckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNHO0lBRXJCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7OENBQ0c7SUFFckI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO2lEQUNNO0lBR3pCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7dURBQ1k7SUFFOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFDUztJQUczQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhDQUNHO0lBRXJCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ1E7SUFHMUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4Q0FDRztJQUVyQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2dEQUNLO0lBR3ZCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0RBQ0s7SUFFdkI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2lEQUNNO0lBRXhCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQ1E7SUFuTFQsV0FBVztRQUQvQixPQUFPO09BQ2EsV0FBVyxDQWduQy9CO0lBQUQsa0JBQUM7Q0FobkNELEFBZ25DQyxDQWhuQ3dDLEVBQUUsQ0FBQyxTQUFTLEdBZ25DcEQ7a0JBaG5Db0IsV0FBVyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIu+7v2ltcG9ydCBtR2FtZURhdGEgZnJvbSBcIi4uL0xvYWQvR2FtZURhdGFcIjtcclxuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gXCIuLi9Mb2FkL1RpcHNNYW5hZ2VyXCI7XHJcbmltcG9ydCBUaXBzV25kTWFuYWdlciBmcm9tIFwiLi4vTG9hZC9UaXBzV25kXCI7XHJcbmltcG9ydCB7IEFQUF9JRCB9IGZyb20gXCIuLi9Db21tb24vQXBwQ29uZmlnXCI7XHJcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gXCIuL1VzZXJEYXRhU3luY01hbmFnZXJcIjtcclxuaW1wb3J0IFN0YXRlQnJpZGdlIGZyb20gXCIuLi9nYW1lL1N0YXRlQnJpZGdlXCI7XHJcblxyXG5jb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2FkTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxyXG4gICAgQnRuU3RhcnQ6Y2MuQnV0dG9uID0gbnVsbDtcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBOTzE4UGFuZWw6Y2MuTm9kZSA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXHJcbiAgICB0aXBzX2xhYmVsOmNjLkxhYmVsID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgYnRuX3FkOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8vIOaYr+WQpuW3sue7j+aYvuekuui/h+S6jOWNgeeCueWbm+WNgeS6lOWIhueahOW8ueeql1xyXG4gICAgcHJpdmF0ZSBoYXNTaG93blRpbWVQb3B1cDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICAvLyDmnKzlnLDlrZjlgqhrZXlcclxuICAgIC8vIOW5tOm+hOeKtuaAgeWtmOWCqGtlee+8jDE95oiQ5bm05Lq677yM5YW25LuWPeacquaIkOW5tOS6ulxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBTVE9SQUdFX0tFWV9BR0VfU1RBVFVTID0gJ1NMU19BR0VfU1RBVFVTJztcclxuICAgIFxyXG4gICAgLy8g6Lef6Liq55So5oi35omL5Yqo6ZqQ6JePcmVjb3ZlclRpbWVyTGFiZWznmoTnirbmgIFcclxuICAgIC8vIOWIneWni+iuvue9ruS4unRydWXvvIznoa7kv51yZWNvdmVyVGltZXJMYWJlbOm7mOiupOaYr+makOiXj+eahFxyXG4gICAgcHJpdmF0ZSBpc1JlY292ZXJUaW1lck1hbnVhbGx5SGlkZGVuOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICAvLyDliafmg4XmlofmnKzmlbDnu4RcclxuICAgIHByaXZhdGUgc3RvcnlMaW5lczogc3RyaW5nW10gPSBbXTtcclxuICAgIC8vIOW9k+WJjeaYvuekuueahOihjOe0ouW8lVxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TGluZUluZGV4OiBudW1iZXIgPSAwO1xyXG4gICAgLy8g5paH5pys5pi+56S66Ze06ZqU5pe26Ze077yI56eS77yJXHJcbiAgICBwcml2YXRlIGxpbmVJbnRlcnZhbDogbnVtYmVyID0gMC41O1xyXG4gICAgLy8g5a2X56ym5pi+56S66Ze06ZqU5pe26Ze077yI56eS77yJXHJcbiAgICBwcml2YXRlIGNoYXJJbnRlcnZhbDogbnVtYmVyID0gMC4wNTtcclxuICAgIC8vIOW9k+WJjeihjOeahOWtl+espue0ouW8lVxyXG4gICAgcHJpdmF0ZSBjdXJyZW50Q2hhckluZGV4OiBudW1iZXIgPSAwO1xyXG4gICAgLy8g5paH5pys5pi+56S65a6a5pe25ZmoSUTmlbDnu4RcclxuICAgIHByaXZhdGUgdGV4dFRpbWVyczogYW55W10gPSBbXTtcclxuICAgIC8vIOi3s+i/h+aMiemSruWQr+eUqOWumuaXtuWZqElEXHJcbiAgICBwcml2YXRlIGp1bXBCdXR0b25UaW1lcjogYW55ID0gbnVsbDtcclxuICAgIFxyXG4gICAgLy8g6Ziy5rKJ6L+35qOA5p+l6Ze06ZqU5pe26Ze077yI56eS77yJXHJcbiAgICBwcml2YXRlIGFudGlBZGRpY3Rpb25JbnRlcnZhbDogbnVtYmVyID0gNTsgLy8g6buY6K6kNeenkuajgOafpeS4gOasoVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXHJcbiAgICBCdG5TdGFydDI6Y2MuQnV0dG9uID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxyXG4gICAgQnRuQkdNOmNjLkJ1dHRvbiA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5TaG9wOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgc2hvcFBhbmVsOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuUmFuazpjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bkNsb3NlOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGUpXHJcbiAgICB3ZWl4aW46Y2MuU3ByaXRlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHdlaXhpbk5vZGU6Y2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBTcE9uOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgU3BPZmY6Y2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkF1ZGlvQ2xpcClcclxuICAgIEJnbTpjYy5BdWRpb0NsaXAgPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXHJcbiAgICBzdGFtaW5hTGFiZWw6Y2MuTGFiZWwgPSBudWxsOyAvL+S9k+WKm+aYvuekuuagh+etvlxyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXHJcbiAgICByZWNvdmVyVGltZXJMYWJlbDpjYy5MYWJlbCA9IG51bGw7IC8v5oGi5aSN5YCS6K6h5pe25pi+56S65qCH562+XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgZ29sZF9sYjpjYy5MYWJlbCA9IG51bGw7IC8v5b2T5YmN6ZK755+z5pi+56S65qCH562+XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgc2hlbnBvTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgY3VyX2xldmVsOmNjLkxhYmVsID0gbnVsbDsgLy/lvZPliY3lhbPljaHmmL7npLrmoIfnrb5cclxuXHJcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxyXG4gICAgQnRuUmVzZXRMZXZlbDpjYy5CdXR0b24gPSBudWxsOyAvL+mHjee9ruWFs+WNoeaMiemSrlxyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGxldmVsU2VsZWN0UGFuZWw6IGNjLk5vZGUgPSBudWxsOyAvL+WFs+WNoemAieaLqeeVjOmdouiKgueCuVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIHVzZXJfbGFiZWw6Y2MuTGFiZWwgPSBudWxsOyAvL+W9k+WJjeeUqOaIt+WQjVxyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuUmVzZXQ6Y2MuTm9kZSA9IG51bGw7IC8v6YeN572u5oyJ6ZKuXHJcblxyXG4gICAgLy8g5Ymn5oOF5by556qX6IqC54K5XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIFN0b3J5X25vZGU6Y2MuTm9kZSA9IG51bGw7XHJcbiAgICAvLyDliafmg4XmlofmnKzoioLngrlcclxuICAgIEBwcm9wZXJ0eShjYy5SaWNoVGV4dClcclxuICAgIHJfc3Rvcnk6Y2MuUmljaFRleHQgPSBudWxsO1xyXG4gICAgLy8g6Lez6L+H5oyJ6ZKu6IqC54K5XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGJ0bl9qdW1wOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgcmFua1BhbmVsOmNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuQ2hhcmdlOmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBDaGFyZ2VQYW5lbDpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLznlYzpnaJcclxuICAgIFxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzZXR0aW5nc1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+iuvue9rumdouadv1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5DbG9zZVNldHRpbmdzOmNjLk5vZGUgPSBudWxsOyAvL+WFs+mXreiuvue9rumdouadv+aMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBtdXNpY0J0bjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PkuZDlvIDlhbPmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgbXVzaWNPbjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PkuZDlvIDlkK/nsr7ngbVcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgbXVzaWNPZmY6Y2MuTm9kZSA9IG51bGw7IC8v6Z+z5LmQ5YWz6Zet57K+54G1XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHNvdW5kQnRuOmNjLk5vZGUgPSBudWxsOyAvL+mfs+aViOW8gOWFs+aMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzb3VuZE9uOmNjLk5vZGUgPSBudWxsOyAvL+mfs+aViOW8gOWQr+eyvueBtVxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBzb3VuZE9mZjpjYy5Ob2RlID0gbnVsbDsgLy/pn7PmlYjlhbPpl63nsr7ngbVcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgVGlwc1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+W8ueeql1xyXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxyXG4gICAgTF90aXBzOmNjLkxhYmVsID0gbnVsbDsgLy8g5by556qX5paH5pysXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fY2xvc2VDaGFyZ2U6Y2MuTm9kZSA9IG51bGw7ICBcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuXzE6Y2MuTm9kZSA9IG51bGw7IC8v5YWF5YC85oyJ6ZKuMVxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fMjpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLzmjInpkq4yXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bl8zOmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrjNcclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuXzQ6Y2MuTm9kZSA9IG51bGw7IC8v5YWF5YC85oyJ6ZKuNFxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5fNTpjYy5Ob2RlID0gbnVsbDsgLy/lhYXlgLzmjInpkq41XHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bl82OmNjLk5vZGUgPSBudWxsOyAvL+WFheWAvOaMiemSrjZcclxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcclxuICAgIGdlbV90aXBzOmNjLkxhYmVsID0gbnVsbDsgLy8g5by556qX5paH5pysXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBUaXBzUGFuZWxDbG9zZTpjYy5Ob2RlID0gbnVsbDsgLy/lvLnnqpflhbPpl63mjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgVGlwc1BhbmVsT2s6Y2MuTm9kZSA9IG51bGw7IC8v5by556qX56Gu5a6a5oyJ6ZKuXHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5RSDpjYy5Ob2RlID0gbnVsbDsgLy/lvLrljJbmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgU2tpbGxQYW5lbDpjYy5Ob2RlID0gbnVsbDsgLy/lvLrljJblvLnnqpdcclxuICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bkNKOmNjLk5vZGUgPSBudWxsOyAvL+aIkOWwseaMiemSrlxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBDSlBhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+aIkOWwseW8ueeql1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuV2VlazpjYy5Ob2RlID0gbnVsbDsgLy/lkajlpZblirHmjInpkq5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgV2Vla1BhbmVsOmNjLk5vZGUgPSBudWxsOyAvL+WRqOWlluWKseW8ueeql1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgQnRuRGFpbHk6Y2MuTm9kZSA9IG51bGw7IC8v5pel5aWW5Yqx5oyJ6ZKuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIERhaWx5UGFuZWw6Y2MuTm9kZSA9IG51bGw7IC8v5pel5aWW5Yqx5by556qXXHJcbiAgICAvLyDlvZPliY3pgInmi6nnmoTlhYXlgLzpgInpoblcclxuICAgIHByaXZhdGUgY3VycmVudFJlY2hhcmdlT3B0aW9uOiB7cHJpY2U6IG51bWJlciwgZGlhbW9uZHM6IG51bWJlcn0gPSBudWxsO1xyXG4gICAgLy8g5YWF5YC86YWN572uXHJcbiAgICBwcml2YXRlIHJlY2hhcmdlQ29uZmlnID0ge1xyXG4gICAgICAgIDE6IHtwcmljZTogNiwgZGlhbW9uZHM6IDYwfSxcclxuICAgICAgICAyOiB7cHJpY2U6IDMwLCBkaWFtb25kczogMzAwfSxcclxuICAgICAgICAzOiB7cHJpY2U6IDY4LCBkaWFtb25kczogNjgwfSxcclxuICAgICAgICA0OiB7cHJpY2U6IDE5OCwgZGlhbW9uZHM6IDE5ODB9LFxyXG4gICAgICAgIDU6IHtwcmljZTogMzI4LCBkaWFtb25kczogMzI4MH0sXHJcbiAgICAgICAgNjoge3ByaWNlOiA2NDgsIGRpYW1vbmRzOiA2NDgwfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgb25Mb2FkICgpIHtcclxuICAgICAgICAvLyDov5vooYzpmLLmsonov7fmo4Dmn6VcclxuICAgICAgICB0aGlzLmNoZWNrQW50aUFkZGljdGlvbigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOiuvue9ruWumuacn+mYsuayiei/t+ajgOafpeWumuaXtuWZqFxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5jaGVja0FudGlBZGRpY3Rpb24sIHRoaXMuYW50aUFkZGljdGlvbkludGVydmFsKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLkdldERhdGEoKTtcclxuICAgICAgICB0aGlzLkdldFN0YW1pbmFEYXRhKCk7IC8vIOiOt+WPluS9k+WKm+aVsOaNrlxyXG4gICAgICAgIHRoaXMuQnRuU3RhcnQubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TdGFydEdhbWUsdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5TdGFydDIubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TdGFydEdhbWUyLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQkdNLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuQ2hlY2tCR00sdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5SYW5rLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dSYW5rLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQ2xvc2Uub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuSGlkZVJhbmssdGhpcyk7XHJcbiAgICAgICAgdGhpcy5CdG5TaG9wLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dTaG9wLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuUUgub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuU2hvd1FILHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuQ0oub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuU2hvd0NKLHRoaXMpO1xyXG4gICAgICAgIHRoaXMuQnRuV2Vlay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5TaG93V2Vlayx0aGlzKTtcclxuICAgICAgICB0aGlzLkJ0bkRhaWx5Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLlNob3dEYWlseSx0aGlzKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5CdG5SZXNldExldmVsKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5SZXNldExldmVsLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuUmVzZXRMZXZlbCx0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5CdG5SZXNldCl7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuUmVzZXQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuUmVzZXRBY2NvdW50LHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDkuLrpmLLmsonov7fmj5DnpLrpnaLmnb/nmoTnoa7lrprmjInpkq7mt7vliqDkuovku7bnm5HlkKxcclxuICAgICAgICB0aGlzLk5PMThQYW5lbC5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgIGlmKHRoaXMuYnRuX3FkKXtcclxuICAgICAgICAgICAgdGhpcy5idG5fcWQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMub25Db25maXJtTm8xOCx0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5YWF5YC855u45YWzXHJcbiAgICAgICAgaWYodGhpcy5CdG5DaGFyZ2Upe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bkNoYXJnZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5PbkNoYXJnZSx0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5CdG5fY2xvc2VDaGFyZ2Upe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bl9jbG9zZUNoYXJnZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5PbkNsb3NlQ2hhcmdlLHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5Li65YWF5YC85oyJ6ZKu5re75Yqg54K55Ye75LqL5Lu2XHJcbiAgICAgICAgaWYodGhpcy5CdG5fMSl7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuXzEub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uUmVjaGFyZ2VCdG5DbGljaygxKSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuQnRuXzIpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bl8yLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblJlY2hhcmdlQnRuQ2xpY2soMiksIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLkJ0bl8zKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5fMy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25SZWNoYXJnZUJ0bkNsaWNrKDMpLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5CdG5fNCl7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuXzQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uUmVjaGFyZ2VCdG5DbGljayg0KSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuQnRuXzUpe1xyXG4gICAgICAgICAgICB0aGlzLkJ0bl81Lm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblJlY2hhcmdlQnRuQ2xpY2soNSksIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLkJ0bl82KXtcclxuICAgICAgICAgICAgdGhpcy5CdG5fNi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25SZWNoYXJnZUJ0bkNsaWNrKDYpLCB0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMuVGlwc1BhbmVsQ2xvc2Upe1xyXG4gICAgICAgICAgICB0aGlzLlRpcHNQYW5lbENsb3NlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCx0aGlzLk9uQ2xvc2VUaXBzLHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLlRpcHNQYW5lbE9rKXtcclxuICAgICAgICAgICAgdGhpcy5UaXBzUGFuZWxPay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsdGhpcy5Pbk9rVGlwcyx0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMud2VpeGluTm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICBpZihtR2FtZURhdGEuaXNCR01Pbil7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuU3BPbi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLlNwT2ZmLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KHRoaXMuQmdtLHRydWUsMSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpn7PkuZDlvIDlp4vmkq3mlL4nKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgLy8gdGhpcy5TcE9uLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLlNwT2ZmLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWIneWni+WMluaXtuWPqumcgOimgeiwg+eUqOS4gOasoVVwZGF0ZVJlY292ZXJUaW1lckRpc3BsYXnvvIzlroPkvJrlpITnkIbmiYDmnInliJ3lp4vljJbmmL7npLpcclxuICAgICAgICB0aGlzLlVwZGF0ZVJlY292ZXJUaW1lckRpc3BsYXkoKTtcclxuICAgICAgICAvLyDorr7nva7ljZXkuKrlrprml7blmajvvIzmr4/np5Lmm7TmlrDkuIDmrKHlgJLorqHml7blkozmo4Dmn6XkvZPlipvmgaLlpI1cclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuVXBkYXRlUmVjb3ZlclRpbWVyRGlzcGxheSwgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Li6c3RhbWluYUxhYmVs5re75Yqg54K55Ye75LqL5Lu255uR5ZCs5Zmo77yM55So5LqO5YiH5o2icmVjb3ZlclRpbWVyTGFiZWznmoTlj6/op4HmgKdcclxuICAgICAgICBpZih0aGlzLnN0YW1pbmFMYWJlbCAmJiB0aGlzLnN0YW1pbmFMYWJlbC5ub2RlKXtcclxuICAgICAgICAgICAgdGhpcy5zdGFtaW5hTGFiZWwubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMudG9nZ2xlUmVjb3ZlclRpbWVyVmlzaWJpbGl0eSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOaYjuehruiuvue9rnJlY292ZXJUaW1lckxhYmVs55qE5Yid5aeL54q25oCB5Li66ZqQ6JePXHJcbiAgICAgICAgaWYodGhpcy5yZWNvdmVyVGltZXJMYWJlbCAmJiB0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUpe1xyXG4gICAgICAgICAgICB0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWIneWni+WMluiuvue9rumdouadv1xyXG4gICAgICAgIGlmKHRoaXMuc2V0dGluZ3NQYW5lbCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3NQYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Li66K6+572u6Z2i5p2/55u45YWz5oyJ6ZKu5re75Yqg5LqL5Lu255uR5ZCsXHJcbiAgICAgICAgaWYodGhpcy5CdG5DbG9zZVNldHRpbmdzKXtcclxuICAgICAgICAgICAgdGhpcy5CdG5DbG9zZVNldHRpbmdzLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5jbG9zZVNldHRpbmdzLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6Z+z5LmQ5byA5YWz54q25oCBXHJcbiAgICAgICAgaWYodGhpcy5tdXNpY0J0bil7XHJcbiAgICAgICAgICAgIHRoaXMubXVzaWNCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uTXVzaWNCdG5DbGljaywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMubXVzaWNPbiAmJiB0aGlzLm11c2ljT2ZmKXtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY09uLmFjdGl2ZSA9IG1HYW1lRGF0YS5pc0JHTU9uO1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljT2ZmLmFjdGl2ZSA9ICFtR2FtZURhdGEuaXNCR01PbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6Z+z5pWI5byA5YWz54q25oCBXHJcbiAgICAgICAgaWYodGhpcy5zb3VuZEJ0bil7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU291bmRCdG5DbGljaywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuc291bmRPbiAmJiB0aGlzLnNvdW5kT2ZmKXtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE9uLmFjdGl2ZSA9IG1HYW1lRGF0YS5pc1NvdW5kT247XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRPZmYuYWN0aXZlID0gIW1HYW1lRGF0YS5pc1NvdW5kT247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOabtOaWsOW9k+WJjeWFs+WNoeaYvuekulxyXG4gICAgICAgIHRoaXMudXBkYXRlTGV2ZWxEaXNwbGF5KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5pu05paw55So5oi35ZCN5pi+56S6XHJcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyRGlzcGxheSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOebkeWQrOmSu+efs+aVsOmHj+abtOaWsOS6i+S7tlxyXG4gICAgICAgIGNjLmRpcmVjdG9yLm9uKCdnb2xkVXBkYXRlZCcsIHRoaXMuVXBkYXRlR29sZExhYmVsLCB0aGlzKTtcclxuICAgICAgICBjYy5kaXJlY3Rvci5vbignc2hlbnBvVXBkYXRlZCcsIHRoaXMuVXBkYXRlU2hlbnBvTGFiZWwsIHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKG1HYW1lRGF0YS5zaG91bGRPcGVuTGV2ZWxTZWxlY3Qpe1xyXG4gICAgICAgICAgICBtR2FtZURhdGEuc2hvdWxkT3BlbkxldmVsU2VsZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuaYr+mmluasoeeZu+W9le+8iOWJp+aDheW8ueeql+acquaYvuekuui/h++8ie+8jOWmguaenOaYr+WImeaYvuekuuWJp+aDheW8ueeql1xyXG4gICAgICAgIGlmICghbUdhbWVEYXRhLmlzU3RvcnlQb3B1cFNob3duKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mmluasoeeZu+W9le+8jOaYvuekuuWJp+aDheW8ueeqlycpO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRTdG9yeVBvcHVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCl7XHJcbiAgICAgICAgLy8gaWYobUdhbWVEYXRhLmlzQkdNT24pe1xyXG4gICAgICAgIC8vICAgICB0aGlzLlNwT24uYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgdGhpcy5TcE9mZi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAvLyAgICAgY2MuYXVkaW9FbmdpbmUucGxheSh0aGlzLkJnbSxmYWxzZSwxKTtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ+mfs+S5kOW8gOWni+aSreaUvicpO1xyXG4gICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgIC8vICAgICB0aGlzLlNwT24uYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuU3BPZmYuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG4gICAgb25EZXN0cm95KCl7XHJcbiAgICAgICAgY2MuZGlyZWN0b3Iub2ZmKCdnb2xkVXBkYXRlZCcsIHRoaXMuVXBkYXRlR29sZExhYmVsLCB0aGlzKTtcclxuICAgICAgICBjYy5kaXJlY3Rvci5vZmYoJ3NoZW5wb1VwZGF0ZWQnLCB0aGlzLlVwZGF0ZVNoZW5wb0xhYmVsLCB0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0VGltZXJzLmZvckVhY2godGltZXJJZCA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRleHRUaW1lcnMgPSBbXTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5qdW1wQnV0dG9uVGltZXIpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5qdW1wQnV0dG9uVGltZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmp1bXBCdXR0b25UaW1lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvIDlp4vmuLjmiI/vvIzngrnlh7vkuovku7ZcclxuICAgICAqL1xyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bkvZPlipvmlbDmja5cclxuICAgICAqL1xyXG4gICAgR2V0U3RhbWluYURhdGEoKXtcclxuICAgICAgICBtR2FtZURhdGEuR2V0U3RhbWluYURhdGEoKTtcclxuICAgICAgICAvLyDojrflj5bpkrvnn7PmlbDmja5cclxuICAgICAgICBtR2FtZURhdGEuR2V0R29sZERhdGEoKTtcclxuICAgICAgICAvLyDojrflj5bpgZPlhbflupPlrZjmlbDmja5cclxuICAgICAgICBtR2FtZURhdGEuR2V0SXRlbVN0b2NrRGF0YSgpO1xyXG4gICAgICAgIC8vIOabtOaWsOmSu+efs+aYvuekulxyXG4gICAgICAgIHRoaXMuVXBkYXRlR29sZExhYmVsKCk7XHJcbiAgICAgICAgdGhpcy5VcGRhdGVTaGVucG9MYWJlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIEdldExldmVsRGF0YSgpe1xyXG4gICAgICAgIG1HYW1lRGF0YS5HZXRMZXZlbERhdGEoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDmgaLlpI3lgJLorqHml7bmmL7npLpcclxuICAgICAqL1xyXG4gICAgVXBkYXRlUmVjb3ZlclRpbWVyRGlzcGxheSgpe1xyXG4gICAgICAgIC8vIOWFiOajgOafpeS9k+WKm+aBouWkjVxyXG4gICAgICAgIG1HYW1lRGF0YS5DaGVja0FuZFJlY292ZXJTdGFtaW5hKCk7XHJcbiAgICAgICAgLy8g5pu05paw5L2T5Yqb5pi+56S6XHJcbiAgICAgICAgdGhpcy5VcGRhdGVTdGFtaW5hTGFiZWwoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmo4Dmn6XkvZPlipvmmK/lkKblt7Lmu6FcclxuICAgICAgICBjb25zdCBpc1N0YW1pbmFGdWxsID0gbUdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hID49IG1HYW1lRGF0YS5tYXhTdGFtaW5hO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMucmVjb3ZlclRpbWVyTGFiZWwpe1xyXG4gICAgICAgICAgICBpZihpc1N0YW1pbmFGdWxsKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjb3ZlclRpbWVyTGFiZWwuc3RyaW5nID0gXCLkvZPlipvlt7Lmu6FcIjtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyDkvZPlipvmnKrmu6Hml7bvvIzmm7TmlrDlgJLorqHml7bmlofmnKzlhoXlrrlcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVTdHJpbmcgPSBtR2FtZURhdGEuR2V0Rm9ybWF0dGVkUmVjb3ZlclRpbWUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjb3ZlclRpbWVyTGFiZWwuc3RyaW5nID0gYOS4i+asoeS9k+WKm+aBouWkje+8miR7dGltZVN0cmluZ31gO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDmoLnmja7nlKjmiLfmiYvliqjpmpDol4/nirbmgIHlhrPlrprmmK/lkKbmmL7npLpcclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmlzUmVjb3ZlclRpbWVyTWFudWFsbHlIaWRkZW4pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb3ZlclRpbWVyTGFiZWwubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOS4u+eVjOmdouW9k+WJjeWFs+WNoeaYvuekulxyXG4gICAgICovXHJcbiAgICB1cGRhdGVMZXZlbERpc3BsYXkoKXtcclxuICAgICAgICBpZih0aGlzLmN1cl9sZXZlbCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyX2xldmVsLnN0cmluZyA9ICfmnIDov5zot53nprvvvJonICsgdGhpcy5fZ2V0V2FycmlvclJ1bkJlc3REaXN0YW5jZSgpICsgJ+exs+OAgic7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Li755WM6Z2iY3VyX2xldmVs5qCH562+5pyq6LWL5YC8Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFdhcnJpb3JSdW5CZXN0RGlzdGFuY2UoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICAgICAgY29uc3Qgc2NvcGVkS2V5ID0gdXNlcklkID8gJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2VfJyArIHVzZXJJZCA6ICdXYXJyaW9yUnVuQmVzdERpc3RhbmNlJztcclxuICAgICAgICBjb25zdCByYXcgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oc2NvcGVkS2V5KSB8fCBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2UnKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIocmF3KSB8fCAwKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOeUqOaIt+WQjeaYvuekulxyXG4gICAgICovXHJcbiAgICB1cGRhdGVVc2VyRGlzcGxheSgpe1xyXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgICAgICBpZih0aGlzLnVzZXJfbGFiZWwpe1xyXG4gICAgICAgICAgICBpZih1c2VySWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyX2xhYmVsLnN0cmluZyA9ICfnjqnlrrYnICsgdXNlcklkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyX2xhYmVsLnN0cmluZyA9ICfmnKrnmbvlvZUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Li755WM6Z2idXNlcl9sYWJlbOagh+etvuacqui1i+WAvCEnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6YeN572u5YWz5Y2h6L+b5bqmXHJcbiAgICAgKi9cclxuICAgIFJlc2V0TGV2ZWwoKXsgICAgICAgIFxyXG4gICAgICAgIC8vIOiwg+eUqEdhbWVEYXRh5Lit55qE6YeN572u5pa55rOVXHJcbiAgICAgICAgbUdhbWVEYXRhLnJlc2V0TGV2ZWxQcm9ncmVzcygpO1xyXG4gICAgICAgIC8vIOabtOaWsOS4u+eVjOmdouWFs+WNoeaYvuekulxyXG4gICAgICAgIHRoaXMudXBkYXRlTGV2ZWxEaXNwbGF5KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yi35paw5YWz5Y2h6YCJ5oup55WM6Z2i77yI5aaC5p6c5a2Y5Zyo77yJXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+WFs+WNoei/m+W6puW3sumHjee9ru+8jOW9k+WJjeWFs+WNoTonLCBtR2FtZURhdGEuY3VycmVudExldmVsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDku4Xmm7TmlrDkvZPlipvmoIfnrb7mmL7npLpcclxuICAgICAqL1xyXG4gICAgVXBkYXRlU3RhbWluYUxhYmVsKCl7XHJcbiAgICAgICAgaWYodGhpcy5zdGFtaW5hTGFiZWwpe1xyXG4gICAgICAgICAgICB0aGlzLnN0YW1pbmFMYWJlbC5zdHJpbmcgPSBgJHttR2FtZURhdGEuY3VycmVudFN0YW1pbmF9LyR7bUdhbWVEYXRhLm1heFN0YW1pbmF9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5YiH5o2icmVjb3ZlclRpbWVyTGFiZWznmoTlj6/op4HmgKdcclxuICAgICAqL1xyXG4gICAgdG9nZ2xlUmVjb3ZlclRpbWVyVmlzaWJpbGl0eSgpe1xyXG4gICAgICAgIGlmKHRoaXMucmVjb3ZlclRpbWVyTGFiZWwgJiYgdGhpcy5yZWNvdmVyVGltZXJMYWJlbC5ub2RlKXtcclxuICAgICAgICAgICAgLy8g5YiH5o2icmVjb3ZlclRpbWVyTGFiZWznmoTlj6/op4HmgKdcclxuICAgICAgICAgICAgdGhpcy5yZWNvdmVyVGltZXJMYWJlbC5ub2RlLmFjdGl2ZSA9ICF0aGlzLnJlY292ZXJUaW1lckxhYmVsLm5vZGUuYWN0aXZlO1xyXG4gICAgICAgICAgICAvLyDmm7TmlrDmiYvliqjpmpDol4/nirbmgIFcclxuICAgICAgICAgICAgdGhpcy5pc1JlY292ZXJUaW1lck1hbnVhbGx5SGlkZGVuID0gIXRoaXMucmVjb3ZlclRpbWVyTGFiZWwubm9kZS5hY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOWFheWAvOeVjOmdoumSu+efs+aYvuekulxyXG4gICAgICovXHJcbiAgICB1cGRhdGVHZW1UaXBzKCl7XHJcbiAgICAgICAgaWYodGhpcy5nZW1fdGlwcyl7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VtX3RpcHMuc3RyaW5nID0gYCR7bUdhbWVEYXRhLmN1cnJlbnRHb2xkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOmSu+efs+agh+etvuaYvuekulxyXG4gICAgICovXHJcbiAgICBVcGRhdGVHb2xkTGFiZWwoKXtcclxuICAgICAgICBpZih0aGlzLmdvbGRfbGIpe1xyXG4gICAgICAgICAgICB0aGlzLmdvbGRfbGIuc3RyaW5nID0gYCR7bUdhbWVEYXRhLmN1cnJlbnRHb2xkfWA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjdXJyZW50R29sZDonLCBtR2FtZURhdGEuY3VycmVudEdvbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlkIzml7bmm7TmlrDlhYXlgLznlYzpnaLnmoTpkrvnn7PmmL7npLpcclxuICAgICAgICB0aGlzLnVwZGF0ZUdlbVRpcHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBVcGRhdGVTaGVucG9MYWJlbCgpe1xyXG4gICAgICAgIGlmKCF0aGlzLnNoZW5wb0xhYmVsKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNoZW5wb0xhYmVsLnN0cmluZyA9IGAke1N0YXRlQnJpZGdlLmdldFNoZW5wbygpfWA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFN0YXJ0R2FtZSgpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRFbmRsZXNzUnVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgU3RhcnRHYW1lMigpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRFbmRsZXNzUnVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRFbmRsZXNzUnVuKCl7XHJcbiAgICAgICAgU3RhdGVCcmlkZ2Uuc3luY0ZvclN0YXJ0U2NlbmUoKTtcclxuICAgICAgICBpZighbUdhbWVEYXRhLkhhc0Vub3VnaFN0YW1pbmEoKSl7XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+S9k+WKm+S4jei2s++8jOaXoOazleW8gOWni+a4uOaIj+OAgicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFTdGF0ZUJyaWRnZS5jb25zdW1lU3RhbWluYSgpKXtcclxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn5L2T5Yqb5LiN6Laz77yM5peg5rOV5byA5aeL5ri45oiP44CCJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbUdhbWVEYXRhLmlzSW5maW5pdGVNb2RlID0gdHJ1ZTtcclxuICAgICAgICBtR2FtZURhdGEuc2hvdWxkT3BlbkxldmVsU2VsZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdXYXJyaW9yUnVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlbkxldmVsU2VsZWN0UGFuZWwoKXtcclxuICAgICAgICB0aGlzLnN0YXJ0RW5kbGVzc1J1bigpO1xyXG4gICAgfVxyXG4gICAgU2hvd1Nob3AoKXtcclxuICAgICAgICBpZih0aGlzLnNob3BQYW5lbCl7XHJcbiAgICAgICAgICAgIGNvbnN0IHNob3BNYW5hZ2VyID0gdGhpcy5zaG9wUGFuZWwuZ2V0Q29tcG9uZW50KCdTaG9wTWFuYWdlcicpIGFzIGFueTtcclxuICAgICAgICAgICAgaWYgKHNob3BNYW5hZ2VyICYmIHNob3BNYW5hZ2VyLnNob3cpIHtcclxuICAgICAgICAgICAgICAgIHNob3BNYW5hZ2VyLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvcFBhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5ZWG5bqX55WM6Z2i6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOaJk+W8gOiuvue9rumdouadv++8jOeCueWHu+S6i+S7tlxyXG4gICAgICovXHJcbiAgICBDaGVja0JHTSgpe1xyXG4gICAgICAgIGlmKHRoaXMuc2V0dGluZ3NQYW5lbCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3NQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW+ruS/oeWtmOWCqOeahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBHZXREYXRhKCl7XHJcbiAgICAgICAgaWYoY2Muc3lzLnBsYXRmb3JtICE9IGNjLnN5cy5XRUNIQVRfR0FNRSl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgICAgICBjb25zdCBiZXN0U2NvcmVLZXkgPSB1c2VySWQgPyBgJHttR2FtZURhdGEuQmVzdFNjb3JlS2V5fV8ke3VzZXJJZH1gIDogbUdhbWVEYXRhLkJlc3RTY29yZUtleTtcclxuICAgICAgICBcclxuICAgICAgICAod2luZG93IGFzIGFueSkud3guZ2V0U3RvcmFnZSh7XHJcbiAgICAgICAgICAgIGtleTpiZXN0U2NvcmVLZXksXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6ZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5CZXN0U2NvcmUgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlvq7kv6HliIbkuqtcclxuICAgICAqL1xyXG4gICAgd3hTaGFyZSgpe1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5omT5byA5o6S6KGM5qacXHJcbiAgICAgKi9cclxuICAgIFNob3dSYW5rKCl7XHJcbiAgICAgICAgaWYodGhpcy5yYW5rUGFuZWwpe1xyXG4gICAgICAgICAgICBjb25zdCByYW5rTWFuYWdlciA9IHRoaXMucmFua1BhbmVsLmdldENvbXBvbmVudCgnUmFua01hbmFnZXInKSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmIChyYW5rTWFuYWdlciAmJiByYW5rTWFuYWdlci5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICByYW5rTWFuYWdlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmtQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aOkuihjOamnOeVjOmdouiKgueCueacquiuvue9ricpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6YeN572u6LSm5Y+377yM5YiH5o2i6LSm5Y+3XHJcbiAgICAgKi9cclxuICAgIFJlc2V0QWNjb3VudCgpe1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnU0xTX1VTRVJOQU1FJyk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdTTFNfUEFTU1dPUkQnKTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdTTFNfUkVBTE5BTUUnLCAnZmFsc2UnKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+i0puWPt+S/oeaBr+W3sua4hemZpO+8jOWunuWQjeiupOivgeS/oeaBr+S/neeVme+8jOi3s+i9rOWIsOeZu+W9leeVjOmdoicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnTG9hZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWz6Zet5b6u5L+h5o6S6KGM5qacXHJcbiAgICAgKi9cclxuICAgIEhpZGVSYW5rKCl7XHJcbiAgICAgICAgaWYodGhpcy5yYW5rUGFuZWwpe1xyXG4gICAgICAgICAgICBjb25zdCByYW5rTWFuYWdlciA9IHRoaXMucmFua1BhbmVsLmdldENvbXBvbmVudCgnUmFua01hbmFnZXInKSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmIChyYW5rTWFuYWdlciAmJiByYW5rTWFuYWdlci5oaWRlKSB7XHJcbiAgICAgICAgICAgICAgICByYW5rTWFuYWdlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmtQYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJbliafmg4XlvLnnqpdcclxuICAgICAqL1xyXG4gICAgaW5pdFN0b3J5UG9wdXAoKXtcclxuICAgICAgICAvLyDorr7nva7muLjmiI/nirbmgIHkuLrmnKrlvIDlp4vvvIzpmLvmraLmuLjmiI/pgLvovpHmiafooYxcclxuICAgICAgICBtR2FtZURhdGEuaXNHYW1lQmVnaW4gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmmL7npLrliafmg4XlvLnnqpdcclxuICAgICAgICBpZih0aGlzLlN0b3J5X25vZGUpe1xyXG4gICAgICAgICAgICB0aGlzLlN0b3J5X25vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5maXRTdG9yeVBvcHVwVG9TY3JlZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4gdGhpcy5maXRTdG9yeVBvcHVwVG9TY3JlZW4oKSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWIneWni+WMluWJp+aDheaWh+acrOaVsOe7hO+8iOekuuS+i+S4uuWNgeWHoOihjOaWh+acrO+8iVxyXG4gICAgICAgIHRoaXMuc3RvcnlMaW5lcyA9IFtcclxuICAgICAgICAgICAgXCLmm77lh6DkvZXml7bvvIzov5nniYfovr3pmJTlpKfpmYblronlroHnpaXlkozvvIzln47pgqbmnpfnq4vjgIHnlJ/ngbXlronlsYXkuZDkuJrjgILkuIDlnLrlkI3kuLrjgIzomZrnqbrni4Lmva7jgI3nmoTlvILnlYzngb7kubHlh63nqbrniIblj5HvvIzpu5Hpm77mkpXoo4LlpKflnLDvvIzml6DmlbDprZTnianku47oo4LpmpnkuK3mtozlh7rvvIzkuIDluqfluqfln47msaDmjqXov57msqbpmbfjgILlrojmiqTlm5vmlrnnmoTov5zlvoHljavpmJ/lhajlhpvopobmsqHvvIzlj6TogIHnpZ7mrr/ljJbkuLrmlq3lo4HmrovlnqPjgILlpoLku4rvvIzkvaDmmK/ov5nniYflpKfpmYbku4XlrZjnmoTli4fogIXvvIzmmK/mlofmmI7mnIDlkI7nmoTluIzmnJvjgILkvaDlraTouqvouI/kuIrml6DlsL3lvoHpgJTvvIzouqvlkI7mmK/lpKfpmYbmnIDlkI7kuIDniYfmnKrooqvprZTniankvrXmn5PnmoTlh4DlnJ/vvJvliY3mlrnliY3ot6/pgY3luIPprZTnianvvIzmiJDnvqTmgKrnianlsYLlsYLlm7TloLXvvIzml6nlt7LpgIDml6Dlj6/pgIDjgILliY3ooYzkuI3lj6rkuLroh6rkv53msYLnlJ/vvIzmm7TkuLrlrojmiqTkuJbpl7TmrovlrZjnmoTnlJ/mnLrjgILlnKjov5nlnLrlpYflubvpl6/lhbPlhpLpmankuK3vvIzmj6HntKfmrablmajlhrLnoLTprZTnianlsIHplIHvvIzku6Xli4fmsJTliojlvIDpu5HmmpfvvIzotbDlrozlsZ7kuo7kvaDnmoTli4flo6vlvoHpgJTvvIFcIixcclxuICAgICAgICBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOmHjee9ruW9k+WJjeihjOe0ouW8leWSjOWtl+espue0ouW8lVxyXG4gICAgICAgIHRoaXMuY3VycmVudExpbmVJbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhckluZGV4ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmuIXnqbrlvZPliY3mlofmnKxcclxuICAgICAgICBpZih0aGlzLnJfc3Rvcnkpe1xyXG4gICAgICAgICAgICB0aGlzLnJfc3Rvcnkuc3RyaW5nID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5byA5aeL6YCQ6KGM5pi+56S65paH5pysXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dExpbmUoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDnpoHnlKjot7Pov4fmjInpkq5cclxuICAgICAgICBpZih0aGlzLmJ0bl9qdW1wKXtcclxuICAgICAgICAgICAgdGhpcy5idG5fanVtcC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gM+enkuWQjuWQr+eUqOi3s+i/h+aMiemSrlxyXG4gICAgICAgICAgICB0aGlzLmp1bXBCdXR0b25UaW1lciA9IHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMuYnRuX2p1bXAuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnRuX2p1bXAub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuc2tpcFN0b3J5LHRoaXMpO1xyXG4gICAgICAgICAgICB9LCAzMDAwKTsgLy8gc2V0VGltZW91dOS9v+eUqOavq+enklxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpdCBzdG9yeSBwb3B1cCBiYWNrZ3JvdW5kcyB0byBjdXJyZW50IENhbnZhcyBzaXplLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZpdFN0b3J5UG9wdXBUb1NjcmVlbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuU3Rvcnlfbm9kZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmZpdE5vZGVUb1BhcmVudCh0aGlzLlN0b3J5X25vZGUpO1xyXG4gICAgICAgIHRoaXMuZml0Tm9kZVRvUGFyZW50KHRoaXMuU3Rvcnlfbm9kZS5nZXRDaGlsZEJ5TmFtZSgnc3RvcnlfYmcnKSk7XHJcbiAgICAgICAgdGhpcy5maXROb2RlVG9QYXJlbnQodGhpcy5TdG9yeV9ub2RlLmdldENoaWxkQnlOYW1lKCdiZWlqaW5nMycpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpdE5vZGVUb1BhcmVudChub2RlOiBjYy5Ob2RlKSB7XHJcbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLnBhcmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJlbnRTaXplID0gbm9kZS5wYXJlbnQuZ2V0Q29udGVudFNpemUoKTtcclxuICAgICAgICBpZiAocGFyZW50U2l6ZS53aWR0aCA8PSAwIHx8IHBhcmVudFNpemUuaGVpZ2h0IDw9IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZShwYXJlbnRTaXplKTtcclxuICAgICAgICBub2RlLnNldFBvc2l0aW9uKFxyXG4gICAgICAgICAgICAoMC41IC0gbm9kZS5wYXJlbnQuYW5jaG9yWCkgKiBwYXJlbnRTaXplLndpZHRoLFxyXG4gICAgICAgICAgICAoMC41IC0gbm9kZS5wYXJlbnQuYW5jaG9yWSkgKiBwYXJlbnRTaXplLmhlaWdodFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgaWYgKHNwcml0ZSkgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuXHJcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gbm9kZS5nZXRDb21wb25lbnQoY2MuV2lkZ2V0KTtcclxuICAgICAgICBpZiAod2lkZ2V0KSB7XHJcbiAgICAgICAgICAgIHdpZGdldC5pc0FsaWduTGVmdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldC5pc0FsaWduUmlnaHQgPSB0cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQuaXNBbGlnblRvcCA9IHRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldC5pc0FsaWduQm90dG9tID0gdHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmlzQWxpZ25Ib3Jpem9udGFsQ2VudGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHdpZGdldC5pc0FsaWduVmVydGljYWxDZW50ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmxlZnQgPSAwO1xyXG4gICAgICAgICAgICB3aWRnZXQucmlnaHQgPSAwO1xyXG4gICAgICAgICAgICB3aWRnZXQudG9wID0gMDtcclxuICAgICAgICAgICAgd2lkZ2V0LmJvdHRvbSA9IDA7XHJcbiAgICAgICAgICAgIHdpZGdldC51cGRhdGVBbGlnbm1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6YCQ6KGM6YCQ5a2X5pi+56S65Ymn5oOF5paH5pysXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2hvd05leHRMaW5lKCl7XHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50TGluZUluZGV4IDwgdGhpcy5zdG9yeUxpbmVzLmxlbmd0aCAmJiB0aGlzLnJfc3Rvcnkpe1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50TGluZSA9IHRoaXMuc3RvcnlMaW5lc1t0aGlzLmN1cnJlbnRMaW5lSW5kZXhdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50Q2hhckluZGV4IDwgY3VycmVudExpbmUubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIC8vIOaYvuekuuW9k+WJjeihjOeahOS4i+S4gOS4quWtl+esplxyXG4gICAgICAgICAgICAgICAgdGhpcy5yX3N0b3J5LnN0cmluZyArPSBjdXJyZW50TGluZS5jaGFyQXQodGhpcy5jdXJyZW50Q2hhckluZGV4KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDosIPluqbmmL7npLrkuIvkuIDkuKrlrZfnrKZcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dOZXh0TGluZSgpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5jaGFySW50ZXJ2YWwgKiAxMDAwKTsgLy8gc2V0VGltZW91dOS9v+eUqOavq+enklxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDlrZjlgqjlrprml7blmahJRO+8jOS7peS+v+WQjue7rea4hemZpFxyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0VGltZXJzLnB1c2godGltZXJJZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlvZPliY3ooYzmmL7npLrlrozmiJDvvIzmt7vliqDmjaLooYznrKbvvIjlpoLmnpzkuI3mmK/mnIDlkI7kuIDooYzvvIlcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudExpbmVJbmRleCA8IHRoaXMuc3RvcnlMaW5lcy5sZW5ndGggLSAxKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJfc3Rvcnkuc3RyaW5nICs9IFwiPGJyLz5cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g6YeN572u5a2X56ym57Si5byV77yM5YeG5aSH5pi+56S65LiL5LiA6KGMXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFySW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDlop7liqDooYzntKLlvJVcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudExpbmVJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDosIPluqbmmL7npLrkuIvkuIDooYxcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudExpbmVJbmRleCA8IHRoaXMuc3RvcnlMaW5lcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93TmV4dExpbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLmxpbmVJbnRlcnZhbCAqIDUwMCk7IC8vIHNldFRpbWVvdXTkvb/nlKjmr6vnp5JcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWtmOWCqOWumuaXtuWZqElE77yM5Lul5L6/5ZCO57ut5riF6ZmkXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXh0VGltZXJzLnB1c2godGltZXJJZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaJgOacieaWh+acrOaYvuekuuWujOaIkOWQjuS/neaMgeW8ueeql++8jOetieW+heeOqeWutuaJi+WKqOeCueWHu+i3s+i/h+aMiemSruOAglxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOi3s+i/h+WJp+aDhVxyXG4gICAgICovXHJcbiAgICBza2lwU3RvcnkoKXtcclxuICAgICAgICAvLyDmuIXpmaTmiYDmnIlKYXZhU2NyaXB05a6a5pe25ZmoXHJcbiAgICAgICAgdGhpcy50ZXh0VGltZXJzLmZvckVhY2godGltZXJJZCA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRleHRUaW1lcnMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmuIXpmaTot7Pov4fmjInpkq7lkK/nlKjlrprml7blmahcclxuICAgICAgICBpZih0aGlzLmp1bXBCdXR0b25UaW1lcil7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmp1bXBCdXR0b25UaW1lcik7XHJcbiAgICAgICAgICAgIHRoaXMuanVtcEJ1dHRvblRpbWVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6ZqQ6JeP5Ymn5oOF5by556qXXHJcbiAgICAgICAgaWYodGhpcy5TdG9yeV9ub2RlKXtcclxuICAgICAgICAgICAgdGhpcy5TdG9yeV9ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDnp7vpmaTot7Pov4fmjInpkq7nmoTngrnlh7vkuovku7ZcclxuICAgICAgICBpZih0aGlzLmJ0bl9qdW1wKXtcclxuICAgICAgICAgICAgdGhpcy5idG5fanVtcC5vZmYoY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMuc2tpcFN0b3J5LHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDorr7nva7muLjmiI/nirbmgIHkuLrlt7LlvIDlp4tcclxuICAgICAgICBtR2FtZURhdGEuaXNHYW1lQmVnaW4gPSB0cnVlO1xyXG4gICAgICAgIG1HYW1lRGF0YS5zZXRTdG9yeVBvcHVwU2hvd24oKTtcclxuICAgICAgICAvLyDlm57liLDkuLvnlYzpnaLvvIzkuI3liqDovb3muLjmiI/lnLrmma9cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmYsuayiei/t+ajgOafpVxyXG4gICAgICovXHJcbiAgICBhc3luYyBjaGVja0FudGlBZGRpY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g6I635Y+W5pys5Zyw5a2Y5YKo55qE55So5oi35ZCNXHJcbiAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSTkFNRScpO1xyXG4gICAgICAgIGlmICghdXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+acquaJvuWIsOeUqOaIt+WQje+8jOi3s+i/h+mYsuayiei/t+ajgOafpScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFudGlBZGRpY3Rpb25SZXN1bHQgPSBhd2FpdCB0aGlzLlBvc3RCcmVhdGhlKEFQUF9JRCwgdXNlcm5hbWUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuS4u+eVjOmdoumYsuayiei/t+ajgOafpee7k+aenDpcIiwgYW50aUFkZGljdGlvblJlc3VsdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoYW50aUFkZGljdGlvblJlc3VsdC5kYXRhICYmIGFudGlBZGRpY3Rpb25SZXN1bHQuY29kZSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIOaYvuekuumYsuayiei/t+aPkOekuumdouadv1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuTk8xOFBhbmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5OTzE4UGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50aXBzX2xhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGlwc19sYWJlbC5zdHJpbmcgPSBhbnRpQWRkaWN0aW9uUmVzdWx0Lm1zZztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0aXBzX2xhYmVs6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdOTzE4UGFuZWzoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDpmLLmsonov7fmo4Dmn6XpgJrov4fvvIznu6fnu63muLjmiI9cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+S4u+eVjOmdoumYsuayiei/t+ajgOafpemAmui/hycpO1xyXG5cclxuICAgICAgICAgICAgLy8g5qOA5p+l6L+U5Zue55qE5pe26Ze05piv5ZCm5Yiw6L6+5LqM5Y2B54K55Zub5Y2B5LqU5YiG77yI5LuF5pyq5oiQ5bm05Lq65qOA5rWL77yJXHJcbiAgICAgICAgICAgIGlmIChhbnRpQWRkaWN0aW9uUmVzdWx0LmRhdGEgIT09IHVuZGVmaW5lZCAmJiBhbnRpQWRkaWN0aW9uUmVzdWx0LmRhdGEgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIOivu+WPluW5tOm+hOeKtuaAge+8jOS7heacquaIkOW5tOS6uuaJp+ihjOajgOa1i1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZWRBZ2VTdGF0dXMgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9BR0VfU1RBVFVTKTtcclxuICAgICAgICAgICAgICAgIGlmIChzYXZlZEFnZVN0YXR1cyAhPT0gJzEnKSB7IC8vIDE95oiQ5bm05Lq677yM5YW25LuWPeacquaIkOW5tOS6ulxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWQjuerr+aYjuehrui/lOWbnjEw5L2N5pWw5pWw5a2X5pe26Ze05oiz77yM55u05o6l5Lyg6YCSXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1RpbWVBbmRTaG93UG9wdXAoYW50aUFkZGljdGlvblJlc3VsdC5kYXRhIGFzIG51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5Li755WM6Z2i6Ziy5rKJ6L+35qOA5p+l5aSx6LSlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIC8vIFRpcHNNYW5hZ2VyLnNob3coJ+mYsuayiei/t+ajgOafpeWksei0pe+8jOivt+mHjeivlScpO1xyXG4gICAgICAgICAgICAvLyDlj6/ku6XpgInmi6nkuI3pmLvmraLmuLjmiI/vvIzkvYblupTor6Xmj5DnpLrnlKjmiLdcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5b+D6Lez5o6l5Y+j77yI6Ziy5rKJ6L+35qOA5p+l77yJXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIFBvc3RCcmVhdGhlKGFwcGlkOiBzdHJpbmcsIHVzZXJuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9CcmVhdGhlXCI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT07op6PmnpDplJnor686ICR7ZS5tZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFDplJnor686ICR7eGhyLnN0YXR1c31gKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axguWksei0pScpKTtcclxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYXBwaWQsIHVzZXJuYW1lIH0pKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmYsuayiei/t+aPkOekuumdouadv+ehruWumuaMiemSrueCueWHu+S6i+S7tlxyXG4gICAgICovXHJcbiAgICBvbkNvbmZpcm1ObzE4KCkge1xyXG4gICAgICAgIC8vIOmakOiXj+mYsuayiei/t+aPkOekuumdouadv1xyXG4gICAgICAgIGlmICh0aGlzLk5PMThQYW5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLk5PMThQYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5riF6Zmk55So5oi355m75b2V54q25oCB77yM6Ziy5q2i6L+U5Zue55m75b2V55WM6Z2i5ZCO6Ieq5Yqo55m75b2VXHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdTTFNfVVNFUk5BTUUnKTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ1NMU19QQVNTV09SRCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOi/lOWbnueZu+W9leeVjOmdolxyXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnTG9hZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2hhcmdlKCl7XHJcbiAgICAgICAgLy8g6Lez6L2s5Yiw5YWF5YC855WM6Z2iXHJcbiAgICAgICAgdGhpcy5DaGFyZ2VQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vIOabtOaWsOWFheWAvOeVjOmdoueahOmSu+efs+aYvuekulxyXG4gICAgICAgIHRoaXMudXBkYXRlR2VtVGlwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2xvc2VDaGFyZ2UoKXtcclxuICAgICAgICAvLyDlhbPpl63lvLnnqpdcclxuICAgICAgICB0aGlzLkNoYXJnZVBhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIE9uQ2xvc2VUaXBzKCl7XHJcbiAgICAgICAgLy8g5YWz6Zet5by556qXXHJcbiAgICAgICAgdGhpcy5UaXBzUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhYXlgLzmjInpkq7ngrnlh7vkuovku7blpITnkIZcclxuICAgICAqIEBwYXJhbSBidXR0b25JZCDmjInpkq5JRFxyXG4gICAgICovXHJcbiAgICBvblJlY2hhcmdlQnRuQ2xpY2soYnV0dG9uSWQ6IG51bWJlcil7XHJcbiAgICAgICAgLy8g6I635Y+W5b2T5YmN6YCJ5oup55qE5YWF5YC86YCJ6aG5XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24gPSB0aGlzLnJlY2hhcmdlQ29uZmlnW2J1dHRvbklkXTtcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbil7XHJcbiAgICAgICAgICAgIC8vIOiuvue9ruaPkOekuuaWh+acrFxyXG4gICAgICAgICAgICBpZih0aGlzLkxfdGlwcyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxfdGlwcy5zdHJpbmcgPSBg5piv5ZCm56Gu6K6k5pSv5LuYJHt0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5wcmljZX3lhYPkurrmsJHluIHlhZHmjaIke3RoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzfeS4qumSu+efs++8n2A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5pi+56S656Gu6K6k5by556qXXHJcbiAgICAgICAgICAgIGlmKHRoaXMuVGlwc1BhbmVsKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuVGlwc1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgT25Pa1RpcHMoKXtcclxuICAgICAgICAvLyDnoa7orqTlhYXlgLxcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbil7XHJcbiAgICAgICAgICAgIC8vIOWcqOi/memHjOa3u+WKoOWunumZheeahOWFheWAvOWkhOeQhumAu+i+kVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSTkFNRScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5Qb3N0UGF5RGlhbW9uZChBUFBfSUQsIHVzZXJuYW1lLCB0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5kaWFtb25kcyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui0reS5sOe7k+aenDpcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5jb2RlID09PSAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgVGlwc1duZE1hbmFnZXIuc2hvdyhyZXN1bHQubXNnICsgJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaooeaLn+WFheWAvOaIkOWKn++8jOa3u+WKoOmSu+efs1xyXG4gICAgICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5hZGRHb2xkKHRoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDpkrvnn7PmmL7npLpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZUdvbGRMYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaYvuekuuWFheWAvOaIkOWKn+aPkOekulxyXG4gICAgICAgICAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coYOWFkeaNouaIkOWKn++8geiOt+W+lyR7dGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24uZGlhbW9uZHN95Liq6ZK755+z44CCYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6YeN572u5b2T5YmN6YCJ5oup55qE5YWF5YC86YCJ6aG5XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVjaGFyZ2VPcHRpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIui0reS5sOi/h+eoi+S4reWHuumUmTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAvLyDmqKHmi5/lhYXlgLzmiJDlip/vvIzmt7vliqDpkrvnn7NcclxuICAgICAgICAgICAgLy8gbUdhbWVEYXRhLmN1cnJlbnRHb2xkICs9IHRoaXMuY3VycmVudFJlY2hhcmdlT3B0aW9uLmRpYW1vbmRzO1xyXG4gICAgICAgICAgICAvLyAvLyDmm7TmlrDpkrvnn7PmmL7npLpcclxuICAgICAgICAgICAgLy8gdGhpcy5VcGRhdGVHb2xkTGFiZWwoKTtcclxuICAgICAgICAgICAgLy8gLy8g5Y+R6YCB6ZK755+z5pu05paw5LqL5Lu2XHJcbiAgICAgICAgICAgIC8vIGNjLmRpcmVjdG9yLmVtaXQoJ2dvbGRVcGRhdGVkJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyAvLyDmmL7npLrlhYXlgLzmiJDlip/mj5DnpLpcclxuICAgICAgICAgICAgLy8gVGlwc01hbmFnZXIuc2hvdyhg5YWR5o2i5oiQ5Yqf77yB6I635b6XJHt0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbi5kaWFtb25kc33kuKrpkrvnn7PjgIJgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIC8vIOmHjee9ruW9k+WJjemAieaLqeeahOWFheWAvOmAiemhuVxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRSZWNoYXJnZU9wdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWFs+mXreW8ueeql1xyXG4gICAgICAgIHRoaXMuVGlwc1BhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWFheWAvOmSu+efs+aOpeWPo1xyXG4gICAgICovXHJcbiAgICBhc3luYyBQb3N0UGF5RGlhbW9uZChhcHBpZDogc3RyaW5nLCB1c2VybmFtZTogc3RyaW5nLCBkaWFtb25kOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9QYXlEaWFtb25kXCI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT07op6PmnpDplJnor686ICR7ZS5tZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFDplJnor686ICR7eGhyLnN0YXR1c31gKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axguWksei0pScpKTtcclxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYXBwaWQsIHVzZXJuYW1lLCBkaWFtb25kfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6Xov5Tlm57nmoTml7bpl7TmmK/lkKbliLDovr7kuozljYHngrnlm5vljYHkupTliIbvvIzlpoLmnpzliLDovr7liJnmmL7npLrlvLnnqpdcclxuICAgICAqIEBwYXJhbSB0aW1lc3RhbXAg5ZCO56uv6L+U5Zue55qEMTDkvY3mlbDnp5Lnuqfml7bpl7TmiLNcclxuICAgICAqL1xyXG4gICAgIGNoZWNrVGltZUFuZFNob3dQb3B1cCh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOWQjuerr+ehruWumui/lOWbnueahOaYrzEw5L2N5pWw56eS57qn5pe26Ze05oiz77yM55u05o6l6L2s5o2i5Li65q+r56eS57qnXHJcbiAgICAgICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IHRpbWVzdGFtcCAqIDEwMDA7XHJcbiAgICAgICAgICAgIC8vIOWIm+W7ukRhdGXlr7nosaFcclxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKG1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBob3VyczogbnVtYmVyID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgICAgICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXCJiYmJiYmJiYmJcIilcclxuICAgICAgICAgICAgLy8g55uu5qCH5pe26Ze077ya5LqM5Y2B54K55Zub5Y2B5LqU5YiGXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhvdXI6IG51bWJlciA9IDIwO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRNaW51dGU6IG51bWJlciA9IDQ1O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g6LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG5LiN5YaN5qOA5p+lXHJcbiAgICAgICAgICAgIGNvbnN0IGVuZEhvdXI6IG51bWJlciA9IDIwO1xyXG4gICAgICAgICAgICBjb25zdCBlbmRNaW51dGU6IG51bWJlciA9IDQ2O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5aaC5p6c5pe26Ze06LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG77yM55u05o6l6L+U5ZueXHJcbiAgICAgICAgICAgIGlmIChob3VycyA+IGVuZEhvdXIgfHwgKGhvdXJzID09PSBlbmRIb3VyICYmIG1pbnV0ZXMgPiBlbmRNaW51dGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pe26Ze05bey6LaF6L+H5LqM5Y2B54K55Zub5Y2B5YWt5YiG77yM5LiN5YaN5omn6KGM5qOA5p+lJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOWmguaenOW3sue7j+aYvuekuui/h+W8ueeql++8jOebtOaOpei/lOWbnlxyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNTaG93blRpbWVQb3B1cCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W3sue7j+aYvuekuui/h+S6jOWNgeeCueWbm+WNgeS6lOWIhuW8ueeql++8jOS4jeWGjeaYvuekuicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDliKTmlq3mmK/lkKbliLDovr7nm67moIfml7bpl7RcclxuICAgICAgICAgICAgaWYgKGhvdXJzID4gdGFyZ2V0SG91ciB8fCAoaG91cnMgPT09IHRhcmdldEhvdXIgJiYgbWludXRlcyA+PSB0YXJnZXRNaW51dGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pe26Ze05bey5Yiw6L6+5LqM5Y2B54K55Zub5Y2B5LqU5YiG77yM5pi+56S65by556qXJyk7XHJcbiAgICAgICAgICAgICAgICAvLyDosIPnlKhUaXBzV25kTWFuYWdlci5zaG935pa55rOV5pi+56S65by556qXXHJcbiAgICAgICAgICAgICAgICBUaXBzV25kTWFuYWdlci5zaG93KCfmgqjnm67liY3kuLrmnKrmiJDlubTkurrotKblj7fvvIzlt7LooqvnurPlhaXpmLLmsonov7fns7vnu5/jgILmoLnmja7jgIrlm73lrrbmlrDpl7vlh7rniYjnvbLlhbPkuo7ov5vkuIDmraXkuKXmoLznrqHnkIYg5YiH5a6e6Ziy5q2i5pyq5oiQ5bm05Lq65rKJ6L+3572R57uc5ri45oiP55qE6YCa55+l44CL77yM5q+P5ZGo5LqU44CB5ZGo5YWt44CB5ZGo5pel5ZKM5rOV5a6a6IqC5YGH5pel5q+P5pelMjDml7boh7MyMeaXtuWQkeacquaIkOW5tOS6uuaPkOS+mzHlsI/ml7bnvZHnu5zmuLjmiI/mnI3liqHjgIJcXG7mgqjlvZPml6XliankvZnml7bplb/kuI3otrMxNeWIhumSn+OAgicpO1xyXG4gICAgICAgICAgICAgICAgLy8g5qCH6K6w5Li65bey5pi+56S6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1Nob3duVGltZVBvcHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfml7bpl7TlsJrmnKrliLDovr7kuozljYHngrnlm5vljYHkupTliIYnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aXtumXtOino+aekOWksei0pTonLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWz6Zet6K6+572u6Z2i5p2/XHJcbiAgICAgKi9cclxuICAgIGNsb3NlU2V0dGluZ3MoKXtcclxuICAgICAgICBpZih0aGlzLnNldHRpbmdzUGFuZWwpe1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOmfs+S5kOW8gOWFs+aMiemSrueCueWHu+Wbnuiwg1xyXG4gICAgICovXHJcbiAgICBvbk11c2ljQnRuQ2xpY2soKXtcclxuICAgICAgICBtR2FtZURhdGEuaXNCR01PbiA9ICFtR2FtZURhdGEuaXNCR01PbjtcclxuICAgICAgICBtR2FtZURhdGEuU2F2ZUJHTU9uRGF0YSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOabtOaWsOeyvueBteaYvuekuueKtuaAgVxyXG4gICAgICAgIGlmKHRoaXMubXVzaWNPbiAmJiB0aGlzLm11c2ljT2ZmKXtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY09uLmFjdGl2ZSA9IG1HYW1lRGF0YS5pc0JHTU9uO1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljT2ZmLmFjdGl2ZSA9ICFtR2FtZURhdGEuaXNCR01PbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5o6n5Yi26IOM5pmv6Z+z5LmQXHJcbiAgICAgICAgaWYobUdhbWVEYXRhLmlzQkdNT24pe1xyXG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KHRoaXMuQmdtLCB0cnVlLCAxKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDpn7PmlYjlvIDlhbPmjInpkq7ngrnlh7vlm57osINcclxuICAgICAqL1xyXG4gICAgb25Tb3VuZEJ0bkNsaWNrKCl7XHJcbiAgICAgICAgbUdhbWVEYXRhLmlzU291bmRPbiA9ICFtR2FtZURhdGEuaXNTb3VuZE9uO1xyXG4gICAgICAgIG1HYW1lRGF0YS5TYXZlU291bmRPbkRhdGEoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmm7TmlrDnsr7ngbXmmL7npLrnirbmgIFcclxuICAgICAgICBpZih0aGlzLnNvdW5kT24gJiYgdGhpcy5zb3VuZE9mZil7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRPbi5hY3RpdmUgPSBtR2FtZURhdGEuaXNTb3VuZE9uO1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kT2ZmLmFjdGl2ZSA9ICFtR2FtZURhdGEuaXNTb3VuZE9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBTaG93UUgoKXtcclxuICAgICAgICBTdGF0ZUJyaWRnZS5wcmVwYXJlVXBncmFkZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLlNraWxsUGFuZWwpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2tpbGxNYW5hZ2VyID0gdGhpcy5Ta2lsbFBhbmVsLmdldENvbXBvbmVudCgnU2tpbGxNYW5hZ2VyJykgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoc2tpbGxNYW5hZ2VyICYmIHNraWxsTWFuYWdlci5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBza2lsbE1hbmFnZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Ta2lsbFBhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBUaXBzTWFuYWdlci5zaG93KCflip/og73mmoLmnKrlvIDmlL4nKTtcclxuICAgIH1cclxuXHJcbiAgICBTaG93Q0ooKXtcclxuICAgICAgIGlmKHRoaXMuQ0pQYW5lbCl7XHJcbiAgICAgICAgICAgIGNvbnN0IGFjaGlldmVNYW5hZ2VyID0gdGhpcy5DSlBhbmVsLmdldENvbXBvbmVudCgnQWNoaWV2ZU1hbmFnZXInKSBhcyBhbnk7XHJcbiAgICAgICAgICAgIGlmIChhY2hpZXZlTWFuYWdlciAmJiBhY2hpZXZlTWFuYWdlci5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBhY2hpZXZlTWFuYWdlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNKUGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmiJDlsLHnlYzpnaLoioLngrnmnKrorr7nva4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgU2hvd1dlZWsoKXtcclxuICAgICAgIGlmKHRoaXMuV2Vla1BhbmVsKXtcclxuICAgICAgICAgICAgY29uc3Qgd2Vla2x5UmV3YXJkTWFuYWdlciA9IHRoaXMuV2Vla1BhbmVsLmdldENvbXBvbmVudCgnV2Vla2x5UmV3YXJkTWFuYWdlcicpIGFzIGFueTtcclxuICAgICAgICAgICAgaWYgKHdlZWtseVJld2FyZE1hbmFnZXIgJiYgd2Vla2x5UmV3YXJkTWFuYWdlci5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICB3ZWVrbHlSZXdhcmRNYW5hZ2VyLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuV2Vla1BhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5ZGo5aWW5Yqx55WM6Z2i6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFNob3dEYWlseSgpe1xyXG4gICAgICAgaWYodGhpcy5EYWlseVBhbmVsKXtcclxuICAgICAgICAgICAgY29uc3QgZGFpbHlSZXdhcmRNYW5hZ2VyID0gdGhpcy5EYWlseVBhbmVsLmdldENvbXBvbmVudCgnRGFpbHlSZXdhcmRNYW5hZ2VyJykgYXMgYW55O1xyXG4gICAgICAgICAgICBpZiAoZGFpbHlSZXdhcmRNYW5hZ2VyICYmIGRhaWx5UmV3YXJkTWFuYWdlci5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBkYWlseVJld2FyZE1hbmFnZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5EYWlseVBhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5pel5aWW5Yqx55WM6Z2i6IqC54K55pyq6K6+572uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==