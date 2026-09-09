import auto_NetRequest from "../../../data/autoui/common/auto_NetRequest";
import UIBase from "../../../../common/base/UIBase";
import UIHelp from "../../../../common/utils/UIHelp";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/common/UINetRequest")
export default class UINetRequest extends UIBase {
	ui: auto_NetRequest = null;

	protected static bundleName = "subgame";
	protected static prefabUrl = "common/NetRequest";
	protected static className = "UINetRequest";

	onUILoad() {
		this.ui = this.node.addComponent(auto_NetRequest);
	}

	onShow() {
		this.ui.loading.runAction(cc.repeatForever(cc.rotateBy(2, 360)));

		this.scheduleOnce(() => {
			this.onClose();
		}, 3);
	}

	onClose() {
		this.ui.loading.stopAllActions();
		this.unscheduleAllCallbacks();
		UIHelp.CloseUI(UINetRequest);
	}
}
