"use strict";
cc._RF.push(module, '57d02b9kZlFirHyXHLoHy4j', 'tools');
// Scripts/Load/tools.ts

Object.defineProperty(exports, "__esModule", { value: true });
exports.load = exports.save = void 0;
/**
 * @description: 存储本地数据
 * @return {*}
 */
function save(key, val) {
    if (typeof val === 'number') {
        val = ('' + val);
    }
    if (typeof val === 'object') {
        val = JSON.stringify(val);
    }
    cc.sys.localStorage.setItem(key, val || '');
}
exports.save = save;
/**
 * @description: 加载获取本地数据
 * @return {*}
 */
function load(key, type) {
    if (type === void 0) { type = 1; }
    var res = cc.sys.localStorage.getItem(key);
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
    }
    else {
        return null;
    }
}
exports.load = load;

cc._RF.pop();