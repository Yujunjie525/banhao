// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({tooltip:"速度"})
    speed: number =90
    private node_speed:number=0
    // onLoad () {}

    start () {
        this.node_speed=this.speed+Math.random()*this.speed
    }
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {

      this.node.destroy()



    }
    update (dt) {



        this.node.y = this.node.y - this.node_speed * dt

    if (this.node.y <= -654) {
      this.node.destroy()
    //  console.log("回收飞机")
    }

    }
}
