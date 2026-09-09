import { _decorator, Component, director, Node, Prefab, Sprite, sys, tween, UITransform, Vec3 } from 'cc';
import { layerAction1 } from './layerAction1';
import { layerAction2 } from './layerAction2';
import { layerAction3 } from './layerAction3';
import { gameConfig } from './data/gameConfig';
import { perBlock } from './prepab/perBlock';
import { mainView } from './mainView';
import { loadPool } from './res/loadPool';
import { bgmName, emits, local } from './data/enmus';
import { audioTool } from './untils/audioTool';
import { wxAd } from './AD/wxAd';
import KSAdMgr from '../Sdk/KSAdMgr';
import { save } from './untils/tools';
const { ccclass, property } = _decorator;

@ccclass('layerRootAction')
export class layerRootAction extends Component {
    layerAction1: layerAction1 = null
    @property(layerAction2) layerAction2: layerAction2 = null
    @property(layerAction3) layerAction3: layerAction3 = null
    
    // 当前挑战的关卡
    private currentLevel: number = 0
    
    // 游戏是否已经开始（是否有元素被消除）
    private gameStarted: boolean = false
    
    // 道具使用次数
    private yichuCount: number = 0
    private chehuiCount: number = 0
    private randomCount: number = 0
    private readonly maxItemUse: number = 2

