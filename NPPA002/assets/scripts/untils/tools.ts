import { _decorator, Component, Node, sys } from 'cc';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

/**
 * @description: 存储本地数据
 * @return {*}
 */
export function save(key: string, val: string | number | object | any): any {
    if (typeof val === 'number') {
        val = ('' + val) as string;
    }
    if (typeof val === 'object') {
        val = JSON.stringify(val)
    }
    sys.localStorage.setItem(key, val || '');
}

/**
 * @description: 加载获取本地数据
 * @return {*}
 */
export function load(key: string, type: 0 | 1 | 2 = 1): any {
    let res: any = sys.localStorage.getItem(key);
    if (res) {
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
 * 获取当前时间
 */
export function getTime() {
    let time = new Date().getTime()
    gameConfig.nowTime = time / 3600000
    console.log(gameConfig.nowTime);

}

