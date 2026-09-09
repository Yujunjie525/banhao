import { _decorator, AudioSourceComponent, Component, Node, director } from 'cc';
import { loadRes } from './loadRes';
import { gameConfig } from './gameConfig';
const { ccclass, property } = _decorator;

@ccclass('audioTool')
export class audioTool extends Component {
    private soundComp: AudioSourceComponent = null;
    private bgmComp: AudioSourceComponent = null;
    private audioNode: Node = null;
    private currentBgm: string = ''; // 记录当前播放的背景音乐名称

    /**
     * 单例
     */
    private static _ins: audioTool = null!;
    public static get ins() {
        if (!this._ins) {
            this._ins = new audioTool();
            this._ins.initAudio();
        }
        return this._ins;
    }
    
    /**
     * 初始化音频组件
     */
    private initAudio() {
        // 创建一个节点来承载音频组件
        this.audioNode = new Node('AudioNode');
        
        // 确保节点被添加到场景中
        const scene = director.getScene();
        if (scene) {
            scene.addChild(this.audioNode);
        } else {
            // 如果场景不存在，在场景加载时添加
            // director.once(director.EVENT_AFTER_SCENE_LAUNCH, () => {
            //     const currentScene = director.getScene();
            //     if (currentScene && !this.audioNode.parent) {
            //         currentScene.addChild(this.audioNode);
            //     }
            // });
        }
        
        // 标记为常驻节点，避免场景切换时被销毁
        director.addPersistRootNode(this.audioNode);
        
        // 添加音频组件
        this.soundComp = this.audioNode.addComponent(AudioSourceComponent);
        this.soundComp.loop = false;
        
        this.bgmComp = this.audioNode.addComponent(AudioSourceComponent);
        this.bgmComp.loop = true;
    }
    
    /**
     * 停止背景音乐
     */
    public stopMusic() {
        if (this.bgmComp) {
            console.log('停止背景音乐');
            this.bgmComp.stop();
            this.currentBgm = '';
        } else {
            console.warn('bgmComp 不存在，无法停止音乐');
        }
    }
    
    /**
     * 设置音量
     */
    public setVolume(val: number) {
        if (this.bgmComp) {
            this.bgmComp.volume = val;
        }
    }
    
    /**
     * 播放音乐
     * @param audio 音乐名
     */
    public async playMusic(audio: string) {
        try {
            // 确保音频组件存在
            if (!this.bgmComp) {
                this.initAudio();
            }
            
            // 如果要播放的音乐与当前正在播放的相同，则不重复播放
            if (this.currentBgm === audio && this.bgmComp.playing) {
                console.log(`音乐 ${audio} 已经在播放`);
                return;
            }
            
            // 停止当前播放的音乐
            console.log(`停止当前音乐，准备播放: ${audio}`);
            this.bgmComp.stop();
            
            // 加载音频文件
            console.log(`开始加载音频: ${audio}`);
            let clip = await loadRes.ins.getClip(audio);
            if (!clip) {
                console.error(`音频文件加载失败: ${audio}`);
                return;
            }
            
            // 设置音频组件的音量和 clip
            this.bgmComp.volume = gameConfig.bgmVol;
            this.bgmComp.clip = clip;
            
            // 开始播放
            console.log(`开始播放音乐: ${audio}`);
            this.bgmComp.play();
            this.currentBgm = audio;
        } catch (error) {
            console.error(`播放音乐失败: ${error}`);
        }
    }
    
    /**
     * 播放一次性音效
     */
    public async playSound(audio: string) {
        try {
            // 确保音频组件存在
            if (!this.soundComp) {
                this.initAudio();
            }
            
            // 加载音频文件
            let clip = await loadRes.ins.getClip(audio);
            if (!clip) {
                console.error(`音频文件加载失败: ${audio}`);
                return;
            }
            
            // 播放音效
            this.soundComp.playOneShot(clip, gameConfig.soundVol);
        } catch (error) {
            console.error(`播放音效失败: ${error}`);
        }
    }
}