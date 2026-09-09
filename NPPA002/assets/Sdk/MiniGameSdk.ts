/**
 * 小游戏平台SDK工具封装，目前只支持微信和抖音平台
 */
export namespace MiniGameSdk {

    interface ISize {
        width: number;
        height: number;
    }

    export interface IPosition {
        top: number;
        left: number;
    }

    export function isWechat(): boolean {
        //@ts-ignore
        return window.wx !== null && window.wx !== undefined;
    }

    export function isBytedance(): boolean {
        //@ts-ignore
        return window.tt !== null && window.tt !== undefined;
    }

    function getSysWinSize(): ISize {
        let sys: any;
        if (isWechat()) {
            // @ts-ignore
            sys = wx.getSystemInfoSync();
        } else if (isBytedance()) {
            // @ts-ignore
            sys = tt.getSystemInfoSync();
        }

        let size: ISize = { width: 0, height: 0 };
        if (sys) {
            size.width = sys.windowWidth;
            size.height = sys.windowHeight;
        }

        return size;
    }

    /**
     * 插屏广告。微信抖音都支持！
     */
    class ADInterstitial {
        private _adUid: string;
        private _interstitial: any;

        get aduid() {
            return this._adUid;
        }

        constructor(adUid: string) {
            this._adUid = adUid;
        }

        show() {
            // @ts-ignore
            if (isWechat() && !wx.createInterstitialAd) {
                console.warn('wechat unsupport interstitial AD!');
                this._interstitial = null;
                return;
            }

            // @ts-ignore
            if (isBytedance() && !tt.createInterstitialAd) {
                console.warn('bytedance unsupport interstitial AD!');
                this._interstitial = null;
                return;
            }


            if (this._interstitial) {
                this._interstitial.load();
            } else {
                if (isWechat()) {
                    // @ts-ignore
                    this._interstitial = wx.createInterstitialAd({ adUnitId: this._adUid });
                } else if (isBytedance()) {
                    // @ts-ignore
                    this._interstitial = tt.createInterstitialAd({ adUnitId: this._adUid });
                } else {
                    this._interstitial = null;
                }

                this._interstitial?.onLoad(() => {
                    console.log('load interstitial ad success');
                    this._interstitial.show().catch((err: any) => {
                        console.log('catch interstitial ad error:', err);
                    });
                });

                this._interstitial?.onError((err: any) => {
                    console.log('interstitial ad on error:', err);
                });
            }
        }
        destory() {
            this._interstitial?.destroy();
        }
    }

    class ADBanner {
        private _adUid: string;
        private _banner: any;

        get aduid() {
            return this._adUid;
        }

        /**
         * 抖音和微信都支持
         * 横幅广告。预估宽度默认为300，预估高度为140。如果你不确定就按默认值来。
         * @param adUid 广告UID，后端配置
         * @param isTop 是否在屏幕顶部展示。内部会自动居中计算位置。
         * @param bannerWidth 横幅广告的预估宽度。默认300
         * @param autoShow 广告加载完成后是否立刻显示，默认为不显示
         */
        constructor(adUid: string, param: boolean | IPosition, bannerWidth: number = 300, autoShow: boolean = false) {
            this._adUid = adUid;
            this.create(autoShow, bannerWidth, param); // 默认300比较合适
        }

        private create(autoShow: boolean, bannerWidth: number, param: boolean | IPosition) {
            if (!isWechat() && !isBytedance()) {
                this._banner = null;
                return;
            }

            this.destroy();

            let winSize = getSysWinSize();

            let height = bannerWidth * 0.4;
            let top = 0, left = 0;

            if (typeof param === "boolean") {
                left = (winSize.width - bannerWidth) / 2
                top = param ? 5 : (winSize.height - height);
            } else {
                left = param.left;
                top = param.top;
            }

            let params = {
                adUnitId: this._adUid,
                adIntervals: 30,// 自动刷新频率不能小于30秒
                style: { left: left, top: top, width: bannerWidth }
            }

            if (isWechat()) {
                // @ts-ignore
                this._banner = wx.createBannerAd(params);
            } else if (isBytedance()) {
                // @ts-ignore
                this._banner = tt.createBannerAd(params);
            } else {
                this._banner = null;
            }

            this._banner?.onError((err: any) => {
                console.log('ad banner error:', err);
            });

            this._banner?.onLoad(() => {
                autoShow && this._banner.show();
            });
        }

