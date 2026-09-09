import EventMgr from "../../../Managers/EventMgr";
import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";
import SoundMgr from "../../../Managers/SoundMgr";
//import LevelData from "../../UserData"
import UserData from "../../UserData";
import { LQCollide } from "../../../../lq_collide_system/lq_collide";
//import PoolManager from "../../../Managers/PoolManager";
import mGameData from "../../../Load/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class enemy1_Ctrl extends cc.Component {


  @property({ tooltip: "下落速度" ,displayName: '速度'})
  speed: number = 0

  // @property({tooltip:"是否携带武器"})

  @property({ tooltip: "打爆后分数" ,displayName: '分数'})
  score: number = 0;

  @property(LQBulletEmitter)//发射器
  bullet_emitter: LQBulletEmitter = null;

  @property({ tooltip: "敌机的生命值" ,displayName: '生命'})
  hp: number = 1;
  @property({ tooltip: "如果为true只走地图中间区域。" ,displayName: '是不是船类'})
  isShip: boolean = false
  @property({ tooltip: "允许出现的个数,如果是1就永远只刷1个,其他数量随关卡递增",displayName: '最大数量' })
  amount: number = 10

  @property({ tooltip: "如果为true将停止刷敌机" ,displayName: '是否唯一'})
  isOnlyONe: boolean = false


  @property({ tooltip: "填写数字，1为从上到下非，2位朝玩家方向飞。" ,displayName: '敌机类型'})
  type: number = 1


  @property({ tooltip: "创建后起始位置",displayName: '起始位置' })
  pos_enemy: cc.Vec2 = cc.v2(0, 0);


  @property({ tooltip: "走到一定位置是否停下来",displayName: '停止位置' })
  private stop_por: number = 0

  @property({ tooltip: "是否掉了物品" ,displayName: '掉了物品' })
  private isReward: boolean = true


  @property({ tooltip: "发射子弹速度是否受到关卡影响",displayName: '速度增加'  })
  private isAttack_speed: boolean = true

  @property({ tooltip: "血量是否受到关卡影响" ,displayName: '血量增加' })
  private isHp_v: boolean = true

  @property({ tooltip: "敌机爆炸后的音效" ,displayName: '音效' })
  private sound: string = "enemy_blowup"

  @property({ tooltip: "击中是否有回弹效果" ,displayName: '回弹' })
  private drawBack: boolean = true






  private isFire: boolean = false//是否携带武器

  private isDie: boolean = false
  private node_speed: number = 0
  private attack_speed: number = 0
  private lqCollide: LQCollide = null;
  onLoad() {
    if (this.isAttack_speed) {
      this.attack_speed = mGameData.currentLevel * 0.05  //攻击速度

    }
    if (this.isHp_v) {
      this.hp +=(mGameData.currentLevel*2) //敌机血量=自身血量+当前关卡
      //console.log("我的血量：" + this.hp)
    }
    //this.amount=UserData.Instance.userData["nowLevel"]*100
    // console.log("当前关卡onLoad："+this.amount)
  }
  private defaultPos() {
    this.pos_enemy.x = -200 + Math.random() * 420
    this.pos_enemy.y = 600 + Math.random() * 200
    this.node.setPosition(this.pos_enemy)
  }
  //生成掉了物品
  private reward() {

    EventMgr.Instance.dispatch_event("createEnemyGold", this.node.getPosition())
  }
  private init() {
   // console.log("当前关卡start：" + this.amount)

    switch (this.type) {
      case 1:
        //一般从上到下的飞机

        if (!this.isShip) {
          if (this.pos_enemy.x == 0 && this.pos_enemy.y == 0) {
            this.defaultPos()

          } else {
            this.node.setPosition(this.pos_enemy)
          }
        } else {
          //写船的坐标
          if (this.pos_enemy.x == 0 && this.pos_enemy.y == 0) {
            this.pos_enemy.x = 0//先在中间吧
            this.pos_enemy.y = 600 + Math.random() * 200
            this.node.setPosition(this.pos_enemy)

          } else {
            this.node.setPosition(this.pos_enemy)
          }

          //console.log("我是船的坐标")
        }
        this.node_speed = this.speed + Math.random() * this.speed  //随机速度








        break
      case 2:


        if (this.pos_enemy.x == 0 && this.pos_enemy.y == 0) {
          this.defaultPos()
        } else {


          //先判断左右
          var lOrR = Math.random()
          if (lOrR > 0.5) {
            this.pos_enemy.x = (-this.pos_enemy.x)
            //  console.log("左边坐标")
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
          this.node.setPosition(this.pos_enemy)
        }












        break
      default:

        break
    }








    if (this.bullet_emitter != null) {//先判断有没有武器
      this.isFire = true
    } else {
      this.isFire = false
    }
    if (this.isFire) {
      // console.log("我是携带武器的飞机")
      this.bullet_emitter.pause_system();//先不开枪
      if (this.isAttack_speed) {
        //修改发射速度 随着关卡加速
        var Mspeed = this.bullet_emitter.interval_min -= this.attack_speed
        if (Mspeed <= 1) {//防止攻击速度过快
          this.bullet_emitter.interval_min = 1
          this.bullet_emitter.interval_max = 1
        } else {
          this.bullet_emitter.interval_min = Mspeed
          this.bullet_emitter.interval_max = Mspeed
        }


      }

    }


  }

  start() {
    this.init();
    this.lqCollide = this.node.getComponent("lq_collide")
    this.lqCollide.on_collide = (c) => {
      //  console.log("cccc_enemy",c);


      if (c.node.group != "player" && c.node.group != "shield") {//不是盾或玩家
        var power = c.getComponent("Collision_bullet").bulletPower
      //  console.log("谁打的我？：" + c.name + "子弹威力+++++++++++：" + power)
        if (power) {
          this.hit(power)
        } else {
          this.hit(1)

        }
      }


    };
  }

  public hit(del_hp: number) {

    if (this.isDie) {
      return
    }

    if(this.drawBack){
      this.node.y += 5
    }
    
    this.hp -= del_hp
    if (this.hp <= 0) {
      this.isDie = true
      this.die()
    }



  }
  private endPlay() {
    //动画播放完毕的回调


    EventMgr.Instance.dispatch_event("destroyEmemy", this.node)

  }
  die() {
    //取消碰撞
    this.lqCollide.disable_collide()
    // this.node.removeComponent("lq_collide")
 
    this.node.destroyAllChildren()


    if(this.isOnlyONe){
      EventMgr.Instance.dispatch_event("stopUpPlane", false)
    }
  


    SoundMgr.Instance.play_effect(this.sound)//播放声音
    EventMgr.Instance.dispatch_event("getScore", this.score)

    var amin_ts = this.node.getComponent("FrameAnim")
    if (amin_ts) {
      amin_ts.playOnce(this.endPlay, this);//播放动画

    }

    if (this.isReward) {

      this.reward()//掉了物品

    }


  }

  // onCollisionEnter(other: cc.Collider, self: cc.Collider) {
  //   if (other.node.group != "player" && other.node.group != "shield") {//不是盾或玩家
  //     var power = other.getComponent("Collision_bullet").bulletPower
  //   //  console.log("谁打的我？：" + other.name + "子弹威力+++++++++++：" + power)
  //     if (power) {
  //       this.hit(power)
  //     } else {
  //       this.hit(1)

  //     }
  //   }





  // }





  update(dt) {

    if (this.isDie) {
      return
    }







    if (this.isFire) {

      //发射器属性修改
      if (this.node.y <= 500) {
        //  console.log("敌机开火了————————————————————")
        this.bullet_emitter.start_system()

      }
    }







    if (this.type == 1) {
      this.node.y = this.node.y - this.node_speed * dt

      if (this.stop_por != 0) {
        if (this.node.y <= this.stop_por) {
          this.node.y = this.stop_por

        }
      }

    }

    if (this.node.y <= -654) {
      this.destroy_node()

    }








  }
  //回收飞机 外部调用 
  public destroy_node() {
    this.node.destroyAllChildren()
    EventMgr.Instance.dispatch_event("destroyEmemy", this.node)
  }

}
