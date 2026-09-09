import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import playOnFocus = cc._decorator.playOnFocus;
import executeInEditMode = cc._decorator.executeInEditMode;
import menu = cc._decorator.menu;
import {LQBulletEmitterStatus} from "../lq_base/data/lq_const";
import {LQMathUtil} from "../lq_base/util/lq_math_util";
import {LQBullet} from "./lq_bullet";
import {LQBulletSystem} from "./lq_bullet_system";

@ccclass
@executeInEditMode
@playOnFocus
@menu("lq/emitter")
export class LQBulletEmitter extends cc.Component {
    @property({displayName: '预览'})
    get edit_in_system(): boolean {
        return this._edit_in_system;
    }

    set edit_in_system(value: boolean) {
        this._edit_in_system = value;
        if (value) {
            this.status = LQBulletEmitterStatus.Idle;
            if (this.prefab && CC_EDITOR) {
                //@ts-ignore
                cc.AssetLibrary.loadAsset(this.prefab._uuid, (err, sp) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    this.prefab = sp;
                });
            }

        } else {
            this.status = LQBulletEmitterStatus.End;
        }
    }

    @property
    private _edit_in_system: boolean = true;

    @property({displayName: '循环发射'})
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (value && this.status === LQBulletEmitterStatus.End) {
            this.status = LQBulletEmitterStatus.Idle;
        }
    }

    @property
    private _loop: boolean = true;

    @property({type: cc.Prefab, displayName: '子弹载体'})
    get prefab(): cc.Prefab {
        return this._prefab;
    }

    set prefab(value: cc.Prefab) {
        this._prefab = value;
        if (value) {
            this.is_new_prefab = true;
        }
    }

    @property
    private _prefab: cc.Prefab = undefined;

    @property({displayName: '延迟时间最小值', min: 0})
    get delay_min(): number {
        return this._delay_min;
    }

    set delay_min(value: number) {
        this._delay_min = value;
        this.delay = LQMathUtil.random(this._delay_min, this._delay_max);
    }

    @property({displayName: '延迟时间最大值', min: 0})
    get delay_max(): number {
        return this._delay_max;
    }

    set delay_max(value: number) {
        this._delay_max = value;
        this.delay = LQMathUtil.random(this._delay_min, this._delay_max);
    }

    @property
    private _delay_min: number = 0;
    @property
    private _delay_max: number = 0;

    @property({displayName: '持续时间最小值', min: -1})
    get duration_min(): number {
        return this._duration_min;
    }

    set duration_min(value: number) {
        this._duration_min = value;
        this.duration = LQMathUtil.random(this._duration_min, this._delay_max);
        if (this.duration === -1) {
            this.duration = Number.MAX_SAFE_INTEGER;
        }
    }

    @property({displayName: '持续时间最大值', min: -1})
    get duration_max(): number {
        return this._duration_max;
    }

    set duration_max(value: number) {
        this._duration_max = value;
        this.duration = LQMathUtil.random(this._duration_min, this._delay_max);
        if (this.duration === -1) {
            this.duration = Number.MAX_SAFE_INTEGER;
        }
    }

    @property
    private _duration_min: number = 3;
    @property
    private _duration_max: number = 3;

    @property({displayName: '间隔时间最小值', min: 0})
    get interval_min(): number {
        return this._interval_min;
    }

    set interval_min(value: number) {
        this._interval_min = value;
        this.interval = LQMathUtil.random(this._interval_min, this._interval_max);
    }

    @property({displayName: '间隔时间最大值', min: 0})
    get interval_max(): number {
        return this._interval_max;
    }

    set interval_max(value: number) {
        this._interval_max = value;
        this.interval = LQMathUtil.random(this._interval_min, this._interval_max);
    }

    @property
    private _interval_min: number = 1;
    @property
    private _interval_max: number = 1;

    @property({displayName: '每次发射数量最小值', min: 1})
    get count_min(): number {
        return this._count_min;
    }

    set count_min(value: number) {
        this._count_min = value;
        this.count = LQMathUtil.random_int(this._count_min, this._count_max);
    }

    @property({displayName: '每次发射数量最大值', min: 1})
    get count_max(): number {
        return this._count_max;
    }

    set count_max(value: number) {
        this._count_max = value;
        this.count = LQMathUtil.random_int(this._count_min, this._count_max);
    }

    @property
    private _count_min: number = 1;
    @property
    private _count_max: number = 1;

    @property({displayName: '初始角度最小值'})
    public origin_angle_min: number = 0;
    @property({displayName: '初始角度最大值'})
    public origin_angle_max: number = 0;

    @property({displayName: '是否重置角度'})
    public switch_reset_angle: boolean = false;

    @property({displayName: '变化角度最小值'})
    get change_angle_min(): number {
        return this._change_angle_min;
    }

    set change_angle_min(value: number) {
        this._change_angle_min = value;
        this.angle_total = 0;
    }

    @property({displayName: '变化角度最大值'})
    get change_angle_max(): number {
        return this._change_angle_max;
    }

    set change_angle_max(value: number) {
        this._change_angle_max = value;
        this.angle_total = 0;
    }

    @property
    private _change_angle_min: number = 30;
    @property
    private _change_angle_max: number = 30;

    @property({displayName: 'x位置偏移最小值'})
    public off_x_min: number = 0;
    @property({displayName: 'x位置偏移最大值'})
    public off_x_max: number = 0;
    @property({displayName: 'y位置偏移最小值'})
    public off_y_min: number = 0;
    @property({displayName: 'y位置偏移最大值'})
    public off_y_max: number = 0;

    @property({displayName: '是否关联自身的坐标'})
    public related_owner_position: boolean = true;
    @property({displayName: '是否开启重力场'})
    public switch_gravity: boolean = false;
    @property({
        displayName: '重力场', visible() {
            return this.switch_gravity;
        }
    })
    public gravity: cc.Vec2 = cc.v2(0, -10);

    public user_data: any;
    public prefab_bullet_arr: LQBullet[] = [];
    public prefab_emitter: LQBulletEmitter = undefined;
    public is_enable: boolean = true;
    public edit_update: boolean = false;
    public emitter_speed_ratio: number = 1;
    public status: LQBulletEmitterStatus = LQBulletEmitterStatus.Idle;
    public cur_interval: number;
    public cur_duration: number;
    public round_index: number;
    public duration: number;
    public count: number;
    public interval: number;
    public delay: number;
    public angle_total: number;
    public is_new_prefab: boolean;
    public auto_destroy: boolean;
    public auto_create: boolean = true;

    public clone(new_emitter: LQBulletEmitter) {
        new_emitter.loop = this._loop;
        new_emitter.prefab = this._prefab;
        new_emitter.delay_min = this._delay_min;
        new_emitter.delay_max = this._delay_max;
        new_emitter.duration_min = this._duration_min;
        new_emitter.duration_max = this._duration_max;
        new_emitter.interval_min = this._interval_min;
        new_emitter.interval_max = this._interval_max;
        new_emitter.count_min = this._count_min;
        new_emitter.count_max = this._count_max;
        new_emitter.origin_angle_min = this.origin_angle_min;
        new_emitter.origin_angle_max = this.origin_angle_max;
        new_emitter.switch_reset_angle = this.switch_reset_angle;
        new_emitter.change_angle_min = this._change_angle_min;
        new_emitter.change_angle_max = this._change_angle_max;
        new_emitter.off_x_min = this.off_x_min;
        new_emitter.off_x_max = this.off_x_max;
        new_emitter.off_y_min = this.off_y_min;
        new_emitter.off_y_max = this.off_y_max;
        new_emitter.switch_gravity = this.switch_gravity;
        new_emitter.gravity.x = this.gravity.x;
        new_emitter.gravity.y = this.gravity.y;
        new_emitter.auto_create = this.auto_create;
        new_emitter.auto_destroy = this.auto_destroy;
    }

    protected start(): void {
        LQBulletSystem.init_emitter(this);
        if (this.auto_create) {
            LQBulletSystem.create_emitter(this);
        }
    }


    protected update(dt): void {
        if (CC_EDITOR && this.edit_update) {
            LQBulletSystem.update_logic(dt);
        }
    }

    protected resetInEditor() {
        this.edit_update = true;
    }

    protected onFocusInEditor() {
        this.edit_update = true;
    }

    protected onLostFocusInEditor() {
        this.edit_update = false;
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            const child = this.node.children[i];
            if (child.name === '_bullet_') {
                child.destroy();
            }
        }
    }

    public pause_system() {
        this.is_enable = false;
    }

    public start_system() {
        this.is_enable = true;
    }

    public reset_system() {
        this.is_enable = true;
        this.status = LQBulletEmitterStatus.Idle;
    }

    // @ts-ignore
    public on_bullet_create(bullet_arr: LQBullet[], round_index: number): void {

    }
}