        show() {
            this._banner?.show();
        }

        hide() {
            this._banner?.hide();
        }

        destroy() {
            this._banner?.destroy();
        }
    }

    class ADCustom {
        private _adUid: string;
        private _adCustom: any;

        get aduid() {
            return this._adUid;
        }
        /**
         * 由于原生模板广告在微信服务后端可以定制宽度大小，个数，缩放比例等，所以位置调整要根据设置的宽度来定。抖音不支持！
         * @param adUid 广告UID，后端配置
         * @param top 从左上角开始，距离屏幕顶部的距离。注意：这个数据为设备屏幕宽度width。如果需要获取屏幕的像素，需要乘以设备像素比Pixel-Ratio，例如iPhone 13 Pro的Pixel-Ratio为3，像素为Width*3。
         * @param left 从左上角开始，距离屏幕最左边的距离。注意：这个数据为设备屏幕宽度width。如果需要获取屏幕的像素，需要乘以设备像素比Pixel-Ratio，例如iPhone 13 Pro的Pixel-Ratio为3，像素为Width*3。
         * @param scale 原生模板广告的尺寸，默认为1，即100%。此值在微信服务后端广告中获得，默认为100%，目前有100%，90%，80%三种，一般情况不用修改。若有修改，记得传入值，例如90%就传入0.9。
         */
        constructor(adUid: string, top: number = 0, left: number = 0, scale: number = 1.0) {
            this._adUid = adUid;
            this.createCustomAd(top, left, scale);
        }

        private createCustomAd(top: number, left: number, scale: number) {
            if (!isWechat()) { // only wechat support custom ad
                this._adCustom = null;
                console.log('Only wechat support Custom Ad');
                return;
            }

            this.destroy();
            // 原生模板5个应用宽度为375，若设置了缩放比例，则宽度也需要设置
            // let width = 375 * this._scale;
            // let newLeft = (sys.windowWidth - width) / 2;
            // let newTop = sys.windowHeight / 2; // 120是预估高度

            // @ts-ignore
            this._adCustom = wx.createCustomAd({
                adUnitId: this._adUid,
                style: { left: left, top: top, fixed: true }
            });

            this._adCustom?.onError((err: any) => {
                console.log('ad custom error:', err);
            });
        }
        show() {
            this._adCustom?.show();
        }

        hide() {
            this._adCustom?.hide();
        }

        destroy() {
            this._adCustom?.destroy();
        }
    }


    /**
     * 视频广告用户点击行为结果
     */
    export enum EAdVideoResult {
        /**
         * 用户看完了广告，游戏可发放奖励。
         */
        ACCEPT,

        /**
         * 用户中途关闭了广告，即未看完状态。不可发放奖励。
         */
        REJECT,

        /**
         * 广告组件内部发生了错误。不可发放奖励。
         */
        ERROR,
    }

    class ADVideo {
        private _adUid: string;
        private _adVideo: any = null;

        get aduid() {
            return this._adUid;
        }

        constructor(adUid: string) {
            this._adUid = adUid;
        }

