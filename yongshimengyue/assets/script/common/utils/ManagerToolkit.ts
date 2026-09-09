/**
 * Managers -
 * @date 2020/10/31
 * @author lancetop@cn.lancetop
 * @version 1.0
 * @author yk.luo@cn.lancetop
 * @version -alter1.8
 */

/**
 * EventCenter Manager
 */
export class EventCenterManager {
    protected static _instance: EventCenterManager = null;

    private _eventTarget: cc.EventTarget;
    public get eventTarget(): cc.EventTarget {
        return this._eventTarget;
    }

    protected constructor () {
        this._eventTarget = new cc.EventTarget();
    }

    public static getInstance(): EventCenterManager {
        if (this._instance == null) this._instance = new EventCenterManager();
        return this._instance;
    }

    public onCenterEvent<T extends Function>(type: string, callback: T, target: any): T {
        return this._eventTarget.on(type, callback, target);
    }

    public onceCenterEvent(type: string, callback: (arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) => void, target: any): void {
        this._eventTarget.once(type, callback, target);
    }

    public offCenterEvent(type: string, callback: Function, target: any): void {
        this._eventTarget.off(type, callback, target);
    }

    public emit(key: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
        this._eventTarget.emit(key, arg1, arg2, arg3, arg4, arg5);
    }

}

/**
 * Sound Manager
 */
export class SoundManager {

    protected static _instance: SoundManager = null;

    private musicOn: boolean;

    private effectOn: boolean;

    protected constructor() {
        this.musicOn = true;
        this.effectOn = true;
    }

    public static getInstance(): SoundManager {
        if (this._instance == null) {
            this._instance = new SoundManager();
        }
        return this._instance;
    }

    public setMusicOff(): void {
        this.musicOn = false;
        cc.audioEngine.pauseMusic();
    }

    public setMusicOn(): void {
        this.musicOn = true;
        cc.audioEngine.resumeMusic();
    }

    public setEffectOff(): void {
        this.effectOn = false;
        cc.audioEngine.stopAllEffects();
    }

    public setEffectOn(): void {
        this.effectOn = true;
    }

    public cleanAllEffect(): void {
        cc.audioEngine.stopAllEffects();
    }

    public cleanMusic(): void {
        cc.audioEngine.stopMusic();
    }

    public cleanOneEffect(soundId: number): void {
        cc.audioEngine.stopEffect(soundId);
    }

    public setMusicVolume(volume: number): void {
        cc.audioEngine.setMusicVolume(volume);
    }

    public setEffectVolume(volume: number): void {
        cc.audioEngine.setEffectsVolume(volume);
    }

    /**
     * 播放背景音乐
     * @param audioClip 音频剪辑或者音频剪辑的地址
     * @param onFinished 
     * @param isLoop 
     */
    public playMusic(audioClip: cc.AudioClip, onFinished: ()=>void = null, isLoop: boolean = true): number {
        if (this.musicOn) {
            let audioId = cc.audioEngine.playMusic(audioClip, isLoop);
            if (onFinished) cc.audioEngine.setFinishCallback(audioId, onFinished);
            return audioId;
        }
        return -1;
    }

    /**
     * 播放音效
     * @param audioClip 音频剪辑或者音频剪辑的地址
     * @param onFinished 
     */
    public playEffect(audioClip: cc.AudioClip, onFinished: ()=>void = null): number {
        if (this.effectOn) {
            let audioId = cc.audioEngine.playEffect(audioClip, false);
            if (onFinished) cc.audioEngine.setFinishCallback(audioId, onFinished);
            return audioId;
        }
        return -1;
    }

}