const { ccclass } = cc._decorator;

@ccclass
export default class auto_Loading extends cc.Component {
	Transition: cc.Node;
	icon: cc.Node;
	lbl_loading: cc.Node;
	progressBar: cc.Node;
	bar: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/Loading.prefab"

    onLoad () {
		this.Transition = this.node
		this.icon = this.Transition.getChildByName("icon");
		this.lbl_loading = this.Transition.getChildByName("lbl_loading");
		this.progressBar = this.Transition.getChildByName("progressBar");
		this.bar = this.progressBar.getChildByName("bar");

    }
}
