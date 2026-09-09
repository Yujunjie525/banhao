import { _decorator, Button, Component, director, instantiate, Label, Node, NodeEventType, Prefab, ScrollView, sys, tween, UITransform, Vec3 } from 'cc';
import { gameConfig } from './gameConfig';
import { loadPool } from './loadPool';
import { audioTool } from './audioTool';
import { bgmName } from './enmus';
import { GameBackendApi } from '../GameBackendSdk/GameBackendApi';
const { ccclass, property } = _decorator;

@ccclass('RankWnd')
export class RankWnd extends Component {
    @property(Node) 
    closeButton: Node = null;

    @property(ScrollView) 
    rankScrollView: ScrollView = null;

    @property(Prefab) 
    rankItemPrefab: Prefab = null;

    @property(Label) 
    selfRankLabel: Label = null;

    @property(Label) 
    selfNameLabel: Label = null;
    
    @property(Label) 
    selfLevelLabel: Label = null;

    private popUI: Node;
    
    // 排行榜数据结构
    private rankData: Array<{rank: number, name: string, level: number}> = [];
    
    protected async onLoad(): Promise<void> {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.on(NodeEventType.TOUCH_START, this.onCloseClick, this)
        }
        
        // 初始化排行榜数据
        await this.initRankData();
        
        // 初始化排行榜列表
        this.initRankList();
        
        // 显示当前用户信息
        this.showSelfInfo();
    }
    
    protected onEnable(): void {
        // this.popUI = this.node.getChildByName('popUI')
        // this.popUI.setScale(0, 0)
        // tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
    }
    /**
     * 初始化排行榜数据
     */
    private async initRankData(): Promise<void> {
        // 从服务器获取排行榜数据
        try {
            const result = await GameBackendApi.rankList({ appid: "app.yongshixunzhang3" });
            console.log("rankList (GameBackendApi):", result);
            
            if (result.code === 0 && result.data) {
                // 获取当前用户的name标识
                const userId = sys.localStorage.getItem('SLS_USER_ID');
                const selfName = `玩家${userId}`;
                // 获取当前用户的最高解锁关卡数
                const currentHighestLevel = gameConfig.nowLevel;
                
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
            const rankItem = instantiate(this.rankItemPrefab);
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
    private setupRankItem(item: Node, data: {rank: number, name: string, level: number}): void {
        // 获取列表项中的Label组件
        const rankLabel = item.getChildByName('l_rank').getComponent(Label);
        const nameLabel = item.getChildByName('l_name').getComponent(Label);
        const levelLabel = item.getChildByName('l_level').getComponent(Label);
        
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
        const itemWidth = item.getComponent(UITransform).width;
        const itemHeight = item.getComponent(UITransform).height;
        
        // 获取view节点宽度
        const view = this.rankScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        const viewWidth = view.getComponent(UITransform).width;
        
        // 列表项之间的垂直间距
        const verticalSpacing = 15;
        
        // 列表项的内边距
        const xPadding = 20; // x方向内边距
        const yPadding = 10; // y方向内边距（0=顶部不留空）
        
        // 计算content的总高度，考虑y方向padding
        const totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;
        
        // 设置content的大小，宽度与view一致
        container.getComponent(UITransform).width = viewWidth;
        container.getComponent(UITransform).height = totalHeight;
        
        // 设置content的锚点为左上角
        container.getComponent(UITransform).anchorX = 0.5;
        container.getComponent(UITransform).anchorY = 1;
        
        // 设置列表项的位置（垂直布局，居中显示）
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // 设置列表项的位置，从顶部开始排列，考虑y方向padding和列表项高度
            child.setPosition(new Vec3(
                (viewWidth - itemWidth - 2 * xPadding) / 2 - 0,
                -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing),
                0
            ));
            // 居中显示，考虑x方向padding：(view宽度 - 列表项宽度 - 2 * xPadding) / 2 + xPadding
            // child.x = (viewWidth - itemWidth - 2 * xPadding) / 2 -20;
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
        const userId = sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = gameConfig.nowLevel; // 从GameData获取最大通关关卡数
        
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
        const userId = sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = gameConfig.nowLevel; // 获取当前解锁的最大关卡
        
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
        // audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        // tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        // }).start()
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
    // public hide(): void {
    //     this.node.active = false;
    // }
}