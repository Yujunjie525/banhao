"use strict";
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