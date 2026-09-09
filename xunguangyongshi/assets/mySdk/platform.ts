
import { platformNum, serverDt } from "./severDt";

export  class Platform {

  
  public static isBrowser() {
    return cc.sys.isBrowser;
  }

  public static isAndroid() {
    return cc.sys.platform == cc.sys.ANDROID;
  }

  public static isQQ() {
    //return cc.cc.sys.platform == cc.sys.Platform.QQ_PLAY;
  }

  public static isWeChat() {
    return cc.sys.platform == cc.sys.WECHAT_GAME;
  }

  public static isOppo() {
    return cc.sys.platform == cc.sys.OPPO_GAME;
  }

  public static isVivo() {
    return cc.sys.platform == cc.sys.VIVO_GAME;
  }

  public static isByteDance() {
    return cc.sys.platform == cc.sys.BYTEDANCE_GAME;
  }

  public static isBaiDu() {
    return cc.sys.platform == cc.sys.BAIDU_GAME;
  }

  public static isIOS(){
    return cc.sys.platform==cc.sys.IPHONE;
  }
  public static isIpad(){
    //return cc.sys.platform==cc.sys.IPAD;
  }

 
  public static isTTDevtolls(){
    return (window as any).tt.getcc.systemInfoSync().appName=="devtools";
  }

  public static isKuaishou(){
    return serverDt.market==platformNum.Kuaishou;
  }

  public static isAlipay(){
    return cc.sys.platform==cc.sys.ALIPAY_GAME;
  }
}