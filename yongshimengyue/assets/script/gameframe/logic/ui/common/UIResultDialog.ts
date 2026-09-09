import auto_ResultDialog from "../../../data/autoui/common/auto_ResultDialog";
import GameController from "../../../GameController";
import { ViewUtil } from "../../../../common/utils/ViewUtil";
import UIBase from "../../../../common/base/UIBase";
import UIHelp from "../../../../common/utils/UIHelp";
import cfg from "../../../../common/vo/ConfigReader";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/common/UIResultDialog")
export default class UIResultDialog extends UIBase {
	ui: auto_ResultDialog = null;

	protected static bundleName = "subgame";
	protected static prefabUrl = "common/ResultDialog";
	protected static className = "UIResultDialog";

	public state: boolean = true; //成功or失败
	public data = null;
	public callback = null;

	onUILoad() {
		this.ui = this.node.addComponent(auto_ResultDialog);

		this.state = this.params[0];
		this.data = this.params[1];
		this.callback = this.params[2] || null;
	}

	onShow() {
		this.playAnim();
		this.ui.bg.on(cc.Node.EventType.TOUCH_END, this.onClickBG, this);
	}

	onStart() {
		ViewUtil.setLabelStr(this.ui.lbl_score,
			`<b><color=#333333>本次得分：</c><color=#12C140>${this.data["realScore"]}</color></b>`);
		if (this.state) {
			//当前已经是最后一关了
			if (cfg.maxLevel <= GameController.curLevel) {
				GameController.curLevel = 0;
				ViewUtil.setLabelStr(this.ui.lbl_title, "真棒!你已经通关了哦!");
			}
		} else {
			ViewUtil.setLabelStr(this.ui.lbl_title, "闯关失败!加油哦!");
		}
	}

	public playAnim(): void {
		let actions = cc.repeatForever(cc.sequence(cc.delayTime(0.3), cc.fadeOut(1), cc.fadeIn(1)));
		this.ui.tip.runAction(actions);
	}

	public onClickBG(): void {
		this.callback && this.callback();
		this.onClose();
	}

	onClose() {
		this.ui.bg.off(cc.Node.EventType.TOUCH_END, this.onClickBG, this);
		UIHelp.CloseUI(UIResultDialog);
	}
}
