const { ccclass, property } = cc._decorator;

import UIMgr, { UICtrl } from "./../../Managers/UIMgr";
import GameApp from "../GameApp";
import ResMgr from "../../Managers/ResMgr";
import EventMgr from "../../Managers/EventMgr";
import UserData from "../UserData"
import SoundMgr from "../../Managers/SoundMgr";
import LevelData from "../LevelData"
import TtMgr from "../../Managers/TtMgr"
import mGameData from "../../Load/GameData"
import { APP_ID } from "../../Common/AppConfig";
import TipsManager from "../../Load/TipsManager";
import UserDataSyncManager from "../../Manager/UserDataSyncManager";



//游戏场景
@ccclass // 注意修改类名
export default class GameUI_Ctrl extends UICtrl {




    private top: cc.Node = null
    private bgMove: boolean = false
    //  private _callback = null
    private isBoss: boolean = false
    private isStopUpPlane: boolean = false
    private isBossUp: boolean = false
    private isPassLevel: boolean = false

    private isBack: boolean = false;//退出的判断
    private data: {} = {} //用户数据
    //技能冷却时间
    private skill_1_cdTime: number = null//技能1的冷却时间
    private skill_2_cdTime: number = null//技能1的冷却时间
    private hedan_cdTime: number = null
    private shield_cdTime: number = null//防护盾的冷却时间

    private LevelScore: number = null//本轮得分记录 通过后清零
    private LevelLength = null
    private play_hpR: cc.Node = null;


    //用户数据     
    private playerName: string = null//玩家飞机名字
    private game_gold: number = null //玩家金币
    private game_medal: number = null//玩家勋章
    private defaultEmitter: string = null //默认武器
    private playHp: number = null //生命值
    private Level: number = null;//关卡
    private pet: string = null//玩家宠物

    private hero: cc.Node = null;//玩家飞机
    private emitter: cc.Node = null;//玩家飞机发射器
    private emitter_pos: number = 0 //发射器距离

    private player_root = null   //玩家飞机父节点
    private emitter_root = null  //发射器父节点
    private enemy_root = null  //敌机父节点
    private box_root = null  //补给箱父节点
    private boss_root = null//boss父节点
    private shidld_root = null//防护盾父节点
    private ship_root = null//船只的父节点
    private gold_root = null//金币的父节点（所有奖励物品）
    private pet_root = null  //宠物父节点
    private hedan_root = null//核弹父节点

    private boss_warn_node: cc.Node = null//boss来袭的节点
    //  private level_num_node:cc.Node=null


    //关卡数据
    private enemyTimeDelayed: number = null//敌机的刷新间隔
    private boxTimeDelayed: number = null//补给的刷新间隔
    private enemyNum: number = null //敌机个数
    private boxNum: number = null //补给个数

    private enemyRandomNUm: number[] = []//敌机随机数
    private boxRandomNUm: number[] = []//补给随机数


    private enenyType: string[] = []//敌机类型
    private boxType: string[] = []//补给类型

    private bossType: string[] = []//boss
    private passScore: number = null//允许通关分数

    private map: string = null//地图  



    private bg_1: cc.Node = null //背景移动
    private bg_2: cc.Node = null //背景移动

    private yun1: cc.Node = null//云朵
    private yun2: cc.Node = null//云朵


    private play_Score: number = 0  //玩家分数


    private enemy_pools = {}//敌机对象池
    private box_pools = {}//宝箱和奖励的对象池

    //技能数量
    private skill_1Num: number = 0//普通导弹数量
    private skill_2Num: number = 0//寒冰导弹数量
    private hedan_num: number = 0//核弹数量

    private skill_1Label: cc.Label = null
    private skill_2Label: cc.Label = null
    private hedanLabel: cc.Label = null

    private gold_label: cc.Label = null
    private medal_label: cc.Label = null

    // 暂停相关
    private pausePanel: cc.Node = null // 暂停弹窗
    private isPaused: boolean = false // 是否暂停


    onLoad() {

        super.onLoad();

        //注册事件
        EventMgr.Instance.add_event_listenner("gemeOver", this, this.gameOver)//游戏结束 
        EventMgr.Instance.add_event_listenner("GetSupply", this, this.GetSupply)//玩家吃到补给
        EventMgr.Instance.add_event_listenner("getScore", this, this.getScore)//玩家加分
        EventMgr.Instance.add_event_listenner("destroyEmemy", this, this.destroyEmemy)//销毁敌机
        EventMgr.Instance.add_event_listenner("destroyBox", this, this.destroyBox)//销毁补给
        EventMgr.Instance.add_event_listenner("destroyBoss", this, this.destroyBoss)//销毁boss
        EventMgr.Instance.add_event_listenner("revive", this, this.revive)//复活
        EventMgr.Instance.add_event_listenner("nextLevel", this, this.nextLevel)//下一关
        EventMgr.Instance.add_event_listenner("playHpR", this, this.playHpR)//玩家被击中掉血
        EventMgr.Instance.add_event_listenner("createEnemyGold", this, this.createEnemyGold)//掉了奖励
        EventMgr.Instance.add_event_listenner("replay", this, this.replay)//重新开始本关
        EventMgr.Instance.add_event_listenner("qianghua", this, this.qianghua)//重新开始本关
        EventMgr.Instance.add_event_listenner("stopUpPlane", this, this.stopUpPlane)//是否停止刷敌机
        //按钮回调
        this.add_button_listen("bottom/buttleBack", this, this.emitter6);//返回默认子弹按钮
        this.add_button_listen("bottom/backHome", this, this.onBackToLoginScene)//返回按钮
        this.add_button_listen("bottom/skill_1", this, this.skill_1);// 普通导弹
        this.add_button_listen("bottom/skill_2", this, this.skill_2);// 寒冰导弹
        this.add_button_listen("bottom/hedan", this, this.hedan);// 寒冰导弹
        this.add_button_listen("bottom/shield", this, this.get_shield);// 保护盾按钮
        
        // 暂停按钮
        this.add_button_listen("top/pauseButton", this, this.onPauseButtonClick);// 暂停按钮

        //如果是字节跳动得开始录屏
        if (window.tt) {
            TtMgr.Instance.startRecorder()
        }



    }
 
    start() {

        this.init()//初始化
    }

    //临时 加金币测试用 
    // private addgold2() {
    //     this.game_gold += 1000
    //     this.gold_label.string = this.game_gold.toString()
    //     UserData.Instance.userData["game_gold"] = this.game_gold
    //     UserData.Instance.saveUserData()
    // }







