"use strict";
cc._RF.push(module, 'ce063suGFdMBKP6Az2Idx2+', 'RankManager');
// Scripts/Manager/RankManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
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
                // 初始化关闭按钮点击事件
                if (this.closeButton) {
                    this.closeButton.node.on('click', this.onCloseClick, this);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 初始化排行榜数据
     */
    RankManager.prototype.initRankData = function () {
        return __awaiter(this, void 0, Promise, function () {
            var result, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.postRank(AppConfig_1.APP_ID)];
                    case 1:
                        result = _a.sent();
                        console.log("postRank:", result);
                        if (result.code === 0 && Array.isArray(result.data)) {
                            this.rankData = result.data.map(function (item, index) {
                                var accountId = _this.getAccountId(item, index);
                                return {
                                    rank: index + 1,
                                    accountId: accountId,
                                    name: '玩家' + accountId,
                                    distance: _this.toDistance(item && item.totalLoginNum)
                                };
                            });
                        }
                        else {
                            this.rankData = [];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("获取排行榜数据失败:", error_1);
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
            levelLabel.string = data.distance.toString();
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
        var itemHeight = item.height;
        // 获取view节点宽度
        var view = this.rankScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        var viewWidth = view.width;
        // 列表项之间的垂直间距
        var verticalSpacing = 0;
        // 列表项的内边距
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
            // content 的 anchorX 是 0.5，子项 x=0 才是居中。
            child.x = 0;
        }
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.rankScrollView.scrollToTop) {
            this.rankScrollView.scrollToTop(0.1);
        }
    };
    /**
     * 显示当前用户信息
     */
    RankManager.prototype.showSelfInfo = function () {
        var userId = this.getUserId();
        var selfName = this.getSelfName();
        var localBestDistance = this.getLocalBestDistance();
        // 查找当前用户在排行榜中的排名
        var currentUser = userId
            ? this.rankData.find(function (user) { return user.accountId === userId; })
            : null;
        var selfRank = currentUser ? currentUser.rank : this.rankData.length + 1;
        if (this.selfNameLabel)
            this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel)
            this.selfLevelLabel.string = localBestDistance.toString();
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
                    // 每次显示时刷新数据
                    return [4 /*yield*/, this.initRankData()];
                    case 1:
                        // 每次显示时刷新数据
                        _a.sent();
                        this.initRankList();
                        this.showSelfInfo();
                        this.node.active = true;
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
    RankManager.prototype.getAccountId = function (item, fallbackIndex) {
        if (item && item.accountId !== undefined && item.accountId !== null)
            return String(item.accountId);
        if (item && item.user_id !== undefined && item.user_id !== null)
            return String(item.user_id);
        if (item && item.openid !== undefined && item.openid !== null)
            return String(item.openid);
        return 'unknown_' + fallbackIndex;
    };
    RankManager.prototype.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID') || '';
    };
    RankManager.prototype.getSelfName = function () {
        var userId = this.getUserId();
        return userId ? '玩家' + userId : '玩家';
    };
    RankManager.prototype.getLocalBestDistance = function () {
        var userId = this.getUserId();
        var scopedKey = userId ? 'WarriorRunBestDistance_' + userId : 'WarriorRunBestDistance';
        var raw = cc.sys.localStorage.getItem(scopedKey) || cc.sys.localStorage.getItem('WarriorRunBestDistance');
        return this.toDistance(raw);
    };
    RankManager.prototype.toDistance = function (value) {
        return Math.max(0, Math.floor(Number(value) || 0));
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