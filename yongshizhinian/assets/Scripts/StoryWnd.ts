import { _decorator, Component, director, Label, Node, RichText, tween, UIOpacity, Vec3 } from 'cc';
import { emits } from './enmus';
import { loadPool } from './loadPool';
import { gameConfig } from './gameConfig';
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
            "冰冷的石砖透着刺骨的寒意，微弱的火光在错综复杂的地牢迷宫中摇曳。壮壮粗重地喘息着，紧握双手的骨节早已泛白。黑暗深处，凄厉的嘶吼声此起彼伏，无数双狰狞的红影正从前方如潮水般疯狂涌现。误入禁地，无路可退，唯有向前！在极度紧张刺激的生死边缘，生与死只在毫厘的走位之间。每一次灵活的躲闪，每一次惊险的突围，都是向着重见天日的渴望迈进。踏入深渊的这一刻起，命运已交由你的指尖。握紧方向键，冲破黑暗，去为执念而战吧！",
            
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
        
        // 移除跳过按钮的点击事件
        if(this.btn_jump){
            this.btn_jump.off(Node.EventType.TOUCH_END,this.skipStory,this);
        }
        
        // 隐藏剧情弹窗（不加载战斗场景，回到主界面）
        loadPool.ins.huiShouNode(this.node)
    }
}


