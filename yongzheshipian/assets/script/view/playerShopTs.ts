import { _decorator, Component, director, EventTouch, Node, NodeEventType, UITransform, Vec2, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { nodePool } from '../utils/nodePool';
import { itemTs } from '../utils/itemTs';
import { emits, localData } from '../data/enums';
import { save } from '../utils/tools';
const { ccclass, property } = _decorator;

@ccclass('playerShopTs')
export class playerShopTs extends Component {
    private listNode = null
    protected onEnable(): void {
        this.init()
    }
    // 返回按钮
    backBtn() {
        this.node.getChildByName('list').removeAllChildren()
        this.node.active = false
    }
    // 初始化
    init() {
        this.listNode = this.node.getChildByName('list')
        director.on(emits.queren, this.queren, this)
        this.creatItem()
    }

    // 生成列表
    creatItem() {
        let nowList = gameConfig.playerList[gameConfig.page]
        for (let i = 0; i < nowList.length; i++) {
            let item = nodePool.ins.getPoolNode('item', this.listNode)
            let itemTs: any = item.getComponent('itemTs')
            itemTs.type = nowList[i].type
            itemTs.isJiesuo = nowList[i].isJiesuo
            itemTs.price = nowList[i].price
            itemTs.index = i
            itemTs.init()
            itemTs.create()
        }
    }
    // 确认购买
    queren() {
        // 当前列表下的子节点
        let children = this.listNode.children
        // 获取当前购买的子节点脚本
        let ts = children[gameConfig.dianjiType].getComponent(itemTs)
        if (gameConfig.jinbiNum < ts.price) {
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '金币不足')
            return
        }
        gameConfig.jinbiNum = Math.max(0, gameConfig.jinbiNum - ts.price)
        gameConfig.playerList[gameConfig.page][gameConfig.dianjiType].isJiesuo = 1
        ts.isJiesuo = 1
        // 本地存储
        save(localData.jinbiNum, gameConfig.jinbiNum)
        save(localData.playerList, gameConfig.playerList)
        // 更新节点的显示状态和更新金币数字
        director.emit(emits.playListInit)
        director.emit(emits.initNum)
        nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
        director.emit(emits.tips, '购买成功')
    }

    // 右按钮
    leftBtn() {
        gameConfig.page -= 1
        if (gameConfig.page < 0) {
            gameConfig.page = 0
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '没有更多了')
            return
        }
        this.node.getChildByName('list').removeAllChildren()
        this.creatItem()
    }
    // 左按钮
    rightBtn() {
        gameConfig.page += 1
        if (gameConfig.page > 1) {
            gameConfig.page = 1
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '没有更多了')
            return
        }
        this.node.getChildByName('list').removeAllChildren()
        this.creatItem()
    }
}


