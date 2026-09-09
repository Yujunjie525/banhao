import { _decorator, Component, EventTouch, instantiate, Node, NodeEventType, Prefab, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { perBlock } from './prepab/perBlock';
import { layerRootAction } from './layerRootAction';
import { loadRes } from './res/loadRes';
import { gameConfig } from './data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('layerAction1')
export class layerAction1 extends Component {
    // 元素预制体
    @property(Prefab) perBlock: Prefab = null
    // 元素类型
    @property(SpriteFrame) typesArr: SpriteFrame[] = []
    // 元素类型
    @property(SpriteFrame) typesArr2: SpriteFrame[] = []
    nowTypesArr: SpriteFrame[] = []
    // 判断点击和松开否是同一个元素
    curnItemAction: perBlock = null
    protected onLoad(): void {
        // 所加载的主题
        switch (gameConfig.nowPifu) {
            case 1:
                this.nowTypesArr = this.typesArr
                break
            case 2:
                this.nowTypesArr = this.typesArr2
                break
            default:
                this.nowTypesArr = this.typesArr
        }
    }
    start() {
        this.init()
    }
    // 初始化
    init() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }
    // 获取节点下所有元素的个数
    getItemSize() {
        return this.node.children.length
    }
    // 点击开始
    onTouchStart(e: EventTouch) {
        if (this.node.parent.getComponent(layerRootAction).getLayer3Size() >= 7) {
            console.log('游戏失败');
            return
        }
        let pos = e.getUILocation()
        let itemAction = this.getTouchItem(pos)

        this.curnItemAction = itemAction;
        if (this.curnItemAction) {
            this.curnItemAction.startTween()
        }
    }
    onTouchEnd(e: EventTouch) {
        if (this.node.parent.getComponent(layerRootAction).getLayer3Size() >= 7) {
            return
        }
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
        this.node.parent.getComponent(layerRootAction).oneToThree(this.curnItemAction, this.perBlock)
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
    // 开始并初始化游戏
    startGame(level: number) {
        // 从loadRes获取总关卡数
        let totalLevels = 0;
        if (loadRes.ins && loadRes.ins.allJson) {
            for (const key in loadRes.ins.allJson) {
                // 检查键是否为数字（关卡文件名为数字）
                if (!isNaN(Number(key))) {
                    totalLevels++;
                }
            }
        }
        // 确保至少有一个关卡
        totalLevels = Math.max(totalLevels, 1);
        
        if (level <= totalLevels) {
            // 获取关卡json数据
            const levelData = loadRes.ins.getJson(String(level));
            // 随机类型
            let itemTypeArr = this.getRandomIndex(levelData.types)
            // 每个元素生成3的倍数
            let currentIndex = 0
            // 生成元素
            for (let index = 0; index < levelData.list.length; index++) {
                let item = levelData.list[index]
                if (index > 0 && index % 3 == 0) {
                    currentIndex++
                    if (currentIndex >= itemTypeArr.length) {
                        currentIndex = 0
                    }
                }
                let perBlockAction = this.addBlockLocal(new Vec3(item.x, item.y, 0))
                perBlockAction.init(itemTypeArr[currentIndex], this.nowTypesArr)
                perBlockAction.refreshSprite(true)
            }
        } else {
            // 生成个数
            let len = 300 + (level - 40) * 10
            // 随机类型
            let itemTypeArr = this.getRandomIndex(30)
            // 每个元素生成3的倍数
            let currentIndex = 0
            // 生成元素
            for (let index = 0; index < len; index++) {
                // 元素坐标位置
                let x = Math.random() * (290 - -290) + -290;
                let y = Math.random() * (270 - -280) + -280;
                if (index > 0 && index % 3 == 0) {
                    currentIndex++
                    if (currentIndex >= itemTypeArr.length) {
                        currentIndex = 0
                    }
                }
                let perBlockAction = this.addBlockLocal(new Vec3(x, y, 0))
                perBlockAction.init(itemTypeArr[currentIndex], this.nowTypesArr)
                perBlockAction.refreshSprite(true)
            }
        }
        this.showShadow()
        this.randomItem()
    }
    // 随机元素类型
    getRandomIndex(types: number): number[] {
        let arr: number[] = []
        for (let i = 0; i < this.nowTypesArr.length; i++) {
            arr.push(i)
        }
        arr.sort(() => {
            return 0.5 - Math.random()
        })
        arr.splice(0, arr.length - types)
        return arr
    }
    // 打乱顺序
    randomItem() {
        let temp: perBlock[] = []
        for (let item of this.node.children) {
            let action = item.getComponent(perBlock)
            if (!action.node.active) {
                continue
            }
            temp.push(action)
        }
        for (let item2 of temp) {
            let other = temp[Math.floor(Math.random() * temp.length)]

            let otherIndex = other.getSpriteIndex()
            other.setSpriteIndex(item2.getSpriteIndex())
            item2.setSpriteIndex(otherIndex)
            other.refreshSprite(true)
            item2.refreshSprite(true)
        }
    }
    // 在节点下生成预制体
    addBlockWorld(pos: Vec3): perBlock {
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(pos)
        return this.addBlockLocal(local)
    }
    addBlockLocal(pos: Vec3) {
        let item = instantiate(this.perBlock)
        item.setPosition(pos)
        item.parent = this.node
        return item.getComponent(perBlock)
    }
    // 更新重叠阴影
    showShadow() {
        for (let i = 0; i < this.node.children.length; i++) {
            let item1 = this.node.children[i].getComponent(perBlock)
            if (!item1.node.active) {
                continue
            }
            item1.hideZhezhao()
            for (let j = i + 1; j < this.node.children.length; j++) {
                let item2 = this.node.children[j].getComponent(perBlock)
                if (!item2.node.active) {
                    continue
                }
                if (item1.getItemBox().intersects(item2.getCusiomBox())) {
                    item1.showZhezhao()
                    break
                }
            }
        }
    }
    //删除选中的元素
    subtractBlock(pos: Vec3) {
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(pos)
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            if (this.node.children[i].getComponent(perBlock).getItemBox().contains(new Vec2(local.x, local.y))) {
                this.node.children[i].removeFromParent()
            }
        }
    }
    // 获取节点下的所有子节点
    getChidren() {
        return this.node.children
    }
    // 清除全部节点
    delAll() {
        this.node.removeAllChildren()
    }

}


