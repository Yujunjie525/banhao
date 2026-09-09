
import EventMgr from "../../../Managers/EventMgr";
import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";
import SoundMgr from "../../../Managers/SoundMgr";
import UserData from "../../UserData";
import mGameData from "../../../Load/GameData";
const {ccclass, property} = cc._decorator;

@ccclass
export default class boss2_Ctrl extends cc.Component {
    @property({tooltip:"速度"})
    speed: number =0
 
   // @property({tooltip:"是否携带武器"})
 
    @property({tooltip:"打爆后分数"})
     score:number=0;
 
   @property(LQBulletEmitter)//发射器
     bullet_emitter_arr: LQBulletEmitter = null;
 
   @property({tooltip:"生命值"})
   hp : number = 0;


 
 
   private  isFire: boolean = false//是否携带武器
 
   private isDie: boolean = false
   private node_speed:number=0
   private hpR:cc.Node=null
   private start_hp:number=0
  // private pao1:cc.Node=null;
 
 
  // private left_arms:LQBulletEmitter= null//左炮
   onLoad() {
 
   }
   private init() {
    this.hp+=(mGameData.currentLevel*10)
       this.start_hp=this.hp
     this.hpR=this.node.getChildByName("hp").getChildByName("hpR")
 
   this.node_speed=this.speed+Math.random()*this.speed
  // this.pao1=this.node.getChildByName("pao1")
 
 //  this.left_arms= this.pao1.getChildByName("w1") .getComponent("lq_bullet_emitter")//左边炮
 //   this.left_arms.pause_system() ;
 
 
 
 
     if (this.bullet_emitter_arr != null) {//先判断有没有武器
       this.isFire = true
     } else {
       this.isFire = false
     }
     if (this.isFire) {
      // console.log("我是携带武器的飞机")
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
     //this.node.y += 5
     this.hp-=del_hp
     if(this.hpR){
         this.hpR.scaleX=this.hp/this.start_hp
       //  console.log("我还剩下："+this.hpR.scaleX)
 
     }
 
     if (this.hp <= 0) {
       this.isDie = true
       this.die()
     }
 
 
 
   }
   private endPlay() {
     //动画播放完毕的回调
     //PoolManager.Despawn(this.node.name,this.node)
     //console.log("我走的是动画的：")
     EventMgr.Instance.dispatch_event("destroyBoss", this.node)
   
 
  
 
   }
   die() {
     //先播放摧毁动画
     this. node.getComponent(cc.PolygonCollider).enabled = false
     this.node.destroyAllChildren()
     SoundMgr.Instance.play_effect("enemy_blowup")//播放声音
     EventMgr.Instance.dispatch_event("getScore", this.score)
 
     var amin_ts = this.node.getComponent("FrameAnim")
     if (amin_ts) {
       amin_ts.playOnce(this.endPlay,this);//播放动画
 
  }else{
       EventMgr.Instance.dispatch_event("destroyBoss", this.node)
 
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
       /** 获取把 node1移动到 node2位置后的坐标 */
 
 
 // private getPlayerPos() :cc.Vec2 {
 //   var _node:cc.Node=this.node.parent.parent.getChildByName("player_root")
 //   console.log("玩家坐标="+_node.getPosition())
 //   return _node.getPosition()
 // }
   // start () {
   // }
 
   update(dt) {
 
     if (this.isDie) {
       return
     }
 
 
     this.node.y = this.node.y - this.node_speed * dt  
 
     if (this.node.y <= 300) {
         this.node.y = 300
 
     }
 
 
 
 
 
 
 

     if (this.isFire) {
 
       //发射器属性修改
       if (this.node.y <= 500) {
       //  console.log("敌机开火了————————————————————")
       if( this.isFire ){
         this.bullet_emitter_arr.start_system()
 
       }
 
       }
     }
 
 
 
 
 
 
 
 
 
 
 
   }
 }