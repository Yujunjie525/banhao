export class Define {

    /******************资源地址******************* */
    public static readonly RES_JSON_URL = "config/"
    public static readonly RES_MAP_PREFAB = "prefab/map/"
    public static readonly RES_MONSTER_ALATS = "texture/monster/"
    public static readonly RES_ALATS = "texture/"
    public static readonly RES_TEAM_PREFAB = "map/team/"
    public static readonly RES_PREFAB = "prefab/"
    public static readonly RES_BOSS = "prefab/boss/"
    public static readonly RES_ICON = "texture/icon/"
    public static readonly EFFECT_URL: String = "texture/effect/"
    public static readonly RES_ROLE = "texture/role/"
    public static readonly RES_SKILL = "texture/skillicon/"
    public static readonly RES_MUSIC = "music/"
    public static readonly RES_LOADING = "prefab/loading/"
    
    /****************加载资源的类型***************** */
    public static readonly RES_TYPE_BUNDLE = "bundle"
    public static readonly RES_TYPE_BMFONT = "bmfont"
    public static readonly RES_TYPE_JSON = "json"
    public static readonly RES_TYPE_ATLAS = "atlas"
    public static readonly RES_TYPE_FRAME = "frame"
    public static readonly RES_TYPE_PREFAB = "prefab"
    public static readonly RES_TYPE_MP3 = "mp3"
    public static readonly RES_TYPE_ANIMCLIP = "animClip"
}

/**
 * 缓动动画预设
 */
export abstract class TweenPreSet {

    public static readonly fadeIn: cc.Tween = cc.tween().by(0.2, {opacity: 255.0});

    public static readonly fadeOut: cc.Tween = cc.tween().by(0.2, {opacity: -255.0});

    public static readonly gen: cc.Tween = cc.tween().parallel(
        cc.tween().to(0.2, {opacity: 255.0}),
        cc.tween().to(0.3, {scale: 1.0}, { easing: (t: number)=>cc.easeBezierAction(0.0, 0.3, 2.0, 1.0).easing(t) })
    );

    public static readonly shakeLR: cc.Tween = cc.tween()
        .by(0.0375, {x: -6}, {easing: 'sineOut'})
        .by(0.075, {x: 11}, {easing: 'sineInOut'})
        .by(0.075, {x: -9}, {easing: 'sineInOut'})
        .by(0.075, {x: 7}, {easing: 'sineInOut'})
        .by(0.0375, {x: -3}, {easing: 'sineIn'});

    public static readonly shakeAngle: cc.Tween = cc.tween()
        .by(0.0375, {angle: -6}, {easing: 'sineOut'})
        .by(0.075, {angle: 11}, {easing: 'sineInOut'})
        .by(0.075, {angle: -9}, {easing: 'sineInOut'})
        .by(0.075, {angle: 7}, {easing: 'sineInOut'})
        .by(0.0375, {angle: -3}, {easing: 'sineIn'});

    public static readonly shakeAngleSlow: cc.Tween = cc.tween()
        .by(0.1, {angle: 6}, {easing: 'sineOut'})
        .by(0.2, {angle: -11}, {easing: 'sineInOut'})
        .by(0.2, {angle: 9}, {easing: 'sineInOut'})
        .by(0.2, {angle: -7}, {easing: 'sineInOut'})
        .by(0.1, {angle: 3}, {easing: 'sineIn'});

    public static readonly twinkleSlow: cc.Tween = cc.tween().to(1.0, {opacity: 0.0}, {easing: 'sineIn'}).to(1.0, {opacity: 255.0}, {easing: 'sineOut'});

    public static readonly twinkleFast: cc.Tween = cc.tween().to(0.05, {opacity: 255.0}, {easing: 'cubicIn'}).to(0.05, {opacity: 0.0}, {easing: 'cubicOut'});

}