        /**
         * 由于微信和抖音视频广告机制不同，微信可以看的视频广告个数只有0和1个，抖音平台则可以看0~maxVideoCount
         * @param onResult 两个参数：第一个res是EAdVideoResult定义，第二count是用户看了多少个视频广告。
         * @param target onResult的拥有者
         * @param maxVideoCount 可以连续看最大视频个数，可最大化商业效率。默认为3个。
         * @returns 
         */
        show(onResult: (res: EAdVideoResult, count: number) => void, target?: any, maxVideoCount: number = 3): void {
            let callback = (state: EAdVideoResult, count: number) => {
                onResult?.call(target, state, count);
            }

            if (!isWechat() && !isBytedance()) {
                callback(EAdVideoResult.ACCEPT, 1);
                this._adVideo = null;
                return;
            }

            let onAdVideoClosed = (res: any) => {
                this._adVideo?.offClose(onAdVideoClosed);
                if (isWechat()) {
                    if (res && res.isEnded || res === undefined) {
                        callback(EAdVideoResult.ACCEPT, 1);
                    } else {
                        callback(EAdVideoResult.REJECT, 0);
                    }
                } else if (isBytedance()) {
                    let resConverted = res as { isEnded: boolean, count: number };
                    if (resConverted && resConverted.count > 0) {
                        callback(EAdVideoResult.ACCEPT, resConverted.count);
                    } else {
                        callback(EAdVideoResult.REJECT, 0);
                    }
                }
            }

            this._adVideo?.offClose(onAdVideoClosed);

            if (isWechat()) {
                // @ts-ignore
                this._adVideo = wx.createRewardedVideoAd({
                    adUnitId: this._adUid
                });
            } else if (isBytedance()) {
                // @ts-ignore
                this._adVideo = tt.createRewardedVideoAd({
                    adUnitId: this._adUid,
                    multiton: true,
                    multitonRewardMsg: ['多1次奖励', '再多一次奖励', '再多一次奖励'],
                    multitonRewardTimes: maxVideoCount,
                });
            } else {
                this._adVideo = null;
            }


            this._adVideo?.onLoad(() => {
                console.log('Ad load success');
            });

            this._adVideo?.onError((err: { errMsg: string, errCode: number }) => {
                console.log('Ad video error:', err);
                callback(EAdVideoResult.ERROR, 0);
            });

            this._adVideo?.onClose(onAdVideoClosed);

            this._adVideo?.show().catch(() => {
                this._adVideo?.load().then(() =>
                    this._adVideo?.show()).catch((err: { errMsg: string, errCode: number }) => {
                        console.log('Catch video ad error:', err);
                        callback(EAdVideoResult.ERROR, 0);
                    });
            });
        }

        destory() {
            this._adVideo?.destory();
        }
    }

    export enum EAdBannerLocation {
        /**
         * 屏幕顶部
         */
        TOP,

        /**
         * 屏幕底部
         */
        BOTTOM,
    }

    export class AdvertManager {

        private static _instance: AdvertManager;

        static get instance(): AdvertManager {
            if (!AdvertManager._instance) {
                AdvertManager._instance = new AdvertManager();
            }
            return AdvertManager._instance;
        }

        private _video: ADVideo;
        private _interstitial: ADInterstitial;
        private _banner: ADBanner;
        private _customs: Record<string, ADCustom> = {};

        private constructor() {

        }

        /**
         * 预加载横幅广告，不会显示。只有你在调用showBanner时才会显示。
         * 可重复调用，但是会销毁上一次的实例。一般情况，全局有一个就行了，太多占用内存，而且没必要。
         * @param adUid 广告UID
         * @param location 位置有两种情况：1、可以传入枚举值，默认上方; 2、可以自定义位置传入IPosition，注意IPosition中的top和left跟平台的top,left是一致（没有乘以设备像素比ratio），需要开发者自己调试位置
         * @param scale 默认为跟屏幕一样的宽度，可以通过设置缩放比例来调整大小。当然，平台有规定最大或最小宽度，函数内部会自动计算。
         */
        public loadBanner(adUid: string, location: EAdBannerLocation | IPosition = EAdBannerLocation.TOP, scale: number = 1.0) {
            this._banner?.destroy();
            let size: ISize = getSysWinSize();
            // 当 style.width 小于 300 时，会取作 300。 当 style.width 大于屏幕宽度时，会取作屏幕宽度。
            let width = size.width * scale;
            width = width < 300 ? 300 : width; // 最小值矫正
            width = width > size.width ? size.width : width; //最大值矫正
            this._banner = typeof location === 'number' ? new ADBanner(adUid, location === EAdBannerLocation.TOP, width, false) : new ADBanner(adUid, location, width, false);
        }

