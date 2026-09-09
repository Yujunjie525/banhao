const {ccclass, property} = cc._decorator;
import { APP_ID } from '../Common/AppConfig';

interface RankRow {
    rank: number;
    accountId: string;
    name: string;
    distance: number;
}

@ccclass
export default class RankManager extends cc.Component {
    @property(cc.Button) 
    closeButton: cc.Button = null;

    @property(cc.ScrollView) 
    rankScrollView: cc.ScrollView = null;

    @property(cc.Prefab) 
    rankItemPrefab: cc.Prefab = null;

    @property(cc.Label) 
    selfRankLabel: cc.Label = null;

    @property(cc.Label) 
    selfNameLabel: cc.Label = null;
    
    @property(cc.Label) 
    selfLevelLabel: cc.Label = null;
    
    // 排行榜数据结构
    private rankData: RankRow[] = [];
    
    protected async onLoad(): Promise<void> {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
    }
    
    /**
     * 初始化排行榜数据
     */
    private async initRankData(): Promise<void> {
        try {
            const result = await this.postRank(APP_ID);
            console.log("postRank:", result);
            
            if (result.code === 0 && Array.isArray(result.data)) {
                this.rankData = result.data.map((item: any, index: number) => {
                    const accountId = this.getAccountId(item, index);
                    const rawDistance = item && item.rank !== undefined
                        ? item.rank
                        : item && item.totalLoginNum;
                    return {
                        rank: index + 1,
                        accountId,
                        name: '玩家' + accountId,
                        distance: this.toDistance(rawDistance)
                    };
                });
            } else {
                this.rankData = [];
            }
        } catch (error) {
            console.error("获取排行榜数据失败:", error);
            this.rankData = [];
        }

        this.mergeLocalPlayer();
    }
    
    /**
     * 初始化排行榜列表
     */
    private initRankList(): void {
        if (!this.rankScrollView || !this.rankItemPrefab) {
            console.error('排行榜ScrollView或预制体未设置');
            return;
        }
        
        const container = this.rankScrollView.content;
        container.removeAllChildren();
        
        for (const data of this.rankData) {
            const rankItem = cc.instantiate(this.rankItemPrefab);
            container.addChild(rankItem);
            this.setupRankItem(rankItem, data);
        }
        
        // 更新ScrollView内容大小
        this.updateScrollViewContentSize();
    }
    
    /**
     * 设置排行榜列表项
     * @param item 列表项节点
     * @param data 列表项数据
     */
    private setupRankItem(item: cc.Node, data: RankRow): void {
        // 获取列表项中的Label组件
        const rankLabel = item.getChildByName('l_rank').getComponent(cc.Label);
        const nameLabel = item.getChildByName('l_name').getComponent(cc.Label);
        const levelLabel = item.getChildByName('l_level').getComponent(cc.Label);
        
        if (rankLabel) rankLabel.string = data.rank.toString();
        if (nameLabel) nameLabel.string = data.name;
        if (levelLabel) levelLabel.string = data.distance.toString();
    }
    
