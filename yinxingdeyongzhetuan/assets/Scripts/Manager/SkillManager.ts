const {ccclass, property} = cc._decorator;
import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
import UserDataSyncManager from './UserDataSyncManager';

@ccclass
export default class SkillManager extends cc.Component {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    skillItemPrefab: cc.Prefab = null;


    // 技能数据结构
    private skills: Array<{
        id: number;
        name: string;
        level: number;
        maxLevel: number;
        description: string;
        icon: string;
        baseEffect: number;
        effectPerLevel: number;
        upgradeCost: number;
        costIncreasePerLevel: number;
    }> = [];

    protected onLoad(): void {
        // 初始化关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }

        // 初始化技能数据
        this.initSkills();

        // 刷新滚动列表
        this.refreshScrollView();

        // 更新金币数量
        this.updateDiamondLabel();
    }

    /**
     * 初始化技能数据
     */
    private initSkills(): void {
        mGameData.GetSkillsData();
        // 从 GameData 获取技能数据，如果没有则使用默认数据
        if (mGameData.skills && mGameData.skills.length > 0) {
            this.skills = mGameData.skills;
        }
    }


    /**
     * 刷新滚动列表
     */
    private refreshScrollView(): void {
        if (!this.scrollView || !this.skillItemPrefab || !this.scrollView.content) {
            console.error('ScrollView or skillItemPrefab not assigned');
            return;
        }

        // 清空容器
        this.scrollView.content.removeAllChildren();

        // 遍历技能数据，创建技能项
        for (let i = 0; i < this.skills.length; i++) {
            const skillData = this.skills[i];

            // 创建技能项节点
            const skillItem = cc.instantiate(this.skillItemPrefab);
            this.scrollView.content.addChild(skillItem);

            // 设置技能项数据
            this.setSkillItemData(skillItem, skillData);
        }

        // 调整容器大小
        this.adjustContainerSize();
    }

