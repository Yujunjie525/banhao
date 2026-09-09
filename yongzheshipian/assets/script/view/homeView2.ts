import { _decorator, Button, Component, director, Label, Node, profiler, sys } from 'cc';
import { loadPool } from '../../scripts/res/loadPool';
import { bgmName, emits } from '../../scripts/data/enmus';
import { mGameData } from '../../scripts/untils/GameData';
import { wxAd } from '../AD/wxAd';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../utils/audioTool';
import OnlineTimeManager from './OnlineTimeManager';
import { clearSessionUserData, getUserScopedKey, load, save } from '../utils/tools';
import {
    GAME3_DIFFICULTY_MODES,
    GAME3_DIFFICULTY_STORAGE_KEY,
    Game3DifficultyKey,
    getGame3DifficultyMode,
} from '../../scripts/game3/Game3Difficulty';

const { ccclass, property } = _decorator;

@ccclass('homeView2')
export class homeView2 extends Component {
    @property(Node) cbl: Node = null;
    @property(Label) user_label: Label = null;
    @property(Label) goldLabel: Label = null;
    @property(Label) lightCrystalLabel: Label = null;
    @property(Label) memoryFragmentLable: Label = null;
    @property(Label) maxDistanceLabel: Label = null;
    @property(Node) btn_reset: Node = null;
    @property(Node) btn_test: Node = null;
    @property(Label) btn_test_label: Label = null;
    @property(Node) time_node: Node = null;
    @property(Label) staminaLabel: Label = null;
    @property(Label) recoverTimerLabel: Label = null;
    @property(Node) achieveBtn: Node = null;
    @property(Node) weekBtn: Node = null;
    @property(Node) dailyBtn: Node = null;
    @property(Node) shopBtn: Node = null;
    @property(Node) QhBtn: Node = null;

    private isRecoverTimerManuallyHidden = true;
    private readonly STORAGE_KEY_AGE_STATUS = 'SLS_AGE_STATUS';
    private readonly STORAGE_KEY_HAS_SEEN_STORY = 'hasSeenStory';
    private hasShownTimePopup = false;
    private antiAddictionInterval = 5;
    private storyShowRetryCount = 0;
    private readonly maxStoryShowRetryCount = 20;

    start() {
        profiler.hideStats();
        this.init();
        this.updateMaxDistanceDisplay();
        if (this.cbl) {
            this.cbl.active = false;
        }
    }

    gerCbl() {
        if (this.cbl) {
            this.cbl.active = !this.cbl.active;
        }
    }

    init() {
        audioTool.ins.playMusic(bgmName.music_bg);
        if (gameConfig.isAd) {
            wxAd.ins.bgmZd(() => {
                audioTool.ins.playMusic(bgmName.music_bg);
            });
        }
    }

    onLoad() {
        OnlineTimeManager.initialize();
        this.updateUserDisplay();
        this.loadGame3DifficultyProgress();
        this.bindGame3DifficultyButtons();

        this.btn_reset?.on(Node.EventType.TOUCH_END, this.ResetAccount, this);
        this.btn_test?.on(Node.EventType.TOUCH_END, this.toggleGameMode, this);
        this.achieveBtn?.on(Node.EventType.TOUCH_END, this.achieveBtnClick, this);
        this.weekBtn?.on(Node.EventType.TOUCH_END, this.weekBtnClick, this);
        this.dailyBtn?.on(Node.EventType.TOUCH_END, this.dailyBtnClick, this);
        this.shopBtn?.on(Node.EventType.TOUCH_END, this.shopBtnClick, this);
        this.QhBtn?.on(Node.EventType.TOUCH_END, this.QhBtnClick, this);

        mGameData.ReloadStamina();
        this.checkAntiAddiction();
        this.schedule(this.checkAntiAddiction, this.antiAddictionInterval);

        this.updateGoldDisplay();
        this.updateMaxDistanceDisplay();
        this.schedule(this.updateGoldDisplay, 0.5);

        this.UpdateRecoverTimerDisplay();
        this.schedule(this.UpdateRecoverTimerDisplay, 1);

        this.time_node?.on(Node.EventType.TOUCH_END, this.toggleRecoverTimerVisibility, this);

        if (this.recoverTimerLabel?.node) {
            this.recoverTimerLabel.node.active = false;
        }

        director.on('staminaUpdate', this.onStaminaUpdate, this);
        this.showStoryIfNeeded();
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
        director.off('staminaUpdate', this.onStaminaUpdate, this);
    }

    onStaminaUpdate() {
        this.UpdateStaminaLabel();
        this.UpdateRecoverTimerDisplay();
    }

    toggleRecoverTimerVisibility() {
        if (this.recoverTimerLabel?.node) {
            this.recoverTimerLabel.node.active = !this.recoverTimerLabel.node.active;
            this.isRecoverTimerManuallyHidden = !this.recoverTimerLabel.node.active;
        }
    }

