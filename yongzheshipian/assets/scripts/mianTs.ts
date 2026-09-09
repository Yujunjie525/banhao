import { _decorator, Component, director } from 'cc';

import { local, resPath as home2ResPath } from './data/enmus';
import { loadRes } from '../script/utils/loadRes';
import { wxAd } from '../script/AD/wxAd';
import { gameConfig } from '../script/data/gameConfig';
import { load, save } from '../script/utils/tools';
import { localData, resPath as legacyResPath } from '../script/data/enums';

const { ccclass } = _decorator;

@ccclass('mianTs')
export class mianTs extends Component {
    start() {
        const sceneName = director.getScene()?.name;

        if (sceneName === 'loading2' || sceneName === 'home2') {
            this.initHome2Scene();
            return;
        }

        this.initLegacyBootScene();
    }

    private initLegacyBootScene() {
        this.loadLegacyResources();
        this.initLegacyData();
    }

    private initHome2Scene() {
        this.loadHome2Resources();
        this.initHome2Data();

        if (gameConfig.isAd) {
            this.initWxad();
        }
    }

    /**
     * 初始化微信广告
     */
    private initWxad() {
        wxAd.ins.chapingAd();
    }

    /**
     * 原有 loading/loading2 场景需要的资源
     */
    private loadLegacyResources() {
        loadRes.ins.loadBundle('bundles');
        loadRes.ins.resLoad(legacyResPath.UIPerfab);
        loadRes.ins.resLoad(home2ResPath.uiPre);
        loadRes.ins.resLoad(legacyResPath.levelPar);
        loadRes.ins.resLoad(legacyResPath.enemyPar);
        loadRes.ins.resLoad(legacyResPath.playersfab);
        loadRes.ins.resLoad(legacyResPath.music);
    }

    /**
     * home2 场景需要的资源
     */
    private loadHome2Resources() {
        loadRes.ins.loadBundle('bundles');
        loadRes.ins.resLoad(home2ResPath.itemsPre);
        loadRes.ins.resLoad(home2ResPath.uiPre);
        loadRes.ins.resLoad(legacyResPath.UIPerfab);
        loadRes.ins.resLoad(legacyResPath.levelPar);
        loadRes.ins.resLoad(legacyResPath.enemyPar);
        loadRes.ins.resLoad(legacyResPath.playersfab);
        loadRes.ins.resLoad(home2ResPath.music);
        loadRes.ins.resLoad(home2ResPath.json);
    }

    /**
     * 原有 loading/loading2 流程的数据初始化
     */
    private initLegacyData() {
        let jinbiNum = load(localData.jinbiNum);
        if (jinbiNum == null) {
            jinbiNum = 0;
        }
        jinbiNum = this.normalizeCurrency(localData.jinbiNum, jinbiNum);
        gameConfig.jinbiNum = jinbiNum;

        let lightCrystal = load(localData.lightCrystal);
        if (lightCrystal == null) {
            lightCrystal = 0;
        }
        lightCrystal = this.normalizeCurrency(localData.lightCrystal, lightCrystal);
        gameConfig.lightCrystal = lightCrystal;

        let memoryFragment = load(localData.memoryFragment);
        if (memoryFragment == null) {
            memoryFragment = 0;
        }
        memoryFragment = this.normalizeCurrency(localData.memoryFragment, memoryFragment);
        gameConfig.memoryFragment = memoryFragment;

        let tiliNum = load(localData.tiliNum);
        if (tiliNum == null) {
            tiliNum = 30;
            save(localData.tiliNum, tiliNum);
        }
        gameConfig.tiliNum = tiliNum;

        let isBgm = load(localData.isBgm);
        if (isBgm == null) {
            isBgm = 1;
            save(localData.isBgm, isBgm);
        }
        gameConfig.isBgm = isBgm;

        let isSound = load(localData.isSound);
        if (isSound == null) {
            isSound = 1;
            save(localData.isSound, isSound);
        }
        gameConfig.isSound = isSound;

        gameConfig.bgmVol = gameConfig.isBgm ? 1 : 0;
        gameConfig.soundVol = gameConfig.isSound ? 0.9 : 0;

        let page = load(localData.page);
        if (page == null) {
            page = 0;
            save(localData.page, page);
        }
        gameConfig.page = page;

        let slectType = load(localData.slectType);
        if (slectType == null) {
            slectType = 1;
            save(localData.slectType, slectType);
        }
        gameConfig.slectType = slectType;

        const playerList = load(localData.playerList, 2);
        if (playerList) {
            gameConfig.playerList = playerList;
        } else {
            gameConfig.playerList = gameConfig.createDefaultPlayerList();
            save(localData.playerList, gameConfig.playerList);
        }

        let oldTime = load(localData.oldTime);
        if (oldTime == null) {
            oldTime = 0;
            save(localData.oldTime, oldTime);
        }
        gameConfig.oldTime = oldTime;

        let maxJuli = load(localData.maxJuli);
        if (maxJuli == null) {
            maxJuli = 0;
            save(localData.maxJuli, maxJuli);
        }
        gameConfig.maxJuli = maxJuli;
    }

