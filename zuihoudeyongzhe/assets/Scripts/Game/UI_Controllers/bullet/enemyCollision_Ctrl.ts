

const { ccclass, property } = cc._decorator;
import UserData from "../../UserData";
import { LQCollide } from "../../../../lq_collide_system/lq_collide";
import mGameData from "../../../Load/GameData";

@ccclass
//敌机子弹
export default class enemyCollision_Ctrl extends cc.Component {

  @property({ tooltip: "子弹伤害" })
  public bulletPower: number = 1

  private amin_ts = null

  private selfSprite: cc.SpriteFrame = null

  private sprite: cc.Sprite = null;
  private selfScale: number = 1


  // onLoad () {}

  start() {
    this.amin_ts = this.node.getComponent("FrameAnim")
    this.bulletPower += mGameData.currentLevel//敌机子弹伤害 = 本身伤害+当前关卡
    this.selfScale = this.node.scale

    this.sprite = this.node.getComponent(cc.Sprite)
    if (this.sprite) {
      this.selfSprite = this.sprite.spriteFrame
    }


    const lqCollide: LQCollide = this.node.getComponent("lq_collide")
    lqCollide.on_collide = (c) => {
      lqCollide.disable_collide()
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
    this.sprite.spriteFrame = this.selfSprite
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
