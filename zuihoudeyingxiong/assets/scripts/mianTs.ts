import { _decorator, Component, director } from 'cc';

import { local, resPath as home2ResPath } from './data/enmus';
import { loadRes } from '../script/utils/loadRes';
import { wxAd } from '../script/AD/wxAd';
import { gameConfig } from '../script/data/gameConfig';
import { cloneDefaultPlayerList, getScopedPlayerListKey, getScopedSelectTypeKey, getUserScopedKey, load, save } from '../script/utils/tools';
import { localData, resPath as legacyResPath } from '../script/data/enums';

const { ccclass } = _decorator;

@ccclass('mianTs')
export class mianTs extends Component {
    private getScopedPlayerListStorageKey() {
        return getScopedPlayerListKey();
    }

    private getScopedSelectTypeStorageKey() {
        return getScopedSelectTypeKey();
    }

    private getMaxJuliKey() {
        return getUserScopedKey(localData.maxJuli);
    }

    private initScopedPlayerData() {
        const scopedSelectTypeKey = this.getScopedSelectTypeStorageKey();
        let slectType = load(scopedSelectTypeKey);
        if (slectType == null) {
            slectType = 1;
            save(scopedSelectTypeKey, slectType);
        }
        gameConfig.slectType = slectType;

        const scopedPlayerListKey = this.getScopedPlayerListStorageKey();
        let playerList = load(scopedPlayerListKey, 2);
        if (!playerList) {
            playerList = cloneDefaultPlayerList();
            save(scopedPlayerListKey, playerList);
        }
        gameConfig.playerList = playerList;
    }

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
            save(localData.jinbiNum, jinbiNum);
        }
        gameConfig.jinbiNum = jinbiNum;

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

        this.initScopedPlayerData();

        let oldTime = load(localData.oldTime);
        if (oldTime == null) {
            oldTime = 0;
            save(localData.oldTime, oldTime);
        }
        gameConfig.oldTime = oldTime;

        let maxJuli = load(this.getMaxJuliKey());
        if (maxJuli == null) {
            maxJuli = 0;
            save(this.getMaxJuliKey(), maxJuli);
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
            save(localData.jinbiNum, jinbiNum);
        }
        gameConfig.jinbiNum = jinbiNum;

        let maxJuli = load(this.getMaxJuliKey());
        if (maxJuli == null) {
            maxJuli = 0;
            save(this.getMaxJuliKey(), maxJuli);
        }
        gameConfig.maxJuli = maxJuli;

        let page = load(localData.page);
        if (page == null) {
            page = 0;
            save(localData.page, page);
        }
        gameConfig.page = page;

        this.initScopedPlayerData();

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
    }
}