    UpdateRecoverTimerDisplay() {
        mGameData.CheckAndRecoverStamina();
        this.UpdateStaminaLabel();

        const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
        if (!this.recoverTimerLabel) {
            return;
        }

        if (isStaminaFull) {
            this.recoverTimerLabel.string = '体力已满';
            return;
        }

        const timeString = mGameData.GetFormattedRecoverTime();
        this.recoverTimerLabel.string = `下次体力恢复：${timeString}`;
        if (!this.isRecoverTimerManuallyHidden) {
            this.recoverTimerLabel.node.active = true;
        }
    }

    UpdateStaminaLabel() {
        if (this.staminaLabel) {
            this.staminaLabel.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
        }
    }

    updateGoldDisplay() {
        if (this.goldLabel) {
            this.goldLabel.string = String(gameConfig.jinbiNum || 0);
        }
        if (this.lightCrystalLabel) {
            this.lightCrystalLabel.string = String(gameConfig.lightCrystal || 0);
        }
        if (this.memoryFragmentLable) {
            this.memoryFragmentLable.string = String(gameConfig.memoryFragment || 0);
        }
    }

    updateMaxDistanceDisplay() {
        if (this.maxDistanceLabel) {
            this.maxDistanceLabel.string = `最高评分：${Number(gameConfig.maxJuli || 0)}`;
        }
    }

    settingBtn() {
        audioTool.ins.playSound(bgmName.sound_btn);
        loadPool.ins.getPoolNode('setting', this.node);
        director.emit(emits.backIsShow, 2);
    }

    paihangBtn() {
        audioTool.ins.playSound(bgmName.sound_btn);
        loadPool.ins.getPoolNode('RankWnd', this.node);
    }

    shareBtn() {
        if (gameConfig.isAd) {
            this.scheduleOnce(() => {
                audioTool.ins.playMusic(bgmName.music_bg);
            }, 0.3);
        }
    }

    pifuBtn() {
        audioTool.ins.playSound(bgmName.sound_btn);
        loadPool.ins.getPoolNode('pifuShop', this.node);
    }

    startBtn() {
        this.startGame3Mode('easy');
    }

    private startGame3Mode(modeKey: Game3DifficultyKey) {
        const mode = getGame3DifficultyMode(modeKey);
        if (mode.unlockLevel > Number(gameConfig.game3UnlockedDifficulty || 1)) {
            loadPool.ins.getPoolNode('tips', this.node);
            director.emit(emits.tipMsg, `请先通关${this.getPreviousDifficultyName(mode.unlockLevel)}难度。`);
            return;
        }

        audioTool.ins.playSound(bgmName.sound_btn);
        mGameData.CheckAndRecoverStamina();
        this.UpdateStaminaLabel();
        if (!mGameData.ConsumeStamina(1)) {
            loadPool.ins.getPoolNode('tips', this.node);
            director.emit(emits.tipMsg, '体力不足，请稍后再试。');
            return;
        }
        gameConfig.game3SelectedDifficulty = mode.key;
        gameConfig.selectedLevel = mode.startLevel;
        audioTool.ins.stopMusic();
        director.loadScene('game3');
    }

    private loadGame3DifficultyProgress() {
        const savedUnlockLevel = Number(load(GAME3_DIFFICULTY_STORAGE_KEY, 1) || 1);
        gameConfig.game3UnlockedDifficulty = Math.max(1, Math.min(GAME3_DIFFICULTY_MODES.length, savedUnlockLevel));
        save(GAME3_DIFFICULTY_STORAGE_KEY, gameConfig.game3UnlockedDifficulty);
    }

    private bindGame3DifficultyButtons() {
        this.bindGame3DifficultyButton('startBtn', 'easy');
        this.bindGame3DifficultyButton('startBtn2', 'medium');
        this.bindGame3DifficultyButton('startBtn3', 'hard');
    }

    private bindGame3DifficultyButton(buttonName: string, modeKey: Game3DifficultyKey) {
        const button = this.node.getChildByName(buttonName);
        if (!button) {
            return;
        }

        const buttonComponent = button.getComponent(Button);
        if (buttonComponent) {
            buttonComponent.clickEvents = [];
        }

        button.off(Node.EventType.TOUCH_END);
        button.on(Node.EventType.TOUCH_END, () => this.startGame3Mode(modeKey), this);
    }

    private getPreviousDifficultyName(unlockLevel: number) {
        const previousMode = GAME3_DIFFICULTY_MODES.find((mode) => mode.nextUnlockLevel === unlockLevel);
        return previousMode?.displayName || '上一';
    }

