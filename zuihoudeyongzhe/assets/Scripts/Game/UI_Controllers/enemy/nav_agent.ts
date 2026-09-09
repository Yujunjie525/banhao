import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";


	

const {ccclass, property} = cc._decorator;

@ccclass
export default class nav_agent extends cc.Component {
  
    @property(LQBulletEmitter)
    fire_wq: LQBulletEmitter[] = [];
 

    @property({tooltip:"速度"})
    speed: number = 500
    private is_walking: boolean = false
    private walk_time: number = 0
    private vx: number = 0
    private vy: number = 0
    private passed_time: number = 0
    private degree: number = 0
    private dir:cc.Vec2=cc.v2(0,0)
    private enemy4=null
   
 //  private butter:cc.Prefab=null

    start() {
        this.is_walking = false;
        this.enemy4=this.getComponent("enemy1_Ctrl")  
        
      //  this.fire_wq=this.node.getChildByName("fire").getComponent("lq_bullet_emitter")


    }

    stop_walk(dst) {
     

        this.is_walking = false;
        var src = this.node.getPosition();
        this. dir = dst.sub(src);
     
       //旋转飞机
        var r = Math.atan2(this.dir.y, this.dir.x)
        this.degree = r * 180 / Math.PI;
        this.node.angle = this.degree + 90;
        if(this.fire_wq!=[]){
            let _length=this.fire_wq.length
            for(let i=0;i< _length;i++){
                this.fire_wq[i]. origin_angle_min= this.degree
                this.fire_wq[i]. origin_angle_max= this.degree
            }
            
          
           
           }else{
            console.log("fire_wq==null");
           }
        //    if(this.butter){
            
        //     this.butter.data.getComponent("lq_bullet").angle=this.node.angle
        //     console.log("butter导出：",             this.butter.data.getComponent("lq_bullet").angle
        //     )
        //  }
   
        if(this.enemy4!=null){
       //  console.log("可以打他了")

         this.enemy4.start_fire=true
        }
    
         
    }
    // 自然而然就有了;
    walk_to(dst) {
        var src = this.node.getPosition();
        this. dir = dst.sub(src);
        var len =this. dir.mag();
        //这里写角度

//           var r = Math.atan2(this.dir.y, this.dir.x)
//           this. degree = r * 180 / Math.PI;
//           this.node.angle = this.degree +90;

        if (len <= 0) {
            return;
        }


        this.walk_time = len / this.speed;
        this.vx = this.speed * this.dir.x / len;
        this.vy = this.speed * this.dir.y / len;
        this.passed_time = 0;
        this.is_walking = true; 
    }

    update (dt) {
        if (this.is_walking === false) {

                   return;
        } 

        this.passed_time += dt;
        if (this.passed_time > this.walk_time) {
            dt -= (this.passed_time - this.walk_time);
        }

         //旋转飞机
        var r = Math.atan2(this.dir.y, this.dir.x)
        this.degree = r * 180 / Math.PI;
        this.node.angle = this.degree + 90;
        if(this.fire_wq!=null){
            let _length=this.fire_wq.length
            for(let i=0;i< _length;i++){
                this.fire_wq[i]. origin_angle_min= this.degree
                this.fire_wq[i]. origin_angle_max= this.degree
            }
            
           
           }
        //    if(this.butter){
            
        //     this.butter.data.getComponent("lq_bullet").angle=this.node.angle
        //       console.log("butter导出：",             this.butter.data.getComponent("lq_bullet").angle
        //       )
        //    }





        this.node.x += (this.vx * dt);
        this.node.y += (this.vy * dt);
       
  





        // end 

        if (this.passed_time >= this.walk_time) {
            this.is_walking = false;
        }
    }
}
