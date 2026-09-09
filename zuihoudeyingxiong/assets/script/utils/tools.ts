import { _decorator, Component, Node, sys } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { localData } from '../data/enums';
import { cloudUserData } from './cloudUserData';
const { ccclass, property } = _decorator;

export function cloneDefaultPlayerList() {
    return JSON.parse(JSON.stringify(gameConfig.defaultPlayerList));
}

/**
 * @description: 存储本地数据
 * @return {*}
 */
export function save(key: string, val: string | number | any): any {
    if (typeof val == 'number') {
        val = ('' + val) as string;
    }
    // 如果是数组或二维数据
    if (typeof val == 'object') {
        val = JSON.stringify(val);
    }
    const storedValue = val === null || val === undefined ? '' : val;
    sys.localStorage.setItem(key, storedValue);
    cloudUserData.ins.scheduleSyncForKey(key);
}

/**
 * @description: 加载获取本地数据
 * @return {*}
 */
export function load(key: string, type: 0 | 1 | 2 = 1): any {
    let res: any = sys.localStorage.getItem(key);
    if (res !== null && res !== undefined && res !== '') {
        switch (type) {
            case 0:
                break;
            case 1:
                res = Number(res);
                break;
            case 2:
                res = JSON.parse(res);
                break;
        }
        return res;
    } else {
        return null;
    }
}
/**
 * 获取距离上次领取福利的时间
 */
export function getTime() {
    let newTime = new Date().getTime()
    let t = (newTime - gameConfig.oldTime) / 3600000
    let time = Number(t.toFixed(2))
    console.log('距离领取时间：' + time);
    return time
}
/**
 * 设置最新的领取时间
 */
export function setTime() {
    let newTime = new Date().getTime()
    gameConfig.oldTime = newTime
    save(localData.oldTime, gameConfig.oldTime)
}

export function getCurrentUserId() {
    return sys.localStorage.getItem('SLS_USER_ID') || 'default';
}

export function getUserScopedKey(baseKey: string) {
    return `${baseKey}_${getCurrentUserId()}`;
}

export function getScopedSelectTypeKey() {
    return getUserScopedKey(localData.slectType);
}

export function getScopedPlayerListKey() {
    return getUserScopedKey(localData.playerList);
}

export function addTotalEarnedGold(amount: number) {
    if (amount <= 0) {
        return;
    }

    const totalEarnedGoldKey = getUserScopedKey('totalEarnedGold');
    const savedTotal = load(totalEarnedGoldKey, 1);
    const baseTotal = savedTotal === null ? Math.max(0, Number(gameConfig.jinbiNum || 0) - amount) : Number(savedTotal) || 0;
    save(totalEarnedGoldKey, baseTotal + amount);
}
