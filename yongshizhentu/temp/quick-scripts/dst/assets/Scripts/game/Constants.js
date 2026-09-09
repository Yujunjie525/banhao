
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game/Constants.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZVxcQ29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTztBQUNQLElBQWtCLElBR2pCO0FBSEQsV0FBa0IsSUFBSTtJQUNsQiw2QkFBTyxDQUFBO0lBQ1AsNkJBQU8sQ0FBQTtBQUNYLENBQUMsRUFIaUIsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR3JCO0FBRUQsTUFBTTtBQUNPLFFBQUEsU0FBUyxHQUFHO0lBQ3JCLElBQUksRUFBSyxNQUFNO0lBQ2YsV0FBVyxFQUFFLGFBQWE7SUFDMUIsSUFBSSxFQUFLLE1BQU07Q0FDVCxDQUFDO0FBeUNYLFdBQVc7QUFDRSxRQUFBLFVBQVUsR0FBRztJQUN0QixZQUFZLEVBQUUsa0JBQWtCO0NBQzFCLENBQUM7QUFFWCxnRUFBZ0U7QUFDaEUsU0FBZ0IsY0FBYyxDQUMxQixJQUFlLEVBQ2YsS0FBYSxFQUFFLEtBQWEsRUFDNUIsT0FBZSxFQUFFLE9BQWU7SUFFaEMsSUFBTSxNQUFNLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUMvQixJQUFNLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQy9CLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixPQUFPO1FBQ0gsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNO1FBQzVCLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsTUFBTTtRQUM1QixLQUFLLEVBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNO1FBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU07S0FDMUIsQ0FBQztBQUNOLENBQUM7QUFmRCx3Q0FlQztBQUVELG9DQUFvQztBQUNwQyxJQUFJLElBQUksR0FBUSxJQUFJLENBQUM7QUFDckIsU0FBZ0IsVUFBVSxDQUFDLEdBQVE7SUFDL0IsSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFGRCxnQ0FFQztBQUNELFNBQWdCLFNBQVM7SUFDckIsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUZELDhCQUVDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g6Zi16JCl5p6a5Li+XHJcbmV4cG9ydCBjb25zdCBlbnVtIENhbXAge1xyXG4gICAgSGFuID0gMCwgIC8vIOaxieiQpe+8iOm7keaXl++8iVxyXG4gICAgQ2h1ID0gMSwgIC8vIOalmuiQpe+8iOe6ouaXl++8iVxyXG59XHJcblxyXG4vLyDlnLrmma/lkI1cclxuZXhwb3J0IGNvbnN0IFNjZW5lTmFtZSA9IHtcclxuICAgIE1haW46ICAgICdNYWluJyxcclxuICAgIExldmVsU2VsZWN0OiAnTGV2ZWxTZWxlY3QnLFxyXG4gICAgR2FtZTogICAgJ0dhbWUnLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8g55So5oi36L+b5bqm57uT5p6EXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXNlclByb2dyZXNzIHtcclxuICAgIHVubG9ja2VkX2xldmVsOiBudW1iZXI7XHJcbiAgICBsZXZlbF9zdGFyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcclxuICAgIGZhaWxlZF9sZXZlbHM6IG51bWJlcltdO1xyXG4gICAgc3RhbWluYTogbnVtYmVyO1xyXG4gICAgbGFzdF9zdGFtaW5hX3RpbWU6IG51bWJlcjtcclxufVxyXG5cclxuLy8g5YWz5Y2h6IqC54K5XHJcbmV4cG9ydCBpbnRlcmZhY2UgTm9kZUNvbmZpZyB7XHJcbiAgICBub2RlX2lkOiBudW1iZXI7XHJcbiAgICBjYW1wOiBDYW1wO1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyDlhbPljaHovrlcclxuZXhwb3J0IGludGVyZmFjZSBFZGdlQ29uZmlnIHtcclxuICAgIHN0YXJ0X25vZGU6IG51bWJlcjtcclxuICAgIGVuZF9ub2RlOiBudW1iZXI7XHJcbn1cclxuXHJcbi8vIOWFs+WNoemFjee9rlxyXG5leHBvcnQgaW50ZXJmYWNlIExldmVsQ29uZmlnIHtcclxuICAgIGxldmVsX2lkOiBudW1iZXI7XHJcbiAgICBub2Rlc19jb25maWc6IE5vZGVDb25maWdbXTtcclxuICAgIGVkZ2VzX2NvbmZpZzogRWRnZUNvbmZpZ1tdO1xyXG59XHJcblxyXG4vLyBVSSDlhYPntKDluIPlsYDvvIjmnaXoh6ogZGF0YS5qc29u77yJXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlFbGVtZW50IHtcclxuICAgIGZpbGU6IHN0cmluZztcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHc6IG51bWJlcjtcclxuICAgIGg6IG51bWJlcjtcclxufVxyXG5cclxuLy8g5pys5Zyw5a2Y5YKoIGtleVxyXG5leHBvcnQgY29uc3QgU3RvcmFnZUtleSA9IHtcclxuICAgIFVzZXJQcm9ncmVzczogJ2NoX3VzZXJfcHJvZ3Jlc3MnLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8g5bCGIGRhdGEuanNvbiDlnZDmoIfvvIjlt6bkuIrop5Lljp/ngrnvvIx55ZCR5LiL77yJ6L2s5Li6IENvY29zIOWdkOagh++8iOS4reW/g+WOn+eCue+8jHnlkJHkuIrvvInvvIzlubbmjIkgQ2FudmFzIOetieavlOe8qeaUvlxyXG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvQ29jb3NQb3MoXHJcbiAgICBlbGVtOiBVSUVsZW1lbnQsXHJcbiAgICBvcmlnVzogbnVtYmVyLCBvcmlnSDogbnVtYmVyLFxyXG4gICAgY2FudmFzVzogbnVtYmVyLCBjYW52YXNIOiBudW1iZXJcclxuKTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSB7XHJcbiAgICBjb25zdCBzY2FsZVggPSBjYW52YXNXIC8gb3JpZ1c7XHJcbiAgICBjb25zdCBzY2FsZVkgPSBjYW52YXNIIC8gb3JpZ0g7XHJcbiAgICBjb25zdCBjeCA9IGVsZW0ueCArIGVsZW0udyAvIDI7XHJcbiAgICBjb25zdCBjeSA9IGVsZW0ueSArIGVsZW0uaCAvIDI7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IChjeCAtIG9yaWdXIC8gMikgKiBzY2FsZVgsXHJcbiAgICAgICAgeTogKG9yaWdIIC8gMiAtIGN5KSAqIHNjYWxlWSxcclxuICAgICAgICB3aWR0aDogIGVsZW0udyAqIHNjYWxlWCxcclxuICAgICAgICBoZWlnaHQ6IGVsZW0uaCAqIHNjYWxlWSxcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIOWKoOi9vemFjee9ruWIsOi/kOihjOaXtuW4uOmHj++8iOWOn+WcsOabtOaWsO+8jOaJgOaciSByZXF1aXJlIOaWueiHquWKqOaEn+efpe+8iVxyXG5sZXQgX2NmZzogYW55ID0gbnVsbDtcclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRDb25maWcoY2ZnOiBhbnkpOiB2b2lkIHtcclxuICAgIF9jZmcgPSBjZmc7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBhbnkge1xyXG4gICAgcmV0dXJuIF9jZmc7XHJcbn1cclxuIl19