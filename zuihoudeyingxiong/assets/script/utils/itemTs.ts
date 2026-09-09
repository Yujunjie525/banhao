import { _decorator, Component, director, Label, Node, NodeEventType, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { nodePool } from './nodePool';
import { emits, localData } from '../data/enums';
import { getScopedSelectTypeKey, save } from './tools';
const { ccclass, property } = _decorator;

@ccclass('itemTs')
export class itemTs extends Component {
    @property(Label) priceLab: Label = null
    type: number = 1
    isJiesuo: number = 0
    price: number = 100
    index: number = 0
    protected onEnable(): void {
        director.on(emits.playListInit, this.init, this)
    }
    init() {
        // 选择标志是否显示
        if (this.type == gameConfig.slectType && this.isJiesuo) {
            this.node.getChildByName('selectTip').active = true
            this.node.getChildByName('selectTip').active = true
        } else {
            this.node.getChildByName('selectTip').active = false
        }
        // 价格是否显示
        if (this.isJiesuo) {
            this.node.getChildByName('price').active = false
            this.node.getChildByName('isJiesuo').active = true
        } else {
            this.node.getChildByName('price').active = true
            this.node.getChildByName('isJiesuo').active = false
        }
        // 价格
        this.priceLab.string = String(this.price)
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
    }
    // 开始点击
    onTouchStart() {
        gameConfig.dianjiType = this.index
        if (this.isJiesuo) {
            gameConfig.slectType = this.type
            this.init()
            save(localData.page, gameConfig.page)
            save(getScopedSelectTypeKey(), gameConfig.slectType)
            director.emit(emits.playListInit)
        } else {
            if (gameConfig.jinbiNum >= this.price) {
                nodePool.ins.getPoolNode('querenTip', gameConfig.homeRoot)
            } else {
                nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
                director.emit(emits.tips, '勋章不足')
            }
        }
    }
    create() {
        nodePool.ins.getPoolNode(`player${this.type}`, this.node, new Vec3(9, 6, 0))
    }
    // 销毁组件
    protected onDestroy(): void {
        this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this)
        director.off(emits.playListInit, this.init, this)
    }
}


