import { _decorator, Component, director, Label, Node, profiler, Sprite, tween, Vec3 } from 'cc';
import { gameConfig } from './data/gameConfig';
import { layerRootAction } from './layerRootAction';
import { bgmName, emits, local } from './data/enmus';
import { audioTool } from './untils/audioTool';
import { save, load } from './untils/tools';
import { wxAd } from './AD/wxAd';
import { loadPool } from './res/loadPool';
const { ccclass, property } = _decorator;

@ccclass('mainView')
export class mainView extends Component {
    // 编辑器
    @property(Node) editRoot: Node;
    // 开场动画
    @property(Node) startAnima: Node;
    // 过关动画
    @property(Node) leveCatAnima: Node;
    // 关卡显示
    @property(Label) level: Label = null;
    // 关卡时间显示
    @property(Label) level_time: Label = null;
    // 三个功能按钮
    @property(Sprite) yichuSprite: Sprite;
    @property(Sprite) chehuiSprite: Sprite
    @property(Sprite) shuaxinSprite: Sprite
    
    // 关卡计时器
    private levelTimer: number = 0
    private timerRunning: boolean = false
    
    // 防沉迷检查间隔时间（秒）
    private antiAddictionInterval: number = 5;
    // 存储键常量
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
    // 开场动画
    private startAnima_tween(callback: Function) {
        this.startAnima.active = true
        this.startAnima.setPosition(350, 0)
        tween(this.startAnima).to(0.6, { position: new Vec3(-350, 0, 0) }).call(() => {
            // 传入的形参
            callback()
        }).to(0.3, { position: new Vec3(-1000, 0, 0) }).call(() => {
            this.startAnima.active = false
        }).start()
    }
    // 下一关动画
    private nextLevel_tween(callback: Function) {
        this.leveCatAnima.active = true
        this.leveCatAnima.setPosition(500, 140)
        tween(this.leveCatAnima).to(0.8, { position: new Vec3(-150, 140, 0) }).delay(1.2).to(0.8, { position: new Vec3(-800, 140, 0) }).call(() => {
            // 传入的形参
            callback()
            this.leveCatAnima.setPosition(500, 140)
            this.leveCatAnima.active = false
        }).start()
    }


    start() {
        this.startAnima_tween(() => {
            this.init()
        })
    }

    update(deltaTime: number) {
        // 更新关卡计时器显示
        if (this.timerRunning) {
            this.level_time.string = this.formatTime(this.levelTimer)
        }
    }
    
