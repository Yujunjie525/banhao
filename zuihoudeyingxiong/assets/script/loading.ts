import { _decorator, AssetManager, assetManager, Component, director, Node, profiler, ProgressBar } from 'cc';
import { resPath } from './data/enums';
import { loadRes } from './utils/loadRes';
const { ccclass, property } = _decorator;

@ccclass('loading')
export class loading extends Component {
    @property(ProgressBar)
    progre: ProgressBar = null;
    start() {
        profiler.hideStats();
        this.startJindu()
    }
    /**
    * 进度条进度
    */
    startJindu() {
        // 将在 10 秒后开始计时，每 5 秒执行一次回调，重复 3 + 1 次
        this.schedule(function () {
            // 这里的 this 指向 component
            this.progre.progress += 0.1;
            if (this.progre.progress >= 0.5) {
                this.unschedule(this.schedule)
                this.jinduPause()
            }
        }, 0.1, 4, 0.3);
    }
    jinduPause() {
        this.scheduleOnce(() => {
            this.loadScene()
        }, 1)
    }
    loadScene() {
        this.schedule(function () {
            this.progre.progress += 0.1;
            if (this.progre.progress >= 1) {
                this.unschedule(this.schedule)
                director.loadScene("home")
            }
        }, 0.2, 6, 0.3);
    }
}


