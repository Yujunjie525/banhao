
const {ccclass, property} = cc._decorator;
import CloneChi from '../Tools/CloneChi';
@ccclass
export default class bulletMove extends cc.Component {
    MoveToWhere:boolean;
    anim:cc.Animation;
    update (dt) {
        if(this.MoveToWhere){
            this.node.x -= 10;
            this.node.y -= 3;
        }else{
            this.node.x += 10;
            this.node.y -= 3;
        }
    }

    onCollisionEnter(other,self){
        CloneChi.GetIns().BacktoPool(this.node);
    }

    initBullet(self){
        this.node.x = 0;
        this.node.y = 0;

        var x1 = self.node.x;
        this.anim = this.getComponent(cc.Animation);
        if(x1 > 0){
            this.anim.play('zidan2');
            this.MoveToWhere = true;
        }else{
            this.anim.play('zidan1');
            this.MoveToWhere = false;
        }
    }
}
