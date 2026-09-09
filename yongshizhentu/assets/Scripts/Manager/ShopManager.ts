import mGameData from "../Load/GameData";
import TipsManager from "../Load/TipsManager";
import warriorRunConfig from "../game/WarriorRunConfig";

const {ccclass, property} = cc._decorator;


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

    @property(cc.Node)
    roleDetailPanel: cc.Node = null;

    @property(cc.Label)
    roleDetailTitle: cc.Label = null;

    @property(cc.Label)
    roleDetailLabel: cc.Label = null;

    @property(cc.Sprite)
    roleDetailIcon: cc.Sprite = null;

    @property(cc.Node)
    roleDetailCloseBtn: cc.Node = null;
    
    // 当前操作类型
    private currentOperation: string = ''; // 'unlockRole' 或 'buyStamina'
    // 当前操作的角色索引
    private currentRoleIndex: number = -1;
    
    // 商品数据数组
    private shopItems: any[] = [];
    private useButtonFrames: {[key: string]: cc.SpriteFrame} = {};
    private roleDetailRoleIndex: number = -1;
    
    onLoad () {
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
        if (this.roleDetailCloseBtn) {
            this.roleDetailCloseBtn.on(cc.Node.EventType.TOUCH_END, this.hideRoleDetail, this);
        }
    }
    
    /**
     * 初始化商品数据
     */
    initShopItems(keepScrollPosition: boolean = false) {
        mGameData.GetUnlockedRolesData();
        mGameData.GetCurrentRoleData();

        // 清空商品数据数组
        this.shopItems = [];
        
        // 添加角色商品
        for (let i = 0; i < mGameData.rolePrices.length; i++) {
            this.shopItems.push({
                type: 'role',
                index: i,
                name: mGameData.roleNames[i] || `角色 ${i + 1}`,
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
        this.refreshScrollView(keepScrollPosition);
    }
    
    /**
     * 刷新滚动列表
     */
    refreshScrollView(keepScrollPosition: boolean = false) {
        if (!this.scrollView || !this.itemPrefab || !this.scrollView.content) {
            console.error('ScrollView or itemPrefab not assigned');
            return;
        }

        const scrollOffset = keepScrollPosition && this.scrollView.getScrollOffset
            ? this.scrollView.getScrollOffset()
            : null;
        
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
        this.adjustContainerSize(scrollOffset);
    }
    
    /**
     * 设置商品项数据
     */
    setItemData(itemNode: cc.Node, itemData: any) {
        // 找到off和on节点
        const offNode = itemNode.getChildByName('off');
        const onNode = itemNode.getChildByName('on');
        
        // 找到名称、重量和价格节点
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
                    // 角色商品，显示 juese1-juese5
                    const iconPath = `3game/juese${itemData.index + 1}`;
                    cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            console.error(`加载${iconPath}失败:`, err);
                        } else {
                            spriteComponent.spriteFrame = spriteFrame;
                            spriteComponent.sizeMode = cc.Sprite.SizeMode.TRIMMED;
                            iconNode.scale = 1;
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
                    iconNode.scale = 1.5
                }
            }
        }
        
        if (itemData.type === 'role') {
            itemNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
                if (this.isRoleActionTouch(event, itemNode)) return;
                this.showRoleDetail(itemData.index);
            }, this);

            // 角色商品
            // 设置角色名称
            if (nameNode) {
                nameNode.getComponent(cc.Label).string = itemData.name;
                // console.log('设置角色名称:', itemData.name);
            }
            
            // 设置角色重量
            if (weightNode) {
                const weight = mGameData.roleWeights[itemData.index] || 0;
                weightNode.getComponent(cc.Label).string = `重量${weight}`;
                // console.log('设置角色重量:', weight);
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
                    this.setUseButtonVisual(onNode, itemData.isUsing);
                    
                    // 添加点击事件
                    onNode.on(cc.Node.EventType.TOUCH_END, () => this.onRoleSelectClick(itemData.index), this);
                }
            } else {
                // 角色未解锁
                if (offNode) {
                    offNode.active = true;
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
    adjustContainerSize(scrollOffset: cc.Vec2 = null) {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        
        const container = this.scrollView.content;
        const layout = container.getComponent(cc.Layout);
        if (layout) layout.enabled = false;

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
        const viewWidth = Math.max(this.scrollView.node.width || 0, view.width || 0, 520);
        view.width = viewWidth;
        container.width = viewWidth;

        const columns = 2;
        const columnSpacing = 20;
        const rowSpacing = 6;
        const topPadding = 4;
        const bottomPadding = 18;
        const rows = Math.ceil(children.length / columns);
        const totalHeight = Math.max(view.height, topPadding + rows * itemHeight + Math.max(0, rows - 1) * rowSpacing + bottomPadding);
        container.height = totalHeight;

        // content锚点保持顶部居中，按效果图两列排列。
        container.anchorX = 0.5;
        container.anchorY = 1;

        const columnOffset = itemWidth / 2 + columnSpacing / 2;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / columns);
            const col = i % columns;
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
    }
    

    
    onEnable() {
        this.hideRoleDetail();
        // 当面板显示时更新UI
        this.updateUI();
    }

    onBackClick() {
        this.hideRoleDetail();
        this.node.active = false;
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
    }
    
    /**
     * 更新商店UI
     */
    updateUI(keepScrollPosition: boolean = false) {
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = mGameData.currentGold.toString();
        }
        
        // 重新初始化商品数据并刷新滚动列表
        this.initShopItems(keepScrollPosition);
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
            const previousRole = mGameData.currentRole;
            // 选中该角色
            mGameData.currentRole = roleIndex;
            // 保存数据
            mGameData.SaveCurrentRoleData();
            // 只切换使用按钮状态，避免重建滚动列表导致界面闪烁。
            this.refreshRoleUseButtons(previousRole, roleIndex);
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

    private isRoleActionTouch(event: cc.Event.EventTouch, itemNode: cc.Node): boolean {
        let target = event && event.target as cc.Node;
        while (target && target !== itemNode) {
            if (target.name === 'on' || target.name === 'off') return true;
            target = target.parent;
        }
        return false;
    }

    private showRoleDetail(roleIndex: number) {
        const character = warriorRunConfig.characters[roleIndex];
        if (!character || !this.roleDetailPanel) return;

        this.roleDetailRoleIndex = roleIndex;
        this.roleDetailPanel.active = true;
        if (this.roleDetailTitle) this.roleDetailTitle.string = character.name;
        if (this.roleDetailLabel) this.roleDetailLabel.string = this.getRoleDetailText(roleIndex);
        if (this.roleDetailIcon) this.roleDetailIcon.spriteFrame = null;

        const iconPath = `3game/juese${roleIndex + 1}`;
        cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(`加载${iconPath}失败:`, err);
                return;
            }
            if (!this.roleDetailPanel || !this.roleDetailPanel.isValid || this.roleDetailRoleIndex !== roleIndex) return;
            if (this.roleDetailIcon && this.roleDetailIcon.isValid) {
                this.roleDetailIcon.spriteFrame = spriteFrame;
            }
        });
    }

    private hideRoleDetail() {
        this.roleDetailRoleIndex = -1;
        if (this.roleDetailPanel && this.roleDetailPanel.isValid) {
            this.roleDetailPanel.active = false;
        }
    }

    private getRoleDetailText(roleIndex: number): string {
        const character = warriorRunConfig.characters[roleIndex];
        if (!character) return '适用于不同战斗节奏。';

        const roleEffects = [
            '均衡风属性输出，适合稳定应对火属性敌人。',
            '高频火属性输出，擅长快速压制雷属性敌人。',
            '稳健雷属性输出，适合持续应对风属性敌人。',
            '低频风属性输出，更依赖走位和目标选择。',
            '高频雷属性输出，克制风属性时拥有额外伤害优势。',
        ];
        const elementNames: {[key: string]: string} = {
            wind: '风',
            fire: '火',
            thunder: '雷',
            none: '无',
        };
        const advantageTargets: {[key: string]: string} = {
            wind: '火',
            fire: '雷',
            thunder: '风',
            none: '无',
        };
        const fireRateLabels = ['均衡', '迅捷', '沉稳', '缓慢', '快速'];
        const advantageMultiplier = warriorRunConfig.global_configs.element_advantage_multiplier + character.element_advantage_bonus;

        return '战斗定位：' + (roleEffects[roleIndex] || '适用于不同战斗节奏。') + '\n\n'
            + '初始属性：' + (elementNames[character.initial_element] || '无') + '\n'
            + '射击节奏：' + (fireRateLabels[roleIndex] || '均衡') + '\n'
            + '克制关系：' + (elementNames[character.initial_element] || '无') + '克'
            + (advantageTargets[character.initial_element] || '无') + '\n'
            + '克制效果：造成' + Math.round(advantageMultiplier * 100) + '%伤害\n'
            // + '编队联动：人数提升后，射击频率会分段增强';
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

    private setUseButtonVisual(btn: cc.Node, isUsing: boolean) {
        const textNode = btn.getChildByName('text');
        if (textNode) {
            textNode.active = false;
            const label = textNode.getComponent(cc.Label);
            if (label) label.string = '';
        }

        const spriteComponent = btn.getComponent(cc.Sprite);
        if (!spriteComponent) return;

        const path = isUsing ? '2main/anniushiyongzhong' : '2main/anniushiyong';
        const cachedFrame = this.useButtonFrames[path];
        if (cachedFrame) {
            spriteComponent.spriteFrame = cachedFrame;
            spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            return;
        }

        cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载商店使用按钮图片失败:', path, err);
                return;
            }
            this.useButtonFrames[path] = spriteFrame;
            if (btn && btn.isValid && spriteComponent && spriteComponent.isValid) {
                spriteComponent.spriteFrame = spriteFrame;
                spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    }

    private refreshRoleUseButtons(previousRole: number, currentRole: number) {
        if (!this.scrollView || !this.scrollView.content) return;

        for (let i = 0; i < this.shopItems.length; i++) {
            const itemData = this.shopItems[i];
            if (itemData.type !== 'role') continue;
            if (itemData.index !== previousRole && itemData.index !== currentRole) continue;

            itemData.isUsing = itemData.index === currentRole;
            const itemNode = this.scrollView.content.children[i];
            if (!itemNode) continue;
            const onNode = itemNode.getChildByName('on');
            if (onNode && onNode.active) {
                this.setUseButtonVisual(onNode, itemData.isUsing);
            }
        }
    }

    private preloadUseButtonFrames() {
        ['2main/anniushiyong', '2main/anniushiyongzhong'].forEach((path) => {
            if (this.useButtonFrames[path]) return;
            cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error('预加载商店使用按钮图片失败:', path, err);
                    return;
                }
                this.useButtonFrames[path] = spriteFrame;
            });
        });
    }

    public show(): void {
        this.hideRoleDetail();
        this.initShopItems();
        this.preloadUseButtonFrames();
        this.node.active = true;
    }

    public hide(): void {
        this.hideRoleDetail();
        this.node.active = false;
    }
}
