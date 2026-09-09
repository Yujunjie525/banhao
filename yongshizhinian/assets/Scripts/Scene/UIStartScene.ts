import { Component, _decorator, Node, director } from "cc";
import { DIRECTION_ENUM, ENITIY_TYPE_ENUM, ENITIY_TYPE_SPIKES_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, SCENE_ENUM } from "../../Enum";
import levels, { ILevel } from "../../Levels";
import EventMgr from "../Base/EventMgr";
import { BurstMgr } from "../Burst/BurstMgr";
import { DoorMgr } from "../Door/DoorMgr";
import { IronMgr } from "../Enemy/Iron/IronMgr";
import { WoodenMgr } from "../Enemy/Wooden/WoodenMgr";
import { PlayerMrg } from "../Player/PlayerMgr";
import DataManager, { IRecord } from "../Runtime/DataManager";
import FadeMgr from "../Runtime/FadeMgr";
import { ShakeManager } from "../Runtime/ShakeManager";
import { SmokeMgr } from "../Smoke/SmokeMgr";
import { SpikesMgr } from "../Spikes/SpikesMgr";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode } from "../Utils";

const TILE_WIDTH = 55
const TILE_HEIGHT = 55
const { ccclass, property } = _decorator;
@ccclass('UIStartScene')
export class UIStartScene extends Component {

    async onLoad() {
        director.preloadScene(SCENE_ENUM.LOADING)

        // FadeMgr.Instance.fader.fadeOut(1000)
        this.node.once(Node.EventType.TOUCH_START, this.handlerStart, this)
    }

    async handlerStart() {
        // await FadeMgr.Instance.fader.fadeIn(300)
        director.loadScene(SCENE_ENUM.LOADING)
    }

    onDestroy() {

    }
}
