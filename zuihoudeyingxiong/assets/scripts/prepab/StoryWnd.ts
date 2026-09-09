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
            "狂风卷着千年黄沙，掠过废土上残破的部落遗迹。当文明的火种即将熄灭，你，便是部落最后的英雄。踏上这场永不停歇的向右狂奔，在锈蚀的金属地刺与坍塌的石木废墟间腾挪跳跃，用手中的武器击碎一切阻挡。时刻紧盯左上角的生命与能量条，每一次精准的闪避，每一声震耳的枪响，都是对生存最炽热的渴望。为了部落最后的荣光，奔跑吧！用你脚下丈量的极限距离，书写属于废土英雄的不朽传奇。",
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
                } else {
                    const timerId = setTimeout(() => {
                        this.skipStory();
                    }, 1000);
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