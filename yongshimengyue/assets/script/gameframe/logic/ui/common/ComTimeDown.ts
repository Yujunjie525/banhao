import { soundManager } from "../../../../common/manager/SoundManager";
import ResUtils from "../../../../common/utils/ResUtils";
import { ViewUtil } from "../../../../common/utils/ViewUtil";
import cfg from "../../../../common/vo/ConfigReader";

export class ComTimeDown {
	node: cc.Node;
	mask: cc.Node;
	lbl_nums: cc.Node;
	lbl_num0: cc.Node;
	lbl_num1: cc.Node;
	lbl_num2: cc.Node;
	lbl_num3: cc.Node;
	lbl_zhunbei: cc.Node;

	public color: string = "#ffffff";  //字体颜色
	public timeout: number = 3;  //时间倒计时
	public callback = null;  //时间到了的回调

	public index: number = 0;
	constructor(callback) {
		this.callback = callback;
		this.timeout = cfg.val;
		this.color = cfg.color;
		this.init()
	}

	public init(): void {
		if (!this.timeout) {
			this.callback && this.callback();
			return;
		}

		this.initView();
	}

	public initView(): void {
		let itemprefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/common/ComTimeDown");
		this.node = cc.instantiate(itemprefab);
		this.mask = this.node.getChildByName("mask");
		this.lbl_nums = this.mask.getChildByName("lbl_nums");
		this.lbl_num0 = this.lbl_nums.getChildByName("lbl_num0");
		this.lbl_num1 = this.lbl_nums.getChildByName("lbl_num1");
		this.lbl_num2 = this.lbl_nums.getChildByName("lbl_num2");
		this.lbl_num3 = this.lbl_nums.getChildByName("lbl_num3");
		this.lbl_zhunbei = this.node.getChildByName("lbl_zhunbei");

		this.setColor();
		this.showAnim();
	}

	/**
	 * 设置颜色
	 */
	public setColor(): void {
		this.lbl_zhunbei.color = new cc.Color().fromHEX(this.color);
		this.lbl_num0.color = new cc.Color().fromHEX(this.color);
		this.lbl_num1.color = new cc.Color().fromHEX(this.color);
		this.lbl_num2.color = new cc.Color().fromHEX(this.color);
		this.lbl_num3.color = new cc.Color().fromHEX(this.color);
	}

	/**
	 * 显示动画
	 */
	public sounds: string[] = [cfg.musicStart, cfg.musicStart, cfg.musicStart, cfg.musicEnd];
	public showAnim(): void {
		this.lbl_zhunbei.runAction(cc.sequence(cc.delayTime(0.1), cc.spawn(cc.fadeIn(0.3), cc.scaleTo(0.3, 1))));

		let fun = () => {
			//soundManager.playFx(this.sounds[this.index]);
			this.index++;
			this.timeout && ViewUtil.setLabelStr(this["lbl_num" + this.index % 4], this.timeout + "");
			this.lbl_nums.runAction(cc.sequence(cc.rotateBy(0.55, 98), cc.rotateBy(0.27, -12), cc.rotateBy(0.13, 4),
				cc.callFunc(() => {
					if (this.timeout <= 0) {
						this.callback && this.callback();
						return;
					}

					this.timeout--;
					fun();
				})));
		}

		/*let fun = () => {
			this.index++;
			this.timeout && ViewUtil.setLabelStr(this["lbl_num" + this.index % 4], this.timeout + "");
			this.lbl_nums.runAction(cc.sequence(cc.rotateBy(0.6, 98), cc.rotateBy(0.3, -16), cc.rotateBy(0.1, 8),
				cc.callFunc(() => {
					if (this.timeout <= 0) {
						this.callback && this.callback();
						return;
					}
					
					this.timeout--;
					fun();
				})));
		}*/

		/*let fun = () => {
			this.index++;
			this.timeout && ViewUtil.setLabelStr(this["lbl_num" + this.index % 4], this.timeout + "");
			this.lbl_nums.runAction(cc.sequence(cc.rotateBy(1, 90).easing(cc.easeBackOut()),
				cc.callFunc(() => {
					if (this.timeout <= 0) {
						this.callback && this.callback();
						return;
					}

					this.timeout--;
					fun();
				})));
		}*/

		/*let fun = () => {
			this.index++;
			this.timeout && ViewUtil.setLabelStr(this["lbl_num" + this.index % 4], this.timeout + "");
			this.lbl_nums.runAction(cc.sequence(cc.rotateBy(0.6, 100).easing(cc.easeSineIn()), cc.rotateBy(0.3, -16), cc.rotateBy(0.1, 6),
				cc.callFunc(() => {
					if (this.timeout <= 0) {
						this.callback && this.callback();
						return;
					}

					this.timeout--;
					fun();
				})));
		}*/

		fun();

	}

	onDestroy() {
		this.callback = null;
	}
}
