/**
 * Task
 */
export class Task<T extends Function> {
    protected _execute: T;

    public constructor(execute: T) {
        this._execute = execute;
    }

    public get execute(): T {
        return this._execute;
    }

}

/**
 * Callback Task
 */
export class CallbackTask extends Task<(callback: () => void) => void> {
    public constructor(execute: (callback: () => void) => void) {
        super(execute);
    }

}

/**
 * Task Pool
 */
export class TaskPool {
    public static readonly MAX_WAIT_MS = 10000;
    public static readonly MIN_WAIT_MS = 100;

    protected _taskQueue: Array<CallbackTask>;
    protected _delayms: number;
    protected _isStart: boolean;

    public constructor() {
        this._taskQueue = new Array<CallbackTask>();
        this._delayms = TaskPool.MIN_WAIT_MS;
        this._isStart = false;
    }

    public push(task: CallbackTask | ((callback: () => void) => void)) {
        if (!(task instanceof CallbackTask)) task = new CallbackTask(task);
        this._taskQueue.push(task);
        if (!this._isStart) this.run();
    }

    protected run() {
        this._isStart = true;
        cc.log(`Info: TaskPool is start.`);
        this.execute();
    }

    public clear() {
        this.stop();
        this._taskQueue = new Array<CallbackTask>();
    }

    public stop() {
        this._isStart = false;
        cc.log(`Info: TaskPool is stop.`);
    }

    protected execute() {
        if (!this._isStart) return;
        if (this._taskQueue.length <= 0) {
            cc.log(`Info: TaskPool is wait...(${this._delayms}ms)`);
            setTimeout(() => {
                this._delayms = Math.min(TaskPool.MAX_WAIT_MS, this._delayms * 2);
                this.execute();
            }, this._delayms);
            return;
        }
        this._delayms = TaskPool.MIN_WAIT_MS;
        let task = this._taskQueue.shift();
        task.execute(() => {
            this.execute();
        });
    }

}