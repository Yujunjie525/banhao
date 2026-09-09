import { _decorator, Button, Component, director, Label, Node, profiler, sys } from 'cc';
import { loadPool } from './loadPool';
import { bgmName, emits } from './enmus';
import { gameConfig } from './gameConfig';
import { load, save } from './tools';
import { mGameData } from './GameData';
import { GameBackendApi } from '../GameBackendSdk/GameBackendApi';
const { ccclass, property } = _decorator;

@ccclass('homeView')
export class homeView extends Component {
    // 开场动画
    @property(Label) user_label:Label = null; //当前用户名
    @property(Node) btn_reset:Node = null; //重置按钮
    @property(Node) btn_test:Node = null; //切换按钮
    @property(Label) btn_test_label:Label = null; //切换按钮文本
     @property(Node) time_node: Node = null;;
    @property(Label) staminaLabel:Label = null; //体力显示标签
    @property(Label) recoverTimerLabel:Label = null; //恢复倒计时显示标签
    @property(Label) diamondLabel:Label = null; //钻石显示标签
    @property(Label) levelLabel:Label = null; //当前关卡显示标签

    @property(Node)
    BtnCharge:Node = null; //充值按钮
    @property(Node)
    ChargePanel:Node = null; //充值界面
    @property(Node)
    TipsPanel:Node = null; //弹窗
    @property(Label)
    L_tips:Label = null; // 弹窗文本 
    @property(Node)
    Btn_closeCharge:Node = null;  //关闭充值界面按钮    
    @property(Node)
    Btn_1:Node = null; //充值按钮1
    @property(Node)
    Btn_2:Node = null; //充值按钮2
    @property(Node)
    Btn_3:Node = null; //充值按钮3
    @property(Node)
    Btn_4:Node = null; //充值按钮4
    @property(Node)
    Btn_5:Node = null; //充值按钮5
    @property(Node)
    Btn_6:Node = null; //充值按钮6
    @property(Node)
    TipsPanelClose:Node = null; //弹窗关闭按钮
    @property(Node)
    TipsPanelOk:Node = null; //弹窗确定按钮

    @property(Node)
    BtnAddStamina:Node = null; //补充体力按钮（体力不满时显示）
    @property(Node)
    TLtips_panel:Node = null; //体力补充确认弹窗
    @property(Node)
    TLtipsClose:Node = null; //体力补充弹窗关闭按钮
    @property(Node)
    TLtipsOk:Node = null; //体力补充弹窗确认按钮
    @property(Label)
    TLtipsLabel:Label = null; //体力补充弹窗文本

    @property(Node)
    ShopPanel:Node = null; //商店界面

    // 当前选择的充值选项
    private currentRechargeOption: {price: number, diamonds: number} = null;
    // 充值配置
    private rechargeConfig = {
        1: {price: 6, diamonds: 60},
        2: {price: 30, diamonds: 300},
        3: {price: 68, diamonds: 680},
        4: {price: 198, diamonds: 1980},
        5: {price: 328, diamonds: 3280},
        6: {price: 648, diamonds: 6480}
    };

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
        
