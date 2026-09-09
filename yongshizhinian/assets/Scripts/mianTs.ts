import { _decorator, Component, Node } from 'cc';
import { loadRes } from './loadRes';
import { local, resPath } from './enmus';
import {  load, save } from './tools';
import { gameConfig } from './gameConfig';
// import { wxAd } from './AD/wxAd';
const { ccclass, property } = _decorator;

@ccclass('mianTs')
export class mianTs extends Component {
    protected onLoad(): void {

    }
    start() {
        this.resLoad()
        this.initData()
        if (gameConfig.isAd) {
            this.initWxad()
        }
    }
    /**
    * 初始化微信广告
    */
    initWxad() {
        // wxAd.ins.loadBannerAd()
        // wxAd.ins.loadBannerAd2()
        // wxAd.ins.loadCustomAd()

        // wxAd.ins.chapingAd()
    }

    /**
     * 资源加载
     */
    resLoad() {
        // loadRes.ins.loadBundle('bundles');
        // loadRes.ins.resLoad(resPath.itemsPre);
        loadRes.ins.resLoad(resPath.uiPre);
        // loadRes.ins.resLoad(resPath.music);
        // loadRes.ins.resLoad(resPath.json);
    }
    /**
     * 初始化数据
     */
    initData() {
        // 音乐
        let isBgm = load(local.isBgm)
        if (isBgm == null) {
            isBgm = 1
            save(local.isBgm, isBgm)
        }
        gameConfig.isBgm = isBgm
        // 音效
        let isSound = load(local.isSound)
        if (isSound == null) {
            isSound = 1
            save(local.isSound, isSound)
        }
        gameConfig.isSound = isSound

        // 初始化音量
        if (gameConfig.isBgm) {
            gameConfig.bgmVol = 0.8
        } else {
            gameConfig.bgmVol = 0
        }
        if (gameConfig.isSound) {
            gameConfig.soundVol = 0.9
        } else {
            gameConfig.soundVol = 0
        }
        // 当前关卡
        let nowLevel = load(local.nowLevel)
        if (!nowLevel) {
            nowLevel = 1
            save(local.nowLevel, nowLevel)
        }
        gameConfig.nowLevel = nowLevel
        // 皮肤是否解锁
        let pifuIsJiesuo = load(local.pifuIsJiesuo)
        if (pifuIsJiesuo == null) {
            pifuIsJiesuo = 0
            save(local.pifuIsJiesuo, pifuIsJiesuo)
        }
        gameConfig.pifuIsJiesuo = pifuIsJiesuo
        // 当前使用的皮肤
        let nowPifu = load(local.nowPifu)
        if (nowPifu == null) {
            nowPifu = 1
            save(local.nowPifu, nowPifu)
        }
        gameConfig.nowPifu = nowPifu
    }
}


