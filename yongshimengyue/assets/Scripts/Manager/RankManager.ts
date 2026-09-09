import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import { GameBackendApi } from '../../script/Api/GameBackendApi';
import ResUtils from '../../script/common/utils/ResUtils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankManager extends cc.Component {
    private static readonly PLAYER_PREFIX = '\u73a9\u5bb6';
    private static readonly FETCH_RANK_FAILED = '\u83b7\u53d6\u6392\u884c\u699c\u6570\u636e\u5931\u8d25:';

    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.ScrollView)
    rankScrollView: cc.ScrollView = null;

    @property(cc.Label)
    selfRankLabel: cc.Label = null;

    @property(cc.Label)
    selfNameLabel: cc.Label = null;

    @property(cc.Label)
    selfLevelLabel: cc.Label = null;

    private rankData: Array<{ rank: number, name: string, level: number }> = [];
    private rankItemTemplate: cc.Node = null;

    private normalizeRankLevel(level: unknown): number {
        return Math.max(1, Number(level) || 1);
    }

    protected async onLoad(): Promise<void> {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }

        this.rankItemTemplate = this.getRankItemTemplate();
        if (this.rankItemTemplate) {
            this.rankItemTemplate.active = false;
        }
        await this.initRankData();
        this.initRankList();
        this.showSelfInfo();
    }

    private async initRankData(): Promise<void> {
        try {
            const result = await GameBackendApi.rankList();
            console.log('postRank:', result);

            if (result.code === 0 && result.data) {
                this.rankData = result.data.map((item: any, index: number) => ({
                    rank: index + 1,
                    name: this.getRankPlayerName(item, index),
                    level: this.normalizeRankLevel(item.totalLoginNum),
                }));
            } else {
                this.rankData = [];
            }
        } catch (error) {
            console.error(RankManager.FETCH_RANK_FAILED, error);
            this.rankData = [];
        }
    }

    private getRankPlayerName(item: any, index: number): string {
        const rawId = item && (item.accountId || item.id || item.user_id || item.username);
        const id = Number(rawId);
        return `${RankManager.PLAYER_PREFIX}${isFinite(id) && id > 0 ? id : index + 1}`;
    }

    private initRankList(): void {
        const itemTemplate = this.getRankItemTemplate();
        if (!this.rankScrollView || !this.rankScrollView.content || !itemTemplate) {
            console.error('Rank ScrollView or Item template is missing.');
            return;
        }

        const container = this.rankScrollView.content;
        container.removeAllChildren();
        itemTemplate.active = false;

        for (const data of this.rankData) {
            const rankItem = cc.instantiate(itemTemplate);
            rankItem.name = `RankItem${data.rank}`;
            rankItem.active = true;
            container.addChild(rankItem);
            this.setupRankItem(rankItem, data);
        }

        this.updateRankLayout();
    }

    private getRankItemTemplate(): cc.Node {
        if (this.rankItemTemplate && this.rankItemTemplate.isValid) {
            return this.rankItemTemplate;
        }

        this.rankItemTemplate = this.node ? this.node.getChildByName('Item') : null;
        if (this.rankItemTemplate) {
            return this.rankItemTemplate;
        }

        return null;
    }

    private setupRankItem(item: cc.Node, data: { rank: number, name: string, level: number }): void {
        const rankLabel = item.getChildByName('l_rank').getComponent(cc.Label);
        const nameLabel = item.getChildByName('l_name').getComponent(cc.Label);
        const levelLabel = item.getChildByName('l_level').getComponent(cc.Label);
        this.setRankItemBg(item, data.rank);

        if (rankLabel) rankLabel.string = data.rank.toString();
        if (nameLabel) nameLabel.string = data.name;
        if (levelLabel) levelLabel.string = this.normalizeRankLevel(data.level).toString();
    }

    private setRankItemBg(item: cc.Node, rank: number): void {
        if (!item || !cc.isValid(item)) {
            return;
        }

        return;
        const bgNode = item.getChildByName('bg');
        const bgSprite = bgNode ? bgNode.getComponent(cc.Sprite) : null;
        if (!bgSprite) {
            return;
        }

        const rankBg = rank >= 1 && rank <= 3 ? `rank${rank}` : 'rank0';
        if (bgNode['rankBg'] === rankBg && bgSprite.spriteFrame) {
            return;
        }

        bgNode['rankBgLoading'] = rankBg;
        ResUtils.loadAsset<cc.SpriteFrame>(`subgame:ui_wgyxl/main/${rankBg}`, cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset || !bgNode || !cc.isValid(bgNode) || bgNode['rankBgLoading'] !== rankBg) {
                return;
            }
            bgNode['rankBg'] = rankBg;
            bgNode['rankBgLoading'] = '';
            bgSprite.spriteFrame = asset;
        });
    }

    private updateRankLayout(): void {
        if (!this.rankScrollView || !this.rankScrollView.content) {
            console.error('Rank ScrollView or content is missing.');
            return;
        }

        const content = this.rankScrollView.content;
        const layout = content.getComponent(cc.Layout);
        const view = this.rankScrollView.node.getChildByName('view');
        const viewWidth = view ? view.width : this.rankScrollView.node.width;
        const viewHeight = view ? view.height : this.rankScrollView.node.height;
        const itemHeight = this.rankItemTemplate ? this.rankItemTemplate.height : 63;
        const spacingY = 10;
        const paddingTop = 5;
        const paddingBottom = 5;
        const itemCount = content.children.filter(child => child.active).length;
        const contentHeight = Math.max(
            viewHeight,
            itemCount * itemHeight + Math.max(0, itemCount - 1) * spacingY + paddingTop + paddingBottom,
        );

        content.anchorX = 0.5;
        content.anchorY = 1;
        content.x = 0;
        content.y = 0;
        content.width = viewWidth;
        content.height = contentHeight;

        if (layout) {
            layout.type = cc.Layout.Type.VERTICAL;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.paddingTop = paddingTop;
            layout.paddingBottom = paddingBottom;
            layout.spacingY = spacingY;
            layout.updateLayout();
            content.height = Math.max(content.height, contentHeight);
            return;
        }

        let index = 0;
        for (const child of content.children) {
            if (!child.active) {
                continue;
            }
            child.x = 0;
            child.y = -paddingTop - itemHeight / 2 - index * (itemHeight + spacingY);
            index += 1;
        }

    }

    private addCurrentUserToRank(): void {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const selfName = `${RankManager.PLAYER_PREFIX}${userId}`;
        const selfLevel = this.normalizeRankLevel(mGameData.getHighestUnlockedLevel());
        const currentUser = { rank: 0, name: selfName, level: selfLevel };

        this.rankData.push(currentUser);
        this.rankData.sort((a, b) => b.level - a.level);
        this.rankData.forEach((user, index) => {
            user.rank = index + 1;
        });
    }

    private showSelfInfo(): void {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const selfName = `${RankManager.PLAYER_PREFIX}${userId}`;
        const currentUser = this.rankData.find(user => user.name === selfName);
        const selfRank = currentUser ? currentUser.rank : this.rankData.length + 1;
        const selfLevel = this.normalizeRankLevel(currentUser ? currentUser.level : mGameData.getHighestUnlockedLevel());

        if (this.selfNameLabel) this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel) this.selfLevelLabel.string = selfLevel.toString();
        if (this.selfRankLabel) this.selfRankLabel.string = selfRank.toString();
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    public async show(): Promise<void> {
        this.node.active = true;
        await this.initRankData();
        this.initRankList();
        this.showSelfInfo();
    }

    public hide(): void {
        this.node.active = false;
    }
}
