
const {ccclass, property} = cc._decorator;
import mGameData from '../Data/GameData';
import AudioManager from './AudioManager';
import CloneChi from '../Tools/CloneChi';
var ins;
@ccclass
export default class GameManager extends cc.Component {
    //分享按钮
    @property(cc.Node)
    BtnShare:cc.Node = null;
    
    // 记录最近生成的怪物类型：0-云，1-蚊子
    private lastMonsterType:number = -1;
    // 记录最近生成的蚊子位置：0-左边，1-右边
    private lastWenziPosition:number = -1;
    //关卡模式分享按钮图片
    @property(cc.SpriteFrame)
    btnShareLevelSprite:cc.SpriteFrame = null;
    //无尽模式分享按钮图片
    @property(cc.SpriteFrame)
    btnShareInfiniteSprite:cc.SpriteFrame = null;
    //暂停按钮
    @property(cc.Node)
    BtnPause:cc.Node = null;
    //暂停图片
    @property(cc.Sprite)
    pauseBg:cc.Sprite = null;
    //暂停图片资源
    @property(cc.SpriteFrame)
    pauseSpriteFrame:cc.SpriteFrame = null;
    //恢复图片资源
    @property(cc.SpriteFrame)
    resumeSpriteFrame:cc.SpriteFrame = null;
    //得分框
    @property(cc.Node)
    LabNode:cc.Node = null;
    //得分
    @property(cc.Label)
    LabScore:cc.Label = null;
    //当次得分
    @property(cc.Label)
    LabEveryScore:cc.Label = null;
    //历史最高得分
    @property(cc.Label)
    LabBestScore:cc.Label = null;
    //结算框
    @property(cc.Node)
    GameOver:cc.Node = null;
    
    //倒计时标签
    @property(cc.Label)
    countdownLabel:cc.Label = null;
    //无尽模式标签
    @property(cc.Label)
    wujinLabel:cc.Label = null;
    //剩余倒计时时间（秒）
    private remainingTime:number = 0;
    //是否正在倒计时
    private isCountingDown:boolean = false;

    //3秒大倒计时标签
    @property(cc.Label)
    preGameCountdownLabel:cc.Label = null;
    //3秒倒计时遮罩
    @property(cc.Node)
    preGameCountdownMask:cc.Node = null;
    //3秒倒计时相关
    //是否正在进行3秒倒计时
    private isPreGameCountingDown:boolean = false;
    //3秒倒计时剩余时间
    private preGameCountdownTime:number = 3;


    //通关弹窗
    @property(cc.Node)
    gamepass:cc.Node = null;
    //满星提示文本
    @property(cc.Label)
    starTipLabel: cc.Label = null;
    @property(cc.Label)
    maxstarTipLabel: cc.Label = null;
    //下一关按钮
    @property(cc.Node)
    BtnNext:cc.Node = null;
    //返回主界面按钮
    @property(cc.Node)
    BtnBack:cc.Node = null;
    
    //星星显示相关（共用图片资源）
    @property(cc.SpriteFrame)
    starFull:cc.SpriteFrame = null; // 实心星星图片
    @property(cc.SpriteFrame)
    starEmpty:cc.SpriteFrame = null; // 空心星星图片
    
    //通关弹窗星星显示
    @property(cc.Node)
    passStarsContainer:cc.Node = null; // 通关弹窗星星容器节点
    @property([cc.Sprite])
    passStars:cc.Sprite[] = []; // 通关弹窗星星图片数组
    
    //失败弹窗星星显示
    @property(cc.Node)
    overStarsContainer:cc.Node = null; // 失败弹窗星星容器节点
    @property([cc.Sprite])
    overStars:cc.Sprite[] = []; // 失败弹窗星星图片数组

    //游戏界面当前关卡显示
    @property(cc.Label)
    cur_level:cc.Label = null;
    
    //游戏界面星星显示容器
    @property(cc.Node)
    LevelStatContainer:cc.Node = null; // 游戏界面星星容器节点
    @property([cc.Sprite])
    levelStars:cc.Sprite[] = []; // 游戏界面星星图片数组（3颗）
    
