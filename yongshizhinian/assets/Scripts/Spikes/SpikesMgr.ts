/**地刺管理器 */
import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENITIY_TYPE_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, ENUM_BOTTOM_CONTROLLER, PARAMS_NAME_TYPE, ENITIY_TYPE_SPIKES_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from "../../Enum";
import levels, { IEnitiy, ILevel, ISpikes } from "../../Levels";
import EventMgr from "../Base/EventMgr";
import ResourceLoadMgr from "../Base/ResourceLoadMgr";
import DataManager from "../Runtime/DataManager";
import { TILE_HEIGHT, TILE_WIDTH } from "../TileMap/TileManager";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode, randomNameByLen } from "../Utils";
import { PlayerStateMachine } from "../Player/PlayerStateMachine";
import { StateMachine } from "../Base/SateMachine";
import { SpikeStateMachine } from "./SpikeStateMachine";

export const MOVE_SPEED = 1 / 10

const { ccclass, property } = _decorator;
@ccclass('SpikesMgr')
export class SpikesMgr extends Component {
    id: string = randomNameByLen(12)
    x: number = 0
    y: number = 0

    fsm: StateMachine = null

    private _count: number
    private _totalCount: number

    private _state: ENTITY_STATE_ENUM
    private _type: ENITIY_TYPE_SPIKES_ENUM

    get count() {
        return this._count
    }
    set count(newCount) {
        this._count = newCount
        if (this.fsm) {
            this.fsm.setParams(PARAMS_NAME_TYPE.SPIKES_CUR_COUNT, newCount)
        }
    }

    get totalCount() {
        return this._totalCount
    }
    set totalCount(newTotalCount) {
        this._totalCount = newTotalCount
        if (this.fsm) {
            this.fsm.setParams(PARAMS_NAME_TYPE.SPIKES_TOTAL_COUNT, newTotalCount)
        }
    }

    get type() {
        return this._type
    }
    set type(newType) {
        this._type = newType
    }

    async init(params: ISpikes) {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.node.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        this.fsm = this.addComponent(SpikeStateMachine)
        await this.fsm.init()

        this.x = params.x
        this.y = params.y

        this._type = params.type
        this.totalCount = SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM[this._type]
        this.count = params.count
    }
    onChangeCount() {
        if (this.count === this.totalCount) {
            this.count = 1
        } else {
            this.count++
        }

        this.onAttack()
    }

    countToZero() {
        this.count = 0
    }

    onAttack() {
        if (!DataManager.Instance.playerInfo)
            return

        const { x: playerX, y: playerY } = DataManager.Instance.playerInfo
        if (this.x === playerX && this.y === playerY && this.count === this.totalCount) {
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_PLAYER_DEATH, ENTITY_STATE_ENUM.DEATH)
        }
    }
    onLoad() {
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onChangeCount, this)
    }

    onDestroy() {
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onChangeCount)
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
    }
}