
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/Constants.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'c56d3HQI/ZOf4Bl803245kI', 'Constants');
// Scripts/game2/Constants.ts

// 枚举、常量与 loadConfig
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemIcon = exports.loadConfig = exports.CFG = exports.MonsterId = exports.HeroId = exports.Scene = void 0;
var Scene;
(function (Scene) {
    Scene["Main"] = "main";
    Scene["Level"] = "xuan";
    Scene["Battle"] = "battle";
    Scene["Upgrade"] = "qianghua";
    Scene["Youxi"] = "youxi";
})(Scene = exports.Scene || (exports.Scene = {}));
var HeroId;
(function (HeroId) {
    HeroId["LingJianShi"] = "H001";
    HeroId["NuLeiLiShi"] = "H002";
    HeroId["JuLingTianNv"] = "H003";
    HeroId["LieYanFaZun"] = "H004";
    HeroId["ChuanYunNuShou"] = "H005";
    HeroId["BaGuaTianShi"] = "H006";
})(HeroId = exports.HeroId || (exports.HeroId = {}));
var MonsterId;
(function (MonsterId) {
    MonsterId["MiWuYaoLang"] = "m_01";
    MonsterId["HunDunJuLing"] = "m_02";
    MonsterId["GuiYiMoBu"] = "m_03";
    MonsterId["BaoLieHuoGui"] = "m_04";
    MonsterId["ShiHunGuWu"] = "m_05";
    MonsterId["ShenYuanLingZhu"] = "m_06";
})(MonsterId = exports.MonsterId || (exports.MonsterId = {}));
// 运行时配置缓存（由 loadConfig 填充）
exports.CFG = {
    stamina: {},
    currency: {},
    summon: {},
    heroRank: {},
    heroUpgrade: {},
    heroConfig: [],
    monsterConfig: [],
    coreSkins: [],
    itemConfig: [],
    heroUpgradeConfig: [],
    levelStaminaCost: 1,
    starThresholds: [0.8, 0.4, 0.0],
    levels: []
};
function loadConfig(cfg) {
    if (!cfg)
        return;
    exports.CFG.stamina = cfg.stamina || exports.CFG.stamina;
    exports.CFG.currency = cfg.currency || exports.CFG.currency;
    exports.CFG.summon = cfg.summon || exports.CFG.summon;
    exports.CFG.heroRank = cfg.heroRank || exports.CFG.heroRank;
    exports.CFG.heroUpgrade = cfg.heroUpgrade || exports.CFG.heroUpgrade;
    exports.CFG.levelStaminaCost = cfg.levelStaminaCost != null ? cfg.levelStaminaCost : exports.CFG.levelStaminaCost;
    exports.CFG.starThresholds = cfg.starThresholds || exports.CFG.starThresholds;
    var copyArr = function (src, dst) {
        if (!src || !src.length)
            return;
        dst.length = 0;
        src.forEach(function (v) { return dst.push(v); });
    };
    copyArr(cfg.heroConfig, exports.CFG.heroConfig);
    copyArr(cfg.monsterConfig, exports.CFG.monsterConfig);
    copyArr(cfg.coreSkins, exports.CFG.coreSkins);
    copyArr(cfg.itemConfig, exports.CFG.itemConfig);
    copyArr(cfg.heroUpgradeConfig, exports.CFG.heroUpgradeConfig);
    copyArr(cfg.levels, exports.CFG.levels);
}
exports.loadConfig = loadConfig;
// 根据 item_id 查 itemConfig 里的 icon 文件名（去后缀）
function getItemIcon(itemId) {
    for (var i = 0; i < exports.CFG.itemConfig.length; i++) {
        if (exports.CFG.itemConfig[i].id === itemId) {
            var icon = exports.CFG.itemConfig[i].icon || '';
            return icon.replace(/\.[^.]+$/, ''); // 去掉 .png
        }
    }
    return '';
}
exports.getItemIcon = getItemIcon;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXENvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQkFBb0I7OztBQUVwQixJQUFZLEtBTVg7QUFORCxXQUFZLEtBQUs7SUFDYixzQkFBZ0IsQ0FBQTtJQUNoQix1QkFBZ0IsQ0FBQTtJQUNoQiwwQkFBa0IsQ0FBQTtJQUNsQiw2QkFBb0IsQ0FBQTtJQUNwQix3QkFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBTlcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBTWhCO0FBRUQsSUFBWSxNQU9YO0FBUEQsV0FBWSxNQUFNO0lBQ2QsOEJBQXVCLENBQUE7SUFDdkIsNkJBQXVCLENBQUE7SUFDdkIsK0JBQXVCLENBQUE7SUFDdkIsOEJBQXVCLENBQUE7SUFDdkIsaUNBQXVCLENBQUE7SUFDdkIsK0JBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQVBXLE1BQU0sR0FBTixjQUFNLEtBQU4sY0FBTSxRQU9qQjtBQUVELElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNqQixpQ0FBdUIsQ0FBQTtJQUN2QixrQ0FBdUIsQ0FBQTtJQUN2QiwrQkFBdUIsQ0FBQTtJQUN2QixrQ0FBdUIsQ0FBQTtJQUN2QixnQ0FBdUIsQ0FBQTtJQUN2QixxQ0FBd0IsQ0FBQTtBQUM1QixDQUFDLEVBUFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFPcEI7QUFFRCwyQkFBMkI7QUFDZCxRQUFBLEdBQUcsR0FjWjtJQUNBLE9BQU8sRUFBRSxFQUFFO0lBQ1gsUUFBUSxFQUFFLEVBQUU7SUFDWixNQUFNLEVBQUUsRUFBRTtJQUNWLFFBQVEsRUFBRSxFQUFFO0lBQ1osV0FBVyxFQUFFLEVBQUU7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLFNBQVMsRUFBRSxFQUFFO0lBQ2IsVUFBVSxFQUFFLEVBQUU7SUFDZCxpQkFBaUIsRUFBRSxFQUFFO0lBQ3JCLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDL0IsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBRUYsU0FBZ0IsVUFBVSxDQUFDLEdBQVE7SUFDL0IsSUFBSSxDQUFDLEdBQUc7UUFBRSxPQUFPO0lBQ2pCLFdBQUcsQ0FBQyxPQUFPLEdBQVksR0FBRyxDQUFDLE9BQU8sSUFBYSxXQUFHLENBQUMsT0FBTyxDQUFDO0lBQzNELFdBQUcsQ0FBQyxRQUFRLEdBQVcsR0FBRyxDQUFDLFFBQVEsSUFBWSxXQUFHLENBQUMsUUFBUSxDQUFDO0lBQzVELFdBQUcsQ0FBQyxNQUFNLEdBQWEsR0FBRyxDQUFDLE1BQU0sSUFBYyxXQUFHLENBQUMsTUFBTSxDQUFDO0lBQzFELFdBQUcsQ0FBQyxRQUFRLEdBQVcsR0FBRyxDQUFDLFFBQVEsSUFBWSxXQUFHLENBQUMsUUFBUSxDQUFDO0lBQzVELFdBQUcsQ0FBQyxXQUFXLEdBQVEsR0FBRyxDQUFDLFdBQVcsSUFBUyxXQUFHLENBQUMsV0FBVyxDQUFDO0lBQy9ELFdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztJQUNsRyxXQUFHLENBQUMsY0FBYyxHQUFLLEdBQUcsQ0FBQyxjQUFjLElBQU0sV0FBRyxDQUFDLGNBQWMsQ0FBQztJQUVsRSxJQUFNLE9BQU8sR0FBRyxVQUFDLEdBQVUsRUFBRSxHQUFVO1FBQ25DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDaEMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixHQUFHLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBTSxJQUFLLE9BQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBVSxXQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQU8sV0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFXLFdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBVSxXQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRyxXQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBYyxXQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQXJCRCxnQ0FxQkM7QUFFRCwyQ0FBMkM7QUFDM0MsU0FBZ0IsV0FBVyxDQUFDLE1BQWM7SUFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzVDLElBQUksV0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssTUFBTSxFQUFFO1lBQ2pDLElBQU0sSUFBSSxHQUFXLFdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUcsVUFBVTtTQUNwRDtLQUNKO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDO0FBUkQsa0NBUUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDmnprkuL7jgIHluLjph4/kuI4gbG9hZENvbmZpZ1xyXG5cclxuZXhwb3J0IGVudW0gU2NlbmUge1xyXG4gICAgTWFpbiAgICA9ICdtYWluJyxcclxuICAgIExldmVsICAgPSAneHVhbicsXHJcbiAgICBCYXR0bGUgID0gJ2JhdHRsZScsXHJcbiAgICBVcGdyYWRlID0gJ3FpYW5naHVhJyxcclxuICAgIFlvdXhpICAgPSAneW91eGknXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEhlcm9JZCB7XHJcbiAgICBMaW5nSmlhblNoaSAgICA9ICdIMDAxJyxcclxuICAgIE51TGVpTGlTaGkgICAgID0gJ0gwMDInLFxyXG4gICAgSnVMaW5nVGlhbk52ICAgPSAnSDAwMycsXHJcbiAgICBMaWVZYW5GYVp1biAgICA9ICdIMDA0JyxcclxuICAgIENodWFuWXVuTnVTaG91ID0gJ0gwMDUnLFxyXG4gICAgQmFHdWFUaWFuU2hpICAgPSAnSDAwNidcclxufVxyXG5cclxuZXhwb3J0IGVudW0gTW9uc3RlcklkIHtcclxuICAgIE1pV3VZYW9MYW5nICAgID0gJ21fMDEnLFxyXG4gICAgSHVuRHVuSnVMaW5nICAgPSAnbV8wMicsXHJcbiAgICBHdWlZaU1vQnUgICAgICA9ICdtXzAzJyxcclxuICAgIEJhb0xpZUh1b0d1aSAgID0gJ21fMDQnLFxyXG4gICAgU2hpSHVuR3VXdSAgICAgPSAnbV8wNScsXHJcbiAgICBTaGVuWXVhbkxpbmdaaHUgPSAnbV8wNidcclxufVxyXG5cclxuLy8g6L+Q6KGM5pe26YWN572u57yT5a2Y77yI55SxIGxvYWRDb25maWcg5aGr5YWF77yJXHJcbmV4cG9ydCBjb25zdCBDRkc6IHtcclxuICAgIHN0YW1pbmE6IGFueTtcclxuICAgIGN1cnJlbmN5OiBhbnk7XHJcbiAgICBzdW1tb246IGFueTtcclxuICAgIGhlcm9SYW5rOiBhbnk7XHJcbiAgICBoZXJvVXBncmFkZTogYW55O1xyXG4gICAgaGVyb0NvbmZpZzogYW55W107XHJcbiAgICBtb25zdGVyQ29uZmlnOiBhbnlbXTtcclxuICAgIGNvcmVTa2luczogYW55W107XHJcbiAgICBpdGVtQ29uZmlnOiBhbnlbXTtcclxuICAgIGhlcm9VcGdyYWRlQ29uZmlnOiBhbnlbXTtcclxuICAgIGxldmVsU3RhbWluYUNvc3Q6IG51bWJlcjtcclxuICAgIHN0YXJUaHJlc2hvbGRzOiBudW1iZXJbXTtcclxuICAgIGxldmVsczogYW55W107XHJcbn0gPSB7XHJcbiAgICBzdGFtaW5hOiB7fSxcclxuICAgIGN1cnJlbmN5OiB7fSxcclxuICAgIHN1bW1vbjoge30sXHJcbiAgICBoZXJvUmFuazoge30sXHJcbiAgICBoZXJvVXBncmFkZToge30sXHJcbiAgICBoZXJvQ29uZmlnOiBbXSxcclxuICAgIG1vbnN0ZXJDb25maWc6IFtdLFxyXG4gICAgY29yZVNraW5zOiBbXSxcclxuICAgIGl0ZW1Db25maWc6IFtdLFxyXG4gICAgaGVyb1VwZ3JhZGVDb25maWc6IFtdLFxyXG4gICAgbGV2ZWxTdGFtaW5hQ29zdDogMSxcclxuICAgIHN0YXJUaHJlc2hvbGRzOiBbMC44LCAwLjQsIDAuMF0sXHJcbiAgICBsZXZlbHM6IFtdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvbmZpZyhjZmc6IGFueSk6IHZvaWQge1xyXG4gICAgaWYgKCFjZmcpIHJldHVybjtcclxuICAgIENGRy5zdGFtaW5hICAgICAgICAgID0gY2ZnLnN0YW1pbmEgICAgICAgICAgfHwgQ0ZHLnN0YW1pbmE7XHJcbiAgICBDRkcuY3VycmVuY3kgICAgICAgICA9IGNmZy5jdXJyZW5jeSAgICAgICAgIHx8IENGRy5jdXJyZW5jeTtcclxuICAgIENGRy5zdW1tb24gICAgICAgICAgID0gY2ZnLnN1bW1vbiAgICAgICAgICAgfHwgQ0ZHLnN1bW1vbjtcclxuICAgIENGRy5oZXJvUmFuayAgICAgICAgID0gY2ZnLmhlcm9SYW5rICAgICAgICAgfHwgQ0ZHLmhlcm9SYW5rO1xyXG4gICAgQ0ZHLmhlcm9VcGdyYWRlICAgICAgPSBjZmcuaGVyb1VwZ3JhZGUgICAgICB8fCBDRkcuaGVyb1VwZ3JhZGU7XHJcbiAgICBDRkcubGV2ZWxTdGFtaW5hQ29zdCA9IGNmZy5sZXZlbFN0YW1pbmFDb3N0ICE9IG51bGwgPyBjZmcubGV2ZWxTdGFtaW5hQ29zdCA6IENGRy5sZXZlbFN0YW1pbmFDb3N0O1xyXG4gICAgQ0ZHLnN0YXJUaHJlc2hvbGRzICAgPSBjZmcuc3RhclRocmVzaG9sZHMgICB8fCBDRkcuc3RhclRocmVzaG9sZHM7XHJcblxyXG4gICAgY29uc3QgY29weUFyciA9IChzcmM6IGFueVtdLCBkc3Q6IGFueVtdKSA9PiB7XHJcbiAgICAgICAgaWYgKCFzcmMgfHwgIXNyYy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICBkc3QubGVuZ3RoID0gMDtcclxuICAgICAgICBzcmMuZm9yRWFjaCgodjogYW55KSA9PiBkc3QucHVzaCh2KSk7XHJcbiAgICB9O1xyXG4gICAgY29weUFycihjZmcuaGVyb0NvbmZpZywgICAgICAgICBDRkcuaGVyb0NvbmZpZyk7XHJcbiAgICBjb3B5QXJyKGNmZy5tb25zdGVyQ29uZmlnLCAgICAgIENGRy5tb25zdGVyQ29uZmlnKTtcclxuICAgIGNvcHlBcnIoY2ZnLmNvcmVTa2lucywgICAgICAgICAgQ0ZHLmNvcmVTa2lucyk7XHJcbiAgICBjb3B5QXJyKGNmZy5pdGVtQ29uZmlnLCAgICAgICAgIENGRy5pdGVtQ29uZmlnKTtcclxuICAgIGNvcHlBcnIoY2ZnLmhlcm9VcGdyYWRlQ29uZmlnLCAgQ0ZHLmhlcm9VcGdyYWRlQ29uZmlnKTtcclxuICAgIGNvcHlBcnIoY2ZnLmxldmVscywgICAgICAgICAgICAgQ0ZHLmxldmVscyk7XHJcbn1cclxuXHJcbi8vIOagueaNriBpdGVtX2lkIOafpSBpdGVtQ29uZmlnIOmHjOeahCBpY29uIOaWh+S7tuWQje+8iOWOu+WQjue8gO+8iVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SXRlbUljb24oaXRlbUlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBDRkcuaXRlbUNvbmZpZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChDRkcuaXRlbUNvbmZpZ1tpXS5pZCA9PT0gaXRlbUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGljb246IHN0cmluZyA9IENGRy5pdGVtQ29uZmlnW2ldLmljb24gfHwgJyc7XHJcbiAgICAgICAgICAgIHJldHVybiBpY29uLnJlcGxhY2UoL1xcLlteLl0rJC8sICcnKTsgICAvLyDljrvmjokgLnBuZ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAnJztcclxufVxyXG4iXX0=