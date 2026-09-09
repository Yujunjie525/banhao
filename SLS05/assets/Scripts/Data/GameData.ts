const {ccclass, property} = cc._decorator;

// 关卡配置接口
export interface LevelConfig {
    levelId: number; //关卡
    icon: string;   //icon图标
    bg: string;     //背景
    time: number;   //通关时间
    star1: number;  //1星分数
    star2: number;  //2星分数
    star3: number;  //3星分数
    sec: number;    //生成障碍物或怪物间隔 3000 = 3秒
    ZAW: Array<number>; // 可出现的障碍物类型数组 0右头 1右身 2右尾 3右飞镖 4右盾 
                                             //5左头 6左身 7左尾 8左飞镖 9左盾
    Monster: Array<number>; // 可出现的怪物类型数组 (0-云，1-蚊子)
}

@ccclass
class GameData{
    //背景音乐是否开启,默认开启
    public isBGMOn:boolean = true;
    //游戏是否开始
    public isGameBegin:boolean = true;
    //背景移动速度
    public BgMoveSpeed:number = 8;
    //是否第二次触摸
    public isTouchAgain:boolean = true;
    //玩家所处位置。-1在左，1在右
    public playerLoc:number = -1;
    //玩家当下得分
    public EveryScore:number = 0;
    //玩家最高得分
    public BestScore:number = 0;
    //记录玩家BUFF状态
    public playerBuff:boolean = false;
    //是否微信分享
    public isOpenWXShare:boolean = true;
    //存储时的最高分key
    public BestScoreKey:string = 'BestScore';
    //buff图片(0-飞镖，1--蚊子，2--狐狸)
    public buffTuji: Array<number> = [-1,-1,-1];
    //护盾值
    public playerHudun:cc.Node = null;
    //PlayerManager实例
    public playerManager:any = null;
    //物体移动速度
    public MoveSpeed:number = 10;
    //体力系统相关
    public currentStamina:number = 30; //当前体力值
    public maxStamina:number = 30; //最大体力值
    public lastRecoverTime:number = Date.now(); //上次恢复体力的时间戳
    public staminaKey:string = 'Stamina'; //存储体力的key
    public lastRecoverTimeKey:string = 'LastRecoverTime'; //存储上次恢复时间的key
    
    //钻石系统相关
    public currentGold:number = 20000; //当前钻石数量，初始给20000
    public goldKey:string = 'CurrentGold'; //存储钻石的key
    
    //商店道具库存相关
    public itemStock: Array<number> = [0, 0, 0]; //道具1-3的库存
    public itemStockKey:string = 'ItemStock'; //存储道具库存的key
    
    //关卡模式相关
    public isInfiniteMode:boolean = true; //是否为无限模式，false为关卡模式
    public currentLevel:number = 1; //当前正在玩的关卡
    public unlockedLevel:number = 1; //已经解锁的最高关卡
    //是否自动打开关卡选择界面
    public shouldOpenLevelSelect:boolean = false;
    // 扩展关卡到100关，难度逐渐增加
    public levelTargetScores:Array<number> = [];

