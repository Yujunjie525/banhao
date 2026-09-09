import { _decorator, Button, Component, director, Label, Node, profiler, sys } from 'cc';
import { loadPool } from './res/loadPool';
import { bgmName, emits } from './data/enmus';
import { audioTool } from './untils/audioTool';
import { gameConfig } from './data/gameConfig';
import { wxAd } from './AD/wxAd';
import { loadRes } from './res/loadRes';
import { load, save } from './untils/tools';
import { mGameData } from './untils/GameData';
const { ccclass, property } = _decorator;

@ccclass('homeView')
export class homeView extends Component {
     // 开场动画
    @property(Node) cbl: Node;
    @property(Label) user_label:Label = null; //当前用户名
    @property(Node) btn_reset:Node = null; //重置按钮
    @property(Node) btn_test:Node = null; //切换按钮
    @property(Label) btn_test_label:Label = null; //切换按钮文本
     @property(Node) time_node: Node = null;;
    @property(Label) staminaLabel:Label = null; //体力显示标签
    @property(Label) recoverTimerLabel:Label = null; //恢复倒计时显示标签
    // 跟踪用户手动隐藏recoverTimerLabel的状态
    // 初始设置为true，确保recoverTimerLabel默认是隐藏的
    private isRecoverTimerManuallyHidden: boolean = true;

    // 年龄状态存储key，1=成年人，其他=未成年人
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
    // 是否已经显示过二十点四十五分的弹窗
    private hasShownTimePopup: boolean = false;
    // 防沉迷检查间隔时间（秒）
    private antiAddictionInterval: number = 5; // 默认5秒检查一次
    
    start() {
        profiler.hideStats()
        this.init()
        this.cbl.active = false;
    }
    gerCbl(){
        this.cbl.active = !this.cbl.active;  
    }
    init() {
        audioTool.ins.playMusic(bgmName.music_bg)
        if (gameConfig.isAd) {
            // 音频中断监听
            wxAd.ins.bgmZd(() => {
                audioTool.ins.playMusic(bgmName.music_bg)
            })
            // 显示首页广告
            wxAd.ins.showBanner()
        }
        // 预加载下一关
        director.preloadScene(
            'main',
            (completedCount: number, totalCount: number, item: any) => {
                // console.log(completedCount, totalCount);
            },
            () => {
                console.log('主界面预加载完成');
            }
        );
    }

    onLoad(){
        this.updateUserDisplay();

        this.btn_reset.on(Node.EventType.TOUCH_END,this.ResetAccount,this);
        this.btn_test.on(Node.EventType.TOUCH_END,this.toggleGameMode,this);

        // 重新加载当前账户的体力数据
        mGameData.ReloadStamina();

        // 进行防沉迷检查
        this.checkAntiAddiction();
        
        // 设置定期防沉迷检查定时器
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);

        // 初始化时只需要调用一次UpdateRecoverTimerDisplay，它会处理所有初始化显示
        this.UpdateRecoverTimerDisplay();
        // 设置单个定时器，每秒更新一次倒计时和检查体力恢复
        this.schedule(this.UpdateRecoverTimerDisplay, 1);
        
        // 为staminaLabel添加点击事件监听器，用于切换recoverTimerLabel的可见性
        if(this.time_node){
            this.time_node.on(Node.EventType.TOUCH_END, this.toggleRecoverTimerVisibility, this);
        }
        
        // 明确设置recoverTimerLabel的初始状态为隐藏
        if(this.recoverTimerLabel && this.recoverTimerLabel.node){
            this.recoverTimerLabel.node.active = false;
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
     * 仅更新体力标签显示
     */
    UpdateStaminaLabel(){
        if(this.staminaLabel){
            this.staminaLabel.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
        }
    }

    // 打开设置
    settingBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        loadPool.ins.getPoolNode('setting', this.node)
        director.emit(emits.backIsShow, 2)
    }
    // 打开排行
    paihangBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // loadPool.ins.getPoolNode('tips', this.node)
        // director.emit(emits.tipMsg, '功能暂未开放')
        loadPool.ins.getPoolNode('RankWnd', this.node)
    }
    // 分享游戏
    shareBtn() {
        if (gameConfig.isAd) {
            wxAd.ins.zhuanfa()
            this.scheduleOnce(() => {
                audioTool.ins.playMusic(bgmName.music_bg)
            }, 0.3)
        }
    }
    // 皮肤商店
    pifuBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        loadPool.ins.getPoolNode('pifuShop', this.node)
    }
    // 开始游戏
    startBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // 关闭广告
        if (gameConfig.isAd) {
            wxAd.ins.hideBanner()
        }
        // 显示关卡选择界面
        loadPool.ins.getPoolNode('LevelSelectWnd', this.node)
    }
    // 销毁组件
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }

    // 切换游戏模式
    toggleGameMode() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // 切换游戏模式（0→1，1→0）
        gameConfig.gameModel = 1 - gameConfig.gameModel
        // 显示切换提示
        const modeText = gameConfig.gameModel === 0 ? '游戏模式' : '编辑模式'
        this.btn_test_label.string = modeText
        // loadPool.ins.getPoolNode('tips', this.node)
        // director.emit(emits.tipMsg, `已切换到${modeText}`)
        console.log(`游戏模式已切换到: ${modeText}`)
    }

    /**
     * 更新用户名显示
     */
    updateUserDisplay(){
        const userId = load('SLS_USER_ID', 0);
        if(this.user_label){
            if(userId){
                this.user_label.string = '玩家' + "\n" + userId;
            } else {
                this.user_label.string = '未登录';
            }
        } else {
            console.error('主界面user_label标签未赋值!');
        }
    }

    /**
     * 重置账号，切换账号
     */
    ResetAccount(){
        sys.localStorage.removeItem('SLS_USERNAME');
        sys.localStorage.removeItem('SLS_PASSWORD');
        sys.localStorage.removeItem('SLS_USER_ID');
        save('SLS_REALNAME', 'false');
        // 重置关卡数据
        gameConfig.nowLevel = 1;

        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        director.loadScene('loading');
    }



    /**
     * 防沉迷检查
     */
    async checkAntiAddiction() {
        // 获取本地存储的用户名
        const username = load('SLS_USERNAME', 0);
        if (!username) {
            console.log('未找到用户名，跳过防沉迷检查');
            return;
        }
        
        try {
            const antiAddictionResult = await this.PostBreathe("app.yongshixunzhang", username);
            console.log("主界面防沉迷检查结果:", antiAddictionResult);
            
            if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                // 显示防沉迷提示面板
                loadPool.ins.getPoolNode('TipsWnd', this.node)
                director.emit(emits.tipWndMsg, antiAddictionResult.msg, true)
                return;
            }
            // 防沉迷检查通过，继续游戏
            console.log('主界面防沉迷检查通过');

            // 检查返回的时间是否到达二十点四十五分（仅未成年人检测）
            if (antiAddictionResult.data !== undefined && antiAddictionResult.data !== null) {
                // 读取年龄状态，仅未成年人执行检测
                const savedAgeStatus = load(this.STORAGE_KEY_AGE_STATUS, 0);
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
                loadPool.ins.getPoolNode('TipsWnd', this.node)
                director.emit(emits.tipWndMsg, '您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。')
                // 标记为已显示
                this.hasShownTimePopup = true;
            } else {
                console.log('时间尚未到达二十点四十五分');
            }
        } catch (error) {
            console.error('时间解析失败:', error);
        }
    }
}


