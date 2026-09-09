import UIBase from "../../../../common/base/UIBase";
import { soundManager } from "../../../../common/manager/SoundManager";
import UIMng from "../../../../common/manager/UIMng";
import MasterGlobal from "../../../../common/MasterGlobal";
import UIHelp from "../../../../common/utils/UIHelp";
import auto_GameSetting from "../../../data/autoui/common/auto_GameSetting";
import { Package, PackageType } from "../../../data/const/DefineConst";
import { lyx_bridge } from "../../../manager/LYXBridge";
import simpleFrameBridge from "../../../SimpleFrameBridge";
import UIFrame from "../prefab/UIFrame";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/common/UIGameSetting")
export default class UIGameSetting extends UIBase {
	ui: auto_GameSetting = null;

	protected static bundleName = "subgame";
	protected static prefabUrl = "common/GameSetting";
	protected static className = "UIGameSetting";

	onUILoad() {
		this.ui = this.node.addComponent(auto_GameSetting);
	}

	onShow() {
		this.ui.btn_again.on(cc.Node.EventType.TOUCH_END, this.onAgain, this);
		this.ui.btn_exit.on(cc.Node.EventType.TOUCH_END, this.onExit, this);
		this.ui.btn_guide.on(cc.Node.EventType.TOUCH_END, this.onGuide, this);
		this.ui.btn_restart.on(cc.Node.EventType.TOUCH_END, this.onRestart, this);
		this.ui.btn_switch.on(cc.Node.EventType.TOUCH_END, this.onClickSwitch, this);
		this.ui.background.on(cc.Node.EventType.TOUCH_END, this.onClickBg, this);

		this.ui.btn_switch.getComponent(cc.Toggle).isChecked = MasterGlobal.musicon;
	}

	onStart() {
		simpleFrameBridge.sendMessage("pausegame");
		let uiFrame: UIFrame = UIMng.getInstance().getUI(UIFrame) as UIFrame;
		if (uiFrame && uiFrame._title && uiFrame._title._clock) {
			uiFrame._title._clock.switch = true;
		}
		if (uiFrame && uiFrame._title) {
			uiFrame._title.btn_back.getComponent(cc.Button).enabled = false;
		}
		MasterGlobal.isPause = true;
	}

	/**
	 * 重新激活
	 */
	public resumeGame(): void {
		simpleFrameBridge.sendMessage("resumegame");
		let uiFrame: UIFrame = UIMng.getInstance().getUI(UIFrame) as UIFrame;
		if (uiFrame && uiFrame._title && uiFrame._title._clock) {
			uiFrame._title._clock.switch = false;
		}
		if (uiFrame && uiFrame._title) {
			uiFrame._title.btn_back.getComponent(cc.Button).enabled = true;
		}
		MasterGlobal.isPause = false;
	}

	/**
	 * 点击背景
	 */
	public onClickBg(): void {
		this.resumeGame();
		this.onClose();
	}

	/**
	 * 继续
	 */
	public onAgain(): void {
		this.resumeGame();
		this.onClose();
	}

	/**
	 * 玩法演示
	 */
	public onGuide(): void {
		simpleFrameBridge.sendMessage("showguide", () => {
			this.resumeGame();
		});
		this.onClose();
	}

	/**
	 * 重新开始
	 */
	public onRestart(): void {
		cc.log("关闭游戏逻辑页333333");
		let uiFrame: UIFrame = UIMng.getInstance().getUI(UIFrame) as UIFrame;
		cc.log("关闭游戏逻辑页444444");
		this.resumeGame();
		cc.log("关闭游戏逻辑页55555");
		uiFrame && uiFrame.returnToMainView();
		this.onClose();
	}

	/**
	 * 点击关闭
	 */
	public onClickClose(): void {
		this.onExit();
	}

	/**
	 * 退出
	 */
	public onExit(): void {
		//告诉原生app
		if (Package.TYPE == PackageType.APP) {
			// 手动触发的状态，在BaseGame调用
			lyx_bridge.sendState("gameleave");
		} else if (Package.TYPE == PackageType.DEV || Package.TYPE == PackageType.WEB) {
			window.close();
		}
	}

	/**
	 * 音量开关
	 */
	public onClickSwitch(): void {
		this.ui.btn_switch.getComponent(cc.Toggle).isChecked = MasterGlobal.musicon;
		MasterGlobal.musicon = !MasterGlobal.musicon;

		soundManager.setEffectsVolume(MasterGlobal.musicon ? 1 : 0);
		MasterGlobal.musicon && soundManager.resumeMusic();
		!MasterGlobal.musicon && soundManager.pauseMusic();
	}

	onClose() {
		UIHelp.CloseUI(UIGameSetting);
	}
}
