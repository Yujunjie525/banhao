
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcU2hvcE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUF5QztBQUN6QyxtREFBOEM7QUFFeEMsSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFJMUM7SUFBeUMsK0JBQVk7SUFBckQ7UUFBQSxxRUFxb0JDO1FBbm9CRyxjQUFRLEdBQVksSUFBSSxDQUFDO1FBR3pCLFlBQU0sR0FBYSxJQUFJLENBQUM7UUFFeEIsU0FBUztRQUVULGdCQUFVLEdBQWtCLElBQUksQ0FBQyxDQUFDLFNBQVM7UUFFM0MsU0FBUztRQUVULGdCQUFVLEdBQWMsSUFBSSxDQUFDLENBQUMsU0FBUztRQUV2QyxRQUFRO1FBRVIsbUJBQWEsR0FBWSxJQUFJLENBQUMsQ0FBQyxVQUFVO1FBRXpDLFVBQVU7UUFDRixrQkFBWSxHQUFXLEdBQUcsQ0FBQyxDQUFDLFVBQVU7UUFFOUMsU0FBUztRQUVULGVBQVMsR0FBWSxJQUFJLENBQUMsQ0FBQyxTQUFTO1FBRXBDLFNBQVM7UUFFVCxlQUFTLEdBQWEsSUFBSSxDQUFDLENBQUMsU0FBUztRQUVyQyxPQUFPO1FBRVAsZ0JBQVUsR0FBWSxJQUFJLENBQUMsQ0FBQyxPQUFPO1FBRW5DLE9BQU87UUFFUCxlQUFTLEdBQVksSUFBSSxDQUFDLENBQUMsT0FBTztRQUVsQyxXQUFXO1FBRVgsZ0JBQVUsR0FBbUIsSUFBSSxDQUFDO1FBQ2xDLFdBQVc7UUFFWCxrQkFBWSxHQUFtQixJQUFJLENBQUM7UUFFcEMsU0FBUztRQUNELHNCQUFnQixHQUFXLEVBQUUsQ0FBQyxDQUFDLDhCQUE4QjtRQUNyRSxZQUFZO1FBQ0osc0JBQWdCLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFdEMsU0FBUztRQUNELGVBQVMsR0FBVSxFQUFFLENBQUM7UUFDdEIscUJBQWUsR0FBb0MsRUFBRSxDQUFDOztJ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bURBQ1M7SUFJN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztzREFDWTtJQU85QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNRO0lBSTFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7a0RBQ1E7SUFJM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDUztJQUkzQjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2tEQUNRO0lBSTFCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7bURBQ1M7SUFHbEM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQztxREFDVztJQTNDbkIsV0FBVztRQUQvQixPQUFPO09BQ2EsV0FBVyxDQXFvQi9CO0lBQUQsa0JBQUM7Q0Fyb0JELEFBcW9CQyxDQXJvQndDLEVBQUUsQ0FBQyxTQUFTLEdBcW9CcEQ7a0JBcm9Cb0IsV0FBVyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtR2FtZURhdGEgZnJvbSBcIi4uL0xvYWQvR2FtZURhdGFcIjtcbmltcG9ydCBUaXBzTWFuYWdlciBmcm9tIFwiLi4vTG9hZC9UaXBzTWFuYWdlclwiO1xuXG5jb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcblxuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcE1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNsb3NlQnRuOiBjYy5Ob2RlID0gbnVsbDsgXG4gICAgXG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKVxuICAgIHpzX251bTogY2MuTGFiZWwgPSBudWxsOyBcblxuICAgIC8vIOa7muWKqOinhuWbvuiKgueCuVxuICAgIEBwcm9wZXJ0eShjYy5TY3JvbGxWaWV3KVxuICAgIHNjcm9sbFZpZXc6IGNjLlNjcm9sbFZpZXcgPSBudWxsOyAvLyDmu5rliqjop4blm77oioLngrlcbiAgICBcbiAgICAvLyDllYblk4HpobnpooTliLbkvZNcbiAgICBAcHJvcGVydHkoY2MuUHJlZmFiKVxuICAgIGl0ZW1QcmVmYWI6IGNjLlByZWZhYiA9IG51bGw7IC8vIOWVhuWTgemhuemihOWItuS9k1xuICAgIFxuICAgIC8vIOWVhuWTgemhueWuueWZqFxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGl0ZW1Db250YWluZXI6IGNjLk5vZGUgPSBudWxsOyAvLyDllYblk4HpobnlrrnlmajoioLngrlcbiAgICBcbiAgICAvLyDkvZPlipvllYblk4Hpobnku7fmoLxcbiAgICBwcml2YXRlIHN0YW1pbmFQcmljZTogbnVtYmVyID0gMTAwOyAvLyDkvZPlipvllYblk4Hpobnku7fmoLxcbiAgICBcbiAgICAvLyDmj5DnpLrpnaLmnb/oioLngrlcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICB0aXBzUGFuZWw6IGNjLk5vZGUgPSBudWxsOyAvLyDmj5DnpLrpnaLmnb/oioLngrlcbiAgICBcbiAgICAvLyDmj5DnpLrkv6Hmga/moIfnrb5cbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpXG4gICAgdGlwc0xhYmVsOiBjYy5MYWJlbCA9IG51bGw7IC8vIOaPkOekuuS/oeaBr+agh+etvlxuICAgIFxuICAgIC8vIOehruiupOaMiemSrlxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNvbmZpcm1CdG46IGNjLk5vZGUgPSBudWxsOyAvLyDnoa7orqTmjInpkq5cbiAgICBcbiAgICAvLyDlj5bmtojmjInpkq5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICBjYW5jZWxCdG46IGNjLk5vZGUgPSBudWxsOyAvLyDlj5bmtojmjInpkq5cbiAgICBcbiAgICAvLyDmjInpkq7mraPluLjnirbmgIHlm77niYdcbiAgICBAcHJvcGVydHkoY2MuU3ByaXRlRnJhbWUpXG4gICAgYnRuMU5vcm1hbDogY2MuU3ByaXRlRnJhbWUgPSBudWxsO1xuICAgIC8vIOaMiemSruemgeeUqOeKtuaAgeWbvueJh1xuICAgIEBwcm9wZXJ0eShjYy5TcHJpdGVGcmFtZSlcbiAgICBidG4xRGlzYWJsZWQ6IGNjLlNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICBcbiAgICAvLyDlvZPliY3mk43kvZznsbvlnotcbiAgICBwcml2YXRlIGN1cnJlbnRPcGVyYXRpb246IHN0cmluZyA9ICcnOyAvLyAndW5sb2NrUm9sZScg5oiWICdidXlTdGFtaW5hJ1xuICAgIC8vIOW9k+WJjeaTjeS9nOeahOinkuiJsue0ouW8lVxuICAgIHByaXZhdGUgY3VycmVudFJvbGVJbmRleDogbnVtYmVyID0gLTE7XG4gICAgXG4gICAgLy8g5ZWG5ZOB5pWw5o2u5pWw57uEXG4gICAgcHJpdmF0ZSBzaG9wSXRlbXM6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSB1c2VCdXR0b25GcmFtZXM6IHtba2V5OiBzdHJpbmddOiBjYy5TcHJpdGVGcmFtZX0gPSB7fTtcbiAgICBcbiAgICBvbkxvYWQgKCkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZUJ0bikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25CYWNrQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDkuLrmj5DnpLrpnaLmnb/mjInpkq7mt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgaWYgKHRoaXMuY29uZmlybUJ0bikge1xuICAgICAgICAgICAgdGhpcy5jb25maXJtQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vbkNvbmZpcm1DbGljaywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2FuY2VsQnRuKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMub25DYW5jZWxDbGljaywgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5Yid5aeL5YyW5ZWG5ZOB5pWw5o2uXG4gICAgICovXG4gICAgaW5pdFNob3BJdGVtcyhrZWVwU2Nyb2xsUG9zaXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBtR2FtZURhdGEuR2V0VW5sb2NrZWRSb2xlc0RhdGEoKTtcbiAgICAgICAgbUdhbWVEYXRhLkdldEN1cnJlbnRSb2xlRGF0YSgpO1xuXG4gICAgICAgIC8vIOa4heepuuWVhuWTgeaVsOaNruaVsOe7hFxuICAgICAgICB0aGlzLnNob3BJdGVtcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6KeS6Imy5ZWG5ZOBXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbUdhbWVEYXRhLnJvbGVQcmljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc2hvcEl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyb2xlJyxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBuYW1lOiBtR2FtZURhdGEucm9sZU5hbWVzW2ldIHx8IGDop5LoibIgJHtpICsgMX1gLFxuICAgICAgICAgICAgICAgIHByaWNlOiBtR2FtZURhdGEucm9sZVByaWNlc1tpXSxcbiAgICAgICAgICAgICAgICB1bmxvY2tlZDogbUdhbWVEYXRhLnVubG9ja2VkUm9sZXNbaV0sXG4gICAgICAgICAgICAgICAgaXNVc2luZzogaSA9PT0gbUdhbWVEYXRhLmN1cnJlbnRSb2xlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5L2T5Yqb5ZWG5ZOBXG4gICAgICAgIHRoaXMuc2hvcEl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ3N0YW1pbmEnLFxuICAgICAgICAgICAgaW5kZXg6IC0xLFxuICAgICAgICAgICAgbmFtZTogJzEw5L2T5YqbJyxcbiAgICAgICAgICAgIHByaWNlOiB0aGlzLnN0YW1pbmFQcmljZSxcbiAgICAgICAgICAgIHVubG9ja2VkOiB0cnVlLFxuICAgICAgICAgICAgaXNVc2luZzogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDliLfmlrDmu5rliqjliJfooahcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Nyb2xsVmlldyhrZWVwU2Nyb2xsUG9zaXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDliLfmlrDmu5rliqjliJfooahcbiAgICAgKi9cbiAgICByZWZyZXNoU2Nyb2xsVmlldyhrZWVwU2Nyb2xsUG9zaXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBpZiAoIXRoaXMuc2Nyb2xsVmlldyB8fCAhdGhpcy5pdGVtUHJlZmFiIHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlldyBvciBpdGVtUHJlZmFiIG5vdCBhc3NpZ25lZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0ga2VlcFNjcm9sbFBvc2l0aW9uICYmIHRoaXMuc2Nyb2xsVmlldy5nZXRTY3JvbGxPZmZzZXRcbiAgICAgICAgICAgID8gdGhpcy5zY3JvbGxWaWV3LmdldFNjcm9sbE9mZnNldCgpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnqbrlrrnlmahcbiAgICAgICAgdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOmBjeWOhuWVhuWTgeaVsOaNru+8jOWIm+W7uuWVhuWTgemhuVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2hvcEl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtRGF0YSA9IHRoaXMuc2hvcEl0ZW1zW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliJvlu7rllYblk4HpobnoioLngrlcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1Ob2RlID0gY2MuaW5zdGFudGlhdGUodGhpcy5pdGVtUHJlZmFiKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LmFkZENoaWxkKGl0ZW1Ob2RlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6+572u5ZWG5ZOB6aG55pWw5o2uXG4gICAgICAgICAgICB0aGlzLnNldEl0ZW1EYXRhKGl0ZW1Ob2RlLCBpdGVtRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiwg+aVtOWuueWZqOWkp+Wwj1xuICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lclNpemUoc2Nyb2xsT2Zmc2V0KTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6K6+572u5ZWG5ZOB6aG55pWw5o2uXG4gICAgICovXG4gICAgc2V0SXRlbURhdGEoaXRlbU5vZGU6IGNjLk5vZGUsIGl0ZW1EYXRhOiBhbnkpIHtcbiAgICAgICAgLy8g5om+5Yiwb2Zm5ZKMb27oioLngrlcbiAgICAgICAgY29uc3Qgb2ZmTm9kZSA9IGl0ZW1Ob2RlLmdldENoaWxkQnlOYW1lKCdvZmYnKTtcbiAgICAgICAgY29uc3Qgb25Ob2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ29uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyDmib7liLDlkI3np7DjgIHph43ph4/lkozku7fmoLzoioLngrlcbiAgICAgICAgY29uc3QgbmFtZU5vZGUgPSBpdGVtTm9kZS5nZXRDaGlsZEJ5TmFtZSgnbmFtZScpO1xuICAgICAgICBjb25zdCB3ZWlnaHROb2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3dlaWdodCcpO1xuICAgICAgICBjb25zdCBwcmljZU5vZGUgPSBvZmZOb2RlLmdldENoaWxkQnlOYW1lKCdwcmljZScpO1xuICAgICAgICBcbiAgICAgICAgLy8g5om+5Yiw5Zu+5qCH6IqC54K577yI5YGH6K6+5Zu+5qCH6IqC54K55ZCN56ew5Li6J2ljb24n77yJXG4gICAgICAgIGNvbnN0IGljb25Ob2RlID0gaXRlbU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2ljb24nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCforr7nva7llYblk4HpobnmlbDmja46JywgaXRlbURhdGEpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygn6IqC54K557uT5p6EOicsIHtcbiAgICAgICAgLy8gICAgIG9mZk5vZGU6IG9mZk5vZGUgPyAn5om+5YiwJyA6ICfmnKrmib7liLAnLFxuICAgICAgICAvLyAgICAgb25Ob2RlOiBvbk5vZGUgPyAn5om+5YiwJyA6ICfmnKrmib7liLAnLFxuICAgICAgICAvLyAgICAgbmFtZU5vZGU6IG5hbWVOb2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJyxcbiAgICAgICAgLy8gICAgIHdlaWdodE5vZGU6IHdlaWdodE5vZGUgPyAn5om+5YiwJyA6ICfmnKrmib7liLAnLFxuICAgICAgICAvLyAgICAgcHJpY2VOb2RlOiBwcmljZU5vZGUgPyAn5om+5YiwJyA6ICfmnKrmib7liLAnLFxuICAgICAgICAvLyAgICAgaWNvbk5vZGU6IGljb25Ob2RlID8gJ+aJvuWIsCcgOiAn5pyq5om+5YiwJ1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruWbvuagh1xuICAgICAgICBpZiAoaWNvbk5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUNvbXBvbmVudCA9IGljb25Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgaWYgKHNwcml0ZUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtRGF0YS50eXBlID09PSAncm9sZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g6KeS6Imy5ZWG5ZOB77yM5pi+56S6IGp1ZXNlMS1qdWVzZTVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWNvblBhdGggPSBgM2dhbWUvanVlc2Uke2l0ZW1EYXRhLmluZGV4ICsgMX1gO1xuICAgICAgICAgICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhpY29uUGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5Yqg6L29JHtpY29uUGF0aH3lpLHotKU6YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLlRSSU1NRUQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbk5vZGUuc2NhbGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW1EYXRhLnR5cGUgPT09ICdzdGFtaW5hJykge1xuICAgICAgICAgICAgICAgICAgICAvLyDkvZPlipvllYblk4HvvIzmmL7npLogdGlsaS5wbmdcbiAgICAgICAgICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJzJtYWluL3RpbGknLCBjYy5TcHJpdGVGcmFtZSwgKGVyciwgc3ByaXRlRnJhbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfliqDovb10aWxp5aSx6LSlOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWNvbk5vZGUuc2NhbGUgPSAxLjVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChpdGVtRGF0YS50eXBlID09PSAncm9sZScpIHtcbiAgICAgICAgICAgIC8vIOinkuiJsuWVhuWTgVxuICAgICAgICAgICAgLy8g6K6+572u6KeS6Imy5ZCN56ewXG4gICAgICAgICAgICBpZiAobmFtZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBuYW1lTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGl0ZW1EYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ+iuvue9ruinkuiJsuWQjeensDonLCBpdGVtRGF0YS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6+572u6KeS6Imy6YeN6YePXG4gICAgICAgICAgICBpZiAod2VpZ2h0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IG1HYW1lRGF0YS5yb2xlV2VpZ2h0c1tpdGVtRGF0YS5pbmRleF0gfHwgMDtcbiAgICAgICAgICAgICAgICB3ZWlnaHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gYOmHjemHjyR7d2VpZ2h0fWA7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ+iuvue9ruinkuiJsumHjemHjzonLCB3ZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7ku7fmoLxcbiAgICAgICAgICAgIGlmIChwcmljZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBwcmljZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBgJHtpdGVtRGF0YS5wcmljZX1gO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCforr7nva7op5LoibLku7fmoLw6JywgaXRlbURhdGEucHJpY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaXRlbURhdGEudW5sb2NrZWQpIHtcbiAgICAgICAgICAgICAgICAvLyDop5LoibLlt7Lop6PplIFcbiAgICAgICAgICAgICAgICBpZiAob2ZmTm9kZSkgb2ZmTm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAob25Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFVzZUJ1dHRvblZpc3VhbChvbk5vZGUsIGl0ZW1EYXRhLmlzVXNpbmcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgICAgICAgICAgICAgICAgIG9uTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25Sb2xlU2VsZWN0Q2xpY2soaXRlbURhdGEuaW5kZXgpLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOinkuiJsuacquino+mUgVxuICAgICAgICAgICAgICAgIGlmIChvZmZOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZk5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8g5LuOb2Zm6IqC54K55LiL6I635Y+WdGV4dOiKgueCuVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG9mZk5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3RleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGl0ZW1EYXRhLnByaWNlICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgICAgICAgICAgICAgICBvZmZOb2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vblJvbGVVbmxvY2tDbGljayhpdGVtRGF0YS5pbmRleCksIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob25Ob2RlKSBvbk5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbURhdGEudHlwZSA9PT0gJ3N0YW1pbmEnKSB7XG4gICAgICAgICAgICAvLyDkvZPlipvllYblk4FcbiAgICAgICAgICAgIC8vIOiuvue9ruWQjeensFxuICAgICAgICAgICAgaWYgKG5hbWVOb2RlKSB7XG4gICAgICAgICAgICAgICAgbmFtZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBpdGVtRGF0YS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDpmpDol4/ph43ph4/oioLngrlcbiAgICAgICAgICAgIGlmICh3ZWlnaHROb2RlKSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0Tm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6+572u5Lu35qC8XG4gICAgICAgICAgICBpZiAocHJpY2VOb2RlKSB7XG4gICAgICAgICAgICAgICAgcHJpY2VOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gYCR7aXRlbURhdGEucHJpY2V9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG9mZk5vZGUpIG9mZk5vZGUuYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gaWYgKG9uTm9kZSkge1xuICAgICAgICAgICAgLy8gICAgIG9uTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gICAgIC8vIOS7jm9u6IqC54K55LiL6I635Y+WdGV4dOiKgueCuVxuICAgICAgICAgICAgLy8gICAgIGNvbnN0IHRleHROb2RlID0gb25Ob2RlLmdldENoaWxkQnlOYW1lKCd0ZXh0Jyk7XG4gICAgICAgICAgICAvLyAgICAgaWYgKHRleHROb2RlKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHRleHROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gJ+i0reS5sCc7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgICAgICAgICAgIG9mZk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLm9uU3RhbWluYUJ1eUNsaWNrLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vICAgICAvLyDmo4Dmn6XkvZPlipvmmK/lkKblt7Lmu6HmiJbpkrvnn7PmmK/lkKbkuI3otrNcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBpc1N0YW1pbmFGdWxsID0gbUdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hID49IG1HYW1lRGF0YS5tYXhTdGFtaW5hO1xuICAgICAgICAgICAgLy8gICAgIGNvbnN0IGlzRGlhbW9uZEVub3VnaCA9IG1HYW1lRGF0YS5jdXJyZW50R29sZCA+PSBpdGVtRGF0YS5wcmljZTtcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBpc0Rpc2FibGVkID0gaXNTdGFtaW5hRnVsbCB8fCAhaXNEaWFtb25kRW5vdWdoO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gICAgIC8vIOiuvue9rmJ1dHRvbue7hOS7tueahGludGVyYWN0YWJsZeWxnuaAp1xuICAgICAgICAgICAgLy8gICAgIGNvbnN0IGJ1dHRvbkNvbXBvbmVudCA9IG9uTm9kZS5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgICAgIC8vICAgICBpZiAoYnV0dG9uQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGJ1dHRvbkNvbXBvbmVudC5pbnRlcmFjdGFibGUgPSAhaXNEaXNhYmxlZDtcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6LCD5pW05a655Zmo5aSn5bCPXG4gICAgICovXG4gICAgYWRqdXN0Q29udGFpbmVyU2l6ZShzY3JvbGxPZmZzZXQ6IGNjLlZlYzIgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxWaWV3IHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignU2Nyb2xsVmlld+aIlmNvbnRlbnToioLngrnmnKrorr7nva4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGxheW91dCA9IGNvbnRhaW5lci5nZXRDb21wb25lbnQoY2MuTGF5b3V0KTtcbiAgICAgICAgaWYgKGxheW91dCkgbGF5b3V0LmVuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlbjtcbiAgICAgICAgXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W5ZWG5ZOB6aG555qE5aSn5bCP77yI5L2/55So56ys5LiA5Liq5ZWG5ZOB6aG55L2c5Li65Y+C6ICD77yJXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBjaGlsZHJlblswXTtcbiAgICAgICAgY29uc3QgaXRlbVdpZHRoID0gaXRlbS53aWR0aDtcbiAgICAgICAgY29uc3QgaXRlbUhlaWdodCA9IGl0ZW0uaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+Wdmlld+iKgueCueWuveW6plxuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5zY3JvbGxWaWV3Lm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3ZpZXcnKTtcbiAgICAgICAgaWYgKCF2aWV3KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmnKrmib7liLB2aWV36IqC54K5Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgdmlld1dpZHRoID0gTWF0aC5tYXgodGhpcy5zY3JvbGxWaWV3Lm5vZGUud2lkdGggfHwgMCwgdmlldy53aWR0aCB8fCAwLCA1MjApO1xuICAgICAgICB2aWV3LndpZHRoID0gdmlld1dpZHRoO1xuICAgICAgICBjb250YWluZXIud2lkdGggPSB2aWV3V2lkdGg7XG5cbiAgICAgICAgY29uc3QgY29sdW1ucyA9IDI7XG4gICAgICAgIGNvbnN0IGNvbHVtblNwYWNpbmcgPSAyMDtcbiAgICAgICAgY29uc3Qgcm93U3BhY2luZyA9IDY7XG4gICAgICAgIGNvbnN0IHRvcFBhZGRpbmcgPSA0O1xuICAgICAgICBjb25zdCBib3R0b21QYWRkaW5nID0gMTg7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBNYXRoLmNlaWwoY2hpbGRyZW4ubGVuZ3RoIC8gY29sdW1ucyk7XG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gTWF0aC5tYXgodmlldy5oZWlnaHQsIHRvcFBhZGRpbmcgKyByb3dzICogaXRlbUhlaWdodCArIE1hdGgubWF4KDAsIHJvd3MgLSAxKSAqIHJvd1NwYWNpbmcgKyBib3R0b21QYWRkaW5nKTtcbiAgICAgICAgY29udGFpbmVyLmhlaWdodCA9IHRvdGFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIGNvbnRlbnTplJrngrnkv53mjIHpobbpg6jlsYXkuK3vvIzmjInmlYjmnpzlm77kuKTliJfmjpLliJfjgIJcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JZID0gMTtcblxuICAgICAgICBjb25zdCBjb2x1bW5PZmZzZXQgPSBpdGVtV2lkdGggLyAyICsgY29sdW1uU3BhY2luZyAvIDI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBjb2x1bW5zKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGkgJSBjb2x1bW5zO1xuICAgICAgICAgICAgY2hpbGQueCA9IGNvbCA9PT0gMCA/IC1jb2x1bW5PZmZzZXQgOiBjb2x1bW5PZmZzZXQ7XG4gICAgICAgICAgICBjaGlsZC55ID0gLXRvcFBhZGRpbmcgLSBpdGVtSGVpZ2h0IC8gMiAtIHJvdyAqIChpdGVtSGVpZ2h0ICsgcm93U3BhY2luZyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgJiYgdGhpcy5zY3JvbGxWaWV3LnNjcm9sbFRvT2Zmc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFZpZXcuc2Nyb2xsVG9PZmZzZXQoc2Nyb2xsT2Zmc2V0LCAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsFNjcm9sbFZpZXfnmoRjb250ZW505YGP56e777yM56Gu5L+d5pi+56S66aG26YOo5YaF5a65XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbFZpZXcuc2Nyb2xsVG9Ub3ApIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVmlldy5zY3JvbGxUb1RvcCgwLjEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuXG4gICAgXG4gICAgb25FbmFibGUoKSB7XG4gICAgICAgIC8vIOW9k+mdouadv+aYvuekuuaXtuabtOaWsFVJXG4gICAgICAgIHRoaXMudXBkYXRlVUkoKTtcbiAgICB9XG5cbiAgICBvbkJhY2tDbGljaygpIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDlj5HpgIHpkrvnn7PmlbDph4/mm7TmlrDkuovku7ZcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdCgnZ29sZFVwZGF0ZWQnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pu05paw5ZWG5bqXVUlcbiAgICAgKi9cbiAgICB1cGRhdGVVSShrZWVwU2Nyb2xsUG9zaXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICAvLyDmm7TmlrDpkrvnn7PmlbDph49cbiAgICAgICAgaWYgKHRoaXMuenNfbnVtKSB7XG4gICAgICAgICAgICB0aGlzLnpzX251bS5zdHJpbmcgPSBtR2FtZURhdGEuY3VycmVudEdvbGQudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN5paw5Yid5aeL5YyW5ZWG5ZOB5pWw5o2u5bm25Yi35paw5rua5Yqo5YiX6KGoXG4gICAgICAgIHRoaXMuaW5pdFNob3BJdGVtcyhrZWVwU2Nyb2xsUG9zaXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDop5LoibLop6PplIHmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBvblJvbGVVbmxvY2tDbGljayhyb2xlSW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAoIW1HYW1lRGF0YS51bmxvY2tlZFJvbGVzW3JvbGVJbmRleF0pIHtcbiAgICAgICAgICAgIGNvbnN0IHByaWNlID0gbUdhbWVEYXRhLnJvbGVQcmljZXNbcm9sZUluZGV4XTtcbiAgICAgICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudEdvbGQgPj0gcHJpY2UpIHtcbiAgICAgICAgICAgICAgICAvLyDmmL7npLrkuozmrKHnoa7orqTlvLnnqpdcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDb25maXJtUGFuZWwoJ3VubG9ja1JvbGUnLCByb2xlSW5kZXgsIGDnoa7lrpropoHoirHotLkke3ByaWNlfemSu+efs+ino+mUgeinkuiJsuWQl++8n2ApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDpkrvnn7PkuI3otrNcbiAgICAgICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfpkrvnn7PkuI3otrPvvIzml6Dms5Xop6PplIHop5LoibLjgIInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDop5LoibLpgInmi6nmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBvblJvbGVTZWxlY3RDbGljayhyb2xlSW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAobUdhbWVEYXRhLnVubG9ja2VkUm9sZXNbcm9sZUluZGV4XSkge1xuICAgICAgICAgICAgaWYgKG1HYW1lRGF0YS5jdXJyZW50Um9sZSA9PT0gcm9sZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNSb2xlID0gbUdhbWVEYXRhLmN1cnJlbnRSb2xlO1xuICAgICAgICAgICAgLy8g6YCJ5Lit6K+l6KeS6ImyXG4gICAgICAgICAgICBtR2FtZURhdGEuY3VycmVudFJvbGUgPSByb2xlSW5kZXg7XG4gICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgIG1HYW1lRGF0YS5TYXZlQ3VycmVudFJvbGVEYXRhKCk7XG4gICAgICAgICAgICAvLyDlj6rliIfmjaLkvb/nlKjmjInpkq7nirbmgIHvvIzpgb/lhY3ph43lu7rmu5rliqjliJfooajlr7zoh7TnlYzpnaLpl6rng4HjgIJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFJvbGVVc2VCdXR0b25zKHByZXZpb3VzUm9sZSwgcm9sZUluZGV4KTtcbiAgICAgICAgICAgIC8vIOaYvuekuuaPkOekulxuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6KeS6Imy5YiH5o2i5oiQ5Yqf77yBJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6LSt5Lmw5L2T5Yqb5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICovXG4gICAgb25TdGFtaW5hQnV5Q2xpY2soKSB7XG4gICAgICAgIC8vIOajgOafpeS9k+WKm+aYr+WQpuW3sua7oVxuICAgICAgICBpZiAobUdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hID49IG1HYW1lRGF0YS5tYXhTdGFtaW5hKSB7XG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfkvZPlipvlt7Lmu6HvvIzml6DpnIDotK3kubDjgIInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l6ZK755+z5piv5ZCm6Laz5aSfXG4gICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudEdvbGQgPCB0aGlzLnN0YW1pbmFQcmljZSkge1xuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdygn6ZK755+z5LiN6Laz77yM5peg5rOV6LSt5Lmw5L2T5Yqb44CCJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuS6jOasoeehruiupOW8ueeql1xuICAgICAgICB0aGlzLnNob3dDb25maXJtUGFuZWwoJ2J1eVN0YW1pbmEnLCAtMSwgYOehruWumuimgeiKsei0uSR7dGhpcy5zdGFtaW5hUHJpY2V96ZK755+z6LSt5LmwMTDngrnkvZPlipvlkJfvvJ9gKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pi+56S656Gu6K6k5by556qXXG4gICAgICovXG4gICAgc2hvd0NvbmZpcm1QYW5lbChvcGVyYXRpb246IHN0cmluZywgcm9sZUluZGV4OiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICAvLyDkv53lrZjlvZPliY3mk43kvZzkv6Hmga9cbiAgICAgICAgdGhpcy5jdXJyZW50T3BlcmF0aW9uID0gb3BlcmF0aW9uO1xuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlSW5kZXggPSByb2xlSW5kZXg7XG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrmj5DnpLrpnaLmnb9cbiAgICAgICAgaWYgKHRoaXMudGlwc1BhbmVsKSB7XG4gICAgICAgICAgICB0aGlzLnRpcHNQYW5lbC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDorr7nva7mj5DnpLrkv6Hmga9cbiAgICAgICAgaWYgKHRoaXMudGlwc0xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnRpcHNMYWJlbC5zdHJpbmcgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOehruiupOaMiemSrueCueWHu+S6i+S7tlxuICAgICAqL1xuICAgIG9uQ29uZmlybUNsaWNrKCkge1xuICAgICAgICAvLyDpmpDol4/mj5DnpLrpnaLmnb9cbiAgICAgICAgaWYgKHRoaXMudGlwc1BhbmVsKSB7XG4gICAgICAgICAgICB0aGlzLnRpcHNQYW5lbC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u5b2T5YmN5pON5L2c57G75Z6L5omn6KGM55u45bqU55qE6YC76L6RXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRPcGVyYXRpb24gPT09ICd1bmxvY2tSb2xlJyAmJiB0aGlzLmN1cnJlbnRSb2xlSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgLy8g5omn6KGM6KeS6Imy6Kej6ZSB6YC76L6RXG4gICAgICAgICAgICB0aGlzLmV4ZWN1dGVSb2xlVW5sb2NrKHRoaXMuY3VycmVudFJvbGVJbmRleCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50T3BlcmF0aW9uID09PSAnYnV5U3RhbWluYScpIHtcbiAgICAgICAgICAgIC8vIOaJp+ihjOi0reS5sOS9k+WKm+mAu+i+kVxuICAgICAgICAgICAgdGhpcy5leGVjdXRlU3RhbWluYUJ1eSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDph43nva7mk43kvZzkv6Hmga9cbiAgICAgICAgdGhpcy5jdXJyZW50T3BlcmF0aW9uID0gJyc7XG4gICAgICAgIHRoaXMuY3VycmVudFJvbGVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDlj5bmtojmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgKi9cbiAgICBvbkNhbmNlbENsaWNrKCkge1xuICAgICAgICAvLyDpmpDol4/mj5DnpLrpnaLmnb9cbiAgICAgICAgaWYgKHRoaXMudGlwc1BhbmVsKSB7XG4gICAgICAgICAgICB0aGlzLnRpcHNQYW5lbC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5pON5L2c5L+h5oGvXG4gICAgICAgIHRoaXMuY3VycmVudE9wZXJhdGlvbiA9ICcnO1xuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5omn6KGM6KeS6Imy6Kej6ZSB6YC76L6RXG4gICAgICovXG4gICAgZXhlY3V0ZVJvbGVVbmxvY2socm9sZUluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCFtR2FtZURhdGEudW5sb2NrZWRSb2xlc1tyb2xlSW5kZXhdKSB7XG4gICAgICAgICAgICBjb25zdCBwcmljZSA9IG1HYW1lRGF0YS5yb2xlUHJpY2VzW3JvbGVJbmRleF07XG4gICAgICAgICAgICBpZiAobUdhbWVEYXRhLmN1cnJlbnRHb2xkID49IHByaWNlKSB7XG4gICAgICAgICAgICAgICAgLy8g5omj6Zmk6ZK755+zXG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRHb2xkIC09IHByaWNlO1xuICAgICAgICAgICAgICAgIC8vIOino+mUgeinkuiJslxuICAgICAgICAgICAgICAgIG1HYW1lRGF0YS51bmxvY2tlZFJvbGVzW3JvbGVJbmRleF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIC8vIOmAieS4reivpeinkuiJslxuICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5jdXJyZW50Um9sZSA9IHJvbGVJbmRleDtcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgICAgICBtR2FtZURhdGEuU2F2ZUdvbGREYXRhKCk7XG4gICAgICAgICAgICAgICAgbUdhbWVEYXRhLlNhdmVVbmxvY2tlZFJvbGVzRGF0YSgpO1xuICAgICAgICAgICAgICAgIG1HYW1lRGF0YS5TYXZlQ3VycmVudFJvbGVEYXRhKCk7XG4gICAgICAgICAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVVJKCk7XG4gICAgICAgICAgICAgICAgLy8g5Y+R6YCB6ZK755+z5pWw6YeP5pu05paw5LqL5Lu2XG4gICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IuZW1pdCgnZ29sZFVwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAvLyDmmL7npLrmj5DnpLpcbiAgICAgICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfop5LoibLop6PplIHmiJDlip/vvIEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmiafooYzotK3kubDkvZPlipvpgLvovpFcbiAgICAgKi9cbiAgICBleGVjdXRlU3RhbWluYUJ1eSgpIHtcbiAgICAgICAgLy8g5qOA5p+l5L2T5Yqb5piv5ZCm5bey5ruhXG4gICAgICAgIGlmIChtR2FtZURhdGEuY3VycmVudFN0YW1pbmEgPj0gbUdhbWVEYXRhLm1heFN0YW1pbmEpIHtcbiAgICAgICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+S9k+WKm+W3sua7oe+8jOaXoOmcgOi0reS5sOOAgicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6Xpkrvnn7PmmK/lkKbotrPlpJ9cbiAgICAgICAgaWYgKG1HYW1lRGF0YS5jdXJyZW50R29sZCA8IHRoaXMuc3RhbWluYVByaWNlKSB7XG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KCfpkrvnn7PkuI3otrPvvIzml6Dms5XotK3kubDkvZPlipvjgIInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5omj6Zmk6ZK755+zXG4gICAgICAgIG1HYW1lRGF0YS5jdXJyZW50R29sZCAtPSB0aGlzLnN0YW1pbmFQcmljZTtcbiAgICAgICAgLy8g5aKe5Yqg5L2T5YqbXG4gICAgICAgIG1HYW1lRGF0YS5jdXJyZW50U3RhbWluYSA9IE1hdGgubWluKG1HYW1lRGF0YS5tYXhTdGFtaW5hLCBtR2FtZURhdGEuY3VycmVudFN0YW1pbmEgKyAxMCk7XG4gICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICBtR2FtZURhdGEuU2F2ZUdvbGREYXRhKCk7XG4gICAgICAgIG1HYW1lRGF0YS5TYXZlU3RhbWluYURhdGEoKTtcbiAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgdGhpcy51cGRhdGVVSSgpO1xuICAgICAgICAvLyDlj5HpgIHpkrvnn7PmlbDph4/mm7TmlrDkuovku7ZcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdCgnZ29sZFVwZGF0ZWQnKTtcbiAgICAgICAgLy8g5pi+56S65o+Q56S6XG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3coJ+i0reS5sOaIkOWKn++8geiOt+W+lzEw54K55L2T5Yqb44CCJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOiuvue9ruaMiemSrueKtuaAgVxuICAgICAqL1xuICAgIHNldEJ0blN0YXRlKGJ0bjogY2MuTm9kZSwgZW5hYmxlZDogYm9vbGVhbikge1xuICAgICAgICBpZiAoYnRuKSB7XG4gICAgICAgICAgICAvLyDlpITnkIZCdXR0b27nu4Tku7bvvIjlpoLmnpzlrZjlnKjvvIlcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbXBvbmVudCA9IGJ0bi5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgICAgIGlmIChidXR0b25Db21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBidXR0b25Db21wb25lbnQuaW50ZXJhY3RhYmxlID0gZW5hYmxlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5aSE55CGU3ByaXRl57uE5Lu277yI5Zu+54mH5oyJ6ZKu77yJXG4gICAgICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBidG4uZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICBpZiAoc3ByaXRlQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgLy8g5qC55o2u5oyJ6ZKu5ZCN56ew6YCJ5oup5a+55bqU55qE5Zu+54mHXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldFNwcml0ZUZyYW1lOiBjYy5TcHJpdGVGcmFtZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U3ByaXRlRnJhbWUgPSBlbmFibGVkID8gdGhpcy5idG4xTm9ybWFsIDogdGhpcy5idG4xRGlzYWJsZWQ7XG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5om+5Yiw5a+55bqU55qE5Zu+54mH77yM5YiZ6K6+572uXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHRhcmdldFNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Li65Zu+54mH5oyJ6ZKu6K6+572u6Kem5pG45Y+v55So5oCn5qCH6K6wXG4gICAgICAgICAgICBidG5bJ19pc0VuYWJsZWQnXSA9IGVuYWJsZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFVzZUJ1dHRvblZpc3VhbChidG46IGNjLk5vZGUsIGlzVXNpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBidG4uZ2V0Q2hpbGRCeU5hbWUoJ3RleHQnKTtcbiAgICAgICAgaWYgKHRleHROb2RlKSB7XG4gICAgICAgICAgICB0ZXh0Tm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gdGV4dE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGlmIChsYWJlbCkgbGFiZWwuc3RyaW5nID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBidG4uZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmICghc3ByaXRlQ29tcG9uZW50KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcGF0aCA9IGlzVXNpbmcgPyAnMm1haW4vYW5uaXVzaGl5b25nemhvbmcnIDogJzJtYWluL2Fubml1c2hpeW9uZyc7XG4gICAgICAgIGNvbnN0IGNhY2hlZEZyYW1lID0gdGhpcy51c2VCdXR0b25GcmFtZXNbcGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRGcmFtZSkge1xuICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gY2FjaGVkRnJhbWU7XG4gICAgICAgICAgICBzcHJpdGVDb21wb25lbnQuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMocGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yqg6L295ZWG5bqX5L2/55So5oyJ6ZKu5Zu+54mH5aSx6LSlOicsIHBhdGgsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51c2VCdXR0b25GcmFtZXNbcGF0aF0gPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIGlmIChidG4gJiYgYnRuLmlzVmFsaWQgJiYgc3ByaXRlQ29tcG9uZW50ICYmIHNwcml0ZUNvbXBvbmVudC5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoUm9sZVVzZUJ1dHRvbnMocHJldmlvdXNSb2xlOiBudW1iZXIsIGN1cnJlbnRSb2xlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSByZXR1cm47XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNob3BJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbURhdGEgPSB0aGlzLnNob3BJdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpdGVtRGF0YS50eXBlICE9PSAncm9sZScpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGl0ZW1EYXRhLmluZGV4ICE9PSBwcmV2aW91c1JvbGUgJiYgaXRlbURhdGEuaW5kZXggIT09IGN1cnJlbnRSb2xlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaXRlbURhdGEuaXNVc2luZyA9IGl0ZW1EYXRhLmluZGV4ID09PSBjdXJyZW50Um9sZTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1Ob2RlID0gdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQuY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoIWl0ZW1Ob2RlKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG9uTm9kZSA9IGl0ZW1Ob2RlLmdldENoaWxkQnlOYW1lKCdvbicpO1xuICAgICAgICAgICAgaWYgKG9uTm9kZSAmJiBvbk5vZGUuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVc2VCdXR0b25WaXN1YWwob25Ob2RlLCBpdGVtRGF0YS5pc1VzaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcHJlbG9hZFVzZUJ1dHRvbkZyYW1lcygpIHtcbiAgICAgICAgWycybWFpbi9hbm5pdXNoaXlvbmcnLCAnMm1haW4vYW5uaXVzaGl5b25nemhvbmcnXS5mb3JFYWNoKChwYXRoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51c2VCdXR0b25GcmFtZXNbcGF0aF0pIHJldHVybjtcbiAgICAgICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKHBhdGgsIGNjLlNwcml0ZUZyYW1lLCAoZXJyLCBzcHJpdGVGcmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign6aKE5Yqg6L295ZWG5bqX5L2/55So5oyJ6ZKu5Zu+54mH5aSx6LSlOicsIHBhdGgsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51c2VCdXR0b25GcmFtZXNbcGF0aF0gPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbml0U2hvcEl0ZW1zKCk7XG4gICAgICAgIHRoaXMucHJlbG9hZFVzZUJ1dHRvbkZyYW1lcygpO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==