import { _decorator, AudioClip, Component, JsonAsset, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 事件监听
 */
export const emits = {
    // 更新编辑器剩余元素数量显示
    updateSize: 'updateSize',
    // 更新编辑器剩余元素数量显示
    tipMsg: 'tipMsg',
    tipWndMsg: 'tipWndMsg',
    // 退出按钮是否显示
    backIsShow: 'backIsShow',
    // 复活
    isFuhuo: 'isFuhuo',
    // 从新开始
    anewGame: 'anewGame',
    // 道具状态
    daojuStatus: 'daojuStatus',
    // 关卡计时器
    pauseTimer: 'pauseTimer',
    resumeTimer: 'resumeTimer',

}
/**
 * 资源路径
 */
export const resPath = {
    itemsPre: { type: Prefab, path: 'prefabs/items' },
    uiPre: { type: Prefab, path: 'prefabs/UI' },
    music: { type: AudioClip, path: 'music' },
    json: { type: JsonAsset, path: 'leveJson' },
};
/**
 * 音乐名称
 */
export const bgmName = {
    music_bg: 'homeBgm',
    game_bg: 'gameBgm',
    sound_click: 'btn',
    sound_clean: 'xiaoshi',
    sound_shibai: 'ph',
    sound_win: 'jinbi',
    sound_btn: 'btn',
};
/**
 * 本地存储
 */
export const local = {
    nowLevel: 'nowLevel',
    isBgm: 'isBgm',
    isSound: 'isSound',
    nowPifu: 'nowPifu',
    pifuIsJiesuo: 'pifuIsJiesuo',
};


