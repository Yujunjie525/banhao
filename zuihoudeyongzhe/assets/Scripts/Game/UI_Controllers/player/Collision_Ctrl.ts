const { ccclass, property } = cc._decorator;
import EventMgr from "../../../Managers/EventMgr";
import UserData from "../../UserData";
import {LQCollide} from "../../../../lq_collide_system/lq_collide";

@ccclass
export default class Collision_Ctrl extends cc.Component {
  //玩家脚本
  public play_ph: number = 5
  public isInvincible: boolean = false;
  private start_hp: number = 0

  onLoad() {

  }

  start() {
    //this.play_ph+=UserData.Instance.userData["shield"]

    this.start_hp = this.play_ph
    const lqCollide:LQCollide=this.node.getComponent("lq_collide")
    lqCollide.on_collide = (c) => {
      
      

      switch (c.node.group) {

        case "box":
          EventMgr.Instance.dispatch_event("GetSupply",c.node)
  
          break
  
        case "enemy":
          this.vibrate("medium")//震动
         // console.log("敌机名字：" + c.node.name + "敌机的tag：" + c.tag)
          if (!this.isInvincible) {
            this.play_ph -= 1
         
          }
  
  
          break
        case "enemy_bullet":
          //    console.log("敌机子弹名字：" + other.node.name + "敌机子弹的tag：" + other.tag)
          if (!this.isInvincible) {
            //中弹后震动
            this.vibrate("light")//震动
  
            var power = c.getComponent("enemyCollision_Ctrl").bulletPower
            //  console.log("谁打的我？：" + c.name + "子弹威力+++++++++++：" + power)
            if (power) {
              this.play_ph -= power
            } else {
              this.play_ph -= 1
            }
  
  
  
  
  
  
  
          }
  
  
          break
  
        case "treatment":
          //如果是治疗
          this.box_treatment(0.1)//加十分之一血
  
          break
        default:
  
          break
      }
  
      EventMgr.Instance.dispatch_event("playHpR", this.play_ph / this.start_hp)
  
  
  
      if (this.play_ph <= 0) {
       // console.log("玩家被秒" + c.name + "子弹威力+++++++++++：" + power+"玩家生命"+this.play_ph)
        this.die()
      }
    }


  }








  
//吃到治疗宝箱
  public box_treatment(num: number) {
    if (this.play_ph < this.start_hp) {
    //  console.log("box加血")
      var addHp = this.start_hp * num
      if (this.play_ph + addHp >= this.start_hp) {
        this.play_ph = this.start_hp
      } else {
        this.play_ph += addHp

      }
    }
  }
  private nodeDestroy() {

    //this.node.destroy()
    EventMgr.Instance.dispatch_event("gemeOver", null)

  }
  private die() {
    var ts = this.node.getComponent("FrameAnim")
    if (ts) {
      ts.playOnce(this.nodeDestroy, this)
    }
  }

  //震动
  private vibrate(v_type: string) {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      // wx.vibrateLong()//长震动
      wx.vibrateShort({
        type: v_type
      })
    }else if(window.tt){
      tt.vibrateShort({
        success(res) {
        //  console.log(`${res}`);
        },
        fail(res) {
         // console.log(`vibrateShort调用失败`);
        },
      });
     }
  }

   update (dt) {
    //console.log( this.play_ph);
    
   }
}