    //障碍物（0-2左，3-5右）
    @property([cc.Prefab])
    ZAW:cc.Prefab[] = [];
    //子弹
    @property(cc.Prefab)
    Bullets:cc.Prefab = null;
    //蚊子
    @property(cc.Prefab)
    Wenzi:cc.Prefab = null;
    //云朵
    @property(cc.Prefab)
    Yun:cc.Prefab = null;
    //狐狸
    @property(cc.Prefab)
    huli:cc.Prefab = null;
    //障碍父级
    @property(cc.Node)
    ZAWparent:cc.Node = null;
    
    @property(cc.Node)
    PausePanel:cc.Node = null;
    @property(cc.Node)
    BtnFH:cc.Node = null;
    @property(cc.Node)
    BtnJX:cc.Node = null;

    static GetIns(){
        return ins;
    }
    onLoad () {
        ins = this;

        this.BtnPause.on(cc.Node.EventType.TOUCH_END,this.GamePause,this);
        this.BtnNext.on(cc.Node.EventType.TOUCH_END,this.NextLevel,this);
        this.BtnBack.on(cc.Node.EventType.TOUCH_END,this.BacktoHomeFromPass,this);
        
        // 添加暂停面板按钮的点击事件
        if (this.BtnFH) {
            this.BtnFH.on(cc.Node.EventType.TOUCH_END, this.btnFHClicked, this);
        }
        if (this.BtnJX) {
            this.BtnJX.on(cc.Node.EventType.TOUCH_END, this.btnJXClicked, this);
        }
        
        // 根据游戏模式切换分享按钮图片
        this.updateBtnShareImage();
        
        this.schedule(this.getScore,0.5);
        this.schedule(this.CloneZAW, this.getObstacleInterval());
        this.OpenScore();
        
        // 初始化游戏界面星星显示（显示三颗空星星）
        this.initLevelStars();
        
        // 初始隐藏暂停面板
        if (this.PausePanel) {
            this.PausePanel.active = false;
        }

        // 更新当前关卡显示
        this.updateLevelDisplay();
        
        // 初始隐藏通关弹窗
        if (this.gamepass) {
            this.gamepass.active = false;
            console.log('Gamepass node initially set to inactive');
        } else {
            console.error('Gamepass node is not assigned in GameManager!');
        }

        // 初始化3秒倒计时，倒计时结束后再开始游戏
        this.initPreGameCountdown();
        
        console.log('是否暂停' + cc.game.isPaused());
    }
    
    /**
     * 显示获得的星星数
     * @param stars 获得的星星数（0-3）
     * @param popupType 弹窗类型：'pass'（通关）或 'over'（失败）
     */
    showStars(stars: number, popupType: 'pass' | 'over' = 'pass'): void {
        // 如果没有星星图片资源，仅记录日志
        if (!this.starFull || !this.starEmpty) {
            console.warn('星星显示图片资源未正确配置');
            console.log(`关卡${mGameData.currentLevel}获得${stars}颗星`);
            return;
        }
        
        let container: cc.Node = null;
        let starsArray: cc.Sprite[] = [];
        
        // 根据弹窗类型选择对应的星星容器和星星数组
        if (popupType === 'pass') {
            container = this.passStarsContainer;
            starsArray = this.passStars;
        } else {
            container = this.overStarsContainer;
            starsArray = this.overStars;
        }
        
        // 如果对应弹窗的星星显示相关节点未配置，尝试使用旧的通用配置
        if (!container || starsArray.length < 3) {
            // 保持向后兼容，使用旧的星星显示配置（如果存在）
            console.warn(`星星显示相关节点未正确配置：${popupType}弹窗`);
            console.log(`关卡${mGameData.currentLevel}获得${stars}颗星`);
            return;
        }
        
        // 显示星星容器
        if (!mGameData.isInfiniteMode){
            container.active = true;
        } else {
            // 无限模式下隐藏星星容器
            container.active = false;
        }
        
        
        // 设置星星显示
        for (let i = 0; i < 3; i++) {
            if (starsArray[i]) {
                if (i < stars) {
                    starsArray[i].spriteFrame = this.starFull;
                } else {
                    starsArray[i].spriteFrame = this.starEmpty;
                }
            }
        }
    }
    
