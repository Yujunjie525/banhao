"use strict";
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