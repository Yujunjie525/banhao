const { ccclass } = cc._decorator;

@ccclass
export default class auto_NetRequest extends cc.Component {
	NetRequest: cc.Node;
	background: cc.Node;
	loading: cc.Node;

	public static URL:string = "db://assets/resources/prefab/common/NetRequest.prefab"

    onLoad () {
		this.NetRequest = this.node
		this.background = this.NetRequest.getChildByName("background");
		this.loading = this.NetRequest.getChildByName("loading");

    }
}
