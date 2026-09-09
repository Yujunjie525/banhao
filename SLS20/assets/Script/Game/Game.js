const Global = require('Global');
var Config = require("Config");
var rewardTip = require("rewardTip");
const SIZE = { w: 35, h: 60 };
cc.Class({
    extends: cc.Component,

    properties: {
        uiRoot: cc.Node,
        // 主角
        player: cc.Node,
        // playerBone: dragonBones.ArmatureDisplay,
        playerAnimation: cc.Animation, // 新增 Animation 组件引用

        // 企鹅头顶问号
        balloon: cc.Node,
        // 地图容器
        map: cc.Node,

        // 米数
        meterLbl: cc.Label,

        // 钻石ui
        gemBox: {
            default: null,
            type: cc.Node,
        },
        // 钻石预制
        gem: cc.Prefab,

        //左右控制按钮
        leftBtn:cc.Node,

        rightBtn: cc.Node,

        // 背景容器
        background: cc.Node,

        // 云
        cloudPre: cc.Prefab,
        // 状态按钮
        stateBtn: cc.Node,

        // 复活窗口资源
        reviveUIPre: cc.Prefab,

        // 结算窗口资源
        overUIPre: cc.Prefab,

        // 暂停窗口
        pauseUIPre: cc.Prefab,

        // 里程碑
        flagNode: cc.Node,

        tipReWard:rewardTip,

        Atlas:cc.SpriteAtlas,

        screenSpA:cc.Sprite,

        nativeAdNode:cc.Node,
    },

    SetScreenSps:function(){
        if(cc.Mgr.PlatformController.IsScreenRecord == false)
        {
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_off");
        }
        else
        {
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_on");
        }
    },

    ScreenRecord:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.PlatformController.IsScreenRecord == false)
        {
            cc.Mgr.PlatformController.StartRecordScreen();
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_on");
        }
        else
        {
            cc.Mgr.PlatformController.StopRecordScreen();
            this.screenSpA.spriteFrame = this.Atlas.getSpriteFrame("lu_off");
        }
    },

    pauseBtn:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        var box = cc.instantiate(this.pauseUIPre);
        box.parent = this.uiRoot;
        box.setPosition(cc.v2(0,0));
        cc.director.pause();
    },

    // 死亡飞跃
    dieFly:function() {
        this.reviveBox.destroy();
        this.reviveGame(false);
        this.boneStand();
        this.flyMove(true);
        // 设置一个参数让 摄像机跟着主角
        this.DieFly = true;
    },

    // 飞跃
    flyMove:function(type = false) {
        // 随机米数
        var num = parseInt(10 * Math.random()) + 15 + this.moreFly;
        Global.gameInfo.score += num;

        this.flagMove('+'+num+'米');

        // 预先生成飞跃米数
        this.mapjs.createSingle(num);

        this.playerFly = true;
        let floors = this.map.children;

        // 成功找到最终落脚点
        let finded = () => {
            cc.Mgr.AudioMgr.playSFX("flyaway");
            // 设置为不会掉落的地板
            let floor = this.getFloor(0, 0);
            floor.getChildByName('prop').getComponent(cc.Sprite).spriteFrame = null;

            // 执行飞行动画
            this.boneFly();
            let action = cc.moveTo(1.4, this.playerSize.x, this.playerSize.y);
            action.easing(cc.easeOut(1.0));

            this.player.runAction(cc.sequence(action, cc.callFunc(() => {
                if (!this.isForce && !this.isReverse) {
                    console.log('道具技能状态切换');
                    this.boneSwitch();
                }
                // 判断游戏是否结束清除地板
                this.mapjs.fallDownFloor();
                // 更新分数
                this.meterLbl.string = Global.gameInfo.score;
                // 设置为站立状态
                this.boneStand();
                // 判断是否死亡飞跃
                if (type) {
                    this.mapjs.floorDownMove(floor);
                    this.gameOver(3);
                } else {
                    this.playerFly = false;
                    floor.floorData.countDown = 60;
                }
            })));

        }
        // 寻路计算
        let findUseableFloor = () => {
            // console.log('执行======>findUseableFloor', num);
            for (let i = 0; i < floors.length; i++) {
                if (floors[i].x == this.playerSize.x + SIZE.h && floors[i].y == this.playerSize.y + SIZE.w) {
                    // 往右成立
                    this.playerSize.x += SIZE.h;
                    this.playerSize.y += SIZE.w;
                    if (num != 0) {
                        if (floors[i].floorData.type != 'base') {
                            num -= 1;
                        }
                        findUseableFloor();
                        break;
                    } else {
                        finded();
                        break;
                    }
                } else if (floors[i].x == this.playerSize.x - SIZE.h && floors[i].y == this.playerSize.y + SIZE.w) {
                    // 往左成立
                    this.playerSize.x -= SIZE.h;
                    this.playerSize.y += SIZE.w;
                    if (num != 0) {
                        if (floors[i].floorData.type != 'base') {
                            num -= 1;
                        }
                        findUseableFloor();
                        break;
                    } else {
                        finded();
                        break;
                    }
                }
            }

        }
        findUseableFloor();
    },

    // 重置参数
    restPlayer:function() {
        this.player.stopAllActions();
        // this.playerBone.node.stopAllActions();
        this.boneSwitch();
        this.player.opacity = 255;
        // this.playerBone.node.opacity = 255;
        this.isForce = false;
        this.isReverse = false;
    },

    // 复活游戏
    reviveGame:function(type = true) {
        let oldFloor = this.getFloor(0, 0);
        if (oldFloor) {
            oldFloor.stopAllActions();
            oldFloor.floorData.overMove = true;

            oldFloor.getComponent("mapfloor").setFloorSp("start");
        } else {
            let newFloor = this.mapjs.getFloor();

            // 重置地板数据和图片资源
            newFloor.getComponent("mapfloor").setFloorSp("start");
            newFloor.getComponent("mapfloor").setPropSp("");

            newFloor.x = this.playerSize.x;
            newFloor.y = this.playerSize.y;
            newFloor.color = Global.hexToColor('#ffffff');
            newFloor.floorData = {
                countDown: 0,
                type: 'base'
            }
            newFloor.zIndex = this.getFloor() ? this.getFloor().zIndex + 1 : this.getFloor(-1).zIndex + 1;
            newFloor.parent = this.map;
        }
        this.player.x = this.playerSize.x;
        this.player.y = this.playerSize.y;
        this.player.zIndex = 3;
        if (type) {
            if (!this.moreRevive) 
                this.reviveBox.active = false;
            this.boneLand(() => {
                this.boneHappy();
                Global.gameInfo.state = 'none';
            });
        }
    },

    /**
     * 游戏结束 
     * @param {number} type 1 => 向右移动一段距离再掉 -1 => 向左移动一段距离再掉 3 => 直接显示结束框
     */
    gameOver:function(type = 1) {
        cc.Mgr.AudioMgr.playSFX("fail");
        // console.log('你输了');
        if (this.timer) clearTimeout(this.timer);
        Global.gameInfo.state = 'over';
        this.restPlayer();

        let showOverBox = () => {
            this.player.zIndex = 9;
            this.boneDie();
            this.scheduleOnce(() => {
                this.player.zIndex = 1;
                cc.Mgr.AudioMgr.playSFX("lose");
            }, 1.45);
            this.scheduleOnce(() => {
                //cc.Mgr.AudioMgr.pauseMusic();
                this.isClick = false;
                if(!this.DieFly)
                {
                    if (this.isRevive == true) {
                        //this.isRevive = 'revive';
                        this.reviveBox.active = true;
                        this.reviveBox.getComponent('revive').upDataReviveUI();
                        // console.log('复活窗口显示2');
                    } else if (!this.isRevive) {
                        this.isRevive = true;
                        this.reviveBox = cc.instantiate(this.reviveUIPre);
                        this.reviveBox.getComponent('revive').upDataReviveUI();
                        this.reviveBox.parent = this.uiRoot;
                        this.reviveBox.zIndex = 10;
                        this.reviveBox.setPosition(cc.v2(0,0));
                        // console.log('复活窗口显示1');
                    } else if (this.isRevive == 'revive') {
                        this.overBox = cc.instantiate(this.overUIPre);
                        this.overBox.parent = this.uiRoot;
                        this.overBox.zIndex = 10;
                        this.overBox.setPosition(cc.v2(0,0));
                        // console.log('结束窗口显示');
                    }
                }
                else
                {
                    this.overBox = cc.instantiate(this.overUIPre);
                    this.overBox.parent = this.uiRoot;
                    this.overBox.zIndex = 10;
                    this.overBox.setPosition(cc.v2(0,0));
                }
            }, 2);
        }

        if (type == 3) {
            showOverBox();
        } else {
            this.player.runAction(cc.sequence(cc.moveBy(0.1, type * SIZE.h, SIZE.w), cc.callFunc(() => {
                // 判断皮肤复活
                if (this.moreRevive) {
                    this.player.zIndex = 11;
                    this.boneDie();
                    this.scheduleOnce(() => {
                        this.player.zIndex = 1;
                    }, 1.85);
                    this.scheduleOnce(() => {
                        this.isClick = false;
                        this.reviveGame();
                        this.moreRevive = false;
                    }, 2);
                } else {
                    showOverBox();
                }
            })));
        }
        // 检测保存一下最高分数
        if (Global.gameInfo.score > Global.userData.maxScore) {
            Global.userData.maxScore = Global.gameInfo.score;
        }
        Global.saveData();
    },

    // 获取当前脚下的地板
    getFloor:function(_x = 1, _y = 1) {
        let floors = this.map.children;
        let floor = null;
        for (let i = 0; i < floors.length; i++) {
            if (floors[i].x == this.playerSize.x + SIZE.h * _x && floors[i].y == this.playerSize.y + SIZE.w * _y) {
                floor = floors[i];
                break;
            }
        }
        return floor;
    },

    // 下一步
    next:function(floor) {
        this.mapjs.fallDownFloor();
        if (floor.floorData.type == 'floor') {          
            floor.floorData.countDown = parseInt(180 * (1 - Global.gameInfo.score / 2000)); // 1000
            if (floor.floorData.countDown < 6) {
                floor.floorData.countDown = 6;
            }
            Global.gameInfo.score += 1;
            this.meterLbl.string = Global.gameInfo.score;

            //console.log('分数======>', Global.gameInfo.score);
            if (Global.gameInfo.score % 50 == 0 && Global.gameInfo.score > 10) {
                this.flagMove(Global.gameInfo.score + '米');   
                cc.Mgr.AudioMgr.playSFX("halfbest");
            }
            if (Global.gameInfo.score > Global.userData.maxScore && !this.newFlag) {
                this.newFlag = true;
                this.flagMove('新纪录');
                cc.Mgr.AudioMgr.playSFX("newhigh");
            }

            // 更换背景
            if (Global.gameInfo.score >= Config.gameBgScoreLv_1 && this.bg_count == 0) {
                this.bg_count = 1;
                let bg1 = this.background.getChildByName('bg-color-1');
                let bg2 = this.background.getChildByName('bg-color-2');
                bg1.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.line_2;
                bg2.runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(() => {
                    bg2.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.line_3;
                })));
            } else if (Global.gameInfo.score >= Config.gameBgScoreLv_2 && this.bg_count == 1) {
                this.bg_count = 2;
                let bg1 = this.background.getChildByName('bg-color-1');
                let bg2 = this.background.getChildByName('bg-color-2');
                bg2.runAction(cc.fadeIn(1.5));
                bg1.runAction(cc.fadeOut(1.5));
            }
        }
    },

    // 旗帜动画
    flagMove:function(str) {
        // if (Global.gameInfo.score % 50 == 0 && Global.gameInfo.score > 10) {
            this.flagNode.stopAllActions();
            // this.flagNode.x = this.playerSize.x + this.player.scaleX * 150;
            // this.flagNode.y = this.playerSize.y;
            this.flagNode.getChildByName('text').getComponent(cc.Label).string = str;
            var act1 = cc.moveTo(0.5, 227, 400);
            var act2 = cc.rotateBy(1.2, 0);
            var act3 = cc.moveTo(0.9, 600, 400);
            var seq = cc.sequence(act1, act2, act3);
            this.flagNode.runAction(seq);
        // }
    },

    // 判断操作
    judgeProp:function(floor, callBack) {
        let prop = floor.getChildByName('prop');
        // console.log(floor.floorData.prop);

        switch (floor.floorData.prop) {
            case 'ice1':
                if (this.isForce) {
                    cc.Mgr.AudioMgr.playSFX("break");

                    floor.getComponent("mapfloor").setPropSp("");
                    this.boneIntoIce();
                    callBack();
                } else {
                    cc.Mgr.AudioMgr.playSFX("kick");

                    this.boneHitIce();
                    floor.getComponent("mapfloor").setPropSp("");
                    floor.floorData.prop = '';
                    this.isClick = false;
                }
                break;

            case 'ice2':
                if (this.isForce) {
                    cc.Mgr.AudioMgr.playSFX("break");

                    floor.getComponent("mapfloor").setPropSp("");
                    this.boneIntoIce();
                    callBack();
                } else {
                    cc.Mgr.AudioMgr.playSFX("kick");

                    this.boneHitIce();
                    floor.getComponent("mapfloor").setPropSp("ice_1");
                    floor.floorData.prop = 'ice1';
                    this.isClick = false;
                }
                break;

            case 'ice3':
                if (this.isForce) {
                    cc.Mgr.AudioMgr.playSFX("break");

                    floor.getComponent("mapfloor").setPropSp("");
                    this.boneIntoIce();
                    callBack();
                } else {
                    cc.Mgr.AudioMgr.playSFX("kick");

                    this.boneHitIce();
                    floor.getComponent("mapfloor").setPropSp("ice_2");
                    floor.floorData.prop = 'ice2';
                    this.isClick = false;
                }
                break;

            case 'gem':
                cc.Mgr.AudioMgr.playSFX("coin");

                this.gemMove();
                prop.getComponent(cc.Sprite).spriteFrame = null;
                this.boneJump();
                callBack();
                break;

            case 'force':
                cc.Mgr.AudioMgr.playSFX("force");
                // console.log('获得金身');
                // 反向状态下吃到金身就取消金身状态
                if (this.isReverse) {
                    this.isReverse = false;
                    // this.playerBone.node.stopAllActions();
                }
                this.isForce = true;
                prop.getComponent(cc.Sprite).spriteFrame = null;
                this.boneSwitch('Gold');

                // this.playerBone.node.runAction(cc.sequence(cc.rotateTo(Global.gameInfo.forceTime + this.moreForce - 1, 0), cc.blink(1, 50), cc.callFunc(() => {
                //     this.isForce = false;
                //     if (!this.playerFly) this.boneSwitch();
                // })));

                this.boneJump();
                callBack();
                break;

            case 'reverse':
                // console.log('方向颠倒');
                cc.Mgr.AudioMgr.playSFX("reverse");

                // 金身状态下可以无视方向颠倒
                if (!this.isForce) {
                    this.isReverse = true;

                    this.boneSwitch('Dark');
                    // this.playerBone.node.runAction(cc.sequence(cc.rotateTo(Global.gameInfo.forceTime - 1, 0), cc.blink(1, 50), cc.callFunc(() => {
                    //     this.isReverse = false;
                    //     if (!this.playerFly) this.boneSwitch();
                    // })));
                }

                prop.getComponent(cc.Sprite).spriteFrame = null;
                this.boneJump();
                callBack();
                break;

            case 'trap':
                // console.log('踩到陷阱', floor.trapData);
                if (floor.trapData == 'seals') {
                    let _d = this.player.scaleX;
                    if (this.isForce) {
                        cc.Mgr.AudioMgr.playSFX("kickaway");

                        // 如果是金身状态撞到就弹飞
                        let trap = floor.getChildByName('trap');
                        let action = cc.spawn(cc.moveBy(0.8, this.node.width / 2 * _d, this.node.height / 2), cc.rotateBy(0.8, 1080 * _d));
                        action.easing(cc.easeOut(2.0));
                        trap.runAction(cc.sequence(action, cc.callFunc(() => {
                            trap.destroy();
                        })));
                        this.boneJump();
                        callBack();
                    } else {
                        // 先让主角前进一格并且更新下坐标
                        this.playerSize.x += SIZE.h * _d;
                        this.playerSize.y += SIZE.w;
                        this.isClick = false;
                        this.gameOver(_d);
                        this.mapjs.floorDownMove(floor);
                    }

                } else if (floor.trapData == 'tail') {
                    // 撞到尾巴就击飞
                    this.flyMove();
                    this.isClick = false;
                } else {
                    cc.Mgr.AudioMgr.playSFX("playerjump");
                    // 踩到板子盖上就停止左右动画
                    let trap = floor.getChildByName('trap');
                    for (let i = 0; i < trap.children.length; i++) {
                        trap.children[i].stopAllActions();
                    }
                    this.boneJump();
                    callBack();
                }
                break;

            case '':
                cc.Mgr.AudioMgr.playSFX("playerjump");

                this.boneJump();
                callBack();
                break;
        }
    },

    // 点击
    onClickCanvas:function(e, type) {
        if (Global.gameInfo.state == 'over' || this.playerFly) return;
        this.balloon_count = 180;
        this.balloon.opacity = 0;
        // 判断反向道具
        if (this.isReverse) {
            type = type == 'right' ? 'left' : 'right';
        }
        if (this.isClick && this.timerFun) {
            clearTimeout(this.timer);
            this.isClick = false;
            this.timerFun();
            this.timerFun = null;
            // console.log('执行');
        }
        if (!this.isClick) {
            this.isClick = true;
            if (type == 'left') {
                this.player.scaleX = -1;
            } else if (type == 'right') {
                this.player.scaleX = 1;
            }
            let _d = this.player.scaleX;
            let floor = this.getFloor(_d);
            if (floor) {
                this.judgeProp(floor, () => {
                    this.timerFun = () => {
                        if (floor.floorData.end) {
                            console.log('走到一个站台====================================');
                            this.boneHappy();
                            this.tipReWard.node.active = true;
                            this.tipReWard.node.zIndex = 10;
                            this.tipReWard.showTip(300);
                            cc.Mgr.AudioMgr.playSFX("newstage");

                        } else {
                            this.boneStand();
                        }
                        this.player.x += SIZE.h * _d;
                        this.player.y += SIZE.w;
                        this.isClick = false;
                        this.playerSize.x += SIZE.h * _d;
                        this.playerSize.y += SIZE.w;
                        this.next(floor);
                    }
                    this.timer = setTimeout(() => {
                        this.timerFun();
                        this.timerFun = null;
                        // console.log('计时结束');
                    }, 400);
                });
            } else {
                this.gameOver(_d);
            }
        }
    },

    // 骨骼换肤
    boneSwitch:function(type) {
        // console.log(type);
        // if (type) {
        //     this.playerBone.armatureName = Global.gameInfo.skinName[Global.userData.skin] + type;
        // } else {
        //     this.playerBone.armatureName = Global.gameInfo.skinName[Global.userData.skin];
        // }
        this.currentSkin = Global.gameInfo.skinName[Global.userData.skin];
    },
    // 骨骼静止
    boneStand:function() {
        // this.playerBone.playAnimation('stand', 0);
        this.playerAnimation.play(this.currentSkin + '_stand');
    },

    // 骨骼跳跃
    boneJump:function() {
        // this.playerBone.playAnimation('jump', 1);
        this.playerAnimation.play(this.currentSkin + '_jump');
    },

    // 骨骼撞到冰块
    boneHitIce:function() {
        // this.playerBone.playAnimation('hitIce', 1);
        this.playerAnimation.play(this.currentSkin + '_hitIce');
    },

    // 骨骼穿过冰块
    boneIntoIce:function() {
        // this.playerBone.playAnimation('intoIce', 1);
        this.playerAnimation.play(this.currentSkin + '_intoIce');
    },

    // 骨骼死亡
    boneDie:function() {
        console.log('死亡动画======>');
        // this.playerBone.playAnimation('die', 1);
        this.player.scaleX = -this.player.scaleX;
        this.playerAnimation.play(this.currentSkin + '_die');
    },

    // 骨骼 降落伞
    boneLand:function(callBack) {
        // this.playerBone.playAnimation('land');
        // 记录原始 Y 坐标
        // const originalY = this.player.y;
        // 播放动画前 Y 坐标提高 100
        // this.player.y += 200;
        
        // this.playerAnimation.play(this.currentSkin + '_land');
        this.scheduleOnce(() => {
            // 动画播放完后，恢复到原始 Y 坐标
            // this.player.y = originalY;
            if (callBack) callBack();
        }, 0.1);
    },

    // 骨骼庆祝
    boneHappy:function() {
        // this.playerBone.playAnimation('celebrate', 0);
        this.playerAnimation.play(this.currentSkin + '_celebrate');
    },

    // 骨骼飞跃
    boneFly:function() {
        // this.playerBone.playAnimation('fly', 1);
        this.playerAnimation.play(this.currentSkin + '_fly');
    },

    // 生成云
    initCloudInGame:function() {
        this.scheduleOnce(() => {
            let cloud = cc.instantiate(this.cloudPre);
            cloud.parent = this.background;
            this.scheduleOnce(() => {
                let cloud = cc.instantiate(this.cloudPre);
                cloud.parent = this.background;
                this.scheduleOnce(() => {
                    let cloud = cc.instantiate(this.cloudPre);
                    cloud.parent = this.background;
                }, 0.1);
            }, 0.1);
        }, 0.1);
    },

    // 钻石对象池
    createGemPool:function() {
        this.gemPool = new cc.NodePool();
        window.gemPool = this.gemPool;
        for (let i = 0; i < 8; i++) {
            let gem = cc.instantiate(this.gem);
            this.gemPool.put(gem);
        }
    },

    // 拿取钻石对象
    getGem:function() {
        let enemy = null;
        if (this.gemPool.size() > 0) {
            enemy = this.gemPool.get();
        } else {
            enemy = cc.instantiate(this.gem);
        }
        return enemy;
    },

    // 钻石抛物线
    gemMove:function() {
        let gem = this.getGem();
        let bezier = [];
        gem.y = -146;
        if (this.player.scaleX > 0) {
            gem.x = 60;
            bezier = [cc.v2(gem.x, gem.y), cc.v2(300, 400), cc.v2(this.gemBox.x + 20, this.gemBox.y)];
        } else {
            gem.x = -60;
            bezier = [cc.v2(gem.x, gem.y), cc.v2(-300, -400), cc.v2(this.gemBox.x + 20, this.gemBox.y)];
        }
        gem.parent = this.node;
        gem.zIndex = 9999;
        let bezierTo = cc.bezierTo(1, bezier);
        gem.runAction(cc.sequence(bezierTo, cc.callFunc(() => {
            Global.userData.gem += 1;
            this.gemNum += 1;
            this.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;
            this.gemPool.put(gem);
        })));
    },

    // 重设游戏参数（换皮肤用）
    restGameData:function() {
        this.moreGem = false;       // 更多钻石
        this.moreFly = 0;           // 非得更远
        this.moreForce = 0;         // 金身时间更久
        this.moreRevive = false;    // 复活多一次
        switch (Global.userData.skin) {
            case 1:
                this.moreRevive = true;
                break;
            case 2:
                this.moreGem = true;
                break;
            case 3:
                this.moreFly = 0;
                break;
            case 4:
                this.moreForce = 2;
                break;
        }

    },

    onLoad() {
        Global.gameInfo.score = 0;
        Global.gameInfo.state = 'over';
        Global.gameInfo.gameScene = "game";
        Global.game = this;
        this.mapjs = this.map.getComponent('map');
        this.restGameData();
        this.boneSwitch();
        // 当局获得钻石数量
        this.gemNum = 0;
        // 背景切换计算
        this.bg_count = 0;
        // 主角位置储存
        this.playerSize = {
            x: 0,
            y: -246
        }
        // 设置层级(掉落时需要)
        this.map.zIndex = 2;
        this.player.zIndex = 3;
        this.leftBtn.zIndex = 4;
        this.rightBtn.zIndex = 4;
        this.stateBtn.zIndex = 4;
        this.gemBox.zIndex = 5;
        this.meterLbl.node.zIndex = 5;
        this.flagNode.zIndex = 3;
        this.balloon_count = 0;

        // 创建对象池
        this.createGemPool();
        
        // this.initCloudInGame();
        this.gemBox.getChildByName('num').getComponent(cc.Label).string = Global.userData.gem;

        // 地图调试用
        // this.node.on('touchmove', e => {
        //     let delta = e.touch.getDelta();
        //     this.map.x += delta.x;
        //     this.map.y += delta.y;
        // }, this);

        // 主角开始进场
        this.boneLand(() => {
            // this.playerBone.playAnimation('appear');
            this.scheduleOnce(() => {
                Global.gameInfo.state = 'none';
                this.balloon_count = 180;
                this.boneStand();
            }, 0.5);
        });

        window.mapNode = this.map;

        this.currentSkin = Global.gameInfo.skinName[Global.userData.skin]; // 初始化当前皮肤
    },

    start() {
        cc.Mgr.PlatformController.ShowClubButton(false);

        // 添加键盘事件（测试用）
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, e => {
            if (cc.director.isPaused()) return;
            // console.log(e.keyCode);
            switch (e.keyCode) {
                case cc.KEY.left:
                    // console.log('左');
                    this.onClickCanvas(null, 'left');
                    break;
                case cc.KEY.right:
                    // console.log('右');
                    this.onClickCanvas(null, 'right');
                    break;
            }
        }, this);

        var self = this;
        cc.director.on("NativeAdOpenInGame", function(data){
            console.log("原生广告信息收到了");
            self.openNativeAd(data);
        });
    },

    openNativeAd(param)
    {
        this.nativeAdNode.zIndex = 100;
        this.nativeAdNode.active = true;
        this.nativeAdNode.getComponent("NativeAd").showUI(param);     
    },

    colseNativeAd()
    {
        this.nativeAdNode.active = false;
    },

    onDestroy()
    {
        cc.director.off("NativeAdOpenInGame");
    },

    update(dt) {
        if (this.balloon_count != 0 && Global.gameInfo.state != 'over') {
            this.balloon_count -= 1;
            if (this.balloon_count == 0) {
                this.balloon.opacity = 255;
            }
        }
    },
});


