/**陷阱管理器 */
import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math, TiledUserNodeData } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE } from "../../Enum";
import { IEnitiy } from "../../Levels";
import { EnitiyMgr } from "../Base/EnitiyMgr";
import EventMgr from "../Base/EventMgr";
import { PlayerStateMachine } from "../Player/PlayerStateMachine";
import DataManager from "../Runtime/DataManager";
import { TILE_HEIGHT, TILE_WIDTH } from "../TileMap/TileManager";
import { BurstStateMachine } from "./BurstStateMachine";

export const MOVE_SPEED = 1 / 10

const { ccclass, property } = _decorator;
@ccclass('BurstMgr')
export class BurstMgr extends EnitiyMgr {

    async init(params: IEnitiy) {
        this.fsm = this.addComponent(BurstStateMachine)
        await this.fsm.init()

        super.init(params)
        const transform = this.node.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)
    }

    onAttack() {
        const { x: playerX, y: playerY } = DataManager.Instance.playerInfo
        if (playerX == this.x && playerY == this.y && this.state === ENTITY_STATE_ENUM.IDLE) {
            this.state = ENTITY_STATE_ENUM.ATTACK
        } else if (this.state === ENTITY_STATE_ENUM.ATTACK) {
            this.state = ENTITY_STATE_ENUM.DEATH
            if (this.x === playerX && this.y === playerY) {
                EventMgr.Instance.emit(ENUM_EVENT.ENUM_PLAYER_DEATH, ENTITY_STATE_ENUM.AIRDEATH)
                console.log('陷阱攻击敌人')
            }
        }
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT)
    }

    onLoad() {
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onAttack, this)
    }

    onDestroy() {
        super.onDestroy()
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onAttack)
    }


}