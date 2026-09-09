"use strict";
cc._RF.push(module, 'ce063suGFdMBKP6Az2Idx2+', 'RankManager');
// Scripts/Manager/RankManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameData_1 = require("../Load/GameData");
var AppConfig_1 = require("../Common/AppConfig");
var RankManager = /** @class */ (function (_super) {
    __extends(RankManager, _super);
    function RankManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeButton = null;
        _this.rankScrollView = null;
        _this.rankItemPrefab = null;
        _this.selfRankLabel = null;
        _this.selfNameLabel = null;
        _this.selfLevelLabel = null;
        // 排行榜数据结构
        _this.rankData = [];
        return _this;
    }
    RankManager.prototype.onLoad = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 初始化关闭按钮点击事件
                        if (this.closeButton) {
                            this.closeButton.node.on('click', this.onCloseClick, this);
                        }
                        // 初始化排行榜数据
                        return [4 /*yield*/, this.initRankData()];
                    case 1:
                        // 初始化排行榜数据
                        _a.sent();
                        // 初始化排行榜列表
                        this.initRankList();
                        // 显示当前用户信息
                        this.showSelfInfo();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化排行榜数据
     */
    RankManager.prototype.initRankData = function () {
        return __awaiter(this, void 0, Promise, function () {
            var result, userId, selfName, currentHighestLevel, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.postRank(AppConfig_1.APP_ID)];
                    case 1:
                        result = _a.sent();
                        console.log("postRank:", result);
                        if (result.code === 0 && result.data) {
                            userId = cc.sys.localStorage.getItem('SLS_USER_ID');
                            selfName = "\u73A9\u5BB6" + userId;
                            currentHighestLevel = GameData_1.default.getHighestUnlockedLevel();
                            // 处理返回的数据，将其转换为符合要求的格式
                            this.rankData = result.data.map(function (item, index) {
                                // 如果是当前用户，更新totalLoginNum为当前最高关卡数+1（因为level = totalLoginNum）
                                // if (`玩家${item.accountId}` === selfName) {
                                //     item.totalLoginNum = currentHighestLevel;
                                // }
                                return {
                                    rank: index + 1,
                                    name: "\u73A9\u5BB6" + item.accountId,
                                    level: item.totalLoginNum + 1 // totalLoginNum-1作为等级
                                };
                            });
                        }
                        else {
                            // 如果服务器返回错误或没有数据，使用空数组
                            this.rankData = [];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("获取排行榜数据失败:", error_1);
                        // 发生错误时使用空数组
                        this.rankData = [];
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化排行榜列表
     */
    RankManager.prototype.initRankList = function () {
        if (!this.rankScrollView || !this.rankItemPrefab) {
            console.error('排行榜ScrollView或预制体未设置');
            return;
        }
        var container = this.rankScrollView.content;
        container.removeAllChildren();
        for (var _i = 0, _a = this.rankData; _i < _a.length; _i++) {
            var data = _a[_i];
            var rankItem = cc.instantiate(this.rankItemPrefab);
            container.addChild(rankItem);
            this.setupRankItem(rankItem, data);
        }
        // 更新ScrollView内容大小
        this.updateScrollViewContentSize();
    };
    /**
     * 设置排行榜列表项
     * @param item 列表项节点
     * @param data 列表项数据
     */
    RankManager.prototype.setupRankItem = function (item, data) {
        // 获取列表项中的Label组件
        var rankLabel = item.getChildByName('l_rank').getComponent(cc.Label);
        var nameLabel = item.getChildByName('l_name').getComponent(cc.Label);
        var levelLabel = item.getChildByName('l_level').getComponent(cc.Label);
        if (rankLabel)
            rankLabel.string = data.rank.toString();
        if (nameLabel)
            nameLabel.string = data.name;
        if (levelLabel)
            levelLabel.string = data.level.toString();
    };
    /**
     * 更新ScrollView内容大小
     */
    RankManager.prototype.updateScrollViewContentSize = function () {
        if (!this.rankScrollView || !this.rankScrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        var container = this.rankScrollView.content;
        var children = container.children;
        if (children.length === 0) {
            return;
        }
        // 获取列表项的大小（使用第一个列表项作为参考）
        var item = children[0];
        var itemWidth = item.width;
        var itemHeight = item.height;
        // 获取view节点宽度
        var view = this.rankScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        var viewWidth = view.width;
        // 列表项之间的垂直间距
        var verticalSpacing = 10;
        // 列表项的内边距
        var xPadding = 0; // x方向内边距
        var yPadding = 10; // y方向内边距
        // 计算content的总高度，考虑y方向padding
        var totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;
        // 设置content的大小，宽度与view一致
        container.width = viewWidth;
        container.height = totalHeight;
        // 设置content的锚点为左上角
        container.anchorX = 0.5;
        container.anchorY = 1;
        // 设置列表项的位置（垂直布局，居中显示）
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            // 设置列表项的位置，从顶部开始排列，考虑y方向padding和列表项高度
            child.y = -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing);
            // 居中显示，考虑x方向padding：(view宽度 - 列表项宽度 - 2 * xPadding) / 2 + xPadding
            child.x = (viewWidth - itemWidth - 2 * xPadding) / 2;
        }
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.rankScrollView.scrollToTop) {
            this.rankScrollView.scrollToTop(0.1);
        }
    };
    /**
     * 将当前用户添加到排行榜并重新计算排名
     */
    RankManager.prototype.addCurrentUserToRank = function () {
        // 从GameData获取真实用户数据
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        var selfName = '玩家' + userId;
        var selfLevel = GameData_1.default.getHighestUnlockedLevel(); // 从GameData获取最大通关关卡数
        // 创建当前用户对象
        var currentUser = { rank: 0, name: selfName, level: selfLevel };
        // 将当前用户添加到排行榜数组
        this.rankData.push(currentUser);
        // 根据关卡数降序排序
        this.rankData.sort(function (a, b) { return b.level - a.level; });
        // 重新计算排名
        this.rankData.forEach(function (user, index) {
            user.rank = index + 1;
        });
    };
    /**
     * 显示当前用户信息
     */
    RankManager.prototype.showSelfInfo = function () {
        // 从GameData获取真实用户数据
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        var selfName = '玩家' + userId;
        var selfLevel = GameData_1.default.unlockedLevel; // 从GameData获取最大通关关卡数
        // 查找当前用户在排行榜中的排名
        var currentUser = this.rankData.find(function (user) { return user.name === selfName; });
        var selfRank = currentUser ? currentUser.rank : this.rankData.length + 1;
        if (this.selfNameLabel)
            this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel)
            this.selfLevelLabel.string = selfLevel.toString();
        if (this.selfRankLabel)
            this.selfRankLabel.string = selfRank.toString();
    };
    /**
     * 关闭按钮点击事件
     */
    RankManager.prototype.onCloseClick = function () {
        this.node.active = false;
    };
    /**
     * 显示排行榜
     */
    RankManager.prototype.show = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.node.active = true;
                        // 每次显示时刷新数据
                        return [4 /*yield*/, this.initRankData()];
                    case 1:
                        // 每次显示时刷新数据
                        _a.sent();
                        this.initRankList();
                        this.showSelfInfo();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 隐藏排行榜
     */
    RankManager.prototype.hide = function () {
        this.node.active = false;
    };
    //排行榜请求
    RankManager.prototype.postRank = function (appid) {
        return __awaiter(this, void 0, Promise, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://pay.szvi-bo.com/v1/testapp/RankList";
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.onload = function () {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    var data = JSON.parse(xhr.responseText);
                                    resolve(data);
                                }
                                catch (e) {
                                    reject(new Error("JSON\u89E3\u6790\u9519\u8BEF: " + e.message));
                                }
                            }
                            else {
                                reject(new Error("HTTP\u9519\u8BEF: " + xhr.status));
                            }
                        };
                        xhr.onerror = function () { return reject(new Error('网络请求失败')); };
                        xhr.ontimeout = function () { return reject(new Error('网络请求超时')); };
                        xhr.send(JSON.stringify({ appid: appid }));
                    })];
            });
        });
    };
    __decorate([
        property(cc.Button)
    ], RankManager.prototype, "closeButton", void 0);
    __decorate([
        property(cc.ScrollView)
    ], RankManager.prototype, "rankScrollView", void 0);
    __decorate([
        property(cc.Prefab)
    ], RankManager.prototype, "rankItemPrefab", void 0);
    __decorate([
        property(cc.Label)
    ], RankManager.prototype, "selfRankLabel", void 0);
    __decorate([
        property(cc.Label)
    ], RankManager.prototype, "selfNameLabel", void 0);
    __decorate([
        property(cc.Label)
    ], RankManager.prototype, "selfLevelLabel", void 0);
    RankManager = __decorate([
        ccclass
    ], RankManager);
    return RankManager;
}(cc.Component));
exports.default = RankManager;

cc._RF.pop();