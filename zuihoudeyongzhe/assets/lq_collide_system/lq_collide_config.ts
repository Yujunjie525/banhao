export enum LQCollideInfoList {
    default, role, role_bullet, enemy, enemy_bullet, prop, shield
}

export class LQCollideConfig {
    public static switch_auto_run: boolean = true;
    public static switch_print_log: boolean = false;
    public static switch_quad_tree: boolean = true;
    public static max_node_len: number = 10;
    public static max_node_level: number = 4;
    public static active_area_x: number = 0;
    public static active_area_y: number = 0;
    public static active_area_width: number = 1000;
    public static active_area_height: number = 1000;
    public static collide_group_map = {
        "default": {id: 1, category: 1, index: 0, mask: 1},
        "role": {id: 2, category: 2, index: 1, mask: 56},
        "role_bullet": {id: 3, category: 4, index: 2, mask: 8},
        "enemy": {id: 4, category: 8, index: 3, mask: 70},
        "enemy_bullet": {id: 5, category: 16, index: 4, mask: 66},
        "prop": {id: 6, category: 32, index: 5, mask: 2},
        "shield": {id: 7, category: 64, index: 6, mask: 24},
    }
}