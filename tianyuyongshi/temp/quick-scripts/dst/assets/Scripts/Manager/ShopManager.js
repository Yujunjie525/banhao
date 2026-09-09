
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/ShopManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcU2hvcE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUF5QztBQUN6QyxtREFBOEM7QUFFeEMsSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFFMUMsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDNUIsSUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUM7QUFDakMsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDakMsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDakMsSUFBTSw0QkFBNEIsR0FBRyxFQUFFLENBQUM7QUFDeEMsSUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7QUFJckM7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFrcEJDO1FBaHBCRyxjQUFRLEdBQVksSUFBSSxDQUFDO1FBR3pCLFlBQU0sR0FBYSxJQUFJLENBQUM7UUFFeEIsU0FBUztRQUVULGdCQUFVLEdBQWtCLElBQUksQ0FBQyxDQUFDLFNBQVM7UUFFM0MsU0FBUztRQUVULGdCQUFVLEdBQWMsSUFBSSxDQUFDLENBQUMsU0FBUztRQUV2QyxRQUFRO1FBRVIsbUJBQWEsR0FBWSxJQUFJLENBQUMsQ0FBQyxVQUFVO1FBRXpDLFVBQVU7UUFDRixrQkFBWSxHQUFXLEdBQUcsQ0FBQyxDQUFDLFVBQVU7UUFFOUMsU0FBUztRQUVULGVBQVMsR0FBWSxJQUFJLENBQUMsQ0FBQyxTQUFTO1FBRXBDLFNBQVM7UUFFVCxlQUFTLEdBQWEsSUFBSSxDQUFDLENBQUMsU0FBUztRQUVyQyxPQUFPO1FBRVAsZ0JBQVUsR0FBWSxJQUFJLENBQUMsQ0FBQyxPQUFPO1FBRW5DLE9BQU87UUFFUCxlQUFTLEdBQVksSUFBSSxDQUFDLENBQUMsT0FBTztRQUVsQyxXQUFXO1FBRVgsZ0JBQVUsR0FBbUIsSUFBSSxDQUFD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QUFJLENBQUMsWUFBWSxDQUFDO2dCQUNsRSxnQkFBZ0I7Z0JBQ2hCLElBQUksaUJBQWlCLEVBQUU7b0JBQ25CLGVBQWUsQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLENBQUM7aUJBQ25EO2FBQ0o7WUFFRCxpQkFBaUI7WUFDakIsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztTQUMvQjtJQUNMLENBQUM7SUEvb0JEO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7aURBQ087SUFHekI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzsrQ0FDSztJQUl4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO21EQUNTO0lBSWpDO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7bURBQ1M7SUFJN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztzREFDWTtJQU85QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNRO0lBSTFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7a0RBQ1E7SUFJM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDUztJQUkzQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNRO0lBSTFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7bURBQ1M7SUFHbEM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQztxREFDVztJQTNDbkIsV0FBVztRQUQvQixPQUFPO09BQ2EsV0FBVyxDQWtwQi9CO0lBQUQsa0JBQUM7Q0FscEJELEFBa3BCQyxDQWxwQndDLEVBQUUsQ0FBQyxTQUFTLEdBa3BCcEQ7a0JBbHBCb0IsV0FBVyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtR2FtZURhdGEgZnJvbSBcIi4uL0xvYWQvR2FtZURhdGFcIjtcbmltcG9ydCBUaXBzTWFuYWdlciBmcm9tIFwiLi4vTG9hZC9UaXBzTWFuYWdlclwiO1xuXG5jb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcblxuY29uc3QgU0hPUF9HUklEX0NPTFVNTlMgPSAzO1xuY29uc3QgU0hPUF9HUklEX1ZJU0lCTEVfUk9XUyA9IDI7XG5jb25zdCBTSE9QX0lURU1fTUFYX1NDQUxFID0gMC43MjtcbmNvbnN0IFNIT1BfSVRFTV9NSU5fU0NBTEUgPSAwLjU1O1xuY29uc3QgU0hPUF9JVEVNX0hPUklaT05UQUxfU1BBQ0lORyA9IDQ4O1xuY29uc3QgU0hPUF9JVEVNX1ZFUlRJQ0FMX1NQQUNJTkcgPSA4O1xuXG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaG9wTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgY2xvc2VCdG46IGNjLk5vZGUgPSBudWxsOyBcbiAgICBcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgenNfbnVtOiBjYy5MYWJlbCA9IG51bGw7IFxuXG4gICAgLy8g5rua5Yqo6KeG5Zu+6IqC54K5XG4gICAgQHByb3BlcnR5KGNjLlNjcm9sbFZpZXcpXG4gICAgc2Nyb2xsVmlldzogY2MuU2Nyb2xsVmlldyA9IG51bGw7IC8vIOa7muWKqOinhuWbvuiKgueCuVxuICAgIFxuICAgIC8vIOWVhuWTgemhuemihOWItuS9k1xuICAgIEBwcm9wZXJ0eShjYy5QcmVmYWIpXG4gICAgaXRlbVByZWZhYjogY2MuUHJlZmFiID0gbnVsbDsgLy8g5ZWG5ZOB6aG56aKE5Yi25L2TXG4gICAgXG4gICAgLy8g5ZWG5ZOB6aG55a655ZmoXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgaXRlbUNvbnRhaW5lcjogY2MuTm9kZSA9IG51bGw7IC8vIOWVhuWTgemhueWuueWZqOiKgueCuVxuICAgIFxuICAgIC8vIOS9k+WKm+WVhuWTgemhueS7t+agvFxuICAgIHByaXZhdGUgc3RhbWluYVByaWNlOiBudW1iZXIgPSAxMDA7IC8vIOS9k+WKm+WVhuWTgemhueS7t+agvFxuICAgIFxuICAgIC8vIOaPkOekuumdouadv+iKgueCuVxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHRpcHNQYW5lbDogY2MuTm9kZSA9IG51bGw7IC8vIOaPkOekuumdouadv+iKgueCuVxuICAgIFxuICAgIC8vIOaPkOekuuS/oeaBr+agh+etvlxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB0aXBzTGFiZWw6IGNjLkxhYmVsID0gbnVsbDsgLy8g5o+Q56S65L+h5oGv5qCH562+XG4gICAgXG4gICAgLy8g56Gu6K6k5oyJ6ZKuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgY29uZmlybUJ0bjogY2MuTm9kZSA9IG51bGw7IC8vIOehruiupOaMiemSrlxuICAgIFxuICAgIC8vIOWPlua2iOaMiemSrlxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNhbmNlbEJ0bjogY2MuTm9kZSA9IG51bGw7IC8vIOWPlua2iOaMiemSrlxuICAgIFxuICAgIC8vIOaMiemSruato+W4uOeKtuaAgeWbvueJh1xuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGVGcmFtZSlcbiAgICBidG4xTm9ybWFsOiBjYy5TcHJpdGVGcmFtZSA9IG51bGw7XG4gICAgLy8g5oyJ6ZKu56aB55So54q25oCB5Zu+54mHXG4gICAgQHByb3BlcnR5KGNjLlNwcml0ZUZyYW1lKVxuICAgIGJ0bjFEaXNhYmxlZDogY2MuU3ByaXRlRnJhbWUgPSBudWxsO1xuICAgIFxuICAgIC8vIOW9k+WJjeaTjeS9nOexu+Wei1xuICAgIHByaXZhdGUgY3VycmVudE9wZXJhdGlvbjogc3RyaW5nID0gJyc7IC8vICd1bmxvY2tSb2xlJyDmiJYgJ2J1eVN0YW1pbmEnXG4gICAgLy8g5b2T5YmN5pON5L2c55qE6KeS6Imy57Si5byVXG4gICAgcHJpdmF0ZSBjdXJyZW50Um9sZUluZGV4OiBudW1iZXIgPSAtMTtcbiAgICBcbiAgICAvLyDllYblk4HmlbDmja7mlbDnu4RcbiAgICBwcml2YXRlIHNob3BJdGVtczogYW55W10gPSBbXTtcbiAgICBcbiAgICBvbkxvYWQgKCkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZUJ0bikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25CYWNrQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliJ3lp4vljJbllYblk4HmlbDmja5cbiAgICAgICAgdGhpcy5pbml0U2hvcEl0ZW1zKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDkuLrmj5DnpLrpnaLmnb/mjInpkq7mt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgaWYgKHRoaXMuY29uZmlybUJ0bikge1xuICAgICAgICAgICAgdGhpcy5jb25maXJtQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vbkNvbmZpcm1DbGljaywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2FuY2VsQnRuKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25DYW5jZWxDbGljaywgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyW5ZWG5ZOB5pWw5o2uXG4gICAgICovXG4gICAgaW5pdFNob3BJdGVtcyhrZWVwU2Nyb2xsOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgLy8g5riF56m65ZWG5ZOB5pWw5o2u5pWw57uEXG4gICAgICAgIHRoaXMuc2hvcEl0ZW1zID0gW107XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDop5LoibLllYblk4FcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtR2FtZURhdGEucm9sZVByaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zaG9wSXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JvbGUnLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIG5hbWU6IG1HYW1lRGF0YS5yb2xlTmFtZXNbaV0gfHwgYOinkuiJsiAke2kgKyAxfWAsXG4gICAgICAgICAgICAgICAgaWNvblBhdGg6IGB6ekltZzIvJHtpICsgMX1gLFxuICAgICAgICAgICAgICAgIHByaWNlOiBtR2FtZURhdGEucm9sZVByaWNlc1tpXSxcbiAgICAgICAgICAgICAgICB1bmxvY2tlZDogbUdhbWVEYXRhLnVubG9ja2VkUm9sZXNbaV0sXG4gICAgICAgICAgICAgICAgaXNVc2luZzogaSA9PT0gbUdhbWVEYXRhLmN1cnJlbnRSb2xlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5L2T5Yqb5ZWG5ZOBXG4gICAgICAgIHRoaXMuc2hvcEl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ3N0YW1pbmEnLFxuICAgICAgICAgICAgaW5kZXg6IC0xLFxuICAgICAgICAgICAgbmFtZTogJzEw5L2T5YqbJyxcbiAgICAgICAgICAgIHByaWNlOiB0aGlzLnN0YW1pbmFQcmljZSxcbiAgICAgICAgICAgIHVubG9ja2VkOiB0cnVlLFxuICAgICAgICAgICAgaXNVc2luZzogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDliLfmlrDmu5rliqjliJfooahcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Nyb2xsVmlldyhrZWVwU2Nyb2xsKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5Yi35paw5rua5Yqo5YiX6KGoXG4gICAgICovXG4gICAgcmVmcmVzaFNjcm9sbFZpZXcoa2VlcFNjcm9sbDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxWaWV3IHx8ICF0aGlzLml0ZW1QcmVmYWIgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JvbGxWaWV3IG9yIGl0ZW1QcmVmYWIgbm90IGFzc2lnbmVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25maWd1cmVTdGF0aWNHcmlkU2Nyb2xsVmlldygpO1xuICAgICAgICBcbiAgICAgICAgLy8g5riF56m65a655ZmoXG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDpgY3ljobllYblk4HmlbDmja7vvIzliJvlu7rllYblk4HpoblcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNob3BJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbURhdGEgPSB0aGlzLnNob3BJdGVtc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu65ZWG5ZOB6aG56IqC54K5XG4gICAgICAgICAgICBjb25zdCBpdGVtTm9kZSA9IGNjLmluc3RhbnRpYXRlKHRoaXMuaXRlbVByZWZhYik7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFZpZXcuY29udGVudC5hZGRDaGlsZChpdGVtTm9kZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruWVhuWTgemhueaVsOaNrlxuICAgICAgICAgICAgdGhpcy5zZXRJdGVtRGF0YShpdGVtTm9kZSwgaXRlbURhdGEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDosIPmlbTlrrnlmajlpKflsI9cbiAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJTaXplKCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOiuvue9ruWVhuWTgemhueaVsOaNrlxuICAgICAqL1xuICAgIHNldEl0ZW1EYXRhKGl0ZW1Ob2RlOiBjYy5Ob2RlLCBpdGVtRGF0YTogYW55KSB7XG4gICAgICAgIC8vIOaJvuWIsG9mZuWSjG9u6IqC54K5XG4gICAgICAgIGNvbnN0IG9mZk5vZGUgPSBpdGVtTm9kZS5nZXRDaGlsZEJ5TmFtZSgnb2ZmJyk7XG4gICAgICAgIGNvbnN0IG9uTm9kZSA9IGl0ZW1Ob2RlLmdldENoaWxkQnlOYW1lKCdvbicpO1xuICAgICAgICBcbiAgICAgICAgLy8g5om+5Yiw5ZCN56ew44CB6YeN6YeP5ZKM5Lu35qC86IqC54K5XG4gICAgICAgIGNvbnN0IG5hbWVOb2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ25hbWUnKTtcbiAgICAgICAgY29uc3Qgd2VpZ2h0Tm9kZSA9IGl0ZW1Ob2RlLmdldENoaWxkQnlOYW1lKCd3ZWlnaHQnKTtcbiAgICAgICAgY29uc3QgcHJpY2VOb2RlID0gb2ZmTm9kZS5nZXRDaGlsZEJ5TmFtZSgncHJpY2UnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaJvuWIsOWbvuagh+iKgueCue+8iOWBh+iuvuWbvuagh+iKgueCueWQjeensOS4uidpY29uJ++8iVxuICAgICAgICBjb25zdCBpY29uTm9kZSA9IGl0ZW1Ob2RlLmdldENoaWxkQnlOYW1lKCdpY29uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZygn6K6+572u5ZWG5ZOB6aG55pWw5o2uOicsIGl0ZW1EYXRhKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ+iKgueCuee7k+aehDonLCB7XG4gICAgICAgIC8vICAgICBvZmZOb2RlOiBvZmZOb2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJyxcbiAgICAgICAgLy8gICAgIG9uTm9kZTogb25Ob2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJyxcbiAgICAgICAgLy8gICAgIG5hbWVOb2RlOiBuYW1lTm9kZSA/ICfmib7liLAnIDogJ+acquaJvuWIsCcsXG4gICAgICAgIC8vICAgICB3ZWlnaHROb2RlOiB3ZWlnaHROb2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJyxcbiAgICAgICAgLy8gICAgIHByaWNlTm9kZTogcHJpY2VOb2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJyxcbiAgICAgICAgLy8gICAgIGljb25Ob2RlOiBpY29uTm9kZSA/ICfmib7liLAnIDogJ+acquaJvuWIsCdcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDorr7nva7lm77moIdcbiAgICAgICAgaWYgKGljb25Ob2RlKSB7XG4gICAgICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBpY29uTm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGlmIChzcHJpdGVDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbURhdGEudHlwZSA9PT0gJ3JvbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOinkuiJsuWVhuWTge+8jOaYvuekuueOqeazleWGheWQjOS4gOWllyB6ekltZzIvMS01IOi1hOa6kFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpY29uUGF0aCA9IGl0ZW1EYXRhLmljb25QYXRoIHx8IGB6ekltZzIvJHtpdGVtRGF0YS5pbmRleCArIDF9YDtcbiAgICAgICAgICAgICAgICAgICAgaWNvbk5vZGUuc2NhbGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhpY29uUGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5Yqg6L29JHtpY29uUGF0aH3lpLHotKU6YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbURhdGEudHlwZSA9PT0gJ3N0YW1pbmEnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS9k+WKm+WVhuWTge+8jOaYvuekuiB0aWxpLnBuZ1xuICAgICAgICAgICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlcygnenpJbWcvdGlsaScsIGNjLlNwcml0ZUZyYW1lLCAoZXJyLCBzcHJpdGVGcmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WKoOi9vXRpbGnlpLHotKU6JywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpY29uTm9kZS5zY2FsZSA9IDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChpdGVtRGF0YS50eXBlID09PSAncm9sZScpIHtcbiAgICAgICAgICAgIC8vIOinkuiJsuWVhuWTgVxuICAgICAgICAgICAgLy8g6K6+572u6KeS6Imy5ZCN56ewXG4gICAgICAgICAgICBpZiAobmFtZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBuYW1lTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGl0ZW1EYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ+iuvue9ruinkuiJsuWQjeensDonLCBpdGVtRGF0YS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6+572u6KeS6Imy6YeN6YePXG4gICAgICAgICAgICBpZiAod2VpZ2h0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IG1HYW1lRGF0YS5yb2xlV2VpZ2h0c1tpdGVtRGF0YS5pbmRleF0gfHwgMDtcbiAgICAgICAgICAgICAgICB3ZWlnaHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gYOmHjemHjyR7d2VpZ2h0fWA7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ+iuvue9ruinkuiJsumHjemHjzonLCB3ZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7ku7fmoLxcbiAgICAgICAgICAgIGlmIChwcmljZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBwcmljZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBgJHtpdGVtRGF0YS5wcmljZX1gO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCforr7nva7op5LoibLku7fmoLw6JywgaXRlbURhdGEucHJpY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaXRlbURhdGEudW5sb2NrZWQpIHtcbiAgICAgICAgICAgICAgICAvLyDop5LoibLlt7Lop6PplIFcbiAgICAgICAgICAgICAgICBpZiAob2ZmTm9kZSkgb2ZmTm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAob25Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyDku45vbuiKgueCueS4i+iOt+WPlnRleHToioLngrlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBvbk5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3RleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbURhdGEuaXNVc2luZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gJ+S9v+eUqOS4rSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u5L2/55So5Lit55qE6IOM5pmv5Zu+54mHXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ByaXRlQ29tcG9uZW50ID0gb25Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChzcHJpdGVDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ0FJbWcvZGkxJywgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yqg6L29ZGkx5aSx6LSlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gJ+S9v+eUqCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u5pmu6YCa5L2/55So55qE6IOM5pmv5Zu+54mHXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ByaXRlQ29tcG9uZW50ID0gb25Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChzcHJpdGVDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ0FJbWcvZGkyJywgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yqg6L29ZGky5aSx6LSlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgICAgICAgICAgICAgICBvbk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uUm9sZVNlbGVjdENsaWNrKGl0ZW1EYXRhLmluZGV4KSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDop5LoibLmnKrop6PplIFcbiAgICAgICAgICAgICAgICBpZiAob2ZmTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBvZmZOb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS7jm9mZuiKgueCueS4i+iOt+WPlnRleHToioLngrlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBvZmZOb2RlLmdldENoaWxkQnlOYW1lKCd0ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBpdGVtRGF0YS5wcmljZSArICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgICAgICAgICAgICAgb2ZmTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25Sb2xlVW5sb2NrQ2xpY2soaXRlbURhdGEuaW5kZXgpLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9uTm9kZSkgb25Ob2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGl0ZW1EYXRhLnR5cGUgPT09ICdzdGFtaW5hJykge1xuICAgICAgICAgICAgLy8g5L2T5Yqb5ZWG5ZOBXG4gICAgICAgICAgICAvLyDorr7nva7lkI3np7BcbiAgICAgICAgICAgIGlmIChuYW1lTm9kZSkge1xuICAgICAgICAgICAgICAgIG5hbWVOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gaXRlbURhdGEubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6ZqQ6JeP6YeN6YeP6IqC54K5XG4gICAgICAgICAgICBpZiAod2VpZ2h0Tm9kZSkge1xuICAgICAgICAgICAgICAgIHdlaWdodE5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruS7t+agvFxuICAgICAgICAgICAgaWYgKHByaWNlTm9kZSkge1xuICAgICAgICAgICAgICAgIHByaWNlTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGAke2l0ZW1EYXRhLnByaWNlfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChvZmZOb2RlKSBvZmZOb2RlLmFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIGlmIChvbk5vZGUpIHtcbiAgICAgICAgICAgIC8vICAgICBvbk5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vICAgICAvLyDku45vbuiKgueCueS4i+iOt+WPlnRleHToioLngrlcbiAgICAgICAgICAgIC8vICAgICBjb25zdCB0ZXh0Tm9kZSA9IG9uTm9kZS5nZXRDaGlsZEJ5TmFtZSgndGV4dCcpO1xuICAgICAgICAgICAgLy8gICAgIGlmICh0ZXh0Tm9kZSkge1xuICAgICAgICAgICAgLy8gICAgICAgICB0ZXh0Tm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9ICfotK3kubAnO1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgICAgICAgICBvZmZOb2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblN0YW1pbmFCdXlDbGljaywgdGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAgICAgLy8g5qOA5p+l5L2T5Yqb5piv5ZCm5bey5ruh5oiW6ZK755+z5piv5ZCm5LiN6LazXG4gICAgICAgICAgICAvLyAgICAgY29uc3QgaXNTdGFtaW5hRnVsbCA9IG1HYW1lRGF0YS5jdXJyZW50U3RhbWluYSA+PSBtR2FtZURhdGEubWF4U3RhbWluYTtcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBpc0RpYW1vbmRFbm91Z2ggPSBtR2FtZURhdGEuY3VycmVudEdvbGQgPj0gaXRlbURhdGEucHJpY2U7XG4gICAgICAgICAgICAvLyAgICAgY29uc3QgaXNEaXNhYmxlZCA9IGlzU3RhbWluYUZ1bGwgfHwgIWlzRGlhbW9uZEVub3VnaDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vICAgICAvLyDorr7nva5idXR0b27nu4Tku7bnmoRpbnRlcmFjdGFibGXlsZ7mgKdcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBidXR0b25Db21wb25lbnQgPSBvbk5vZGUuZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgICAgICAvLyAgICAgaWYgKGJ1dHRvbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgLy8gICAgICAgICBidXR0b25Db21wb25lbnQuaW50ZXJhY3RhYmxlID0gIWlzRGlzYWJsZWQ7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOiwg+aVtOWuueWZqOWkp+Wwj1xuICAgICAqL1xuICAgIGFkanVzdENvbnRhaW5lclNpemUoKSB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxWaWV3IHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlld+aIlmNvbnRlbnToioLngrnmnKrorr7nva4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkcmVuO1xuICAgICAgICBcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bllYblk4HpobnnmoTlpKflsI/vvIjkvb/nlKjnrKzkuIDkuKrllYblk4HpobnkvZzkuLrlj4LogIPvvIlcbiAgICAgICAgY29uc3QgaXRlbSA9IGNoaWxkcmVuWzBdO1xuICAgICAgICBjb25zdCBpdGVtV2lkdGggPSBpdGVtLndpZHRoO1xuICAgICAgICBjb25zdCBpdGVtSGVpZ2h0ID0gaXRlbS5oZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5Z2aWV36IqC54K55a695bqmXG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnNjcm9sbFZpZXcubm9kZS5nZXRDaGlsZEJ5TmFtZSgndmlldycpO1xuICAgICAgICBpZiAoIXZpZXcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+acquaJvuWIsHZpZXfoioLngrknKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB2aWV3LndpZHRoO1xuICAgICAgICBjb25zdCB2aWV3SGVpZ2h0ID0gdmlldy5oZWlnaHQgfHwgdGhpcy5zY3JvbGxWaWV3Lm5vZGUuaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8g5ZWG5ZOB6aG55oyJM+WIlzLooYznvKnmlL7mjpLliJfvvIzkv53or4E25Liq5ZWG5ZOB5ZCM5bGP5pi+56S644CCXG4gICAgICAgIGNvbnN0IGNvbHVtbkNvdW50ID0gU0hPUF9HUklEX0NPTFVNTlM7XG4gICAgICAgIGNvbnN0IHZpc2libGVSb3dzID0gU0hPUF9HUklEX1ZJU0lCTEVfUk9XUztcbiAgICAgICAgY29uc3Qgcm93Q291bnQgPSBNYXRoLmNlaWwoY2hpbGRyZW4ubGVuZ3RoIC8gY29sdW1uQ291bnQpO1xuICAgICAgICBjb25zdCBsYXlvdXRSb3dzID0gTWF0aC5tYXgodmlzaWJsZVJvd3MsIHJvd0NvdW50KTtcbiAgICAgICAgY29uc3QgbWF4U2NhbGVYID0gKHZpZXdXaWR0aCAtIFNIT1BfSVRFTV9IT1JJWk9OVEFMX1NQQUNJTkcgKiAoY29sdW1uQ291bnQgLSAxKSkgLyAoaXRlbVdpZHRoICogY29sdW1uQ291bnQpO1xuICAgICAgICBjb25zdCBtYXhTY2FsZVkgPSAodmlld0hlaWdodCAtIFNIT1BfSVRFTV9WRVJUSUNBTF9TUEFDSU5HICogKGxheW91dFJvd3MgLSAxKSkgLyAoaXRlbUhlaWdodCAqIGxheW91dFJvd3MpO1xuICAgICAgICBjb25zdCBpdGVtU2NhbGUgPSBNYXRoLm1heChTSE9QX0lURU1fTUlOX1NDQUxFLCBNYXRoLm1pbihTSE9QX0lURU1fTUFYX1NDQUxFLCBtYXhTY2FsZVgsIG1heFNjYWxlWSkpO1xuICAgICAgICBjb25zdCBzY2FsZWRJdGVtV2lkdGggPSBpdGVtV2lkdGggKiBpdGVtU2NhbGU7XG4gICAgICAgIGNvbnN0IHNjYWxlZEl0ZW1IZWlnaHQgPSBpdGVtSGVpZ2h0ICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBob3Jpem9udGFsU3BhY2luZyA9IFNIT1BfSVRFTV9IT1JJWk9OVEFMX1NQQUNJTkc7XG4gICAgICAgIGNvbnN0IHZlcnRpY2FsU3BhY2luZyA9IFNIT1BfSVRFTV9WRVJUSUNBTF9TUEFDSU5HO1xuICAgICAgICBjb25zdCBncmlkV2lkdGggPSBjb2x1bW5Db3VudCAqIHNjYWxlZEl0ZW1XaWR0aCArIChjb2x1bW5Db3VudCAtIDEpICogaG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICAgIGNvbnN0IGdyaWRIZWlnaHQgPSByb3dDb3VudCAqIHNjYWxlZEl0ZW1IZWlnaHQgKyBNYXRoLm1heCgwLCByb3dDb3VudCAtIDEpICogdmVydGljYWxTcGFjaW5nO1xuICAgICAgICBjb25zdCB5UGFkZGluZyA9IE1hdGgubWF4KDAsICh2aWV3SGVpZ2h0IC0gZ3JpZEhlaWdodCkgLyAyKTtcblxuICAgICAgICAvLyDorr7nva5jb250ZW5055qE5aSn5bCP77yM5a696auY5LiOdmlld+S4gOiHtO+8jOmBv+WFjeS6p+eUn+WPr+a7muWKqOiMg+WbtOOAglxuICAgICAgICBjb250YWluZXIud2lkdGggPSB2aWV3V2lkdGg7XG4gICAgICAgIGNvbnRhaW5lci5oZWlnaHQgPSB2aWV3SGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572uY29udGVudOeahOmUmueCueS4uuW3puS4iuinklxuICAgICAgICBjb250YWluZXIuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclkgPSAxO1xuICAgICAgICBjb250YWluZXIueCA9IDA7XG4gICAgICAgIGNvbnRhaW5lci55ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruWVhuWTgemhueeahOS9jee9ru+8iOS4ieWIl+e9keagvO+8jOaVtOS9k+WxheS4reaYvuekuu+8iVxuICAgICAgICBjb25zdCBzdGFydFggPSAtZ3JpZFdpZHRoIC8gMiArIHNjYWxlZEl0ZW1XaWR0aCAvIDI7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIGNvbHVtbkNvdW50KTtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGkgJSBjb2x1bW5Db3VudDtcbiAgICAgICAgICAgIGNoaWxkLnNjYWxlID0gaXRlbVNjYWxlO1xuICAgICAgICAgICAgLy8g6K6+572u5ZWG5ZOB6aG555qE5L2N572u77yM5LuO6aG26YOo5byA5aeL5o6S5YiX77yM6ICD6JmReeaWueWQkXBhZGRpbmflkozllYblk4Hpobnpq5jluqZcbiAgICAgICAgICAgIGNoaWxkLnkgPSAteVBhZGRpbmcgLSBzY2FsZWRJdGVtSGVpZ2h0IC8gMiAtIHJvdyAqIChzY2FsZWRJdGVtSGVpZ2h0ICsgdmVydGljYWxTcGFjaW5nKTtcbiAgICAgICAgICAgIC8vIOS4ieWIl+aoquWQkeWxheS4reaYvuekulxuICAgICAgICAgICAgY2hpbGQueCA9IHN0YXJ0WCArIGNvbCAqIChzY2FsZWRJdGVtV2lkdGggKyBob3Jpem9udGFsU3BhY2luZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZ3VyZVN0YXRpY0dyaWRTY3JvbGxWaWV3KCk7XG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5zY3JvbGxUb09mZnNldChjYy52MigwLCAwKSwgMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25maWd1cmVTdGF0aWNHcmlkU2Nyb2xsVmlldygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5ob3Jpem9udGFsID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy52ZXJ0aWNhbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNjcm9sbFZpZXcuaW5lcnRpYSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNjcm9sbFZpZXcuZWxhc3RpYyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNjcm9sbFZpZXcuY2FuY2VsSW5uZXJFdmVudHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zY3JvbGxWaWV3LnN0b3BBdXRvU2Nyb2xsKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsVmlldy52ZXJ0aWNhbFNjcm9sbEJhcikge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxWaWV3LnZlcnRpY2FsU2Nyb2xsQmFyLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsVmlldy5ob3Jpem9udGFsU2Nyb2xsQmFyKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFZpZXcuaG9yaXpvbnRhbFNjcm9sbEJhci5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuXG4gICAgXG4gICAgb25FbmFibGUoKSB7XG4gICAgICAgIC8vIOW9k+mdouadv+aYvuekuuaXtuabtOaWsFVJXG4gICAgICAgIHRoaXMudXBkYXRlVUkoKTtcbiAgICB9XG5cbiAgICBvbkJhY2tDbGljaygpIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDlj5HpgIHpkrvnn7PmlbDph4/mm7TmlrDkuovku7ZcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdCgnZ29sZFVwZGF0ZWQnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pu05paw5ZWG5bqXVUlcbiAgICAgKi9cbiAgICB1cGRhdGVVSShrZWVwU2Nyb2xsOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgLy8g5pu05paw6ZK755+z5pWw6YePXG4gICAgICAgIGlmICh0aGlzLnpzX251bSkge1xuICAgICAgICAgICAgdGhpcy56c19udW0uc3RyaW5nID0gbUdhbWVEYXRhLmN1cnJlbnRHb2xkLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOWIneWni+WMluWVhuWTgeaVsOaNruW5tuWIt+aWsOa7muWKqOWIl+ihqFxuICAgICAgICB0aGlzLmluaXRTaG9wSXRlbXMoa2VlcFNjcm9sbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoUm9sZVNlbGVjdGlvblN0YXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2Nyb2xsVmlldyB8fCAhdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaG9wSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1EYXRhID0gdGhpcy5zaG9wSXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaXRlbURhdGEudHlwZSA9PT0gJ3JvbGUnKSB7XG4gICAgICAgICAgICAgICAgaXRlbURhdGEuaXNVc2luZyA9IGl0ZW1EYXRhLmluZGV4ID09PSBtR2FtZURhdGEuY3VycmVudFJvbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LmNoaWxkcmVuO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtRGF0YSA9IHRoaXMuc2hvcEl0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKCFpdGVtRGF0YSB8fCBpdGVtRGF0YS50eXBlICE9PSAncm9sZScgfHwgIWl0ZW1EYXRhLnVubG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1Ob2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBjb25zdCBvZmZOb2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ29mZicpO1xuICAgICAgICAgICAgY29uc3Qgb25Ob2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ29uJyk7XG4gICAgICAgICAgICBpZiAob2ZmTm9kZSkgb2ZmTm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghb25Ob2RlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgb25Ob2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG9uTm9kZS5nZXRDaGlsZEJ5TmFtZSgndGV4dCcpO1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSB0ZXh0Tm9kZSA/IHRleHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gaXRlbURhdGEuaXNVc2luZyA/ICfkvb/nlKjkuK0nIDogJ+S9v+eUqCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6KeS6Imy6Kej6ZSB5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICovXG4gICAgb25Sb2xlVW5sb2NrQ2xpY2socm9sZUluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCFtR2FtZURhdGEudW5sb2NrZWRSb2xlc1tyb2xlSW5kZXhdKSB7XG4gICAgICAgICAgICBjb25zdCBwcmljZSA9IG1HYW1lRGF0YS5yb2xlUHJpY2VzW3JvbGVJbmRleF07XG4gICAgICAgICAgICBpZiAobUdhbWVEYXRhLmN1cnJlbnRHb2xkID49IHByaWNlKSB7XG4gICAgICAgICAgICAgICAgLy8g5pi+56S65LqM5qyh56Gu6K6k5by556qXXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q29uZmlybVBhbmVsKCd1bmxvY2tSb2xlJywgcm9sZUluZGV4LCBg56Gu5a6a6KaB6Iqx6LS5JHtwcmljZX3pkrvnn7Pop6PplIHop5LoibLlkJfvvJ9gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g6ZK755+z5LiN6LazXG4gICAgICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6ZK755+z5LiN6Laz77yM5peg5rOV6Kej6ZSB6KeS6Imy44CCJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6KeS6Imy6YCJ5oup5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICovXG4gICAgb25Sb2xlU2VsZWN0Q2xpY2socm9sZUluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKG1HYW1lRGF0YS51bmxvY2tlZFJvbGVzW3JvbGVJbmRleF0pIHtcbiAgICAgICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudFJvbGUgPT09IHJvbGVJbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOmAieS4reivpeinkuiJslxuICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRSb2xlID0gcm9sZUluZGV4O1xuICAgICAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgICAgICBtR2FtZURhdGEuU2F2ZUN1cnJlbnRSb2xlRGF0YSgpO1xuICAgICAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFJvbGVTZWxlY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgICAgLy8g5pi+56S65o+Q56S6XG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfop5LoibLliIfmjaLmiJDlip/vvIEnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDotK3kubDkvZPlipvmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBvblN0YW1pbmFCdXlDbGljaygpIHtcbiAgICAgICAgLy8g5qOA5p+l5L2T5Yqb5piv5ZCm5bey5ruhXG4gICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudFN0YW1pbmEgPj0gbUdhbWVEYXRhLm1heFN0YW1pbmEpIHtcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+S9k+WKm+W3sua7oe+8jOaXoOmcgOi0reS5sOOAgicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6Xpkrvnn7PmmK/lkKbotrPlpJ9cbiAgICAgICAgaWYgKG1HYW1lRGF0YS5jdXJyZW50R29sZCA8IHRoaXMuc3RhbWluYVByaWNlKSB7XG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfpkrvnn7PkuI3otrPvvIzml6Dms5XotK3kubDkvZPlipvjgIInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65LqM5qyh56Gu6K6k5by556qXXG4gICAgICAgIHRoaXMuc2hvd0NvbmZpcm1QYW5lbCgnYnV5U3RhbWluYScsIC0xLCBg56Gu5a6a6KaB6Iqx6LS5JHt0aGlzLnN0YW1pbmFQcmljZX3pkrvnn7PotK3kubAxMOeCueS9k+WKm+WQl++8n2ApO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmmL7npLrnoa7orqTlvLnnqpdcbiAgICAgKi9cbiAgICBzaG93Q29uZmlybVBhbmVsKG9wZXJhdGlvbjogc3RyaW5nLCByb2xlSW5kZXg6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIOS/neWtmOW9k+WJjeaTjeS9nOS/oeaBr1xuICAgICAgICB0aGlzLmN1cnJlbnRPcGVyYXRpb24gPSBvcGVyYXRpb247XG4gICAgICAgIHRoaXMuY3VycmVudFJvbGVJbmRleCA9IHJvbGVJbmRleDtcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuaPkOekuumdouadv1xuICAgICAgICBpZiAodGhpcy50aXBzUGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc1BhbmVsLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruaPkOekuuS/oeaBr1xuICAgICAgICBpZiAodGhpcy50aXBzTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog56Gu6K6k5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICovXG4gICAgb25Db25maXJtQ2xpY2soKSB7XG4gICAgICAgIC8vIOmakOiXj+aPkOekuumdouadv1xuICAgICAgICBpZiAodGhpcy50aXBzUGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc1BhbmVsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7lvZPliY3mk43kvZznsbvlnovmiafooYznm7jlupTnmoTpgLvovpFcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE9wZXJhdGlvbiA9PT0gJ3VubG9ja1JvbGUnICYmIHRoaXMuY3VycmVudFJvbGVJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAvLyDmiafooYzop5LoibLop6PplIHpgLvovpFcbiAgICAgICAgICAgIHRoaXMuZXhlY3V0ZVJvbGVVbmxvY2sodGhpcy5jdXJyZW50Um9sZUluZGV4KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRPcGVyYXRpb24gPT09ICdidXlTdGFtaW5hJykge1xuICAgICAgICAgICAgLy8g5omn6KGM6LSt5Lmw5L2T5Yqb6YC76L6RXG4gICAgICAgICAgICB0aGlzLmV4ZWN1dGVTdGFtaW5hQnV5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjee9ruaTjeS9nOS/oeaBr1xuICAgICAgICB0aGlzLmN1cnJlbnRPcGVyYXRpb24gPSAnJztcbiAgICAgICAgdGhpcy5jdXJyZW50Um9sZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWPlua2iOaMiemSrueCueWHu+S6i+S7tlxuICAgICAqL1xuICAgIG9uQ2FuY2VsQ2xpY2soKSB7XG4gICAgICAgIC8vIOmakOiXj+aPkOekuumdouadv1xuICAgICAgICBpZiAodGhpcy50aXBzUGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc1BhbmVsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDph43nva7mk43kvZzkv6Hmga9cbiAgICAgICAgdGhpcy5jdXJyZW50T3BlcmF0aW9uID0gJyc7XG4gICAgICAgIHRoaXMuY3VycmVudFJvbGVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmiafooYzop5LoibLop6PplIHpgLvovpFcbiAgICAgKi9cbiAgICBleGVjdXRlUm9sZVVubG9jayhyb2xlSW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAoIW1HYW1lRGF0YS51bmxvY2tlZFJvbGVzW3JvbGVJbmRleF0pIHtcbiAgICAgICAgICAgIGNvbnN0IHByaWNlID0gbUdhbWVEYXRhLnJvbGVQcmljZXNbcm9sZUluZGV4XTtcbiAgICAgICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudEdvbGQgPj0gcHJpY2UpIHtcbiAgICAgICAgICAgICAgICAvLyDmiaPpmaTpkrvnn7NcbiAgICAgICAgICAgICAgICBtR2FtZURhdGEuY3VycmVudEdvbGQgLT0gcHJpY2U7XG4gICAgICAgICAgICAgICAgLy8g6Kej6ZSB6KeS6ImyXG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLnVubG9ja2VkUm9sZXNbcm9sZUluZGV4XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8g6YCJ5Lit6K+l6KeS6ImyXG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRSb2xlID0gcm9sZUluZGV4O1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5TYXZlR29sZERhdGEoKTtcbiAgICAgICAgICAgICAgICBtR2FtZURhdGEuU2F2ZVVubG9ja2VkUm9sZXNEYXRhKCk7XG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLlNhdmVDdXJyZW50Um9sZURhdGEoKTtcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrBVSVxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVUkoKTtcbiAgICAgICAgICAgICAgICAvLyDlj5HpgIHpkrvnn7PmlbDph4/mm7TmlrDkuovku7ZcbiAgICAgICAgICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KCdnb2xkVXBkYXRlZCcpO1xuICAgICAgICAgICAgICAgIC8vIOaYvuekuuaPkOekulxuICAgICAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+inkuiJsuino+mUgeaIkOWKn++8gScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJp+ihjOi0reS5sOS9k+WKm+mAu+i+kVxuICAgICAqL1xuICAgIGV4ZWN1dGVTdGFtaW5hQnV5KCkge1xuICAgICAgICAvLyDmo4Dmn6XkvZPlipvmmK/lkKblt7Lmu6FcbiAgICAgICAgaWYgKG1HYW1lRGF0YS5jdXJyZW50U3RhbWluYSA+PSBtR2FtZURhdGEubWF4U3RhbWluYSkge1xuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn5L2T5Yqb5bey5ruh77yM5peg6ZyA6LSt5Lmw44CCJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpemSu+efs+aYr+WQpui2s+Wkn1xuICAgICAgICBpZiAobUdhbWVEYXRhLmN1cnJlbnRHb2xkIDwgdGhpcy5zdGFtaW5hUHJpY2UpIHtcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+mSu+efs+S4jei2s++8jOaXoOazlei0reS5sOS9k+WKm+OAgicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmiaPpmaTpkrvnn7NcbiAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRHb2xkIC09IHRoaXMuc3RhbWluYVByaWNlO1xuICAgICAgICAvLyDlop7liqDkvZPliptcbiAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hID0gTWF0aC5taW4obUdhbWVEYXRhLm1heFN0YW1pbmEsIG1HYW1lRGF0YS5jdXJyZW50U3RhbWluYSArIDEwKTtcbiAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgIG1HYW1lRGF0YS5TYXZlR29sZERhdGEoKTtcbiAgICAgICAgbUdhbWVEYXRhLlNhdmVTdGFtaW5hRGF0YSgpO1xuICAgICAgICAvLyDmm7TmlrBVSVxuICAgICAgICB0aGlzLnVwZGF0ZVVJKCk7XG4gICAgICAgIC8vIOWPkemAgemSu+efs+aVsOmHj+abtOaWsOS6i+S7tlxuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KCdnb2xkVXBkYXRlZCcpO1xuICAgICAgICAvLyDmmL7npLrmj5DnpLpcbiAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6LSt5Lmw5oiQ5Yqf77yB6I635b6XMTDngrnkvZPlipvjgIInKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6K6+572u5oyJ6ZKu54q25oCBXG4gICAgICovXG4gICAgc2V0QnRuU3RhdGUoYnRuOiBjYy5Ob2RlLCBlbmFibGVkOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChidG4pIHtcbiAgICAgICAgICAgIC8vIOWkhOeQhkJ1dHRvbue7hOS7tu+8iOWmguaenOWtmOWcqO+8iVxuICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29tcG9uZW50ID0gYnRuLmdldENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbkNvbXBvbmVudC5pbnRlcmFjdGFibGUgPSBlbmFibGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlpITnkIZTcHJpdGXnu4Tku7bvvIjlm77niYfmjInpkq7vvIlcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUNvbXBvbmVudCA9IGJ0bi5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGlmIChzcHJpdGVDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAvLyDmoLnmja7mjInpkq7lkI3np7DpgInmi6nlr7nlupTnmoTlm77niYdcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0U3ByaXRlRnJhbWU6IGNjLlNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0YXJnZXRTcHJpdGVGcmFtZSA9IGVuYWJsZWQgPyB0aGlzLmJ0bjFOb3JtYWwgOiB0aGlzLmJ0bjFEaXNhYmxlZDtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmib7liLDlr7nlupTnmoTlm77niYfvvIzliJnorr7nva5cbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0U3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gdGFyZ2V0U3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkuLrlm77niYfmjInpkq7orr7nva7op6bmkbjlj6/nlKjmgKfmoIforrBcbiAgICAgICAgICAgIGJ0blsnX2lzRW5hYmxlZCddID0gZW5hYmxlZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==