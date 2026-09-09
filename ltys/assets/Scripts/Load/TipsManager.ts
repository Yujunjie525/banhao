
const {ccclass, property} = cc._decorator;

var ins;
const DEFAULT_TIPS_PREFAB_UUID = "a1554dd1-995f-4d8c-afbb-fc79a3012fa5";
const PERSIST_TIPS_NODE_NAME = "__GlobalTipsManager";

@ccclass
export default class TipsManager extends cc.Component {
    //Tips预制体
    @property(cc.Prefab)
    TipsPrefab: cc.Prefab = null;
    //文本组件名
    textComponentName: string = "tips_label";
    //背景图组件名
    backgroundComponentName: string = "tips_bg";
    
    // 上一次显示Tips的时间
    private lastShowTime: number = 0;
    
    static GetIns(){
        return ins;
    }
    
    onLoad () {
        ins = this;
        //将节点设置为常驻节点，确保在场景切换时不会被销毁
        // cc.game.addPersistRootNode(this.node);
    }

    private static isValidInstance(instance: TipsManager): boolean {
        return !!(instance && instance.node && cc.isValid(instance.node));
    }

    private static ensureInstance(): TipsManager {
        if (TipsManager.isValidInstance(ins)) {
            ins.attachToCurrentCanvas();
            return ins;
        }

        ins = null;
        const node = new cc.Node(PERSIST_TIPS_NODE_NAME);
        const manager = node.addComponent(TipsManager);
        manager.attachToCurrentCanvas();
        ins = manager;
        return manager;
    }

    private attachToCurrentCanvas(): void {
        if (!this.node || !cc.isValid(this.node)) {
            return;
        }

        const scene = cc.director.getScene();
        const canvas = scene ? scene.getChildByName("Canvas") : null;
        const targetParent = canvas || scene;
        if (targetParent && this.node.parent !== targetParent) {
            this.node.parent = targetParent;
        }

        this.node.setPosition(0, 0);
        this.node.zIndex = 10000;
    }
    
    start () {
    }
    
    // update (dt) {}

    private loadDefaultTipsPrefab(callback: () => void): void {
        if (this.TipsPrefab) {
            callback();
            return;
        }

        cc.loader.load({ uuid: DEFAULT_TIPS_PREFAB_UUID }, (err: any, prefab: cc.Prefab) => {
            if (err || !prefab) {
                console.warn("Load default TipsPrefab failed:", err);
                callback();
                return;
            }

            this.TipsPrefab = prefab;
            callback();
        });
    }

    private showFallbackTips(content: string, moveDistance: number, displayDuration: number): void {
        if (!this.node || !cc.isValid(this.node)) {
            return;
        }

        const tipsNode = new cc.Node("Tips");
        this.node.addChild(tipsNode);
        tipsNode.setPosition(0, 0);
        tipsNode.zIndex = 10000;

        const bgNode = new cc.Node(this.backgroundComponentName);
        bgNode.opacity = 150;
        const bgWidth = Math.max(content.length * 20 + 60, 160);
        const bgHeight = 44;
        bgNode.setContentSize(bgWidth, bgHeight);
        const bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = cc.Color.BLACK;
        bgGraphics.rect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
        bgGraphics.fill();
        tipsNode.addChild(bgNode);

        const labelNode = new cc.Node(this.textComponentName);
        const label = labelNode.addComponent(cc.Label);
        label.string = content;
        label.fontSize = 24;
        label.lineHeight = 30;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = cc.Color.WHITE;
        tipsNode.addChild(labelNode);

        const sequence = cc.sequence(
            cc.fadeIn(0.3),
            cc.delayTime(Math.max(displayDuration, 0.1)),
            cc.spawn(cc.moveBy(0.3, cc.v2(0, moveDistance)), cc.fadeOut(0.3)),
            cc.callFunc(() => tipsNode.destroy())
        );
        tipsNode.runAction(sequence);
    }
    
