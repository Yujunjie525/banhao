import { _decorator, Component, director, EventMouse, EventTouch, instantiate, Node, NodeEventType, Prefab, Size, UI, UITransform, Vec2, Vec3 } from 'cc';
import { layerAction1 } from '../layerAction1';
import { gameConfig } from '../data/gameConfig';
import { emits } from '../data/enmus';
import { editCtl } from '../editCtl';
const { ccclass, property } = _decorator;

@ccclass('editAction')
export class editAction extends Component {
    // 小黑点预制体
    @property(Prefab) perGrid: Prefab = null
    // 元素块父节点的脚本
    @property(layerAction1) layerAction1: layerAction1 = null;
    curGrid = null
    // 方便自定义格子位置
    isOnce = true
    x = null
    y = null
    protected onEnable(): void {
        this.init()
        this.initGrind()
    }

    update(deltaTime: number) {

    }
    init() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(NodeEventType.MOUSE_MOVE, this.mouseMove, this)
    }
    // 初始化并生成编辑器节点
    initGrind() {
        this.node.removeAllChildren()
        let startX = this.node.getComponent(UITransform).width / 2 * -1
        let startY = this.node.getComponent(UITransform).height / 2

        for (let i = 0; i < 15; i++) {
            let x = startX + (38.5 * (i + 1))
            for (let j = 0; j < 16; j++) {
                let y = startY + (40 * (j + 1) * -1)
                this.addGrid(x, y)
            }
        }
    }
    // 添加网格节点
    addGrid(x, y, size?: Size) {
        let grid = instantiate(this.perGrid)
        grid.parent = this.node
        grid.setPosition(x, y)
        if (size) {
            grid.getComponent(UITransform).setContentSize(size)
        }
    }
    // 点击
    onTouchStart(e: EventTouch) {
        let uipos = e.getUILocation()
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(uipos.x, uipos.y, 0))
        switch (gameConfig.editModel) {
            // 添加元素
            case 1:
                for (let i = this.node.children.length - 1; i > 0; i--) {
                    let grid = this.node.children[i]
                    if (this.curGrid == grid) {
                        continue
                    }
                    if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(localPos.x, localPos.y))) {
                        this.curGrid = grid
                        this.layerAction1.addBlockWorld(grid.getWorldPosition())
                        this.layerAction1.showShadow()
                        break
                    }
                }
                director.emit(emits.updateSize)
                break
            // 删除元素
            case 2:
                this.layerAction1.subtractBlock(new Vec3(uipos.x, uipos.y))
                // 重新刷新一遍遮罩
                this.layerAction1.showShadow()
                director.emit(emits.updateSize)
                break
            // 添加网格点
            case 3:
                // 可以设置横向添加还是纵向添加
                if (this.isOnce) {
                    this.x = localPos.x
                    this.y = localPos.y
                    this.isOnce = false
                } else {
                    console.log(this.x, this.y);
                    this.x += 10
                }
                this.addGrid(this.x, this.y, new Size(10, 10))
                break
            // 删除网格点
            case 4:
                this.isOnce = true
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    let grid = this.node.children[i]
                    if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(localPos.x, localPos.y))) {
                        grid.removeFromParent()
                    }
                }
                break
        }
    }
    // 手指移动时
    onTouchMove(e: EventTouch) {
        let uipos = e.getUILocation()
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(uipos.x, uipos.y, 0))
        if (gameConfig.editModel != 1) {
            return
        }
        for (let i = this.node.children.length - 1; i > 0; i--) {
            let grid = this.node.children[i]
            if (this.curGrid == grid) {
                continue
            }
            if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(localPos.x, localPos.y))) {
                this.curGrid = grid
                this.layerAction1.addBlockWorld(grid.getWorldPosition())
                this.layerAction1.showShadow()
                director.emit(emits.updateSize)
                break
            }
        }

    }
    // 鼠标移动时
    mouseMove(e: EventMouse) {
        let x = e.getUILocation().x;
        let y = e.getUILocation().y;
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(x, y))
        // this.editCtl.setPos(Math.floor(local.x), Math.floor(local.y))
        this.node.parent.getChildByName('editCtl').getComponent(editCtl).setPos(Math.floor(local.x), Math.floor(local.y))
    }
}



