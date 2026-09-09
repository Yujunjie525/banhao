/*
*****Created By Alex 2018 08 24
*/
var self = null;
var AudioMgr = cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume:0.5,
        sfxVolume:0.5,
        bgmAudioID:-1,
        sfxAudioID:-1,
        musicState:1, //1 表示开启 0 表示关闭
        voiceState:1,
    },

    // use this for initialization
    init: function () {
        self = this;
        cc.Mgr.loadSound = false;

        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);    
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);    
        }
        
        // 从本地存储加载音乐和音效开关状态
        var t = cc.sys.localStorage.getItem("musicState");
        if(t != null){
            this.musicState = parseInt(t);    
        }
        
        var t = cc.sys.localStorage.getItem("voiceState");
        if(t != null){
            this.voiceState = parseInt(t);    
        }
        
        // 根据加载的状态设置音频
        if (this.musicState === 0) {
            this.bgmVolume = 0.0;
        }
        if (this.voiceState === 0) {
            this.sfxVolume = 0.0;
        }
        
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            if(self.musicState == 1)
            {
                if(cc.Mgr.Utils.onVideoAds == true)
                    cc.audioEngine.pauseAll();
                else
                {
                    if(cc.Mgr.PlatformController.platform == "qg_vivo")
                    {
                        cc.audioEngine.stopAll();
                        self.scheduleOnce(function(){
                            cc.audioEngine.resumeAll();
                            self.playBGM("bgm");
                        }, 0.1);
                    }
                    else
                    {
                        self.resumeAll();
                    }
                }
            }
            else
                cc.audioEngine.pauseAll();
        });
    },

    playBGM:function(url){
        // 检查音乐开关状态
        if (this.musicState === 0) {
            return;
        }
        
        cc.loader.loadRes("sound/" + url, cc.AudioClip, (err, clip) => {
            if (err) {
                console.error("load audio error:", err);
                return;
            }
            if(this.bgmAudioID >= 0){
                cc.audioEngine.stop(this.bgmAudioID);
            }
            this.bgmAudioID = cc.audioEngine.playMusic(clip, true);
            cc.audioEngine.setVolume(this.bgmAudioID, this.bgmVolume);
        });
    },
    playSFX:function(url){
        if(this.voiceState == 0)
            return;
        cc.loader.loadRes("sound/" + url, cc.AudioClip, (err, clip) => {
            if (err) {
                console.error("load audio error:", err);
                return;
            }
            let id = cc.audioEngine.playEffect(clip, false);
            cc.audioEngine.setVolume(id, this.sfxVolume);
        });
    },
    //设置音效大小
    setSFXVolume:function(v){
        if(this.sfxVolume != v){
            cc.sys.localStorage.setItem("sfxVolume",v);
            this.sfxVolume = v;
        }
    },
    //设置背景音大小
    setBGMVolume:function(v,force){
        if(this.bgmAudioID >= 0){
            if(v > 0){
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else{
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        if(this.bgmVolume != v || force){
            cc.sys.localStorage.setItem("bgmVolume",v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID,v);
        }
    },
    //暂停
    pauseAll:function(){
        // 保存当前状态
        this._savedMusicState = this.musicState;
        this._savedVoiceState = this.voiceState;
        this._savedBgmVolume = this.bgmVolume;
        this._savedSfxVolume = this.sfxVolume;
        
        // 暂停所有音频
        cc.audioEngine.pauseAll();

    },
    //恢复
    resumeAll:function(){
        // 恢复之前保存的状态
        if (this._savedMusicState !== undefined) {
            this.musicState = this._savedMusicState;
        }
        if (this._savedVoiceState !== undefined) {
            this.voiceState = this._savedVoiceState;
        }
        if (this._savedBgmVolume !== undefined) {
            this.bgmVolume = this._savedBgmVolume;
        }
        if (this._savedSfxVolume !== undefined) {
            this.sfxVolume = this._savedSfxVolume;
        }
        
        // 恢复音频
        if (this.musicState === 1) {
            cc.audioEngine.resumeAll();
        }

    },

    pauseMusic:function(){
        this.musicState = 0;
        this.bgmVolume = 0.0;
        if(this.bgmAudioID >= 0){
            cc.audioEngine.pause(this.bgmAudioID);
        }
        // 保存状态到本地存储
        cc.sys.localStorage.setItem("musicState", this.musicState);
    },

    resumeMusic:function(){
        this.musicState = 1;
        this.bgmVolume = 0.5;
        if(this.bgmAudioID >= 0){
            cc.audioEngine.resume(this.bgmAudioID);
        } else {
            // 如果还没有播放过音乐，播放默认背景音乐
            this.playBGM("bgm");
        }
        // 保存状态到本地存储
        cc.sys.localStorage.setItem("musicState", this.musicState);
    },

    pauseVoice:function(){
        this.voiceState = 0;
        this.sfxVolume = 0.0;
        // 保存状态到本地存储
        cc.sys.localStorage.setItem("voiceState", this.voiceState);
    },

    resumeVoice:function(){
        this.voiceState = 1;
        this.sfxVolume = 0.5;
        // 保存状态到本地存储
        cc.sys.localStorage.setItem("voiceState", this.voiceState);
    },

    getMusicState:function(){
        return this.musicState;
    },

    getVoiceState:function(){
        return this.voiceState;
    },
});
module.exports = AudioMgr;
