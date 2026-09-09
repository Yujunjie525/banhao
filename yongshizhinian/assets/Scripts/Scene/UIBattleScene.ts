import { Component, _decorator, Node, AudioSource, director, sys, Label, SpriteFrame } from "cc";
import { DIRECTION_ENUM, ENITIY_TYPE_ENUM, ENITIY_TYPE_SPIKES_ENUM, ENTITY_STATE_ENUM, ENUM_EVENT, SCENE_ENUM } from "../../Enum";
import levels, { ILevel } from "../../Levels";
import EventMgr from "../Base/EventMgr";
import { BurstMgr } from "../Burst/BurstMgr";
import { DoorMgr } from "../Door/DoorMgr";
import { IronMgr } from "../Enemy/Iron/IronMgr";
import { WoodenMgr } from "../Enemy/Wooden/WoodenMgr";
import { PlayerMrg } from "../Player/PlayerMgr";
import { AudioMgr } from "../Runtime/AudioMgr";
import DataManager, { IRecord } from "../Runtime/DataManager";
import FadeMgr from "../Runtime/FadeMgr";
import { ShakeManager } from "../Runtime/ShakeManager";
import SoundMgr from "../Runtime/SoundMgr";
import { SmokeMgr } from "../Smoke/SmokeMgr";
import { SpikesMgr } from "../Spikes/SpikesMgr";
// import { DataManager.Instance } from "../Runtime/DataManager";
import { TileMapManager } from "../TileMap/TileMapManager";
import { createNewNode } from "../Utils";
import { gameConfig } from "../gameConfig";
import { save, load } from "../tools";
import { local, emits } from "../enmus";
import { loadPool } from "../loadPool";
import { GameBackendApi } from "../../GameBackendSdk/GameBackendApi";

const TILE_WIDTH = 55
const TILE_HEIGHT = 55
const { ccclass, property } = _decorator;
@ccclass('UIBattleScene')
export class UIBattleScene extends Component {
    level: ILevel
    stage: Node
    smokeLayer: Node
    fadeInit = false
    @property(Node)
    menu: Node = null
    @property(Node)
    bottom: Node = null
    @property(Node)
    win: Node = null
    @property(Label)
    levelLabel: Label = null
    @property(SpriteFrame)
    wallTileSpriteFrame: SpriteFrame = null
    @property(SpriteFrame)
    floorTileSpriteFrame: SpriteFrame = null
    @property(SpriteFrame)
    doorTileSpriteFrame: SpriteFrame = null
    @property(Label)
    timerLabel: Label = null

    private totalTime = 120
    private remainingTime = 120
    private timer = null

    start() {
        AudioMgr.inst.play('sound/bg', 1, true)

        // 根据临时关卡设置当前关卡
        if (gameConfig.tempLevel) {
            DataManager.Instance.levelIndex = gameConfig.tempLevel;
        } else {
            DataManager.Instance.levelIndex = 1;
        }
        // 更新关卡显示
        this.updateLevelLabel()
        this.generateStage()
        this.initLevel()
    }