    /**
     * 设置技能项数据
     */
    private setSkillItemData(skillItem: cc.Node, skillData: any): void {
        // 找到各个节点
        const iconNode = skillItem.getChildByName('icon');
        const nameNode = skillItem.getChildByName('name');
        const descriptionNode = skillItem.getChildByName('description');
        const nextLevelNode = skillItem.getChildByName('nextLevel');
        const upgrade = skillItem.getChildByName("upgrade")
        const upgradeButton = upgrade.getComponent(cc.Button);
        const costNode = upgrade.getChildByName('cost');
        // 设置图标
        if (iconNode) {
            const spriteComponent = iconNode.getComponent(cc.Sprite);
            if (spriteComponent) {
                const iconPath = `zImg2/${skillData.icon}`;
                cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        console.error(`加载${iconPath}失败:`, err);
                    } else {
                        spriteComponent.spriteFrame = spriteFrame;
                    }
                });
            }
        }

        // 设置技能名称和等级
        if (nameNode) {
            nameNode.getComponent(cc.Label).string = `${skillData.name} ${skillData.level}级`;
        }

        // 设置技能描述和等级加成
        if (descriptionNode) {
            const currentEffect = skillData.baseEffect + (skillData.level - 1) * skillData.effectPerLevel;
            descriptionNode.getComponent(cc.Label).string = `${skillData.description}\n当前效果：+${currentEffect}`;
        }

        // 设置下一级效果
        if (nextLevelNode) {
            if (skillData.level >= skillData.maxLevel) {
                nextLevelNode.getComponent(cc.Label).string = '已满级';
            } else {
                const nextEffect = skillData.baseEffect + skillData.level * skillData.effectPerLevel;
                const effectIncrease = skillData.effectPerLevel;
                nextLevelNode.getComponent(cc.Label).string = `下级效果：+${effectIncrease}`;
            }
        }

        // 设置升级成本
        if (costNode) {
            if (skillData.level >= skillData.maxLevel) {
                costNode.getComponent(cc.Label).string = '已满级';
            } else {
                const currentCost = skillData.upgradeCost + (skillData.level - 1) * skillData.costIncreasePerLevel;
                costNode.getComponent(cc.Label).string = `${currentCost}`;
            }
        }

        // 设置升级按钮
        if (upgradeButton) {
            if (skillData.level >= skillData.maxLevel) {
                // 已满级，禁用按钮
                upgradeButton.interactable = false;
                // 设置按钮为灰色
                const buttonSprite = upgradeButton.node.getComponent(cc.Sprite);
                if (buttonSprite) {
                    buttonSprite.node.color = cc.Color.GRAY;
                }
            } else {
                // 未满级，设置按钮点击事件
                upgradeButton.interactable = true;
                upgradeButton.node.on(cc.Node.EventType.TOUCH_END, () => this.onUpgradeClick(skillData.id), this);
            }
        }
    }

    /**
     * 调整容器大小
     */
    private adjustContainerSize(): void {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView或content节点未设置');
            return;
        }

        const container = this.scrollView.content;
        const children = container.children;

        if (children.length === 0) {
            return;
        }

        // 获取技能项的大小（使用第一个技能项作为参考）
        const item = children[0];
        const itemWidth = item.width;
        const itemHeight = item.height;

        // 获取view节点宽度
        const view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('未找到view节点');
            return;
        }
        const viewWidth = view.width;

        // 技能项之间的垂直间距
        const verticalSpacing = 15;

        // 技能项的内边距
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

        // 设置技能项的位置（垂直布局，居中显示）
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // 设置技能项的位置，从顶部开始排列，考虑y方向padding和技能项高度
            child.y = -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing);
            // 居中显示，考虑x方向padding：(view宽度 - 技能项宽度 - 2 * xPadding) / 2 + xPadding
            child.x = (viewWidth - itemWidth - 2 * xPadding) / 2-10;
        }

        // 更新ScrollView的content偏移，确保显示顶部内容
        // if (this.scrollView.scrollToTop) {
        //     this.scrollView.scrollToTop(0.1);
        // }
    }

    /**
     * 升级按钮点击事件
     */
    private onUpgradeClick(skillId: number): void {
        // 找到对应的技能
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) return;

        // 检查是否已满级
        if (skill.level >= skill.maxLevel) {
            console.log('技能已满级');
            return;
        }

        // 计算升级成本
        const upgradeCost = skill.upgradeCost + (skill.level - 1) * skill.costIncreasePerLevel;

        // 检查金币是否足够
        if (mGameData.currentGold < upgradeCost) {
            console.log('金币不足');
            // 显示金币不足提示
            this.showToast('钻石不足。');
            return;
        }

        // 扣除金币
        mGameData.currentGold -= upgradeCost;

        // 提升技能等级
        skill.level++;

        // 保存技能数据
        mGameData.skills = this.skills;
        mGameData.SaveSkillsData();

        // 保存金币数量
        mGameData.SaveGoldData();
        UserDataSyncManager.requestUpload();

        // 更新金币数量
        this.updateDiamondLabel();

        // 通知主界面金币数量更新
        cc.director.emit('goldUpdated');

        // 刷新滚动列表
        this.refreshScrollView();

        // 显示升级成功提示
        this.showToast('升级成功。');
    }

    /**
     * 关闭按钮点击事件
     */
    private onCloseClick(): void {
        this.node.active = false;
    }

    /**
     * 更新金币数量显示
     */
    private updateDiamondLabel(): void {
        // if (this.diamondLabel) {
        //     this.diamondLabel.string = mGameData.currentGold.toString();
        // }
    }

    /**
     * 显示提示信息
     */
    private showToast(message: string): void {
        // 这里可以实现一个简单的提示框
        // console.log(message);
        // 实际项目中可以使用更复杂的提示系统
        TipsManager.show(message);
    }

    /**
     * 显示技能强化界面
     */
    public show(): void {
        this.node.active = true;
        // 刷新技能数据
        this.initSkills();
        // 刷新滚动列表
        this.refreshScrollView();
        // 更新金币数量
        this.updateDiamondLabel();
    }

    /**
     * 隐藏技能强化界面
     */
    public hide(): void {
        this.node.active = false;
    }
}
