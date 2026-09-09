import ccclass = cc._decorator.ccclass;
import executeInEditMode = cc._decorator.executeInEditMode;
import {LQCollide} from "./lq_collide";

@ccclass
@executeInEditMode
export class LQCollideBase extends cc.Component {
    private find_collide() {
        const collide = this.node.getComponent(LQCollide);
        if (!collide) {
            console.error(this.node.name + ':没有找到LQCollide组件');
            return undefined;
        }
        return collide;
    }

    protected onLoad() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
        collide.init();
    }

    protected onEnable() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
        collide.enable_collide();
    }

    protected onDisable() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
        collide.disable_collide();
    }

    protected onDestroy() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
    }

    protected onFocusInEditor() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
    }

    protected onLostFocusInEditor() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
    }

    protected resetInEditor() {
        const collide = this.find_collide();
        if (!collide) {
            return;
        }
    }
}