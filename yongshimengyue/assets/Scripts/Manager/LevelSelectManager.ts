const { ccclass, property } = cc._decorator;

import mGameData from '../Data/GameData';
import TipsManager from './TipsManager';
import UIHelp from '../../script/common/utils/UIHelp';
import ResUtils from '../../script/common/utils/ResUtils';
import GameController from '../../script/gameframe/GameController';
import UIFrame from '../../script/gameframe/logic/ui/prefab/UIFrame';
import { ViewZorder } from '../../script/common/const/ViewZOrder';
import LocalStorageKeys from '../Data/LocalStorageKeys';

interface LevelMapConfig {
    mapId: number;
    mapIcon: number;
    levelId: string;
    levelName: string;
}

interface HeroSelectConfig {
    id: number;
    name: string;
    res: string;
}

@ccclass
export default class LevelSelectManager extends cc.Component {
    @property(cc.ScrollView)
    levelScrollView: cc.ScrollView = null;

    @property(cc.Node)
    levelContainer: cc.Node = null;

    @property(cc.SpriteFrame)
    starFull: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    starEmpty: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked3: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked4: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked5: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    levelUnlocked6: cc.SpriteFrame = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    itemsPerRow: number = 1;
    horizontalSpacing: number = 0;
    verticalSpacing: number = 20;
    leftPadding: number = 0;
    topPadding: number = 20;

    private mapConfigs: LevelMapConfig[] = [];
    private stageSpriteCache: { [key: string]: cc.SpriteFrame } = {};
    private levelItemTemplate: cc.Node = null;
    private heroConfigs: HeroSelectConfig[] = [];
    private heroIconCache: { [key: string]: cc.SpriteFrame } = {};
    private upNode: cc.Node = null;
    private downNode: cc.Node = null;
    private upSlots: cc.Node[] = [];
    private downSlots: cc.Node[] = [];
    private selectedHeroIds: number[] = [];
    private startBtn: cc.Node = null;
    private selectedLevel: number = 0;
    private levelItemNodes: { [key: number]: cc.Node } = {};

    onLoad() {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        this.levelItemTemplate = this.getLevelItemTemplate();
        if (this.levelItemTemplate) {
            this.levelItemTemplate.active = false;
        }
        this.cacheHeroSelectNodes();
        this.cacheStartButton();
        this.loadLevelConfigs();
        this.loadHeroConfigs();
    }

    onEnable() {
        cc.director.on('levelUpdated', this.refreshLevelList, this);
        cc.director.on('goldUpdated', this.refreshHeroSelection, this);
        cc.director.on('trainUnlocked', this.refreshHeroSelection, this);
        this.refreshLevelList();
        this.refreshHeroSelection();
    }

    onDisable() {
        cc.director.off('levelUpdated', this.refreshLevelList, this);
        cc.director.off('goldUpdated', this.refreshHeroSelection, this);
        cc.director.off('trainUnlocked', this.refreshHeroSelection, this);
    }

    onDestroy() {
        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        if (this.startBtn) {
            this.startBtn.off(cc.Node.EventType.TOUCH_END, this.onStartBtnClick, this);
        }

        cc.director.off('levelUpdated', this.refreshLevelList, this);
        cc.director.off('goldUpdated', this.refreshHeroSelection, this);
        cc.director.off('trainUnlocked', this.refreshHeroSelection, this);
        this.unbindHeroSelectionSlots();
    }

    private loadLevelConfigs() {
        const loadedConfig = cc.resources.get('config/levels', cc.JsonAsset) as cc.JsonAsset;
        if (loadedConfig && loadedConfig.json) {
            this.applyLevelConfigs(loadedConfig.json);
            return;
        }

        cc.resources.load('config/levels', cc.JsonAsset, (err: Error, asset: cc.JsonAsset) => {
            if (err || !asset || !asset.json) {
                console.error('LevelSelect levels load failed:', err);
                this.mapConfigs = [];
                this.initLevelList();
                return;
            }

            this.applyLevelConfigs(asset.json);
        });
    }

    private applyLevelConfigs(configJson: any) {
        const levelList = Array.isArray(configJson && configJson.levels) ? configJson.levels : [];
        this.mapConfigs = levelList.map((item: any, index: number) => ({
            mapId: this.parseLevelNumber(item, index),
            mapIcon: Math.max(1, Number(item && (item.mapIcon || item.map_icon || item.stage_icon)) || ((index % 5) + 1)),
            levelId: String(item && item.level_id || `L${index + 1}`),
            levelName: String(item && item.level_name || ""),
        }));
        this.initLevelList();
    }