    /**
     * 更新ScrollView内容大小
     */
    private updateScrollViewContentSize(): void {
        if (!this.rankScrollView || !this.rankScrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        
        const container = this.rankScrollView.content;
        const children = container.children;
        
        if (children.length === 0) {
            return;
        }
        
        // 获取列表项的大小（使用第一个列表项作为参考）
        const item = children[0];
        const itemHeight = item.height;
        
        // 获取view节点宽度
        const view = this.rankScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        const viewWidth = view.width;
        
        // 列表项之间的垂直间距
        const verticalSpacing = 0;
        
        // 列表项的内边距
        const yPadding = 10; // y方向内边距
        
        // 计算content的总高度，考虑y方向padding
        const totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;
        
        // 设置content的大小，宽度与view一致
        container.width = viewWidth;
        container.height = totalHeight;
        
        // 设置content的锚点为左上角
        container.anchorX = 0.5;
        container.anchorY = 1;
        
        // 设置列表项的位置（垂直布局，居中显示）
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // 设置列表项的位置，从顶部开始排列，考虑y方向padding和列表项高度
            child.y = -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing);
            // content 的 anchorX 是 0.5，子项 x=0 才是居中。
            child.x = 0;
        }
        
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.rankScrollView.scrollToTop) {
            this.rankScrollView.scrollToTop(0.1);
        }
    }
    
    /**
     * 显示当前用户信息
     */
    private showSelfInfo(): void {
        const userId = this.getUserId();
        const selfName = this.getSelfName();
        const localBestDistance = this.getLocalBestDistance();
        
        // 查找当前用户在排行榜中的排名
        const currentUser = userId
            ? this.rankData.find(user => user.accountId === userId)
            : null;
        const selfRank = currentUser ? currentUser.rank : 0;
        
        if (this.selfNameLabel) this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel) this.selfLevelLabel.string = localBestDistance.toString();
        if (this.selfRankLabel) this.selfRankLabel.string = selfRank > 0 ? selfRank.toString() : '未上榜';
    }
    
    /**
     * 关闭按钮点击事件
     */
    private onCloseClick(): void {
        this.node.active = false;
    }
    
    /**
     * 显示排行榜
     */
    public async show(): Promise<void> {
        // 每次显示时刷新数据
        await this.syncLocalBestDistance();
        await this.initRankData();
        this.initRankList();
        this.showSelfInfo();
        this.node.active = true;
    }
    
    /**
     * 隐藏排行榜
     */
    public hide(): void {
        this.node.active = false;
    }

    private getAccountId(item: any, fallbackIndex: number): string {
        if (item && item.accountId !== undefined && item.accountId !== null) return String(item.accountId);
        if (item && item.user_id !== undefined && item.user_id !== null) return String(item.user_id);
        if (item && item.openid !== undefined && item.openid !== null) return String(item.openid);
        return 'unknown_' + fallbackIndex;
    }

    private getUserId(): string {
        return cc.sys.localStorage.getItem('SLS_USER_ID') || '';
    }

    private getSelfName(): string {
        const userId = this.getUserId();
        return userId ? '玩家' + userId : '玩家';
    }

    private getLocalBestDistance(): number {
        const userId = this.getUserId();
        const scopedKey = userId ? 'WarriorRunBestDistance_' + userId : 'WarriorRunBestDistance';
        const raw = cc.sys.localStorage.getItem(scopedKey) || cc.sys.localStorage.getItem('WarriorRunBestDistance');
        return this.toDistance(raw);
    }

    private mergeLocalPlayer(): void {
        const userId = this.getUserId();
        if (!userId) return;

        const localBestDistance = this.getLocalBestDistance();
        const currentUser = this.rankData.find((row) => row.accountId === userId);
        if (currentUser) {
            currentUser.distance = Math.max(currentUser.distance, localBestDistance);
        } else {
            this.rankData.push({
                rank: this.rankData.length + 1,
                accountId: userId,
                name: this.getSelfName(),
                distance: localBestDistance
            });
        }

        this.rankData.sort((a, b) => b.distance - a.distance || a.rank - b.rank);
        this.rankData.forEach((row, index) => {
            row.rank = index + 1;
        });
    }

    private async syncLocalBestDistance(): Promise<void> {
        const username = cc.sys.localStorage.getItem('SLS_USERNAME') || '';
        const distance = this.getLocalBestDistance();
        if (!username || distance <= 0) return;

        try {
            const result = await this.postDistance(APP_ID, username, distance);
            if (result && result.code !== 0) {
                cc.warn('[RankManager] best distance upload rejected:', result);
            }
        } catch (error) {
            cc.warn('[RankManager] best distance upload failed:', error);
        }
    }

    private toDistance(value: any): number {
        return Math.max(0, Math.floor(Number(value) || 0));
    }

    private postDistance(appid: string, username: string, distance: number): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/PassLevel';
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 5000;
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('HTTP错误: ' + xhr.status));
                }
            };
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            xhr.send(JSON.stringify({
                appid,
                username,
                rank: this.toDistance(distance),
                star: 3
            }));
        });
    }

    //排行榜请求
    async postRank(appid: string): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/RankList";
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

            xhr.send(JSON.stringify({ appid }));
        });
    }
}