        /**
         * 显示横幅广告
         */
        public showBanner() {
            if (this._banner) {
                this._banner.show();
            } else {
                console.warn('MiniGameSDK: banner is null, you must call loadBanner(...) first!');
            }
        }

        /**
         * 隐藏横幅广告
         */
        public hideBanner() {
            this._banner?.hide();
        }

        /**
         * 弹出插屏广告
         * @param adUid 广告单元id
         */
        public showInterstitial(adUid: string) {
            if (this._interstitial && this._interstitial.aduid === adUid) {
                this._interstitial.show();
            } else {
                this._interstitial?.destory();
                this._interstitial = new ADInterstitial(adUid);
                this._interstitial.show();
            }
        }

        /**
         * 加载原生模板广告，不会显示。只有你在调用showCustom时才会显示。
         * 由于原生模板广告在微信服务后端可以定制宽度大小，个数，缩放比例等，所以位置调整要根据设置的宽度来定。抖音不支持本函数，会调用无效！
         * @param adUid 广告ID
         * @param location 位置有两种情况：1、可以传入枚举值，默认上方; 2、可以自定义位置传入IPosition，注意IPosition中的top和left跟平台的top,left是一致（没有乘以设备像素比ratio），需要开发者自己调试位置
         * @param scale 缩放比例，默认是1，即不缩放。这个缩放并不是自己填，而是根据微信MP后台你配置的原生模板广告的缩放比例填，目前有100%，90%，80%三种，一般情况不用修改。若有后台修改，记得传入值，例如90%就传入0.9。
         */
        public loadCustom(adUid: string, location: IPosition = { top: 0, left: 0 }, scale: number = 1) {
            // this._custom?.destroy();
            // this._custom = new ADCustom(adUid, location.top, location.left, scale);
            if (this._customs[adUid]) {
                console.log(`${adUid} has been loaded.`);
                return;
            }

            this._customs[adUid] = new ADCustom(adUid, location.top, location.left, scale);
        }

        /**
         * 显示自定义广告。
         * @param adUid 广告的唯一标识符。使用此标识符来查找和显示特定的自定义广告。
         * 
         * 此方法尝试根据提供的adUid显示一个自定义广告。如果给定的adUid对应的自定义广告已加载，
         * 则调用该广告的显示方法。如果广告未加载，则在控制台输出警告信息。
         */
        public showCustom(adUid: string) {
            if (this._customs[adUid]) {
                this._customs[adUid].show();
            } else {
                console.warn(`You have not load ${adUid} of Custom AD, can not show!`);
            }
        }

        /**
         * 隐藏指定的自定义广告单元
         * 
         * 此方法用于隐藏通过广告单元标识符（adUid）指定的自定义广告。如果指定的广告单元已加载并显示，
         * 则将其隐藏；如果广告单元未加载，则在控制台输出警告信息。
         * 
         * @param adUid 广告单元标识符，用于唯一标识一个自定义广告单元。
         */
        public hideCustom(adUid: string) {
            if (this._customs[adUid]) {
                this._customs[adUid].hide();
            } else {
                console.warn(`You have not load ${adUid} of Custom AD, can not hide!`);
            }
        }