    achieveBtnClick() {
        audioTool.ins.playSound(bgmName.sound_btn);
        const achievePanel = this.node.getChildByName('AchievePanel');
        if (achievePanel) {
            achievePanel.active = true;
        }
    }

    weekBtnClick() {
        audioTool.ins.playSound(bgmName.sound_btn);
        const weekPanel = this.node.getChildByName('WeekPanel');
        if (weekPanel) {
            weekPanel.active = true;
        }
    }

    dailyBtnClick() {
        audioTool.ins.playSound(bgmName.sound_btn);
        const dailyPanel = this.node.getChildByName('DailyPanel');
        if (dailyPanel) {
            dailyPanel.active = true;
        }
    }

    shopBtnClick() {
        audioTool.ins.playSound(bgmName.sound_btn);
        const shopPanel = this.node.getChildByName('ShopPanel');
        if (shopPanel) {
            shopPanel.active = true;
        }
    }

    QhBtnClick() {
        audioTool.ins.playSound(bgmName.sound_btn);
        const QhPanel = this.node.getChildByName('QhPanel');
        if (QhPanel) {
            QhPanel.active = true;
        }
    }

    toggleGameMode() {
        // reserved
    }

    updateUserDisplay() {
        const userId = load('SLS_USER_ID', 0);
        if (this.user_label) {
            this.user_label.string = userId ? `玩家\n${userId}` : '未登录';
        } else {
            console.error('homeView2 user_label 未赋值');
        }
    }

    private showStoryIfNeeded() {
        const storyKey = getUserScopedKey(this.STORAGE_KEY_HAS_SEEN_STORY);
        if (load(storyKey, 0) === '1') {
            return;
        }

        const storyNode = loadPool.ins.getPoolNode('StoryWnd', this.node);
        if (!storyNode) {
            if (this.storyShowRetryCount < this.maxStoryShowRetryCount) {
                this.storyShowRetryCount += 1;
                this.scheduleOnce(this.showStoryIfNeeded, 0.2);
            }
            return;
        }

        save(storyKey, '1');
    }

    ResetAccount() {
        clearSessionUserData();
        sys.localStorage.removeItem('SLS_USERNAME');
        sys.localStorage.removeItem('SLS_PASSWORD');
        sys.localStorage.removeItem('SLS_USER_ID');
        save('SLS_REALNAME', 'false');
        gameConfig.nowLevel = 1;

        console.log('账号信息已清除，跳转到登录界面');
        director.loadScene('loading2');
    }

    async checkAntiAddiction() {
        const username = load('SLS_USERNAME', 0);
        if (!username) {
            console.log('未找到用户名，跳过防沉迷检查');
            return;
        }

        try {
            const antiAddictionResult = await this.PostBreathe(gameConfig.APP_ID, username);
            console.log('homeView2 防沉迷检查结果', antiAddictionResult);

            if (antiAddictionResult.data && antiAddictionResult.code === -1) {
                loadPool.ins.getPoolNode('TipsWnd', this.node);
                director.emit(emits.tipWndMsg, antiAddictionResult.msg, true);
                return;
            }

            console.log('homeView2 防沉迷检查通过');

            if (antiAddictionResult.data !== undefined && antiAddictionResult.data !== null) {
                const savedAgeStatus = load(this.STORAGE_KEY_AGE_STATUS, 0);
                if (savedAgeStatus !== '1') {
                    this.checkTimeAndShowPopup(antiAddictionResult.data as number);
                }
            }
        } catch (error) {
            console.error('homeView2 防沉迷检查失败', error);
        }
    }

    async PostBreathe(appid: string, username: string): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/Breathe';
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

            xhr.send(JSON.stringify({ appid, username }));
        });
    }

    checkTimeAndShowPopup(timestamp: number): void {
        try {
            const milliseconds = timestamp * 1000;
            const date = new Date(milliseconds);

            const hours = date.getHours();
            const minutes = date.getMinutes();
            const targetHour = 20;
            const targetMinute = 45;
            const endHour = 20;
            const endMinute = 46;

            if (hours > endHour || (hours === endHour && minutes > endMinute)) {
                console.log('时间已超过 20:46，不再检查');
                return;
            }

            if (this.hasShownTimePopup) {
                console.log('20:45 提示已显示过，不再重复显示');
                return;
            }

            if (hours > targetHour || (hours === targetHour && minutes >= targetMinute)) {
                console.log('时间已到 20:45，显示提示');
                loadPool.ins.getPoolNode('TipsWnd', this.node);
                director.emit(
                    emits.tipWndMsg,
                    '您目前为未成年人账号，已被纳入防沉迷系统。根据相关规定，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。'
                );
                this.hasShownTimePopup = true;
            } else {
                console.log('时间尚未到 20:45');
            }
        } catch (error) {
            console.error('时间解析失败:', error);
        }
    }
}