    private init() {
        cc.director.resume //先继续游戏一下 防止因为弹窗暂停
        this.LevelScore = 0//本轮得分记录 通过后清零
        this.isBoss = false  //不是boss阶段
        this.isStopUpPlane = false//不停止刷敌机
        
        // 初始化暂停弹窗
        this.pausePanel = this.view["pausePanel"];
        if (this.pausePanel) {
            this.pausePanel.active = false;
            // 添加暂停弹窗按钮监听
            this.add_button_listen("pausePanel/jiemiankuang/returnHomeButton", this, this.onReturnHomeButtonClick);
            this.add_button_listen("pausePanel/jiemiankuang/continueButton", this, this.onContinueButtonClick);
        }

        this.skill_2_cdTime = 5//技能1的冷却时间    寒冰导弹
        this.skill_1_cdTime = 6//技能2的冷却时间     普通导弹
        this.hedan_cdTime = 3//核弹冷却时间

        this.shield_cdTime = 20//防护盾的冷却时间

        this.data = UserData.Instance.userData//映射玩家数据

        //获取玩家信息
        this.game_gold = mGameData.currentGold //金币
        this.game_medal = this.data["game_medal"]//勋章
        console.log("玩家金币=====", mGameData.currentGold)
        this.playerName = "player" + (mGameData.currentRole + 1)//玩家飞机名字
        this.defaultEmitter = "player" + (mGameData.currentRole + 1) + "_emitter"//玩家飞机的默认武器
        // 计算基础生命值
        const baseHp = this.data["plane"].hp + this.data["shield"];
        // 加上防护钢板的技能效果（技能ID为3）
        const defenseBonus = mGameData.getSkillEffect(3);
        // 最终生命值
        this.playHp = baseHp + defenseBonus;
        console.log("玩家基础生命值：", baseHp, "防护钢板加成：", defenseBonus, "最终生命值：", this.playHp);
        console.log("玩家生命值", this.playHp);

        this.pet = this.data["pet"]//玩家选择的宠物名字
        this.play_Score = this.data["score"]//分数是累加的
        this.view["top/play_Score"].getComponent(cc.Label).string = "得分：" + this.play_Score;//更新下分数文本
        this.LevelLength = LevelData.length - 1  //总共的关卡数 因为第一关是下标是0 


        if (this.data["Level"] > this.LevelLength) {
            this.data["Level"] = this.LevelLength
            //  console.log("关卡越界了")
            //  UserData.Instance.saveUserData()//防止越界

        }

        this.Level = mGameData.currentLevel  //玩家当前的关

        //导弹数量
        this.skill_1Num = this.data["skill_1"]
        this.skill_2Num = this.data["skill_2"]
        this.hedan_num = this.data["hedan"]




        //先获取到关卡数据
        this.enemyTimeDelayed = LevelData[this.Level].enemyTimeDelayed//敌机间隔时间
        this.boxTimeDelayed = LevelData[this.Level].boxTimeDelayed//补给间隔时间

        this.enemyNum = LevelData[this.Level].enemyNum//刷新敌机的数量
        this.boxNum = LevelData[this.Level].boxNum//掉了宝箱 一般是1

        this.enemyRandomNUm = LevelData[this.Level].enemyRandomNUm//敌机的随机数数组
        this.boxRandomNUm = LevelData[this.Level].boxRandomNUm//补给随机数数组

        this.enenyType = LevelData[this.Level].enemy//敌机类型数组
        this.boxType = LevelData[this.Level].box//补给类型数组

        this.bossType = LevelData[this.Level].boss//boss数据
        this.passScore = LevelData[this.Level].passScore//通关分数条件

        this.map = LevelData[this.Level].maps //地图数据

        this.view["top/Level"].getComponent(cc.Label).string = "第" + this.Level + "关" //更新关卡文本

        this.isPassLevel = false  //是否通过 


        //组件初始化
        //设置父节点
        this.player_root = this.view["player_root"] //设置玩家飞机父节点 
        this.emitter_root = this.view["player_root/emitter_root"] //设置玩家发射器父节点

        this.enemy_root = this.view["enemy_root"]//设置敌机父节点
        this.box_root = this.view["box_root"]//设置补给箱父节点
        this.boss_root = this.view["boss_root"]//boss的父节点
        this.shidld_root = this.view["player_root/shidld_root"]//保护盾父节点
        this.ship_root = this.view["ship_root"]//船只父节点
        this.gold_root = this.view["gold_root"]//奖励物品父节点
        this.pet_root = this.view["pet_root"]//宠物父节点
        this.hedan_root = this.view["hedan_root"]//核弹父节点
        this.boss_warn_node = this.view["boss_warn"]//boss来袭的节点


        this.play_hpR = this.view["top/hp/mask/hpR"]//玩家血条
        this.top = this.view["top"]

        this.bg_1 = this.view["bg1"]
        this.bg_1.getComponent(cc.Sprite).spriteFrame.setTexture(ResMgr.Instance.getAsset("Maps", this.map))
        console.log("bg1的属性：", this.bg_1)

        this.bg_2 = this.view["bg2"]
        this.bg_2.getComponent(cc.Sprite).spriteFrame.setTexture(ResMgr.Instance.getAsset("Maps", this.map))

        this.yun1 = this.view["yun1"]
        this.yun2 = this.view["yun2"]
        this.yun1.y = 0
        this.yun2.y = this.yun1.y + this.yun1.height

        this.resetSize(this.node.getParent())//适配背景图
        this.boss_warn_node.active = false//把警告隐藏了

        this.scheduleOnce(function () {   //显示关卡动画
            this.showLevelName()
        }, 0.65)


        //把云朵位置设置了
        this.bg_1.y = 0
        this.bg_2.y = this.bg_1.y + this.bg_1.height



        //加载玩家飞机
        this.createPlay_plane(this.player_root)
        //加载发射器
        //使用默认子弹
        this.buttleBack()


        //加载宠物
        this.createPet()
        //设置背景音乐和音量
        SoundMgr.Instance.play_default_music(true)
        SoundMgr.Instance.set_music_volume(1)
        SoundMgr.Instance.set_effect_volume(1)

        this.isPassLevel = false//是否过关


        this.scheduleOnce(function () { //等三秒在开干

            this.upEnemy()

            //this.upBox()//不自动掉宝箱 考虑以后boss阶段掉落
        }, 3)



        this.isInvincible(false)//玩家不无敌
        this.playerFullHP(this.hero)//玩家满血

        this.skill_1Label = this.view["bottom/skill_1/skill_num/skillLabel"].getComponent(cc.Label)//两个技能的数量文本
        this.skill_2Label = this.view["bottom/skill_2/skill_num/skillLabel"].getComponent(cc.Label)
        this.hedanLabel = this.view["bottom/hedan/skill_num/skillLabel"].getComponent(cc.Label)//核弹数量文本
        this.gold_label = this.view["top/gold_label"].getComponent(cc.Label)  //金币数量
        this.medal_label = this.view["top/medal_label"].getComponent(cc.Label)//勋章数量

        this.upSkillNum(this.skill_1Label, this.skill_1Num)//技能文本  
        this.upSkillNum(this.skill_2Label, this.skill_2Num)//技能文本
        this.upSkillNum(this.hedanLabel, this.hedan_num)//技能文本


        this.gold_label.string = this.game_gold.toString()//显示金币
        this.medal_label.string = this.game_medal.toString()//显示勋章



        //初始化敌机对象池
        var enemyMap = LevelData[this.Level].enemy //拿当前关卡的飞机
        for (let i = 0; i < enemyMap.length; i++) {
            console.log("敌机对象池：", enemyMap[i]);


            var pool: cc.NodePool = new cc.NodePool()
            if (this.enemy_pools[enemyMap[i]] == null) {
                this.enemy_pools[enemyMap[i]] = pool

            }


        }

        //初始化box对象池
        var BoxMap = LevelData[this.Level].box //拿当前关卡的补给
        for (let i = 0; i < BoxMap.length; i++) {

            var BoxPool: cc.NodePool = new cc.NodePool()
            if (this.box_pools[BoxMap[i]] == null) {
                this.box_pools[BoxMap[i]] = BoxPool

            }


        }


        this.buttleBack()//挂载默认子弹


        this.player_root.setPosition(cc.v2(0, -350))
        this.bgMove = true//移动背景
        this.setTouch()//设置触摸控制


    }
    //加金币
    private addgold(num) {
        mGameData.addGold(num);
        this.game_gold = mGameData.currentGold
        this.gold_label.string = this.game_gold.toString()
    }
    //加勋章
    private addmedal(num) {
        this.game_medal += num
        this.medal_label.string = this.game_medal.toString()
        UserData.Instance.userData["game_medal"] = this.game_medal
        UserData.Instance.saveUserData()
    }

