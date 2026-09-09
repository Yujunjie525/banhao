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
            "黑雾降临后的阿斯塔伦大陆，诗歌被视为禁忌，文明在魔王诅咒中逐渐崩塌。传说中记载万物智慧的《圣诗篇》被撕裂封印，残缺的古诗字符散落于魔物体内，化作扭曲的魔印污染世间。你作为最后的“吟游勇者”，踏入被遗忘的荒原，在无数真假字符中寻找正确碎片。每一次选择都可能释放文明火种，也可能让诅咒更加深重。当尘封千年的诗句重新拼合，人类失落的记忆，也将在战火中重新苏醒。",
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
