import mGameData from '../Load/GameData';
import GameState, { loadProgress, saveProgress, getProgress, getProgressSaveKey } from './GameState';

const SHENPO_KEY = 'Game2Shenpo';
const HERO_TIERS_KEY = 'Game2HeroTiers';

function getScopedKey(baseKey: string): string {
    const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? `${baseKey}_${userId}` : baseKey;
}

function normalizeLevelStars(rawStars: any): { [levelId: string]: number } {
    const stars: { [levelId: string]: number } = {};
    if (Array.isArray(rawStars)) {
        rawStars.forEach((value, index) => {
            const star = Math.max(0, Math.floor(Number(value) || 0));
            if (star > 0) stars[String(index + 1)] = star;
        });
        return stars;
    }

    if (rawStars && typeof rawStars === 'object') {
        Object.keys(rawStars).forEach((levelId) => {
            const star = Math.max(0, Math.floor(Number(rawStars[levelId]) || 0));
            if (star > 0) stars[String(levelId)] = star;
        });
    }
    return stars;
}

function copyLevelStarsToArray(rawStars: { [levelId: string]: number }): number[] {
    const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : 0;
    const total = Math.max(totalLevels, Object.keys(rawStars || {}).length);
    const starsArray: number[] = [];
    for (let i = 1; i <= total; i++) {
        starsArray.push(Math.max(0, Math.floor(Number(rawStars && rawStars[String(i)]) || 0)));
    }
    return starsArray;
}

function requestUpload(): void {
    try {
        const UserDataSyncManager = require('../Manager/UserDataSyncManager').default;
        if (UserDataSyncManager && UserDataSyncManager.requestUpload) {
            UserDataSyncManager.requestUpload();
        }
    } catch (error) {
        cc.warn('[StateBridge] request upload failed', error);
    }
}

export default class StateBridge {
    static getShenpo(): number {
        const raw = cc.sys.localStorage.getItem(getScopedKey(SHENPO_KEY));
        const value = raw ? parseInt(raw, 10) : 0;
        return isNaN(value) ? 0 : Math.max(0, value);
    }

    static saveShenpo(value: number): void {
        cc.sys.localStorage.setItem(
            getScopedKey(SHENPO_KEY),
            String(Math.max(0, Math.floor(value || 0)))
        );
    }

    static getHeroTiers(): { [heroId: string]: number } {
        try {
            const raw = cc.sys.localStorage.getItem(getScopedKey(HERO_TIERS_KEY));
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    static saveHeroTiers(heroTiers: { [heroId: string]: number }): void {
        cc.sys.localStorage.setItem(
            getScopedKey(HERO_TIERS_KEY),
            JSON.stringify(heroTiers || {})
        );
    }

    static getFailedLevels(): number[] {
        loadProgress();
        const failed = getProgress().failed_levels || [];
        return failed
            .map((level) => Math.max(1, Math.floor(Number(level) || 0)))
            .filter((level, index, list) => level > 0 && list.indexOf(level) === index);
    }

    static saveFailedLevels(failedLevels: number[]): void {
        loadProgress();
        getProgress().failed_levels = (failedLevels || [])
            .map((level) => Math.max(1, Math.floor(Number(level) || 0)))
            .filter((level, index, list) => level > 0 && list.indexOf(level) === index);
        saveProgress();
    }

    static hasNewStateSave(): boolean {
        return !!cc.sys.localStorage.getItem(getProgressSaveKey());
    }

    static syncForStartScene(): void {
        if (this.hasNewStateSave()) {
            this.syncNewToOld();
        } else {
            this.syncOldToNew();
        }
    }

    static syncOldToNew(): void {
        if (mGameData.GetStaminaData) mGameData.GetStaminaData();
        if (mGameData.CheckAndRecoverStamina) mGameData.CheckAndRecoverStamina();
        if (mGameData.GetLevelData) mGameData.GetLevelData();

        loadProgress();
        const p = getProgress();
        p.stamina = Math.max(0, Math.floor(Number(mGameData.currentStamina) || p.stamina || 0));
        p.last_stamina_time = Math.floor((Number(mGameData.lastRecoverTime) || Date.now()) / 1000);
        p.unlocked_level = Math.max(1, Math.floor(Number(mGameData.unlockedLevel) || p.unlocked_level || 1));
        p.level_stars = normalizeLevelStars(mGameData.levelStars || p.level_stars);
        if (mGameData.GetBestDistanceData) mGameData.GetBestDistanceData();
        p.best_distance = Math.max(0, Math.floor(Number(mGameData.bestDistance || mGameData.BestScore || p.best_distance) || 0));

        GameState.selectedLevel = Math.max(1, Math.floor(Number(mGameData.currentLevel) || GameState.selectedLevel || 1));
        saveProgress();
    }

    static syncNewToOld(): void {
        loadProgress();
        const p = getProgress();

        mGameData.currentStamina = Math.max(0, Math.floor(Number(p.stamina) || 0));
        mGameData.lastRecoverTime = Math.max(0, Math.floor(Number(p.last_stamina_time) || 0)) * 1000 || Date.now();
        if (mGameData.SaveStaminaData) mGameData.SaveStaminaData();

        mGameData.unlockedLevel = Math.max(1, Math.floor(Number(p.unlocked_level) || 1));
        mGameData.currentLevel = Math.min(
            Math.max(1, Math.floor(Number(GameState.selectedLevel) || 1)),
            mGameData.unlockedLevel
        );
        mGameData.levelStars = copyLevelStarsToArray(p.level_stars || {});
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();
        if (typeof p.best_distance === 'number') {
            mGameData.bestDistance = Math.max(0, Math.floor(Number(p.best_distance) || 0));
            mGameData.BestScore = mGameData.bestDistance;
            if (mGameData.SaveBestDistanceData) mGameData.SaveBestDistanceData();
        }

        cc.director.emit('staminaUpdated');
        requestUpload();
    }

    static consumeStamina(): boolean {
        loadProgress();
        const p = getProgress();
        if (p.stamina <= 0) {
            this.syncNewToOld();
            return false;
        }
        p.stamina -= 1;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        this.syncNewToOld();
        return true;
    }

    static prepareLevelSelection(): void {
        this.syncForStartScene();
        const p = getProgress();
        GameState.selectedLevel = Math.max(1, Math.min(GameState.selectedLevel || p.unlocked_level || 1, p.unlocked_level || 1));
        saveProgress();
    }

    static prepareUpgrade(): void {
        this.syncForStartScene();
        saveProgress();
    }
}
