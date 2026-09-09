import { animation, AnimationClip, Sprite, SpriteAtlas, SpriteFrame } from "cc";
import ResourceLoadMgr from "./ResourceLoadMgr";
import { PlayerStateMachine } from "../Player/PlayerStateMachine";
import { StateMachine } from "./SateMachine";
import { sortSpriteFrame } from "../Utils";
import { TEST } from "cc/env";
// import { sortSpriteFrame } from "../Utils";

export const ANIMATION_SPEED = 1 / 8


/**真正播动画的地方*/
export default class State {
    animationClip: AnimationClip
    constructor(private fsm: StateMachine, private path: string, private isLoop: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal, private evts: any[] = []) {
        this.init()
    }

    async init() {
        const promise = ResourceLoadMgr.Instance.loadRes(this.path, SpriteAtlas)
        this.fsm.waitList.push(promise)
        const spriteAtlas = await promise
        this.animationClip = new AnimationClip();

        const track = new animation.ObjectTrack(); // 创建一个对象轨道
        track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame'); // 找子节点组件 以及属性

        const spFrames = spriteAtlas.spriteFrames
        const frams: Array<[number, SpriteFrame]> = []

        let index = 0
        let sortSpFrames = sortSpriteFrame(spFrames)
        for (const key in sortSpFrames) {
            if (Object.prototype.hasOwnProperty.call(sortSpFrames, key)) {
                const element = sortSpFrames[key];
                frams.push([ANIMATION_SPEED * index, element])
                index++
            }
        }
        // console.log(frams)
        track.channel.curve.assignSorted(frams)

        // // 最后将轨道添加到动画剪辑以应用
        this.animationClip.addTrack(track)
        this.animationClip.name = this.path
        this.animationClip.wrapMode = this.isLoop
        this.animationClip.duration = frams.length * ANIMATION_SPEED; // 整个动画剪辑的周期

        for (const event of this.evts) {
            this.animationClip.events.push(event)
        }
    }

    run() {
        if (this.fsm.animationCom?.defaultClip?.name === this.animationClip.name)
            return

        this.fsm.animationCom.defaultClip = this.animationClip
        this.fsm.animationCom.play()
    }
}