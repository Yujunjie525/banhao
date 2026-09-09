import {LQBullet} from "./lq_bullet";
import {LQBulletEmitter} from "./lq_bullet_emitter";

export class Curves {
	
}

export class LQBulletSystem {
    public static bullet_arr: LQBullet[];
    public static bullet_emitter_arr: LQBulletEmitter[];
    public static is_emitter_enable;
    public static is_bullet_enable;
    //驱动函数.内部方法
    public static update_logic(dt: number);
    //创建发射器，内部方法
    public static create_emitter(emitter: LQBulletEmitter);
    //初始化发射器，内部方法
    public static init_emitter(emitter: LQBulletEmitter);
    //移除发射器，内部方法
    public static remove_emitter(emitter: LQBulletEmitter);
    //添加子弹，内部方法
    public static add_bullet(bullet: LQBullet);
    //移除子弹，内部方法
    public static remove_bullet(bullet: LQBullet);
    //清除所有子弹
    public static clear(is_destroy: boolean);
}