        // 首次登录显示剧情弹窗（在start中调用，确保节点树已初始化）
        this.checkAndShowStory();
    }

    init() {
        if (gameConfig.isAd) {
        }
        // 预加载下一关
        // director.preloadScene(
        //     'main',
        //     (completedCount: number, totalCount: number, item: any) => {
        //         // console.log(completedCount, totalCount);
        //     },
        //     () => {
        //         console.log('主界面预加载完成');
        //     }
        // );
        // gameConfig.nowLevel = 80;
        
    }

    /**
     * 获取剧情观看记录的存储键名
     */
    private getHasSeenStoryKey(): string {
        const userId = load('SLS_USER_ID', 0) || 'default';
        return `hasSeenStory_${userId}`;
    }

    /**
     * 检查并显示剧情弹窗（首次登录时显示）
     */
    private checkAndShowStory() {
        const hasSeenStoryKey = this.getHasSeenStoryKey();
        const hasSeenStory = load(hasSeenStoryKey, 0);
        if (!hasSeenStory) {
            // 显示剧情弹窗（使用当前节点作为父节点，确保弹窗能正确显示）
            const storyNode = loadPool.ins.getPoolNode('StoryWnd', this.node);
            // 记录到本地存储（基于用户ID）
            save(hasSeenStoryKey, 1);
        }
    }

    onLoad(){
        this.updateUserDisplay();

        this.btn_reset.on(Node.EventType.TOUCH_END,this.ResetAccount,this);

        // 初始化角色数据
        gameConfig.initRoleData();

        // 重新加载当前账户的体力数据
        mGameData.ReloadStamina();

        // 从本地存储加载钻石数据
        gameConfig.LoadGoldData();

        // 初始化钻石显示
        this.UpdateDiamondLabel();
        // 初始化关卡显示
        this.UpdateLevelLabel();

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

        //充值相关
        if(this.BtnCharge){
            this.BtnCharge.on(Node.EventType.TOUCH_END,this.OnCharge,this);
        }
        if(this.Btn_closeCharge){
            this.Btn_closeCharge.on(Node.EventType.TOUCH_END,this.OnCloseCharge,this);
        }

        // 为充值按钮添加点击事件
        if(this.Btn_1){
            this.Btn_1.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(1), this);
        }
        if(this.Btn_2){
            this.Btn_2.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(2), this);
        }
        if(this.Btn_3){
            this.Btn_3.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(3), this);
        }
        if(this.Btn_4){
            this.Btn_4.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(4), this);
        }
        if(this.Btn_5){
            this.Btn_5.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(5), this);
        }
        if(this.Btn_6){
            this.Btn_6.on(Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(6), this);
        }

        if(this.TipsPanelClose){
            this.TipsPanelClose.on(Node.EventType.TOUCH_END,this.OnCloseTips,this);
        }
        if(this.TipsPanelOk){
            this.TipsPanelOk.on(Node.EventType.TOUCH_END,this.OnOkTips,this);
        }

        // 补充体力按钮相关
        if(this.BtnAddStamina){
            this.BtnAddStamina.on(Node.EventType.TOUCH_END,this.OnAddStaminaClick,this);
        }
        if(this.TLtipsClose){
            this.TLtipsClose.on(Node.EventType.TOUCH_END,this.OnCloseTLtips,this);
        }
        if(this.TLtipsOk){
            this.TLtipsOk.on(Node.EventType.TOUCH_END,this.OnOkTLtips,this);
        }
        // 初始化补充体力按钮显示状态
        this.UpdateAddStaminaBtnVisibility();

        // 监听钻石数量更新事件
        director.on('goldUpdated', this.UpdateDiamondLabel, this);
    }

    /**
     * 更新关卡显示
     */
    UpdateLevelLabel() {
        if (this.levelLabel) {
            this.levelLabel.string = `当前关卡：${gameConfig.nowLevel}`;
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
        // 更新补充体力按钮的显示状态
        this.UpdateAddStaminaBtnVisibility();
    }

    /**
     * 更新补充体力按钮的显示状态（体力不满时显示）
     */
    UpdateAddStaminaBtnVisibility(){
        if(this.BtnAddStamina){
            // 体力不满时显示按钮
            const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
            this.BtnAddStamina.active = false//!isStaminaFull;
        }
    }

    /**
     * 点击补充体力按钮
     */
    OnAddStaminaClick(){
        if(this.TLtips_panel){
            // 计算可以恢复的体力值
            const canAddStamina = mGameData.maxStamina - mGameData.currentStamina;
            const actualAddStamina = Math.min(10, canAddStamina);
            
            // 设置弹窗文本
            if(this.TLtipsLabel){
                this.TLtipsLabel.string = `是否消耗100钻石获得${actualAddStamina}点体力？\n（当前体力：${mGameData.currentStamina}/${mGameData.maxStamina}）`;
            }
            
            this.TLtips_panel.active = true;
        }
    }

    /**
     * 关闭体力补充弹窗
     */
    OnCloseTLtips(){
        if(this.TLtips_panel){
            this.TLtips_panel.active = false;
        }
    }

    /**
     * 确认消耗钻石获得体力
     */
    OnOkTLtips(){
        // 检查钻石是否足够
        if(gameConfig.currentGold < 100){
            loadPool.ins.getPoolNode('tips', this.node)
            director.emit(emits.tipMsg, '钻石不足，请充值。');
            this.OnCloseTLtips();
            return;
        }
        
        // 计算可以恢复的体力值（不超过最大值）
        const canAddStamina = mGameData.maxStamina - mGameData.currentStamina;
        const actualAddStamina = Math.min(10, canAddStamina);
        
        if(actualAddStamina <= 0){
            loadPool.ins.getPoolNode('tips', this.node)
            director.emit(emits.tipMsg, '体力已满，无需补充。');
            this.OnCloseTLtips();
            return;
        }
        
        // 消耗钻石
        gameConfig.currentGold -= 100;
        // 保存钻石数据到本地并同步服务端
        gameConfig.SaveGoldData();
        
        // 增加体力
        mGameData.currentStamina += actualAddStamina;
        // 保存体力数据
        mGameData.SaveStaminaData();
        
        // 更新显示
        this.UpdateDiamondLabel();
        this.UpdateStaminaLabel();
        
        // 关闭弹窗
        this.OnCloseTLtips();
        
        // 提示成功
        loadPool.ins.getPoolNode('tips', this.node)
        director.emit(emits.tipMsg, `成功获得${actualAddStamina}点体力！`);
    }

    /**
     * 更新钻石标签显示
     */
    UpdateDiamondLabel(){
        if(this.diamondLabel){
            this.diamondLabel.string = `${gameConfig.currentGold}`;
        }
    }

    // 打开设置
    settingBtn() {
        loadPool.ins.getPoolNode('setting', this.node)
        director.emit(emits.backIsShow, 2)
    }
    // 打开排行
    paihangBtn() {
        // loadPool.ins.getPoolNode('tips', this.node)
        // director.emit(emits.tipMsg, '功能暂未开放')
        loadPool.ins.getPoolNode('RankWnd', this.node)
    }

    // 开始游戏
    startBtn() {
        // 关闭广告
        if (gameConfig.isAd) {
        }
        // 显示关卡选择界面
        loadPool.ins.getPoolNode('LevelSelectWnd', this.node)
    }
    // 销毁组件
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
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
        gameConfig.clearActiveUserContext();
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
            const antiAddictionResult = await GameBackendApi.breathe({ appid: gameConfig.APP_ID, username });
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



    /**
     * 充值按钮点击事件处理
     * @param buttonId 按钮ID
     */
    onRechargeBtnClick(buttonId: number){
        // 获取当前选择的充值选项
        this.currentRechargeOption = this.rechargeConfig[buttonId];
        if(this.currentRechargeOption){
            // 设置提示文本
            if(this.L_tips){
                this.L_tips.string = `是否确认支付${this.currentRechargeOption.price}元人民币兑换${this.currentRechargeOption.diamonds}个钻石？`;
            }
            // 显示确认弹窗
            if(this.TipsPanel){
                this.TipsPanel.active = true;
            }
        }
    }

    async OnOkTips(){
        // 确认充值
        if(this.currentRechargeOption){
            // 在这里添加实际的充值处理逻辑
            try {
                const username = sys.localStorage.getItem('SLS_USERNAME');
                const result = await GameBackendApi.payDiamond({ appid: gameConfig.APP_ID, username, diamond: this.currentRechargeOption.diamonds });
                console.log("购买结果:", result);
                if(result.code === -1){
                    // TipsWndManager.show(result.msg + '');
                    loadPool.ins.getPoolNode('TipsWnd', this.node)
                    director.emit(emits.tipWndMsg, result.msg + '')
                    return;
                }
                if (result.code === 0) {
                    // 模拟充值成功，添加钻石
                    gameConfig.currentGold += this.currentRechargeOption.diamonds;
                    // 保存钻石数据到本地并同步服务端
                    gameConfig.SaveGoldData();
                    
                    // 更新钻石显示
                    this.UpdateDiamondLabel();
                    // 发送钻石更新事件
                    director.emit('goldUpdated');
                    
                    // 显示充值成功提示
                    // TipsManager.show(`兑换成功！获得${this.currentRechargeOption.diamonds}个钻石。`);
                    loadPool.ins.getPoolNode('tips', this.node)
                    director.emit(emits.tipMsg, `兑换成功！获得${this.currentRechargeOption.diamonds}个钻石。`)

                    // 重置当前选择的充值选项
                    this.currentRechargeOption = null;
                }
            } catch (error) {
                console.error("购买过程中出错:", error);
            }

            // // 模拟充值成功，添加钻石
            // mGameData.currentGold += this.currentRechargeOption.diamonds;
            // // 更新钻石显示
            // this.UpdateGoldLabel();
            // // 发送钻石更新事件
            // cc.director.emit('goldUpdated');
            
            // // 显示充值成功提示
            // TipsManager.show(`兑换成功！获得${this.currentRechargeOption.diamonds}个钻石。`);
            
            // // 重置当前选择的充值选项
            // this.currentRechargeOption = null;
        }
        // 关闭弹窗
        this.TipsPanel.active = false;
    }

    OnCharge(){
        // 跳转到充值界面
        this.ChargePanel.active = true;
        // 更新充值界面的钻石显示
        this.UpdateDiamondLabel();
    }

    OnCloseCharge(){
        // 关闭弹窗
        this.ChargePanel.active = false;
    }

    OnCloseTips(){
        // 关闭弹窗
        this.TipsPanel.active = false;
    }
    
    /**
     * 打开商店界面
     */
    OnShopClick(){
        // 打开商店界面
        this.ShopPanel.active = true;
    }
}


