const Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        content: {
            default: null,
            type: cc.Node,
        },
        closeButton: {
            default: null,
            type: cc.Node,
        },
        rankScrollView: {
            default: null,
            type: cc.ScrollView,
        },
        rankItemPrefab: {
            default: null,
            type: cc.Prefab,
        },
        selfRankLabel: {
            default: null,
            type: cc.Label,
        },
        selfNameLabel: {
            default: null,
            type: cc.Label,
        },
        selfLevelLabel: {
            default: null,
            type: cc.Label,
        },
    },

    onLoad() {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.on('click', this.closeBtn, this);
        }
        
        // 初始化排行榜数据
        this.initRankData();
    },

    openShare() {

    },

    closeBtn() {
        cc.Mgr.AudioMgr.playSFX("click");
        this.node.active = false;
    },

    /**
     * 初始化排行榜数据
     */
    initRankData() {
        // 从服务器获取排行榜数据
        this.postRank("app.yongshixunzhang1", (error, result) => {
            if (error) {
                console.error("获取排行榜数据失败:", error);
                this.rankData = [];
                this.initRankList();
                this.showSelfInfo();
                return;
            }
            
            console.log("postRank:", result);
            
            if (result.code === 0 && result.data) {
                // 获取当前用户的name标识
                const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
                const selfName = `玩家${userId}`;
                
                // 处理返回的数据，将其转换为符合要求的格式
                this.rankData = result.data.map((item, index) => {
                    return {
                        rank: index + 1, // 序列值+1作为排名
                        name: `玩家${item.accountId}`, // "玩家"加上accountId
                        level: item.totalLoginNum // totalLoginNum作为最佳成绩
                    };
                });
            } else {
                // 如果服务器返回错误或没有数据，使用空数组
                this.rankData = [];
            }
            
            // 初始化排行榜列表
            this.initRankList();
            
            // 显示当前用户信息
            this.showSelfInfo();
        });
    },
    
    /**
     * 初始化排行榜列表
     */
    initRankList() {
        if (!this.rankScrollView || !this.rankItemPrefab) {
            console.error('排行榜ScrollView或预制体未设置');
            return;
        }
        
        const container = this.rankScrollView.content;
        container.removeAllChildren();
        
        for (let i = 0; i < this.rankData.length; i++) {
            const data = this.rankData[i];
            const rankItem = cc.instantiate(this.rankItemPrefab);
            container.addChild(rankItem);
            this.setupRankItem(rankItem, data);
        }
        
        // 更新ScrollView内容大小
        this.updateScrollViewContentSize();
    },
    
    /**
     * 设置排行榜列表项
     * @param item 列表项节点
     * @param data 列表项数据
     */
    setupRankItem(item, data) {
        // 获取列表项中的Label组件
        const rankLabel = item.getChildByName('l_rank').getComponent(cc.Label);
        const nameLabel = item.getChildByName('l_name').getComponent(cc.Label);
        const levelLabel = item.getChildByName('l_level').getComponent(cc.Label);
        
        if (rankLabel) rankLabel.string = data.rank.toString();
        if (nameLabel) nameLabel.string = data.name;
        if (levelLabel) levelLabel.string = data.level.toString();
    },
    
    /**
     * 更新ScrollView内容大小
     */
    updateScrollViewContentSize() {
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
        const xPadding = 8; // x方向内边距
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
            child.x = (viewWidth - itemWidth - 2 * xPadding) / 2 - 0;
        }
        
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.rankScrollView.scrollToTop) {
            this.rankScrollView.scrollToTop(0.1);
        }
    },
    
    /**
     * 显示当前用户信息
     */
    showSelfInfo() {
        // 从Global获取真实用户数据
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const selfName = '玩家' + userId;
        const selfLevel = Global.userData.maxScore; // 从Global获取最佳成绩
        
        // 查找当前用户在排行榜中的排名
        let selfRank = this.rankData.length + 1;
        for (let i = 0; i < this.rankData.length; i++) {
            if (this.rankData[i].name === selfName) {
                selfRank = this.rankData[i].rank;
                break;
            }
        }
        
        if (this.selfNameLabel) this.selfNameLabel.string = selfName;
        if (this.selfLevelLabel) this.selfLevelLabel.string = selfLevel.toString();
        if (this.selfRankLabel) this.selfRankLabel.string = selfRank.toString();
    },

    /**
     * 显示排行榜
     */
    show() {
        this.node.active = true;
        // 每次显示时刷新数据
        this.initRankData();
    },
    
    /**
     * 隐藏排行榜
     */
    hide() {
        this.node.active = false;
    },

    //排行榜请求
    postRank(appid, callback) {
        const url = "https://pay.szvi-bo.com/v1/testapp/RankList";
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    callback(null, data);
                } catch (e) {
                    callback(new Error(`JSON解析错误: ${e.message}`));
                }
            } else {
                callback(new Error(`HTTP错误: ${xhr.status}`));
            }
        };
        
        xhr.onerror = function() {
            callback(new Error('网络请求失败'));
        };
        
        xhr.ontimeout = function() {
            callback(new Error('网络请求超时'));
        };
        
        xhr.send(JSON.stringify({ appid }));
    },
});