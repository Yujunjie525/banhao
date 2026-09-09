import { _decorator, Component, Node } from 'cc';
import { gameConfig } from './gameConfig';
import { audioTool } from './audioTool';
import { save } from './tools';
import { local } from './enmus';
const { ccclass, property } = _decorator;

@ccclass('soundSetting')
export class soundSetting extends Component {
    // 音乐按钮
    @property(Node) bgm: Node = null
    // 音效按钮
    @property(Node) sound: Node = null
    protected onEnable(): void {
        this.init()
    }
    init() {
        this.bgmStatus()
        this.soundStatus()
    }
    // 控制音乐
    bgmBtn() {
        if (gameConfig.isBgm) {
            gameConfig.isBgm = 0
        } else {
            gameConfig.isBgm = 1
        }
        this.bgmStatus()
        save(local.isBgm, gameConfig.isBgm)
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
        save(local.isSound, gameConfig.isSound)
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
}


