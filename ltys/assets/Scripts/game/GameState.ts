import { UserProgress } from './Constants';
import cfg from './config';

const GameState: {
    progress: UserProgress;
    fromScene: string;
    selectedLevel: number;
    lastStars: number;
} = {
    progress: JSON.parse(JSON.stringify(cfg.defaultProgress)),
    fromScene: '',
    selectedLevel: 1,
    lastStars: 3,
};

// 读取本地存储，恢复进度
const StorageKey = 'ch_user_progress';

export function getProgressSaveKey(): string {
    const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? `${StorageKey}_${userId}` : StorageKey;
}

export function loadProgress(): void {
    const raw = cc.sys.localStorage.getItem(getProgressSaveKey()) || cc.sys.localStorage.getItem(StorageKey);
    if (raw) {
        try {
            const saved: UserProgress = JSON.parse(raw);
            Object.assign(GameState.progress, saved);
        } catch (e) {}
    }
    _rechargeStamina();
}

export function saveProgress(): void {
    cc.sys.localStorage.setItem(getProgressSaveKey(), JSON.stringify(GameState.progress));
}

// 按离线时长补充体力
function _rechargeStamina(): void {
    const now = Math.floor(Date.now() / 1000);
    const p = GameState.progress;
    if (p.last_stamina_time === 0) {
        p.last_stamina_time = now;
        return;
    }
    const elapsed = now - p.last_stamina_time;
    const gained = Math.floor(elapsed / cfg.stamina.rechargeIntervalSec);
    if (gained > 0) {
        p.stamina = Math.min(cfg.stamina.max, p.stamina + gained);
        p.last_stamina_time += gained * cfg.stamina.rechargeIntervalSec;
        saveProgress();
    }
}

export function getProgress(): UserProgress {
    return GameState.progress;
}

export function setFromScene(scene: string): void {
    GameState.fromScene = scene;
}

export function getFromScene(): string {
    return GameState.fromScene;
}

export default GameState;
