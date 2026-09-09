import { EHandlerResult } from "./EHandlerResult";
import Handler from "./Handler";
import IHandler from "./IHandler";

export default abstract class Bridge implements IHandler {

    private _handler: Handler;

    public registerHandler(handler: Handler) {
        if (this._handler == null) {
            this._handler = handler;
        } else {
            handler.nextHandler = this._handler;
            this._handler = handler;
        }
    }

    public unregisterHandler(handler: Handler) {
        if (this._handler.uuid == handler.uuid) {
            this._handler = this._handler.nextHandler;
        } else {
            let preHandler = this._handler;
            let currentHandler = this._handler.nextHandler;
            while (currentHandler.uuid != handler.uuid) {
                preHandler = currentHandler;
                currentHandler = currentHandler.nextHandler;
            }
            if (currentHandler != null) {
                preHandler.nextHandler = currentHandler.nextHandler;
            }
        }
    }

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        let currentHandler = this._handler;
        while (currentHandler != null) {
            let isContinue: EHandlerResult = EHandlerResult.CONTINUE;
            if (currentHandler.owner != null && currentHandler.owner.isValid) isContinue = currentHandler.handleRequest(msg, callback);
            else this.unregisterHandler(currentHandler);
            currentHandler = currentHandler.nextHandler;
            if (isContinue == EHandlerResult.BREAK) break;
        }
        return EHandlerResult.CONTINUE;
    }

    public abstract sendMessage(msg: string, callback?: (...args: any[])=>void): void;

}