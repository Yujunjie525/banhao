"use strict";
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