    /**
     * 初始化游戏界面星星显示（显示三颗空星星）
     */
    initLevelStars(): void {
        // 如果没有星星图片资源，仅记录日志
        if (!this.starFull || !this.starEmpty) {
            console.warn('星星显示图片资源未正确配置');
            return;
        }
        
        // 如果游戏界面星星显示相关节点未配置，直接返回
        if (!this.LevelStatContainer || this.levelStars.length < 3) {
            console.warn('游戏界面星星显示相关节点未正确配置');
            return;
        }
        
        // 显示星星容器
        if (!mGameData.isInfiniteMode) {
            this.LevelStatContainer.active = true;
        } else {
            // 无限模式下隐藏星星容器
            this.LevelStatContainer.active = false;
        }
        
        // 初始化为三颗空星星
        for (let i = 0; i < 3; i++) {
            if (this.levelStars[i]) {
                this.levelStars[i].spriteFrame = this.starEmpty;
            }
        }
    }
    
    /**
     * 实时更新游戏界面星星显示
     */
    updateLevelStars(): void {
        // 如果没有星星图片资源，直接返回
        if (!this.starFull || !this.starEmpty) {
            return;
        }
        
        // 如果游戏界面星星显示相关节点未配置，直接返回
        if (!this.LevelStatContainer || this.levelStars.length < 3) {
            return;
        }
        
        // 无限模式下不更新星星
        if (mGameData.isInfiniteMode) {
            return;
        }
        
        // 计算当前应该获得的星星数
        const stars = mGameData.calculateStars(mGameData.EveryScore);
        
        // 更新星星显示
        for (let i = 0; i < 3; i++) {
            if (this.levelStars[i]) {
                if (i < stars) {
                    this.levelStars[i].spriteFrame = this.starFull;
                } else {
                    this.levelStars[i].spriteFrame = this.starEmpty;
                }
            }
        }
    }
    

    

    
    /**
     * 更新游戏界面当前关卡显示
     */
    updateLevelDisplay(){
        console.log('updateLevelDisplay called');
        console.log('Current level:', mGameData.currentLevel);
        console.log('isInfiniteMode:', mGameData.isInfiniteMode);
        
        if(this.cur_level){
            if (mGameData.isInfiniteMode) {
                this.cur_level.string = '无限模式';
            } else {
                this.cur_level.string = '第' + mGameData.currentLevel + '关';
            }
            console.log('Level display updated to:', this.cur_level.string);
        } else {
            console.error('cur_level label is not assigned!');
        }
    }

    start () {


    }

    // update (dt) {}
    /**
     * 获取障碍物生成间隔时间，使用关卡配置中的频率参数
     */
    getObstacleInterval(): number {
        // 获取当前关卡配置
        const levelConfig = mGameData.getCurrentLevelConfig();
        if (levelConfig && levelConfig.sec) {
            // 使用配置中的频率，转换为秒
            return levelConfig.sec / 1000;
        }
        // 默认值
        return Math.max(1.5, 3 - (mGameData.currentLevel - 1) * 0.1);
    }
    
