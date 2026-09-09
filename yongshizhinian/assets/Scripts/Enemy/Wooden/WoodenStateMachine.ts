import { Component, _decorator, Node, AnimationClip, Animation, SpriteFrame, SpriteAtlas } from "cc";
import { ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_TYPE, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM } from "../../../Enum";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { EnitiyMgr } from "../../Base/EnitiyMgr";
import { getParamsInitNumber, getParamsInitTrigger, StateMachine } from "../../Base/SateMachine";
import State from "../../Base/State";
import { AudioMgr } from "../../Runtime/AudioMgr";
import AttackWoodenSubStateMachine from "./AttackWoondenSubStateMachine";
import DeathWoodenSubStateMachine from "./DeathWoodenSubStateMachine";
import IdleWoodenSubStateMachine from "./IdleWoodenSubStateMachine";
import EventMgr from "../../Base/EventMgr";


const { ccclass, property } = _decorator;
@ccclass('WoodenStateMachine')
export class WoodenStateMachine extends StateMachine {
    async init() {
        this.animationCom = this.addComponent(Animation)

        this.initParams()
        this.initSateMachine()
        this.addAnimationEvent()

        await Promise.all(this.waitList)
    }

    initParams() {
        this.params.set(PARAMS_NAME_TYPE.IDLE, getParamsInitTrigger())
        this.params.set(PARAMS_NAME_TYPE.ATTACK, getParamsInitTrigger())
        this.params.set(PARAMS_NAME_TYPE.DEATH, getParamsInitTrigger())
        this.params.set(PARAMS_NAME_TYPE.DIRECTION, getParamsInitNumber())
    }

    initSateMachine() {
        this.stateMachine.set(PARAMS_NAME_TYPE.IDLE, new IdleWoodenSubStateMachine(this))
        this.stateMachine.set(PARAMS_NAME_TYPE.ATTACK, new AttackWoodenSubStateMachine(this))
        this.stateMachine.set(PARAMS_NAME_TYPE.DEATH, new DeathWoodenSubStateMachine(this))
    }

    addAnimationEvent() {
        this.animationCom.on(Animation.EventType.FINISHED, () => {
            const animationName = this.animationCom.defaultClip.name
            const list = ['attack']

            if (list.some(v => animationName.includes(v))) {
                // this.setParams(PARAMS_NAME_TYPE.IDLE, true)
                this.node.getComponent(EnitiyMgr).state = ENTITY_STATE_ENUM.IDLE
            }
        })
    }

    run() {
        console.log('this.currentSate', this.currentSate)
        switch (this.currentSate) {
            case this.stateMachine.get(PARAMS_NAME_TYPE.ATTACK):
            case this.stateMachine.get(PARAMS_NAME_TYPE.IDLE):
            case this.stateMachine.get(PARAMS_NAME_TYPE.DEATH):
                if (this.params.get(PARAMS_NAME_TYPE.DEATH).value) {
                    this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.DEATH)
                    AudioMgr.inst.playOneShot('sound/enemyDeath')
                    EventMgr.Instance.emit(ENUM_EVENT.ENUM_ENEMY_DEATH)
                } else if (this.params.get(PARAMS_NAME_TYPE.ATTACK).value) {
                    this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.ATTACK)
                } else if (this.params.get(PARAMS_NAME_TYPE.IDLE).value) {
                    this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.IDLE)
                }
                else {
                    this.currentSate = this.currentSate
                }
                break;

            default:
                this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.IDLE)
                break;
        }
    }
}