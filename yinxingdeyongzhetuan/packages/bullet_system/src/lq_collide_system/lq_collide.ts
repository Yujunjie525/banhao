import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import requireComponent = cc._decorator.requireComponent;
import menu = cc._decorator.menu;
import Component = cc.Component;
import Enum = cc.Enum;
import Size = cc.Size;
import Vec2 = cc.Vec2;
import Graphics = cc.Graphics;
import Node = cc.Node;
import macro = cc.macro;
import Color = cc.Color;
import {LQCollideShape, LQCollideStatus} from "../lq_base/data/lq_const";
import {LQCollideConfig, LQCollideInfoList} from "./lq_collide_config";
import {LQCollideSystem} from "./lq_collide_system";
import {LQRect} from "../lq_base/data/lq_data";
import {LQCollideBase} from "./lq_collide_base";
import {LQGameUtil} from "../lq_base/util/lq_game_util";

@ccclass
@requireComponent(LQCollideBase)
@menu("lq/collide")
export class LQCollide extends Component {
    @property({displayName: '绘制形状'})
    get draw_collide(): boolean {
        return this._draw_collide;
    }

    set draw_collide(value: boolean) {
        this._draw_collide = value;
        this.draw_shape();
    }

    @property
    protected _draw_collide: boolean = false;

    @property({
        tooltip: '碰撞形状，None就是无敌，不参与碰撞',
        type: Enum(LQCollideShape),
        displayName: '碰撞形状'
    })
    get collide_shape(): LQCollideShape {
        return this._collide_shape;
    }

    set collide_shape(value: LQCollideShape) {
        this._collide_shape = value;
        this.draw_shape();
    }

    @property()
    public _collide_shape: LQCollideShape = LQCollideShape.Rect;

    @property({
        type: Enum(LQCollideInfoList), tooltip: '碰撞类别',
        displayName: '碰撞类别'
    })
    get collide_group_index() {
        if (this._collide_group_index === -1) {
            this._collide_group_index = LQCollideSystem.get_info_by_id(this.collide_group_id).index;
        }
        return this._collide_group_index;
    }

    set collide_group_index(value) {
        if (this._collide_group_index === value) {
            return;
        }
        this._collide_group_index = value;
        this.collide_group_id = LQCollideSystem.get_group_by_index(value).id;
    }

    @property({serializable: false})
    private _collide_group_index = -1;

    @property({visible: false})
    protected collide_group_id: number = 0;

