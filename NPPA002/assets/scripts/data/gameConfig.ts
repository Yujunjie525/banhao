import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameConfig')
export class gameConfig {
    // 游戏根节点
    static gameRoot: Node = null
    // 设置音效
    static isSound = 1
    // 设置音乐
    static isBgm = 1
    // 音效音量
    static soundVol = 0.9
    // 音乐音量
    static bgmVol = 0.8
    // 游戏模式（编辑器还是游戏）0 游戏 1编辑
    static gameModel = 0
    // 当前编辑器模式 1 添加方块 2删除方块 3添加网格 4删除网格
    static editModel = 1
    // 当前关卡
    static nowLevel = 1
    // 剩余可复活次数
    static fuhouNum = 1
    // 剩余移出次数
    static yichuNum = 1
    // 剩余撤回次数
    static chehuiNum = 1
    // 剩余打乱次数
    static randomNum = 1
    // 当前使用的主题
    static nowPifu = 1
    // 第二个皮肤是否解锁
    static pifuIsJiesuo = 0
    // 是否开启广告
    static isAd = true
    // 临时关卡（用于关卡选择，不影响解锁进度）
    static tempLevel = 0
    // 当前正在玩的关卡
    static currentLevel = 0
    // 当前关卡通关时间（秒）
    static levelTime = 0
}