    private loadHeroConfigs() {
        this.heroConfigs = [
            { id: 1, name: '神圣公主', res: '' },
            { id: 2, name: '皇家护卫', res: '' },
        ];
        this.refreshHeroSelection();
    }

    private applyHeroConfigs(configJson: any) {
        const heroList = Array.isArray(configJson && configJson.heroes) ? configJson.heroes : [];
        this.heroConfigs = heroList
            .map((item: any) => ({
                id: Number(item && item.id) || 0,
                name: String(item && item.name || ''),
                res: String(item && item.res || ''),
            }))
            .filter((item: HeroSelectConfig) => item.id > 0)
            .sort((a: HeroSelectConfig, b: HeroSelectConfig) => a.id - b.id);
        this.refreshHeroSelection();
    }

    private cacheHeroSelectNodes() {
        const searchRoot = this.getHeroSelectSearchRoot();
        this.upNode = this.findNodeDeep(searchRoot, 'upNode');
        this.downNode = this.findNodeDeep(searchRoot, 'downNode');
        this.upSlots = this.collectHeroSlots(this.upNode);
        this.downSlots = this.collectHeroSlots(this.downNode);
        this.hideHeroSlots(this.upSlots);
        this.hideHeroSlots(this.downSlots);
        cc.log('[LevelSelect] hero select nodes:', {
            root: searchRoot ? searchRoot.name : null,
            upNode: this.upNode ? this.upNode.name : null,
            downNode: this.downNode ? this.downNode.name : null,
            upSlots: this.upSlots.map((item: cc.Node) => item.name).join(','),
            downSlots: this.downSlots.map((item: cc.Node) => item.name).join(','),
        });
    }

    private getHeroSelectSearchRoot(): cc.Node {
        if (!this.node || !this.node.isValid) {
            return null;
        }

        if (this.node.name === 'LevelSelectPanel') {
            return this.node;
        }

        const panelInChildren = this.findNodeDeep(this.node, 'LevelSelectPanel');
        if (panelInChildren) {
            return panelInChildren;
        }

        let parent = this.node.parent;
        while (parent && parent.isValid) {
            if (parent.name === 'LevelSelectPanel') {
                return parent;
            }

            const panel = this.findNodeDeep(parent, 'LevelSelectPanel');
            if (panel) {
                return panel;
            }
            parent = parent.parent;
        }

        return this.node;
    }