    onLoad() {
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_NEXTLEVEL, this.nextLevelMap, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_MOVE_END, this.checkArrived, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_SHOW_SMOKE, this.showSmokeHandler, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_RECORD_STEP, this.saveRecord, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_REVOKE_STEP, this.revokeRecord, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_RESTART_GAME, this.restartLoadSence)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_WIN_RESTART_GAME, this.winRestartGame, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_PAUSE_TIMER, this.stopTimer, this)
        EventMgr.Instance.addEventListen(ENUM_EVENT.ENUM_RESUME_TIMER, this.resumeTimer, this)
    }

    onDestroy() {
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_NEXTLEVEL, this.nextLevelMap)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_MOVE_END, this.checkArrived)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_SHOW_SMOKE, this.showSmokeHandler)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_RECORD_STEP, this.saveRecord)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_REVOKE_STEP, this.revokeRecord)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_RESTART_GAME, this.restartLoadSence)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_WIN_RESTART_GAME, this.winRestartGame)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_PAUSE_TIMER, this.stopTimer)
        EventMgr.Instance.unEventListen(ENUM_EVENT.ENUM_RESUME_TIMER, this.resumeTimer)

        EventMgr.Instance.clearDir()
        this.stopTimer()
    }

    private restartLoadSence() {
        DataManager.Instance.reset()
        EventMgr.Instance.clearDir()
        director.loadScene(SCENE_ENUM.BATTLE)
    }

    async initLevel() {
        if (this.fadeInit) {
            await FadeMgr.Instance.fader.fadeIn()
        } else {
            await FadeMgr.Instance.fader.mask()
        }

        this.clearLevelMap()
        this.level = levels[`level${DataManager.Instance.levelIndex}`]
        if (this.level) {
            DataManager.Instance.mapInfo = this.level.mapInfo
            DataManager.Instance.mapColumCount = this.level.mapInfo[0]?.length || 0//列
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
        }
        // 更新关卡显示
        this.updateLevelLabel()

        await Promise.all([
            this.generateTileMap(),
            this.generateBurst(),
            this.generateEnemies(),
            this.generateSpikes(),
            this.generateDoor(),
            this.generateSmokeLayer(),
            this.fitPos()
        ])
        await this.generatePlayer()
        FadeMgr.Instance.fader.fadeOut()
        this.fadeInit = true

        this.startTimer()
    }

    winRestartGame() {
        this.win.active = false
        DataManager.Instance.levelIndex = 1
        this.initLevel()
    }

    async nextLevelMap() {
        const currentLevel = DataManager.Instance.levelIndex;
        
        // 只有当当前挑战的关卡是最新解锁的关卡时，才增加关卡进度
        if (currentLevel === gameConfig.nowLevel) {
            gameConfig.nowLevel += 1;
            save(local.nowLevel, gameConfig.nowLevel);
            console.log(`关卡解锁：当前关卡 ${currentLevel} → 解锁到 ${gameConfig.nowLevel}`);
            
            // 上报通关数据：rank 必须与 loadView 登录同步逻辑一致（rank=已完成关卡数，nowLevel=rank+1）
            // 应传「本关刚通关的关卡号」currentLevel，不可传递增后的 nowLevel，否则多报 1 关（例如通第 1 关却上报 2）
            try {
                const savedUsername = sys.localStorage.getItem('SLS_USERNAME');
                if (savedUsername) {
                    const result = await GameBackendApi.passLevel({
                        appid: "app.yongshixunzhang3",
                        username: savedUsername,
                        rank: currentLevel,
                        star: gameConfig.levelTime || 0,
                    });
                    console.log("上报关卡:", result, "completedLevel", currentLevel, "nextUnlock", gameConfig.nowLevel, "star", gameConfig.levelTime);
                }
            } catch (error) {
                console.error("上报通关数据失败:", error);
            }
        } else {
            console.log(`重新挑战关卡 ${currentLevel}，关卡进度保持不变：${gameConfig.nowLevel}`);
        }
        
        // 弹出通关弹窗
        this.showLevelCompleteWnd();
    }

    /**
     * 显示通关弹窗
     */
    showLevelCompleteWnd() {
        // 查找Canvas节点作为父节点，确保弹窗显示在屏幕中间
        let parentNode = this.node;
        if (parentNode) {
            while (parentNode && parentNode.name !== 'Canvas') {
                parentNode = parentNode.parent;
            }
            if (!parentNode) {
                parentNode = this.node.parent;
            }
        }
        // 如果找不到父节点，使用当前场景的根节点
        if (!parentNode) {
            const currentScene = director.getScene();
            if (currentScene) {
                parentNode = currentScene;
            }
        }
        if (parentNode) {
            loadPool.ins.getPoolNode('LevelCompleteWnd', parentNode);
        } else {
            console.error('无法找到显示 LevelCompleteWnd 的父节点');
        }
    }

    clearLevelMap() {
        this.stage.removeAllChildren()
        DataManager.Instance.reset()
    }

    checkArrived() {
        const { x: playerX, y: playerY } = DataManager.Instance.playerInfo
        const { x: doorX, y: doorY, state: doorState } = DataManager.Instance.doorInfo

        if (playerX === doorX && playerY === doorY &&
            doorState === ENTITY_STATE_ENUM.DEATH) {
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_NEXTLEVEL)
        }
    }

    async showSmokeHandler(x: number, y: number, direction: DIRECTION_ENUM) {
        const smokeItem = DataManager.Instance.smokes.find(smoke => smoke.state === ENTITY_STATE_ENUM.DEATH)
        if (smokeItem) {
            smokeItem.x = x
            smokeItem.y = y
            smokeItem.direction = direction
            smokeItem.node.setPosition(x * TILE_WIDTH - TILE_WIDTH * 1.5, -y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
        } else {
            const smokeNode = createNewNode()
            smokeNode.setParent(this.smokeLayer)
            const smokeMgr = smokeNode.addComponent(SmokeMgr)
            await smokeMgr.init({
                x,
                y,
                state: ENTITY_STATE_ENUM.IDLE,
                type: ENITIY_TYPE_ENUM.SMOKE,
                direction
            })

            DataManager.Instance.smokes.push(smokeMgr)
        }
    }

    generateStage() {
        const stageNode = createNewNode()
        stageNode.setParent(this.node)
        this.stage = stageNode
        this.stage.setSiblingIndex(2)
        this.stage.addComponent(ShakeManager)
    }

    async generateTileMap() {
        const tileMapNode = createNewNode()
        tileMapNode.setParent(this.stage)
        console.log('tileMapNode.position', tileMapNode.position)
        const tileMapManager = tileMapNode.addComponent(TileMapManager)
        await tileMapManager.init(this.wallTileSpriteFrame, this.floorTileSpriteFrame)
    }

    async generatePlayer() {
        const playerNode = createNewNode()
        playerNode.setParent(this.stage)
        const playerManager = playerNode.addComponent(PlayerMrg)
        await playerManager.init(this.level.player)
        DataManager.Instance.playerInfo = playerManager
        EventMgr.Instance.emit(ENUM_EVENT.ENUM_PLAYER_BORN, true)
    }

    async generateEnemies() {
        DataManager.Instance.enemies = []
        const promises = []
        for (let i = 0; i < this.level.enemies.length; i++) {
            const enemy = this.level.enemies[i]
            const node = createNewNode()
            node.setParent(this.stage)
            const mgr = enemy.type === ENITIY_TYPE_ENUM.WOODEN ? WoodenMgr : IronMgr
            const manager = node.addComponent(mgr)
            promises.push(manager.init(enemy))
            DataManager.Instance.enemies.push(manager)
        }

        await Promise.all(promises)
    }

    async generateBurst() {
        const promises = []
        for (let i = 0; i < this.level.bursts.length; i++) {
            const burst = this.level.bursts[i]
            const node = createNewNode()
            node.setParent(this.stage)
            const burstManager = node.addComponent(BurstMgr)
            promises.push(burstManager.init(burst))
            DataManager.Instance.bursts.push(burstManager)
        }
        await Promise.all(promises)
    }

    async generateSpikes() {
        const promises = []
        for (let i = 0; i < this.level.spikes.length; i++) {
            const spikes = this.level.spikes[i]
            const node = createNewNode()
            node.setParent(this.stage)
            const spikesManager = node.addComponent(SpikesMgr)
            promises.push(spikesManager.init(spikes))
            DataManager.Instance.spikes.push(spikesManager)
        }
        await Promise.all(promises)
    }

    generateSmokeLayer() {
        const node = createNewNode()
        this.smokeLayer = node
        node.setParent(this.stage)
    }

    async generateDoor() {
        const node = createNewNode()
        node.setParent(this.stage)
        const doorManager = node.addComponent(DoorMgr)
        doorManager.staticSpriteFrame = this.doorTileSpriteFrame
        await doorManager.init(this.level.door)
        DataManager.Instance.doorInfo = doorManager
    }

    fitPos() {
        const { mapColumCount, mapRowCount } = DataManager.Instance
        const disX = TILE_WIDTH * mapRowCount / 2
        const disY = TILE_HEIGHT * mapColumCount / 2 + 100
        this.stage.getComponent(ShakeManager).stop()
        this.stage.setPosition(-disX, disY)
    }

    saveRecord() {
        if (!DataManager.Instance.playerInfo)
            return

        const item: IRecord = {
            player: {
                x: DataManager.Instance.playerInfo.x,
                y: DataManager.Instance.playerInfo.y,
                direction: DataManager.Instance.playerInfo.direction,
                state: DataManager.Instance.playerInfo.state === ENTITY_STATE_ENUM.IDLE ||
                    DataManager.Instance.playerInfo.state === ENTITY_STATE_ENUM.ATTACK ||
                    DataManager.Instance.playerInfo.state === ENTITY_STATE_ENUM.DEATH
                    ? DataManager.Instance.playerInfo.state : ENTITY_STATE_ENUM.IDLE
                ,
                type: DataManager.Instance.playerInfo._type,
            },
            door: {
                x: DataManager.Instance.doorInfo.x,
                y: DataManager.Instance.doorInfo.y,
                direction: DataManager.Instance.doorInfo.direction,
                state: DataManager.Instance.doorInfo.state,
                type: DataManager.Instance.doorInfo._type,
            },
            enemies: DataManager.Instance.enemies.map(({ x, y, type, state, direction }) => ({
                x, y, type, state, direction
            })),
            bursts: DataManager.Instance.bursts.map(({ x, y, type, state, direction }) => ({
                x, y, type, state, direction
            })),
            spikes: DataManager.Instance.spikes.map(({ x, y, count, type }) => ({
                x, y, count, type
            })),
        }

        DataManager.Instance.records.push(item)
    }

    revokeRecord() {
        const item = DataManager.Instance.records.pop()
        if (item) {
            DataManager.Instance.playerInfo.x = DataManager.Instance.playerInfo.targetX = item.player.x
            DataManager.Instance.playerInfo.y = DataManager.Instance.playerInfo.targetY = item.player.y
            DataManager.Instance.playerInfo.direction = item.player.direction
            DataManager.Instance.playerInfo.state = item.player.state
            DataManager.Instance.playerInfo.type = item.player.type

            DataManager.Instance.doorInfo.x = item.door.x
            DataManager.Instance.doorInfo.y = item.door.y
            DataManager.Instance.doorInfo.direction = item.door.direction
            DataManager.Instance.doorInfo.state = item.door.state
            DataManager.Instance.doorInfo.type = item.door.type

            for (let index = 0; index < DataManager.Instance.enemies.length; index++) {
                const enemy = item.enemies[index];
                if (enemy) {
                    DataManager.Instance.enemies[index].x = enemy.x
                    DataManager.Instance.enemies[index].y = enemy.y
                    DataManager.Instance.enemies[index].direction = enemy.direction
                    DataManager.Instance.enemies[index].state = enemy.state
                    DataManager.Instance.enemies[index].type = enemy.type
                }
            }

            for (let index = 0; index < DataManager.Instance.bursts.length; index++) {
                const burst = item.bursts[index];
                if (burst) {
                    DataManager.Instance.bursts[index].x = burst.x
                    DataManager.Instance.bursts[index].y = burst.y
                    DataManager.Instance.bursts[index].direction = burst.direction
                    DataManager.Instance.bursts[index].state = burst.state
                    DataManager.Instance.bursts[index].type = burst.type
                }
            }

            for (let index = 0; index < DataManager.Instance.spikes.length; index++) {
                const spike = item.spikes[index];
                if (spike) {
                    DataManager.Instance.spikes[index].x = spike.x
                    DataManager.Instance.spikes[index].y = spike.y
                    DataManager.Instance.spikes[index].count = spike.count
                    DataManager.Instance.spikes[index].type = spike.type
                }
            }
        }
    }

    /**
     * 更新关卡显示
     */
    updateLevelLabel() {
        if (this.levelLabel) {
            this.levelLabel.string = `第${DataManager.Instance.levelIndex}关`
        }
    }

    startTimer() {
        this.stopTimer()
        this.remainingTime = this.totalTime
        this.updateTimerLabel()

        this.timer = setInterval(() => {
            this.remainingTime--
            this.updateTimerLabel()

            if (this.remainingTime <= 0) {
                this.handleTimeUp()
            }
        }, 1000)
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    resumeTimer() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.updateTimerLabel()
        this.timer = setInterval(() => {
            this.remainingTime--
            this.updateTimerLabel()

            if (this.remainingTime <= 0) {
                this.handleTimeUp()
            }
        }, 1000)
    }

    updateTimerLabel() {
        if (this.timerLabel) {
            const minutes = Math.floor(this.remainingTime / 60)
            const seconds = this.remainingTime % 60
            const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`
            const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
            this.timerLabel.string = `${minutesStr}:${secondsStr}`
        }
    }

    handleTimeUp() {
        this.stopTimer()
        console.log('时间到，关卡失败')
        let parentNode = this.node
        if (parentNode) {
            while (parentNode && parentNode.name !== 'Canvas') {
                parentNode = parentNode.parent
            }
            if (!parentNode) {
                parentNode = this.node.parent
            }
        }
        if (!parentNode) {
            const currentScene = director.getScene()
            if (currentScene) {
                parentNode = currentScene
            }
        }
        if (parentNode) {
            loadPool.ins.getPoolNode('LevelFailWnd2', parentNode)
        } else {
            console.error('无法找到显示失败弹窗的父节点')
        }
    }
}