    //屏幕视频 以后可以自己封装下
    resetSize(cav) {
        let frameSize = cc.view.getFrameSize();
        let designSize = cc.view.getDesignResolutionSize();
        console.log(" frameSize :" + frameSize.height + "/" + frameSize.width)
        console.log(" designSize :" + designSize.height + "/" + designSize.width)

        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        this.fitScreen(cav, designSize, this.bg_1);
        this.fitScreen(cav, designSize, this.bg_2);
        // this.fitScreen(cav, designSize,this.view["pingmu"]);
        this.fitScreen(cav, designSize, this.view["bottom"]);
        this.fitScreen(cav, designSize, this.view["top"]);
        this.fitScreen(cav, designSize, this.boss_warn_node);


    }
    /**
     * 背景适配
     * @param canvasnode 
     * @param designSize 
     */
    fitScreen(canvasnode, designSize, bgNode) {
        let scaleW = canvasnode.width / designSize.width;
        let scaleH = canvasnode.height / designSize.height;

        //   bgNode = this.bg_1
        let bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    }
    //开始游戏显示关卡
    private showLevelName() {
        var level_num_node = this.view["level_name"]
        level_num_node.x = -500
        level_num_node.y = 150

        level_num_node.getChildByName("num").getComponent(cc.Label).string = this.Level
        //出现
        var act1 = cc.moveTo(0.2, cc.v2(100, level_num_node.y))
        var act2 = cc.fadeIn(0.2)


        var actShou = cc.spawn(act1, act2)//出现




        var act4 = cc.moveTo(0.2, cc.v2(0, level_num_node.y))

        var act5 = cc.delayTime(1.6)//休眠几秒


        var actBack = cc.sequence(act4, act5)//回来


        //消失
        var act6 = cc.fadeOut(0.2)
        var act7 = cc.moveTo(0.2, cc.v2(500, level_num_node.y))
        var actHide = cc.spawn(act6, act7)





        var actActive = cc.callFunc(function () {//隐藏节点
            //  console.log("我执行了动画））））））））））））））））））））））））））））））））））")
            level_num_node.active = false

        }.bind(this))



        var end = cc.sequence(actShou, actBack, actHide, actActive)
        level_num_node.runAction(end)







    }

    //警告boss来袭的动画
    private boss_warn() {
        SoundMgr.Instance.play_effect("bossComing")
        this.boss_warn_node.active = true
        var bg = this.boss_warn_node.getChildByName("bg")
        var warns = this.boss_warn_node.getChildByName("warn")

        //  warns.opacity=0



        var act_warn = cc.fadeIn(1)
        // var act_warn_ned=cc.sequence(act_warn)


        warns.runAction(act_warn)


        var act_1 = cc.fadeIn(0.2)//淡入
        var act_2 = cc.fadeOut(0.2)//淡出



        var act_3 = cc.callFunc(function () {  //回调函数
            var act_warn2 = cc.fadeOut(0.5)
            var act_warn3 = cc.moveBy(0.5, cc.v2(0, 50))
            var act_4 = cc.callFunc(function () {  //回调函数
                this.boss_warn_node.active = false

            }.bind(this));
            var act_warn_ned2 = cc.spawn(act_warn2, act_warn3)
            var act_warn_ned3 = cc.sequence(act_warn_ned2, act_4)



            warns.runAction(act_warn_ned3)

        }.bind(this));

        var end = cc.sequence(act_1, act_2, act_1, act_2, act_1, act_2, act_1, act_2, act_1, act_2, act_1, act_2, act_1, act_2, act_3)

        bg.runAction(end)



    }
    onDestroy() {

        console.log("页面被销毁了", this.node.name)

    }
    //创建宠物
    private createPet() {

        if (this.pet == null) {
            console.log("玩家没有选择宠物")
            return
        }
        var paly_por: cc.Vec2 = this.player_root.getPosition()
        var pet1: cc.Node = this.instantiateObj("Gui", "pet/" + this.pet, this.pet_root, cc.v2(-paly_por.x, paly_por.y))
        var pet1_ts = pet1.getComponent("pet_AI")
        if (pet1_ts) {

            if (pet1_ts.isTow) {  //如果需要两个宠物就在建立一个


                var pet2: cc.Node = this.instantiateObj("Gui", "pet/" + this.pet, this.pet_root, cc.v2(paly_por.x, paly_por.y))
                var pet2_ts = pet2.getComponent("pet_AI")

                if (pet2_ts) {
                    pet2_ts.isRight = true//第二个坐标往右边靠

                    if (pet2_ts.fire_RorL) {//如果是左右开火那种就把子弹角度翻转下
                        pet2_ts.bullet_angle = true
                        //  pet2_ts.init()
                    }
                }
            }
        }

        //  console.log("宠物的父节点：",this.pet_root.children)



    }

    //销毁宠物所有节点
    private delPet_allNode() {
        var children = this.pet_root.children
        var children_length = children.length
        if (children_length == 0) {
            // console.log("没有宠物")
            return
        }
        for (let i = 0; i < children_length; i++) {
            //  console.log("宠物节点销毁：" + children[i].name)

            children[i].destroyAllChildren()
        }

    }

    //玩家掉血
    private playHpR(event_name, udata) {
        this.play_hpR.scaleY = (udata)

    }


    //创建实例
    private instantiateObj(bundle: string, url: string, node_parent: cc.Node, pos: cc.Vec2): cc.Node {

        var get_node = cc.instantiate(ResMgr.Instance.getAsset(bundle, url));
        get_node.setPosition(pos)
        get_node.parent = node_parent;


        if (get_node == null) {
            return null
        }
        return get_node
    }

    //玩家飞机是否无敌
    private isInvincible(yes?: boolean) {


        //  console.log("我是无敌的")
        var ts = this.hero.getComponent("Collision_Ctrl")
        if (ts) {
            if (yes != null) {
                ts.isInvincible = yes
            } else {
                ts.isInvincible = false

            }
            // ts.isInvincible = !ts.isInvincible
        }

    }

    //获取防护盾
    private get_shield(): void {

        if (this.isGetSkill(this.shidld_root, "play_shield")) {
            //  console.log("保护盾不能嵌套")
            return
        }

        // 计算护盾持续时间，加上能量护盾的技能效果（技能ID为6）
        const baseShieldTime = 8;
        const shieldTimeBonus = mGameData.getSkillEffect(6);
        const totalShieldTime = baseShieldTime + shieldTimeBonus;
        console.log("基础护盾时间：", baseShieldTime, "能量护盾加成：", shieldTimeBonus, "最终护盾时间：", totalShieldTime);
        
        // 计算护盾CD时间，保持初始20秒，每升一级护盾技能CD也多加1秒
        const baseCDTime = 20;
        const cdBonus = mGameData.getSkillEffect(6);
        const totalCDTime = baseCDTime + cdBonus;
        console.log("基础CD时间：", baseCDTime, "CD加成：", cdBonus, "最终CD时间：", totalCDTime);
        
        this.view["bottom/shield"].getComponent("ClockCtrl").startClockAction(totalCDTime)//开启冷却时间，使用计算后的总CD时间

        //this.isInvincible()
        var ts = this.hero.getComponent("Collision_Ctrl")
        if (ts) {
            ts.isInvincible = true//无敌
        }
        this.instantiateObj("Gui", "player/play_shield", this.shidld_root, cc.v2(0, 0))
        SoundMgr.Instance.play_effect("dun")
        
        this.stopSkill(totalShieldTime, "play_shield", this.shidld_root, this.isInvincible.bind(this))//护盾时间后去除防护盾 
    }


