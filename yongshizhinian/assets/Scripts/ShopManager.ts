import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Button, director, resources } from 'cc';
import { load, save } from './tools';
import { emits } from './enmus';
import { gameConfig } from './gameConfig';
import { loadPool } from './loadPool';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('ShopManager')
export default class ShopManager extends Component {
    @property(Node)
    closeBtn: Node = null; 
    
    @property(Label)
    zs_num: Label = null; 

    // 角色相关节点
    @property([Node])
    roleNodes: Node[] = []; // 角色节点数组
    
    // 体力商品项节点
    @property(Node)
    staminaItemNode: Node = null; // 体力商品项节点
    
    // 体力商品项价格
    private staminaPrice: number = 100; // 体力商品项价格
    
    // 增加钻石按钮
    @property(Node)
    addDiamondBtn: Node = null; // 增加500钻石按钮
    
    // 提示面板节点
    @property(Node)
    tipsPanel: Node = null; // 提示面板节点
    
    // 提示信息标签
    @property(Label)
    tipsLabel: Label = null; // 提示信息标签
    
    // 确认按钮
    @property(Node)
    confirmBtn: Node = null; // 确认按钮
    
    // 取消按钮
    @property(Node)
    cancelBtn: Node = null; // 取消按钮
    
    // 按钮正常状态图片
    @property(SpriteFrame)
    btn1Normal: SpriteFrame = null;
    // 按钮禁用状态图片
    @property(SpriteFrame)
    btn1Disabled: SpriteFrame = null;
    
    // 角色背景图片
    @property(SpriteFrame)
    di1Sprite: SpriteFrame = null; // 使用中背景
    
    @property(SpriteFrame)
    di2Sprite: SpriteFrame = null; // 普通使用背景
    
    // 当前操作类型
    private currentOperation: string = ''; // 'unlockRole' 或 'buyStamina'
    // 当前操作的角色索引
    private currentRoleIndex: number = -1;
    
    onLoad () {
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        
        // 为每个角色节点添加点击事件
        for (let i = 0; i < this.roleNodes.length; i++) {
            const roleNode = this.roleNodes[i];
            if (roleNode) {
                // 找到off和on节点
                const offNode = roleNode.getChildByName('off');
                const onNode = roleNode.getChildByName('on');
                
                if (offNode) {
                    offNode.on(Node.EventType.TOUCH_END, () => this.onRoleUnlockClick(i), this);
                }
                
                if (onNode) {
                    onNode.on(Node.EventType.TOUCH_END, () => this.onRoleSelectClick(i), this);
                }
            }
        }
        
        // 为体力商品项节点添加点击事件
        if (this.staminaItemNode) {
            this.staminaItemNode.on(Node.EventType.TOUCH_END, this.onStaminaBuyClick, this);
        }
        
        // 为增加钻石按钮添加点击事件
        if (this.addDiamondBtn) {
            this.addDiamondBtn.on(Node.EventType.TOUCH_END, this.onAddDiamondClick, this);
        }
        
        // 为提示面板按钮添加点击事件
        if (this.confirmBtn) {
            this.confirmBtn.on(Node.EventType.TOUCH_END, this.onConfirmClick, this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.on(Node.EventType.TOUCH_END, this.onCancelClick, this);
        }
    }
    
    onEnable() {
        // 当面板显示时更新UI
        this.updateUI();
    }

    onBackClick() {
        this.node.active = false;
        // 发送钻石数量更新事件
        director.emit('goldUpdated');
    }
    
    /**
     * 更新商店UI
     */
    updateUI() {
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = gameConfig.currentGold.toString();
        }
        
        // 更新角色状态
        this.updateRoleStates();
        
        // 更新体力商品项状态
        this.updateStaminaItemState();
    }
    
    /**
     * 更新体力商品项状态
     */
    updateStaminaItemState() {
        if (this.staminaItemNode) {
            // 检查体力是否已满
            const isStaminaFull = GameData.inst.currentStamina >= GameData.inst.maxStamina;
            // 检查钻石是否不足
            const isDiamondEnough = gameConfig.currentGold >= this.staminaPrice;
            const isDisabled = isStaminaFull || !isDiamondEnough;
            
            // 设置button组件的interactable属性
            const buttonComponent = this.staminaItemNode.getComponent(Button);
            if (buttonComponent) {
                buttonComponent.interactable = !isDisabled;
            }
        }
    }
    