    /**
     * 显示Tips
     * @param content Tips内容
     * @param duration 显示总时长（秒），默认1.3秒（包含淡入0.3秒 + 显示0.7秒 + 淡出上移0.3秒）
     * @param moveDistance 上移距离，默认100
     * @param displayDuration 中间显示时长（秒），默认0.7秒（可单独设置，优先级高于duration）
     * @param cd 冷却时间（秒），默认0.5秒，在该时间内相同内容的Tips不会重复显示
     */
    showTips(content: string, duration: number = 1.3, moveDistance: number = 100, displayDuration: number = 0.5, cd: number = 0.5) {
        content = this.ensureSentenceEnding(content);
        if (!this.node || !cc.isValid(this.node)) {
            TipsManager.show(content, duration, moveDistance, displayDuration, cd);
            return;
        }

        this.attachToCurrentCanvas();

        if (!this.TipsPrefab) {
            this.loadDefaultTipsPrefab(() => {
                if (this.TipsPrefab) {
                    this.showTips(content, duration, moveDistance, displayDuration, cd);
                } else {
                    this.showFallbackTips(content, moveDistance, displayDuration);
                }
            });
            return;
        }
        
        // CD检查：防止短时间内重复显示相同内容的Tips
        const currentTime = Date.now();
        if (currentTime - this.lastShowTime < cd * 1000) {
            return;
        }
        this.lastShowTime = currentTime;
        
        //直接使用cc.instantiate创建Tips节点
        let tipsNode = cc.instantiate(this.TipsPrefab);
        //将Tips节点添加到当前节点
        this.node.addChild(tipsNode);
        //设置Tips节点位置在屏幕中央
        tipsNode.setPosition(0, 0);
        //设置Tips节点层级
        tipsNode.zIndex = 10000;
        
        //查找文本组件并设置内容
        let textComponent = tipsNode.getChildByName(this.textComponentName);
        if (textComponent) {
            let label = textComponent.getComponent(cc.Label);
            if (label) {
                label.string = content;
                
                //计算文本的实际宽度
                let textWidth = 0;
                label.overflow = cc.Label.Overflow.NONE; //确保不自动换行
                
                //使用类型断言避免TypeScript错误
                const anyLabel = label as any;
                const anyNode = label.node as any;
                
                //强制更新渲染数据
                if (anyNode._forceUpdateRenderData) {
                    anyNode._forceUpdateRenderData();
                } else if (anyLabel._forceUpdateRenderData) {
                    anyLabel._forceUpdateRenderData();
                } else {
                }
                
                //尝试多种方式获取文本宽度
                //方法1: getBoundingBox
                let bbWidth = anyNode.getBoundingBox().width;
                
                //方法2: getBoundingBoxToWorld
                let bbwWidth = anyNode.getBoundingBoxToWorld().width;
                
                //方法3: label._contentWidth
                let contentWidth = anyLabel._contentWidth || 0;
                
                //方法4: label._width
                let labelWidth = anyLabel._width || 0;
                
                //方法5: 估算宽度
                let estimatedWidth = content.length * label.fontSize * 0.5;
                
                //选择最大的有效宽度
                textWidth = Math.max(bbWidth, bbwWidth, contentWidth, labelWidth, estimatedWidth);
                
                //查找背景图组件并调整宽度
                let backgroundComponent = tipsNode.getChildByName(this.backgroundComponentName);
                if (backgroundComponent) {
                    //根据文本宽度调整背景图宽度，添加适当的边距
                    let padding = 40; //左右各20px边距
                    let minWidth = 100; //最小宽度
                    let newWidth = Math.max(textWidth + padding, minWidth);
                    
                    //设置背景图新的宽度，保持高度不变
                    backgroundComponent.width = newWidth;
                    
                    //如果需要，也可以调整背景图的缩放模式
                    let sprite = backgroundComponent.getComponent(cc.Sprite);
                    if (sprite) {
                        sprite.type = cc.Sprite.Type.SLICED;
                    }
                }
            } else {
                console.warn("Text component does not have cc.Label component!");
            }
        } else {
            console.warn("Text component not found in TipsPrefab!");
        }
        
        //创建动画序列
        let fadeIn = cc.fadeIn(0.3);
        //计算中间显示时长：优先使用displayDuration参数，如果未设置则从总时长中减去淡入淡出时间
        let actualDisplayDuration = displayDuration > 0 ? displayDuration : (duration - 0.6);
        //确保显示时长不会为负数
        actualDisplayDuration = Math.max(actualDisplayDuration, 0.1);
        let displayDelay = cc.delayTime(actualDisplayDuration);
        //上移动画和淡出动画同时进行（时长0.3秒）
        let moveUp = cc.moveBy(0.3, cc.v2(0, moveDistance));
        let fadeOut = cc.fadeOut(0.3);
        let moveAndFadeOut = cc.spawn(moveUp, fadeOut);
        let removeSelf = cc.callFunc(() => {
            //直接销毁节点
            tipsNode.destroy();
        });
        
        //执行动画
        let sequence = cc.sequence(
            fadeIn,          //淡入（0.3秒）
            displayDelay,    //中间显示时长（由displayDuration参数控制）
            moveAndFadeOut,  //同时执行上移和淡出动画（0.3秒）
            removeSelf       //销毁节点
        );
        
        // console.log(`Tips动画时间设置：总时长≈${0.3 + actualDisplayDuration + 0.3}秒（淡入0.3秒 + 显示${actualDisplayDuration}秒 + 淡出上移0.3秒）`);
        
        tipsNode.runAction(sequence);
    }