        /**
         * 由于微信和抖音视频广告机制不同，微信可以看的视频广告个数只有0和1个，抖音平台则可以看0~maxVideoCount
         * @param adUid 广告ID。如果与上一次UID不同，则内部会重新创建实例。开发者完全不用关心这个细节。
         * @param onVideoResult 两个参数：第一个res是EAdVideoResult定义，第二count是用户看了多少个视频广告。 
         * @param target onVideoResult的拥有者
         * @param maxVideoCount 最大视频个数。默认是3，仅对抖音平台生效。微信平台看完视频count的结果永远是1或0
         */
        public showVideo(adUid: string, onVideoResult: (res: EAdVideoResult, count: number) => void, target?: any, maxVideoCount: number = 3) {
            if (this._video && this._video.aduid === adUid) {
                this._video.show(onVideoResult, target, maxVideoCount);
            } else {
                this._video?.destory();
                this._video = new ADVideo(adUid);
                this._video.show(onVideoResult, target, maxVideoCount);
            }
        }

        /**
         * 销毁内部所有实例，清空内存
         */
        public destroyAll() {
            this._banner?.destroy();
            this._banner = null;

            this._interstitial?.destory();
            this._interstitial = null;

            this._video?.destory();
            this._video = null;

            if (this._customs) {
                for (let val in this._customs) {
                    this._customs[val]?.destroy();
                }
                this._customs = {};
            }
        }
    }

    export enum EGameClubIcon {
        /** 绿色图标 */
        GREEN = 'green',

        /** 红色图标 */
        WHITE = 'white',

        /** 有黑色圆角背景的白色图标 */
        DARK = 'dark',

        /** 有白色圆角背景的绿色图标 */
        LIGHT = 'light'
    }

    export class GameClub {
        private static _instance: GameClub;

        static get instance(): GameClub {
            if (!this._instance) {
                this._instance = new GameClub();
            }
            return this._instance;
        }

        private _club: any;

        private constructor() {

        }

        /**
         * 创建游戏圈按钮
         * @param icon 
         * @param position 
         * @param size 
         * @param openLink 
         */
        create(icon: EGameClubIcon = EGameClubIcon.GREEN, position: IPosition = { top: 0, left: 0 }, size: ISize = { width: 40, height: 40 }, openLink?: string) {
            if (isWechat()) {
                // @ts-ignore
                this._club = wx.createGameClubButton({
                    icon: icon,
                    style: {
                        left: position.left,
                        top: position.top,
                        width: size.width,
                        height: size.height
                    },
                    openlink: openLink
                });
            }
        }

        show() {
            this._club?.show();
        }

        hide() {
            this._club?.hide();
        }

        destory() {
            this._club?.destroy();
        }
    }


    /**
     * 振动类型
     */
    export enum EVirbrateType {
        /**
         * 短振动
         */
        SHORT,

        /**
         * 长振动
         */
        LONG
    }

    /**
     * 平台常用API合集
     */
    export class API {
        private static _loginCode: string = null;
        private static _loginAnonymousCode: string = null;
        private static _hasInitWechatCloudFunction: boolean = false;


        /**
         * 分享app给朋友，微信小游戏分享是没有onSuccess回调的。
         * @param title 标题
         * @param description 细节描述信息 
         * @param imageUrl 图片地址
         * @param query 查询信息
         * @param onSuccess 抖音会回调，微信不会回调
         */
        static shareAppToFriends(title: string, description: string = '', imageUrl?: string, query?: string, onSuccess?: () => void) {
            if (isWechat()) {
                try {
                    //@ts-ignore
                    wx.shareAppMessage({
                        title: title,
                        imageUrl: imageUrl,
                        query: query,
                    });
                } catch (err) {
                    console.log(`share faild: ${err}`);
                }
            }

            if (isBytedance()) {
                //@ts-ignore
                tt.shareAppMessage({
                    title: title,
                    desc: description,
                    imageUrl: imageUrl ?? '',
                    query: query ?? '',
                    success(res: any) {
                        console.log('share success:', res);
                        onSuccess?.();
                    },
                    fail(res: any) {
                        console.log('share fail:', res);
                    }
                });
            }
        }

