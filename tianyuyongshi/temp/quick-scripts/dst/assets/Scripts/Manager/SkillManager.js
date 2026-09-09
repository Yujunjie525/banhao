
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
        // 初始化技能数据
        this.initSkills();
        // 刷新滚动列表
        this.refreshScrollView();
        // 更新钻石数量
        this.updateDiamondLabel();
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
        this.node.active = true;
        // 刷新技能数据
        this.initSkills();
        // 刷新滚动列表
        this.refreshScrollView();
        // 更新钻石数量
        this.updateDiamondLabel();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcU2tpbGxNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUMxQyw2Q0FBeUM7QUFDekMsbURBQThDO0FBQzlDLDZEQUF3RDtBQUd4RDtJQUEwQyxnQ0FBWTtJQUF0RDtRQUFBLHFFQTZUQztRQTNURyxpQkFBVyxHQUFjLElBQUksQ0FBQztRQUc5QixnQkFBVSxHQUFrQixJQUFJLENBQUM7UUFHakMscUJBQWUsR0FBYyxJQUFJLENBQUM7UUFHbEMsU0FBUztRQUNELFlBQU0sR0FXVCxFQUFFLENBQUM7O0lBc1NaLENBQUM7SUFwU2EsNkJBQU0sR0FBaEI7UUFDSSxjQUFjO1FBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5RDtRQUVELFVBQVU7UUFDVixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsU0FBUztRQUNULElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLFNBQVM7UUFDVCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSyxpQ0FBVSxHQUFsQjtRQUNJLGtCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUIsZ0NBQWdDO1FBQ2hDLElBQUksa0JBQVMsQ0FBQyxNQUFNLElBQUksa0JBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLGtCQUFTLENBQUMsTUFBTSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQUdEOztPQUVHO0lBQ0ssd0NBQWlCLEdBQXpCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDdkUsT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1lBQzVELE9BQU87U0FDVjtRQUVELE9BQU87UUFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRTVDLGVBQWU7UUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQyxVQUFVO1lBQ1YsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLFVBQVU7WUFDVixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsU0FBUztRQUNULElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNLLHVDQUFnQixHQUF4QixVQUF5QixTQUFrQixFQUFFLFNBQWM7UUFBM0QsaUJBd0VDO1FBdkVHLFNBQVM7UUFDVCxJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQsSUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRSxJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbkQsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPO1FBQ1AsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFNLGlCQUFlLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsSUFBSSxpQkFBZSxFQUFFO2dCQUNqQixJQUFNLFVBQVEsR0FBRyxXQUFTLFNBQVMsQ0FBQyxJQUFNLENBQUM7Z0JBQzNDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVEsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsR0FBRyxFQUFFLFdBQVc7b0JBQ3pELElBQUksR0FBRyxFQUFFO3dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQUssVUFBUSxrQkFBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUMxQzt5QkFBTTt3QkFDSCxpQkFBZSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7cUJBQzdDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2FBQ047U0FDSjtRQUVELFlBQVk7UUFDWixJQUFJLFFBQVEsRUFBRTtZQUNWLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBTSxTQUFTLENBQUMsSUFBSSxTQUFJLFNBQVMsQ0FBQyxLQUFLLFdBQUcsQ0FBQztTQUNwRjtRQUVELGNBQWM7UUFDZCxJQUFJLGVBQWUsRUFBRTtZQUNqQixJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO1lBQzlGLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBTSxTQUFTLENBQUMsV0FBVyx5Q0FBVyxhQUFlLENBQUM7U0FDdEc7UUFFRCxVQUFVO1FBQ1YsSUFBSSxhQUFhLEVBQUU7WUFDZixJQUFJLFNBQVMsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDdkMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQzthQUN2RDtpQkFBTTtnQkFDSCxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDckYsSUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDaEQsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLG9DQUFTLGNBQWdCLENBQUM7YUFDM0U7U0FDSjtRQUVELFNBQVM7UUFDVCxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2xEO2lCQUFNO2dCQUNILElBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDbkcsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUcsV0FBYSxDQUFDO2FBQzdEO1NBQ0o7UUFFRCxTQUFTO1FBQ1QsSUFBSSxhQUFhLEVBQUU7WUFDZixJQUFJLFNBQVMsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDdkMsV0FBVztnQkFDWCxhQUFhLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDbkMsVUFBVTtnQkFDVixJQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksWUFBWSxFQUFFO29CQUNkLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2lCQUMzQzthQUNKO2lCQUFNO2dCQUNILGVBQWU7Z0JBQ2YsYUFBYSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQWpDLENBQWlDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDckc7U0FDSjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLDBDQUFtQixHQUEzQjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3pDLE9BQU87U0FDVjtRQUVELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQzFDLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFFcEMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixPQUFPO1NBQ1Y7UUFFRCx5QkFBeUI7UUFDekIsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDN0IsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUvQixhQUFhO1FBQ2IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLE9BQU87U0FDVjtRQUNELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFN0IsYUFBYTtRQUNiLElBQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUUzQixVQUFVO1FBQ1YsSUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUM3QixJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxTQUFTO1FBRTlCLDZCQUE2QjtRQUM3QixJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsZUFBZSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7UUFFMUcseUJBQXlCO1FBQ3pCLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQzVCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO1FBRS9CLG1CQUFtQjtRQUNuQixTQUFTLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUN4QixTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUV0QixzQkFBc0I7UUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLHNDQUFzQztZQUN0QyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQyxDQUFDO1lBQzFFLG1FQUFtRTtZQUNuRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFDLEVBQUUsQ0FBQztTQUMzRDtRQUVELGtDQUFrQztRQUNsQyxxQ0FBcUM7UUFDckMsd0NBQXdDO1FBQ3hDLElBQUk7SUFDUixDQUFDO0lBRUQ7O09BRUc7SUFDSyxxQ0FBYyxHQUF0QixVQUF1QixPQUFlO1FBQ2xDLFVBQVU7UUFDVixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxFQUFFLEtBQUssT0FBTyxFQUFoQixDQUFnQixDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRW5CLFVBQVU7UUFDVixJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDVjtRQUVELFNBQVM7UUFDVCxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUM7UUFFdkYsV0FBVztRQUNYLElBQUksa0JBQVMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxFQUFFO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsV0FBVztZQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsT0FBTztTQUNWO1FBRUQsT0FBTztRQUNQLGtCQUFTLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQztRQUVyQyxTQUFTO1FBQ1QsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWQsU0FBUztRQUNULGtCQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDL0Isa0JBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzQixTQUFTO1FBQ1Qsa0JBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6Qiw2QkFBbUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVwQyxTQUFTO1FBQ1QsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsY0FBYztRQUNkLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhDLFNBQVM7UUFDVCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixXQUFXO1FBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSyxtQ0FBWSxHQUFwQjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBRUQ7O09BRUc7SUFDSyx5Q0FBa0IsR0FBMUI7UUFDSSwyQkFBMkI7UUFDM0IsbUVBQW1FO1FBQ25FLElBQUk7SUFDUixDQUFDO0lBRUQ7O09BRUc7SUFDSyxnQ0FBUyxHQUFqQixVQUFrQixPQUFlO1FBQzdCLGlCQUFpQjtRQUNqQix3QkFBd0I7UUFDeEIsb0JBQW9CO1FBQ3BCLHFCQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7T0FFRztJQUNJLDJCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDeEIsU0FBUztRQUNULElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixTQUFTO1FBQ1QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsU0FBUztRQUNULElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRDs7T0FFRztJQUNJLDJCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQTFURDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO3FEQUNVO0lBRzlCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0RBQ1M7SUFHakM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzt5REFDYztJQVJqQixZQUFZO1FBRGhDLE9BQU87T0FDYSxZQUFZLENBNlRoQztJQUFELG1CQUFDO0NBN1RELEFBNlRDLENBN1R5QyxFQUFFLENBQUMsU0FBUyxHQTZUckQ7a0JBN1RvQixZQUFZIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XG5pbXBvcnQgbUdhbWVEYXRhIGZyb20gJy4uL0xvYWQvR2FtZURhdGEnO1xuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gJy4uL0xvYWQvVGlwc01hbmFnZXInO1xuaW1wb3J0IFVzZXJEYXRhU3luY01hbmFnZXIgZnJvbSAnLi9Vc2VyRGF0YVN5bmNNYW5hZ2VyJztcblxuQGNjY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNraWxsTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLkJ1dHRvbilcbiAgICBjbG9zZUJ1dHRvbjogY2MuQnV0dG9uID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5TY3JvbGxWaWV3KVxuICAgIHNjcm9sbFZpZXc6IGNjLlNjcm9sbFZpZXcgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLlByZWZhYilcbiAgICBza2lsbEl0ZW1QcmVmYWI6IGNjLlByZWZhYiA9IG51bGw7XG5cblxuICAgIC8vIOaKgOiDveaVsOaNrue7k+aehFxuICAgIHByaXZhdGUgc2tpbGxzOiBBcnJheTx7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgbGV2ZWw6IG51bWJlcjtcbiAgICAgICAgbWF4TGV2ZWw6IG51bWJlcjtcbiAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgICAgaWNvbjogc3RyaW5nO1xuICAgICAgICBiYXNlRWZmZWN0OiBudW1iZXI7XG4gICAgICAgIGVmZmVjdFBlckxldmVsOiBudW1iZXI7XG4gICAgICAgIHVwZ3JhZGVDb3N0OiBudW1iZXI7XG4gICAgICAgIGNvc3RJbmNyZWFzZVBlckxldmVsOiBudW1iZXI7XG4gICAgfT4gPSBbXTtcblxuICAgIHByb3RlY3RlZCBvbkxvYWQoKTogdm9pZCB7XG4gICAgICAgIC8vIOWIneWni+WMluWFs+mXreaMiemSrueCueWHu+S6i+S7tlxuICAgICAgICBpZiAodGhpcy5jbG9zZUJ1dHRvbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25DbG9zZUNsaWNrLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWIneWni+WMluaKgOiDveaVsOaNrlxuICAgICAgICB0aGlzLmluaXRTa2lsbHMoKTtcblxuICAgICAgICAvLyDliLfmlrDmu5rliqjliJfooahcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Nyb2xsVmlldygpO1xuXG4gICAgICAgIC8vIOabtOaWsOmSu+efs+aVsOmHj1xuICAgICAgICB0aGlzLnVwZGF0ZURpYW1vbmRMYWJlbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIneWni+WMluaKgOiDveaVsOaNrlxuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdFNraWxscygpOiB2b2lkIHtcbiAgICAgICAgbUdhbWVEYXRhLkdldFNraWxsc0RhdGEoKTtcbiAgICAgICAgLy8g5LuOIEdhbWVEYXRhIOiOt+WPluaKgOiDveaVsOaNru+8jOWmguaenOayoeacieWImeS9v+eUqOm7mOiupOaVsOaNrlxuICAgICAgICBpZiAobUdhbWVEYXRhLnNraWxscyAmJiBtR2FtZURhdGEuc2tpbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2tpbGxzID0gbUdhbWVEYXRhLnNraWxscztcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICog5Yi35paw5rua5Yqo5YiX6KGoXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Nyb2xsVmlldygpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuc2tpbGxJdGVtUHJlZmFiIHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlldyBvciBza2lsbEl0ZW1QcmVmYWIgbm90IGFzc2lnbmVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmuIXnqbrlrrnlmahcbiAgICAgICAgdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcblxuICAgICAgICAvLyDpgY3ljobmioDog73mlbDmja7vvIzliJvlu7rmioDog73poblcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNraWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc2tpbGxEYXRhID0gdGhpcy5za2lsbHNbaV07XG5cbiAgICAgICAgICAgIC8vIOWIm+W7uuaKgOiDvemhueiKgueCuVxuICAgICAgICAgICAgY29uc3Qgc2tpbGxJdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5za2lsbEl0ZW1QcmVmYWIpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQuYWRkQ2hpbGQoc2tpbGxJdGVtKTtcblxuICAgICAgICAgICAgLy8g6K6+572u5oqA6IO96aG55pWw5o2uXG4gICAgICAgICAgICB0aGlzLnNldFNraWxsSXRlbURhdGEoc2tpbGxJdGVtLCBza2lsbERhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6LCD5pW05a655Zmo5aSn5bCPXG4gICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyU2l6ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruaKgOiDvemhueaVsOaNrlxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0U2tpbGxJdGVtRGF0YShza2lsbEl0ZW06IGNjLk5vZGUsIHNraWxsRGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIOaJvuWIsOWQhOS4quiKgueCuVxuICAgICAgICBjb25zdCBpY29uTm9kZSA9IHNraWxsSXRlbS5nZXRDaGlsZEJ5TmFtZSgnaWNvbicpO1xuICAgICAgICBjb25zdCBuYW1lTm9kZSA9IHNraWxsSXRlbS5nZXRDaGlsZEJ5TmFtZSgnbmFtZScpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbk5vZGUgPSBza2lsbEl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2Rlc2NyaXB0aW9uJyk7XG4gICAgICAgIGNvbnN0IG5leHRMZXZlbE5vZGUgPSBza2lsbEl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ25leHRMZXZlbCcpO1xuICAgICAgICBjb25zdCB1cGdyYWRlID0gc2tpbGxJdGVtLmdldENoaWxkQnlOYW1lKFwidXBncmFkZVwiKVxuICAgICAgICBjb25zdCB1cGdyYWRlQnV0dG9uID0gdXBncmFkZS5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgY29uc3QgY29zdE5vZGUgPSB1cGdyYWRlLmdldENoaWxkQnlOYW1lKCdjb3N0Jyk7XG4gICAgICAgIC8vIOiuvue9ruWbvuagh1xuICAgICAgICBpZiAoaWNvbk5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUNvbXBvbmVudCA9IGljb25Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgaWYgKHNwcml0ZUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGljb25QYXRoID0gYHpJbWcyLyR7c2tpbGxEYXRhLmljb259YDtcbiAgICAgICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhpY29uUGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOWKoOi9vSR7aWNvblBhdGh95aSx6LSlOmAsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVDb21wb25lbnQuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K6+572u5oqA6IO95ZCN56ew5ZKM562J57qnXG4gICAgICAgIGlmIChuYW1lTm9kZSkge1xuICAgICAgICAgICAgbmFtZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBgJHtza2lsbERhdGEubmFtZX0gJHtza2lsbERhdGEubGV2ZWx957qnYDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuvue9ruaKgOiDveaPj+i/sOWSjOetiee6p+WKoOaIkFxuICAgICAgICBpZiAoZGVzY3JpcHRpb25Ob2RlKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RWZmZWN0ID0gc2tpbGxEYXRhLmJhc2VFZmZlY3QgKyAoc2tpbGxEYXRhLmxldmVsIC0gMSkgKiBza2lsbERhdGEuZWZmZWN0UGVyTGV2ZWw7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbk5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBgJHtza2lsbERhdGEuZGVzY3JpcHRpb259XFxu5b2T5YmN5pWI5p6c77yaKyR7Y3VycmVudEVmZmVjdH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K6+572u5LiL5LiA57qn5pWI5p6cXG4gICAgICAgIGlmIChuZXh0TGV2ZWxOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc2tpbGxEYXRhLmxldmVsID49IHNraWxsRGF0YS5tYXhMZXZlbCkge1xuICAgICAgICAgICAgICAgIG5leHRMZXZlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSAn5bey5ruh57qnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dEVmZmVjdCA9IHNraWxsRGF0YS5iYXNlRWZmZWN0ICsgc2tpbGxEYXRhLmxldmVsICogc2tpbGxEYXRhLmVmZmVjdFBlckxldmVsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVmZmVjdEluY3JlYXNlID0gc2tpbGxEYXRhLmVmZmVjdFBlckxldmVsO1xuICAgICAgICAgICAgICAgIG5leHRMZXZlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBg5LiL57qn5pWI5p6c77yaKyR7ZWZmZWN0SW5jcmVhc2V9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuvue9ruWNh+e6p+aIkOacrFxuICAgICAgICBpZiAoY29zdE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChza2lsbERhdGEubGV2ZWwgPj0gc2tpbGxEYXRhLm1heExldmVsKSB7XG4gICAgICAgICAgICAgICAgY29zdE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSAn5bey5ruh57qnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudENvc3QgPSBza2lsbERhdGEudXBncmFkZUNvc3QgKyAoc2tpbGxEYXRhLmxldmVsIC0gMSkgKiBza2lsbERhdGEuY29zdEluY3JlYXNlUGVyTGV2ZWw7XG4gICAgICAgICAgICAgICAgY29zdE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBgJHtjdXJyZW50Q29zdH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6K6+572u5Y2H57qn5oyJ6ZKuXG4gICAgICAgIGlmICh1cGdyYWRlQnV0dG9uKSB7XG4gICAgICAgICAgICBpZiAoc2tpbGxEYXRhLmxldmVsID49IHNraWxsRGF0YS5tYXhMZXZlbCkge1xuICAgICAgICAgICAgICAgIC8vIOW3sua7oee6p++8jOemgeeUqOaMiemSrlxuICAgICAgICAgICAgICAgIHVwZ3JhZGVCdXR0b24uaW50ZXJhY3RhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy8g6K6+572u5oyJ6ZKu5Li654Gw6ImyXG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uU3ByaXRlID0gdXBncmFkZUJ1dHRvbi5ub2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgICAgIGlmIChidXR0b25TcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uU3ByaXRlLm5vZGUuY29sb3IgPSBjYy5Db2xvci5HUkFZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5pyq5ruh57qn77yM6K6+572u5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICAgICAgICAgICAgdXBncmFkZUJ1dHRvbi5pbnRlcmFjdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVwZ3JhZGVCdXR0b24ubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25VcGdyYWRlQ2xpY2soc2tpbGxEYXRhLmlkKSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDosIPmlbTlrrnlmajlpKflsI9cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkanVzdENvbnRhaW5lclNpemUoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxWaWV3IHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlld+aIlmNvbnRlbnToioLngrnmnKrorr7nva4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuc2Nyb2xsVmlldy5jb250ZW50O1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlbjtcblxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDojrflj5bmioDog73pobnnmoTlpKflsI/vvIjkvb/nlKjnrKzkuIDkuKrmioDog73pobnkvZzkuLrlj4LogIPvvIlcbiAgICAgICAgY29uc3QgaXRlbSA9IGNoaWxkcmVuWzBdO1xuICAgICAgICBjb25zdCBpdGVtV2lkdGggPSBpdGVtLndpZHRoO1xuICAgICAgICBjb25zdCBpdGVtSGVpZ2h0ID0gaXRlbS5oZWlnaHQ7XG5cbiAgICAgICAgLy8g6I635Y+Wdmlld+iKgueCueWuveW6plxuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5zY3JvbGxWaWV3Lm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3ZpZXcnKTtcbiAgICAgICAgaWYgKCF2aWV3KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmnKrmib7liLB2aWV36IqC54K5Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgdmlld1dpZHRoID0gdmlldy53aWR0aDtcblxuICAgICAgICAvLyDmioDog73pobnkuYvpl7TnmoTlnoLnm7Tpl7Tot51cbiAgICAgICAgY29uc3QgdmVydGljYWxTcGFjaW5nID0gMTU7XG5cbiAgICAgICAgLy8g5oqA6IO96aG555qE5YaF6L656LedXG4gICAgICAgIGNvbnN0IHhQYWRkaW5nID0gMDsgLy8geOaWueWQkeWGhei+uei3nVxuICAgICAgICBjb25zdCB5UGFkZGluZyA9IDEwOyAvLyB55pa55ZCR5YaF6L656LedXG5cbiAgICAgICAgLy8g6K6h566XY29udGVudOeahOaAu+mrmOW6pu+8jOiAg+iZkXnmlrnlkJFwYWRkaW5nXG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gY2hpbGRyZW4ubGVuZ3RoICogaXRlbUhlaWdodCArIChjaGlsZHJlbi5sZW5ndGggLSAxKSAqIHZlcnRpY2FsU3BhY2luZyArIDIgKiB5UGFkZGluZztcblxuICAgICAgICAvLyDorr7nva5jb250ZW5055qE5aSn5bCP77yM5a695bqm5LiOdmlld+S4gOiHtFxuICAgICAgICBjb250YWluZXIud2lkdGggPSB2aWV3V2lkdGg7XG4gICAgICAgIGNvbnRhaW5lci5oZWlnaHQgPSB0b3RhbEhlaWdodDtcblxuICAgICAgICAvLyDorr7nva5jb250ZW5055qE6ZSa54K55Li65bem5LiK6KeSXG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JYID0gMC41O1xuICAgICAgICBjb250YWluZXIuYW5jaG9yWSA9IDE7XG5cbiAgICAgICAgLy8g6K6+572u5oqA6IO96aG555qE5L2N572u77yI5Z6C55u05biD5bGA77yM5bGF5Lit5pi+56S677yJXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAvLyDorr7nva7mioDog73pobnnmoTkvY3nva7vvIzku47pobbpg6jlvIDlp4vmjpLliJfvvIzogIPomZF55pa55ZCRcGFkZGluZ+WSjOaKgOiDvemhuemrmOW6plxuICAgICAgICAgICAgY2hpbGQueSA9IC15UGFkZGluZyAtIGl0ZW1IZWlnaHQgLyAyIC0gaSAqIChpdGVtSGVpZ2h0ICsgdmVydGljYWxTcGFjaW5nKTtcbiAgICAgICAgICAgIC8vIOWxheS4reaYvuekuu+8jOiAg+iZkXjmlrnlkJFwYWRkaW5n77yaKHZpZXflrr3luqYgLSDmioDog73pobnlrr3luqYgLSAyICogeFBhZGRpbmcpIC8gMiArIHhQYWRkaW5nXG4gICAgICAgICAgICBjaGlsZC54ID0gKHZpZXdXaWR0aCAtIGl0ZW1XaWR0aCAtIDIgKiB4UGFkZGluZykgLyAyLTEwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05pawU2Nyb2xsVmlld+eahGNvbnRlbnTlgY/np7vvvIznoa7kv53mmL7npLrpobbpg6jlhoXlrrlcbiAgICAgICAgLy8gaWYgKHRoaXMuc2Nyb2xsVmlldy5zY3JvbGxUb1RvcCkge1xuICAgICAgICAvLyAgICAgdGhpcy5zY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDAuMSk7XG4gICAgICAgIC8vIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDljYfnuqfmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uVXBncmFkZUNsaWNrKHNraWxsSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAvLyDmib7liLDlr7nlupTnmoTmioDog71cbiAgICAgICAgY29uc3Qgc2tpbGwgPSB0aGlzLnNraWxscy5maW5kKHMgPT4gcy5pZCA9PT0gc2tpbGxJZCk7XG4gICAgICAgIGlmICghc2tpbGwpIHJldHVybjtcblxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKblt7Lmu6HnuqdcbiAgICAgICAgaWYgKHNraWxsLmxldmVsID49IHNraWxsLm1heExldmVsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5oqA6IO95bey5ruh57qnJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorqHnrpfljYfnuqfmiJDmnKxcbiAgICAgICAgY29uc3QgdXBncmFkZUNvc3QgPSBza2lsbC51cGdyYWRlQ29zdCArIChza2lsbC5sZXZlbCAtIDEpICogc2tpbGwuY29zdEluY3JlYXNlUGVyTGV2ZWw7XG5cbiAgICAgICAgLy8g5qOA5p+l6ZK755+z5piv5ZCm6Laz5aSfXG4gICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudEdvbGQgPCB1cGdyYWRlQ29zdCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mSu+efs+S4jei2sycpO1xuICAgICAgICAgICAgLy8g5pi+56S66ZK755+z5LiN6Laz5o+Q56S6XG4gICAgICAgICAgICB0aGlzLnNob3dUb2FzdCgn6ZK755+z5LiN6Laz44CCJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmiaPpmaTpkrvnn7NcbiAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRHb2xkIC09IHVwZ3JhZGVDb3N0O1xuXG4gICAgICAgIC8vIOaPkOWNh+aKgOiDveetiee6p1xuICAgICAgICBza2lsbC5sZXZlbCsrO1xuXG4gICAgICAgIC8vIOS/neWtmOaKgOiDveaVsOaNrlxuICAgICAgICBtR2FtZURhdGEuc2tpbGxzID0gdGhpcy5za2lsbHM7XG4gICAgICAgIG1HYW1lRGF0YS5TYXZlU2tpbGxzRGF0YSgpO1xuXG4gICAgICAgIC8vIOS/neWtmOmSu+efs+aVsOmHj1xuICAgICAgICBtR2FtZURhdGEuU2F2ZUdvbGREYXRhKCk7XG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xuXG4gICAgICAgIC8vIOabtOaWsOmSu+efs+aVsOmHj1xuICAgICAgICB0aGlzLnVwZGF0ZURpYW1vbmRMYWJlbCgpO1xuXG4gICAgICAgIC8vIOmAmuefpeS4u+eVjOmdoumSu+efs+aVsOmHj+abtOaWsFxuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KCdnb2xkVXBkYXRlZCcpO1xuXG4gICAgICAgIC8vIOWIt+aWsOa7muWKqOWIl+ihqFxuICAgICAgICB0aGlzLnJlZnJlc2hTY3JvbGxWaWV3KCk7XG5cbiAgICAgICAgLy8g5pi+56S65Y2H57qn5oiQ5Yqf5o+Q56S6XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KCfljYfnuqfmiJDlip/jgIInKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlhbPpl63mjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uQ2xvc2VDbGljaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOabtOaWsOmSu+efs+aVsOmHj+aYvuekulxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlRGlhbW9uZExhYmVsKCk6IHZvaWQge1xuICAgICAgICAvLyBpZiAodGhpcy5kaWFtb25kTGFiZWwpIHtcbiAgICAgICAgLy8gICAgIHRoaXMuZGlhbW9uZExhYmVsLnN0cmluZyA9IG1HYW1lRGF0YS5jdXJyZW50R29sZC50b1N0cmluZygpO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pi+56S65o+Q56S65L+h5oGvXG4gICAgICovXG4gICAgcHJpdmF0ZSBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIC8vIOi/memHjOWPr+S7peWunueOsOS4gOS4queugOWNleeahOaPkOekuuahhlxuICAgICAgICAvLyBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgLy8g5a6e6ZmF6aG555uu5Lit5Y+v5Lul5L2/55So5pu05aSN5p2C55qE5o+Q56S657O757ufXG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3cobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pi+56S65oqA6IO95by65YyW55WM6Z2iXG4gICAgICovXG4gICAgcHVibGljIHNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAvLyDliLfmlrDmioDog73mlbDmja5cbiAgICAgICAgdGhpcy5pbml0U2tpbGxzKCk7XG4gICAgICAgIC8vIOWIt+aWsOa7muWKqOWIl+ihqFxuICAgICAgICB0aGlzLnJlZnJlc2hTY3JvbGxWaWV3KCk7XG4gICAgICAgIC8vIOabtOaWsOmSu+efs+aVsOmHj1xuICAgICAgICB0aGlzLnVwZGF0ZURpYW1vbmRMYWJlbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmakOiXj+aKgOiDveW8uuWMlueVjOmdolxuICAgICAqL1xuICAgIHB1YmxpYyBoaWRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxufVxuIl19