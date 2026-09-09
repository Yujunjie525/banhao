import mGameData from "../Load/GameData";
import TipsManager from "../Load/TipsManager";
import { ARCANE_CHARACTERS } from "../game2/ArcaneWarriorLevelConfig";

const {ccclass, property} = cc._decorator;

const SHOP_GRID_COLUMNS = 3;
const SHOP_GRID_VISIBLE_ROWS = 2;
const SHOP_ITEM_MAX_SCALE = 0.72;
const SHOP_ITEM_MIN_SCALE = 0.55;
const SHOP_ITEM_HORIZONTAL_SPACING = 48;
const SHOP_ITEM_VERTICAL_SPACING = 8;


@ccclass
export default class ShopManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null; 
    
    @property(cc.Label)
    zs_num: cc.Label = null; 

    // 滚动视图节点
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null; // 滚动视图节点
    
    // 商品项预制体
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null; // 商品项预制体
    
    // 商品项容器
    @property(cc.Node)
    itemContainer: cc.Node = null; // 商品项容器节点
    
    // 体力商品项价格
    private staminaPrice: number = 100; // 体力商品项价格
    
    // 提示面板节点
    @property(cc.Node)
    tipsPanel: cc.Node = null; // 提示面板节点
    
    // 提示信息标签
    @property(cc.Label)
    tipsLabel: cc.Label = null; // 提示信息标签
    
    // 确认按钮
    @property(cc.Node)
    confirmBtn: cc.Node = null; // 确认按钮
    
    // 取消按钮
    @property(cc.Node)
    cancelBtn: cc.Node = null; // 取消按钮
    
    // 按钮正常状态图片
    @property(cc.SpriteFrame)
    btn1Normal: cc.SpriteFrame = null;
    // 按钮禁用状态图片
    @property(cc.SpriteFrame)
    btn1Disabled: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    roleUseButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    roleUsingButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    priceButtonSprite: cc.SpriteFrame = null;
    
    // 当前操作类型
    private currentOperation: string = ''; // 'unlockRole' 或 'buyStamina'
    // 当前操作的角色索引
    private currentRoleIndex: number = -1;
    
    // 商品数据数组
    private shopItems: any[] = [];
    
    onLoad () {
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
    }

    /**
     * 初始化商品数据
     */
    initShopItems(keepScroll: boolean = false) {
        // 清空商品数据数组
        this.shopItems = [];
        
        // 添加角色商品
        for (let i = 0; i < mGameData.rolePrices.length; i++) {
            const arcaneCharacter = ARCANE_CHARACTERS[i];
            this.shopItems.push({
                type: 'role',
                index: i,
                name: arcaneCharacter ? arcaneCharacter.name : `勇者${i + 1}`,
                iconPath: `2main/role${i + 1}`,
                price: mGameData.rolePrices[i],
                unlocked: mGameData.unlockedRoles[i],
                isUsing: i === mGameData.currentRole
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
    }
    
    /**
     * 刷新滚动列表
     */
    refreshScrollView(keepScroll: boolean = false) {
        if (!this.scrollView || !this.itemPrefab || !this.scrollView.content) {
            console.error('ScrollView or itemPrefab not assigned');
            return;
        }
        this.configureStaticGridScrollView();
        
        // 清空容器
        this.scrollView.content.removeAllChildren();
        
        // 遍历商品数据，创建商品项
        for (let i = 0; i < this.shopItems.length; i++) {
            const itemData = this.shopItems[i];
            
            // 创建商品项节点
            const itemNode = cc.instantiate(this.itemPrefab);
            this.scrollView.content.addChild(itemNode);
            
            // 设置商品项数据
            this.setItemData(itemNode, itemData);
        }
        
        // 调整容器大小
        this.adjustContainerSize();
    }
    
    /**
     * 设置商品项数据
     */
    setItemData(itemNode: cc.Node, itemData: any) {
        // 找到off和on节点
        const offNode = itemNode.getChildByName('off');
        const onNode = itemNode.getChildByName('on');
        
        // 找到名称、移速和价格节点
        const nameNode = itemNode.getChildByName('name');
        const weightNode = itemNode.getChildByName('weight');
        const priceNode = offNode.getChildByName('price');
        
        // 找到图标节点（假设图标节点名称为'icon'）
        const iconNode = itemNode.getChildByName('icon');

        
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
            const spriteComponent = iconNode.getComponent(cc.Sprite);
            if (spriteComponent) {
                if (itemData.type === 'role') {
                    const iconPath = itemData.iconPath || `2main/role${itemData.index + 1}`;
                    iconNode.scale = 1;
                    // 角色图向下调整 15 像素；体力图沿用 prefab 原坐标。
                    iconNode.setPosition(iconNode.x, iconNode.y - 20);
                    cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            console.error(`加载${iconPath}失败:`, err);
                        } else {
                            spriteComponent.spriteFrame = spriteFrame;
                        }
                    });
                } else if (itemData.type === 'stamina') {
                    // 体力商品，显示 tili.png
                    cc.loader.loadRes('2main/tili', cc.SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            console.error('加载tili失败:', err);
                        } else {
                            spriteComponent.spriteFrame = spriteFrame;
                        }
                    });
                    iconNode.scale = 1
                }
            }
        }
        
        if (itemData.type === 'role') {
            // 角色商品
            if (nameNode) {
                const nameLabel = nameNode.getComponent(cc.Label);
                if (nameLabel) nameLabel.string = itemData.name;
            }
            
            // 角色特性只由移速决定，价格越高的角色移速越快。
            if (weightNode) {
                const speed = ARCANE_CHARACTERS[itemData.index]
                    ? ARCANE_CHARACTERS[itemData.index].base_spd
                    : 4 + itemData.index;
                weightNode.getComponent(cc.Label).string = `移速${speed}`;
            }
            
            // 设置价格
            if (priceNode) {
                priceNode.getComponent(cc.Label).string = `${itemData.price}`;
                // console.log('设置角色价格:', itemData.price);
            }
            
            if (itemData.unlocked) {
                // 角色已解锁
                if (offNode) offNode.active = false;
                if (onNode) {
                    onNode.active = true;
                    this.setRoleButtonVisual(onNode, itemData.isUsing);
                    
                    // 添加点击事件
                    onNode.on(cc.Node.EventType.TOUCH_END, () => this.onRoleSelectClick(itemData.index), this);
                }
            } else {
                // 角色未解锁
                if (offNode) {
                    offNode.active = true;
                    this.setPriceButtonVisual(offNode);
                    // 从off节点下获取text节点
                    const textNode = offNode.getChildByName('text');
                    if (textNode) {
                        textNode.getComponent(cc.Label).string = itemData.price + '';
                    }
                    
                    // 添加点击事件
                    offNode.on(cc.Node.EventType.TOUCH_END, () => this.onRoleUnlockClick(itemData.index), this);
                }
                if (onNode) onNode.active = false;
            }
        } else if (itemData.type === 'stamina') {
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
                priceNode.getComponent(cc.Label).string = `${itemData.price}`;
            }
            
            if (offNode) offNode.active = true;
            this.setPriceButtonVisual(offNode);

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
    }

    
    /**
     * 调整容器大小
     */
    adjustContainerSize() {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        
        const container = this.scrollView.content;
        const children = container.children;
        
        if (children.length === 0) {
            return;
        }
        
        // 获取商品项的大小（使用第一个商品项作为参考）
        const item = children[0];
        const itemWidth = item.width;
        const itemHeight = item.height;
        
        // 获取view节点宽度
        const view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        const viewWidth = view.width;
        const viewHeight = view.height || this.scrollView.node.height;
        
        // 商品项按3列2行缩放排列，保证6个商品同屏显示。
        const columnCount = SHOP_GRID_COLUMNS;
        const visibleRows = SHOP_GRID_VISIBLE_ROWS;
        const rowCount = Math.ceil(children.length / columnCount);
        const layoutRows = Math.max(visibleRows, rowCount);
        const maxScaleX = (viewWidth - SHOP_ITEM_HORIZONTAL_SPACING * (columnCount - 1)) / (itemWidth * columnCount);
        const maxScaleY = (viewHeight - SHOP_ITEM_VERTICAL_SPACING * (layoutRows - 1)) / (itemHeight * layoutRows);
        const itemScale = Math.max(SHOP_ITEM_MIN_SCALE, Math.min(SHOP_ITEM_MAX_SCALE, maxScaleX, maxScaleY));
        const scaledItemWidth = itemWidth * itemScale;
        const scaledItemHeight = itemHeight * itemScale;
        const horizontalSpacing = SHOP_ITEM_HORIZONTAL_SPACING;
        const verticalSpacing = SHOP_ITEM_VERTICAL_SPACING;
        const gridWidth = columnCount * scaledItemWidth + (columnCount - 1) * horizontalSpacing;
        const gridHeight = rowCount * scaledItemHeight + Math.max(0, rowCount - 1) * verticalSpacing;
        const yPadding = Math.max(0, (viewHeight - gridHeight) / 2);

        // 设置content的大小，宽高与view一致，避免产生可滚动范围。
        container.width = viewWidth;
        container.height = viewHeight;
        
        // 设置content的锚点为左上角
        container.anchorX = 0.5;
        container.anchorY = 1;
        container.x = 0;
        container.y = 0;
        
        // 设置商品项的位置（三列网格，整体居中显示）
        const startX = -gridWidth / 2 + scaledItemWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / columnCount);
            const col = i % columnCount;
            child.scale = itemScale;
            // 设置商品项的位置，从顶部开始排列，考虑y方向padding和商品项高度
            child.y = -yPadding - scaledItemHeight / 2 - row * (scaledItemHeight + verticalSpacing);
            // 三列横向居中显示
            child.x = startX + col * (scaledItemWidth + horizontalSpacing);
        }

        this.configureStaticGridScrollView();
        this.scrollView.scrollToOffset(cc.v2(0, 0), 0);
    }

    private configureStaticGridScrollView() {
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
    }
    

    
    onEnable() {
        // 当面板显示时更新UI
        this.updateUI();
    }

    onBackClick() {
        this.node.active = false;
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
    }
    
    /**
     * 更新商店UI
     */
    updateUI(keepScroll: boolean = false) {
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = mGameData.currentGold.toString();
        }
        
        // 重新初始化商品数据并刷新滚动列表
        this.initShopItems(keepScroll);
    }

    private refreshRoleSelectionState() {
        if (!this.scrollView || !this.scrollView.content) {
            return;
        }

        for (let i = 0; i < this.shopItems.length; i++) {
            const itemData = this.shopItems[i];
            if (itemData.type === 'role') {
                itemData.isUsing = itemData.index === mGameData.currentRole;
            }
        }

        const children = this.scrollView.content.children;
        for (let i = 0; i < children.length; i++) {
            const itemData = this.shopItems[i];
            if (!itemData || itemData.type !== 'role' || !itemData.unlocked) {
                continue;
            }

            const itemNode = children[i];
            const offNode = itemNode.getChildByName('off');
            const onNode = itemNode.getChildByName('on');
            if (offNode) offNode.active = false;
            if (!onNode) continue;

            onNode.active = true;
            this.setRoleButtonVisual(onNode, itemData.isUsing);
        }
    }

    private setRoleButtonVisual(buttonNode: cc.Node, isUsing: boolean) {
        const spriteFrame = isUsing ? this.roleUsingButtonSprite : this.roleUseButtonSprite;
        const sprite = buttonNode.getComponent(cc.Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }

        const textNode = buttonNode.getChildByName('text');
        if (!textNode) return;

        // 正式按钮图已包含文字；未绑定资源时保留旧标签作为兼容回退。
        textNode.active = !spriteFrame;
        if (!spriteFrame) {
            const label = textNode.getComponent(cc.Label);
            if (label) label.string = isUsing ? '使用中' : '使用';
        }
    }

    private setPriceButtonVisual(buttonNode: cc.Node) {
        const sprite = buttonNode ? buttonNode.getComponent(cc.Sprite) : null;
        if (sprite && this.priceButtonSprite) {
            sprite.spriteFrame = this.priceButtonSprite;
        }
    }
    
    /**
     * 角色解锁按钮点击事件
     */
    onRoleUnlockClick(roleIndex: number) {
        if (!mGameData.unlockedRoles[roleIndex]) {
            const price = mGameData.rolePrices[roleIndex];
            if (mGameData.currentGold >= price) {
                // 显示二次确认弹窗
                this.showConfirmPanel('unlockRole', roleIndex, `确定要花费${price}钻石解锁角色吗？`);
            } else {
                // 钻石不足
                TipsManager.show('钻石不足，无法解锁角色。');
            }
        }
    }
    
    /**
     * 角色选择按钮点击事件
     */
    onRoleSelectClick(roleIndex: number) {
        if (mGameData.unlockedRoles[roleIndex]) {
            if (mGameData.currentRole === roleIndex) {
                return;
            }
            // 选中该角色
            mGameData.currentRole = roleIndex;
            // 保存数据
            mGameData.SaveCurrentRoleData();
            // 更新UI
            this.refreshRoleSelectionState();
            // 显示提示
            TipsManager.show('角色切换成功！');
        }
    }
    
    /**
     * 购买体力按钮点击事件
     */
    onStaminaBuyClick() {
        // 检查体力是否已满
        if (mGameData.currentStamina >= mGameData.maxStamina) {
            TipsManager.show('体力已满，无需购买。');
            return;
        }
        
        // 检查钻石是否足够
        if (mGameData.currentGold < this.staminaPrice) {
            TipsManager.show('钻石不足，无法购买体力。');
            return;
        }
        
        // 显示二次确认弹窗
        this.showConfirmPanel('buyStamina', -1, `确定要花费${this.staminaPrice}钻石购买10点体力吗？`);
    }
    
    /**
     * 显示确认弹窗
     */
    showConfirmPanel(operation: string, roleIndex: number, message: string) {
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
    }
    
    /**
     * 确认按钮点击事件
     */
    onConfirmClick() {
        // 隐藏提示面板
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }
        
        // 根据当前操作类型执行相应的逻辑
        if (this.currentOperation === 'unlockRole' && this.currentRoleIndex >= 0) {
            // 执行角色解锁逻辑
            this.executeRoleUnlock(this.currentRoleIndex);
        } else if (this.currentOperation === 'buyStamina') {
            // 执行购买体力逻辑
            this.executeStaminaBuy();
        }
        
        // 重置操作信息
        this.currentOperation = '';
        this.currentRoleIndex = -1;
    }
    
    /**
     * 取消按钮点击事件
     */
    onCancelClick() {
        // 隐藏提示面板
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }
        
        // 重置操作信息
        this.currentOperation = '';
        this.currentRoleIndex = -1;
    }
    
    /**
     * 执行角色解锁逻辑
     */
    executeRoleUnlock(roleIndex: number) {
        if (!mGameData.unlockedRoles[roleIndex]) {
            const price = mGameData.rolePrices[roleIndex];
            if (mGameData.currentGold >= price) {
                // 扣除钻石
                mGameData.currentGold -= price;
                // 解锁角色
                mGameData.unlockedRoles[roleIndex] = true;
                // 选中该角色
                mGameData.currentRole = roleIndex;
                // 保存数据
                mGameData.SaveGoldData();
                mGameData.SaveUnlockedRolesData();
                mGameData.SaveCurrentRoleData();
                // 更新UI
                this.updateUI();
                // 发送钻石数量更新事件
                cc.director.emit('goldUpdated');
                // 显示提示
                TipsManager.show('角色解锁成功！');
            }
        }
    }
    
    /**
     * 执行购买体力逻辑
     */
    executeStaminaBuy() {
        // 检查体力是否已满
        if (mGameData.currentStamina >= mGameData.maxStamina) {
            TipsManager.show('体力已满，无需购买。');
            return;
        }
        
        // 检查钻石是否足够
        if (mGameData.currentGold < this.staminaPrice) {
            TipsManager.show('钻石不足，无法购买体力。');
            return;
        }
        
        // 扣除钻石
        mGameData.currentGold -= this.staminaPrice;
        // 增加体力
        mGameData.currentStamina = Math.min(mGameData.maxStamina, mGameData.currentStamina + 10);
        // 保存数据
        mGameData.SaveGoldData();
        mGameData.SaveStaminaData();
        // 更新UI
        this.updateUI();
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
        // 显示提示
        TipsManager.show('购买成功！获得10点体力。');
    }
    
    /**
     * 设置按钮状态
     */
    setBtnState(btn: cc.Node, enabled: boolean) {
        if (btn) {
            // 处理Button组件（如果存在）
            const buttonComponent = btn.getComponent(cc.Button);
            if (buttonComponent) {
                buttonComponent.interactable = enabled;
            }
            
            // 处理Sprite组件（图片按钮）
            const spriteComponent = btn.getComponent(cc.Sprite);
            if (spriteComponent) {
                // 根据按钮名称选择对应的图片
                let targetSpriteFrame: cc.SpriteFrame = null;
                targetSpriteFrame = enabled ? this.btn1Normal : this.btn1Disabled;
                // 如果找到对应的图片，则设置
                if (targetSpriteFrame) {
                    spriteComponent.spriteFrame = targetSpriteFrame;
                }
            }
            
            // 为图片按钮设置触摸可用性标记
            btn['_isEnabled'] = enabled;
        }
    }
}
