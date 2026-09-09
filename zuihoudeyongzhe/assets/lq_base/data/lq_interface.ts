import Vec2 = cc.Vec2;

export interface IPos {
    x: number;
    y: number;

    sub(pos: IPos): Vec2;

    add(pos: IPos): Vec2;
}

export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
    half_width: number;
    half_height: number;

    sub(pos: IPos): Vec2;

    add(pos: IPos): Vec2;
}