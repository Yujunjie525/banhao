import { director, game, RenderRoot2D } from "cc"
import { IEnitiy, ILevel, ITitle } from "../../Levels"
import { EnemyMgr } from "../Base/EnemyMgr"
import Singleton from "../Base/Singleton"
import { DEFAULT_FADE_DURATION, DrawManager } from "../UI/DrawManager"
import { createNewNode } from "../Utils"

export default class FadeMgr extends Singleton {

    private _fader: DrawManager = null
    static get Instance() {
        // super()
        return super.getInstance<FadeMgr>()
    }

    get fader() {
        if (this._fader) {
            return this._fader
        }
        else {
            const root = createNewNode()
            root.addComponent(RenderRoot2D)
            root.name = 'RenderRoot2D'

            const fadeNode = createNewNode()
            fadeNode.setParent(root)
            this._fader = fadeNode.addComponent(DrawManager)
            this._fader.init()

            director.addPersistRootNode(root)
            return this._fader
        }
    }

    fadeIn(duration: number = DEFAULT_FADE_DURATION) {
        return this._fader.fadeIn(duration)
    }

    fadeOut(duration: number = DEFAULT_FADE_DURATION) {
        return this._fader.fadeOut(duration)
    }
}