    start() {
        director.on(emits.isFuhuo, this.isFuhuo, this)
        this.loadLayerAction1()
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            KSAdMgr.Instance.init();
        }
    }
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
    // 解决layerAction1循环调用警告
    private loadLayerAction1() {
        if (!this.layerAction1) {
            this.layerAction1 = this.node.getChildByName('layer1').getComponent(layerAction1)
        }
    }
    // 开始游戏
    startGame(level: number = gameConfig.nowLevel) {
        this.currentLevel = level
        gameConfig.currentLevel = level
        this.loadLayerAction1()
        this.layerAction1.delAll()
        this.layerAction2.delAll()
        this.layerAction3.delAll()
        // 重置游戏开始状态
        this.gameStarted = false
        // 重置道具使用次数
        this.yichuCount = 0
        this.chehuiCount = 0
        this.randomCount = 0
        //传入当前关卡并开始游戏
        this.layerAction1.startGame(this.currentLevel)
        console.log(`开始游戏：挑战关卡 ${this.currentLevel}，当前解锁到 ${gameConfig.nowLevel}`)
    }

    // 在layer1中克隆并移动元素
    oneToThree(item: perBlock, perBlock: Prefab) {
        let cloneItem = item.cloneItem(this.node, perBlock)
        this.layerAction1.showShadow()
        let slotPos = this.layerAction3.getSlotPos(cloneItem)
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(slotPos)
        tween(cloneItem.node).to(0.15, { position: localPos }).call(async () => {
            this.layerAction3.add(cloneItem)
            // 是否消除
            let isDelet = this.layerAction3.delItem()
            if (isDelet) {
                // 标记游戏已经开始
                this.gameStarted = true
                if (this.layerAction1.getItemSize() == 0 && this.layerAction2.getItemSize() == 0 && this.layerAction3.getItemSize() == 0) {
                    console.log('游戏胜利');
                    audioTool.ins.playSound(bgmName.sound_win)
                    // this.node.parent.getComponent(mainView).nextLevel()

                    // 暂停计时器（保存通关时间）
                    director.emit(emits.pauseTimer)

                    // 只有当当前挑战的关卡是最新解锁的关卡时，才增加关卡进度
                    if (this.currentLevel === gameConfig.nowLevel) {
                        gameConfig.nowLevel += 1
                        save(local.nowLevel, gameConfig.nowLevel)
                        console.log(`关卡解锁：当前关卡 ${this.currentLevel} → 解锁到 ${gameConfig.nowLevel}`)
                        // 上报通关数据
                        try {
                            const savedUsername = sys.localStorage.getItem('SLS_USERNAME');
                            const result = await this.postPass("app.yongshixunzhang", savedUsername, gameConfig.nowLevel, gameConfig.levelTime);
                            console.log("上报关卡:", result, gameConfig.nowLevel, gameConfig.levelTime);
                            } catch (error) {
                        }
                    } else {
                        console.log(`重新挑战关卡 ${this.currentLevel}，关卡进度保持不变：${gameConfig.nowLevel}`)
                    }
                    // 显示通关弹窗，而不是直接进入下一关
                    loadPool.ins.getPoolNode('LevelCompleteWnd', gameConfig.gameRoot);
                }
            }
            this.checkGameOver()
        }).start()
    }
    // 在layer2中移动元素
    twoToThree(item: perBlock) {
        item.node.parent = this.node
        item.node.setPosition(this.node.getComponent(UITransform).convertToNodeSpaceAR(item.getTempPos()))
        let slotPos = this.layerAction3.getSlotPos(item)
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(slotPos)
        tween(item.node).to(0.15, { position: localPos }).call(async () => {
            this.layerAction3.add(item)
            // 是否消除
            let isDelet = this.layerAction3.delItem()
            if (isDelet) {
                // 标记游戏已经开始
                this.gameStarted = true
                if (this.layerAction1.getItemSize() == 0 && this.layerAction2.getItemSize() == 0 && this.layerAction3.getItemSize() == 0) {
                    // 游戏胜利
                    console.log('游戏胜利');
                    audioTool.ins.playSound(bgmName.sound_win)
                    // this.node.parent.getComponent(mainView).nextLevel()

                    // 暂停计时器（保存通关时间）
                    director.emit(emits.pauseTimer)
                    
                    // 只有当当前挑战的关卡是最新解锁的关卡时，才增加关卡进度
                    if (this.currentLevel === gameConfig.nowLevel) {
                        gameConfig.nowLevel += 1
                        save(local.nowLevel, gameConfig.nowLevel)
                        console.log(`关卡解锁：当前关卡 ${this.currentLevel} → 解锁到 ${gameConfig.nowLevel}`)
                        // 上报通关数据
                        try {
                            const savedUsername = sys.localStorage.getItem('SLS_USERNAME');
                            const result = await this.postPass("app.yongshixunzhang", savedUsername, gameConfig.nowLevel, gameConfig.levelTime);
                            console.log("上报关卡:", result, gameConfig.nowLevel, gameConfig.levelTime);
                            } catch (error) {
                        }
                    } else {
                        console.log(`重新挑战关卡 ${this.currentLevel}，关卡进度保持不变：${gameConfig.nowLevel}`)
                    }
                    // 显示通关弹窗，而不是直接进入下一关
                    loadPool.ins.getPoolNode('LevelCompleteWnd', gameConfig.gameRoot);
                }
            }
            // 等元素真正添加完再检查游戏是否结束
            this.checkGameOver()
        }).start()
    }
    // 判断游戏是否结束
    checkGameOver() {
        if (this.layerAction3.getItemSize() >= 7) {
            console.log('游戏失败');
            audioTool.ins.playSound(bgmName.sound_shibai)
            audioTool.ins.stopMusic()
            if (gameConfig.fuhouNum > 0) {
                // 打开广告
                if (gameConfig.isAd) {
                    wxAd.ins.showBanner2()
                }
                loadPool.ins.getPoolNode('gameOver1', gameConfig.gameRoot)
            } else {
                // 打开广告
                if (gameConfig.isAd) {
                    wxAd.ins.showBanner2()
                }
                loadPool.ins.getPoolNode('gameOver2', gameConfig.gameRoot)
            }
        }
    }
    /**
     * 功能按钮
     */
    // 复活
    isFuhuo() {
        this.yichu()
        audioTool.ins.playMusic(bgmName.game_bg)
    }
    // 设置
    settingBtn() {
        if (gameConfig.isAd) {
            wxAd.ins.showBanner2()
        }
        audioTool.ins.playSound(bgmName.sound_btn)
        // loadPool.ins.getPoolNode('setting', gameConfig.gameRoot)
        // director.emit(emits.backIsShow, 1)
        loadPool.ins.getPoolNode('PauseWnd', gameConfig.gameRoot)
        // 暂停计时器
        director.emit(emits.pauseTimer)
    }
    // 移出
    yichuBtn() {
        if (this.yichuCount >= this.maxItemUse) {
            loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
            director.emit(emits.tipMsg, '该道具本关使用次数已达到上限。')
            return
        }
        if (this.layerAction3.getItemSize() == 0) {
            loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
            director.emit(emits.tipMsg, '无需使用道具。')
            console.log('什么也没有');
            return
        }
        if (gameConfig.isAd) {
            audioTool.ins.stopMusic()
            if (sys.platform == sys.Platform.WECHAT_GAME) {
                KSAdMgr.Instance.videoReward(() => {
                    this.yichu()
                    // 使用次数加1
                    this.yichuCount += 1
                    audioTool.ins.playMusic(bgmName.game_bg)
                })
            }else{
                wxAd.ins.loadVideoAd(() => {
                    this.yichu()
                    // 使用次数加1
                    this.yichuCount += 1
                    audioTool.ins.playMusic(bgmName.game_bg)
                })
            }
        } else {
            console.log('暂无广告');
        }

    }
    private yichu() {
        let removeItem = this.layerAction3.getRemoveItem()
        if (removeItem.length == 0) {
            console.log('需要移出的列表为0');
            return
        }
        this.layerAction3.restOrder()
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(this.layerAction2.getWorldPos())
        for (let item of removeItem) {
            item.node.setParent(this.node)
            item.node.setPosition(this.node.getComponent(UITransform).convertToNodeSpaceAR(item.getTempPos()))
            tween(item.node).to(0.1, { position: local }).call(() => {
                this.layerAction2.addItem(item)
            }).start()
        }
    }
    // 撤回
    chehuiBtn() {
        if (this.chehuiCount >= this.maxItemUse) {
            loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
            director.emit(emits.tipMsg, '该道具本关使用次数已达到上限。')
            return
        }
        if (this.layerAction3.getItemSize() == 0) {
            loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
            director.emit(emits.tipMsg, '无需使用道具。')
            return
        }
        if (gameConfig.isAd) {
            wxAd.ins.zhuanfa()
            this.scheduleOnce(() => {
                audioTool.ins.playMusic(bgmName.game_bg)
                let endItem = this.layerAction3.getEndItem()
                if (!endItem) {
                    return
                }
                endItem.node.parent = this.node
                endItem.node.setPosition(this.node.getComponent(UITransform).convertToNodeSpaceAR(endItem.getTempPos()))
                let targetPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(endItem.original.node.getWorldPosition())
                tween(endItem.node).to(0.12, { position: targetPos }).call(() => {
                    endItem.original.node.active = true
                    this.layerAction1.showShadow()
                }).removeSelf().start()
                this.layerAction3.restOrder()
                // 使用次数加1
                this.chehuiCount += 1
                // 撤回提示
                loadPool.ins.getPoolNode('tips', this.node)
                director.emit(emits.tipMsg, '撤回成功。')
            }, 0.8)

        } else {
            console.log('暂无广告');
        }
    }
    // 打乱顺序
    randomBtn() {
        // 检查使用次数
        if (this.randomCount >= this.maxItemUse) {
            loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
            director.emit(emits.tipMsg, '该道具本关使用次数已达到上限。')
            return
        }
        
        // 检查游戏是否已经开始（暂时注释掉，刷新现在每关可使用2次）
        // if (this.gameStarted) {
        //     loadPool.ins.getPoolNode('tips', gameConfig.gameRoot)
        //     director.emit(emits.tipMsg, '对局已经开始，不能刷新。')
        //     return
        // }
        
        if (gameConfig.isAd) {
            audioTool.ins.stopMusic()
            if(sys.platform == sys.Platform.WECHAT_GAME){
                KSAdMgr.Instance.videoReward(() => {
                    this.layerAction1.randomItem()
                    // 使用次数加1
                    this.randomCount += 1
                    audioTool.ins.playMusic(bgmName.game_bg)
                })
            }else{
                wxAd.ins.loadVideoAd(() => {
                    this.layerAction1.randomItem()
                    // 使用次数加1
                    this.randomCount += 1
                    audioTool.ins.playMusic(bgmName.game_bg)
                })
            }
        } else {
            console.log('暂无广告');
        }
    }
    getLayer3Size() {
        return this.layerAction3.getItemSize()
    }
    // 
    protected onDisable(): void {
        this.unscheduleAllCallbacks()
    }




    //通关上报
    async postPass(appid: string, username: string, rank: number, star: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/PassLevel";
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            
            xhr.send(JSON.stringify({ appid, username, rank, star}));
        });
    }
}


