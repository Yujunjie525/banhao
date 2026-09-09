
const {ccclass, property} = cc._decorator;

var ins;
@ccclass
export default class TipsWndManager extends cc.Component {
    //弹窗预制体
    @property(cc.Prefab)
    TipsWndPrefab: cc.Prefab = null;
    
    //文本组件名
    textComponentName: string = "tips_content";
    
    //关闭按钮节点名
    closeBtnName: string = "BtnQR";
    
    //当前显示的弹窗节点
    private currentWndNode: cc.Node = null;
    
    //当前是否正在显示
    private isShowing: boolean = false;
    
    //自动隐藏定时器
    private hideTimer: any = -1;
    
    static GetIns(){
        return ins;
    }
    
    onLoad () {
        ins = this;
        this.ensureTopLayer();
        //将节点设置为常驻节点，确保在场景切换时不会被销毁
        // cc.game.addPersistRootNode(this.node);
    }
    
    start () {
    }

    private ensureTopLayer() {
        if (!this.node || !this.node.isValid) {
            return;
        }

        const scene = cc.director.getScene();
        if (!scene || !scene.isValid) {
            return;
        }

        if (this.node.parent !== scene) {
            const worldPos = this.node.parent
                ? this.node.parent.convertToWorldSpaceAR(this.node.getPosition())
                : this.node.getPosition();
            this.node.removeFromParent(false);
            scene.addChild(this.node);
            this.node.setPosition(scene.convertToNodeSpaceAR(worldPos));
        }

        this.node.zIndex = 30001;
        this.node.setSiblingIndex(scene.childrenCount - 1);
    }
    
    /**
     * 显示弹窗
     * @param content 要显示的文本内容
     * @param duration 显示时长（秒），默认2秒，0表示不自动隐藏
     */
    show(content: string, duration: number = 0) {
        if (!this.TipsWndPrefab) {
            console.error("TipsPrefab is not assigned!");
            return;
        }
        this.ensureTopLayer();
        
        //如果当前已有弹窗显示，先隐藏
        this.hide();
        
        //从预制体创建弹窗节点
        this.currentWndNode = cc.instantiate(this.TipsWndPrefab);
        //将弹窗节点添加到当前节点
        this.node.addChild(this.currentWndNode);
        //设置弹窗节点位置
        this.currentWndNode.setPosition(0, 0);
        //设置弹窗节点层级
        this.currentWndNode.zIndex = 10000;
        this.currentWndNode.setSiblingIndex(this.node.childrenCount - 1);
        
        //查找文本组件并设置内容
        const textNode = this.currentWndNode.getChildByName(this.textComponentName);
        if (textNode) {
            const label = textNode.getComponent(cc.Label);
            if (label) {
                label.string = content;
            } else {
                console.warn("Text component does not have cc.Label component!");
            }
        } else {
            console.warn(`Text component '${this.textComponentName}' not found in TipsPrefab!`);
        }
        
        //查找关闭按钮并添加事件监听
        const closeBtn = this.currentWndNode.getChildByName(this.closeBtnName);
        if (closeBtn) {
            closeBtn.on(cc.Node.EventType.TOUCH_END, this.hide, this);
        } else {
            console.warn(`Close button '${this.closeBtnName}' not found in TipsPrefab!`);
        }
        
        //标记为正在显示
        this.isShowing = true;
        
        //如果设置了自动隐藏时长，启动定时器
        if (duration > 0) {
            //清除之前的定时器
            this.clearHideTimer();
            //设置新的定时器
            this.hideTimer = setTimeout(() => {
                this.hide();
            }, duration * 1000);
        }
    }
    
    /**
     * 隐藏弹窗
     */
    hide() {
        if (this.currentWndNode) {
            //移除关闭按钮事件监听
            const closeBtn = this.currentWndNode.getChildByName(this.closeBtnName);
            if (closeBtn) {
                closeBtn.off(cc.Node.EventType.TOUCH_END, this.hide, this);
            }
            
            //销毁弹窗节点
            this.currentWndNode.destroy();
            this.currentWndNode = null;
        }
        
        //标记为未显示
        this.isShowing = false;
        
        //清除定时器
        this.clearHideTimer();
    }
    
    /**
     * 切换弹窗显示状态
     * @param content 要显示的文本内容，如果不提供则只切换显示状态
     * @param duration 显示时长（秒），默认2秒
     */
    toggle(content?: string, duration: number = 0) {
        if (this.isShowing) {
            this.hide();
        } else if (content) {
            this.show(content, duration);
        }
    }
    
    /**
     * 清除自动隐藏定时器
     */
    private clearHideTimer() {
        if (this.hideTimer !== -1) {
            clearTimeout(this.hideTimer);
            this.hideTimer = -1;
        }
    }
    
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content 要显示的文本内容
     * @param duration 显示时长（秒），默认2秒
     */
    static show(content: string, duration: number = 0) {
        if (ins) {
            ins.show(content, duration);
        } else {
            console.error("TipsWnd instance not found!");
        }
    }
    
    /**
     * 全局静态方法，方便其他类直接调用
     */
    static hide() {
        if (ins) {
            ins.hide();
        } else {
            console.error("TipsWnd instance not found!");
        }
    }
    
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content 要显示的文本内容，如果不提供则只切换显示状态
     * @param duration 显示时长（秒），默认2秒
     */
    static toggle(content?: string, duration: number = 0) {
        if (ins) {
            ins.toggle(content, duration);
        } else {
            console.error("TipsWnd instance not found!");
        }
    }
    
    /**
     * 检查弹窗是否正在显示
     * @returns 是否正在显示
     */
    static isVisible(): boolean {
        return ins ? ins.isShowing : false;
    }
    
    onDestroy() {
        //清除定时器
        this.clearHideTimer();
        
        //隐藏当前弹窗
        this.hide();
        
        ins = null;
    }
}
