import { _decorator, Component, instantiate, Node, Prefab, tween, UI, UITransform, Vec3 } from 'cc';
import { perBlock } from './prepab/perBlock';
import { audioTool } from './untils/audioTool';
import { bgmName } from './data/enmus';
const { ccclass, property } = _decorator;

@ccclass('layerAction3')
export class layerAction3 extends Component {
    // 槽位
    @property(Node) slotArr: Node[] = []
    // 槽位
    @property(Prefab) xiaochuTx: Prefab = null
    // 排序数组
    orderList: perBlock[] = []
    // 获取节点下所有元素的个数
    getItemSize() {
        return this.orderList.length
    }
    //获取最后选中的那个元素
    getEndItem(): perBlock {
        let ret: perBlock = null
        for (let item of this.orderList) {
            if (!ret) {
                ret = item
            } else {
                if (item.getAddLayer3() > ret.getAddLayer3()) {
                    ret = item
                }
            }
        }
        if (ret) {
            let index = this.orderList.indexOf(ret)
            if (index >= 0) {
                this.orderList.splice(index, 1)
                ret.setTempPos(ret.node.getWorldPosition())
                ret.node.removeFromParent()
            }
        }
        return ret
    }
    // 移出元素
    getRemoveItem() {
        let temp: perBlock[] = []
        for (let item of this.orderList) {
            temp.push(item)
            if (temp.length >= 3) {
                break
            }
        }
        for (let item of temp) {
            let index = this.orderList.indexOf(item)
            if (index >= 0) {
                this.orderList.splice(index, 1)
                item.setTempPos(item.node.getWorldPosition())
                item.node.removeFromParent()
            }
        }
        return temp
    }
    // 获取选中元素应该移动得位置
    getSlotPos(action: perBlock): Vec3 {
        let temp: perBlock[] = []
        let find: boolean = false
        let insertComplete: boolean = false
        for (let item of this.orderList) {
            if (item.getSpriteIndex() == action.getSpriteIndex()) {
                find = true
                temp.push(item)
            } else {
                if (find && !insertComplete) {
                    temp.push(action)
                    insertComplete = true
                }
                temp.push(item)
            }
        }
        if (!insertComplete) {
            temp.push(action)
        }
        this.orderList.splice(0, this.orderList.length);
        this.orderList = temp
        this.restOrder()
        return this.node.getComponent(UITransform).convertToWorldSpaceAR(action.getTempPos())
    }

    restOrder() {
        for (let i = 0; i < this.orderList.length; i++) {
            let item = this.orderList[i]
            item.setTempPos(this.slotArr[i].getPosition());
            if (item.node.getParent() == this.node) {
                tween(item.node).to(0.1, { position: item.getTempPos() }).start()
            }
        }
    }
    // 将元素添加到这个节点
    add(action: perBlock) {
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(action.node.getWorldPosition())
        action.node.setParent(this.node)
        action.node.setPosition(localPos)
        action.setAddLayer3()
    }
    // 删除相同的
    delItem(): boolean {
        let temp: perBlock[] = []
        for (let item of this.orderList) {
            if (temp.length == 0) {
                temp.push(item)
            } else {
                if (temp[0].getSpriteIndex() == item.getSpriteIndex()) {
                    temp.push(item)
                } else {
                    temp.splice(0, temp.length)
                    temp.push(item)
                }
            }
            if (temp.length >= 3) {
                break
            }
        }
        if (temp.length >= 3) {
            // 消除音效
            audioTool.ins.playSound(bgmName.sound_clean)
            for (let item of temp) {
                // 消除特效
                let xiaochuTx = instantiate(this.xiaochuTx)
                xiaochuTx.setParent(this.node)
                xiaochuTx.setPosition(item.node.getPosition())
                tween(xiaochuTx).delay(0.4).removeSelf().start()
                // 
                let index = this.orderList.indexOf(item)
                this.orderList.splice(index, 1)
                item.node.removeFromParent()
                item.original?.node.removeFromParent()
            }
            this.scheduleOnce(() => {
                this.restOrder()
            }, 0.3)
            return true
        }
        return false
    }
    // 清除全部节点
    delAll() {
        for (let item of this.orderList) {
            item.node.removeFromParent()
        }
        this.orderList.splice(0, this.orderList.length)
    }

}