    private ensureSentenceEnding(content: string): string {
        const text = String(content || '').trim();
        return !text || /[。！？!?….][”’"'）】》]?$/.test(text) ? text : text + '。';
    }
    
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content Tips内容
     * @param duration 显示总时长（秒），默认1.3秒
     * @param moveDistance 上移距离，默认100
     * @param displayDuration 中间显示时长（秒），默认0.7秒（可单独设置，优先级高于duration）
     * @param cd 冷却时间（秒），默认0.5秒，在该时间内相同内容的Tips不会重复显示
     */
    static show(content: string, duration: number = 1.3, moveDistance: number = 100, displayDuration: number = 0.5, cd: number = 0.5) {
        TipsManager.ensureInstance().showTips(content, duration, moveDistance, displayDuration, cd);
    }
    
    /**
     * 静态方法：计算文本宽度
     * 不需要挂在节点上也能调用，用于调整背景图长度
     * @param content 文本内容
     * @param fontName 字体名称
     * @param fontSize 字体大小
     * @param lineHeight 行高
     * @returns 文本宽度
     */
    static calculateTextWidth(content: string, fontName: string = "", fontSize: number = 20, lineHeight: number = 24): number {
        //创建一个临时节点
        let tempNode = new cc.Node();
        
        //添加Label组件
        let label = tempNode.addComponent(cc.Label);
        
        //设置文本内容和样式
        label.string = content;
        if (fontName) {
            label.font = cc.loader.getRes(fontName, cc.Font);
        }
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        
        //获取文本宽度 - 使用boundingBox方法获取
        let textWidth = label.node.getBoundingBox().width;
        
        //销毁临时节点
        tempNode.destroy();
        
        return textWidth;
    }
    
    /**
     * 静态方法：调整背景图长度以适应文本
     * 不需要挂在节点上也能调用
     * @param backgroundNode 背景图节点
     * @param textContent 文本内容
     * @param fontName 字体名称
     * @param fontSize 字体大小
     * @param lineHeight 行高
     * @param padding 边距
     */
    static adjustBackgroundToText(backgroundNode: cc.Node, textContent: string, fontName: string = "", fontSize: number = 20, lineHeight: number = 24, padding: number = 20): void {
        if (!backgroundNode) {
            console.error("Background node is null!");
            return;
        }
        
        //计算文本宽度
        let textWidth = this.calculateTextWidth(textContent, fontName, fontSize, lineHeight);
        
        //调整背景图宽度
        let newWidth = textWidth + padding;
        backgroundNode.width = newWidth;
        
        //确保背景图使用SLICED模式以正确拉伸
        let sprite = backgroundNode.getComponent(cc.Sprite);
        if (sprite) {
            sprite.type = cc.Sprite.Type.SLICED;
        }
    }
}