        /**
         * 显示提示信息
         * @param title 标题
         * @param duration 时长（单位：秒）
         * @returns 
         */
        static showToast(title: string, duration: number = 2) {
            if (isWechat()) {
                // @ts-ignore
                wx.showToast({
                    title: title,
                    icon: 'success',
                    duration: duration * 1000
                });
            }

            if (isBytedance()) {
                //@ts-ignore
                tt.showToast({
                    title: title,
                    duration: duration * 1000,
                    success(res: any) {
                        console.log(`${res}`);
                    },
                    fail(res: any) {
                        console.log(`showToast调用失败`);
                    },
                });
            }
        }

        /**
         * 设备震动效果，默认为短震动。注意：可能一些机型不会生效，具体看平台方的说明
         * @param type MiniGameSdk.API.EVirbrateType
         */
        static vibrate(type: EVirbrateType = EVirbrateType.SHORT) {
            if (isWechat()) {
                switch (type) {
                    case EVirbrateType.SHORT:
                        //@ts-ignore
                        wx.vibrateShort({
                            success(res: any) {
                                console.log('vibrate success:', res);
                            },
                            fail(res: any) {
                                console.log('vibrateShort failed', res);
                            },
                        });
                        break;
                    case EVirbrateType.LONG:
                        //@ts-ignore
                        wx.vibrateLong({
                            success(res: any) {
                                console.log('vibrate success', res);
                            },
                            fail(res: any) {
                                console.log(`vibrateLong failed`, res);
                            },
                        });
                        break;
                    default:
                        break;
                }
            }

            if (isBytedance()) {
                switch (type) {
                    case EVirbrateType.SHORT:
                        //@ts-ignore
                        tt.vibrateShort({
                            success(res: any) {
                                console.log('vibrate success:', res);
                            },
                            fail(res: any) {
                                console.log('vibrateShort failed', res);
                            },
                        });
                        break;
                    case EVirbrateType.LONG:
                        //@ts-ignore
                        tt.vibrateLong({
                            success(res: any) {
                                console.log('vibrate success', res);
                            },
                            fail(res: any) {
                                console.log(`vibrateLong failed`, res);
                            },
                        });
                        break;
                    default:
                        break;
                }
            }
        }

        /**
         * 重启小游戏
         */
        static reboot() {
            if (isWechat()) {
                //@ts-ignore
                wx.restartMiniProgram({
                    success: () => {
                        console.log('restart success');
                    },

                    fail: () => {
                        console.log('restart failed');
                    }
                })
            }

            if (isBytedance()) {
                try {
                    // @ts-ignore
                    tt.restartMiniProgramSync();
                } catch (error) {
                    console.log(`restartMiniProgramSync`, error);
                }
            }
        }

        /**
         * 退出小游戏
         */
        static exit() {
            if (isWechat()) {
                //@ts-ignore
                wx.exitMiniProgram({
                    success: () => {
                        console.log('exit success');
                    },
                    fail: () => {
                        console.log('exit failed');
                    }
                });
            }

            if (isBytedance()) {
                // @ts-ignore
                tt.exitMiniProgram({
                    success(res: any) {
                        console.log("exit success:", res?.data);
                    },
                    fail(res: any) {
                        console.log("exit fail:", res?.errMsg);
                    },
                });
            }
        }

        /**
         * 显示转发按钮。通常在刚进入游戏的时候调用。
         * 主要是打开平台“...”这个按钮里面的分享菜单，一般默认是关闭的，需要调用这个函数打开。可以让用户分享你的游戏入口。
         */
        static showShareMenu() {
            if (isWechat()) {
                //@ts-ignore
                wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareAppMessage', 'shareTimeline'],
                    success: () => { },
                    fail: () => { },
                    complete: () => { }
                });
            }

