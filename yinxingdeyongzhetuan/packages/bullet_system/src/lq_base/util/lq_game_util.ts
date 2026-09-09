import SpriteFrame = cc.SpriteFrame;
import director = cc.director;
import tween = cc.tween;
import Texture2D = cc.Texture2D;
import Canvas = cc.Canvas;
import visibleRect = cc.visibleRect;
import find = cc.find;
import Node = cc.Node;

export class LQGameUtil {
    private static image_cache: { [key: string]: SpriteFrame } = {};

    public static get_image(url: string, callback: (success: boolean, sf: SpriteFrame | undefined) => void, cache = true) {
        if (!url || url === '') {
            callback(false, undefined);
            return;
        }
        if (this.image_cache[url]) {
            callback(true, this.image_cache[url]);
            return;
        }
        cc.loader.load(
            {url: url, type: 'png'},
            (err: string, texture: Texture2D | undefined) => {
                if (err) {
                    console.error('err:' + err);
                    callback(false, undefined);
                    return;
                }
                const frame = new SpriteFrame(texture);
                callback(true, frame);
                if (cache) {
                    this.image_cache[url] = frame;
                }
            });
    }

    public static canvas_policy(c: Canvas, width: number, height: number): boolean {
        // @ts-ignore
        const ratio = visibleRect.height / visibleRect.width;
        if (ratio > height / width) {
            c.fitHeight = false;
            c.fitWidth = true;
        } else {
            c.fitHeight = true;
            c.fitWidth = false;
        }
        return c.fitHeight;
    }

    public static recursion_node_property(node: Node, p: { key: string, value: number }) {
        if (node.parent) {
            // @ts-ignore
            p.value *= node.parent[p.key];
            this.recursion_node_property(node.parent, p);
        }
    }

    /**
     *
     * @param path
     * eg.'Canvas>node_main>btn_start'
     */
    public static find_node(path: string): Node | undefined {
        if (!path || path.length <= 0) {
            console.warn('路径不正确');
            return undefined;
        }
        const arr = path.split('/');
        const root = find(arr[0]);
        if (!root) {
            console.warn('没找到节点:' + arr[0]);
            return undefined;
        }
        let node = root;
        for (let i = 1; i < arr.length; i++) {
            const temp = node.getChildByName(arr[i]);
            if (!temp) {
                console.warn('没找到节点:' + arr[i]);
                return undefined;
            }
            node = temp;
        }
        return node;
    }

    public static wait(time: number) {
        return new Promise<void>((resolve) => {
            tween(director.getScene()).delay(time).call(() => {
                resolve();
            }).start();
        });
    }

    public static set_clip(clip: cc.AnimationClip, off: cc.Vec2, flip_x: boolean, flip_y: boolean) {
        let s = (arr: number[]) => {
            for (let i = 0; i < arr.length; i++) {
                if (i % 2 === 0) {
                    if (flip_x) {
                        arr[i] = -arr[i];
                    }
                    arr[i] += off.x;
                } else {
                    if (flip_y) {
                        arr[i] = -arr[i];
                    }
                    arr[i] += off.y;
                }
            }
        };
        const pos_arr = clip.curveData.props.position;
        for (let i = 0; i < pos_arr.length; i++) {
            const motionPath = pos_arr[i].motionPath;
            const value = pos_arr[i].value;
            if (motionPath) {
                for (let i = 0; i < motionPath.length; i++) {
                    s(motionPath[i]);
                }
            }
            s(value);
        }
    }
}