const {ccclass, property} = cc._decorator;


import GameApp from '../Game/GameApp';
import UserData from '../Game/UserData';
import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
import UserDataSyncManager from './UserDataSyncManager';


@ccclass
export default class LevelSelectManager extends cc.Component {
    @property(cc.ScrollView)
    levelScrollView: cc.ScrollView = null; // 关卡滚动组件
    
    @property(cc.Node)
    levelContainer: cc.Node = null; // 关卡列表容器（可选项，如果没有配置levelScrollView，将使用此节点）
    
    @property(cc.Prefab)
    levelItemPrefab: cc.Prefab = null; // 关卡项预制体
    
    // 一行显示的关卡数量
    itemsPerRow: number = 2;
    
    // 关卡项之间的水平间距
    horizontalSpacing: number = 22;
    
    // 关卡项之间的垂直间距
    verticalSpacing: number = 20;
    
    // 左边留出的空间
    leftPadding: number = 20;
    
    // 顶部留出的空间
    topPadding: number = 20;
    
    @property(cc.SpriteFrame)
    starFull: cc.SpriteFrame = null; // 实心星星图片
    
    @property(cc.SpriteFrame)
    starEmpty: cc.SpriteFrame = null; // 空心星星图片
    
    @property(cc.SpriteFrame)
    levelUnlocked: cc.SpriteFrame = null; // 解锁关卡图片
    
    @property(cc.SpriteFrame)
    levelUnlocked2: cc.SpriteFrame = null; // 解锁关卡图片 - 21-40关
    
    @property(cc.SpriteFrame)
    levelUnlocked3: cc.SpriteFrame = null; // 解锁关卡图片 - 41-60关
    
    @property(cc.SpriteFrame)
    levelUnlocked4: cc.SpriteFrame = null; // 解锁关卡图片 - 61-80关
    
    @property(cc.SpriteFrame)
    levelUnlocked5: cc.SpriteFrame = null; // 解锁关卡图片 - 81-100关
    
    @property(cc.SpriteFrame)
    levelUnlocked6: cc.SpriteFrame = null; // 解锁关卡图片 - 101-120关
    
    @property(cc.Node)
    closeBtn: cc.Node = null; // 关闭按钮
    
    // 从GameData获取总关卡数
    
    onLoad () {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        
        // 初始化关卡列表
        this.initLevelList();
    }
    
