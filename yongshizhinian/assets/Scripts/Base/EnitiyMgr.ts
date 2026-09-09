import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE } from "../../Enum";
import levels, { IEnitiy, ILevel } from "../../Levels";
import EventMgr from "../Base/EventMgr";
import ResourceLoadMgr from "../Base/ResourceLoadMgr";
import DataManager from "../Runtime/DataManager";
import { TILE_HEIGHT, TILE_WIDTH } from "../TileMap/TileManager";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode, randomNameByLen } from "../Utils";
import { PlayerStateMachine } from "../Player/PlayerStateMachine";
import { StateMachine } from "./SateMachine";

export const MOVE_SPEED = 1 / 10

const { ccclass, property } = _decorator;
@ccclass('EnitiyMgr')
export class EnitiyMgr extends Component {
    id: string = randomNameByLen(12)
    x: number = 0
    y: number = 0

    fsm: StateMachine = null

    _direction: DIRECTION_ENUM
    _state: ENTITY_STATE_ENUM
    _type: ENITIY_TYPE_ENUM

    get direction() {
        return this._direction
    }
    set direction(newDirection) {
        this._direction = newDirection
        if (this.fsm) {
            this.fsm.setParams(PARAMS_NAME_TYPE.DIRECTION, DIRECTION_ORDER_ENUM[this._direction])
        }
    }

    get state() {
        return this._state
    }
    set state(newState) {
        this._state = newState
        if (this.fsm) {
            this.fsm.setParams(this.state, true)
        }
    }

    get type() {
        return this._type
    }
    set type(newType) {
        this._type = newType
    }

    async init(params: IEnitiy) {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.node.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.x = params.x
        this.y = params.y
        this.direction = params.direction
        this.state = params.state
        this.type = params.type
    }

    onLoad() {

    }

    onDestroy() {

    }

    update() {
        const transform = this.node.getComponent(UITransform)
        const { x: scaleX, y: scaleY } = this.node.scale

        let posX = this.x * TILE_WIDTH - TILE_WIDTH * 1.5
        let posY = -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5

        // Keep scaled entities visually centered on the tile even though entity nodes use a top-left anchor.
        if (transform && (scaleX !== 1 || scaleY !== 1)) {
            posX += transform.width * (1 - scaleX) / 2
            posY -= transform.height * (1 - scaleY) / 2
        }

        this.node.setPosition(posX, posY)
    }
}
