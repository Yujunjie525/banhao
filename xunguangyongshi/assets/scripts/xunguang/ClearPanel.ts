import { _decorator, Color, Component, Graphics, Label, Node, Sprite, SpriteFrame, UITransform, Vec3, director } from 'cc';
import { GameManager } from './GameManager';
import { LevelConfig } from './GridSystem';
import { gameConfig } from '../../script/data/gameConfig';
import { localData } from '../../script/data/enums';
import { save, load } from '../../script/utils/tools';
const { ccclass, property } = _decorator;

export type ClearResult = {
    config: LevelConfig;
    stepsUsed: number;
    totalSteps: number;
    star: number;
    isFirstClear: boolean;
    rewards: Record<string, number>;
};

@ccclass('ClearPanel')
export class ClearPanel extends Component {
    @property(Node)
    panelRoot: Node = null;

    @property(Sprite)
    star1: Sprite = null;

    @property(Sprite)
    star2: Sprite = null;

    @property(Sprite)
    star3: Sprite = null;

    @property(SpriteFrame)
    fullStarSpriteFrame: SpriteFrame = null;  // wujiaoxing 满星

    @property(SpriteFrame)
    emptyStarSpriteFrame: SpriteFrame = null;  // wujiaoxing2 空星

    @property(Label)
    stepsLabel: Label = null;

    @property(Label)
    rewardLabel: Label = null;

    @property(Node)
    nextButton: Node = null;

    @property(Node)
    tripleButton: Node = null;

    @property(Node)
    homeButton: Node = null;

    private result: ClearResult = null;
    private hasTripled = false;

    onLoad() {
        this.ensureView();
        this.hide();
    }

    onEnable() {
        this.nextButton?.on(Node.EventType.TOUCH_END, this.onNextClick, this);
        this.tripleButton?.on(Node.EventType.TOUCH_END, this.onTripleClick, this);
        this.homeButton?.on(Node.EventType.TOUCH_END, this.onHomeClick, this);
    }

    onDisable() {
        this.nextButton?.off(Node.EventType.TOUCH_END, this.onNextClick, this);
        this.tripleButton?.off(Node.EventType.TOUCH_END, this.onTripleClick, this);
        this.homeButton?.off(Node.EventType.TOUCH_END, this.onHomeClick, this);
    }

    public show(result: ClearResult) {
        this.ensureView();
        this.result = result;
        this.hasTripled = false;
        this.applyRewardDelta(this.result.rewards, 1);
        this.node.active = true;
        this.panelRoot.active = true;
        if (this.tripleButton) {
            this.tripleButton.active = true;
        }
        this.refresh();
        
        this.saveLevelStar(result);
        
        this.uploadPassLevel(result);
    }

    private saveLevelStar(result: ClearResult) {
        const level = result.config.level || 1;
        const star = result.star;
        
        gameConfig.setLevelStar(level, star);
        
        // 使用用户ID关联关卡星级数据，确保不同用户数据隔离
        const userId = load('SLS_USER_ID', 0) || 'default';
        const levelStarsKey = `levelStars_${userId}`;
        save(levelStarsKey, gameConfig.levelStars);
        
        console.log(`保存关卡 ${level} 星级: ${star}`);
    }

    public hide() {
        this.node.active = false;
    }

    private refresh() {
        if (!this.result) {
            return;
        }

        const config = this.result.config;
        const levelText = config.level ? `第${config.level}关` : '关卡';

        this.updateStarSprites(this.result.star);
        this.stepsLabel.string = `步数:${this.result.stepsUsed}/${this.result.totalSteps}`;
        this.rewardLabel.string = `奖励:${this.formatRewards(this.result.rewards)}`;
    }

    private updateStarSprites(star: number) {
        const stars = [this.star1, this.star2, this.star3];
        for (let i = 0; i < stars.length; i++) {
            const starSprite = stars[i];
            if (starSprite) {
                starSprite.spriteFrame = (i + 1) <= star 
                    ? (this.fullStarSpriteFrame || starSprite.spriteFrame)
                    : (this.emptyStarSpriteFrame || starSprite.spriteFrame);
            }
        }
    }

    private onNextClick() {
        this.hide();
        GameManager.instance?.loadNextLevel();
    }

    private onTripleClick() {
        if (!this.result || this.hasTripled) {
            return;
        }

        this.hasTripled = true;
        this.applyRewardDelta(this.result.rewards, 2);
        for (const key of Object.keys(this.result.rewards)) {
            this.result.rewards[key] *= 3;
        }
        this.refresh();
        if (this.tripleButton) {
            this.tripleButton.active = false;
        }
    }

    private onHomeClick() {
        this.hide();
        director.loadScene('home2');
    }