    //获取默认子弹
    private buttleBack(): void {
        // if (this.isGetSkill(this.emitter_root, this.defaultEmitter)) {
        //     return
        // }
        console.log("默认子弹")
        this.createEmitter(this.defaultEmitter, this.emitter_root, true, false)//初始化默认子弹
        console.log("我的默认子弹：" + this.defaultEmitter)

    }

    //测试用
    private emitter6() {
        this.createEmitter("emitter6", this.emitter_root, true, false)//技能不看第二个布尔 第一个为false就可以
        this.stopSkill(10, "emitter6", this.emitter_root, this.buttleBack.bind(this))//5秒后停止技能  必须bind this
    }


    //返回按钮回调
    private onBackToLoginScene(): void {
        //   console.log("点击了返回按钮");

        if (this.isBack) {

            return;
        }

        this.isBack = true;

        this.outGame()


    }
    
    // 暂停按钮点击事件
    private onPauseButtonClick(): void {
        this.pauseGame();
    }
    
    // 暂停游戏
    private pauseGame(): void {
        if (!this.isPaused) {
            this.isPaused = true;
            cc.director.pause();
            if (this.pausePanel) {
                this.pausePanel.active = true;
            }
        }
    }
    
    // 继续游戏
    private resumeGame(): void {
        if (this.isPaused) {
            this.isPaused = false;
            cc.director.resume();
            if (this.pausePanel) {
                this.pausePanel.active = false;
            }
        }
    }
    
    // 返回主界面按钮点击事件
    private onReturnHomeButtonClick(): void {
        this.resumeGame();
        // this.onBackToLoginScene();

        //销毁事件 千里之堤毁于蚁穴 别忘了
        this.removeEvent()

        this.play_Score = 0//如果退了把分数清零
        UserData.Instance.userData["score"] = 0
        UserData.Instance.saveUserData()
        //销毁宠物所有节点
        this.delPet_allNode()
        SoundMgr.Instance.stop_music()
        cc.director.loadScene("Start");
    }
    
    // 继续游戏按钮点击事件
    private onContinueButtonClick(): void {
        this.resumeGame();
    }
    //销毁事件
    private removeEvent() {
        EventMgr.Instance.remove_event_listenner("gemeOver", this, this.gameOver)//游戏结束 //playerGetShot
        EventMgr.Instance.remove_event_listenner("GetSupply", this, this.GetSupply)//玩家吃到补给
        EventMgr.Instance.remove_event_listenner("getScore", this, this.getScore)//玩家加分
        EventMgr.Instance.remove_event_listenner("destroyEmemy", this, this.destroyEmemy)//销毁敌机
        EventMgr.Instance.remove_event_listenner("revive", this, this.revive)//复活
        EventMgr.Instance.remove_event_listenner("nextLevel", this, this.nextLevel)//下一关
        EventMgr.Instance.remove_event_listenner("destroyBoss", this, this.destroyBoss)//boss被击败
        EventMgr.Instance.remove_event_listenner("playHpR", this, this.playHpR)//玩家被击中掉血
        EventMgr.Instance.remove_event_listenner("destroyBox", this, this.destroyBox)//销毁补给
        EventMgr.Instance.remove_event_listenner("createEnemyGold", this, this.createEnemyGold)//敌机掉了的补给
        EventMgr.Instance.remove_event_listenner("replay", this, this.replay)//重新开始本关
        EventMgr.Instance.remove_event_listenner("qianghua", this, this.qianghua)//去强化战机页面
        EventMgr.Instance.remove_event_listenner("stopUpPlane", this, this.stopUpPlane)//是否停止刷敌机

        this.node.off('touchmove', this.onTouch, this);//触摸事件也销毁下

    }

    //退出游戏
    private outGame() {
        if (window.tt) {
            TtMgr.Instance.stopRecorder()//抖音停止录屏

        }
        //销毁事件 千里之堤毁于蚁穴 别忘了
        this.removeEvent()

        this.play_Score = 0//如果退了把分数清零
        UserData.Instance.userData["score"] = 0
        UserData.Instance.saveUserData()
        //销毁宠物所有节点
        this.delPet_allNode()
        SoundMgr.Instance.stop_music()

        GameApp.Instance.enterLoginScene();



    }
    //点击强化的事件接收 胜利页面的强化战机按钮
    private qianghua(event_name, udata) {

        if (udata) {
            this.play_Score = 0//如果退了把分数清零
            UserData.Instance.userData["score"] = 0
            UserData.Instance.saveUserData()
        }
        console.log("我退到强化战机页面", event_name)
        this.removeEvent()



        SoundMgr.Instance.stop_music()


        GameApp.Instance.equippedPage();
    }


    // 游戏结束 事件接收  玩家组件里调用此事件
    private gameOver(event_name, udata) {

        SoundMgr.Instance.stop_music()
        this.hero.destroy()//干掉玩家飞机
        var itemRoot = this.emitter_root.children//消灭武器
        for (let i = 0; i < itemRoot.length; i++) {
            itemRoot[i].destroy()
        }

        UserData.Instance.userData["score"] = this.play_Score//先把本局分数传过去
        var mLevel: number = this.data["Level"]//获取游戏关卡进度


        if (this.Level > mLevel) {
            UserData.Instance.userData["Level"] = this.Level

        }
        UserData.Instance.saveUserData()//保存游戏分数
        if (window.tt) {
            TtMgr.Instance.stopRecorder()//游戏结束后停止录屏
        }
        GameApp.Instance.gameOver()//打开游戏结束页面




    }

    //胜利页面
    private victoryShowUI() {


        //记录当前实际通过的关卡（在更新之前）
        const passedLevel = this.Level;
        
        if (this.Level >= this.LevelLength) {
            console.log("恭喜你打翻版了")

        } else {
            if (this.Level >= UserData.Instance.userData["Level"]) {
                //如果玩家打过去了 更新最高关卡
                this.Level++
                UserData.Instance.userData["Level"] = this.Level
                mGameData.currentLevel = this.Level//显示保存当前关卡 为了ui显示 蛋疼
                mGameData.unlockedLevel = this.Level//更新已解锁关卡
                UserData.Instance.saveUserData()
            } else {
                this.Level++

                mGameData.currentLevel = this.Level////显示保存当前关卡 为了ui显示 蛋疼
                // 回刷已通关关卡时，也要保证解锁进度不回退
                mGameData.unlockedLevel = Math.max(mGameData.unlockedLevel, this.Level)
                UserData.Instance.saveUserData()



            }

        }

        UserData.Instance.userData["score"] = this.play_Score
        UserData.Instance.saveUserData()
        mGameData.SaveLevelData()//保存关卡数据到本地存储

        // 计算通关星级
        const stars = this.calculateStars();
        console.log('通关星级:', stars);
        
        // 保存关卡星级（使用实际通过的关卡号）
        mGameData.saveLevelStarsByLevel(passedLevel, stars);

        // 上报关卡数据（使用当前实际通过的关卡数，即未增加前的Level）
        this.reportLevelPass(this.Level - 1, stars)

        SoundMgr.Instance.stop_music()


        if (window.tt) {
            TtMgr.Instance.stopRecorder()
        }


        GameApp.Instance.victory(stars)

    }


