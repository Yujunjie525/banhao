import { Component, _decorator, Node, AnimationClip, Animation, SpriteFrame, SpriteAtlas } from "cc";
import { ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_TYPE, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM } from "../../Enum";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { EnitiyMgr } from "../Base/EnitiyMgr";
import { getParamsInitNumber, getParamsInitTrigger, StateMachine } from "../Base/SateMachine";
import State from "../Base/State";
import DeathSubStateMachine from "./DeathSubStateMachine";
import IdleSubStateMachine from "./IdleSubStateMachine";


const { ccclass, property } = _decorator;
@ccclass('DoorStateMachine')
export class DoorStateMachine extends StateMachine {
    async init() {
        this.animationCom = this.addComponent(Animation)

        this.initParams()
        this.initSateMachine()
        this.addAnimationEvent()

        await Promise.all(this.waitList)
    }

    initParams() {
        this.params.set(PARAMS_NAME_TYPE.IDLE, getParamsInitTrigger())
        this.params.set(PARAMS_NAME_TYPE.DEATH, getParamsInitTrigger())
        this.params.set(PARAMS_NAME_TYPE.DIRECTION, getParamsInitNumber())
    }

    initSateMachine() {
        this.stateMachine.set(PARAMS_NAME_TYPE.IDLE, new IdleSubStateMachine(this))
        this.stateMachine.set(PARAMS_NAME_TYPE.DEATH, new DeathSubStateMachine(this))
    }

    addAnimationEvent() {

    }

    run() {
        switch (this.currentSate) {
            case this.stateMachine.get(PARAMS_NAME_TYPE.TURNLEFT):
            case this.stateMachine.get(PARAMS_NAME_TYPE.BLOCKFRONT):
            case this.stateMachine.get(PARAMS_NAME_TYPE.BLOCKTURNLEFT):

            case this.stateMachine.get(PARAMS_NAME_TYPE.IDLE):
                if (this.params.get(PARAMS_NAME_TYPE.IDLE).value) {
                    this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.IDLE)
                } else if (this.params.get(PARAMS_NAME_TYPE.DEATH).value) {
                    this.currentSate = this.stateMachine.get(PARAMS_NAME_TYPE.DEATH)
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