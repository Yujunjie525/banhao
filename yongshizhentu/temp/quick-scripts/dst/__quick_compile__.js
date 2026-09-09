
(function () {
var scripts = [{"deps":{"./assets/Scripts/RankPanel":29,"./assets/Scripts/Common/AppConfig":1,"./assets/Scripts/GameLanch":7,"./assets/Scripts/Load/SplashManager":10,"./assets/Scripts/Load/TipsWnd":3,"./assets/Scripts/Load/tools":9,"./assets/Scripts/Load/TipsManager":12,"./assets/Scripts/Load/GameData":13,"./assets/Scripts/Manager/LevelSelectManager":11,"./assets/Scripts/Manager/OnlineTimeManager":16,"./assets/Scripts/Manager/AchieveManager":19,"./assets/Scripts/Manager/ShopManager":15,"./assets/Scripts/Manager/RankManager":34,"./assets/Scripts/Manager/LoadManager":14,"./assets/Scripts/Manager/WeeklyRewardManager":18,"./assets/Scripts/Manager/UserDataSyncManager":21,"./assets/Scripts/Manager/SkillManager":17,"./assets/Scripts/Manager/DailyRewardManager":5,"./assets/Scripts/testPageView":8,"./assets/Scripts/Managers/PoolManager":25,"./assets/Scripts/Managers/PrefabPool":23,"./assets/Scripts/Managers/ResMgr":22,"./assets/Scripts/Managers/SoundMgr":24,"./assets/Scripts/Managers/EventMgr":31,"./assets/Scripts/Managers/WxMgr":30,"./assets/Scripts/Managers/UIMgr":27,"./assets/Scripts/Managers/TtMgr":26,"./assets/Scripts/Managers/FrameAnim":20,"./assets/Scripts/Managers/Net/NetMgr":2,"./assets/Scripts/game/GameState":6,"./assets/Scripts/game/StateBridge":28,"./assets/Scripts/game/WarriorRunController":36,"./assets/Scripts/game/WarriorRunConfig":33,"./assets/Scripts/game/config":35,"./assets/Scripts/game/Constants":32,"./assets/Scripts/shipei":4},"path":"preview-scripts/__qc_index__.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Common/AppConfig.js"},{"deps":{"../EventMgr":31},"path":"preview-scripts/assets/Scripts/Managers/Net/NetMgr.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Load/TipsWnd.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/shipei.js"},{"deps":{"./OnlineTimeManager":16,"../Load/TipsManager":12,"../Load/GameData":13,"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/DailyRewardManager.js"},{"deps":{"./config":35},"path":"preview-scripts/assets/Scripts/game/GameState.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/GameLanch.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/testPageView.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Load/tools.js"},{"deps":{"./TipsManager":12,"../Load/GameData":13,"./TipsWnd":3,"../Common/AppConfig":1,"../Manager/UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Load/SplashManager.js"},{"deps":{"../Load/TipsManager":12,"../game/GameState":6,"../game/StateBridge":28,"../Load/GameData":13,"../game/config":35,"../game/WarriorRunConfig":33,"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/LevelSelectManager.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Load/TipsManager.js"},{"deps":{"../Manager/UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Load/GameData.js"},{"deps":{"../Load/GameData":13,"../Load/TipsWnd":3,"../Common/AppConfig":1,"../Load/TipsManager":12,"../game/StateBridge":28},"path":"preview-scripts/assets/Scripts/Manager/LoadManager.js"},{"deps":{"../Load/GameData":13,"../Load/TipsManager":12},"path":"preview-scripts/assets/Scripts/Manager/ShopManager.js"},{"deps":{"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/OnlineTimeManager.js"},{"deps":{"../Load/TipsManager":12,"../Load/GameData":13,"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/SkillManager.js"},{"deps":{"../Load/TipsManager":12,"../Load/GameData":13,"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/WeeklyRewardManager.js"},{"deps":{"../Load/GameData":13,"../Load/TipsManager":12,"./UserDataSyncManager":21},"path":"preview-scripts/assets/Scripts/Manager/AchieveManager.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/FrameAnim.js"},{"deps":{"../Common/AppConfig":1,"../game/StateBridge":28,"../Load/GameData":13,"../game/GameState":6},"path":"preview-scripts/assets/Scripts/Manager/UserDataSyncManager.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/ResMgr.js"},{"deps":{"./ResMgr":22},"path":"preview-scripts/assets/Scripts/Managers/PrefabPool.js"},{"deps":{"./ResMgr":22,"../Load/GameData":13},"path":"preview-scripts/assets/Scripts/Managers/SoundMgr.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/PoolManager.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/TtMgr.js"},{"deps":{"./ResMgr":22},"path":"preview-scripts/assets/Scripts/Managers/UIMgr.js"},{"deps":{"../Load/GameData":13,"../Manager/UserDataSyncManager":21,"./GameState":6},"path":"preview-scripts/assets/Scripts/game/StateBridge.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/RankPanel.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/WxMgr.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/Managers/EventMgr.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/game/Constants.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/game/WarriorRunConfig.js"},{"deps":{"../Common/AppConfig":1},"path":"preview-scripts/assets/Scripts/Manager/RankManager.js"},{"deps":{},"path":"preview-scripts/assets/Scripts/game/config.js"},{"deps":{"./StateBridge":28,"./WarriorRunConfig":33,"../Load/GameData":13,"../Manager/UserDataSyncManager":21,"../Common/AppConfig":1},"path":"preview-scripts/assets/Scripts/game/WarriorRunController.js"}];
var entries = ["preview-scripts/__qc_index__.js"];
var bundleScript = 'preview-scripts/__qc_bundle__.js';

/**
 * Notice: This file can not use ES6 (for IE 11)
 */
var modules = {};
var name2path = {};

// Will generated by module.js plugin
// var scripts = ${scripts};
// var entries = ${entries};
// var bundleScript = ${bundleScript};

if (typeof global === 'undefined') {
    window.global = window;
}

var isJSB = typeof jsb !== 'undefined';

function getXMLHttpRequest () {
    return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('MSXML2.XMLHTTP');
}

function downloadText(url, callback) {
    if (isJSB) {
        var result = jsb.fileUtils.getStringFromFile(url);
        callback(null, result);
        return;
    }

    var xhr = getXMLHttpRequest(),
        errInfo = 'Load text file failed: ' + url;
    xhr.open('GET', url, true);
    if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                callback(null, xhr.responseText);
            }
            else {
                callback({status:xhr.status, errorMessage:errInfo + ', status: ' + xhr.status});
            }
        }
        else {
            callback({status:xhr.status, errorMessage:errInfo + '(wrong readyState)'});
        }
    };
    xhr.onerror = function(){
        callback({status:xhr.status, errorMessage:errInfo + '(error)'});
    };
    xhr.ontimeout = function(){
        callback({status:xhr.status, errorMessage:errInfo + '(time out)'});
    };
    xhr.send(null);
};

function loadScript (src, cb) {
    if (typeof require !== 'undefined') {
        require(src);
        return cb();
    }

    // var timer = 'load ' + src;
    // console.time(timer);

    var scriptElement = document.createElement('script');

    function done() {
        // console.timeEnd(timer);
        // deallocation immediate whatever
        scriptElement.remove();
    }

    scriptElement.onload = function () {
        done();
        cb();
    };
    scriptElement.onerror = function () {
        done();
        var error = 'Failed to load ' + src;
        console.error(error);
        cb(new Error(error));
    };
    scriptElement.setAttribute('type','text/javascript');
    scriptElement.setAttribute('charset', 'utf-8');
    scriptElement.setAttribute('src', src);

    document.head.appendChild(scriptElement);
}

function loadScripts (srcs, cb) {
    var n = srcs.length;

    srcs.forEach(function (src) {
        loadScript(src, function () {
            n--;
            if (n === 0) {
                cb();
            }
        });
    })
}

function formatPath (path) {
    let destPath = window.__quick_compile_project__.destPath;
    if (destPath) {
        let prefix = 'preview-scripts';
        if (destPath[destPath.length - 1] === '/') {
            prefix += '/';
        }
        path = path.replace(prefix, destPath);
    }
    return path;
}

window.__quick_compile_project__ = {
    destPath: '',

    registerModule: function (path, module) {
        path = formatPath(path);
        modules[path].module = module;
    },

    registerModuleFunc: function (path, func) {
        path = formatPath(path);
        modules[path].func = func;

        var sections = path.split('/');
        var name = sections[sections.length - 1];
        name = name.replace(/\.(?:js|ts|json)$/i, '');
        name2path[name] = path;
    },

    require: function (request, path) {
        var m, requestScript;

        path = formatPath(path);
        if (path) {
            m = modules[path];
            if (!m) {
                console.warn('Can not find module for path : ' + path);
                return null;
            }
        }

        if (m) {
            let depIndex = m.deps[request];
            // dependence script was excluded
            if (depIndex === -1) {
                return null;
            }
            else {
                requestScript = scripts[ m.deps[request] ];
            }
        }
        
        let requestPath = '';
        if (!requestScript) {
            // search from name2path when request is a dynamic module name
            if (/^[\w- .]*$/.test(request)) {
                requestPath = name2path[request];
            }

            if (!requestPath) {
                if (CC_JSB) {
                    return require(request);
                }
                else {
                    console.warn('Can not find deps [' + request + '] for path : ' + path);
                    return null;
                }
            }
        }
        else {
            requestPath = formatPath(requestScript.path);
        }

        let requestModule = modules[requestPath];
        if (!requestModule) {
            console.warn('Can not find request module for path : ' + requestPath);
            return null;
        }

        if (!requestModule.module && requestModule.func) {
            requestModule.func();
        }

        if (!requestModule.module) {
            console.warn('Can not find requestModule.module for path : ' + path);
            return null;
        }

        return requestModule.module.exports;
    },

    run: function () {
        entries.forEach(function (entry) {
            entry = formatPath(entry);
            var module = modules[entry];
            if (!module.module) {
                module.func();
            }
        });
    },

    load: function (cb) {
        var self = this;

        var srcs = scripts.map(function (script) {
            var path = formatPath(script.path);
            modules[path] = script;

            if (script.mtime) {
                path += ("?mtime=" + script.mtime);
            }
            return path;
        });

        console.time && console.time('load __quick_compile_project__');
        // jsb can not analysis sourcemap, so keep separate files.
        if (bundleScript && !isJSB) {
            downloadText(formatPath(bundleScript), function (err, bundleSource) {
                console.timeEnd && console.timeEnd('load __quick_compile_project__');
                if (err) {
                    console.error(err);
                    return;
                }

                let evalTime = 'eval __quick_compile_project__ : ' + srcs.length + ' files';
                console.time && console.time(evalTime);
                var sources = bundleSource.split('\n//------QC-SOURCE-SPLIT------\n');
                for (var i = 0; i < sources.length; i++) {
                    if (sources[i]) {
                        window.eval(sources[i]);
                        // not sure why new Function cannot set breakpoints precisely
                        // new Function(sources[i])()
                    }
                }
                self.run();
                console.timeEnd && console.timeEnd(evalTime);
                cb();
            })
        }
        else {
            loadScripts(srcs, function () {
                self.run();
                console.timeEnd && console.timeEnd('load __quick_compile_project__');
                cb();
            });
        }
    }
};

// Polyfill for IE 11
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}
})();
    