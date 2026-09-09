import { GameBackendApi } from "../../script/Api/GameBackendApi";

export default class LocalStorageKeys {
    static appPrefix(): string {
        return `${GameBackendApi.getAppId()}_`;
    }

    static appKey(baseKey: string): string {
        return `${this.appPrefix()}${baseKey}`;
    }

    static userKey(baseKey: string, userId?: string | number | null): string {
        if (userId != null && `${userId}`.length > 0) {
            return this.appKey(`${baseKey}_${userId}`);
        }
        return this.appKey(baseKey);
    }

    static clearAppData(): void {
        const storage = cc.sys.localStorage as any;
        const prefix = this.appPrefix();
        const keys: string[] = [];

        if (typeof storage.key !== "function" || typeof storage.length !== "number") {
            storage.clear();
            return;
        }

        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && String(key).indexOf(prefix) === 0) {
                keys.push(String(key));
            }
        }

        for (let i = 0; i < keys.length; i++) {
            storage.removeItem(keys[i]);
        }
    }
}
