import { EHandlerResult } from "./EHandlerResult";

export default interface IHandler {

    handleRequest(msg: string, callback?: (...args: any[])=>void): EHandlerResult;

}
