import { _decorator, Component, Node, sys } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { localData } from '../data/enums';
import { cloudUserData } from './cloudUserData';
const { ccclass, property } = _decorator;

/**
 * @description: 存储本地数据
 * @return {*}
 */
export function save(key: string, val: string | number | any): any {
    key = getStorageKey(key);
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
    key = getStorageKey(key);
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

const USER_SCOPED_KEYS = new Set([
    localData.jinbiNum,
    localData.lightCrystal,
    localData.memoryFragment,
    localData.tiliNum,
    localData.page,
    localData.slectType,
    localData.playerList,
    localData.oldTime,
    localData.maxJuli,
    'nowLevel',
    'nowPifu',
    'pifuIsJiesuo',
    'heroUpgradeLevel',
    'game3UnlockedDifficulty',
]);

export function isUserScopedKey(key: string) {
    return USER_SCOPED_KEYS.has(key);
}

export function getStorageKey(key: string) {
    const userId = sys.localStorage.getItem('SLS_USER_ID');
    if (!userId || !isUserScopedKey(key)) {
        return key;
    }

    return `${key}_${userId}`;
}

export function clearSessionUserData() {
    USER_SCOPED_KEYS.forEach((key) => {
        sys.localStorage.removeItem(key);
        sys.localStorage.removeItem(getStorageKey(key));
    });

    sys.localStorage.removeItem('SLS_STAMINA');
    sys.localStorage.removeItem('SLS_RECOVER_TIME');

    const userId = sys.localStorage.getItem('SLS_USER_ID');
    if (userId) {
        sys.localStorage.removeItem(`SLS_STAMINA_${userId}`);
        sys.localStorage.removeItem(`SLS_RECOVER_TIME_${userId}`);
    }
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
