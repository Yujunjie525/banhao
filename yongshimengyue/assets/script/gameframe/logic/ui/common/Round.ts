import ResUtils from "../../../../common/utils/ResUtils";
import { ViewUtil } from "../../../../common/utils/ViewUtil";
import UpdateRoundHandler from "../../../handler/UpdateRoundHandler";
import simpleFrameBridge from "../../../SimpleFrameBridge";

export class Round {
	node: cc.Node;
	lbl_round: cc.Node;

	public all: number = 0;
	public cur: number = 0;
	constructor(all: number) {
		this.all = all;
		this.init()
	}

	public init(): void {
		this.initView();

		simpleFrameBridge.registerHandler(new UpdateRoundHandler(this));
	}

	public initView(): void {
		let itemprefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/common/Round");
		this.node = cc.instantiate(itemprefab);
		this.lbl_round = this.node.getChildByName("lbl_round");

		this.updateRound();
	}

	public updateRound(cur: number = 0): void {
		if (!cur) {
			this.cur++;
		} else {
			this.cur = cur;
		}
		if (this.cur >= this.all) this.cur = this.all;

		ViewUtil.setLabelStr(this.lbl_round, `${this.cur}/${this.all}`);
	}
}
