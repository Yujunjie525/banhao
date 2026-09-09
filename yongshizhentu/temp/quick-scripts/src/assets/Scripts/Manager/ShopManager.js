"use strict";
cc._RF.push(module, '17727aLv0tOjoAhIEbz/+Nh', 'ShopManager');
// Scripts/Manager/ShopManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../Load/GameData");
var TipsManager_1 = require("../Load/TipsManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ShopManager = /** @class */ (function (_super) {
    __extends(ShopManager, _super);
    function ShopManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeBtn = null;
        _this.zs_num = null;
        // 滚动视图节点
        _this.scrollView = null; // 滚动视图节点
        // 商品项预制体
        _this.itemPrefab = null; // 商品项预制体
        // 商品项容器
        _this.itemContainer = null; // 商品项容器节点
        // 体力商品项价格
        _this.staminaPrice = 100; // 体力商品项价格
        // 提示面板节点
        _this.tipsPanel = null; // 提示面板节点
        // 提示信息标签
        _this.tipsLabel = null; // 提示信息标签
        // 确认按钮
        _this.confirmBtn = null; // 确认按钮
        // 取消按钮
        _this.cancelBtn = null; // 取消按钮
        // 按钮正常状态图片
        _this.btn1Normal = null;
        // 按钮禁用状态图片
        _this.btn1Disabled = null;
        // 当前操作类型
        _this.currentOperation = ''; // 'unlockRole' 或 'buyStamina'
        // 当前操作的角色索引
        _this.currentRoleIndex = -1;
        // 商品数据数组
        _this.shopItems = [];
        _this.useButtonFrames = {};
        return _this;
    }
    ShopManager.prototype.onLoad = function () {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        // 为提示面板按钮添加点击事件
        if (this.confirmBtn) {
            this.confirmBtn.on(cc.Node.EventType.TOUCH_END, this.onConfirmClick, this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.on(cc.Node.EventType.TOUCH_END, this.onCancelClick, this);
        }
    };
    /**
     * 初始化商品数据
     */
    ShopManager.prototype.initShopItems = function (keepScrollPosition) {
        if (keepScrollPosition === void 0) { keepScrollPosition = false; }
        GameData_1.default.GetUnlockedRolesData();
        GameData_1.default.GetCurrentRoleData();
        // 清空商品数据数组
        this.shopItems = [];
        // 添加角色商品
        for (var i = 0; i < GameData_1.default.rolePrices.length; i++) {
            this.shopItems.push({
                type: 'role',
                index: i,
                name: GameData_1.default.roleNames[i] || "\u89D2\u8272 " + (i + 1),
                price: GameData_1.default.rolePrices[i],
                unlocked: GameData_1.default.unlockedRoles[i],
                isUsing: i === GameData_1.default.currentRole
            });
        }
        // 添加体力商品
        this.shopItems.push({
            type: 'stamina',
            index: -1,
            name: '10体力',
            price: this.staminaPrice,
            unlocked: true,
            isUsing: false
        });
        // 刷新滚动列表
        this.refreshScrollView(keepScrollPosition);
    };
    /**
     * 刷新滚动列表
     */
    ShopManager.prototype.refreshScrollView = function (keepScrollPosition) {
        if (keepScrollPosition === void 0) { keepScrollPosition = false; }
        if (!this.scrollView || !this.itemPrefab || !this.scrollView.content) {
            console.error('ScrollView or itemPrefab not assigned');
            return;
        }
        var scrollOffset = keepScrollPosition && this.scrollView.getScrollOffset
            ? this.scrollView.getScrollOffset()
            : null;
        // 清空容器
        this.scrollView.content.removeAllChildren();
        // 遍历商品数据，创建商品项
        for (var i = 0; i < this.shopItems.length; i++) {
            var itemData = this.shopItems[i];
            // 创建商品项节点
            var itemNode = cc.instantiate(this.itemPrefab);
            this.scrollView.content.addChild(itemNode);
            // 设置商品项数据
            this.setItemData(itemNode, itemData);
        }
        // 调整容器大小
        this.adjustContainerSize(scrollOffset);
    };
    /**
     * 设置商品项数据
     */
    ShopManager.prototype.setItemData = function (itemNode, itemData) {
        var _this = this;
        // 找到off和on节点
        var offNode = itemNode.getChildByName('off');
        var onNode = itemNode.getChildByName('on');
        // 找到名称、重量和价格节点
        var nameNode = itemNode.getChildByName('name');
        var weightNode = itemNode.getChildByName('weight');
        var priceNode = offNode.getChildByName('price');
        // 找到图标节点（假设图标节点名称为'icon'）
        var iconNode = itemNode.getChildByName('icon');
        // console.log('设置商品项数据:', itemData);
        // console.log('节点结构:', {
        //     offNode: offNode ? '找到' : '未找到',
        //     onNode: onNode ? '找到' : '未找到',
        //     nameNode: nameNode ? '找到' : '未找到',
        //     weightNode: weightNode ? '找到' : '未找到',
        //     priceNode: priceNode ? '找到' : '未找到',
        //     iconNode: iconNode ? '找到' : '未找到'
        // });
        // 设置图标
        if (iconNode) {
            var spriteComponent_1 = iconNode.getComponent(cc.Sprite);
            if (spriteComponent_1) {
                if (itemData.type === 'role') {
                    // 角色商品，显示 juese1-juese5
                    var iconPath_1 = "3game/juese" + (itemData.index + 1);
                    cc.loader.loadRes(iconPath_1, cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            console.error("\u52A0\u8F7D" + iconPath_1 + "\u5931\u8D25:", err);
                        }
                        else {
                            spriteComponent_1.spriteFrame = spriteFrame;
                            spriteComponent_1.sizeMode = cc.Sprite.SizeMode.TRIMMED;
                            iconNode.scale = 1;
                        }
                    });
                }
                else if (itemData.type === 'stamina') {
                    // 体力商品，显示 tili.png
                    cc.loader.loadRes('2main/tili', cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            console.error('加载tili失败:', err);
                        }
                        else {
                            spriteComponent_1.spriteFrame = spriteFrame;
                        }
                    });
                    iconNode.scale = 1.5;
                }
            }
        }
        if (itemData.type === 'role') {
            // 角色商品
            // 设置角色名称
            if (nameNode) {
                nameNode.getComponent(cc.Label).string = itemData.name;
                // console.log('设置角色名称:', itemData.name);
            }
            // 设置角色重量
            if (weightNode) {
                var weight = GameData_1.default.roleWeights[itemData.index] || 0;
                weightNode.getComponent(cc.Label).string = "\u91CD\u91CF" + weight;
                // console.log('设置角色重量:', weight);
            }
            // 设置价格
            if (priceNode) {
                priceNode.getComponent(cc.Label).string = "" + itemData.price;
                // console.log('设置角色价格:', itemData.price);
            }
            if (itemData.unlocked) {
                // 角色已解锁
                if (offNode)
                    offNode.active = false;
                if (onNode) {
                    onNode.active = true;
                    this.setUseButtonVisual(onNode, itemData.isUsing);
                    // 添加点击事件
                    onNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRoleSelectClick(itemData.index); }, this);
                }
            }
            else {
                // 角色未解锁
                if (offNode) {
                    offNode.active = true;
                    // 从off节点下获取text节点
                    var textNode = offNode.getChildByName('text');
                    if (textNode) {
                        textNode.getComponent(cc.Label).string = itemData.price + '';
                    }
                    // 添加点击事件
                    offNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onRoleUnlockClick(itemData.index); }, this);
                }
                if (onNode)
                    onNode.active = false;
            }
        }
        else if (itemData.type === 'stamina') {
            // 体力商品
            // 设置名称
            if (nameNode) {
                nameNode.getComponent(cc.Label).string = itemData.name;
            }
            // 隐藏重量节点
            if (weightNode) {
                weightNode.active = false;
            }
            // 设置价格
            if (priceNode) {
                priceNode.getComponent(cc.Label).string = "" + itemData.price;
            }
            if (offNode)
                offNode.active = true;
            // if (onNode) {
            //     onNode.active = true;
            //     // 从on节点下获取text节点
            //     const textNode = onNode.getChildByName('text');
            //     if (textNode) {
            //         textNode.getComponent(cc.Label).string = '购买';
            //     }
            // 添加点击事件
            offNode.on(cc.Node.EventType.TOUCH_END, this.onStaminaBuyClick, this);
            //     // 检查体力是否已满或钻石是否不足
            //     const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
            //     const isDiamondEnough = mGameData.currentGold >= itemData.price;
            //     const isDisabled = isStaminaFull || !isDiamondEnough;
            //     // 设置button组件的interactable属性
            //     const buttonComponent = onNode.getComponent(cc.Button);
            //     if (buttonComponent) {
            //         buttonComponent.interactable = !isDisabled;
            //     }
            // }
        }
    };
    /**
     * 调整容器大小
     */
    ShopManager.prototype.adjustContainerSize = function (scrollOffset) {
        if (scrollOffset === void 0) { scrollOffset = null; }
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        var container = this.scrollView.content;
        var layout = container.getComponent(cc.Layout);
        if (layout)
            layout.enabled = false;
        var children = container.children;
        if (children.length === 0) {
            return;
        }
        // 获取商品项的大小（使用第一个商品项作为参考）
        var item = children[0];
        var itemWidth = item.width;
        var itemHeight = item.height;
        // 获取view节点宽度
        var view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        var viewWidth = Math.max(this.scrollView.node.width || 0, view.width || 0, 520);
        view.width = viewWidth;
        container.width = viewWidth;
        var columns = 2;
        var columnSpacing = 20;
        var rowSpacing = 6;
        var topPadding = 4;
        var bottomPadding = 18;
        var rows = Math.ceil(children.length / columns);
        var totalHeight = Math.max(view.height, topPadding + rows * itemHeight + Math.max(0, rows - 1) * rowSpacing + bottomPadding);
        container.height = totalHeight;
        // content锚点保持顶部居中，按效果图两列排列。
        container.anchorX = 0.5;
        container.anchorY = 1;
        var columnOffset = itemWidth / 2 + columnSpacing / 2;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var row = Math.floor(i / columns);
            var col = i % columns;
            child.x = col === 0 ? -columnOffset : columnOffset;
            child.y = -topPadding - itemHeight / 2 - row * (itemHeight + rowSpacing);
        }
        if (scrollOffset && this.scrollView.scrollToOffset) {
            this.scrollView.scrollToOffset(scrollOffset, 0);
            return;
        }
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.scrollView.scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    };
    ShopManager.prototype.onEnable = function () {
        // 当面板显示时更新UI
        this.updateUI();
    };
    ShopManager.prototype.onBackClick = function () {
        this.node.active = false;
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
    };
    /**
     * 更新商店UI
     */
    ShopManager.prototype.updateUI = function (keepScrollPosition) {
        if (keepScrollPosition === void 0) { keepScrollPosition = false; }
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = GameData_1.default.currentGold.toString();
        }
        // 重新初始化商品数据并刷新滚动列表
        this.initShopItems(keepScrollPosition);
    };
    /**
     * 角色解锁按钮点击事件
     */
    ShopManager.prototype.onRoleUnlockClick = function (roleIndex) {
        if (!GameData_1.default.unlockedRoles[roleIndex]) {
            var price = GameData_1.default.rolePrices[roleIndex];
            if (GameData_1.default.currentGold >= price) {
                // 显示二次确认弹窗
                this.showConfirmPanel('unlockRole', roleIndex, "\u786E\u5B9A\u8981\u82B1\u8D39" + price + "\u94BB\u77F3\u89E3\u9501\u89D2\u8272\u5417\uFF1F");
            }
            else {
                // 钻石不足
                TipsManager_1.default.show('钻石不足，无法解锁角色。');
            }
        }
    };
    /**
     * 角色选择按钮点击事件
     */
    ShopManager.prototype.onRoleSelectClick = function (roleIndex) {
        if (GameData_1.default.unlockedRoles[roleIndex]) {
            if (GameData_1.default.currentRole === roleIndex) {
                return;
            }
            var previousRole = GameData_1.default.currentRole;
            // 选中该角色
            GameData_1.default.currentRole = roleIndex;
            // 保存数据
            GameData_1.default.SaveCurrentRoleData();
            // 只切换使用按钮状态，避免重建滚动列表导致界面闪烁。
            this.refreshRoleUseButtons(previousRole, roleIndex);
            // 显示提示
            TipsManager_1.default.show('角色切换成功！');
        }
    };
    /**
     * 购买体力按钮点击事件
     */
    ShopManager.prototype.onStaminaBuyClick = function () {
        // 检查体力是否已满
        if (GameData_1.default.currentStamina >= GameData_1.default.maxStamina) {
            TipsManager_1.default.show('体力已满，无需购买。');
            return;
        }
        // 检查钻石是否足够
        if (GameData_1.default.currentGold < this.staminaPrice) {
            TipsManager_1.default.show('钻石不足，无法购买体力。');
            return;
        }
        // 显示二次确认弹窗
        this.showConfirmPanel('buyStamina', -1, "\u786E\u5B9A\u8981\u82B1\u8D39" + this.staminaPrice + "\u94BB\u77F3\u8D2D\u4E7010\u70B9\u4F53\u529B\u5417\uFF1F");
    };
    /**
     * 显示确认弹窗
     */
    ShopManager.prototype.showConfirmPanel = function (operation, roleIndex, message) {
        // 保存当前操作信息
        this.currentOperation = operation;
        this.currentRoleIndex = roleIndex;
        // 显示提示面板
        if (this.tipsPanel) {
            this.tipsPanel.active = true;
        }
        // 设置提示信息
        if (this.tipsLabel) {
            this.tipsLabel.string = message;
        }
    };
    /**
     * 确认按钮点击事件
     */
    ShopManager.prototype.onConfirmClick = function () {
        // 隐藏提示面板
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }
        // 根据当前操作类型执行相应的逻辑
        if (this.currentOperation === 'unlockRole' && this.currentRoleIndex >= 0) {
            // 执行角色解锁逻辑
            this.executeRoleUnlock(this.currentRoleIndex);
        }
        else if (this.currentOperation === 'buyStamina') {
            // 执行购买体力逻辑
            this.executeStaminaBuy();
        }
        // 重置操作信息
        this.currentOperation = '';
        this.currentRoleIndex = -1;
    };
    /**
     * 取消按钮点击事件
     */
    ShopManager.prototype.onCancelClick = function () {
        // 隐藏提示面板
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }
        // 重置操作信息
        this.currentOperation = '';
        this.currentRoleIndex = -1;
    };
    /**
     * 执行角色解锁逻辑
     */
    ShopManager.prototype.executeRoleUnlock = function (roleIndex) {
        if (!GameData_1.default.unlockedRoles[roleIndex]) {
            var price = GameData_1.default.rolePrices[roleIndex];
            if (GameData_1.default.currentGold >= price) {
                // 扣除钻石
                GameData_1.default.currentGold -= price;
                // 解锁角色
                GameData_1.default.unlockedRoles[roleIndex] = true;
                // 选中该角色
                GameData_1.default.currentRole = roleIndex;
                // 保存数据
                GameData_1.default.SaveGoldData();
                GameData_1.default.SaveUnlockedRolesData();
                GameData_1.default.SaveCurrentRoleData();
                // 更新UI
                this.updateUI();
                // 发送钻石数量更新事件
                cc.director.emit('goldUpdated');
                // 显示提示
                TipsManager_1.default.show('角色解锁成功！');
            }
        }
    };
    /**
     * 执行购买体力逻辑
     */
    ShopManager.prototype.executeStaminaBuy = function () {
        // 检查体力是否已满
        if (GameData_1.default.currentStamina >= GameData_1.default.maxStamina) {
            TipsManager_1.default.show('体力已满，无需购买。');
            return;
        }
        // 检查钻石是否足够
        if (GameData_1.default.currentGold < this.staminaPrice) {
            TipsManager_1.default.show('钻石不足，无法购买体力。');
            return;
        }
        // 扣除钻石
        GameData_1.default.currentGold -= this.staminaPrice;
        // 增加体力
        GameData_1.default.currentStamina = Math.min(GameData_1.default.maxStamina, GameData_1.default.currentStamina + 10);
        // 保存数据
        GameData_1.default.SaveGoldData();
        GameData_1.default.SaveStaminaData();
        // 更新UI
        this.updateUI();
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
        // 显示提示
        TipsManager_1.default.show('购买成功！获得10点体力。');
    };
    /**
     * 设置按钮状态
     */
    ShopManager.prototype.setBtnState = function (btn, enabled) {
        if (btn) {
            // 处理Button组件（如果存在）
            var buttonComponent = btn.getComponent(cc.Button);
            if (buttonComponent) {
                buttonComponent.interactable = enabled;
            }
            // 处理Sprite组件（图片按钮）
            var spriteComponent = btn.getComponent(cc.Sprite);
            if (spriteComponent) {
                // 根据按钮名称选择对应的图片
                var targetSpriteFrame = null;
                targetSpriteFrame = enabled ? this.btn1Normal : this.btn1Disabled;
                // 如果找到对应的图片，则设置
                if (targetSpriteFrame) {
                    spriteComponent.spriteFrame = targetSpriteFrame;
                }
            }
            // 为图片按钮设置触摸可用性标记
            btn['_isEnabled'] = enabled;
        }
    };
    ShopManager.prototype.setUseButtonVisual = function (btn, isUsing) {
        var _this = this;
        var textNode = btn.getChildByName('text');
        if (textNode) {
            textNode.active = false;
            var label = textNode.getComponent(cc.Label);
            if (label)
                label.string = '';
        }
        var spriteComponent = btn.getComponent(cc.Sprite);
        if (!spriteComponent)
            return;
        var path = isUsing ? '2main/anniushiyongzhong' : '2main/anniushiyong';
        var cachedFrame = this.useButtonFrames[path];
        if (cachedFrame) {
            spriteComponent.spriteFrame = cachedFrame;
            spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            return;
        }
        cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.error('加载商店使用按钮图片失败:', path, err);
                return;
            }
            _this.useButtonFrames[path] = spriteFrame;
            if (btn && btn.isValid && spriteComponent && spriteComponent.isValid) {
                spriteComponent.spriteFrame = spriteFrame;
                spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    };
    ShopManager.prototype.refreshRoleUseButtons = function (previousRole, currentRole) {
        if (!this.scrollView || !this.scrollView.content)
            return;
        for (var i = 0; i < this.shopItems.length; i++) {
            var itemData = this.shopItems[i];
            if (itemData.type !== 'role')
                continue;
            if (itemData.index !== previousRole && itemData.index !== currentRole)
                continue;
            itemData.isUsing = itemData.index === currentRole;
            var itemNode = this.scrollView.content.children[i];
            if (!itemNode)
                continue;
            var onNode = itemNode.getChildByName('on');
            if (onNode && onNode.active) {
                this.setUseButtonVisual(onNode, itemData.isUsing);
            }
        }
    };
    ShopManager.prototype.preloadUseButtonFrames = function () {
        var _this = this;
        ['2main/anniushiyong', '2main/anniushiyongzhong'].forEach(function (path) {
            if (_this.useButtonFrames[path])
                return;
            cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    console.error('预加载商店使用按钮图片失败:', path, err);
                    return;
                }
                _this.useButtonFrames[path] = spriteFrame;
            });
        });
    };
    ShopManager.prototype.show = function () {
        this.initShopItems();
        this.preloadUseButtonFrames();
        this.node.active = true;
    };
    ShopManager.prototype.hide = function () {
        this.node.active = false;
    };
    __decorate([
        property(cc.Node)
    ], ShopManager.prototype, "closeBtn", void 0);
    __decorate([
        property(cc.Label)
    ], ShopManager.prototype, "zs_num", void 0);
    __decorate([
        property(cc.ScrollView)
    ], ShopManager.prototype, "scrollView", void 0);
    __decorate([
        property(cc.Prefab)
    ], ShopManager.prototype, "itemPrefab", void 0);
    __decorate([
        property(cc.Node)
    ], ShopManager.prototype, "itemContainer", void 0);
    __decorate([
        property(cc.Node)
    ], ShopManager.prototype, "tipsPanel", void 0);
    __decorate([
        property(cc.Label)
    ], ShopManager.prototype, "tipsLabel", void 0);
    __decorate([
        property(cc.Node)
    ], ShopManager.prototype, "confirmBtn", void 0);
    __decorate([
        property(cc.Node)
    ], ShopManager.prototype, "cancelBtn", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], ShopManager.prototype, "btn1Normal", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], ShopManager.prototype, "btn1Disabled", void 0);
    ShopManager = __decorate([
        ccclass
    ], ShopManager);
    return ShopManager;
}(cc.Component));
exports.default = ShopManager;

cc._RF.pop();