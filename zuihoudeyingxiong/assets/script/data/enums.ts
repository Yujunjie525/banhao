import { _decorator, AudioClip, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 监听事件
 */
export const emits = {
    jump: 'jump',
    atk: 'atk',
    shoot: 'shoot',
    creatLevel: 'creatLevel',
    // 金币
    jinbiNum: 'jinbiNum',
    PHNum: 'PHNum',
    backIsShow: 'backIsShow',
    tips: 'tips',
    initNum: 'initNum',
    queren: 'queren',
    leveJinbiNum: 'leveJinbiNum',
    // 角色购买列表刷新
    playListInit: 'playListInit',
    // 游戏暂停
    gamePause: 'gamePause',
    // 游戏结束
    gameover: 'gameover',
    // 复活
    fuhuo: 'fuhuo',
    // 首页图标状态
    initHomeIcon: 'initHomeIcon',
};
/**
 * 资源路径
 */
export const resPath = {
    enemyPar: { type: Prefab, path: 'parfabs/enemyPar' },
    levelPar: { type: Prefab, path: 'parfabs/level' },
    UIPerfab: { type: Prefab, path: 'parfabs/UI' },
    playersfab: { type: Prefab, path: 'parfabs/players' },
    music: { type: AudioClip, path: 'music' },
};
/**
 *碰撞
 */
export const pzTag = {
    player: 2,
    road: 4,
    enemy: 8,
    bullet: 16,
    hp: 32,
    jinbi: 64,
    jiguan: 128,
    enemyBullet: 256,
};
/**
 * 本地存储数据
 */
export const localData = {
    // 金币
    jinbiNum: 'jinbiNum',
    // 体力
    tiliNum: 'tiliNum',
    // 是否开启音量
    isBgm: 'isBgm',
    isSound: 'isSound',
    // 当前角色列表页码
    page: 'page',
    // 当前选择的角色
    slectType: 'slectType',
    // 角色状态列表
    playerList: 'playerList',
    // 福利领取时间
    oldTime: 'oldTime',
    // 最高得分
    maxJuli: 'maxJuli',
    // 是否看过剧情
    hasSeenStory: 'hasSeenStory',
    // 是否完成玩法引导
    hasCompletedGuide: 'hasCompletedGuide'
};
