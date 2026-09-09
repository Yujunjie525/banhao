const { ccclass } = cc._decorator;

@ccclass
export default class auto_GameSetting extends cc.Component {
	GameSetting: cc.Node;
	background: cc.Node;
	contain: cc.Node;
	btn_again: cc.Node;
	bg_again: cc.Node;
	icon_again: cc.Node;
	lbl_again: cc.Node;
	btn_guide: cc.Node;
	bg_guide: cc.Node;
	icon_guide: cc.Node;
	lbl_guide: cc.Node;
	btn_restart: cc.Node;
	bg_restart: cc.Node;
	icon_restart: cc.Node;
	lbl_restart: cc.Node;
	btn_exit: cc.Node;
	bg_exit: cc.Node;
	icon_exit: cc.Node;
	lbl_exit: cc.Node;
	sound: cc.Node;
	icon_laba: cc.Node;
	lbl_sound: cc.Node;
	btn_switch: cc.Node;
	bg: cc.Node;
	checkmark: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/GameSetting.prefab"

    onLoad () {
		this.GameSetting = this.node
		this.background = this.GameSetting.getChildByName("background");
		this.contain = this.GameSetting.getChildByName("contain");
		this.btn_again = this.contain.getChildByName("btn_again");
		this.bg_again = this.btn_again.getChildByName("bg_again");
		this.icon_again = this.bg_again.getChildByName("icon_again");
		this.lbl_again = this.bg_again.getChildByName("lbl_again");
		this.btn_guide = this.contain.getChildByName("btn_guide");
		this.bg_guide = this.btn_guide.getChildByName("bg_guide");
		this.icon_guide = this.bg_guide.getChildByName("icon_guide");
		this.lbl_guide = this.bg_guide.getChildByName("lbl_guide");
		this.btn_restart = this.contain.getChildByName("btn_restart");
		this.bg_restart = this.btn_restart.getChildByName("bg_restart");
		this.icon_restart = this.bg_restart.getChildByName("icon_restart");
		this.lbl_restart = this.bg_restart.getChildByName("lbl_restart");
		this.btn_exit = this.contain.getChildByName("btn_exit");
		this.bg_exit = this.btn_exit.getChildByName("bg_exit");
		this.icon_exit = this.bg_exit.getChildByName("icon_exit");
		this.lbl_exit = this.bg_exit.getChildByName("lbl_exit");
		this.sound = this.contain.getChildByName("sound");
		this.icon_laba = this.sound.getChildByName("icon_laba");
		this.lbl_sound = this.icon_laba.getChildByName("lbl_sound");
		this.btn_switch = this.icon_laba.getChildByName("btn_switch");
		this.bg = this.btn_switch.getChildByName("bg");
		this.checkmark = this.btn_switch.getChildByName("checkmark");

    }
}
