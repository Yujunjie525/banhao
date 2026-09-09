
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Load/tools.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '57d02b9kZlFirHyXHLoHy4j', 'tools');
// Scripts/Load/tools.ts

Object.defineProperty(exports, "__esModule", { value: true });
exports.load = exports.save = void 0;
/**
 * @description: 存储本地数据
 * @return {*}
 */
function save(key, val) {
    if (typeof val === 'number') {
        val = ('' + val);
    }
    if (typeof val === 'object') {
        val = JSON.stringify(val);
    }
    cc.sys.localStorage.setItem(key, val || '');
}
exports.save = save;
/**
 * @description: 加载获取本地数据
 * @return {*}
 */
function load(key, type) {
    if (type === void 0) { type = 1; }
    var res = cc.sys.localStorage.getItem(key);
    if (res) {
        switch (type) {
            case 0:
                break;
            case 1:
                res = Number(res);
                break;
            case 2:
                res = JSON.parse(res);
                break;
        }
        return res;
    }
    else {
        return null;
    }
}
exports.load = load;

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxTQUFnQixJQUFJLENBQUMsR0FBVyxFQUFFLEdBQW1DO0lBQ2pFLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ3pCLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQVcsQ0FBQztLQUM5QjtJQUNELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQzVCO0lBQ0QsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQVJELG9CQVFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsRUFBRSxJQUFtQjtJQUFuQixxQkFBQSxFQUFBLFFBQW1CO0lBQ2pELElBQUksR0FBRyxHQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRCxJQUFJLEdBQUcsRUFBRTtRQUNMLFFBQVEsSUFBSSxFQUFFO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLE1BQU07WUFDVixLQUFLLENBQUM7Z0JBQ0YsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsTUFBTTtZQUNWLEtBQUssQ0FBQztnQkFDRixHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsTUFBTTtTQUNiO1FBQ0QsT0FBTyxHQUFHLENBQUM7S0FDZDtTQUFNO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDZjtBQUNMLENBQUM7QUFqQkQsb0JBaUJDIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBkZXNjcmlwdGlvbjog5a2Y5YKo5pys5Zyw5pWw5o2uXHJcbiAqIEByZXR1cm4geyp9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2F2ZShrZXk6IHN0cmluZywgdmFsOiBzdHJpbmcgfCBudW1iZXIgfCBvYmplY3QgfCBhbnkpOiBhbnkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgdmFsID0gKCcnICsgdmFsKSBhcyBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICB2YWwgPSBKU09OLnN0cmluZ2lmeSh2YWwpXHJcbiAgICB9XHJcbiAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWwgfHwgJycpO1xyXG59XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uOiDliqDovb3ojrflj5bmnKzlnLDmlbDmja5cclxuICogQHJldHVybiB7Kn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkKGtleTogc3RyaW5nLCB0eXBlOiAwIHwgMSB8IDIgPSAxKTogYW55IHtcclxuICAgIGxldCByZXM6IGFueSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xyXG4gICAgaWYgKHJlcykge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgcmVzID0gTnVtYmVyKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgcmVzID0gSlNPTi5wYXJzZShyZXMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuIl19