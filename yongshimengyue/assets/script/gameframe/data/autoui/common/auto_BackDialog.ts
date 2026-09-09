const { ccclass } = cc._decorator;

@ccclass
export default class auto_BackDialog extends cc.Component {
	BackDialog: cc.Node;
	bg: cc.Node;
	contain: cc.Node;
	pic_super: cc.Node;
	content: cc.Node;
	btn_return: cc.Node;
	bg_return: cc.Node;
	btn_goon: cc.Node;
	bg_goon: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/BackDialog.prefab"

    onLoad () {
		this.BackDialog = this.node
		this.bg = this.BackDialog.getChildByName("bg");
		this.contain = this.BackDialog.getChildByName("contain");
		this.pic_super = this.contain.getChildByName("pic_super");
		this.content = this.contain.getChildByName("content");
		this.btn_return = this.content.getChildByName("btn_return");
		this.bg_return = this.btn_return.getChildByName("bg_return");
		this.btn_goon = this.content.getChildByName("btn_goon");
		this.bg_goon = this.btn_goon.getChildByName("bg_goon");

    }
}