    private findNodeDeep(root: cc.Node, nodeName: string): cc.Node {
        if (!root || !root.isValid) {
            return null;
        }

        if (root.name === nodeName) {
            return root;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findNodeDeep(root.children[i], nodeName);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private cacheStartButton() {
        const searchRoot = this.getHeroSelectSearchRoot();
        this.startBtn = this.findNodeDeep(searchRoot, 'Btn');
        if (!this.startBtn) {
            cc.warn('[LevelSelect] start Btn not found.');
            return;
        }

        this.startBtn.off(cc.Node.EventType.TOUCH_END, this.onStartBtnClick, this);
        this.startBtn.on(cc.Node.EventType.TOUCH_END, this.onStartBtnClick, this);
        cc.log('[LevelSelect] start Btn bound:', this.startBtn.name);
    }

    private collectHeroSlots(root: cc.Node): cc.Node[] {
        if (!root || !root.isValid) {
            return [];
        }

        return root.children
            .filter((child: cc.Node) => !!child && child.isValid && /^item\d+$/i.test(child.name))
            .sort((a: cc.Node, b: cc.Node) => this.getSlotIndex(a) - this.getSlotIndex(b));
    }

    private getSlotIndex(node: cc.Node): number {
        const match = node && node.name ? node.name.match(/\d+/) : null;
        return match ? Number(match[0]) || 0 : 0;
    }

    private hideHeroSlots(slots: cc.Node[]) {
        for (let i = 0; i < slots.length; i++) {
            slots[i].active = false;
            slots[i].off(cc.Node.EventType.TOUCH_END);
        }
    }

    private unbindHeroSelectionSlots() {
        const slots = this.upSlots.concat(this.downSlots);
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] && slots[i].isValid) {
                slots[i].off(cc.Node.EventType.TOUCH_END);
            }
        }
    }

    private refreshHeroSelection() {
        if (!this.node || !this.node.isValid) {
            return;
        }

        if (!this.upNode || !this.downNode) {
            this.cacheHeroSelectNodes();
        }

        if (!this.heroConfigs.length || !this.upSlots.length || !this.downSlots.length) {
            return;
        }

        this.selectedHeroIds = this.getStoredSelectedHeroIds();
        const selectedHeroes = this.getSelectedHeroConfigs();
        const availableHeroes = this.getAvailableHeroConfigs();
        this.logHeroSelectionState(selectedHeroes, availableHeroes);
        this.renderHeroSlotList(this.upSlots, selectedHeroes, true);
        this.renderHeroSlotList(this.downSlots, availableHeroes, false);
    }

    private getStoredSelectedHeroIds(): number[] {
        const unlockedIds = this.getOwnedHeroIds();
        const raw = cc.sys.localStorage.getItem(this.getSelectedHeroStorageKey())
            || cc.sys.localStorage.getItem(LocalStorageKeys.appKey('LevelSelectBattleHeroIds'));
        let savedIds: number[] = [];

        if (raw) {
            try {
                savedIds = JSON.parse(raw) || [];
            } catch (error) {
                savedIds = [];
            }
        }

        const normalizedIds = savedIds
            .map((item: any) => Number(item) || 0)
            .filter((id: number, index: number, array: number[]) => (
                id > 0
                && unlockedIds.indexOf(id) >= 0
                && this.getHeroConfigById(id) != null
                && array.indexOf(id) === index
            ))
            .slice(0, this.upSlots.length);

        if (normalizedIds.length !== savedIds.length || raw == null) {
            this.storeSelectedHeroIds(normalizedIds);
        }

        return normalizedIds;
    }

    private getOwnedHeroIds(): number[] {
        const result: number[] = [];
        for (let i = 0; i < this.heroConfigs.length; i++) {
            const heroId = this.heroConfigs[i].id;
            if (this.isHeroOwned(heroId) && result.indexOf(heroId) < 0) {
                result.push(heroId);
            }
        }

        if (result.indexOf(1) < 0) {
            result.unshift(1);
        }

        return result.sort((a: number, b: number) => a - b);
    }

    private isHeroOwned(heroId: number): boolean {
        const id = Math.max(1, Number(heroId) || 1);
        if (id === 1) {
            return true;
        }

        if (typeof (mGameData as any).getUnlockedTrainIds === 'function') {
            const ids = (mGameData as any).getUnlockedTrainIds();
            if (Array.isArray(ids) && ids.indexOf(id) >= 0) {
                return true;
            }
        }

        if (typeof (mGameData as any).isTrainUnlocked === 'function' && (mGameData as any).isTrainUnlocked(id)) {
            return true;
        }

        const result: number[] = [];
        this.appendHeroIds(result, this.readNumberArrayStorage('UnlockedTrainIds'));
        this.appendHeroIds(result, this.readNumberArrayStorage('LevelSelectOwnedHeroIds'));
        this.appendHeroIds(result, this.readNumberArrayStorage('OwnedHeroIds'));
        this.appendHeroIds(result, this.readNumberArrayStorage('TrainUnlockedIds'));
        this.appendHeroIds(result, this.readNumberArrayStorage('HeroUnlockedIds'));
        this.appendHeroIds(result, this.readNumberArrayStorage('UnlockedHeroIds'));
        this.appendHeroIds(result, this.readUnlockedRoleIds());
        this.appendHeroIds(result, this.readRuntimeUnlockedRoleIds());
        this.appendHeroIds(result, [
            this.readNumberStorage('CurrentTrainId'),
            this.readNumberStorage('CurrentKingId'),
        ]);

        return result.indexOf(id) >= 0;
    }

    private appendHeroIds(output: number[], ids: any) {
        if (!Array.isArray(ids)) {
            return;
        }

        for (let i = 0; i < ids.length; i++) {
            const id = Number(ids[i]) || 0;
            if (id > 0 && output.indexOf(id) < 0) {
                output.push(id);
            }
        }
    }

    private readNumberArrayStorage(baseKey: string): number[] {
        const values: number[] = [];
        const rawValues = this.getStorageValues(baseKey);
        for (let i = 0; i < rawValues.length; i++) {
            const raw = rawValues[i];
            if (!raw) {
                continue;
            }

            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.appendHeroIds(values, parsed);
                    continue;
                }
            } catch (error) {
                // Fall through to comma-separated parsing.
            }

            this.appendHeroIds(values, String(raw).split(','));
        }
        return values;
    }

    private readUnlockedRoleIds(): number[] {
        const result: number[] = [];
        const rawValues = this.getStorageValues('UnlockedRoles');
        for (let i = 0; i < rawValues.length; i++) {
            const raw = rawValues[i];
            if (!raw) {
                continue;
            }

            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    for (let index = 0; index < parsed.length; index++) {
                        if (parsed[index]) {
                            result.push(index + 1);
                        }
                    }
                }
            } catch (error) {
                // Ignore malformed old role data.
            }
        }
        return result;
    }

    private readRuntimeUnlockedRoleIds(): number[] {
        const roles = (mGameData as any).unlockedRoles;
        const result: number[] = [];
        if (!Array.isArray(roles)) {
            return result;
        }

        for (let i = 0; i < roles.length; i++) {
            if (roles[i]) {
                result.push(i + 1);
            }
        }
        return result;
    }

    private readNumberStorage(baseKey: string): number {
        const rawValues = this.getStorageValues(baseKey);
        for (let i = 0; i < rawValues.length; i++) {
            const value = Number(rawValues[i]) || 0;
            if (value > 0) {
                return value;
            }
        }
        return 0;
    }

    private getStorageValues(baseKey: string): string[] {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const keys = [
            LocalStorageKeys.userKey(baseKey, userId),
            LocalStorageKeys.appKey(baseKey),
            baseKey,
        ];
        const values: string[] = [];
        for (let i = 0; i < keys.length; i++) {
            const raw = cc.sys.localStorage.getItem(keys[i]);
            if (raw && values.indexOf(raw) < 0) {
                values.push(raw);
            }
        }
        return values;
    }

    private getSelectedHeroConfigs(): HeroSelectConfig[] {
        const result: HeroSelectConfig[] = [];
        for (let i = 0; i < this.selectedHeroIds.length; i++) {
            const config = this.getHeroConfigById(this.selectedHeroIds[i]);
            if (config) {
                result.push(config);
            }
        }
        return result;
    }

    private getAvailableHeroConfigs(): HeroSelectConfig[] {
        const unlockedIds = this.getOwnedHeroIds();
        return this.heroConfigs.filter((config: HeroSelectConfig) => (
            unlockedIds.indexOf(config.id) >= 0
            && this.selectedHeroIds.indexOf(config.id) < 0
        ));
    }

    private logHeroSelectionState(selectedHeroes: HeroSelectConfig[], availableHeroes: HeroSelectConfig[]) {
        const ownedIds = this.getOwnedHeroIds();
        const ownedHeroes = ownedIds
            .map((id: number) => this.getHeroConfigById(id))
            .filter((config: HeroSelectConfig) => !!config);
        cc.log('[LevelSelect] owned heroes:', ownedHeroes.map((hero: HeroSelectConfig) => `${hero.id}:${hero.name}`).join(', '));
        cc.log('[LevelSelect] selected heroes:', selectedHeroes.map((hero: HeroSelectConfig) => `${hero.id}:${hero.name}`).join(', '));
        cc.log('[LevelSelect] downNode heroes:', availableHeroes.map((hero: HeroSelectConfig) => `${hero.id}:${hero.name}`).join(', '));
    }

    private getHeroConfigById(id: number): HeroSelectConfig | null {
        for (let i = 0; i < this.heroConfigs.length; i++) {
            if (this.heroConfigs[i].id === id) {
                return this.heroConfigs[i];
            }
        }
        return null;
    }

    private renderHeroSlotList(slots: cc.Node[], configs: HeroSelectConfig[], selectedList: boolean) {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const config = configs[i] || null;
            if (!slot || !slot.isValid) {
                continue;
            }

            slot.off(cc.Node.EventType.TOUCH_END);
            slot.active = !!config;
            if (!config) {
                continue;
            }

            this.applyHeroSlot(slot, config);
            if (selectedList) {
                slot.on(cc.Node.EventType.TOUCH_END, () => this.takeOffHero(config.id), this);
            } else {
                slot.on(cc.Node.EventType.TOUCH_END, () => this.selectHero(config.id), this);
            }
        }
    }

    private applyHeroSlot(slot: cc.Node, config: HeroSelectConfig) {
        const tipLabel = this.getHeroSlotLabel(slot);
        if (tipLabel) {
            tipLabel.string = config.name || `${config.id}`;
        }

        const iconSprite = this.getHeroSlotIcon(slot);
        if (!iconSprite) {
            return;
        }

        const iconPath = `subgame:ui_wgyzt/juese/role_${config.id}`;
        if (this.heroIconCache[iconPath]) {
            iconSprite.spriteFrame = this.heroIconCache[iconPath];
            return;
        }

        const cached = ResUtils.getAsset<cc.SpriteFrame>(iconPath, cc.SpriteFrame);
        if (cached) {
            this.heroIconCache[iconPath] = cached;
            iconSprite.spriteFrame = cached;
            return;
        }

        ResUtils.loadAsset<cc.SpriteFrame>(iconPath, cc.SpriteFrame, (err: Error, asset: cc.SpriteFrame) => {
            if (err || !asset || !slot || !slot.isValid) {
                console.error('LevelSelect hero icon load failed:', iconPath, err);
                return;
            }

            this.heroIconCache[iconPath] = asset;
            const currentSprite = this.getHeroSlotIcon(slot);
            if (currentSprite && cc.isValid(currentSprite.node)) {
                currentSprite.spriteFrame = asset;
            }
        });
    }

    private getHeroSlotLabel(slot: cc.Node): cc.Label | null {
        const tipNode = slot ? slot.getChildByName('Tip') : null;
        return tipNode ? tipNode.getComponent(cc.Label) : null;
    }

    private getHeroSlotIcon(slot: cc.Node): cc.Sprite | null {
        const iconNode = slot ? slot.getChildByName('Icon') : null;
        return iconNode ? iconNode.getComponent(cc.Sprite) : null;
    }

    private selectHero(heroId: number) {
        if (this.selectedHeroIds.indexOf(heroId) >= 0) {
            return;
        }

        if (this.selectedHeroIds.length >= this.upSlots.length) {
            TipsManager.show('出战英雄已满。');
            return;
        }

        this.selectedHeroIds.push(heroId);
        this.storeSelectedHeroIds(this.selectedHeroIds);
        this.refreshHeroSelection();
    }

    private takeOffHero(heroId: number) {
        const index = this.selectedHeroIds.indexOf(heroId);
        if (index < 0) {
            return;
        }

        this.selectedHeroIds.splice(index, 1);
        this.storeSelectedHeroIds(this.selectedHeroIds);
        this.refreshHeroSelection();
    }

    private storeSelectedHeroIds(heroIds: number[]) {
        const normalizedIds = heroIds
            .map((item: any) => Number(item) || 0)
            .filter((id: number, index: number, array: number[]) => id > 0 && array.indexOf(id) === index)
            .slice(0, this.upSlots.length);
        cc.sys.localStorage.setItem(this.getSelectedHeroStorageKey(), JSON.stringify(normalizedIds));
        cc.sys.localStorage.setItem(LocalStorageKeys.appKey('LevelSelectBattleHeroIds'), JSON.stringify(normalizedIds));
    }

    private getSelectedHeroStorageKey(): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        return LocalStorageKeys.userKey('LevelSelectBattleHeroIds', userId);
    }

    private parseLevelNumber(item: any, index: number): number {
        const direct = Number(item && (item.mapId || item.level || item.level_num));
        if (direct > 0) {
            return direct;
        }

        const levelId = String(item && item.level_id || "");
        const match = levelId.match(/\d+/);
        return match ? Math.max(1, parseInt(match[0], 10) || (index + 1)) : (index + 1);
    }

    private refreshLevelList() {
        if (!this.node || !this.node.isValid) {
            return;
        }

        mGameData.GetLevelData();

        if (this.mapConfigs.length <= 0) {
            return;
        }

        this.initLevelList();
    }

    initLevelList() {
        let container = this.levelContainer;
        if (this.levelScrollView) {
            container = this.levelScrollView.content;
        }

        const itemTemplate = this.getLevelItemTemplate();
        if (!container || !itemTemplate) {
            console.error('LevelSelect container or Item template is missing.');
            return;
        }

        this.clearLevelItems(container, itemTemplate);
        itemTemplate.active = false;
        this.levelItemNodes = {};

        const totalLevels = this.mapConfigs.length > 0
            ? this.mapConfigs.length
            : mGameData.getTotalLevels();
        this.ensureSelectedLevel(totalLevels);

        for (let i = 1; i <= totalLevels; i++) {
            const levelItem = cc.instantiate(itemTemplate);
            levelItem.name = `LevelItem${i}`;
            levelItem.active = true;
            container.addChild(levelItem);
            this.levelItemNodes[i] = levelItem;
            this.setupLevelItem(levelItem, i);
        }
        this.refreshSelectedLevelState();

        if (this.levelScrollView) {
            this.updateScrollViewContentSize();
            this.scheduleOnce(() => this.scrollToCurrentLevel(), 0);
        }
    }

    private getLevelItemTemplate(): cc.Node {
        if (this.levelItemTemplate && this.levelItemTemplate.isValid) {
            return this.levelItemTemplate;
        }

        this.levelItemTemplate = this.node ? this.node.getChildByName('Item') : null;
        if (this.levelItemTemplate) {
            return this.levelItemTemplate;
        }

        return null;
    }

    private clearLevelItems(container: cc.Node, itemTemplate: cc.Node) {
        const children = container.children.slice();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child === itemTemplate) {
                continue;
            }
            child.off(cc.Node.EventType.TOUCH_END);
            child.destroy();
        }
    }

    updateScrollViewContentSize() {
        if (!this.levelScrollView || !this.levelScrollView.content) {
            return;
        }

        const content = this.levelScrollView.content;
        const children = content.children;
        const view = this.levelScrollView.node.getChildByName('view');
        if (!view) {
            return;
        }

        const layout = content.getComponent(cc.Layout);
        if (layout) {
            this.updateLayoutContent(content, layout, view);
            return;
        }

        if (children.length === 0) {
            return;
        }

        const item = children[0];
        const itemWidth = item.width;
        const itemHeight = item.height;
        const totalColumns = Math.max(1, Math.min(this.itemsPerRow, children.length));
        const totalRows = Math.ceil(children.length / totalColumns);
        const rowWidth = totalColumns * itemWidth + (totalColumns - 1) * this.horizontalSpacing;
        const totalHeight = totalRows * itemHeight + (totalRows - 1) * this.verticalSpacing + this.topPadding;

        content.width = Math.max(view.width, rowWidth);
        content.height = Math.max(view.height, totalHeight);
        content.anchorX = 0.5;
        content.anchorY = 1;
        content.x = 0;
        content.y = this.getScrollContentTopY(view);

        const singleColumn = totalColumns <= 1;
        const startX = singleColumn ? 0 : -rowWidth / 2 + itemWidth / 2;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.anchorX = 0.5;
            child.anchorY = 0.5;

            const row = Math.floor(i / totalColumns);
            const col = i % totalColumns;
            child.x = singleColumn ? 0 : startX + col * (itemWidth + this.horizontalSpacing);
            child.y = -(this.topPadding + row * (itemHeight + this.verticalSpacing) + itemHeight / 2);
        }

        this.scrollToCurrentLevel();
    }

    private updateLayoutContent(content: cc.Node, layout: cc.Layout, view: cc.Node) {
        const children = content.children;
        const itemWidth = children.length > 0 ? children[0].width : 0;
        const totalColumns = Math.max(1, Math.min(this.itemsPerRow, Math.max(1, children.length)));
        const rowWidth = totalColumns * itemWidth + (totalColumns - 1) * this.horizontalSpacing;
        const horizontalPadding = Math.max(this.leftPadding, Math.floor((view.width - rowWidth) / 2));

        content.anchorX = 0.5;
        content.anchorY = 1;
        content.x = 0;
        content.y = this.getScrollContentTopY(view);
        content.width = view.width;
        content.height = Math.max(view.height, content.height);

        layout.type = cc.Layout.Type.GRID;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.startAxis = cc.Layout.AxisDirection.HORIZONTAL;
        layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
        layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;

        const layoutAny = layout as any;
        if (cc.Layout && (cc.Layout as any).Constraint && typeof (cc.Layout as any).Constraint.FIXED_COL !== 'undefined') {
            layoutAny.constraint = (cc.Layout as any).Constraint.FIXED_COL;
        } else {
            layoutAny.constraint = 0;
        }
        layout.constraintNum = Math.max(1, this.itemsPerRow);
        layout.spacingX = this.horizontalSpacing;
        layout.spacingY = this.verticalSpacing;
        layout.paddingTop = this.topPadding;
        layout.paddingBottom = 0;
        layout.paddingLeft = horizontalPadding;
        layout.paddingRight = horizontalPadding;
        layout.affectedByScale = false;

        layout.updateLayout();

        if (content.height < view.height) {
            content.height = view.height;
        }

        this.scrollToCurrentLevel();
    }

    private getScrollContentTopY(view: cc.Node): number {
        if (!view || !view.isValid) {
            return 0;
        }

        return view.height * (1 - view.anchorY);
    }

    setupLevelItem(levelItem: cc.Node, level: number) {
        const levelNumber = levelItem.getChildByName('LevelNumber')
            ? levelItem.getChildByName('LevelNumber').getComponent(cc.Label)
            : null;
        const levelBg = this.getLevelBackgroundSprite(levelItem);
        const suoBg = levelItem.getChildByName('suoBg')
            ? levelItem.getChildByName('suoBg').getComponent(cc.Sprite)
            : null;
        const starsContainer = levelItem.getChildByName('starNode') || levelItem.getChildByName('StarNode');
        const starsRoot = starsContainer || levelItem;
        const star1 = starsRoot ? starsRoot.getChildByName('star1') : null;
        const star2 = starsRoot ? starsRoot.getChildByName('star2') : null;
        const star3 = starsRoot ? starsRoot.getChildByName('star3') : null;
        const star1Gray = starsRoot ? starsRoot.getChildByName('star1_gray') : null;
        const star2Gray = starsRoot ? starsRoot.getChildByName('star2_gray') : null;
        const star3Gray = starsRoot ? starsRoot.getChildByName('star3_gray') : null;
        const mapConfig = this.getMapConfigByLevel(level);

        const displayLevel = mapConfig
            ? Number(mapConfig.mapId)
            : level;

        if (levelNumber) {
            levelNumber.string = `第${displayLevel}关`;
        }

        const isUnlocked = this.isLevelUnlocked(level);
        if (levelBg) {
            this.applyStagePreview(levelBg, mapConfig);
        }

        if (suoBg) {
            suoBg.node.active = !isUnlocked;
        }

        const stars = Math.max(0, Math.min(mGameData.getLevelStars(level) || 0, 3));
        const hasStars = stars > 0;
        if (starsContainer) {
            starsContainer.active = hasStars;
        }
        if (star1) {
            star1.active = hasStars && stars >= 1;
        }
        if (star2) {
            star2.active = hasStars && stars >= 2;
        }
        if (star3) {
            star3.active = hasStars && stars >= 3;
        }
        if (star1Gray) {
            star1Gray.active = hasStars && stars < 1;
        }
        if (star2Gray) {
            star2Gray.active = hasStars && stars < 2;
        }
        if (star3Gray) {
            star3Gray.active = hasStars && stars < 3;
        }

        levelItem.off(cc.Node.EventType.TOUCH_END);
        if (isUnlocked) {
            levelItem.on(cc.Node.EventType.TOUCH_END, () => {
                this.selectLevel(level);
                this.startSelectedLevel();
            }, this);
        } else {
            levelItem.on(cc.Node.EventType.TOUCH_END, () => TipsManager.show('当前关卡未解锁。'), this);
        }
    }

    isLevelUnlocked(level: number): boolean {
        return mGameData.isLevelUnlocked(level);
    }

    private selectLevel(level: number) {
        if (!this.isLevelUnlocked(level)) {
            TipsManager.show('当前关卡未解锁。');
            return;
        }

        this.selectedLevel = Math.max(1, Number(level) || 1);
        this.refreshSelectedLevelState();
        cc.log('[LevelSelect] selected level:', this.selectedLevel);
    }

    private refreshSelectedLevelState() {
        const keys = Object.keys(this.levelItemNodes);
        for (let i = 0; i < keys.length; i++) {
            const level = Number(keys[i]) || 0;
            const item = this.levelItemNodes[level];
            const selectBg = this.getLevelSelectBg(item);
            if (selectBg) {
                selectBg.active = level === this.selectedLevel;
            }
        }
    }

    private getLevelSelectBg(levelItem: cc.Node): cc.Node {
        if (!levelItem || !levelItem.isValid) {
            return null;
        }

        return levelItem.getChildByName('SelectlBg')
            || levelItem.getChildByName('SelectBg')
            || levelItem.getChildByName('SelectedBg')
            || levelItem.getChildByName('xuanzhong');
    }

    private ensureSelectedLevel(totalLevels: number) {
        const maxLevel = Math.max(1, Number(totalLevels) || 1);
        let level = Math.max(1, Math.min(maxLevel, Number(this.selectedLevel) || 0));
        if (level > 0 && this.isLevelUnlocked(level)) {
            this.selectedLevel = level;
            return;
        }

        level = Math.max(1, Math.min(maxLevel, Number(mGameData.currentLevel) || Number(mGameData.unlockedLevel) || 1));
        if (this.isLevelUnlocked(level)) {
            this.selectedLevel = level;
            return;
        }

        for (let i = maxLevel; i >= 1; i--) {
            if (this.isLevelUnlocked(i)) {
                this.selectedLevel = i;
                return;
            }
        }

        this.selectedLevel = 1;
    }

    private onStartBtnClick() {
        this.startSelectedLevel();
    }

    private startSelectedLevel() {
        const level = Math.max(1, Number(this.selectedLevel) || 1);
        if (!this.isLevelUnlocked(level)) {
            TipsManager.show('请选择已解锁关卡。');
            return;
        }

        if (!mGameData.HasEnoughStamina()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }

        mGameData.ConsumeStamina();
        mGameData.currentLevel = level;
        mGameData.SaveLevelData();
        GameController.refreshCurrentConfig(level);
        mGameData.initLevelGame();

        UIHelp.ShowUI(UIFrame, ViewZorder.Float, (ui: any) => {
            this.onBackClick();
            ui && ui.StartGame && ui.StartGame();
        });
    }

    onBackClick() {
        this.node.active = false;
    }

    private getMapConfigByLevel(level: number): LevelMapConfig | null {
        if (!this.mapConfigs || this.mapConfigs.length <= 0) {
            return null;
        }

        return this.mapConfigs[level - 1] || null;
    }

    private getLevelBackgroundSprite(levelItem: cc.Node): cc.Sprite | null {
        const levelBgNode = levelItem.getChildByName('LevelBg') || levelItem.getChildByName('LevelB');
        return levelBgNode ? levelBgNode.getComponent(cc.Sprite) : null;
    }

    private applyStagePreview(targetSprite: cc.Sprite, mapConfig: LevelMapConfig | null) {
        if (!targetSprite || !cc.isValid(targetSprite.node) || !mapConfig) {
            return;
        }

        const mapIcon = Math.max(1, Number(mapConfig.mapIcon) || 1);
        const paths = this.getStagePreviewPaths(mapIcon);
        const assetPath = paths[0];

        if (this.stageSpriteCache[assetPath]) {
            targetSprite.spriteFrame = this.stageSpriteCache[assetPath];
            return;
        }

        const loaded = this.getLoadedStagePreview(paths);
        if (loaded) {
            this.stageSpriteCache[assetPath] = loaded;
            targetSprite.spriteFrame = loaded;
            return;
        }

        (targetSprite.node as any).__levelStagePreviewPath = assetPath;
        this.loadStagePreviewByPaths(paths, 0, targetSprite, assetPath);
    }

    private getStagePreviewPaths(mapIcon: number): string[] {
        const icon = Math.max(1, Math.min(5, Number(mapIcon) || 1));
        return [
            `subgame:ui_ysmy/main/guanqiapeitu${icon}/spriteFrame`,
            `subgame:ui_ysmy/main/guanqiapeitu${icon}`,
            `subgame:ui_wgyzt/main/stage/peitu${icon}/spriteFrame`,
            `subgame:ui_wgyzt/main/stage/peitu${icon}`,
            `subgame:ui_wgyxl/main/stage/guanqiapeitu${icon}/spriteFrame`,
            `subgame:ui_wgyxl/main/stage/guanqiapeitu${icon}`,
        ];
    }

    private getLoadedStagePreview(paths: string[]): cc.SpriteFrame | null {
        for (let i = 0; i < paths.length; i++) {
            const loaded = ResUtils.getAsset<cc.SpriteFrame>(paths[i], cc.SpriteFrame);
            if (loaded) {
                return loaded;
            }
        }
        return null;
    }

    private loadStagePreviewByPaths(paths: string[], index: number, targetSprite: cc.Sprite, cacheKey: string) {
        if (index >= paths.length) {
            cc.warn('Level stage preview load failed:', paths.join(', '));
            return;
        }

        const assetPath = paths[index];
        ResUtils.loadAsset<cc.SpriteFrame>(assetPath, cc.SpriteFrame, (err: Error, asset: cc.SpriteFrame) => {
            if (err || !asset) {
                this.loadStagePreviewByPaths(paths, index + 1, targetSprite, cacheKey);
                return;
            }

            if (!targetSprite || !cc.isValid(targetSprite.node)) {
                return;
            }
            if ((targetSprite.node as any).__levelStagePreviewPath !== cacheKey) {
                return;
            }

            this.stageSpriteCache[cacheKey] = asset;
            targetSprite.spriteFrame = asset;
        });
    }

    private scrollToCurrentLevel() {
        if (!this.levelScrollView || !this.levelScrollView.content) {
            return;
        }

        this.alignScrollContentToTop();
    }

    private alignScrollContentToTop(): void {
        if (!this.levelScrollView || !this.levelScrollView.content) {
            return;
        }

        const view = this.levelScrollView.node.getChildByName('view');
        if (!view) {
            return;
        }

        if ((this.levelScrollView as any).stopAutoScroll) {
            (this.levelScrollView as any).stopAutoScroll();
        }
        this.levelScrollView.content.x = 0;
        this.levelScrollView.content.y = this.getScrollContentTopY(view);

        const scrollViewAny = this.levelScrollView as any;
        if (scrollViewAny._updateScrollBar) {
            scrollViewAny._updateScrollBar(cc.v2(0, 0));
        }
    }
}