    // 上报关卡通过数据
    private async reportLevelPass(level: number, stars: number = 1) {
        const savedUsername = cc.sys.localStorage.getItem("SLS_USERNAME");
        if (savedUsername) {
            try {
                const result = await this.postPass(APP_ID, savedUsername, level, stars);
                console.log("上报关卡:", result, level, stars);
                // 这里可以处理服务端返回的关卡数据，但不直接覆盖本地解锁状态，而是取最大值
                if (result && result.unlockedLevel) {
                    // 只在服务器返回的解锁关卡数大于本地时才更新，避免覆盖本地进度
                    if (result.unlockedLevel > mGameData.unlockedLevel) {
                        mGameData.unlockedLevel = result.unlockedLevel;
                        mGameData.SaveLevelData();//保存更新后的关卡数据
                    }
                }
            } catch (error) {
                console.error("上报关卡失败:", error);
            }
        } else {
            console.error("未找到用户名，无法上报关卡");
        }
    }

    // 通关上报
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

    //重新开始
    private replay(event_name, udata) {




        this.play_Score = 0//如果退了把分数清零
        UserData.Instance.userData["score"] = 0
        UserData.Instance.saveUserData()



        this.removeEvent()
        UIMgr.Instance.clearAll()

        GameApp.Instance.enterGameScene();





        //销毁宠物所有节点
        this.delPet_allNode()


    }


    //计算通关星级
    private calculateStars(): number {
        // 获取当前玩家血量比例
        const hero = this.hero; // 使用成员变量 this.hero，而不是 getChildByName
        if (!hero) {
            console.log('calculateStars: 未找到hero节点（this.hero为空），返回1星');
            return 1; // 默认1星
        }
        
        const collisionCtrl = hero.getComponent("Collision_Ctrl");
        if (!collisionCtrl) {
            console.log('calculateStars: 未找到Collision_Ctrl组件，返回1星');
            return 1;
        }
        
        // 确保start_hp不为0，避免除零错误
        const maxHp = collisionCtrl.start_hp || collisionCtrl.play_ph || 1;
        const currentHp = collisionCtrl.play_ph || 1;
        const hpRatio = currentHp / maxHp;
        
        console.log('calculateStars - 当前血量:', currentHp, '最大血量:', maxHp, '血量比例:', hpRatio);
        
        // 血量高于80%三星，50%-80%之间2星，通关1星
        if (hpRatio > 0.8) {
            return 3;
        } else if (hpRatio >= 0.5) {
            return 2;
        } else {
            return 1;
        }
    }

    //下一关 事件回调  胜利页面调用
    private nextLevel(event_name, udata) {
        console.log("下一关")

        if (!mGameData.HasEnoughStamina()) {
            TipsManager.show('体力不足，无法进入下一关。');
            return;
        }

        if (mGameData.ConsumeStamina()) {
            UserDataSyncManager.recordConsumedStamina();
        }
        this.play_Score = 0//进入下一关把分数清零
        UserData.Instance.userData["score"] = 0
        UserData.Instance.saveUserData()
        this.removeEvent()
        UIMgr.Instance.clearAll()

        GameApp.Instance.enterGameScene();
        //销毁宠物所有节点
        this.delPet_allNode()

    }
    //复活

    private revive(event_name, udata) {

        if (this.isPassLevel) {//如果通过了飞过去
            this.movePlane()
            //如果boss死了

        } else {
            //字节跳动有录屏的问题 自己看着解决 按需求来
            if (window.tt) {
                TtMgr.Instance.startRecorder()
            }
        }


        //   console.log("我复活了")
        SoundMgr.Instance.play_default_music(true)

        //加载玩家飞机
        this.createPlay_plane(this.player_root)
        this.get_shield()//套盾
        this.playerFullHP(this.hero)//满血复活
        this.buttleBack()//复活后使用默认子弹
    }