            if (isBytedance()) {
                //@ts-ignore
                tt.showShareMenu({
                    success(res: any) {
                        console.log("show menu is showing");
                    },
                    fail(err: any) {
                        console.log("showShareMenu:", err.errMsg);
                    },
                    complete(res: any) {
                        console.log("showShareMenu complete");
                    },
                });
            }
        }

        /**
         * 微信小游戏：跳转到另外一款小游戏
         * 抖音小游戏：跳转到指定的视频界面
         * @param targetId 微信小游戏appid或者视频界面
         */
        static navigateTo(targetId: string, onSuccess?: () => void) {
            if (isWechat()) {
                // @ts-ignore
                wx.navigateToMiniProgram({
                    appId: targetId,
                    extraData: {
                        foo: 'bar'
                    },
                    envVersion: 'develop',
                    success(res: any) {
                        onSuccess?.();
                    }
                });
            }

            if (isBytedance()) {
                // @ts-ignore
                tt.navigateToVideoView({
                    videoId: targetId,
                    success: (res: any) => {
                        onSuccess?.();
                    },
                    fail: (err: any) => {
                        console.log("bytedance navigateToVideoView fail", err);
                    },
                });
            }
        }


        /**
         * 小游戏平台登录功能。微信返回code，抖音返回code和anonymousCode。用于登录的凭证，需要把这个code传回你的服务器程序中去调用code2Session
         * @param callback (code, anonymousCode) 第一个参数为code，微信和抖音都支持；第二个参数为匿名设备ID，仅抖音支持，失败都返回null
         */
        static login(callback: (code: string, anonymousCode: string) => void) {
            let loginPlatform = () => {
                if (isWechat()) {
                    //@ts-ignore
                    wx.login({
                        success: (res: { code: any; errMsg: any; }) => {
                            if (res.code) {
                                API._loginCode = res.code;
                                API._loginAnonymousCode = null;
                                callback?.(API._loginCode, API._loginAnonymousCode);
                            } else {
                                console.log('login error:', res.errMsg)
                            }
                        },

                        fail: () => {
                            API._loginCode = null;
                            API._loginAnonymousCode = null;
                            callback?.(API._loginCode, API._loginAnonymousCode);
                            console.log('login fail')
                        }
                    });
                } else if (isBytedance()) {
                    //@ts-ignore
                    tt.login({
                        force: true,
                        success(res: any) {
                            console.log(`login ${res.code} ${res.anonymousCode}`);
                            if (res.code) {
                                API._loginCode = res.code?.toString();
                                API._loginAnonymousCode = res.anonymousCode?.toString();
                                callback?.(API._loginCode, API._loginAnonymousCode);
                            } else {
                                console.log('login error:', res.errMsg)
                            }
                        },
                        fail(res: any) {
                            API._loginCode = null;
                            API._loginAnonymousCode = null;
                            callback?.(API._loginCode, API._loginAnonymousCode);
                            console.log(`login fail`, res);
                        },
                    });
                } else {
                    API._loginCode = null;
                    API._loginAnonymousCode = null;
                    callback?.(API._loginCode, API._loginAnonymousCode);
                    console.log('not mini game platform, login codes are all null');
                }
            }



            if (!API._loginCode) {
                loginPlatform();
            } else {
                if (isWechat()) {
                    //@ts-ignore
                    wx.checkSession({
                        success() {
                            console.log(`session is valid, use current code:`, API._loginCode);
                            callback?.(API._loginCode, API._loginAnonymousCode);
                        },
                        fail() {
                            console.log(`session expired`);
                            loginPlatform();
                        }
                    });
                } else if (isBytedance()) {
                    //@ts-ignore
                    tt.checkSession({
                        success() {
                            console.log(`session is valid, user current code: ${API._loginCode}, ${API._loginAnonymousCode}`);
                            callback?.(API._loginCode, API._loginAnonymousCode);
                        },
                        fail() {
                            console.log(`session expired`);
                            loginPlatform();
                        },
                    });

                } else {
                    console.log('not mini game platform, login null');
                    callback?.(null, null);
                }
            }
        }

        /**
         * 调用微信云函数。由于参数需要自定义，所以为any，需要自行解释。函数只完成通道和处理一场的作用
         * @param callback 返回云函数调用结果。需要检查返回参数是否为空，失败的时候为空
         * @param name 云函数的名字
         * @param data 云函数的内容
         */
        static callWechatCloudFunction(callback: (res: any) => void, name: string, data: {}) {
            if (!isWechat()) {
                console.log('Not wechat platform, not support callWechatCloudFunction');
                return;
            }

            this.login((code: string, anonymousCode: string) => {
                if (!API._hasInitWechatCloudFunction) {
                    //@ts-ignore
                    wx.cloud.init();
                    API._hasInitWechatCloudFunction = true;
                }
                //@ts-ignore
                wx.cloud.callFunction({
                    name: name,
                    data: data,
                    success: (res: any) => callback?.(res),
                    fail: (err: any) => {
                        console.log('wechat cloud function error:', err);
                        callback?.(null);
                    }
                });
            });
        }

        /**
         * 存储用户信息，数据量不能大。可以考虑用于分数排行榜。用户之间可共享排行数据。
         * @param key 
         * @param value 
         */
        static setUserCloudStorage(key: string, value: string) {
            if (isWechat()) {
                // @ts-ignore
                wx.setUserCloudStorage({
                    KVDataList: [{ key: key, value: value }],
                    success: () => console.log(`set cloud storage success:${key}, value:${value}`),
                    fail: (err: any) => console.log('set cloud storage error:', err)
                });
            }

            if (isBytedance()) {
                // @ts-ignore
                tt.setUserCloudStorage({
                    KVDataList: [{ key: key, value: value, }],
                    success: () => console.log(`set cloud storage success:${key}, value:${value}`),
                    fail: (err: any) => console.log('set cloud storage error:', err)
                });
            }
        }
    }


    /**
     * 抖音侧边栏专属接口
     */
    export class BytedanceSidebar {
        /**
         * 本游戏在抖音环境下启动监控，需要放在全局环境中，保证能第一时间启动。因为可能监听抖音失败（抖音小游戏官方的说明）！
         * @param onResult 包含一个boolean参数的函数
         * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
         */
        static listenFromSidebar(onResult: (success: boolean) => void, target?: any) {
            if (!isBytedance()) {
                onResult?.call(target, false);
                return;
            }
            // @ts-ignore
            tt.onShow((res: any) => {
                console.log('onShow launch res:', res);
                if (res.scene === '021036') {
                    onResult?.call(target, true);
                    console.log('launch from sidebar');
                } else {
                    onResult?.call(target, false);
                    console.log('NOT launch from douyin sidebar!');
                }
            });

            // @ts-ignore
            let options = tt.getLaunchOptionsSync();
            if (options && options.scene === '021036') {
                onResult?.call(target, true);
            }
        }

        /**
         * 检测抖音侧边栏是否存在
         * @param onResult 包含一个boolean参数的函数
         * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
         * @returns 
         */
        static checkSideBar(onResult: (success: boolean) => void, target?: any) {
            if (!isBytedance()) {
                onResult?.call(target, false);
                return;
            }

            //@ts-ignore
            tt.checkScene({
                scene: "sidebar",
                success: (res: any) => {
                    console.log("check scene success: ", res.isExist);
                    onResult?.call(target, <boolean>res.isExist);

                },
                fail: (res: any) => {
                    console.log("check scene fail:", res);
                    onResult?.call(target, false);
                }
            });
        }

        /**
         * 跳转到抖音侧边栏
         * @param onResult 包含一个boolean参数的函数
         * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
         * @returns 
         */
        static navigateToSidebar(onResult: (success: boolean) => void, target?: any) {
            if (!isBytedance()) {
                console.log("not douyin platform!");
                onResult?.call(target, false);
                return;
            }

            // @ts-ignore
            tt.navigateToScene({
                scene: "sidebar",
                success: () => {
                    console.log("navigate success");
                    onResult?.call(target, true);
                },
                fail: (res: any) => {
                    console.log("navigate failed reason:", res);
                    onResult?.call(target, false);
                },
            });
        }
    }

}