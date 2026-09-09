import ResUtils from "../../../../common/utils/ResUtils";
import { ViewUtil } from "../../../../common/utils/ViewUtil";
import cfg from "../../../../common/vo/ConfigReader";
import { Package, PackageType } from "../../../data/const/DefineConst";
import GameController from "../../../GameController";
import { lyx_bridge } from "../../../manager/LYXBridge";

export class GameName {
	node: cc.Node;
	background: cc.Node;
	btn_back: cc.Node;
	bg_back: cc.Node;
	lbl_title: cc.Node;

	constructor() {
		this.init()
	}

	public init(): void {
		this.initView();
	}

	public initView(): void {
		let itemprefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/common/GameName");
		this.node = cc.instantiate(itemprefab);
		this.background = this.node.getChildByName("background");
		this.btn_back = this.node.getChildByName("btn_back");
		this.bg_back = this.btn_back.getChildByName("bg_back");
		this.lbl_title = this.node.getChildByName("lbl_title");

		this.setColor();

		if (Package.TYPE == PackageType.APP || Package.TYPE == PackageType.WX) {
			ViewUtil.setLabelStr(this.lbl_title, GameController.config["name"]);
		} else {
			ViewUtil.setLabelStr(this.lbl_title, GameController.config["name"] + "." + GameController.config["levelTitle"]);
		}

		this.btn_back.on(cc.Node.EventType.TOUCH_END, this.onClickBack, this);
	}

	/**
	 * 设置颜色
	 */
	public setColor(): void {
		let color: string = cfg.nameBgColor || "#FFFFFF";
		this.background.color = new cc.Color().fromHEX(color);
		this.background.opacity = cfg.nameBgOpacity;
		this.lbl_title.color = cc.color(cfg.nameTxtColor);
	}

	/**
	 * 点击左上角返回
	 */
	public onClickBack(): void {
		lyx_bridge.sendState("gameleave");
	}

	onDestroy() {
		this.btn_back.off(cc.Node.EventType.TOUCH_END, this.onClickBack, this);
	}
}
