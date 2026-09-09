import EventMgr from "../../../Managers/EventMgr";
import {LQCollide} from "../../../../lq_collide_system/lq_collide";

const {ccclass, property} = cc._decorator;

@ccclass
export default class box1 extends cc.Component {
    @property({tooltip:"速度"})
    speed: number =90
    private node_speed:number=0
    // onLoad () {}

    start () {
        this.node_speed=this.speed+Math.random()*this.speed
        const lqCollide:LQCollide=this.node.getComponent("lq_collide")
        lqCollide.on_collide = (c) => {
            EventMgr.Instance.dispatch_event("destroyBox", this.node)

        }
    }

    update (dt) {



        this.node.y = this.node.y - this.node_speed * dt

    if (this.node.y <= -654) {

    
     EventMgr.Instance.dispatch_event("destroyBox", this.node)
    }

    }
}