    // 格式化时间显示 (秒 -> 分:秒)
    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        const minStr = mins < 10 ? '0' + mins : '' + mins
        const secStr = secs < 10 ? '0' + secs : '' + secs
        return minStr + ':' + secStr
    }
    
    // 每秒增加计时器
    timerUpdate() {
        this.levelTimer++
    }
    
    // 开始计时（新关卡，从0开始）
    startTimer() {
        this.levelTimer = 0
        this.timerRunning = true
        this.schedule(this.timerUpdate, 1)
    }
    
    // 暂停计时（保留当前时间）
    pauseTimer() {
        this.timerRunning = false
        this.unschedule(this.timerUpdate)
        // 保存通关时间到全局变量
        gameConfig.levelTime = this.levelTimer
    }
    
    // 继续计时（从当前时间继续）
    resumeTimer() {
        if (!this.timerRunning) {
            this.timerRunning = true
            this.schedule(this.timerUpdate, 1)
        }
    }
    
    // 停止并重置计时
    stopTimer() {
        this.timerRunning = false
        this.unschedule(this.timerUpdate)
    }
    // 初始化
    init() {
        profiler.hideStats()
        audioTool.ins.playMusic(bgmName.game_bg)
        gameConfig.gameRoot = this.node
        // 显示当前挑战的关卡（使用临时关卡，否则使用当前关卡，最后使用默认关卡）
        const displayLevel = gameConfig.tempLevel || gameConfig.currentLevel || gameConfig.nowLevel
        this.level.string = String(displayLevel)
        director.on(emits.anewGame, this.anewGame, this)
        director.on(emits.daojuStatus, this.daojuStatus, this)
        director.on(emits.pauseTimer, this.pauseTimer, this)
        director.on(emits.resumeTimer, this.resumeTimer, this)
        // 道具状态
        // this.daojuStatus()
        // 显示模式
        if (gameConfig.gameModel == 0) {
            this.editRoot.active = false
            this.startGame()
        } else {
            this.editRoot.active = true
        }
        // 显示格子广告
        if (gameConfig.isAd) {
            // 音频中断监听
            wxAd.ins.bgmZd(() => {
                audioTool.ins.playMusic(bgmName.game_bg)
            })
            wxAd.ins.topZhuanfa()
            wxAd.ins.showCustomAd()
        }
        
        // 进行防沉迷检查
        this.checkAntiAddiction();
        // 设置定期防沉迷检查定时器
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);
    }
    // 初始化并开始游戏
    startGame() {
        // 次数刷新
        gameConfig.fuhouNum = 1
        gameConfig.yichuNum = 1
        gameConfig.chehuiNum = 1
        gameConfig.randomNum = 1
        this.daojuStatus()
        let layerRoot = this.node.getChildByName('layerRoot').getComponent(layerRootAction)
        // 传递临时关卡（如果有），否则使用当前关卡，最后使用默认关卡
        const levelToPlay = gameConfig.tempLevel || gameConfig.currentLevel || gameConfig.nowLevel
        layerRoot.startGame(levelToPlay)
        // 重置临时关卡
        gameConfig.tempLevel = 0
        // 开始关卡计时
        this.stopTimer()
        this.startTimer()
    }
    // 重新开始游戏
    anewGame() {
        this.startAnima_tween(() => {
            this.init()
        })
    }
    // 下一关
    nextLevel() {
        // 计算下一关的关卡号
        const nextLevel = gameConfig.currentLevel + 1
        // 保存到临时关卡，这样不会影响解锁进度
        gameConfig.tempLevel = nextLevel
        this.nextLevel_tween(() => {
            // 显示下一关
            this.level.string = String(nextLevel)
            this.startGame()
            // 插屏广告
            if (gameConfig.isAd) {
                // console.log("LLL插屏广告")
                wxAd.ins.chapingAd()
            }
        })
    }
    // 关卡显示
    levelLabel() {
        this.level.string = String(gameConfig.nowLevel)
    }
    // 道具按钮状态
    daojuStatus() {
        if (gameConfig.yichuNum < 1) {
            this.yichuSprite.grayscale = true
        } else {
            this.yichuSprite.grayscale = false
        }
        if (gameConfig.chehuiNum < 1) {
            this.chehuiSprite.grayscale = true
        } else {
            this.chehuiSprite.grayscale = false
        }
        if (gameConfig.randomNum < 1) {
            this.shuaxinSprite.grayscale = true
        } else {
            this.shuaxinSprite.grayscale = false
        }
    }
    // 销毁组件
    protected onDestroy(): void {
        director.off(emits.anewGame, this.anewGame, this)
        director.off(emits.daojuStatus, this.daojuStatus, this)
        director.off(emits.pauseTimer, this.stopTimer, this)
        director.off(emits.resumeTimer, this.startTimer, this)
        // 取消防沉迷检查定时器
        this.unschedule(this.checkAntiAddiction)
        // 停止关卡计时器
        this.stopTimer()
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
            console.log("游戏界面防沉迷检查结果:", antiAddictionResult);
            
            if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                // 显示防沉迷提示面板
                loadPool.ins.getPoolNode('TipsWnd', this.node)
                director.emit(emits.tipWndMsg, antiAddictionResult.msg, true)
                return;
            }
            // 防沉迷检查通过，继续游戏
            console.log('游戏界面防沉迷检查通过');

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
            // 获取小时和分钟
            const hours = date.getHours();
            const minutes = date.getMinutes();
            
            // 检查是否是20:45
            if (hours === 20 && minutes === 45) {
                // 显示下线提醒弹窗
                loadPool.ins.getPoolNode('TipsWnd', this.node);
                director.emit(emits.tipWndMsg, '您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。');
            }
        } catch (error) {
            console.error('时间检查错误:', error);
        }
    }
}


