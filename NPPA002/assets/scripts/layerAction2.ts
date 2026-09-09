import { _decorator, Component, EventTouch, math, Node, NodeEventType, UITransform, Vec2, Vec3 } from 'cc';
import { perBlock } from './prepab/perBlock';
import { layerRootAction } from './layerRootAction';
const { ccclass, property } = _decorator;

@ccclass('layerAction2')
export class layerAction2 extends Component {
    // 判断点击和松开否是同一个元素
    curnItemAction = null
    start() {
        this.init()
    }
    // 初始化
    init() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }
    // 点击开始
    onTouchStart(e: EventTouch) {
        let pos = e.getUILocation()
        let itemAction = this.getTouchItem(pos)

        this.curnItemAction = itemAction;
        if (this.curnItemAction) {
            this.curnItemAction.startTween()
        }
    }

    onTouchEnd(e: EventTouch) {
        let pos = e.getUILocation()
        if (this.curnItemAction) {
            this.curnItemAction.endTween()
        } else {
            return
        }
        let itemAction = this.getTouchItem(pos)
        if (this.curnItemAction != itemAction) {
            return
        }
        this.curnItemAction.setTempPos(this.curnItemAction.node.getWorldPosition())
        this.node.parent.getComponent(layerRootAction).twoToThree(this.curnItemAction)
    }
    // 点击元素逻辑
    getTouchItem(worldPos: Vec2): perBlock {
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0))
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let item = this.node.children[i]
            if (!item.active) {
                continue
            }
            let itemAction = item.getComponent(perBlock)
            if (!itemAction.isTouch) {
                continue
            }
            let xiangjiao = item.getComponent(UITransform).getBoundingBox()
                .contains(new Vec2(local.x, local.y))
            if (xiangjiao) {
                return itemAction
            }
        }
        return null
    }
    perBlock(curnItemAction: any, perBlock: any) {
        throw new Error('Method not implemented.');
    }
    // 获取节点下所有元素的个数
    getItemSize() {
        return this.node.children.length
    }
    // 获取移出放置节点的坐标
    getWorldPos() {
        return this.node.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0))
    }
    // 将移出的节点添加在这里
    addItem(itemAction: perBlock) {
        itemAction.node.setPosition(0, 0)
        itemAction.node.parent = this.node
    }
    // 清除全部节点
    delAll() {
        this.node.removeAllChildren()
    }

}


