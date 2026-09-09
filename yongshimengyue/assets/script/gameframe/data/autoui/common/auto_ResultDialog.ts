const { ccclass } = cc._decorator;

@ccclass
export default class auto_ResultDialog extends cc.Component {
	ResultDialog: cc.Node;
	bg: cc.Node;
	contain: cc.Node;
	lbl_title: cc.Node;
	icon: cc.Node;
	lbl_score: cc.Node;
	tip: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/ResultDialog.prefab"

    onLoad () {
		this.ResultDialog = this.node
		this.bg = this.ResultDialog.getChildByName("bg");
		this.contain = this.ResultDialog.getChildByName("contain");
		this.lbl_title = this.contain.getChildByName("lbl_title");
		this.icon = this.contain.getChildByName("icon");
		this.lbl_score = this.contain.getChildByName("lbl_score");
		this.tip = this.ResultDialog.getChildByName("tip");

    }
}
