
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Load/SplashManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '407abgrDU1OvqjP+GnlX/UN', 'SplashManager');
// Scripts/Load/SplashManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var TipsManager_1 = require("./TipsManager");
var GameData_1 = require("../Load/GameData");
var TipsWnd_1 = require("./TipsWnd");
var AppConfig_1 = require("../Common/AppConfig");
var UserDataSyncManager_1 = require("../Manager/UserDataSyncManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var SplashManager = /** @class */ (function (_super) {
    __extends(SplashManager, _super);
    function SplashManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // 闪屏面板
        _this.splashPanel = null;
        // 登录面板
        _this.loginPanel = null;
        _this.splashDuration = 5;
        _this.fadeDuration = 0.5;
        // 登录相关
        _this.usernameInput = null;
        _this.passwordInput = null;
        _this.loginButton = null;
        _this.zhuceBtn = null;
        // 登录协议同意复选框
        _this.agreeToggle = null;
        _this.username = "";
        _this.password = "";
        _this.isRealName = false;
        // 实名相关
        _this.realnamePanel = null;
        _this.realnameInput = null;
        _this.idnumInput = null;
        _this.realnameButton = null;
        _this.btn_tc = null;
        _this.BtnTips = null;
        _this.BtnCloseTips = null;
        _this.TipsWnd = null;
        // 本地存储key
        _this.STORAGE_KEY_USERNAME = 'SLS_USERNAME';
        _this.STORAGE_KEY_PASSWORD = 'SLS_PASSWORD';
        _this.STORAGE_KEY_REALNAME = 'SLS_REALNAME';
        _this.STORAGE_KEY_USER_ID = 'SLS_USER_ID';
        // 年龄状态存储key，1=成年人，其他=未成年人
        _this.STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
        // 是否已经显示过二十点四十五分的弹窗
        _this.hasShownTimePopup = false;
        return _this;
    }
    SplashManager.prototype.onLoad = function () {
        // 检查本地存储，保存账号信息
        var savedUsername = cc.sys.localStorage.getItem(this.STORAGE_KEY_USERNAME);
        var savedPassword = cc.sys.localStorage.getItem(this.STORAGE_KEY_PASSWORD);
        var savedRealName = cc.sys.localStorage.getItem(this.STORAGE_KEY_REALNAME);
        if (savedUsername && savedPassword) {
            console.log('检测到本地账号信息');
            this.username = savedUsername;
            this.password = savedPassword;
            this.isRealName = savedRealName === 'true';
        }
        // 默认显示闪屏，隐藏登录界面
        if (this.splashPanel) {
            this.splashPanel.active = true;
        }
        if (this.loginPanel) {
            this.loginPanel.active = false;
        }
        // 绑定登录按钮事件
        if (this.loginButton) {
            this.loginButton.on(cc.Node.EventType.TOUCH_END, this.onLoginClick, this);
        }
        // 绑定注册按钮事件
        if (this.zhuceBtn) {
            this.zhuceBtn.on(cc.Node.EventType.TOUCH_END, this.onZhuceClick, this);
        }
        // 绑定实名认证按钮事件
        if (this.realnameButton) {
            this.realnameButton.on(cc.Node.EventType.TOUCH_END, this.onRealNameClick, this);
        }
        // 绑定确认按钮事件
        if (this.btn_tc) {
            this.btn_tc.on(cc.Node.EventType.TOUCH_END, this.onClickTC, this);
        }
        if (this.BtnTips) {
            this.BtnTips.on(cc.Node.EventType.TOUCH_END, this.onClickTips, this);
            this.TipsWnd.active = false;
        }
        if (this.BtnCloseTips) {
            this.BtnCloseTips.on(cc.Node.EventType.TOUCH_END, this.onClickCloseTips, this);
        }
        // 开始闪屏流程
        this.startSplashSequence();
    };
    /**
     * 开始闪屏序列
     */
    SplashManager.prototype.startSplashSequence = function () {
        var _this = this;
        console.log('开始闪屏序列，持续时间:', this.splashDuration, '秒');
        // 闪屏停留指定时间后开始淡出
        this.scheduleOnce(function () {
            _this.fadeOutSplash();
        }, this.splashDuration);
    };
    /**
     * 闪屏淡出效果
     */
    SplashManager.prototype.fadeOutSplash = function () {
        var _this = this;
        if (!this.splashPanel) {
            this.checkLoginStatus();
            return;
        }
        // 创建淡出动画
        var fadeOut = cc.fadeTo(this.fadeDuration, 0);
        var finish = cc.callFunc(function () {
            _this.splashPanel.active = false;
            _this.checkLoginStatus();
        });
        var sequence = cc.sequence(fadeOut, finish);
        this.splashPanel.runAction(sequence);
        GameData_1.default.SaveGoldData();
    };
    /**
     * 检查登录状态
     */
    SplashManager.prototype.checkLoginStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var globalRealName, result, isAdult, userId, goldKey, item1Stock, item2Stock, itemStock, userId, itemStockKey, userId, currentLevelKey, unlockedLevelKey, isRealName, antiAddictionResult, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.username && this.password)) return [3 /*break*/, 12];
                        globalRealName = cc.sys.localStorage.getItem(this.STORAGE_KEY_REALNAME);
                        if (!(globalRealName === 'true')) return [3 /*break*/, 10];
                        console.log('已有账号信息且已实名，获取最新登录信息...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, this.register(AppConfig_1.APP_ID, this.username, this.password, 2)];
                    case 2:
                        result = _a.sent();
                        console.log("登录结果:", result);
                        // 保存最新的user_id到本地
                        if (result.data.accountId) {
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, result.data.accountId.toString());
                        }
                        if (result.data.user_id) {
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, result.data.user_id.toString());
                        }
                        // 保存年龄状态：1=成年人，其他=未成年人
                        if (result.data.hasOwnProperty('age')) {
                            isAdult = result.data.age === 1;
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                            console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                        }
                        // 保存钻石数据
                        if (result.data.hasOwnProperty('diamond')) {
                            userId = result.data.accountId || result.data.user_id;
                            goldKey = userId ? "CurrentGold_" + userId : 'CurrentGold';
                            cc.sys.localStorage.setItem(goldKey, result.data.diamond.toString());
                            // 同时保存默认key的钻石数据，用于兼容
                            cc.sys.localStorage.setItem('CurrentGold', result.data.diamond.toString());
                            // 直接更新GameData中的钻石值
                            GameData_1.default.currentGold = result.data.diamond;
                            console.log('登录返回的钻石数量:', result.data.diamond);
                        }
                        // 设置道具库存
                        if (result.data.foam && result.data.used_foam) {
                            item1Stock = result.data.foam - result.data.used_foam;
                            item2Stock = result.data.wing - result.data.used_wing;
                            itemStock = [item1Stock, item2Stock, 0];
                            userId = result.data.accountId || result.data.user_id;
                            itemStockKey = userId ? "ItemStock_" + userId : 'ItemStock';
                            // 以JSON字符串形式存储道具库存
                            cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(itemStock));
                            console.log('道具库存设置成功:', itemStock);
                        }
                        // 保存关卡数据，使用服务器返回的rank作为关卡值
                        if (result.data.hasOwnProperty('rank')) {
                            userId = result.data.accountId || result.data.user_id;
                            currentLevelKey = userId ? "CurrentLevel_" + userId : 'CurrentLevel';
                            unlockedLevelKey = userId ? "UnlockedLevel_" + userId : 'UnlockedLevel';
                            // 保存关卡数据到本地
                            cc.sys.localStorage.setItem(currentLevelKey, result.data.rank.toString());
                            // 已通关rank关，解锁rank+1关
                            cc.sys.localStorage.setItem(unlockedLevelKey, (result.data.rank + 1).toString());
                            // 直接修改GameData中的关卡值，确保数据立即生效
                            GameData_1.default.currentLevel = result.data.rank;
                            GameData_1.default.unlockedLevel = result.data.rank + 1;
                            // 同时保存一个不带用户ID的副本，用于兼容
                            cc.sys.localStorage.setItem('CurrentLevel', result.data.rank.toString());
                            cc.sys.localStorage.setItem('UnlockedLevel', (result.data.rank + 1).toString());
                            console.log('使用服务器返回的rank作为关卡值:', result.data.rank, '已解锁关卡:', result.data.rank + 1);
                        }
                        isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                        if (isRealName) {
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, UserDataSyncManager_1.default.syncFromServer()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.PostBreathe(AppConfig_1.APP_ID, this.username)];
                    case 5:
                        antiAddictionResult = _a.sent();
                        console.log("防沉迷检查结果2:", antiAddictionResult);
                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsManager.show((antiAddictionResult.msg + '。') || '未成年用户禁止进入游戏。');
                            TipsWnd_1.default.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            return [2 /*return*/]; // 阻止进入游戏)
                        }
                        // 防沉迷检查通过，进入游戏
                        console.log('获取最新登录信息成功，直接进入游戏');
                        // 重新加载钻石数据，确保获取最新保存的值
                        GameData_1.default.GetGoldData();
                        this.goToMainScene();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("防沉迷检查失败:", error_1);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _a.sent();
                        console.error('获取最新登录信息失败:', error_2);
                        // 即使失败也继续进入游戏
                        console.log('获取最新登录信息失败，但仍进入游戏');
                        // 重新加载钻石数据，确保获取最新保存的值
                        UserDataSyncManager_1.default.enableUploadsForCurrentSession();
                        GameData_1.default.GetGoldData();
                        this.goToMainScene();
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        console.log('已有账号信息但未实名，显示实名认证弹窗');
                        this.showRealNamePanel();
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        console.log('无账号信息，显示登录界面');
                        this.showLoginPanel();
                        _a.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 显示登录界面
     */
    SplashManager.prototype.showLoginPanel = function () {
        if (!this.loginPanel) {
            // 如果没有登录界面，直接跳转到主界面
            this.goToMainScene();
            return;
        }
        // 重置闪屏面板透明度，以便下次使用
        if (this.splashPanel) {
            this.splashPanel.opacity = 255;
        }
        // 显示登录界面
        this.loginPanel.active = true;
        this.loginPanel.opacity = 0;
        // 淡入登录界面
        var fadeIn = cc.fadeTo(this.fadeDuration, 255);
        this.loginPanel.runAction(fadeIn);
        // 清空输入框
        if (this.usernameInput) {
            this.usernameInput.string = '';
        }
        if (this.passwordInput) {
            this.passwordInput.string = '';
        }
    };
    /**
     * 登录按钮点击事件
     */
    SplashManager.prototype.onLoginClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var username, password, result, userId, isAdult, goldKey, savedValue, ranklist, highestRank, i, levelData, level, stars, currentLevelKey, unlockedLevelKey, item1Stock, item2Stock, itemStock, userId_1, itemStockKey, isRealName, antiAddictionResult, error_3, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        username = this.usernameInput ? this.usernameInput.string : '';
                        password = this.passwordInput ? this.passwordInput.string : '';
                        if (!username || !password) {
                            TipsManager_1.default.show('请输入用户名和密码。');
                            return [2 /*return*/];
                        }
                        // 验证用户名长度（2-16）
                        if (username.length < 2) {
                            TipsManager_1.default.show('用户名长度过短。');
                            return [2 /*return*/];
                        }
                        // 验证密码长度（6-16）
                        if (password.length < 6) {
                            TipsManager_1.default.show('密码长度过短。');
                            return [2 /*return*/];
                        }
                        // 检查是否勾选同意协议
                        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
                            TipsManager_1.default.show('请勾选同意用户协议。');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        console.log("开始登录...");
                        return [4 /*yield*/, this.register(AppConfig_1.APP_ID, username, password, 2)];
                    case 2:
                        result = _a.sent();
                        console.log("登录结果:", result);
                        if (!(result.code === 0)) return [3 /*break*/, 10];
                        // 登录成功
                        this.username = username;
                        this.password = password;
                        // 保存账号信息到本地
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_USERNAME, this.username);
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_PASSWORD, this.password);
                        userId = null;
                        if (result.data.accountId) {
                            userId = result.data.accountId.toString();
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, userId);
                        }
                        if (result.data.user_id) {
                            userId = result.data.user_id.toString();
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, userId);
                        }
                        // 保存年龄状态：1=成年人，其他=未成年人
                        if (result.data.hasOwnProperty('age')) {
                            isAdult = result.data.age === 1;
                            cc.sys.localStorage.setItem(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                            console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                        }
                        // 保存钻石数据，无论是否为0都保存
                        if (result.data.hasOwnProperty('diamond')) {
                            goldKey = userId ? "CurrentGold_" + userId : 'CurrentGold';
                            cc.sys.localStorage.setItem(goldKey, result.data.diamond.toString());
                            savedValue = cc.sys.localStorage.getItem(goldKey);
                            // 直接修改GameData中的钻石值，确保数据立即生效
                            GameData_1.default.currentGold = result.data.diamond;
                            // 同时保存一个不带用户ID的副本，用于兼容
                            cc.sys.localStorage.setItem('CurrentGold', result.data.diamond.toString());
                            console.log('登录返回的钻石数量:', result.data.diamond);
                        }
                        // 保存关卡数据和星级，使用服务器返回的ranklist数组
                        if (result.data.ranklist && Array.isArray(result.data.ranklist)) {
                            ranklist = result.data.ranklist;
                            highestRank = 0;
                            // 遍历ranklist数组，保存每一关的星级和更新最高关卡
                            for (i = 0; i < ranklist.length; i++) {
                                levelData = ranklist[i];
                                if (levelData && typeof levelData.rank === 'number') {
                                    level = levelData.rank;
                                    stars = levelData.star || 0;
                                    // 保存关卡星级
                                    // const starsKey = userId ? `LevelStars_${level}_${userId}` : `LevelStars_${level}`;
                                    // cc.sys.localStorage.setItem(starsKey, stars.toString());
                                    // // 保存一个不带用户ID的副本，用于兼容
                                    // cc.sys.localStorage.setItem(`LevelStars_${level}`, stars.toString());
                                    // 更新最高关卡
                                    if (level > highestRank) {
                                        highestRank = level;
                                    }
                                }
                            }
                            if (highestRank > 0) {
                                currentLevelKey = userId ? "CurrentLevel_" + userId : 'CurrentLevel';
                                unlockedLevelKey = userId ? "UnlockedLevel_" + userId : 'UnlockedLevel';
                                // 保存最高关卡和已解锁关卡
                                cc.sys.localStorage.setItem(currentLevelKey, highestRank.toString());
                                // 已通关highestRank关，解锁highestRank+1关
                                cc.sys.localStorage.setItem(unlockedLevelKey, (highestRank + 1).toString());
                                // 直接修改GameData中的关卡值，确保数据立即生效
                                GameData_1.default.currentLevel = highestRank;
                                GameData_1.default.unlockedLevel = highestRank + 1;
                                // 同时保存不带用户ID的副本，用于兼容
                                cc.sys.localStorage.setItem('CurrentLevel', highestRank.toString());
                                cc.sys.localStorage.setItem('UnlockedLevel', (highestRank + 1).toString());
                                console.log('使用服务器返回的ranklist数组设置关卡值:', highestRank, '已解锁关卡:', highestRank + 1);
                            }
                        }
                        if (result.data.foam && result.data.used_foam) {
                            item1Stock = result.data.foam - result.data.used_foam;
                            item2Stock = result.data.wing - result.data.used_wing;
                            itemStock = [item1Stock, item2Stock, 0];
                            userId_1 = result.data.accountId || result.data.user_id;
                            itemStockKey = userId_1 ? "ItemStock_" + userId_1 : 'ItemStock';
                            // 以JSON字符串形式存储道具库存
                            cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(itemStock));
                            console.log('道具库存设置成功:', itemStock);
                        }
                        console.log("账号信息已保存到本地");
                        // TipsManager.show(result.data.isrealname === 1 ? '已实名' : '未实名');
                        console.log("result.data.isrealname:", result.data.isrealname);
                        console.log("result.data.is_real:", result.data.is_real);
                        return [4 /*yield*/, UserDataSyncManager_1.default.syncFromServer()];
                    case 3:
                        _a.sent();
                        isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                        if (!isRealName) return [3 /*break*/, 8];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.PostBreathe(AppConfig_1.APP_ID, username)];
                    case 5:
                        antiAddictionResult = _a.sent();
                        console.log("防沉迷检查结果:", antiAddictionResult);
                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsManager.show((antiAddictionResult.msg + '。') || '未成年用户禁止进入游戏。');
                            TipsWnd_1.default.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            return [2 /*return*/]; // 阻止进入游戏
                        }
                        // 防沉迷检查通过，进入游戏
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');
                        TipsManager_1.default.show('登录成功，正在跳转。');
                        this.scheduleOnce(function () {
                            // 重新加载钻石数据，确保获取最新保存的值
                            GameData_1.default.GetGoldData();
                            _this.goToMainScene();
                        }, 1.0);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        console.error("防沉迷检查失败:", error_3);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.showRealNamePanel();
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        // TipsManager.show(result.msg);
                        if (result.msg == "帐号密码错误" || result.msg == "帐号密码错误。") {
                            TipsManager_1.default.show('帐号密码错误。');
                        }
                        else {
                            TipsWnd_1.default.show(result.msg);
                        }
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_4 = _a.sent();
                        console.error("登录过程中出错:", error_4);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 注册按钮点击事件
     */
    SplashManager.prototype.onZhuceClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var username, password, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("注册按钮点击事件");
                        username = this.usernameInput ? this.usernameInput.string : '';
                        password = this.passwordInput ? this.passwordInput.string : '';
                        if (!username || !password) {
                            TipsManager_1.default.show('请输入用户名和密码。');
                            return [2 /*return*/];
                        }
                        // 验证用户名长度（2-16）
                        if (username.length < 2) {
                            TipsManager_1.default.show('用户名长度过短。');
                            return [2 /*return*/];
                        }
                        // 验证密码长度（6-16）
                        if (password.length < 6) {
                            TipsManager_1.default.show('密码长度过短。');
                            return [2 /*return*/];
                        }
                        // 检查是否勾选同意协议
                        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
                            TipsManager_1.default.show('请勾选同意用户协议。');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.register(AppConfig_1.APP_ID, username, password, 1)];
                    case 2:
                        result = _a.sent();
                        console.log("注册结果:", result);
                        TipsManager_1.default.show(result.msg + '');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("注册过程中出错:", error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 显示实名认证弹窗
     */
    SplashManager.prototype.showRealNamePanel = function () {
        if (!this.realnamePanel) {
            console.warn('realnamePanel未设置');
            this.goToMainScene();
            return;
        }
        // 隐藏登录面板
        if (this.loginPanel) {
            this.loginPanel.active = false;
        }
        // 显示实名认证弹窗
        this.realnamePanel.active = true;
        this.realnamePanel.opacity = 0;
        // 淡入实名认证弹窗
        var fadeIn = cc.fadeTo(this.fadeDuration, 255);
        this.realnamePanel.runAction(fadeIn);
        // 清空输入框
        if (this.realnameInput) {
            this.realnameInput.string = '';
        }
        if (this.idnumInput) {
            this.idnumInput.string = '';
        }
    };
    /**
     * 实名认证按钮点击事件
     */
    SplashManager.prototype.onRealNameClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var realname, idnum, result, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        realname = this.realnameInput ? this.realnameInput.string : '';
                        idnum = this.idnumInput ? this.idnumInput.string : '';
                        if (!realname || !idnum) {
                            TipsManager_1.default.show('请输入真实姓名和身份证号。');
                            return [2 /*return*/];
                        }
                        // 验证身份证号长度（18位）
                        if (idnum.length !== 18) {
                            TipsManager_1.default.show('身份证号格式不正确。');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        console.log("开始实名认证...");
                        return [4 /*yield*/, this.realName(AppConfig_1.APP_ID, this.username, realname, idnum)];
                    case 2:
                        result = _a.sent();
                        console.log("实名认证结果:", result);
                        if (!(result.code === 0)) return [3 /*break*/, 4];
                        // 实名认证成功
                        this.isRealName = true;
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');
                        return [4 /*yield*/, UserDataSyncManager_1.default.syncFromServer()];
                    case 3:
                        _a.sent();
                        TipsManager_1.default.show('实名认证成功，正在跳转。');
                        // 延迟跳转到主界面
                        this.scheduleOnce(function () {
                            _this.goToMainScene();
                        }, 1.0);
                        return [3 /*break*/, 5];
                    case 4:
                        // 实名认证失败
                        TipsManager_1.default.show(result.msg + '');
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_6 = _a.sent();
                        console.error("实名认证过程中出错:", error_6);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发送注册请求
     * @param params 注册参数
     * @returns Promise<RegisterResponse>
     */
    SplashManager.prototype.register = function (appid, username, password, type) {
        return __awaiter(this, void 0, Promise, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://pay.szvi-bo.com/v1/testapp/GetLogin";
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
                        xhr.send(JSON.stringify({ appid: appid, openid: username, username: username, password: password, type: type }));
                    })];
            });
        });
    };
    SplashManager.prototype.realName = function (appid, username, realname, idnum) {
        return __awaiter(this, void 0, Promise, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://pay.szvi-bo.com/v1/testapp/RealName";
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
                        xhr.send(JSON.stringify({ appid: appid, username: username, realname: realname, idnum: idnum }));
                    })];
            });
        });
    };
    //请求心跳
    SplashManager.prototype.PostBreathe = function (appid, username) {
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
     * 跳转到主界面
     */
    SplashManager.prototype.goToMainScene = function () {
        cc.director.loadScene('Start');
    };
    SplashManager.prototype.onClickTC = function () {
        // cc.director.loadScene('Splash');
        this.realnamePanel.active = false;
        this.showLoginPanel();
    };
    SplashManager.prototype.onClickTips = function () {
        this.TipsWnd.active = true;
    };
    SplashManager.prototype.onClickCloseTips = function () {
        this.TipsWnd.active = false;
    };
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "splashPanel", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "loginPanel", void 0);
    __decorate([
        property(cc.EditBox)
    ], SplashManager.prototype, "usernameInput", void 0);
    __decorate([
        property(cc.EditBox)
    ], SplashManager.prototype, "passwordInput", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "loginButton", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "zhuceBtn", void 0);
    __decorate([
        property(cc.Toggle)
    ], SplashManager.prototype, "agreeToggle", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "realnamePanel", void 0);
    __decorate([
        property(cc.EditBox)
    ], SplashManager.prototype, "realnameInput", void 0);
    __decorate([
        property(cc.EditBox)
    ], SplashManager.prototype, "idnumInput", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "realnameButton", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "btn_tc", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "BtnTips", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "BtnCloseTips", void 0);
    __decorate([
        property(cc.Node)
    ], SplashManager.prototype, "TipsWnd", void 0);
    SplashManager = __decorate([
        ccclass
    ], SplashManager);
    return SplashManager;
}(cc.Component));
exports.default = SplashManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcU3BsYXNoTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQXdDO0FBQ3hDLDZDQUF5QztBQUN6QyxxQ0FBdUM7QUFDdkMsaURBQTZDO0FBQzdDLHNFQUFpRTtBQUUzRCxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUcxQztJQUEyQyxpQ0FBWTtJQUF2RDtRQUFBLHFFQXd0QkM7UUF2dEJHLE9BQU87UUFFUCxpQkFBVyxHQUFZLElBQUksQ0FBQztRQUU1QixPQUFPO1FBRVAsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFFM0Isb0JBQWMsR0FBVyxDQUFDLENBQUM7UUFFM0Isa0JBQVksR0FBVyxHQUFHLENBQUM7UUFFM0IsT0FBTztRQUVQLG1CQUFhLEdBQWUsSUFBSSxDQUFDO1FBR2pDLG1CQUFhLEdBQWUsSUFBSSxDQUFDO1FBR2pDLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBRzVCLGNBQVEsR0FBWSxJQUFJLENBQUM7UUFFekIsWUFBWTtRQUVaLGlCQUFXLEdBQWMsSUFBSSxDQUFDO1FBRXRCLGNBQVEsR0FBVSxFQUFFLENBQUM7UUFDckIsY0FBUSxHQUFVLEVBQUUsQ0FBQztRQUNyQixnQkFBVSxHQUFXLEtBQUssQ0FBQztRQUVuQyxPQUFPO1FBRVAsbUJBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsbUJBQWEsR0FBZSxJQUFJLENBQUM7UUFHakMsZ0JBQVUsR0FBZSxJQUFJLENBQUM7UUFHOUIsb0JBQWMsR0FBWSxJQUFJLENBQUM7UUFHL0IsWUFBTSxHQUFZLElBQUksQ0FBQztRQUd2QixhQUFPLEdBQVksSUFBSSxDQUFDO1FBR3hCLGtCQUFZLEdBQVksSUFBSSxDQUFDO1FBRzdCLGFBQU8sR0FBWSxJQUFJLENBQUM7UUFFeEIsVUFBVTtRQUNPLDBCQUFvQixHQUFHLGNBQWMsQ0FBQztR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REFDWTtJQUdqQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO3FEQUNTO0lBRzlCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7eURBQ2E7SUFHL0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztpREFDSztJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNNO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7dURBQ1c7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDTTtJQXpEUCxhQUFhO1FBRGpDLE9BQU87T0FDYSxhQUFhLENBd3RCakM7SUFBRCxvQkFBQztDQXh0QkQsQUF3dEJDLENBeHRCMEMsRUFBRSxDQUFDLFNBQVMsR0F3dEJ0RDtrQkF4dEJvQixhQUFhIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gXCIuL1RpcHNNYW5hZ2VyXCI7XHJcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XHJcbmltcG9ydCBUaXBzV25kTWFuYWdlciBmcm9tIFwiLi9UaXBzV25kXCI7XHJcbmltcG9ydCB7IEFQUF9JRCB9IGZyb20gXCIuLi9Db21tb24vQXBwQ29uZmlnXCI7XHJcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gXCIuLi9NYW5hZ2VyL1VzZXJEYXRhU3luY01hbmFnZXJcIjtcclxuXHJcbmNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxuQGNjY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BsYXNoTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICAvLyDpl6rlsY/pnaLmnb9cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgc3BsYXNoUGFuZWw6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgXHJcbiAgICAvLyDnmbvlvZXpnaLmnb9cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgbG9naW5QYW5lbDogY2MuTm9kZSA9IG51bGw7XHJcbiAgICBcclxuICAgIHNwbGFzaER1cmF0aW9uOiBudW1iZXIgPSA1O1xyXG4gICAgXHJcbiAgICBmYWRlRHVyYXRpb246IG51bWJlciA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8g55m75b2V55u45YWzXHJcbiAgICBAcHJvcGVydHkoY2MuRWRpdEJveClcclxuICAgIHVzZXJuYW1lSW5wdXQ6IGNjLkVkaXRCb3ggPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuRWRpdEJveClcclxuICAgIHBhc3N3b3JkSW5wdXQ6IGNjLkVkaXRCb3ggPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGxvZ2luQnV0dG9uOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHpodWNlQnRuOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICAvLyDnmbvlvZXljY/orq7lkIzmhI/lpI3pgInmoYZcclxuICAgIEBwcm9wZXJ0eShjYy5Ub2dnbGUpXHJcbiAgICBhZ3JlZVRvZ2dsZTogY2MuVG9nZ2xlID0gbnVsbDtcclxuXHJcbiAgICBwcml2YXRlIHVzZXJuYW1lOnN0cmluZyA9IFwiXCI7XHJcbiAgICBwcml2YXRlIHBhc3N3b3JkOnN0cmluZyA9IFwiXCI7XHJcbiAgICBwcml2YXRlIGlzUmVhbE5hbWU6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIOWunuWQjeebuOWFs1xyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICByZWFsbmFtZVBhbmVsOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuRWRpdEJveClcclxuICAgIHJlYWxuYW1lSW5wdXQ6IGNjLkVkaXRCb3ggPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuRWRpdEJveClcclxuICAgIGlkbnVtSW5wdXQ6IGNjLkVkaXRCb3ggPSBudWxsO1xyXG4gICAgXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHJlYWxuYW1lQnV0dG9uOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGJ0bl90YzogY2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBCdG5UaXBzOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIEJ0bkNsb3NlVGlwczogY2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXHJcbiAgICBUaXBzV25kOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICAvLyDmnKzlnLDlrZjlgqhrZXlcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgU1RPUkFHRV9LRVlfVVNFUk5BTUUgPSAnU0xTX1VTRVJOQU1FJztcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgU1RPUkFHRV9LRVlfUEFTU1dPUkQgPSAnU0xTX1BBU1NXT1JEJztcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgU1RPUkFHRV9LRVlfUkVBTE5BTUUgPSAnU0xTX1JFQUxOQU1FJztcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgU1RPUkFHRV9LRVlfVVNFUl9JRCA9ICdTTFNfVVNFUl9JRCc7XHJcbiAgICAvLyDlubTpvoTnirbmgIHlrZjlgqhrZXnvvIwxPeaIkOW5tOS6uu+8jOWFtuS7lj3mnKrmiJDlubTkurpcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgU1RPUkFHRV9LRVlfQUdFX1NUQVRVUyA9ICdTTFNfQUdFX1NUQVRVUyc7XHJcbiAgICBcclxuICAgIC8vIOaYr+WQpuW3sue7j+aYvuekuui/h+S6jOWNgeeCueWbm+WNgeS6lOWIhueahOW8ueeql1xyXG4gICAgcHJpdmF0ZSBoYXNTaG93blRpbWVQb3B1cDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIG9uTG9hZCgpIHtcclxuICAgICAgICAvLyDmo4Dmn6XmnKzlnLDlrZjlgqjvvIzkv53lrZjotKblj7fkv6Hmga9cclxuICAgICAgICBjb25zdCBzYXZlZFVzZXJuYW1lID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfVVNFUk5BTUUpO1xyXG4gICAgICAgIGNvbnN0IHNhdmVkUGFzc3dvcmQgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9QQVNTV09SRCk7XHJcbiAgICAgICAgY29uc3Qgc2F2ZWRSZWFsTmFtZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZX1JFQUxOQU1FKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoc2F2ZWRVc2VybmFtZSAmJiBzYXZlZFBhc3N3b3JkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmo4DmtYvliLDmnKzlnLDotKblj7fkv6Hmga8nKTtcclxuICAgICAgICAgICAgdGhpcy51c2VybmFtZSA9IHNhdmVkVXNlcm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMucGFzc3dvcmQgPSBzYXZlZFBhc3N3b3JkO1xyXG4gICAgICAgICAgICB0aGlzLmlzUmVhbE5hbWUgPSBzYXZlZFJlYWxOYW1lID09PSAndHJ1ZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOm7mOiupOaYvuekuumXquWxj++8jOmakOiXj+eZu+W9leeVjOmdolxyXG4gICAgICAgIGlmICh0aGlzLnNwbGFzaFBhbmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BsYXNoUGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubG9naW5QYW5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2luUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOe7keWumueZu+W9leaMiemSruS6i+S7tlxyXG4gICAgICAgIGlmICh0aGlzLmxvZ2luQnV0dG9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9naW5CdXR0b24ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uTG9naW5DbGljaywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOe7keWumuazqOWGjOaMiemSruS6i+S7tlxyXG4gICAgICAgIGlmICh0aGlzLnpodWNlQnRuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuemh1Y2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uWmh1Y2VDbGljaywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDnu5Hlrprlrp7lkI3orqTor4HmjInpkq7kuovku7ZcclxuICAgICAgICBpZiAodGhpcy5yZWFsbmFtZUJ1dHRvbikge1xyXG4gICAgICAgICAgICB0aGlzLnJlYWxuYW1lQnV0dG9uLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblJlYWxOYW1lQ2xpY2ssIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g57uR5a6a56Gu6K6k5oyJ6ZKu5LqL5Lu2XHJcbiAgICAgICAgaWYgKHRoaXMuYnRuX3RjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX3RjLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vbkNsaWNrVEMsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5CdG5UaXBzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQnRuVGlwcy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25DbGlja1RpcHMsIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLlRpcHNXbmQuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLkJ0bkNsb3NlVGlwcykge1xyXG4gICAgICAgICAgICB0aGlzLkJ0bkNsb3NlVGlwcy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25DbGlja0Nsb3NlVGlwcywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlvIDlp4vpl6rlsY/mtYHnqItcclxuICAgICAgICB0aGlzLnN0YXJ0U3BsYXNoU2VxdWVuY2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlvIDlp4vpl6rlsY/luo/liJdcclxuICAgICAqL1xyXG4gICAgc3RhcnRTcGxhc2hTZXF1ZW5jZSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygn5byA5aeL6Zeq5bGP5bqP5YiX77yM5oyB57ut5pe26Ze0OicsIHRoaXMuc3BsYXNoRHVyYXRpb24sICfnp5InKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDpl6rlsY/lgZznlZnmjIflrprml7bpl7TlkI7lvIDlp4vmt6Hlh7pcclxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZmFkZU91dFNwbGFzaCgpO1xyXG4gICAgICAgIH0sIHRoaXMuc3BsYXNoRHVyYXRpb24pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOmXquWxj+a3oeWHuuaViOaenFxyXG4gICAgICovXHJcbiAgICBmYWRlT3V0U3BsYXNoKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zcGxhc2hQYW5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrTG9naW5TdGF0dXMoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDliJvlu7rmt6Hlh7rliqjnlLtcclxuICAgICAgICBjb25zdCBmYWRlT3V0ID0gY2MuZmFkZVRvKHRoaXMuZmFkZUR1cmF0aW9uLCAwKTtcclxuICAgICAgICBjb25zdCBmaW5pc2ggPSBjYy5jYWxsRnVuYygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BsYXNoUGFuZWwuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tMb2dpblN0YXR1cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHNlcXVlbmNlID0gY2Muc2VxdWVuY2UoZmFkZU91dCwgZmluaXNoKTtcclxuICAgICAgICB0aGlzLnNwbGFzaFBhbmVsLnJ1bkFjdGlvbihzZXF1ZW5jZSk7XHJcblxyXG4gICAgICAgIG1HYW1lRGF0YS5TYXZlR29sZERhdGEoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XnmbvlvZXnirbmgIFcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY2hlY2tMb2dpblN0YXR1cygpIHtcclxuICAgICAgICAvLyDliKTmlq3mmK/lkKbmnInmnKzlnLDotKblj7fkv6Hmga9cclxuICAgICAgICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XHJcbiAgICAgICAgICAgIC8vIOaciei0puWPt+S/oeaBr++8jOajgOafpeWFqOWxgOWunuWQjeeKtuaAgVxyXG4gICAgICAgICAgICBjb25zdCBnbG9iYWxSZWFsTmFtZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZX1JFQUxOQU1FKTtcclxuICAgICAgICAgICAgaWYgKGdsb2JhbFJlYWxOYW1lID09PSAndHJ1ZScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflt7LmnInotKblj7fkv6Hmga/kuJTlt7Llrp7lkI3vvIzojrflj5bmnIDmlrDnmbvlvZXkv6Hmga8uLi4nKTtcclxuICAgICAgICAgICAgICAgIC8vIOiwg+eUqHJlZ2lzdGVy5pa55rOV6I635Y+W5pyA5paw5pWw5o2uXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucmVnaXN0ZXIoQVBQX0lELCB0aGlzLnVzZXJuYW1lLCB0aGlzLnBhc3N3b3JkLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIueZu+W9lee7k+aenDpcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjmnIDmlrDnmoR1c2VyX2lk5Yiw5pys5ZywXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhLmFjY291bnRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9VU0VSX0lELCByZXN1bHQuZGF0YS5hY2NvdW50SWQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS51c2VyX2lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZX1VTRVJfSUQsIHJlc3VsdC5kYXRhLnVzZXJfaWQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOW5tOm+hOeKtuaAge+8mjE95oiQ5bm05Lq677yM5YW25LuWPeacquaIkOW5tOS6ulxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYWdlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNBZHVsdCA9IHJlc3VsdC5kYXRhLmFnZSA9PT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfQUdFX1NUQVRVUywgaXNBZHVsdCA/ICcxJyA6ICcwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflubTpvoTnirbmgIE6JywgaXNBZHVsdCA/ICfmiJDlubTkuronIDogJ+acquaIkOW5tOS6uicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjpkrvnn7PmlbDmja5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEuaGFzT3duUHJvcGVydHkoJ2RpYW1vbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bnlKjmiLdJRFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSByZXN1bHQuZGF0YS5hY2NvdW50SWQgfHwgcmVzdWx0LmRhdGEudXNlcl9pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y5bim55So5oi3SUTlkI7nvIDnmoTpkrvnn7PmlbDmja5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ29sZEtleSA9IHVzZXJJZCA/IGBDdXJyZW50R29sZF8ke3VzZXJJZH1gIDogJ0N1cnJlbnRHb2xkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGdvbGRLZXksIHJlc3VsdC5kYXRhLmRpYW1vbmQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWQjOaXtuS/neWtmOm7mOiupGtleeeahOmSu+efs+aVsOaNru+8jOeUqOS6juWFvOWuuVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0N1cnJlbnRHb2xkJywgcmVzdWx0LmRhdGEuZGlhbW9uZC50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g55u05o6l5pu05pawR2FtZURhdGHkuK3nmoTpkrvnn7PlgLxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRHb2xkID0gcmVzdWx0LmRhdGEuZGlhbW9uZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eZu+W9lei/lOWbnueahOmSu+efs+aVsOmHjzonLCByZXN1bHQuZGF0YS5kaWFtb25kKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u6YGT5YW35bqT5a2YXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhLmZvYW0gJiYgcmVzdWx0LmRhdGEudXNlZF9mb2FtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuoeeul+mBk+WFtzHnmoTlupPlrZjvvJrmgLvmlbDph48gLSDlt7Lkvb/nlKjmlbDph49cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTFTdG9jayA9IHJlc3VsdC5kYXRhLmZvYW0gLSByZXN1bHQuZGF0YS51c2VkX2ZvYW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuoeeul+mBk+WFtzLnmoTlupPlrZjvvJrmgLvmlbDph48gLSDlt7Lkvb/nlKjmlbDph49cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTJTdG9jayA9IHJlc3VsdC5kYXRhLndpbmcgLSByZXN1bHQuZGF0YS51c2VkX3dpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaehOmAoOmBk+WFt+W6k+WtmOaVsOe7hCBb6YGT5YW3MeW6k+WtmCwg6YGT5YW3MuW6k+WtmCwg6YGT5YW3M+W6k+WtmF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbVN0b2NrID0gW2l0ZW0xU3RvY2ssIGl0ZW0yU3RvY2ssIDBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bluKbnlKjmiLdJROWQjue8gOeahOWtmOWCqGtleVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSByZXN1bHQuZGF0YS5hY2NvdW50SWQgfHwgcmVzdWx0LmRhdGEudXNlcl9pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbVN0b2NrS2V5ID0gdXNlcklkID8gYEl0ZW1TdG9ja18ke3VzZXJJZH1gIDogJ0l0ZW1TdG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS7pUpTT07lrZfnrKbkuLLlvaLlvI/lrZjlgqjpgZPlhbflupPlrZhcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1TdG9ja0tleSwgSlNPTi5zdHJpbmdpZnkoaXRlbVN0b2NrKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpgZPlhbflupPlrZjorr7nva7miJDlip86JywgaXRlbVN0b2NrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y5YWz5Y2h5pWw5o2u77yM5L2/55So5pyN5Yqh5Zmo6L+U5Zue55qEcmFua+S9nOS4uuWFs+WNoeWAvFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgncmFuaycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPlueUqOaIt0lEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHJlc3VsdC5kYXRhLmFjY291bnRJZCB8fCByZXN1bHQuZGF0YS51c2VyX2lkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bluKbnlKjmiLdJROWQjue8gOeahOWtmOWCqGtleVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGV2ZWxLZXkgPSB1c2VySWQgPyBgQ3VycmVudExldmVsXyR7dXNlcklkfWAgOiAnQ3VycmVudExldmVsJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5sb2NrZWRMZXZlbEtleSA9IHVzZXJJZCA/IGBVbmxvY2tlZExldmVsXyR7dXNlcklkfWAgOiAnVW5sb2NrZWRMZXZlbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOWFs+WNoeaVsOaNruWIsOacrOWcsFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oY3VycmVudExldmVsS2V5LCByZXN1bHQuZGF0YS5yYW5rLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlt7LpgJrlhbNyYW5r5YWz77yM6Kej6ZSBcmFuaysx5YWzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1bmxvY2tlZExldmVsS2V5LCAocmVzdWx0LmRhdGEucmFuayArIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnm7TmjqXkv67mlLlHYW1lRGF0YeS4reeahOWFs+WNoeWAvO+8jOehruS/neaVsOaNrueri+WNs+eUn+aViFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtR2FtZURhdGEuY3VycmVudExldmVsID0gcmVzdWx0LmRhdGEucmFuaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbUdhbWVEYXRhLnVubG9ja2VkTGV2ZWwgPSByZXN1bHQuZGF0YS5yYW5rICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5ZCM5pe25L+d5a2Y5LiA5Liq5LiN5bim55So5oi3SUTnmoTlia/mnKzvvIznlKjkuo7lhbzlrrlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdDdXJyZW50TGV2ZWwnLCByZXN1bHQuZGF0YS5yYW5rLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1VubG9ja2VkTGV2ZWwnLCAocmVzdWx0LmRhdGEucmFuayArIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5L2/55So5pyN5Yqh5Zmo6L+U5Zue55qEcmFua+S9nOS4uuWFs+WNoeWAvDonLCByZXN1bHQuZGF0YS5yYW5rLCAn5bey6Kej6ZSB5YWz5Y2hOicsIHJlc3VsdC5kYXRhLnJhbmsgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw5a6e5ZCN54q25oCBXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNSZWFsTmFtZSA9IHJlc3VsdC5kYXRhLmlzcmVhbG5hbWUgPT09IDEgfHwgcmVzdWx0LmRhdGEuaXNfcmVhbCA9PT0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNSZWFsTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9SRUFMTkFNRSwgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6L+b6KGM6Ziy5rKJ6L+35qOA5p+lXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXNlckRhdGFTeW5jTWFuYWdlci5zeW5jRnJvbVNlcnZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbnRpQWRkaWN0aW9uUmVzdWx0ID0gYXdhaXQgdGhpcy5Qb3N0QnJlYXRoZShBUFBfSUQsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIumYsuayiei/t+ajgOafpee7k+aenDI6XCIsIGFudGlBZGRpY3Rpb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFudGlBZGRpY3Rpb25SZXN1bHQuZGF0YSAmJiBhbnRpQWRkaWN0aW9uUmVzdWx0LmNvZGUgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaXBzTWFuYWdlci5zaG93KChhbnRpQWRkaWN0aW9uUmVzdWx0Lm1zZyArICfjgIInKSB8fCAn5pyq5oiQ5bm055So5oi356aB5q2i6L+b5YWl5ri45oiP44CCJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaXBzV25kTWFuYWdlci5zaG93KChhbnRpQWRkaWN0aW9uUmVzdWx0Lm1zZyArICcnKSB8fCAn5pyq5oiQ5bm055So5oi356aB5q2i6L+b5YWl5ri45oiP44CCJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIOmYu+atoui/m+WFpea4uOaIjylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDpmLLmsonov7fmo4Dmn6XpgJrov4fvvIzov5vlhaXmuLjmiI9cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPluacgOaWsOeZu+W9leS/oeaBr+aIkOWKn++8jOebtOaOpei/m+WFpea4uOaIjycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDph43mlrDliqDovb3pkrvnn7PmlbDmja7vvIznoa7kv53ojrflj5bmnIDmlrDkv53lrZjnmoTlgLxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbUdhbWVEYXRhLkdldEdvbGREYXRhKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub01haW5TY2VuZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLpmLLmsonov7fmo4Dmn6XlpLHotKU6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGlwc01hbmFnZXIuc2hvdygn6Ziy5rKJ6L+35qOA5p+l5aSx6LSl77yM6K+36YeN6K+VJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfojrflj5bmnIDmlrDnmbvlvZXkv6Hmga/lpLHotKU6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWNs+S9v+Wksei0peS5n+e7p+e7rei/m+WFpea4uOaIj1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bmnIDmlrDnmbvlvZXkv6Hmga/lpLHotKXvvIzkvYbku43ov5vlhaXmuLjmiI8nKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDph43mlrDliqDovb3pkrvnn7PmlbDmja7vvIznoa7kv53ojrflj5bmnIDmlrDkv53lrZjnmoTlgLxcclxuICAgICAgICAgICAgICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLmVuYWJsZVVwbG9hZHNGb3JDdXJyZW50U2Vzc2lvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5HZXRHb2xkRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub01haW5TY2VuZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W3suaciei0puWPt+S/oeaBr+S9huacquWunuWQje+8jOaYvuekuuWunuWQjeiupOivgeW8ueeqlycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UmVhbE5hbWVQYW5lbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+aXoOi0puWPt+S/oeaBr++8jOaYvuekuueZu+W9leeVjOmdoicpO1xyXG4gICAgICAgICAgICB0aGlzLnNob3dMb2dpblBhbmVsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuueZu+W9leeVjOmdolxyXG4gICAgICovXHJcbiAgICBzaG93TG9naW5QYW5lbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubG9naW5QYW5lbCkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnmbvlvZXnlYzpnaLvvIznm7TmjqXot7PovazliLDkuLvnlYzpnaJcclxuICAgICAgICAgICAgdGhpcy5nb1RvTWFpblNjZW5lKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6YeN572u6Zeq5bGP6Z2i5p2/6YCP5piO5bqm77yM5Lul5L6/5LiL5qyh5L2/55SoXHJcbiAgICAgICAgaWYgKHRoaXMuc3BsYXNoUGFuZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGxhc2hQYW5lbC5vcGFjaXR5ID0gMjU1O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDmmL7npLrnmbvlvZXnlYzpnaJcclxuICAgICAgICB0aGlzLmxvZ2luUGFuZWwuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvZ2luUGFuZWwub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5reh5YWl55m75b2V55WM6Z2iXHJcbiAgICAgICAgY29uc3QgZmFkZUluID0gY2MuZmFkZVRvKHRoaXMuZmFkZUR1cmF0aW9uLCAyNTUpO1xyXG4gICAgICAgIHRoaXMubG9naW5QYW5lbC5ydW5BY3Rpb24oZmFkZUluKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8g5riF56m66L6T5YWl5qGGXHJcbiAgICAgICAgaWYgKHRoaXMudXNlcm5hbWVJbnB1dCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXJuYW1lSW5wdXQuc3RyaW5nID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBhc3N3b3JkSW5wdXQpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXNzd29yZElucHV0LnN0cmluZyA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog55m75b2V5oyJ6ZKu54K55Ye75LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIG9uTG9naW5DbGljaygpIHtcclxuICAgICAgICBjb25zdCB1c2VybmFtZSA9IHRoaXMudXNlcm5hbWVJbnB1dCA/IHRoaXMudXNlcm5hbWVJbnB1dC5zdHJpbmcgOiAnJztcclxuICAgICAgICBjb25zdCBwYXNzd29yZCA9IHRoaXMucGFzc3dvcmRJbnB1dCA/IHRoaXMucGFzc3dvcmRJbnB1dC5zdHJpbmcgOiAnJztcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIXVzZXJuYW1lIHx8ICFwYXNzd29yZCkge1xyXG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfor7fovpPlhaXnlKjmiLflkI3lkozlr4bnoIHjgIInKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDpqozor4HnlKjmiLflkI3plb/luqbvvIgyLTE277yJXHJcbiAgICAgICAgaWYgKHVzZXJuYW1lLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn55So5oi35ZCN6ZW/5bqm6L+H55+t44CCJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6aqM6K+B5a+G56CB6ZW/5bqm77yINi0xNu+8iVxyXG4gICAgICAgIGlmIChwYXNzd29yZC5sZW5ndGggPCA2KSB7XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+WvhueggemVv+W6pui/h+efreOAgicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuWLvumAieWQjOaEj+WNj+iurlxyXG4gICAgICAgIGlmICghdGhpcy5hZ3JlZVRvZ2dsZSB8fCAhdGhpcy5hZ3JlZVRvZ2dsZS5pc0NoZWNrZWQpIHtcclxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6K+35Yu+6YCJ5ZCM5oSP55So5oi35Y2P6K6u44CCJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g55m75b2V44CB5rOo5YaMXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLlvIDlp4vnmbvlvZUuLi5cIik7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucmVnaXN0ZXIoQVBQX0lELCB1c2VybmFtZSwgcGFzc3dvcmQsIDIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIueZu+W9lee7k+aenDpcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8g55m75b2V5oiQ5YqfXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIOS/neWtmOi0puWPt+S/oeaBr+WIsOacrOWcsFxyXG4gICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfVVNFUk5BTUUsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfUEFTU1dPUkQsIHRoaXMucGFzc3dvcmQpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDkv53lrZh1c2VyX2lk5Yiw5pys5ZywXHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlcklkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5hY2NvdW50SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VySWQgPSByZXN1bHQuZGF0YS5hY2NvdW50SWQudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9VU0VSX0lELCB1c2VySWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhLnVzZXJfaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VySWQgPSByZXN1bHQuZGF0YS51c2VyX2lkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfVVNFUl9JRCwgdXNlcklkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5bm06b6E54q25oCB77yaMT3miJDlubTkurrvvIzlhbbku5Y95pyq5oiQ5bm05Lq6XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEuaGFzT3duUHJvcGVydHkoJ2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNBZHVsdCA9IHJlc3VsdC5kYXRhLmFnZSA9PT0gMTtcclxuICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9BR0VfU1RBVFVTLCBpc0FkdWx0ID8gJzEnIDogJzAnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5bm06b6E54q25oCBOicsIGlzQWR1bHQgPyAn5oiQ5bm05Lq6JyA6ICfmnKrmiJDlubTkuronKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjpkrvnn7PmlbDmja7vvIzml6DorrrmmK/lkKbkuLow6YO95L+d5a2YXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEuaGFzT3duUHJvcGVydHkoJ2RpYW1vbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWFiOWwhumSu+efs+aVsOaNruS/neWtmOWIsOacrOWcsOWtmOWCqFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdvbGRLZXkgPSB1c2VySWQgPyBgQ3VycmVudEdvbGRfJHt1c2VySWR9YCA6ICdDdXJyZW50R29sZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGdvbGRLZXksIHJlc3VsdC5kYXRhLmRpYW1vbmQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6aqM6K+B5piv5ZCm5L+d5a2Y5oiQ5YqfXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F2ZWRWYWx1ZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShnb2xkS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDnm7TmjqXkv67mlLlHYW1lRGF0YeS4reeahOmSu+efs+WAvO+8jOehruS/neaVsOaNrueri+WNs+eUn+aViFxyXG4gICAgICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5jdXJyZW50R29sZCA9IHJlc3VsdC5kYXRhLmRpYW1vbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5ZCM5pe25L+d5a2Y5LiA5Liq5LiN5bim55So5oi3SUTnmoTlia/mnKzvvIznlKjkuo7lhbzlrrlcclxuICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0N1cnJlbnRHb2xkJywgcmVzdWx0LmRhdGEuZGlhbW9uZC50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn55m75b2V6L+U5Zue55qE6ZK755+z5pWw6YePOicsIHJlc3VsdC5kYXRhLmRpYW1vbmQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjlhbPljaHmlbDmja7lkozmmJ/nuqfvvIzkvb/nlKjmnI3liqHlmajov5Tlm57nmoRyYW5rbGlzdOaVsOe7hFxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhLnJhbmtsaXN0ICYmIEFycmF5LmlzQXJyYXkocmVzdWx0LmRhdGEucmFua2xpc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFua2xpc3QgPSByZXN1bHQuZGF0YS5yYW5rbGlzdDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaGlnaGVzdFJhbmsgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmBjeWOhnJhbmtsaXN05pWw57uE77yM5L+d5a2Y5q+P5LiA5YWz55qE5pif57qn5ZKM5pu05paw5pyA6auY5YWz5Y2hXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5rbGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXZlbERhdGEgPSByYW5rbGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxldmVsRGF0YSAmJiB0eXBlb2YgbGV2ZWxEYXRhLnJhbmsgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXZlbCA9IGxldmVsRGF0YS5yYW5rO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnMgPSBsZXZlbERhdGEuc3RhciB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjlhbPljaHmmJ/nuqdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHN0YXJzS2V5ID0gdXNlcklkID8gYExldmVsU3RhcnNfJHtsZXZlbH1fJHt1c2VySWR9YCA6IGBMZXZlbFN0YXJzXyR7bGV2ZWx9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdGFyc0tleSwgc3RhcnMudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAvLyDkv53lrZjkuIDkuKrkuI3luKbnlKjmiLdJROeahOWJr+acrO+8jOeUqOS6juWFvOWuuVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGBMZXZlbFN0YXJzXyR7bGV2ZWx9YCwgc3RhcnMudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOacgOmrmOWFs+WNoVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxldmVsID4gaGlnaGVzdFJhbmspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdoZXN0UmFuayA9IGxldmVsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoaWdoZXN0UmFuayA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W5bim55So5oi3SUTlkI7nvIDnmoTlrZjlgqhrZXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudExldmVsS2V5ID0gdXNlcklkID8gYEN1cnJlbnRMZXZlbF8ke3VzZXJJZH1gIDogJ0N1cnJlbnRMZXZlbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVubG9ja2VkTGV2ZWxLZXkgPSB1c2VySWQgPyBgVW5sb2NrZWRMZXZlbF8ke3VzZXJJZH1gIDogJ1VubG9ja2VkTGV2ZWwnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y5pyA6auY5YWz5Y2h5ZKM5bey6Kej6ZSB5YWz5Y2hXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShjdXJyZW50TGV2ZWxLZXksIGhpZ2hlc3RSYW5rLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlt7LpgJrlhbNoaWdoZXN0UmFua+WFs++8jOino+mUgWhpZ2hlc3RSYW5rKzHlhbNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHVubG9ja2VkTGV2ZWxLZXksIChoaWdoZXN0UmFuayArIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g55u05o6l5L+u5pS5R2FtZURhdGHkuK3nmoTlhbPljaHlgLzvvIznoa7kv53mlbDmja7nq4vljbPnlJ/mlYhcclxuICAgICAgICAgICAgICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRMZXZlbCA9IGhpZ2hlc3RSYW5rO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtR2FtZURhdGEudW5sb2NrZWRMZXZlbCA9IGhpZ2hlc3RSYW5rICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWQjOaXtuS/neWtmOS4jeW4pueUqOaIt0lE55qE5Ymv5pys77yM55So5LqO5YW85a65XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnQ3VycmVudExldmVsJywgaGlnaGVzdFJhbmsudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnVW5sb2NrZWRMZXZlbCcsIChoaWdoZXN0UmFuayArIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+S9v+eUqOacjeWKoeWZqOi/lOWbnueahHJhbmtsaXN05pWw57uE6K6+572u5YWz5Y2h5YC8OicsIGhpZ2hlc3RSYW5rLCAn5bey6Kej6ZSB5YWz5Y2hOicsIGhpZ2hlc3RSYW5rICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5mb2FtICYmIHJlc3VsdC5kYXRhLnVzZWRfZm9hbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuoeeul+mBk+WFtzHnmoTlupPlrZjvvJrmgLvmlbDph48gLSDlt7Lkvb/nlKjmlbDph49cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtMVN0b2NrID0gcmVzdWx0LmRhdGEuZm9hbSAtIHJlc3VsdC5kYXRhLnVzZWRfZm9hbTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDorqHnrpfpgZPlhbcy55qE5bqT5a2Y77ya5oC75pWw6YePIC0g5bey5L2/55So5pWw6YePXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTJTdG9jayA9IHJlc3VsdC5kYXRhLndpbmcgLSByZXN1bHQuZGF0YS51c2VkX3dpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5p6E6YCg6YGT5YW35bqT5a2Y5pWw57uEIFvpgZPlhbcx5bqT5a2YLCDpgZPlhbcy5bqT5a2YLCDpgZPlhbcz5bqT5a2YXVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1TdG9jayA9IFtpdGVtMVN0b2NrLCBpdGVtMlN0b2NrLCAwXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bluKbnlKjmiLdJROWQjue8gOeahOWtmOWCqGtleVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHJlc3VsdC5kYXRhLmFjY291bnRJZCB8fCByZXN1bHQuZGF0YS51c2VyX2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1TdG9ja0tleSA9IHVzZXJJZCA/IGBJdGVtU3RvY2tfJHt1c2VySWR9YCA6ICdJdGVtU3RvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOS7pUpTT07lrZfnrKbkuLLlvaLlvI/lrZjlgqjpgZPlhbflupPlrZhcclxuICAgICAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oaXRlbVN0b2NrS2V5LCBKU09OLnN0cmluZ2lmeShpdGVtU3RvY2spKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6YGT5YW35bqT5a2Y6K6+572u5oiQ5YqfOicsIGl0ZW1TdG9jayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6LSm5Y+35L+h5oGv5bey5L+d5a2Y5Yiw5pys5ZywXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gVGlwc01hbmFnZXIuc2hvdyhyZXN1bHQuZGF0YS5pc3JlYWxuYW1lID09PSAxID8gJ+W3suWunuWQjScgOiAn5pyq5a6e5ZCNJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdC5kYXRhLmlzcmVhbG5hbWU6XCIsIHJlc3VsdC5kYXRhLmlzcmVhbG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHQuZGF0YS5pc19yZWFsOlwiLCByZXN1bHQuZGF0YS5pc19yZWFsKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFVzZXJEYXRhU3luY01hbmFnZXIuc3luY0Zyb21TZXJ2ZXIoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmVhbE5hbWUgPSByZXN1bHQuZGF0YS5pc3JlYWxuYW1lID09PSAxIHx8IHJlc3VsdC5kYXRhLmlzX3JlYWwgPT09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNSZWFsTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOW3suWunuWQje+8jOi/m+ihjOmYsuayiei/t+ajgOafpVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFudGlBZGRpY3Rpb25SZXN1bHQgPSBhd2FpdCB0aGlzLlBvc3RCcmVhdGhlKEFQUF9JRCwgdXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIumYsuayiei/t+ajgOafpee7k+aenDpcIiwgYW50aUFkZGljdGlvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW50aUFkZGljdGlvblJlc3VsdC5kYXRhICYmIGFudGlBZGRpY3Rpb25SZXN1bHQuY29kZSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRpcHNNYW5hZ2VyLnNob3coKGFudGlBZGRpY3Rpb25SZXN1bHQubXNnICsgJ+OAgicpIHx8ICfmnKrmiJDlubTnlKjmiLfnpoHmraLov5vlhaXmuLjmiI/jgIInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRpcHNXbmRNYW5hZ2VyLnNob3coKGFudGlBZGRpY3Rpb25SZXN1bHQubXNnICsgJycpIHx8ICfmnKrmiJDlubTnlKjmiLfnpoHmraLov5vlhaXmuLjmiI/jgIInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8g6Zi75q2i6L+b5YWl5ri45oiPXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOmYsuayiei/t+ajgOafpemAmui/h++8jOi/m+WFpea4uOaIj1xyXG4gICAgICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVlfUkVBTE5BTUUsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfnmbvlvZXmiJDlip/vvIzmraPlnKjot7PovazjgIInKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDph43mlrDliqDovb3pkrvnn7PmlbDmja7vvIznoa7kv53ojrflj5bmnIDmlrDkv53lrZjnmoTlgLxcclxuICAgICAgICAgICAgICAgICAgICBtR2FtZURhdGEuR2V0R29sZERhdGEoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdvVG9NYWluU2NlbmUoKTtcclxuICAgICAgICAgICAgICAgIH0sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIumYsuayiei/t+ajgOafpeWksei0pTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaXBzTWFuYWdlci5zaG93KCfpmLLmsonov7fmo4Dmn6XlpLHotKXvvIzor7fph43or5UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1JlYWxOYW1lUGFuZWwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFRpcHNNYW5hZ2VyLnNob3cocmVzdWx0Lm1zZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1zZyA9PSBcIuW4kOWPt+WvhueggemUmeivr1wiIHx8IHJlc3VsdC5tc2cgPT0gXCLluJDlj7flr4bnoIHplJnor6/jgIJcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn5biQ5Y+35a+G56CB6ZSZ6K+v44CCJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIFRpcHNXbmRNYW5hZ2VyLnNob3cocmVzdWx0Lm1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIueZu+W9lei/h+eoi+S4reWHuumUmTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICAvLyBUaXBzTWFuYWdlci5zaG93KCfnvZHnu5zplJnor6/vvIzor7fph43or5UnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOaMiemSrueCueWHu+S6i+S7tlxyXG4gICAgICovXHJcbiAgICBhc3luYyBvblpodWNlQ2xpY2soKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCLms6jlhozmjInpkq7ngrnlh7vkuovku7ZcIik7XHJcbiAgICAgICAgY29uc3QgdXNlcm5hbWUgPSB0aGlzLnVzZXJuYW1lSW5wdXQgPyB0aGlzLnVzZXJuYW1lSW5wdXQuc3RyaW5nIDogJyc7XHJcbiAgICAgICAgY29uc3QgcGFzc3dvcmQgPSB0aGlzLnBhc3N3b3JkSW5wdXQgPyB0aGlzLnBhc3N3b3JkSW5wdXQuc3RyaW5nIDogJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCF1c2VybmFtZSB8fCAhcGFzc3dvcmQpIHtcclxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6K+36L6T5YWl55So5oi35ZCN5ZKM5a+G56CB44CCJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6aqM6K+B55So5oi35ZCN6ZW/5bqm77yIMi0xNu+8iVxyXG4gICAgICAgIGlmICh1c2VybmFtZS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+eUqOaIt+WQjemVv+W6pui/h+efreOAgicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOmqjOivgeWvhueggemVv+W6pu+8iDYtMTbvvIlcclxuICAgICAgICBpZiAocGFzc3dvcmQubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCflr4bnoIHplb/luqbov4fnn63jgIInKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbli77pgInlkIzmhI/ljY/orq5cclxuICAgICAgICBpZiAoIXRoaXMuYWdyZWVUb2dnbGUgfHwgIXRoaXMuYWdyZWVUb2dnbGUuaXNDaGVja2VkKSB7XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+ivt+WLvumAieWQjOaEj+eUqOaIt+WNj+iuruOAgicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDms6jlhoxcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJlZ2lzdGVyKEFQUF9JRCwgdXNlcm5hbWUsIHBhc3N3b3JkLCAxKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLms6jlhoznu5Pmnpw6XCIsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3cocmVzdWx0Lm1zZyArICcnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5rOo5YaM6L+H56iL5Lit5Ye66ZSZOlwiLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65a6e5ZCN6K6k6K+B5by556qXXHJcbiAgICAgKi9cclxuICAgIHNob3dSZWFsTmFtZVBhbmVsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5yZWFsbmFtZVBhbmVsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybigncmVhbG5hbWVQYW5lbOacquiuvue9ricpO1xyXG4gICAgICAgICAgICB0aGlzLmdvVG9NYWluU2NlbmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDpmpDol4/nmbvlvZXpnaLmnb9cclxuICAgICAgICBpZiAodGhpcy5sb2dpblBhbmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9naW5QYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5pi+56S65a6e5ZCN6K6k6K+B5by556qXXHJcbiAgICAgICAgdGhpcy5yZWFsbmFtZVBhbmVsLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZWFsbmFtZVBhbmVsLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOa3oeWFpeWunuWQjeiupOivgeW8ueeql1xyXG4gICAgICAgIGNvbnN0IGZhZGVJbiA9IGNjLmZhZGVUbyh0aGlzLmZhZGVEdXJhdGlvbiwgMjU1KTtcclxuICAgICAgICB0aGlzLnJlYWxuYW1lUGFuZWwucnVuQWN0aW9uKGZhZGVJbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5riF56m66L6T5YWl5qGGXHJcbiAgICAgICAgaWYgKHRoaXMucmVhbG5hbWVJbnB1dCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlYWxuYW1lSW5wdXQuc3RyaW5nID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlkbnVtSW5wdXQpIHtcclxuICAgICAgICAgICAgdGhpcy5pZG51bUlucHV0LnN0cmluZyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWunuWQjeiupOivgeaMiemSrueCueWHu+S6i+S7tlxyXG4gICAgICovXHJcbiAgICBhc3luYyBvblJlYWxOYW1lQ2xpY2soKSB7XHJcbiAgICAgICAgY29uc3QgcmVhbG5hbWUgPSB0aGlzLnJlYWxuYW1lSW5wdXQgPyB0aGlzLnJlYWxuYW1lSW5wdXQuc3RyaW5nIDogJyc7XHJcbiAgICAgICAgY29uc3QgaWRudW0gPSB0aGlzLmlkbnVtSW5wdXQgPyB0aGlzLmlkbnVtSW5wdXQuc3RyaW5nIDogJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFyZWFsbmFtZSB8fCAhaWRudW0pIHtcclxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6K+36L6T5YWl55yf5a6e5aeT5ZCN5ZKM6Lqr5Lu96K+B5Y+344CCJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6aqM6K+B6Lqr5Lu96K+B5Y+36ZW/5bqm77yIMTjkvY3vvIlcclxuICAgICAgICBpZiAoaWRudW0ubGVuZ3RoICE9PSAxOCkge1xyXG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfouqvku73or4Hlj7fmoLzlvI/kuI3mraPnoa7jgIInKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDlj5HpgIHlrp7lkI3orqTor4Hor7fmsYJcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuW8gOWni+WunuWQjeiupOivgS4uLlwiKTtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5yZWFsTmFtZShBUFBfSUQsIHRoaXMudXNlcm5hbWUsIHJlYWxuYW1lLCBpZG51bSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5a6e5ZCN6K6k6K+B57uT5p6cOlwiLCByZXN1bHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5jb2RlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlrp7lkI3orqTor4HmiJDlip9cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNSZWFsTmFtZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5TVE9SQUdFX0tFWV9SRUFMTkFNRSwgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFVzZXJEYXRhU3luY01hbmFnZXIuc3luY0Zyb21TZXJ2ZXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCflrp7lkI3orqTor4HmiJDlip/vvIzmraPlnKjot7PovazjgIInKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8g5bu26L+f6Lez6L2s5Yiw5Li755WM6Z2iXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvTWFpblNjZW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAxLjApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5a6e5ZCN6K6k6K+B5aSx6LSlXHJcbiAgICAgICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KHJlc3VsdC5tc2cgKyAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5a6e5ZCN6K6k6K+B6L+H56iL5Lit5Ye66ZSZOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIC8vIFRpcHNNYW5hZ2VyLnNob3coJ+e9kee7nOmUmeivr++8jOivt+mHjeivlScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWPkemAgeazqOWGjOivt+axglxyXG4gICAgICogQHBhcmFtIHBhcmFtcyDms6jlhozlj4LmlbBcclxuICAgICAqIEByZXR1cm5zIFByb21pc2U8UmVnaXN0ZXJSZXNwb25zZT5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmVnaXN0ZXIoYXBwaWQ6IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgdHlwZTogbnVtYmVyKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vcGF5LnN6dmktYm8uY29tL3YxL3Rlc3RhcHAvR2V0TG9naW5cIjtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSlNPTuino+aekOmUmeivrzogJHtlLm1lc3NhZ2V9YCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSFRUUOmUmeivrzogJHt4aHIuc3RhdHVzfWApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC5aSx6LSlJykpO1xyXG4gICAgICAgICAgICB4aHIub250aW1lb3V0ID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC6LaF5pe2JykpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBhcHBpZCwgb3BlbmlkOiB1c2VybmFtZSwgdXNlcm5hbWUsIHBhc3N3b3JkLCB0eXBlfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWxOYW1lKGFwcGlkOiBzdHJpbmcsIHVzZXJuYW1lOiBzdHJpbmcsIHJlYWxuYW1lOiBzdHJpbmcsIGlkbnVtOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9SZWFsTmFtZVwiO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBKU09O6Kej5p6Q6ZSZ6K+vOiAke2UubWVzc2FnZX1gKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQ6ZSZ6K+vOiAke3hoci5zdGF0dXN9YCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCfnvZHnu5zor7fmsYLlpLHotKUnKSk7XHJcbiAgICAgICAgICAgIHhoci5vbnRpbWVvdXQgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCfnvZHnu5zor7fmsYLotoXml7YnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh7IGFwcGlkLCB1c2VybmFtZSwgcmVhbG5hbWUsIGlkbnVtIH0pKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvL+ivt+axguW/g+i3s1xyXG4gICAgYXN5bmMgUG9zdEJyZWF0aGUoYXBwaWQ6IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3BheS5zenZpLWJvLmNvbS92MS90ZXN0YXBwL0JyZWF0aGVcIjtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSlNPTuino+aekOmUmeivrzogJHtlLm1lc3NhZ2V9YCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSFRUUOmUmeivrzogJHt4aHIuc3RhdHVzfWApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC5aSx6LSlJykpO1xyXG4gICAgICAgICAgICB4aHIub250aW1lb3V0ID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC6LaF5pe2JykpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBhcHBpZCwgdXNlcm5hbWUgfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOi3s+i9rOWIsOS4u+eVjOmdolxyXG4gICAgICovXHJcbiAgICBnb1RvTWFpblNjZW5lKCkge1xyXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnU3RhcnQnKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNsaWNrVEMoKXtcclxuICAgICAgICAvLyBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ1NwbGFzaCcpO1xyXG4gICAgICAgIHRoaXMucmVhbG5hbWVQYW5lbC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3dMb2dpblBhbmVsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGlja1RpcHMoKXtcclxuICAgICAgICB0aGlzLlRpcHNXbmQuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNsaWNrQ2xvc2VUaXBzKCl7XHJcbiAgICAgICAgdGhpcy5UaXBzV25kLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==