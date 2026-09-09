import { _decorator, Component, director, Label, Node, ProgressBar, sys } from 'cc'
import { emits, localData } from '../data/enums'
import { gameConfig } from '../data/gameConfig'
import { wxAd } from '../AD/wxAd'
import { loadPool } from '../../scripts/res/loadPool'
import { nodePool } from '../utils/nodePool'
import { load } from '../utils/tools'
const { ccclass, property } = _decorator

@ccclass('gameUi')
export class gameUi extends Component {
    // 金币显示
    @property(Label) jinbiLabel: Label = null
    // 距离显示
    @property(Label) juliLabel: Label = null
    // 血量显示
    @property(ProgressBar) HPPro: ProgressBar = null
    // 力气值显示
    @property(ProgressBar) liqiPro: ProgressBar = null
    // 力气值文本显示
    @property(Label) liqiLabel: Label = null
    private isJumpPressing: boolean = false

    start() {
        this.init()
        this.refreshLiqi()
        this.juliNum()
    }

    update(dt: number) {
        this.updateLiqi(dt)
    }
    onDestroy(): void {
        // 金币数量
        director.off(emits.leveJinbiNum, this.jinbiNum, this)
        // 血量
        director.off(emits.PHNum, this.PHNum, this)
        this.stopJump()
        // 销毁计时器
        this.unscheduleAllCallbacks()
    }
    init() {
        // 跳跃
        const jump = this.node.getChildByPath('bottomUI/jumpBtn')
        jump.on(Node.EventType.TOUCH_START, this.jumpStart, this)
        jump.on(Node.EventType.TOUCH_END, this.jumpEnd, this)
        jump.on(Node.EventType.TOUCH_CANCEL, this.jumpEnd, this)
        // 发射子弹
        const atk = this.node.getChildByPath('bottomUI/atkBtn')
        atk.on(Node.EventType.TOUCH_START, this.atkStart, this)
        atk.on(Node.EventType.TOUCH_END, this.atkEnd, this)
        atk.on(Node.EventType.TOUCH_CANCEL, this.atkEnd, this)
        // 金币数量
        director.on(emits.leveJinbiNum, this.jinbiNum, this)
        // 血量
        director.on(emits.PHNum, this.PHNum, this)
        // 参数初始化
        gameConfig.HPNum = 10
        gameConfig.liqiNum = gameConfig.maxLiqiNum
        gameConfig.leveJinbiNum = -1
        gameConfig.juliNum = 0
        this.isJumpPressing = false
        
        // 检查并显示玩法引导
        this.checkAndShowGuide()
    }
    
    private getHasCompletedGuideKey(): string {
        const userId = sys.localStorage.getItem('SLS_USER_ID') || 'default';
        return `${localData.hasCompletedGuide}_${userId}`;
    }
    
    private checkAndShowGuide() {
        const hasCompletedKey = this.getHasCompletedGuideKey();
        const hasCompleted = load(hasCompletedKey, 0);
        if (!hasCompleted) {
            // 暂停游戏
            gameConfig.gamePause = 1;
            director.emit(emits.gamePause);
            
            // 显示引导弹窗
            loadPool.ins.getPoolNode('GuideWnd', this.node);
        }
    }
    /**
     * 金币数量
     */
    jinbiNum() {
        gameConfig.leveJinbiNum += 1
        this.jinbiLabel.string = String(gameConfig.leveJinbiNum)
    }
    /**
     * 距离
     */
    juliNum() {
        this.schedule(() => {
            if (gameConfig.gamePause == 1) {
                return
            }
            gameConfig.juliNum += 1
            this.juliLabel.string = String(gameConfig.juliNum) + '米'
            this.maxLeve()
        }, 0.1)
    }
    /**
     * 根据距离调整难度
     */
    maxLeve() {
        if (gameConfig.juliNum < 1000) {
            gameConfig.maxLevel = 7
        } else if (gameConfig.juliNum < 2000) {
            gameConfig.maxLevel = 12
        } else {
            gameConfig.maxLevel = 15
        }
    }
    /**
     * 暂停
     */
    suspendBtn() {
        this.stopJump()
        gameConfig.gamePause = 1
        director.emit(emits.gamePause)
        nodePool.ins.getPoolNode('settings', gameConfig.gameRoot)
        director.emit(emits.backIsShow, 1)
    }
    /**
     * 血量
     */
    PHNum(val: number) {
        gameConfig.HPNum = gameConfig.HPNum + val
        if (gameConfig.HPNum > 10) {
            gameConfig.HPNum = 10
        }
        if (gameConfig.HPNum < 0) {
            gameConfig.HPNum = 0
        }
        this.HPPro.progress = gameConfig.HPNum / 10
        if (this.HPPro.progress <= 0) {
            this.stopJump()
            // 游戏暂停
            gameConfig.gamePause = 1
            director.emit(emits.gamePause)
            // 插屏广告
            wxAd.ins.chapingAd()
            // 游戏结束
            director.emit(emits.gameover)
        }
    }
    /**
     * 跳跃
     */
    jumpStart() {
        if (gameConfig.gamePause == 1 || this.isJumpPressing) {
            return
        }
        if (gameConfig.liqiNum < gameConfig.liqiJumpCost) {
            this.stopJump()
            return
        }
        this.changeLiqi(-gameConfig.liqiJumpCost)
        this.isJumpPressing = true
        director.emit(emits.jump, true)
    }

    jumpEnd() {
        this.stopJump()
    }

    atkStart() {
        director.emit(emits.atk, true)
    }

    atkEnd() {
        director.emit(emits.atk, false)
    }

    updateLiqi(dt: number) {
        if (!this.liqiPro || gameConfig.gamePause == 1) {
            return
        }
        if (this.isJumpPressing) {
            this.changeLiqi(-gameConfig.liqiHoldCost * dt)
            if (gameConfig.liqiNum <= 0) {
                this.stopJump()
            }
        }
        if (gameConfig.liqiNum < gameConfig.maxLiqiNum) {
            this.changeLiqi(gameConfig.liqiRecoverSpeed * dt)
        }
    }

    changeLiqi(val: number) {
        gameConfig.liqiNum += val
        if (gameConfig.liqiNum > gameConfig.maxLiqiNum) {
            gameConfig.liqiNum = gameConfig.maxLiqiNum
        }
        if (gameConfig.liqiNum < 0) {
            gameConfig.liqiNum = 0
        }
        this.refreshLiqi()
    }

    refreshLiqi() {
        if (!this.liqiPro) {
            if (this.liqiLabel) {
                this.liqiLabel.string = `${Math.floor(gameConfig.liqiNum)}/${gameConfig.maxLiqiNum}`
            }
            return
        }
        this.liqiPro.progress = gameConfig.liqiNum / gameConfig.maxLiqiNum
        if (this.liqiLabel) {
            this.liqiLabel.string = `${Math.floor(gameConfig.liqiNum)}/${gameConfig.maxLiqiNum}`
        }
    }

    stopJump() {
        if (!this.isJumpPressing) {
            director.emit(emits.jump, false)
            return
        }
        this.isJumpPressing = false
        director.emit(emits.jump, false)
    }
}
