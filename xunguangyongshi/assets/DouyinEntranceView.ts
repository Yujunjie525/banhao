import { _decorator, Component, Node } from 'cc';
import { MiniGameSdk } from './Sdk/MiniGameSdk';
const { ccclass, property } = _decorator;

@ccclass('DouyinEntranceView')
export class DouyinEntranceView extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    onCloseClick() {
        this.node.active = false;
    }

    onNavigateToDouyinClick() {

        MiniGameSdk.BytedanceSidebar.navigateToSidebar((success: boolean) => { // 跳转到抖音侧边栏
            if (success) {
                console.log('跳转成功');
            } else {
                console.log('跳转失败');
            }
        });
    }
}
