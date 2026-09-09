import { Component, _decorator, Node, resources, SpriteFrame, Sprite, UITransform, Layers, SpriteAtlas } from "cc";
import { TILE_TYPE_ENUM } from "../../Enum";
import levels from "../../Levels";

export const TILE_WIDTH = 55
export const TILE_HEIGHT = 55

const { ccclass, property } = _decorator;
@ccclass('TileManager')
export class TileManager extends Component {
    canMove: boolean
    canTurn: boolean
    type: TILE_TYPE_ENUM

    init(type: TILE_TYPE_ENUM, sp: SpriteFrame, { i, j }: any) {
        this.type = type
        const sprite = this.addComponent(Sprite)
        sprite.spriteFrame = sp

        const transfrom = this.getComponent(UITransform)
        transfrom.setContentSize(TILE_WIDTH, TILE_HEIGHT)

        this.node.setPosition(i * TILE_WIDTH, -j * TILE_HEIGHT)

        if (type === TILE_TYPE_ENUM.WALL_COLUMN || type === TILE_TYPE_ENUM.WALL_LEFT_BOTTOM || type === TILE_TYPE_ENUM.WALL_LEFT_TOP ||
            type === TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM || type === TILE_TYPE_ENUM.WALL_RIGHT_TOP || type === TILE_TYPE_ENUM.WALL_ROW) {
            this.canMove = false
            this.canTurn = false
        } else if (type === TILE_TYPE_ENUM.CLIFF_CENTER || type === TILE_TYPE_ENUM.CLIFF_LEFT || type === TILE_TYPE_ENUM.CLIFF_RIGHT) {
            this.canMove = false
            this.canTurn = true
        } else if (type === TILE_TYPE_ENUM.FLOOR) {
            this.canMove = true
            this.canTurn = true
        }
    }
}