    /**
     * 将速度与得分和关卡联系起来
     */
    getSpeed(){
        // 基础速度 + 得分速度加成 + 关卡速度加成
        var speed = mGameData.MoveSpeed + Math.floor(mGameData.EveryScore/100) + Math.floor((mGameData.currentLevel - 1) * 0.5);
        return speed;
    }
    /**
     * 得分方法
     */
    getScore(){
        if(!mGameData.isGameBegin){
            return;
        }
        // 确保得分是整数，避免浮点精度问题
        mGameData.EveryScore += Math.floor(mGameData.BgMoveSpeed/8);
        // 更新得分显示
        this.LabScore.string = Math.floor(mGameData.EveryScore) + '米';
        
        // 实时更新游戏界面星星显示
        this.updateLevelStars();
        
        // 添加调试信息
        // console.log('isInfiniteMode:', mGameData.isInfiniteMode);
        // console.log('Current Score:', mGameData.EveryScore);
        // console.log('Remaining Time:', this.remainingTime);
    }
    /**
     * 暂停方法
     */
    GamePause(){
        // 切换游戏状态
        mGameData.isGameBegin = !mGameData.isGameBegin;
        
        // 获取BtnPause的Sprite组件
        const btnPauseSprite = this.BtnPause?.getComponent(cc.Sprite);
        
        // 重置颜色和透明度
        if (this.BtnPause) {
            this.BtnPause.color = cc.Color.WHITE;
            this.BtnPause.opacity = 255;
        }
        
        if (this.pauseBg) {
            this.pauseBg.node.color = cc.Color.WHITE;
            this.pauseBg.node.opacity = 255;
        }
        
        // 执行游戏暂停/恢复并切换按钮图片
        if (mGameData.isGameBegin) {
            // 恢复游戏
            cc.director.resume();
            
            // 使用暂停图片（游戏正在运行，应该显示暂停按钮）
            if (this.pauseSpriteFrame) {
                const spriteToUse = btnPauseSprite || this.pauseBg;
                if (spriteToUse) {
                    spriteToUse.spriteFrame = this.pauseSpriteFrame;
                }
            }
            
            // 隐藏暂停面板
            if (this.PausePanel) {
                this.PausePanel.active = false;
            }
        } else {
            // 暂停游戏
            cc.director.pause();
            
            // 使用恢复图片（游戏已暂停，应该显示恢复按钮）
            if (this.resumeSpriteFrame) {
                const spriteToUse = btnPauseSprite || this.pauseBg;
                if (spriteToUse) {
                    spriteToUse.spriteFrame = this.resumeSpriteFrame;
                }
            }
            
            // 显示暂停面板
            if (this.PausePanel) {
                this.PausePanel.active = true;
                this.PausePanel.zIndex = 9999;
            }
        }
    }
    
    /**
     * 返回主界面按钮点击事件
     */
    btnFHClicked(){
        // 恢复游戏
        mGameData.isGameBegin = true;
        cc.director.resume();
        
        // 隐藏暂停面板
        if (this.PausePanel) {
            this.PausePanel.active = false;
        }
        
        // 返回主界面，当前关卡算失败
        AudioManager.GetIns().StopBgm();
        cc.director.loadScene('Start');
    }
    
    /**
     * 继续游戏按钮点击事件
     */
    btnJXClicked(){
        // 调用暂停方法恢复游戏
        this.GamePause();
    }
    
