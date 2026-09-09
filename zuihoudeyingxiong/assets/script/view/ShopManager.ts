import { _decorator, Button, Component, director, instantiate, Label, Node, Prefab, ScrollView, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { emits as tipEmits } from '../../scripts/data/enmus';
import { loadPool } from '../../scripts/res/loadPool';
import { gameConfig } from '../data/gameConfig';
import { localData } from '../data/enums';
import { getScopedPlayerListKey, getScopedSelectTypeKey, save } from '../utils/tools';
import { mGameData } from '../../scripts/untils/GameData';

const { ccclass, property } = _decorator;

interface RoleRecord {
    type: number;
    isJiesuo: number;
    price: number;
}

interface ShopListItemData {
    kind: 'role' | 'stamina';
    title: string;
    price: number;
    iconSpriteFrame: SpriteFrame | null;
    roleIndex?: number;
    roleType?: number;
}

@ccclass('ShopManager')
export default class ShopManager extends Component {
    @property(Node)
    closeBtn: Node = null;

    @property(Label)
    zs_num: Label = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    shopItemPrefab: Prefab = null;

    @property([SpriteFrame])
    roleIcons: SpriteFrame[] = [];

    @property(Node)
    addDiamondBtn: Node = null;

    @property(Node)
    tipsPanel: Node = null;

    @property(Label)
    tipsLabel: Label = null;

    @property(Node)
    confirmBtn: Node = null;

    @property(Node)
    cancelBtn: Node = null;

    @property(SpriteFrame)
    di1Sprite: SpriteFrame = null;

    @property(SpriteFrame)
    di2Sprite: SpriteFrame = null;

    @property(SpriteFrame)
    staminaIcon: SpriteFrame = null;

    private readonly staminaPrice = 100;
    private readonly staminaAddAmount = 10;
    private readonly defaultRoleNames = ['赤影镖手', '绿刃侠客', '狂斧勇士', '林中游侠', '部落战魂'];

    private currentOperation: 'unlockRole' | 'buyStamina' | '' = '';
    private currentRoleIndex = -1;

    private shopItems: ShopListItemData[] = [];
    private itemWidth = 0;
    private itemHeight = 0;
    private horizontalSpacing = 12;
    private verticalSpacing = 20;
    private columns = 3;
    private hasInitializedLayout = false;

    onLoad() {
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        if (this.addDiamondBtn) {
            this.addDiamondBtn.on(Node.EventType.TOUCH_END, this.onAddDiamondClick, this);
        }

        if (this.confirmBtn) {
            this.confirmBtn.on(Node.EventType.TOUCH_END, this.onConfirmClick, this);
        }

        if (this.cancelBtn) {
            this.cancelBtn.on(Node.EventType.TOUCH_END, this.onCancelClick, this);
        }

        this.prepareShopList();
    }

    onEnable() {
        this.updateUI();
    }

    private prepareShopList() {
        this.measureItemPrefab();
        this.shopItems = this.buildShopItems();
    }

    private measureItemPrefab() {
        if (!this.shopItemPrefab || this.itemWidth > 0 || this.itemHeight > 0) {
            return;
        }

        const tempNode = instantiate(this.shopItemPrefab);
        const transform = tempNode.getComponent(UITransform);
        if (transform) {
            this.itemWidth = transform.width;
            this.itemHeight = transform.height;
        }
        tempNode.destroy();
    }

    private buildShopItems() {
        const roleRecords = this.getRoleRecords();
        const items: ShopListItemData[] = [];

        for (let i = 0; i < roleRecords.length; i++) {
            items.push({
                kind: 'role',
                title: this.defaultRoleNames[i] || `角色${roleRecords[i].type}`,
                price: roleRecords[i].price,
                iconSpriteFrame: this.roleIcons[i] || null,
                roleIndex: i,
                roleType: roleRecords[i].type,
            });
        }

        items.push({
            kind: 'stamina',
            title: `${this.staminaAddAmount}体力`,
            price: this.staminaPrice,
            iconSpriteFrame: this.staminaIcon,
        });

        return items;
    }

    onBackClick() {
        this.node.active = false;
    }

    updateUI() {
        if (this.zs_num) {
            this.zs_num.string = String(gameConfig.jinbiNum || 0);
        }

        this.ensureDefaultRoleUnlocked();
        this.refreshScrollView();
    }

    private refreshScrollView() {
        if (!this.scrollView || !this.scrollView.content || !this.shopItemPrefab) {
            console.error('ShopManager ScrollView 或 ShopItem Prefab 未设置');
            return;
        }

        const shouldPreserveScroll = this.hasInitializedLayout;
        const scrollOffset = shouldPreserveScroll ? this.getCurrentScrollOffset() : null;
        const content = this.scrollView.content;
        content.removeAllChildren();

        const rows = Math.ceil(this.shopItems.length / this.columns);
        const contentTransform = content.getComponent(UITransform);
        const viewNode = this.scrollView.node.getChildByName('view');
        const viewTransform = viewNode?.getComponent(UITransform);

        if (contentTransform) {
            const contentWidth = this.columns * this.itemWidth + Math.max(0, this.columns - 1) * this.horizontalSpacing + 20;
            const contentHeight = rows * this.itemHeight + Math.max(0, rows - 1) * this.verticalSpacing + 20;
            contentTransform.setContentSize(contentWidth, Math.max(contentHeight, viewTransform?.height || contentHeight));
        }

        for (let i = 0; i < this.shopItems.length; i++) {
            const itemNode = instantiate(this.shopItemPrefab);
            content.addChild(itemNode);
            this.layoutItem(itemNode, i);
            this.renderItem(itemNode, this.shopItems[i]);
        }

        this.restoreScrollPosition(scrollOffset, !this.hasInitializedLayout);
        this.hasInitializedLayout = true;
    }

    private layoutItem(itemNode: Node, index: number) {
        const row = Math.floor(index / this.columns);
        const col = index % this.columns;
        const contentTransform = this.scrollView.content?.getComponent(UITransform);
        if (!contentTransform) {
            return;
        }

        const x = -contentTransform.width / 2 + 10 + this.itemWidth / 2 + col * (this.itemWidth + this.horizontalSpacing);
        const y = -10 - this.itemHeight / 2 - row * (this.itemHeight + this.verticalSpacing);
        itemNode.setPosition(new Vec3(x, y, 0));
    }

    private getCurrentScrollOffset() {
        if (!this.scrollView) {
            return null;
        }

        const offset = this.scrollView.getScrollOffset();
        return new Vec2(offset.x, offset.y);
    }

    private restoreScrollPosition(offset: Vec2 | null, scrollToTop: boolean) {
        if (!this.scrollView) {
            return;
        }

        if (offset) {
            this.scrollView.scrollToOffset(offset, 0);
            return;
        }

        if (scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    }

    private renderItem(itemNode: Node, data: ShopListItemData) {
        this.setChildLabel(itemNode, 'Label', data.title);
        this.setChildSprite(itemNode, 'juese1', data.iconSpriteFrame);
        this.setItemIconScale(itemNode, data.kind === 'stamina' ? 1.5 : 0.7);

        const onNode = itemNode.getChildByName('on');
        const offNode = itemNode.getChildByName('off');
        onNode?.off(Node.EventType.TOUCH_END);
        offNode?.off(Node.EventType.TOUCH_END);

        if (data.kind === 'role' && data.roleIndex !== undefined && data.roleType !== undefined) {
            const role = this.getRoleRecords()[data.roleIndex];
            const isUnlocked = !!role && role.isJiesuo === 1;
            const isCurrent = gameConfig.slectType === data.roleType;

            if (isUnlocked) {
                if (offNode) {
                    offNode.active = false;
                }
                if (onNode) {
                    onNode.active = true;
                    // this.setChildLabel(onNode, 'text', isCurrent ? '使用中' : '使用');
                    this.setNodeSprite(onNode, isCurrent ? this.di2Sprite : this.di1Sprite);
                    onNode.on(Node.EventType.TOUCH_END, () => this.onRoleSelectClick(data.roleIndex!), this);
                }
            } else {
                if (onNode) {
                    onNode.active = false;
                }
                if (offNode) {
                    offNode.active = true;
                    this.setChildLabel(offNode, 'Label', String(data.price));
                    // this.setNodeEnabled(offNode, gameConfig.jinbiNum >= data.price);
                    offNode.on(Node.EventType.TOUCH_END, () => this.onRoleUnlockClick(data.roleIndex!), this);
                }
            }
            return;
        }

        const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
        const canAfford = gameConfig.jinbiNum >= data.price;

        if (onNode) {
            onNode.active = false;
        }
        if (offNode) {
            offNode.active = true;
            this.setChildLabel(offNode, 'Label', String(data.price));
            this.setNodeEnabled(offNode, canAfford);
            offNode.on(Node.EventType.TOUCH_END, this.onStaminaBuyClick, this);
        }
    }

    private getRoleRecords() {
        const result: RoleRecord[] = [];

        for (let page = 0; page < gameConfig.playerList.length; page++) {
            const pageItems = gameConfig.playerList[page] || [];
            for (let i = 0; i < pageItems.length; i++) {
                const item = pageItems[i];
                result.push({
                    type: Number(item.type) || result.length + 1,
                    isJiesuo: Number(item.isJiesuo) || 0,
                    price: Number(item.price) || 0,
                });
            }
        }

        return result;
    }

    private ensureDefaultRoleUnlocked() {
        if (!Array.isArray(gameConfig.playerList) || gameConfig.playerList.length === 0) {
            return;
        }

        const firstPage = gameConfig.playerList[0];
        if (!Array.isArray(firstPage) || firstPage.length === 0) {
            return;
        }

        if (Number(firstPage[0].isJiesuo) !== 1) {
            firstPage[0].isJiesuo = 1;
            save(getScopedPlayerListKey(), gameConfig.playerList);
        }
    }

    private updateRoleUnlockState(roleIndex: number, unlocked: boolean) {
        let currentIndex = 0;
        for (let page = 0; page < gameConfig.playerList.length; page++) {
            const pageItems = gameConfig.playerList[page] || [];
            for (let i = 0; i < pageItems.length; i++) {
                if (currentIndex === roleIndex) {
                    pageItems[i].isJiesuo = unlocked ? 1 : 0;
                    save(getScopedPlayerListKey(), gameConfig.playerList);
                    return;
                }
                currentIndex += 1;
            }
        }
    }

    onRoleUnlockClick(roleIndex: number) {
        const role = this.getRoleRecords()[roleIndex];
        if (!role || role.isJiesuo === 1) {
            return;
        }

        if (gameConfig.jinbiNum < role.price) {
            this.showTips('勋章不足，无法解锁角色。');
            return;
        }

        this.showConfirmPanel('unlockRole', roleIndex, `确定要花费${role.price}勋章解锁角色吗？`);
    }

    onRoleSelectClick(roleIndex: number) {
        const role = this.getRoleRecords()[roleIndex];
        if (!role || role.isJiesuo !== 1) {
            return;
        }

        if (gameConfig.slectType === role.type) {
            return;
        }

        gameConfig.slectType = role.type;
        save(getScopedSelectTypeKey(), gameConfig.slectType);
        this.updateUI();
        this.showTips('角色切换成功。');
    }

    onStaminaBuyClick = () => {
        if (mGameData.currentStamina >= mGameData.maxStamina) {
            this.showTips('当前体力已满。');
            return;
        }

        if (gameConfig.jinbiNum < this.staminaPrice) {
            this.showTips('勋章不足，无法购买体力。');
            return;
        }

        this.showConfirmPanel('buyStamina', -1, `确定要花费${this.staminaPrice}勋章购买${this.staminaAddAmount}点体力吗？`);
    };

    private showConfirmPanel(operation: 'unlockRole' | 'buyStamina', roleIndex: number, message: string) {
        this.currentOperation = operation;
        this.currentRoleIndex = roleIndex;

        if (this.tipsPanel) {
            this.tipsPanel.active = true;
        }
        if (this.tipsLabel) {
            this.tipsLabel.string = message;
        }
    }

    onConfirmClick() {
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }

        if (this.currentOperation === 'unlockRole' && this.currentRoleIndex >= 0) {
            this.executeRoleUnlock(this.currentRoleIndex);
        } else if (this.currentOperation === 'buyStamina') {
            this.executeStaminaBuy();
        }

        this.currentOperation = '';
        this.currentRoleIndex = -1;
    }

    onCancelClick() {
        if (this.tipsPanel) {
            this.tipsPanel.active = false;
        }

        this.currentOperation = '';
        this.currentRoleIndex = -1;
    }

    private executeRoleUnlock(roleIndex: number) {
        const role = this.getRoleRecords()[roleIndex];
        if (!role || role.isJiesuo === 1) {
            return;
        }

        if (gameConfig.jinbiNum < role.price) {
            this.showTips('勋章不足，无法解锁角色。');
            return;
        }

        gameConfig.jinbiNum -= role.price;
        save(localData.jinbiNum, gameConfig.jinbiNum);
        this.updateRoleUnlockState(roleIndex, true);
        gameConfig.slectType = role.type;
        save(getScopedSelectTypeKey(), gameConfig.slectType);
        this.updateUI();
        this.showTips('角色解锁成功。');
    }

    private executeStaminaBuy() {
        if (gameConfig.jinbiNum < this.staminaPrice) {
            this.showTips('勋章不足，无法购买体力。');
            return;
        }

        gameConfig.jinbiNum -= this.staminaPrice;
        save(localData.jinbiNum, gameConfig.jinbiNum);
        mGameData.AddStamina(this.staminaAddAmount);
        this.updateUI();
        this.showTips(`购买成功，获得${this.staminaAddAmount}点体力。`);
    }

    onAddDiamondClick() {
        gameConfig.jinbiNum += 500;
        save(localData.jinbiNum, gameConfig.jinbiNum);
        this.updateUI();
        this.showTips('获得500勋章。');
    }

    private setNodeEnabled(node: Node, enabled: boolean) {
        if (!node) {
            return;
        }

        const button = node.getComponent(Button);
        if (button) {
            button.interactable = enabled;
        }

        const sprite = node.getComponent(Sprite);
        if (sprite) {
            const color = sprite.color.clone();
            color.r = enabled ? 255 : 180;
            color.g = enabled ? 255 : 180;
            color.b = enabled ? 255 : 180;
            sprite.color = color;
        }
    }

    private setChildLabel(node: Node | null, childName: string, value: string) {
        const child = node?.getChildByName(childName);
        const label = child?.getComponent(Label);
        if (label) {
            label.string = value;
            child.active = true;
        }
    }

    private setChildSprite(node: Node | null, childName: string, spriteFrame: SpriteFrame | null) {
        const child = node?.getChildByName(childName);
        const sprite = child?.getComponent(Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    private setItemIconScale(node: Node | null, scale: number) {
        const iconNode = node?.getChildByName('juese1');
        if (!iconNode) {
            return;
        }

        iconNode.setScale(new Vec3(scale, scale, 1));
    }

    private setNodeSprite(node: Node | null, spriteFrame: SpriteFrame | null) {
        const sprite = node?.getComponent(Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    private showTips(message: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(tipEmits.tipMsg, message);
    }
}
