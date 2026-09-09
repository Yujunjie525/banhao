
const {ccclass, property} = cc._decorator;
import CloneChi from '../Tools/CloneChi';
@ccclass
export default class Moster2 extends cc.Component {
    anim:cc.Animation = null;
    

    
    /**
     * 初始化蚊子
     * @param position 0-左边，1-右边，-1-随机
     */
    initwenzi(position:number = -1){
        this.anim = this.getComponent(cc.Animation);
        this.anim.play();
        var num = position;
        
        // 如果没有指定位置或位置无效，则随机选择
        if (num === -1 || num < 0 || num > 1) {
            num = Math.floor(Math.random() * 2);
        }
        
        if(num == 0){
            this.wenziMove1();
        }else{
            this.wenziMove2();
        }
    }
    // update (dt) {}
    /**
     * 蚊子运动
     */
    wenziMove1(){
        this.anim.play('wenziz');
        var a1 = cc.moveTo(0,cc.v2(-223,200));
        var a0 = cc.scaleTo(2,1.5);
        var a2 = cc.moveTo(0.5,cc.v2(220,-197));
        this.node.runAction(cc.sequence(a1,a0,cc.delayTime(1),a2));
    }

    wenziMove2(){
        this.anim.play('wenziy');      
        var a1 = cc.moveTo(0, cc.v2(223, 200));
        var a0 = cc.scaleTo(2, 1.5);
        var a2=cc.moveTo(0.5, cc.v2(-220, -197));
        this.node.runAction(cc.sequence(a1,a0,cc.delayTime(1),a2));
    }
    /**
     * 碰撞检测
     * @param other 
     * @param self 
     */
    onCollisionStay(other,self){
        this.node.stopAllActions();
        CloneChi.GetIns().BacktoPool(this.node);
        this.node.setPosition(cc.v2(0,893));
        var a0 = cc.scaleTo(1,1);
        this.node.runAction(a0);
    }
}
