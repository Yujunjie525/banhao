import {LQByteDanceType, LQPlatformType} from "../data/lq_const";

export class LQPlatformUtil {
    private static platform_type: LQPlatformType;
    private static byte_dance_type: LQByteDanceType;

    public static init() {
        if (typeof qq !== 'undefined') {
            this.platform_type = LQPlatformType.qq;
        } else if (typeof swan !== 'undefined') {
            this.platform_type = LQPlatformType.baidu;
        } else if (typeof tt !== 'undefined') {
            this.platform_type = LQPlatformType.tt;
            const info = tt.getSystemInfoSync();
            switch (info.appName) {
                case 'Toutiao':
                    this.byte_dance_type = LQByteDanceType.tt;
                    break;
                case 'news_article_lite':
                    this.byte_dance_type = LQByteDanceType.tt_lite;
                    break;
                case 'Douyin':
                    this.byte_dance_type = LQByteDanceType.douyin;
                    break;
                case 'douyin_lite':
                    this.byte_dance_type = LQByteDanceType.douyin_lite;
                    break;
                case 'PPX':
                    this.byte_dance_type = LQByteDanceType.ppx;
                    break;
                case 'devtools':
                    this.byte_dance_type = LQByteDanceType.devtools;
                    break;
            }
        } else if (typeof qg !== 'undefined') {
            if (!!qg.getBattle) {
                this.platform_type = LQPlatformType.oppo;
            } else {
                this.platform_type = LQPlatformType.vivo;
            }
        } else if (typeof wx !== 'undefined') {
            this.platform_type = LQPlatformType.wx;
        } else if (typeof jsb !== 'undefined') {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                this.platform_type = LQPlatformType.android;
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                this.platform_type = LQPlatformType.ios;
            } else {
                this.platform_type = LQPlatformType.unknown;
            }
        } else if (cc.sys.isBrowser) {
            this.platform_type = LQPlatformType.browser;
        }
    }

    public static get_platform(): LQPlatformType {
        return this.platform_type;
    }

    public static get_byte_dance(): LQByteDanceType {
        return this.byte_dance_type;
    }

    public static is_wx() {
        return this.platform_type === LQPlatformType.wx;
    }

    public static is_tt() {
        return this.platform_type === LQPlatformType.tt;
    }

    public static is_oppo() {
        return this.platform_type === LQPlatformType.oppo;
    }

    public static is_vivo() {
        return this.platform_type === LQPlatformType.vivo;
    }

    public static is_browser() {
        return this.platform_type === LQPlatformType.browser;
    }

    public static is_android() {
        return this.platform_type === LQPlatformType.android;
    }

    public static is_ios() {
        return this.platform_type === LQPlatformType.ios;
    }

    public static is_native() {
        return this.platform_type === LQPlatformType.android || this.platform_type === LQPlatformType.ios;
    }

    public static is_qq() {
        return this.platform_type === LQPlatformType.qq;
    }

    public static is_baidu() {
        return this.platform_type === LQPlatformType.baidu;
    }

    public static is_kwaigame() {
        return this.platform_type === LQPlatformType.kwaigame;
    }
}

LQPlatformUtil.init();
if (LQPlatformUtil.is_tt()) {
    console.log('---------当前平台:' + LQPlatformUtil.get_byte_dance());
} else {
    console.log('---------当前平台:' + LQPlatformUtil.get_platform());
}