    /**
     * home2 流程的数据初始化
     */
    private initHome2Data() {
        let jinbiNum = load(localData.jinbiNum);
        if (jinbiNum == null) {
            jinbiNum = 0;
        }
        jinbiNum = this.normalizeCurrency(localData.jinbiNum, jinbiNum);
        gameConfig.jinbiNum = jinbiNum;

        let lightCrystal = load(localData.lightCrystal);
        if (lightCrystal == null) {
            lightCrystal = 0;
        }
        lightCrystal = this.normalizeCurrency(localData.lightCrystal, lightCrystal);
        gameConfig.lightCrystal = lightCrystal;

        let memoryFragment = load(localData.memoryFragment);
        if (memoryFragment == null) {
            memoryFragment = 0;
        }
        memoryFragment = this.normalizeCurrency(localData.memoryFragment, memoryFragment);
        gameConfig.memoryFragment = memoryFragment;

        let maxJuli = load(localData.maxJuli);
        if (maxJuli == null) {
            maxJuli = 0;
            save(localData.maxJuli, maxJuli);
        }
        gameConfig.maxJuli = maxJuli;

        let page = load(localData.page);
        if (page == null) {
            page = 0;
            save(localData.page, page);
        }
        gameConfig.page = page;

        let slectType = load(localData.slectType);
        if (slectType == null) {
            slectType = 1;
            save(localData.slectType, slectType);
        }
        gameConfig.slectType = slectType;

        const playerList = load(localData.playerList, 2);
        if (playerList) {
            gameConfig.playerList = playerList;
        } else {
            gameConfig.playerList = gameConfig.createDefaultPlayerList();
            save(localData.playerList, gameConfig.playerList);
        }

        let isBgm = load(local.isBgm);
        if (isBgm == null) {
            isBgm = 1;
            save(local.isBgm, isBgm);
        }
        gameConfig.isBgm = isBgm;

        let isSound = load(local.isSound);
        if (isSound == null) {
            isSound = 1;
            save(local.isSound, isSound);
        }
        gameConfig.isSound = isSound;

        gameConfig.bgmVol = gameConfig.isBgm ? 0.8 : 0;
        gameConfig.soundVol = gameConfig.isSound ? 0.9 : 0;

        let nowLevel = load(local.nowLevel);
        if (!nowLevel) {
            nowLevel = 1;
            save(local.nowLevel, nowLevel);
        }
        gameConfig.nowLevel = nowLevel;

        let pifuIsJiesuo = load(local.pifuIsJiesuo);
        if (pifuIsJiesuo == null) {
            pifuIsJiesuo = 0;
            save(local.pifuIsJiesuo, pifuIsJiesuo);
        }
        gameConfig.pifuIsJiesuo = pifuIsJiesuo;

        let nowPifu = load(local.nowPifu);
        if (nowPifu == null) {
            nowPifu = 1;
            save(local.nowPifu, nowPifu);
        }
        gameConfig.nowPifu = nowPifu;

        // 使用用户ID关联关卡星级数据，确保不同用户数据隔离
        const userId = load('SLS_USER_ID', 0) || 'default';
        const levelStarsKey = `levelStars_${userId}`;
        const levelStars = load(levelStarsKey, 2);
        if (levelStars) {
            gameConfig.levelStars = levelStars;
        } else {
            gameConfig.levelStars = {};
            save(levelStarsKey, gameConfig.levelStars);
        }
    }

    private normalizeCurrency(storageKey: string, value: number) {
        const normalized = Math.max(0, Number(value) || 0);
        if (normalized !== value) {
            save(storageKey, normalized);
        }
        return normalized;
    }
}
