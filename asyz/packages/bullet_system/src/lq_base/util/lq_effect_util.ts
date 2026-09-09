export class LQEffectUtil {
    public static big_to_normal(node) {
        node.active = true;
        node.scale = 1.5;
        cc.tween(node).to(0.1, {scale: 1}, {easing: 'backIn'}).start();
    }

    public static small_to_normal(node) {
        node.active = true;
        node.scale = 0.3;
        cc.tween(node).to(0.3, {scale: 1}, {easing: 'backOut'}).start();
    }

    public static normal_to_small(node, cb: Function) {
        cc.tween(node).to(0.3, {scale: 0}, {easing: 'backIn'}).call(() => {
            cb();
        }).start();
    }

    public static progress_effect(progress_bar: cc.ProgressBar, target_val: number) {
        const v = target_val - progress_bar.progress;
        cc.Tween.stopAllByTag(5);
        if (v >= 0) {
            const time = v * 2;
            cc.tween(progress_bar)
                .tag(5)
                .to(time, {progress: target_val})
                .start();
        } else {
            const time1 = (1 - progress_bar.progress) * 2;
            const time2 = target_val * 2;
            cc.tween(progress_bar)
                .tag(5)
                .to(time1, {progress: 1})
                .call(() => {
                    progress_bar.progress = 0;
                })
                .to(time2, {progress: target_val})
                .start();
        }
    }

    public static shake_effect(node: cc.Node, times: number) {
        cc.tween(node)
            .to(0.02, {position: cc.v2(5, 7)})
            .to(0.02, {position: cc.v2(-6, 7)})
            .to(0.02, {position: cc.v2(-13, 3)})
            .to(0.02, {position: cc.v2(3, -6)})
            .to(0.02, {position: cc.v2(-5, 5)})
            .to(0.02, {position: cc.v2(2, -8)})
            .to(0.02, {position: cc.v2(-8, -10)})
            .to(0.02, {position: cc.v2(3, 10)})
            .to(0.02, {position: cc.v2(0, 0)})
            .union().repeat(times).start();
    }

    public static shake_effect2(node: cc.Node, delay: number, tag: number = 0) {
        node.angle = 0;
        cc.tween(node)
            .tag(tag)
            .delay(delay)
            .by(0.1, {angle: -5})
            .by(0.1, {angle: 10})
            .by(0.1, {angle: -10})
            .by(0.1, {angle: 10})
            .by(0.1, {angle: -10})
            .by(0.1, {angle: 10})
            .by(0.1, {angle: -10})
            .by(0.1, {angle: 5})
            .union().repeatForever().start();
    }

    public static typewriting(label: cc.Label, content: string, len: number = 1) {
        if (len === content.length) {
            return;
        }
        label.string = content.substring(0, len++);
        cc.tween(label).tag(1).delay(0.1).call(() => {
            LQEffectUtil.typewriting(label, content, len);
        }).start();
    }
}
