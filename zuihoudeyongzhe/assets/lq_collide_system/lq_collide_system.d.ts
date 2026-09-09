import {LQCollide} from "./lq_collide";

export class LQCollideSystem {
    //是否开启检测
    public static is_enable: boolean;

    //所有collide集合
    public static collide_arr: LQCollide[];

    //驱动函数
    public static update_logic(dt: number);

    //注册
    public static add_collide(collide: LQCollide);

    //移除
    public static remove_collide(collide: LQCollide);

    //清除所有
    public static clear(is_destroy: boolean = false);

    //内部方法
    public static get_group_by_index(id: number);

    //内部方法
    public static get_info_by_id(id: number);

    //获取collide的碰撞体集合
    public static check_collide(collide: LQCollide) :LQCollide[];
}