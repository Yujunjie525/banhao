import { LQBulletEmitter } from "../../../../lq_bullet_system/lq_bullet_emitter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class pet_arms_Ctrl extends cc.Component {

  @property(LQBulletEmitter)//发射器
  left_arms: LQBulletEmitter = null;


  @property({ tooltip: "武器的角度偏移" })
  arms_degree: number = 0


  @property({ tooltip: "目标类型是不是玩家" })
  tagatIsPlayer: boolean = false


  private fireTime = 1
  private fireTime_jishi = 0//换目标计时器
  private enemy = null



  // private target:cc.Node=null
  // private enemy=null;



  init() {
    this.left_arms.pause_system();

  }

  start() {
    this.init()
  }
  private pao1Fire(_isFire: boolean) {











    if (this.get_tagat() != null) {
      try {
        var dst = this.get_tagat().getPosition();

        //把炮的坐标转成和player_root一样的的空间坐标
        var src = this.node.parent.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0, 0)))




        var dir = dst.sub(src);
        var r = Math.atan2(dir.y, dir.x)
        var degree = r * 180 / Math.PI;
        this.node.angle = degree - 90;


        if (this.left_arms != null) {
          this.left_arms.origin_angle_min = degree - this.arms_degree
          this.left_arms.origin_angle_max = degree - this.arms_degree

        }
        if (_isFire) {
          this.left_arms.start_system()
        } else {
          this.left_arms.pause_system()
        }
      } catch {
        // console.log("无法获取坐标")
      }

    }



















  }


  private get_tagat(): cc.Node {
    var target = null
    if (this.tagatIsPlayer) {
      if (this.node.parent.parent.parent.getChildByName("player_root")) {
        target = this.node.parent.parent.parent.getChildByName("player_root")

      } else {
        target = null
      }
    } else {
      this.enemy = this.node.parent.parent.parent.getChildByName("enemy_root").children

      if (this.enemy.length > 0) {
        var num_random = Math.floor(Math.random() * this.enemy.length) + 1//随机点名
        if (this.enemy[num_random]) {
          target = this.enemy[num_random]

        } else {
          target = null
        }

        // console.log("随机数："+num_random)


      } else {
        this.enemy = this.node.parent.parent.parent.getChildByName("boss_root").children
        if (this.enemy.length > 0) {
          //  console.log("我在攻击boss")

          if (this.enemy[0]) {
            target = this.enemy[0]

          } else {
            target = null
          }
        }

      }
    }


    return target

  }
  update(dt) {
    this.fireTime_jishi += dt//一秒换一个目标
    if (this.fireTime_jishi >= this.fireTime) {

      this.pao1Fire(true)







    }




















  }
}
