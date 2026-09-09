
const {ccclass, property} = cc._decorator;
import mGameData from '../Data/GameData';
import AudioManager from './AudioManager';
import GameManager from './GameManager';
import TipsManager from './TipsManager';
@ccclass
export default class PlayerManager extends cc.Component {
    @property(cc.Node)
    Touchanmo:cc.Node = null;

    @property(cc.Node)
    dun:cc.Node = null;

    @property(cc.Sprite)
    Spr1:cc.Sprite  = null;

    @property(cc.Sprite)
    Spr2:cc.Sprite  = null;

    @property(cc.Sprite)
    Spr3:cc.Sprite  = null;

    @property([cc.SpriteFrame])
    SprZu:cc.SpriteFrame[] = [];
    
    @property(cc.Node)
    pillarX1:cc.Node = null;
    
    @property(cc.Node)
    pillarX2:cc.Node = null;
    
    anim:cc.Animation = null;
    //是否分享成功
    IsShare:boolean = false;

    onLoad () {
        this.DunMove();
        this.Touchanmo.on(cc.Node.EventType.TOUCH_START,this.ClipTiao,this);
        //开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
        this.anim = this.getComponent(cc.Animation);
        this.node.active = false;
        mGameData.playerHudun = this.dun;
        
        // 获取柱子节点的引用
        if (!this.pillarX1 || !this.pillarX2) {
            const bgMoveNode = cc.find('BgMove');
            if (bgMoveNode) {
                const bg01 = bgMoveNode.getChildByName('Bg01');
                const bg02 = bgMoveNode.getChildByName('Bg02');
                
                // 获取两个背景中的柱子，确保始终有可用的柱子引用
                if (bg01) {
                    this.pillarX1 = bg01.getChildByName('x1');
                    this.pillarX2 = bg01.getChildByName('x2');
                }
                if (!this.pillarX1 || !this.pillarX2 && bg02) {
                    this.pillarX1 = bg02.getChildByName('x1');
                    this.pillarX2 = bg02.getChildByName('x2');
                }
            }
        }
        
        // 根据playerLoc设置玩家初始位置
        this.updatePlayerPosition();
        
        // 将PlayerManager实例存储在GameData中
        mGameData.playerManager = this;
        if(cc.sys.platform != cc.sys.WECHAT_GAME){
            return;
        }

        let self = this;
        let au = AudioManager;
        wx.onShow(function(){
            if(self.IsShare){
                self.IsShare = false;
                GameManager.GetIns().CloseGameOver();
                GameManager.GetIns().OpenScore();
                mGameData.isOpenWXShare = false;
                self.GetplayerReLive();
                au.GetIns().PlayBgm();
            }
        })
    }

    start () {
        // this.Touchanmo.on(cc.Node.EventType.TOUCH_START,this.ClipTiao,this);

    }
    /**
     * 点击玩家跳跃的方法
     */
    ClipTiao(){
        if(!mGameData.isGameBegin || !mGameData.isTouchAgain){
            return;
        }

        AudioManager.GetIns().PlayAudio('Jump');
        mGameData.isTouchAgain = false;
        
        let leftPos: number;
        let rightPos: number;
        
        if (this.pillarX1 && this.pillarX2) {
            // 使用柱子的实际x坐标
            leftPos = this.pillarX1.x + this.pillarX1.width /2;
            rightPos = this.pillarX2.x - this.pillarX2.width /2;
        } else {
            // 备用方案：使用屏幕宽度计算
            const screenWidth = cc.winSize.width;
            leftPos = -screenWidth / 3;
            rightPos = screenWidth / 3;
        }
        
        switch(mGameData.playerLoc){
            case -1:
                this.anim.play('z2');
                var playerMove1 = cc.jumpTo(0.5,cc.v2(rightPos,-197),100,1);
                this.node.runAction(playerMove1);

                break;

            case 1:
                this.anim.play('y2');
                var playerMove2 = cc.jumpTo(0.5,cc.v2(leftPos,-197),100,1);
                this.node.runAction(playerMove2);

                break;
        }
    }
    update (dt) {
        // 如果处于buff状态，不执行位置动画切换
        if (mGameData.playerBuff) {
            return;
        }
        
        let leftPos: number;
        let rightPos: number;
        
        if (this.pillarX1 && this.pillarX2) {
            // 使用柱子的实际x坐标
            leftPos = this.pillarX1.x + this.pillarX1.width /2;
            rightPos = this.pillarX2.x - this.pillarX2.width /2;
        } else {
            // 备用方案：使用屏幕宽度计算
            const screenWidth = cc.winSize.width;
            leftPos = -screenWidth / 3;
            rightPos = screenWidth / 3;
        }
        
        //从左往右
        if(this.node.x > rightPos - 10 && mGameData.playerLoc == -1){
            this.anim.play('y1');
            mGameData.playerLoc = 1;
            mGameData.isTouchAgain = true;
        }

        //从右往左
        if(this.node.x < leftPos + 10 && mGameData.playerLoc == 1){
            this.anim.play('z1');
            mGameData.playerLoc = -1;
            mGameData.isTouchAgain = true;
        }
    }
    
