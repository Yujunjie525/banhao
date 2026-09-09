module.exports = {
    game: null,

    nativeAdId: 0,

    insertAdsRate: 1,

    insertAdsTime: 0,

    openNative: 1,

    cloudAppId: 'app.yongshixunzhang1',

    cloudBaseUrl: 'https://pay.szvi-bo.com/v1/testapp',

    saveUserDataTimer: null,

    gameInfo: {
        score: 0,
        level: 0,
        state: 'none',
        revive: false,
        isMaxPhone: 0,
        forceTime: 5,
        reverseTime: 5,
        skinName: ['player', 'huahua', 'gongzhu', 'jiewu', 'hongpi'],
        theme: 1,
        images: null,
        lastVideoTime: 0,
        gameScene: 'home',
    },

    musicInfo: {
        bgm: null,
        bgmState: false,
        state: false,
    },

    userData: {
        gem: 1000,
        maxScore: 0,
        theme: 1,
        lastSignTime: 0,
        keepSignTimes: 0,
        skin: 0,
        skinList: [0],
        signDay: 0,
        signTime: '',
        currentStamina: 30,
        lastRecoverTime: 0,
        staminaRecoveryPaused: false,
        staminaPausedAt: 0,
        storyPopupShown: false,
        agreementAccepted: false,
        dailyRechargeDate: '',
        dailyRechargeCount: 0,
    },

    shareInfo: {
        title: '',
        url: ''
    },

    restData: function() {
        this.gameInfo.score = 0;
        this.gameInfo.state = 'none';
        this.gameInfo.forceTime = 4;
        this.gameInfo.reverseTime = 5;
    },

    loadImg: function(node, src) {
        cc.loader.loadRes('images/' + src, cc.SpriteFrame, (err, res) => {
            node.getComponent(cc.Sprite).spriteFrame = res;
        });
    },

    getDefaultUserData: function() {
        return {
            gem: 1000,
            maxScore: 0,
            theme: 1,
            lastSignTime: 0,
            keepSignTimes: 0,
            skin: 0,
            skinList: [0],
            signDay: 0,
            signTime: '',
            currentStamina: 30,
            lastRecoverTime: 0,
            staminaRecoveryPaused: false,
            staminaPausedAt: 0,
            storyPopupShown: false,
            agreementAccepted: false,
            dailyRechargeDate: '',
            dailyRechargeCount: 0,
        };
    },

    looksLikeUserData: function(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        return data.hasOwnProperty('gem')
            || data.hasOwnProperty('maxScore')
            || data.hasOwnProperty('skin')
            || data.hasOwnProperty('skinList')
            || data.hasOwnProperty('lastSignTime')
            || data.hasOwnProperty('keepSignTimes')
            || data.hasOwnProperty('currentStamina')
            || data.hasOwnProperty('lastRecoverTime')
            || data.hasOwnProperty('staminaRecoveryPaused')
            || data.hasOwnProperty('staminaPausedAt')
            || data.hasOwnProperty('storyPopupShown')
            || data.hasOwnProperty('agreementAccepted');
    },

    getLegacyStaminaData: function() {
        const userId = this.getUserId();
        const staminaKey = `SLS_STAMINA_${userId}`;
        const recoverTimeKey = `SLS_RECOVER_TIME_${userId}`;
        const staminaValue = cc.sys.localStorage.getItem(staminaKey);
        const recoverTimeValue = cc.sys.localStorage.getItem(recoverTimeKey);

        if (staminaValue === null && recoverTimeValue === null) {
            return null;
        }

        const parsedStamina = Number(staminaValue);
        const parsedRecoverTime = Number(recoverTimeValue);

        return {
            currentStamina: isNaN(parsedStamina) ? 30 : parsedStamina,
            lastRecoverTime: isNaN(parsedRecoverTime) ? 0 : parsedRecoverTime,
        };
    },

    normalizeUserData: function(data) {
        if (!data || typeof data !== 'object') {
            return null;
        }

        const normalized = this.getDefaultUserData();
        const hasStaminaData = data.hasOwnProperty('currentStamina')
            || data.hasOwnProperty('lastRecoverTime');

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                normalized[key] = data[key];
            }
        }

        normalized.gem = Number(normalized.gem) || 0;
        normalized.maxScore = Number(normalized.maxScore) || 0;
        normalized.theme = Number(normalized.theme) || 1;
        normalized.lastSignTime = Number(normalized.lastSignTime) || 0;
        normalized.keepSignTimes = Number(normalized.keepSignTimes) || 0;
        normalized.skin = Number(normalized.skin) || 0;
        normalized.signDay = Number(normalized.signDay) || 0;
        normalized.signTime = normalized.signTime ? String(normalized.signTime) : '';
        normalized.currentStamina = Number(normalized.currentStamina);
        normalized.lastRecoverTime = Number(normalized.lastRecoverTime);
        normalized.staminaRecoveryPaused = normalized.staminaRecoveryPaused === true || normalized.staminaRecoveryPaused === 1 || normalized.staminaRecoveryPaused === '1';
        normalized.staminaPausedAt = Number(normalized.staminaPausedAt);
        normalized.storyPopupShown = normalized.storyPopupShown === true || normalized.storyPopupShown === 1 || normalized.storyPopupShown === '1' || normalized.storyPopupShown === 'true';
        normalized.agreementAccepted = normalized.agreementAccepted === true || normalized.agreementAccepted === 1 || normalized.agreementAccepted === '1' || normalized.agreementAccepted === 'true';
        normalized.dailyRechargeDate = normalized.dailyRechargeDate ? String(normalized.dailyRechargeDate) : '';
        normalized.dailyRechargeCount = Math.max(0, Number(normalized.dailyRechargeCount) || 0);

        if (isNaN(normalized.currentStamina)) {
            normalized.currentStamina = 30;
        }

        if (isNaN(normalized.lastRecoverTime)) {
            normalized.lastRecoverTime = 0;
        }

        if (isNaN(normalized.staminaPausedAt)) {
            normalized.staminaPausedAt = 0;
        }

        normalized.currentStamina = Math.max(0, Math.min(30, normalized.currentStamina));

        if (!hasStaminaData) {
            const legacyStaminaData = this.getLegacyStaminaData();
            if (legacyStaminaData) {
                normalized.currentStamina = Math.max(0, Math.min(30, Number(legacyStaminaData.currentStamina) || 0));
                normalized.lastRecoverTime = Number(legacyStaminaData.lastRecoverTime) || 0;
            }
        }

        if (!data.hasOwnProperty('storyPopupShown')) {
            const legacyStoryValue = cc.sys.localStorage.getItem(this.getKeyWithUserId('StoryPopupShown'));
            if (legacyStoryValue === 'true') {
                normalized.storyPopupShown = true;
            }
        }

        if (!Array.isArray(normalized.skinList)) {
            normalized.skinList = [0];
        }

        normalized.skinList = normalized.skinList
            .map((item) => Number(item))
            .filter((item, index, arr) => !isNaN(item) && arr.indexOf(item) === index);

        if (normalized.skinList.length === 0) {
            normalized.skinList = [0];
        }

        if (normalized.skinList.indexOf(0) === -1) {
            normalized.skinList.unshift(0);
        }

        if (normalized.skinList.indexOf(normalized.skin) === -1) {
            normalized.skin = 0;
        }

        return normalized;
    },

    getKeyWithUserId: function(baseKey) {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    },

    getUserId: function() {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? String(userId) : 'default';
    },

    getUsername: function() {
        const username = cc.sys.localStorage.getItem('SLS_USERNAME');
        return username ? String(username) : '';
    },

    getCloudApiUrl: function(path) {
        return `${this.cloudBaseUrl}/${path}`;
    },

    requestCloudApi: function(path, payload) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.getCloudApiUrl(path), true);
            xhr.timeout = 5000;
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));

            xhr.send(JSON.stringify(payload));
        });
    },

    saveUserDataToServer: function(appid, username, jsondata) {
        if (!appid || !username) {
            return Promise.resolve(null);
        }

        const normalized = this.normalizeUserData(jsondata || this.userData) || this.getDefaultUserData();
        return this.requestCloudApi('SaveUserData', {
            appid,
            username,
            jsondata: JSON.stringify(normalized)
        });
    },

    scheduleSaveUserDataToServer: function() {
        const username = this.getUsername();
        if (!username) {
            return;
        }

        if (this.saveUserDataTimer) {
            clearTimeout(this.saveUserDataTimer);
        }

        this.saveUserDataTimer = setTimeout(() => {
            this.saveUserDataTimer = null;
            this.saveUserDataToServer(this.cloudAppId, username, this.userData)
                .then((res) => {
                    console.log('用户云存档保存成功:', res);
                })
                .catch((error) => {
                    console.error('用户云存档保存失败:', error);
                });
        }, 200);
    },

    getUserDataFromServer: function(appid, username) {
        if (!appid || !username) {
            return Promise.resolve(null);
        }

        return this.requestCloudApi('GetUserData', {
            appid,
            username
        });
    },

    parseServerUserData: function(response) {
        let jsonData = null;

        if (response && typeof response === 'object') {
            if (typeof response.jsondata !== 'undefined' && response.jsondata !== null && response.jsondata !== '') {
                jsonData = response.jsondata;
            } else if (response.data && typeof response.data === 'object') {
                if (typeof response.data.jsondata !== 'undefined' && response.data.jsondata !== null && response.data.jsondata !== '') {
                    jsonData = response.data.jsondata;
                } else if (this.looksLikeUserData(response.data)) {
                    jsonData = response.data;
                }
            } else if (typeof response.data === 'string' && response.data) {
                jsonData = response.data;
            } else if (this.looksLikeUserData(response)) {
                jsonData = response;
            }
        }

        if (!jsonData) {
            return null;
        }

        if (typeof jsonData === 'string') {
            try {
                jsonData = JSON.parse(jsonData);
            } catch (error) {
                console.error('解析服务端用户数据失败:', error);
                return null;
            }
        }

        return this.normalizeUserData(jsonData);
    },

    applyUserData: function(data) {
        const normalized = this.normalizeUserData(data);
        if (!normalized) {
            return false;
        }

        this.userData = normalized;
        return true;
    },

    syncUserDataFromServer: function(appid, username) {
        const targetAppid = appid || this.cloudAppId;
        if (!targetAppid || !username) {
            return Promise.resolve({
                synced: false,
                status: 'empty'
            });
        }

        return this.getUserDataFromServer(targetAppid, username)
            .then((response) => {
                const serverData = this.parseServerUserData(response);
                if (!serverData) {
                    console.log('服务端没有可用的QiEUserInfo数据，继续使用本地数据');
                    return {
                        synced: false,
                        status: 'empty'
                    };
                }

                this.userData = serverData;
                this.saveData(false);
                console.log('服务端QiEUserInfo同步成功:', this.userData);
                return {
                    synced: true,
                    status: 'success'
                };
            })
            .catch((error) => {
                console.error('服务端QiEUserInfo同步失败:', error);
                return {
                    synced: false,
                    status: 'failed',
                    error: error
                };
            });
    },

    saveData: function(syncToCloud = true) {
        const normalized = this.normalizeUserData(this.userData);
        if (normalized) {
            this.userData = normalized;
        }

        const key = this.getKeyWithUserId('QiEUserInfo');
        cc.sys.localStorage.setItem(key, JSON.stringify(this.userData));

        if (syncToCloud) {
            this.scheduleSaveUserDataToServer();
        }
    },

    updateUserData: function() {
        const key = this.getKeyWithUserId('QiEUserInfo');
        const content = cc.sys.localStorage.getItem(key);
        if (!content) {
            return null;
        }

        try {
            return this.normalizeUserData(JSON.parse(content));
        } catch (error) {
            console.error('读取本地用户数据失败:', error);
            return null;
        }
    },

    loadUserData: function() {
        const data = this.updateUserData();
        if (data) {
            this.userData = data;
            console.log('用户数据加载成功:', this.userData);
        } else {
            this.userData = this.normalizeUserData({}) || this.getDefaultUserData();
            console.log('本地无数据，重置为默认值:', this.userData);
        }
    },

    removeData: function() {
        cc.sys.localStorage.clear();
    },

    timeFormat: function(num = 0) {
        let timePoint, month, day, date;
        if (num > 0) {
            timePoint = new Date(new Date().getTime() + (num * 24 * 3600 * 1000));
        } else {
            timePoint = new Date(new Date() - (num * 24 * 3600 * 1000));
        }
        month = ('0' + (timePoint.getMonth() + 1)).slice(-2);
        day = ('0' + timePoint.getDate()).slice(-2);
        date = `${timePoint.getFullYear()}-${month}-${day}`;
        return date;
    },

    hexToColor: function(hex) {
        hex = hex.replace(/^#?/, '0x');
        var c = parseInt(hex);
        var r = (c >> 16);
        var g = ((c & 0x00FF00) >> 8);
        var b = (c & 0x0000FF);
        return cc.color(r, g, b);
    },

    getDate: function() {
        var dayTime = Math.round(Math.round(new Date() / 1000) / 3600 / 24) - (49 * 365);
        return dayTime;
    },
};

function commonlyUse() {
    cc.director.loadScene('name');
    cc.director.isPaused();
    cc.director.pause();
    cc.director.resume();

    this.hexToColor('#ffffff');
    new cc.Color({ r: 70, g: 162, b: 245 });

    cc.loader.loadRes(src, cc.SpriteFrame, (err, res) => {
        node.getComponent(cc.Sprite).spriteFrame = res;
    });

    cc.loader.load(src, (err, res) => {
        node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    });

    cc.instantiate(node);

    this.scheduleOnce(() => {

    }, 1);

    node.getComponent(dragonBones.ArmatureDisplay).playAnimation('name', 1);

    const MC = cc.director.getCollisionManager();
    MC.enabled = true;
    MC.enabledDebugDraw = true;
    MC.enabledDrawBoundingBox = true;

    const MP = cc.director.getPhysicsManager();
    MP.enabled = true;
    MP.enabledAccumulator = true;
    MP.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit
        | cc.PhysicsManager.DrawBits.e_pairBit
        | cc.PhysicsManager.DrawBits.e_centerOfMassBit
        | cc.PhysicsManager.DrawBits.e_jointBit
        | cc.PhysicsManager.DrawBits.e_shapeBit;
}
