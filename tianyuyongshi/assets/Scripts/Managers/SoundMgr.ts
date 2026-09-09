import ResMgr from "./ResMgr";
import mGameData from "../Load/GameData";
const { ccclass, property } = cc._decorator;

var EFFECT_NUM = 8;

@ccclass
export default class SoundMgr extends cc.Component {
    public static Instance: SoundMgr = null;
    private static clickClip: cc.AudioClip = null;

    private music_mute: number = 0;
    private effect_mute: number = 0;
    private effect_volume: number = 1;
    private music_volume: number = 1;

    private music_as: cc.AudioSource = null;
    private effect_as: Array<cc.AudioSource> = [];
    private cur_as: number = 0;

    onLoad() {
        if (!SoundMgr.Instance || !cc.isValid(SoundMgr.Instance)) {
            SoundMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }

        this.music_as = this.node.addComponent(cc.AudioSource);
        this.music_as.volume = this.music_volume;
        if (this.music_mute === 1) {
            this.music_as.volume = 0;
        }

        for(var i = 0; i < EFFECT_NUM; i ++) {
            var as = this.node.addComponent(cc.AudioSource);
            this.effect_as.push(as);
            as.volume = this.effect_volume;
            if (this.effect_mute === 1) {
                as.volume = 0;
            }
        }

        this.cur_as = 0;
    }

    onDestroy() {
        if (SoundMgr.Instance === this) {
            SoundMgr.Instance = null;
        }
    }

    /** Registers the shared button click clip and listens for button clicks in a scene. */
    static bindButtonClicks(root: cc.Node, clip?: cc.AudioClip): void {
        if (!root) return;
        if (clip) this.clickClip = clip;
        const marker = '__tyysButtonSoundBound';
        if ((root as any)[marker]) return;
        (root as any)[marker] = true;
        root.on(cc.Node.EventType.TOUCH_END, this._handleButtonClick, this, true);
    }

    static playClick(): void {
        if (!this.clickClip || !mGameData.isSoundOn) return;
        cc.audioEngine.playEffect(this.clickClip, false, 1);
    }

    private static _handleButtonClick(event: cc.Event.EventTouch): void {
        let target: cc.Node = event ? event.target as cc.Node : null;
        while (target) {
            if (target.getComponent(cc.Button)) {
                this.playClick();
                return;
            }
            target = target.parent;
        }
    }

    get_music_volume() {
        return this.music_volume;
    }

    set_music_volume(value) {
        this.music_volume = value;
        this.music_as.volume = value;

        cc.sys.localStorage.setItem("music_volume", value);
    }

    get_music_mute() {
        return this.music_mute;
    }

    set_music_mute(b_mute) {
        var value = (b_mute) ? 1 : 0;
        if (this.music_mute == value) {
            return;
        }

        this.music_mute = value;
        // this.music_as.mute = b_mute;
        if (this.music_mute === 1) {
            this.music_as.volume = 0;
        } 
        else {
            this.music_as.volume = this.music_volume;
        }

        cc.sys.localStorage.setItem("music_mute", value);
    }

    get_effect_volume() {
        return this.effect_volume;
    }

    set_effect_volume(value) {

        for(var i = 0; i < this.effect_as.length; i ++) {
            this.effect_as[i].volume = value;
        }

        this.effect_volume = value;
        cc.sys.localStorage.setItem("effect_volume", value);
    }

    get_effect_mute() {
        return this.effect_mute;
    }

    set_effect_mute(b_mute) {
        var value = (b_mute) ? 1 : 0;
        if (this.effect_mute == value) {
            return;
        }

        for(var i = 0; i < this.effect_as.length; i ++) {
            // this.effect_as[i].mute = b_mute;
            if (this.effect_mute === 1) {
                this.effect_as[i].volume = 0;
            }
            else {
                this.effect_as[i].volume = this.effect_volume;
            }
        }

        this.effect_mute = value;
        cc.sys.localStorage.setItem("effect_mute", value);
    }

    play_music(url, loop) {
        if (!mGameData.isBGMOn) return;
        loop = (loop) ? true : false;
        this.music_as.loop = loop;
        this.music_as.clip = ResMgr.Instance.getAsset("Sounds",url);
        if (this.music_as.clip) {
            this.music_as.play();
        }
        else {
            cc.error("music audio clip null: ", url);
        }
    }

    stop_music() {
        this.music_as.stop();
    }

    play_effect(url) {
        if (!mGameData.isSoundOn) return;
        var as = this.effect_as[this.cur_as];
        this.cur_as ++;
        if (this.cur_as >= EFFECT_NUM) {
            this.cur_as = 0;
        }

        as.clip = ResMgr.Instance.getAsset("Sounds",url);
        if (as.clip) {
            as.play();
        }
        else {
            cc.error("effect audio clip null: ", url);
        }
    }
}
