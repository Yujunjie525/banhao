import { _decorator, Component, director, Label, Node, tween, Vec3 } from 'cc';
import { emits } from './enmus';
import { loadPool } from './loadPool';
import { mGameData } from './GameData';
import DataManager from './Runtime/DataManager';
import { UIBattleScene } from './Scene/UIBattleScene';
import { SCENE_ENUM } from '../Enum';
import { gameConfig } from './gameConfig';
import { AudioMgr } from './Runtime/AudioMgr';
import { audioTool } from './audioTool';
const { ccclass, property } = _decorator;

@ccclass('LevelCompleteWnd')
export class LevelCompleteWnd extends Component {
    @property(Label) levelLabel: Label = null;
    @property(Node) btn_next: Node = null;
    @property(Node) btn_home: Node = null;
    @property(Node) btn_thripReward: Node = null;
    @property(Node) GemNode: Node = null;
    private popUI: Node;
    private tripRewardTimer: ReturnType<typeof setTimeout> | null = null;

    onLoad() {
        const currentLevel = DataManager.Instance.levelIndex;
        if (this.levelLabel) {
            this.levelLabel.string = `恭喜通关第 ${currentLevel} 关`;
        }
        this.btn_next.on(Node.EventType.TOUCH_END, this.onNextLevel, this)
        this.btn_home.on(Node.EventType.TOUCH_END, this.onBackHome, this)
        this.btn_thripReward.on(Node.EventType.TOUCH_END, this.onTripReward, this)
        
        
    }

    protected onDestroy(): void {
        if (this.tripRewardTimer) {
            clearTimeout(this.tripRewardTimer);
            this.tripRewardTimer = null;
        }
    }

    protected onEnable(): void {
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start()

        const currentLevel = DataManager.Instance.levelIndex;
        const isFirstCompletion = !gameConfig.isLevelCompleted(currentLevel);
        
        let baseReward = isFirstCompletion ? 100 : 10;
        let extraReward = gameConfig.hasRoleBonusGold() ? 100 : 0;
        let totalReward = baseReward + extraReward;
        
        if (this.GemNode) {
            this.GemNode.active = true;
            const gemLabel = this.GemNode.getComponentInChildren(Label);
            if (gemLabel) {
                gemLabel.string = `${totalReward}`;
            }
        }
    }

    onNextLevel() {
        // 清除可能存在的三倍奖励定时器，防止点击三倍后快速点击下一关导致跳转冲突
        if (this.tripRewardTimer) {
            clearTimeout(this.tripRewardTimer);
            this.tripRewardTimer = null;
        }
        
        // 检查体力是否足够并扣除体力
        if (!mGameData.ConsumeStamina(1)) {
            loadPool.ins.getPoolNode('tips', this.node.parent);
            director.emit(emits.tipMsg, '体力不足，请稍后再试。');
            return;
        }
        
        // 发放通关奖励
        const currentLevel = DataManager.Instance.levelIndex;
        gameConfig.awardLevelCompletion(currentLevel);
        
        // 关闭弹窗
        tween(this.popUI).to(0.2, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
            // 继续下一关
            DataManager.Instance.levelIndex++;
            console.log('准备进入下一关，当前关卡索引：', DataManager.Instance.levelIndex);
            
            // 直接调用 UIBattleScene 的 initLevel 方法
            const currentScene = director.getScene();
            console.log('当前场景：', currentScene.name);
            
            const battleScene = currentScene.getComponent(UIBattleScene);
            console.log('找到的 battleScene 组件：', battleScene);
            
            if (battleScene) {
                console.log('调用 battleScene.initLevel()');
                battleScene.initLevel();
            } else {
                console.warn('未找到 UIBattleScene 组件');
                // 如果找不到组件，直接重新加载场景
                // 保存当前关卡索引到 tempLevel，避免场景重新加载时重置为 1
                gameConfig.tempLevel = DataManager.Instance.levelIndex;
                console.log('保存临时关卡索引：', gameConfig.tempLevel);
                director.loadScene(SCENE_ENUM.BATTLE);
            }
        }).start()

    }

    onBackHome() {
        const currentLevel = DataManager.Instance.levelIndex;
        // 每次通关都给予奖励
        gameConfig.awardLevelCompletion(currentLevel);
        
        // 关闭弹窗
        loadPool.ins.huiShouNode(this.node)
        // 发送钻石数量更新事件
        director.emit('goldUpdated');

        // 关闭游戏内音乐和音效
        AudioMgr.inst.stop()
        // 同时停止 audioTool 的音乐，确保彻底关闭
        audioTool.ins.stopMusic();
        
        // 跳转到主界面
        director.loadScene('home');
    }

    onTripReward() {
        // 清除可能存在的三倍奖励定时器
        if (this.tripRewardTimer) {
            clearTimeout(this.tripRewardTimer);
            this.tripRewardTimer = null;
        }
        
        const currentLevel = DataManager.Instance.levelIndex;
        // 检查是否是第一次通关该关卡
        const isFirstCompletion = !gameConfig.isLevelCompleted(currentLevel);
        // 处理三倍奖励，不再存储是否领取过
        gameConfig.awardTripleLevelCompletion(currentLevel);
        
        // 显示提示
        loadPool.ins.getPoolNode('tips', this.node.parent);
        const rewardAmount = isFirstCompletion ? 300 : 30;
        director.emit(emits.tipMsg, `获得${rewardAmount}钻石奖励。`);
        
        // 检查体力是否足够进入下一关
        if (!mGameData.ConsumeStamina(1)) {
            // 体力不足，显示提示并返回主界面
            loadPool.ins.getPoolNode('tips', this.node.parent);
            director.emit(emits.tipMsg, '体力不足，返回主界面');
            
            // 关闭弹窗并返回主界面
            tween(this.popUI).to(0.2, { scale: new Vec3(0, 0, 1) }).call(() => {
                loadPool.ins.huiShouNode(this.node)
                // 发送钻石数量更新事件
                director.emit('goldUpdated');
                // 关闭游戏内音乐和音效
                AudioMgr.inst.stop()
                audioTool.ins.stopMusic();
                // 跳转到主界面
                director.loadScene('home');
            }).start()
            return;
        }
        
        // 体力足够，关闭弹窗并进入下一关
        tween(this.popUI).to(0.2, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
            // 继续下一关
            DataManager.Instance.levelIndex++;
            console.log('准备进入下一关，当前关卡索引：', DataManager.Instance.levelIndex);
            
            // 直接调用 UIBattleScene 的 initLevel 方法
            const currentScene = director.getScene();
            console.log('当前场景：', currentScene.name);
            
            const battleScene = currentScene.getComponent(UIBattleScene);
            console.log('找到的 battleScene 组件：', battleScene);
            
            if (battleScene) {
                console.log('调用 battleScene.initLevel()');
                battleScene.initLevel();
            } else {
                console.warn('未找到 UIBattleScene 组件');
                // 如果找不到组件，直接重新加载场景
                // 保存当前关卡索引到 tempLevel，避免场景重新加载时重置为 1
                gameConfig.tempLevel = DataManager.Instance.levelIndex;
                console.log('保存临时关卡索引：', gameConfig.tempLevel);
                director.loadScene(SCENE_ENUM.BATTLE);
            }
        }).start()
    }
}