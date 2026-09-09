const { ccclass } = cc._decorator;

@ccclass
export default class auto_Frame extends cc.Component {
	Frame: cc.Node;

	public static URL:string = "db://assets/resources/prefab/Game.prefab"

    onLoad () {
		this.Frame = this.node
    }
}
