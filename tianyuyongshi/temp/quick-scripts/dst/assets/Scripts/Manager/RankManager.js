
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcUmFua01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBRTFDLDZDQUF5QztBQUN6QyxpREFBNkM7QUFJN0M7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFtUkM7UUFqUkcsaUJBQVcsR0FBYyxJQUFJLENBQUM7UUFHOUIsb0JBQWMsR0FBa0IsSUFBSSxDQUFDO1FBR3JDLG9CQUFjLEdBQWMsSUFBSSxDQUFDO1FBR2pDLG1CQUFhLEdBQWEsSUFBSSxDQUFDO1FBRy9CLG1CQUFhLEdBQWEsSUFBSSxDQUFDO1FBRy9CLG9CQUFjLEdBQWEsSUFBSSxDQUFDO1FBRWhDLFVBQVU7UUFDRixjQUFRLEdBQXVELEVBQUUsQ0FBQzs7SUErUDlFLENBQUM7SUE3UG1CLDRCQUFNLEdBQXRCO3VDQUEwQixPQUFPOzs7O3dCQUM3QixjQUFjO3dCQUNkLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO3lCQUM5RDt3QkFFRCxXQUFXO3dCQUNYLHFCQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQTs7d0JBRHpCLFdBQVc7d0JBQ1gsU0FBeUIsQ0FBQzt3QkFFMUIsV0FBVzt3QkFDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBRXBCLFdBQVc7d0JBQ1gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzs7OztLQUN2QjtJQUVEOztPQUVHO0lBQ1csa0NBQVksR0FBMUI7dUNBQThCLE9BQU87Ozs7Ozt3QkFHZCxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFNLENBQUMsRUFBQTs7d0JBQXBD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LENBQUM7dURBQ2E7SUFHckM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzt1REFDYTtJQUdqQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3NEQUNZO0lBRy9CO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7c0RBQ1k7SUFHL0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt1REFDYTtJQWpCZixXQUFXO1FBRC9CLE9BQU87T0FDYSxXQUFXLENBbVIvQjtJQUFELGtCQUFDO0NBblJELEFBbVJDLENBblJ3QyxFQUFFLENBQUMsU0FBUyxHQW1ScEQ7a0JBblJvQixXQUFXIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICdjb25zb2xlJztcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XG5pbXBvcnQgeyBBUFBfSUQgfSBmcm9tICcuLi9Db21tb24vQXBwQ29uZmlnJztcblxuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmFua01hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pIFxuICAgIGNsb3NlQnV0dG9uOiBjYy5CdXR0b24gPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlNjcm9sbFZpZXcpIFxuICAgIHJhbmtTY3JvbGxWaWV3OiBjYy5TY3JvbGxWaWV3ID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5QcmVmYWIpIFxuICAgIHJhbmtJdGVtUHJlZmFiOiBjYy5QcmVmYWIgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSBcbiAgICBzZWxmUmFua0xhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIFxuICAgIHNlbGZOYW1lTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIFxuICAgIHNlbGZMZXZlbExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgXG4gICAgLy8g5o6S6KGM5qac5pWw5o2u57uT5p6EXG4gICAgcHJpdmF0ZSByYW5rRGF0YTogQXJyYXk8e3Jhbms6IG51bWJlciwgbmFtZTogc3RyaW5nLCBsZXZlbDogbnVtYmVyfT4gPSBbXTtcbiAgICBcbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25Mb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyDliJ3lp4vljJblhbPpl63mjInpkq7ngrnlh7vkuovku7ZcbiAgICAgICAgaWYgKHRoaXMuY2xvc2VCdXR0b24pIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24ubm9kZS5vbignY2xpY2snLCB0aGlzLm9uQ2xvc2VDbGljaywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWIneWni+WMluaOkuihjOamnOaVsOaNrlxuICAgICAgICBhd2FpdCB0aGlzLmluaXRSYW5rRGF0YSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yid5aeL5YyW5o6S6KGM5qac5YiX6KGoXG4gICAgICAgIHRoaXMuaW5pdFJhbmtMaXN0KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrlvZPliY3nlKjmiLfkv6Hmga9cbiAgICAgICAgdGhpcy5zaG93U2VsZkluZm8oKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyW5o6S6KGM5qac5pWw5o2uXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0UmFua0RhdGEoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIOS7juacjeWKoeWZqOiOt+WPluaOkuihjOamnOaVsOaNrlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5wb3N0UmFuayhBUFBfSUQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJwb3N0UmFuazpcIiwgcmVzdWx0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHJlc3VsdC5jb2RlID09PSAwICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN55So5oi355qEbmFtZeagh+ivhlxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxmTmFtZSA9IGDnjqnlrrYke3VzZXJJZH1gO1xuICAgICAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeUqOaIt+eahOacgOmrmOino+mUgeWFs+WNoeaVsFxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRIaWdoZXN0TGV2ZWwgPSBtR2FtZURhdGEuZ2V0SGlnaGVzdFVubG9ja2VkTGV2ZWwoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlpITnkIbov5Tlm57nmoTmlbDmja7vvIzlsIblhbbovazmjaLkuLrnrKblkIjopoHmsYLnmoTmoLzlvI9cbiAgICAgICAgICAgICAgICB0aGlzLnJhbmtEYXRhID0gcmVzdWx0LmRhdGEubWFwKChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5piv5b2T5YmN55So5oi377yM5pu05pawdG90YWxMb2dpbk51beS4uuW9k+WJjeacgOmrmOWFs+WNoeaVsCsx77yI5Zug5Li6bGV2ZWwgPSB0b3RhbExvZ2luTnVt77yJXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChg546p5a62JHtpdGVtLmFjY291bnRJZH1gID09PSBzZWxmTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgaXRlbS50b3RhbExvZ2luTnVtID0gY3VycmVudEhpZ2hlc3RMZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbms6IGluZGV4ICsgMSwgLy8g5bqP5YiX5YC8KzHkvZzkuLrmjpLlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGDnjqnlrrYke2l0ZW0uYWNjb3VudElkfWAsIC8vIFwi546p5a62XCLliqDkuIphY2NvdW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBpdGVtLnRvdGFsTG9naW5OdW0gKyAxIC8vIHRvdGFsTG9naW5OdW0tMeS9nOS4uuetiee6p1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmnI3liqHlmajov5Tlm57plJnor6/miJbmsqHmnInmlbDmja7vvIzkvb/nlKjnqbrmlbDnu4RcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmtEYXRhID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi6I635Y+W5o6S6KGM5qac5pWw5o2u5aSx6LSlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICAvLyDlj5HnlJ/plJnor6/ml7bkvb/nlKjnqbrmlbDnu4RcbiAgICAgICAgICAgIHRoaXMucmFua0RhdGEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5b2T5YmN55So5oi35Yiw5o6S6KGM5qacXG4gICAgICAgIC8vIHRoaXMuYWRkQ3VycmVudFVzZXJUb1JhbmsoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyW5o6S6KGM5qac5YiX6KGoXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbml0UmFua0xpc3QoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5yYW5rU2Nyb2xsVmlldyB8fCAhdGhpcy5yYW5rSXRlbVByZWZhYikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5o6S6KGM5qacU2Nyb2xsVmlld+aIlumihOWItuS9k+acquiuvue9ricpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLnJhbmtTY3JvbGxWaWV3LmNvbnRlbnQ7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBkYXRhIG9mIHRoaXMucmFua0RhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmtJdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5yYW5rSXRlbVByZWZhYik7XG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2hpbGQocmFua0l0ZW0pO1xuICAgICAgICAgICAgdGhpcy5zZXR1cFJhbmtJdGVtKHJhbmtJdGVtLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawU2Nyb2xsVmlld+WGheWuueWkp+Wwj1xuICAgICAgICB0aGlzLnVwZGF0ZVNjcm9sbFZpZXdDb250ZW50U2l6ZSgpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDorr7nva7mjpLooYzmppzliJfooajpoblcbiAgICAgKiBAcGFyYW0gaXRlbSDliJfooajpobnoioLngrlcbiAgICAgKiBAcGFyYW0gZGF0YSDliJfooajpobnmlbDmja5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNldHVwUmFua0l0ZW0oaXRlbTogY2MuTm9kZSwgZGF0YToge3Jhbms6IG51bWJlciwgbmFtZTogc3RyaW5nLCBsZXZlbDogbnVtYmVyfSk6IHZvaWQge1xuICAgICAgICAvLyDojrflj5bliJfooajpobnkuK3nmoRMYWJlbOe7hOS7tlxuICAgICAgICBjb25zdCByYW5rTGFiZWwgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdsX3JhbmsnKS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjb25zdCBuYW1lTGFiZWwgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdsX25hbWUnKS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjb25zdCBsZXZlbExhYmVsID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnbF9sZXZlbCcpLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIFxuICAgICAgICBpZiAocmFua0xhYmVsKSByYW5rTGFiZWwuc3RyaW5nID0gZGF0YS5yYW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmIChuYW1lTGFiZWwpIG5hbWVMYWJlbC5zdHJpbmcgPSBkYXRhLm5hbWU7XG4gICAgICAgIGlmIChsZXZlbExhYmVsKSBsZXZlbExhYmVsLnN0cmluZyA9IGRhdGEubGV2ZWwudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pu05pawU2Nyb2xsVmlld+WGheWuueWkp+Wwj1xuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlU2Nyb2xsVmlld0NvbnRlbnRTaXplKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMucmFua1Njcm9sbFZpZXcgfHwgIXRoaXMucmFua1Njcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlld+aIlmNvbnRlbnToioLngrnmnKrorr7nva4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5yYW5rU2Nyb2xsVmlldy5jb250ZW50O1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlbjtcbiAgICAgICAgXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W5YiX6KGo6aG555qE5aSn5bCP77yI5L2/55So56ys5LiA5Liq5YiX6KGo6aG55L2c5Li65Y+C6ICD77yJXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBjaGlsZHJlblswXTtcbiAgICAgICAgY29uc3QgaXRlbVdpZHRoID0gaXRlbS53aWR0aDtcbiAgICAgICAgY29uc3QgaXRlbUhlaWdodCA9IGl0ZW0uaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+Wdmlld+iKgueCueWuveW6plxuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5yYW5rU2Nyb2xsVmlldy5ub2RlLmdldENoaWxkQnlOYW1lKCd2aWV3Jyk7XG4gICAgICAgIGlmICghdmlldykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5pyq5om+5Yiwdmlld+iKgueCuScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZpZXdXaWR0aCA9IHZpZXcud2lkdGg7XG4gICAgICAgIFxuICAgICAgICAvLyDliJfooajpobnkuYvpl7TnmoTlnoLnm7Tpl7Tot51cbiAgICAgICAgY29uc3QgdmVydGljYWxTcGFjaW5nID0gMTA7XG4gICAgICAgIFxuICAgICAgICAvLyDliJfooajpobnnmoTlhoXovrnot51cbiAgICAgICAgY29uc3QgeFBhZGRpbmcgPSAwOyAvLyB45pa55ZCR5YaF6L656LedXG4gICAgICAgIGNvbnN0IHlQYWRkaW5nID0gMTA7IC8vIHnmlrnlkJHlhoXovrnot51cbiAgICAgICAgXG4gICAgICAgIC8vIOiuoeeul2NvbnRlbnTnmoTmgLvpq5jluqbvvIzogIPomZF55pa55ZCRcGFkZGluZ1xuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9IGNoaWxkcmVuLmxlbmd0aCAqIGl0ZW1IZWlnaHQgKyAoY2hpbGRyZW4ubGVuZ3RoIC0gMSkgKiB2ZXJ0aWNhbFNwYWNpbmcgKyAyICogeVBhZGRpbmc7XG4gICAgICAgIFxuICAgICAgICAvLyDorr7nva5jb250ZW5055qE5aSn5bCP77yM5a695bqm5LiOdmlld+S4gOiHtFxuICAgICAgICBjb250YWluZXIud2lkdGggPSB2aWV3V2lkdGg7XG4gICAgICAgIGNvbnRhaW5lci5oZWlnaHQgPSB0b3RhbEhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9rmNvbnRlbnTnmoTplJrngrnkuLrlt6bkuIrop5JcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JZID0gMTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruWIl+ihqOmhueeahOS9jee9ru+8iOWeguebtOW4g+WxgO+8jOWxheS4reaYvuekuu+8iVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgLy8g6K6+572u5YiX6KGo6aG555qE5L2N572u77yM5LuO6aG26YOo5byA5aeL5o6S5YiX77yM6ICD6JmReeaWueWQkXBhZGRpbmflkozliJfooajpobnpq5jluqZcbiAgICAgICAgICAgIGNoaWxkLnkgPSAteVBhZGRpbmcgLSBpdGVtSGVpZ2h0IC8gMiAtIGkgKiAoaXRlbUhlaWdodCArIHZlcnRpY2FsU3BhY2luZyk7XG4gICAgICAgICAgICAvLyDlsYXkuK3mmL7npLrvvIzogIPomZF45pa55ZCRcGFkZGluZ++8mih2aWV35a695bqmIC0g5YiX6KGo6aG55a695bqmIC0gMiAqIHhQYWRkaW5nKSAvIDIgKyB4UGFkZGluZ1xuICAgICAgICAgICAgY2hpbGQueCA9ICh2aWV3V2lkdGggLSBpdGVtV2lkdGggLSAyICogeFBhZGRpbmcpIC8gMiA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsFNjcm9sbFZpZXfnmoRjb250ZW505YGP56e777yM56Gu5L+d5pi+56S66aG26YOo5YaF5a65XG4gICAgICAgIGlmICh0aGlzLnJhbmtTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKSB7XG4gICAgICAgICAgICB0aGlzLnJhbmtTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDAuMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5bCG5b2T5YmN55So5oi35re75Yqg5Yiw5o6S6KGM5qac5bm26YeN5paw6K6h566X5o6S5ZCNXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDdXJyZW50VXNlclRvUmFuaygpOiB2b2lkIHtcbiAgICAgICAgLy8g5LuOR2FtZURhdGHojrflj5bnnJ/lrp7nlKjmiLfmlbDmja5cbiAgICAgICAgY29uc3QgdXNlcklkID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTTFNfVVNFUl9JRCcpO1xuICAgICAgICBjb25zdCBzZWxmTmFtZSA9ICfnjqnlrrYnICsgdXNlcklkO1xuICAgICAgICBjb25zdCBzZWxmTGV2ZWwgPSBtR2FtZURhdGEuZ2V0SGlnaGVzdFVubG9ja2VkTGV2ZWwoKTsgLy8g5LuOR2FtZURhdGHojrflj5bmnIDlpKfpgJrlhbPlhbPljaHmlbBcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuW9k+WJjeeUqOaIt+WvueixoVxuICAgICAgICBjb25zdCBjdXJyZW50VXNlciA9IHsgcmFuazogMCwgbmFtZTogc2VsZk5hbWUsIGxldmVsOiBzZWxmTGV2ZWwgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWwhuW9k+WJjeeUqOaIt+a3u+WKoOWIsOaOkuihjOamnOaVsOe7hFxuICAgICAgICB0aGlzLnJhbmtEYXRhLnB1c2goY3VycmVudFVzZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u5YWz5Y2h5pWw6ZmN5bqP5o6S5bqPXG4gICAgICAgIHRoaXMucmFua0RhdGEuc29ydCgoYSwgYikgPT4gYi5sZXZlbCAtIGEubGV2ZWwpO1xuICAgICAgICBcbiAgICAgICAgLy8g6YeN5paw6K6h566X5o6S5ZCNXG4gICAgICAgIHRoaXMucmFua0RhdGEuZm9yRWFjaCgodXNlciwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHVzZXIucmFuayA9IGluZGV4ICsgMTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOaYvuekuuW9k+WJjeeUqOaIt+S/oeaBr1xuICAgICAqL1xuICAgIHByaXZhdGUgc2hvd1NlbGZJbmZvKCk6IHZvaWQge1xuICAgICAgICAvLyDku45HYW1lRGF0YeiOt+WPluecn+WunueUqOaIt+aVsOaNrlxuICAgICAgICBjb25zdCB1c2VySWQgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XG4gICAgICAgIGNvbnN0IHNlbGZOYW1lID0gJ+eOqeWuticgKyB1c2VySWQ7XG4gICAgICAgIGNvbnN0IHNlbGZMZXZlbCA9IG1HYW1lRGF0YS51bmxvY2tlZExldmVsIDsgLy8g5LuOR2FtZURhdGHojrflj5bmnIDlpKfpgJrlhbPlhbPljaHmlbBcbiAgICAgICAgXG4gICAgICAgIC8vIOafpeaJvuW9k+WJjeeUqOaIt+WcqOaOkuihjOamnOS4reeahOaOkuWQjVxuICAgICAgICBjb25zdCBjdXJyZW50VXNlciA9IHRoaXMucmFua0RhdGEuZmluZCh1c2VyID0+IHVzZXIubmFtZSA9PT0gc2VsZk5hbWUpO1xuICAgICAgICBjb25zdCBzZWxmUmFuayA9IGN1cnJlbnRVc2VyID8gY3VycmVudFVzZXIucmFuayA6IHRoaXMucmFua0RhdGEubGVuZ3RoICsgMTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnNlbGZOYW1lTGFiZWwpIHRoaXMuc2VsZk5hbWVMYWJlbC5zdHJpbmcgPSBzZWxmTmFtZTtcbiAgICAgICAgaWYgKHRoaXMuc2VsZkxldmVsTGFiZWwpIHRoaXMuc2VsZkxldmVsTGFiZWwuc3RyaW5nID0gc2VsZkxldmVsLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmICh0aGlzLnNlbGZSYW5rTGFiZWwpIHRoaXMuc2VsZlJhbmtMYWJlbC5zdHJpbmcgPSBzZWxmUmFuay50b1N0cmluZygpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDlhbPpl63mjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uQ2xvc2VDbGljaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmmL7npLrmjpLooYzmppxcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIC8vIOavj+asoeaYvuekuuaXtuWIt+aWsOaVsOaNrlxuICAgICAgICBhd2FpdCB0aGlzLmluaXRSYW5rRGF0YSgpO1xuICAgICAgICB0aGlzLmluaXRSYW5rTGlzdCgpO1xuICAgICAgICB0aGlzLnNob3dTZWxmSW5mbygpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDpmpDol4/mjpLooYzmppxcbiAgICAgKi9cbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8v5o6S6KGM5qac6K+35rGCXG4gICAgYXN5bmMgcG9zdFJhbmsoYXBwaWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9SYW5rTGlzdFwiO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBKU09O6Kej5p6Q6ZSZ6K+vOiAke2UubWVzc2FnZX1gKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQ6ZSZ6K+vOiAke3hoci5zdGF0dXN9YCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcign572R57uc6K+35rGC5aSx6LSlJykpO1xuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ+e9kee7nOivt+axgui2heaXticpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBhcHBpZCB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==