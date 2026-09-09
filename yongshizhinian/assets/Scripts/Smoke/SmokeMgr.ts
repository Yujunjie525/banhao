import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math, TiledUserNodeData } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE } from "../../Enum";
import { IEnitiy, ISmoke } from "../../Levels";
import { EnitiyMgr } from "../Base/EnitiyMgr";
import EventMgr from "../Base/EventMgr";
import { PlayerStateMachine } from "../Player/PlayerStateMachine";
import DataManager from "../Runtime/DataManager";
import { SmokeStateMachine } from "./SmokeStateMachine";

export const MOVE_SPEED = 1 / 10

const { ccclass, property } = _decorator;
@ccclass('SmokeMgr')
export class SmokeMgr extends EnitiyMgr {

    async init(params: IEnitiy) {
        this.fsm = this.addComponent(SmokeStateMachine)
        await this.fsm.init()

        super.init(params)
    }

    onLoad() {
        super.onLoad()
    }

    onDestroy() {
        super.onDestroy()
    }


}