import { Component, _decorator, Node } from "cc";
import { ENUM_BOTTOM_CONTROLLER, ENUM_EVENT } from "../../Enum";
import EventMgr from "../Base/EventMgr";
import { loadPool } from "../loadPool";
import { gameConfig } from "../gameConfig";

const { ccclass, property } = _decorator;
@ccclass('MenuMgr')
export class MenuMgr extends Component {
    handlerUndo() {
        EventMgr.Instance.emit(ENUM_EVENT.ENUM_REVOKE_STEP)
    }

    handlerRestart() {
        EventMgr.Instance.emit(ENUM_EVENT.ENUM_RESTART_GAME)
    }

    settingBtn() {
        console.log('settingBtn')
        // 查找Canvas节点作为父节点，确保暂停界面显示在屏幕中间
        let parentNode = this.node;
        while (parentNode && parentNode.name !== 'Canvas') {
            parentNode = parentNode.parent;
        }
        if (!parentNode) {
            parentNode = this.node.parent;
        }
        loadPool.ins.getPoolNode('PauseWnd', parentNode)
    }
}