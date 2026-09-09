

const { ccclass, property } = cc._decorator;
import UserData from "../../UserData";
import { LQCollide } from "../../../../lq_collide_system/lq_collide";
import mGameData from "../../../Load/GameData";
//import {LQBullet} from "../../../../lq_bullet_system/lq_bullet";
//import {LQBullet} from "../../../../lq_bullet_system/lq_bullet";
@ccclass
//玩家子弹脚本
export default class Collision_bullet extends cc.Component {

  @property({ tooltip: "子弹伤害" })
  public bulletPower: number = 1
  private selfSprite: cc.SpriteFrame = null//原先的子弹图标
  private selfScale: number = 1

  private sprite: cc.Sprite = null;
  private amin_ts = null







  start() {

    this.amin_ts = this.node.getComponent("FrameAnim")
    this.bulletPower += UserData.Instance.userData["power"]//叠加子弹伤害 可以自己写个其他算法
    // 加上穿甲弹技术的技能效果（技能ID为4）
    const armorPiercingBonus = mGameData.getSkillEffect(4);
    this.bulletPower += armorPiercingBonus;
    // console.log("基础子弹伤害：", this.bulletPower - UserData.Instance.userData["power"] - armorPiercingBonus, "穿甲弹加成：", armorPiercingBonus, "最终子弹伤害：", this.bulletPower);

    this.selfScale = this.node.scale
    this.sprite = this.node.getComponent(cc.Sprite)
    if (this.sprite) {
      this.selfSprite = this.sprite.spriteFrame
    }
    const lqCollide: LQCollide = this.node.getComponent("lq_collide")
    lqCollide.on_collide = (c) => {
      lqCollide.disable_collide()//取消碰撞
      if (this.amin_ts) {
        this.amin_ts.playOnce(this.endPlay, this);//播放完动画回调
      } else {
        let ts = this.node.getComponent("lq_bullet")
        if (ts) {
          ts.destroy_bullet()

        } else {
          this.node.destroy()
        }
      }



    };

  }
  //销毁子弹
  private destroyBullet() {
    //  (this.node as unknown as LQBullet).destroy_bullet();//调用此方法自动回收子弹

    let ts = this.node.getComponent("lq_bullet")
    if (ts) {

      ts.destroy_bullet()
    } else {
      this.node.destroy()
    }

  }


  private endPlay() {
    this.sprite.spriteFrame = this.selfSprite//动画播放完还原图片
    this.node.scale = this.selfScale
    this.destroyBullet()
  }


  update(dt) {
    if (this.node.x > 420 || this.node.x < -420) {
      this.node.destroy()
    } else if (this.node.y > 700|| this.node.y < -700) {
      this.node.destroy()
    }



  }
}