    //玩家加分回调函数
    private getScore(event_name, udata) {
        //  console.log("boss的分：", udata)

        this.play_Score += udata//总得分
        this.LevelScore += udata//本关的得分
        this.view["top/play_Score"].getComponent(cc.Label).string = "得分：" + this.play_Score;//获取节点


    }
    //刷新技能文本
    private upSkillNum(_lable: cc.Label, num: number) {
        _lable.string = num.toString()
    }
    //改变技能个数
    private subSkill(skillTag: number, isadd: boolean) {
        if (skillTag == 1) {
            if (isadd) {
                this.skill_1Num++
            } else {
                this.skill_1Num--

            }
            this.upSkillNum(this.skill_1Label, this.skill_1Num)
            UserData.Instance.userData["skill_1"] = this.skill_1Num
            UserData.Instance.saveUserData()
        } else if (skillTag == 2) {
            if (isadd) {
                this.skill_2Num++
            } else {
                this.skill_2Num--

            }
            this.upSkillNum(this.skill_2Label, this.skill_2Num)
            UserData.Instance.userData["skill_2"] = this.skill_2Num
            UserData.Instance.saveUserData()
        } else if (skillTag == 3) {
            if (isadd) {
                this.hedan_num++
            } else {
                this.hedan_num--

            }
            this.upSkillNum(this.hedanLabel, this.hedan_num)
            UserData.Instance.userData["hedan"] = this.hedan_num
            UserData.Instance.saveUserData()
            console.log("核弹使用后的记录：" + UserData.Instance.userData["hedan"])



        }

    }
    //技能1
    private skill_1(): void {
        //实验技能1  、、普通导弹
        if (this.skill_1Num <= 0) {
            return
        }

        if (this.isGetSkill(this.emitter_root, "emitter5")) {

            return
        }

        //技能次数减1
        SoundMgr.Instance.play_effect("daodan1")
        this.view["bottom/skill_1"].getComponent("ClockCtrl").startClockAction(this.skill_1_cdTime)//开启冷却时间

        // 计算普通导弹的持续时间，加上普通导弹技能的强化效果（技能ID为1）
        const baseDuration = this.skill_1_cdTime;
        const durationBonus = mGameData.getSkillEffect(1) * 0.5; // 每级增加0.5秒持续时间
        const totalDuration = baseDuration + durationBonus;
        console.log("基础普通导弹持续时间：", baseDuration, "普通导弹加成：", durationBonus, "最终持续时间：", totalDuration);

        this.createEmitter("emitter5", this.emitter_root, false, false)//技能不看第二个布尔 第一个为false就可以
        this.stopSkill(totalDuration, "emitter5", this.emitter_root)//持续时间后停止技能

        this.subSkill(1, false)



    }
    //技能2
    private skill_2(): void {
        if (this.skill_2Num <= 0) {
            return
        }
        //实验技能1  、、跟踪导弹
        if (this.isGetSkill(this.emitter_root, "emitter4")) {

            return
        }

        SoundMgr.Instance.play_effect("daodan1")

        //技能次数减1

        this.view["bottom/skill_2"].getComponent("ClockCtrl").startClockAction(this.skill_2_cdTime)//开启冷却时间

        // 计算寒冰导弹的持续时间，加上寒冰导弹技能的强化效果（技能ID为2）
        const baseDuration = this.skill_2_cdTime;
        const durationBonus = mGameData.getSkillEffect(2) * 0.5; // 每级增加0.5秒持续时间
        const totalDuration = baseDuration + durationBonus;
        console.log("基础寒冰导弹持续时间：", baseDuration, "寒冰导弹加成：", durationBonus, "最终持续时间：", totalDuration);

        // 这里的 this 指向 component

        this.createEmitter("emitter4", this.emitter_root, false, false)//技能不看第二个布尔 第一个为false就可以
        this.stopSkill(totalDuration, "emitter4", this.emitter_root)//持续时间后停止技能

        this.subSkill(2, false)


    }
    //核弹只爆炸不修改用户数据的方法 吃到补给后直接执行
    private hedan2() {
        if (this.hedan_root.children.length > 0) {
            return
        }
        this.view["bottom/hedan"].getComponent("ClockCtrl").startClockAction(this.hedan_cdTime)//开启冷却时间//
        //核弹爆炸
        this.hedan_bomb()
        // 计算核弹伤害，加上核弹技能的强化效果（技能ID为5）
        const baseEnemyDamage = 150;
        const baseBossDamage = 300;
        const nukeBonus = mGameData.getSkillEffect(5);
        const enemyDamage = baseEnemyDamage + nukeBonus;
        const bossDamage = baseBossDamage + nukeBonus * 2; // boss伤害加成更高
        console.log("基础敌机伤害：", baseEnemyDamage, "基础boss伤害：", baseBossDamage, "核弹加成：", nukeBonus, "最终敌机伤害：", enemyDamage, "最终boss伤害：", bossDamage);

        var children_length = this.enemy_root.children.length
        for (let i = 0; i < children_length; i++) {
            var ts = this.enemy_root.children[i].getComponent("enemy1_Ctrl")
            if (ts) {
                ts.hit(enemyDamage)
            }
        }


        var children_length2 = this.ship_root.children.length
        for (let i = 0; i < children_length2; i++) {
            var ts1 = this.ship_root.children[i].getComponent("enemy1_Ctrl")
            if (ts1) {
                ts1.hit(enemyDamage)
            }

        }

        var children_length3 = this.boss_root.children.length
        for (let i = 0; i < children_length3; i++) {
            var ts2 = this.boss_root.children[i].getComponent("boss1_Ctrl")
            if (ts2) {
                console.log("核弹炸到boss")
                ts2.hit(bossDamage)
            }

        }
    }
    //核弹技能
    private hedan(): void {
        if (this.hedan_num <= 0) {
            return
        }
        if (this.hedan_root.children.length > 0) {
            return
        }
        this.view["bottom/hedan"].getComponent("ClockCtrl").startClockAction(this.hedan_cdTime)//开启冷却时间
        //核弹爆炸
        this.hedan_bomb()
        // 计算核弹伤害，加上核弹技能的强化效果（技能ID为5）
        const baseEnemyDamage = 150;
        const baseBossDamage = 300;
        const nukeBonus = mGameData.getSkillEffect(5);
        const enemyDamage = baseEnemyDamage + nukeBonus;
        const bossDamage = baseBossDamage + nukeBonus * 2; // boss伤害加成更高
        console.log("基础敌机伤害：", baseEnemyDamage, "基础boss伤害：", baseBossDamage, "核弹加成：", nukeBonus, "最终敌机伤害：", enemyDamage, "最终boss伤害：", bossDamage);

        var children_length = this.enemy_root.children.length
        for (let i = 0; i < children_length; i++) {
            var ts = this.enemy_root.children[i].getComponent("enemy1_Ctrl")
            if (ts) {
                ts.hit(enemyDamage)
            }
        }


        var children_length2 = this.ship_root.children.length
        for (let i = 0; i < children_length2; i++) {
            var ts1 = this.ship_root.children[i].getComponent("enemy1_Ctrl")
            if (ts1) {
                ts1.hit(enemyDamage)
            }

        }

        var children_length3 = this.boss_root.children.length
        for (let i = 0; i < children_length3; i++) {
            var ts2 = this.boss_root.children[i].getComponent("boss1_Ctrl")
            if (ts2) {
                console.log("核弹炸到boss")
                ts2.hit(bossDamage)
            }

        }

        this.subSkill(3, false)
    }
    //核弹爆炸的方法
    private hedan_bomb() {



        // LQBulletSystem.clear(true)//清除所有子弹
        this.instantiateObj("Gui", "other/hedanBomb", this.hedan_root, cc.v2(0, 0))

        var children = this.node.getChildByName("buttle_root").children
        var length = children.length
        for (let i = 0; i < length; i++) {
            if (children[i].group == "enemy_bullet") {
               
                children[i].destroy()
                //   var ts=  children[i].getComponent("lq_bullet")
                //   if(ts){
                //       ts.
                //   }
            }

        }

        SoundMgr.Instance.play_effect("hedan")





















    }


    //停止所有技能
    private stopAllSkill(node_parent: cc.Node) {

        var itemRoot = node_parent.children
        for (let i = 0; i < itemRoot.length; i++) {

            itemRoot[i].destroy()



        }



    }

    //停止技能
    private stopSkill(time: number, name: string, node_parent: cc.Node, fun?: Function) {

        this.scheduleOnce(function () {
            // console.log("到十秒了")

            // 遍历所有组件
            var itemRoot = node_parent.children
            for (let i = 0; i < itemRoot.length; i++) {
                if (itemRoot[i].name == name) {
                    console.log("我被销毁了+" + name)

                    itemRoot[i].destroy()

                }

            }
            if (fun) {
                fun = fun();
            }


        }, time);
    }


    //判断有没有当前技能
    private isGetSkill(node_parent: cc.Node, name: string): boolean {

        // 遍历所有组件
        var itemRoot = node_parent.children
        for (let i = 0; i < itemRoot.length; i++) {
            if (itemRoot[i].name == name) {
                console.log("组件重复替换：" + i, itemRoot[i])
                return true
            }

        }


        return false
    }


    //设置云朵的移动
    setYun() {
        this.yun1.y -= 3
        this.yun2.y -= 3

        if (this.yun1.y <= -this.yun1.height) {
            this.yun1.y = this.yun2.y + this.yun1.height
        }
        if (this.yun2.y <= -this.yun1.height) {
            this.yun2.y = this.yun1.y + this.yun1.height
        }
    }

    //移动背景
    setBg() {
        this.bg_1.y = this.bg_1.y - 2
        this.bg_2.y = this.bg_2.y - 2
        if (this.bg_1.y <= -this.bg_1.height) {
            this.bg_1.y = this.bg_2.y + this.bg_1.height
        }
        if (this.bg_2.y <= -this.bg_1.height) {
            this.bg_2.y = this.bg_1.y + this.bg_1.height
        }
    }


    //回收敌机
    private destroyEmemy(event_name, udata) {
        var enemy: cc.Node = udata
        var pool: cc.NodePool = null
        pool = this.enemy_pools[udata.name]




        pool.put(enemy)
    }
    //回收补给
    private destroyBox(event_name, udata) {
        //  console.log("补给被获取")
        var box: cc.Node = udata
        var pool = null
        pool = this.box_pools[udata.name]


        pool.put(box)
    }