    // 关卡配置数组
    public levelConfigs: Array<LevelConfig> = [];
    
// 静态关卡配置数组
private static LEVEL_CONFIGS: LevelConfig[] = [
    { levelId: 1, icon: "level_1", bg: "gamebg_1", time: 20, star1: 30, star2: 35, star3: 40, sec: 3000, ZAW: [0, 5, 1, 6, 4], Monster: [0] },
    { levelId: 2, icon: "level_1", bg: "gamebg_1", time: 25, star1: 35, star2: 40, star3: 50, sec: 2900, ZAW: [0, 5, 2, 7, 9], Monster: [1] },
    { levelId: 3, icon: "level_1", bg: "gamebg_1", time: 30, star1: 40, star2: 45, star3: 60, sec: 2800, ZAW: [0, 5, 3, 8, 4], Monster: [0] },
    { levelId: 4, icon: "level_1", bg: "gamebg_1", time: 35, star1: 45, star2: 55, star3: 70, sec: 2700, ZAW: [0, 5, 1, 6, 9], Monster: [1] },
    { levelId: 5, icon: "level_1", bg: "gamebg_1", time: 40, star1: 50, star2: 55, star3: 80, sec: 2600, ZAW: [1, 6, 3, 8, 4], Monster: [0] },
    { levelId: 6, icon: "level_1", bg: "gamebg_1", time: 45, star1: 55, star2: 75, star3: 90, sec: 2500, ZAW: [1, 6, 3, 8, 9], Monster: [1] },
    { levelId: 7, icon: "level_1", bg: "gamebg_1", time: 50, star1: 60, star2: 75, star3: 100, sec: 2400, ZAW: [2, 7, 1, 6, 4], Monster: [0] },
    { levelId: 8, icon: "level_1", bg: "gamebg_1", time: 55, star1: 65, star2: 75, star3: 100, sec: 2300, ZAW: [2, 7, 1, 6, 9], Monster: [1] },
    { levelId: 9, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 100, sec: 2200, ZAW: [0, 1, 2, 3, 4], Monster: [0] },
    { levelId: 10, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 100, sec: 2100, ZAW: [5, 6, 7, 8, 9], Monster: [1] },
    { levelId: 11, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 12, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 13, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 14, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 15, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 16, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 17, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 18, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 19, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 20, icon: "level_1", bg: "gamebg_1", time: 60, star1: 70, star2: 75, star3: 110, sec: 2000, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    // 第21关保持1000
    { levelId: 21, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1500, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    // 从第22关开始，每一关减3
    { levelId: 22, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1495, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 23, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1490, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 24, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1485, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 25, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1480, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 26, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1475, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 27, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1470, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 28, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1465, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 29, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1460, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 30, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1455, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 31, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1450, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 32, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1445, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 33, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1440, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 34, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1435, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 35, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1430, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 36, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1425, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 37, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1420, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 38, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1415, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 39, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1410, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 40, icon: "level_2", bg: "gamebg_2", time: 60, star1: 70, star2: 100, star3: 120, sec: 1405, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 41, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1400, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 42, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1395, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 43, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1390, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 44, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1385, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 45, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1380, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 46, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1375, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 47, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1370, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 48, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1365, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 49, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1360, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 50, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 100, star3: 120, sec: 1350, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 51, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1345, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 52, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1340, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 53, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1335, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 54, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1330, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 55, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1325, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 56, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1320, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 57, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1315, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 58, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1310, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 59, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1300, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 60, icon: "level_3", bg: "gamebg_3", time: 60, star1: 70, star2: 120, star3: 150, sec: 1305, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 61, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1300, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 62, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1295, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 63, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1290, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 64, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1285, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 65, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1280, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 66, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1275, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 67, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1270, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 68, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1265, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 69, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1260, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 70, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1250, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 71, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1255, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 72, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1245, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 73, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1240, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 74, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1235, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 75, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1230, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 76, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1225, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 77, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1220, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 78, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1215, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 79, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1210, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 80, icon: "level_4", bg: "gamebg_4", time: 60, star1: 70, star2: 120, star3: 150, sec: 1200, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 81, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1205, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 82, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1200, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 83, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1195, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 84, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1190, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 85, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1185, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 86, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1180, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 87, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1175, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 88, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1170, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 89, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1165, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 90, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1160, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 91, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1155, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 92, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1150, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 93, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1145, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 94, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1140, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 95, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1135, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 96, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1130, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 97, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1125, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 98, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1120, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 99, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1115, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 100, icon: "level_5", bg: "gamebg_5", time: 60, star1: 70, star2: 120, star3: 150, sec: 1110, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 101, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1105, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 102, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1100, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 103, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1095, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 104, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1090, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 105, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1085, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 106, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1080, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 107, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1075, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 108, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1070, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 109, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1065, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 110, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1060, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 111, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1055, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 112, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1050, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 113, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1045, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 114, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1040, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 115, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1035, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 116, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1030, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 117, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1025, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 118, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1020, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 119, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1015, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] },
    { levelId: 120, icon: "level_6", bg: "gamebg_6", time: 60, star1: 70, star2: 150, star3: 200, sec: 1010, ZAW: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Monster: [0, 1] }

];
    
    constructor() {
        // 直接使用静态关卡配置数组
        this.levelConfigs = [...GameData.LEVEL_CONFIGS];
        console.log('成功加载内置关卡配置:', this.levelConfigs.length, '关');
    }


    public currentLevelKey:string = 'CurrentLevel'; //存储当前关卡的key
    public unlockedLevelKey:string = 'UnlockedLevel'; //存储已解锁关卡的key
    
    /**
     * 获取当前用户ID
     * @returns 用户ID，如果没有登录返回null
     */
    private getUserId(): string | null {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    }
    
    /**
     * 生成带用户ID后缀的存储key
     * @param baseKey 基础key
     * @returns 带用户ID后缀的key
     */
    private getKeyWithUserId(baseKey: string): string {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    }
    /**
     * 存储数据
     */
    SetData(){
        if(cc.sys.platform != cc.sys.WECHAT_GAME){
            return;
        }

        const bestScoreKey = this.getKeyWithUserId(this.BestScoreKey);
        wx.setStorage({
            key:bestScoreKey,
            data:this.BestScore,
        });

        wx.setUserCloudStorage({
            KVDataList: [{ key: '1', value:mGameData.BestScore.toString()}],
        });
        
        // 存储体力数据
        this.SaveStaminaData();
        // 存储关卡数据
        this.SaveLevelData();
        // 存储钻石数据
        this.SaveGoldData();
    }
    
    /**
     * 存储体力数据
     */
    SaveStaminaData(){
        // 使用Cocos Creator的本地存储接口替代微信接口
        const staminaKey = this.getKeyWithUserId(this.staminaKey);
        const lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        cc.sys.localStorage.setItem(staminaKey, this.currentStamina.toString());
        cc.sys.localStorage.setItem(lastRecoverTimeKey, this.lastRecoverTime.toString());
    }
    
    /**
     * 获取存储的体力数据
     */
    GetStaminaData(){
        // 使用Cocos Creator的本地存储接口替代微信接口
        const staminaKey = this.getKeyWithUserId(this.staminaKey);
        const lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        const staminaStr = cc.sys.localStorage.getItem(staminaKey);
        if (staminaStr) {
            this.currentStamina = parseInt(staminaStr);
        } else {
            // 如果没有数据，重置为满体力
            this.currentStamina = this.maxStamina;
        }
        
        const lastRecoverTimeStr = cc.sys.localStorage.getItem(lastRecoverTimeKey);
        if (lastRecoverTimeStr) {
            this.lastRecoverTime = parseInt(lastRecoverTimeStr);
        } else {
            // 如果没有数据，重置为当前时间
            this.lastRecoverTime = Date.now();
        }
    }
    
    /**
     * 存储钻石数据
     */
    SaveGoldData(){
        // 使用Cocos Creator的本地存储接口保存钻石数据
        const goldKey = this.getKeyWithUserId(this.goldKey);
        cc.sys.localStorage.setItem(goldKey, this.currentGold.toString());
    }
    
    /**
     * 获取存储的钻石数据
     */
    GetGoldData(){
        // 使用Cocos Creator的本地存储接口加载钻石数据
        const goldKey = this.getKeyWithUserId(this.goldKey);
        // 先检查用户ID是否正确获取
        const userId = this.getUserId();
        const goldStr = cc.sys.localStorage.getItem(goldKey);
        if (goldStr) {
            this.currentGold = parseInt(goldStr);
        } else {
            // 如果没有数据，重置为初始值20000
            this.currentGold = 20000;
            // 同时尝试读取不带用户ID的key
            const defaultGoldKey = 'CurrentGold';
            const defaultGoldStr = cc.sys.localStorage.getItem(defaultGoldKey);
        }
    }
    /**
     * 存储道具库存数据
     */
    SaveItemStockData(){
        // 使用Cocos Creator的本地存储接口保存道具库存数据
        const itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(this.itemStock));
    }
    
