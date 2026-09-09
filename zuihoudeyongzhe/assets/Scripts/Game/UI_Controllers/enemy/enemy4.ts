import EventMgr from "../../../Managers/EventMgr";
import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";
import SoundMgr from "../../../Managers/SoundMgr";
//import PoolManager from "../../../Managers/PoolManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class enemy4 extends cc.Component {
   


  // @property({tooltip:"是否携带武器"})

   @property({tooltip:"打爆后分数"})
    score:number=0;

  @property(LQBulletEmitter)//发射器
    bullet_emitter_arr: LQBulletEmitter = null;

  @property({tooltip:"生命值"})
  hp : number = 0;

  @property({tooltip:"起始位置"})
  pos_enemy : cc.Vec2 = cc.v2(0,0);

  @property({tooltip:"允许出现的个数"})
  public amount:number=10


  private  isFire: boolean = false//是否携带武器

  private isDie: boolean = false
  //private node_speed:number=0
  public start_fire:boolean=false
  onLoad() {

  }
  private init() {

    if(this.pos_enemy.x==0&&this.pos_enemy.y==0){
      this. pos_enemy.x = -200 + Math.random() * 420
      this. pos_enemy.y = 600 + Math.random() * 200
      this.node.setPosition(this. pos_enemy)
    }else{
 

      //先判断左右
      var lOrR=Math.random()
      if(lOrR>0.5){
         this.pos_enemy.x=(-this.pos_enemy.x)
         console.log("左边坐标")
      }else {
         console.log("右边坐标")
      }
     // var uOrd=Math.random()//是上是下
      // var y_abs=Math.floor(Math.random()*this.pos_enemy.y)+1
      // this.pos_enemy.y=y_abs
    //   if(uOrd>0.5){
    //     this.pos_enemy.y=y_abs
    //     console.log("上坐标")
    //  }else{
    //   this.pos_enemy.y=(-y_abs)
    //     console.log("下坐标")
    //  }
    //    this.pos_enemy.y= this.pos_enemy.y -(Math.random() * (this.pos_enemy.y*2) ) 
      this.node.setPosition(this. pos_enemy)
    }




    if (this.bullet_emitter_arr != null) {//先判断有没有武器
      this.isFire = true
    } else {
      this.isFire = false
    }
    if (this.isFire) {
      console.log("我是携带武器的飞机")
      this.bullet_emitter_arr.pause_system();//先不开枪
    }
 

  }

  start() {
    this.init();
  }

  hit(del_hp:number) {

    if (this.isDie) {
      return
    }
    this.node.y += 5
    this.hp-=del_hp
    if (this.hp <= 0) {
      this.isDie = true
      this.die()
    }



  }
  private endPlay() {
    //动画播放完毕的回调
    //PoolManager.Despawn(this.node.name,this.node)
 
   EventMgr.Instance.dispatch_event("destroyEmemy", this.node)

  }
  die() {
    //先播放摧毁动画
    //解除碰撞
   this. node.getComponent(cc.PolygonCollider).enabled = false
    this.node.destroyAllChildren()
    SoundMgr.Instance.play_effect("enemy_blowup")//播放声音
    EventMgr.Instance.dispatch_event("getScore", this.score)

    var amin_ts = this.node.getComponent("FrameAnim")
    if (amin_ts) {
      amin_ts.playOnce(this.endPlay);//播放动画

    }




  }

  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    if(other.node.group!="player"&&other.node.group!="shield"){//不是盾或玩家
      var power=other.getComponent("Collision_bullet"). bulletPower
    console.log("谁打的我？："+other.name+"子弹威力："+power)
    if(power){
      this.hit(power)
    }else{
      this.hit(1)

    }




  }
}




  // start () {
  // }

  update(dt) {

    if (this.isDie) {
      return
    }







    if (this.isFire) {

      //发射器属性修改
      if (this.start_fire) {
      //  console.log("敌机开火了————————————————————")
        this.bullet_emitter_arr.start_system()

      }
    }









    if (this.node.y <= -654) {
      this.node.destroyAllChildren()

    //  console.log("回收飞机")
     EventMgr.Instance.dispatch_event("destroyEmemy", this.node)
    }








  }
}