    /**
     * 显示通关弹窗
     */
    async showGamePass(){
        // 暂停游戏
        mGameData.isGameBegin = false;
        cc.director.pause();
        
        console.log('showGamePass called');
        
        // 计算获得的星星数
        const stars = mGameData.calculateStars(mGameData.EveryScore);
        console.log(`关卡${mGameData.currentLevel}完成，得分${mGameData.EveryScore}，获得${stars}颗星`);
        
        // 保存获得的星星数
        mGameData.saveLevelStars(stars);
        
        // 关卡成功通过，更新已解锁关卡
        // 通过第N关后，解锁第N+1关
        if (mGameData.currentLevel >= mGameData.unlockedLevel) {
            mGameData.unlockedLevel = mGameData.currentLevel + 1;
            console.log('更新已解锁关卡:', mGameData.unlockedLevel);
        }
        
        // 显示原有弹窗
        if(this.gamepass){
            this.gamepass.active = true;
            this.gamepass.zIndex = 9999;
            this.gamepass.opacity = 255;
            this.gamepass.setPosition(0, 0);
            this.gamepass.scale = 1;
        }
        
        // 显示获得的星星数
        this.showStars(stars, 'pass');
        
        // 计算满星提示信息
        if (!mGameData.isInfiniteMode) {
            const fullStarScore = mGameData.getCurrentLevelConfig().star3;
            // starTipLabel 显示本轮成绩跑了多少米
            if (this.starTipLabel) {
                this.starTipLabel.string = `本次成绩：${mGameData.EveryScore}米`;
                this.starTipLabel.node.active = true;
            }
            
            // maxstarTipLabel 显示满星成绩需要跑多少米
            if (this.maxstarTipLabel) {
                this.maxstarTipLabel.string = `满星成绩：${fullStarScore}米`;
                this.maxstarTipLabel.node.active = true;
            }
        } else {
            // 无限模式，隐藏提示
            if (this.starTipLabel) {
                this.starTipLabel.node.active = false;
            }
            if (this.maxstarTipLabel) {
                this.maxstarTipLabel.node.active = false;
            }
        }

        // 上报通关数据
        try {
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            const result = await this.postPass("app.shenyuanlieshou", savedUsername, mGameData.currentLevel, stars);
            console.log("上报关卡:", result, mGameData.currentLevel, stars);
            
            if (result.code === 0) {
            
            } else {
            }
        } catch (error) {
        }
    }
    /**
     * 关闭结算框
     */
    CloseGameOver(){
        this.BtnPause.active = true;
        mGameData.isOpenWXShare = true;
        var a1 = cc.scaleTo(0.5,0);
        this.GameOver.runAction(a1);
    }
    /**
     * 打开游戏结算框
     */
    OpenGameOver(){
        this.BtnPause.active = false;
        
        // 更新分享按钮图片
        this.updateBtnShareImage();
        
        if(mGameData.isOpenWXShare){
            this.BtnShare.active = true;
        }else{
            this.BtnShare.active = false;
        }
        this.CloseScore();
        
        // 关卡模式下，失败时不保存星星数
        if (mGameData.isInfiniteMode) {
            // 只有无限模式下才在游戏结束时保存星星数
            const stars = mGameData.calculateStars(mGameData.EveryScore);
            console.log(`无限模式游戏结束，得分${mGameData.EveryScore}，获得${stars}颗星`);
        }
        
        // 停止倒计时
        this.isCountingDown = false;
        this.unschedule(this.updateCountdown);
        
        mGameData.SetData();
        var a1 = cc.scaleTo(1,1);
        this.GameOver.runAction(a1);


        //this.unschedule(this.getScore);

        this.LabEveryScore.string = '本次成绩：' + mGameData.EveryScore;
        this.LabBestScore.string = '最高成绩：' + mGameData.BestScore;
        
        // 计算并显示获得的星星数
        let stars = 0;
        if (mGameData.isInfiniteMode) {
            stars = mGameData.calculateStars(mGameData.EveryScore);
            console.log(`无限模式游戏结束，得分${mGameData.EveryScore}，获得${stars}颗星`);
        } else {
            console.log(`关卡${mGameData.currentLevel}游戏结束，得分${mGameData.EveryScore}，目标分数${mGameData.getCurrentLevelTargetScore()}`);
        }
        
        this.showStars(stars, 'over');
    }
    /**
     * 返回主界面
     */
    BacktoHome(){
        this.CloseGameOver();
        
        // 保存关卡数据
        mGameData.SaveLevelData();
        
        AudioManager.GetIns().StopBgm();
        cc.director.loadScene('Start');
    }
    /**
     * 打开得分框
     */
    OpenScore(){
        var a1 = cc.scaleTo(1,0.9);
        this.LabNode.runAction(a1);
    }
    /**
     * 关闭得分框
     */
    CloseScore(){
        var a1 = cc.scaleTo(1,0);
        this.LabNode.runAction(a1);
    }
    /**
     * 生成障碍物和怪物
     */
    CloneZAW(){
        if(!mGameData.isGameBegin){
            return;
        }

        // 获取当前关卡配置
        const levelConfig = mGameData.getCurrentLevelConfig();
        if (!levelConfig) {
            return;
        }

        // 根据关卡配置决定生成障碍物还是怪物
        let num_1;
        const hasObstacles = levelConfig.ZAW && levelConfig.ZAW.length > 0;
        const hasMonsters = levelConfig.Monster && levelConfig.Monster.length > 0;

        if (hasObstacles && hasMonsters) {
            //num_1 = Math.floor(Math.random()*2);
            // 两种都有，按概率选择：70%障碍物，30%怪物
            num_1 = Math.random() < 0.7 ? 0 : 1;
        } else if (hasObstacles) {
            // 只有障碍物
            num_1 = 0;
        } else if (hasMonsters) {
            // 只有怪物
            num_1 = 1;
        } else {
            // 都没有，不生成
            return;
        }

        switch(num_1){
            case 0:
                this.CloneNum(0);
                break;
            case 1:
                this.CloneNum(1);
                break;
        }
    }
    /**
     * 克隆几遍
     * @param num 
     */
    CloneNum(num:number){
        var num0 = Math.floor(Math.random() * 2 + 1);
        var call = cc.callFunc(function(){
            if(num == 0){
                this.Clones();
            }else{
                this.CloneMoster();
            }
        },this);
        var action = cc.sequence(cc.delayTime(1),call).repeat(num0);
        this.node.runAction(action);
    }
    /**
     * 两边固定障碍物
     */
    Clones(){
        // 获取当前关卡配置
        const levelConfig = mGameData.getCurrentLevelConfig();
        if (!levelConfig || !levelConfig.ZAW || levelConfig.ZAW.length === 0) {
            return;
        }

        var num = Math.floor(Math.random() * 10);
        if(num < 5){
            // 生成左侧障碍物
            // 从配置的障碍物类型中随机选择一个
            const availableObstacles = levelConfig.ZAW.filter(type => type < 5); // 左侧障碍物类型
            if (availableObstacles.length > 0) {
                const num1 = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
                var zhangai1 = CloneChi.GetIns().CreateNode(this.ZAW[num1]);
                this.ZAWparent.addChild(zhangai1);
                zhangai1.setPosition(cc.v2(-257,893));
            }
        }else{
            // 生成右侧障碍物
            // 从配置的障碍物类型中随机选择一个
            const availableObstacles = levelConfig.ZAW.filter(type => type >= 5); // 右侧障碍物类型
            if (availableObstacles.length > 0) {
                const num2 = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
                var zhangai2 = CloneChi.GetIns().CreateNode(this.ZAW[num2]);
                this.ZAWparent.addChild(zhangai2);
                zhangai2.setPosition(cc.v2(257,893));
            }
        }
    }
    /**
     * 克隆怪物
     */
    CloneMoster(){
        // 获取当前关卡配置
        const levelConfig = mGameData.getCurrentLevelConfig();
        if (!levelConfig || !levelConfig.Monster || levelConfig.Monster.length === 0) {
            return;
        }

        // 获取可用的怪物类型
        let availableMonsters = [...levelConfig.Monster];
        
        // 避免连续生成两个蚊子
        if (this.lastMonsterType === 1 && availableMonsters.length > 1) {
            // 上一次是蚊子，这次移除蚊子类型
            availableMonsters = availableMonsters.filter(type => type !== 1);
        }
        
        // 从可用怪物类型中随机选择
        const num3 = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
        
        if(num3 == 0){
            // 生成云
            var yun = CloneChi.GetIns().CreateNode(this.Yun);
            this.ZAWparent.addChild(yun);
            yun.setPosition(cc.v2(0,893));
            this.lastMonsterType = 0; // 记录为云
        }else{
            // 生成蚊子
            var wenzi = CloneChi.GetIns().CreateNode(this.Wenzi);
            this.ZAWparent.addChild(wenzi);
            wenzi.setPosition(cc.v2(0,893));
            
            // 交替设置蚊子位置
            var wenziPosition = this.lastWenziPosition;
            if (wenziPosition === -1) {
                // 第一次生成，随机选择位置
                wenziPosition = Math.floor(Math.random() * 2);
            } else {
                // 后续生成，使用与上次不同的位置
                wenziPosition = wenziPosition === 0 ? 1 : 0;
            }
            
            // 初始化蚊子并指定位置
            wenzi.getComponent('Moster2').initwenzi(wenziPosition);
            
            // 更新记录
            this.lastMonsterType = 1; // 记录为蚊子
            this.lastWenziPosition = wenziPosition; // 记录本次蚊子位置
        }
    }
    
