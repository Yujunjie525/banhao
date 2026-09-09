export interface WarriorRunAssets {
    sprites: Record<string, cc.SpriteFrame>;
    animationFrames: Record<string, cc.SpriteFrame[]>;
}

type AssetsReadyCallback = (assets: WarriorRunAssets) => void;

export default class WarriorRunAssetLoader {
    private static _assets: WarriorRunAssets = null;
    private static _loading: boolean = false;
    private static _callbacks: AssetsReadyCallback[] = [];

    static preload(done?: AssetsReadyCallback): void {
        if (this._assets) {
            if (done) done(this._assets);
            return;
        }
        if (done) this._callbacks.push(done);
        if (this._loading) return;

        this._loading = true;
        const sprites: Record<string, cc.SpriteFrame> = {};
        const animationFrames: Record<string, cc.SpriteFrame[]> = {};
        const animationKeys = [
            'monster/1', 'monster/2', 'monster/3', 'monster/4', 'monster/boss',
            'role/1', 'role/2', 'role/3', 'role/4', 'role/5',
        ];
        const spritePaths = ['2main/xingxing1', '2main/xingxing2'];
        let pending = animationKeys.length + spritePaths.length + 1;
        const completeOne = () => {
            pending--;
            if (pending > 0) return;
            this._assets = { sprites, animationFrames };
            this._loading = false;
            const callbacks = this._callbacks.slice();
            this._callbacks.length = 0;
            callbacks.forEach((callback: AssetsReadyCallback) => callback(this._assets));
        };

        cc.loader.loadResDir('3game', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) cc.warn('[WarriorRun] 3game assets load failed', err);
            (frames || []).forEach((frame: cc.SpriteFrame) => sprites[frame.name] = frame);
            completeOne();
        });

        spritePaths.forEach((path: string) => {
            cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
                const key = path.substring(path.lastIndexOf('/') + 1);
                if (err) {
                    cc.warn('[WarriorRun] sprite asset load failed: ' + path, err);
                } else {
                    sprites[key] = frame;
                }
                completeOne();
            });
        });

        animationKeys.forEach((key: string) => {
            cc.loader.loadResDir('anim/' + key, cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
                if (err) {
                    cc.warn('[WarriorRun] animation assets load failed: ' + key, err);
                } else {
                    animationFrames[key] = (frames || []).slice().sort((a: cc.SpriteFrame, b: cc.SpriteFrame) => {
                        return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
                    });
                }
                completeOne();
            });
        });
    }
}
