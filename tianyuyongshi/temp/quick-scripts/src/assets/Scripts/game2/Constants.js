"use strict";
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