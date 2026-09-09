import { _decorator, Component, director, Label, Node } from 'cc';
import { emits, localData } from '../data/enums';
import { gameConfig } from '../data/gameConfig';
import { load, save } from './tools';
const { ccclass, property } = _decorator;

@ccclass('jinbiNumTool')
export class jinbiNumTool extends Component {
    // 体力值显示
    @property(Label) jinbiNum: Label = null
    protected onEnable(): void {
        director.on(emits.initNum, this.initJinbi, this)
        this.initJinbi()
    }
    protected onDestroy(): void {
        director.off(emits.initNum, this.initJinbi, this)
    }
    initJinbi() {
        this.jinbiNum.string = String(gameConfig.jinbiNum)
        save(localData.jinbiNum, gameConfig.jinbiNum)
    }
}


