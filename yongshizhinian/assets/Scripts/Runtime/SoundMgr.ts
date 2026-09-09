import { AudioClip, AudioSource, director, game, RenderRoot2D, resources } from "cc"
import { IEnitiy, ILevel, ITitle } from "../../Levels"
import { EnemyMgr } from "../Base/EnemyMgr"
import Singleton from "../Base/Singleton"
import { DEFAULT_FADE_DURATION, DrawManager } from "../UI/DrawManager"
import { createNewNode } from "../Utils"

export default class SoundMgr extends Singleton {

    audioSouce: AudioSource = new AudioSource()

    static get Instance() {
        // super()
        return super.getInstance<SoundMgr>()
    }

    public playMusic(path, isLoop: boolean) {
        resources.load(path, AudioClip, (err, clip) => {
            if (!err) {
                this.audioSouce!.clip = clip
                this.audioSouce!.loop = isLoop
                this.audioSouce.play()

            } else {
                console.log(err)
            }
        });
    }

    public playSound(path: string) {
        resources.load(path, AudioClip, (err, clip) => {
            if (!err) {
                this.audioSouce!.clip = clip
                this.audioSouce.playOneShot(clip)
            } else {
                console.log(err)
            }
        });
    }
}