import { _decorator, AudioClip, Component, director, EditBox, Node, profiler, ProgressBar, resources, Slider, Toggle } from 'cc';
import { SCENE_ENUM } from '../Enum';
import { GameBackendApi } from '../GameBackendSdk/GameBackendApi';
import { emits } from './enmus';
import { mGameData } from './GameData';
import { gameConfig } from './gameConfig';
import { loadPool } from './loadPool';
import { load, save } from './tools';
const { ccclass, property } = _decorator;

@ccclass('loadView')
export class loadView extends Component {
    @property(ProgressBar) progre: ProgressBar = null;
    @property(Slider) sli: Slider = null;

    @property(Node) loginPanel: Node = null;
    @property(Node) BtnTips: Node = null;
    @property(EditBox) usernameInput: EditBox = null;
    @property(EditBox) passwordInput: EditBox = null;
    @property(Node) btn_dl: Node = null;
    @property(Node) btn_zc: Node = null;
    @property(Toggle) agreeToggle: Toggle = null;
    @property(Node) TipsWnd: Node = null;
    @property(Node) BtnCloseTips: Node = null;

    @property(Node) realNamePanel: Node = null;
    @property(EditBox) realnameInput: EditBox = null;
    @property(EditBox) idnumInput: EditBox = null;
    @property(Node) btn_realName: Node = null;
    @property(Node) btn_tc: Node = null;

    private username = '';
    private password = '';
    private isRealName = false;

    private readonly STORAGE_KEY_USERNAME = 'SLS_USERNAME';
    private readonly STORAGE_KEY_PASSWORD = 'SLS_PASSWORD';
    private readonly STORAGE_KEY_REALNAME = 'SLS_REALNAME';
    private readonly STORAGE_KEY_USER_ID = 'SLS_USER_ID';
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';

    onLoad() {
        const savedUsername = load(this.STORAGE_KEY_USERNAME, 0);
        const savedPassword = load(this.STORAGE_KEY_PASSWORD, 0);
        const savedRealName = load(this.STORAGE_KEY_REALNAME, 0);

        if (savedUsername && savedPassword) {
            console.log('检测到本地账号信息');
            this.username = savedUsername;
            this.password = savedPassword;
            this.isRealName = savedRealName === 'true';
            gameConfig.setActiveUserContext(this.username);
        }

        if (this.loginPanel) {
            this.loginPanel.active = false;
        }
        if (this.realNamePanel) {
            this.realNamePanel.active = false;
        }

        this.btn_dl.on(Node.EventType.TOUCH_END, this.onLoginClick, this);
        this.btn_zc.on(Node.EventType.TOUCH_END, this.onZhuceClick, this);
        this.btn_realName.on(Node.EventType.TOUCH_END, this.onRealNameClick, this);
        this.btn_tc.on(Node.EventType.TOUCH_END, this.onClickTC, this);
        this.BtnTips.on(Node.EventType.TOUCH_END, this.onClickTips, this);
        this.BtnCloseTips.on(Node.EventType.TOUCH_END, this.onClickCloseTips, this);
        this.TipsWnd.active = false;

        this.preLoad();
    }