    /**
     * 下一关方法
     */
    NextLevel(){
        // 恢复游戏
        mGameData.isGameBegin = true;
        cc.director.resume();
        
        console.log('当前关卡:', mGameData.currentLevel);
        
        // 保存当前关卡数据
        mGameData.SaveLevelData();
        
        // 停止当前BGM
        AudioManager.GetIns().StopBgm();
        
        // 返回主界面并打开关卡选择界面
        console.log('返回主界面，将打开关卡选择界面');
        mGameData.shouldOpenLevelSelect = true;
        cc.director.loadScene('Start');
    }
    
    /**
     * 从通关弹窗返回主界面
     */
    BacktoHomeFromPass(){
        // 恢复游戏
        cc.director.resume();
        
        // 隐藏通关弹窗
        if(this.gamepass){
            this.gamepass.active = false;
        }
        
        // 返回主界面之前保存关卡数据
        mGameData.SaveLevelData();
        
        // 返回主界面
        AudioManager.GetIns().StopBgm();
        mGameData.shouldOpenLevelSelect = false;
        cc.director.loadScene('Start');
    }
    
    /**
     * 初始化倒计时
     */
    public initCountdown() {
        if (mGameData.isInfiniteMode) {
            // 无限模式下隐藏倒计时节点，显示无尽模式标签
            if (this.countdownLabel) {
                this.countdownLabel.node.active = false;
            }
            if (this.wujinLabel) {
                this.wujinLabel.node.active = true;
            }
            return;
        }
        
        // 先停止当前可能正在运行的倒计时
        this.isCountingDown = false;
        this.unschedule(this.updateCountdown);
        
        // 设置初始剩余时间为当前关卡的目标时间
        this.remainingTime = mGameData.getCurrentLevelConfig().time;
        this.isCountingDown = true;
        
        // 更新倒计时显示
        this.updateCountdownDisplay();
        
        // 关卡模式下检查并使用道具
        this.checkAndUseItems();
        
        // 开始每秒更新倒计时
        this.schedule(this.updateCountdown, 1);
    }
    
