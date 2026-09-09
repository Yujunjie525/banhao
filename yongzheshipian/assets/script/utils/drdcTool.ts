import { _decorator, Component, Node, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('drdcTool')
export class drdcTool extends Component {
    private opacityComp: UIOpacity = null
    start() {

    }
    onEnable() {
        this.opacityComp = this.getComponent(UIOpacity);
    }
    update(deltaTime: number) {

    }
}


