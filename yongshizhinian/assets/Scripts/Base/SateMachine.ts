import { Component, _decorator, Node, AnimationClip, Animation, SpriteFrame, SpriteAtlas } from "cc";
import { ENUM_EVENT, FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_TYPE } from "../../Enum";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode } from "../Utils";
import State from "./State";
import { SubStateMachine } from "./SubStateMachine";


type ParamsTypeValue = boolean | number

export interface IParamsVaule {
    type: FSM_PARAMS_TYPE_ENUM,
    value: ParamsTypeValue
}

export const getParamsInitTrigger = () => {
    return {
        type: FSM_PARAMS_TYPE_ENUM.TRIGGER,
        value: false
    }
}

export const getParamsInitNumber = () => {
    return {
        type: FSM_PARAMS_TYPE_ENUM.NUMBER,
        value: 0
    }
}

const { ccclass, property } = _decorator;
@ccclass('StateMachine')
export abstract class StateMachine extends Component {
    private _currentSate: State | SubStateMachine = null
    params: Map<string, IParamsVaule> = new Map() //参数列表
    stateMachine: Map<string, State | SubStateMachine> = new Map()  //动画state列表

    animationCom: Animation = null

    waitList: Array<Promise<SpriteAtlas>> = []


    getParams(paramsName: string) {
        if (this.params.has(paramsName)) {
            return this.params.get(paramsName)
        }
    }

    setParams(paramsName: string, value: ParamsTypeValue) {
        if (this.params.has(paramsName)) {
            this.params.get(paramsName).value = value
            this.run()
            this.resetTrigger()
        }
    }

    get currentSate() {
        return this._currentSate
    }

    set currentSate(newSate) {
        this._currentSate = newSate
        this._currentSate.run()
    }

    resetTrigger() {
        for (const [_, data] of this.params) {
            if (data.type == FSM_PARAMS_TYPE_ENUM.TRIGGER) {
                data.value = false
            }
        }
    }

    abstract run(): void
    abstract init(): void
}