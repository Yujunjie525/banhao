
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
        this.rolePrices = [0, 500, 1000, 2000, 5000]; //角色价格
        this.roleNames = ['孤狼突击手', '烈焰先锋', '重装破坏者', '幽灵狙击手', '赛博指挥官']; //角色名称
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
        // 加载音频开关状态
        this.GetBGMOnData();
        // 加载音效开关状态
        this.GetSoundOnData();
        // 加载当前选中角色
        this.GetCurrentRoleData();
        // 加载钻石数据
        this.GetGoldData();
    }
    GameData_1 = GameData;
    GameData.prototype.ensureLegacyLevelConfigs = function () {
        if (this.levelConfigs.length > 0) {
            return;
        }
        this.levelConfigs = __spreadArrays(GameData_1.LEVEL_CONFIGS);
    };
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
        this.ensureLegacyLevelConfigs();
        var index = this.currentLevel - 1;
        return this.levelConfigs[index] || null;
    };
    /**
     * 根据关卡ID获取关卡配置
     * @param level 关卡ID
     * @returns 关卡配置
     */
    GameData.prototype.getLevelConfig = function (level) {
        this.ensureLegacyLevelConfigs();
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
        this.ensureLegacyLevelConfigs();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcR2FtZURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNFQUFpRTtBQUUzRCxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQWExQztJQTRLSTtRQTNLQSxlQUFlO1FBQ1IsWUFBTyxHQUFXLElBQUksQ0FBQztRQUM5QixhQUFhO1FBQ04sY0FBUyxHQUFXLElBQUksQ0FBQztRQUNoQyxjQUFjO1FBQ1AsZUFBVSxHQUFVLFNBQVMsQ0FBQztRQUNyQyxjQUFjO1FBQ1AsaUJBQVksR0FBVSxXQUFXLENBQUM7UUFDekMsUUFBUTtRQUNELGdCQUFXLEdBQVcsSUFBSSxDQUFDO1FBQ2xDLFFBQVE7UUFDRCxnQkFBVyxHQUFVLENBQUMsQ0FBQztRQUM5QixTQUFTO1FBQ0YsaUJBQVksR0FBVyxJQUFJLENBQUM7UUFDbkMsaUJBQWlCO1FBQ1YsY0FBUyxHQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzdCLFFBQVE7UUFDRCxlQUFVLEdBQVUsQ0FBQyxDQUFDO1FBQzdCLFFBQVE7UUFDRCxjQUFTLEdBQVUsQ0FBQyxDQUFDO1FBQzVCLFlBQVk7UUFDTCxlQUFVLEdBQVcsS0FBSyxDQUFDO1FBQ2xDLFFBQVE7UUFDRCxrQkFBYSxHQUFXLElBQUksQ0FBQztRQUNwQyxZQUFZO1FBQ0wsaUJBQVksR0FBVSxXQUFXLENBQUM7UUFDekMsMEJBQTBCO1FBQ25CLGFBQVEsR0FBa0IsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLEtBQUs7UUFDRSxnQkFBVyxHQUFXLElBQUksQ0FBQztRQUNsQyxpQkFBaUI7UUFDVixrQkFBYSxHQUFPLElBQUksQ0FBQztRQUNoQyxRQUFRO1FBQ0QsY0FBUyxHQUFVLEVBQUUsQ0FBQztRQUM3QixRQUFRO1FBQ0QsbUJBQWMsR0FBVSxF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LENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDL0UsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM3RSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM3RSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDakYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNsRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDakYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO1FBQzlFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7UUFDakYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUNqRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2hGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDOUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2xGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNsRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNoRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDaEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbEYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUM5RSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQy9FLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDL0UsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDL0UsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUMvRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDakYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ2pGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztRQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7UUFDbkYsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1FBQ25GLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztLQUN0RixDQUFDO0lBMUtJLFFBQVE7UUFEYixPQUFPO09BQ0YsUUFBUSxDQWl4Q2I7SUFBRCxlQUFDO0NBanhDRCxBQWl4Q0MsSUFBQTtBQUNELElBQUksU0FBUyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDL0Isa0JBQWUsU0FBUyxDQUFDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFVzZXJEYXRhU3luY01hbmFnZXIgZnJvbSBcIi4uL01hbmFnZXIvVXNlckRhdGFTeW5jTWFuYWdlclwiO1xuXHJcbmNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxuLy8g5YWz5Y2h6YWN572u5o6l5Y+jXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxDb25maWcge1xyXG4gICAgbGV2ZWxJZDogbnVtYmVyOyAvL+WFs+WNoVxyXG4gICAgaWNvbjogc3RyaW5nOyAgIC8vaWNvbuWbvuagh1xyXG4gICAgdGltZTogbnVtYmVyOyAgIC8v6YCa5YWz5pe26Ze0XHJcbiAgICBNb25zdGVyOiBBcnJheTxudW1iZXI+OyAvLyDlj6/lh7rnjrDnmoTmgKrniannsbvlnotcclxuICAgIG51bTogbnVtYmVyOyAvLyDmgKrnianmlbDph49cclxuICAgIHNwZWVkOiBudW1iZXI7IC8vIOaAqueJqeenu+WKqOmAn+W6plxyXG59XHJcblxyXG5AY2NjbGFzc1xyXG5jbGFzcyBHYW1lRGF0YXtcclxuICAgIC8v6IOM5pmv6Z+z5LmQ5piv5ZCm5byA5ZCvLOm7mOiupOW8gOWQr1xyXG4gICAgcHVibGljIGlzQkdNT246Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+mfs+aViOaYr+WQpuW8gOWQryzpu5jorqTlvIDlkK9cclxuICAgIHB1YmxpYyBpc1NvdW5kT246Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+WtmOWCqOmfs+mikeW8gOWFs+eKtuaAgeeahGtleVxyXG4gICAgcHVibGljIGlzQkdNT25LZXk6c3RyaW5nID0gJ0lzQkdNT24nO1xyXG4gICAgLy/lrZjlgqjpn7PmlYjlvIDlhbPnirbmgIHnmoRrZXlcclxuICAgIHB1YmxpYyBpc1NvdW5kT25LZXk6c3RyaW5nID0gJ0lzU291bmRPbic7XHJcbiAgICAvL+a4uOaIj+aYr+WQpuW8gOWni1xyXG4gICAgcHVibGljIGlzR2FtZUJlZ2luOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy/og4zmma/np7vliqjpgJ/luqZcclxuICAgIHB1YmxpYyBCZ01vdmVTcGVlZDpudW1iZXIgPSA4O1xyXG4gICAgLy/mmK/lkKbnrKzkuozmrKHop6bmkbhcclxuICAgIHB1YmxpYyBpc1RvdWNoQWdhaW46Ym9vbGVhbiA9IHRydWU7XHJcbiAgICAvL+eOqeWutuaJgOWkhOS9jee9ruOAgi0x5Zyo5bem77yMMeWcqOWPs1xyXG4gICAgcHVibGljIHBsYXllckxvYzpudW1iZXIgPSAtMTtcclxuICAgIC8v546p5a625b2T5LiL5b6X5YiGXHJcbiAgICBwdWJsaWMgRXZlcnlTY29yZTpudW1iZXIgPSAwO1xyXG4gICAgLy/njqnlrrbmnIDpq5jlvpfliIZcclxuICAgIHB1YmxpYyBCZXN0U2NvcmU6bnVtYmVyID0gMDtcclxuICAgIC8v6K6w5b2V546p5a62QlVGRueKtuaAgVxyXG4gICAgcHVibGljIHBsYXllckJ1ZmY6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgLy/mmK/lkKblvq7kv6HliIbkuqtcclxuICAgIHB1YmxpYyBpc09wZW5XWFNoYXJlOmJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLy/lrZjlgqjml7bnmoTmnIDpq5jliIZrZXlcclxuICAgIHB1YmxpYyBCZXN0U2NvcmVLZXk6c3RyaW5nID0gJ0Jlc3RTY29yZSc7XHJcbiAgICAvL2J1Zmblm77niYcoMC3po57plZbvvIwxLS3omorlrZDvvIwyLS3ni5Dni7gpXHJcbiAgICBwdWJsaWMgYnVmZlR1amk6IEFycmF5PG51bWJlcj4gPSBbLTEsLTEsLTFdO1xyXG4gICAgLy/miqTnm77lgLxcclxuICAgIHB1YmxpYyBwbGF5ZXJIdWR1bjpjYy5Ob2RlID0gbnVsbDtcclxuICAgIC8vUGxheWVyTWFuYWdlcuWunuS+i1xyXG4gICAgcHVibGljIHBsYXllck1hbmFnZXI6YW55ID0gbnVsbDtcclxuICAgIC8v54mp5L2T56e75Yqo6YCf5bqmXHJcbiAgICBwdWJsaWMgTW92ZVNwZWVkOm51bWJlciA9IDEwO1xyXG4gICAgLy/kvZPlipvns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBjdXJyZW50U3RhbWluYTpudW1iZXIgPSAzMDsgLy/lvZPliY3kvZPlipvlgLxcclxuICAgIHB1YmxpYyBtYXhTdGFtaW5hOm51bWJlciA9IDMwOyAvL+acgOWkp+S9k+WKm+WAvFxyXG4gICAgcHVibGljIGxhc3RSZWNvdmVyVGltZTpudW1iZXIgPSBEYXRlLm5vdygpOyAvL+S4iuasoeaBouWkjeS9k+WKm+eahOaXtumXtOaIs1xyXG4gICAgcHVibGljIHN0YW1pbmFLZXk6c3RyaW5nID0gJ1N0YW1pbmEnOyAvL+WtmOWCqOS9k+WKm+eahGtleVxyXG4gICAgcHVibGljIGxhc3RSZWNvdmVyVGltZUtleTpzdHJpbmcgPSAnTGFzdFJlY292ZXJUaW1lJzsgLy/lrZjlgqjkuIrmrKHmgaLlpI3ml7bpl7TnmoRrZXlcclxuICAgIFxyXG4gICAgLy/pkrvnn7Pns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBjdXJyZW50R29sZDpudW1iZXIgPSAwOyAvL+W9k+WJjemSu+efs+aVsOmHj++8jOWIneWni+e7mTEwMDBcclxuICAgIHB1YmxpYyBnb2xkS2V5OnN0cmluZyA9ICdDdXJyZW50R29sZCc7IC8v5a2Y5YKo6ZK755+z55qEa2V5XHJcbiAgICBwdWJsaWMgdG90YWxHb2xkRWFybmVkOm51bWJlciA9IDA7IC8v57Sv6K6h6I635b6X6ZK755+z5pWw6YePXHJcbiAgICBwdWJsaWMgdG90YWxHb2xkRWFybmVkS2V5OnN0cmluZyA9ICdUb3RhbEdvbGRFYXJuZWQnOyAvL+WtmOWCqOe0r+iuoemSu+efs+eahGtleVxyXG4gICAgXHJcbiAgICAvL+inkuiJsuezu+e7n+ebuOWFs1xyXG4gICAgcHVibGljIHVubG9ja2VkUm9sZXM6IEFycmF5PGJvb2xlYW4+ID0gW3RydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTsgLy/op5LoibLop6PplIHnirbmgIHvvIzpu5jorqTop6PplIHnrKzkuIDkuKrop5LoibJcclxuICAgIHB1YmxpYyBjdXJyZW50Um9sZTogbnVtYmVyID0gMDsgLy/lvZPliY3pgInkuK3nmoTop5LoibLntKLlvJVcclxuICAgIHB1YmxpYyB1bmxvY2tlZFJvbGVzS2V5OnN0cmluZyA9ICdVbmxvY2tlZFJvbGVzJzsgLy/lrZjlgqjop5LoibLop6PplIHnirbmgIHnmoRrZXlcclxuICAgIHB1YmxpYyBjdXJyZW50Um9sZUtleTpzdHJpbmcgPSAnQ3VycmVudFJvbGUnOyAvL+WtmOWCqOW9k+WJjemAieS4reinkuiJsueahGtleVxyXG4gICAgcHVibGljIHJvbGVXZWlnaHRzOiBBcnJheTxudW1iZXI+ID0gWzEwLCAyMCwgMzAsIDQwLCA1MF07IC8v6KeS6Imy6YeN6YePXHJcbiAgICBwdWJsaWMgcm9sZVByaWNlczogQXJyYXk8bnVtYmVyPiA9IFswLCA1MDAsIDEwMDAsIDIwMDAsIDUwMDBdOyAvL+inkuiJsuS7t+agvFxuICAgIHB1YmxpYyByb2xlTmFtZXM6IEFycmF5PHN0cmluZz4gPSBbJ+WtpOeLvOeqgeWHu+aJiycsICfng4jnhLDlhYjplIsnLCAn6YeN6KOF56C05Z2P6ICFJywgJ+W5veeBteeLmeWHu+aJiycsICfotZvljZrmjIfmjKXlrpgnXTsgLy/op5LoibLlkI3np7BcbiAgICBcclxuICAgIC8v5ZWG5bqX6YGT5YW35bqT5a2Y55u45YWzXHJcbiAgICBwdWJsaWMgaXRlbVN0b2NrOiBBcnJheTxudW1iZXI+ID0gWzAsIDAsIDBdOyAvL+mBk+WFtzEtM+eahOW6k+WtmFxyXG4gICAgcHVibGljIGl0ZW1TdG9ja0tleTpzdHJpbmcgPSAnSXRlbVN0b2NrJzsgLy/lrZjlgqjpgZPlhbflupPlrZjnmoRrZXlcclxuICAgIFxyXG4gICAgLy/mioDog73ns7vnu5/nm7jlhbNcclxuICAgIHB1YmxpYyBza2lsbHM6IEFycmF5PHtcclxuICAgICAgICBpZDogbnVtYmVyOyAgICAgICAgICAgICAgLy8g5oqA6IO95ZSv5LiASURcclxuICAgICAgICBuYW1lOiBzdHJpbmc7ICAgICAgICAgICAgLy8g5oqA6IO95ZCN56ewXHJcbiAgICAgICAgbGV2ZWw6IG51bWJlcjsgICAgICAgICAgIC8vIOW9k+WJjeaKgOiDveetiee6p1xyXG4gICAgICAgIG1heExldmVsOiBudW1iZXI7ICAgICAgICAvLyDmioDog73mnIDpq5jnrYnnuqdcclxuICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nOyAgICAgLy8g5oqA6IO95o+P6L+wXHJcbiAgICAgICAgaWNvbjogc3RyaW5nOyAgICAgICAgICAgIC8vIOaKgOiDveWbvuagh+i1hOa6kOWQjVxyXG4gICAgICAgIGJhc2VFZmZlY3Q6IG51bWJlcjsgICAgICAvLyDmioDog73ln7rnoYDmlYjmnpzlgLxcclxuICAgICAgICBlZmZlY3RQZXJMZXZlbDogbnVtYmVyOyAgLy8g5q+P57qn5aKe5Yqg55qE5pWI5p6c5YC8XHJcbiAgICAgICAgdXBncmFkZUNvc3Q6IG51bWJlcjsgICAgIC8vIOWIneWni+WNh+e6p+aIkOacrO+8iDHnuqfljYcy57qn55qE5oiQ5pys77yJXHJcbiAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IG51bWJlcjsgLy8g5q+P57qn5Y2H57qn5oiQ5pys5aKe5Yqg6YePXHJcbiAgICB9PiA9IFtdOyAvL+aKgOiDveaVsOaNrlxyXG4gICAgcHVibGljIHNraWxsc0tleTpzdHJpbmcgPSAnU2tpbGxzJzsgLy/lrZjlgqjmioDog73mlbDmja7nmoRrZXlcclxuICAgIFxyXG4gICAgLy/lhbPljaHmqKHlvI/nm7jlhbNcclxuICAgIHB1YmxpYyBpc0luZmluaXRlTW9kZTpib29sZWFuID0gdHJ1ZTsgLy/mmK/lkKbkuLrml6DpmZDmqKHlvI/vvIxmYWxzZeS4uuWFs+WNoeaooeW8j1xyXG4gICAgcHVibGljIGN1cnJlbnRMZXZlbDpudW1iZXIgPSAxOyAvL+W9k+WJjeato+WcqOeOqeeahOWFs+WNoVxyXG4gICAgcHVibGljIHVubG9ja2VkTGV2ZWw6bnVtYmVyID0gMTsgLy/lt7Lnu4/op6PplIHnmoTmnIDpq5jlhbPljaFcclxuICAgIC8v5piv5ZCm6Ieq5Yqo5omT5byA5YWz5Y2h6YCJ5oup55WM6Z2iXHJcbiAgICBwdWJsaWMgc2hvdWxkT3BlbkxldmVsU2VsZWN0OmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgLy8g5YWz5Y2h5pif57qn5pWw5o2uIC0g5a2Y5YKo5q+P5Liq5YWz5Y2h55qE5pyA6auY5pif57qn77yIMC0z5pif77yJXHJcbiAgICBwdWJsaWMgbGV2ZWxTdGFyczogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG4gICAgcHVibGljIGxldmVsU3RhcnNLZXk6c3RyaW5nID0gJ0xldmVsU3RhcnMnOyAvL+WtmOWCqOWFs+WNoeaYn+e6p+eahGtleVxyXG4gICAgXHJcbiAgICAvLyDmianlsZXlhbPljaHliLAxMDDlhbPvvIzpmr7luqbpgJDmuJDlop7liqBcclxuICAgIHB1YmxpYyBsZXZlbFRhcmdldFNjb3JlczpBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgLy8g5YWz5Y2h6YWN572u5pWw57uEXHJcbiAgICBwdWJsaWMgbGV2ZWxDb25maWdzOiBBcnJheTxMZXZlbENvbmZpZz4gPSBbXTtcclxuICAgIFxyXG4vLyDpnZnmgIHlhbPljaHphY3nva7mlbDnu4RcclxucHJpdmF0ZSBzdGF0aWMgTEVWRUxfQ09ORklHUzogTGV2ZWxDb25maWdbXSA9IFtcclxuICAgIHsgbGV2ZWxJZDogMSwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDMwLCBNb25zdGVyOiBbMF0sIG51bTogMTAsIHNwZWVkOiAxfSxcclxuICAgIHsgbGV2ZWxJZDogMiwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDM1LCBNb25zdGVyOiBbMCwxXSwgbnVtOiAxMiwgc3BlZWQ6IDEuMX0sXHJcbiAgICB7IGxldmVsSWQ6IDMsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0MCwgTW9uc3RlcjogWzAsMSwyXSwgbnVtOiAxNCwgc3BlZWQ6IDEuMTV9LFxyXG4gICAgeyBsZXZlbElkOiA0LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDIsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMTYsIHNwZWVkOiAxLjJ9LFxyXG4gICAgeyBsZXZlbElkOiA1LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDMsIE1vbnN0ZXI6IFswLDJdLCBudW06IDE4LCBzcGVlZDogMS4yNX0sXHJcbiAgICB7IGxldmVsSWQ6IDYsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NCwgTW9uc3RlcjogWzEsMl0sIG51bTogMjAsIHNwZWVkOiAxLjN9LFxyXG4gICAgeyBsZXZlbElkOiA3LCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDUsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMjIsIHNwZWVkOiAxLjM1fSxcclxuICAgIHsgbGV2ZWxJZDogOCwgaWNvbjogXCJsZXZlbF8xXCIsIHRpbWU6IDQ1LCBNb25zdGVyOiBbMCwyXSwgbnVtOiAyNCwgc3BlZWQ6IDEuNH0sXHJcbiAgICB7IGxldmVsSWQ6IDksIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NSwgTW9uc3RlcjogWzEsMl0sIG51bTogMjYsIHNwZWVkOiAxLjQ1fSxcclxuICAgIHsgbGV2ZWxJZDogMTAsIGljb246IFwibGV2ZWxfMVwiLCB0aW1lOiA0NSwgTW9uc3RlcjogWzAsMSwyXSwgbnVtOiAyOCwgc3BlZWQ6IDEuNX0sXHJcbiAgICB7IGxldmVsSWQ6IDExLCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDYsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMzAsIHNwZWVkOiAxLjV9LCAgXHJcbiAgICB7IGxldmVsSWQ6IDEyLCBpY29uOiBcImxldmVsXzFcIiwgdGltZTogNDcsIE1vbnN0ZXI6IFswLDEsMl0sIG51bTogMzIsIHNwZWVkOiAxLjU1fSxcclxuICAgIHsgbGV2ZWxJZDogMTMsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OCwgTW9uc3RlcjogWzAsMSwzXSwgbnVtOiAzNCwgc3BlZWQ6IDEuNn0sXHJcbiAgICB7IGxldmVsSWQ6IDE0LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNDgsIE1vbnN0ZXI6IFsyLDNdLCBudW06IDM2LCBzcGVlZDogMS42fSxcclxuICAgIHsgbGV2ZWxJZDogMTUsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OSwgTW9uc3RlcjogWzAsM10sIG51bTogMzgsIHNwZWVkOiAxLjY1fSxcclxuICAgIHsgbGV2ZWxJZDogMTYsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA0OSwgTW9uc3RlcjogWzEsM10sIG51bTogNDAsIHNwZWVkOiAxLjd9LFxyXG4gICAgeyBsZXZlbElkOiAxNywgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUwLCBNb25zdGVyOiBbMCwxLDIsM10sIG51bTogNDIsIHNwZWVkOiAxLjd9LFxyXG4gICAgeyBsZXZlbElkOiAxOCwgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUwLCBNb25zdGVyOiBbMCwyLDNdLCBudW06IDQ0LCBzcGVlZDogMS43NX0sXHJcbiAgICB7IGxldmVsSWQ6IDE5LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTAsIE1vbnN0ZXI6IFsxLDIsM10sIG51bTogNDYsIHNwZWVkOiAxLjc1fSxcclxuICAgIHsgbGV2ZWxJZDogMjAsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA1MCwgTW9uc3RlcjogWzAsMSwzXSwgbnVtOiA0OCwgc3BlZWQ6IDEuOH0sXHJcbiAgICB7IGxldmVsSWQ6IDIxLCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTEsIE1vbnN0ZXI6IFswLDIsM10sIG51bTogNTAsIHNwZWVkOiAxLjh9LFxyXG4gICAgeyBsZXZlbElkOiAyMiwgaWNvbjogXCJsZXZlbF8yXCIsIHRpbWU6IDUyLCBNb25zdGVyOiBbMSwyLDNdLCBudW06IDUyLCBzcGVlZDogMS44fSxcclxuICAgIHsgbGV2ZWxJZDogMjMsIGljb246IFwibGV2ZWxfMlwiLCB0aW1lOiA1MiwgTW9uc3RlcjogWzAsMSwyLDNdLCBudW06IDU0LCBzcGVlZDogMS44NX0sXHJcbiAgICB7IGxldmVsSWQ6IDI0LCBpY29uOiBcImxldmVsXzJcIiwgdGltZTogNTMsIE1vbnN0ZXI6IFswLDEsMiwzXSwgbnVtOiA1Niwgc3BlZWQ6IDEuODV9LFxyXG4gICAgeyBsZXZlbElkOiAyNSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDUzLCBNb25zdGVyOiBbMCw0XSwgbnVtOiA1OCwgc3BlZWQ6IDEuOX0sXHJcbiAgICB7IGxldmVsSWQ6IDI2LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTQsIE1vbnN0ZXI6IFsxLDRdLCBudW06IDYwLCBzcGVlZDogMS45fSxcclxuICAgIHsgbGV2ZWxJZDogMjcsIGljb246IFwibGV2ZWxfM1wiLCB0aW1lOiA1NCwgTW9uc3RlcjogWzIsNF0sIG51bTogNjIsIHNwZWVkOiAxLjl9LFxyXG4gICAgeyBsZXZlbElkOiAyOCwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU1LCBNb25zdGVyOiBbMyw0XSwgbnVtOiA2NCwgc3BlZWQ6IDEuOX0sXHJcbiAgICB7IGxldmVsSWQ6IDI5LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTUsIE1vbnN0ZXI6IFswLDEsNF0sIG51bTogNjYsIHNwZWVkOiAxLjk1fSxcclxuICAgIHsgbGV2ZWxJZDogMzAsIGljb246IFwibGV2ZWxfM1wiLCB0aW1lOiA1NSwgTW9uc3RlcjogWzAsMiw0XSwgbnVtOiA2OCwgc3BlZWQ6IDEuOTV9LFxyXG4gICAgeyBsZXZlbElkOiAzMSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU2LCBNb25zdGVyOiBbMSwzLDRdLCBudW06IDcwLCBzcGVlZDogMS45NX0sXHJcbiAgICB7IGxldmVsSWQ6IDMyLCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTcsIE1vbnN0ZXI6IFswLDEsMiw0XSwgbnVtOiA3Miwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzMywgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU3LCBNb25zdGVyOiBbMCwzLDRdLCBudW06IDc0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDM0LCBpY29uOiBcImxldmVsXzNcIiwgdGltZTogNTgsIE1vbnN0ZXI6IFsxLDIsMyw0XSwgbnVtOiA3Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNSwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU4LCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA3OCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNiwgaWNvbjogXCJsZXZlbF8zXCIsIHRpbWU6IDU5LCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA4MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiAzNywgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDU5LCBNb25zdGVyOiBbMCwyLDMsNF0sIG51bTogODIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogMzgsIGljb246IFwibGV2ZWxfNFwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzEsMiwzLDRdLCBudW06IDg0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDM5LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMyw0XSwgbnVtOiA4Niwgc3BlZWQ6IDJ9LCAgXHJcbiAgICB7IGxldmVsSWQ6IDQwLCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDg4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQxLCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiw0XSwgbnVtOiA5MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0MiwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwyLDMsNF0sIG51bTogOTIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNDMsIGljb246IFwibGV2ZWxfNFwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMyw0XSwgbnVtOiA5NCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0NCwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiA5Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0NSwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMiwzLDRdLCBudW06IDk4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQ2LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsNF0sIG51bTogMTAwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDQ3LCBpY29uOiBcImxldmVsXzRcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEwMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0OCwgaWNvbjogXCJsZXZlbF80XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwzLDRdLCBudW06IDEwNCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA0OSwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwyLDMsNF0sIG51bTogMTA2LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDUwLCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEwOCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MSwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMSwyLDRdLCBudW06IDExMCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MiwgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwzLDRdLCBudW06IDExMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA1MywgaWNvbjogXCJsZXZlbF81XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxMTQsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTQsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzIsMyw0XSwgbnVtOiAxMTYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTUsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSw0XSwgbnVtOiAxMTgsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTYsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTIwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDU3LCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFsxLDIsMyw0XSwgbnVtOiAxMjIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNTgsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTI0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDU5LCBpY29uOiBcImxldmVsXzVcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDIsMyw0XSwgbnVtOiAxMjYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjAsIGljb246IFwibGV2ZWxfNVwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTMwLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDYxLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEzMiwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2MiwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxMzQsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjMsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTM2LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDY0LCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDEzOCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2NSwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNDAsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjYsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTQyLCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDY3LCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE0NCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA2OCwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNDYsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNjksIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTQ4LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDcwLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE1MCwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA3MSwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNTIsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNzIsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTU0LCBzcGVlZDogMn0sXHJcbiAgICB7IGxldmVsSWQ6IDczLCBpY29uOiBcImxldmVsXzZcIiwgdGltZTogNjAsIE1vbnN0ZXI6IFswLDEsMiwzLDRdLCBudW06IDE1Niwgc3BlZWQ6IDJ9LFxyXG4gICAgeyBsZXZlbElkOiA3NCwgaWNvbjogXCJsZXZlbF82XCIsIHRpbWU6IDYwLCBNb25zdGVyOiBbMCwxLDIsMyw0XSwgbnVtOiAxNTgsIHNwZWVkOiAyfSxcclxuICAgIHsgbGV2ZWxJZDogNzUsIGljb246IFwibGV2ZWxfNlwiLCB0aW1lOiA2MCwgTW9uc3RlcjogWzAsMSwyLDMsNF0sIG51bTogMTYwLCBzcGVlZDogMn0sXHJcbl07XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyDliqDovb3pn7PpopHlvIDlhbPnirbmgIFcbiAgICAgICAgdGhpcy5HZXRCR01PbkRhdGEoKTtcbiAgICAgICAgLy8g5Yqg6L296Z+z5pWI5byA5YWz54q25oCBXG4gICAgICAgIHRoaXMuR2V0U291bmRPbkRhdGEoKTtcbiAgICAgICAgLy8g5Yqg6L295b2T5YmN6YCJ5Lit6KeS6ImyXG4gICAgICAgIHRoaXMuR2V0Q3VycmVudFJvbGVEYXRhKCk7XG4gICAgICAgIC8vIOWKoOi9vemSu+efs+aVsOaNrlxuICAgICAgICB0aGlzLkdldEdvbGREYXRhKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnN1cmVMZWdhY3lMZXZlbENvbmZpZ3MoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmxldmVsQ29uZmlncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sZXZlbENvbmZpZ3MgPSBbLi4uR2FtZURhdGEuTEVWRUxfQ09ORklHU107XG4gICAgfVxuXHJcblxyXG4gICAgcHVibGljIGN1cnJlbnRMZXZlbEtleTpzdHJpbmcgPSAnQ3VycmVudExldmVsJzsgLy/lrZjlgqjlvZPliY3lhbPljaHnmoRrZXlcclxuICAgIHB1YmxpYyB1bmxvY2tlZExldmVsS2V5OnN0cmluZyA9ICdVbmxvY2tlZExldmVsJzsgLy/lrZjlgqjlt7Lop6PplIHlhbPljaHnmoRrZXlcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3nlKjmiLdJRFxyXG4gICAgICogQHJldHVybnMg55So5oi3SUTvvIzlpoLmnpzmsqHmnInnmbvlvZXov5Tlm55udWxsXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog55Sf5oiQ5bim55So5oi3SUTlkI7nvIDnmoTlrZjlgqhrZXlcclxuICAgICAqIEBwYXJhbSBiYXNlS2V5IOWfuuehgGtleVxyXG4gICAgICogQHJldHVybnMg5bim55So5oi3SUTlkI7nvIDnmoRrZXlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBpZiAodXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZUtleTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNldERhdGEoKXtcclxuICAgICAgICAvLyDlrZjlgqjpn7PpopHlvIDlhbPnirbmgIFcclxuICAgICAgICB0aGlzLlNhdmVCR01PbkRhdGEoKTtcclxuICAgICAgICAvLyDlrZjlgqjpn7PmlYjlvIDlhbPnirbmgIFcclxuICAgICAgICB0aGlzLlNhdmVTb3VuZE9uRGF0YSgpO1xyXG4gICAgICAgIC8vIOWtmOWCqOinkuiJsuino+mUgeeKtuaAgVxyXG4gICAgICAgIHRoaXMuU2F2ZVVubG9ja2VkUm9sZXNEYXRhKCk7XHJcbiAgICAgICAgLy8g5a2Y5YKo5b2T5YmN6YCJ5Lit6KeS6ImyXHJcbiAgICAgICAgdGhpcy5TYXZlQ3VycmVudFJvbGVEYXRhKCk7XHJcbiAgICAgICAgLy8g5a2Y5YKo5oqA6IO95pWw5o2uXHJcbiAgICAgICAgdGhpcy5TYXZlU2tpbGxzRGF0YSgpO1xyXG4gICAgICAgIGlmKGNjLnN5cy5wbGF0Zm9ybSAhPSBjYy5zeXMuV0VDSEFUX0dBTUUpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBiZXN0U2NvcmVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5CZXN0U2NvcmVLZXkpO1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS53eC5zZXRTdG9yYWdlKHtcclxuICAgICAgICAgICAga2V5OmJlc3RTY29yZUtleSxcclxuICAgICAgICAgICAgZGF0YTp0aGlzLkJlc3RTY29yZSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLnd4LnNldFVzZXJDbG91ZFN0b3JhZ2Uoe1xyXG4gICAgICAgICAgICBLVkRhdGFMaXN0OiBbeyBrZXk6ICcxJywgdmFsdWU6bUdhbWVEYXRhLkJlc3RTY29yZS50b1N0cmluZygpfV0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5a2Y5YKo5L2T5Yqb5pWw5o2uXHJcbiAgICAgICAgdGhpcy5TYXZlU3RhbWluYURhdGEoKTtcclxuICAgICAgICAvLyDlrZjlgqjlhbPljaHmlbDmja5cclxuICAgICAgICB0aGlzLlNhdmVMZXZlbERhdGEoKTtcclxuICAgICAgICAvLyDlrZjlgqjpkrvnn7PmlbDmja5cclxuICAgICAgICB0aGlzLlNhdmVHb2xkRGF0YSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOWtmOWCqOS9k+WKm+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBTYXZlU3RhbWluYURhdGEoKXtcclxuICAgICAgICAvLyDkvb/nlKhDb2NvcyBDcmVhdG9y55qE5pys5Zyw5a2Y5YKo5o6l5Y+j5pu/5Luj5b6u5L+h5o6l5Y+jXHJcbiAgICAgICAgY29uc3Qgc3RhbWluYUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnN0YW1pbmFLZXkpO1xyXG4gICAgICAgIGNvbnN0IGxhc3RSZWNvdmVyVGltZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmxhc3RSZWNvdmVyVGltZUtleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0YW1pbmFLZXksIHRoaXMuY3VycmVudFN0YW1pbmEudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGxhc3RSZWNvdmVyVGltZUtleSwgdGhpcy5sYXN0UmVjb3ZlclRpbWUudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE5L2T5Yqb5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldFN0YW1pbmFEYXRhKCl7XHJcbiAgICAgICAgLy8g5L2/55SoQ29jb3MgQ3JlYXRvcueahOacrOWcsOWtmOWCqOaOpeWPo+abv+S7o+W+ruS/oeaOpeWPo1xyXG4gICAgICAgIGNvbnN0IHN0YW1pbmFLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5zdGFtaW5hS2V5KTtcclxuICAgICAgICBjb25zdCBsYXN0UmVjb3ZlclRpbWVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sYXN0UmVjb3ZlclRpbWVLZXkpO1xyXG4gICAgICAgIGNvbnN0IHN0YW1pbmFTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RhbWluYUtleSk7XHJcbiAgICAgICAgaWYgKHN0YW1pbmFTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhbWluYSA9IHBhcnNlSW50KHN0YW1pbmFTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieaVsOaNru+8jOmHjee9ruS4uua7oeS9k+WKm1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFtaW5hID0gdGhpcy5tYXhTdGFtaW5hO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBsYXN0UmVjb3ZlclRpbWVTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0obGFzdFJlY292ZXJUaW1lS2V5KTtcclxuICAgICAgICBpZiAobGFzdFJlY292ZXJUaW1lU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFJlY292ZXJUaW1lID0gcGFyc2VJbnQobGFzdFJlY292ZXJUaW1lU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInmlbDmja7vvIzph43nva7kuLrlvZPliY3ml7bpl7RcclxuICAgICAgICAgICAgdGhpcy5sYXN0UmVjb3ZlclRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjpkrvnn7PmlbDmja5cclxuICAgICAqL1xyXG4gICAgU2F2ZUdvbGREYXRhKCl7XHJcbiAgICAgICAgLy8g5L2/55SoQ29jb3MgQ3JlYXRvcueahOacrOWcsOWtmOWCqOaOpeWPo+S/neWtmOmSu+efs+aVsOaNrlxyXG4gICAgICAgIGNvbnN0IGdvbGRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5nb2xkS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oZ29sZEtleSwgdGhpcy5jdXJyZW50R29sZC50b1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDkv53lrZjntK/orqHojrflvpfpkrvnn7PmlbDmja5cclxuICAgICAgICBjb25zdCB0b3RhbEdvbGRFYXJuZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy50b3RhbEdvbGRFYXJuZWRLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0b3RhbEdvbGRFYXJuZWRLZXksIHRoaXMudG90YWxHb2xkRWFybmVkLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOmSu+efs+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBHZXRHb2xkRGF0YSgpe1xyXG4gICAgICAgIC8vIOS9v+eUqENvY29zIENyZWF0b3LnmoTmnKzlnLDlrZjlgqjmjqXlj6PliqDovb3pkrvnn7PmlbDmja5cclxuICAgICAgICBjb25zdCBnb2xkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZ29sZEtleSk7XHJcbiAgICAgICAgLy8g5YWI5qOA5p+l55So5oi3SUTmmK/lkKbmraPnoa7ojrflj5ZcclxuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIGNvbnN0IGdvbGRTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oZ29sZEtleSk7XHJcbiAgICAgICAgaWYgKGdvbGRTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50R29sZCA9IHBhcnNlSW50KGdvbGRTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieaVsOaNru+8jOmHjee9ruS4uuWIneWni+WAvDIwMDAwXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEdvbGQgPSAwO1xyXG4gICAgICAgICAgICAvLyDlkIzml7blsJ3or5Xor7vlj5bkuI3luKbnlKjmiLdJROeahGtleVxyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0R29sZEtleSA9ICdDdXJyZW50R29sZCc7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRHb2xkU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGRlZmF1bHRHb2xkS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yqg6L2957Sv6K6h6I635b6X6ZK755+z5pWw5o2uXHJcbiAgICAgICAgY29uc3QgdG90YWxHb2xkRWFybmVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMudG90YWxHb2xkRWFybmVkS2V5KTtcclxuICAgICAgICBjb25zdCB0b3RhbEdvbGRFYXJuZWRTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odG90YWxHb2xkRWFybmVkS2V5KTtcclxuICAgICAgICBpZiAodG90YWxHb2xkRWFybmVkU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxHb2xkRWFybmVkID0gcGFyc2VJbnQodG90YWxHb2xkRWFybmVkU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsR29sZEVhcm5lZCA9IHRoaXMuY3VycmVudEdvbGQ7IC8vIOWmguaenOayoeaciee0r+iuoeaVsOaNru+8jOWIneWni+WMluS4uuW9k+WJjemSu+efs+aVsFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDpkrvnn7PvvIjlkIzml7bmm7TmlrDntK/orqHojrflvpfpkrvnn7PvvIlcclxuICAgICAqIEBwYXJhbSBhbW91bnQg6ZK755+z5pWw6YePXHJcbiAgICAgKi9cclxuICAgIGFkZEdvbGQoYW1vdW50OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRHb2xkICs9IGFtb3VudDtcclxuICAgICAgICB0aGlzLnRvdGFsR29sZEVhcm5lZCArPSBhbW91bnQ7XHJcbiAgICAgICAgdGhpcy5TYXZlR29sZERhdGEoKTtcclxuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KCdnb2xkVXBkYXRlZCcpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjpgZPlhbflupPlrZjmlbDmja5cclxuICAgICAqL1xyXG4gICAgU2F2ZUl0ZW1TdG9ja0RhdGEoKXtcbiAgICAgICAgLy8g5L2/55SoQ29jb3MgQ3JlYXRvcueahOacrOWcsOWtmOWCqOaOpeWPo+S/neWtmOmBk+WFt+W6k+WtmOaVsOaNrlxuICAgICAgICBjb25zdCBpdGVtU3RvY2tLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5pdGVtU3RvY2tLZXkpO1xuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oaXRlbVN0b2NrS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLml0ZW1TdG9jaykpO1xuICAgIH1cbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE6YGT5YW35bqT5a2Y5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldEl0ZW1TdG9ja0RhdGEoKXtcclxuICAgICAgICAvLyDkvb/nlKhDb2NvcyBDcmVhdG9y55qE5pys5Zyw5a2Y5YKo5o6l5Y+j5Yqg6L296YGT5YW35bqT5a2Y5pWw5o2uXHJcbiAgICAgICAgY29uc3QgaXRlbVN0b2NrS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuaXRlbVN0b2NrS2V5KTtcclxuICAgICAgICBjb25zdCBpdGVtU3RvY2tTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oaXRlbVN0b2NrS2V5KTtcclxuICAgICAgICBpZiAoaXRlbVN0b2NrU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbVN0b2NrID0gSlNPTi5wYXJzZShpdGVtU3RvY2tTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieaVsOaNru+8jOmHjee9ruS4uuWIneWni+WAvFxyXG4gICAgICAgICAgICB0aGlzLml0ZW1TdG9jayA9IFswLCAwLCAwXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5oyH5a6a6YGT5YW355qE5bqT5a2YXHJcbiAgICAgKiBAcGFyYW0gaXRlbUlkIOmBk+WFt0lEICgxLTMpXHJcbiAgICAgKiBAcmV0dXJucyDpgZPlhbflupPlrZjmlbDph49cclxuICAgICAqL1xyXG4gICAgZ2V0SXRlbVN0b2NrKGl0ZW1JZDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IGl0ZW1JZCAtIDE7XHJcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLml0ZW1TdG9jay5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXRlbVN0b2NrW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5aKe5Yqg5oyH5a6a6YGT5YW355qE5bqT5a2YXHJcbiAgICAgKiBAcGFyYW0gaXRlbUlkIOmBk+WFt0lEICgxLTMpXHJcbiAgICAgKiBAcGFyYW0gY291bnQg5aKe5Yqg55qE5pWw6YePXHJcbiAgICAgKi9cclxuICAgIGFkZEl0ZW1TdG9jayhpdGVtSWQ6IG51bWJlciwgY291bnQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gaXRlbUlkIC0gMTtcclxuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuaXRlbVN0b2NrLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1TdG9ja1tpbmRleF0gKz0gY291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZUl0ZW1TdG9ja0RhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5YeP5bCR5oyH5a6a6YGT5YW355qE5bqT5a2YXHJcbiAgICAgKiBAcGFyYW0gaXRlbUlkIOmBk+WFt0lEICgxLTMpXHJcbiAgICAgKiBAcGFyYW0gY291bnQg5YeP5bCR55qE5pWw6YePXHJcbiAgICAgKiBAcmV0dXJucyDmmK/lkKbmiJDlip/lh4/lsJFcclxuICAgICAqL1xyXG4gICAgcmVkdWNlSXRlbVN0b2NrKGl0ZW1JZDogbnVtYmVyLCBjb3VudDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBpdGVtSWQgLSAxO1xyXG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5pdGVtU3RvY2subGVuZ3RoICYmIHRoaXMuaXRlbVN0b2NrW2luZGV4XSA+PSBjb3VudCkge1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1TdG9ja1tpbmRleF0gLT0gY291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZUl0ZW1TdG9ja0RhdGEoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjpn7PpopHlvIDlhbPnirbmgIFcclxuICAgICAqL1xyXG4gICAgU2F2ZUJHTU9uRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgaXNCR01PbktleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmlzQkdNT25LZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShpc0JHTU9uS2V5LCB0aGlzLmlzQkdNT24udG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE6Z+z6aKR5byA5YWz54q25oCBXHJcbiAgICAgKi9cclxuICAgIEdldEJHTU9uRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgaXNCR01PbktleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmlzQkdNT25LZXkpO1xyXG4gICAgICAgIGNvbnN0IGlzQkdNT25TdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oaXNCR01PbktleSk7XHJcbiAgICAgICAgaWYgKGlzQkdNT25TdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5pc0JHTU9uID0gaXNCR01PblN0ciA9PT0gJ3RydWUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNCR01PbiA9IHRydWU7IC8vIOm7mOiupOW8gOWQr1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlrZjlgqjpn7PmlYjlvIDlhbPnirbmgIFcclxuICAgICAqL1xyXG4gICAgU2F2ZVNvdW5kT25EYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBpc1NvdW5kT25LZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5pc1NvdW5kT25LZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShpc1NvdW5kT25LZXksIHRoaXMuaXNTb3VuZE9uLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOmfs+aViOW8gOWFs+eKtuaAgVxyXG4gICAgICovXHJcbiAgICBHZXRTb3VuZE9uRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgaXNTb3VuZE9uS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuaXNTb3VuZE9uS2V5KTtcclxuICAgICAgICBjb25zdCBpc1NvdW5kT25TdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oaXNTb3VuZE9uS2V5KTtcclxuICAgICAgICBpZiAoaXNTb3VuZE9uU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTb3VuZE9uID0gaXNTb3VuZE9uU3RyID09PSAndHJ1ZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pc1NvdW5kT24gPSB0cnVlOyAvLyDpu5jorqTlvIDlkK9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo6KeS6Imy6Kej6ZSB54q25oCBXHJcbiAgICAgKi9cclxuICAgIFNhdmVVbmxvY2tlZFJvbGVzRGF0YSgpeyAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdW5sb2NrZWRSb2xlc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnVubG9ja2VkUm9sZXNLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1bmxvY2tlZFJvbGVzS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLnVubG9ja2VkUm9sZXMpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTop5LoibLop6PplIHnirbmgIFcclxuICAgICAqL1xyXG4gICAgR2V0VW5sb2NrZWRSb2xlc0RhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHVubG9ja2VkUm9sZXNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy51bmxvY2tlZFJvbGVzS2V5KTtcclxuICAgICAgICBjb25zdCB1bmxvY2tlZFJvbGVzU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHVubG9ja2VkUm9sZXNLZXkpO1xyXG4gICAgICAgIGlmICh1bmxvY2tlZFJvbGVzU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5sb2NrZWRSb2xlcyA9IEpTT04ucGFyc2UodW5sb2NrZWRSb2xlc1N0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51bmxvY2tlZFJvbGVzID0gW3RydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTsgLy8g6buY6K6k6Kej6ZSB56ys5LiA5Liq6KeS6ImyXHJcbiAgICAgICAgICAgIC8vIOmmluasoei/kOihjOaXtuS/neWtmOm7mOiupOWAvFxyXG4gICAgICAgICAgICB0aGlzLlNhdmVVbmxvY2tlZFJvbGVzRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygn5Yqg6L296KeS6Imy6Kej6ZSB54q25oCBOicsIHRoaXMudW5sb2NrZWRSb2xlcyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo5b2T5YmN6YCJ5Lit6KeS6ImyXHJcbiAgICAgKi9cclxuICAgIFNhdmVDdXJyZW50Um9sZURhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSb2xlS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuY3VycmVudFJvbGVLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShjdXJyZW50Um9sZUtleSwgdGhpcy5jdXJyZW50Um9sZS50b1N0cmluZygpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blrZjlgqjnmoTlvZPliY3pgInkuK3op5LoibJcclxuICAgICAqL1xyXG4gICAgR2V0Q3VycmVudFJvbGVEYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBjdXJyZW50Um9sZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmN1cnJlbnRSb2xlS2V5KTtcclxuICAgICAgICBjb25zdCBjdXJyZW50Um9sZVN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShjdXJyZW50Um9sZUtleSk7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRSb2xlU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJvbGUgPSBwYXJzZUludChjdXJyZW50Um9sZVN0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Um9sZSA9IDA7IC8vIOm7mOiupOmAieS4reesrOS4gOS4quinkuiJslxyXG4gICAgICAgICAgICAvLyDpppbmrKHov5DooYzml7bkv53lrZjpu5jorqTlgLxcclxuICAgICAgICAgICAgdGhpcy5TYXZlQ3VycmVudFJvbGVEYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCfliqDovb3lvZPliY3pgInkuK3op5LoibI6JywgdGhpcy5jdXJyZW50Um9sZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo5oqA6IO95pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNhdmVTa2lsbHNEYXRhKCl7ICAgICAgICBcclxuICAgICAgICBjb25zdCBza2lsbHNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5za2lsbHNLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShza2lsbHNLZXksIEpTT04uc3RyaW5naWZ5KHRoaXMuc2tpbGxzKSk7XHJcbiAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a2Y5YKo55qE5oqA6IO95pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEdldFNraWxsc0RhdGEoKXsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHNraWxsc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnNraWxsc0tleSk7XHJcbiAgICAgICAgY29uc3Qgc2tpbGxzU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHNraWxsc0tleSk7XHJcbiAgICAgICAgaWYgKHNraWxsc1N0cikge1xyXG4gICAgICAgICAgICB0aGlzLnNraWxscyA9IEpTT04ucGFyc2Uoc2tpbGxzU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInmlbDmja7vvIzkvb/nlKjpu5jorqTmioDog73mlbDmja5cclxuICAgICAgICAgICAgdGhpcy5za2lsbHMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ+aZrumAmuWvvOW8uScsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4TGV2ZWw6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5LiA6aKX5LiA6aKX5Y+R5bCEJyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnamluZW5nMScsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVmZmVjdDogMSxcclxuICAgICAgICAgICAgICAgICAgICBlZmZlY3RQZXJMZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICB1cGdyYWRlQ29zdDogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3RJbmNyZWFzZVBlckxldmVsOiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICflr5LlhrDlr7zlvLknLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heExldmVsOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ+mbhue+pOWPkeWwhCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ppbmVuZzInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFZmZlY3Q6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZUNvc3Q6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0SW5jcmVhc2VQZXJMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogMyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn6Ziy5oqk6ZKi5p2/JyxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhMZXZlbDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfpmLLmiqTlipsrMycsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ppbmVuZzMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFZmZlY3Q6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZUNvc3Q6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0SW5jcmVhc2VQZXJMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogNCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn56m/55Sy5by5JyxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhMZXZlbDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmlLvlh7vlipsrMScsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ppbmVuZzQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFZmZlY3Q6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgdXBncmFkZUNvc3Q6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0SW5jcmVhc2VQZXJMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogNSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAn5qC45by5JyxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhMZXZlbDogMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmr4Hnga3mgKfkvKTlrrMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdqaW5lbmc1JyxcclxuICAgICAgICAgICAgICAgICAgICBiYXNlRWZmZWN0OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdFBlckxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVDb3N0OiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IDYsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ+iDvemHj+aKpOebvicsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4TGV2ZWw6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn5pe26Ze0KzHnp5InLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdqaW5lbmc2JyxcclxuICAgICAgICAgICAgICAgICAgICBiYXNlRWZmZWN0OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdFBlckxldmVsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVDb3N0OiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgLy8g6aaW5qyh6L+Q6KGM5pe25L+d5a2Y6buY6K6k5YC8XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZVNraWxsc0RhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+WKoOi9veaKgOiDveaVsOaNrjonLCB0aGlzLnNraWxscyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5a2Y5YKo5YWz5Y2h5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIFNhdmVMZXZlbERhdGEoKXtcclxuICAgICAgICBjb25zdCBjdXJyZW50TGV2ZWxLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5jdXJyZW50TGV2ZWxLZXkpO1xyXG4gICAgICAgIGNvbnN0IHVubG9ja2VkTGV2ZWxLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy51bmxvY2tlZExldmVsS2V5KTtcclxuICAgICAgICBjb25zdCBsZXZlbFN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGV2ZWxTdGFyc0tleSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGN1cnJlbnRMZXZlbEtleSwgdGhpcy5jdXJyZW50TGV2ZWwudG9TdHJpbmcoKSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1bmxvY2tlZExldmVsS2V5LCB0aGlzLnVubG9ja2VkTGV2ZWwudG9TdHJpbmcoKSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShsZXZlbFN0YXJzS2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLmxldmVsU3RhcnMpKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCflhbPljaHmlbDmja7lt7Lkv53lrZjvvJrlvZPliY3lhbPljaE9JywgdGhpcy5jdXJyZW50TGV2ZWwsICflt7Lop6PplIHlhbPljaE9JywgdGhpcy51bmxvY2tlZExldmVsKTtcbiAgICB9XG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluWtmOWCqOeahOWFs+WNoeaVsOaNrlxyXG4gICAgICovXHJcbiAgICBHZXRMZXZlbERhdGEoKXtcclxuICAgICAgICBjb25zdCBjdXJyZW50TGV2ZWxLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5jdXJyZW50TGV2ZWxLZXkpO1xyXG4gICAgICAgIGNvbnN0IHVubG9ja2VkTGV2ZWxLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy51bmxvY2tlZExldmVsS2V5KTtcclxuICAgICAgICBjb25zdCBsZXZlbFN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGV2ZWxTdGFyc0tleSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5Yqg6L295b2T5YmN5YWz5Y2hXHJcbiAgICAgICAgY29uc3QgbGV2ZWxTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oY3VycmVudExldmVsS2V5KTtcclxuICAgICAgICBpZiAobGV2ZWxTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TGV2ZWwgPSBwYXJzZUludChsZXZlbFN0cik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TGV2ZWwgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDliqDovb3lt7Lop6PplIHlhbPljaFcclxuICAgICAgICBjb25zdCB1bmxvY2tlZExldmVsU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHVubG9ja2VkTGV2ZWxLZXkpO1xyXG4gICAgICAgIGlmICh1bmxvY2tlZExldmVsU3RyKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5sb2NrZWRMZXZlbCA9IHBhcnNlSW50KHVubG9ja2VkTGV2ZWxTdHIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5sb2NrZWRMZXZlbCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWKoOi9veWFs+WNoeaYn+e6p+aVsOaNrlxyXG4gICAgICAgIGNvbnN0IGxldmVsU3RhcnNTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0obGV2ZWxTdGFyc0tleSk7XHJcbiAgICAgICAgaWYgKGxldmVsU3RhcnNTdHIpIHtcclxuICAgICAgICAgICAgdGhpcy5sZXZlbFN0YXJzID0gSlNPTi5wYXJzZShsZXZlbFN0YXJzU3RyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsU3RhcnMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+S7juacrOWcsOWKoOi9veWFs+WNoeaVsOaNru+8muW9k+WJjeWFs+WNoT0nLCB0aGlzLmN1cnJlbnRMZXZlbCwgJ+W3suino+mUgeWFs+WNoT0nLCB0aGlzLnVubG9ja2VkTGV2ZWwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOa2iOiAl+S4gOeCueS9k+WKm1xyXG4gICAgICogQHJldHVybnMg5piv5ZCm5oiQ5Yqf5raI6ICXXHJcbiAgICAgKi9cclxuICAgIENvbnN1bWVTdGFtaW5hKCk6Ym9vbGVhbntcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRTdGFtaW5hID4gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YW1pbmEtLTtcclxuICAgICAgICAgICAgdGhpcy5TYXZlU3RhbWluYURhdGEoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XlubbmgaLlpI3kvZPliptcclxuICAgICAqL1xyXG4gICAgQ2hlY2tBbmRSZWNvdmVyU3RhbWluYSgpe1xyXG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgY29uc3QgdGltZURpZmYgPSBub3cgLSB0aGlzLmxhc3RSZWNvdmVyVGltZTtcclxuICAgICAgICBjb25zdCByZWNvdmVySW50ZXJ2YWwgPSAxMCAqIDYwICogMTAwMDsgLy8gMTDliIbpkp/vvIzljZXkvY3mr6vnp5JcclxuICAgICAgICBcclxuICAgICAgICAvLyDorqHnrpflupTor6XmgaLlpI3nmoTkvZPlipvngrnmlbBcclxuICAgICAgICBjb25zdCByZWNvdmVyUG9pbnRzID0gTWF0aC5mbG9vcih0aW1lRGlmZiAvIHJlY292ZXJJbnRlcnZhbCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYocmVjb3ZlclBvaW50cyA+IDApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFtaW5hID0gTWF0aC5taW4odGhpcy5tYXhTdGFtaW5hLCB0aGlzLmN1cnJlbnRTdGFtaW5hICsgcmVjb3ZlclBvaW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFJlY292ZXJUaW1lICs9IHJlY292ZXJQb2ludHMgKiByZWNvdmVySW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZVN0YW1pbmFEYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeaYr+WQpuaciei2s+Wkn+eahOS9k+WKm+W8gOWni+a4uOaIj1xyXG4gICAgICogQHJldHVybnMg5piv5ZCm5pyJ6Laz5aSf5L2T5YqbXHJcbiAgICAgKi9cclxuICAgIEhhc0Vub3VnaFN0YW1pbmEoKTpib29sZWFue1xyXG4gICAgICAgIHRoaXMuQ2hlY2tBbmRSZWNvdmVyU3RhbWluYSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGFtaW5hID4gMDtcclxuICAgICAgICAvLyByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiuoeeul+i3neemu+S4i+asoeaBouWkjeS9k+WKm+eahOWJqeS9meaXtumXtO+8iOavq+enku+8iVxyXG4gICAgICogQHJldHVybnMg5Ymp5L2Z5pe26Ze077yI5q+r56eS77yJ77yM5aaC5p6c5L2T5Yqb5bey5ruh5YiZ6L+U5ZueMFxyXG4gICAgICovXHJcbiAgICBHZXRSZW1haW5pbmdSZWNvdmVyVGltZSgpOm51bWJlcntcclxuICAgICAgICAvLyDlpoLmnpzkvZPlipvlt7Lmu6HvvIzkuI3pnIDopoHmgaLlpI1cclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRTdGFtaW5hID49IHRoaXMubWF4U3RhbWluYSl7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gbm93IC0gdGhpcy5sYXN0UmVjb3ZlclRpbWU7XHJcbiAgICAgICAgY29uc3QgcmVjb3ZlckludGVydmFsID0gMTAgKiA2MCAqIDEwMDA7IC8vIDEw5YiG6ZKf77yM5Y2V5L2N5q+r56eSXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6K6h566X6Led56a75LiL5qyh5oGi5aSN55qE5Ymp5L2Z5pe26Ze0XHJcbiAgICAgICAgY29uc3QgcmVtYWluaW5nVGltZSA9IHJlY292ZXJJbnRlcnZhbCAtICh0aW1lRGlmZiAlIHJlY292ZXJJbnRlcnZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHJlbWFpbmluZ1RpbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5qC85byP5YyW55qE5oGi5aSN5YCS6K6h5pe25a2X56ym5LiyXHJcbiAgICAgKiBAcmV0dXJucyDmoLzlvI/ljJbnmoTml7bpl7TlrZfnrKbkuLLvvIhNTTpTU++8ie+8jOWmguaenOS9k+WKm+W3sua7oeWImei/lOWbnuepuuWtl+espuS4slxyXG4gICAgICovXHJcbiAgICBHZXRGb3JtYXR0ZWRSZWNvdmVyVGltZSgpOnN0cmluZ3tcclxuICAgICAgICBjb25zdCByZW1haW5pbmdUaW1lID0gdGhpcy5HZXRSZW1haW5pbmdSZWNvdmVyVGltZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHJlbWFpbmluZ1RpbWUgPD0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDovazmjaLkuLrliIbpkp/lkoznp5JcclxuICAgICAgICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihyZW1haW5pbmdUaW1lIC8gKDYwICogMTAwMCkpO1xyXG4gICAgICAgIGNvbnN0IHNlY29uZHMgPSBNYXRoLmZsb29yKChyZW1haW5pbmdUaW1lICUgKDYwICogMTAwMCkpIC8gMTAwMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5qC85byP5YyW5Li6TU06U1PmoLzlvI9cclxuICAgICAgICByZXR1cm4gYCR7bWludXRlcy50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7c2Vjb25kcy50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9YDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6K6w5b2VYnVmZuaVsOaNrlxyXG4gICAgICogQHBhcmFtIHNlbGYgXHJcbiAgICAgKi9cclxuICAgIGluaXRCdWZmenUoc2VsZil7XHJcbiAgICAgICAgdGhpcy5idWZmVHVqaVswXT0tMTtcclxuICAgICAgICB0aGlzLmJ1ZmZUdWppWzFdPS0xO1xyXG4gICAgICAgIHRoaXMuYnVmZlR1amlbMl09LTE7XHJcbiAgICAgICAgaWYgKHRoaXMuYnVmZlR1amlbMF0gPT0gLTEpIHtcclxuICAgICAgICAgICAgc2VsZi5TcHIxLnNwcml0ZUZyYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgc2VsZi5TcHIyLnNwcml0ZUZyYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgc2VsZi5TcHIzLnNwcml0ZUZyYW1lID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoGJ1ZmbmlbDmja5cclxuICAgICAqIEBwYXJhbSBudW0gXHJcbiAgICAgKiBAcGFyYW0gc2VsZiBcclxuICAgICAqL1xyXG4gICAgYWRkQnVmZk51bShudW06YW55LHNlbGY6YW55KXtcclxuICAgICAgICB2YXIgbnVtMCA9IHRoaXMuYnVmZlR1amlbMF07XHJcbiAgICAgICAgdmFyIG51bTEgPSB0aGlzLmJ1ZmZUdWppWzFdO1xyXG4gICAgICAgIGlmIChudW0xID4gLTEpIHtcclxuICAgICAgICAgICAgaWYgKG51bTEgPT0gbnVtKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZUdWppWzJdID0gbnVtO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmVHVqaVsxXSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmVHVqaVswXSA9IG51bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChudW0wID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChudW0wID09IG51bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZlR1amlbMV0gPSBudW07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZlR1amlbMF0gPSBudW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZUdWppWzBdID0gbnVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2hlY2tCdWZmKHNlbGYpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XmmK/lkKbmu6HotrNidWZmZXJcclxuICAgICAqIEBwYXJhbSBzZWxmIFxyXG4gICAgICovXHJcbiAgICBjaGVja0J1ZmYoc2VsZikge1xyXG4gICAgICAgIHZhciBudW0gPSB0aGlzLmJ1ZmZUdWppWzJdO1xyXG4gICAgICAgIGlmIChudW0gPT0gLTEpIHJldHVybjtcclxuICAgICAgICBzd2l0Y2ggKG51bSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmYxKHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5QbGF5QnVmZkF1ZGlvKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiBpbml0QnVmZnp1KHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZjIoc2VsZik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLlBsYXlCdWZmQXVkaW8oKTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLiBpbml0QnVmZnp1KHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZjMoc2VsZik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLlBsYXlCdWZmQXVkaW8oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEJ1ZmZ6dShzZWxmKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgYnVmZjEoc2VsZil7XHJcbiAgICAgICAgc2VsZi5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XHJcbiAgICAgICAgLy8g5qOA5p+lZHVu5piv5ZCm5a2Y5ZyoXHJcbiAgICAgICAgaWYgKHNlbGYuZHVuKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZHVuLm9wYWNpdHkgPSAyNTU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuYW5pbS5wbGF5KFwiYnVmZjFcIik7XHJcbiAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW49ZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJCdWZmID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLkJnTW92ZVNwZWVkID0gMjQ7XHJcbiAgICAgICAgdmFyIGExID0gY2MubW92ZVRvKDAuNSwgY2MudjIoMCwgMjAwKSk7XHJcbiAgICAgICAgdmFyIGEyID0gY2MubW92ZVRvKDMsIGNjLnYyKDI1MCwgMTAwKSk7XHJcbiAgICAgICAgdmFyIGEzID0gY2MubW92ZVRvKDMsIGNjLnYyKC0yNTAsIDApKTtcclxuICAgICAgICB2YXIgYTQgPSBjYy5tb3ZlVG8oMywgY2MudjIoMjUwLDApKTtcclxuICAgICAgICB2YXIgYTUgPSBjYy5tb3ZlVG8oMiwgY2MudjIoMjAwLCAtMTk3KSk7XHJcbiAgICAgICAgdmFyIGE2ID0gY2MuY2FsbEZ1bmMoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckJ1ZmYgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5CZ01vdmVTcGVlZCA9IDg7XHJcbiAgICAgICAgICAgIC8vIOmHjee9ruS/neaKpOe9qeS9jee9ruWIsOS6uueJqeS4reW/g1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJIdWR1bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bi55ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDnoa7kv53njqnlrrbkvY3nva7mraPnoa7vvIzlubbmoLnmja7kvY3nva7orr7nva7mraPnoa7nmoTnirbmgIFcclxuICAgICAgICAgICAgaWYgKHNlbGYpIHtcclxuICAgICAgICAgICAgICAgIC8vIOajgOafpeinkuiJsuaYr+WQpuWIsOi+vuWcsOmdouS9jee9rlxyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNlbGYubm9kZS55ICsgMTk3KSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6KeS6Imy5bey57uP5Zyo5Zyw6Z2i77yM5Y+v5Lul5oGi5aSN6Lez6LeD5p2D6ZmQXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaBouWkjeinkuiJsuato+W4uOi3keWKqOWKqOeUu1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDE1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgneTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5ub2RlLnggPCAtMTUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd6MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOinkuiJsuWcqOS4remXtOS9jee9ru+8jOagueaNruW9k+WJjeS9jee9ruiuvue9ruaWueWQkVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5ub2RlLnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgneTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd6MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgXHJcbiAgICAgICAgdmFyIGFjdGlvbj1jYy5zZXF1ZW5jZShhMSxhMixhMyxhNCxhNSxhNik7XHJcbiAgICAgICAgc2VsZi5ub2RlLnJ1bkFjdGlvbihhY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgYnVmZjIoc2VsZil7XHJcbiAgICAgICAgc2VsZi5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XHJcbiAgICAgICAgLy8g5qOA5p+lZHVu5piv5ZCm5a2Y5ZyoXHJcbiAgICAgICAgaWYgKHNlbGYuZHVuKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZHVuLm9wYWNpdHkgPSAyNTU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuYW5pbS5wbGF5KFwiYnVmZjJcIik7XHJcbiAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW49ZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJCdWZmID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLkJnTW92ZVNwZWVkID0gMjQ7XHJcbiAgICAgICAgdmFyIGExID0gY2MubW92ZVRvKDAuNSwgY2MudjIoMCwgMjAwKSk7XHJcbiAgICAgICAgdmFyIGEyID0gY2MubW92ZVRvKDMsIGNjLnYyKDI1MCwgMTAwKSk7XHJcbiAgICAgICAgdmFyIGEzID0gY2MubW92ZVRvKDMsIGNjLnYyKC0yNTAsIDApKTtcclxuICAgICAgICB2YXIgYTQgPSBjYy5tb3ZlVG8oMywgY2MudjIoMjUwLDApKTtcclxuICAgICAgICB2YXIgYTUgPSBjYy5tb3ZlVG8oMiwgY2MudjIoMjAwLCAtMTk3KSk7XHJcbiAgICAgICAgdmFyIGE2ID0gY2MuY2FsbEZ1bmMoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckJ1ZmYgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5CZ01vdmVTcGVlZCA9IDg7XHJcbiAgICAgICAgICAgIC8vIOmHjee9ruS/neaKpOe9qeS9jee9ruWIsOS6uueJqeS4reW/g1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJIdWR1bikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bi55ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDnoa7kv53njqnlrrbkvY3nva7mraPnoa7vvIzlubbmoLnmja7kvY3nva7orr7nva7mraPnoa7nmoTnirbmgIFcclxuICAgICAgICAgICAgaWYgKHNlbGYpIHtcclxuICAgICAgICAgICAgICAgIC8vIOajgOafpeinkuiJsuaYr+WQpuWIsOi+vuWcsOmdouS9jee9rlxyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNlbGYubm9kZS55ICsgMTk3KSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6KeS6Imy5bey57uP5Zyo5Zyw6Z2i77yM5Y+v5Lul5oGi5aSN6Lez6LeD5p2D6ZmQXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaBouWkjeinkuiJsuato+W4uOi3keWKqOWKqOeUu1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUueCA+IDE1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgneTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5ub2RlLnggPCAtMTUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd6MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOinkuiJsuWcqOS4remXtOS9jee9ru+8jOagueaNruW9k+WJjeS9jee9ruiuvue9ruaWueWQkVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5ub2RlLnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgneTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyTG9jID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd6MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgXHJcbiAgICAgICAgdmFyIGFjdGlvbj1jYy5zZXF1ZW5jZShhMSxhMixhMyxhNCxhNSxhNik7XHJcbiAgICAgICAgc2VsZi5ub2RlLnJ1bkFjdGlvbihhY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgYnVmZjMoc2VsZil7XHJcbiAgICAgICAgLy8g5qOA5p+lZHVu5piv5ZCm5a2Y5ZyoXHJcbiAgICAgICAgaWYgKHNlbGYuZHVuKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVySHVkdW49c2VsZi5kdW47XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVySHVkdW4ueT0xMDA7XHJcblxyXG4gICAgICAgICAgICBzZWxmLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcclxuICAgICAgICAgICAgc2VsZi5kdW4ub3BhY2l0eSA9IDI1NTtcclxuICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoXCJidWZmM1wiKTtcclxuICAgICAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW49ZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQnVmZiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuQmdNb3ZlU3BlZWQgPSAyNDtcclxuICAgICAgICAgICAgdmFyIGExID0gY2MubW92ZVRvKDAuNSwgY2MudjIoMCwgMjAwKSk7XHJcbiAgICAgICAgICAgIHZhciBhMiA9IGNjLm1vdmVUbygzLCBjYy52MigyNTAsIDEwMCkpO1xyXG4gICAgICAgICAgICB2YXIgYTMgPSBjYy5tb3ZlVG8oMywgY2MudjIoLTI1MCwgMCkpO1xyXG4gICAgICAgICAgICB2YXIgYTQgPSBjYy5tb3ZlVG8oMywgY2MudjIoMjUwLDApKTtcclxuICAgICAgICAgICAgdmFyIGE1ID0gY2MubW92ZVRvKDIsIGNjLnYyKDIwMCwgLTE5NykpO1xyXG4gICAgICAgICAgICB2YXIgYTYgPSBjYy5jYWxsRnVuYygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllckJ1ZmYgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuQmdNb3ZlU3BlZWQgPSA4O1xyXG4gICAgICAgICAgICAgICAgLy8g6YeN572u5L+d5oqk572p5L2N572u5Yiw5Lq654mp5Lit5b+DXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJIdWR1bikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVySHVkdW4ueSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDnoa7kv53njqnlrrbkvY3nva7mraPnoa7vvIzlubbmoLnmja7kvY3nva7orr7nva7mraPnoa7nmoTnirbmgIFcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+l6KeS6Imy5piv5ZCm5Yiw6L6+5Zyw6Z2i5L2N572uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNlbGYubm9kZS55ICsgMTk3KSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOinkuiJsuW3sue7j+WcqOWcsOmdou+8jOWPr+S7peaBouWkjei3s+i3g+adg+mZkFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVG91Y2hBZ2FpbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaBouWkjeinkuiJsuato+W4uOi3keWKqOWKqOeUu1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5ub2RlLnggPiAxNTApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYW5pbS5wbGF5KCd5MScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYubm9kZS54IDwgLTE1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3oxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c6KeS6Imy5Zyo5Lit6Ze05L2N572u77yM5qC55o2u5b2T5YmN5L2N572u6K6+572u5pa55ZCRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5ub2RlLnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hbmltLnBsYXkoJ3kxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2MgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFuaW0ucGxheSgnejEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxvYyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBhY3Rpb249Y2Muc2VxdWVuY2UoYTEsYTIsYTMsYTQsYTUsYTYpO1xyXG4gICAgICAgICAgICBzZWxmLm5vZGUucnVuQWN0aW9uKGFjdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdzZWxmLmR1buacquaJvuWIsO+8jOaXoOazleaJp+ihjGJ1ZmYz5pWI5p6cJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBidWZm5Zu+54mH566h55CGXHJcbiAgICAgKiBAcGFyYW0gc2VsZiBcclxuICAgICAqL1xyXG4gICAgY2hhbmdlU3BycyhzZWxmKSB7XHJcbiAgICAgICAgc2VsZi5TcHIxLnNwcml0ZUZyYW1lID0gc2VsZi5TcHJadVt0aGlzLmJ1ZmZUdWppWzBdXTtcclxuICAgICAgICBzZWxmLlNwcjIuc3ByaXRlRnJhbWUgPSBzZWxmLlNwclp1W3RoaXMuYnVmZlR1amlbMV1dO1xyXG4gICAgICAgIHNlbGYuU3ByMy5zcHJpdGVGcmFtZSA9IHNlbGYuU3ByWnVbdGhpcy5idWZmVHVqaVsyXV07XHJcbiAgICB9XHJcbiAgICAvKirmlbDmja7liJ3lp4vljJYgKi9cclxuICAgIGluaXRHYW1lKCkge1xyXG4gICAgICAgIC8v5o6n5Yi25YWL6ZqG5oCq54mpXHJcbiAgICAgICAgdGhpcy5pc0dhbWVCZWdpbj10cnVlO1xyXG4gICAgICAgIC8v5byA5ZCv6Kem5bGPXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJMb2M9LTE7XHJcbiAgICAgICAgdGhpcy5pc1RvdWNoQWdhaW49dHJ1ZTtcclxuICAgICAgICB0aGlzLkV2ZXJ5U2NvcmU9MDtcclxuICAgICAgICAvLyDph43nva7njqnlrrZidWZm54q25oCB77yM6YG/5YWN5rC45LmF5peg5pWMXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJCdWZmPWZhbHNlO1xyXG4gICAgICAgIC8vIOmHjee9rumAn+W6puS4uuWIneWni+WAvFxyXG4gICAgICAgIHRoaXMuQmdNb3ZlU3BlZWQ9ODtcclxuICAgICAgICB0aGlzLk1vdmVTcGVlZD0xMDtcclxuICAgICAgICAvLyDph43nva5idWZm5Zu+54mH54q25oCBXHJcbiAgICAgICAgdGhpcy5idWZmVHVqaSA9IFstMSwtMSwtMV07XHJcbiAgICAgICAgLy8g6YeN572u5oqk55u+6IqC54K5XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJIdWR1bj1udWxsO1xyXG4gICAgICAgIC8vIOmHjee9rlBsYXllck1hbmFnZXLlvJXnlKhcclxuICAgICAgICB0aGlzLnBsYXllck1hbmFnZXI9bnVsbDtcclxuICAgICAgICAvLyDkuI3mlLnlj5jlvZPliY3muLjmiI/mqKHlvI/vvIjkv53mjIHml6DpmZDmqKHlvI/miJblhbPljaHmqKHlvI/vvIlcclxuICAgICAgICAvLyDml6DpmZDmqKHlvI/kuIvkuI3ph43nva5jdXJyZW50TGV2ZWzvvIzkv53mjIHnlKjmiLfov5vluqZcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJblhbPljaHmuLjmiI9cclxuICAgICAqL1xyXG4gICAgaW5pdExldmVsR2FtZSgpIHtcclxuICAgICAgICB0aGlzLmluaXRHYW1lKCk7XHJcbiAgICAgICAgdGhpcy5pc0luZmluaXRlTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuRXZlcnlTY29yZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5b2T5YmN5YWz5Y2h55qE55uu5qCH5YiG5pWwXHJcbiAgICAgKiBAcmV0dXJucyDlvZPliY3lhbPljaHnm67moIfliIbmlbBcclxuICAgICAqL1xyXG4gICAgZ2V0Q3VycmVudExldmVsVGFyZ2V0U2NvcmUoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBsZXZlbENvbmZpZyA9IHRoaXMuZ2V0Q3VycmVudExldmVsQ29uZmlnKCk7XHJcbiAgICAgICAgLy8gaWYgKGxldmVsQ29uZmlnKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBsZXZlbENvbmZpZy5zdGFyMTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3lhbPljaHnmoTphY3nva5cclxuICAgICAqIEByZXR1cm5zIOW9k+WJjeWFs+WNoemFjee9rlxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50TGV2ZWxDb25maWcoKTogTGV2ZWxDb25maWcge1xuICAgICAgICB0aGlzLmVuc3VyZUxlZ2FjeUxldmVsQ29uZmlncygpO1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudExldmVsIC0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGV2ZWxDb25maWdzW2luZGV4XSB8fCBudWxsO1xuICAgIH1cblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7lhbPljaFJROiOt+WPluWFs+WNoemFjee9rlxyXG4gICAgICogQHBhcmFtIGxldmVsIOWFs+WNoUlEXHJcbiAgICAgKiBAcmV0dXJucyDlhbPljaHphY3nva5cclxuICAgICAqL1xyXG4gICAgZ2V0TGV2ZWxDb25maWcobGV2ZWw6IG51bWJlcik6IExldmVsQ29uZmlnIHtcbiAgICAgICAgdGhpcy5lbnN1cmVMZWdhY3lMZXZlbENvbmZpZ3MoKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsZXZlbCAtIDE7XG4gICAgICAgIHJldHVybiB0aGlzLmxldmVsQ29uZmlnc1tpbmRleF0gfHwgbnVsbDtcbiAgICB9XG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiuoeeul+iOt+W+l+eahOaYn+aYn+aVsFxyXG4gICAgICogQHBhcmFtIHNjb3JlIOW9k+WJjeW+l+WIhlxyXG4gICAgICogQHJldHVybnMg6I635b6X55qE5pif5pif5pWw77yIMC0z77yJXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZVN0YXJzKHNjb3JlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLmlzSW5maW5pdGVNb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIOaXoOmZkOaooeW8j+S4i+eahOaYn+aYn+iuoeeul+mAu+i+ke+8muWfuuS6juWIhuaVsOiMg+WbtFxyXG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gNDAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMzsgLy8gNDAx5YiG5Lul5LiK77yM6I635b6XM+mil+aYn1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlID49IDIwMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7IC8vIDIwMS00MDDliIbvvIzojrflvpcy6aKX5pifXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcmUgPj0gMTAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTsgLy8gMTAxLTIwMOWIhu+8jOiOt+W+lzHpopfmmJ9cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwOyAvLyAwLTEwMOWIhu+8jOiOt+W+lzDpopfmmJ9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWFs+WNoeaooeW8j+S4i+eahOaYn+aYn+iuoeeul+mAu+i+ke+8muWfuuS6jumFjee9ruaWh+S7tuS4reeahOaYn+aYn+adoeS7tlxyXG4gICAgICAgICAgICBjb25zdCBsZXZlbENvbmZpZyA9IHRoaXMuZ2V0Q3VycmVudExldmVsQ29uZmlnKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWxldmVsQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCflvZPliY3lhbPljaHphY3nva7kuI3lrZjlnKgnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDkvb/nlKjphY3nva7mlofku7bkuK3nmoTmmJ/mmJ/mnaHku7ZcclxuICAgICAgICAgICAgLy8gaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMzsgLy8g6L6+5YiwM+aYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIyKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMjsgLy8g6L6+5YiwMuaYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHNjb3JlID49IGxldmVsQ29uZmlnLnN0YXIxKSB7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gMTsgLy8g6L6+5YiwMeaYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIDA7IC8vIOacqui+vuWIsOS7u+S9leaYn+aYn+adoeS7tlxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOS/neWtmOaMh+WumuWFs+WNoeiOt+W+l+eahOaYn+aYn+aVsO+8iOS9v+eUqOaVsOe7hOaWueW8j+WtmOWCqO+8iVxyXG4gICAgICogQHBhcmFtIGxldmVsIOWFs+WNoeWPt1xyXG4gICAgICogQHBhcmFtIHN0YXJzIOiOt+W+l+eahOaYn+aYn+aVsFxyXG4gICAgICovXHJcbiAgICBzYXZlTGV2ZWxTdGFyc0J5TGV2ZWwobGV2ZWw6IG51bWJlciwgc3RhcnM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmIChsZXZlbCA8IDEgfHwgbGV2ZWwgPiB0aGlzLmdldFRvdGFsTGV2ZWxzKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGDkv53lrZjmmJ/mmJ/mlbDlpLHotKXvvJrlhbPljaHlj7cke2xldmVsfeaXoOaViGApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGxldmVsSW5kZXggPSBsZXZlbCAtIDE7IC8vIOaVsOe7hOe0ouW8leS7jjDlvIDlp4tcclxuICAgICAgICBcclxuICAgICAgICAvLyDnoa7kv53mlbDnu4TotrPlpJ/lpKdcclxuICAgICAgICB3aGlsZSAodGhpcy5sZXZlbFN0YXJzLmxlbmd0aCA8PSBsZXZlbEluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFycy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjdXJyZW50U3RhcnMgPSB0aGlzLmxldmVsU3RhcnNbbGV2ZWxJbmRleF0gfHwgMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoc3RhcnMgPiBjdXJyZW50U3RhcnMpIHtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxTdGFyc1tsZXZlbEluZGV4XSA9IHN0YXJzO1xuICAgICAgICAgICAgLy8g5L+d5a2Y5Yiw5pys5Zyw5a2Y5YKoXG4gICAgICAgICAgICBjb25zdCBsZXZlbFN0YXJzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMubGV2ZWxTdGFyc0tleSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0obGV2ZWxTdGFyc0tleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5sZXZlbFN0YXJzKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5YWz5Y2hJHtsZXZlbH3ojrflvpcke3N0YXJzfemil+aYn++8iOavlOS5i+WJjeeahCR7Y3VycmVudFN0YXJzfemil+abtOWkmu+8ie+8jOW3suS/neWtmGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWFs+WNoSR7bGV2ZWx96I635b6XJHtzdGFyc33popfmmJ/vvIzmnKrotoXov4fkuYvliY3nmoQke2N1cnJlbnRTdGFyc33popfvvIzkuI3kv53lrZhgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5L+d5a2Y5b2T5YmN5YWz5Y2h6I635b6X55qE5pif5pif5pWw77yI5L2/55So5pWw57uE5pa55byP5a2Y5YKo77yJXHJcbiAgICAgKiBAcGFyYW0gc3RhcnMg6I635b6X55qE5pif5pif5pWwXHJcbiAgICAgKi9cclxuICAgIHNhdmVMZXZlbFN0YXJzKHN0YXJzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBsZXZlbEluZGV4ID0gdGhpcy5jdXJyZW50TGV2ZWwgLSAxOyAvLyDmlbDnu4TntKLlvJXku44w5byA5aeLXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g56Gu5L+d5pWw57uE6Laz5aSf5aSnXHJcbiAgICAgICAgd2hpbGUgKHRoaXMubGV2ZWxTdGFycy5sZW5ndGggPD0gbGV2ZWxJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsU3RhcnMucHVzaCgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgY3VycmVudFN0YXJzID0gdGhpcy5sZXZlbFN0YXJzW2xldmVsSW5kZXhdIHx8IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHN0YXJzID4gY3VycmVudFN0YXJzKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsU3RhcnNbbGV2ZWxJbmRleF0gPSBzdGFycztcbiAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsOWtmOWCqFxuICAgICAgICAgICAgY29uc3QgbGV2ZWxTdGFyc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmxldmVsU3RhcnNLZXkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGxldmVsU3RhcnNLZXksIEpTT04uc3RyaW5naWZ5KHRoaXMubGV2ZWxTdGFycykpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWFs+WNoSR7dGhpcy5jdXJyZW50TGV2ZWx96I635b6XJHtzdGFyc33popfmmJ/vvIjmr5TkuYvliY3nmoQke2N1cnJlbnRTdGFyc33popfmm7TlpJrvvInvvIzlt7Lkv53lrZhgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlhbPljaEke3RoaXMuY3VycmVudExldmVsfeiOt+W+lyR7c3RhcnN96aKX5pif77yM5pyq6LaF6L+H5LmL5YmN55qEJHtjdXJyZW50U3RhcnN96aKX77yM5LiN5L+d5a2YYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaMh+WumuWFs+WNoeiOt+W+l+eahOaYn+aYn+aVsO+8iOS7juaVsOe7hOS4reivu+WPlu+8iVxyXG4gICAgICogQHBhcmFtIGxldmVsIOWFs+WNoeaVsFxyXG4gICAgICogQHJldHVybnMg6I635b6X55qE5pif5pif5pWw77yIMC0z77yJXHJcbiAgICAgKi9cclxuICAgIGdldExldmVsU3RhcnMobGV2ZWw6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGxldmVsIDwgMSB8fCBsZXZlbCA+IHRoaXMuZ2V0VG90YWxMZXZlbHMoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluaYn+aYn+aVsOWksei0pe+8muWFs+WNoeWPtyR7bGV2ZWx95peg5pWIYCk7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBsZXZlbEluZGV4ID0gbGV2ZWwgLSAxOyAvLyDmlbDnu4TntKLlvJXku44w5byA5aeLXHJcbiAgICAgICAgbGV0IHN0YXJzID0gMDtcclxuICAgICAgICBcclxuICAgICAgICAvLyDkvJjlhYjku47lhoXlrZjmlbDnu4Tor7vlj5ZcclxuICAgICAgICBpZiAodGhpcy5sZXZlbFN0YXJzICYmIHRoaXMubGV2ZWxTdGFycy5sZW5ndGggPiBsZXZlbEluZGV4KSB7XHJcbiAgICAgICAgICAgIHN0YXJzID0gdGhpcy5sZXZlbFN0YXJzW2xldmVsSW5kZXhdIHx8IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWmguaenOWFs+WNoeW3suino+mUge+8iOWwj+S6jnVubG9ja2VkTGV2ZWzvvInkvYbmmJ/nuqfkuLow77yM57uZ6buY6K6kMeaYn++8iOWFvOWuueaXp+i0puWPt++8iVxyXG4gICAgICAgIC8vIOW3suino+mUgeS9huacqumAmuWFs+eahOWFs+WNoe+8iHVubG9ja2VkTGV2ZWzvvInkuI3nu5npu5jorqTmmJ9cclxuICAgICAgICBpZiAoc3RhcnMgPT09IDAgJiYgbGV2ZWwgPCB0aGlzLnVubG9ja2VkTGV2ZWwpIHtcclxuICAgICAgICAgICAgc3RhcnMgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDnoa7kv53mmJ/mmJ/mlbDph4/lnKjlkIjnkIbojIPlm7TlhoVcclxuICAgICAgICBjb25zdCB2YWxpZFN0YXJzID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc3RhcnMsIDMpKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmFsaWRTdGFycztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmiYDmnInlhbPljaHnmoTmmJ/nuqfmlbDnu4TvvIjnlKjkuo7lkIzmraXliLDmnI3liqHnq6/vvIlcclxuICAgICAqIEByZXR1cm5zIOaYn+e6p+aVsOe7hO+8jOe0ouW8leS4uuWFs+WNoeWPtyAtMVxyXG4gICAgICovXHJcbiAgICBnZXRMZXZlbFN0YXJzQXJyYXkoKTogbnVtYmVyW10ge1xyXG4gICAgICAgIGNvbnN0IHRvdGFsTGV2ZWxzID0gdGhpcy5nZXRUb3RhbExldmVscygpO1xyXG4gICAgICAgIGNvbnN0IHN0YXJzQXJyYXk6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdG90YWxMZXZlbHM7IGkrKykge1xyXG4gICAgICAgICAgICBzdGFyc0FycmF5LnB1c2godGhpcy5nZXRMZXZlbFN0YXJzKGkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHN0YXJzQXJyYXk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5LuO5pyN5Yqh56uv5Yqg6L295pif57qn5pWw57uE77yI5L2/55So5pWw57uE5pa55byP5a2Y5YKo77yJXHJcbiAgICAgKiBAcGFyYW0gc3RhcnNBcnJheSDmmJ/nuqfmlbDnu4RcclxuICAgICAqL1xyXG4gICAgbG9hZExldmVsU3RhcnNBcnJheShzdGFyc0FycmF5OiBudW1iZXJbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzdGFyc0FycmF5KSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+aYn+e6p+aVsOe7hOagvOW8j+mUmeivrycpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRvdGFsTGV2ZWxzID0gdGhpcy5nZXRUb3RhbExldmVscygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWQiOW5tuacjeWKoeerr+aVsOaNruS4juacrOWcsOaVsOaNru+8jOS/neeVmeacgOmrmOaYn+e6p1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oc3RhcnNBcnJheS5sZW5ndGgsIHRvdGFsTGV2ZWxzKTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJzID0gc3RhcnNBcnJheVtpXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGFycyA9PT0gJ251bWJlcicgJiYgc3RhcnMgPj0gMCAmJiBzdGFycyA8PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDnoa7kv53mlbDnu4TotrPlpJ/lpKdcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmxldmVsU3RhcnMubGVuZ3RoIDw9IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVsU3RhcnMucHVzaCgwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOS/neeVmeacgOmrmOaYn+e6p1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzID4gdGhpcy5sZXZlbFN0YXJzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbFN0YXJzW2ldID0gc3RhcnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5L+d5a2Y5Yiw5pys5Zyw5a2Y5YKoXG4gICAgICAgIGNvbnN0IGxldmVsU3RhcnNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5sZXZlbFN0YXJzS2V5KTtcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGxldmVsU3RhcnNLZXksIEpTT04uc3RyaW5naWZ5KHRoaXMubGV2ZWxTdGFycykpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coYOW3suS7juacjeWKoeerr+WKoOi9veaYn+e6p+aVsOaNru+8jOWFsSR7c3RhcnNBcnJheS5sZW5ndGh95Liq5YWz5Y2hYCk7XG4gICAgfVxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDph43nva7lhbPljaHov5vluqbkuLrnrKzkuIDlhbNcclxuICAgICAqL1xyXG4gICAgcmVzZXRMZXZlbFByb2dyZXNzKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudExldmVsID0gMTtcclxuICAgICAgICBjb25zdCBjdXJyZW50TGV2ZWxLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5jdXJyZW50TGV2ZWxLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShjdXJyZW50TGV2ZWxLZXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRvdGFsTGV2ZWxzID0gdGhpcy5nZXRUb3RhbExldmVscygpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRvdGFsTGV2ZWxzOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQoYExldmVsU3RhcnNfJHtpfWApO1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oc3RhcnNLZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygn5YWz5Y2h6L+b5bqm5bey6YeN572u77yM6YeN5paw5LuO56ysIDEg5YWz5byA5aeLJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5oC75YWz5Y2h5pWwXHJcbiAgICAgKiBAcmV0dXJucyDmgLvlhbPljaHmlbBcclxuICAgICAqL1xyXG4gICAgZ2V0VG90YWxMZXZlbHMoKTogbnVtYmVyIHtcbiAgICAgICAgdGhpcy5lbnN1cmVMZWdhY3lMZXZlbENvbmZpZ3MoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGV2ZWxDb25maWdzLmxlbmd0aDtcbiAgICB9XG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW3suino+mUgeeahOacgOmrmOWFs+WNoVxyXG4gICAgICogQHJldHVybnMg5bey6Kej6ZSB55qE5pyA6auY5YWz5Y2h5Y+3XHJcbiAgICAgKi9cclxuICAgIGdldEhpZ2hlc3RVbmxvY2tlZExldmVsKCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8g5LuO5pyA6auY5YWz5Y2h5byA5aeL5ZCR5LiL6YGN5Y6G77yM5om+5Yiw56ys5LiA5Liq5bey6Kej6ZSB55qE5YWz5Y2hXHJcbiAgICAgICAgZm9yIChsZXQgbGV2ZWwgPSB0aGlzLmdldFRvdGFsTGV2ZWxzKCk7IGxldmVsID49IDI7IGxldmVsLS0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNMZXZlbFVubG9ja2VkKGxldmVsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWmguaenOayoeacieaJvuWIsO+8iOeQhuiuuuS4iuS4jeWPr+iDve+8jOWboOS4uuesrOS4gOWFs+aAu+aYr+ino+mUgeeahO+8ie+8jOi/lOWbnuesrOS4gOWFs1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyDliafmg4XlvLnnqpfnm7jlhbNcclxuICAgIHB1YmxpYyBzdG9yeVBvcHVwU2hvd25LZXk6IHN0cmluZyA9ICdTdG9yeVBvcHVwU2hvd24nO1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeWJp+aDheW8ueeql+aYr+WQpuW3suaYvuekulxyXG4gICAgICogQHJldHVybnMg5piv5ZCm5bey5pi+56S6XHJcbiAgICAgKi9cclxuICAgIGlzU3RvcnlQb3B1cFNob3duKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnN0b3J5UG9wdXBTaG93bktleSk7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPT09ICd0cnVlJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDorrDlvZXliafmg4XlvLnnqpflt7LmmL7npLpcclxuICAgICAqL1xyXG4gICAgc2V0U3RvcnlQb3B1cFNob3duKCkge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLnN0b3J5UG9wdXBTaG93bktleSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgJ3RydWUnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprmioDog73nmoTlvZPliY3mlYjmnpzlgLxcclxuICAgICAqIEBwYXJhbSBza2lsbElkIOaKgOiDvUlEXHJcbiAgICAgKiBAcmV0dXJucyDlvZPliY3mlYjmnpzlgLxcclxuICAgICAqL1xyXG4gICAgZ2V0U2tpbGxFZmZlY3Qoc2tpbGxJZDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBza2lsbCA9IHRoaXMuc2tpbGxzLmZpbmQocyA9PiBzLmlkID09PSBza2lsbElkKTtcclxuICAgICAgICBpZiAoIXNraWxsKSByZXR1cm4gMDtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gc2tpbGwuYmFzZUVmZmVjdCArIChza2lsbC5sZXZlbCAtIDEpICogc2tpbGwuZWZmZWN0UGVyTGV2ZWw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5YWz5Y2h5piv5ZCm6Kej6ZSBXHJcbiAgICAgKiBAcGFyYW0gbGV2ZWwg5YWz5Y2h5Y+3XHJcbiAgICAgKiBAcmV0dXJucyDmmK/lkKbop6PplIFcclxuICAgICAqL1xyXG4gICAgaXNMZXZlbFVubG9ja2VkKGxldmVsOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyDnoa7kv53lhbPljaHlj7fmnInmlYhcclxuICAgICAgICBjb25zdCB0b3RhbExldmVscyA9IHRoaXMuZ2V0VG90YWxMZXZlbHMoKTtcclxuICAgICAgICBpZiAobGV2ZWwgPCAxIHx8IGxldmVsID4gdG90YWxMZXZlbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDmiYDmnInlsI/kuo7nrYnkuo7lt7Lop6PplIHlhbPljaHnmoTlhbPljaHpg73lupTor6Xop6PplIFcclxuICAgICAgICBpZiAobGV2ZWwgPD0gdGhpcy51bmxvY2tlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDotoXov4flt7Lop6PplIHlhbPljaHvvIzmjInnhafljp/pgLvovpHliKTmlq1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxubGV0IG1HYW1lRGF0YSA9IG5ldyBHYW1lRGF0YSgpO1xyXG5leHBvcnQgZGVmYXVsdCBtR2FtZURhdGE7XHJcbiJdfQ==