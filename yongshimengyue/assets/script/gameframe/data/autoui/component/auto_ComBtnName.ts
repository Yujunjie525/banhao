const { ccclass } = cc._decorator;

@ccclass
export default class auto_ComBtnName extends cc.Component {
	ComBtnName: cc.Node;
	btn_name: cc.Node;
	name_bg: cc.Node;
	lbl_name: cc.Node;
	tip: cc.Node;

	public static URL:string = "db://assets/resources/prefab/component/ComBtnName.prefab"

    onLoad () {
		this.ComBtnName = this.node
		this.btn_name = this.ComBtnName.getChildByName("btn_name");
		this.name_bg = this.btn_name.getChildByName("name_bg");
		this.lbl_name = this.name_bg.getChildByName("lbl_name");
		this.tip = this.ComBtnName.getChildByName("tip");

    }
}
