import { _decorator, Component, director, Label, Node, tween, Vec3 } from 'cc';
import { bgmName, emits } from '../data/enmus';
import { gameConfig } from '../data/gameConfig';
import { local } from '../data/enmus';
import { save } from '../untils/tools';
import { loadPool } from '../res/loadPool';
import { mainView } from '../mainView';
import { audioTool } from '../untils/audioTool';
import { mGameData } from '../untils/GameData';
const { ccclass, property } = _decorator;

@ccclass('LevelCompleteWnd')
export class LevelCompleteWnd extends Component {
    @property(Label) levelLabel: Label = null;
    @property(Node) btn_next: Node = null;
    @property(Node) btn_home: Node = null;
    private popUI: Node;

    onLoad() {
        // this.levelLabel.string = `恭喜通关第 ${gameConfig.nowLevel} 关`;
        this.btn_next.on(Node.EventType.TOUCH_END, this.onNextLevel, this)
        this.btn_home.on(Node.EventType.TOUCH_END, this.onBackHome, this)
    }

    protected onEnable(): void {
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
    }

    onNextLevel() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // 检查体力是否足够
        if (mGameData.currentStamina < 1) {
            loadPool.ins.getPoolNode('tips', this.node.parent);
            director.emit(emits.tipMsg, '体力不足，请稍后再试。');
            return;
        }
        // 扣除体力
        mGameData.ConsumeStamina(1);
        
        // 关闭弹窗
        tween(this.popUI).to(0.2, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        }).start()

        // 直接调用 nextLevel 方法
        const canvas = director.getScene().getChildByName('Canvas');
        if (canvas) {
            const mv = canvas.getComponent(mainView);
            if (mv) {
                mv.nextLevel();
            }
        }
    }

    onBackHome() {
        audioTool.ins.stopMusic()
        // 关闭弹窗
        loadPool.ins.huiShouNode(this.node)
        
        // 跳转到主界面
        director.loadScene('home');
    }
}