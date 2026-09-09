import { _decorator, Component, sys } from 'cc';
import { gameConfig } from '../data/gameConfig';

const { ccclass } = _decorator;

type CloudStorageMap = Record<string, string>;

interface CloudPayload {
    version: number;
    updatedAt: number;
    storage: CloudStorageMap;
}

@ccclass('cloudUserData')
export class cloudUserData extends Component {
    private static _ins: cloudUserData = null!;

    private readonly DEFAULT_APP_ID = gameConfig.APP_ID;
    private readonly BASE_URL = 'https://pay.szvi-bo.com/v1/testapp';
    private readonly SYNC_KEYS = new Set([
        'jinbiNum',
        'tiliNum',
        'isBgm',
        'isSound',
        'page',
        'slectType',
        'playerList',
        'oldTime',
        'nowLevel',
        'nowPifu',
        'pifuIsJiesuo',
    ]);
    private readonly SYNC_KEY_PREFIXES = [
        'playerList',
        'slectType',
        'SLS_STAMINA_',
        'SLS_RECOVER_TIME_',
        'dailyRewardDate',
        'dailyRewardClaimed',
        'dailyOnlineMinutes',
        'totalOnlineMinutes',
        'weeklyRewardWeekStart',
        'weeklyRewardClaimed',
        'Achievesclaimed',
        'totalConsumedStamina',
        'totalEarnedGold',
        'maxJuli_',
    ];

    private syncTimer: ReturnType<typeof setTimeout> | null = null;
    private isSyncing = false;
    private lastSnapshot = '';

    public static get ins() {
        if (!this._ins) {
            this._ins = new cloudUserData();
        }
        return this._ins;
    }

    public isSyncableKey(key: string) {
        if (this.SYNC_KEYS.has(key)) {
            return true;
        }
        return this.SYNC_KEY_PREFIXES.some((prefix) => this.matchesScopedPrefix(key, prefix));
    }

    public listSyncableKeys() {
        const keys = [...this.SYNC_KEYS];
        const userId = this.getUserId();
        if (userId) {
            keys.push(
                `playerList_${userId}`,
                `slectType_${userId}`,
                `SLS_STAMINA_${userId}`,
                `SLS_RECOVER_TIME_${userId}`,
                `maxJuli_${userId}`
            );
        }
        return keys;
    }

    public scheduleSyncForKey(key: string) {
        if (!this.isSyncableKey(key)) {
            return;
        }

        const username = this.getUsername();
        if (!username) {
            return;
        }

        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }

        this.syncTimer = setTimeout(() => {
            this.syncTimer = null;
            void this.pushCurrentUserData();
        }, 500);
    }

    public async pushCurrentUserData(appid = this.DEFAULT_APP_ID, username = this.getUsername()) {
        if (!username || this.isSyncing) {
            return;
        }

        const payload = this.buildPayload();
        const snapshot = JSON.stringify(payload.storage);
        if (snapshot === this.lastSnapshot) {
            return;
        }

        this.isSyncing = true;
        try {
            await this.request('SaveUserData', {
                appid,
                username,
                jsondata: JSON.stringify(payload),
            });
            this.lastSnapshot = snapshot;
        } catch (error) {
            console.error('SaveUserData failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    public async pullAndApply(appid = this.DEFAULT_APP_ID, username = this.getUsername()) {
        if (!username) {
            return false;
        }

        try {
            const response = await this.request('GetUserData', { appid, username });
            const storage = this.extractStorage(response);
            if (!storage || Object.keys(storage).length === 0) {
                return false;
            }

            this.applyStorage(storage);
            this.lastSnapshot = JSON.stringify(this.collectStorage());
            return true;
        } catch (error) {
            console.error('GetUserData failed:', error);
            return false;
        }
    }

    private buildPayload(): CloudPayload {
        return {
            version: 1,
            updatedAt: Date.now(),
            storage: this.collectStorage(),
        };
    }

    private collectStorage(): CloudStorageMap {
        const storage: CloudStorageMap = {};

        for (const key of this.SYNC_KEYS) {
            const value = sys.localStorage.getItem(key);
            if (value !== null && value !== undefined && value !== '') {
                storage[key] = value;
            }
        }

        if (typeof sys.localStorage.key === 'function') {
            const storageLength = sys.localStorage.length || 0;
            for (let i = 0; i < storageLength; i++) {
                const key = sys.localStorage.key(i);
                if (!key || !this.isSyncableKey(key)) {
                    continue;
                }

                const value = sys.localStorage.getItem(key);
                if (value !== null && value !== undefined && value !== '') {
                    storage[key] = value;
                }
            }
        }

        return storage;
    }

    private applyStorage(storage: Record<string, any>) {
        for (const key of Object.keys(storage)) {
            if (!this.isSyncableKey(key)) {
                continue;
            }

            const value = storage[key];
            const normalized = this.stringifyValue(value);
            sys.localStorage.setItem(key, normalized);
        }
    }

    private extractStorage(response: any): Record<string, any> | null {
        const candidate = response?.data?.jsondata ?? response?.jsondata ?? response?.data ?? null;
        if (!candidate) {
            return null;
        }

        let parsed = candidate;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch (error) {
                console.error('Parse cloud jsondata failed:', error);
                return null;
            }
        }

        if (parsed?.storage && typeof parsed.storage === 'object') {
            return parsed.storage;
        }

        if (typeof parsed === 'object') {
            return parsed;
        }

        return null;
    }

    private stringifyValue(value: any) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        return JSON.stringify(value);
    }

    private matchesScopedPrefix(key: string, prefix: string) {
        if (!key.startsWith(prefix)) {
            return false;
        }

        const currentUserId = this.getUserId();
        if (!currentUserId) {
            return false;
        }

        if (prefix.endsWith('_')) {
            return key === `${prefix}${currentUserId}`;
        }

        return key === `${prefix}_${currentUserId}`;
    }

    private getUsername() {
        return sys.localStorage.getItem('SLS_USERNAME') || '';
    }

    private getUserId() {
        return sys.localStorage.getItem('SLS_USER_ID') || '';
    }

    private async request(endpoint: string, body: Record<string, any>) {
        const url = `${this.BASE_URL}/${endpoint}`;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error}`));
                    }
                } else {
                    reject(new Error(`HTTP error: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network request failed'));
            xhr.ontimeout = () => reject(new Error('Network request timeout'));

            xhr.send(JSON.stringify(body));
        });
    }
}
