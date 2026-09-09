import { _decorator, Color, Component, director, EditBox, EventTouch, Label, Node, NodeEventType, Size, UITransform, Vec2, Vec3 } from 'cc';
import { gameConfig } from './data/gameConfig';
import { emits } from './data/enmus';
import { editAction } from './prepab/editAction';
import { layerAction1 } from './layerAction1';
const { ccclass, property } = _decorator;

@ccclass('editCtl')
export class editCtl extends Component {
    // 编辑器数据文字显示
    @property(Label) labelVal: Label = null;
    @property(Label) labelSize: Label = null;
    @property(Label) labelPos: Label = null;
    @property(Label) labelMsg: Label = null;
    // 输入框
    @property(EditBox) posX: EditBox = null;
    @property(EditBox) posY: EditBox = null;
    @property(EditBox) posdata: EditBox = null;
    // 获取layer1脚本
    @property(layerAction1) layerAction1: layerAction1 = null;
    start() {
        // EventDispatcher.get_target().on(EventDispatcher.UPDATE_BLOCK_SIZE, this.updateBlockSize, this)
        director.on(emits.updateSize, this.updateBlockSize, this)
    }

    //功能按钮
    clickModel(e: EventTouch, args: string) {
        gameConfig.editModel = Number(args)
        this.modeLabel()
    }
    // 当前模式显示
    modeLabel() {
        switch (gameConfig.editModel) {
            case 1:
                this.labelVal.string = "添加元素方块"
                break
            case 2:
                this.labelVal.string = "删除元素方块"
                break
            case 3:
                this.labelVal.string = "添加网格"
                break
            case 4:
                this.labelVal.string = "删除网格"
                break
        }
    }
    // 导入按钮
    importBtn() {
        let data = this.posdata.string;
        if (data.trim().length < 5) {
            this.labelMsg.string = '没有数据'
            return
        }
        // this.delAlltBtn()
        let arr = JSON.parse(data)
        for (let key of arr) {
            this.layerAction1.addBlockLocal(new Vec3(key.x, key.y))
        }
        this.labelMsg.string = '导入成功'
        this.updateBlockSize()
        this.layerAction1.showShadow()
    }
    // 导出
    exportBtn() {
        let children = this.layerAction1.getChidren()
        if (children.length % 3 != 0 || children.length == 0) {
            this.labelMsg.string = '数量必须是3个倍数'
            return
        }
        let arr: any[] = []
        for (let key of children) {
            let pos = key.getPosition()
            arr.push({ x: Math.ceil(pos.x), y: Math.ceil(pos.y) })
        }
        let ret = JSON.stringify(arr)
        this.posdata.string = ret
        this.labelMsg.string = '导出成功'
    }
    // 输入坐标添加网格基准点
    addJIzhuntBtn() {
        console.log('addJIzhuntBtn');
        let x = this.posX.string;
        let y = this.posY.string;
        this.node.parent.getChildByName('edit').getComponent(editAction).addGrid(Number(x), Number(y), new Size(10, 10))
    }
    // 清空全部
    delAlltBtn() {
        this.layerAction1.delAll()
        this.updateBlockSize()
        this.labelMsg.string = '清空完成'
    }
    // 更新删除后剩余数量
    updateBlockSize() {
        let val = this.layerAction1.getChidren().length
        this.labelSize.string = String(val)
        let color = null;
        if (val % 3 == 0) {
            color = new Color(255, 255, 255, 255)
        } else {
            color = new Color(255, 0, 0, 255)
        }
        this.labelSize.color = color
    }
    // 设置坐标
    setPos(x: number, y: number) {
        this.labelPos.string = x + ',' + y
    }
}


