import { _decorator, Component, director, instantiate, Node, Prefab, Rect, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { audioTool } from '../untils/audioTool';
import { bgmName, emits } from '../data/enmus';
const { ccclass, property } = _decorator;

@ccclass('perBlock')
export class perBlock extends Component {
    // 样式索引
    private spriteIndex: number = 0
    // 样式数组
    private typesArray: SpriteFrame[] = []
    // 元素位置
    private tempPos: Vec3 = null
    original: perBlock = null
    // 选中时间
    private timeAddLayer3: number = 0
    // 是否可以点击
    isTouch: boolean = false

    isTouchBtn(val: boolean) {
        this.isTouch = val
    }
    // 设置包围盒
    getItemBox() {
        return this.node.getComponent(UITransform).getBoundingBox()
    }
    getCusiomBox() {
        let rec1 = this.getItemBox();
        let val = 3;
        let rect2 = new Rect(rec1.x, rec1.y + val, rec1.width - val * 2, rec1.height - val * 2)
        return rect2
    }
    // 隐藏/显示遮罩
    hideZhezhao() {
        this.isTouch = true
        this.node.getChildByName('yinying').active = false
    }
    showZhezhao() {
        this.isTouch = false
        this.node.getChildByName('yinying').active = true
    }
    // 初始化元素样式
    init(index: number, array: SpriteFrame[]) {
        this.spriteIndex = index
        this.typesArray = array
    }
    // 更换随机样式
    refreshSprite(isTween: boolean) {
        if (isTween) {
            this.tempPos = this.node.getPosition()
            tween(this.node).to(0.15, { position: new Vec3(0, 0, 0) }).call(() => {
                this.node.getChildByName('itemType').getComponent(Sprite).spriteFrame = this.typesArray[this.spriteIndex]
            }).to(0.2, { position: this.tempPos }).start()
        } else {
            this.node.getChildByName('itemType').getComponent(Sprite).spriteFrame = this.typesArray[this.spriteIndex]
        }
    }
    // 返回当前元素得类型索引
    getSpriteIndex(): number {
        return this.spriteIndex
    }
    setSpriteIndex(val: number) {
        this.spriteIndex = val
    }
    // 点击动画
    startTween() {
        audioTool.ins.playSound(bgmName.sound_click)
        tween(this.node).to(0.02, { scale: new Vec3(1.2, 1.2, 1) }).start()
    }
    endTween() {
        tween(this.node).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
    }
    // 克隆元素
    cloneItem(parent: Node, perItem: Prefab) {
        let newItem = instantiate(perItem)
        let action = newItem.getComponent(perBlock)
        newItem.setParent(parent)
        let worldPos = this.node.getWorldPosition()
        let parentLocalPos = parent.getComponent(UITransform).convertToNodeSpaceAR(worldPos)
        newItem.setPosition(parentLocalPos)
        action.hideZhezhao()
        action.init(this.spriteIndex, this.typesArray)
        action.refreshSprite(false)
        action.original = this
        // 原本得隐藏
        this.node.active = false
        return action
    }
    // 修改坐标位置
    getTempPos() {
        return this.tempPos
    }
    setTempPos(pos: Vec3) {
        this.tempPos = pos
    }
    // 选中时间
    setAddLayer3() {
        this.timeAddLayer3 = new Date().getTime()
    }
    getAddLayer3(): number {
        return this.timeAddLayer3
    }
}


