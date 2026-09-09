import { _decorator, Component, director, EditBox, Node, profiler, ProgressBar, Slider, sys, Toggle } from 'cc';
import { gameConfig } from './data/gameConfig';
import { load, save } from './untils/tools';
import { loadPool } from './res/loadPool';
import { emits } from './data/enmus';
import { mGameData } from './untils/GameData';
const { ccclass, property } = _decorator;

@ccclass('loadView')
export class loadView extends Component {
    // 进度条
    @property(ProgressBar) progre: ProgressBar = null
    //滑动器节点
    @property(Slider) sli: Slider = null

    // 登录面板
    @property(Node) loginPanel: Node = null;
    @property(Node) BtnTips: Node = null;
    @property(EditBox) usernameInput: EditBox = null;
    @property(EditBox) passwordInput: EditBox = null;
    @property(Node) btn_dl: Node = null;
    @property(Node) btn_zc: Node = null;
    @property(Toggle) agreeToggle: Toggle = null;
    @property(Node) TipsWnd: Node = null;
    @property(Node) BtnCloseTips: Node = null;

    // 实名面板
    @property(Node) realNamePanel: Node = null;
    @property(EditBox) realnameInput: EditBox = null;
    @property(EditBox) idnumInput: EditBox = null;
    @property(Node) btn_realName: Node = null;
    @property(Node) btn_tc: Node = null;

    private username:string = "";
    private password:string = "";
    private isRealName:boolean = false;
    // 本地存储key
    private readonly STORAGE_KEY_USERNAME = 'SLS_USERNAME';
    private readonly STORAGE_KEY_PASSWORD = 'SLS_PASSWORD';
    private readonly STORAGE_KEY_REALNAME = 'SLS_REALNAME';
    private readonly STORAGE_KEY_USER_ID = 'SLS_USER_ID';
    // 年龄状态存储key，1=成年人，其他=未成年人
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';

