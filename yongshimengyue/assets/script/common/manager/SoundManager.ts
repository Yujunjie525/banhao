import { demandResLoader } from "./DemandResLoader";
import ResUtils from "../utils/ResUtils";
import MasterGlobal from "../MasterGlobal";
import mGameData from "../../../Scripts/Data/GameData";

/**
 * 音效管理类
 */
class SoundManager {

    music: string = "";
    state: boolean = false;
    audioId = null;
    musicPaused: boolean = false;
    private buttonSoundInstalled: boolean = false;
    private buttonSoundScene: cc.Node = null;
    private buttonSoundLastFrame: number = -1;
    private readonly buttonFxName: string = "resources:music/btn";

    private loadMusic(url: string, onComplete: (audio: cc.AudioClip) => void) {
        let audio = ResUtils.getAsset<cc.AudioClip>(url, cc.AudioClip);
        if (audio) {
            onComplete && onComplete(audio);
            return;
        }

        demandResLoader.loadAsset<cc.AudioClip>(url, cc.AudioClip).then((asset) => {
            onComplete && onComplete(asset);
        }).catch((err) => {
            cc.error(`load audio failed: ${url}`, err);
        });
    }

    //设置音效音量
    setEffectsVolume(volume) {
        cc.audioEngine.setEffectsVolume(volume);
    }

    /**
     * 获取当前音效的时长
     */
    getMusicDuration() {
        if (this.audioId == null) {
            cc.log("No music is playing!");
            return -1;
        }

        return cc.audioEngine.getDuration(this.audioId);
    }

    /**
     * 播放引导音效
     * @param fxName 音效名称
     */
    playGuideFx(fxName: string, onStart = null, onFinish = null) {
        this.loadMusic(fxName, (audio) => {
            this.audioId = cc.audioEngine.playEffect(audio, false);

            onStart && onStart();
            onFinish && cc.audioEngine.setFinishCallback(this.audioId, () => {
                this.audioId = null;
                onFinish();
            });
        });
    }


    /**
     * 播放普通音效
     * @param fxName 
     */
    playFx(fxName: string) {
        this.loadMusic(fxName, (audio) => {
            audio && cc.audioEngine.playEffect(audio, false);
        });
    }

    /**
     * 关闭正在播放的音效
     */
    public installButtonClickSound(): void {
        if (!this.buttonSoundInstalled) {
            this.buttonSoundInstalled = true;
            cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.bindButtonSoundToScene, this);
        }
        this.bindButtonSoundToScene();
    }

    private bindButtonSoundToScene(): void {
        const scene = cc.director.getScene();
        if (!scene || !scene.isValid || scene === this.buttonSoundScene) {
            return;
        }

        if (this.buttonSoundScene && this.buttonSoundScene.isValid) {
            this.buttonSoundScene.off(cc.Node.EventType.TOUCH_END, this.onGlobalTouchEnd, this, true);
        }

        this.buttonSoundScene = scene;
        this.buttonSoundScene.on(cc.Node.EventType.TOUCH_END, this.onGlobalTouchEnd, this, true);
    }

    private onGlobalTouchEnd(event: cc.Event.EventTouch): void {
        if (!event || !this.isSoundEnabled()) {
            return;
        }

        const button = this.findEnabledButton(event.target);
        if (!button) {
            return;
        }

        const frame = cc.director.getTotalFrames();
        if (this.buttonSoundLastFrame === frame) {
            return;
        }

        this.buttonSoundLastFrame = frame;
        this.playFx(this.buttonFxName);
    }

    private findEnabledButton(node: cc.Node): cc.Button {
        let current = node;
        while (current && current.isValid) {
            const button = current.getComponent(cc.Button);
            if (button && button.enabled && button.interactable && this.isNodeActiveInHierarchy(current)) {
                return button;
            }
            current = current.parent;
        }
        return null;
    }

    private isNodeActiveInHierarchy(node: cc.Node): boolean {
        if (!node || !node.isValid) {
            return false;
        }

        if (node === cc.director.getScene() || node instanceof cc.Scene) {
            return true;
        }

        return node.activeInHierarchy;
    }

    private isSoundEnabled(): boolean {
        return mGameData.isSoundOn !== false && MasterGlobal.musicon !== false;
    }

    stopCurEffect(): void {
        this.audioId != null && cc.audioEngine.stopEffect(this.audioId);
    }

    //播放背景音乐
    playMusic(musicName: string) {
        if (this.music != musicName) {
            this.state = false;
        }
        this.music = musicName;
        this.state = true;
        this.musicPaused = false;
        this.loadMusic(musicName, (audio) => {
            if (!this.state || this.music != musicName) {
                return;
            }
            if (audio) {
                cc.audioEngine.playMusic(audio, true);
                if (this.musicPaused) {
                    cc.audioEngine.pauseMusic();
                }
            }
        });
    }

    //停止播放背景音乐
    stopMusic() {
        this.state = false;
        this.musicPaused = false;
        cc.audioEngine.stopMusic();
    }

    //暂停播放背景音乐
    pauseMusic() {
        this.musicPaused = true;
        cc.audioEngine.pauseMusic();
    }

    //恢复播放背景音乐
    resumeMusic() {
        this.musicPaused = false;
        if (this.state) {
            cc.audioEngine.resumeMusic();
        } else if (!this.state && this.music != "") {
            this.state = true;
            this.playMusic(this.music);
        }
    }
}

export let soundManager: SoundManager = new SoundManager();
