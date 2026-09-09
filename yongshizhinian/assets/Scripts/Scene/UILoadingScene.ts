import { _decorator, Component, director, ProgressBar, resources, AudioClip } from 'cc'
import { SCENE_ENUM } from '../../Enum'
const { ccclass, property } = _decorator

@ccclass('LoadingManager')
export class LoadingManager extends Component {
    @property(ProgressBar)
    bar: ProgressBar

    start() {

    }
    onLoad() {
        this.preLoad()
    }
    preLoad() {
        director.preloadScene(SCENE_ENUM.BATTLE)
        resources.preloadDir(
            'texture',
            (cur, total) => {
                this.bar.progress = cur / total
            },
            async err => {
                if (err) {
                    await new Promise(rs => {
                        setTimeout(rs, 1000)
                    })
                    this.preLoad()
                    return
                }
                // await this.loadSoundRes()
                director.loadScene(SCENE_ENUM.BATTLE)
            },
        )
    }

    async loadSoundRes() {
        return new Promise((rs) => {
            resources.preloadDir('sound', AudioClip, () => {
                console.log('音频资源预加载完成')
                rs(null)
            })
        })
    }
}