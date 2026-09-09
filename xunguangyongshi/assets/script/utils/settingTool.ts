import { _decorator, Component, director, Node, NodeEventType, PhysicsSystem2D, tween, Vec3 } from 'cc';
import { emits, localData } from '../data/enums';
import { nodePool } from './nodePool';
import { audioTool } from './audioTool';
import { gameConfig } from '../data/gameConfig';
import { load } from './tools';
const { ccclass, property } = _decorator;

@ccclass('settingTool')
export class settingTool extends Component {
    // 音乐按钮
    @property(Node) bgm: Node = null
    // 音效按钮
    @property(Node) sound: Node = null
    @property(Node) back: Node;
    private popUI: Node;
    protected onEnable(): void {
        this.init()
        this.initSound()
    }

    protected onDestroy(): void {
        director.off(emits.backIsShow, this.backIsShow, this)
    }
    // 初始化
    init() {
        director.on(emits.backIsShow, this.backIsShow, this)
        let close = this.node.getChildByPath('popUI/closeBtn')
        close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
    }
    // 初始化音量设置
    initSound() {
        this.bgmStatus()
        this.soundStatus()
    }
    // 控制音乐
    bgmBtn() {
        console.log(gameConfig.isBgm);
        if (gameConfig.isBgm) {
            gameConfig.isBgm = 0
        } else {
            gameConfig.isBgm = 1
        }
        this.bgmStatus()
    }
    bgmStatus() {
        if (gameConfig.isBgm) {
            this.bgm.getChildByName('on').active = true
            this.bgm.getChildByName('off').active = false
            audioTool.ins.setVolume(0.8)
            gameConfig.bgmVol = 0.8
        } else {
            this.bgm.getChildByName('on').active = false
            this.bgm.getChildByName('off').active = true
            audioTool.ins.setVolume(0)
            gameConfig.bgmVol = 0
        }
    }
    // 控制音效
    soundBtn() {
        if (gameConfig.isSound) {
            gameConfig.isSound = 0
        } else {
            gameConfig.isSound = 1
        }
        this.soundStatus()
    }
    soundStatus() {
        if (gameConfig.isSound) {
            this.sound.getChildByName('on').active = true
            this.sound.getChildByName('off').active = false
            gameConfig.soundVol = 0.9
        } else {
            this.sound.getChildByName('on').active = false
            this.sound.getChildByName('off').active = true
            gameConfig.soundVol = 0
        }
    }
    // 关闭弹窗
    closeBtn() {
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            gameConfig.gamePause = 0
            director.emit(emits.gamePause)
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
    // 返回首页
    backBtn() {
        gameConfig.gamePause = 0
        director.emit(emits.gamePause)
        audioTool.ins.stopMusic()
        nodePool.ins.huiShouNode(this.node)
        director.loadScene('home2')
    }
    backIsShow(val: number) {
        if (val == 1) {
            this.back.active = true
        } else {
            this.back.active = false
        }
    }
}