    /**
     * 更新角色状态
     */
    updateRoleStates() {
        for (let i = 0; i < this.roleNodes.length; i++) {
            const roleNode = this.roleNodes[i];
            if (roleNode) {
                // 找到off和on节点
                const offNode = roleNode.getChildByName('off');
                const onNode = roleNode.getChildByName('on');
                
                if (gameConfig.isRoleUnlocked(i)) {
                    // 角色已解锁
                    if (offNode) offNode.active = false;
                    if (onNode) {
                        onNode.active = true;
                        // 从on节点下获取text节点
                        const textNode = onNode.getChildByName('text');
                        if (textNode) {
                            if (i === gameConfig.currentRole) {
                                textNode.getComponent(Label).string = '使用中';
                                // 设置使用中的背景图片
                                const spriteComponent = onNode.getComponent(Sprite);
                                if (spriteComponent && this.di1Sprite) {
                                    spriteComponent.spriteFrame = this.di1Sprite;
                                }
                            } else {
                                textNode.getComponent(Label).string = '使用';
                                // 设置普通使用的背景图片
                                const spriteComponent = onNode.getComponent(Sprite);
                                if (spriteComponent && this.di2Sprite) {
                                    spriteComponent.spriteFrame = this.di2Sprite;
                                }
                            }
                        }
                    }
                } else {
                    // 角色未解锁
                    if (offNode) {
                        offNode.active = true;
                        // 从off节点下获取text节点
                        const textNode = offNode.getChildByName('text');
                        if (textNode) {
                            textNode.getComponent(Label).string = gameConfig.rolePrices[i] + '钻石';
                        }
                    }
                    if (onNode) onNode.active = false;
                }
            }
        }
    }
    
    /**
     * 角色解锁按钮点击事件
     */
    onRoleUnlockClick(roleIndex: number) {
        if (!gameConfig.isRoleUnlocked(roleIndex)) {
            const price = gameConfig.rolePrices[roleIndex];
            if (gameConfig.currentGold >= price) {
                // 显示二次确认弹窗
                this.showConfirmPanel('unlockRole', roleIndex, `确定要花费${price}钻石解锁角色吗？`);
            } else {
                // 钻石不足
                this.showTips('钻石不足，无法解锁角色。');
            }
        }
    }
    
    /**
     * 角色选择按钮点击事件
     */
    onRoleSelectClick(roleIndex: number) {
        if (gameConfig.isRoleUnlocked(roleIndex)) {
            // 选中该角色
            gameConfig.setCurrentRole(roleIndex);
            // 更新UI
            this.updateUI();
            // 显示提示
            this.showTips('角色切换成功！');
        }
    }
    
    /**
     * 购买体力按钮点击事件
     */
    onStaminaBuyClick() {
        // 检查体力是否已满
        if (GameData.inst.currentStamina >= GameData.inst.maxStamina) {
            this.showTips('当前体力已满。');
            return;
        }
        
        // 检查钻石是否足够
        if (gameConfig.currentGold < this.staminaPrice) {
            this.showTips('钻石不足，无法购买体力。');
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
        if (!gameConfig.isRoleUnlocked(roleIndex)) {
            const price = gameConfig.rolePrices[roleIndex];
            if (gameConfig.currentGold >= price) {
                // 解锁角色
                const success = gameConfig.unlockRole(roleIndex);
                if (success) {
                    // 选中该角色
                    gameConfig.setCurrentRole(roleIndex);
                    // 更新UI
                    this.updateUI();
                    // 发送钻石数量更新事件
                    director.emit('goldUpdated');
                    // 显示提示
                    this.showTips('角色解锁成功！');
                }
            }
        }
    }
    
    /**
     * 执行购买体力逻辑
     */
    executeStaminaBuy() {
        // 检查钻石是否足够
        if (gameConfig.currentGold < this.staminaPrice) {
            this.showTips('钻石不足，无法购买体力。');
            return;
        }
        
        // 扣除钻石
        gameConfig.currentGold -= this.staminaPrice;
        // 保存钻石数据
        gameConfig.SaveGoldData();
        // 增加体力
        GameData.inst.AddStamina(10);
        // 更新UI
        this.updateUI();
        // 发送钻石数量更新事件
        director.emit('goldUpdated');
        // 显示提示
        this.showTips('购买成功！获得10点体力。');
    }
    
    /**
     * 增加钻石按钮点击事件
     */
    onAddDiamondClick() {
        // 增加500钻石
        gameConfig.currentGold += 500;
        // 保存钻石数据
        gameConfig.SaveGoldData();
        // 更新UI
        this.updateUI();
        // 发送钻石数量更新事件
        director.emit('goldUpdated');
        // 显示提示
        this.showTips('获得500钻石！');
    }
    
    /**
     * 设置按钮状态
     */
    setBtnState(btn: Node, enabled: boolean) {
        if (btn) {
            // 处理Button组件（如果存在）
            const buttonComponent = btn.getComponent(Button);
            if (buttonComponent) {
                buttonComponent.interactable = enabled;
            }
            
            // 处理Sprite组件（图片按钮）
            const spriteComponent = btn.getComponent(Sprite);
            if (spriteComponent) {
                // 根据按钮名称选择对应的图片
                let targetSpriteFrame: SpriteFrame = null;
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
    
    /**
     * 显示提示信息
     */
    showTips(message: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(emits.tipMsg, message);
    }
}