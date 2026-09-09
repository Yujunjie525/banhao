import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";
import FrameAnim from "../../../Managers/FrameAnim";

const {ccclass, property} = cc._decorator;

@ccclass
export default class arms_Ctrl extends cc.Component {




    @property(LQBulletEmitter)//发射器
    left_arms: LQBulletEmitter = null;


    @property({tooltip:"炮间隔时间"})
    left_arms_times_over: number = 180//炮间隔时间
    @property({tooltip:"炮开火时间"})
    left_arms_fire_times_over: number = 60//左炮开火时间
    @property({tooltip:"武器的角度偏移"})
    arms_degree:number=30
    @property({tooltip:"默认是否直接开火"})
    public  isFire:boolean=false

    @property({tooltip:"是否判断目标大于自身坐标不开火"})
    public  isFire_y:boolean=false


    // @property(cc.Node)
    // public  kaiPao:cc.Node = null
    @property(cc.Node)
    public kaiPao: cc.Node = null;


    private left_arms_times: number = 0//炮间隔计时器
    private left_arms_fire_times: number = 0//炮开火计时器
  
    private target:cc.Node=null
  //  private kaiPaoComponent:FrameAnim=null




    // onLoad () {}
    init() {
      if(this.left_arms!=null){
        this.left_arms.pause_system();

      }
     if(this.kaiPao!=null){
        this.kaiPao.active=false
        
       }
        this. target=this.node.parent.parent.parent. getChildByName("player_root")
    }

    start () {
          this.init()
    }
    private pao1Fire(_isFire:boolean){
      if(_isFire){
        this.left_arms.start_system()
     
      }else{
        this.left_arms.pause_system() 
        // if(this.kaiPao!=null){
        //   this.kaiPao.active=false
        // }
      }
      
          var dst =this.target.getPosition();
        //  console.log("炮开火",dst)
               
              //把炮的坐标转成和player_root一样的的空间坐标
                var src=this.node.parent.parent. convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,0)))
      
      
                if(src.y<dst.y&&this.isFire_y){
                  this.left_arms.pause_system() 
                  return
    
                }
      
                var dir = dst.sub(src);
                var r = Math.atan2(dir.y, dir.x)
                var degree = r * 180 / Math.PI;
                this.node.angle = degree - 90;
      
        
         if(this.left_arms!=null){
         this.  left_arms. origin_angle_min= degree -this.arms_degree
         this.  left_arms. origin_angle_max= degree -this.arms_degree
        
        }

    


       
      
       
      
      
      
      
               
      }
    update (dt) {


            if(this.isFire){
                this.pao1Fire(false)//停火
          
                this.left_arms_times++
            
               
            
             // console.log( this.left_arms_times)
              if(this.left_arms_times>=this.left_arms_times_over){
              
                this.pao1Fire(true)//开火
                this.left_arms_fire_times++
                if(this.kaiPao!=null){
                  this.kaiPao.active=true
                }
                if(this.left_arms_fire_times>=this.left_arms_fire_times_over){
                  this.left_arms_fire_times=0
                  this.left_arms_times=0
                  this.pao1Fire(false)//停火
                  if(this.kaiPao!=null){
                    this.kaiPao.active=false
                  }
            
                }
                 
             
                
               
              }
            }
   
       
        








    }
}
