import { _decorator, Component, Node, Animation, AnimationState } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('woun')
export class woun extends Component {
    onEnable(): void {
        let animation = this.node.getComponent(Animation);
        animation.play('woun')
        animation.on(Animation.EventType.FINISHED, () => {
            this.node.active = false
        })
    }


}


