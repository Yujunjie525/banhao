const {ccclass, property} = cc._decorator;
import { log } from 'console';
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
    
    protected async onLoad(): Promise<void> {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
        
        // 初始化排行榜数据
        await this.initRankData();
        
        // 初始化排行榜列表
        this.initRankList();
        
        // 显示当前用户信息
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
                // 获取当前用户的name标识
                const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
                const selfName = `玩家${userId}`;
                // 获取当前用户的最高解锁关卡数
                const currentHighestLevel = mGameData.getHighestUnlockedLevel();
                
                // 处理返回的数据，将其转换为符合要求的格式
                this.rankData = result.data.map((item: any, index: number) => {
                    // 如果是当前用户，更新totalLoginNum为当前最高关卡数+1（因为level = totalLoginNum）
                    // if (`玩家${item.accountId}` === selfName) {
                    //     item.totalLoginNum = currentHighestLevel;
                    // }
                    
                    return {
                        rank: index + 1, // 序列值+1作为排名
                        name: `玩家${item.accountId}`, // "玩家"加上accountId
                        level: item.totalLoginNum + 1 // totalLoginNum-1作为等级
                    };
                });
            } else {
                // 如果服务器返回错误或没有数据，使用空数组
                this.rankData = [];
            }
        } catch (error) {
            console.error("获取排行榜数据失败:", error);
            // 发生错误时使用空数组
            this.rankData = [];
        }
        
        // 添加当前用户到排行榜
        // this.addCurrentUserToRank();
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
     * 将当前用户添加到排行榜并重新计算排名
     */
    private addCurrentUserToRank(): void {
        // 从GameData获取真实用户数据
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = mGameData.getHighestUnlockedLevel(); // 从GameData获取最大通关关卡数
        
        // 创建当前用户对象
        const currentUser = { rank: 0, name: selfName, level: selfLevel };
        
        // 将当前用户添加到排行榜数组
        this.rankData.push(currentUser);
        
        // 根据关卡数降序排序
        this.rankData.sort((a, b) => b.level - a.level);
        
        // 重新计算排名
        this.rankData.forEach((user, index) => {
            user.rank = index + 1;
        });
    }
    
    /**
     * 显示当前用户信息
     */
    private showSelfInfo(): void {
        // 从GameData获取真实用户数据
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = mGameData.unlockedLevel ; // 从GameData获取最大通关关卡数
        
        // 查找当前用户在排行榜中的排名
        const currentUser = this.rankData.find(user => user.name === selfName);
        const selfRank = currentUser ? currentUser.rank : this.rankData.length + 1;
        
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
        this.node.active = true;
        // 每次显示时刷新数据
        await this.initRankData();
        this.initRankList();
        this.showSelfInfo();
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
