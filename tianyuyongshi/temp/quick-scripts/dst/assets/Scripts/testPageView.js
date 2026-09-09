
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/testPageView.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '7d7b6FaaSxE/omRNcrLL6s9', 'testPageView');
// Scripts/testPageView.js

"use strict";

cc.Class({
  "extends": cc.PageView,
  properties: {},
  onLoad: function onLoad() {},
  start: function start() {},
  _hasNestedViewGroup: function _hasNestedViewGroup(event, captureListeners) {
    console.log("new_hasNestedViewGroup");
    if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
    if (!event.touch) return;
    var moveDelta = event.touch.getDelta(); // TODO： 2.如果是上移移动则直接吞噬

    if (captureListeners) {
      for (var i = 0; i < captureListeners.length; ++i) {
        var item = captureListeners[i];

        if (item) {
          // 自身节点
          if (this.node === item) {
            if (moveDelta.x === 0) {
              return false;
            } //  // 屏蔽掉此判断，会导致scrollview没有回弹效果
            //   if (event.target.getComponent(cc.ViewGroup)) {
            //       return true;
            //   }

          } // 其他节点但有viewGroup


          if (item.getComponent(cc.ViewGroup)) {
            return false;
          }
        }
      }
    }

    return true;
  } //   _hasNestedViewGroup: function (event, captureListeners) {
  //     if(event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
  //     var touch = event.touch;
  //     if(!touch) return;
  //     var deltaMove = cc.pSub(touch.getLocation(), touch.getStartLocation());
  //     if (deltaMove.x > 7 || deltaMove.x < -7)
  //         return false;
  //    // if (deltaMove.y > 7 || deltaMove.y < -7)
  //    //     return false;
  //     if(captureListeners) {
  //         //captureListeners are arranged from child to parent
  //         for(var i = 0; i < captureListeners.length; ++i){
  //             var item = captureListeners[i];
  //             if(this.node === item) {
  //                 if(event.target.getComponent(cc.ViewGroup)) {
  //                     return true;
  //                 }
  //                 return false;
  //             }
  //             if(item.getComponent(cc.ViewGroup)) {
  //                 return true;
  //             }
  //         }
  //     }
  //     return false;
  // },
  // update (dt) {},

});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcdGVzdFBhZ2VWaWV3LmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJQYWdlVmlldyIsInByb3BlcnRpZXMiLCJvbkxvYWQiLCJzdGFydCIsIl9oYXNOZXN0ZWRWaWV3R3JvdXAiLCJldmVudCIsImNhcHR1cmVMaXN0ZW5lcnMiLCJjb25zb2xlIiwibG9nIiwiZXZlbnRQaGFzZSIsIkV2ZW50IiwiQ0FQVFVSSU5HX1BIQVNFIiwidG91Y2giLCJtb3ZlRGVsdGEiLCJnZXREZWx0YSIsImkiLCJsZW5ndGgiLCJpdGVtIiwibm9kZSIsIngiLCJnZXRDb21wb25lbnQiLCJWaWV3R3JvdXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSCxDQUFTO0FBQ0wsYUFBU0QsRUFBRSxDQUFDRSxRQURQO0FBR0xDLEVBQUFBLFVBQVUsRUFBRSxFQUhQO0FBU05DLEVBQUFBLE1BVE0sb0JBU0ksQ0FFVCxDQVhLO0FBYUxDLEVBQUFBLEtBYkssbUJBYUksQ0FFUixDQWZJO0FBZ0JMQyxFQUFBQSxtQkFoQkssK0JBZ0JlQyxLQWhCZixFQWdCc0JDLGdCQWhCdEIsRUFnQndDO0FBQzNDQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWjtBQUNFLFFBQUlILEtBQUssQ0FBQ0ksVUFBTixLQUFxQlgsRUFBRSxDQUFDWSxLQUFILENBQVNDLGVBQWxDLEVBQW1EO0FBQ25ELFFBQUksQ0FBQ04sS0FBSyxDQUFDTyxLQUFYLEVBQWtCO0FBRWxCLFFBQU1DLFNBQVMsR0FBR1IsS0FBSyxDQUFDTyxLQUFOLENBQVlFLFFBQVosRUFBbEIsQ0FMeUMsQ0FNekM7O0FBQ0EsUUFBSVIsZ0JBQUosRUFBc0I7QUFDcEIsV0FBSyxJQUFJUyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHVCxnQkFBZ0IsQ0FBQ1UsTUFBckMsRUFBNkMsRUFBRUQsQ0FBL0MsRUFBa0Q7QUFDaEQsWUFBTUUsSUFBSSxHQUFHWCxnQkFBZ0IsQ0FBQ1MsQ0FBRCxDQUE3Qjs7QUFDQSxZQUFJRSxJQUFKLEVBQVU7QUFDUjtBQUNBLGNBQUksS0FBS0MsSUFBTCxLQUFjRCxJQUFsQixFQUF3QjtBQUN0QixnQkFBSUosU0FBUyxDQUFDTSxDQUFWLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLHFCQUFPLEtBQVA7QUFDRCxhQUhxQixDQUl4QjtBQUNBO0FBQ0E7QUFDQTs7QUFDQyxXQVZPLENBV1I7OztBQUNBLGNBQUlGLElBQUksQ0FBQ0csWUFBTCxDQUFrQnRCLEVBQUUsQ0FBQ3VCLFNBQXJCLENBQUosRUFBcUM7QUFDbkMsbUJBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRjtBQUNGOztBQUNELFdBQU8sSUFBUDtBQUNELEdBN0NFLENBOENQO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFRTs7QUE3RUssQ0FBVCIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG5jYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5QYWdlVmlldyxcclxuXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiBcclxuICAgIH0sXHJcblxyXG4gICBcclxuXHJcbiAgIG9uTG9hZCAoKSB7XHJcbiAgICBcclxuICAgfSxcclxuXHJcbiAgICBzdGFydCAoKSB7XHJcblxyXG4gICAgfSxcclxuICAgIF9oYXNOZXN0ZWRWaWV3R3JvdXAoZXZlbnQsIGNhcHR1cmVMaXN0ZW5lcnMpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJuZXdfaGFzTmVzdGVkVmlld0dyb3VwXCIpXHJcbiAgICAgICAgaWYgKGV2ZW50LmV2ZW50UGhhc2UgIT09IGNjLkV2ZW50LkNBUFRVUklOR19QSEFTRSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZXZlbnQudG91Y2gpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBtb3ZlRGVsdGEgPSBldmVudC50b3VjaC5nZXREZWx0YSgpO1xyXG4gICAgICAgIC8vIFRPRE/vvJogMi7lpoLmnpzmmK/kuIrnp7vnp7vliqjliJnnm7TmjqXlkJ7lmaxcclxuICAgICAgICBpZiAoY2FwdHVyZUxpc3RlbmVycykge1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXB0dXJlTGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjYXB0dXJlTGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgIC8vIOiHqui6q+iKgueCuVxyXG4gICAgICAgICAgICAgIGlmICh0aGlzLm5vZGUgPT09IGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChtb3ZlRGVsdGEueCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gIC8vIOWxj+iUveaOieatpOWIpOaWre+8jOS8muWvvOiHtHNjcm9sbHZpZXfmsqHmnInlm57lvLnmlYjmnpxcclxuICAgICAgICAgICAgICAvLyAgIGlmIChldmVudC50YXJnZXQuZ2V0Q29tcG9uZW50KGNjLlZpZXdHcm91cCkpIHtcclxuICAgICAgICAgICAgICAvLyAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAvLyAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8g5YW25LuW6IqC54K55L2G5pyJdmlld0dyb3VwXHJcbiAgICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0Q29tcG9uZW50KGNjLlZpZXdHcm91cCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0sXHJcbiAgLy8gICBfaGFzTmVzdGVkVmlld0dyb3VwOiBmdW5jdGlvbiAoZXZlbnQsIGNhcHR1cmVMaXN0ZW5lcnMpIHtcclxuICAvLyAgICAgaWYoZXZlbnQuZXZlbnRQaGFzZSAhPT0gY2MuRXZlbnQuQ0FQVFVSSU5HX1BIQVNFKSByZXR1cm47XHJcblxyXG4gIC8vICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaDtcclxuICAvLyAgICAgaWYoIXRvdWNoKSByZXR1cm47XHJcbiAgLy8gICAgIHZhciBkZWx0YU1vdmUgPSBjYy5wU3ViKHRvdWNoLmdldExvY2F0aW9uKCksIHRvdWNoLmdldFN0YXJ0TG9jYXRpb24oKSk7XHJcbiAgLy8gICAgIGlmIChkZWx0YU1vdmUueCA+IDcgfHwgZGVsdGFNb3ZlLnggPCAtNylcclxuICAvLyAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAvLyAgICAvLyBpZiAoZGVsdGFNb3ZlLnkgPiA3IHx8IGRlbHRhTW92ZS55IDwgLTcpXHJcbiAgLy8gICAgLy8gICAgIHJldHVybiBmYWxzZTtcclxuICAvLyAgICAgaWYoY2FwdHVyZUxpc3RlbmVycykge1xyXG4gIC8vICAgICAgICAgLy9jYXB0dXJlTGlzdGVuZXJzIGFyZSBhcnJhbmdlZCBmcm9tIGNoaWxkIHRvIHBhcmVudFxyXG4gIC8vICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNhcHR1cmVMaXN0ZW5lcnMubGVuZ3RoOyArK2kpe1xyXG4gIC8vICAgICAgICAgICAgIHZhciBpdGVtID0gY2FwdHVyZUxpc3RlbmVyc1tpXTtcclxuXHJcbiAgLy8gICAgICAgICAgICAgaWYodGhpcy5ub2RlID09PSBpdGVtKSB7XHJcbiAgLy8gICAgICAgICAgICAgICAgIGlmKGV2ZW50LnRhcmdldC5nZXRDb21wb25lbnQoY2MuVmlld0dyb3VwKSkge1xyXG4gIC8vICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAvLyAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICAgICAgICAgIH1cclxuXHJcbiAgLy8gICAgICAgICAgICAgaWYoaXRlbS5nZXRDb21wb25lbnQoY2MuVmlld0dyb3VwKSkge1xyXG4gIC8vICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAvLyAgICAgICAgICAgICB9XHJcbiAgLy8gICAgICAgICB9XHJcbiAgLy8gICAgIH1cclxuXHJcbiAgLy8gICAgIHJldHVybiBmYWxzZTtcclxuICAvLyB9LFxyXG5cclxuICAgIC8vIHVwZGF0ZSAoZHQpIHt9LFxyXG59KTtcclxuIl19