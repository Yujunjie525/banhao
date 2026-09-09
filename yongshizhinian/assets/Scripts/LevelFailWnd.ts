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

@ccclass('LevelFailWnd')
export class LevelFailWnd extends Component {
    @property(Node)
    btnRevive: Node = null; // 复活按钮
    
    @property(Node)
    btnRestart: Node = null; // 重来一次按钮
    
    @property(Node)
    btnBack: Node = null; // 返回主界面按钮
    
    @property(Node)
    bofanganniu: Node = null; // 播放按钮图标（btn_home下的子节点）
    
    // 复活次数，每次闯关只能复活一次
    // 使用DataManager中的reviveCount，确保在整个闯关中保持状态
    
    onLoad() {
        // 初始化按钮显示状态
        this.updateButtonVisibility();
    }
    
    onEnable() {
        // 绑定按钮点击事件
        if (this.btnRevive) {
            this.btnRevive.off(Node.EventType.TOUCH_END, this.onReviveClick, this);
            this.btnRevive.on(Node.EventType.TOUCH_END, this.onReviveClick, this);
        }
        
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
        this.updateBofanganniuVisibility();
    }
    
    /**
     * 更新按钮显示状态
     */
    updateButtonVisibility() {
        const maxRevives = DataManager.Instance.getMaxReviveCount();
        if (this.btnRevive && this.btnRestart) {
            if (DataManager.Instance.reviveCount < maxRevives) {
                this.btnRevive.active = true;
                this.btnRestart.active = false;
            } else {
                this.btnRevive.active = false;
                this.btnRestart.active = true;
            }
        }
    }
    
    /**
     * 更新播放按钮图标的显示状态
     * 角色2（复活角色）不显示bofanganniu图标
     */
    updateBofanganniuVisibility() {
        if (this.bofanganniu) {
            this.bofanganniu.active = !gameConfig.hasRoleReviveBonus();
        }
    }
    
    /**
     * 复活按钮点击事件
     */
    onReviveClick() {
        console.log('onReviveClick called, this.node:', this.node);
        console.log('reviveCount:', DataManager.Instance.reviveCount);
        console.log('currentStamina:', GameData.inst.currentStamina);
        
        const maxRevives = DataManager.Instance.getMaxReviveCount();
        if (DataManager.Instance.reviveCount >= maxRevives) {
            const tipsNode = loadPool.ins.getPoolNode('tips', this.node);
            director.emit(emits.tipMsg, '本次闯关复活次数已用完。');
            return;
        }
        
        // 角色2（复活角色）复活不需要消耗体力
        if (gameConfig.hasRoleReviveBonus()) {
            DataManager.Instance.reviveCount++;
            this.node.active = false;
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_RESUME_TIMER);
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_REVOKE_STEP);
        } else if (GameData.inst.ConsumeStamina(1)) {
            DataManager.Instance.reviveCount++;
            this.node.active = false;
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_RESUME_TIMER);
            EventMgr.Instance.emit(ENUM_EVENT.ENUM_REVOKE_STEP);
        } else {
            const tipsNode = loadPool.ins.getPoolNode('tips', this.node);
            director.emit(emits.tipMsg, '体力不足，无法复活。');
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
    
    /**
     * 重来一次按钮点击事件
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
}
