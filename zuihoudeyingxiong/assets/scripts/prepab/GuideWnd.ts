import { _decorator, Component, Node, Label, Sprite, sys, director, tween, Vec3 } from 'cc';
import { localData, emits } from '../../script/data/enums';
import { load, save } from '../../script/utils/tools';
import { gameConfig } from '../../script/data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('GuideWnd')
export class GuideWnd extends Component {
    @property(Node) jumpBtn: Node = null;
    @property(Node) atkBtn: Node = null;
    @property(Label) guideText: Label = null;
    @property(Node) handIcon: Node = null;

    private guideStep: number = 0; // 0: 未开始, 1: 引导跳跃, 2: 引导攻击, 3: 完成
    private hasCompletedKey: string = '';

    protected onEnable(): void {
        this.init();
    }

    private init() {
        this.guideStep = 1;
        this.hasCompletedKey = this.getHasCompletedGuideKey();
        
        this.showJumpGuide();
    }

    private getHasCompletedGuideKey(): string {
        const userId = sys.localStorage.getItem('SLS_USER_ID') || 'default';
        return `${localData.hasCompletedGuide}_${userId}`;
    }

    private showJumpGuide() {
        if (this.guideText) {
            this.guideText.string = '“前方有致命地刺!点击这里进行跳跃!”';
        }
        
        if (this.handIcon && this.jumpBtn) {
            this.handIcon.active = true;
            // 将手指图标设置为跳跃按钮的子节点，自动跟随按钮位置
            this.handIcon.parent = this.jumpBtn;
            this.handIcon.setPosition(50, -50); // 相对于按钮中心
            // 添加放大缩小动画
            this.playHandAnimation();
        }
        
        // 监听跳跃按钮点击
        if (this.jumpBtn) {
            this.jumpBtn.on(Node.EventType.TOUCH_END, this.onJumpClicked, this);
        }
    }

    private showAtkGuide() {
        this.guideStep = 2;
        
        if (this.guideText) {
            this.guideText.string = '“点击这里开火，击败前面魔物!”';
        }
        
        if (this.handIcon && this.atkBtn) {
            this.handIcon.active = true;
            // 将手指图标设置为攻击按钮的子节点，自动跟随按钮位置
            this.handIcon.parent = this.atkBtn;
            this.handIcon.setPosition(50, -50); // 相对于按钮中心
            // 添加放大缩小动画
            this.playHandAnimation();
        }
        
        // 移除跳跃按钮监听，添加攻击按钮监听
        if (this.jumpBtn) {
            this.jumpBtn.off(Node.EventType.TOUCH_END, this.onJumpClicked, this);
        }
        
        if (this.atkBtn) {
            this.atkBtn.on(Node.EventType.TOUCH_END, this.onAtkClicked, this);
        }
    }
    
    private playHandAnimation() {
        if (!this.handIcon) return;
        
        // 重置缩放
        this.handIcon.setScale(1, 1, 1);
        
        // 创建循环的放大缩小动画
        tween(this.handIcon)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
            )
            .start();
    }

    private onJumpClicked() {
        if (this.guideStep === 1) {
            this.showAtkGuide();
        }
    }

    private onAtkClicked() {
        if (this.guideStep === 2) {
            this.completeGuide();
        }
    }

    private completeGuide() {
        this.guideStep = 3;
        
        // 保存引导完成状态
        save(this.hasCompletedKey, 1);
        
        // 隐藏引导界面
        this.node.active = false;
        
        // 恢复游戏（使用和其他地方一致的方式）
        gameConfig.gamePause = 0;
        director.emit(emits.gamePause);
        
        // 清理监听
        if (this.jumpBtn) {
            this.jumpBtn.off(Node.EventType.TOUCH_END, this.onJumpClicked, this);
        }
        if (this.atkBtn) {
            this.atkBtn.off(Node.EventType.TOUCH_END, this.onAtkClicked, this);
        }
    }

    protected onDisable(): void {
        // 清理监听
        if (this.jumpBtn) {
            this.jumpBtn.off(Node.EventType.TOUCH_END, this.onJumpClicked, this);
        }
        if (this.atkBtn) {
            this.atkBtn.off(Node.EventType.TOUCH_END, this.onAtkClicked, this);
        }
    }
}