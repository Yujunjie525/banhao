import { _decorator, Component, director, Label, Node, RichText, tween, UIOpacity, Vec3 } from 'cc';
import { emits } from '../data/enmus';
import { loadPool } from '../res/loadPool';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('StoryWnd')
export class StoryWnd extends Component {
    @property(RichText) r_story: RichText = null
    @property(Label) l_story: Label = null
    @property(Node) btn_jump: Node = null
    // 剧情文本数组
    private storyLines: string[] = [];
    // 当前显示的行索引
    private currentLineIndex: number = 0;
    // 文本显示间隔时间（秒）
    private lineInterval: number = 0.5;
    // 字符显示间隔时间（秒）
    private charInterval: number = 0.05;
    // 当前行的字符索引
    private currentCharIndex: number = 0;
    // 文本显示定时器ID数组
    private textTimers: any;
    // 跳过按钮启用定时器ID
    private jumpButtonTimer: any;

    protected onEnable(): void {
        this.init()
    }
    init() {

        // 初始化剧情文本数组（示例为十几行文本）
        this.storyLines = [
            "远处的号角声、沉重的战鼓声、生锈铁门的开启声。",
            "一扇巨大的石门缓缓打开，",
            "露出堆积如山的盾牌、金币和卷轴杂乱无章地堆叠在一起。",
            "老骑士： “听着，新兵！前线的烽火已经点燃，",
            "但我们的物资却像被巨龙翻过一样乱！",
            "国王不需要只会挥剑的蛮力，我们需要的是秩序。",
            "这里就是‘试炼宝库’，也是你的战场。",
            "只有在背囊塞满之前，将这些物资分类打包发出，",
            "你才配戴上这枚‘勇士勋章’！”",
        ];
        
        // 重置当前行索引和字符索引
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        
        // 初始化定时器数组
        this.textTimers = [];
        
        // 清空当前文本
        if(this.r_story){
            this.r_story.string = "";
        }
        if(this.l_story){
            this.l_story.string = "";
        }
        // 开始逐行显示文本
        this.showNextLine();
        
        // 禁用跳过按钮
        if(this.btn_jump){
            this.btn_jump.active = false;
            // 3秒后启用跳过按钮
            this.jumpButtonTimer = setTimeout(()=>{
                this.btn_jump.active = true;
                this.btn_jump.on(Node.EventType.TOUCH_END,this.skipStory,this);
            }, 3000); // setTimeout使用毫秒
        }
    }

     /**
     * 逐行逐字显示剧情文本
     */
    private showNextLine(){
        if(this.currentLineIndex < this.storyLines.length && this.l_story){
            const currentLine = this.storyLines[this.currentLineIndex];
            
            if(this.currentCharIndex < currentLine.length){
                // 只添加粗体效果
                this.l_story.string += currentLine.charAt(this.currentCharIndex);
                this.currentCharIndex++;

                // 调度显示下一个字符
                const timerId = setTimeout(() => {
                    this.showNextLine();
                }, this.charInterval * 1000); // setTimeout使用毫秒
                
                // 存储定时器ID，以便后续清除
                this.textTimers.push(timerId);
            } else {
                // 当前行显示完成，添加换行符（如果不是最后一行）
                if(this.currentLineIndex < this.storyLines.length - 1){
                    this.l_story.string += "\n";
                }
                
                // 重置字符索引，准备显示下一行
                this.currentCharIndex = 0;
                
                // 增加行索引
                this.currentLineIndex++;
                
                // 调度显示下一行
                if(this.currentLineIndex < this.storyLines.length){
                    const timerId = setTimeout(() => {
                        this.showNextLine();
                    }, this.lineInterval * 500); // setTimeout使用毫秒
                
                    // 存储定时器ID，以便后续清除
                    this.textTimers.push(timerId);
                } else {
                    // 所有文本显示完成，延迟1秒后自动开始游戏
                    const timerId = setTimeout(() => {
                        this.skipStory();
                    }, 1000);
                    this.textTimers.push(timerId);
                }
            }
        }
    }
    
    /**
     * 跳过剧情
     */
    skipStory(){
        // 清除所有JavaScript定时器
        if(this.textTimers && Array.isArray(this.textTimers)){
            this.textTimers.forEach(timerId => {
                clearTimeout(timerId);
            });
            this.textTimers = [];
        }
        
        // 清除跳过按钮启用定时器
        if(this.jumpButtonTimer){
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
        
        // 隐藏剧情弹窗
        loadPool.ins.huiShouNode(this.node)
        
        // 移除跳过按钮的点击事件
        if(this.btn_jump){
            this.btn_jump.off(Node.EventType.TOUCH_END,this.skipStory,this);
        }
        
        // 加载游戏场景
        director.loadScene('main');
    }
}


