/**
 * GameBackendApi - 游戏后端接口 SDK
 * 用途：提供游戏后端接口的统一调用方式
 * @module GameBackendApi
 */

export interface GameBackendApiOptions {
    baseUrl?: string;
    timeoutMs?: number;
}

export interface GameBackendResponse<T = unknown> {
    code: number;
    msg?: string;
    data?: T;
}

/** GetLogin 返回的 data 常用字段 */
export interface GetLoginData {
    accountId?: number;
    user_id?: number;
    age?: number;
    rank?: number;
    isrealname?: number;
    is_real?: number;
}

/** 排行榜列表单项示例结构（以后端为准，可扩展字段） */
export interface RankListRow {
    accountId: number;
    totalLoginNum: number;
}

const DEFAULT_BASE_URL = 'https://pay.szvi-bo.com/v1/testapp';

const PATH_GET_LOGIN = 'GetLogin';
const PATH_REAL_NAME = 'RealName';
const PATH_BREATHE = 'Breathe';
const PATH_PAY_DIAMOND = 'PayDiamond';
const PATH_PASS_LEVEL = 'PassLevel';
const PATH_RANK_LIST = 'RankList';
const PATH_SAVE_USER_DATA = 'SaveUserData';
const PATH_GET_USER_DATA = 'GetUserData';

export const GAME_BACKEND_APPID = 'yongshigame008';
const appid = GAME_BACKEND_APPID;

let activeBaseUrl = DEFAULT_BASE_URL;
let activeTimeoutMs = 15_000;

function joinUrl(base: string, path: string): string {
    const b = base.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${b}/${p}`;
}

export class GameBackendApi {
    /**
     * 切换 API 根地址或超时
     */
    static configure(options: GameBackendApiOptions): void {
        if (options.baseUrl != null && options.baseUrl.length > 0) {
            activeBaseUrl = options.baseUrl.replace(/\/+$/, '');
        }
        if (options.timeoutMs != null && options.timeoutMs > 0) {
            activeTimeoutMs = options.timeoutMs;
        }
    }

    static getBaseUrl(): string {
        return activeBaseUrl;
    }

    static getAppId(): string {
        return appid;
    }

    /**
     * 通用 POST JSON。path 为相对 `baseUrl` 的一段，如 `'GetLogin'`。
     */
    static postJson<T = GameBackendResponse>(relativePath: string, body: Record<string, unknown>): Promise<T> {
        const url = joinUrl(activeBaseUrl, relativePath);
        console.log(`POST ${url} `);
        return new Promise<T>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = activeTimeoutMs;

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText) as T;
                        resolve(data);
                    } catch (e: unknown) {
                        const message = e instanceof Error ? e.message : String(e);
                        reject(new Error(`JSON解析错误: ${message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));

            xhr.send(JSON.stringify(body));
        });
    }

    static getLogin(username: string, password: string, type: number): Promise<GameBackendResponse<GetLoginData>> {
        return this.postJson<GameBackendResponse<GetLoginData>>(PATH_GET_LOGIN, {
            appid,
            username,
            password,
            type,
        });
    }

    static realName(username: string, realname: string, idnum: string): Promise<GameBackendResponse> {
        return this.postJson(PATH_REAL_NAME, { appid, username, realname, idnum });
    }

    static breathe(username: string): Promise<GameBackendResponse> {
        return this.postJson(PATH_BREATHE, { appid, username });
    }

    static payDiamond(username: string, diamond: number): Promise<GameBackendResponse> {
        return this.postJson(PATH_PAY_DIAMOND, { appid, username, diamond });
    }

    static passLevel(username: string, rank: number, star: number): Promise<GameBackendResponse> {
        return this.postJson(PATH_PASS_LEVEL, { appid, username, rank, star });
    }

    static rankList(): Promise<GameBackendResponse<RankListRow[]>> {
        return this.postJson<GameBackendResponse<RankListRow[]>>(PATH_RANK_LIST, { appid });
    }

    /**
  * 保存用户数据到服务端
  */
    static saveUserData(username: string, jsondata: unknown): Promise<GameBackendResponse> {
        return this.postJson(PATH_SAVE_USER_DATA, { appid, username, jsondata });
    }

    /**
     * 从服务端获取用户数据
     */
    static getUserData(username: string): Promise<GameBackendResponse> {
        return this.postJson(PATH_GET_USER_DATA, { appid, username });
    }
}
