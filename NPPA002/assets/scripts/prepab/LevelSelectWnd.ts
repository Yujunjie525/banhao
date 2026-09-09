import { _decorator, Component, director, instantiate, Label, Node, Prefab, ScrollView, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { loadRes } from '../res/loadRes';
import { loadPool } from '../res/loadPool';
import { emits } from '../data/enmus';
import { gameConfig } from '../data/gameConfig';
import { save, load } from '../untils/tools';
import { audioTool } from '../untils/audioTool';
import { mGameData } from '../untils/GameData';

@ccclass('LevelSelectWnd')
export class LevelSelectWnd extends Component {
    @property(ScrollView)
    levelScrollView: ScrollView = null; // 关卡滚动组件
    
    @property(Prefab)
    levelItemPrefab: Prefab = null; // 关卡项预制体
    
    // 一行显示的关卡数量
    itemsPerRow: number = 3;
    
    // 关卡项之间的水平间距
    horizontalSpacing: number = 22;
    
    // 关卡项之间的垂直间距
    verticalSpacing: number = 40;
    
    // 左边留出的空间
    leftPadding: number = 20;
    
    // 顶部留出的空间
    topPadding: number = 20;

    @property(SpriteFrame)
    levelUnlocked: SpriteFrame = null; // 解锁关卡图片
    
    @property(SpriteFrame)
    levelUnlocked2: SpriteFrame = null; // 解锁关卡图片 - 21-40关
    @property(SpriteFrame)
    levelUnlocked3: SpriteFrame = null; // 解锁关卡图片 - 41-60关
    @property(SpriteFrame)
    levelUnlocked4: SpriteFrame = null; // 解锁关卡图片 - 61-80关
    @property(SpriteFrame)
    levelUnlocked5: SpriteFrame = null; // 解锁关卡图片 - 81-100关
    @property(SpriteFrame)
    levelUnlocked6: SpriteFrame = null; // 解锁关卡图片 - 101-120关

    
    @property(Node)
    closeBtn: Node = null; // 关闭按钮

    private popUI: Node;
    
    onLoad () {
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        
        // 初始化关卡列表
        this.initLevelList();
    }

    protected onEnable(): void {
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
        // 每次显示时重新初始化关卡列表（确保切换账号后显示正确的解锁关卡）
        this.initLevelList()
    }
    
    /**
     * 获取当前用户的ID
     */
    private getUserId(): string {
        const userId = load('SLS_USER_ID', 0);
        return userId || 'default';
    }

    /**
     * 获取剧情观看记录的存储键名
     */
    private getHasSeenStoryKey(): string {
        const userId = this.getUserId();
        return `hasSeenStory_${userId}`;
    }
    
    /**
     * 初始化关卡列表
     */
    initLevelList() {
        // 确定关卡容器：优先使用ScrollView的content节点
        let container: any;
        if (this.levelScrollView) {
            container = this.levelScrollView.content;
        }
        
        if (!container || !this.levelItemPrefab) {
            console.error('关卡列表容器或预制体未设置');
            return;
        }
        
        // 清空现有关卡项
        container.removeAllChildren();
        
        // 从loadRes获取总关卡数
        let totalLevels = 0;
        if (loadRes.ins && loadRes.ins.allJson) {
            for (const key in loadRes.ins.allJson) {
                // 检查键是否为数字（关卡文件名为数字）
                if (!isNaN(Number(key))) {
                    totalLevels++;
                }
            }
        }
        // 确保至少有一个关卡
        totalLevels = Math.max(totalLevels, 1);

        // 创建关卡项
        for (let i = 1; i <= totalLevels; i++) {
            const levelItem = instantiate(this.levelItemPrefab);
            container.addChild(levelItem);
            
            // 设置关卡项信息
            this.setupLevelItem(levelItem, i);
        }
        
        // 如果使用ScrollView，需要更新content的大小以适配内容
        if (this.levelScrollView) {
            this.updateScrollViewContentSize();
        }
    }
    
    /**
     * 更新ScrollView的content大小以适配所有关卡项（Cocos Creator 2.4.6版本适配，支持网格布局）
     */
    updateScrollViewContentSize() {
        if (!this.levelScrollView || !this.levelScrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }
        
        const content = this.levelScrollView.content;
        const children = content.children;
        
        if (children.length === 0) {
            console.error('content节点下没有子节点');
            return;
        }
        
        // 获取关卡项的大小（使用第一个关卡项作为参考）
        const item = children[0];
        const itemWidth = item.getComponent(UITransform).width;
        const itemHeight = item.getComponent(UITransform).height;

        // 获取view节点
        const view = this.levelScrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        
        
        // 计算总列数和行数
        const totalColumns = this.itemsPerRow;
        const totalRows = Math.ceil(children.length / this.itemsPerRow);

        
        // 计算一行关卡项所需的宽度（考虑间距）
        const rowWidth = totalColumns * itemWidth + (totalColumns - 1) * this.horizontalSpacing;
        
        // 计算content的总高度（考虑顶部padding）
        const totalHeight = totalRows * itemHeight + (totalRows - 1) * this.verticalSpacing + this.topPadding;
        
        // 检查一行是否能容纳指定数量的关卡项
        if (rowWidth > view.getComponent(UITransform).width) {
            console.warn(`一行所需宽度(${rowWidth})大于view宽度(${view.getComponent(UITransform).width})，可能无法完全显示${this.itemsPerRow}个关卡项`);
        }
        
        // 设置content的大小：宽度至少为一行所需宽度，高度根据行数计算
        content.getComponent(UITransform).width = Math.max(view.getComponent(UITransform).width, rowWidth);
        content.getComponent(UITransform).height = totalHeight;
        
        // 设置content的锚点为左上角
        content.getComponent(UITransform).anchorX = 0;
        content.getComponent(UITransform).anchorY = 1;
        
        // 设置content位置在view的左上角
        // content.x = 0;
        // content.y = 0;
        content.setPosition(0, 0);

        // 计算关卡项的起始位置，确保一行内的关卡项从左边padding开始排列
        const startX = this.leftPadding;
        
        // 设置关卡项的位置（网格布局，考虑顶部padding）
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            
            // 确保关卡项的锚点是中心
            child.getComponent(UITransform).anchorX = 0.5;
            child.getComponent(UITransform).anchorY = 0.5;
            
            // 计算当前关卡项所在的行列
            const row = Math.floor(i / this.itemsPerRow);
            const col = i % this.itemsPerRow;
            
            // 计算x和y坐标（从content左上角开始计算，加上偏移量使锚点居中，考虑padding）
            // 额外增加20像素使所有关卡项往右移动
            const x = startX + col * (itemWidth + this.horizontalSpacing) + itemWidth / 2;
            const y = -(this.topPadding + row * (itemHeight + this.verticalSpacing) + itemHeight / 2);
            
            // 检查x坐标是否超出view范围
            const viewRightBoundary = view.getComponent(UITransform).width;
            const itemRightEdge = x + itemWidth / 2;
            if (itemRightEdge > viewRightBoundary) {
                console.warn(`关卡项${i+1}超出view右侧边界: x=${x}, 右边缘=${itemRightEdge}, view宽度=${viewRightBoundary}`);
            }
            
            // 设置位置
            child.setPosition(x, y);    
            
            // console.log(`关卡项${i+1} - 行列(${row}, ${col}) - x: ${x}, y: ${y}, 右边缘: ${itemRightEdge}`);
        }
        
        // 更新ScrollView的content偏移，确保显示顶部内容
        if (this.levelScrollView.scrollToTop) {
            this.levelScrollView.scrollToTop(0.1);
        }
    }
    
    /**
     * 设置关卡项
     * @param levelItem 关卡项节点
     * @param level 关卡号
     */
    setupLevelItem(levelItem: Node, level: number) {
        let levelNumber = levelItem.getChildByName('LevelNumber')?.getComponent(Label);
        
        const levelBg = levelItem.getChildByName('LevelBg')?.getComponent(Sprite);

        let suoBg = levelItem.getChildByName('suoBg')?.getComponent(Sprite);
        
        // 设置关卡号
        if (levelNumber) {
            levelNumber.string = ("第" + level.toString() + "关");
        }
        
        // 检查关卡是否解锁
        const isUnlocked = this.isLevelUnlocked(level);
        
        // 设置关卡背景
        if (levelBg) {
            // 根据关卡号选择对应的背景图
            if (level >= 21 && level <= 40) {
                levelBg.spriteFrame = this.levelUnlocked2 || this.levelUnlocked3;
            } else if (level >= 41 && level <= 60) {
                levelBg.spriteFrame = this.levelUnlocked3 || this.levelUnlocked4;
            } else if (level >= 61 && level <= 80) {
                levelBg.spriteFrame = this.levelUnlocked4 || this.levelUnlocked5;
            } else if (level >= 81 && level <= 100) {
                levelBg.spriteFrame = this.levelUnlocked5 || this.levelUnlocked6;
            } else if (level >= 101 && level <= 120) {
                levelBg.spriteFrame = this.levelUnlocked6 || this.levelUnlocked;
            } else {
                // 1-20关使用默认背景
                levelBg.spriteFrame = this.levelUnlocked;
            }
        }
        
        // 设置锁显示
        if (suoBg) {
            suoBg.node.active = !isUnlocked;
        }
        
        // 添加点击事件
        if (isUnlocked) {
            levelItem.on(Node.EventType.TOUCH_END, () => this.onLevelClick(level), this);
        } else {
            // 为未解锁关卡添加点击事件
            levelItem.on(Node.EventType.TOUCH_END, () => this.showTips('当前关卡未解锁。'), this);
        }
    }
    
    showTips(msg: string) {
        loadPool.ins.getPoolNode('tips', this.node)
        director.emit(emits.tipMsg, msg)
    }

    /**
     * 检查关卡是否解锁
     * @param level 关卡号
     * @returns 是否解锁
     */
    isLevelUnlocked(level: number): boolean {
        // 使用GameData中统一的解锁逻辑
        return gameConfig.nowLevel >= level;
    }
    
    /**
     * 关卡点击事件
     * @param level 关卡号
     */
    onLevelClick(level: number) {
        // 检查体力是否足够
        if (mGameData.currentStamina < 1) {
            loadPool.ins.getPoolNode('tips', this.node.parent);
            director.emit(emits.tipMsg, '体力不足，请稍后再试。');
            return;
        }
        
        // 检查是否是第一关且第一次点击
        if (level === 1) {
            const hasSeenStoryKey = this.getHasSeenStoryKey();
            const hasSeenStory = load(hasSeenStoryKey, 0);
            if (!hasSeenStory) {
                // 消耗体力
                mGameData.ConsumeStamina(1);
                // 显示剧情弹窗
                loadPool.ins.getPoolNode('StoryWnd', this.node.parent);
                // 记录到本地存储（基于用户ID）
                save(hasSeenStoryKey, 1);
                // 保存要挑战的关卡到临时变量，不影响解锁进度
                gameConfig.tempLevel = level;

                // this.onBackClick()
                return;
            }
        }
        // 消耗体力
        mGameData.ConsumeStamina(1);
        audioTool.ins.stopMusic()
        // 保存要挑战的关卡到临时变量，不影响解锁进度
        gameConfig.tempLevel = level;
        // 加载游戏场景
        director.loadScene('main');
    }
    
    /**
     * 返回按钮点击事件
     */
    onBackClick() {
        // 隐藏当前关卡选择面板
        // this.node.active = false;
         tween(this.popUI).to(0.2, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }
}