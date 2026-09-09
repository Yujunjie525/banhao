
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Load/GameData.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '596a5kXx6JPlqWmU5SY1YCB', 'GameData');
// Scripts/Load/GameData.ts

Object.defineProperty(exports, "__esModule", { value: true });
var UserDataSyncManager_1 = require("../Manager/UserDataSyncManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameData = /** @class */ (function () {
    function GameData() {
        //背景音乐是否开启,默认开启
        this.isBGMOn = true;
        //音效是否开启,默认开启
        this.isSoundOn = true;
        //存储音频开关状态的key
        this.isBGMOnKey = 'IsBGMOn';
        //存储音效开关状态的key
        this.isSoundOnKey = 'IsSoundOn';
        //游戏是否开始
        this.isGameBegin = true;
        //背景移动速度
        this.BgMoveSpeed = 8;
        //是否第二次触摸
        this.isTouchAgain = true;
        //玩家所处位置。-1在左，1在右
        this.playerLoc = -1;
        //玩家当下得分
        this.EveryScore = 0;
        //玩家最高得分
        this.BestScore = 0;
        //记录玩家BUFF状态
        this.playerBuff = false;
        //是否微信分享
        this.isOpenWXShare = true;
        //存储时的最高分key
        this.BestScoreKey = 'BestScore';
        //buff图片(0-飞镖，1--蚊子，2--狐狸)
        this.buffTuji = [-1, -1, -1];
        //护盾值
        this.playerHudun = null;
        //PlayerManager实例
        this.playerManager = null;
        //物体移动速度
        this.MoveSpeed = 10;
        //体力系统相关
        this.currentStamina = 30; //当前体力值
        this.maxStamina = 30; //最大体力值
        this.lastRecoverTime = Date.now(); //上次恢复体力的时间戳
        this.staminaKey = 'Stamina'; //存储体力的key
        this.lastRecoverTimeKey = 'LastRecoverTime'; //存储上次恢复时间的key
        //钻石系统相关
        this.currentGold = 0; //当前钻石数量，初始给1000
        this.goldKey = 'CurrentGold'; //存储钻石的key
        this.totalGoldEarned = 0; //累计获得钻石数量
        this.totalGoldEarnedKey = 'TotalGoldEarned'; //存储累计钻石的key
        //角色系统相关
        this.unlockedRoles = [true, false, false, false, false]; //角色解锁状态，默认解锁第一个角色
        this.currentRole = 0; //当前选中的角色索引
        this.unlockedRolesKey = 'UnlockedRoles'; //存储角色解锁状态的key
        this.currentRoleKey = 'CurrentRole'; //存储当前选中角色的key
        this.roleWeights = [10, 20, 30, 40, 50]; //角色重量
        this.rolePrices = [0, 2000, 4000, 6000, 8000]; //角色价格
        this.roleNames = ['碧穹剑姬', '赤焰疾姬', '玄甲卫士', '炎灵法尊', '月影刺姬']; //角色名称
        //商店道具库存相关
        this.itemStock = [0, 0, 0]; //道具1-3的库存
        this.itemStockKey = 'ItemStock'; //存储道具库存的key
        //技能系统相关
        this.skills = []; //技能数据
        this.skillsKey = 'Skills'; //存储技能数据的key
        //关卡模式相关
        this.isInfiniteMode = true; //是否为无限模式，false为关卡模式
        this.currentLevel = 1; //当前正在玩的关卡
        this.unlockedLevel = 1; //已经解锁的最高关卡
        //是否自动打开关卡选择界面
        this.shouldOpenLevelSelect = false;
        // 关卡星级数据 - 存储每个关卡的最高星级（0-3星）
        this.levelStars = [];
        this.levelStarsKey = 'LevelStars'; //存储关卡星级的key
        // 扩展关卡到100关，难度逐渐增加
        this.levelTargetScores = [];
        // 关卡配置数组
        this.levelConfigs = [];
        this.currentLevelKey = 'CurrentLevel'; //存储当前关卡的key
        this.unlockedLevelKey = 'UnlockedLevel'; //存储已解锁关卡的key
        // 剧情弹窗相关
        this.storyPopupShownKey = 'StoryPopupShown';
        // 直接使用静态关卡配置数组
        this.levelConfigs = __spreadArrays(GameData_1.LEVEL_CONFIGS);
        console.log('成功加载内置关卡配置:', this.levelConfigs.length, '关');
        // 加载音频开关状态
        this.GetBGMOnData();
        // 加载音效开关状态
        this.GetSoundOnData();
        // 加载角色解锁状态
        this.GetUnlockedRolesData();
        // 加载当前选中角色
        this.GetCurrentRoleData();
        // 加载技能数据
        this.GetSkillsData();
        // 加载钻石数据
        this.GetGoldData();
    }
    GameData_1 = GameData;
    /**
     * 获取当前用户ID
     * @returns 用户ID，如果没有登录返回null
     */
    GameData.prototype.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    };
    /**
     * 生成带用户ID后缀的存储key
     * @param baseKey 基础key
     * @returns 带用户ID后缀的key
     */
    GameData.prototype.getKeyWithUserId = function (baseKey) {
        var userId = this.getUserId();
        if (userId) {
            return baseKey + "_" + userId;
        }
        return baseKey;
    };
    /**
     * 存储数据
     */
    GameData.prototype.SetData = function () {
        // 存储音频开关状态
        this.SaveBGMOnData();
        // 存储音效开关状态
        this.SaveSoundOnData();
        // 存储角色解锁状态
        this.SaveUnlockedRolesData();
        // 存储当前选中角色
        this.SaveCurrentRoleData();
        // 存储技能数据
        this.SaveSkillsData();
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        var bestScoreKey = this.getKeyWithUserId(this.BestScoreKey);
        window.wx.setStorage({
            key: bestScoreKey,
            data: this.BestScore,
        });
        window.wx.setUserCloudStorage({
            KVDataList: [{ key: '1', value: mGameData.BestScore.toString() }],
        });
        // 存储体力数据
        this.SaveStaminaData();
        // 存储关卡数据
        this.SaveLevelData();
        // 存储钻石数据
        this.SaveGoldData();
    };
    /**
     * 存储体力数据
     */
    GameData.prototype.SaveBestScoreData = function () {
        var bestScoreKey = this.getKeyWithUserId(this.BestScoreKey);
        cc.sys.localStorage.setItem(bestScoreKey, Math.max(0, Math.floor(this.BestScore || 0)).toString());
        UserDataSyncManager_1.default.requestUpload();
    };
    GameData.prototype.GetBestScoreData = function () {
        var bestScoreKey = this.getKeyWithUserId(this.BestScoreKey);
        var bestScoreStr = cc.sys.localStorage.getItem(bestScoreKey);
        this.BestScore = bestScoreStr ? Math.max(0, parseInt(bestScoreStr, 10) || 0) : 0;
    };
    GameData.prototype.SaveStaminaData = function () {
        // 使用Cocos Creator的本地存储接口替代微信接口
        var staminaKey = this.getKeyWithUserId(this.staminaKey);
        var lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        cc.sys.localStorage.setItem(staminaKey, this.currentStamina.toString());
        cc.sys.localStorage.setItem(lastRecoverTimeKey, this.lastRecoverTime.toString());
        UserDataSyncManager_1.default.requestUpload();
    };
    /**
     * 获取存储的体力数据
     */
    GameData.prototype.GetStaminaData = function () {
        // 使用Cocos Creator的本地存储接口替代微信接口
        var staminaKey = this.getKeyWithUserId(this.staminaKey);
        var lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        var staminaStr = cc.sys.localStorage.getItem(staminaKey);
        if (staminaStr) {
            this.currentStamina = parseInt(staminaStr);
        }
        else {
            // 如果没有数据，重置为满体力
            this.currentStamina = this.maxStamina;
        }
        var lastRecoverTimeStr = cc.sys.localStorage.getItem(lastRecoverTimeKey);
        if (lastRecoverTimeStr) {
            this.lastRecoverTime = parseInt(lastRecoverTimeStr);
        }
        else {
            // 如果没有数据，重置为当前时间
            this.lastRecoverTime = Date.now();
        }
    };
    /**
     * 存储钻石数据
     */
    GameData.prototype.SaveGoldData = function () {
        // 使用Cocos Creator的本地存储接口保存钻石数据
        var goldKey = this.getKeyWithUserId(this.goldKey);
        cc.sys.localStorage.setItem(goldKey, this.currentGold.toString());
        // 保存累计获得钻石数据
        var totalGoldEarnedKey = this.getKeyWithUserId(this.totalGoldEarnedKey);
        cc.sys.localStorage.setItem(totalGoldEarnedKey, this.totalGoldEarned.toString());
        UserDataSyncManager_1.default.requestUpload();
    };
    /**
     * 获取存储的钻石数据
     */
    GameData.prototype.GetGoldData = function () {
        // 使用Cocos Creator的本地存储接口加载钻石数据
        var goldKey = this.getKeyWithUserId(this.goldKey);
        // 先检查用户ID是否正确获取
        var userId = this.getUserId();
        var goldStr = cc.sys.localStorage.getItem(goldKey);
        if (goldStr) {
            this.currentGold = parseInt(goldStr);
        }
        else {
            // 如果没有数据，重置为初始值20000
            this.currentGold = 0;
            // 同时尝试读取不带用户ID的key
            var defaultGoldKey = 'CurrentGold';
            var defaultGoldStr = cc.sys.localStorage.getItem(defaultGoldKey);
        }
        // 加载累计获得钻石数据
        var totalGoldEarnedKey = this.getKeyWithUserId(this.totalGoldEarnedKey);
        var totalGoldEarnedStr = cc.sys.localStorage.getItem(totalGoldEarnedKey);
        if (totalGoldEarnedStr) {
            this.totalGoldEarned = parseInt(totalGoldEarnedStr);
        }
        else {
            this.totalGoldEarned = this.currentGold; // 如果没有累计数据，初始化为当前钻石数
        }
    };
    /**
     * 添加钻石（同时更新累计获得钻石）
     * @param amount 钻石数量
     */
    GameData.prototype.addGold = function (amount) {
        this.currentGold += amount;
        this.totalGoldEarned += amount;
        this.SaveGoldData();
        cc.director.emit('goldUpdated');
    };
    /**
     * 存储道具库存数据
     */
    GameData.prototype.SaveItemStockData = function () {
        // 使用Cocos Creator的本地存储接口保存道具库存数据
        var itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(this.itemStock));
    };
    /**
     * 获取存储的道具库存数据
     */
    GameData.prototype.GetItemStockData = function () {
        // 使用Cocos Creator的本地存储接口加载道具库存数据
        var itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        var itemStockStr = cc.sys.localStorage.getItem(itemStockKey);
        if (itemStockStr) {
            this.itemStock = JSON.parse(itemStockStr);
        }
        else {
            // 如果没有数据，重置为初始值
            this.itemStock = [0, 0, 0];
        }
    };
    /**
     * 获取指定道具的库存
     * @param itemId 道具ID (1-3)
     * @returns 道具库存数量
     */
    GameData.prototype.getItemStock = function (itemId) {
        var index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            return this.itemStock[index];
        }
        return 0;
    };
    /**
     * 增加指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 增加的数量
     */
    GameData.prototype.addItemStock = function (itemId, count) {
        var index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            this.itemStock[index] += count;
            this.SaveItemStockData();
        }
    };
    /**
     * 减少指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 减少的数量
     * @returns 是否成功减少
     */
    GameData.prototype.reduceItemStock = function (itemId, count) {
        var index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length && this.itemStock[index] >= count) {
            this.itemStock[index] -= count;
            this.SaveItemStockData();
            return true;
        }
        return false;
    };
    /**
     * 存储音频开关状态
     */
    GameData.prototype.SaveBGMOnData = function () {
        var isBGMOnKey = this.getKeyWithUserId(this.isBGMOnKey);
        cc.sys.localStorage.setItem(isBGMOnKey, this.isBGMOn.toString());
    };
    /**
     * 获取存储的音频开关状态
     */
    GameData.prototype.GetBGMOnData = function () {
        var isBGMOnKey = this.getKeyWithUserId(this.isBGMOnKey);
        var isBGMOnStr = cc.sys.localStorage.getItem(isBGMOnKey);
        if (isBGMOnStr) {
            this.isBGMOn = isBGMOnStr === 'true';
        }
        else {
            this.isBGMOn = true; // 默认开启
        }
    };
    /**
     * 存储音效开关状态
     */
    GameData.prototype.SaveSoundOnData = function () {
        var isSoundOnKey = this.getKeyWithUserId(this.isSoundOnKey);
        cc.sys.localStorage.setItem(isSoundOnKey, this.isSoundOn.toString());
    };
    /**
     * 获取存储的音效开关状态
     */
    GameData.prototype.GetSoundOnData = function () {
        var isSoundOnKey = this.getKeyWithUserId(this.isSoundOnKey);
        var isSoundOnStr = cc.sys.localStorage.getItem(isSoundOnKey);
        if (isSoundOnStr) {
            this.isSoundOn = isSoundOnStr === 'true';
        }
        else {
            this.isSoundOn = true; // 默认开启
        }
    };
    /**
     * 存储角色解锁状态
     */
    GameData.prototype.SaveUnlockedRolesData = function () {
        var unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        cc.sys.localStorage.setItem(unlockedRolesKey, JSON.stringify(this.unlockedRoles));
        UserDataSyncManager_1.default.requestUpload();
    };
    /**
     * 获取存储的角色解锁状态
     */
    GameData.prototype.GetUnlockedRolesData = function () {
        var unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        var unlockedRolesStr = cc.sys.localStorage.getItem(unlockedRolesKey);
        if (unlockedRolesStr) {
            this.unlockedRoles = JSON.parse(unlockedRolesStr);
        }
        else {
            this.unlockedRoles = [true, false, false, false, false]; // 默认解锁第一个角色
            // 首次运行时保存默认值
            this.SaveUnlockedRolesData();
        }
        console.log('加载角色解锁状态:', this.unlockedRoles);
    };
    /**
     * 存储当前选中角色
     */
    GameData.prototype.SaveCurrentRoleData = function () {
        var currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        cc.sys.localStorage.setItem(currentRoleKey, this.currentRole.toString());
        UserDataSyncManager_1.default.requestUpload();
    };
    /**
     * 获取存储的当前选中角色
     */
    GameData.prototype.GetCurrentRoleData = function () {
        var currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        var currentRoleStr = cc.sys.localStorage.getItem(currentRoleKey);
        if (currentRoleStr) {
            this.currentRole = parseInt(currentRoleStr);
        }
        else {
            this.currentRole = 0; // 默认选中第一个角色
            // 首次运行时保存默认值
            this.SaveCurrentRoleData();
        }
        console.log('加载当前选中角色:', this.currentRole);
    };
    /**
     * 存储技能数据
     */
    GameData.prototype.SaveSkillsData = function () {
        var skillsKey = this.getKeyWithUserId(this.skillsKey);
        cc.sys.localStorage.setItem(skillsKey, JSON.stringify(this.skills));
        UserDataSyncManager_1.default.requestUpload();
    };
    /**
     * 获取存储的技能数据
     */
    GameData.prototype.GetSkillsData = function () {
        var skillsKey = this.getKeyWithUserId(this.skillsKey);
        var skillsStr = cc.sys.localStorage.getItem(skillsKey);
        if (skillsStr) {
            this.skills = JSON.parse(skillsStr);
        }
        else {
            // 如果没有数据，使用默认技能数据
            this.skills = [
                {
                    id: 1,
                    name: '普通导弹',
                    level: 1,
                    maxLevel: 10,
                    description: '一颗一颗发射',
                    icon: 'jineng1',
                    baseEffect: 1,
                    effectPerLevel: 1,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                },
                {
                    id: 2,
                    name: '寒冰导弹',
                    level: 1,
                    maxLevel: 10,
                    description: '集群发射',
                    icon: 'jineng2',
                    baseEffect: 1,
                    effectPerLevel: 1,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                },
                {
                    id: 3,
                    name: '防护钢板',
                    level: 1,
                    maxLevel: 10,
                    description: '防护力+3',
                    icon: 'jineng3',
                    baseEffect: 3,
                    effectPerLevel: 3,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                },
                {
                    id: 4,
                    name: '穿甲弹',
                    level: 1,
                    maxLevel: 10,
                    description: '攻击力+1',
                    icon: 'jineng4',
                    baseEffect: 1,
                    effectPerLevel: 1,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                },
                {
                    id: 5,
                    name: '核弹',
                    level: 1,
                    maxLevel: 10,
                    description: '毁灭性伤害',
                    icon: 'jineng5',
                    baseEffect: 1,
                    effectPerLevel: 1,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                },
                {
                    id: 6,
                    name: '能量护盾',
                    level: 1,
                    maxLevel: 10,
                    description: '时间+1秒',
                    icon: 'jineng6',
                    baseEffect: 1,
                    effectPerLevel: 1,
                    upgradeCost: 100,
                    costIncreasePerLevel: 0
                }
            ];
            // 首次运行时保存默认值
            this.SaveSkillsData();
        }
        console.log('加载技能数据:', this.skills);
    };
    /**
     * 存储关卡数据
     */
    GameData.prototype.SaveLevelData = function () {
        var currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        var unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);
        var levelStarsKey = this.getKeyWithUserId(this.levelStarsKey);
        cc.sys.localStorage.setItem(currentLevelKey, this.currentLevel.toString());
        cc.sys.localStorage.setItem(unlockedLevelKey, this.unlockedLevel.toString());
        cc.sys.localStorage.setItem(levelStarsKey, JSON.stringify(this.levelStars));
        console.log('关卡数据已保存：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    };
    /**
     * 获取存储的关卡数据
     */
    GameData.prototype.GetLevelData = function () {
        var currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        var unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);
        var levelStarsKey = this.getKeyWithUserId(this.levelStarsKey);
        // 加载当前关卡
        var levelStr = cc.sys.localStorage.getItem(currentLevelKey);
        if (levelStr) {
            this.currentLevel = parseInt(levelStr);
        }
        else {
            this.currentLevel = 1;
        }
        // 加载已解锁关卡
        var unlockedLevelStr = cc.sys.localStorage.getItem(unlockedLevelKey);
        if (unlockedLevelStr) {
            this.unlockedLevel = parseInt(unlockedLevelStr);
        }
        else {
            this.unlockedLevel = 1;
        }
        // 加载关卡星级数据
        var levelStarsStr = cc.sys.localStorage.getItem(levelStarsKey);
        if (levelStarsStr) {
            this.levelStars = JSON.parse(levelStarsStr);
        }
        else {
            this.levelStars = [];
        }
        console.log('从本地加载关卡数据：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    };
    /**
     * 消耗一点体力
     * @returns 是否成功消耗
     */
    GameData.prototype.ConsumeStamina = function () {
        if (this.currentStamina > 0) {
            this.currentStamina--;
            this.SaveStaminaData();
            return true;
        }
        return false;
    };
    /**
     * 检查并恢复体力
     */
    GameData.prototype.CheckAndRecoverStamina = function () {
        var now = Date.now();
        var timeDiff = now - this.lastRecoverTime;
        var recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒
        // 计算应该恢复的体力点数
        var recoverPoints = Math.floor(timeDiff / recoverInterval);
        if (recoverPoints > 0) {
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + recoverPoints);
            this.lastRecoverTime += recoverPoints * recoverInterval;
            this.SaveStaminaData();
        }
    };
    /**
     * 检查是否有足够的体力开始游戏
     * @returns 是否有足够体力
     */
    GameData.prototype.HasEnoughStamina = function () {
        this.CheckAndRecoverStamina();
        return this.currentStamina > 0;
        // return true
    };
    /**
     * 计算距离下次恢复体力的剩余时间（毫秒）
     * @returns 剩余时间（毫秒），如果体力已满则返回0
     */
    GameData.prototype.GetRemainingRecoverTime = function () {
        // 如果体力已满，不需要恢复
        if (this.currentStamina >= this.maxStamina) {
            return 0;
        }
        var now = Date.now();
        var timeDiff = now - this.lastRecoverTime;
        var recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒
        // 计算距离下次恢复的剩余时间
        var remainingTime = recoverInterval - (timeDiff % recoverInterval);
        return remainingTime;
    };
    /**
     * 获取格式化的恢复倒计时字符串
     * @returns 格式化的时间字符串（MM:SS），如果体力已满则返回空字符串
     */
    GameData.prototype.GetFormattedRecoverTime = function () {
        var remainingTime = this.GetRemainingRecoverTime();
        if (remainingTime <= 0) {
            return "";
        }
        // 转换为分钟和秒
        var minutes = Math.floor(remainingTime / (60 * 1000));
        var seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        // 格式化为MM:SS格式
        return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
    };
    /**
     * 记录buff数据
     * @param self
     */
    GameData.prototype.initBuffzu = function (self) {
        this.buffTuji[0] = -1;
        this.buffTuji[1] = -1;
        this.buffTuji[2] = -1;
        if (this.buffTuji[0] == -1) {
            self.Spr1.spriteFrame = null;
            self.Spr2.spriteFrame = null;
            self.Spr3.spriteFrame = null;
        }
    };
    /**
     * 添加buff数据
     * @param num
     * @param self
     */
    GameData.prototype.addBuffNum = function (num, self) {
        var num0 = this.buffTuji[0];
        var num1 = this.buffTuji[1];
        if (num1 > -1) {
            if (num1 == num) {
                this.buffTuji[2] = num;
            }
            else {
                this.buffTuji[1] = -1;
                this.buffTuji[0] = num;
            }
        }
        else {
            if (num0 > -1) {
                if (num0 == num) {
                    this.buffTuji[1] = num;
                }
                else {
                    this.buffTuji[0] = num;
                }
            }
            else {
                this.buffTuji[0] = num;
            }
        }
        this.checkBuff(self);
    };
    /**
     * 检查是否满足buffer
     * @param self
     */
    GameData.prototype.checkBuff = function (self) {
        var num = this.buffTuji[2];
        if (num == -1)
            return;
        switch (num) {
            case 0:
                this.buff1(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
            case 1:
                this.buff2(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
            case 2:
                this.buff3(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
        }
    };
    GameData.prototype.buff1 = function (self) {
        var _this = this;
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff1");
        this.isTouchAgain = false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250, 0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(function () {
            _this.playerBuff = false;
            _this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (_this.playerHudun) {
                _this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    _this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        _this.playerLoc = 1;
                    }
                    else if (self.node.x < -150) {
                        self.anim.play('z1');
                        _this.playerLoc = -1;
                    }
                    else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            _this.playerLoc = 1;
                        }
                        else {
                            self.anim.play('z1');
                            _this.playerLoc = -1;
                        }
                    }
                }
            }
        });
        var action = cc.sequence(a1, a2, a3, a4, a5, a6);
        self.node.runAction(action);
    };
    GameData.prototype.buff2 = function (self) {
        var _this = this;
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff2");
        this.isTouchAgain = false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250, 0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(function () {
            _this.playerBuff = false;
            _this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (_this.playerHudun) {
                _this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    _this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        _this.playerLoc = 1;
                    }
                    else if (self.node.x < -150) {
                        self.anim.play('z1');
                        _this.playerLoc = -1;
                    }
                    else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            _this.playerLoc = 1;
                        }
                        else {
                            self.anim.play('z1');
                            _this.playerLoc = -1;
                        }
                    }
                }
            }
        });
        var action = cc.sequence(a1, a2, a3, a4, a5, a6);
        self.node.runAction(action);
    };
    GameData.prototype.buff3 = function (self) {
        var _this = this;
        // 检查dun是否存在
        if (self.dun) {
            this.playerHudun = self.dun;
            this.playerHudun.y = 100;
            self.node.stopAllActions();
            self.dun.opacity = 255;
            self.anim.play("buff3");
            this.isTouchAgain = false;
            this.playerBuff = true;
            this.BgMoveSpeed = 24;
            var a1 = cc.moveTo(0.5, cc.v2(0, 200));
            var a2 = cc.moveTo(3, cc.v2(250, 100));
            var a3 = cc.moveTo(3, cc.v2(-250, 0));
            var a4 = cc.moveTo(3, cc.v2(250, 0));
            var a5 = cc.moveTo(2, cc.v2(200, -197));
            var a6 = cc.callFunc(function () {
                _this.playerBuff = false;
                _this.BgMoveSpeed = 8;
                // 重置保护罩位置到人物中心
                if (_this.playerHudun) {
                    _this.playerHudun.y = 0;
                }
                // 确保玩家位置正确，并根据位置设置正确的状态
                if (self) {
                    // 检查角色是否到达地面位置
                    if (Math.abs(self.node.y + 197) < 10) {
                        // 角色已经在地面，可以恢复跳跃权限
                        _this.isTouchAgain = true;
                        // 恢复角色正常跑动动画
                        if (self.node.x > 150) {
                            self.anim.play('y1');
                            _this.playerLoc = 1;
                        }
                        else if (self.node.x < -150) {
                            self.anim.play('z1');
                            _this.playerLoc = -1;
                        }
                        else {
                            // 如果角色在中间位置，根据当前位置设置方向
                            if (self.node.x > 0) {
                                self.anim.play('y1');
                                _this.playerLoc = 1;
                            }
                            else {
                                self.anim.play('z1');
                                _this.playerLoc = -1;
                            }
                        }
                    }
                }
            });
            var action = cc.sequence(a1, a2, a3, a4, a5, a6);
            self.node.runAction(action);
        }
        else {
            console.warn('self.dun未找到，无法执行buff3效果');
        }
    };
    /**
     * buff图片管理
     * @param self
     */
    GameData.prototype.changeSprs = function (self) {
        self.Spr1.spriteFrame = self.SprZu[this.buffTuji[0]];
        self.Spr2.spriteFrame = self.SprZu[this.buffTuji[1]];
        self.Spr3.spriteFrame = self.SprZu[this.buffTuji[2]];
    };
    /**数据初始化 */
    GameData.prototype.initGame = function () {
        //控制克隆怪物
        this.isGameBegin = true;
        //开启触屏
        this.playerLoc = -1;
        this.isTouchAgain = true;
        this.EveryScore = 0;
        // 重置玩家buff状态，避免永久无敌
        this.playerBuff = false;
        // 重置速度为初始值
        this.BgMoveSpeed = 8;
        this.MoveSpeed = 10;
        // 重置buff图片状态
        this.buffTuji = [-1, -1, -1];
        // 重置护盾节点
        this.playerHudun = null;
        // 重置PlayerManager引用
        this.playerManager = null;
        // 不改变当前游戏模式（保持无限模式或关卡模式）
        // 无限模式下不重置currentLevel，保持用户进度
    };
    /**
     * 初始化关卡游戏
     */
    GameData.prototype.initLevelGame = function () {
        this.initGame();
        this.isInfiniteMode = false;
        this.EveryScore = 0;
    };
    /**
     * 获取当前关卡的目标分数
     * @returns 当前关卡目标分数
     */
    GameData.prototype.getCurrentLevelTargetScore = function () {
        var levelConfig = this.getCurrentLevelConfig();
        // if (levelConfig) {
        //     return levelConfig.star1;
        // }
        return 0;
    };
    /**
     * 获取当前关卡的配置
     * @returns 当前关卡配置
     */
    GameData.prototype.getCurrentLevelConfig = function () {
        var index = this.currentLevel - 1;
        return this.levelConfigs[index] || null;
    };
    /**
     * 根据关卡ID获取关卡配置
     * @param level 关卡ID
     * @returns 关卡配置
     */
    GameData.prototype.getLevelConfig = function (level) {
        var index = level - 1;
        return this.levelConfigs[index] || null;
    };
    /**
     * 计算获得的星星数
     * @param score 当前得分
     * @returns 获得的星星数（0-3）
     */
    GameData.prototype.calculateStars = function (score) {
        if (this.isInfiniteMode) {
            // 无限模式下的星星计算逻辑：基于分数范围
            if (score >= 401) {
                return 3; // 401分以上，获得3颗星
            }
            else if (score >= 201) {
                return 2; // 201-400分，获得2颗星
            }
            else if (score >= 101) {
                return 1; // 101-200分，获得1颗星
            }
            else {
                return 0; // 0-100分，获得0颗星
            }
        }
        else {
            // 关卡模式下的星星计算逻辑：基于配置文件中的星星条件
            var levelConfig = this.getCurrentLevelConfig();
            if (!levelConfig) {
                console.error('当前关卡配置不存在');
                return 0;
            }
            // 使用配置文件中的星星条件
            // if (score >= levelConfig.star3) {
            //     return 3; // 达到3星条件
            // } else if (score >= levelConfig.star2) {
            //     return 2; // 达到2星条件
            // } else if (score >= levelConfig.star1) {
            //     return 1; // 达到1星条件
            // } else {
            //     return 0; // 未达到任何星星条件
            // }
        }
    };
    /**
     * 保存指定关卡获得的星星数（使用数组方式存储）
     * @param level 关卡号
     * @param stars 获得的星星数
     */
    GameData.prototype.saveLevelStarsByLevel = function (level, stars) {
        if (level < 1 || level > this.getTotalLevels()) {
            console.warn("\u4FDD\u5B58\u661F\u661F\u6570\u5931\u8D25\uFF1A\u5173\u5361\u53F7" + level + "\u65E0\u6548");
            return;
        }
        var levelIndex = level - 1; // 数组索引从0开始
        // 确保数组足够大
        while (this.levelStars.length <= levelIndex) {
            this.levelStars.push(0);
        }
        var currentStars = this.levelStars[levelIndex] || 0;
        if (stars > currentStars) {
            this.levelStars[levelIndex] = stars;
            // 保存到本地存储
            var levelStarsKey = this.getKeyWithUserId(this.levelStarsKey);
            cc.sys.localStorage.setItem(levelStarsKey, JSON.stringify(this.levelStars));
            console.log("\u5173\u5361" + level + "\u83B7\u5F97" + stars + "\u9897\u661F\uFF08\u6BD4\u4E4B\u524D\u7684" + currentStars + "\u9897\u66F4\u591A\uFF09\uFF0C\u5DF2\u4FDD\u5B58");
        }
        else {
            console.log("\u5173\u5361" + level + "\u83B7\u5F97" + stars + "\u9897\u661F\uFF0C\u672A\u8D85\u8FC7\u4E4B\u524D\u7684" + currentStars + "\u9897\uFF0C\u4E0D\u4FDD\u5B58");
        }
    };
    /**
     * 保存当前关卡获得的星星数（使用数组方式存储）
     * @param stars 获得的星星数
     */
    GameData.prototype.saveLevelStars = function (stars) {
        var levelIndex = this.currentLevel - 1; // 数组索引从0开始
        // 确保数组足够大
        while (this.levelStars.length <= levelIndex) {
            this.levelStars.push(0);
        }
        var currentStars = this.levelStars[levelIndex] || 0;
        if (stars > currentStars) {
            this.levelStars[levelIndex] = stars;
            // 保存到本地存储
            var levelStarsKey = this.getKeyWithUserId(this.levelStarsKey);
            cc.sys.localStorage.setItem(levelStarsKey, JSON.stringify(this.levelStars));
            console.log("\u5173\u5361" + this.currentLevel + "\u83B7\u5F97" + stars + "\u9897\u661F\uFF08\u6BD4\u4E4B\u524D\u7684" + currentStars + "\u9897\u66F4\u591A\uFF09\uFF0C\u5DF2\u4FDD\u5B58");
        }
        else {
            console.log("\u5173\u5361" + this.currentLevel + "\u83B7\u5F97" + stars + "\u9897\u661F\uFF0C\u672A\u8D85\u8FC7\u4E4B\u524D\u7684" + currentStars + "\u9897\uFF0C\u4E0D\u4FDD\u5B58");
        }
    };
    /**
     * 获取指定关卡获得的星星数（从数组中读取）
     * @param level 关卡数
     * @returns 获得的星星数（0-3）
     */
    GameData.prototype.getLevelStars = function (level) {
        if (level < 1 || level > this.getTotalLevels()) {
            console.warn("\u83B7\u53D6\u661F\u661F\u6570\u5931\u8D25\uFF1A\u5173\u5361\u53F7" + level + "\u65E0\u6548");
            return 0;
        }
        var levelIndex = level - 1; // 数组索引从0开始
        var stars = 0;
        // 优先从内存数组读取
        if (this.levelStars && this.levelStars.length > levelIndex) {
            stars = this.levelStars[levelIndex] || 0;
        }
        // 如果关卡已解锁（小于unlockedLevel）但星级为0，给默认1星（兼容旧账号）
        // 已解锁但未通关的关卡（unlockedLevel）不给默认星
        if (stars === 0 && level < this.unlockedLevel) {
            stars = 1;
        }
        // 确保星星数量在合理范围内
        var validStars = Math.max(0, Math.min(stars, 3));
        return validStars;
    };
    /**
     * 获取所有关卡的星级数组（用于同步到服务端）
     * @returns 星级数组，索引为关卡号 -1
     */
    GameData.prototype.getLevelStarsArray = function () {
        var totalLevels = this.getTotalLevels();
        var starsArray = [];
        for (var i = 1; i <= totalLevels; i++) {
            starsArray.push(this.getLevelStars(i));
        }
        return starsArray;
    };
    /**
     * 从服务端加载星级数组（使用数组方式存储）
     * @param starsArray 星级数组
     */
    GameData.prototype.loadLevelStarsArray = function (starsArray) {
        if (!Array.isArray(starsArray)) {
            console.warn('星级数组格式错误');
            return;
        }
        var totalLevels = this.getTotalLevels();
        // 合并服务端数据与本地数据，保留最高星级
        for (var i = 0; i < Math.min(starsArray.length, totalLevels); i++) {
            var stars = starsArray[i];
            if (typeof stars === 'number' && stars >= 0 && stars <= 3) {
                // 确保数组足够大
                while (this.levelStars.length <= i) {
                    this.levelStars.push(0);
                }
                // 保留最高星级
                if (stars > this.levelStars[i]) {
                    this.levelStars[i] = stars;
                }
            }
        }
        // 保存到本地存储
        var levelStarsKey = this.getKeyWithUserId(this.levelStarsKey);
        cc.sys.localStorage.setItem(levelStarsKey, JSON.stringify(this.levelStars));
        console.log("\u5DF2\u4ECE\u670D\u52A1\u7AEF\u52A0\u8F7D\u661F\u7EA7\u6570\u636E\uFF0C\u5171" + starsArray.length + "\u4E2A\u5173\u5361");
    };
    /**
     * 重置关卡进度为第一关
     */
    GameData.prototype.resetLevelProgress = function () {
        this.currentLevel = 1;
        var currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        cc.sys.localStorage.removeItem(currentLevelKey);
        var totalLevels = this.getTotalLevels();
        for (var i = 1; i <= totalLevels; i++) {
            var starsKey = this.getKeyWithUserId("LevelStars_" + i);
            cc.sys.localStorage.removeItem(starsKey);
        }
        console.log('关卡进度已重置，重新从第 1 关开始');
    };
    /**
     * 获取总关卡数
     * @returns 总关卡数
     */
    GameData.prototype.getTotalLevels = function () {
        return this.levelConfigs.length;
    };
    /**
     * 获取已解锁的最高关卡
     * @returns 已解锁的最高关卡号
     */
    GameData.prototype.getHighestUnlockedLevel = function () {
        // 从最高关卡开始向下遍历，找到第一个已解锁的关卡
        for (var level = this.getTotalLevels(); level >= 2; level--) {
            if (this.isLevelUnlocked(level)) {
                return level;
            }
        }
        // 如果没有找到（理论上不可能，因为第一关总是解锁的），返回第一关
        return 1;
    };
    /**
     * 检查剧情弹窗是否已显示
     * @returns 是否已显示
     */
    GameData.prototype.isStoryPopupShown = function () {
        var key = this.getKeyWithUserId(this.storyPopupShownKey);
        var value = cc.sys.localStorage.getItem(key);
        return value === 'true';
    };
    /**
     * 记录剧情弹窗已显示
     */
    GameData.prototype.setStoryPopupShown = function () {
        var key = this.getKeyWithUserId(this.storyPopupShownKey);
        cc.sys.localStorage.setItem(key, 'true');
    };
    /**
     * 获取指定技能的当前效果值
     * @param skillId 技能ID
     * @returns 当前效果值
     */
    GameData.prototype.getSkillEffect = function (skillId) {
        var skill = this.skills.find(function (s) { return s.id === skillId; });
        if (!skill)
            return 0;
        return skill.baseEffect + (skill.level - 1) * skill.effectPerLevel;
    };
    /**
     * 检查关卡是否解锁
     * @param level 关卡号
     * @returns 是否解锁
     */
    GameData.prototype.isLevelUnlocked = function (level) {
        // 确保关卡号有效
        var totalLevels = this.getTotalLevels();
        if (level < 1 || level > totalLevels) {
            return false;
        }
        // 所有小于等于已解锁关卡的关卡都应该解锁
        if (level <= this.unlockedLevel) {
            return true;
        }
        // 超过已解锁关卡，按照原逻辑判断
        return false;
    };
    var GameData_1;
    // 静态关卡配置数组
    GameData.LEVEL_CONFIGS = [
        { levelId: 1, icon: "level_1", time: 30, Monster: [0], num: 10, speed: 1 },
        { levelId: 2, icon: "level_1", time: 35, Monster: [0, 1], num: 12, speed: 1.1 },
        { levelId: 3, icon: "level_1", time: 40, Monster: [0, 1, 2], num: 14, speed: 1.15 },
        { levelId: 4, icon: "level_1", time: 42, Monster: [0, 1, 2], num: 16, speed: 1.2 },
        { levelId: 5, icon: "level_1", time: 43, Monster: [0, 2], num: 18, speed: 1.25 },
        { levelId: 6, icon: "level_1", time: 44, Monster: [1, 2], num: 20, speed: 1.3 },
        { levelId: 7, icon: "level_1", time: 45, Monster: [0, 1, 2], num: 22, speed: 1.35 },
        { levelId: 8, icon: "level_1", time: 45, Monster: [0, 2], num: 24, speed: 1.4 },
        { levelId: 9, icon: "level_1", time: 45, Monster: [1, 2], num: 26, speed: 1.45 },
        { levelId: 10, icon: "level_1", time: 45, Monster: [0, 1, 2], num: 28, speed: 1.5 },
        { levelId: 11, icon: "level_1", time: 46, Monster: [0, 1, 2], num: 30, speed: 1.5 },
        { levelId: 12, icon: "level_1", time: 47, Monster: [0, 1, 2], num: 32, speed: 1.55 },
        { levelId: 13, icon: "level_2", time: 48, Monster: [0, 1, 3], num: 34, speed: 1.6 },
        { levelId: 14, icon: "level_2", time: 48, Monster: [2, 3], num: 36, speed: 1.6 },
        { levelId: 15, icon: "level_2", time: 49, Monster: [0, 3], num: 38, speed: 1.65 },
        { levelId: 16, icon: "level_2", time: 49, Monster: [1, 3], num: 40, speed: 1.7 },
        { levelId: 17, icon: "level_2", time: 50, Monster: [0, 1, 2, 3], num: 42, speed: 1.7 },
        { levelId: 18, icon: "level_2", time: 50, Monster: [0, 2, 3], num: 44, speed: 1.75 },
        { levelId: 19, icon: "level_2", time: 50, Monster: [1, 2, 3], num: 46, speed: 1.75 },
        { levelId: 20, icon: "level_2", time: 50, Monster: [0, 1, 3], num: 48, speed: 1.8 },
        { levelId: 21, icon: "level_2", time: 51, Monster: [0, 2, 3], num: 50, speed: 1.8 },
        { levelId: 22, icon: "level_2", time: 52, Monster: [1, 2, 3], num: 52, speed: 1.8 },
        { levelId: 23, icon: "level_2", time: 52, Monster: [0, 1, 2, 3], num: 54, speed: 1.85 },
        { levelId: 24, icon: "level_2", time: 53, Monster: [0, 1, 2, 3], num: 56, speed: 1.85 },
        { levelId: 25, icon: "level_3", time: 53, Monster: [0, 4], num: 58, speed: 1.9 },
        { levelId: 26, icon: "level_3", time: 54, Monster: [1, 4], num: 60, speed: 1.9 },
        { levelId: 27, icon: "level_3", time: 54, Monster: [2, 4], num: 62, speed: 1.9 },
        { levelId: 28, icon: "level_3", time: 55, Monster: [3, 4], num: 64, speed: 1.9 },
        { levelId: 29, icon: "level_3", time: 55, Monster: [0, 1, 4], num: 66, speed: 1.95 },
        { levelId: 30, icon: "level_3", time: 55, Monster: [0, 2, 4], num: 68, speed: 1.95 },
        { levelId: 31, icon: "level_3", time: 56, Monster: [1, 3, 4], num: 70, speed: 1.95 },
        { levelId: 32, icon: "level_3", time: 57, Monster: [0, 1, 2, 4], num: 72, speed: 2 },
        { levelId: 33, icon: "level_3", time: 57, Monster: [0, 3, 4], num: 74, speed: 2 },
        { levelId: 34, icon: "level_3", time: 58, Monster: [1, 2, 3, 4], num: 76, speed: 2 },
        { levelId: 35, icon: "level_3", time: 58, Monster: [0, 1, 2, 3, 4], num: 78, speed: 2 },
        { levelId: 36, icon: "level_3", time: 59, Monster: [0, 1, 2, 3, 4], num: 80, speed: 2 },
        { levelId: 37, icon: "level_4", time: 59, Monster: [0, 2, 3, 4], num: 82, speed: 2 },
        { levelId: 38, icon: "level_4", time: 60, Monster: [1, 2, 3, 4], num: 84, speed: 2 },
        { levelId: 39, icon: "level_4", time: 60, Monster: [0, 1, 3, 4], num: 86, speed: 2 },
        { levelId: 40, icon: "level_4", time: 60, Monster: [0, 1, 2, 3, 4], num: 88, speed: 2 },
        { levelId: 41, icon: "level_4", time: 60, Monster: [0, 1, 2, 4], num: 90, speed: 2 },
        { levelId: 42, icon: "level_4", time: 60, Monster: [1, 2, 3, 4], num: 92, speed: 2 },
        { levelId: 43, icon: "level_4", time: 60, Monster: [0, 3, 4], num: 94, speed: 2 },
        { levelId: 44, icon: "level_4", time: 60, Monster: [0, 1, 2, 3, 4], num: 96, speed: 2 },
        { levelId: 45, icon: "level_4", time: 60, Monster: [2, 3, 4], num: 98, speed: 2 },
        { levelId: 46, icon: "level_4", time: 60, Monster: [0, 1, 4], num: 100, speed: 2 },
        { levelId: 47, icon: "level_4", time: 60, Monster: [0, 1, 2, 3, 4], num: 102, speed: 2 },
        { levelId: 48, icon: "level_4", time: 60, Monster: [1, 3, 4], num: 104, speed: 2 },
        { levelId: 49, icon: "level_5", time: 60, Monster: [0, 2, 3, 4], num: 106, speed: 2 },
        { levelId: 50, icon: "level_5", time: 60, Monster: [0, 1, 2, 3, 4], num: 108, speed: 2 },
        { levelId: 51, icon: "level_5", time: 60, Monster: [1, 2, 4], num: 110, speed: 2 },
        { levelId: 52, icon: "level_5", time: 60, Monster: [0, 3, 4], num: 112, speed: 2 },
        { levelId: 53, icon: "level_5", time: 60, Monster: [0, 1, 2, 3, 4], num: 114, speed: 2 },
        { levelId: 54, icon: "level_5", time: 60, Monster: [2, 3, 4], num: 116, speed: 2 },
        { levelId: 55, icon: "level_5", time: 60, Monster: [0, 1, 4], num: 118, speed: 2 },
        { levelId: 56, icon: "level_5", time: 60, Monster: [0, 1, 2, 3, 4], num: 120, speed: 2 },
        { levelId: 57, icon: "level_5", time: 60, Monster: [1, 2, 3, 4], num: 122, speed: 2 },
        { levelId: 58, icon: "level_5", time: 60, Monster: [0, 1, 2, 3, 4], num: 124, speed: 2 },
        { levelId: 59, icon: "level_5", time: 60, Monster: [0, 2, 3, 4], num: 126, speed: 2 },
        { levelId: 60, icon: "level_5", time: 60, Monster: [0, 1, 2, 3, 4], num: 130, speed: 2 },
        { levelId: 61, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 132, speed: 2 },
        { levelId: 62, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 134, speed: 2 },
        { levelId: 63, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 136, speed: 2 },
        { levelId: 64, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 138, speed: 2 },
        { levelId: 65, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 140, speed: 2 },
        { levelId: 66, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 142, speed: 2 },
        { levelId: 67, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 144, speed: 2 },
        { levelId: 68, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 146, speed: 2 },
        { levelId: 69, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 148, speed: 2 },
        { levelId: 70, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 150, speed: 2 },
        { levelId: 71, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 152, speed: 2 },
        { levelId: 72, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 154, speed: 2 },
        { levelId: 73, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 156, speed: 2 },
        { levelId: 74, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 158, speed: 2 },
        { levelId: 75, icon: "level_6", time: 60, Monster: [0, 1, 2, 3, 4], num: 160, speed: 2 },
    ];
    GameData = GameData_1 = __decorate([
        ccclass
    ], GameData);
    return GameData;
}());
var mGameData = new GameData();
exports.default = mGameData;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcR2FtZURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNFQUFpRTtBQUUzRCxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQWExQztJQTRLSTtRQTNLQSxlQUFlO1FBQ1IsWUFBTyxHQUFXLElBQUksQ0FBQztRQUM5QixhQUFhO1FBQ04sY0FBUyxHQUFXLElBQUksQ0FBQztRQUNoQyxjQUFjO1FBQ1AsZUFBVSxHQUFVLFNBQVMsQ0FBQztRQUNyQyxjQUFjO1FBQ1AsaUJBQVksR0FBVSxXQUFXLENBQUM7UUFDekMsUUFBUTtRQUNELGdCQUFXLEdBQVcsSUFBSSxDQUFDO1FBQ2xDLFFBQVE7UUFDRCxnQkFBVyxHQUFVLENBQUMsQ0FBQztRQUM5QixTQUFTO1FBQ0YsaUJBQVksR0FBVyxJQUFJLENBQUM7UUFDbkMsaUJBQWlCO1FBQ1YsY0FBUyxHQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzdCLFFBQVE7UUFDRCxlQUFVLEdBQVUsQ0FBQyxDQUFDO1FBQzdCLFFBQVE7UUFDRCxjQUFTLEdBQVUsQ0FBQyxDQUFDO1FBQzVCLFlBQVk7UUFDTCxlQUFVLEdBQVcsS0FBSyxDQUFDO1FBQ2xDLFFBQVE7UUFDRCxrQkFBYSxHQUFXLElBQUksQ0FBQztRQUNwQyxZQUFZO1FBQ0wsaUJBQVksR0FBVSxXQUFXLENBQUM7UUFDekMsMEJBQTBCO1FBQ25CLGFBQVEsR0FBa0IsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLEtBQUs7UUFDRSxnQkFBVyxHQUFXLElBQUksQ0FBQztRQUNsQyxpQkFBaUI7UUFDVixrQkFBYSxHQUFPLElBQUksQ0FBQztRQUNoQyxRQUFRO1FBQ0QsY0FBUyxHQUFVLEVBQUUsQ0FBQztRQUM3QixRQUFRO1FBQ0QsbUJBQWMsR0FBVSxF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QU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDN0UsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDN0UsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUMvRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDbEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUNqRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDakYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUNqRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNsRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2xGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2xGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUMvRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUMvRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNqRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUMvRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDL0UsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNqRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7S0FDdEYsQ0FBQztJQTFLSSxRQUFRO1FBRGIsT0FBTztPQUNGLFFBQVEsQ0EweENiO0lBQUQsZUFBQztDQTF4Q0QsQUEweENDLElBQUE7QUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBQy9CLGtCQUFlLFNBQVMsQ0FBQyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gXCIuLi9NYW5hZ2VyL1VzZXJEYXRhU3luY01hbmFnZXJcIjtcclxuXHJcbmNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxuLy8g5YWz5Y2h6YWN572u5o6l5Y+jXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxDb25maWcge1xyXG4gICAgbGV2ZWxJZDogbnVtYmVyOyAvL+WFs+WNoVxyXG4gICAgaWNvbjogc3RyaW5nOyAgIC8vaWNvbuWbvuagh1xyXG4gICAgdGltZTogbnVtYmVyOyAgIC8v6YCa5YWz5pe26Ze0XHJcbiAgICBNb25zdGVyOiBBcnJheTxudW1iZXI+OyAvLyDlj6/lh7rnjrDnmoTmgKrniannsbvlnotcclxuICAgIG51bTogbnVtYmVyOyAvLyDmgKrnianmlbDph49cclxuICAgIHNwZWVkOiBudW1iZXI7IC8vIOaAqueJqeenu+WKqOmAn+W6plxyXG59XHJcblxyXG5AY2NjbGFzc1xyXG5jbGFzcyBHYW1lRGF0YXtcclxuICAgIC8v6IOM5pmv6Z+z5LmQ5piv5ZCm5byA5ZCvLOm7mOiupOW8gOWQr1xyXG4gICAgcHVibGljIGlzQkdNT246Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+mfs+aViOaYr+WQpuW8gOWQryzpu5jorqTlvIDlkK9cclxuICAgIHB1YmxpYyBpc1NvdW5kT246Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+WtmOWCqOmfs+mikeW8gOWFs+eKtuaAgeeahGtleVxyXG4gICAgcHVibGljIGlzQkdNT25LZXk6c3RyaW5nID0gJ0lzQkdNT24nO1xyXG4gICAgLy/lrZjlgqjpn7PmlYjlvIDlhbPnirbmgIHnmoRrZXlcclxuICAgIHB1YmxpYyBpc1NvdW5kT25LZXk6c3RyaW5nID0gJ0lzU291bmRPbic7XHJcbiAgICAvL+a4uOaIj+aYr+WQpuW8gOWni1xyXG4gICAgcHVibGljIGlzR2FtZUJlZ2luOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy/og4zmma/np7vliqjpgJ/luqZcclxuICAgIHB1YmxpYyBCZ01vdmVTcGVlZDpudW1iZXIgPSA4O1xyXG4gICAgLy/mmK/lkKbnrKzkuozmrKHop6bmkbhcclxuICAgIHB1YmxpYyBpc1RvdWNoQWdhaW46Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+eOqeWutuaJgOWkhOS9jee9ruOAgi0x5Zyo5bem77yMMeWcqOWPs1xyXG4gICAgcHVibGljIHBsYXllckxvYzpudW1iZXIgPSAtMTtcclxuICAgIC8v546p5a625b2T5LiL5b6X5YiGXHJcbiAgICBwdWJsaWMgRXZlcnlTY29yZTpudW1iZXIgPSAwO1xyXG4gICAgLy/njqnlrrbmnIDpq5jlvpfliIZcclxuICAgIHB1YmxpYyBCZXN0U2NvcmU6bnVtYmVyID0gMDtcclxuICAgIC8v6K6w5b2V546p5a62QlVGRueKtuaAgVxyXG4gICAgcHVibGljIHBsYXllckJ1ZmY6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLy/mmK/lkKblvq7kv6HliIbkuqtcclxuICAgIHB1YmxpYyBpc09wZW5XWFNoYXJlOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy/lrZjlgqjml7bnmoTmnIDpq5jliIZrZXlcclxuICAgIHB1YmxpYyBCZXN0U2NvcmVLZXk6c3RyaW5nID0gJ0Jlc3RTY29yZSc7XHJcbiAgICAvL2J1Zmblm77niYcoMC3po57plZbvvIwxLS3omorlrZDvvIwyLS3ni5Dni7gpXHJcbiAgICBwdWJsaWMgYnVmZlR1amk6IEFycmF5PG51bWJlcj4gPSBbLTEsLTEsLTFdO1xyXG4gICAgLy/miqTnm77lgLxcclxuICAgIHB1YmxpYyBwbGF5ZXJIdWR1bjpjYy5Ob2RlID0gbnVsbDtcclxuICAgIC8vUGxheWVyTWFuYWdlcuWunuS+i1xyXG4gICAgcHVibGljIHBsYXllck1hbmFnZXI6YW55ID0gbnVsbDtcclxuICAgIC8v54mp5L2T56e75Yqo6YCf5bqmXHJcbiAgICBwdWJsaWMgTW92ZVNwZWVkOm51bWJlciA9IDEwO1xyXG4gICAgLy/kvZPlipvns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBjdXJyZW50U3RhbWluYTpudW1iZXIgPSAzMDsgLy/lvZPliY3kvZPlipvlgLxcclxuICAgIHB1YmxpYyBtYXhTdGFtaW5hOm51bWJlciA9IDMwOyAvL+acgOWkp+S9k+WKm+WAvFxyXG4gICAgcHVibGljIGxhc3RSZWNvdmVyVGltZTpudW1iZXIgPSBEYXRlLm5vdygpOyAvL+S4iuasoeaBouWkjeS9k+WKm+eahOaXtumXtOaIs1xyXG4gICAgcHVibGljIHN0YW1pbmFLZXk6c3RyaW5nID0gJ1N0YW1pbmEnOyAvL+WtmOWCqOS9k+WKm+eahGtleVxyXG4gICAgcHVibGljIGxhc3RSZWNvdmVyVGltZUtleTpzdHJpbmcgPSAnTGFzdFJlY292ZXJUaW1lJzsgLy/lrZjlgqjkuIrmrKHmgaLlpI3ml7bpl7TnmoRrZXlcclxuICAgIFxyXG4gICAgLy/pkrvnn7Pns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBjdXJyZW50R29sZDpudW1iZXIgPSAwOyAvL+W9k+WJjemSu+efs+aVsOmHj++8jOWIneWni+e7mTEwMDBcclxuICAgIHB1YmxpYyBnb2xkS2V5OnN0cmluZyA9ICdDdXJyZW50R29sZCc7IC8v5a2Y5YKo6ZK755+z55qEa2V5XHJcbiAgICBwdWJsaWMgdG90YWxHb2xkRWFybmVkOm51bWJlciA9IDA7IC8v57Sv6K6h6I635b6X6ZK755+z5pWw6YePXHJcbiAgICBwdWJsaWMgdG90YWxHb2xkRWFybmVkS2V5OnN0cmluZyA9ICdUb3RhbEdvbGRFYXJuZWQnOyAvL+WtmOWCqOe0r+iuoemSu+efs+eahGtleVxyXG4gICAgXHJcbiAgICAvL+inkuiJsuezu+e7n+ebuOWFs1xyXG4gICAgcHVibGljIHVubG9ja2VkUm9sZXM6IEFycmF5PGJvb2xlYW4+ID0gW3RydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTsgLy/op5LoibLop6PplIHnirbmgIHvvIzpu5jorqTop6PplIHnrKzkuIDkuKrop5LoibJcclxuICAgIHB1YmxpYyBjdXJyZW50Um9sZTogbnVtYmVyID0gMDsgLy/lvZPliY3pgInkuK3nmoTop5LoibLntKLlvJVcclxuICAgIHB1YmxpYyB1bmxvY2tlZFJvbGVzS2V5OnN0cmluZyA9ICdVbmxvY2tlZFJvbGVzJzsgLy/lrZjlgqjop5LoibLop6PplIHnirbmgIHnmoRrZXlcclxuICAgIHB1YmxpYyBjdXJyZW50Um9sZUtleTpzdHJpbmcgPSAnQ3VycmVudFJvbGUnOyAvL+WtmOWCqOW9k+WJjemAieS4reinkuiJsueahGtleVxyXG4gICAgcHVibGljIHJvbGVXZWlnaHRzOiBBcnJheTxudW1iZXI+ID0gWzEwLCAyMCwgMzAsIDQwLCA1MF07IC8v6KeS6Imy6YeN6YePXHJcbiAgICBwdWJsaWMgcm9sZVByaWNlczogQXJyYXk8bnVtYmVyPiA9IFswLCAyMDAwLCA0MDAwLCA2MDAwLCA4MDAwXTsgLy/op5LoibLku7fmoLxcclxuICAgIHB1YmxpYyByb2xlTmFtZXM6IEFycmF5PHN0cmluZz4gPSBbJ+eip+epueWJkeWnrCcsICfotaTnhLDnlr7lp6wnLCAn546E55Sy5Y2r5aOrJywgJ+eCjueBteazleWwiicsICfmnIjlvbHliLrlp6wnXTsgLy/op5LoibLlkI3np7BcbiAgICBcclxuICAgIC8v5ZWG5bqX6YGT5YW35bqT5a2Y55u45YWzXHJcbiAgICBwdWJsaWMgaXRlbVN0b2NrOiBBcnJheTxudW1iZXI+ID0gWzAsIDAsIDBdOyAvL+mBk+WFtzEtM+eahOW6k+WtmFxyXG4gICAgcHVibGljIGl0ZW1TdG9ja0tleTpzdHJpbmcgPSAnSXRlbVN0b2NrJzsgLy/lrZjlgqjpgZPlhbflupPlrZjnmoRrZXlcclxuICAgIFxyXG4gICAgLy/mioDog73ns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBza2lsbHM6IEFycmF5PHtcclxuICAgICAgICBpZDogbnVtYmVyOyAgICAgICAgICAgICAgLy8g5oqA6IO95ZSv5LiASURcclxuICAgICAgICBuYW1lOiBzdHJpbmc7ICAgICAgICAgICAgLy8g5oqA6IO95ZCN56ewXHJcbiAgICAgICAgbGV2ZWw6IG51bWJlcjsgICAgICAgICAgIC8vIOW9k+WJjeaKgOiDveetiee6p1xyXG4gICAgICAgIG1heExldmVsOiBudW1iZXI7ICAgICAgICAvLyDmioDog73mnIDpq5jnrYnnuqdcclxuICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nOyAgICAgLy8g5oqA6IO95o+P6L+wXHJcbiAgICAgICAgaWNvbjogc3RyaW5nOyAgICAgICAgICAgIC8vIOaKgOiDveWbvuagh+i1hOa6kOWQjVxyXG4gICAgICAgIGJhc2VFZmZlY3Q6IG51bWJlcjsgICAgICAvLyDmioDog73ln7rnoYDmlYjmnpzlgLxcclxuICAgICAgICBlZmZlY3RQZXJMZXZlbDogbnVtYmVyOyAgLy8g5q+P57qn5aKe5Yqg55qE5pWI5p6c5YC8XHJcbiAgICAgICAgdXBncmFkZUNvc3Q6IG51bWJlcjsgICAgIC8vIOWIneWni+WNh+e6p+aIkOacrO+8iDHnuqfljYcy57qn55qE5oiQ5pys77yJXHJcbiAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IG51bWJlcjsgLy8g5q+P57qn5Y2H57qn5oiQ5pys5aKe5Yqg6YePXHJcbiAgICB9PiA9IFtdOyAvL+aKgOiDveaVsOaNrlxyXG4gICAgcHVibGljIHNraWxsc0tleTpzdHJpbmcgPSAnU2tpbGxzJzsgLy/lrZjlgqjmioDog73mlbDmja7nmoRrZXlcclxuICAgIFxyXG4gICAgLy/lhbPljaHmqKHlvI/nm7jlhbNcclxuICAgIHB1YmxpYyBpc0luZmluaXRlTW9kZTpib29sZWFuID0gdHJ1ZTsgLy/mmK/lkKbkuLrml6DpmZDmqKHlvI/vvIxmYWxzZeS4uuWFs+WNoeaooeW8j1xyXG4gICAgcHVibGljIGN1cnJlbnRMZXZlbDpudW1iZXIgPSAxOyAvL+W9k+WJjeato+WcqOeOqeeahOWFs+WNoVxyXG4gICAgcHVibGljIHVubG9ja2VkTGV2ZWw6bnVtYmVyID0gMTsgLy/lt7Lnu4/op6PplIHnmoTmnIDpq5jlhbPljaFcclxuICAgIC8v5piv5ZCm6Ieq5Yqo5omT5byA5YWz5Y2h6YCJ5oup55WM6Z2iXHJcbiAgICBwdWJsaWMgc2hvdWxkT3BlbkxldmVsU2VsZWN0OmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgLy8g5YWz5Y2h5pif57qn5pWw5o2uIC0g5a2Y5YKo5q+P5Liq5YWz5Y2h55qE5pyA6auY5pif57qn77yIMC0z5pif77yJXHJcbiAgICBwdWJsaWMgbGV2ZWxTdGFyczogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG4gICAgcHVibGljIGxldmVsU3RhcnNLZXk6c3RyaW5nID0gJ0xldmVsU3RhcnMnOyAvL+WtmOWCqOWFs+WNoeaYn+e6p+eahGtleVxyXG4gICAgXHJcbiAgICAvLyDmianlsZXlhbPljaHliLAxMDDlhbPvvIzpmr7luqbpgJDmuJDlop7liqBcclxuICAgIHB1YmxpYyBsZXZlbFRhcmdldFNjb3JlczpBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgLy8g5YWz5Y2h6YWN572u5pWw57uEXHJcbiAgICBwdWJsaWMgbGV2ZWxDb25maWdzOiBBcnJheTxMZXZlbENvbmZpZz4gPSBbXTtcclxuICAgIFxyXG4vLyDpnZnmgIHlhbPljaHphY3nva7mlbDnu4RcclxucHJpdmF0ZSBzdGF0aWMgTEVWRUxfQ09ORklHUzogTGV2ZWxDb25maWdbXSA9IFtcclxuICAgIHsgbGV2ZWxJZDogMSwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDMwLCBNb25zdGVyOiBbMF0sIG51bTogMTAsIHNwZWVkOiAxfSxcclxuICAgIHsgbGV2ZWxJZDogMiwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDM1LCBNb25zdGVyOiBbMCwxXSwgbnVtOiAxMiwgc3BlZWQ6IDEuMX0sXHJcbiAgICB7IGxldmVsSWQ6IDMsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0MCwgTW9uc3RlcjogWzAsMSwyXSwgbnVtOiAxNCwgc3BlZWQ6IDEuMTV9LFxyXG4gICAgeyBsZXZlbElkOiA0LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDIsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMTYsIHNwZWVkOiAxLjJ9LFxyXG4gICAgeyBsZXZlbElkOiA1LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDMsIE1vbnN0ZXI6IFswLDJdLCBudW06IDE4LCBzcGVlZDogMS4yNX0sXHJcbiAgICB7IGxldmVsSWQ6IDYsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NCwgTW9uc3RlcjogWzEsMl0sIG51bTogMjAsIHNwZWVkOiAxLjN9LFxyXG4gICAgeyBsZXZlbElkOiA3LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDUsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMjIsIHNwZWVkOiAxLjM1fSxcclxuICAgIHsgbGV2ZWxJZDogOCwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDQ1LCBNb25zdGVyOiBbMCwyXSwgbnVtOiAyNCwgc3BlZWQ6IDEuNH0sXHJcbiAgICB7IGxldmVsSWQ6IDksIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NSwgTW9uc3RlcjogWzEsMl0sIG51bTogMjYsIHNwZWVkOiAxLjQ1fSxcclxuICAgIHsgbGV2ZWxJZDogMTAsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NSwgTW9uc3RlcjogWzAsMSwyXSwgbnVtOiAyOCwgc3BlZWQ6IDEuNX0sXHJcbiAgICB7IGxldmVsSWQ6IDExLCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDYsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMzAsIHNwZWVkOiAxLjV9LCAgXHJcbiAgICB7IGxldmVsSWQ6IDEyLCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDcsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMzIsIHNwZWVkOiAxLjU1fSxcclxuICAgIHsgbGV2ZWxJZDogMTMsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OCwgTW9uc3RlcjogWzAsMSwzXSwgbnVtOiAzNCwgc3BlZWQ6IDEuNn0sXHJcbiAgICB7IGxldmVsSWQ6IDE0LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNDgsIE1vbnN0ZXI6IFsyLDNdLCBudW06IDM2LCBzcGVlZDogMS42fSxcclxuICAgIHsgbGV2ZWxJZDogMTUsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OSwgTW9uc3RlcjogWzAsM10sIG51bTogMzgsIHNwZWVkOiAxLjY1fSxcclxuICAgIHsgbGV2ZWxJZDogMTYsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OSwgTW9uc3RlcjogWzEsM10sIG51bTogNDAsIHNwZWVkOiAxLjd9LFxyXG4gICAgeyBsZXZlbElkOiAxNywgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUwLCBNb25zdGVyOiBbMCwxLDIsM10sIG51bTogNDIsIHNwZWVkOiAxLjd9LFxyXG4gICAgeyBsZXZlbElkOiAxOCwgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUwLCBNb25zdGVyOiBbMCwyLDNdLCBudW06IDQ0LCBzcGVlZDogMS43NX0sXHJcbiAgICB7IGxldmVsSWQ6IDE5LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTAsIE1vbnN0ZXI6IFsxLDIsM10sIG51bTogNDYsIHNwZWVkOiAxLjc1fSxcclxuICAgIHsgbGV2ZWxJZDogMjAsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA1MCwgTW9uc3RlcjogWzAsMSwzXSwgbnVtOiA0OCwgc3BlZWQ6IDEuOH0sXHJcbiAgICB7IGxldmVsSWQ6IDIxLCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTEsIE1vbnN0ZXI6IFswLDIsM10sIG51bTogNTAsIHNwZWVkOiAxLjh9LFxyXG4gICAgeyBsZXZlbElkOiAyMiwgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUyLCBNb25zdGVyOiBbMSwyLDNdLCBudW06IDUyLCBzcGVlZDogMS44fSxcclxuICAgIHsgbGV2ZWxJZDogMjMsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA1MiwgTW9uc3RlcjogWzAsMSwyLDNdLCBudW06IDU0LCBzcGVlZDogMS44NX0sXHJcbiAgICB7IGxldmVsSWQ6IDI0LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTMsIE1vbnN0ZXI6IFswLDEsMiwzXSwgbnVtOiA1Niwgc3BlZWQ6IDEuODV9LFxyXG4gICAgeyBsZXZlbElkOiAyNSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDUzLCBNb25zdGVyOiBbMCw0XSwgbnVtOiA1OCwgc3BlZWQ6IDEuOX0sXHJcbiAgICB7IGxldmVsSWQ6IDI2LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTQsIE1vbnN0ZXI6IFsxLDRdLCBudW06IDYwLCBzcGVlZDogMS45fSxcclxuICAgIHsgbGV2ZWxJZDogMjcsIGljb246IFwibGV2ZWxfM1wiLCB0aW1lOiA1NCwgTW9uc3RlcjogWzIsNF0sIG51bTogNjIsIHNwZWVkOiAxLjl9LFxyXG4gICAgeyBsZXZlbElkOiAyOCwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU1LCBNb25zdGVyOiBbMyw0XSwgbnVtOiA2NCwgc3BlZWQ6IDEuOX0sXHJcbiAgICB7IGxldmVsSWQ6IDI5LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTUsIE1vbnN0ZXI6IFswLDEsNF0sIG51bTogNjYsIHNwZWVkOiAxLjk1fSxcclxuICAgIHsgbGV2ZWxJZDogMzAsIGljb246IFwibGV2ZWxfM1wiLCB0aW1lOiA1NSwgTW9uc3RlcjogWzAsMiw0XSwgbnVtOiA2OCwgc3BlZWQ6IDEuOTV9LFxyXG4gICAgeyBsZXZlbElkOiAzMSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU2LCBNb25zdGVyOiBbMSwzLDRdLCBudW06IDcwLCBzcGVlZDogMS45NX0sXHJcbiAgICB7IGxldmVsSWQ6IDMyLCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTcsIE1vbnN0ZXI6IFswLDEsMiw0XSwgbnVtOiA3Miwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzMywgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU3LCBNb25zdGVyOiBbMCwzLDRdLCBudW06IDc0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDM0LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTgsIE1vbnN0ZXI6IFsxLDIsMyw0XSwgbnVtOiA3Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU4LCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA3OCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNiwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU5LCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA4MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNywgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDU5LCBNb25zdGVyOiBbMCwyLDMsNF0sIG51bTogODIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogMzgsIGljb246IFwibGV2ZWxfNFwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzEsMiwzLDRdLCBudW06IDg0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDM5LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMyw0XSwgbnVtOiA4Niwgc3BlZWQ6IDJ9LCAgXHJcbiAgICB7IGxldmVsSWQ6IDQwLCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDg4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQxLCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiw0XSwgbnVtOiA5MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0MiwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwyLDMsNF0sIG51bTogOTIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNDMsIGljb246IFwibGV2ZWxfNFwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMyw0XSwgbnVtOiA5NCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0NCwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA5Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0NSwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMiwzLDRdLCBudW06IDk4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQ2LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsNF0sIG51bTogMTAwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQ3LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEwMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0OCwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwzLDRdLCBudW06IDEwNCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0OSwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwyLDMsNF0sIG51bTogMTA2LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDUwLCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEwOCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MSwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwyLDRdLCBudW06IDExMCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MiwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwzLDRdLCBudW06IDExMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MywgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxMTQsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTQsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzIsMyw0XSwgbnVtOiAxMTYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTUsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSw0XSwgbnVtOiAxMTgsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTYsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTIwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDU3LCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFsxLDIsMyw0XSwgbnVtOiAxMjIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTgsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTI0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDU5LCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDIsMyw0XSwgbnVtOiAxMjYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjAsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTMwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDYxLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEzMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2MiwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxMzQsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjMsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTM2LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDY0LCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEzOCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2NSwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNDAsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjYsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTQyLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDY3LCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE0NCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2OCwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNDYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjksIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTQ4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDcwLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE1MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA3MSwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNTIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNzIsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTU0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDczLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE1Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA3NCwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNTgsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNzUsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTYwLCBzcGVlZDogMn0sXHJcbl07XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIOebtOaOpeS9v+eUqOmdmeaAgeWFs+WNoemFjee9ruaVsOe7hFxyXG4gICAgICAgIHRoaXMubGV2ZWxDb25maWdzID0gWy4uLkdhbWVEYXRhLkxFVkVMX0NPTkZJR1NdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfmiJDlip/liqDovb3lhoXnva7lhbPljaHphY3nva46JywgdGhpcy5sZXZlbENvbmZpZ3MubGVuZ3RoLCAn5YWzJyk7XHJcbiAgICAgICAgLy8g5Yqg6L296Z+z6aKR5byA5YWz54q25oCBXHJcbiAgICAgICAgdGhpcy5HZXRCR01PbkRhdGEoKTtcclxuICAgICAgICAvLyDliqDovb3pn7PmlYjlvIDlhbPnirbmgIFcclxuICAgICAgICB0aGlzLkdldFNvdW5kT25EYXRhKCk7XHJcbiAgICAgICAgLy8g5Yqg6L296KeS6Imy6Kej6ZSB54q25oCBXHJcbiAgICAgICAgdGhpcy5HZXRVbmxvY2tlZFJvbGVzRGF0YSgpO1xyXG4gICAgICAgIC8vIOWKoOi9veW9k+WJjemAieS4reinkuiJslxyXG4gICAgICAgIHRoaXMuR2V0Q3VycmVudFJvbGVEYXRhKCk7XHJcbiAgICAgICAgLy8g5Yqg6L295oqA6IO95pWw5o2uXHJcbiAgICAgICAgdGhpcy5HZXRTa2lsbHNEYXRhKCk7XHJcbiAgICAgICAgLy8g5Yqg6L296ZK755+z5pWw5o2uXHJcbiAgICAgICAgdGhpcy5HZXRHb2xkRGF0YSgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudExldmVsS2V5OnN0cmluZyA9ICdDdXJyZW50TGV2ZWwnOyAvL+WtmOWCqOW9k+WJjeWFs+WNoeeahGtleVxyXG4gICAgcHVibGljIHVubG9ja2VkTGV2ZWxLZXk6c3RyaW5nID0gJ1VubG9ja2VkTGV2ZWwnOyAvL+WtmOWCqOW3suino+mUgeWFs+WNoeeahGtleVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW9k+WJjeeUqOaIt0lEXHJcbiAgICAgKiBAcmV0dXJucyDnlKjmiLdJRO+8jOWmguaenOayoeacieeZu+W9lei/lOWbnm51bGxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDnlJ/miJDluKbnlKjmiLdJROWQjue8gOeahOWtmOWCqGtleVxyXG4gICAgICogQHBhcmFtIGJhc2VLZXkg5Z+656GAa2V5XHJcbiAgICAgKiBAcmV0dXJucyDluKbnlKjmiLdJROWQjue8gOeahGtleVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEtleVdpdGhVc2VySWQoYmFzZUtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIGlmICh1c2VySWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VLZXl9XyR7dXNlcklkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBiYXNlS2V5O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjmlbDmja5cclxuICAgICAqL1xyXG4gICAgU2V0RGF0YSgpe1xyXG4gICAgICAgIC8vIOWtmOWCqOmfs+mikeW8gOWFs+eKtuaAgVxyXG4gICAgICAgIHRoaXMuU2F2ZUJHTU9uRGF0YSgpO1xyXG4gICAgICAgIC8vIOWtmOWCqOmfs+aViOW8gOWFs+eKtuaAgVxyXG4gICAgICAgIHRoaXMuU2F2ZVNvdW5kT25EYXRhKCk7XHJcbiAgICAgICAgLy8g5a2Y5YKo6KeS6Imy6Kej6ZSB54q25oCBXHJcbiAgICAgICAgdGhpcy5TYXZlVW5sb2NrZWRSb2xlc0RhdGEoKTtcclxuICAgICAgICAvLyDlrZjlgqjlvZPliY3pgInkuK3op5LoibJcclxuICAgICAgICB0aGlzLlNhdmVDdXJyZW50Um9sZURhdGEoKTtcclxuICAgICAgICAvLyDlrZjlgqjmioDog73mlbDmja5cclxuICAgICAgICB0aGlzLlNhdmVTa2lsbHNEYXRhKCk7XHJcbiAgICAgICAgaWYoY2Muc3lzLnBsYXRmb3JtICE9IGNjLnN5cy5XRUNIQVRfR0FNRSl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJlc3RTY29yZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLkJlc3RTY29yZUtleSk7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLnd4LnNldFN0b3JhZ2Uoe1xyXG4gICAgICAgICAgICBrZXk6YmVzdFNjb3JlS2V5LFxyXG4gICAgICAgICAgICBkYXRhOnRoaXMuQmVzdFNjb3JlLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAod2luZG93IGFzIGFueSkud3guc2V0VXNlckNsb3VkU3RvcmFnZSh7XHJcbiAgICAgICAgICAgIEtWRGF0YUxpc3Q6IFt7IGtleTogJzEnLCB2YWx1ZTptR2FtZURhdGEuQmVzdFNjb3JlLnRvU3RyaW5nKCl9XSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDlrZjlgqjkvZPlipvmlbDmja5cclxuICAgICAgICB0aGlzLlNhdmVTdGFtaW5hRGF0YSgpO1xyXG4gICAgICAgIC8vIOWtmOWCqOWFs+WNoeaVsOaNrlxyXG4gICAgICAgIHRoaXMuU2F2ZUxldmVsRGF0YSgpO1xyXG4gICAgICAgIC8vIOWtmOWCqOmSu+efs+aVsOaNrlxyXG4gICAgICAgIHRoaXMuU2F2ZUdvbGREYXRhKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo5L2T5Yqb5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNhdmVCZXN0U2NvcmVEYXRhKCl7XG4gICAgICAgIGNvbnN0IGJlc3RTY29yZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLkJlc3RTY29yZUtleSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShiZXN0U2NvcmVLZXksIE1hdGgubWF4KDAsIE1hdGguZmxvb3IodGhpcy5CZXN0U2NvcmUgfHwgMCkpLnRvU3RyaW5nKCkpO1xuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcbiAgICB9XG5cbiAgICBHZXRCZXN0U2NvcmVEYXRhKCl7XG4gICAgICAgIGNvbnN0IGJlc3RTY29yZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLkJlc3RTY29yZUtleSk7XG4gICAgICAgIGNvbnN0IGJlc3RTY29yZVN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShiZXN0U2NvcmVLZXkpO1xuICAgICAgICB0aGlzLkJlc3RTY29yZSA9IGJlc3RTY29yZVN0ciA/IE1hdGgubWF4KDAsIHBhcnNlSW50KGJlc3RTY29yZVN0ciwgMTApIHx8IDApIDogMDtcbiAgICB9XG5cbiAgICBTYXZlU3RhbWluYURhdGEoKXtcbiAgICAgICAgLy8g5L2/55SoQ29jb3MgQ3JlYXRvcueahOacrOWcsOWtmOWCqOaOpeWPo+abv+S7o+W+ruS/oeaOpeWPo1xyXG4gICAgICAgIGNvbnN0IHN0YW1pbmFLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5zdGFtaW5hS2V5KTtcclxuICAgICAgICBjb25zdCBsYXN0UmVjb3ZlclRpbWVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sYXN0UmVjb3ZlclRpbWVLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdGFtaW5hS2V5LCB0aGlzLmN1cnJlbnRTdGFtaW5hLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShsYXN0UmVjb3ZlclRpbWVLZXksIHRoaXMubGFzdFJlY292ZXJUaW1lLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOS9k+WKm+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBHZXRTdGFtaW5hRGF0YSgpe1xyXG4gICAgICAgIC8vIOS9v+eUqENvY29zIENyZWF0b3LnmoTmnKzlnLDlrZjlgqjmjqXlj6Pmm7/ku6Plvq7kv6HmjqXlj6NcclxuICAgICAgICBjb25zdCBzdGFtaW5hS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuc3RhbWluYUtleSk7XHJcbiAgICAgICAgY29uc3QgbGFzdFJlY292ZXJUaW1lS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGFzdFJlY292ZXJUaW1lS2V5KTtcclxuICAgICAgICBjb25zdCBzdGFtaW5hU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0YW1pbmFLZXkpO1xyXG4gICAgICAgIGlmIChzdGFtaW5hU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YW1pbmEgPSBwYXJzZUludChzdGFtaW5hU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInmlbDmja7vvIzph43nva7kuLrmu6HkvZPliptcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhbWluYSA9IHRoaXMubWF4U3RhbWluYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgbGFzdFJlY292ZXJUaW1lU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGxhc3RSZWNvdmVyVGltZUtleSk7XHJcbiAgICAgICAgaWYgKGxhc3RSZWNvdmVyVGltZVN0cikge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RSZWNvdmVyVGltZSA9IHBhcnNlSW50KGxhc3RSZWNvdmVyVGltZVN0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6YeN572u5Li65b2T5YmN5pe26Ze0XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFJlY292ZXJUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo6ZK755+z5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNhdmVHb2xkRGF0YSgpe1xyXG4gICAgICAgIC8vIOS9v+eUqENvY29zIENyZWF0b3LnmoTmnKzlnLDlrZjlgqjmjqXlj6Pkv53lrZjpkrvnn7PmlbDmja5cclxuICAgICAgICBjb25zdCBnb2xkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZ29sZEtleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGdvbGRLZXksIHRoaXMuY3VycmVudEdvbGQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5L+d5a2Y57Sv6K6h6I635b6X6ZK755+z5pWw5o2uXHJcbiAgICAgICAgY29uc3QgdG90YWxHb2xkRWFybmVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMudG90YWxHb2xkRWFybmVkS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odG90YWxHb2xkRWFybmVkS2V5LCB0aGlzLnRvdGFsR29sZEVhcm5lZC50b1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTpkrvnn7PmlbDmja5cclxuICAgICAqL1xyXG4gICAgR2V0R29sZERhdGEoKXtcclxuICAgICAgICAvLyDkvb/nlKhDb2NvcyBDcmVhdG9y55qE5pys5Zyw5a2Y5YKo5o6l5Y+j5Yqg6L296ZK755+z5pWw5o2uXHJcbiAgICAgICAgY29uc3QgZ29sZEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmdvbGRLZXkpO1xyXG4gICAgICAgIC8vIOWFiOajgOafpeeUqOaIt0lE5piv5ZCm5q2j56Gu6I635Y+WXHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBjb25zdCBnb2xkU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGdvbGRLZXkpO1xyXG4gICAgICAgIGlmIChnb2xkU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEdvbGQgPSBwYXJzZUludChnb2xkU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInmlbDmja7vvIzph43nva7kuLrliJ3lp4vlgLwyMDAwMFxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRHb2xkID0gMDtcclxuICAgICAgICAgICAgLy8g5ZCM5pe25bCd6K+V6K+75Y+W5LiN5bim55So5oi3SUTnmoRrZXlcclxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEdvbGRLZXkgPSAnQ3VycmVudEdvbGQnO1xyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0R29sZFN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShkZWZhdWx0R29sZEtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWKoOi9vee0r+iuoeiOt+W+l+mSu+efs+aVsOaNrlxyXG4gICAgICAgIGNvbnN0IHRvdGFsR29sZEVhcm5lZEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnRvdGFsR29sZEVhcm5lZEtleSk7XHJcbiAgICAgICAgY29uc3QgdG90YWxHb2xkRWFybmVkU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRvdGFsR29sZEVhcm5lZEtleSk7XHJcbiAgICAgICAgaWYgKHRvdGFsR29sZEVhcm5lZFN0cikge1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsR29sZEVhcm5lZCA9IHBhcnNlSW50KHRvdGFsR29sZEVhcm5lZFN0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50b3RhbEdvbGRFYXJuZWQgPSB0aGlzLmN1cnJlbnRHb2xkOyAvLyDlpoLmnpzmsqHmnInntK/orqHmlbDmja7vvIzliJ3lp4vljJbkuLrlvZPliY3pkrvnn7PmlbBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg6ZK755+z77yI5ZCM5pe25pu05paw57Sv6K6h6I635b6X6ZK755+z77yJXHJcbiAgICAgKiBAcGFyYW0gYW1vdW50IOmSu+efs+aVsOmHj1xyXG4gICAgICovXHJcbiAgICBhZGRHb2xkKGFtb3VudDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50R29sZCArPSBhbW91bnQ7XHJcbiAgICAgICAgdGhpcy50b3RhbEdvbGRFYXJuZWQgKz0gYW1vdW50O1xyXG4gICAgICAgIHRoaXMuU2F2ZUdvbGREYXRhKCk7XHJcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdCgnZ29sZFVwZGF0ZWQnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo6YGT5YW35bqT5a2Y5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNhdmVJdGVtU3RvY2tEYXRhKCl7XHJcbiAgICAgICAgLy8g5L2/55SoQ29jb3MgQ3JlYXRvcueahOacrOWcsOWtmOWCqOaOpeWPo+S/neWtmOmBk+WFt+W6k+WtmOaVsOaNrlxyXG4gICAgICAgIGNvbnN0IGl0ZW1TdG9ja0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLml0ZW1TdG9ja0tleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1TdG9ja0tleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5pdGVtU3RvY2spKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTpgZPlhbflupPlrZjmlbDmja5cclxuICAgICAqL1xyXG4gICAgR2V0SXRlbVN0b2NrRGF0YSgpe1xyXG4gICAgICAgIC8vIOS9v+eUqENvY29zIENyZWF0b3LnmoTmnKzlnLDlrZjlgqjmjqXlj6PliqDovb3pgZPlhbflupPlrZjmlbDmja5cclxuICAgICAgICBjb25zdCBpdGVtU3RvY2tLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5pdGVtU3RvY2tLZXkpO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1TdG9ja1N0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShpdGVtU3RvY2tLZXkpO1xyXG4gICAgICAgIGlmIChpdGVtU3RvY2tTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5pdGVtU3RvY2sgPSBKU09OLnBhcnNlKGl0ZW1TdG9ja1N0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5pWw5o2u77yM6YeN572u5Li65Yid5aeL5YC8XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbVN0b2NrID0gWzAsIDAsIDBdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprpgZPlhbfnmoTlupPlrZhcclxuICAgICAqIEBwYXJhbSBpdGVtSWQg6YGT5YW3SUQgKDEtMylcclxuICAgICAqIEByZXR1cm5zIOmBk+WFt+W6k+WtmOaVsOmHj1xyXG4gICAgICovXHJcbiAgICBnZXRJdGVtU3RvY2soaXRlbUlkOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gaXRlbUlkIC0gMTtcclxuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuaXRlbVN0b2NrLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pdGVtU3RvY2tbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlop7liqDmjIflrprpgZPlhbfnmoTlupPlrZhcclxuICAgICAqIEBwYXJhbSBpdGVtSWQg6YGT5YW3SUQgKDEtMylcclxuICAgICAqIEBwYXJhbSBjb3VudCDlop7liqDnmoTmlbDph49cclxuICAgICAqL1xyXG4gICAgYWRkSXRlbVN0b2NrKGl0ZW1JZDogbnVtYmVyLCBjb3VudDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBpdGVtSWQgLSAxO1xyXG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5pdGVtU3RvY2subGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbVN0b2NrW2luZGV4XSArPSBjb3VudDtcclxuICAgICAgICAgICAgdGhpcy5TYXZlSXRlbVN0b2NrRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlh4/lsJHmjIflrprpgZPlhbfnmoTlupPlrZhcclxuICAgICAqIEBwYXJhbSBpdGVtSWQg6YGT5YW3SUQgKDEtMylcclxuICAgICAqIEBwYXJhbSBjb3VudCDlh4/lsJHnmoTmlbDph49cclxuICAgICAqIEByZXR1cm5zIOaYr+WQpuaIkOWKn+WHj+WwkVxyXG4gICAgICovXHJcbiAgICByZWR1Y2VJdGVtU3RvY2soaXRlbUlkOiBudW1iZXIsIGNvdW50OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IGl0ZW1JZCAtIDE7XHJcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLml0ZW1TdG9jay5sZW5ndGggJiYgdGhpcy5pdGVtU3RvY2tbaW5kZXhdID49IGNvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbVN0b2NrW2luZGV4XSAtPSBjb3VudDtcclxuICAgICAgICAgICAgdGhpcy5TYXZlSXRlbVN0b2NrRGF0YSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWtmOWCqOmfs+mikeW8gOWFs+eKtuaAgVxyXG4gICAgICovXHJcbiAgICBTYXZlQkdNT25EYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBpc0JHTU9uS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuaXNCR01PbktleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGlzQkdNT25LZXksIHRoaXMuaXNCR01Pbi50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTpn7PpopHlvIDlhbPnirbmgIFcclxuICAgICAqL1xyXG4gICAgR2V0QkdNT25EYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBpc0JHTU9uS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuaXNCR01PbktleSk7XHJcbiAgICAgICAgY29uc3QgaXNCR01PblN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShpc0JHTU9uS2V5KTtcclxuICAgICAgICBpZiAoaXNCR01PblN0cikge1xyXG4gICAgICAgICAgICB0aGlzLmlzQkdNT24gPSBpc0JHTU9uU3RyID09PSAndHJ1ZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pc0JHTU9uID0gdHJ1ZTsgLy8g6buY6K6k5byA5ZCvXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWtmOWCqOmfs+aViOW8gOWFs+eKtuaAgVxyXG4gICAgICovXHJcbiAgICBTYXZlU291bmRPbkRhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGlzU291bmRPbktleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmlzU291bmRPbktleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGlzU291bmRPbktleSwgdGhpcy5pc1NvdW5kT24udG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE6Z+z5pWI5byA5YWz54q25oCBXHJcbiAgICAgKi9cclxuICAgIEdldFNvdW5kT25EYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBpc1NvdW5kT25LZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5pc1NvdW5kT25LZXkpO1xyXG4gICAgICAgIGNvbnN0IGlzU291bmRPblN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShpc1NvdW5kT25LZXkpO1xyXG4gICAgICAgIGlmIChpc1NvdW5kT25TdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5pc1NvdW5kT24gPSBpc1NvdW5kT25TdHIgPT09ICd0cnVlJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmlzU291bmRPbiA9IHRydWU7IC8vIOm7mOiupOW8gOWQr1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjop5LoibLop6PplIHnirbmgIFcclxuICAgICAqL1xyXG4gICAgU2F2ZVVubG9ja2VkUm9sZXNEYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCB1bmxvY2tlZFJvbGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMudW5sb2NrZWRSb2xlc0tleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHVubG9ja2VkUm9sZXNLZXksIEpTT04uc3RyaW5naWZ5KHRoaXMudW5sb2NrZWRSb2xlcykpO1xyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOinkuiJsuino+mUgeeKtuaAgVxyXG4gICAgICovXHJcbiAgICBHZXRVbmxvY2tlZFJvbGVzRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdW5sb2NrZWRSb2xlc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnVubG9ja2VkUm9sZXNLZXkpO1xyXG4gICAgICAgIGNvbnN0IHVubG9ja2VkUm9sZXNTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odW5sb2NrZWRSb2xlc0tleSk7XHJcbiAgICAgICAgaWYgKHVubG9ja2VkUm9sZXNTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy51bmxvY2tlZFJvbGVzID0gSlNPTi5wYXJzZSh1bmxvY2tlZFJvbGVzU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVubG9ja2VkUm9sZXMgPSBbdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdOyAvLyDpu5jorqTop6PplIHnrKzkuIDkuKrop5LoibJcclxuICAgICAgICAgICAgLy8g6aaW5qyh6L+Q6KGM5pe25L+d5a2Y6buY6K6k5YC8XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZVVubG9ja2VkUm9sZXNEYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCfliqDovb3op5LoibLop6PplIHnirbmgIE6JywgdGhpcy51bmxvY2tlZFJvbGVzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjlvZPliY3pgInkuK3op5LoibJcclxuICAgICAqL1xyXG4gICAgU2F2ZUN1cnJlbnRSb2xlRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgY3VycmVudFJvbGVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5jdXJyZW50Um9sZUtleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGN1cnJlbnRSb2xlS2V5LCB0aGlzLmN1cnJlbnRSb2xlLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOW9k+WJjemAieS4reinkuiJslxyXG4gICAgICovXHJcbiAgICBHZXRDdXJyZW50Um9sZURhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSb2xlS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuY3VycmVudFJvbGVLZXkpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSb2xlU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGN1cnJlbnRSb2xlS2V5KTtcclxuICAgICAgICBpZiAoY3VycmVudFJvbGVTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um9sZSA9IHBhcnNlSW50KGN1cnJlbnRSb2xlU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRSb2xlID0gMDsgLy8g6buY6K6k6YCJ5Lit56ys5LiA5Liq6KeS6ImyXHJcbiAgICAgICAgICAgIC8vIOmmluasoei/kOihjOaXtuS/neWtmOm7mOiupOWAvFxyXG4gICAgICAgICAgICB0aGlzLlNhdmVDdXJyZW50Um9sZURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+WKoOi9veW9k+WJjemAieS4reinkuiJsjonLCB0aGlzLmN1cnJlbnRSb2xlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjmioDog73mlbDmja5cclxuICAgICAqL1xyXG4gICAgU2F2ZVNraWxsc0RhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHNraWxsc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnNraWxsc0tleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHNraWxsc0tleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5za2lsbHMpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTmioDog73mlbDmja5cclxuICAgICAqL1xyXG4gICAgR2V0U2tpbGxzRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3Qgc2tpbGxzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuc2tpbGxzS2V5KTtcclxuICAgICAgICBjb25zdCBza2lsbHNTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oc2tpbGxzS2V5KTtcclxuICAgICAgICBpZiAoc2tpbGxzU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2tpbGxzID0gSlNPTi5wYXJzZShza2lsbHNTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieaVsOaNru+8jOS9v+eUqOm7mOiupOaKgOiDveaVsOaNrlxyXG4gICAgICAgICAgICB0aGlzLnNraWxscyA9IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogMSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn5pmu6YCa5a+85by5JyxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhMZXZlbDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfkuIDpopfkuIDpopflj5HlsIQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdqaW5lbmcxJyxcclxuICAgICAgICAgICAgICAgICAgICBiYXNlRWZmZWN0OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdFBlckxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVDb3N0OiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ+WvkuWGsOWvvOW8uScsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4TGV2ZWw6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn6ZuG576k5Y+R5bCEJyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnamluZW5nMicsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVmZmVjdDogMSxcclxuICAgICAgICAgICAgICAgICAgICBlZmZlY3RQZXJMZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICB1cGdyYWRlQ29zdDogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3RJbmNyZWFzZVBlckxldmVsOiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICfpmLLmiqTpkqLmnb8nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heExldmVsOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+mYsuaKpOWKmyszJyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnamluZW5nMycsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVmZmVjdDogMyxcclxuICAgICAgICAgICAgICAgICAgICBlZmZlY3RQZXJMZXZlbDogMyxcclxuICAgICAgICAgICAgICAgICAgICB1cGdyYWRlQ29zdDogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3RJbmNyZWFzZVBlckxldmVsOiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICfnqb/nlLLlvLknLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heExldmVsOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+aUu+WHu+WKmysxJyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnamluZW5nNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVmZmVjdDogMSxcclxuICAgICAgICAgICAgICAgICAgICBlZmZlY3RQZXJMZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICB1cGdyYWRlQ29zdDogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3RJbmNyZWFzZVBlckxldmVsOiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiA1LFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICfmoLjlvLknLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heExldmVsOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+avgeeBreaAp+S8pOWusycsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ppbmVuZzUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFZmZlY3Q6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZUNvc3Q6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0SW5jcmVhc2VQZXJMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogNixcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn6IO96YeP5oqk55u+JyxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhMZXZlbDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfml7bpl7QrMeenkicsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ppbmVuZzYnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFZmZlY3Q6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZUNvc3Q6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0SW5jcmVhc2VQZXJMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAvLyDpppbmrKHov5DooYzml7bkv53lrZjpu5jorqTlgLxcclxuICAgICAgICAgICAgdGhpcy5TYXZlU2tpbGxzRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygn5Yqg6L295oqA6IO95pWw5o2uOicsIHRoaXMuc2tpbGxzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjlhbPljaHmlbDmja5cclxuICAgICAqL1xyXG4gICAgU2F2ZUxldmVsRGF0YSgpe1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRMZXZlbEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmN1cnJlbnRMZXZlbEtleSk7XHJcbiAgICAgICAgY29uc3QgdW5sb2NrZWRMZXZlbEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnVubG9ja2VkTGV2ZWxLZXkpO1xyXG4gICAgICAgIGNvbnN0IGxldmVsU3RhcnNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sZXZlbFN0YXJzS2V5KTtcclxuICAgICAgICBcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oY3VycmVudExldmVsS2V5LCB0aGlzLmN1cnJlbnRMZXZlbC50b1N0cmluZygpKTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odW5sb2NrZWRMZXZlbEtleSwgdGhpcy51bmxvY2tlZExldmVsLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShsZXZlbFN0YXJzS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLmxldmVsU3RhcnMpKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygn5YWz5Y2h5pWw5o2u5bey5L+d5a2Y77ya5b2T5YmN5YWz5Y2hPScsIHRoaXMuY3VycmVudExldmVsLCAn5bey6Kej6ZSB5YWz5Y2hPScsIHRoaXMudW5sb2NrZWRMZXZlbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE5YWz5Y2h5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldExldmVsRGF0YSgpe1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRMZXZlbEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmN1cnJlbnRMZXZlbEtleSk7XHJcbiAgICAgICAgY29uc3QgdW5sb2NrZWRMZXZlbEtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnVubG9ja2VkTGV2ZWxLZXkpO1xyXG4gICAgICAgIGNvbnN0IGxldmVsU3RhcnNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sZXZlbFN0YXJzS2V5KTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDliqDovb3lvZPliY3lhbPljaFcclxuICAgICAgICBjb25zdCBsZXZlbFN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShjdXJyZW50TGV2ZWxLZXkpO1xyXG4gICAgICAgIGlmIChsZXZlbFN0cikge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9IHBhcnNlSW50KGxldmVsU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWKoOi9veW3suino+mUgeWFs+WNoVxyXG4gICAgICAgIGNvbnN0IHVubG9ja2VkTGV2ZWxTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odW5sb2NrZWRMZXZlbEtleSk7XHJcbiAgICAgICAgaWYgKHVubG9ja2VkTGV2ZWxTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy51bmxvY2tlZExldmVsID0gcGFyc2VJbnQodW5sb2NrZWRMZXZlbFN0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51bmxvY2tlZExldmVsID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yqg6L295YWz5Y2h5pif57qn5pWw5o2uXHJcbiAgICAgICAgY29uc3QgbGV2ZWxTdGFyc1N0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShsZXZlbFN0YXJzS2V5KTtcclxuICAgICAgICBpZiAobGV2ZWxTdGFyc1N0cikge1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsU3RhcnMgPSBKU09OLnBhcnNlKGxldmVsU3RhcnNTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFycyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygn5LuO5pys5Zyw5Yqg6L295YWz5Y2h5pWw5o2u77ya5b2T5YmN5YWz5Y2hPScsIHRoaXMuY3VycmVudExldmVsLCAn5bey6Kej6ZSB5YWz5Y2hPScsIHRoaXMudW5sb2NrZWRMZXZlbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5raI6ICX5LiA54K55L2T5YqbXHJcbiAgICAgKiBAcmV0dXJucyDmmK/lkKbmiJDlip/mtojogJdcclxuICAgICAqL1xyXG4gICAgQ29uc3VtZVN0YW1pbmEoKTpib29sZWFue1xyXG4gICAgICAgIGlmKHRoaXMuY3VycmVudFN0YW1pbmEgPiAwKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhbWluYS0tO1xyXG4gICAgICAgICAgICB0aGlzLlNhdmVTdGFtaW5hRGF0YSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeW5tuaBouWkjeS9k+WKm1xyXG4gICAgICovXHJcbiAgICBDaGVja0FuZFJlY292ZXJTdGFtaW5hKCl7XHJcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBjb25zdCB0aW1lRGlmZiA9IG5vdyAtIHRoaXMubGFzdFJlY292ZXJUaW1lO1xyXG4gICAgICAgIGNvbnN0IHJlY292ZXJJbnRlcnZhbCA9IDEwICogNjAgKiAxMDAwOyAvLyAxMOWIhumSn++8jOWNleS9jeavq+enklxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOiuoeeul+W6lOivpeaBouWkjeeahOS9k+WKm+eCueaVsFxyXG4gICAgICAgIGNvbnN0IHJlY292ZXJQb2ludHMgPSBNYXRoLmZsb29yKHRpbWVEaWZmIC8gcmVjb3ZlckludGVydmFsKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihyZWNvdmVyUG9pbnRzID4gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YW1pbmEgPSBNYXRoLm1pbih0aGlzLm1heFN0YW1pbmEsIHRoaXMuY3VycmVudFN0YW1pbmEgKyByZWNvdmVyUG9pbnRzKTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0UmVjb3ZlclRpbWUgKz0gcmVjb3ZlclBvaW50cyAqIHJlY292ZXJJbnRlcnZhbDtcclxuICAgICAgICAgICAgdGhpcy5TYXZlU3RhbWluYURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5piv5ZCm5pyJ6Laz5aSf55qE5L2T5Yqb5byA5aeL5ri45oiPXHJcbiAgICAgKiBAcmV0dXJucyDmmK/lkKbmnInotrPlpJ/kvZPliptcclxuICAgICAqL1xyXG4gICAgSGFzRW5vdWdoU3RhbWluYSgpOmJvb2xlYW57XHJcbiAgICAgICAgdGhpcy5DaGVja0FuZFJlY292ZXJTdGFtaW5hKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0YW1pbmEgPiAwO1xyXG4gICAgICAgIC8vIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6K6h566X6Led56a75LiL5qyh5oGi5aSN5L2T5Yqb55qE5Ymp5L2Z5pe26Ze077yI5q+r56eS77yJXHJcbiAgICAgKiBAcmV0dXJucyDliankvZnml7bpl7TvvIjmr6vnp5LvvInvvIzlpoLmnpzkvZPlipvlt7Lmu6HliJnov5Tlm54wXHJcbiAgICAgKi9cclxuICAgIEdldFJlbWFpbmluZ1JlY292ZXJUaW1lKCk6bnVtYmVye1xyXG4gICAgICAgIC8vIOWmguaenOS9k+WKm+W3sua7oe+8jOS4jemcgOimgeaBouWkjVxyXG4gICAgICAgIGlmKHRoaXMuY3VycmVudFN0YW1pbmEgPj0gdGhpcy5tYXhTdGFtaW5hKXtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgY29uc3QgdGltZURpZmYgPSBub3cgLSB0aGlzLmxhc3RSZWNvdmVyVGltZTtcclxuICAgICAgICBjb25zdCByZWNvdmVySW50ZXJ2YWwgPSAxMCAqIDYwICogMTAwMDsgLy8gMTDliIbpkp/vvIzljZXkvY3mr6vnp5JcclxuICAgICAgICBcclxuICAgICAgICAvLyDorqHnrpfot53nprvkuIvmrKHmgaLlpI3nmoTliankvZnml7bpl7RcclxuICAgICAgICBjb25zdCByZW1haW5pbmdUaW1lID0gcmVjb3ZlckludGVydmFsIC0gKHRpbWVEaWZmICUgcmVjb3ZlckludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gcmVtYWluaW5nVGltZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmoLzlvI/ljJbnmoTmgaLlpI3lgJLorqHml7blrZfnrKbkuLJcclxuICAgICAqIEByZXR1cm5zIOagvOW8j+WMlueahOaXtumXtOWtl+espuS4su+8iE1NOlNT77yJ77yM5aaC5p6c5L2T5Yqb5bey5ruh5YiZ6L+U5Zue56m65a2X56ym5LiyXHJcbiAgICAgKi9cclxuICAgIEdldEZvcm1hdHRlZFJlY292ZXJUaW1lKCk6c3RyaW5ne1xyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ1RpbWUgPSB0aGlzLkdldFJlbWFpbmluZ1JlY292ZXJUaW1lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYocmVtYWluaW5nVGltZSA8PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOi9rOaNouS4uuWIhumSn+WSjOenklxyXG4gICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHJlbWFpbmluZ1RpbWUgLyAoNjAgKiAxMDAwKSk7XHJcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IoKHJlbWFpbmluZ1RpbWUgJSAoNjAgKiAxMDAwKSkgLyAxMDAwKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDmoLzlvI/ljJbkuLpNTTpTU+agvOW8j1xyXG4gICAgICAgIHJldHVybiBgJHttaW51dGVzLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06JHtzZWNvbmRzLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorrDlvZVidWZm5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gc2VsZiBcclxuICAgICAqL1xyXG4gICAgaW5pdEJ1ZmZ6dShzZWxmKXtcclxuICAgICAgICB0aGlzLmJ1ZmZUdWppWzBdPS0xO1xyXG4gICAgICAgIHRoaXMuYnVmZlR1amlbMV09LTE7XHJcbiAgICAgICAgdGhpcy5idWZmVHVqaVsyXT0tMTtcclxuICAgICAgICBpZiAodGhpcy5idWZmVHVqaVswXSA9PSAtMSkge1xyXG4gICAgICAgICAgICBzZWxmLlNwcjEuc3ByaXRlRnJhbWUgPSBudWxsO1xyXG4gICAgICAgICAgICBzZWxmLlNwcjIuc3ByaXRlRnJhbWUgPSBudWxsO1xyXG4gICAgICAgICAgICBzZWxmLlNwcjMuc3ByaXRlRnJhbWUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5re75YqgYnVmZuaVsOaNrlxyXG4gICAgICogQHBhcmFtIG51bSBcclxuICAgICAqIEBwYXJhbSBzZWxmIFxyXG4gICAgICovXHJcbiAgICBhZGRCdWZmTnVtKG51bTphbnksc2VsZjphbnkpe1xyXG4gICAgICAgIHZhciBudW0wID0gdGhpcy5idWZmVHVqaVswXTtcclxuICAgICAgICB2YXIgbnVtMSA9IHRoaXMuYnVmZlR1amlbMV07XHJcbiAgICAgICAgaWYgKG51bTEgPiAtMSkge1xyXG4gICAgICAgICAgICBpZiAobnVtMSA9PSBudW0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZlR1amlbMl0gPSBudW07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZUdWppWzFdID0gLTE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZUdWppWzBdID0gbnVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKG51bTAgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bTAgPT0gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmVHVqaVsxXSA9IG51bTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmVHVqaVswXSA9IG51bTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZlR1amlbMF0gPSBudW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaGVja0J1ZmYoc2VsZik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeaYr+WQpua7oei2s2J1ZmZlclxyXG4gICAgICogQHBhcmFtIHNlbGYgXHJcbiAgICAgKi9cclxuICAgIGNoZWNrQnVmZihzZWxmKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHRoaXMuYnVmZlR1amlbMl07XHJcbiAgICAgICAgaWYgKG51bSA9PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgIHN3aXRjaCAobnVtKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZjEoc2VsZik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLlBsYXlCdWZmQXVkaW8oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuIGluaXRCdWZmenUoc2VsZik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmMihzZWxmKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuUGxheUJ1ZmZBdWRpbygpOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuIGluaXRCdWZmenUoc2VsZik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmMyhzZWxmKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuUGxheUJ1ZmZBdWRpbygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QnVmZnp1KHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBidWZmMShzZWxmKXtcclxuICAgICAgICBzZWxmLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcclxuICAgICAgICAvLyDmo4Dmn6VkdW7mmK/lkKblrZjlnKhcclxuICAgICAgICBpZiAoc2VsZi5kdW4pIHtcclxuICAgICAgICAgICAgc2VsZi5kdW4ub3BhY2l0eSA9IDI1NTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5hbmltLnBsYXkoXCJidWZmMVwiKTtcclxuICAgICAgICB0aGlzLmlzVG91Y2hBZ2Fpbj1mYWxzZTtcclxuICAgICAgICB0aGlzLnBsYXllckJ1ZmYgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuQmdNb3ZlU3BlZWQgPSAyNDtcclxuICAgICAgICB2YXIgYTEgPSBjYy5tb3ZlVG8oMC41LCBjYy52MigwLCAyMDApKTtcclxuICAgICAgICB2YXIgYTIgPSBjYy5tb3ZlVG8oMywgY2MudjIoMjUwLCAxMDApKTtcclxuICAgICAgICB2YXIgYTMgPSBjYy5tb3ZlVG8oMywgY2MudjIoLTI1MCwgMCkpO1xyXG4gICAgICAgIHZhciBhNCA9IGNjLm1vdmVUbygzLCBjYy52MigyNTAsMCkpO1xyXG4gICAgICAgIHZhciBhNSA9IGNjLm1vdmVUbygyLCBjYy52MigyMDAsIC0xOTcpKTtcclxuICAgICAgICB2YXIgYTYgPSBjYy5jYWxsRnVuYygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQnVmZiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLkJnTW92ZVNwZWVkID0gODtcclxuICAgICAgICAgICAgLy8g6YeN572u5L+d5oqk572p5L2N572u5Yiw5Lq654mp5Lit5b+DXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllckh1ZHVuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllckh1ZHVuLnkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOehruS/neeOqeWutuS9jee9ruato+ehru+8jOW5tuagueaNruS9jee9ruiuvue9ruato+ehrueahOeKtuaAgVxyXG4gICAgICAgICAgICBpZiAoc2VsZikge1xyXG4gICAgICAgICAgICAgICAgLy8g5qOA5p+l6KeS6Imy5piv5ZCm5Yiw6L6+5Zyw6Z2i5L2N572uXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoc2VsZi5ub2RlLnkgKyAxOTcpIDwgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDop5LoibLlt7Lnu4/lnKjlnLDpnaLvvIzlj6/ku6XmgaLlpI3ot7Pot4PmnYPpmZBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVG91Y2hBZ2FpbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5oGi5aSN6KeS6Imy5q2j5bi46LeR5Yqo5Yqo55S7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYubm9kZS54ID4gMTUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd5MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLm5vZGUueCA8IC0xNTApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3oxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c6KeS6Imy5Zyo5Lit6Ze05L2N572u77yM5qC55o2u5b2T5YmN5L2N572u6K6+572u5pa55ZCRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd5MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3oxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICBcclxuICAgICAgICB2YXIgYWN0aW9uPWNjLnNlcXVlbmNlKGExLGEyLGEzLGE0LGE1LGE2KTtcclxuICAgICAgICBzZWxmLm5vZGUucnVuQWN0aW9uKGFjdGlvbik7XHJcbiAgICB9XHJcbiAgICBidWZmMihzZWxmKXtcclxuICAgICAgICBzZWxmLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcclxuICAgICAgICAvLyDmo4Dmn6VkdW7mmK/lkKblrZjlnKhcclxuICAgICAgICBpZiAoc2VsZi5kdW4pIHtcclxuICAgICAgICAgICAgc2VsZi5kdW4ub3BhY2l0eSA9IDI1NTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5hbmltLnBsYXkoXCJidWZmMlwiKTtcclxuICAgICAgICB0aGlzLmlzVG91Y2hBZ2Fpbj1mYWxzZTtcclxuICAgICAgICB0aGlzLnBsYXllckJ1ZmYgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuQmdNb3ZlU3BlZWQgPSAyNDtcclxuICAgICAgICB2YXIgYTEgPSBjYy5tb3ZlVG8oMC41LCBjYy52MigwLCAyMDApKTtcclxuICAgICAgICB2YXIgYTIgPSBjYy5tb3ZlVG8oMywgY2MudjIoMjUwLCAxMDApKTtcclxuICAgICAgICB2YXIgYTMgPSBjYy5tb3ZlVG8oMywgY2MudjIoLTI1MCwgMCkpO1xyXG4gICAgICAgIHZhciBhNCA9IGNjLm1vdmVUbygzLCBjYy52MigyNTAsMCkpO1xyXG4gICAgICAgIHZhciBhNSA9IGNjLm1vdmVUbygyLCBjYy52MigyMDAsIC0xOTcpKTtcclxuICAgICAgICB2YXIgYTYgPSBjYy5jYWxsRnVuYygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQnVmZiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLkJnTW92ZVNwZWVkID0gODtcclxuICAgICAgICAgICAgLy8g6YeN572u5L+d5oqk572p5L2N572u5Yiw5Lq654mp5Lit5b+DXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllckh1ZHVuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllckh1ZHVuLnkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOehruS/neeOqeWutuS9jee9ruato+ehru+8jOW5tuagueaNruS9jee9ruiuvue9ruato+ehrueahOeKtuaAgVxyXG4gICAgICAgICAgICBpZiAoc2VsZikge1xyXG4gICAgICAgICAgICAgICAgLy8g5qOA5p+l6KeS6Imy5piv5ZCm5Yiw6L6+5Zyw6Z2i5L2N572uXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoc2VsZi5ub2RlLnkgKyAxOTcpIDwgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDop5LoibLlt7Lnu4/lnKjlnLDpnaLvvIzlj6/ku6XmgaLlpI3ot7Pot4PmnYPpmZBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVG91Y2hBZ2FpbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5oGi5aSN6KeS6Imy5q2j5bi46LeR5Yqo5Yqo55S7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYubm9kZS54ID4gMTUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd5MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLm5vZGUueCA8IC0xNTApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3oxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c6KeS6Imy5Zyo5Lit6Ze05L2N572u77yM5qC55o2u5b2T5YmN5L2N572u6K6+572u5pa55ZCRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd5MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3oxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICBcclxuICAgICAgICB2YXIgYWN0aW9uPWNjLnNlcXVlbmNlKGExLGEyLGEzLGE0LGE1LGE2KTtcclxuICAgICAgICBzZWxmLm5vZGUucnVuQWN0aW9uKGFjdGlvbik7XHJcbiAgICB9XHJcbiAgICBidWZmMyhzZWxmKXtcclxuICAgICAgICAvLyDmo4Dmn6VkdW7mmK/lkKblrZjlnKhcclxuICAgICAgICBpZiAoc2VsZi5kdW4pIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bj1zZWxmLmR1bjtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bi55PTEwMDtcclxuXHJcbiAgICAgICAgICAgIHNlbGYubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xyXG4gICAgICAgICAgICBzZWxmLmR1bi5vcGFjaXR5ID0gMjU1O1xyXG4gICAgICAgICAgICBzZWxmLmFuaW0ucGxheShcImJ1ZmYzXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmlzVG91Y2hBZ2Fpbj1mYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJCdWZmID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5CZ01vdmVTcGVlZCA9IDI0O1xyXG4gICAgICAgICAgICB2YXIgYTEgPSBjYy5tb3ZlVG8oMC41LCBjYy52MigwLCAyMDApKTtcclxuICAgICAgICAgICAgdmFyIGEyID0gY2MubW92ZVRvKDMsIGNjLnYyKDI1MCwgMTAwKSk7XHJcbiAgICAgICAgICAgIHZhciBhMyA9IGNjLm1vdmVUbygzLCBjYy52MigtMjUwLCAwKSk7XHJcbiAgICAgICAgICAgIHZhciBhNCA9IGNjLm1vdmVUbygzLCBjYy52MigyNTAsMCkpO1xyXG4gICAgICAgICAgICB2YXIgYTUgPSBjYy5tb3ZlVG8oMiwgY2MudjIoMjAwLCAtMTk3KSk7XHJcbiAgICAgICAgICAgIHZhciBhNiA9IGNjLmNhbGxGdW5jKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyQnVmZiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5CZ01vdmVTcGVlZCA9IDg7XHJcbiAgICAgICAgICAgICAgICAvLyDph43nva7kv53miqTnvankvY3nva7liLDkurrniankuK3lv4NcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllckh1ZHVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bi55ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOehruS/neeOqeWutuS9jee9ruato+ehru+8jOW5tuagueaNruS9jee9ruiuvue9ruato+ehrueahOeKtuaAgVxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6Xop5LoibLmmK/lkKbliLDovr7lnLDpnaLkvY3nva5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoc2VsZi5ub2RlLnkgKyAxOTcpIDwgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6KeS6Imy5bey57uP5Zyo5Zyw6Z2i77yM5Y+v5Lul5oGi5aSN6Lez6LeD5p2D6ZmQXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNUb3VjaEFnYWluID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5oGi5aSN6KeS6Imy5q2j5bi46LeR5Yqo5Yqo55S7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDE1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3kxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5ub2RlLnggPCAtMTUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgnejEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzop5LoibLlnKjkuK3pl7TkvY3nva7vvIzmoLnmja7lvZPliY3kvY3nva7orr7nva7mlrnlkJFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgneTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd6MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICBcclxuICAgICAgICAgICAgdmFyIGFjdGlvbj1jYy5zZXF1ZW5jZShhMSxhMixhMyxhNCxhNSxhNik7XHJcbiAgICAgICAgICAgIHNlbGYubm9kZS5ydW5BY3Rpb24oYWN0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ3NlbGYuZHVu5pyq5om+5Yiw77yM5peg5rOV5omn6KGMYnVmZjPmlYjmnpwnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGJ1Zmblm77niYfnrqHnkIZcclxuICAgICAqIEBwYXJhbSBzZWxmIFxyXG4gICAgICovXHJcbiAgICBjaGFuZ2VTcHJzKHNlbGYpIHtcclxuICAgICAgICBzZWxmLlNwcjEuc3ByaXRlRnJhbWUgPSBzZWxmLlNwclp1W3RoaXMuYnVmZlR1amlbMF1dO1xyXG4gICAgICAgIHNlbGYuU3ByMi5zcHJpdGVGcmFtZSA9IHNlbGYuU3ByWnVbdGhpcy5idWZmVHVqaVsxXV07XHJcbiAgICAgICAgc2VsZi5TcHIzLnNwcml0ZUZyYW1lID0gc2VsZi5TcHJadVt0aGlzLmJ1ZmZUdWppWzJdXTtcclxuICAgIH1cclxuICAgIC8qKuaVsOaNruWIneWni+WMliAqL1xyXG4gICAgaW5pdEdhbWUoKSB7XHJcbiAgICAgICAgLy/mjqfliLblhYvpmobmgKrnialcclxuICAgICAgICB0aGlzLmlzR2FtZUJlZ2luPXRydWU7XHJcbiAgICAgICAgLy/lvIDlkK/op6blsY9cclxuICAgICAgICB0aGlzLnBsYXllckxvYz0tMTtcclxuICAgICAgICB0aGlzLmlzVG91Y2hBZ2Fpbj10cnVlO1xyXG4gICAgICAgIHRoaXMuRXZlcnlTY29yZT0wO1xyXG4gICAgICAgIC8vIOmHjee9rueOqeWutmJ1ZmbnirbmgIHvvIzpgb/lhY3msLjkuYXml6DmlYxcclxuICAgICAgICB0aGlzLnBsYXllckJ1ZmY9ZmFsc2U7XHJcbiAgICAgICAgLy8g6YeN572u6YCf5bqm5Li65Yid5aeL5YC8XHJcbiAgICAgICAgdGhpcy5CZ01vdmVTcGVlZD04O1xyXG4gICAgICAgIHRoaXMuTW92ZVNwZWVkPTEwO1xyXG4gICAgICAgIC8vIOmHjee9rmJ1Zmblm77niYfnirbmgIFcclxuICAgICAgICB0aGlzLmJ1ZmZUdWppID0gWy0xLC0xLC0xXTtcclxuICAgICAgICAvLyDph43nva7miqTnm77oioLngrlcclxuICAgICAgICB0aGlzLnBsYXllckh1ZHVuPW51bGw7XHJcbiAgICAgICAgLy8g6YeN572uUGxheWVyTWFuYWdlcuW8leeUqFxyXG4gICAgICAgIHRoaXMucGxheWVyTWFuYWdlcj1udWxsO1xyXG4gICAgICAgIC8vIOS4jeaUueWPmOW9k+WJjea4uOaIj+aooeW8j++8iOS/neaMgeaXoOmZkOaooeW8j+aIluWFs+WNoeaooeW8j++8iVxyXG4gICAgICAgIC8vIOaXoOmZkOaooeW8j+S4i+S4jemHjee9rmN1cnJlbnRMZXZlbO+8jOS/neaMgeeUqOaIt+i/m+W6plxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMluWFs+WNoea4uOaIj1xyXG4gICAgICovXHJcbiAgICBpbml0TGV2ZWxHYW1lKCkge1xyXG4gICAgICAgIHRoaXMuaW5pdEdhbWUoKTtcclxuICAgICAgICB0aGlzLmlzSW5maW5pdGVNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5FdmVyeVNjb3JlID0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3lhbPljaHnmoTnm67moIfliIbmlbBcclxuICAgICAqIEByZXR1cm5zIOW9k+WJjeWFs+WNoeebruagh+WIhuaVsFxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50TGV2ZWxUYXJnZXRTY29yZSgpOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IGxldmVsQ29uZmlnID0gdGhpcy5nZXRDdXJyZW50TGV2ZWxDb25maWcoKTtcclxuICAgICAgICAvLyBpZiAobGV2ZWxDb25maWcpIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIGxldmVsQ29uZmlnLnN0YXIxO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW9k+WJjeWFs+WNoeeahOmFjee9rlxyXG4gICAgICogQHJldHVybnMg5b2T5YmN5YWz5Y2h6YWN572uXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnRMZXZlbENvbmZpZygpOiBMZXZlbENvbmZpZyB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmN1cnJlbnRMZXZlbCAtIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGV2ZWxDb25maWdzW2luZGV4XSB8fCBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5YWz5Y2hSUTojrflj5blhbPljaHphY3nva5cclxuICAgICAqIEBwYXJhbSBsZXZlbCDlhbPljaFJRFxyXG4gICAgICogQHJldHVybnMg5YWz5Y2h6YWN572uXHJcbiAgICAgKi9cclxuICAgIGdldExldmVsQ29uZmlnKGxldmVsOiBudW1iZXIpOiBMZXZlbENvbmZpZyB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBsZXZlbCAtIDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGV2ZWxDb25maWdzW2luZGV4XSB8fCBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiuoeeul+iOt+W+l+eahOaYn+aYn+aVsFxyXG4gICAgICogQHBhcmFtIHNjb3JlIOW9k+WJjeW+l+WIhlxyXG4gICAgICogQHJldHVybnMg6I635b6X55qE5pif5pif5pWw77yIMC0z77yJXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZVN0YXJzKHNjb3JlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLmlzSW5maW5pdGVNb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIOaXoOmZkOaooeW8j+S4i+eahOaYn+aYn+iuoeeul+mAu+i+ke+8muWfuuS6juWIhuaVsOiMg+WbtFxyXG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gNDAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMzsgLy8gNDAx5YiG5Lul5LiK77yM6I635b6XM+mil+aYn1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlID49IDIwMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7IC8vIDIwMS00MDDliIbvvIzojrflvpcy6aKX5pifXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcmUgPj0gMTAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTsgLy8gMTAxLTIwMOWIhu+8jOiOt+W+lzHpopfmmJ9cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwOyAvLyAwLTEwMOWIhu+8jOiOt+W+lzDpopfmmJ9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWFs+WNoeaooeW8j+S4i+eahOaYn+aYn+iuoeeul+mAu+i+ke+8muWfuuS6jumFjee9ruaWh+S7tuS4reeahOaYn+aYn+adoeS7tlxyXG4gICAgICAgICAgICBjb25zdCBsZXZlbENvbmZpZyA9IHRoaXMuZ2V0Q3VycmVudExldmVsQ29uZmlnKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWxldmVsQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCflvZPliY3lhbPljaHphY3nva7kuI3lrZjlnKgnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDkvb/nlKjphY3nva7mlofku7bkuK3nmoTmmJ/mmJ/mnaHku7ZcclxuICAgICAgICAgICAgLy8gaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMzsgLy8g6L6+5YiwM+aYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIyKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMjsgLy8g6L6+5YiwMuaYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIxKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMTsgLy8g6L6+5YiwMeaYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIDA7IC8vIOacqui+vuWIsOS7u+S9leaYn+aYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOS/neWtmOaMh+WumuWFs+WNoeiOt+W+l+eahOaYn+aYn+aVsO+8iOS9v+eUqOaVsOe7hOaWueW8j+WtmOWCqO+8iVxyXG4gICAgICogQHBhcmFtIGxldmVsIOWFs+WNoeWPt1xyXG4gICAgICogQHBhcmFtIHN0YXJzIOiOt+W+l+eahOaYn+aYn+aVsFxyXG4gICAgICovXHJcbiAgICBzYXZlTGV2ZWxTdGFyc0J5TGV2ZWwobGV2ZWw6IG51bWJlciwgc3RhcnM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmIChsZXZlbCA8IDEgfHwgbGV2ZWwgPiB0aGlzLmdldFRvdGFsTGV2ZWxzKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDkv53lrZjmmJ/mmJ/mlbDlpLHotKXvvJrlhbPljaHlj7cke2xldmVsfeaXoOaViGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGxldmVsSW5kZXggPSBsZXZlbCAtIDE7IC8vIOaVsOe7hOe0ouW8leS7jjDlvIDlp4tcclxuICAgICAgICBcclxuICAgICAgICAvLyDnoa7kv53mlbDnu4TotrPlpJ/lpKdcclxuICAgICAgICB3aGlsZSAodGhpcy5sZXZlbFN0YXJzLmxlbmd0aCA8PSBsZXZlbEluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFycy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjdXJyZW50U3RhcnMgPSB0aGlzLmxldmVsU3RhcnNbbGV2ZWxJbmRleF0gfHwgMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoc3RhcnMgPiBjdXJyZW50U3RhcnMpIHtcclxuICAgICAgICAgICAgdGhpcy5sZXZlbFN0YXJzW2xldmVsSW5kZXhdID0gc3RhcnM7XHJcbiAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsOWtmOWCqFxyXG4gICAgICAgICAgICBjb25zdCBsZXZlbFN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGV2ZWxTdGFyc0tleSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShsZXZlbFN0YXJzS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLmxldmVsU3RhcnMpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYOWFs+WNoSR7bGV2ZWx96I635b6XJHtzdGFyc33popfmmJ/vvIjmr5TkuYvliY3nmoQke2N1cnJlbnRTdGFyc33popfmm7TlpJrvvInvvIzlt7Lkv53lrZhgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5YWz5Y2hJHtsZXZlbH3ojrflvpcke3N0YXJzfemil+aYn++8jOacqui2hei/h+S5i+WJjeeahCR7Y3VycmVudFN0YXJzfemil++8jOS4jeS/neWtmGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDkv53lrZjlvZPliY3lhbPljaHojrflvpfnmoTmmJ/mmJ/mlbDvvIjkvb/nlKjmlbDnu4TmlrnlvI/lrZjlgqjvvIlcclxuICAgICAqIEBwYXJhbSBzdGFycyDojrflvpfnmoTmmJ/mmJ/mlbBcclxuICAgICAqL1xyXG4gICAgc2F2ZUxldmVsU3RhcnMoc3RhcnM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxldmVsSW5kZXggPSB0aGlzLmN1cnJlbnRMZXZlbCAtIDE7IC8vIOaVsOe7hOe0ouW8leS7jjDlvIDlp4tcclxuICAgICAgICBcclxuICAgICAgICAvLyDnoa7kv53mlbDnu4TotrPlpJ/lpKdcclxuICAgICAgICB3aGlsZSAodGhpcy5sZXZlbFN0YXJzLmxlbmd0aCA8PSBsZXZlbEluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFycy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjdXJyZW50U3RhcnMgPSB0aGlzLmxldmVsU3RhcnNbbGV2ZWxJbmRleF0gfHwgMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoc3RhcnMgPiBjdXJyZW50U3RhcnMpIHtcclxuICAgICAgICAgICAgdGhpcy5sZXZlbFN0YXJzW2xldmVsSW5kZXhdID0gc3RhcnM7XHJcbiAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsOWtmOWCqFxyXG4gICAgICAgICAgICBjb25zdCBsZXZlbFN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGV2ZWxTdGFyc0tleSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShsZXZlbFN0YXJzS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLmxldmVsU3RhcnMpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYOWFs+WNoSR7dGhpcy5jdXJyZW50TGV2ZWx96I635b6XJHtzdGFyc33popfmmJ/vvIjmr5TkuYvliY3nmoQke2N1cnJlbnRTdGFyc33popfmm7TlpJrvvInvvIzlt7Lkv53lrZhgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5YWz5Y2hJHt0aGlzLmN1cnJlbnRMZXZlbH3ojrflvpcke3N0YXJzfemil+aYn++8jOacqui2hei/h+S5i+WJjeeahCR7Y3VycmVudFN0YXJzfemil++8jOS4jeS/neWtmGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprlhbPljaHojrflvpfnmoTmmJ/mmJ/mlbDvvIjku47mlbDnu4TkuK3or7vlj5bvvIlcclxuICAgICAqIEBwYXJhbSBsZXZlbCDlhbPljaHmlbBcclxuICAgICAqIEByZXR1cm5zIOiOt+W+l+eahOaYn+aYn+aVsO+8iDAtM++8iVxyXG4gICAgICovXHJcbiAgICBnZXRMZXZlbFN0YXJzKGxldmVsOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChsZXZlbCA8IDEgfHwgbGV2ZWwgPiB0aGlzLmdldFRvdGFsTGV2ZWxzKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDojrflj5bmmJ/mmJ/mlbDlpLHotKXvvJrlhbPljaHlj7cke2xldmVsfeaXoOaViGApO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgbGV2ZWxJbmRleCA9IGxldmVsIC0gMTsgLy8g5pWw57uE57Si5byV5LuOMOW8gOWni1xyXG4gICAgICAgIGxldCBzdGFycyA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5LyY5YWI5LuO5YaF5a2Y5pWw57uE6K+75Y+WXHJcbiAgICAgICAgaWYgKHRoaXMubGV2ZWxTdGFycyAmJiB0aGlzLmxldmVsU3RhcnMubGVuZ3RoID4gbGV2ZWxJbmRleCkge1xyXG4gICAgICAgICAgICBzdGFycyA9IHRoaXMubGV2ZWxTdGFyc1tsZXZlbEluZGV4XSB8fCAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDlpoLmnpzlhbPljaHlt7Lop6PplIHvvIjlsI/kuo51bmxvY2tlZExldmVs77yJ5L2G5pif57qn5Li6MO+8jOe7mem7mOiupDHmmJ/vvIjlhbzlrrnml6fotKblj7fvvIlcclxuICAgICAgICAvLyDlt7Lop6PplIHkvYbmnKrpgJrlhbPnmoTlhbPljaHvvIh1bmxvY2tlZExldmVs77yJ5LiN57uZ6buY6K6k5pifXHJcbiAgICAgICAgaWYgKHN0YXJzID09PSAwICYmIGxldmVsIDwgdGhpcy51bmxvY2tlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHN0YXJzID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g56Gu5L+d5pif5pif5pWw6YeP5Zyo5ZCI55CG6IyD5Zu05YaFXHJcbiAgICAgICAgY29uc3QgdmFsaWRTdGFycyA9IE1hdGgubWF4KDAsIE1hdGgubWluKHN0YXJzLCAzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZhbGlkU3RhcnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ5YWz5Y2h55qE5pif57qn5pWw57uE77yI55So5LqO5ZCM5q2l5Yiw5pyN5Yqh56uv77yJXHJcbiAgICAgKiBAcmV0dXJucyDmmJ/nuqfmlbDnu4TvvIzntKLlvJXkuLrlhbPljaHlj7cgLTFcclxuICAgICAqL1xyXG4gICAgZ2V0TGV2ZWxTdGFyc0FycmF5KCk6IG51bWJlcltdIHtcclxuICAgICAgICBjb25zdCB0b3RhbExldmVscyA9IHRoaXMuZ2V0VG90YWxMZXZlbHMoKTtcclxuICAgICAgICBjb25zdCBzdGFyc0FycmF5OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRvdGFsTGV2ZWxzOyBpKyspIHtcclxuICAgICAgICAgICAgc3RhcnNBcnJheS5wdXNoKHRoaXMuZ2V0TGV2ZWxTdGFycyhpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBzdGFyc0FycmF5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOS7juacjeWKoeerr+WKoOi9veaYn+e6p+aVsOe7hO+8iOS9v+eUqOaVsOe7hOaWueW8j+WtmOWCqO+8iVxyXG4gICAgICogQHBhcmFtIHN0YXJzQXJyYXkg5pif57qn5pWw57uEXHJcbiAgICAgKi9cclxuICAgIGxvYWRMZXZlbFN0YXJzQXJyYXkoc3RhcnNBcnJheTogbnVtYmVyW10pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3RhcnNBcnJheSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCfmmJ/nuqfmlbDnu4TmoLzlvI/plJnor68nKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0b3RhbExldmVscyA9IHRoaXMuZ2V0VG90YWxMZXZlbHMoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDlkIjlubbmnI3liqHnq6/mlbDmja7kuI7mnKzlnLDmlbDmja7vvIzkv53nlZnmnIDpq5jmmJ/nuqdcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKHN0YXJzQXJyYXkubGVuZ3RoLCB0b3RhbExldmVscyk7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFycyA9IHN0YXJzQXJyYXlbaV07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhcnMgPT09ICdudW1iZXInICYmIHN0YXJzID49IDAgJiYgc3RhcnMgPD0gMykge1xyXG4gICAgICAgICAgICAgICAgLy8g56Gu5L+d5pWw57uE6Laz5aSf5aSnXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5sZXZlbFN0YXJzLmxlbmd0aCA8PSBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbFN0YXJzLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDkv53nlZnmnIDpq5jmmJ/nuqdcclxuICAgICAgICAgICAgICAgIGlmIChzdGFycyA+IHRoaXMubGV2ZWxTdGFyc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFyc1tpXSA9IHN0YXJzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOS/neWtmOWIsOacrOWcsOWtmOWCqFxyXG4gICAgICAgIGNvbnN0IGxldmVsU3RhcnNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sZXZlbFN0YXJzS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0obGV2ZWxTdGFyc0tleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5sZXZlbFN0YXJzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coYOW3suS7juacjeWKoeerr+WKoOi9veaYn+e6p+aVsOaNru+8jOWFsSR7c3RhcnNBcnJheS5sZW5ndGh95Liq5YWz5Y2hYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6YeN572u5YWz5Y2h6L+b5bqm5Li656ys5LiA5YWzXHJcbiAgICAgKi9cclxuICAgIHJlc2V0TGV2ZWxQcm9ncmVzcygpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9IDE7XHJcbiAgICAgICAgY29uc3QgY3VycmVudExldmVsS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuY3VycmVudExldmVsS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oY3VycmVudExldmVsS2V5KTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0b3RhbExldmVscyA9IHRoaXMuZ2V0VG90YWxMZXZlbHMoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0b3RhbExldmVsczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKGBMZXZlbFN0YXJzXyR7aX1gKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHN0YXJzS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+WFs+WNoei/m+W6puW3sumHjee9ru+8jOmHjeaWsOS7juesrCAxIOWFs+W8gOWniycpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaAu+WFs+WNoeaVsFxyXG4gICAgICogQHJldHVybnMg5oC75YWz5Y2h5pWwXHJcbiAgICAgKi9cclxuICAgIGdldFRvdGFsTGV2ZWxzKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGV2ZWxDb25maWdzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blt7Lop6PplIHnmoTmnIDpq5jlhbPljaFcclxuICAgICAqIEByZXR1cm5zIOW3suino+mUgeeahOacgOmrmOWFs+WNoeWPt1xyXG4gICAgICovXHJcbiAgICBnZXRIaWdoZXN0VW5sb2NrZWRMZXZlbCgpOiBudW1iZXIge1xyXG4gICAgICAgIC8vIOS7juacgOmrmOWFs+WNoeW8gOWni+WQkeS4i+mBjeWOhu+8jOaJvuWIsOesrOS4gOS4quW3suino+mUgeeahOWFs+WNoVxyXG4gICAgICAgIGZvciAobGV0IGxldmVsID0gdGhpcy5nZXRUb3RhbExldmVscygpOyBsZXZlbCA+PSAyOyBsZXZlbC0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTGV2ZWxVbmxvY2tlZChsZXZlbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZXZlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlpoLmnpzmsqHmnInmib7liLDvvIjnkIborrrkuIrkuI3lj6/og73vvIzlm6DkuLrnrKzkuIDlhbPmgLvmmK/op6PplIHnmoTvvInvvIzov5Tlm57nrKzkuIDlhbNcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8g5Ymn5oOF5by556qX55u45YWzXHJcbiAgICBwdWJsaWMgc3RvcnlQb3B1cFNob3duS2V5OiBzdHJpbmcgPSAnU3RvcnlQb3B1cFNob3duJztcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6Xliafmg4XlvLnnqpfmmK/lkKblt7LmmL7npLpcclxuICAgICAqIEByZXR1cm5zIOaYr+WQpuW3suaYvuekulxyXG4gICAgICovXHJcbiAgICBpc1N0b3J5UG9wdXBTaG93bigpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5zdG9yeVBvcHVwU2hvd25LZXkpO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSAndHJ1ZSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6K6w5b2V5Ymn5oOF5by556qX5bey5pi+56S6XHJcbiAgICAgKi9cclxuICAgIHNldFN0b3J5UG9wdXBTaG93bigpIHtcclxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5zdG9yeVBvcHVwU2hvd25LZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksICd0cnVlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5oyH5a6a5oqA6IO955qE5b2T5YmN5pWI5p6c5YC8XHJcbiAgICAgKiBAcGFyYW0gc2tpbGxJZCDmioDog71JRFxyXG4gICAgICogQHJldHVybnMg5b2T5YmN5pWI5p6c5YC8XHJcbiAgICAgKi9cclxuICAgIGdldFNraWxsRWZmZWN0KHNraWxsSWQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3Qgc2tpbGwgPSB0aGlzLnNraWxscy5maW5kKHMgPT4gcy5pZCA9PT0gc2tpbGxJZCk7XHJcbiAgICAgICAgaWYgKCFza2lsbCkgcmV0dXJuIDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHNraWxsLmJhc2VFZmZlY3QgKyAoc2tpbGwubGV2ZWwgLSAxKSAqIHNraWxsLmVmZmVjdFBlckxldmVsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeWFs+WNoeaYr+WQpuino+mUgVxyXG4gICAgICogQHBhcmFtIGxldmVsIOWFs+WNoeWPt1xyXG4gICAgICogQHJldHVybnMg5piv5ZCm6Kej6ZSBXHJcbiAgICAgKi9cclxuICAgIGlzTGV2ZWxVbmxvY2tlZChsZXZlbDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8g56Gu5L+d5YWz5Y2h5Y+35pyJ5pWIXHJcbiAgICAgICAgY29uc3QgdG90YWxMZXZlbHMgPSB0aGlzLmdldFRvdGFsTGV2ZWxzKCk7XHJcbiAgICAgICAgaWYgKGxldmVsIDwgMSB8fCBsZXZlbCA+IHRvdGFsTGV2ZWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5omA5pyJ5bCP5LqO562J5LqO5bey6Kej6ZSB5YWz5Y2h55qE5YWz5Y2h6YO95bqU6K+l6Kej6ZSBXHJcbiAgICAgICAgaWYgKGxldmVsIDw9IHRoaXMudW5sb2NrZWRMZXZlbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6LaF6L+H5bey6Kej6ZSB5YWz5Y2h77yM5oyJ54Wn5Y6f6YC76L6R5Yik5patXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmxldCBtR2FtZURhdGEgPSBuZXcgR2FtZURhdGEoKTtcclxuZXhwb3J0IGRlZmF1bHQgbUdhbWVEYXRhO1xyXG4iXX0=