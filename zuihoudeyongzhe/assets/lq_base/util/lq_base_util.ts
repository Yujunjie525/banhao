import {LQPlatformUtil} from "./lq_platform_util";
import {LQPlatformType} from "../data/lq_const";
import view = cc.view;
import Vec2 = cc.Vec2;

export class LQBaseUtil {
    // public static readonly unit_arr = ['K', 'M', 'B', 'T'];

    public static has_value<T>(arr: T[], v: T): boolean {
        let has = false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === v) {
                has = true;
                break;
            }
        }
        return has;
    }

    public static get_value_by_duration(percent: number, timeline: Vec2[]): number {
        if (timeline.length === 0) {
            return 1;
        }
        let end_index = -1;
        for (let i = 1; i < timeline.length; i++) {
            if (timeline[i].x > percent) {
                end_index = i;
                break;
            }
        }
        if (end_index === -1) {
            return timeline[timeline.length - 1].y;
        }
        const start_index = end_index - 1;
        return timeline[start_index].y + (timeline[end_index].y - timeline[start_index].y) * ((percent - timeline[start_index].x) / (timeline[end_index].x - timeline[start_index].x));
    }

    public static number_to_counting(num: number): string {
        if (num < 1000) {
            return num + '';
        } else if (num < 1000000) {
            return Math.floor(num / 1000) + 'K';
        } else if (num < 1000000000) {
            return Math.floor(num / 1000000) + 'M';
        } else if (num < 1000000000000) {
            return Math.floor(num / 1000000000) + 'B';
        } else if (num < 1000000000000000) {
            return Math.floor(num / 1000000000000) + 'T';
        }
        return Math.floor(num / 1000000000000) + 'T';
    }

    public static number_to_time(time: number): [string, string, string] {
        const t = Math.floor(time / (60 * 60));
        time = time - t * 60 * 60;
        let hour = t.toString();
        let min = Math.floor(time / 60).toString();
        let sec = (time % 60).toString();

        if (hour.length === 1) {
            hour = '0' + hour;
        }
        if (min.length === 1) {
            min = '0' + min;
        }
        if (sec.length === 1) {
            sec = '0' + sec;
        }
        return [hour, min, sec];
    }

    public static set_normal_angle(angle: number) {
        while (angle > 360) {
            angle -= 360;
        }
        while (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    public static compare_version(v1: string, v2: string): number {
        let v1_arr = v1.split('.');
        let v2_arr = v2.split('.');
        const len = Math.max(v1_arr.length, v2_arr.length);

        while (v1_arr.length < len) {
            v1_arr.push('0');
        }
        while (v2_arr.length < len) {
            v2_arr.push('0');
        }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1_arr[i]);
            const num2 = parseInt(v2_arr[i]);

            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    }

    public static is_today(date: string): boolean {
        const d1 = new Date();
        let d2;
        if (date && date !== '') {
            d2 = new Date(date);
        } else {
            d2 = new Date();
            d2.setDate(d2.getDate() - 1);
        }
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    }

    public static is_safe_area(): boolean {
        const cb = (width: number, height: number) => {
            return (width === 2280 && height === 1080) || (width === 1792 && height === 828) || (width === 2436 && height === 1125) || (width === 2688 && height === 1242);
        };
        switch (LQPlatformUtil.get_platform()) {
            case LQPlatformType.baidu:
                const sys_info_swan = swan.getSystemInfoSync();
                return cb(sys_info_swan.pixelRatio * sys_info_swan.screenWidth, sys_info_swan.pixelRatio * sys_info_swan.screenHeight);
            case LQPlatformType.qq:
                const sys_info_qq = qq.getSystemInfoSync();
                return cb(sys_info_qq.pixelRatio * sys_info_qq.screenWidth, sys_info_qq.pixelRatio * sys_info_qq.screenHeight);
            case LQPlatformType.tt:
                const sys_info_tt = tt.getSystemInfoSync();
                return cb(sys_info_tt.pixelRatio * sys_info_tt.screenWidth, sys_info_tt.pixelRatio * sys_info_tt.screenHeight);
            case LQPlatformType.oppo:
            case LQPlatformType.vivo:
                const sys_info_vivo = qg.getSystemInfoSync();
                return cb(sys_info_vivo.pixelRatio * sys_info_vivo.screenWidth, sys_info_vivo.pixelRatio * sys_info_vivo.screenHeight);
            case LQPlatformType.wx:
                const sys_info_wx = wx.getSystemInfoSync();
                return cb(sys_info_wx.pixelRatio * sys_info_wx.screenWidth, sys_info_wx.pixelRatio * sys_info_wx.screenHeight);
            case LQPlatformType.android:
                break;
            case LQPlatformType.ios:
                let size = view.getFrameSize();
                return cb(size.width, size.height);
        }
        return false;
    }

    public static deep_clone(obj: any) {
        if (typeof obj !== 'object') {
            return obj;
        }
        let new_obj = (obj instanceof Array ? [] : {}) as any;
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                new_obj[key] = this.deep_clone(obj[key]);
            } else {
                new_obj[key] = obj[key];
            }
        }
        return new_obj;
    }
}