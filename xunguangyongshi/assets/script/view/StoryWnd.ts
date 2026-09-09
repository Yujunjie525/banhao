import { _decorator, Component, Label, Node, RichText } from 'cc';
import { loadPool } from '../../scripts/res/loadPool';


const { ccclass, property } = _decorator;

@ccclass('StoryWnd')
export class StoryWnd extends Component {
    @property(RichText) r_story: RichText = null
    @property(Label) l_story: Label = null
    @property(Node) btn_jump: Node = null

    private storyLines: string[] = [];
    private currentLineIndex: number = 0;
    private lineInterval: number = 0.5;
    private charInterval: number = 0.05;
    private currentCharIndex: number = 0;
    private textTimers: any;
    private jumpButtonTimer: any;

    protected onEnable(): void {
        this.init()
    }

    init() {
        this.storyLines = [
            "宁静的星空湖畔倒映着巍峨的奇幻城堡，神秘的金属边框蓝色网格棋盘于湖心缓缓浮现。浓重的迷雾与致命的旋涡正悄然吞噬着星辰的残辉，掩盖了世界的真实面貌。此刻，一位身着银白轻甲、系着深蓝披风的少年踏入险境。在这星辰黯淡的危急存亡之刻，他唯有运用极致的智慧，在有限的步数内推演出最完美的路径，避开吞噬一切的暗影旋涡，将发光的【辉光晶石】精准推入指定的【星芒法阵】。每当晶石准确归位，便会释放出耀眼的光芒，一层层驱散四周浓重的迷雾。星空下的寻光谜局已然开启，快来将晶石全数归位，看清这世界的全貌，点亮这片暗夜吧！",
        ];
        
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.textTimers = [];
        
        if(this.r_story){
            this.r_story.string = "";
        }
        if(this.l_story){
            this.l_story.string = "";
        }
        
        this.showNextLine();
        
        if(this.btn_jump){
            this.btn_jump.active = false;
            this.jumpButtonTimer = setTimeout(()=>{
                this.btn_jump.active = true;
                this.btn_jump.on(Node.EventType.TOUCH_END,this.skipStory,this);
            }, 3000);
        }
    }

    private showNextLine(){
        if(this.currentLineIndex < this.storyLines.length && this.l_story){
            const currentLine = this.storyLines[this.currentLineIndex];
            
            if(this.currentCharIndex < currentLine.length){
                this.l_story.string += currentLine.charAt(this.currentCharIndex);
                this.currentCharIndex++;

                const timerId = setTimeout(() => {
                    this.showNextLine();
                }, this.charInterval * 1000);
                
                this.textTimers.push(timerId);
            } else {
                if(this.currentLineIndex < this.storyLines.length - 1){
                    this.l_story.string += "\n";
                }
                
                this.currentCharIndex = 0;
                this.currentLineIndex++;
                
                if(this.currentLineIndex < this.storyLines.length){
                    const timerId = setTimeout(() => {
                        this.showNextLine();
                    }, this.lineInterval * 500);
                
                    this.textTimers.push(timerId);
                }
            }
        }
    }
    
    skipStory(){
        if(this.textTimers && Array.isArray(this.textTimers)){
            this.textTimers.forEach(timerId => {
                clearTimeout(timerId);
            });
            this.textTimers = [];
        }
        
        if(this.jumpButtonTimer){
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
        
        if(this.btn_jump){
            this.btn_jump.off(Node.EventType.TOUCH_END,this.skipStory,this);
        }
        
        loadPool.ins.huiShouNode(this.node)
    }
}
