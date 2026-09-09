import { Component, _decorator, Node, AnimationClip, Animation, SpriteFrame, SpriteAtlas } from "cc";
import { ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_TYPE } from "../../Enum";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode } from "../Utils";
import { StateMachine } from "./SateMachine";
import State from "./State";


const { ccclass, property } = _decorator;
@ccclass('SubStateMachine')
export abstract class SubStateMachine {
    constructor(public fsm: StateMachine) { }
    private _currentSate: State = null
    stateMachine: Map<string, State> = new Map()  //动画state列表

    get currentSate() {
        return this._currentSate
    }

    set currentSate(newSate) {
        this._currentSate = newSate
        this._currentSate.run()
    }

    abstract run(): void
}