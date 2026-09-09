import { save } from '../tools';
import { mGameData } from '../GameData';
const { ccclass, property } = cc._decorator;

@ccclass
export class Setting extends cc.Component {
    @property(cc.Node) close: cc.Node = null;
    @property(cc.Node) back: cc.Node = null;
    // 音乐按钮
    @property(cc.Node) bgm: cc.Node = null;
    // 音效按钮
    @property(cc.Node) sound: cc.Node = null;
    
    // 游戏配置
    private gameConfig = {
        isBgm: 1,
        isSound: 1,
        bgmVol: 0.8,
        soundVol: 0.9
    };
    
    protected onEnable(): void {
        this.init();
        this.bindEvents();
    }
    
    init() {
        // 从本地存储加载设置
        this.loadSettings();
        // 同步 AudioMgr 的状态
        this.syncAudioState();
        // 更新 UI 显示
        this.updateAudioUI();
    }
    
    // 绑定点击事件
    bindEvents() {
        // 为 close 按钮绑定点击事件
        if (this.close) {
            this.close.on('touchend', this.closeBtn, this);
        }
        if (this.back) {
            this.back.on('touchend', this.backBtn, this);
        }
        // 为 bgm 按钮绑定点击事件
        if (this.bgm) {
            this.bgm.on('touchend', this.bgmBtn, this);
        }
        // 为 sound 按钮绑定点击事件
        if (this.sound) {
            this.sound.on('touchend', this.soundBtn, this);
        }
    }
    
    // 同步 AudioMgr 的状态
    syncAudioState() {
        if ((cc as any).Mgr && (cc as any).Mgr.AudioMgr) {
            // 从 AudioMgr 获取当前状态
            const audioMgr = (cc as any).Mgr.AudioMgr;
            this.gameConfig.isBgm = audioMgr.getMusicState();
            this.gameConfig.isSound = audioMgr.getVoiceState();
        } else {
            // 如果 AudioMgr 还没有初始化，从本地存储加载状态
            const savedBgm = cc.sys.localStorage.getItem('musicState');
            const savedSound = cc.sys.localStorage.getItem('voiceState');
            
            if (savedBgm !== null) {
                this.gameConfig.isBgm = parseInt(savedBgm);
            }
            
            if (savedSound !== null) {
                this.gameConfig.isSound = parseInt(savedSound);
            }
        }
    }
    
    // 更新音频 UI 显示
    updateAudioUI() {
        let musicState = this.gameConfig.isBgm;
        let voiceState = this.gameConfig.isSound;
        
        if ((cc as any).Mgr && (cc as any).Mgr.AudioMgr) {
            const audioMgr = (cc as any).Mgr.AudioMgr;
            musicState = audioMgr.getMusicState();
            voiceState = audioMgr.getVoiceState();
        }
        
        // 更新音乐按钮状态
        if (this.bgm) {
            this.bgm.getChildByName('on').active = musicState === 1;
            this.bgm.getChildByName('off').active = musicState === 0;
        }
        
        // 更新音效按钮状态
        if (this.sound) {
            this.sound.getChildByName('on').active = voiceState === 1;
            this.sound.getChildByName('off').active = voiceState === 0;
        }
    }
    
    // 从本地存储加载设置
    loadSettings() {
        const savedBgm = cc.sys.localStorage.getItem('musicState');
        const savedSound = cc.sys.localStorage.getItem('voiceState');
        
        if (savedBgm !== null) {
            this.gameConfig.isBgm = parseInt(savedBgm);
        }
        
        if (savedSound !== null) {
            this.gameConfig.isSound = parseInt(savedSound);
        }
    }
    
    // 关闭弹窗
    closeBtn() {
        (cc as any).Mgr.AudioMgr.playSFX("click");
        this.node.active = false;
    }
    
    // 返回到登录界面
    backBtn() {
        (cc as any).Mgr.AudioMgr.playSFX("click");
        this.node.active = false;

        mGameData.PauseStaminaRecovery();
        
        localStorage.removeItem('SLS_USERNAME');
        localStorage.removeItem('SLS_PASSWORD');
        localStorage.removeItem('SLS_USER_ID');
        save('SLS_REALNAME', 'false');
        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        cc.director.loadScene('Load');
    }
    
    // 控制音乐
    bgmBtn() {
        if ((cc as any).Mgr && (cc as any).Mgr.AudioMgr) {
            const audioMgr = (cc as any).Mgr.AudioMgr;
            const currentState = audioMgr.getMusicState();
            
            if (currentState === 1) {
                // 关闭音乐
                audioMgr.pauseMusic();
            } else {
                // 开启音乐
                audioMgr.resumeMusic();
            }
            
            // 保存状态到本地存储
            this.gameConfig.isBgm = audioMgr.getMusicState();
            save('musicState', this.gameConfig.isBgm);
            
            // 更新 UI
            this.updateAudioUI();
        }
    }
    
    // 控制音效
    soundBtn() {
        if ((cc as any).Mgr && (cc as any).Mgr.AudioMgr) {
            const audioMgr = (cc as any).Mgr.AudioMgr;
            const currentState = audioMgr.getVoiceState();
            
            if (currentState === 1) {
                // 关闭音效
                audioMgr.pauseVoice();
            } else {
                // 开启音效
                audioMgr.resumeVoice();
            }
            
            // 保存状态到本地存储
            this.gameConfig.isSound = audioMgr.getVoiceState();
            save('voiceState', this.gameConfig.isSound);
            
            // 更新 UI
            this.updateAudioUI();
        }
    }
}
