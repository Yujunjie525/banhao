import { _decorator, Component, Node } from 'cc';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('wxAd')
export class wxAd extends Component {
    // 格子广告1
    private geziAd1: any
    private geziAd2: any
    private videoAd: any
    // 单例
    static _ins: wxAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new wxAd();
        return this._ins;
    }

    public wx = window['wx'];

    /**
     *  监听音频中断结束事件
     * @param callback 
     */
    bgmZd(callback: Function) {
        if (gameConfig.isWxAd) {
            this.wx.onAudioInterruptionEnd(() => {
                // console.log('音频中断结束');
                callback()
            })
        } else {
            console.log('微信广告关闭');
        }
    }
    /**
* 打开右上角转发功能
*/
    topZhuanfa() {
        if (gameConfig.isWxAd) {
            this.wx.showShareMenu();
        } else {
            console.log('微信广告关闭');
        }
    }

    /**
     * 格子广告1
     */
    loadGeziAd1() {
        if (gameConfig.isWxAd) {
            let { screenWidth, screenHeight } = this.wx.getSystemInfoSync();
            // 创建 原生模板 广告实例，提前初始化
            this.geziAd1 = this.wx.createCustomAd({
                adUnitId: 'adunit-xxxxxxxxxxxxxxxxxxxx',
                style: {
                    left: screenWidth - 75,
                    top: 60,
                    width: 350
                }
            })
            // 监听 原生模板 广告错误事件
            this.geziAd1.onError(err => {
                console.error(err.errMsg)
            });
        } else {
            console.log('微信广告关闭');
        }
    }
    // 显示格子1广告
    showGezi1() {
        if (gameConfig.isWxAd) {
            this.geziAd1.show()
        } else {
            console.log('微信广告关闭');
        }
    }
    // 隐藏格子1广告
    hideGezi1() {
        if (gameConfig.isWxAd) {
            this.geziAd1.hide()
        } else {
            console.log('微信广告关闭');
        }
    }

    /**
    * 格子广告2
    */
    loadGeziAd2() {
        if (gameConfig.isWxAd) {
            let { screenWidth, screenHeight } = this.wx.getSystemInfoSync();
            // 创建 原生模板 广告实例，提前初始化
            this.geziAd2 = this.wx.createCustomAd({
                adUnitId: 'adunit-xxxxxxxxxxxxxxxxxxxxx',
                style: {
                    left: 40,
                    top: 72,
                    width: 350
                }
            })
            // 监听 原生模板 广告错误事件
            this.geziAd1.onError(err => {
                console.error(err.errMsg)
            });
        } else {
            console.log('微信广告关闭');
        }
    }
    // 显示格子2广告
    showGezi2() {
        if (gameConfig.isWxAd) {
            this.geziAd2.show()
        } else {
            console.log('微信广告关闭');
        }
    }
    // 隐藏格子2广告
    hideGezi2() {
        if (gameConfig.isWxAd) {
            this.geziAd2.hide()
        } else {
            console.log('微信广告关闭');
        }
    }

    /**
     * 插屏广告
     */
    chapingAd() {
        // 插屏广告已禁用
        console.log('插屏广告已跳过');
    }

    /**
     * 激励广告
     */
    jiliAd(callback: Function) {
        // 直接执行回调，跳过广告播放
        callback()
        console.log('激励广告奖励已直接发放');
    }
}
