

const {ccclass, property} = cc._decorator;

@ccclass
export default class award_AI extends cc.Component {

    @property({tooltip:"反应时间"})
     think_time: number = 0.03

     @property({tooltip:"吸收范围"})
     attack_R: number =200

     @property({tooltip:"是不是宠物"})
     ispet: boolean =false
     private now_time=null
     private agent=null//导航组件
     private target=null//玩家

    start () {
        this.now_time = this.think_time;
        // 功能组件实例;
        this.agent = this.getComponent("award_agent");
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
        if(this.ispet){//如果是宠物
            if (len <= this.attack_R) { 
                
                this.agent.stop_walk(dst);// 宠物不动
              
    
              
            
    
        
            
            }else{
               
                this.agent.walk_to(dst);//宠物走到飞机位置
     
            }
        }else{
            if (len <= this.attack_R) { // 吸走金币

                this.agent.walk_to(dst);
           
    
        
            }
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

