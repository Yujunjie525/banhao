import {IPos, IRect} from "../data/lq_interface";

export class LQMathUtil {
    public static random(min: number, max: number): number {
        if (min === max) {
            return min;
        } else if (min < max) {
            return Math.random() * (max - min) + min;
        } else {
            return Math.random() * (min - max) + max;
        }
    }

    public static random_int(min: number, max: number): number {
        return Math.floor(this.random(min, max));
    }

    public static get_radians(pos: IPos, target_pos: IPos) {
        const r = Math.atan2(target_pos.y - pos.y, target_pos.x - pos.x);
        return r > 0 ? r : r + 6.28;
    }

    public static intersects_rect(r1: IRect, r2: IRect): boolean {
        return Math.abs(r1.x - r2.x) < r1.half_width + r2.half_width && Math.abs(r1.y - r2.y) < r1.half_height + r2.half_height;
    }

    public static intersects_point_rect(p: IPos, r: IRect): boolean {
        return (p.x > r.x - r.width * 0.5) && (p.x < r.x + r.width * 0.5) && (p.y > r.y - r.height * 0.5) && (p.y < r.y + r.height * 0.5);
    }

    public static intersects_point_circle(p1: IPos, p2: IPos, r: number) {
        return p1.sub(p2).magSqr() < r * r;
    }

    public static intersects_circle(p1: IPos, r1: number, p2: IPos, r2: number) {
        return p1.sub(p2).mag() < r1 + r2;
    }

    public static intersects_circle_rect(p: IPos, r: number, rect: IRect) {
        const relative_x = p.x - rect.x;
        const relative_y = p.y - rect.y;
        const dx = Math.min(relative_x, rect.half_width);
        const dx1 = Math.max(dx, -rect.half_width);
        const dy = Math.min(relative_y, rect.half_height);
        const dy1 = Math.max(dy, -rect.half_height);
        return (dx1 - relative_x) * (dx1 - relative_x) + (dy1 - relative_y) * (dy1 - relative_y) <= r * r;
    }
}