
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game/GameState.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZVxcR2FtZVN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQTJCO0FBRTNCLElBQU0sU0FBUyxHQUtYO0lBQ0EsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3pELFNBQVMsRUFBRSxFQUFFO0lBQ2IsYUFBYSxFQUFFLENBQUM7SUFDaEIsU0FBUyxFQUFFLENBQUM7Q0FDZixDQUFDO0FBRUYsY0FBYztBQUNkLElBQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDO0FBRXRDLFNBQWdCLGtCQUFrQjtJQUM5QixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFJLFVBQVUsU0FBSSxNQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUMzRCxDQUFDO0FBSEQsZ0RBR0M7QUFFRCxTQUFnQixZQUFZO0lBQ3hCLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pHLElBQUksR0FBRyxFQUFFO1FBQ0wsSUFBSTtZQUNBLElBQU0sS0FBSyxHQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QztRQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7S0FDakI7SUFDRCxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFURCxvQ0FTQztBQUVELFNBQWdCLFlBQVk7SUFDeEIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUMxRixDQUFDO0FBRkQsb0NBRUM7QUFFRCxZQUFZO0FBQ1osU0FBUyxnQkFBZ0I7SUFDckIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDMUMsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUM3QixJQUFJLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLEVBQUU7UUFDM0IsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztRQUMxQixPQUFPO0tBQ1Y7SUFDRCxJQUFNLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0lBQzFDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLGdCQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDckUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ1osQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLEdBQUcsZ0JBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7UUFDaEUsWUFBWSxFQUFFLENBQUM7S0FDbEI7QUFDTCxDQUFDO0FBRUQsU0FBZ0IsV0FBVztJQUN2QixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDOUIsQ0FBQztBQUZELGtDQUVDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEtBQWE7SUFDdEMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDaEMsQ0FBQztBQUZELG9DQUVDO0FBRUQsU0FBZ0IsWUFBWTtJQUN4QixPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDL0IsQ0FBQztBQUZELG9DQUVDO0FBRUQsa0JBQWUsU0FBUyxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVXNlclByb2dyZXNzIH0gZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgY2ZnIGZyb20gJy4vY29uZmlnJztcclxuXHJcbmNvbnN0IEdhbWVTdGF0ZToge1xyXG4gICAgcHJvZ3Jlc3M6IFVzZXJQcm9ncmVzcztcclxuICAgIGZyb21TY2VuZTogc3RyaW5nO1xyXG4gICAgc2VsZWN0ZWRMZXZlbDogbnVtYmVyO1xyXG4gICAgbGFzdFN0YXJzOiBudW1iZXI7XHJcbn0gPSB7XHJcbiAgICBwcm9ncmVzczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjZmcuZGVmYXVsdFByb2dyZXNzKSksXHJcbiAgICBmcm9tU2NlbmU6ICcnLFxyXG4gICAgc2VsZWN0ZWRMZXZlbDogMSxcclxuICAgIGxhc3RTdGFyczogMyxcclxufTtcclxuXHJcbi8vIOivu+WPluacrOWcsOWtmOWCqO+8jOaBouWkjei/m+W6plxyXG5jb25zdCBTdG9yYWdlS2V5ID0gJ2NoX3VzZXJfcHJvZ3Jlc3MnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2dyZXNzU2F2ZUtleSgpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgdXNlcklkID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTTFNfVVNFUl9JRCcpO1xyXG4gICAgcmV0dXJuIHVzZXJJZCA/IGAke1N0b3JhZ2VLZXl9XyR7dXNlcklkfWAgOiBTdG9yYWdlS2V5O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbG9hZFByb2dyZXNzKCk6IHZvaWQge1xyXG4gICAgY29uc3QgcmF3ID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGdldFByb2dyZXNzU2F2ZUtleSgpKSB8fCBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oU3RvcmFnZUtleSk7XHJcbiAgICBpZiAocmF3KSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3Qgc2F2ZWQ6IFVzZXJQcm9ncmVzcyA9IEpTT04ucGFyc2UocmF3KTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihHYW1lU3RhdGUucHJvZ3Jlc3MsIHNhdmVkKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7fVxyXG4gICAgfVxyXG4gICAgX3JlY2hhcmdlU3RhbWluYSgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2F2ZVByb2dyZXNzKCk6IHZvaWQge1xyXG4gICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGdldFByb2dyZXNzU2F2ZUtleSgpLCBKU09OLnN0cmluZ2lmeShHYW1lU3RhdGUucHJvZ3Jlc3MpKTtcclxufVxyXG5cclxuLy8g5oyJ56a757q/5pe26ZW/6KGl5YWF5L2T5YqbXHJcbmZ1bmN0aW9uIF9yZWNoYXJnZVN0YW1pbmEoKTogdm9pZCB7XHJcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIGNvbnN0IHAgPSBHYW1lU3RhdGUucHJvZ3Jlc3M7XHJcbiAgICBpZiAocC5sYXN0X3N0YW1pbmFfdGltZSA9PT0gMCkge1xyXG4gICAgICAgIHAubGFzdF9zdGFtaW5hX3RpbWUgPSBub3c7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZWxhcHNlZCA9IG5vdyAtIHAubGFzdF9zdGFtaW5hX3RpbWU7XHJcbiAgICBjb25zdCBnYWluZWQgPSBNYXRoLmZsb29yKGVsYXBzZWQgLyBjZmcuc3RhbWluYS5yZWNoYXJnZUludGVydmFsU2VjKTtcclxuICAgIGlmIChnYWluZWQgPiAwKSB7XHJcbiAgICAgICAgcC5zdGFtaW5hID0gTWF0aC5taW4oY2ZnLnN0YW1pbmEubWF4LCBwLnN0YW1pbmEgKyBnYWluZWQpO1xyXG4gICAgICAgIHAubGFzdF9zdGFtaW5hX3RpbWUgKz0gZ2FpbmVkICogY2ZnLnN0YW1pbmEucmVjaGFyZ2VJbnRlcnZhbFNlYztcclxuICAgICAgICBzYXZlUHJvZ3Jlc3MoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2dyZXNzKCk6IFVzZXJQcm9ncmVzcyB7XHJcbiAgICByZXR1cm4gR2FtZVN0YXRlLnByb2dyZXNzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RnJvbVNjZW5lKHNjZW5lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIEdhbWVTdGF0ZS5mcm9tU2NlbmUgPSBzY2VuZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEZyb21TY2VuZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIEdhbWVTdGF0ZS5mcm9tU2NlbmU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdhbWVTdGF0ZTtcclxuIl19