    @property({
        tooltip: 'collide半径',
        visible() {
            // @ts-ignore
            return this._collide_shape === LQCollideShape.Circle;
        },
        displayName: '半径'
    })
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
        this.draw_shape();
    }

    @property()
    protected _radius: number = 50;

    @property({
        tooltip: 'collide长宽',
        visible() {
            // @ts-ignore
            return this._collide_shape === LQCollideShape.Rect;
        },
        displayName: '长宽'
    })
    get size(): Size {
        return this._size;
    }

    set size(value: Size) {
        this._size = value;
        if (this.world_rect) {
            this.world_rect.width = value.width;
            this.world_rect.height = value.height;
            this.world_rect.half_width = value.width * 0.5;
            this.world_rect.half_height = value.height * 0.5;
        }
        this.draw_shape();
    }

    @property()
    protected _size: Size = new Size(100, 100);

    @property({displayName: '位置偏移'})
    get offset(): Vec2 {
        return this._offset;
    }

    set offset(value: Vec2) {
        this._offset = value;
        this.draw_shape();
    }

    @property({
        type: Vec2,
        visible() {
            // @ts-ignore
            return this._collide_shape === LQCollideShape.Polygon;
        },
        displayName: '多边形碰撞点'
    })
    get polygon_points(): Vec2[] {
        return this._polygon_points;
    }

    set polygon_points(value: Vec2[]) {
        this._polygon_points = value;
        this.draw_shape();
    }

    @property()
    public _polygon_points: Vec2[] = [new Vec2(-100, -50), new Vec2(0, 100), new Vec2(100, -50)];
    //collide碰撞位置偏移
    @property()
    public _offset: Vec2 = new Vec2(0, 0);

    @property({displayName: '自定义字符串'})
    public data_string: string = '';
    //每个collide的id唯一
    public collide_id: number = 0;
    //状态
    public collide_status: LQCollideStatus = LQCollideStatus.Idle;
    //是否可碰撞
    public is_enable: boolean = true;
    //是否开启碰撞前后的函数
    public is_open_func: boolean = false;
    //碰撞类别
    public collide_category = 0;
    //碰撞筛选
    public collide_mask = 0;
    //缓存多边形碰撞数据
    public cache_polygon_points: Vec2[] | undefined;
    public cache_axes: Vec2[] | undefined;
    //绘制collide形状组件
    private _debugDrawer!: Graphics;
    public world_rect!: LQRect;
    public collide_map: { [key: number]: { collide: LQCollide, status: 1 | 2 } } = {};
    public follow_target_category: number | undefined;
    private static id_maker: number = 1;

    //检测绘制组件是否添加
    private checkDebugDrawValid() {
        if (!this._debugDrawer || !this._debugDrawer.isValid) {
            let node = this.node.getChildByName('Collide');
            if (!node) {
                node = new Node('Collide');
                node.zIndex = macro.MAX_ZINDEX;
                this.node.addChild(node);
                // @ts-ignore
                node._objFlags = 1096;
                this._debugDrawer = node.addComponent(Graphics);
                this._debugDrawer.lineWidth = 3;
                this._debugDrawer.strokeColor = new Color(255, 0, 0);
                this._debugDrawer.fillColor = new Color(255, 0, 0);
            } else {
                this._debugDrawer = node.getComponent(Graphics);
            }
        }
    }

    //绘制形状
    protected draw_shape() {
        if (!this._draw_collide) {
            if (this._debugDrawer) {
                this._debugDrawer.clear();
            }
            return;
        }
        this.checkDebugDrawValid();
        this._debugDrawer.clear();
        let o1 = {key: 'scaleX', value: this.node.scaleX};
        let o2 = {key: 'scaleY', value: this.node.scaleY};
        LQGameUtil.recursion_node_property(this.node, o1);
        LQGameUtil.recursion_node_property(this.node, o2);
        if (o1.value === 0 || o2.value === 0) {
            return;
        }
        this._debugDrawer.node.scaleX = 1 / o1.value;
        this._debugDrawer.node.scaleY = 1 / o2.value;
        switch (this._collide_shape) {
            case LQCollideShape.Circle:
                this._debugDrawer.circle(+this._offset.x, +this._offset.y, this._radius);
                this._debugDrawer.stroke();
                break;
            case LQCollideShape.Rect:
                this._debugDrawer.moveTo(-this._size.width * 0.5 + this._offset.x, -this._size.height * 0.5 + this._offset.y);
                this._debugDrawer.lineTo(-this._size.width * 0.5 + this._offset.x, +this._size.height * 0.5 + this._offset.y);
                this._debugDrawer.lineTo(this._size.width * 0.5 + this._offset.x, +this._size.height * 0.5 + this._offset.y);
                this._debugDrawer.lineTo(this._size.width * 0.5 + this._offset.x, -this._size.height * 0.5 + this._offset.y);
                this._debugDrawer.lineTo(-this._size.width * 0.5 + this._offset.x, -this._size.height * 0.5 + this._offset.y);
                this._debugDrawer.stroke();
                break;
            case LQCollideShape.Polygon:
                this._debugDrawer.moveTo(this._polygon_points[0].x + this._offset.x, this._polygon_points[0].y + this._offset.y);
                for (let i = 1; i < this._polygon_points.length; i++) {
                    this._debugDrawer.lineTo(this._polygon_points[i].x + this._offset.x, this._polygon_points[i].y + this._offset.y);
                }
                this._debugDrawer.lineTo(this._polygon_points[0].x + this._offset.x, this._polygon_points[0].y + this._offset.y);
                this._debugDrawer.stroke();
                break;
        }
    }

    //仅用于矩形
    public update_size(width: number, height: number) {
        this._size.width = width;
        this.world_rect.width = width;
        this.world_rect.half_width = width * 0.5;
        this._size.height = height;
        this.world_rect.height = height;
        this.world_rect.half_height = height * 0.5;
        this.draw_shape();
    }

    public init() {
        this.world_rect = new LQRect(0, 0, this._size.width, this._size.height);
        this.draw_shape();
        this.node.on(Node.EventType.ROTATION_CHANGED, () => {
            this.cache_polygon_points = undefined;
        }, this);
        this.node.on(Node.EventType.POSITION_CHANGED, () => {
            this.cache_polygon_points = undefined;
        });
        const info = LQCollideSystem.get_info_by_id(this.collide_group_id);
        this.collide_mask = info.mask;
        this.collide_category = info.category;
        this.collide_id = LQCollide.id_maker++;
    }

    public enable_collide() {
        if (this.collide_status === LQCollideStatus.Live) {
            console.warn(this.node.name + '重复添加');
            return;
        }
        this.is_enable = true;
        this.collide_status = LQCollideStatus.Live;
        LQCollideSystem.add_collide(this);
    }

    public disable_collide() {
        if (this.collide_status !== LQCollideStatus.Live) {
            return;
        }
        this.is_enable = false;
        this.collide_status = LQCollideStatus.Idle;
        LQCollideSystem.remove_collide(this);
    }

    // @ts-ignore
    public on_collide(collide: LQCollide): void {
        if (LQCollideConfig.switch_print_log) {
            console.log(this.node.name + ' collide');
        }
    }

    //@ts-ignore
    public on_enter(collide: LQCollide) {
        if (LQCollideConfig.switch_print_log) {
            console.log(this.node.name + ' on_enter');
        }
    }

    //@ts-ignore
    public on_exit(collide: LQCollide) {
        if (LQCollideConfig.switch_print_log) {
            console.log(this.node.name + ' on_exit');
        }
    }
}