
const {ccclass, property} = cc._decorator;
import GameManager from '../Manager/GameManager';
import CloneChi from '../Tools/CloneChi';
@ccclass
export default class ZhangaiMove extends cc.Component {

    update (dt) {
        this.node.y -= GameManager.GetIns().getSpeed();
        if(this.node.y < -890){
            CloneChi.GetIns().BacktoPool(this.node);
        }
    }
    /**
     * 碰撞检测
     * @param other 
     * @param self 
     */
    onCollisionStay(other,self){
        if(other.node.group == "player"){
            CloneChi.GetIns().BacktoPool(this.node);
        }
    }
}