    /**
     * 检查并使用关卡模式下的道具
     */
    private checkAndUseItems(retryCount: number = 0) {
        // 直接从GameData获取玩家管理器实例
        const playerManager = mGameData.playerManager;
        if (!playerManager) {
            const maxRetries = 10;
            if (retryCount < maxRetries) {
                console.warn(`PlayerManager实例未找到，将在100ms后重试 (${retryCount + 1}/${maxRetries})`);
                // 添加延迟重试，确保PlayerManager实例已经存储到GameData中
                this.scheduleOnce(() => {
                    this.checkAndUseItems(retryCount + 1);
                }, 0.1);
            } else {
                console.error('PlayerManager实例未找到，已达到最大重试次数');
            }
            return;
        }
        
        // 检查道具1（buff2）- 优先使用道具1
        if (mGameData.getItemStock(1) > 0) {
            // 消耗一个道具1
            mGameData.reduceItemStock(1, 1);
            // 调用使用道具接口
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            this.postUsedGoods("app.shenyuanlieshou", savedUsername, 2002);
            
            // 应用buff2效果
            mGameData.buff2(playerManager);
            return; // 只使用一个道具
        }
        
        // 检查道具2（保护盾）- 道具1没有时才使用道具2
        if (mGameData.getItemStock(2) > 0) {
            // 消耗一个道具2
            mGameData.reduceItemStock(2, 1);
            // 调用使用道具接口
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            this.postUsedGoods("app.shenyuanlieshou", savedUsername, 1001);
            
            // 设置保护盾效果（相当于碰到dun1的效果）
            if (playerManager.dun) {
                playerManager.dun.opacity = 255;
                AudioManager.GetIns().PlayAudio('Protect');
            } else {
                const maxRetries = 10;
                if (retryCount < maxRetries) {
                    console.warn(`PlayerManager.dun未找到，将在100ms后重试 (${retryCount + 1}/${maxRetries})`);
                    // 添加延迟重试，确保dun节点已经初始化完成
                    this.scheduleOnce(() => {
                        this.checkAndUseItems(retryCount + 1);
                    }, 0.1);
                } else {
                    console.error('PlayerManager.dun未找到，已达到最大重试次数');
                }
            }
            return; // 只使用一个道具
        }
    }
    
    /**
     * 更新倒计时
     */
    private updateCountdown() {
        if (!this.isCountingDown || mGameData.isInfiniteMode) return;
        
        this.remainingTime--;
        
        // 更新倒计时显示
        this.updateCountdownDisplay();
        
        // 检查倒计时是否结束
        if (this.remainingTime <= 0) {
            this.onCountdownEnd();
        }
    }
    
    /**
     * 更新倒计时显示
     */
    private updateCountdownDisplay() {
        if (this.countdownLabel) {
            if (mGameData.isInfiniteMode) {
                // 无限模式下隐藏倒计时节点，显示无尽模式标签
                this.countdownLabel.node.active = false;
                if (this.wujinLabel) {
                    this.wujinLabel.node.active = true;
                }
            } else {
                // 关卡模式下显示倒计时节点并更新文本，隐藏无尽模式标签
                this.countdownLabel.node.active = true;
                this.countdownLabel.string = this.formatTime(this.remainingTime);
                if (this.wujinLabel) {
                    this.wujinLabel.node.active = false;
                }
            }
        }
    }
    
