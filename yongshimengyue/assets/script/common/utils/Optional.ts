import { QuickTool } from "./UtilsToolkit";

/**
 * Optional
 * @date 2021/01/08
 * @author yk.luo@cn.lancetop
 * @version 1.1
 * @since 1.0
 * @alter 1.1 新增execute方法
 */
export default class Optional<T> {

    /**
     * 
     * @param arg 
     * @example
        ```js
            Optional.of(this.node).map(it=>it.getComponent(BaseComponent)).map(it=>it._baseObject as BaseObject).orElse(null);
        ```
     */
    public static of<T1> (arg: T1): Optional<T1> {
        return new Optional<T1>(arg);
    }

    private _arg: T;

    protected constructor(arg: T) {
        this._arg = arg;
    }

    public map<T2>(fun: (self: T)=>T2): Optional<T2> {
        if (this.empty()) return new Optional<T2>(null);
        return new Optional(fun(this._arg));
    }

    public get(): T {
        return this._arg;
    }

    public orElse(defaultVal: T): T {
        return this.empty() ? defaultVal : this._arg;
    }

    public empty(): boolean {
        return QuickTool.isNull(this._arg);
    }

    /**
     * execute fun
     * @return execute successfully if not null.
     * @since 1.1
     */
    public execute(fun: (self: T)=>any): any {
        if (this.empty()) return null;
        return Optional.of(QuickTool.safeCall(null, fun, this._arg)).orElse(true);
    }

    public call(fun: (self: T)=>any): any {
        return this.execute(fun);
    }

}