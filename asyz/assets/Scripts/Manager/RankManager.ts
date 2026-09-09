const {ccclass, property} = cc._decorator;
import mGameData from '../Load/GameData';
import { APP_ID } from '../Common/AppConfig';


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
    private rankData: Array<{rank: number, name: string, level: number}> = [];

    private getSelfName(): string {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return `玩家${userId || ''}`;
    }

    private getLocalRankLevel(): number {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const currentLevelKey = userId ? `CurrentLevel_${userId}` : 'CurrentLevel';
        const unlockedLevelKey = userId ? `UnlockedLevel_${userId}` : 'UnlockedLevel';
        const storedCurrentLevel = cc.sys.localStorage.getItem(currentLevelKey)
            || cc.sys.localStorage.getItem('CurrentLevel');
        const storedUnlockedLevel = cc.sys.localStorage.getItem(unlockedLevelKey)
            || cc.sys.localStorage.getItem('UnlockedLevel');
        const currentLevel = Math.floor(Number(mGameData.currentLevel || storedCurrentLevel) || 0);
        const unlockedLevel = Math.floor(Number(mGameData.unlockedLevel || storedUnlockedLevel) || 1);
        const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : 100;
        return Math.max(1, Math.min(totalLevels, Math.max(currentLevel + 1, unlockedLevel)));
    }
    
    protected onLoad(): void {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
    }

    protected onEnable(): void {
        this.refreshRankView();
    }

    private async refreshRankView(): Promise<void> {
        await this.initRankData();
        if (!this.node || !this.node.isValid || !this.node.activeInHierarchy) return;
        this.initRankList();
        this.showSelfInfo();
    }
    
    /**
     * 初始化排行榜数据
     */
    private async initRankData(): Promise<void> {
        // 从服务器获取排行榜数据
        try {
            const result = await this.postRank(APP_ID);
            console.log("postRank:", result);
            
            if (result.code === 0 && result.data) {
                const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : 100;
                const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
                const selfName = this.getSelfName();
                const localRankLevel = this.getLocalRankLevel();

                this.rankData = result.data.map((item: any) => {
                    const name = `玩家${item.accountId}`;
                    const serverRankLevel = Math.max(
                        1,
                        Math.min(totalLevels, Math.floor(Number(item.totalLoginNum) || 0) + 1)
                    );
                    const isSelf = String(item.accountId) === String(userId) || name === selfName;
                    return {
                        rank: 0,
                        name,
                        // PassLevel 请求和 RankList 请求可能存在短暂延迟，自己的本地进度优先取较大值。
                        level: isSelf ? Math.max(localRankLevel, serverRankLevel) : serverRankLevel
                    };
                });

                // 服务端尚未返回当前账号时，先把本地账号加入列表，避免显示成列表末尾的虚拟排名。
                if (!this.rankData.some((item) => item.name === selfName)) {
                    this.rankData.push({ rank: 0, name: selfName, level: localRankLevel });
                }

                this.rankData.sort((a, b) => b.level - a.level);
                this.rankData.forEach((item, index) => item.rank = index + 1);
            } else {
                // 如果服务器返回错误或没有数据，使用空数组
                this.rankData = [];
            }
        } catch (error) {
            console.error("获取排行榜数据失败:", error);
            // 发生错误时使用空数组
            this.rankData = [];
        }
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
    private setupRankItem(item: cc.Node, data: {rank: number, name: string, level: number}): void {
        // 获取列表项中的Label组件
        const rankLabel = item.getChildByName('l_rank').getComponent(cc.Label);
        const nameLabel = item.getChildByName('l_name').getComponent(cc.Label);
        const levelLabel = item.getChildByName('l_level').getComponent(cc.Label);
        
        if (rankLabel) rankLabel.string = data.rank.toString();
        if (nameLabel) nameLabel.string = data.name;
        if (levelLabel) levelLabel.string = data.level.toString();
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
        const itemWidth = item.width;
        const itemHeight = item.height;
        
        // 获取view节点宽度
        const view = this.rankScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        const viewWidth = view.width;
        
        // 列表项之间的垂直间距
        const verticalSpacing = 10;
        
        // 列表项的内边距
        const xPadding = 0; // x方向内边距
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
            // 居中显示，考虑x方向padding：(view宽度 - 列表项宽度 - 2 * xPadding) / 2 + xPadding
            child.x = (viewWidth - itemWidth - 2 * xPadding) / 2 ;
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
        // 从GameData获取真实用户数据
        const selfName = this.getSelfName();
        const localUnlockedLevel = this.getLocalRankLevel();
        
        // 查找当前用户在排行榜中的排名
        const currentUser = this.rankData.find(user => user.name === selfName);
        const selfRank = currentUser ? currentUser.rank : this.rankData.length + 1;
        const selfLevel = currentUser ? currentUser.level : localUnlockedLevel;
        
        if (this.selfNameLabel) this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel) this.selfLevelLabel.string = selfLevel.toString();
        if (this.selfRankLabel) this.selfRankLabel.string = selfRank.toString();
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
        if (!this.node.active) {
            this.node.active = true;
            return;
        }
        await this.refreshRankView();
    }
    
    /**
     * 隐藏排行榜
     */
    public hide(): void {
        this.node.active = false;
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
