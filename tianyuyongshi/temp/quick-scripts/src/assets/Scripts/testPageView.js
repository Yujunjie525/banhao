"use strict";
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