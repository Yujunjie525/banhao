import Bridge from "./Bridge";

export default abstract class DEBridge extends Bridge {

    private _otherSide: Bridge;
    public set otherSide(bridge: Bridge) {
        this._otherSide = bridge;
    }

    public sendMessage(msg: string, callback?: (...args: any[]) => void): void {
        cc.log("[Info]: Bridge get message -> " + msg);
        if (this._otherSide == null) return;
        this._otherSide.handleRequest(msg, callback);
    }

}