    onLoad() {
        // 检查本地存储，保存账号信息
        const savedUsername = load(this.STORAGE_KEY_USERNAME, 0);
        const savedPassword = load(this.STORAGE_KEY_PASSWORD, 0);
        const savedRealName = load(this.STORAGE_KEY_REALNAME, 0);

        if (savedUsername && savedPassword) {
            console.log('检测到本地账号信息');
            this.username = savedUsername;
            this.password = savedPassword;
            this.isRealName = savedRealName === 'true';
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
    }

    start() {
        profiler.hideStats();
        this.startJindu()
    }
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
    /**
   * 进度条进度
   */
    startJindu() {
        this.progre.progress = 0;
        this.sli.progress = 0;
        // 将在 10 秒后开始计时，每 5 秒执行一次回调，重复 3 + 1 次
        this.schedule(() => {
            this.progre.progress += 0.1;
            this.sli.progress += 0.1;
            if (this.progre.progress >= 0.5) {
                this.unschedule(this.schedule)
                this.jinduPause()
            }
        }, 0.1, 4, 0.05);
    }
    jinduPause() {
        this.scheduleOnce(() => {
            this.loadScene()
        }, 3)
    }
    loadScene() {
        this.schedule(() => {
            if (this.progre.progress >= 0.9) {
                this.progre.progress = 1;
                this.sli.progress = 1;
                this.unschedule(this.schedule)
                // director.loadScene("home")
                this.checkLoginStatus();
                return
            }
            this.progre.progress += 0.1;
            this.sli.progress += 0.1;
        }, 0.1, 5, 0.2);
    }

    /**
     * 检查登录状态
     */
    async checkLoginStatus() {
        // 判断是否有本地账号信息
        if (this.username && this.password) {
            // 有账号信息，检查全局实名状态
            const globalRealName = load(this.STORAGE_KEY_REALNAME, 0);
            if (globalRealName === 'true') {
                console.log('已有账号信息且已实名，获取最新登录信息...');
                // 调用register方法获取最新数据
                try {
                    const result = await this.register("app.yongshixunzhang", this.username, this.password, 2);
                    console.log("登录结果:", result);
                    
                    // 保存最新的user_id到本地
                    if (result.data.accountId) {
                        save(this.STORAGE_KEY_USER_ID, result.data.accountId.toString());
                    }
                    if (result.data.user_id) {
                        save(this.STORAGE_KEY_USER_ID, result.data.user_id.toString());
                    }
                    
                    // 保存年龄状态：1=成年人，其他=未成年人
                    if (result.data.hasOwnProperty('age')) {
                        const isAdult = result.data.age === 1;
                        save(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                        console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                    }
                    
                    // 保存钻石数据
                    // if (result.data.hasOwnProperty('diamond')) {
                    //     // 获取用户ID
                    //     const userId = result.data.accountId || result.data.user_id;
                    //     // 保存带用户ID后缀的钻石数据
                    //     const goldKey = userId ? `CurrentGold_${userId}` : 'CurrentGold';
                    //     save(goldKey, result.data.diamond.toString());
                    //     // 同时保存默认key的钻石数据，用于兼容
                    //     save('CurrentGold', result.data.diamond.toString());
                    //     // 直接更新GameData中的钻石值
                    //     gameConfig.currentGold = result.data.diamond;
                    // }
                    
                    // 同步后端关卡数据
                    if (result.data.hasOwnProperty('rank')) {
                        // 根据后端rank字段计算前端nowLevel（rank=已完成关卡数，nowLevel=当前解锁关卡数）
                        gameConfig.nowLevel = result.data.rank + 1;
                        // 保存到本地存储
                        save('nowLevel', gameConfig.nowLevel.toString());
                        console.log(`同步后端关卡数据：rank=${result.data.rank} → nowLevel=${gameConfig.nowLevel}`);
                    }
                    
                    // 设置道具库存
                    // if (result.data.foam && result.data.used_foam) {
                    //     // 计算道具1的库存：总数量 - 已使用数量
                    //     const item1Stock = result.data.foam - result.data.used_foam;
                    //     // 计算道具2的库存：总数量 - 已使用数量
                    //     const item2Stock = result.data.wing - result.data.used_wing;
                    //     // 构造道具库存数组 [道具1库存, 道具2库存, 道具3库存]
                    //     const itemStock = [item1Stock, item2Stock, 0];
                    //     // 获取带用户ID后缀的存储key
                    //     const userId = result.data.accountId || result.data.user_id;
                    //     const itemStockKey = userId ? `ItemStock_${userId}` : 'ItemStock';
                    //     // 以JSON字符串形式存储道具库存
                    //     save(itemStockKey, JSON.stringify(itemStock));
                    //     console.log('道具库存设置成功:', itemStock);
                    // }
                    
                    // 更新实名状态
                    const isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                    if (isRealName) {
                        save(this.STORAGE_KEY_REALNAME, 'true');
                    }
                    
                    // 进行防沉迷检查
                    try {
                        const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", this.username);
                        console.log("登录界面防沉迷检查结果:", antiAddictionResult);
                        
                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsWndManager.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            loadPool.ins.getPoolNode('TipsWnd', this.node)
                            director.emit(emits.tipWndMsg, antiAddictionResult.msg + '')
                            return; // 阻止进入游戏)
                        }
        
                        // 防沉迷检查通过，进入游戏
                        console.log('获取最新登录信息成功，直接进入游戏');
                        // 重新加载当前账户的体力数据
                        mGameData.ReloadStamina();
                        // 重新加载关卡数据
                        const savedLevel = load('nowLevel', 1);
                        if (savedLevel !== null) {
                            gameConfig.nowLevel = savedLevel;
                        }
                        this.goToMainScene();
                    } catch (error) {
                        console.error("防沉迷检查失败:", error);
                    }
                } catch (error) {
                    console.error('获取最新登录信息失败:', error);
                    // 即使失败也继续进入游戏
                    console.log('获取最新登录信息失败，但仍进入游戏');
                    // 重新加载当前账户的体力数据
                    mGameData.ReloadStamina();
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

    showTips(msg: string) {
        loadPool.ins.getPoolNode('tips', this.node)
        director.emit(emits.tipMsg, msg)
    }

    /**
     * 登录按钮点击事件
     */
    async onLoginClick() {
        const username = this.usernameInput ? this.usernameInput.string : '';
        const password = this.passwordInput ? this.passwordInput.string : '';
        
        if (!username || !password) {
            // TipsManager.show('请输入用户名和密码。');
            this.showTips('请输入用户名和密码。')
            return;
        }
        
        // 验证用户名长度（6-16）
        if (username.length < 6) {
            // TipsManager.show('用户名长度过短。');
            this.showTips('用户名长度过短。')
            return;
        }
        
        // 验证密码长度（6-16）
        if (password.length < 6) {
            // TipsManager.show('密码长度过短。');
            this.showTips('密码长度过短。')
            return;
        }
        
        // 检查是否勾选同意协议
        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            // TipsManager.show('请勾选同意用户协议。');   
            this.showTips('请勾选同意用户协议。')
            return;
        }
        
        // 登录、注册
        try {
            console.log("开始登录...");
            const result = await this.register("app.yongshixunzhang", username, password, 2);
            console.log("登录结果2:", result);
            
            if (result.code === 0) {
                // 登录成功
                this.username = username;
                this.password = password;
                
                // 保存账号信息到本地
                save(this.STORAGE_KEY_USERNAME, this.username);
                save(this.STORAGE_KEY_PASSWORD, this.password);
                
                // 保存user_id到本地
                let userId = null;
                if (result.data.accountId) {
                    userId = result.data.accountId.toString();
                    save(this.STORAGE_KEY_USER_ID, userId);
                }
                if (result.data.user_id) {
                    userId = result.data.user_id.toString();
                    save(this.STORAGE_KEY_USER_ID, userId);
                }
                
                // 保存年龄状态：1=成年人，其他=未成年人
                if (result.data.hasOwnProperty('age')) {
                    const isAdult = result.data.age === 1;
                    save(this.STORAGE_KEY_AGE_STATUS, isAdult ? '1' : '0');
                    console.log('年龄状态:', isAdult ? '成年人' : '未成年人');
                }

                // 同步后端关卡数据
                if (result.data.hasOwnProperty('rank')) {
                    // 根据后端rank字段计算前端nowLevel（rank=已完成关卡数，nowLevel=当前解锁关卡数）
                    gameConfig.nowLevel = result.data.rank + 1;
                    // 保存到本地存储
                    save('nowLevel', gameConfig.nowLevel.toString());
                    console.log(`同步后端关卡数据：rank=${result.data.rank} → nowLevel=${gameConfig.nowLevel}`);
                }

                // 保存钻石数据，无论是否为0都保存
                // if (result.data.hasOwnProperty('diamond')) {
                //     // 先将钻石数据保存到本地存储
                //     const goldKey = userId ? `CurrentGold_${userId}` : 'CurrentGold';
                //     save(goldKey, result.data.diamond.toString());
                //     // 直接修改GameData中的钻石值，确保数据立即生效
                //     gameConfig.currentGold = result.data.diamond;
                //     // 同时保存一个不带用户ID的副本，用于兼容
                //     save('CurrentGold', result.data.diamond.toString());
                // }
            
                console.log("账号信息已保存到本地");
                console.log("result.data.isrealname:", result.data.isrealname);
                console.log("result.data.is_real:", result.data.is_real);
                const isRealName = result.data.isrealname === 1 || result.data.is_real === 1;
                if (isRealName) {
                    // 已实名，进行防沉迷检查
                    try {
                        const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", username);
                        console.log("防沉迷检查结果:", antiAddictionResult);
                        
                        if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                            // TipsManager.show((antiAddictionResult.msg + '。') || '未成年用户禁止进入游戏。');
                            // TipsWndManager.show((antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。');
                            loadPool.ins.getPoolNode('TipsWnd', this.node)
                            director.emit(emits.tipWndMsg, (antiAddictionResult.msg + '') || '未成年用户禁止进入游戏。')
                            return; // 阻止进入游戏
                        }
                        
                        // 防沉迷检查通过，进入游戏
                save(this.STORAGE_KEY_REALNAME, 'true');
                // TipsManager.show('登录成功，正在跳转。');
                this.showTips('登录成功，正在跳转。')
                // 重新加载当前账户的体力数据
                mGameData.ReloadStamina();
                // 重新加载关卡数据
                const savedLevel = load('nowLevel', 1);
                if (savedLevel !== null) {
                    gameConfig.nowLevel = savedLevel;
                }
                this.scheduleOnce(() => {
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
                // TipsWndManager.show(result.msg);
                if (result.msg == "帐号密码错误" || result.msg == "帐号密码错误。"){
                    this.showTips('帐号密码错误。')
                } else {
                    loadPool.ins.getPoolNode('TipsWnd', this.node)
                    director.emit(emits.tipWndMsg, result.msg)
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
            // TipsManager.show('请输入用户名和密码。');
            this.showTips('请输入用户名和密码。')
            return;
        }
        
        // 验证用户名长度（6-16）
        if (username.length < 6) {
            // TipsManager.show('用户名长度过短。');
            this.showTips('用户名长度过短。')
            return;
        }
        
        // 验证密码长度（6-16）
        if (password.length < 6) {
            // TipsManager.show('密码长度过短。');
            this.showTips('密码长度过短。')
            return;
        }
        
        // 检查是否勾选同意协议
        if (!this.agreeToggle || !this.agreeToggle.isChecked) {
            // TipsManager.show('请勾选同意用户协议。');   
            this.showTips('请勾选同意用户协议。')
            return;
        }

        // 注册
        try {
            const result = await this.register("app.yongshixunzhang", username, password, 1);
            console.log("注册结果:", result);
            // TipsManager.show(result.msg + '');
            this.showTips(result.msg + '')
        } catch (error) {
            console.error("注册过程中出错:", error);
        }
    }

    /**
     * 实名认证按钮点击事件
     */
    async onRealNameClick() {
        const realname = this.realnameInput ? this.realnameInput.string : '';
        const idnum = this.idnumInput ? this.idnumInput.string : '';
        
        if (!realname || !idnum) {
            // TipsManager.show('请输入真实姓名和身份证号。');
            this.showTips('请输入真实姓名和身份证号。')
            return;
        }
        
        // 验证身份证号长度（18位）
        if (idnum.length !== 18) {
            // TipsManager.show('身份证号格式不正确。');
            this.showTips('身份证号格式不正确。')
            return;
        }
        
        // 发送实名认证请求
        try {
            console.log("开始实名认证...");
            const result = await this.realName("app.yongshixunzhang", this.username, realname, idnum);
            console.log("实名认证结果:", result);
            
            if (result.code === 0) {
                // 实名认证成功
                this.isRealName = true;
                save(this.STORAGE_KEY_REALNAME, 'true');
                
                // TipsManager.show('实名认证成功，正在跳转。');
                this.showTips('实名认证成功，正在跳转。')
                
                // 重新加载当前账户的体力数据
                mGameData.ReloadStamina();
                
                // 延迟跳转到主界面
                this.scheduleOnce(() => {
                    this.goToMainScene();
                }, 1.0);
            } else {
                // 实名认证失败
                // TipsManager.show(result.msg + '');
                this.showTips(result.msg + '')
            }
        } catch (error) {
            console.error("实名认证过程中出错:", error);
            // TipsManager.show('网络错误，请重试');
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
        
        // 显示登录界面
        this.loginPanel.active = true;
        this.loginPanel.opacity = 0;
        
        // 清空输入框
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
        
        // 隐藏登录面板
        if (this.loginPanel) {
            this.loginPanel.active = false;
        }
        
        // 显示实名认证弹窗
        this.realNamePanel.active = true;
        this.realNamePanel.opacity = 0;
        
        // 清空输入框
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

    onClickTC(){
        this.realNamePanel.active = false;
        this.showLoginPanel();
    }

    onClickTips(){
        this.TipsWnd.active = true;
    }

    onClickCloseTips(){
        this.TipsWnd.active = false;
    }


    /**
     * 发送注册请求
     * @param params 注册参数
     * @returns Promise<RegisterResponse>
     */
    async register(appid: string, username: string, password: string, type: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/GetLogin";
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
            
            xhr.send(JSON.stringify({ appid, openid: username, username, password, type}));
        });
    }

    async realName(appid: string, username: string, realname: string, idnum: string): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/RealName";
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
            
            xhr.send(JSON.stringify({ appid, username, realname, idnum }));
        });
    }

    //请求心跳
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
}


