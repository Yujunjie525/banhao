/**木骷髅管理器 */
import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE } from "../../../Enum";
import { IEnitiy } from "../../../Levels";
import { EnemyMgr } from "../../Base/EnemyMgr";
import { EnitiyMgr } from "../../Base/EnitiyMgr";
import EventMgr from "../../Base/EventMgr";
import { PlayerStateMachine } from "../../Player/PlayerStateMachine";
import DataManager from "../../Runtime/DataManager";
import { WoodenStateMachine } from "./WoodenStateMachine";

export const MOVE_SPEED = 1 / 10
const WOODEN_SCALE = 0.8

const { ccclass, property } = _decorator;
@ccclass('WoodenMgr')
export class WoodenMgr extends EnemyMgr {

    async init(params: IEnitiy) {
        this.fsm = this.addComponent(WoodenStateMachine)
        await this.fsm.init()
        super.init(params)
        this.node.setScale(WOODEN_SCALE, WOODEN_SCALE, 1)
    }

    checkAttack() {
        if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.playerInfo)
            return

        const { x: playerX, y: playerY, state: playerState } = DataManager.Instance.playerInfo
        const disX = Math.abs(this.x - playerX)
        const disY = Math.abs(this.y - playerY)

        if (playerState == ENTITY_STATE_ENUM.DEATH || playerState == ENTITY_STATE_ENUM.AIRDEATH)
            return

        if ((this.x === playerX && disY <= 1) || (this.y === playerY && disX <= 1)) {
            this.state = ENTITY_STATE_ENUM.ATTACK
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_PLAYER_DEATH, ENTITY_STATE_ENUM.DEATH)
        } else {
            this.state = ENTITY_STATE_ENUM.IDLE
        }
    }

    onLoad() {
        super.onLoad()
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_MOVE_END, this.checkAttack, this)
    }

    onDestroy() {
        super.onDestroy()
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_MOVE_END, this.checkAttack)
    }


}
