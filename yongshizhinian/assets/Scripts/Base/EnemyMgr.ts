/**木骷髅管理器 */
import { Component, _decorator, Node, Sprite, UITransform, Animation, SpriteAtlas, AnimationClip, animation, SpriteFrame, Texture2D, math } from "cc";
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT } from "../../Enum";
import { IEnitiy } from "../../Levels";
import DataManager from "../Runtime/DataManager";
import { EnitiyMgr } from "./EnitiyMgr";
import EventMgr from "./EventMgr";

const { ccclass, property } = _decorator;
@ccclass('EnemyMgr')
export class EnemyMgr extends EnitiyMgr {

    async init(params: IEnitiy) {
        super.init(params)

        this.onChangeDirection(true)
    }
    /***
     * 根据玩家在敌人的象限改变敌人的朝向
     */
    onChangeDirection(init = false) {
        if (!DataManager.Instance.playerInfo)
            return
        if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.playerInfo)
            return

        const { x: playerX, y: playerY } = DataManager.Instance.playerInfo
        const disX = Math.abs(this.x - playerX)
        const disY = Math.abs(this.y - playerY)

        //确保敌人在初始化的时候调整一次direction
        if (disX === disY && !init) {
            return
        }
        console.log('改变方向 朝向!!!!')
        //第一象限
        if (playerX >= this.x && playerY <= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.TOP

            //第二象限
        } else if (playerX <= this.x && playerY <= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.TOP

            //第三象限
        } else if (playerX <= this.x && playerY >= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.BOTTOM

            //第四象限
        } else if (playerX >= this.x && playerY >= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.BOTTOM
        }
    }

    onDeath(id: string) {
        if (this.state === ENTITY_STATE_ENUM.DEATH) {
            return
        }
        if (this.id === id) {
            this.state = ENTITY_STATE_ENUM.DEATH
        }
    }

    onLoad() {
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onChangeDirection, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_PLAYER_BORN, this.onChangeDirection, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_ATTACK_ENEMY, this.onDeath, this)
    }

    onDestroy() {
        super.onDestroy()
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_MOVE_END, this.onChangeDirection)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_PLAYER_BORN, this.onChangeDirection)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_ATTACK_ENEMY, this.onDeath)
    }


}