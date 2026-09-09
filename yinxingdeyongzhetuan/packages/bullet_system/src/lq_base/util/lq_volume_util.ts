import {LQStorageUtil} from "./lq_storage_util";

export class LQVolumeUtil {
    static get volume_music(): number {
        if (!this._volume_music) {
            this._volume_music = parseInt(LQStorageUtil.get_item('volume_music') || '1')
        }
        return this._volume_music;
    }

    static set volume_music(value: number) {
        this._volume_music = value;
        LQStorageUtil.set_item('volume_music', this._volume_music.toString());
    }

    static get volume_effect(): number {
        if (!this._volume_effect) {
            this._volume_effect = parseInt(LQStorageUtil.get_item('volume_effect') || '1');
        }
        return this._volume_effect;
    }

    static set volume_effect(value: number) {
        this._volume_effect = value;
        LQStorageUtil.set_item('volume_effect', this._volume_effect.toString());
    }

    private static _volume_music: number;
    private static _volume_effect: number;

}