    /**
     * 更新玩家位置到柱子上
     */
    updatePlayerPosition() {
        if (this.pillarX1 && this.pillarX2) {
            // 获取柱子的实际x坐标
            const leftPos = this.pillarX1.x + this.pillarX1.width /2;
            const rightPos = this.pillarX2.x - this.pillarX2.width /2;
            
            if (mGameData.playerLoc === -1) {
                this.node.position = cc.v2(leftPos, -200);
            } else {
                this.node.position = cc.v2(rightPos, -200);
            }
        } else {
            // 备用方案：使用屏幕宽度计算
            const screenWidth = cc.winSize.width;
            const leftPos = -screenWidth / 3;
            const rightPos = screenWidth / 3;
            
            if (mGameData.playerLoc === -1) {
                this.node.position = cc.v2(leftPos, -200);
            } else {
                this.node.position = cc.v2(rightPos, -200);
            }
        }
    }

    onCollisionEnter(other,self){
        if(mGameData.playerBuff || !mGameData.isGameBegin){
            return;
        }

        switch(other.node.group){
            case 'dun1':
                if (this.dun) {
                    this.dun.opacity = 255;
                    AudioManager.GetIns().PlayAudio('Protect');
                }
                break;
            case 'guZA':
                if (this.dun) {
                    if(this.dun.opacity == 255){
                        this.dun.opacity = 0;
                        AudioManager.GetIns().PlayAudio('Hurt');
                    }else{
                        this.playerDie();
                        AudioManager.GetIns().StopBgm();
                        AudioManager.GetIns().PlayAudio('Fall');
                        GameManager.GetIns().OpenGameOver();
                    }
                } else {
                    // 如果没有保护盾，直接死亡
                    this.playerDie();
                    AudioManager.GetIns().StopBgm();
                    AudioManager.GetIns().PlayAudio('Fall');
                    GameManager.GetIns().OpenGameOver();
                }
                break;
            case 'zidan':
                AudioManager.GetIns().PlayAudio('Weakill');
                this.HitBuff(0);
                break;
            case 'wenzi':
                AudioManager.GetIns().PlayAudio('Flykill');
                this.HitBuff(1);
                break;
            case 'huli':
                AudioManager.GetIns().PlayAudio('Foxkill');
                this.HitBuff(2);
                break;
        }
    }
    /**
     * 碰到怪物
     * @param num 
     */
    HitBuff(num:number){
        if(!mGameData.isTouchAgain){
            mGameData.addBuffNum(num,this);
            mGameData.changeSprs(this);
            return;
        }
        if (this.dun && this.dun.opacity == 255) {
            this.dun.opacity = 0;
            AudioManager.GetIns().PlayAudio('Hurt');
        } else {
            this.playerDie();
            GameManager.GetIns().OpenGameOver();
            AudioManager.GetIns().StopBgm();
            AudioManager.GetIns().PlayAudio('Fall');
        }
    }
    /**
     * 盾的动画
     */
    DunMove(){
        if (this.dun) {
            this.dun.opacity = 0;
            var actions = cc.sequence(
                cc.scaleTo(1,1.2),
                cc.scaleTo(0.5,1),
            ).repeatForever();
            this.dun.runAction(actions);
        }
    }

