//import Collision_bullet from "../Collision_bullet";


const {ccclass, property} = cc._decorator;

@ccclass
export default class pet_AI extends cc.Component {
      @property({tooltip:"反应时间"})
       think_time: number = 0.03
      @property({tooltip:"距离"})
      len:number=100
      @property({tooltip:"是不是成对出现"})
      isTow:boolean=true
      @property({tooltip:"是不是向左右开火的那种"})
      fire_RorL:boolean=false
     
    public  bullet_angle:boolean=false  //子弹要不要翻转
    public  isRight:boolean=false        //是不是第二个


     private now_time=null
     private agent=null//导航组件
     private target=null//玩家


     
    
     private emitter=null
 
    // onLoad () {}
   public init(){
        this.now_time = this.think_time;
        // 功能组件实例;
        this.agent = this.getComponent("pet_agent");
        this.target=this.node.parent.parent.getChildByName("player_root")

        if(this.bullet_angle){
            this.emitter=this.node.getChildByName("emitter").getComponent("lq_bullet_emitter")

            console.log("我就修改了子弹角度")
            this.emitter.origin_angle_min-=180
            console.log("最小变化角度"+this.emitter.origin_angle_min)
            this.emitter.origin_angle_max-=180
            console.log("最大变化角度"+this.emitter.origin_angle_max)
          }



    }
    start () {
           this.init()
    }
    do_AI() {
        if (this.target === null) {
            return;
        }

      //  var src = this.node.getPosition();
        var dst = this.target.getPosition();
      //  var dir = dst.sub(src);
     //   var len = dir.mag();
         //    console.log("距离："+len)
              if(!this.isRight){
                this.agent.walk_to(cc.v2(dst.x -this.len, dst.y))

              }else{
                this.agent.walk_to(cc.v2(dst.x +this.len, dst.y))
 
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
