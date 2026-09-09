import MasterGlobal from "../../../../common/MasterGlobal";
import ResUtils from "../../../../common/utils/ResUtils";
import { ViewUtil } from "../../../../common/utils/ViewUtil";
import cfg from "../../../../common/vo/ConfigReader";
import AddScoreHandler from "../../../handler/AddScoreHandler";
import simpleFrameBridge from "../../../SimpleFrameBridge";
import { Round } from "./Round";
import { ResultWndState } from "../game/UIResultWnd";

export class Title {
	node: cc.Node;
	mask: cc.Node;
	bg: cc.Node;
	btn_back: cc.Node;
	contain: cc.Node;
	fenshu: cc.Node;
	lbl_lv: cc.Node;
	lbl_score: cc.Node;
	lbl_add: cc.Node;

	public _round: Round;
	public ownerFrame: any = null;

	public curScore: number = 0;
	public goodsLeft: number = 0;
	public useGoodsLeftMode: boolean = false;

	constructor() {
		this.init();
	}

	public init(): void {
		this.initView();

		simpleFrameBridge.registerHandler(new AddScoreHandler(this));
	}

	public bindFrame(frame: any): void {
		this.ownerFrame = frame;
	}

	public initView(): void {
		let itemprefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/common/Title");
		this.node = cc.instantiate(itemprefab);
		// this.mask = this.node.getChildByName("mask");
		this.bg = this.node.getChildByName("bg");
		this.btn_back = this.node.getChildByName("btn_back");
		this.contain = this.node.getChildByName("contain");
		this.fenshu = this.node.getChildByName("fenshu");
		this.lbl_lv = this.bg.getChildByName("lv");
		this.lbl_score = this.fenshu.getChildByName("lbl_score");
		this.lbl_add = this.fenshu.getChildByName("lbl_add");

		this.setLevelLabel();
		if (cfg.totalGoodsCount > 0) {
			this.setGoodsLeft(cfg.totalGoodsCount);
		}

		this.btn_back.on(cc.Node.EventType.TOUCH_END, this.onClickBack, this);
	}

	public setLevelLabel(): void {
		if (!this.lbl_lv || typeof cfg.mapId === "undefined" || cfg.mapId === null) {
			return;
		}
		ViewUtil.setLabelStr(this.lbl_lv, "第" + cfg.mapId + "关");
	}

	public setColor(): void {
		let color: string = cfg.titleBgColor || "#FFFFFF";
		this.bg.width = this.node.width;
		this.bg.color = new cc.Color().fromHEX(color);
		this.bg.opacity = cfg.titleBgOpacity;
		this.lbl_score.color = cc.color(cfg.titleTxtColor);
	}



	public addScore(add: number, isAnim: boolean = true): void {
		MasterGlobal.data["score"] += add;
		this.curScore += add;
		if (this.curScore < 0) {
			this.curScore = 0;
		}
		if (this.useGoodsLeftMode) {
			return;
		}
		if (!isAnim) {
			ViewUtil.setLabelStr(this.lbl_score, this.curScore + "");
			return;
		}

		let lbl_add: cc.Node = cc.instantiate(this.lbl_add);
		ViewUtil.setLabelStr(lbl_add, (add > 0 ? "+" : "-") + Math.abs(add));
		lbl_add.opacity = 255;
		this.fenshu.addChild(lbl_add);
		lbl_add.runAction(cc.sequence(
			cc.moveTo(0.2, this.lbl_score.x, this.lbl_score.y - 12),
			cc.callFunc(() => {
				lbl_add.opacity = 0;
				lbl_add.destroy();
				this.lbl_score.runAction(cc.sequence(
					cc.scaleTo(0.1, 1.5),
					cc.callFunc(() => {
						ViewUtil.setLabelStr(this.lbl_score, this.curScore + "");
					}),
					cc.scaleTo(0.1, 1)
				));
			})
		));
	}

	public setGoodsLeft(count: number): void {
		this.useGoodsLeftMode = true;
		this.goodsLeft = Math.max(0, count || 0);
		ViewUtil.setLabelStr(this.lbl_score, this.goodsLeft + "");
	}

	public changeGoodsLeft(delta: number, isAnim: boolean = true): void {
		this.useGoodsLeftMode = true;
		this.goodsLeft = Math.max(0, this.goodsLeft + delta);
		if (!isAnim) {
			ViewUtil.setLabelStr(this.lbl_score, this.goodsLeft + "");
			return;
		}

		this.lbl_score.runAction(cc.sequence(
			cc.scaleTo(0.1, 1.2),
			cc.callFunc(() => {
				ViewUtil.setLabelStr(this.lbl_score, this.goodsLeft + "");
			}),
			cc.scaleTo(0.1, 1)
		));
	}

	public onClickBack(): void {
		if (this.btn_back.getComponent(cc.Button).enabled) {
			const uiFrame = this.ownerFrame;
			if (!uiFrame) {
				console.error("Title.onClickBack: UIFrame not found");
				return;
			}
			uiFrame.showResultWnd(ResultWndState.Stop);
		}
	}

	onDestroy() {
		this.btn_back.off(cc.Node.EventType.TOUCH_END, this.onClickBack, this);
		this.ownerFrame = null;
		this._round = null;
	}
}
