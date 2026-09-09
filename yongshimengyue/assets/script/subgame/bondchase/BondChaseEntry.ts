import mGameData from "../../../Scripts/Data/GameData";
import TipsManager from "../../../Scripts/Manager/TipsManager";

const { ccclass, property } = cc._decorator;

@ccclass("BondChaseEntry")
export default class BondChaseEntry extends cc.Component {
    @property({ tooltip: "要加载的副玩法场景名，不包含 .fire" })
    public targetScene: string = "BondChaseGraybox";

    @property({ tooltip: "进入副玩法前停止大厅音效和音乐" })
    public stopAllAudio: boolean = true;

    private loading: boolean = false;

    public openBondChase(): void {
        if (this.loading) {
            return;
        }

        const sceneName = String(this.targetScene || "").trim();
        if (!sceneName) {
            cc.error("BondChaseEntry: targetScene is empty");
            return;
        }

        // 副玩法同样是一局游戏：进入场景前扣除一次体力，避免从主界面
        // 直接进入 BondChase 绕过体力校验。失败页重新挑战会在控制器中
        // 另外扣除一次，代表开启全新的一局。
        if (!mGameData || !mGameData.HasEnoughStamina()) {
            TipsManager.show("体力不足，无法开始游戏。");
            return;
        }
        if (!mGameData.ConsumeStamina()) {
            TipsManager.show("体力不足，无法开始游戏。");
            return;
        }

        this.loading = true;
        let staminaCommitted = true;
        const button = this.node.getComponent(cc.Button);
        if (button) {
            button.interactable = false;
        }
        if (this.stopAllAudio) {
            cc.audioEngine.stopAll();
        }

        const accepted = cc.director.loadScene(sceneName, (error: Error) => {
            if (!error) {
                return;
            }
            this.loading = false;
            if (staminaCommitted) {
                staminaCommitted = false;
                mGameData.addStamina(1);
            }
            if (button && button.node && button.node.isValid) {
                button.interactable = true;
            }
            cc.error("BondChaseEntry: failed to load scene " + sceneName, error);
        });

        if (!accepted) {
            this.loading = false;
            if (staminaCommitted) {
                staminaCommitted = false;
                mGameData.addStamina(1);
            }
            if (button) {
                button.interactable = true;
            }
            cc.error("BondChaseEntry: scene is not in the build scene list: " + sceneName);
        }
    }
}
