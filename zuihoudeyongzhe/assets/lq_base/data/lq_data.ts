import {IPos, IRect} from "./lq_interface";
import Vec2 = cc.Vec2;
import Rect = cc.Rect;
import Sprite = cc.Sprite;
import Label = cc.Label;

export class LQRect implements IRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public half_width: number;
    public half_height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.half_width = width * 0.5;
        this.half_height = height * 0.5;
    }

    public top_left(): Vec2 {
        return new Vec2(this.x - this.half_width, this.y + this.half_height);
    }

    public top_right(): Vec2 {
        return new Vec2(this.x + this.half_width, this.y + this.half_height);
    }

    public bottom_left(): Vec2 {
        return new Vec2(this.x - this.half_width, this.y - this.half_height);
    }

    public bottom_right(): Vec2 {
        return new Vec2(this.x + this.half_width, this.y - this.half_height);
    }

    public pos(): cc.Vec2 {
        return new Vec2(this.x, this.y);
    }

    public sub(pos: IPos): Vec2 {
        return new Vec2(pos.x - this.x, pos.y - this.y);
    }

    public add(pos: IPos): Vec2 {
        return new Vec2(pos.x + this.x, pos.y + this.y);
    }

    public to_cocos_rect() {
        return new Rect(this.x - this.half_width, this.y - this.half_height, this.width, this.height);
    }
}

export class LQNativeComponent {
    public node_btn_arr: Node[] = [];
    public sprite_logo!: Sprite;
    public sprite_img!: Sprite;
    public sprite_ad_tip!: Sprite;
    public label_title!: Label;
    public label_desc!: Label;
}

export class LQShareData {
    public title!: string;
    public remote_url!: string;
    public url_id!: string;
    public query!: string;
    public content!: string;
    public extra!: string;
    public type!: string;
}

export class LQPlatformData {
    public app_id!: string;
    public show_share_menu!: boolean;
    public keep_screen_on!: boolean;
    public banner_id!: string;
    public banner_width!: number;
    public interstitial_id!: string;
    public native_id!: string;
    public video_id!: string;
    public is_video_free!: boolean;
    public is_cache_video!: boolean;
    public ad_type!: string;
    public ad_id!: string;
    public ad_key!: string;
    public switch_ad!: boolean;
    public share_data_arr!: LQShareData[];
}