
 import GameApp from "./GameApp";
 import UserData from "./UserData"
 import mGameData from "../Load/GameData"
const {ccclass, property} = cc._decorator;

@ccclass
export default class itemLevel extends cc.Component {
 
    @property(cc.Label)
    level_label: cc.Label = null;

    @property(cc.Node)
    node_btn: cc.Node = null;

    @property(cc.Node)
    node_sp: cc.Node = null;

    private num_level=null
    

    onLoad () {}

    init(i_level:number){
        this.num_level = i_level
        this.level_label.getComponent(cc.Label).string = this.num_level
    }

    //可以玩
    canPlay(is_can){
        if (is_can) {
            this.node_btn.active = true
            this.node_sp.active = false
        }else{
            this.node_btn.active = false
            this.node_sp.active = true
        }
    }

    //按钮回调
    btn_callBack(){
       // UserData.Instance.userData["choiceLevel"]=this.num_level
        mGameData.currentLevel=this.num_level
        UserData.Instance.saveUserData()
        GameApp.Instance.enterGameScene()
      //  game.numLevel = this.num_level
      //  game.gamePlay()
    }

    start () {

    }
}
