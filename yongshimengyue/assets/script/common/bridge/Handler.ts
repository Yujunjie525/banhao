import { UUIDUtils } from "../utils/UtilsToolkit";
import { EHandlerResult } from "./EHandlerResult";
import IHandler from "./IHandler";

export default abstract class Handler implements IHandler {

    private _uuid: string;
    public get uuid(): string {
        return this._uuid;
    }

    private _owner: cc.Node;
    public get owner(): cc.Node {
        return this._owner;
    }

    private _nextHandler: Handler;
    public set nextHandler(handler: Handler) {
        this._nextHandler = handler;
    }
    public get nextHandler(): Handler {
        return this._nextHandler;
    }

    public constructor (node: cc.Node) {
        this._owner = node;
        this._uuid = this._owner.uuid + "-" + UUIDUtils.randomUUID();
    }

    abstract handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult;

}