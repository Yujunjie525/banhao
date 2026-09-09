

const {ccclass, property} = cc._decorator;

@ccclass
export default class enemy_AI extends cc.Component {
  
    
    @property({tooltip:"反应时间"})
     think_time: number = 0.03

     @property({tooltip:"攻击范围"})
     attack_R: number =500

 




    // onLoad () {}
     private now_time=null
     private agent=null//导航组件
     private target=null//玩家
    start () {
        this.now_time = this.think_time;
        // 功能组件实例;
        this.agent = this.getComponent("nav_agent");
        this.target=this.node.parent.parent.getChildByName("player_root")
    }

    do_AI() {
        if (this.target === null) {
            return;
        }

        var src = this.node.getPosition();
        var dst = this.target.getPosition();
        var dir = dst.sub(src);
        var len = dir.mag();
    //    console.log("距离："+len)

        if (len <= this.attack_R) { // 发起攻击
            // 停止行走

            
            this.agent.stop_walk(dst);
          //  console.log("attack")
          

    
        
        }else{
            //停止攻击
            this.agent.walk_to(dst);
 
        }
  
    
    }

    update (dt) {
        this.now_time += dt;
        if (this.now_time >= this.think_time) {
            this.do_AI();
            this.now_time = 0;
        }
    }
}