    private applyRewardDelta(rewards: Record<string, number>, multiplier: number) {
        if (!rewards || multiplier <= 0) {
            return;
        }

        const rewardHandlers: Record<string, (amount: number) => void> = {
            lightCrystal: (amount: number) => {
                gameConfig.lightCrystal += amount;
                save(localData.lightCrystal, gameConfig.lightCrystal);
            },
            memoryFragment: (amount: number) => {
                gameConfig.memoryFragment += amount;
                save(localData.memoryFragment, gameConfig.memoryFragment);
            },
            diamond: (amount: number) => {
                gameConfig.jinbiNum += amount;
                save(localData.jinbiNum, gameConfig.jinbiNum);
            },
        };

        for (const key of Object.keys(rewards)) {
            const baseAmount = Number(rewards[key] || 0);
            const amount = baseAmount * multiplier;
            if (amount <= 0) {
                continue;
            }

            rewardHandlers[key]?.(amount);
        }
    }

    // 已移除 getStarText 方法，改为使用精灵显示星级

    private formatRewards(rewards: Record<string, number>) {
        const names: Record<string, string> = {
            lightCrystal: '光晶',
            diamond: '钻石',
            memoryFragment: '碎片',
        };

        return Object.keys(rewards)
            .filter((key) => rewards[key] > 0)
            .map((key) => `${rewards[key]} ${names[key] || key}`)
            .join('、');
    }

    private ensureView() {
        const transform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(720, 1280);
        }

        if (!this.panelRoot) {
            this.panelRoot = new Node('ClearPanelRoot');
            this.node.addChild(this.panelRoot);
            const panelTransform = this.panelRoot.addComponent(UITransform);
            panelTransform.setContentSize(640, 430);
            this.panelRoot.setPosition(0, 0, 0);

            const bg = this.panelRoot.addComponent(Graphics);
            bg.fillColor = new Color(9, 19, 35, 245);
            bg.strokeColor = new Color(255, 232, 151, 255);
            bg.lineWidth = 4;
            bg.roundRect(-320, -215, 640, 430, 12);
            bg.fill();
            bg.stroke();
        }

        this.stepsLabel = this.stepsLabel || this.createLabel('StepsLabel', new Vec3(0, 15, 0), 30, new Color(255, 255, 255, 255));
        this.rewardLabel = this.rewardLabel || this.createLabel('RewardLabel', new Vec3(0, -55, 0), 28, new Color(255, 226, 145, 255));

        this.nextButton = this.nextButton || this.createButton('NextButton', '下一关', new Vec3(-155, -145, 0));
        this.tripleButton = this.tripleButton || this.createButton('TripleButton', '三倍领取(广告)', new Vec3(155, -145, 0));
    }

    private createLabel(name: string, position: Vec3, fontSize: number, color: Color) {
        const node = new Node(name);
        this.panelRoot.addChild(node);
        node.setPosition(position);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(560, 64);

        const label = node.addComponent(Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        return label;
    }

    private createButton(name: string, text: string, position: Vec3) {
        const node = new Node(name);
        this.panelRoot.addChild(node);
        node.setPosition(position);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(260, 70);

        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 211, 79, 255);
        graphics.strokeColor = new Color(255, 247, 182, 255);
        graphics.lineWidth = 3;
        graphics.roundRect(-130, -35, 260, 70, 8);
        graphics.fill();
        graphics.stroke();

        const labelNode = new Node(`${name}Label`);
        node.addChild(labelNode);
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(250, 62);

        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 28;
        label.lineHeight = 34;
        label.color = new Color(31, 35, 43, 255);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;

        return node;
    }

    /**
     * 上报通关信息到服务端
     * @param result 通关结果
     */
    private async uploadPassLevel(result: ClearResult) {
        const username = load('SLS_USERNAME', 0);
        if (!username) {
            console.log('未登录，跳过通关上报');
            return;
        }

        const currentLevel = result.config.level || 1;
        
        // 使用 result.isFirstClear 来判断是否需要上报
        // 如果是首次通关，则上报；否则跳过（避免重复上报）
        if (!result.isFirstClear) {
            console.log(`关卡(${currentLevel})非首次通关，跳过上报`);
            return;
        }

        const star = result.star;

        try {
            const response = await this.postPass(gameConfig.APP_ID, username, currentLevel, star);
            console.log('通关上报成功:', response);
            console.log('通关上报参数: appid: 关卡: 星级:', gameConfig.APP_ID, Number(currentLevel), star);
        } catch (error) {
            console.error('通关上报失败:', error);
        }
    }

    /**
     * 上报通关信息到服务端
     * @param appid 应用ID
     * @param username 用户名
     * @param rank 关卡等级
     * @param star 星级（1-3星）
     */
    async postPass(appid: string, username: string, rank: number, star: number): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/PassLevel';
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));

            xhr.send(JSON.stringify({ appid, username, rank, star }));
        });
    }
}