    start() {
        profiler.hideStats();
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    /**
     * 预加载资源
     */
    preLoad() {
        director.preloadScene(SCENE_ENUM.BATTLE);

        this.scheduleOnce(() => {
            this.checkLoginStatus();
        }, 5);
    }

    async loadSoundRes() {
        return new Promise((rs) => {
            resources.preloadDir('sound', AudioClip, () => {
                console.log('音频资源预加载完成');
                rs(null);
            });
        });
    }

    /**
     * 检查登录状态
     */
    async checkLoginStatus() {
        if (!this.username || !this.password) {
            console.log('无账号信息，显示登录界面');
            this.showLoginPanel();
            return;
        }

        const globalRealName = load(this.STORAGE_KEY_REALNAME, 0);
        if (globalRealName !== 'true') {
            console.log('已有账号信息但未实名，显示实名认证弹窗');
            this.showRealNamePanel();
            return;
        }

        try {
            const result = await GameBackendApi.getLogin({
                appid: gameConfig.APP_ID,
                username: this.username,
                password: this.password,
                type: 2,
            });
            console.log('登录结果:', result);

            this.syncLoginDataToLocal(result.data || {});
            await this.syncArchiveAfterLogin();

            const canEnter = await this.checkAntiAddictionAndPrepareEnter(this.username);
            if (canEnter) {
                console.log('获取最新登录信息成功，直接进入游戏');
                this.goToMainScene();
            }
        } catch (error) {
            console.error('获取最新登录信息失败:', error);
            console.log('获取最新登录信息失败，但仍进入游戏');
            gameConfig.LoadUserDataFromLocal();
            mGameData.ReloadStamina();
            this.goToMainScene();
        }
    }

    showTips(msg: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(emits.tipMsg, msg);
    }

    private syncLoginDataToLocal(loginData: Record<string, any>) {
        const accountId = loginData.accountId || loginData.user_id;
        gameConfig.setActiveUserContext(this.username, accountId);
        if (accountId) {
            save(this.STORAGE_KEY_USER_ID, accountId.toString());
        }

        if (Object.prototype.hasOwnProperty.call(loginData, 'age')) {
            const isAdult = loginData.age === 1;
            save(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
            console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
        }

        if (Object.prototype.hasOwnProperty.call(loginData, 'rank')) {
            gameConfig.nowLevel = Number(loginData.rank) + 1;
            save('nowLevel', gameConfig.nowLevel.toString());
            console.log(`同步后端关卡数据：rank=${loginData.rank} -> nowLevel=${gameConfig.nowLevel}`);
        }

        if (Object.prototype.hasOwnProperty.call(loginData, 'diamond')) {
            const diamond = Number(loginData.diamond);
            if (!Number.isNaN(diamond)) {
                gameConfig.currentGold = Math.max(0, Math.floor(diamond));
                gameConfig.SaveGoldData(false);
                console.log(`同步后端钻石数据：diamond=${diamond} -> currentGold=${gameConfig.currentGold}`);
            }
        }

        const isRealName = loginData.isrealname === 1 || loginData.is_real === 1;
        if (isRealName) {
            this.isRealName = true;
            save(this.STORAGE_KEY_REALNAME, 'true');
        }
    }

    private async syncArchiveAfterLogin() {
        const hasServerArchive = await gameConfig.SyncUserDataFromServer();
        if (!hasServerArchive) {
            gameConfig.LoadUserDataFromLocal();
            gameConfig.scheduleUserDataSync(true);
        }
    }

    private async checkAntiAddictionAndPrepareEnter(username: string): Promise<boolean> {
        try {
            const antiAddictionResult = await GameBackendApi.breathe({
                appid: gameConfig.APP_ID,
                username,
            });
            console.log('防沉迷检查结果:', antiAddictionResult);

            if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                loadPool.ins.getPoolNode('TipsWnd', this.node);
                director.emit(emits.tipWndMsg, (antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                return false;
            }

            mGameData.ReloadStamina();
            const savedLevel = load('nowLevel', 1);
            if (savedLevel !== null) {
                gameConfig.nowLevel = savedLevel;
            }
            return true;
        } catch (error) {
            console.error('防沉迷检查失败:', error);
            return false;
        }
    }

    /**
     * 登录按钮点击事件
     */
    async onLoginClick() {
        const username = this.usernameInput ? this.usernameInput.string : '';
        const password = this.passwordInput ? this.passwordInput.string : '';

        if (!username || !password) {
            this.showTips('请输入用户名和密码。');
            return;
        }

        if (username.length < 6) {
            this.showTips('用户名长度过短。');
            return;
        }

        if (password.length < 6) {
            this.showTips('密码长度过短。');
            return;
        }

        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            this.showTips('请勾选同意用户协议。');
            return;
        }

        try {
            console.log('开始登录...');
            const result = await GameBackendApi.getLogin({
                appid: gameConfig.APP_ID,
                username,
                password,
                type: 2,
            });
            console.log('登录结果2:', result);

            if (result.code !== 0) {
                if (result.msg === '帐号密码错误' || result.msg === '帐号密码错误。') {
                    this.showTips('帐号密码错误。');
                } else {
                    loadPool.ins.getPoolNode('TipsWnd', this.node);
                    director.emit(emits.tipWndMsg, result.msg);
                }
                return;
            }

            this.username = username;
            this.password = password;
            save(this.STORAGE_KEY_USERNAME, this.username);
            save(this.STORAGE_KEY_PASSWORD, this.password);

            this.syncLoginDataToLocal(result.data || {});
            await this.syncArchiveAfterLogin();

            console.log('账号信息已保存到本地');
            const isRealName = (result.data?.isrealname === 1) || (result.data?.is_real === 1);
            if (!isRealName) {
                this.showRealNamePanel();
                return;
            }

            const canEnter = await this.checkAntiAddictionAndPrepareEnter(username);
            if (!canEnter) {
                return;
            }

            save(this.STORAGE_KEY_REALNAME, 'true');
            this.showTips('登录成功，正在跳转。');
            this.scheduleOnce(() => {
                this.goToMainScene();
            }, 1.0);
        } catch (error) {
            console.error('登录过程中出错:', error);
        }
    }

    /**
     * 注册按钮点击事件
     */
    async onZhuceClick() {
        console.log('注册按钮点击事件');
        const username = this.usernameInput ? this.usernameInput.string : '';
        const password = this.passwordInput ? this.passwordInput.string : '';

        if (!username || !password) {
            this.showTips('请输入用户名和密码。');
            return;
        }

        if (username.length < 6) {
            this.showTips('用户名长度过短。');
            return;
        }

        if (password.length < 6) {
            this.showTips('密码长度过短。');
            return;
        }

        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            this.showTips('请勾选同意用户协议。');
            return;
        }

        try {
            const result = await GameBackendApi.getLogin({
                appid: gameConfig.APP_ID,
                username,
                password,
                type: 1,
            });
            console.log('注册结果:', result);
            this.showTips(result.msg + '');
        } catch (error) {
            console.error('注册过程中出错:', error);
        }
    }

    /**
     * 实名认证按钮点击事件
     */
    async onRealNameClick() {
        const realname = this.realnameInput ? this.realnameInput.string : '';
        const idnum = this.idnumInput ? this.idnumInput.string : '';

        if (!realname || !idnum) {
            this.showTips('请输入真实姓名和身份证号。');
            return;
        }

        if (idnum.length !== 18) {
            this.showTips('身份证号格式不正确。');
            return;
        }

        try {
            console.log('开始实名认证...');
            const result = await GameBackendApi.realName({
                appid: gameConfig.APP_ID,
                username: this.username,
                realname,
                idnum,
            });
            console.log('实名认证结果:', result);

            if (result.code !== 0) {
                this.showTips(result.msg + '');
                return;
            }

            this.isRealName = true;
            save(this.STORAGE_KEY_REALNAME, 'true');
            await this.syncArchiveAfterLogin();

            const canEnter = await this.checkAntiAddictionAndPrepareEnter(this.username);
            if (!canEnter) {
                localStorage.removeItem(this.STORAGE_KEY_USERNAME);
                localStorage.removeItem(this.STORAGE_KEY_PASSWORD);
                localStorage.removeItem(this.STORAGE_KEY_REALNAME);
                this.onClickTC()
                return;
            }

            this.showTips('实名认证成功，正在跳转。');
            mGameData.ReloadStamina();

            this.scheduleOnce(() => {
                this.goToMainScene();
            }, 1.0);
        } catch (error) {
            console.error('实名认证过程中出错:', error);
        }
    }

    /**
     * 显示登录界面
     */
    showLoginPanel() {
        if (!this.loginPanel) {
            this.goToMainScene();
            return;
        }

        this.loginPanel.active = true;

        if (this.usernameInput) {
            this.usernameInput.string = '';
        }
        if (this.passwordInput) {
            this.passwordInput.string = '';
        }
    }

    /**
     * 显示实名认证弹窗
     */
    showRealNamePanel() {
        if (!this.realNamePanel) {
            this.goToMainScene();
            return;
        }

        if (this.loginPanel) {
            this.loginPanel.active = false;
        }

        this.realNamePanel.active = true;

        if (this.realnameInput) {
            this.realnameInput.string = '';
        }
        if (this.idnumInput) {
            this.idnumInput.string = '';
        }
    }

    /**
     * 跳转到主界面
     */
    goToMainScene() {
        director.loadScene('home');
    }

    onClickTC() {
        this.realNamePanel.active = false;
        this.showLoginPanel();
    }

    onClickTips() {
        this.TipsWnd.active = true;
    }

    onClickCloseTips() {
        this.TipsWnd.active = false;
    }
}
