/**木骷髅管理器 */
import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE } from "../../../Enum";
import { IEnitiy } from "../../../Levels";
import { EnemyMgr } from "../../Base/EnemyMgr";
import { EnitiyMgr } from "../../Base/EnitiyMgr";
import EventMgr from "../../Base/EventMgr";
import { PlayerStateMachine } from "../../Player/PlayerStateMachine";
import DataManager from "../../Runtime/DataManager";
import { IronStateMachine } from "./IronStateMachine";

export const MOVE_SPEED = 1 / 10

const { ccclass, property } = _decorator;
@ccclass('IronMgr')
export class IronMgr extends EnemyMgr {

    async init(params: IEnitiy) {
        this.fsm = this.addComponent(IronStateMachine)
        await this.fsm.init()
        super.init(params)
    }
}