    //玩家获取补给回调
    private GetSupply(event_name, udata) {
        //  console.log("补给的名字", udata.name)
        //   console.log("玩家获取补给回调" + event_name, "补给箱的tag：" + udata)
        //子弹处理逻辑

        switch (udata.name) {
            case "box1":

                this.createEmitter("emitter2", this.emitter_root, false, false)//添加副炮
                SoundMgr.Instance.play_effect("emitter2")

                this.stopSkill(6, "emitter2", this.emitter_root)
                break
            case "box2":
                this.createEmitter("emitter3", this.emitter_root, false, false)//添加副炮
                SoundMgr.Instance.play_effect("cuantianhou")

                this.stopSkill(8, "emitter3", this.emitter_root)
                break
            case "box3":
                this.createEmitter("emitter6", this.emitter_root, false, false)//添加副炮 第一个为false就可以
                SoundMgr.Instance.play_effect("gun_fire")

                this.stopSkill(4, "emitter6", this.emitter_root)//5秒后停止技能  必须bind this
                break

            case "skill_1award":
                //技能1的奖励
                SoundMgr.Instance.play_effect("pop")
                //  console.log("我获得了技能1：" + udata)
                this.subSkill(1, true)
                break
            case "skill_2award":
                SoundMgr.Instance.play_effect("pop")
                //   console.log("我获得了技能2：" + udata)
                this.subSkill(2, true)

                //技能2的奖励
                break
            case "game_gold":
                SoundMgr.Instance.play_effect("pop")
                this.addgold(6)  //先给5个
                //   console.log("我获得了金币：" + udata)

                break



            case "game_medal":
                this.addmedal(3)  //先给5个
                SoundMgr.Instance.play_effect("pop")
                //   console.log("我获得了勋章：" + udata)

                break

            case "hedan_award":
                //核弹
                this.hedan2()//直接爆炸
                //    this.subSkill(3,true)//加技能里

                break

            case "box4":
                //治疗
                SoundMgr.Instance.play_effect("addHP")
                this.zhiliao(0.35)//加百分之35
                break

            default:
                break

        }

    }


    //吃到治疗宝箱治疗
    private zhiliao(num: number) {
        var ts = this.hero.getComponent("Collision_Ctrl")
        if (ts) {
            ts.box_treatment(num)
        }

    }
    //通关后移动飞机
    private movePlane() {
        this.scheduleOnce(function () {   //只执行一次回调
            var act1 = cc.moveTo(0.5, cc.v2(0, -350))
            var act2 = cc.moveTo(1, cc.v2(0, 1000))
            var act3 = cc.callFunc(function () {  //回调函数
                this.victoryShowUI()
            }.bind(this));
            var end = cc.sequence(act1, act2, act3)
            this.player_root.runAction(end)
        }, 1)
    }
    //回收Boss
    private destroyBoss(event_name, udata) {

        udata.destroy()



        if (this.boss_root.children.length <= 1) {

            this.isPassLevel = true


            this.stopAllSkill(this.emitter_root)//去掉所有技能
            this.stopAllSkill(this.shidld_root)//去掉护盾
            this.isInvincible(true)



            this.movePlane()

            //移动到目标位置

        }
    }

    //给玩家挂发射器 也就是技能，挂载技能是 false false（第二个无效） 换主要武器 true false
    private createEmitter(rul: string, view_parent: cc.Node, isDestroy: boolean, isDelAll?: boolean) {
        var res_emitter = ResMgr.Instance.getAsset("Gui", "emitter/" + rul);





        if (res_emitter) {

            switch (isDestroy) {
                case true:
                    //删除所有 可用于还原初始化
                    if (isDelAll) {
                        view_parent.destroyAllChildren();
                        //   console.log("删除所有成功")

                    } else {
                        // 遍历所有组件 如果有这个类型了就返回
                        if (this.isGetSkill(this.emitter_root, res_emitter.name)) {
                            return
                        }

                        if (this.emitter != null) {
                            this.emitter.destroy();
                            //    console.log("删除一个成功")
                        }


                    }


                    this.emitter = cc.instantiate(res_emitter);
                    this.emitter.parent = view_parent
                    // this.emitter.setPosition(cc.v2(0, this.emitter_pos + this.emitter.height / 2))
                    // this.emitter.setPosition(cc.v2(0, this.emitter_pos + this.emitter.height / 2))

                    //     console.log("替代发射器创建成功")

                    break
                case false:

                    // 遍历所有组件 如果有这个类型了就返回
                    if (this.isGetSkill(this.emitter_root, res_emitter.name)) {
                        return
                    }


                    //挂载一个新的不替代以前的
                    var newEmitter = cc.instantiate(res_emitter);

                    newEmitter.parent = view_parent
                    newEmitter.setPosition(cc.v2(0, 0))//可以传入坐标
                    //  console.log("添加发射器创建成功")
                    break

                default:
                    break

            }


        }

    }

    //玩家飞机满血
    private playerFullHP(hero: cc.Node) {
        var ts = this.hero.getComponent("Collision_Ctrl")
        if (ts) {
            ts.play_ph = this.playHp
            ts.start_hp = this.playHp; // 同时设置最大血量
            console.log("玩家的血量" + ts.play_ph, "最大血量:" + ts.start_hp);

            //更新ui
        }
        this.play_hpR.scaleX = 1
    }

    //代码加载玩家飞机预制体 实例化
    private createPlay_plane(view_parent: cc.Node) {

        var url = this.playerName
        //  console.log("playerName:" + url)
        var player = ResMgr.Instance.getAsset("Gui", "player/" + url);
        if (player) {
            this.hero = cc.instantiate(player);

            // this.node.addChild(this.hero)
            this.hero.parent = view_parent
            this.hero.setPosition(cc.v2(0, 0))
            this.hero.addComponent("Collision_Ctrl")//挂载碰撞组件
            this.emitter_pos = this.hero.height / 2 //给一个发射器距离高度 默认是0 

            var ts = this.hero.getComponent("Collision_Ctrl")
            if (ts) {
                ts.play_ph = this.playHp
            }
        }
    }

    //刷自动掉的宝箱 暂时不调用
    private upBox() {
        this.schedule(function () {

            if (this.isBoss) {


                //如果希望打boss时候也掉宝箱 可以不return
                return

            } else {


                var num_random = Math.floor(Math.random() * this.boxNum) + 1//生成几个敌机的随机数 1-5

                for (let i = 0; i < num_random; i++) {
                    //   [60,90,100]//敌机随机数


                    for (let i = 0; i < this.boxRandomNUm.length; i++) {

                        var num = Math.random() * 100
                        if (num < this.boxRandomNUm[i]) {
                            if (this.boxType[i] != null) {
                                this.createEnemy_box(this.box_root, this.boxType[i])

                                break//跳出循环体
                            } else {
                                continue//没有就下一个循环  如果拿不出敌机了也不会崩溃
                            }
                        }
                    }


                }
            }






        }, this.boxTimeDelayed)



    }

