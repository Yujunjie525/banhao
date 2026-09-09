import TipsManager from "./TipsManager";
import mGameData from "../Data/GameData";
import LocalStorageKeys from "../Data/LocalStorageKeys";
import TipsWndManager from "./TipsWnd";
import { GameBackendApi, GameBackendResponse } from '../../script/Api/GameBackendApi';
import { soundManager } from "../../script/common/manager/SoundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashManager extends cc.Component {
    // 闪屏面板
    @property(cc.Node)
    splashPanel: cc.Node = null;

    // 登录面板
    @property(cc.Node)
    loginPanel: cc.Node = null;

    splashDuration: number = 5;

    fadeDuration: number = 0.5;

    // 登录相关
    @property(cc.EditBox)
    usernameInput: cc.EditBox = null;

    @property(cc.EditBox)
    passwordInput: cc.EditBox = null;

    @property(cc.Node)
    loginButton: cc.Node = null;

    @property(cc.Node)
    zhuceBtn: cc.Node = null;

    // 登录协议同意复选框
    @property(cc.Toggle)
    agreeToggle: cc.Toggle = null;

    private username: string = "";
    private password: string = "";
    private isRealName: boolean = false;

    // 实名相关
    @property(cc.Node)
    realnamePanel: cc.Node = null;

    @property(cc.EditBox)
    realnameInput: cc.EditBox = null;

    @property(cc.EditBox)
    idnumInput: cc.EditBox = null;

    @property(cc.Node)
    realnameButton: cc.Node = null;

    @property(cc.Node)
    btn_tc: cc.Node = null;

    @property(cc.Node)
    BtnTips: cc.Node = null;

    @property(cc.Node)
    BtnCloseTips: cc.Node = null;

    @property(cc.Node)
    TipsWnd: cc.Node = null;

    // 本地存储key
    private readonly STORAGE_KEY_USERNAME = LocalStorageKeys.appKey('SLS_USERNAME');
    private readonly STORAGE_KEY_PASSWORD = LocalStorageKeys.appKey('SLS_PASSWORD');
    private readonly STORAGE_KEY_REALNAME = LocalStorageKeys.appKey('SLS_REALNAME');
    private readonly STORAGE_KEY_USER_ID = LocalStorageKeys.appKey('SLS_USER_ID');
    // 年龄状态存储key，1=成年人，其他=未成年人
    private readonly STORAGE_KEY_AGE_STATUS = LocalStorageKeys.appKey('SLS_AGE_STATUS');
    private readonly STORAGE_KEY_LOCAL_RESET_PENDING = LocalStorageKeys.appKey('SLS_LOCAL_RESET_PENDING');

    // 是否已经显示过二十点四十五分的弹窗
    private hasShownTimePopup: boolean = false;

    onLoad() {
        soundManager.installButtonClickSound();


        // 检查本地存储，保存账号信息
        const savedUsername = cc.sys.localStorage.getItem(this.STORAGE_KEY_USERNAME);
        const savedPassword = cc.sys.localStorage.getItem(this.STORAGE_KEY_PASSWORD);
        const savedRealName = cc.sys.localStorage.getItem(this.STORAGE_KEY_REALNAME);

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
    }

    /**
     * 开始闪屏序列
     */
    startSplashSequence() {
        console.log('开始闪屏序列，持续时间:', this.splashDuration, '秒');

        // 闪屏停留指定时间后开始淡出
        this.scheduleOnce(() => {
            this.fadeOutSplash();
        }, this.splashDuration);
    }

    /**
     * 闪屏淡出效果
     */
    fadeOutSplash() {
        if (!this.splashPanel) {
            this.checkLoginStatus();
            return;
        }

        // 创建淡出动画
        const fadeOut = cc.fadeTo(this.fadeDuration, 0);
        const finish = cc.callFunc(() => {
            this.splashPanel.active = false;
            this.checkLoginStatus();
        });
        const sequence = cc.sequence(fadeOut, finish);
        this.splashPanel.runAction(sequence);
    }

    /**
     * 检查登录状态
     */
    async checkLoginStatus() {
        // 判断是否有本地账号信息
        if (this.username && this.password) {
            // 有账号信息，检查全局实名状态
            const globalRealName = cc.sys.localStorage.getItem(this.STORAGE_KEY_REALNAME);
            if (globalRealName === 'true') {
                console.log('已有账号信息且已实名，获取最新登录信息...');
                // 调用register方法获取最新数据
                try {
                    const result = await GameBackendApi.getLogin(this.username, this.password, 2);
                    // const result = await this.register("app.yongshixunzhang", this.username, this.password, 2);
                    console.log("登录结果:", result);

                    // 保存最新的user_id到本地
                    if (result.data.accountId) {
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, result.data.accountId.toString());
                    }
                    if (result.data.user_id) {
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, result.data.user_id.toString());
                    }
                    mGameData.resetRuntimeDataForUserSwitch();
                    mGameData.loadLocalUserScopedData();
                    const localResetPending = this.isLocalResetPending();

                    // 保存年龄状态：1=成年人，其他=未成年人
                    if (result.data.hasOwnProperty('age')) {
                        const isAdult = result.data.age === 1;
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                        console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                    }

                    // 保存钻石数据
                    // if (result.data.hasOwnProperty('diamond')) {
                    //     // 获取用户ID
                    //     const userId = result.data.accountId || result.data.user_id;
                    //     // 保存带用户ID后缀的钻石数据
                    //     const goldKey = userId ? `CurrentGold_${userId}` : 'CurrentGold';
                    //     cc.sys.localStorage.setItem(goldKey, result.data.diamond.toString());
                    //     // 同时保存默认key的钻石数据，用于兼容
                    //     cc.sys.localStorage.setItem('CurrentGold', result.data.diamond.toString());
                    //     // 直接更新GameData中的钻石值
                    //     mGameData.currentGold = result.data.diamond;
                    // }

                    // 设置道具库存
                    if (result.data.foam && result.data.used_foam) {
                        // 计算道具1的库存：总数量 - 已使用数量
                        const item1Stock = result.data.foam - result.data.used_foam;
                        // 计算道具2的库存：总数量 - 已使用数量
                        const item2Stock = result.data.wing - result.data.used_wing;
                        // 构造道具库存数组 [道具1库存, 道具2库存, 道具3库存]
                        const itemStock = [item1Stock, item2Stock, 0];
                        // 获取带用户ID后缀的存储key
                        const userId = result.data.accountId || result.data.user_id;
                        const itemStockKey = LocalStorageKeys.userKey('ItemStock', userId);
                        // 以JSON字符串形式存储道具库存
                        cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(itemStock));
                        console.log('道具库存设置成功:', itemStock);
                    }

                    // 保存关卡数据，使用服务器返回的rank作为关卡值
                    if (!localResetPending && result.data.hasOwnProperty('rank')) {
                        // 获取用户ID
                        const userId = result.data.accountId || result.data.user_id;
                        // 获取带用户ID后缀的存储key
                        const currentLevelKey = LocalStorageKeys.userKey('CurrentLevel', userId);
                        const unlockedLevelKey = LocalStorageKeys.userKey('UnlockedLevel', userId);
                        const totalLevels = mGameData.getTotalLevels();
                        const clearedRank = Math.max(0, Math.min(totalLevels, Number(result.data.rank) || 0));
                        const currentLevel = Math.max(1, Math.min(totalLevels, clearedRank || 1));
                        const unlockedLevel = Math.max(1, Math.min(totalLevels, clearedRank > 0 ? clearedRank + 1 : 1));
                        // 保存关卡数据到本地
                        cc.sys.localStorage.setItem(currentLevelKey, currentLevel.toString());
                        // 已通关rank关，解锁rank+1关
                        cc.sys.localStorage.setItem(unlockedLevelKey, unlockedLevel.toString());
                        // 直接修改GameData中的关卡值，确保数据立即生效
                        mGameData.currentLevel = currentLevel;
                        mGameData.unlockedLevel = unlockedLevel;
                        cc.sys.localStorage.setItem(currentLevelKey, mGameData.currentLevel.toString());
                        cc.sys.localStorage.setItem(unlockedLevelKey, mGameData.unlockedLevel.toString());
                        // 同时保存一个不带用户ID的副本，用于兼容
                        console.log('使用服务器返回的rank作为关卡值:', result.data.rank, '已解锁关卡:', result.data.rank + 1);
                    }

                    // 更新实名状态
                    const isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                    if (isRealName) {
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');
                    }
                    const loadedServerUserData = localResetPending ? false : await mGameData.loadUserDataFromServer();
                    if (localResetPending) {
                        this.finishLocalResetForLoggedInUser();
                    } else if (!loadedServerUserData) {
                        mGameData.loadLocalUserScopedData();
                    }

                    // 进行防沉迷检查
                    try {
                        const antiAddictionResult = await GameBackendApi.breathe(this.username);
                        // const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", this.username);
                        console.log("防沉迷检查结果2:", antiAddictionResult);

                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsManager.show((antiAddictionResult.msg + '。') || '未成年用户禁止进入游戏。');
                            TipsWndManager.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            return; // 阻止进入游戏)
                        }

                        // 防沉迷检查通过，进入游戏
                        console.log('获取最新登录信息成功，直接进入游戏');
                        // 重新加载钻石数据，确保获取最新保存的值
                        mGameData.GetGoldData();
                        this.goToMainScene();
                    } catch (error) {
                        console.error("防沉迷检查失败:", error);
                        // TipsManager.show('防沉迷检查失败，请重试');
                    }
                } catch (error) {
                    console.error('获取最新登录信息失败:', error);
                    // 即使失败也继续进入游戏
                    console.log('获取最新登录信息失败，但仍进入游戏');
                    // 重新加载钻石数据，确保获取最新保存的值
                    mGameData.GetGoldData();
                    this.goToMainScene();
                }
            } else {
                console.log('已有账号信息但未实名，显示实名认证弹窗');
                this.showRealNamePanel();
            }
        } else {
            console.log('无账号信息，显示登录界面');
            this.showLoginPanel();
        }
    }

    /**
     * 显示登录界面
     */
    showLoginPanel() {
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
        const fadeIn = cc.fadeTo(this.fadeDuration, 255);
        this.loginPanel.runAction(fadeIn);

        // 清空输入框
        if (this.usernameInput) {
            this.usernameInput.string = '';
        }
        if (this.passwordInput) {
            this.passwordInput.string = '';
        }

    }

    /**
     * 登录按钮点击事件
     */
    async onLoginClick() {
        const username = this.usernameInput ? this.usernameInput.string : '';
        const password = this.passwordInput ? this.passwordInput.string : '';

        if (!username || !password) {
            TipsManager.show('请输入用户名和密码。');
            return;
        }

        // 验证用户名长度（2-16）
        if (username.length < 2) {
            TipsManager.show('用户名长度过短。');
            return;
        }

        // 验证密码长度（6-16）
        if (password.length < 6) {
            TipsManager.show('密码长度过短。');
            return;
        }

        // 检查是否勾选同意协议
        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            TipsManager.show('请勾选同意用户协议。');
            return;
        }

        // 登录、注册
        try {
            console.log("开始登录...");
            const result = await GameBackendApi.getLogin(username, password, 2);
            // const result = await this.register("app.yongshixunzhang", username, password, 2);
            console.log("登录结果:", result);

            if (result.code === 0) {
                // 登录成功
                this.username = username;
                this.password = password;

                // 保存账号信息到本地
                cc.sys.localStorage.setItem(this.STORAGE_KEY_USERNAME, this.username);
                cc.sys.localStorage.setItem(this.STORAGE_KEY_PASSWORD, this.password);

                // 保存user_id到本地
                let userId = null;
                if (result.data.accountId) {
                    userId = result.data.accountId.toString();
                    cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, userId);
                }
                if (result.data.user_id) {
                    userId = result.data.user_id.toString();
                    cc.sys.localStorage.setItem(this.STORAGE_KEY_USER_ID, userId);
                }
                mGameData.resetRuntimeDataForUserSwitch();
                mGameData.loadLocalUserScopedData();
                const localResetPending = this.isLocalResetPending();

                // 保存年龄状态：1=成年人，其他=未成年人
                if (result.data.hasOwnProperty('age')) {
                    const isAdult = result.data.age === 1;
                    cc.sys.localStorage.setItem(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                    console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                }

                // 保存钻石数据，无论是否为0都保存
                // if (result.data.hasOwnProperty('diamond')) {
                //     // 先将钻石数据保存到本地存储
                //     const goldKey = userId ? `CurrentGold_${userId}` : 'CurrentGold';
                //     cc.sys.localStorage.setItem(goldKey, result.data.diamond.toString());
                //     // 验证是否保存成功
                //     const savedValue = cc.sys.localStorage.getItem(goldKey);
                //     // 直接修改GameData中的钻石值，确保数据立即生效
                //     mGameData.currentGold = result.data.diamond;
                //     // 同时保存一个不带用户ID的副本，用于兼容
                //     cc.sys.localStorage.setItem('CurrentGold', result.data.diamond.toString());
                // }

                // 保存关卡数据和星级，使用服务器返回的ranklist数组
                if (!localResetPending && result.data.ranklist && Array.isArray(result.data.ranklist)) {
                    const ranklist = result.data.ranklist;
                    mGameData.applyServerRankStars(ranklist, true);
                    let highestRank = 0;

                    // 遍历ranklist数组，保存每一关的星级和更新最高关卡
                    for (let i = 0; i < ranklist.length; i++) {
                        const levelData = ranklist[i];
                        if (levelData && typeof levelData.rank === 'number') {
                            const level = levelData.rank;

                            // 保存关卡星级
                            // 保存一个不带用户ID的副本，用于兼容

                            // 更新最高关卡
                            if (level > highestRank) {
                                highestRank = level;
                            }
                        }
                    }

                    if (highestRank > 0) {
                        // 获取带用户ID后缀的存储key
                        const currentLevelKey = LocalStorageKeys.userKey('CurrentLevel', userId);
                        const unlockedLevelKey = LocalStorageKeys.userKey('UnlockedLevel', userId);
                        const totalLevels = mGameData.getTotalLevels();
                        const currentLevel = Math.max(1, Math.min(totalLevels, highestRank));
                        const unlockedLevel = Math.max(1, Math.min(totalLevels, currentLevel + 1));


                        // 保存最高关卡和已解锁关卡
                        cc.sys.localStorage.setItem(currentLevelKey, currentLevel.toString());
                        // 已通关highestRank关，解锁highestRank+1关
                        cc.sys.localStorage.setItem(unlockedLevelKey, unlockedLevel.toString());

                        // 直接修改GameData中的关卡值，确保数据立即生效
                        mGameData.currentLevel = currentLevel;
                        mGameData.unlockedLevel = unlockedLevel;
                        cc.sys.localStorage.setItem(currentLevelKey, mGameData.currentLevel.toString());
                        cc.sys.localStorage.setItem(unlockedLevelKey, mGameData.unlockedLevel.toString());

                        // 同时保存不带用户ID的副本，用于兼容

                        console.log('使用服务器返回的ranklist数组设置关卡值:', highestRank, '已解锁关卡:', highestRank + 1);
                    }
                }
                if (result.data.foam && result.data.used_foam) {
                    // 计算道具1的库存：总数量 - 已使用数量
                    const item1Stock = result.data.foam - result.data.used_foam;
                    // 计算道具2的库存：总数量 - 已使用数量
                    const item2Stock = result.data.wing - result.data.used_wing;
                    // 构造道具库存数组 [道具1库存, 道具2库存, 道具3库存]
                    const itemStock = [item1Stock, item2Stock, 0];
                    // 获取带用户ID后缀的存储key
                    const userId = result.data.accountId || result.data.user_id;
                    const itemStockKey = LocalStorageKeys.userKey('ItemStock', userId);
                    // 以JSON字符串形式存储道具库存
                    cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(itemStock));
                    console.log('道具库存设置成功:', itemStock);
                }

                console.log("账号信息已保存到本地");
                // TipsManager.show(result.data.isrealname === 1 ? '已实名' : '未实名');
                console.log("result.data.isrealname:", result.data.isrealname);
                console.log("result.data.is_real:", result.data.is_real);
                const isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                const loadedServerUserData = localResetPending ? false : await mGameData.loadUserDataFromServer();
                if (localResetPending) {
                    this.finishLocalResetForLoggedInUser();
                } else if (!loadedServerUserData) {
                    mGameData.loadLocalUserScopedData();
                }
                if (isRealName) {
                    // 已实名，进行防沉迷检查
                    try {
                        const antiAddictionResult = await GameBackendApi.breathe(username);
                        // const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", username);
                        console.log("防沉迷检查结果:", antiAddictionResult);

                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsManager.show((antiAddictionResult.msg + '。') || '未成年用户禁止进入游戏。');
                            TipsWndManager.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            return; // 阻止进入游戏
                        }

                        // 防沉迷检查通过，进入游戏
                        cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');
                        TipsManager.show('登录成功，正在跳转。');
                        this.scheduleOnce(() => {
                            // 重新加载钻石数据，确保获取最新保存的值
                            mGameData.GetGoldData();
                            this.goToMainScene();
                        }, 1.0);
                    } catch (error) {
                        console.error("防沉迷检查失败:", error);
                        // TipsManager.show('防沉迷检查失败，请重试');
                    }
                } else {
                    this.showRealNamePanel();
                }
            } else {
                // TipsManager.show(result.msg);
                if (result.msg == "帐号密码错误" || result.msg == "帐号密码错误。") {
                    TipsManager.show('帐号密码错误。');
                } else {
                    TipsWndManager.show(result.msg);
                }
            }

        } catch (error) {
            console.error("登录过程中出错:", error);
            // TipsManager.show('网络错误，请重试');
        }
    }
    /**
     * 注册按钮点击事件
     */
    async onZhuceClick() {
        console.log("注册按钮点击事件");
        const username = this.usernameInput ? this.usernameInput.string : '';
        const password = this.passwordInput ? this.passwordInput.string : '';

        if (!username || !password) {
            TipsManager.show('请输入用户名和密码。');
            return;
        }

        // 验证用户名长度（2-16）
        if (username.length < 2) {
            TipsManager.show('用户名长度过短。');
            return;
        }

        // 验证密码长度（6-16）
        if (password.length < 6) {
            TipsManager.show('密码长度过短。');
            return;
        }

        // 检查是否勾选同意协议
        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            TipsManager.show('请勾选同意用户协议。');
            return;
        }

        // 注册
        try {
            const result = await GameBackendApi.getLogin(username, password, 1);
            // const result = await this.register("app.yongshixunzhang", username, password, 1);
            console.log("注册结果:", result);
            TipsManager.show(result.msg + '');
        } catch (error) {
            console.error("注册过程中出错:", error);
        }
    }

    /**
     * 显示实名认证弹窗
     */
    showRealNamePanel() {
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
        const fadeIn = cc.fadeTo(this.fadeDuration, 255);
        this.realnamePanel.runAction(fadeIn);

        // 清空输入框
        if (this.realnameInput) {
            this.realnameInput.string = '';
        }
        if (this.idnumInput) {
            this.idnumInput.string = '';
        }
    }

    /**
     * 实名认证按钮点击事件
     */
    async onRealNameClick() {
        const realname = this.realnameInput ? this.realnameInput.string : '';
        const idnum = this.idnumInput ? this.idnumInput.string : '';

        if (!realname || !idnum) {
            TipsManager.show('请输入真实姓名和身份证号。');
            return;
        }

        // 验证身份证号长度（18位）
        if (idnum.length !== 18) {
            TipsManager.show('身份证号格式不正确。');
            return;
        }

        // 发送实名认证请求
        try {
            console.log("开始实名认证...");
            const result = await GameBackendApi.realName(this.username, realname, idnum);
            // const result = await this.realName("app.yongshixunzhang", this.username, realname, idnum);
            console.log("实名认证结果:", result);

            if (result.code === 0) {
                // 实名认证成功
                this.isRealName = true;
                cc.sys.localStorage.setItem(this.STORAGE_KEY_REALNAME, 'true');

                TipsManager.show('实名认证成功，正在跳转。');

                // 延迟跳转到主界面
                this.scheduleOnce(() => {
                    this.goToMainScene();
                }, 1.0);
            } else {
                // 实名认证失败
                TipsManager.show(result.msg + '');
            }
        } catch (error) {
            console.error("实名认证过程中出错:", error);
            // TipsManager.show('网络错误，请重试');
        }
    }

    /**
     * 跳转到主界面
     */
    goToMainScene() {
        cc.director.loadScene('main');
    }

    private isLocalResetPending(): boolean {
        return cc.sys.localStorage.getItem(this.STORAGE_KEY_LOCAL_RESET_PENDING) === 'true';
    }

    private finishLocalResetForLoggedInUser(): void {
        mGameData.resetRuntimeDataForUserSwitch();
        mGameData.SaveLevelData();
        mGameData.SaveGoldData();
        mGameData.requestSyncUserData(0);
        cc.sys.localStorage.removeItem(this.STORAGE_KEY_LOCAL_RESET_PENDING);
        console.log('local reset pending handled: server save restore skipped and default progress synced');
    }

    onClickTC() {
        // cc.director.loadScene('Splash');
        this.realnamePanel.active = false;
        this.showLoginPanel();
    }

    onClickTips() {
        this.TipsWnd.active = true;
    }

    onClickCloseTips() {
        this.TipsWnd.active = false;
    }
}
