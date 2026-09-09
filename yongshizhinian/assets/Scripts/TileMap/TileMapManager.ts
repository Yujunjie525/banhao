import { Component, _decorator, SpriteFrame } from "cc";
import ResourceLoadMgr from "../Base/ResourceLoadMgr";
import DataManager from "../Runtime/DataManager";
// import { DataManagerInstance } from "../Runtime/DataManager";
import { TILE_TYPE_ENUM } from "../../Enum";
import { createNewNode } from "../Utils";
import { TileManager } from "./TileManager";

const { ccclass } = _decorator;
@ccclass('TileMapManager')
export class TileMapManager extends Component {
    start() {

    }

    async init(wallTileSpriteFrame?: SpriteFrame, floorTileSpriteFrame?: SpriteFrame) {
        const spriteAtlas = await ResourceLoadMgr.Instance.loadRes('texture/tile/tile')
        let { mapInfo } = DataManager.Instance
        DataManager.Instance.tileMgrInfo = []

        for (let i = 0; i < mapInfo.length; i++) {
            const colnum = mapInfo[i];
            DataManager.Instance.tileMgrInfo[i] = []
            for (let j = 0; j < colnum.length; j++) {
                const item = colnum[j];
                if (item.src === null || item.type === null) {
                    continue
                }

                let type = item.type
                const node = createNewNode()
                const isWall = type !== TILE_TYPE_ENUM.FLOOR
                const imgSrc = `tile (${item.src})`
                const defaultSp = spriteAtlas.spriteFrames[imgSrc]
                const sp = isWall ? (wallTileSpriteFrame || defaultSp) : (floorTileSpriteFrame || defaultSp)

                const tileManager = node.addComponent(TileManager)
                DataManager.Instance.tileMgrInfo[i][j] = tileManager
                tileManager.init(type, sp, { i, j })
                node.setParent(this.node)
            }
        }
    }
}