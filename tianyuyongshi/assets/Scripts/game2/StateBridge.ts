import mGameData from '../Load/GameData';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import GameState, { getGameStateSaveKey } from './GameState';

const HERO_FRAGMENT_IDS = ['Item_002', 'Item_003', 'Item_004', 'Item_005', 'Item_006', 'Item_007'];
const SHENPO_KEY = 'Game2Shenpo';
const HERO_TIERS_KEY = 'Game2HeroTiers';

function getScopedKey(baseKey: string): string {
    const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? `${baseKey}_${userId}` : baseKey;
}

function normalizeLevelStars(rawStars: any): { [levelId: string]: number } {
    const stars: { [levelId: string]: number } = {};
    if (Array.isArray(rawStars)) {
        for (let i = 0; i < rawStars.length; i++) {
            const value = Number(rawStars[i]) || 0;
            if (value > 0) {
                stars[String(i + 1)] = value;
            }
        }
    } else if (rawStars && typeof rawStars === 'object') {
        Object.keys(rawStars).forEach((key) => {
            const value = Number(rawStars[key]) || 0;
            if (value > 0) {
                stars[String(key)] = value;
            }
        });
    }
    return stars;
}

function copyLevelStarsToArray(rawStars: { [levelId: string]: number }): number[] {
    const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : 0;
    const starsArray: number[] = [];
    for (let i = 1; i <= totalLevels; i++) {
        starsArray.push(Number(rawStars[String(i)]) || 0);
    }
    return starsArray;
}

// 负责旧项目 GameData 和新玩法 GameState 之间的数据同步。
// 进入新玩法前，把旧主界面的数据拷给新玩法；
// 退出新玩法时，再把新玩法的结果写回旧主界面和同步系统。
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

    static hasNewStateSave(): boolean {
        return !!cc.sys.localStorage.getItem(getGameStateSaveKey());
    }

    // Start 场景加载时调用。
    // 如果当前账号已经有新玩法存档，就把它回写到旧主界面；
    // 否则用旧主界面的数据初始化新玩法存档。
    static syncForStartScene(): void {
        if (!this.hasNewStateSave()) {
            this.syncOldToNew();
            return;
        }

        if (mGameData.GetLevelData) mGameData.GetLevelData();
        const oldUnlockedLevel = Math.max(1, mGameData.unlockedLevel || 1);
        const newUnlockedLevel = Math.max(1, (GameState.maxUnlockedLevel || 0) + 1);
        if (oldUnlockedLevel > newUnlockedLevel) this.syncOldToNew();
        else this.syncNewToOld();
    }

    // 旧 -> 新
    static syncOldToNew(): void {
        if (mGameData.GetStaminaData) mGameData.GetStaminaData();
        if (mGameData.CheckAndRecoverStamina) mGameData.CheckAndRecoverStamina();
        if (mGameData.GetGoldData) mGameData.GetGoldData();
        if (mGameData.GetLevelData) mGameData.GetLevelData();
        if (mGameData.GetItemStockData) mGameData.GetItemStockData();

        GameState.stamina = mGameData.currentStamina;
        GameState.shenpo = this.getShenpo();
        GameState.maxUnlockedLevel = Math.max(0, (mGameData.unlockedLevel || 1) - 1);
        GameState.levelStars = normalizeLevelStars(mGameData.levelStars);
        GameState.heroShards = GameState.heroShards || {};
        GameState.heroTiers = this.getHeroTiers();

        HERO_FRAGMENT_IDS.forEach((itemId, index) => {
            const stock = mGameData.getItemStock ? mGameData.getItemStock(index + 1) : 0;
            GameState.heroShards[itemId] = Math.max(0, stock || 0);
        });

        if (!GameState.selectedLevelIdx || GameState.selectedLevelIdx < 0) {
            GameState.selectedLevelIdx = Math.max(0, (mGameData.currentLevel || 1) - 1);
        }
        GameState.selectedLevelId = String(GameState.selectedLevelIdx + 1);
        GameState.save();
    }

    // 新 -> 旧
    static syncNewToOld(): void {
        mGameData.currentStamina = Math.max(0, GameState.stamina || 0);
        if (mGameData.SaveStaminaData) mGameData.SaveStaminaData();

        this.saveShenpo(GameState.shenpo || 0);
        this.saveHeroTiers(GameState.heroTiers || {});

        const unlockedLevel = Math.max(1, (GameState.maxUnlockedLevel || 0) + 1);
        mGameData.unlockedLevel = unlockedLevel;
        mGameData.currentLevel = Math.min(
            Math.max(1, (GameState.selectedLevelIdx || 0) + 1),
            unlockedLevel
        );
        mGameData.levelStars = copyLevelStarsToArray(GameState.levelStars || {});
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();

        HERO_FRAGMENT_IDS.forEach((itemId, index) => {
            const count = Math.max(0, (GameState.heroShards && GameState.heroShards[itemId]) || 0);
            mGameData.itemStock[index] = count;
        });
        if (mGameData.SaveItemStockData) mGameData.SaveItemStockData();

        cc.director.emit('goldUpdated');
        cc.director.emit('staminaUpdated');
        cc.director.emit('shenpoUpdated');
        UserDataSyncManager.requestUpload();
    }

    static consumeStamina(): boolean {
        if (mGameData.GetStaminaData) mGameData.GetStaminaData();
        if (mGameData.CheckAndRecoverStamina) mGameData.CheckAndRecoverStamina();

        const enoughStamina = mGameData.HasEnoughStamina
            ? mGameData.HasEnoughStamina()
            : mGameData.currentStamina > 0;
        if (!enoughStamina) {
            GameState.stamina = Math.max(0, mGameData.currentStamina || 0);
            GameState.save();
            cc.director.emit('staminaUpdated');
            return false;
        }

        const consumed = mGameData.ConsumeStamina
            ? mGameData.ConsumeStamina()
            : false;
        if (!consumed) {
            GameState.stamina = Math.max(0, mGameData.currentStamina || 0);
            GameState.save();
            cc.director.emit('staminaUpdated');
            return false;
        }

        GameState.stamina = Math.max(0, mGameData.currentStamina || 0);
        GameState.save();
        cc.director.emit('staminaUpdated');
        UserDataSyncManager.requestUpload();
        return true;
    }

    static prepareLevelSelection(): void {
        this.syncOldToNew();
        GameState.selectedLevelIdx = Math.max(0, (mGameData.unlockedLevel || 1) - 1);
        GameState.selectedLevelId = String(GameState.selectedLevelIdx + 1);
        GameState.save();
    }

    static prepareUpgrade(): void {
        this.syncOldToNew();
        GameState.save();
    }
}
