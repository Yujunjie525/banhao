import {LQConst, LQOperateType} from "../data/lq_const";
import menu = cc._decorator.menu;

const {ccclass} = cc._decorator;

@ccclass
@menu("lq/guide")
export class LQGameGuide extends cc.Component {
    private start_in: boolean = false;
    private func_complete: () => void;
    private operate_type: LQOperateType;
    public is_enable: boolean = false;
    public click_node: cc.Node;
    public move_node: cc.Node;

    protected start(): void {
        // @ts-ignore
        this.node.setContentSize(cc.size(cc.visibleRect.width, cc.visibleRect.height));
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (!this.is_enable) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(false);
                return;
            }
            this.start_in = false;
            if (this.operate_type === LQOperateType.ClickScreen) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(false);
                this.start_in = true;
            }
            if (this.operate_type === LQOperateType.ClickNode || this.operate_type === LQOperateType.Move) {
                const p = this.click_node.convertToWorldSpaceAR(LQConst.VEC_ZERO);
                const r = cc.rect(p.x - this.click_node.width * 0.5, p.y - this.click_node.height * 0.5, this.click_node.width, this.click_node.height);
                if (r.contains(event.getLocation())) {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(false);
                    this.start_in = true;
                } else {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(true);
                }
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            if (!this.is_enable) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(false);
                return;
            }
            if (!this.start_in) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(true);
                return;
            }
            if (this.operate_type === LQOperateType.ClickScreen) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(false);
                this.guide_complete();
            }
            if (this.operate_type === LQOperateType.ClickNode) {
                const p = this.click_node.convertToWorldSpaceAR(LQConst.VEC_ZERO);
                const r = cc.rect(p.x - this.click_node.width * 0.5, p.y - this.click_node.height * 0.5, this.click_node.width, this.click_node.height);
                if (r.contains(event.getLocation())) {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(false);
                    this.guide_complete();
                } else {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(true);
                }
            }
            if (this.operate_type === LQOperateType.Move) {
                if (this.move_node.getBoundingBoxToWorld().contains(event.getLocation())) {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(false);
                    this.guide_complete();
                } else {
                    // @ts-ignore
                    this.node._touchListener.setSwallowTouches(true);
                }
            }
            if (this.operate_type === LQOperateType.Null) {
                // @ts-ignore
                this.node._touchListener.setSwallowTouches(true);
            }
        }, this);
    }

    private guide_complete() {
        this.is_enable = false;
        if (this.func_complete) {
            this.func_complete();
        }
    }

    public set_task(operate_type: LQOperateType, node: cc.Node, func_complete?: () => void) {
        if (operate_type === LQOperateType.ClickNode) {
            this.click_node = node;
            if (!this.click_node) {
                console.error('节点不能为空');
            }
        } else if (operate_type === LQOperateType.Move) {
            this.move_node = node;
            if (!this.move_node) {
                console.error('节点不能为空');
            }
        }
        this.operate_type = operate_type;
        this.is_enable = true;
        this.func_complete = func_complete;
    }

    public set_task_async(operate_type: LQOperateType, node: cc.Node): Promise<void> {
        if (operate_type === LQOperateType.ClickNode) {
            this.click_node = node;
            if (!this.click_node) {
                console.error('节点不能为空');
            }
        } else if (operate_type === LQOperateType.Move) {
            this.move_node = node;
            if (!this.move_node) {
                console.error('节点不能为空');
            }
        }
        this.operate_type = operate_type;
        this.is_enable = true;
        return new Promise((resolve) => {
            this.func_complete = resolve;
        });
    }

    public block_event() {
        this.is_enable = true;
        this.operate_type = LQOperateType.Null;
    }
}
