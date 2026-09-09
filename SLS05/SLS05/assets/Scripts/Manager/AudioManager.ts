import mGameData from "../Data/GameData";


const {ccclass, property} = cc._decorator;
var ins;
@ccclass
export default class AudioManager extends cc.Component {
    //蚊子声
    @property(cc.AudioClip)
    Flykill:cc.AudioClip = null;

    //火球声
    @property(cc.AudioClip)
    Weakill:cc.AudioClip = null;

    //狐狸声音
    @property(cc.AudioClip)
    Foxkill:cc.AudioClip = null;
    
    //玩家死亡
    @property(cc.AudioClip)
    Fall:cc.AudioClip = null;

    //跳跃声音
    @property(cc.AudioClip)
    Jump:cc.AudioClip = null;

    //护盾音效
    @property(cc.AudioClip)
    Protect:cc.AudioClip = null;

    //Buff音效
    @property(cc.AudioClip)
    Buff:cc.AudioClip = null;

    //背景音乐
    @property(cc.AudioClip)
    MainBgm:cc.AudioClip = null;

    //受伤音效
    @property(cc.AudioClip)
    Hurt:cc.AudioClip = null;
    
    mainBgm:number = null;
    static GetIns(){
        return ins;
    }
    onLoad () {
        ins = this;
        this.mainBgm = cc.audioEngine.play(this.MainBgm,true,1);
        if(!mGameData.isBGMOn){
            cc.audioEngine.stop(this.mainBgm);
            cc.audioEngine.uncache(this.MainBgm);
        }
    }

    start () {
        // if(!mGameData.isBGMOn){
        //     cc.audioEngine.stop(this.mainBgm);
        //     cc.audioEngine.uncache(this.MainBgm);
        // }
    }
    
    // update (dt) {}
    /**
     * 播放短音效
     * @param str 
     */
    PlayAudio(str:string){
        if(mGameData.isBGMOn){
            switch(str){
                case 'Fall':
                    cc.audioEngine.playEffect(this.Fall,false);
                    // cc.loader.loadRes(url, cc.AudioClip, function (err, clip) {
                    //     this.Fall = cc.audioEngine.playEffect(clip, false);
                    // });
                    break;
                case 'Weakill':
                    cc.audioEngine.playEffect(this.Weakill,false);
                    break;
                case 'Foxkill':
                    cc.audioEngine.playEffect(this.Foxkill,false);
                    break;
                case 'Flykill':
                    cc.audioEngine.playEffect(this.Flykill,false);
                    break;
                case 'Protect':
                    cc.audioEngine.playEffect(this.Protect,false);
                    break;
                case 'Jump':
                    cc.audioEngine.playEffect(this.Jump,false);
                    break;
                case 'Buff':
                    cc.audioEngine.playEffect(this.Buff,false);
                    break;
                case 'Hurt':
                    cc.audioEngine.playEffect(this.Hurt,false);
                    break;
            }
        }
    }
    /**
     * 停止音效
     */
    StopAudio(){
        cc.audioEngine.stopAll();
    }
    /**
     * 播放背景音乐
     */
    PlayBgm(){
        this.mainBgm = cc.audioEngine.play(this.MainBgm,true,1);
    }
    /**
     * 停止背景音乐
     */
    StopBgm(){
        cc.audioEngine.stop(this.mainBgm);
    }
}
