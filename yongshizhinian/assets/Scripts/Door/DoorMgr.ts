import { _decorator, Sprite, SpriteFrame, UITransform, UIOpacity, Tween, tween } from "cc";
import { ENTITY_STATE_ENUM, ENUM_EVENT } from "../../Enum";
import { IEnitiy } from "../../Levels";
import { EnitiyMgr } from "../Base/EnitiyMgr";
import EventMgr from "../Base/EventMgr";
import DataManager from "../Runtime/DataManager";
import { TILE_HEIGHT, TILE_WIDTH } from "../TileMap/TileManager";

const { ccclass, property } = _decorator;
@ccclass('DoorMgr')
export class DoorMgr extends EnitiyMgr {
    staticSpriteFrame: SpriteFrame = null
    private fadeTween: Tween<UIOpacity> = null
    get state() {
        return this._state
    }
    set state(newState: ENTITY_STATE_ENUM) {
        this._state = newState
        this.applyStateVisual()
    }

    async init(params: IEnitiy) {
        await super.init(params)
        const sprite = this.getComponent(Sprite)
        if (sprite && this.staticSpriteFrame) {
            sprite.spriteFrame = this.staticSpriteFrame
        }
        const transform = this.getComponent(UITransform)
        if (transform) {
            transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)
        }
        this.applyStateVisual()
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT)
    }

    private applyStateVisual() {
        const opacityComp = this.getComponent(UIOpacity) || this.addComponent(UIOpacity)
        if (this._state === ENTITY_STATE_ENUM.DEATH) {
            this.node.active = true
            this.fadeTween?.stop()
            // 移除淡出动画，保持门显示
            opacityComp.opacity = 255
            return
        }

        this.fadeTween?.stop()
        this.fadeTween = null
        this.node.active = true
        opacityComp.opacity = 255
    }

    onOpen() {
        if (DataManager.Instance.enemies.every(enemy => enemy.state === ENTITY_STATE_ENUM.DEATH) && this.state != ENTITY_STATE_ENUM.DEATH) {
            this.state = ENTITY_STATE_ENUM.DEATH
        }
    }

    onLoad() {
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_OPEN_DOOR, this.onOpen, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_ENEMY_DEATH, this.onOpen, this)
    }

    onDestroy() {
        super.onDestroy()
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_OPEN_DOOR, this.onOpen)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_ENEMY_DEATH, this.onOpen)
    }


}