import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { loadPool } from '../res/loadPool';
const { ccclass, property } = _decorator;

@ccclass('levelCatTs')
export class levelCatTs extends Component {
    @property(Label) level: Label = null

    protected onEnable(): void {
        // 优先使用临时关卡（下一关），否则使用当前解锁关卡
        let displayLevel = gameConfig.tempLevel || gameConfig.nowLevel
        if (displayLevel == 1) { displayLevel = displayLevel + 1}
        this.level.string = '第' + displayLevel + '关'
    }
}


