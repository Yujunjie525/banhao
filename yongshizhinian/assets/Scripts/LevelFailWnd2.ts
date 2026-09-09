import { _decorator, Component, Node, Button, Label, director, find } from 'cc';
import { gameConfig } from './gameConfig';
import EventMgr from './Base/EventMgr';
import { ENUM_EVENT } from '../Enum';
import { emits } from './enmus';
import { loadPool } from './loadPool';
import { GameData } from './GameData';
import DataManager from './Runtime/DataManager';
import { AudioMgr } from './Runtime/AudioMgr';
import { audioTool } from './audioTool';

const { ccclass, property } = _decorator;

@ccclass('LevelFailWnd2')
export class LevelFailWnd2 extends Component {
    @property(Node)
    btnRestart: Node = null; // 重新开始按钮
    
    @property(Node)
    btnBack: Node = null; // 返回主界面按钮
    
    onLoad() {
        // 初始化按钮显示状态
        this.updateButtonVisibility();
    }
    
    onEnable() {
        // 绑定按钮点击事件
        if (this.btnRestart) {
            this.btnRestart.off(Node.EventType.TOUCH_END, this.onRestartClick, this);
            this.btnRestart.on(Node.EventType.TOUCH_END, this.onRestartClick, this);
        }
        
        if (this.btnBack) {
            this.btnBack.off(Node.EventType.TOUCH_END, this.onBackClick, this);
            this.btnBack.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }
        
        // 初始化按钮显示状态
        this.updateButtonVisibility();
    }
    
    /**
     * 更新按钮显示状态
     */
    updateButtonVisibility() {
        // 这里可以根据需要更新按钮的显示状态
    }
    
    /**
     * 重新开始按钮点击事件
     */
    onRestartClick() {
        // 扣除体力作为消耗
        if (GameData.inst.ConsumeStamina(1)) {
            // 发出重新开始游戏事件，与MenuMgr中的handlerRestart方法保持一致
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_RESTART_GAME);
            // 关闭弹窗
            this.node.active = false;
        } else {
            // 体力不足，直接打回到home主界面
            this.node.active = false;
            // 关闭游戏内音乐和音效
            AudioMgr.inst.stop()
            // 同时停止 audioTool 的音乐，确保彻底关闭
            audioTool.ins.stopMusic();
            // 切换到主界面场景
            director.loadScene('home');
        }
    }
    
    /**
     * 返回主界面按钮点击事件
     */
    onBackClick() {
        // 关闭弹窗
        this.node.active = false;
        // 关闭游戏内音乐和音效
        AudioMgr.inst.stop()
        // 同时停止 audioTool 的音乐，确保彻底关闭
        audioTool.ins.stopMusic();
        // 切换到主界面场景
        director.loadScene('home');
    }
}
