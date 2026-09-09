/**
 * # GameBackendApi — 游戏支付/账号后端（testapp）联调 SDK
 *
 * **用途**：把整个 `GameBackendSdk` 文件夹拷到任意项目（Cocos Creator、普通浏览器前端等），
 * 通过静态方法发起与当前产品线一致的 `POST` + `application/json` 请求（基于 `XMLHttpRequest`）。
 *
 * ---
 *
 * ## 接入步骤
 *
 * 1. 复制本目录 **`GameBackendSdk`** 到目标工程任意路径（例如 `assets/scripts/third_party/GameBackendSdk/`）。
 * 2. 在需要调接口的脚本中：`import { GameBackendApi } from './GameBackendSdk/GameBackendApi';`（按实际相对路径调整）。
 * 3. 使用下方业务方法或通用 `postJson`；所有网络错误通过 **Promise reject** 抛出，请 `try/catch`。
 *
 * ```ts
 * import { GameBackendApi } from '此处填你的相对路径/GameBackendApi';
 *
 * GameBackendApi.configure({ baseUrl: 'https://pay.szvi-bo.com/v1/testapp', timeoutMs: 20000 });
 *
 * const res = await GameBackendApi.breathe({ appid: 'app.xxx', username: 'user1' });
 * if (res.code === 0) { /* 成功，具体以后端为准 *\/ }
 * else if (res.code === -1) { /* 常见：业务失败/防沉迷，读 res.msg *\/ }
 * ```
 *
 * ## 响应约定（与现网前端逻辑一致）
 *
 * 通常为：`{ code: number, msg?: string, data?: unknown }`。
 * - `code === 0` 多表示成功。
 * - `code === -1` 常用于失败或拦截，配合 `msg` 提示。
 *
 * ## 接口一览
 *
 * | 方法 | 路径 | 说明 |
 * |------|------|------|
 * | `getLogin` | GetLogin | 登录/注册（`appid`、`username`、`password`、`type`） |
 * | `realName` | RealName | 实名 |
 * | `breathe` | Breathe | 心跳 / 防沉迷 |
 * | `payDiamond` | PayDiamond | 钻石充值 |
 * | `passLevel` | PassLevel | 通关上报 |
 * | `rankList` | RankList | 排行榜 |
 * | `postJson` | 自定义 | 新接口只复用传输层时用 |
 *
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
    [key: string]: unknown;
}

export interface GetLoginBody {
    appid: string;
    username: string;
    password: string;
    type: number; //1注册 2登录
}

/** GetLogin 返回的 data 常用字段 */
export interface GetLoginData {
    accountId?: number;
    user_id?: number;
    age?: number;
    rank?: number;
    isrealname?: number;
    is_real?: number;
    [key: string]: unknown;
}

export interface RealNameBody {
    appid: string;
    username: string;
    realname: string;
    idnum: string;
}

export interface BreatheBody {
    appid: string;
    username: string;
}

export interface PayDiamondBody {
    appid: string;
    username: string;
    diamond: number;
}

export interface PassLevelBody {
    appid: string;
    username: string;
    rank: number;
    star: number;//特殊需求加的参数，可以传0
}

export interface RankListBody {
    appid: string;
}

export interface SaveUserDataBody {
    appid: string;
    username: string;
    jsondata: string;
}

export interface GetUserDataBody {
    appid: string;
    username: string;
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

let activeBaseUrl = DEFAULT_BASE_URL;
let activeTimeoutMs = 15_000;

function joinUrl(base: string, path: string): string {
    const b = base.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${b}/${p}`;
}

export class GameBackendApi {
    /**
     * 切换 API 根地址或超时（建议在启动时调用一次）。
     * @param options.baseUrl - 不含末尾 `/`，例如 `https://pay.szvi-bo.com/v1/testapp`
     * @param options.timeoutMs - 毫秒，`XMLHttpRequest.timeout`
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

    /**
     * 通用 POST JSON。path 为相对 `baseUrl` 的一段，如 `'GetLogin'`。
     */
    static postJson<T = GameBackendResponse>(relativePath: string, body: Record<string, unknown>): Promise<T> {
        const url = joinUrl(activeBaseUrl, relativePath);
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

    static getLogin(body: GetLoginBody): Promise<GameBackendResponse<GetLoginData>> {
        const { appid, username, password, type } = body;
        return this.postJson<GameBackendResponse<GetLoginData>>(PATH_GET_LOGIN, {
            appid,
            username,
            password,
            type,
        });
    }

    static realName(body: RealNameBody): Promise<GameBackendResponse> {
        const { appid, username, realname, idnum } = body;
        return this.postJson(PATH_REAL_NAME, { appid, username, realname, idnum });
    }

    static breathe(body: BreatheBody): Promise<GameBackendResponse> {
        const { appid, username } = body;
        return this.postJson(PATH_BREATHE, { appid, username });
    }

    static payDiamond(body: PayDiamondBody): Promise<GameBackendResponse> {
        const { appid, username, diamond } = body;
        return this.postJson(PATH_PAY_DIAMOND, { appid, username, diamond });
    }

    /**
     * 通关上报。本项目约定：rank=服务端存储的已完成进度（与登录 data.rank 同语义），star=关卡用时等；
     * 推图通关时应传本次完成的关卡号 `currentLevel`，不是本地自增后的 `nowLevel`。
     */
    static passLevel(body: PassLevelBody): Promise<GameBackendResponse> {
        const { appid, username, rank, star } = body;
        return this.postJson(PATH_PASS_LEVEL, { appid, username, rank, star });
    }

    static rankList(body: RankListBody): Promise<GameBackendResponse<RankListRow[]>> {
        const { appid } = body;
        return this.postJson<GameBackendResponse<RankListRow[]>>(PATH_RANK_LIST, { appid });
    }

    static saveUserData(body: SaveUserDataBody): Promise<GameBackendResponse> {
        const { appid, username, jsondata } = body;
        return this.postJson(PATH_SAVE_USER_DATA, { appid, username, jsondata });
    }

    static getUserData(body: GetUserDataBody): Promise<GameBackendResponse> {
        const { appid, username } = body;
        return this.postJson(PATH_GET_USER_DATA, { appid, username });
    }
}
