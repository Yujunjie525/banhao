import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import menu = cc._decorator.menu;
import {LQCollide} from "../lq_collide_system/lq_collide";
import {LQBulletEmitter} from "./lq_bullet_emitter";
import {LQFollowTargetMode} from "../lq_base/data/lq_const";
import {LQPoolUtil} from "../lq_base/util/lq_pool_util";
import {Curves, LQBulletSystem} from "./lq_bullet_system";
import {LQCollideConfig} from "../lq_collide_system/lq_collide_config";

@ccclass
@menu("lq/bullet")
export class LQBullet extends LQCollide {
    @property({displayName: '生命'})
    public life: number = 3;
    @property({displayName: '速度'})
    public speed: number = 10;
    @property({displayName: '开启速度曲线'})
    public switch_speed_curve: boolean = false;

    @property({
        displayName: '速度曲线',
        type: cc.Vec2,
        visible() {
            return this.switch_speed_curve;
        }
    })
    get speed_timeline(): cc.Vec2[] {
        return this._speed_timeline;
    }

    set speed_timeline(value: cc.Vec2[]) {
        for (let i = 0; i < value.length; i++) {
            const v = value[i];
            if (v.x < 0) {
                v.x = 0;
            }
            if (v.x > 1) {
                v.x = 1;
            }
            if (v.y < 0) {
                v.y = 0;
            }
            if (v.y > 1) {
                v.y = 1;
            }
        }
        value.sort((a, b) => {
            return a.x - b.x;
        });
        value[0].x = 0;
        value[value.length - 1].x = 1;
        this._speed_timeline = value;
    }

    @property
    private _speed_timeline: cc.Vec2[] = [cc.v2(0, 0), cc.v2(1, 1)];
    @property({displayName: '角度'})
    public angle: number = 0;
    @property({displayName: '是否关联自身角度'})
    public related_self_angle: boolean = true;
    @property({displayName: '自定义路径'})
    public is_custom_pos: boolean = false;
    @property({
        displayName: '路径文件', visible() {
            return this.is_custom_pos;
        }, type: cc.AnimationClip
    })
    public ani_clip: cc.AnimationClip = undefined;
    @property({
        displayName: '翻转x', visible() {
            return this.is_custom_pos;
        }
    })
    public flip_x: boolean = false;
    @property({
        displayName: '翻转y', visible() {
            return this.is_custom_pos;
        }
    })
    public flip_y: boolean = false;
    @property({displayName: '是否跟踪目标'})
    public switch_follow_target: boolean = false;
    @property({
        type: cc.Enum(LQFollowTargetMode),
        displayName: '跟踪模式', visible() {
            return this.switch_follow_target;
        }
    })
    public follow_target_mode: LQFollowTargetMode = LQFollowTargetMode.Always;
    @property({
        displayName: '跟踪转向幅度', visible() {
            return this.switch_follow_target && this.follow_target_mode !== LQFollowTargetMode.Once;
        }
    })
    public follow_target_range: number = 80;

    public auto_recovery: boolean = true;
    public bullet_emitter: LQBulletEmitter;
    public target_collide: LQCollide;
    public move_speed_ratio;
    public set_follow_target_angle: boolean;
    public radians: number;
    public gravity: cc.Vec2;
    public cur_life: number;
    public cur_gravity: cc.Vec2;
    public start_pos: cc.Vec2;
    public follow_dt: number;
    public is_running: boolean;
    public curves: Curves;
    public user_data: any;

    public reset_data() {
        this.is_running = true;
        this.set_follow_target_angle = false;
        this.target_collide = undefined;
        this.move_speed_ratio = 1;
        this.cur_life = 0;
        this.cur_gravity = cc.Vec2.ZERO;
        this.gravity = undefined;
        this.start_pos = undefined;
        this.curves = undefined;
        this.follow_dt = 0;
        this.user_data = undefined;
    }

    public destroy_bullet(is_life_over: boolean = false, destroy_time: number = 0) {
        if (!this.is_running) {
            return;
        }
        this.is_running = false;
        const cb = () => {
            if (CC_EDITOR || !this.auto_recovery) {
                this.node.destroy();
            } else {
                LQPoolUtil.push_node_to_pool(this.node);
            }
        };
        if (destroy_time > 0) {
            this.scheduleOnce(() => {
                cb();
            }, destroy_time);
        } else {
            cb();
        }
        this.disable_collide();
        LQBulletSystem.remove_bullet(this);
        this.on_bullet_destroy(is_life_over);
    }

    public on_bullet_create() {

    }

    public on_bullet_destroy(is_life_over: boolean) {
        if (LQCollideConfig.switch_print_log) {
            console.log(this.node.name + ' on_bullet_destroy, is_life_over:' + is_life_over);
        }
    }
}