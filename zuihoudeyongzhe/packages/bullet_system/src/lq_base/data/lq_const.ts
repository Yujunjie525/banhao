import Vec2 = cc.Vec2;

export enum LQBulletEmitterStatus {
    Idle, Start, End
}

export enum LQCollideShape {
    Rect = 1, Circle, Polygon
}

export enum LQFollowTargetMode {
    Always, Once, Pass
}

export enum LQCollideStatus {
    Idle, Live
}

export enum LQEasing {
    BackIn = 'backIn', BackOut = 'backOut', quadIn = 'quadIn',
    quadOut = 'quadOut', quadInOut = 'quadInOut', cubicIn = 'cubicIn', expoOut = 'expoOut'
}

export enum LQHttpRequestType {
    Get = 'get', Post = 'post'
}

export enum LQHttpDataType {
    Text, Binary
}

export enum LQPlatformType {
    unknown = '未知平台', all = '全平台', wx = '微信', tt = '字节跳动', oppo = 'oppo', vivo = 'vivo', qq = 'qq', baidu = '百度', kwaigame = '快手', android = '安卓', ios = '苹果', browser = '浏览器'
}

export enum LQByteDanceType {
    tt = '头条', tt_lite = '头条极速版', douyin = '抖音', douyin_lite = '抖音极速版', ppx = '皮皮虾', devtools = '字节开发工具'
}

export enum LQAnalysisTag {
    VideoComplete = 'video_complete', VideoBegin = 'video_begin', VideoInterrupt = 'video_interrupt', InterstitialShow = 'interstitial_show', BannerShow = 'banner_show', ExportShow = 'export_show', NativeShow = 'native_show', NativeClick = 'native_show'
}

export enum LQCallBase {
    InitSdk, KeepScreenOn, Vibrate, GetVersionCode, GetVersionName, OpenUrl, DeleteDir, DeleteFile
}

export enum LQCallAd {
    ShowBanner, HideBanner, ShowVideo, ShowInterstitial, ShowNative, CacheAd
}

export enum LQLevelStatus {
    Begin, Failed, Complete
}

export enum LQOperateType {
    ClickNode, ClickScreen, Move, Null
}

export class LQConst {
    public static VEC_ZERO = Vec2.ZERO;
}