    /**
     * 格式化时间为MM:SS格式
     * @param seconds 总秒数
     * @returns 格式化后的时间字符串
     */
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 处理倒计时结束
     */
    private onCountdownEnd() {
        this.isCountingDown = false;
        this.unschedule(this.updateCountdown);
        
        // 显示通关弹窗
        this.showGamePass();
    }
    
    /**
     * 初始化3秒倒计时
     */
    private initPreGameCountdown() {
        // 先暂停游戏
        mGameData.isGameBegin = false;
        
        // 设置初始剩余时间为3秒
        this.preGameCountdownTime = 3;
        this.isPreGameCountingDown = true;
        
        // 显示3秒倒计时遮罩
        if (this.preGameCountdownMask) {
            this.preGameCountdownMask.active = true;
        }
        
        // 更新3秒倒计时显示
        this.updatePreGameCountdownDisplay();
        
        // 开始每秒更新倒计时
        this.schedule(this.updatePreGameCountdown, 1);
    }
    
    /**
     * 更新3秒倒计时
     */
    private updatePreGameCountdown() {
        if (!this.isPreGameCountingDown) return;
        
        this.preGameCountdownTime--;
        
        // 更新3秒倒计时显示
        this.updatePreGameCountdownDisplay();
        
        // 检查倒计时是否结束
        if (this.preGameCountdownTime <= 0) {
            this.onPreGameCountdownEnd();
        }
    }
    
    /**
     * 更新3秒倒计时显示
     */
    private updatePreGameCountdownDisplay() {
        // 使用大倒计时标签显示3秒倒计时
        if (this.preGameCountdownLabel) {
            // 显示3秒倒计时文本
            this.preGameCountdownLabel.string = this.preGameCountdownTime.toString();
            // 确保标签可见
            this.preGameCountdownLabel.node.active = true;
        }
        
        // 隐藏原来的通关倒计时标签
        if (this.countdownLabel) {
            this.countdownLabel.node.active = false;
        }
        
        // 隐藏无尽模式标签
        if (this.wujinLabel) {
            this.wujinLabel.node.active = false;
        }
    }
    
    /**
     * 处理3秒倒计时结束
     */
    private onPreGameCountdownEnd() {
        this.isPreGameCountingDown = false;
        this.unschedule(this.updatePreGameCountdown);
        
        // 隐藏大倒计时标签
        if (this.preGameCountdownLabel) {
            this.preGameCountdownLabel.node.active = false;
        }
        
        // 隐藏3秒倒计时遮罩
        if (this.preGameCountdownMask) {
            this.preGameCountdownMask.active = false;
        }
        
        // 开始游戏
        mGameData.isGameBegin = true;
        
        // 显示Player节点并恢复角色动作播放
        if (mGameData.playerManager) {
            mGameData.playerManager.node.active = true;
            if (mGameData.playerLoc === -1) {
                mGameData.playerManager.anim.play('z1');
            } else {
                mGameData.playerManager.anim.play('y1');
            }
        }
        
        // 初始化关卡倒计时
        this.initCountdown();
    }



    //通关上报
    async postPass(appid: string, username: string, rank: number, star: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/PassLevel";
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
            
            xhr.send(JSON.stringify({ appid, username, rank, star}));
        });
    }


    //使用道具请求
    async postUsedGoods(appid: string, username: string, goods_id: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/UsedGoods";
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
            
            xhr.send(JSON.stringify({ appid, username, goods_id }));
        });
    }
    
    /**
     * 根据游戏模式更新分享按钮图片
     */
    private updateBtnShareImage() {
        if (!this.BtnShare) return;
        
        const btnShareSprite = this.BtnShare.getComponent(cc.Sprite);
        if (!btnShareSprite) return;
        
        // 根据游戏模式选择对应的分享按钮图片
        if (mGameData.isInfiniteMode) {
            btnShareSprite.spriteFrame = this.btnShareInfiniteSprite;
        } else {
            btnShareSprite.spriteFrame = this.btnShareLevelSprite;
        }
    }
}