    //代码创建补给
    private createEnemy_box(view_parent: cc.Node, node_name: string) {


        var box: cc.Node = null
        var get_node: cc.Node = null
        var box_pool: cc.NodePool = null
        var pos_box: cc.Vec2 = cc.v2(0, 0)

        get_node = ResMgr.Instance.getAsset("Gui", "box/" + node_name);




        box_pool = this.box_pools[node_name]



        if (get_node) {


            if (box_pool.size() > 0) {
                //  console.log("从池子里拿出来一个了" + enemy_pool.size())
                box = box_pool.get()
            } else {
                //  console.log("实例化飞机" + enemy_pool.size())

                box = cc.instantiate(get_node)
                box.parent = view_parent

                pos_box.x = -200 + Math.random() * 420
                pos_box.y = 600 + Math.random() * 200
                box.setPosition(pos_box)
            }



        }


    }

    //代码创建敌机掉了的奖励
    private createEnemyGold(event_name, udata) {



        var nodeName: string = null
        var num = Math.random() * 100
        // console.log("物品：" + num)
        for (let i = 0; i < this.boxRandomNUm.length; i++) {

            //   var num = Math.random() * 100
            if (num < this.boxRandomNUm[i]) {
                if (this.boxType[i] != null) {


                    nodeName = this.boxType[i]

                    //     console.log("获得宝箱名字：" + nodeName + "随机数：" + num + "随机数组：" + this.boxRandomNUm[i])



                    break
                } else {
                    continue
                }
            }



        }

        var box: cc.Node = null

        var get_node: cc.Node = ResMgr.Instance.getAsset("Gui", "box/" + nodeName);


        var box_pool = this.box_pools[nodeName]


        if (get_node) {


            if (box_pool.size() > 0) {
                box = box_pool.get()
                box.setPosition(udata)
                box.parent = this.box_root
            } else {

                box = cc.instantiate(get_node)
                box.setPosition(udata)
                box.parent = this.box_root

            }



        }







    }

    //代码创建敌机
    private createEnemy_plane(view_parent: cc.Node, node_name: string) {


        var enemy: cc.Node = null
        var get_node: cc.Node = null
        var enemy_pool: cc.NodePool = null
        get_node = ResMgr.Instance.getAsset("Gui", "enemy/" + node_name);


        enemy_pool = this.enemy_pools[node_name]



        if (get_node) {


            if (enemy_pool.size() > 0) {

                enemy = enemy_pool.get()


            } else {

                enemy = cc.instantiate(get_node)
                const ts = enemy.getComponent("enemy1_Ctrl")
                if (ts) {
                    if (ts.isShip) {
                        //如果是船
                        enemy.parent = this.ship_root
                    } else {
                        //如果是飞机
                        enemy.parent = this.enemy_root
                    }

                }

                this.setPlaneFeatures(enemy)



            }
        }


    }
    //设置是否刷敌机 事件发布回调
    private stopUpPlane(event_name: string, isStopUp: boolean) {
        if (isStopUp) {
            //停止刷敌机  
            this.isStopUpPlane = true

        } else {
            //开始刷敌机
            this.isStopUpPlane = false
        }

    }

    //敌机的一些判断操作
    private setPlaneFeatures(enemy: cc.Node) {
        const ts = enemy.getComponent("enemy1_Ctrl")
        if (ts) {
            const node_name = enemy.name
            var my_amount: number = 1
            //如果是唯一 禁止刷敌机
            if (ts.isOnlyONe) {
                my_amount = 1
                EventMgr.Instance.dispatch_event("stopUpPlane", true)
                return
            } else {
                my_amount = ts.amount
                my_amount += Math.floor(this.Level / 5)  //5关加一
            }

            //如果多了就删除
            if (ts.isShip) {
                if (this.allowed_band(this.ship_root, node_name, my_amount + 1)) {//算上刚创建的所以+1
                    ts.destroy_node()
                    return
                }
            }
            else {
                if (this.allowed_band(this.enemy_root, node_name, my_amount + 1)) {//算上刚创建的所以+1
                    ts.destroy_node()
                    return

                }
            }


        }
    }
    //判断某个元素数量是不是允许范围
    private allowed_band(parent: cc.Node, node_name: string, amount: number): boolean {
        var num: number = 0
        const child = parent.children
        for (let i = 0; i < child.length; i++) {
            if (child[i].name == node_name) {
                num++
            }
        }
        if (num >= amount) {
            return true
        } else {
            return false
        }

    }

    // /** 把 node1移动到 node2的位置 */
    // private moveN1toN2(node1: any, node2: any) {
    //     node1.position = node1.parent.convertToNodeSpaceAR(node2.parent.convertToWorldSpaceAR(node2.position))
    // }
    // /** 获取把 node1移动到 node2位置后的坐标 */
    // private convertNodeSpaceAR(node1: any, node2: any) {
    //     return node1.parent.convertToNodeSpaceAR(node2.parent.convertToWorldSpaceAR(node2.position))
    // }



    private setTouch(): void {



        this.node.on('touchmove', this.onTouch, this)

    }

    private onTouch(e: any) {
        if (!this.isPassLevel) {

            let delta: cc.Vec2 = e.getDelta();
            var pos_end = this.player_root.getPosition().add(delta)

            if (pos_end.x < -290) {
                pos_end.x = -290
            } else if (pos_end.x > 290) {
                pos_end.x = 290
            }
            if (pos_end.y < -530) {
                pos_end.y = -530
            } else if (pos_end.y > 530) {
                pos_end.y = 530
            }


            this.player_root.setPosition(pos_end)
        }
    }

    //刷敌机
    private upEnemy() {

        this.schedule(function () {
            if (this.isBoss) {
                //  console.log("boss来了")

                return
            } else if (!this.isStopUpPlane) {// 可以刷敌机



                var num_random = Math.floor(Math.random() * this.enemyNum) + 1//生成几个敌机的随机数 1-5

                for (let i = 0; i < num_random; i++) {

                    for (let i = 0; i < this.enemyRandomNUm.length; i++) {
                        var num = Math.random() * 100//每次换一个


                        if (num < this.enemyRandomNUm[i]) {


                            if (this.enenyType[i] != null) {
                                this.createEnemy_plane(this.enemy_root, this.enenyType[i])
                                //   console.log("输出的敌机：：" + this.enenyType[i])

                                break//跳出循环体  不跳出就接着刷 ==随机数组个数
                            } else {
                                continue
                            }
                        } else {
                            continue
                        }


                    }




                }
            }






        }, this.enemyTimeDelayed)


    }
    //创建boss
    private boss() {

        this.scheduleOnce(function () {
            for (let i = 0; i < this.bossType.length; i++) {

                if (this.bossType[i] != null) {
                    this.instantiateObj("Gui", "boss/" + this.bossType[i], this.boss_root, cc.v2(0, 600))
                    break//跳出循环体
                } else {
                    continue//没有就下一个循环  如果拿不出敌机了也不会崩溃
                }

            }
        }, 3)







    }

    update(dt) {


        this.setYun()
        if (this.bgMove) {
            this.setBg()

        }

        // 出现boss的逻辑判断
        if (this.isBoss == false) {
            if (this.LevelScore >= this.passScore) {



                this.LevelScore = 0
                this.passScore = 0
                this.isBoss = true
                this.isBossUp = true



            }
        } else {
            if (this.enemy_root.children.length <= 0 && this.ship_root.children.length <= 0) {
                if (this.isBossUp) {
                    this.isBossUp = false
                    this.boss_warn()
                    this.boss()

                }


            }

        }




    }



}
