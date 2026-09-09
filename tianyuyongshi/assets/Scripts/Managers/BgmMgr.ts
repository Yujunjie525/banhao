import mGameData from "../Load/GameData";

/** Keeps one scene-independent background music instance alive at a time. */
export default class BgmMgr {
    private static _audioId: number = -1;
    private static _clip: cc.AudioClip = null;

    static play(clip: cc.AudioClip): void {
        // 场景切换时总是停止旧曲，确保新场景从头播放。
        this.stop();
        this._clip = clip;
        if (!clip || !mGameData.isBGMOn) {
            this._audioId = -1;
            return;
        }
        this._audioId = cc.audioEngine.play(clip, true, 1);
    }

    static stop(): void {
        if (this._audioId >= 0) {
            cc.audioEngine.stop(this._audioId);
            this._audioId = -1;
        }
        this._clip = null;
    }

    static pause(): void {
        if (this._audioId >= 0) cc.audioEngine.pause(this._audioId);
    }

    static resume(): void {
        if (this._audioId >= 0 && mGameData.isBGMOn) cc.audioEngine.resume(this._audioId);
    }

    static setEnabled(enabled: boolean): void {
        mGameData.isBGMOn = enabled;
        if (!enabled) {
            this.pause();
        } else if (this._audioId >= 0) {
            this.resume();
        }
    }
}
