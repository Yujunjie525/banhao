"use strict";
cc._RF.push(module, 'acbee4Pa/VPMb/rxTJADqKy', 'GameState');
// Scripts/game/GameState.ts

Object.defineProperty(exports, "__esModule", { value: true });
exports.getFromScene = exports.setFromScene = exports.getProgress = exports.saveProgress = exports.loadProgress = exports.getProgressSaveKey = void 0;
var config_1 = require("./config");
var GameState = {
    progress: JSON.parse(JSON.stringify(config_1.default.defaultProgress)),
    fromScene: '',
    selectedLevel: 1,
    lastStars: 3,
};
// 读取本地存储，恢复进度
var StorageKey = 'ch_user_progress';
function getProgressSaveKey() {
    var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? StorageKey + "_" + userId : StorageKey;
}
exports.getProgressSaveKey = getProgressSaveKey;
function loadProgress() {
    var raw = cc.sys.localStorage.getItem(getProgressSaveKey()) || cc.sys.localStorage.getItem(StorageKey);
    if (raw) {
        try {
            var saved = JSON.parse(raw);
            Object.assign(GameState.progress, saved);
        }
        catch (e) { }
    }
    _rechargeStamina();
}
exports.loadProgress = loadProgress;
function saveProgress() {
    cc.sys.localStorage.setItem(getProgressSaveKey(), JSON.stringify(GameState.progress));
}
exports.saveProgress = saveProgress;
// 按离线时长补充体力
function _rechargeStamina() {
    var now = Math.floor(Date.now() / 1000);
    var p = GameState.progress;
    if (p.last_stamina_time === 0) {
        p.last_stamina_time = now;
        return;
    }
    var elapsed = now - p.last_stamina_time;
    var gained = Math.floor(elapsed / config_1.default.stamina.rechargeIntervalSec);
    if (gained > 0) {
        p.stamina = Math.min(config_1.default.stamina.max, p.stamina + gained);
        p.last_stamina_time += gained * config_1.default.stamina.rechargeIntervalSec;
        saveProgress();
    }
}
function getProgress() {
    return GameState.progress;
}
exports.getProgress = getProgress;
function setFromScene(scene) {
    GameState.fromScene = scene;
}
exports.setFromScene = setFromScene;
function getFromScene() {
    return GameState.fromScene;
}
exports.getFromScene = getFromScene;
exports.default = GameState;

cc._RF.pop();