    /**
     * 玩家死亡方法
     */
    playerDie(){
        if (mGameData.BestScore < mGameData.EveryScore) {
            mGameData.BestScore = mGameData.EveryScore;
        }
        mGameData.isGameBegin = false;
        this.node.stopAllActions();
        //死亡动作
        if (this.node.x > 0) {
            this.anim.stop();
            this.anim.play('y3');
            // 使用当前节点的x坐标作为起点
            var bezier1 = [cc.v2(this.node.x, this.node.y), cc.v2(100, -600), cc.v2(0, -800)];
            var playerdle = cc.bezierTo(1, bezier1);
            var playerdle_0=cc.moveTo(0.5,cc.v2(0,-1100))
            this.node.runAction(cc.sequence(playerdle,playerdle_0));
        } else {
            this.anim.stop();
            this.anim.play('z3');
            // 使用当前节点的x坐标作为起点
            var bezier1 = [cc.v2(this.node.x, this.node.y), cc.v2(-100, -600), cc.v2(0, -800)];
            var playerdle1 = cc.bezierTo(1, bezier1);
            var playerdle1_0=cc.moveTo(0.5,cc.v2(0,-1100))
            this.node.runAction(cc.sequence(playerdle1,playerdle1_0));
        }
        //检查一下buff图片
         mGameData.initBuffzu(this);
    }
    /**
     * 玩家复活
     */
    GetplayerReLive(){
        mGameData.isGameBegin = true;
        this.node.stopAllActions();
       
        this.anim.play("buff2");
        mGameData.isTouchAgain=false;
        mGameData.playerBuff = true;
        mGameData.BgMoveSpeed = 24;
        var a1 = cc.moveTo(1, cc.v2(0, 100));
        var a2 = cc.moveTo(2, cc.v2(-250, -150));
        var a3 = cc.moveTo(2, cc.v2(250, 0));
        var a4 = cc.moveTo(2, cc.v2(200,-200));
        var action=cc.sequence(a1,cc.delayTime(2),a2,a3,a4);
        this.node.runAction(action);
    }
    /**
     * 再来一局
     */
    PlayAgain(){
        // 检查体力是否足够（同时支持关卡模式和无限模式）
        // if(mGameData.HasEnoughStamina()){
        //     // 消耗一点体力
        //     mGameData.ConsumeStamina();
        //     // 继续游戏逻辑
        //     mGameData.initGame();
        //     GameManager.GetIns().CloseGameOver();
        //     GameManager.GetIns().OpenScore();
        //     this.node.stopAllActions();
        //     this.anim.play("z1");
        //     var a1 = cc.place(cc.v2(-200, -200));
        //     // 重新初始化倒计时
        //     GameManager.GetIns().initCountdown();
        //     this.node.runAction(a1);
        // }else{
        //     // 体力不足，显示提示
        //     TipsManager.show('体力不足，无法开始游戏');
        // }
        if (mGameData.isInfiniteMode) {
            // 无限模式下，直接开始新的游戏
            mGameData.initGame();
            GameManager.GetIns().CloseGameOver();
            GameManager.GetIns().OpenScore();
            this.node.stopAllActions();
            this.anim.play("z1");
            
            // 更新玩家位置到柱子上
            this.updatePlayerPosition();
            
            // 重新初始化倒计时
            GameManager.GetIns().initCountdown();
        } else {
            // 关卡模式下，检查是否有足够的体力
            GameManager.GetIns().NextLevel();
        }
    }
    /**
     * 再来一局
     */
    AgainGame(){
        // 将来设计成消耗道具复活，暂时不扣除体力
        this.GetplayerReLive();
        GameManager.GetIns().CloseGameOver();
        GameManager.GetIns().OpenScore();
    }
    
    PlayBuffAudio(){
        AudioManager.GetIns().PlayAudio('Buff');
    }

    onDestroy() {
        // 清理GameData中的引用，避免场景重新加载时使用无效引用
        if (mGameData.playerManager === this) {
            mGameData.playerManager = null;
            mGameData.playerHudun = null;
        }
        // 移除触摸事件监听
        this.Touchanmo.off(cc.Node.EventType.TOUCH_START, this.ClipTiao, this);
    }
}
