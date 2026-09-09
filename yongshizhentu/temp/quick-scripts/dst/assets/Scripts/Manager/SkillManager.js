
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/SkillManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '0b0efziZdpEPJzoE7OOHse1', 'SkillManager');
// Scripts/Manager/SkillManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameData_1 = require("../Load/GameData");
var TipsManager_1 = require("../Load/TipsManager");
var UserDataSyncManager_1 = require("./UserDataSyncManager");
var SkillManager = /** @class */ (function (_super) {
    __extends(SkillManager, _super);
    function SkillManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeButton = null;
        _this.scrollView = null;
        _this.skillItemPrefab = null;
        // 技能数据结构
        _this.skills = [];
        return _this;
    }
    SkillManager.prototype.onLoad = function () {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
    };
    /**
     * 初始化技能数据
     */
    SkillManager.prototype.initSkills = function () {
        GameData_1.default.GetSkillsData();
        // 从 GameData 获取技能数据，如果没有则使用默认数据
        if (GameData_1.default.skills && GameData_1.default.skills.length > 0) {
            this.skills = GameData_1.default.skills;
        }
    };
    /**
     * 刷新滚动列表
     */
    SkillManager.prototype.refreshScrollView = function () {
        if (!this.scrollView || !this.skillItemPrefab || !this.scrollView.content) {
            console.error('ScrollView or skillItemPrefab not assigned');
            return;
        }
        // 清空容器
        this.scrollView.content.removeAllChildren();
        // 遍历技能数据，创建技能项
        for (var i = 0; i < this.skills.length; i++) {
            var skillData = this.skills[i];
            // 创建技能项节点
            var skillItem = cc.instantiate(this.skillItemPrefab);
            this.scrollView.content.addChild(skillItem);
            // 设置技能项数据
            this.setSkillItemData(skillItem, skillData);
        }
        // 调整容器大小
        this.adjustContainerSize();
    };
    /**
     * 设置技能项数据
     */
    SkillManager.prototype.setSkillItemData = function (skillItem, skillData) {
        var _this = this;
        // 找到各个节点
        var iconNode = skillItem.getChildByName('icon');
        var nameNode = skillItem.getChildByName('name');
        var descriptionNode = skillItem.getChildByName('description');
        var nextLevelNode = skillItem.getChildByName('nextLevel');
        var upgrade = skillItem.getChildByName("upgrade");
        var upgradeButton = upgrade.getComponent(cc.Button);
        var costNode = upgrade.getChildByName('cost');
        // 设置图标
        if (iconNode) {
            var spriteComponent_1 = iconNode.getComponent(cc.Sprite);
            if (spriteComponent_1) {
                var iconPath_1 = "zImg2/" + skillData.icon;
                cc.loader.loadRes(iconPath_1, cc.SpriteFrame, function (err, spriteFrame) {
                    if (err) {
                        console.error("\u52A0\u8F7D" + iconPath_1 + "\u5931\u8D25:", err);
                    }
                    else {
                        spriteComponent_1.spriteFrame = spriteFrame;
                    }
                });
            }
        }
        // 设置技能名称和等级
        if (nameNode) {
            nameNode.getComponent(cc.Label).string = skillData.name + " " + skillData.level + "\u7EA7";
        }
        // 设置技能描述和等级加成
        if (descriptionNode) {
            var currentEffect = skillData.baseEffect + (skillData.level - 1) * skillData.effectPerLevel;
            descriptionNode.getComponent(cc.Label).string = skillData.description + "\n\u5F53\u524D\u6548\u679C\uFF1A+" + currentEffect;
        }
        // 设置下一级效果
        if (nextLevelNode) {
            if (skillData.level >= skillData.maxLevel) {
                nextLevelNode.getComponent(cc.Label).string = '已满级';
            }
            else {
                var nextEffect = skillData.baseEffect + skillData.level * skillData.effectPerLevel;
                var effectIncrease = skillData.effectPerLevel;
                nextLevelNode.getComponent(cc.Label).string = "\u4E0B\u7EA7\u6548\u679C\uFF1A+" + effectIncrease;
            }
        }
        // 设置升级成本
        if (costNode) {
            if (skillData.level >= skillData.maxLevel) {
                costNode.getComponent(cc.Label).string = '已满级';
            }
            else {
                var currentCost = skillData.upgradeCost + (skillData.level - 1) * skillData.costIncreasePerLevel;
                costNode.getComponent(cc.Label).string = "" + currentCost;
            }
        }
        // 设置升级按钮
        if (upgradeButton) {
            if (skillData.level >= skillData.maxLevel) {
                // 已满级，禁用按钮
                upgradeButton.interactable = false;
                // 设置按钮为灰色
                var buttonSprite = upgradeButton.node.getComponent(cc.Sprite);
                if (buttonSprite) {
                    buttonSprite.node.color = cc.Color.GRAY;
                }
            }
            else {
                // 未满级，设置按钮点击事件
                upgradeButton.interactable = true;
                upgradeButton.node.on(cc.Node.EventType.TOUCH_END, function () { return _this.onUpgradeClick(skillData.id); }, this);
            }
        }
    };
    /**
     * 调整容器大小
     */
    SkillManager.prototype.adjustContainerSize = function () {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        var container = this.scrollView.content;
        var children = container.children;
        if (children.length === 0) {
            return;
        }
        // 获取技能项的大小（使用第一个技能项作为参考）
        var item = children[0];
        var itemWidth = item.width;
        var itemHeight = item.height;
        // 获取view节点宽度
        var view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        var viewWidth = view.width;
        // 技能项之间的垂直间距
        var verticalSpacing = 15;
        // 技能项的内边距
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
        // 设置技能项的位置（垂直布局，居中显示）
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            // 设置技能项的位置，从顶部开始排列，考虑y方向padding和技能项高度
            child.y = -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing);
            // 居中显示，考虑x方向padding：(view宽度 - 技能项宽度 - 2 * xPadding) / 2 + xPadding
            child.x = (viewWidth - itemWidth - 2 * xPadding) / 2 - 10;
        }
        // 更新ScrollView的content偏移，确保显示顶部内容
        // if (this.scrollView.scrollToTop) {
        //     this.scrollView.scrollToTop(0.1);
        // }
    };
    /**
     * 升级按钮点击事件
     */
    SkillManager.prototype.onUpgradeClick = function (skillId) {
        // 找到对应的技能
        var skill = this.skills.find(function (s) { return s.id === skillId; });
        if (!skill)
            return;
        // 检查是否已满级
        if (skill.level >= skill.maxLevel) {
            console.log('技能已满级');
            return;
        }
        // 计算升级成本
        var upgradeCost = skill.upgradeCost + (skill.level - 1) * skill.costIncreasePerLevel;
        // 检查钻石是否足够
        if (GameData_1.default.currentGold < upgradeCost) {
            console.log('钻石不足');
            // 显示钻石不足提示
            this.showToast('钻石不足。');
            return;
        }
        // 扣除钻石
        GameData_1.default.currentGold -= upgradeCost;
        // 提升技能等级
        skill.level++;
        // 保存技能数据
        GameData_1.default.skills = this.skills;
        GameData_1.default.SaveSkillsData();
        // 保存钻石数量
        GameData_1.default.SaveGoldData();
        UserDataSyncManager_1.default.requestUpload();
        // 更新钻石数量
        this.updateDiamondLabel();
        // 通知主界面钻石数量更新
        cc.director.emit('goldUpdated');
        // 刷新滚动列表
        this.refreshScrollView();
        // 显示升级成功提示
        this.showToast('升级成功。');
    };
    /**
     * 关闭按钮点击事件
     */
    SkillManager.prototype.onCloseClick = function () {
        this.node.active = false;
    };
    /**
     * 更新钻石数量显示
     */
    SkillManager.prototype.updateDiamondLabel = function () {
        // if (this.diamondLabel) {
        //     this.diamondLabel.string = mGameData.currentGold.toString();
        // }
    };
    /**
     * 显示提示信息
     */
    SkillManager.prototype.showToast = function (message) {
        // 这里可以实现一个简单的提示框
        // console.log(message);
        // 实际项目中可以使用更复杂的提示系统
        TipsManager_1.default.show(message);
    };
    /**
     * 显示技能强化界面
     */
    SkillManager.prototype.show = function () {
        // 刷新技能数据
        this.initSkills();
        // 刷新滚动列表
        this.refreshScrollView();
        // 更新钻石数量
        this.updateDiamondLabel();
        this.node.active = true;
    };
    /**
     * 隐藏技能强化界面
     */
    SkillManager.prototype.hide = function () {
        this.node.active = false;
    };
    __decorate([
        property(cc.Button)
    ], SkillManager.prototype, "closeButton", void 0);
    __decorate([
        property(cc.ScrollView)
    ], SkillManager.prototype, "scrollView", void 0);
    __decorate([
        property(cc.Prefab)
    ], SkillManager.prototype, "skillItemPrefab", void 0);
    SkillManager = __decorate([
        ccclass
    ], SkillManager);
    return SkillManager;
}(cc.Component));
exports.default = SkillManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcU2tpbGxNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUMxQyw2Q0FBeUM7QUFDekMsbURBQThDO0FBQzlDLDZEQUF3RDtBQUd4RDtJQUEwQyxnQ0FBWTtJQUF0RDtRQUFBLHFFQW9UQztRQWxURyxpQkFBVyxHQUFjLElBQUksQ0FBQztRQUc5QixnQkFBVSxHQUFrQixJQUFJLENBQUM7UUFHakMscUJBQWUsR0FBYyxJQUFJLENBQUM7UUFHbEMsU0FBUztRQUNELFlBQU0sR0FXVCxFQUFFLENBQUM7O0lBNlJaLENBQUM7SUEzUmEsNkJBQU0sR0FBaEI7UUFDSSxjQUFjO1FBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5RDtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLGlDQUFVLEdBQWxCO1FBQ0ksa0JBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQixnQ0FBZ0M7UUFDaEMsSUFBSSxrQkFBUyxDQUFDLE1BQU0sSUFBSSxrQkFBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsa0JBQVMsQ0FBQyxNQUFNLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBR0Q7O09BRUc7SUFDSyx3Q0FBaUIsR0FBekI7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUN2RSxPQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDNUQsT0FBTztTQUNWO1FBRUQsT0FBTztRQUNQLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFNUMsZUFBZTtRQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWpDLFVBQVU7WUFDVixJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFNUMsVUFBVTtZQUNWLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDL0M7UUFFRCxTQUFTO1FBQ1QsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0ssdUNBQWdCLEdBQXhCLFVBQXlCLFNBQWtCLEVBQUUsU0FBYztRQUEzRCxpQkF3RUM7UUF2RUcsU0FBUztRQUNULElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hFLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUQsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNuRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE9BQU87UUFDUCxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQU0saUJBQWUsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxJQUFJLGlCQUFlLEVBQUU7Z0JBQ2pCLElBQU0sVUFBUSxHQUFHLFdBQVMsU0FBUyxDQUFDLElBQU0sQ0FBQztnQkFDM0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBUSxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxHQUFHLEVBQUUsV0FBVztvQkFDekQsSUFBSSxHQUFHLEVBQUU7d0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBSyxVQUFRLGtCQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQzFDO3lCQUFNO3dCQUNILGlCQUFlLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztxQkFDN0M7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7YUFDTjtTQUNKO1FBRUQsWUFBWTtRQUNaLElBQUksUUFBUSxFQUFFO1lBQ1YsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFNLFNBQVMsQ0FBQyxJQUFJLFNBQUksU0FBUyxDQUFDLEtBQUssV0FBRyxDQUFDO1NBQ3BGO1FBRUQsY0FBYztRQUNkLElBQUksZUFBZSxFQUFFO1lBQ2pCLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUM7WUFDOUYsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFNLFNBQVMsQ0FBQyxXQUFXLHlDQUFXLGFBQWUsQ0FBQztTQUN0RztRQUVELFVBQVU7UUFDVixJQUFJLGFBQWEsRUFBRTtZQUNmLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNILElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUNyRixJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUNoRCxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsb0NBQVMsY0FBZ0IsQ0FBQzthQUMzRTtTQUNKO1FBRUQsU0FBUztRQUNULElBQUksUUFBUSxFQUFFO1lBQ1YsSUFBSSxTQUFTLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0gsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDO2dCQUNuRyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBRyxXQUFhLENBQUM7YUFDN0Q7U0FDSjtRQUVELFNBQVM7UUFDVCxJQUFJLGFBQWEsRUFBRTtZQUNmLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxXQUFXO2dCQUNYLGFBQWEsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUNuQyxVQUFVO2dCQUNWLElBQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxZQUFZLEVBQUU7b0JBQ2QsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7aUJBQzNDO2FBQ0o7aUJBQU07Z0JBQ0gsZUFBZTtnQkFDZixhQUFhLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDbEMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBakMsQ0FBaUMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNyRztTQUNKO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssMENBQW1CLEdBQTNCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDekMsT0FBTztTQUNWO1FBRUQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDMUMsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUVwQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87U0FDVjtRQUVELHlCQUF5QjtRQUN6QixJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRS9CLGFBQWE7UUFDYixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0IsT0FBTztTQUNWO1FBQ0QsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUU3QixhQUFhO1FBQ2IsSUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBRTNCLFVBQVU7UUFDVixJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQzdCLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLFNBQVM7UUFFOUIsNkJBQTZCO1FBQzdCLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxlQUFlLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUUxRyx5QkFBeUI7UUFDekIsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDNUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7UUFFL0IsbUJBQW1CO1FBQ25CLFNBQVMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLHNCQUFzQjtRQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsc0NBQXNDO1lBQ3RDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDLENBQUM7WUFDMUUsbUVBQW1FO1lBQ25FLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUMsRUFBRSxDQUFDO1NBQzNEO1FBRUQsa0NBQWtDO1FBQ2xDLHFDQUFxQztRQUNyQyx3Q0FBd0M7UUFDeEMsSUFBSTtJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNLLHFDQUFjLEdBQXRCLFVBQXVCLE9BQWU7UUFDbEMsVUFBVTtRQUNWLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFFbkIsVUFBVTtRQUNWLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsT0FBTztTQUNWO1FBRUQsU0FBUztRQUNULElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztRQUV2RixXQUFXO1FBQ1gsSUFBSSxrQkFBUyxDQUFDLFdBQVcsR0FBRyxXQUFXLEVBQUU7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixXQUFXO1lBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixPQUFPO1NBQ1Y7UUFFRCxPQUFPO1FBQ1Asa0JBQVMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDO1FBRXJDLFNBQVM7UUFDVCxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFZCxTQUFTO1FBQ1Qsa0JBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMvQixrQkFBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTNCLFNBQVM7UUFDVCxrQkFBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pCLDZCQUFtQixDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXBDLFNBQVM7UUFDVCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixjQUFjO1FBQ2QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFaEMsU0FBUztRQUNULElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLFdBQVc7UUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNLLG1DQUFZLEdBQXBCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNLLHlDQUFrQixHQUExQjtRQUNJLDJCQUEyQjtRQUMzQixtRUFBbUU7UUFDbkUsSUFBSTtJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNLLGdDQUFTLEdBQWpCLFVBQWtCLE9BQWU7UUFDN0IsaUJBQWlCO1FBQ2pCLHdCQUF3QjtRQUN4QixvQkFBb0I7UUFDcEIscUJBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksMkJBQUksR0FBWDtRQUNJLFNBQVM7UUFDVCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsU0FBUztRQUNULElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLFNBQVM7UUFDVCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksMkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBalREO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7cURBQ1U7SUFHOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztvREFDUztJQUdqQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO3lEQUNjO0lBUmpCLFlBQVk7UUFEaEMsT0FBTztPQUNhLFlBQVksQ0FvVGhDO0lBQUQsbUJBQUM7Q0FwVEQsQUFvVEMsQ0FwVHlDLEVBQUUsQ0FBQyxTQUFTLEdBb1RyRDtrQkFwVG9CLFlBQVkiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XG5pbXBvcnQgVGlwc01hbmFnZXIgZnJvbSAnLi4vTG9hZC9UaXBzTWFuYWdlcic7XG5pbXBvcnQgVXNlckRhdGFTeW5jTWFuYWdlciBmcm9tICcuL1VzZXJEYXRhU3luY01hbmFnZXInO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2tpbGxNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcbiAgICBAcHJvcGVydHkoY2MuQnV0dG9uKVxuICAgIGNsb3NlQnV0dG9uOiBjYy5CdXR0b24gPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlNjcm9sbFZpZXcpXG4gICAgc2Nyb2xsVmlldzogY2MuU2Nyb2xsVmlldyA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuUHJlZmFiKVxuICAgIHNraWxsSXRlbVByZWZhYjogY2MuUHJlZmFiID0gbnVsbDtcblxuXG4gICAgLy8g5oqA6IO95pWw5o2u57uT5p6EXG4gICAgcHJpdmF0ZSBza2lsbHM6IEFycmF5PHtcbiAgICAgICAgaWQ6IG51bWJlcjtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBsZXZlbDogbnVtYmVyO1xuICAgICAgICBtYXhMZXZlbDogbnVtYmVyO1xuICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgICAgICBpY29uOiBzdHJpbmc7XG4gICAgICAgIGJhc2VFZmZlY3Q6IG51bWJlcjtcbiAgICAgICAgZWZmZWN0UGVyTGV2ZWw6IG51bWJlcjtcbiAgICAgICAgdXBncmFkZUNvc3Q6IG51bWJlcjtcbiAgICAgICAgY29zdEluY3JlYXNlUGVyTGV2ZWw6IG51bWJlcjtcbiAgICB9PiA9IFtdO1xuXG4gICAgcHJvdGVjdGVkIG9uTG9hZCgpOiB2b2lkIHtcbiAgICAgICAgLy8g5Yid5aeL5YyW5YWz6Zet5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICAgIGlmICh0aGlzLmNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm5vZGUub24oJ2NsaWNrJywgdGhpcy5vbkNsb3NlQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyW5oqA6IO95pWw5o2uXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbml0U2tpbGxzKCk6IHZvaWQge1xuICAgICAgICBtR2FtZURhdGEuR2V0U2tpbGxzRGF0YSgpO1xuICAgICAgICAvLyDku44gR2FtZURhdGEg6I635Y+W5oqA6IO95pWw5o2u77yM5aaC5p6c5rKh5pyJ5YiZ5L2/55So6buY6K6k5pWw5o2uXG4gICAgICAgIGlmIChtR2FtZURhdGEuc2tpbGxzICYmIG1HYW1lRGF0YS5za2lsbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5za2lsbHMgPSBtR2FtZURhdGEuc2tpbGxzO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiDliLfmlrDmu5rliqjliJfooahcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZnJlc2hTY3JvbGxWaWV3KCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuc2Nyb2xsVmlldyB8fCAhdGhpcy5za2lsbEl0ZW1QcmVmYWIgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JvbGxWaWV3IG9yIHNraWxsSXRlbVByZWZhYiBub3QgYXNzaWduZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOa4heepuuWuueWZqFxuICAgICAgICB0aGlzLnNjcm9sbFZpZXcuY29udGVudC5yZW1vdmVBbGxDaGlsZHJlbigpO1xuXG4gICAgICAgIC8vIOmBjeWOhuaKgOiDveaVsOaNru+8jOWIm+W7uuaKgOiDvemhuVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2tpbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBza2lsbERhdGEgPSB0aGlzLnNraWxsc1tpXTtcblxuICAgICAgICAgICAgLy8g5Yib5bu65oqA6IO96aG56IqC54K5XG4gICAgICAgICAgICBjb25zdCBza2lsbEl0ZW0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnNraWxsSXRlbVByZWZhYik7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFZpZXcuY29udGVudC5hZGRDaGlsZChza2lsbEl0ZW0pO1xuXG4gICAgICAgICAgICAvLyDorr7nva7mioDog73pobnmlbDmja5cbiAgICAgICAgICAgIHRoaXMuc2V0U2tpbGxJdGVtRGF0YShza2lsbEl0ZW0sIHNraWxsRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDosIPmlbTlrrnlmajlpKflsI9cbiAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJTaXplKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6K6+572u5oqA6IO96aG55pWw5o2uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRTa2lsbEl0ZW1EYXRhKHNraWxsSXRlbTogY2MuTm9kZSwgc2tpbGxEYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8g5om+5Yiw5ZCE5Liq6IqC54K5XG4gICAgICAgIGNvbnN0IGljb25Ob2RlID0gc2tpbGxJdGVtLmdldENoaWxkQnlOYW1lKCdpY29uJyk7XG4gICAgICAgIGNvbnN0IG5hbWVOb2RlID0gc2tpbGxJdGVtLmdldENoaWxkQnlOYW1lKCduYW1lJyk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uTm9kZSA9IHNraWxsSXRlbS5nZXRDaGlsZEJ5TmFtZSgnZGVzY3JpcHRpb24nKTtcbiAgICAgICAgY29uc3QgbmV4dExldmVsTm9kZSA9IHNraWxsSXRlbS5nZXRDaGlsZEJ5TmFtZSgnbmV4dExldmVsJyk7XG4gICAgICAgIGNvbnN0IHVwZ3JhZGUgPSBza2lsbEl0ZW0uZ2V0Q2hpbGRCeU5hbWUoXCJ1cGdyYWRlXCIpXG4gICAgICAgIGNvbnN0IHVwZ3JhZGVCdXR0b24gPSB1cGdyYWRlLmdldENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBjb25zdCBjb3N0Tm9kZSA9IHVwZ3JhZGUuZ2V0Q2hpbGRCeU5hbWUoJ2Nvc3QnKTtcbiAgICAgICAgLy8g6K6+572u5Zu+5qCHXG4gICAgICAgIGlmIChpY29uTm9kZSkge1xuICAgICAgICAgICAgY29uc3Qgc3ByaXRlQ29tcG9uZW50ID0gaWNvbk5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICBpZiAoc3ByaXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWNvblBhdGggPSBgekltZzIvJHtza2lsbERhdGEuaWNvbn1gO1xuICAgICAgICAgICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKGljb25QYXRoLCBjYy5TcHJpdGVGcmFtZSwgKGVyciwgc3ByaXRlRnJhbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5Yqg6L29JHtpY29uUGF0aH3lpLHotKU6YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorr7nva7mioDog73lkI3np7DlkoznrYnnuqdcbiAgICAgICAgaWYgKG5hbWVOb2RlKSB7XG4gICAgICAgICAgICBuYW1lTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGAke3NraWxsRGF0YS5uYW1lfSAke3NraWxsRGF0YS5sZXZlbH3nuqdgO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K6+572u5oqA6IO95o+P6L+w5ZKM562J57qn5Yqg5oiQXG4gICAgICAgIGlmIChkZXNjcmlwdGlvbk5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFZmZlY3QgPSBza2lsbERhdGEuYmFzZUVmZmVjdCArIChza2lsbERhdGEubGV2ZWwgLSAxKSAqIHNraWxsRGF0YS5lZmZlY3RQZXJMZXZlbDtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGAke3NraWxsRGF0YS5kZXNjcmlwdGlvbn1cXG7lvZPliY3mlYjmnpzvvJorJHtjdXJyZW50RWZmZWN0fWA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorr7nva7kuIvkuIDnuqfmlYjmnpxcbiAgICAgICAgaWYgKG5leHRMZXZlbE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChza2lsbERhdGEubGV2ZWwgPj0gc2tpbGxEYXRhLm1heExldmVsKSB7XG4gICAgICAgICAgICAgICAgbmV4dExldmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9ICflt7Lmu6HnuqcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0RWZmZWN0ID0gc2tpbGxEYXRhLmJhc2VFZmZlY3QgKyBza2lsbERhdGEubGV2ZWwgKiBza2lsbERhdGEuZWZmZWN0UGVyTGV2ZWw7XG4gICAgICAgICAgICAgICAgY29uc3QgZWZmZWN0SW5jcmVhc2UgPSBza2lsbERhdGEuZWZmZWN0UGVyTGV2ZWw7XG4gICAgICAgICAgICAgICAgbmV4dExldmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGDkuIvnuqfmlYjmnpzvvJorJHtlZmZlY3RJbmNyZWFzZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K6+572u5Y2H57qn5oiQ5pysXG4gICAgICAgIGlmIChjb3N0Tm9kZSkge1xuICAgICAgICAgICAgaWYgKHNraWxsRGF0YS5sZXZlbCA+PSBza2lsbERhdGEubWF4TGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBjb3N0Tm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9ICflt7Lmu6HnuqcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50Q29zdCA9IHNraWxsRGF0YS51cGdyYWRlQ29zdCArIChza2lsbERhdGEubGV2ZWwgLSAxKSAqIHNraWxsRGF0YS5jb3N0SW5jcmVhc2VQZXJMZXZlbDtcbiAgICAgICAgICAgICAgICBjb3N0Tm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGAke2N1cnJlbnRDb3N0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorr7nva7ljYfnuqfmjInpkq5cbiAgICAgICAgaWYgKHVwZ3JhZGVCdXR0b24pIHtcbiAgICAgICAgICAgIGlmIChza2lsbERhdGEubGV2ZWwgPj0gc2tpbGxEYXRhLm1heExldmVsKSB7XG4gICAgICAgICAgICAgICAgLy8g5bey5ruh57qn77yM56aB55So5oyJ6ZKuXG4gICAgICAgICAgICAgICAgdXBncmFkZUJ1dHRvbi5pbnRlcmFjdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvLyDorr7nva7mjInpkq7kuLrngbDoibJcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b25TcHJpdGUgPSB1cGdyYWRlQnV0dG9uLm5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGJ1dHRvblNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25TcHJpdGUubm9kZS5jb2xvciA9IGNjLkNvbG9yLkdSQVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDmnKrmu6HnuqfvvIzorr7nva7mjInpkq7ngrnlh7vkuovku7ZcbiAgICAgICAgICAgICAgICB1cGdyYWRlQnV0dG9uLmludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdXBncmFkZUJ1dHRvbi5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblVwZ3JhZGVDbGljayhza2lsbERhdGEuaWQpLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiwg+aVtOWuueWZqOWkp+Wwj1xuICAgICAqL1xuICAgIHByaXZhdGUgYWRqdXN0Q29udGFpbmVyU2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JvbGxWaWV35oiWY29udGVudOiKgueCueacquiuvue9ricpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkcmVuO1xuXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiOt+WPluaKgOiDvemhueeahOWkp+Wwj++8iOS9v+eUqOesrOS4gOS4quaKgOiDvemhueS9nOS4uuWPguiAg++8iVxuICAgICAgICBjb25zdCBpdGVtID0gY2hpbGRyZW5bMF07XG4gICAgICAgIGNvbnN0IGl0ZW1XaWR0aCA9IGl0ZW0ud2lkdGg7XG4gICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSBpdGVtLmhlaWdodDtcblxuICAgICAgICAvLyDojrflj5Z2aWV36IqC54K55a695bqmXG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnNjcm9sbFZpZXcubm9kZS5nZXRDaGlsZEJ5TmFtZSgndmlldycpO1xuICAgICAgICBpZiAoIXZpZXcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+acquaJvuWIsHZpZXfoioLngrknKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB2aWV3LndpZHRoO1xuXG4gICAgICAgIC8vIOaKgOiDvemhueS5i+mXtOeahOWeguebtOmXtOi3nVxuICAgICAgICBjb25zdCB2ZXJ0aWNhbFNwYWNpbmcgPSAxNTtcblxuICAgICAgICAvLyDmioDog73pobnnmoTlhoXovrnot51cbiAgICAgICAgY29uc3QgeFBhZGRpbmcgPSAwOyAvLyB45pa55ZCR5YaF6L656LedXG4gICAgICAgIGNvbnN0IHlQYWRkaW5nID0gMTA7IC8vIHnmlrnlkJHlhoXovrnot51cblxuICAgICAgICAvLyDorqHnrpdjb250ZW5055qE5oC76auY5bqm77yM6ICD6JmReeaWueWQkXBhZGRpbmdcbiAgICAgICAgY29uc3QgdG90YWxIZWlnaHQgPSBjaGlsZHJlbi5sZW5ndGggKiBpdGVtSGVpZ2h0ICsgKGNoaWxkcmVuLmxlbmd0aCAtIDEpICogdmVydGljYWxTcGFjaW5nICsgMiAqIHlQYWRkaW5nO1xuXG4gICAgICAgIC8vIOiuvue9rmNvbnRlbnTnmoTlpKflsI/vvIzlrr3luqbkuI52aWV35LiA6Ie0XG4gICAgICAgIGNvbnRhaW5lci53aWR0aCA9IHZpZXdXaWR0aDtcbiAgICAgICAgY29udGFpbmVyLmhlaWdodCA9IHRvdGFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIOiuvue9rmNvbnRlbnTnmoTplJrngrnkuLrlt6bkuIrop5JcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JZID0gMTtcblxuICAgICAgICAvLyDorr7nva7mioDog73pobnnmoTkvY3nva7vvIjlnoLnm7TluIPlsYDvvIzlsYXkuK3mmL7npLrvvIlcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIC8vIOiuvue9ruaKgOiDvemhueeahOS9jee9ru+8jOS7jumhtumDqOW8gOWni+aOkuWIl++8jOiAg+iZkXnmlrnlkJFwYWRkaW5n5ZKM5oqA6IO96aG56auY5bqmXG4gICAgICAgICAgICBjaGlsZC55ID0gLXlQYWRkaW5nIC0gaXRlbUhlaWdodCAvIDIgLSBpICogKGl0ZW1IZWlnaHQgKyB2ZXJ0aWNhbFNwYWNpbmcpO1xuICAgICAgICAgICAgLy8g5bGF5Lit5pi+56S677yM6ICD6JmReOaWueWQkXBhZGRpbmfvvJoodmlld+WuveW6piAtIOaKgOiDvemhueWuveW6piAtIDIgKiB4UGFkZGluZykgLyAyICsgeFBhZGRpbmdcbiAgICAgICAgICAgIGNoaWxkLnggPSAodmlld1dpZHRoIC0gaXRlbVdpZHRoIC0gMiAqIHhQYWRkaW5nKSAvIDItMTA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrBTY3JvbGxWaWV355qEY29udGVudOWBj+enu++8jOehruS/neaYvuekuumhtumDqOWGheWuuVxuICAgICAgICAvLyBpZiAodGhpcy5zY3JvbGxWaWV3LnNjcm9sbFRvVG9wKSB7XG4gICAgICAgIC8vICAgICB0aGlzLnNjcm9sbFZpZXcuc2Nyb2xsVG9Ub3AoMC4xKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWNh+e6p+aMiemSrueCueWHu+S6i+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgb25VcGdyYWRlQ2xpY2soc2tpbGxJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIC8vIOaJvuWIsOWvueW6lOeahOaKgOiDvVxuICAgICAgICBjb25zdCBza2lsbCA9IHRoaXMuc2tpbGxzLmZpbmQocyA9PiBzLmlkID09PSBza2lsbElkKTtcbiAgICAgICAgaWYgKCFza2lsbCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3sua7oee6p1xuICAgICAgICBpZiAoc2tpbGwubGV2ZWwgPj0gc2tpbGwubWF4TGV2ZWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmioDog73lt7Lmu6HnuqcnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuoeeul+WNh+e6p+aIkOacrFxuICAgICAgICBjb25zdCB1cGdyYWRlQ29zdCA9IHNraWxsLnVwZ3JhZGVDb3N0ICsgKHNraWxsLmxldmVsIC0gMSkgKiBza2lsbC5jb3N0SW5jcmVhc2VQZXJMZXZlbDtcblxuICAgICAgICAvLyDmo4Dmn6Xpkrvnn7PmmK/lkKbotrPlpJ9cbiAgICAgICAgaWYgKG1HYW1lRGF0YS5jdXJyZW50R29sZCA8IHVwZ3JhZGVDb3N0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6ZK755+z5LiN6LazJyk7XG4gICAgICAgICAgICAvLyDmmL7npLrpkrvnn7PkuI3otrPmj5DnpLpcbiAgICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KCfpkrvnn7PkuI3otrPjgIInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaJo+mZpOmSu+efs1xuICAgICAgICBtR2FtZURhdGEuY3VycmVudEdvbGQgLT0gdXBncmFkZUNvc3Q7XG5cbiAgICAgICAgLy8g5o+Q5Y2H5oqA6IO9562J57qnXG4gICAgICAgIHNraWxsLmxldmVsKys7XG5cbiAgICAgICAgLy8g5L+d5a2Y5oqA6IO95pWw5o2uXG4gICAgICAgIG1HYW1lRGF0YS5za2lsbHMgPSB0aGlzLnNraWxscztcbiAgICAgICAgbUdhbWVEYXRhLlNhdmVTa2lsbHNEYXRhKCk7XG5cbiAgICAgICAgLy8g5L+d5a2Y6ZK755+z5pWw6YePXG4gICAgICAgIG1HYW1lRGF0YS5TYXZlR29sZERhdGEoKTtcbiAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XG5cbiAgICAgICAgLy8g5pu05paw6ZK755+z5pWw6YePXG4gICAgICAgIHRoaXMudXBkYXRlRGlhbW9uZExhYmVsKCk7XG5cbiAgICAgICAgLy8g6YCa55+l5Li755WM6Z2i6ZK755+z5pWw6YeP5pu05pawXG4gICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoJ2dvbGRVcGRhdGVkJyk7XG5cbiAgICAgICAgLy8g5Yi35paw5rua5Yqo5YiX6KGoXG4gICAgICAgIHRoaXMucmVmcmVzaFNjcm9sbFZpZXcoKTtcblxuICAgICAgICAvLyDmmL7npLrljYfnuqfmiJDlip/mj5DnpLpcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoJ+WNh+e6p+aIkOWKn+OAgicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWFs+mXreaMiemSrueCueWHu+S6i+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgb25DbG9zZUNsaWNrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pu05paw6ZK755+z5pWw6YeP5pi+56S6XG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVEaWFtb25kTGFiZWwoKTogdm9pZCB7XG4gICAgICAgIC8vIGlmICh0aGlzLmRpYW1vbmRMYWJlbCkge1xuICAgICAgICAvLyAgICAgdGhpcy5kaWFtb25kTGFiZWwuc3RyaW5nID0gbUdhbWVEYXRhLmN1cnJlbnRHb2xkLnRvU3RyaW5nKCk7XG4gICAgICAgIC8vIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmmL7npLrmj5DnpLrkv6Hmga9cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3dUb2FzdChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgLy8g6L+Z6YeM5Y+v5Lul5a6e546w5LiA5Liq566A5Y2V55qE5o+Q56S65qGGXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICAvLyDlrp7pmYXpobnnm67kuK3lj6/ku6Xkvb/nlKjmm7TlpI3mnYLnmoTmj5DnpLrns7vnu59cbiAgICAgICAgVGlwc01hbmFnZXIuc2hvdyhtZXNzYWdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmmL7npLrmioDog73lvLrljJbnlYzpnaJcbiAgICAgKi9cbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcbiAgICAgICAgLy8g5Yi35paw5oqA6IO95pWw5o2uXG4gICAgICAgIHRoaXMuaW5pdFNraWxscygpO1xuICAgICAgICAvLyDliLfmlrDmu5rliqjliJfooahcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Nyb2xsVmlldygpO1xuICAgICAgICAvLyDmm7TmlrDpkrvnn7PmlbDph49cbiAgICAgICAgdGhpcy51cGRhdGVEaWFtb25kTGFiZWwoKTtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6ZqQ6JeP5oqA6IO95by65YyW55WM6Z2iXG4gICAgICovXG4gICAgcHVibGljIGhpZGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59XG4iXX0=