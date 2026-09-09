const { ccclass } = cc._decorator;

@ccclass
export default class auto_Transition extends cc.Component {
	Loading: cc.Node;
	icon: cc.Node;
	lbl_loading: cc.Node;
	progressBar: cc.Node;
	bar: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/Transition.prefab"

    onLoad () {
		this.Loading = this.node
		this.icon = this.Loading.getChildByName("icon");
		this.lbl_loading = this.Loading.getChildByName("lbl_loading");
		this.progressBar = this.Loading.getChildByName("progressBar");
		this.bar = this.progressBar.getChildByName("bar");

    }
}
