"use strict";
cc._RF.push(module, 'ee56d+fAIpLDoSRUT8l0n6W', 'Constants');
// Scripts/game/Constants.ts

Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.loadConfig = exports.dataToCocosPos = exports.StorageKey = exports.SceneName = exports.Camp = void 0;
// 阵营枚举
var Camp;
(function (Camp) {
    Camp[Camp["Han"] = 0] = "Han";
    Camp[Camp["Chu"] = 1] = "Chu";
})(Camp = exports.Camp || (exports.Camp = {}));
// 场景名
exports.SceneName = {
    Main: 'Main',
    LevelSelect: 'LevelSelect',
    Game: 'Game',
};
// 本地存储 key
exports.StorageKey = {
    UserProgress: 'ch_user_progress',
};
// 将 data.json 坐标（左上角原点，y向下）转为 Cocos 坐标（中心原点，y向上），并按 Canvas 等比缩放
function dataToCocosPos(elem, origW, origH, canvasW, canvasH) {
    var scaleX = canvasW / origW;
    var scaleY = canvasH / origH;
    var cx = elem.x + elem.w / 2;
    var cy = elem.y + elem.h / 2;
    return {
        x: (cx - origW / 2) * scaleX,
        y: (origH / 2 - cy) * scaleY,
        width: elem.w * scaleX,
        height: elem.h * scaleY,
    };
}
exports.dataToCocosPos = dataToCocosPos;
// 加载配置到运行时常量（原地更新，所有 require 方自动感知）
var _cfg = null;
function loadConfig(cfg) {
    _cfg = cfg;
}
exports.loadConfig = loadConfig;
function getConfig() {
    return _cfg;
}
exports.getConfig = getConfig;

cc._RF.pop();