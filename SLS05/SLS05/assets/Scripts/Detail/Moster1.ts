
const {ccclass, property} = cc._decorator;
import mGameData from '../Data/GameData';
import CloneChi from '../Tools/CloneChi';
import GameManager from '../Manager/GameManager';
@ccclass
export default class Moster1 extends cc.Component {

    
    bullet:cc.Prefab = null

    onLoad () {
        this.bullet = GameManager.GetIns().Bullets;
        this.schedule(this.FireOfBullet,1);
    }

    FireOfBullet(){
        if(!mGameData.isGameBegin){
            return;
        }
        var bul = CloneChi.GetIns().CreateNode(this.bullet);
        bul.parent = this.node;
        var self  = this;
        bul.getComponent('bulletMove').initBullet(self);
    }

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
        CloneChi.GetIns().BacktoPool(this.node);
    }
}