    /**
     * 初始化关卡列表
     */
    initLevelList() {
        // 确定关卡容器：优先使用ScrollView的content节点
        let container = this.levelContainer;
        if (this.levelScrollView) {
            container = this.levelScrollView.content;
        }
        
        if (!container || !this.levelItemPrefab) {
            console.error('关卡列表容器或预制体未设置');
            return;
        }
        
        // 清空现有关卡项
        container.removeAllChildren();
        
        // 从GameData获取总关卡数
        const totalLevels = mGameData.getTotalLevels();

        // 创建关卡项
        for (let i = 1; i <= totalLevels; i++) {
            const levelItem = cc.instantiate(this.levelItemPrefab);
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
        const itemWidth = item.width;
        const itemHeight = item.height;

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
        if (rowWidth > view.width) {
            console.warn(`一行所需宽度(${rowWidth})大于view宽度(${view.width})，可能无法完全显示${this.itemsPerRow}个关卡项`);
        }
        
        // 设置content的大小：宽度至少为一行所需宽度，高度根据行数计算
        content.width = Math.max(view.width, rowWidth);
        content.height = totalHeight;
        
        // 设置content的锚点为左上角
        content.anchorX = 0;
        content.anchorY = 1;
        
        // 设置content位置在view的左上角
        content.x = 0;
        content.y = 0;
    
        // 计算关卡项的起始位置，确保一行内的关卡项从左边padding开始排列
        const startX = this.leftPadding;
        
        // 设置关卡项的位置（网格布局，考虑顶部padding）
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            
            // 确保关卡项的锚点是中心
            child.anchorX = 0.5;
            child.anchorY = 0.5;
            
            // 计算当前关卡项所在的行列
            const row = Math.floor(i / this.itemsPerRow);
            const col = i % this.itemsPerRow;
            
            // 计算x和y坐标（从content左上角开始计算，加上偏移量使锚点居中，考虑padding）
            // 额外增加20像素使所有关卡项往右移动
            const x = startX + col * (itemWidth + this.horizontalSpacing) + itemWidth / 2;
            const y = -(this.topPadding + row * (itemHeight + this.verticalSpacing) + itemHeight / 2);
            
            // 检查x坐标是否超出view范围
            const viewRightBoundary = view.width;
            const itemRightEdge = x + itemWidth / 2;
            if (itemRightEdge > viewRightBoundary) {
                console.warn(`关卡项${i+1}超出view右侧边界: x=${x}, 右边缘=${itemRightEdge}, view宽度=${viewRightBoundary}`);
            }
            
            // 设置位置
            child.x = x;
            child.y = y;
            
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
    setupLevelItem(levelItem: cc.Node, level: number) {
        let levelNumber = levelItem.getChildByName('LevelNumber')?.getComponent(cc.Label);
        
        const levelBg = levelItem.getChildByName('LevelBg')?.getComponent(cc.Sprite);

        let suoBg = levelItem.getChildByName('suoBg')?.getComponent(cc.Sprite);
        // 查找星星容器（兼容大小写）
        let starsContainer = levelItem.getChildByName('Stars');
        
        // 设置关卡号
        if (levelNumber) {
            levelNumber.string = ("第" + level.toString() + "关");
        }
        
        // 检查关卡是否解锁
        const isUnlocked = this.isLevelUnlocked(level);
        
        // 设置关卡背景
        if (levelBg) {
            // 根据关卡配置的bg字段选择对应的背景图
            const levelConfig = mGameData.getLevelConfig(level);
            if (levelConfig && levelConfig.icon) {
                const bgName = levelConfig.icon;
                switch (bgName) {
                    case "level_1":
                        levelBg.spriteFrame = this.levelUnlocked;
                        break;
                    case "level_2":
                        levelBg.spriteFrame = this.levelUnlocked2 || this.levelUnlocked;
                        break;
                    case "level_3":
                        levelBg.spriteFrame = this.levelUnlocked3 || this.levelUnlocked;
                        break;
                    case "level_4":
                        levelBg.spriteFrame = this.levelUnlocked4 || this.levelUnlocked;
                        break;
                    case "level_5":
                        levelBg.spriteFrame = this.levelUnlocked5 || this.levelUnlocked;
                        break;
                    case "level_6":
                        levelBg.spriteFrame = this.levelUnlocked6 || this.levelUnlocked;
                        break;
                    default:
                        levelBg.spriteFrame = this.levelUnlocked;
                }
            } else {
                // 默认使用levelUnlocked
                levelBg.spriteFrame = this.levelUnlocked;
            }
        }
        
        // 设置锁显示
        if (suoBg) {
            suoBg.node.active = !isUnlocked;
        }
        
        // 设置星星显示
        if (starsContainer) {
            if (isUnlocked) {
                // 解锁关卡显示星星
                starsContainer.active = true;
                
                // 获取星星节点（按Star1、Star2、Star3命名查找）
                const star1 = starsContainer.getChildByName('Star1')?.getComponent(cc.Sprite);
                const star2 = starsContainer.getChildByName('Star2')?.getComponent(cc.Sprite);
                const star3 = starsContainer.getChildByName('Star3')?.getComponent(cc.Sprite);
                const stars = [star1, star2, star3].filter(star => star); // 过滤掉null
                
                const obtainedStars = mGameData.getLevelStars(level);
                
                // 调试信息
                // console.log(`关卡${level} - 解锁状态: ${isUnlocked}, 获得星星数: ${obtainedStars}, 星星节点数: ${stars.length}`);
                
                // 确保星星数量在合理范围内
                const validStars = Math.max(0, Math.min(obtainedStars, 3));
                
                // 设置星星状态
                for (let i = 0; i < stars.length; i++) {
                    if (stars[i]) {
                        // 确保有星星资源
                        if (i < validStars && this.starFull) {
                            stars[i].spriteFrame = this.starFull;
                        } else if (this.starEmpty) {
                            stars[i].spriteFrame = this.starEmpty;
                        } else {
                            console.warn(`关卡${level} - 星星资源未设置`);
                        }
                    }
                }
            } else {
                // 锁定关卡隐藏星星节点
                starsContainer.active = false;
                // console.log(`关卡${level} - 锁定状态，隐藏星星`);
            }
        } else {
            console.warn(`关卡${level} - 星星容器未找到`);
        }
        
        // 添加点击事件
        if (isUnlocked) {
            levelItem.on(cc.Node.EventType.TOUCH_END, () => this.onLevelClick(level), this);
        } else {
            // 为未解锁关卡添加点击事件
            levelItem.on(cc.Node.EventType.TOUCH_END, () => TipsManager.show('当前关卡未解锁。'), this);
        }
    }
    
    /**
     * 检查关卡是否解锁
     * @param level 关卡号
     * @returns 是否解锁
     */
    isLevelUnlocked(level: number): boolean {
        // 使用GameData中统一的解锁逻辑
        return mGameData.isLevelUnlocked(level);
    }
    
    /**
     * 关卡点击事件
     * @param level 关卡号
     */
    onLevelClick(level: number) {
        // 检查体力是否足够
        if (!mGameData.HasEnoughStamina()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
        
        // 消耗体力
        if (mGameData.ConsumeStamina()) {
            UserDataSyncManager.recordConsumedStamina();
        }
        
        // 设置当前关卡
        mGameData.currentLevel = level;
        mGameData.SaveLevelData();
        
        // 初始化关卡游戏
        mGameData.initLevelGame();
        
        UserData.Instance.saveUserData()
        // 加载游戏场景
        cc.audioEngine.stopMusic();
        cc.director.loadScene('Game');
    }
    
    /**
     * 返回按钮点击事件
     */
    onBackClick() {
        // 隐藏当前关卡选择面板
        this.node.active = false;
    }
}
