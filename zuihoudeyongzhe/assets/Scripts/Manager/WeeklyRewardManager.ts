const {ccclass, property} = cc._decorator;
import UserData from '../Game/UserData';
import TipsManager from '../Load/TipsManager';
import mGameData from '../Load/GameData';
import UserDataSyncManager from './UserDataSyncManager';

interface WeeklyRewardConfig {
    id: number;
    name: string;
    desc: string;
    icon: number;
    rewardId: number;
    rewardNum: number;
}

interface WeeklyRewardItem extends WeeklyRewardConfig {
    isClaimed: boolean;
    isAvailable: boolean;
    isMissed: boolean;
    daysUntilAvailable: number;
}

@ccclass
export default class WeeklyRewardManager extends cc.Component {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.Node)
    weekPanel: cc.Node = null;

    private weeklyRewards: WeeklyRewardItem[] = [];
    private weeklyRewardConfigs: WeeklyRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;

    private weekStartDate: string = '';

    private readonly weeklyRewardWeekStartKey: string = "weeklyRewardWeekStart";
    private readonly weeklyRewardClaimedKey: string = "weeklyRewardClaimed";

    private getUserId(): string | null {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    }

    private getKeyWithUserId(baseKey: string): string {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    }

    private getClaimedRewards(): number[] {
        const claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        const claimedStr = cc.sys.localStorage.getItem(claimedKey);
        if (!claimedStr) {
            return [];
        }
        try {
            const parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Parse weekly claimed data failed:', error);
            return [];
        }
    }

    private saveClaimedRewards(claimedList: number[]): void {
        const claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        cc.sys.localStorage.setItem(claimedKey, JSON.stringify(claimedList));
        UserDataSyncManager.requestUpload();
    }

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }

        this.loadWeeklyRewardConfig().then(() => {
            this.initWeeklyRewards();
            this.updateWeeklyRewardUI();
        }).catch((error) => {
            console.error('Load weekly reward config failed:', error);
        });
    }

    private loadWeeklyRewardConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            cc.loader.loadRes('config/weekReward', cc.JsonAsset, (err: Error, jsonAsset: cc.JsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.weeklyRewardConfigs = rawConfigs.map((config: any) => ({
                    id: Number(config.id) || 0,
                    name: `${config.name || ''}`,
                    desc: `${config.desc || ''}`,
                    icon: Number(config.icon) || 0,
                    rewardId: Number(config.rewardId) || 0,
                    rewardNum: Number(config.rewardNum) || 0
                }));
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private initWeeklyRewards(): void {
        this.updateWeekStartDate();
        this.checkNewWeek();

        const today = new Date();
        const dayOfWeek = today.getDay() || 7;

        this.weeklyRewards = this.weeklyRewardConfigs.map(config => {
            const isClaimed = this.checkRewardClaimed(config.id);
            const isAvailable = config.id === dayOfWeek;
            const isMissed = !isClaimed && config.id < dayOfWeek;
            const daysUntilAvailable = Math.max(0, config.id - dayOfWeek);

            return {
                ...config,
                isClaimed,
                isAvailable,
                isMissed,
                daysUntilAvailable
            };
        });
    }

    private updateWeekStartDate(): void {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (dayOfWeek - 1));
        this.weekStartDate = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    }

    private checkNewWeek(): void {
        const weekStartKey = this.getKeyWithUserId(this.weeklyRewardWeekStartKey);
        const currentWeekStart = cc.sys.localStorage.getItem(weekStartKey);
        if (!currentWeekStart || currentWeekStart !== this.weekStartDate) {
            cc.sys.localStorage.setItem(weekStartKey, this.weekStartDate);
            this.saveClaimedRewards([]);
            UserDataSyncManager.requestUpload();
        }
    }

    private checkRewardClaimed(rewardId: number): boolean {
        const claimedList = this.getClaimedRewards();
        return claimedList.includes(rewardId);
    }

    private markRewardClaimed(rewardId: number): void {
        const claimedList = this.getClaimedRewards();
        if (!claimedList.includes(rewardId)) {
            claimedList.push(rewardId);
            this.saveClaimedRewards(claimedList);
        }
    }

    private giveReward(reward: WeeklyRewardItem): void {
        if (!UserData.Instance) {
            console.error('UserData Instance is null');
            return;
        }

        if (reward.rewardNum <= 0) {
            return;
        }

        mGameData.addGold(reward.rewardNum);
    }

    private updateWeeklyRewardUI(): void {
        if (!this.weekPanel) {
            console.error('Week panel not assigned');
            return;
        }

        const jiemiankuangNode = this.weekPanel.getChildByName('jiemiankuang');

        for (let i = 0; i < this.weeklyRewards.length; i++) {
            const rewardData = this.weeklyRewards[i];
            const dayId = i + 1;

            let dayNode = null;
            if (jiemiankuangNode) {
                dayNode = jiemiankuangNode.getChildByName(`day${dayId}`);
            }

            if (!dayNode) {
                dayNode = this.weekPanel.getChildByName(`day${dayId}`);
            }

            if (!dayNode) {
                continue;
            }

            const labelNode = dayNode.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(cc.Label);
                if (label) {
                    label.string = rewardData.name;
                }
            }

            const rewardString = `x${rewardData.rewardNum}`;
            const reward1Node = dayNode.getChildByName('reward1');
            if (reward1Node) {
                const rewardLabel = reward1Node.getChildByName('Label');
                if (rewardLabel) {
                    const label = rewardLabel.getComponent(cc.Label);
                    if (label) {
                        label.string = rewardString;
                    }
                }
            }

            const juese1 = dayNode.getChildByName('juese1');
            if (juese1) {
                juese1.getChildByName('num').getComponent(cc.Label).string = rewardString;
            }

            const rewardNode = dayNode.getChildByName('reward');
            const gotNode = dayNode.getChildByName('got');

            if (!rewardNode || !gotNode) {
                continue;
            }

            const backgroundNode = rewardNode.getChildByName('Background');
            if (!backgroundNode) {
                continue;
            }

            const rewardLabel = backgroundNode.getChildByName('Label')?.getComponent(cc.Label);

            if (rewardData.isClaimed) {
                rewardNode.active = true;
                gotNode.active = false;

                const spriteComponent = backgroundNode.getComponent(cc.Sprite);
                if (spriteComponent) {
                    const iconPath = `zImg2/yilingquanniu`;
                    cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            console.error(`加载${iconPath}失败:`, err);
                        } else {
                            spriteComponent.spriteFrame = spriteFrame;
                        }
                    });
                }

                if (rewardLabel) {
                    rewardLabel.node.active = false;
                }
            } else if (rewardData.isAvailable) {
                rewardNode.active = true;
                gotNode.active = false;

                if (rewardLabel) {
                    rewardLabel.string = ``;
                    rewardLabel.node.active = false;
                }

                backgroundNode.off(cc.Node.EventType.TOUCH_END);
                backgroundNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
            } else if (rewardData.isMissed) {
                rewardNode.active = true;
                gotNode.active = false;

                backgroundNode.color = new cc.Color(128, 128, 128);

                if (rewardLabel) {
                    rewardLabel.string = ``;
                    rewardLabel.node.active = false;
                }

                backgroundNode.off(cc.Node.EventType.TOUCH_END);
            } else {
                rewardNode.active = false;
                gotNode.active = true;

                const newLabelNode = gotNode.getChildByName('New Label');
                if (newLabelNode) {
                    const label = newLabelNode.getComponent(cc.Label);
                    if (label) {
                        label.string = `${rewardData.daysUntilAvailable}天后可领取`;
                    }
                }
            }
        }
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.weeklyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateWeeklyRewardUI();
        this.showToast(`获得${reward.rewardNum}钻石。`);
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private showToast(message: string): void {
        TipsManager.show(message);
    }

    public show(): void {
        this.node.active = true;
        this.loadWeeklyRewardConfig().then(() => {
            this.initWeeklyRewards();
            this.updateWeeklyRewardUI();
        }).catch((error) => {
            console.error('Reload weekly reward config failed:', error);
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
