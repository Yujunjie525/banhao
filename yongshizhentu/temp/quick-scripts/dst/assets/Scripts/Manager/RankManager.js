
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/RankManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcUmFua01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBQzFDLGlEQUE2QztBQVU3QztJQUF5QywrQkFBWTtJQUFyRDtRQUFBLHFFQTRQQztRQTFQRyxpQkFBVyxHQUFjLElBQUksQ0FBQztRQUc5QixvQkFBYyxHQUFrQixJQUFJLENBQUM7UUFHckMsb0JBQWMsR0FBYyxJQUFJLENBQUM7UUFHakMsbUJBQWEsR0FBYSxJQUFJLENBQUM7UUFHL0IsbUJBQWEsR0FBYSxJQUFJLENBQUM7UUFHL0Isb0JBQWMsR0FBYSxJQUFJLENBQUM7UUFFaEMsVUFBVTtRQUNGLGNBQVEsR0FBYyxFQUFFLENBQUM7O0lBd09yQyxDQUFDO0lBdE9tQiw0QkFBTSxHQUF0Qjt1Q0FBMEIsT0FBTzs7Z0JBQzdCLGNBQWM7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzlEOzs7O0tBQ0o7SUFFRDs7T0FFRztJQUNXLGtDQUFZLEdBQTFCO3VDQUE4QixPQUFPOzs7Ozs7O3dCQUVkLHFCQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQU0sQ0FBQyxFQUFBOzt3QkFBcEMsTUFBTSxHQUFHLFNBQTJCO3dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFFakMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDakQsSUFBSSxDQUFDLFFBQVEsR0FB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UUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7b0RBQ1U7SUFHOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQzt1REFDYTtJQUdyQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO3VEQUNhO0lBR2pDO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7c0RBQ1k7SUFHL0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztzREFDWTtJQUcvQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3VEQUNhO0lBakJmLFdBQVc7UUFEL0IsT0FBTztPQUNhLFdBQVcsQ0E0UC9CO0lBQUQsa0JBQUM7Q0E1UEQsQUE0UEMsQ0E1UHdDLEVBQUUsQ0FBQyxTQUFTLEdBNFBwRDtrQkE1UG9CLFdBQVciLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcbmltcG9ydCB7IEFQUF9JRCB9IGZyb20gJy4uL0NvbW1vbi9BcHBDb25maWcnO1xuXG5pbnRlcmZhY2UgUmFua1JvdyB7XG4gICAgcmFuazogbnVtYmVyO1xuICAgIGFjY291bnRJZDogc3RyaW5nO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkaXN0YW5jZTogbnVtYmVyO1xufVxuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmFua01hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pIFxuICAgIGNsb3NlQnV0dG9uOiBjYy5CdXR0b24gPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlNjcm9sbFZpZXcpIFxuICAgIHJhbmtTY3JvbGxWaWV3OiBjYy5TY3JvbGxWaWV3ID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5QcmVmYWIpIFxuICAgIHJhbmtJdGVtUHJlZmFiOiBjYy5QcmVmYWIgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSBcbiAgICBzZWxmUmFua0xhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIFxuICAgIHNlbGZOYW1lTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIFxuICAgIHNlbGZMZXZlbExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgXG4gICAgLy8g5o6S6KGM5qac5pWw5o2u57uT5p6EXG4gICAgcHJpdmF0ZSByYW5rRGF0YTogUmFua1Jvd1tdID0gW107XG4gICAgXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uTG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8g5Yid5aeL5YyW5YWz6Zet5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICAgIGlmICh0aGlzLmNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm5vZGUub24oJ2NsaWNrJywgdGhpcy5vbkNsb3NlQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWIneWni+WMluaOkuihjOamnOaVsOaNrlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaW5pdFJhbmtEYXRhKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5wb3N0UmFuayhBUFBfSUQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJwb3N0UmFuazpcIiwgcmVzdWx0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHJlc3VsdC5jb2RlID09PSAwICYmIEFycmF5LmlzQXJyYXkocmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5rRGF0YSA9IHJlc3VsdC5kYXRhLm1hcCgoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjY291bnRJZCA9IHRoaXMuZ2V0QWNjb3VudElkKGl0ZW0sIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbms6IGluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICfnjqnlrrYnICsgYWNjb3VudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IHRoaXMudG9EaXN0YW5jZShpdGVtICYmIGl0ZW0udG90YWxMb2dpbk51bSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5rRGF0YSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuiOt+WPluaOkuihjOamnOaVsOaNruWksei0pTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5yYW5rRGF0YSA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWIneWni+WMluaOkuihjOamnOWIl+ihqFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdFJhbmtMaXN0KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMucmFua1Njcm9sbFZpZXcgfHwgIXRoaXMucmFua0l0ZW1QcmVmYWIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aOkuihjOamnFNjcm9sbFZpZXfmiJbpooTliLbkvZPmnKrorr7nva4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5yYW5rU2Nyb2xsVmlldy5jb250ZW50O1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZGF0YSBvZiB0aGlzLnJhbmtEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCByYW5rSXRlbSA9IGNjLmluc3RhbnRpYXRlKHRoaXMucmFua0l0ZW1QcmVmYWIpO1xuICAgICAgICAgICAgY29udGFpbmVyLmFkZENoaWxkKHJhbmtJdGVtKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBSYW5rSXRlbShyYW5rSXRlbSwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsFNjcm9sbFZpZXflhoXlrrnlpKflsI9cbiAgICAgICAgdGhpcy51cGRhdGVTY3JvbGxWaWV3Q29udGVudFNpemUoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6K6+572u5o6S6KGM5qac5YiX6KGo6aG5XG4gICAgICogQHBhcmFtIGl0ZW0g5YiX6KGo6aG56IqC54K5XG4gICAgICogQHBhcmFtIGRhdGEg5YiX6KGo6aG55pWw5o2uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXR1cFJhbmtJdGVtKGl0ZW06IGNjLk5vZGUsIGRhdGE6IFJhbmtSb3cpOiB2b2lkIHtcbiAgICAgICAgLy8g6I635Y+W5YiX6KGo6aG55Lit55qETGFiZWznu4Tku7ZcbiAgICAgICAgY29uc3QgcmFua0xhYmVsID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnbF9yYW5rJykuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgY29uc3QgbmFtZUxhYmVsID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnbF9uYW1lJykuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgY29uc3QgbGV2ZWxMYWJlbCA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2xfbGV2ZWwnKS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHJhbmtMYWJlbCkgcmFua0xhYmVsLnN0cmluZyA9IGRhdGEucmFuay50b1N0cmluZygpO1xuICAgICAgICBpZiAobmFtZUxhYmVsKSBuYW1lTGFiZWwuc3RyaW5nID0gZGF0YS5uYW1lO1xuICAgICAgICBpZiAobGV2ZWxMYWJlbCkgbGV2ZWxMYWJlbC5zdHJpbmcgPSBkYXRhLmRpc3RhbmNlLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOabtOaWsFNjcm9sbFZpZXflhoXlrrnlpKflsI9cbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZVNjcm9sbFZpZXdDb250ZW50U2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnJhbmtTY3JvbGxWaWV3IHx8ICF0aGlzLnJhbmtTY3JvbGxWaWV3LmNvbnRlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Njcm9sbFZpZXfmiJZjb250ZW506IqC54K55pyq6K6+572uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucmFua1Njcm9sbFZpZXcuY29udGVudDtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW47XG4gICAgICAgIFxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPluWIl+ihqOmhueeahOWkp+Wwj++8iOS9v+eUqOesrOS4gOS4quWIl+ihqOmhueS9nOS4uuWPguiAg++8iVxuICAgICAgICBjb25zdCBpdGVtID0gY2hpbGRyZW5bMF07XG4gICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSBpdGVtLmhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPlnZpZXfoioLngrnlrr3luqZcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMucmFua1Njcm9sbFZpZXcubm9kZS5nZXRDaGlsZEJ5TmFtZSgndmlldycpO1xuICAgICAgICBpZiAoIXZpZXcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+acquaJvuWIsHZpZXfoioLngrknKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB2aWV3LndpZHRoO1xuICAgICAgICBcbiAgICAgICAgLy8g5YiX6KGo6aG55LmL6Ze055qE5Z6C55u06Ze06LedXG4gICAgICAgIGNvbnN0IHZlcnRpY2FsU3BhY2luZyA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyDliJfooajpobnnmoTlhoXovrnot51cbiAgICAgICAgY29uc3QgeVBhZGRpbmcgPSAxMDsgLy8geeaWueWQkeWGhei+uei3nVxuICAgICAgICBcbiAgICAgICAgLy8g6K6h566XY29udGVudOeahOaAu+mrmOW6pu+8jOiAg+iZkXnmlrnlkJFwYWRkaW5nXG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gY2hpbGRyZW4ubGVuZ3RoICogaXRlbUhlaWdodCArIChjaGlsZHJlbi5sZW5ndGggLSAxKSAqIHZlcnRpY2FsU3BhY2luZyArIDIgKiB5UGFkZGluZztcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9rmNvbnRlbnTnmoTlpKflsI/vvIzlrr3luqbkuI52aWV35LiA6Ie0XG4gICAgICAgIGNvbnRhaW5lci53aWR0aCA9IHZpZXdXaWR0aDtcbiAgICAgICAgY29udGFpbmVyLmhlaWdodCA9IHRvdGFsSGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572uY29udGVudOeahOmUmueCueS4uuW3puS4iuinklxuICAgICAgICBjb250YWluZXIuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclkgPSAxO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572u5YiX6KGo6aG555qE5L2N572u77yI5Z6C55u05biD5bGA77yM5bGF5Lit5pi+56S677yJXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAvLyDorr7nva7liJfooajpobnnmoTkvY3nva7vvIzku47pobbpg6jlvIDlp4vmjpLliJfvvIzogIPomZF55pa55ZCRcGFkZGluZ+WSjOWIl+ihqOmhuemrmOW6plxuICAgICAgICAgICAgY2hpbGQueSA9IC15UGFkZGluZyAtIGl0ZW1IZWlnaHQgLyAyIC0gaSAqIChpdGVtSGVpZ2h0ICsgdmVydGljYWxTcGFjaW5nKTtcbiAgICAgICAgICAgIC8vIGNvbnRlbnQg55qEIGFuY2hvclgg5pivIDAuNe+8jOWtkOmhuSB4PTAg5omN5piv5bGF5Lit44CCXG4gICAgICAgICAgICBjaGlsZC54ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawU2Nyb2xsVmlld+eahGNvbnRlbnTlgY/np7vvvIznoa7kv53mmL7npLrpobbpg6jlhoXlrrlcbiAgICAgICAgaWYgKHRoaXMucmFua1Njcm9sbFZpZXcuc2Nyb2xsVG9Ub3ApIHtcbiAgICAgICAgICAgIHRoaXMucmFua1Njcm9sbFZpZXcuc2Nyb2xsVG9Ub3AoMC4xKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmmL7npLrlvZPliY3nlKjmiLfkv6Hmga9cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3dTZWxmSW5mbygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3Qgc2VsZk5hbWUgPSB0aGlzLmdldFNlbGZOYW1lKCk7XG4gICAgICAgIGNvbnN0IGxvY2FsQmVzdERpc3RhbmNlID0gdGhpcy5nZXRMb2NhbEJlc3REaXN0YW5jZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5p+l5om+5b2T5YmN55So5oi35Zyo5o6S6KGM5qac5Lit55qE5o6S5ZCNXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVc2VyID0gdXNlcklkXG4gICAgICAgICAgICA/IHRoaXMucmFua0RhdGEuZmluZCh1c2VyID0+IHVzZXIuYWNjb3VudElkID09PSB1c2VySWQpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIGNvbnN0IHNlbGZSYW5rID0gY3VycmVudFVzZXIgPyBjdXJyZW50VXNlci5yYW5rIDogdGhpcy5yYW5rRGF0YS5sZW5ndGggKyAxO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuc2VsZk5hbWVMYWJlbCkgdGhpcy5zZWxmTmFtZUxhYmVsLnN0cmluZyA9IHNlbGZOYW1lO1xuICAgICAgICBpZiAodGhpcy5zZWxmTGV2ZWxMYWJlbCkgdGhpcy5zZWxmTGV2ZWxMYWJlbC5zdHJpbmcgPSBsb2NhbEJlc3REaXN0YW5jZS50b1N0cmluZygpO1xuICAgICAgICBpZiAodGhpcy5zZWxmUmFua0xhYmVsKSB0aGlzLnNlbGZSYW5rTGFiZWwuc3RyaW5nID0gc2VsZlJhbmsudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5YWz6Zet5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICovXG4gICAgcHJpdmF0ZSBvbkNsb3NlQ2xpY2soKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pi+56S65o6S6KGM5qacXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHNob3coKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIOavj+asoeaYvuekuuaXtuWIt+aWsOaVsOaNrlxuICAgICAgICBhd2FpdCB0aGlzLmluaXRSYW5rRGF0YSgpO1xuICAgICAgICB0aGlzLmluaXRSYW5rTGlzdCgpO1xuICAgICAgICB0aGlzLnNob3dTZWxmSW5mbygpO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6ZqQ6JeP5o6S6KGM5qacXG4gICAgICovXG4gICAgcHVibGljIGhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEFjY291bnRJZChpdGVtOiBhbnksIGZhbGxiYWNrSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmIChpdGVtICYmIGl0ZW0uYWNjb3VudElkICE9PSB1bmRlZmluZWQgJiYgaXRlbS5hY2NvdW50SWQgIT09IG51bGwpIHJldHVybiBTdHJpbmcoaXRlbS5hY2NvdW50SWQpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnVzZXJfaWQgIT09IHVuZGVmaW5lZCAmJiBpdGVtLnVzZXJfaWQgIT09IG51bGwpIHJldHVybiBTdHJpbmcoaXRlbS51c2VyX2lkKTtcbiAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5vcGVuaWQgIT09IHVuZGVmaW5lZCAmJiBpdGVtLm9wZW5pZCAhPT0gbnVsbCkgcmV0dXJuIFN0cmluZyhpdGVtLm9wZW5pZCk7XG4gICAgICAgIHJldHVybiAndW5rbm93bl8nICsgZmFsbGJhY2tJbmRleDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFVzZXJJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTTFNfVVNFUl9JRCcpIHx8ICcnO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2VsZk5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcbiAgICAgICAgcmV0dXJuIHVzZXJJZCA/ICfnjqnlrrYnICsgdXNlcklkIDogJ+eOqeWutic7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRMb2NhbEJlc3REaXN0YW5jZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xuICAgICAgICBjb25zdCBzY29wZWRLZXkgPSB1c2VySWQgPyAnV2FycmlvclJ1bkJlc3REaXN0YW5jZV8nICsgdXNlcklkIDogJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2UnO1xuICAgICAgICBjb25zdCByYXcgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oc2NvcGVkS2V5KSB8fCBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2UnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9EaXN0YW5jZShyYXcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdG9EaXN0YW5jZSh2YWx1ZTogYW55KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGguZmxvb3IoTnVtYmVyKHZhbHVlKSB8fCAwKSk7XG4gICAgfVxuXG4gICAgLy/mjpLooYzmppzor7fmsYJcbiAgICBhc3luYyBwb3N0UmFuayhhcHBpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3BheS5zenZpLWJvLmNvbS92MS90ZXN0YXBwL1JhbmtMaXN0XCI7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT07op6PmnpDplJnor686ICR7ZS5tZXNzYWdlfWApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFDplJnor686ICR7eGhyLnN0YXR1c31gKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCfnvZHnu5zor7fmsYLlpLHotKUnKSk7XG4gICAgICAgICAgICB4aHIub250aW1lb3V0ID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC6LaF5pe2JykpO1xuXG4gICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh7IGFwcGlkIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19