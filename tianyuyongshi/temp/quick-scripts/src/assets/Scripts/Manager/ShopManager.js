"use strict";
cc._RF.push(module, '17727aLv0tOjoAhIEbz/+Nh', 'ShopManager');
// Scripts/Manager/ShopManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../Load/GameData");
var TipsManager_1 = require("../Load/TipsManager");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var SHOP_GRID_COLUMNS = 3;
var SHOP_GRID_VISIBLE_ROWS = 2;
var SHOP_ITEM_MAX_SCALE = 0.72;
var SHOP_ITEM_MIN_SCALE = 0.55;
var SHOP_ITEM_HORIZONTAL_SPACING = 48;
var SHOP_ITEM_VERTICAL_SPACING = 8;
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
        return _this;
    }
    ShopManager.prototype.onLoad = function () {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        // 初始化商品数据
        this.initShopItems();
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
    ShopManager.prototype.initShopItems = function (keepScroll) {
        if (keepScroll === void 0) { keepScroll = false; }
        // 清空商品数据数组
        this.shopItems = [];
        // 添加角色商品
        for (var i = 0; i < GameData_1.default.rolePrices.length; i++) {
            this.shopItems.push({
                type: 'role',
                index: i,
                name: GameData_1.default.roleNames[i] || "\u89D2\u8272 " + (i + 1),
                iconPath: "zzImg2/" + (i + 1),
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
        this.refreshScrollView(keepScroll);
    };
    /**
     * 刷新滚动列表
     */
    ShopManager.prototype.refreshScrollView = function (keepScroll) {
        if (keepScroll === void 0) { keepScroll = false; }
        if (!this.scrollView || !this.itemPrefab || !this.scrollView.content) {
            console.error('ScrollView or itemPrefab not assigned');
            return;
        }
        this.configureStaticGridScrollView();
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
        this.adjustContainerSize();
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
                    // 角色商品，显示玩法内同一套 zzImg2/1-5 资源
                    var iconPath_1 = itemData.iconPath || "zzImg2/" + (itemData.index + 1);
                    iconNode.scale = 1;
                    cc.loader.loadRes(iconPath_1, cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            console.error("\u52A0\u8F7D" + iconPath_1 + "\u5931\u8D25:", err);
                        }
                        else {
                            spriteComponent_1.spriteFrame = spriteFrame;
                        }
                    });
                }
                else if (itemData.type === 'stamina') {
                    // 体力商品，显示 tili.png
                    cc.loader.loadRes('zzImg/tili', cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            console.error('加载tili失败:', err);
                        }
                        else {
                            spriteComponent_1.spriteFrame = spriteFrame;
                        }
                    });
                    iconNode.scale = 2;
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
                    // 从on节点下获取text节点
                    var textNode = onNode.getChildByName('text');
                    if (textNode) {
                        if (itemData.isUsing) {
                            textNode.getComponent(cc.Label).string = '使用中';
                            // 设置使用中的背景图片
                            var spriteComponent = onNode.getComponent(cc.Sprite);
                            // if (spriteComponent) {
                            //     cc.loader.loadRes('AImg/di1', cc.SpriteFrame, (err, spriteFrame) => {
                            //         if (err) {
                            //             console.error('加载di1失败:', err);
                            //         } else {
                            //             spriteComponent.spriteFrame = spriteFrame;
                            //         }
                            //     });
                            // }
                        }
                        else {
                            textNode.getComponent(cc.Label).string = '使用';
                            // 设置普通使用的背景图片
                            var spriteComponent = onNode.getComponent(cc.Sprite);
                            // if (spriteComponent) {
                            //     cc.loader.loadRes('AImg/di2', cc.SpriteFrame, (err, spriteFrame) => {
                            //         if (err) {
                            //             console.error('加载di2失败:', err);
                            //         } else {
                            //             spriteComponent.spriteFrame = spriteFrame;
                            //         }
                            //     });
                            // }
                        }
                    }
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
    ShopManager.prototype.adjustContainerSize = function () {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        var container = this.scrollView.content;
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
        var viewWidth = view.width;
        var viewHeight = view.height || this.scrollView.node.height;
        // 商品项按3列2行缩放排列，保证6个商品同屏显示。
        var columnCount = SHOP_GRID_COLUMNS;
        var visibleRows = SHOP_GRID_VISIBLE_ROWS;
        var rowCount = Math.ceil(children.length / columnCount);
        var layoutRows = Math.max(visibleRows, rowCount);
        var maxScaleX = (viewWidth - SHOP_ITEM_HORIZONTAL_SPACING * (columnCount - 1)) / (itemWidth * columnCount);
        var maxScaleY = (viewHeight - SHOP_ITEM_VERTICAL_SPACING * (layoutRows - 1)) / (itemHeight * layoutRows);
        var itemScale = Math.max(SHOP_ITEM_MIN_SCALE, Math.min(SHOP_ITEM_MAX_SCALE, maxScaleX, maxScaleY));
        var scaledItemWidth = itemWidth * itemScale;
        var scaledItemHeight = itemHeight * itemScale;
        var horizontalSpacing = SHOP_ITEM_HORIZONTAL_SPACING;
        var verticalSpacing = SHOP_ITEM_VERTICAL_SPACING;
        var gridWidth = columnCount * scaledItemWidth + (columnCount - 1) * horizontalSpacing;
        var gridHeight = rowCount * scaledItemHeight + Math.max(0, rowCount - 1) * verticalSpacing;
        var yPadding = Math.max(0, (viewHeight - gridHeight) / 2);
        // 设置content的大小，宽高与view一致，避免产生可滚动范围。
        container.width = viewWidth;
        container.height = viewHeight;
        // 设置content的锚点为左上角
        container.anchorX = 0.5;
        container.anchorY = 1;
        container.x = 0;
        container.y = 0;
        // 设置商品项的位置（三列网格，整体居中显示）
        var startX = -gridWidth / 2 + scaledItemWidth / 2;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var row = Math.floor(i / columnCount);
            var col = i % columnCount;
            child.scale = itemScale;
            // 设置商品项的位置，从顶部开始排列，考虑y方向padding和商品项高度
            child.y = -yPadding - scaledItemHeight / 2 - row * (scaledItemHeight + verticalSpacing);
            // 三列横向居中显示
            child.x = startX + col * (scaledItemWidth + horizontalSpacing);
        }
        this.configureStaticGridScrollView();
        this.scrollView.scrollToOffset(cc.v2(0, 0), 0);
    };
    ShopManager.prototype.configureStaticGridScrollView = function () {
        if (!this.scrollView) {
            return;
        }
        this.scrollView.horizontal = false;
        this.scrollView.vertical = false;
        this.scrollView.inertia = false;
        this.scrollView.elastic = false;
        this.scrollView.cancelInnerEvents = false;
        this.scrollView.stopAutoScroll();
        if (this.scrollView.verticalScrollBar) {
            this.scrollView.verticalScrollBar.node.active = false;
        }
        if (this.scrollView.horizontalScrollBar) {
            this.scrollView.horizontalScrollBar.node.active = false;
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
    ShopManager.prototype.updateUI = function (keepScroll) {
        if (keepScroll === void 0) { keepScroll = false; }
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = GameData_1.default.currentGold.toString();
        }
        // 重新初始化商品数据并刷新滚动列表
        this.initShopItems(keepScroll);
    };
    ShopManager.prototype.refreshRoleSelectionState = function () {
        if (!this.scrollView || !this.scrollView.content) {
            return;
        }
        for (var i = 0; i < this.shopItems.length; i++) {
            var itemData = this.shopItems[i];
            if (itemData.type === 'role') {
                itemData.isUsing = itemData.index === GameData_1.default.currentRole;
            }
        }
        var children = this.scrollView.content.children;
        for (var i = 0; i < children.length; i++) {
            var itemData = this.shopItems[i];
            if (!itemData || itemData.type !== 'role' || !itemData.unlocked) {
                continue;
            }
            var itemNode = children[i];
            var offNode = itemNode.getChildByName('off');
            var onNode = itemNode.getChildByName('on');
            if (offNode)
                offNode.active = false;
            if (!onNode)
                continue;
            onNode.active = true;
            var textNode = onNode.getChildByName('text');
            var label = textNode ? textNode.getComponent(cc.Label) : null;
            if (label) {
                label.string = itemData.isUsing ? '使用中' : '使用';
            }
        }
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
            // 选中该角色
            GameData_1.default.currentRole = roleIndex;
            // 保存数据
            GameData_1.default.SaveCurrentRoleData();
            // 更新UI
            this.refreshRoleSelectionState();
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