    /**
     * 获取存储的道具库存数据
     */
    GetItemStockData(){
        // 使用Cocos Creator的本地存储接口加载道具库存数据
        const itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        const itemStockStr = cc.sys.localStorage.getItem(itemStockKey);
        if (itemStockStr) {
            this.itemStock = JSON.parse(itemStockStr);
        } else {
            // 如果没有数据，重置为初始值
            this.itemStock = [0, 0, 0];
        }
    }
    
    /**
     * 获取指定道具的库存
     * @param itemId 道具ID (1-3)
     * @returns 道具库存数量
     */
    getItemStock(itemId: number): number {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            return this.itemStock[index];
        }
        return 0;
    }
    
    /**
     * 增加指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 增加的数量
     */
    addItemStock(itemId: number, count: number): void {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            this.itemStock[index] += count;
            this.SaveItemStockData();
        }
    }
    
    /**
     * 减少指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 减少的数量
     * @returns 是否成功减少
     */
    reduceItemStock(itemId: number, count: number): boolean {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length && this.itemStock[index] >= count) {
            this.itemStock[index] -= count;
            this.SaveItemStockData();
            return true;
        }
        return false;
    }
    
    /**
     * 存储关卡数据
     */
    SaveLevelData(){
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        const unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);
        
        cc.sys.localStorage.setItem(currentLevelKey, this.currentLevel.toString());
        cc.sys.localStorage.setItem(unlockedLevelKey, this.unlockedLevel.toString());
        
        console.log('关卡数据已保存：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    }
    
    /**
     * 获取存储的关卡数据
     */
    GetLevelData(){
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        const unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);
        
        // 加载当前关卡
        const levelStr = cc.sys.localStorage.getItem(currentLevelKey);
        if (levelStr) {
            this.currentLevel = parseInt(levelStr);
        } else {
            this.currentLevel = 1;
        }
        
        // 加载已解锁关卡
        const unlockedLevelStr = cc.sys.localStorage.getItem(unlockedLevelKey);
        if (unlockedLevelStr) {
            this.unlockedLevel = parseInt(unlockedLevelStr);
        } else {
            this.unlockedLevel = 1;
        }
        
        console.log('从本地加载关卡数据：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    }
    
    /**
     * 消耗一点体力
     * @returns 是否成功消耗
     */
    ConsumeStamina():boolean{
        if(this.currentStamina > 0){
            this.currentStamina--;
            this.SaveStaminaData();
            return true;
        }
        return false;
    }
    
    /**
     * 检查并恢复体力
     */
    CheckAndRecoverStamina(){
        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒
        
        // 计算应该恢复的体力点数
        const recoverPoints = Math.floor(timeDiff / recoverInterval);
        
        if(recoverPoints > 0){
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + recoverPoints);
            this.lastRecoverTime += recoverPoints * recoverInterval;
            this.SaveStaminaData();
        }
    }
    
    /**
     * 检查是否有足够的体力开始游戏
     * @returns 是否有足够体力
     */
    HasEnoughStamina():boolean{
        this.CheckAndRecoverStamina();
        return this.currentStamina > 0;
        // return true
    }
    
    /**
     * 计算距离下次恢复体力的剩余时间（毫秒）
     * @returns 剩余时间（毫秒），如果体力已满则返回0
     */
    GetRemainingRecoverTime():number{
        // 如果体力已满，不需要恢复
        if(this.currentStamina >= this.maxStamina){
            return 0;
        }
        
        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒
        
        // 计算距离下次恢复的剩余时间
        const remainingTime = recoverInterval - (timeDiff % recoverInterval);
        return remainingTime;
    }
    
    /**
     * 获取格式化的恢复倒计时字符串
     * @returns 格式化的时间字符串（MM:SS），如果体力已满则返回空字符串
     */
    GetFormattedRecoverTime():string{
        const remainingTime = this.GetRemainingRecoverTime();
        
        if(remainingTime <= 0){
            return "";
        }
        
        // 转换为分钟和秒
        const minutes = Math.floor(remainingTime / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        
        // 格式化为MM:SS格式
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    /**
     * 记录buff数据
     * @param self 
     */
    initBuffzu(self){
        this.buffTuji[0]=-1;
        this.buffTuji[1]=-1;
        this.buffTuji[2]=-1;
        if (this.buffTuji[0] == -1) {
            self.Spr1.spriteFrame = null;
            self.Spr2.spriteFrame = null;
            self.Spr3.spriteFrame = null;
        }
    }
    /**
     * 添加buff数据
     * @param num 
     * @param self 
     */
    addBuffNum(num:any,self:any){
        var num0 = this.buffTuji[0];
        var num1 = this.buffTuji[1];
        if (num1 > -1) {
            if (num1 == num) {
                this.buffTuji[2] = num;
            } else {
                this.buffTuji[1] = -1;
                this.buffTuji[0] = num;
            }
        } else {
            if (num0 > -1) {
                if (num0 == num) {
                    this.buffTuji[1] = num;
                } else {
                    this.buffTuji[0] = num;
                }
            } else {
                this.buffTuji[0] = num;
            }
        }
        this.checkBuff(self);
    }
    /**
     * 检查是否满足buffer
     * @param self 
     */
    checkBuff(self) {
        var num = this.buffTuji[2];
        if (num == -1) return;
        switch (num) {
            case 0:
                this.buff1(self);
                self.PlayBuffAudio();
                this. initBuffzu(self);
                break;
            case 1:
                this.buff2(self);
                self.PlayBuffAudio();                
                this. initBuffzu(self);
                break;
            case 2:
                this.buff3(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
        }
    }
    
    buff1(self){
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff1");
        this.isTouchAgain=false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250,0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(() => {
            this.playerBuff = false;
            this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (this.playerHudun) {
                this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        this.playerLoc = 1;
                    } else if (self.node.x < -150) {
                        self.anim.play('z1');
                        this.playerLoc = -1;
                    } else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        }
                    }
                }
            }
        });
       
        var action=cc.sequence(a1,a2,a3,a4,a5,a6);
        self.node.runAction(action);
    }
    buff2(self){
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff2");
        this.isTouchAgain=false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250,0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(() => {
            this.playerBuff = false;
            this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (this.playerHudun) {
                this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        this.playerLoc = 1;
                    } else if (self.node.x < -150) {
                        self.anim.play('z1');
                        this.playerLoc = -1;
                    } else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        }
                    }
                }
            }
        });
       
        var action=cc.sequence(a1,a2,a3,a4,a5,a6);
        self.node.runAction(action);
    }
    buff3(self){
        // 检查dun是否存在
        if (self.dun) {
            this.playerHudun=self.dun;
            this.playerHudun.y=100;

            self.node.stopAllActions();
            self.dun.opacity = 255;
            self.anim.play("buff3");
            this.isTouchAgain=false;
            this.playerBuff = true;
            this.BgMoveSpeed = 24;
            var a1 = cc.moveTo(0.5, cc.v2(0, 200));
            var a2 = cc.moveTo(3, cc.v2(250, 100));
            var a3 = cc.moveTo(3, cc.v2(-250, 0));
            var a4 = cc.moveTo(3, cc.v2(250,0));
            var a5 = cc.moveTo(2, cc.v2(200, -197));
            var a6 = cc.callFunc(() => {
                this.playerBuff = false;
                this.BgMoveSpeed = 8;
                // 重置保护罩位置到人物中心
                if (this.playerHudun) {
                    this.playerHudun.y = 0;
                }
                // 确保玩家位置正确，并根据位置设置正确的状态
                if (self) {
                    // 检查角色是否到达地面位置
                    if (Math.abs(self.node.y + 197) < 10) {
                        // 角色已经在地面，可以恢复跳跃权限
                        this.isTouchAgain = true;
                        // 恢复角色正常跑动动画
                        if (self.node.x > 150) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else if (self.node.x < -150) {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        } else {
                            // 如果角色在中间位置，根据当前位置设置方向
                            if (self.node.x > 0) {
                                self.anim.play('y1');
                                this.playerLoc = 1;
                            } else {
                                self.anim.play('z1');
                                this.playerLoc = -1;
                            }
                        }
                    }
                }
            });
         
            var action=cc.sequence(a1,a2,a3,a4,a5,a6);
            self.node.runAction(action);
        } else {
            console.warn('self.dun未找到，无法执行buff3效果');
        }
    }
    /**
     * buff图片管理
     * @param self 
     */
    changeSprs(self) {
        self.Spr1.spriteFrame = self.SprZu[this.buffTuji[0]];
        self.Spr2.spriteFrame = self.SprZu[this.buffTuji[1]];
        self.Spr3.spriteFrame = self.SprZu[this.buffTuji[2]];
    }
    /**数据初始化 */
    initGame() {
        //控制克隆怪物
        this.isGameBegin=true;
        //开启触屏
        this.playerLoc=-1;
        this.isTouchAgain=true;
        this.EveryScore=0;
        // 重置玩家buff状态，避免永久无敌
        this.playerBuff=false;
        // 重置速度为初始值
        this.BgMoveSpeed=8;
        this.MoveSpeed=10;
        // 重置buff图片状态
        this.buffTuji = [-1,-1,-1];
        // 重置护盾节点
        this.playerHudun=null;
        // 重置PlayerManager引用
        this.playerManager=null;
        // 不改变当前游戏模式（保持无限模式或关卡模式）
        // 无限模式下不重置currentLevel，保持用户进度
    }
    
    /**
     * 初始化关卡游戏
     */
    initLevelGame() {
        this.initGame();
        this.isInfiniteMode = false;
        this.EveryScore = 0;
    }
    
    /**
     * 获取当前关卡的目标分数
     * @returns 当前关卡目标分数
     */
    getCurrentLevelTargetScore(): number {
        const levelConfig = this.getCurrentLevelConfig();
        if (levelConfig) {
            return levelConfig.star1;
        }
        return 0;
    }

    /**
     * 获取当前关卡的配置
     * @returns 当前关卡配置
     */
    getCurrentLevelConfig(): LevelConfig {
        const index = this.currentLevel - 1;
        return this.levelConfigs[index] || null;
    }

    /**
     * 根据关卡ID获取关卡配置
     * @param level 关卡ID
     * @returns 关卡配置
     */
    getLevelConfig(level: number): LevelConfig {
        const index = level - 1;
        return this.levelConfigs[index] || null;
    }
    
    /**
     * 计算获得的星星数
     * @param score 当前得分
     * @returns 获得的星星数（0-3）
     */
    calculateStars(score: number): number {
        if (this.isInfiniteMode) {
            // 无限模式下的星星计算逻辑：基于分数范围
            if (score >= 401) {
                return 3; // 401分以上，获得3颗星
            } else if (score >= 201) {
                return 2; // 201-400分，获得2颗星
            } else if (score >= 101) {
                return 1; // 101-200分，获得1颗星
            } else {
                return 0; // 0-100分，获得0颗星
            }
        } else {
            // 关卡模式下的星星计算逻辑：基于配置文件中的星星条件
            const levelConfig = this.getCurrentLevelConfig();
            
            if (!levelConfig) {
                console.error('当前关卡配置不存在');
                return 0;
            }
            
            // 使用配置文件中的星星条件
            if (score >= levelConfig.star3) {
                return 3; // 达到3星条件
            } else if (score >= levelConfig.star2) {
                return 2; // 达到2星条件
            } else if (score >= levelConfig.star1) {
                return 1; // 达到1星条件
            } else {
                return 0; // 未达到任何星星条件
            }
        }
    }
    
    /**
     * 保存当前关卡获得的星星数
     * @param stars 获得的星星数
     */
    saveLevelStars(stars: number): void {
        const starsKey = this.getKeyWithUserId(`LevelStars_${this.currentLevel}`);
        
        const currentStarsStr = cc.sys.localStorage.getItem(starsKey);
        const currentStars = currentStarsStr ? parseInt(currentStarsStr) : 0;
        
        if (stars > currentStars) {
            cc.sys.localStorage.setItem(starsKey, stars.toString());
            console.log(`关卡${this.currentLevel}获得${stars}颗星（比之前的${currentStars}颗更多），已保存`);
        } else {
            console.log(`关卡${this.currentLevel}获得${stars}颗星，未超过之前的${currentStars}颗，不保存`);
        }
    }
    
    /**
     * 获取指定关卡获得的星星数
     * @param level 关卡数
     * @returns 获得的星星数（0-3）
     */
    getLevelStars(level: number): number {
        if (level < 1 || level > this.getTotalLevels()) {
            console.warn(`获取星星数失败：关卡号${level}无效`);
            return 0;
        }
        
        const starsKey = this.getKeyWithUserId(`LevelStars_${level}`);
        const starsStr = cc.sys.localStorage.getItem(starsKey);
        
        let stars = starsStr ? parseInt(starsStr) : 0;
        
        // 如果关卡已经通过（即小于当前关卡），且本地没有星星数据，给默认1星
        // if (level < this.currentLevel && stars === 0) {
        //     stars = 1;
        //     console.log(`关卡${level}已通过，但本地无星星数据，给默认1星`);
        // }
        
        const validStars = Math.max(0, Math.min(stars, 3));
        
        return validStars;
    }
    
    /**
     * 重置关卡进度为第一关
     */
    resetLevelProgress() {
        this.currentLevel = 1;
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        cc.sys.localStorage.removeItem(currentLevelKey);
        
        const totalLevels = this.getTotalLevels();
        for (let i = 1; i <= totalLevels; i++) {
            const starsKey = this.getKeyWithUserId(`LevelStars_${i}`);
            cc.sys.localStorage.removeItem(starsKey);
        }
        
        console.log('关卡进度已重置，重新从第1关开始');
    }
    
    /**
     * 获取总关卡数
     * @returns 总关卡数
     */
    getTotalLevels(): number {
        return this.levelConfigs.length;
    }
    
    /**
     * 获取已解锁的最高关卡
     * @returns 已解锁的最高关卡号
     */
    getHighestUnlockedLevel(): number {
        // 从最高关卡开始向下遍历，找到第一个已解锁的关卡
        for (let level = this.getTotalLevels(); level >= 2; level--) {
            if (this.isLevelUnlocked(level)) {
                return level;
            }
        }
        // 如果没有找到（理论上不可能，因为第一关总是解锁的），返回第一关
        return 1;
    }
    
    // 剧情弹窗相关
    public storyPopupShownKey: string = 'StoryPopupShown';
    
    /**
     * 检查剧情弹窗是否已显示
     * @returns 是否已显示
     */
    isStoryPopupShown(): boolean {
        const key = this.getKeyWithUserId(this.storyPopupShownKey);
        const value = cc.sys.localStorage.getItem(key);
        return value === 'true';
    }
    
    /**
     * 记录剧情弹窗已显示
     */
    setStoryPopupShown() {
        const key = this.getKeyWithUserId(this.storyPopupShownKey);
        cc.sys.localStorage.setItem(key, 'true');
    }
    
    /**
     * 检查关卡是否解锁
     * @param level 关卡号
     * @returns 是否解锁
     */
    isLevelUnlocked(level: number): boolean {
        // 确保关卡号有效
        const totalLevels = this.getTotalLevels();
        if (level < 1 || level > totalLevels) {
            return false;
        }
        
        // 所有小于等于已解锁关卡的关卡都应该解锁
        if (level <= this.unlockedLevel) {
            return true;
        }
        
        // 超过已解锁关卡，按照原逻辑判断
        return false;
    }
}
let mGameData = new GameData();
export default mGameData;