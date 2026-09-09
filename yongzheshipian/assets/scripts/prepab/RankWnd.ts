import { _decorator, Button, Component, director, instantiate, Label, Node, NodeEventType, Prefab, ScrollView, sys, tween, UITransform, Vec3 } from 'cc';

import { loadPool } from '../res/loadPool';
import { bgmName } from '../data/enmus';
import { gameConfig } from '../../script/data/gameConfig';
import { audioTool } from '../../script/utils/audioTool';
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
    
    protected async onEnable(): Promise<void> {
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
        
        // 每次打开排行榜时重新获取数据，确保显示最新的通关进度
        await this.initRankData();
        this.initRankList();
        this.showSelfInfo();
    }
    /**
     * 初始化排行榜数据
     */
    private async initRankData(): Promise<void> {
        // 从服务器获取排行榜数据
        try {
            const result = await this.postRank(gameConfig.APP_ID);
            console.log("postRank:", result);
            
            if (result.code === 0 && result.data) {
                // 获取当前用户的name标识
                const userId = sys.localStorage.getItem('SLS_USER_ID');
                const selfName = `玩家${userId}`;
                // 处理返回的数据，将其转换为符合要求的格式
                this.rankData = result.data.map((item: any, index: number) => {
                    const level = Number(item.rank ?? item.totalLoginNum) || 0;
                    
                    return {
                        rank: index + 1, // 序列值+1作为排名
                        name: `玩家${item.accountId}`, // "玩家"加上accountId
                        level: level
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
            console.error('ScrollView?content?????');
            return;
        }

        const container = this.rankScrollView.content;
        const children = container.children;
        if (children.length === 0) {
            return;
        }

        const item = children[0];
        const itemTransform = item.getComponent(UITransform);
        const view = this.rankScrollView.node.getChildByName('view');
        const viewTransform = view ? view.getComponent(UITransform) : null;
        const containerTransform = container.getComponent(UITransform);
        if (!itemTransform || !viewTransform || !containerTransform) {
            return;
        }

        const itemWidth = itemTransform.width;
        const itemHeight = itemTransform.height;
        const verticalSpacing = 10;
        const xPadding = 20;
        const yPadding = 0;
        const totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;

        containerTransform.setContentSize(viewTransform.width, totalHeight);
        containerTransform.anchorX = 0.5;
        containerTransform.anchorY = 1;
        container.setPosition(new Vec3(0, 0, 0));

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.setPosition(new Vec3(
                0,  // 居中对齐，不偏移
                -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing),
                0
            ));
        }

        // ????????????? handle ??????????
        this.rankScrollView.stopAutoScroll();
        this.rankScrollView.scrollToTop(0);
    }

    /**
     * 将当前用户添加到排行榜并重新计算排名
     */
    private addCurrentUserToRank(): void {
        // 从GameData获取真实用户数据
        const userId = sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = gameConfig.maxJuli; // 当前最远飞行距离
        
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
        const selfLevel = Number(gameConfig.maxJuli || 0);
        
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
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        }).start()
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
