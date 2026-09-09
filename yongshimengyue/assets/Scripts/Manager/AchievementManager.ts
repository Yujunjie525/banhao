const { ccclass, property } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';

interface AchievementConfig {
    id: number;
    icon: string;
    name: string;
    desc: string;
    type: string | number;
    count: number;
    rewardGold: number;
}

interface AchievementState {
    progress: number;
    displayProgress: number;
    target: number;
    completed: boolean;
    claimed: boolean;
    rewardGold: number;
}

@ccclass
export default class AchievementManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    zs_num: cc.Label = null;

    @property(cc.Node)
    item: cc.Node = null;

    private achievements: AchievementConfig[] = [];
    private claimedMap: { [key: string]: boolean } = {};
    private scrollView: cc.ScrollView = null;
    private contentNode: cc.Node = null;
    private templateNode: cc.Node = null;
    private iconCache: { [key: string]: cc.SpriteFrame } = {};
    private claimedButtonSpriteFrame: cc.SpriteFrame = null;

    onLoad() {
        this.cacheNodes();
        this.bindEvents();
        this.loadClaimedData();
        this.loadConfig();
        cc.director.on('goldUpdated', this.updateGoldLabel, this);
    }

    onEnable() {
        this.refreshView();
    }

    onDestroy() {
        cc.director.off('goldUpdated', this.updateGoldLabel, this);

        if (this.closeBtn && cc.isValid(this.closeBtn)) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
    }

    private cacheNodes() {
        if (!this.closeBtn || !cc.isValid(this.closeBtn)) {
            this.closeBtn = cc.find('BtnClose', this.node);
        }

        if (!this.zs_num || !cc.isValid(this.zs_num.node)) {
            this.zs_num = this.findLabelByName(this.node, 'zs_num');
        }

        const scrollNode = cc.find('ScrollView', this.node);
        this.scrollView = scrollNode ? scrollNode.getComponent(cc.ScrollView) : null;
        this.contentNode = cc.find('ScrollView/view/content', this.node);
        const layout = this.contentNode ? this.contentNode.getComponent(cc.Layout) : null;
        if (layout) {
            layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
            layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
        }

        if (!this.item || !cc.isValid(this.item)) {
            this.item = this.node.getChildByName('item');
        }

        this.templateNode = this.item && cc.isValid(this.item) ? this.item : null;
        if (this.templateNode) {
            this.templateNode.active = false;
        } else {
            cc.warn('AchievementManager: item template node not found.');
        }

        this.updateGoldLabel();
    }

    private bindEvents() {
        if (!this.closeBtn || !cc.isValid(this.closeBtn)) {
            return;
        }

        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
    }

    private loadConfig() {
        this.preloadClaimedButtonSprite();
        cc.loader.loadRes('config/achievement', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error) {
                console.error('Achievement config load failed:', error);
                TipsManager.show('成就配置加载失败。');
                return;
            }

            const rawList = asset && Array.isArray(asset.json) ? asset.json : [];
            this.achievements = rawList.slice(0, 10)
                .map((item: any) => this.normalizeConfig(item))
                .filter((item) => item.id > 0);
            this.refreshView();
        });
    }

    private normalizeConfig(raw: any): AchievementConfig {
        return {
            id: Number(raw && raw.id) || 0,
            icon: `${raw && raw.icon ? raw.icon : ''}`,
            name: `${raw && raw.name ? raw.name : '未命名成就'}`,
            desc: `${raw && raw.desc ? raw.desc : ''}`,
            type: raw && raw.type != null ? raw.type : '',
            count: Math.max(0, Number(raw && (raw.count != null ? raw.count : raw.target)) || 0),
            rewardGold: Math.max(
                0,
                Number(
                    raw && (
                        raw.rewardGold != null
                            ? raw.rewardGold
                            : raw.rewardDiamond != null
                                ? raw.rewardDiamond
                                : raw.reward
                    )
                ) || 0
            ),
        };
    }

    private loadClaimedData() {
        const raw = cc.sys.localStorage.getItem(this.getClaimedStorageKey());
        if (!raw) {
            this.claimedMap = {};
            return;
        }

        try {
            this.claimedMap = JSON.parse(raw) || {};
        } catch (error) {
            console.warn('Achievement claimed data parse failed, reset it.', error);
            this.claimedMap = {};
        }
    }

    private saveClaimedData() {
        cc.sys.localStorage.setItem(this.getClaimedStorageKey(), JSON.stringify(this.claimedMap));
    }

    private getClaimedStorageKey(): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        return LocalStorageKeys.userKey('AchievementClaimed', userId);
    }

    private refreshView() {
        this.updateGoldLabel();

        if (!this.contentNode || !cc.isValid(this.contentNode) || !this.templateNode || !cc.isValid(this.templateNode)) {
            return;
        }

        this.contentNode.destroyAllChildren();

        const sortedAchievements = this.getSortedAchievements();
        for (let i = 0; i < sortedAchievements.length; i++) {
            const itemNode = this.createAchievementItem(sortedAchievements[i], i);
            itemNode.parent = this.contentNode;
        }

        const layout = this.contentNode.getComponent(cc.Layout);
        if (layout) {
            layout.updateLayout();
        }

        if (this.scrollView && cc.isValid(this.scrollView.node)) {
            this.scheduleOnce(() => {
                const currentLayout = this.contentNode && cc.isValid(this.contentNode)
                    ? this.contentNode.getComponent(cc.Layout)
                    : null;
                if (currentLayout) {
                    currentLayout.updateLayout();
                }

                if (this.scrollView && cc.isValid(this.scrollView.node)) {
                    this.scrollView.scrollToTop(0);
                }
            }, 0);
        }
    }

    private createAchievementItem(config: AchievementConfig, index: number): cc.Node {
        const itemNode = cc.instantiate(this.templateNode);
        itemNode.name = `achievement_item_${config.id || index}`;
        itemNode.active = true;

        const state = this.getAchievementState(config);
        // this.updateIcon(itemNode, config.icon);
        this.setLabelText(itemNode, 'value', `${state.rewardGold}`);
        this.setLabelText(itemNode, 'name', config.name);
        this.setLabelText(itemNode, 'desc', `${config.desc} (${state.displayProgress}/${state.target})。`);
        this.updateButtonState(itemNode, config, state);

        return itemNode;
    }

    private updateIcon(itemNode: cc.Node, iconName: string) {
        const iconNode = this.findChildByName(itemNode, 'icon');
        if (!iconNode || !cc.isValid(iconNode)) {
            return;
        }

        const sprite = iconNode.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        if (!iconName) {
            return;
        }

        if (this.iconCache[iconName]) {
            sprite.spriteFrame = this.iconCache[iconName];
            return;
        }

        cc.loader.loadRes(`AImg/${iconName}`, cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset) {
                return;
            }

            this.iconCache[iconName] = asset;
            if (cc.isValid(sprite.node)) {
                sprite.spriteFrame = asset;
            }
        });
    }

    private preloadClaimedButtonSprite() {
        if (this.claimedButtonSpriteFrame) {
            return;
        }

        cc.loader.loadRes('ui_wgyxl/main/yilingqu', cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset) {
                console.warn('Achievement claimed button sprite load failed:', error);
                return;
            }

            this.claimedButtonSpriteFrame = asset;
            if (this.node && this.node.activeInHierarchy) {
                this.refreshView();
            }
        });
    }

    private updateButtonState(itemNode: cc.Node, config: AchievementConfig, state: AchievementState) {
        const buttonNode = this.findChildByName(itemNode, 'Button');
        if (!buttonNode || !cc.isValid(buttonNode)) {
            return;
        }

        const claimable = this.isAchievementClaimable(state);
        const button = buttonNode.getComponent(cc.Button);
        if (button) {
            button.enableAutoGrayEffect = true;
            button.interactable = claimable;
        }

        this.updateButtonSprite(buttonNode, button, state);
        this.updateButtonLabel(buttonNode, state);

        buttonNode.off(cc.Node.EventType.TOUCH_END);
        if (claimable) {
            buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.claimReward(config), this);
        }
    }

    private claimReward(config: AchievementConfig) {
        const state = this.getAchievementState(config);
        if (state.claimed) {
            TipsManager.show('该成就奖励已领取。');
            return;
        }

        if (!state.completed) {
            TipsManager.show('成就尚未达成。');
            return;
        }

        this.claimedMap[config.id] = true;
        this.saveClaimedData();

        if (state.rewardGold > 0) {
            mGameData.currentGold += state.rewardGold;
            mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }

        TipsManager.show(state.rewardGold > 0 ? `领取成功，获得${state.rewardGold}钻石。` : '领取成功。');
        this.refreshView();
    }

    private getAchievementState(config: AchievementConfig): AchievementState {
        const target = Math.max(0, Number(config.count) || 0);
        const progress = Math.max(0, this.getProgressValue(config.type));
        const displayProgress = target > 0 ? Math.min(progress, target) : progress;
        const claimed = !!this.claimedMap[config.id];

        return {
            progress,
            displayProgress,
            target,
            completed: target > 0 ? progress >= target : false,
            claimed,
            rewardGold: Math.max(0, Number(config.rewardGold) || 0),
        };
    }

    private getSortedAchievements(): AchievementConfig[] {
        return this.achievements.slice().sort((a, b) => {
            const stateA = this.getAchievementState(a);
            const stateB = this.getAchievementState(b);
            const weightA = this.getAchievementSortWeight(stateA);
            const weightB = this.getAchievementSortWeight(stateB);

            if (weightA !== weightB) {
                return weightA - weightB;
            }

            return a.id - b.id;
        });
    }

    private getAchievementSortWeight(state: AchievementState): number {
        if (this.isAchievementClaimable(state)) {
            return 0;
        }

        if (state.claimed) {
            return 2;
        }

        return 1;
    }

    private isAchievementClaimable(state: AchievementState): boolean {
        return state.completed && !state.claimed;
    }

    private getProgressValue(type: string | number): number {
        const typeValue = `${type}`.toLowerCase();

        switch (typeValue) {
            case '1':
            case 'level':
            case 'passlevel':
            case 'stage':
                return typeof (mGameData as any).getCompletedLevelCount === 'function'
                    ? (mGameData as any).getCompletedLevelCount()
                    : Math.max(0, (mGameData.unlockedLevel || 1) - 1);

            case '2':
            case 'time':
            case 'playtime':
            case 'minutes':
            case 'minute':
                return Math.max(
                    mGameData.getTotalOnlineMinutes ? mGameData.getTotalOnlineMinutes() : 0,
                    this.getStoredProgressValue(['AchievementPlayMinutes', 'TotalPlayMinutes', 'PlayMinutes'], 0)
                );

            case '3':
            case 'gold':
            case 'diamond':
            case 'rewardgold':
            case 'rewarddiamond':
                return this.getStoredProgressValue(['AchievementEarnGold', 'AchievementEarnDiamond', 'TotalEarnGold'], mGameData.currentGold || 0);

            case '4':
            case 'stamina':
            case 'usestamina':
            case 'consumestamina':
                return this.getStoredProgressValue(['AchievementConsumeStamina', 'TotalConsumeStamina', 'UsedStamina'], 0);

            case '5':
            case 'score':
            case 'bestscore':
                return mGameData.BestScore || 0;

            case '6':
            case 'role':
            case 'roles':
                return (mGameData.unlockedRoles || []).filter((item: boolean) => !!item).length;

            case '7':
            case 'star':
            case 'stars':
                return this.getTotalStars();

            default:
                return 0;
        }
    }

    private getStoredProgressValue(baseKeys: string[], fallbackValue: number): number {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const keys: string[] = [];

        for (let i = 0; i < baseKeys.length; i++) {
            const key = baseKeys[i];
            if (userId) {
                keys.push(LocalStorageKeys.userKey(key, userId));
            }
            keys.push(LocalStorageKeys.appKey(key));
        }

        for (let i = 0; i < keys.length; i++) {
            const raw = cc.sys.localStorage.getItem(keys[i]);
            if (!raw) {
                continue;
            }

            const value = Number(raw);
            if (!isNaN(value) && value >= 0) {
                return value;
            }
        }

        return Math.max(0, Number(fallbackValue) || 0);
    }

    private getTotalStars(): number {
        const totalLevels = typeof (mGameData as any).getTotalLevels === 'function'
            ? (mGameData as any).getTotalLevels()
            : (mGameData.unlockedLevel || 0);

        let totalStars = 0;
        for (let level = 1; level <= totalLevels; level++) {
            totalStars += mGameData.getLevelStars(level) || 0;
        }

        return totalStars;
    }

    private updateGoldLabel() {
        if (this.zs_num) {
            this.zs_num.string = `${mGameData.currentGold || 0}`;
        }
    }

    private onCloseClick() {
        this.node.active = false;
    }

    private updateButtonSprite(buttonNode: cc.Node, button: cc.Button, state: AchievementState) {
        if (!buttonNode || !button) {
            return;
        }

        const claimable = this.isAchievementClaimable(state);
        this.updateButtonBackgroundState(buttonNode, state);

        if (this.findChildByName(buttonNode, 'Background')) {
            this.updateButtonBackgroundGrayState(buttonNode, !claimable);
            return;
        }

        const sprite = this.getButtonSprite(buttonNode, button);
        if (!sprite) {
            return;
        }

        const buttonAny = button as any;
        const normalSprite = buttonAny.normalSprite as cc.SpriteFrame;
        const claimedSprite = this.claimedButtonSpriteFrame || buttonAny.disabledSprite as cc.SpriteFrame;
        const displaySprite = state.claimed && claimedSprite ? claimedSprite : normalSprite || sprite.spriteFrame;

        buttonAny.normalSprite = displaySprite;
        buttonAny.pressedSprite = displaySprite;
        buttonAny.hoverSprite = displaySprite;
        buttonAny.disabledSprite = displaySprite;

        sprite.spriteFrame = displaySprite;
        sprite.node.color = cc.Color.WHITE;
        sprite.setState(claimable ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
    }

    private updateButtonBackgroundState(buttonNode: cc.Node, state: AchievementState) {
        const background = this.findChildByName(buttonNode, 'Background');
        const background1 = this.findChildByName(buttonNode, 'Background1');
        const background2 = this.findChildByName(buttonNode, 'Background2');
        const claimable = this.isAchievementClaimable(state);

        if (background) {
            background.active = claimable;
        }

        if (background1) {
            background1.active = !!state.claimed;
        }

        if (background2) {
            background2.active = !state.claimed && !claimable;
        }
    }

    /**
     * The achievement prefab uses separate background nodes for each state, so
     * Button.enableAutoGrayEffect cannot gray the visible child sprite itself.
     */
    private updateButtonBackgroundGrayState(buttonNode: cc.Node, isGray: boolean) {
        const backgroundNames = ['Background', 'Background1', 'Background2'];
        const spriteState = isGray ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL;
        const spriteColor = isGray ? cc.color(124, 124, 124, 255) : cc.Color.WHITE;

        backgroundNames.forEach((backgroundName) => {
            const backgroundNode = this.findChildByName(buttonNode, backgroundName);
            if (!backgroundNode || !cc.isValid(backgroundNode)) {
                return;
            }

            const sprite = backgroundNode.getComponent(cc.Sprite);
            if (sprite) {
                sprite.setState(spriteState);
                // Keep an explicit disabled tint as a fallback for projects
                // where the built-in gray material is not available.
                sprite.node.color = spriteColor;
            }
        });
    }

    private updateButtonLabel(buttonNode: cc.Node, state: AchievementState) {
        const existingLabel = this.findFirstLabel(buttonNode);
        const labelNode = existingLabel
            ? existingLabel.node
            : this.findChildByName(buttonNode, 'Label');
        if (!labelNode || !cc.isValid(labelNode)) {
            return;
        }

        // The claimed background already contains the “已领取” copy. Other
        // states use the Label node, including the gray unavailable state.
        labelNode.active = !state.claimed;
        if (state.claimed) {
            return;
        }

        // Older AchievementPanel prefabs contain an empty Label node. Create
        // the component at runtime so the state text is still rendered.
        const label = existingLabel || labelNode.addComponent(cc.Label);
        label.string = '领取';
        label.fontSize = 24;
        label.lineHeight = 28;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.node.color = cc.color(255, 255, 255);
    }

    private setLabelText(root: cc.Node, nodeName: string, text: string) {
        const label = this.findLabelByName(root, nodeName);
        if (label) {
            label.string = text;
        }
    }

    private getButtonSprite(buttonNode: cc.Node, button: cc.Button): cc.Sprite | null {
        const targetNode = (button as any).target as cc.Node;
        if (targetNode) {
            const targetSprite = targetNode.getComponent(cc.Sprite);
            if (targetSprite) {
                return targetSprite;
            }
        }

        const selfSprite = buttonNode.getComponent(cc.Sprite);
        if (selfSprite) {
            return selfSprite;
        }

        return this.findFirstSprite(buttonNode);
    }

    private findFirstLabel(root: cc.Node): cc.Label | null {
        if (!root || !cc.isValid(root)) {
            return null;
        }

        const label = root.getComponent(cc.Label);
        if (label) {
            return label;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const childLabel = this.findFirstLabel(root.children[i]);
            if (childLabel) {
                return childLabel;
            }
        }

        return null;
    }

    private findFirstSprite(root: cc.Node): cc.Sprite | null {
        if (!root || !cc.isValid(root)) {
            return null;
        }

        const sprite = root.getComponent(cc.Sprite);
        if (sprite) {
            return sprite;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const childSprite = this.findFirstSprite(root.children[i]);
            if (childSprite) {
                return childSprite;
            }
        }

        return null;
    }

    private findLabelByName(root: cc.Node, nodeName: string): cc.Label | null {
        const node = this.findChildByName(root, nodeName);
        if (!node || !cc.isValid(node)) {
            return null;
        }

        return node.getComponent(cc.Label);
    }

    private findChildByName(root: cc.Node, nodeName: string): cc.Node | null {
        if (!root || !cc.isValid(root)) {
            return null;
        }

        if (root.name === nodeName) {
            return root;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const result = this.findChildByName(root.children[i], nodeName);
            if (result) {
                return result;
            }
        }

        return null;
    }
}
