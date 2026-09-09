import Node = cc.Node;
import Animation = cc.Animation;
import ParticleSystem = cc.ParticleSystem;
import instantiate = cc.instantiate;

export class LQPoolUtil {
    private static any_pool: { [key: string]: Node[] } = {};

    private static reset_ani(node: Node) {
        let ani = node.getComponent(Animation);
        if (ani) {
            let clip = ani.currentClip ? ani.currentClip : ani.defaultClip;
            if (!clip) {
                return;
            }
            if (ani.playOnLoad && clip && clip.wrapMode === cc.WrapMode.Normal) {
                ani.play(clip.name);
            }
        } else {
            let ani = node.getComponent(sp.Skeleton);
            if (ani && !ani.loop) {
                ani.setAnimation(0, ani.animation, false);
            }
        }
        for (let i = 0; i < node.childrenCount; i++) {
            const child = node.children[i];
            this.reset_ani(child);
        }
    }

    public static recursion_stop_particle(node: Node, obj: { has: boolean }) {
        const p = node.getComponent(ParticleSystem);
        if (p) {
            p.stopSystem();
            obj.has = true;
            p.node.opacity = 0;
        }
        for (let i = 0; i < node.childrenCount; i++) {
            const child = node.children[i];
            this.recursion_stop_particle(child, obj);
        }
    }

    public static recursion_reset_particle(node: Node) {
        if (!node.isValid) {
            return;
        }
        const p = node.getComponent(ParticleSystem);
        if (p) {
            p.resetSystem();
            p.node.opacity = 255;
        }
        for (let i = 0; i < node.childrenCount; i++) {
            const child = node.children[i];
            this.recursion_reset_particle(child);
        }
    }

    public static get_node_from_pool(node_parent: Node, prefab: Node) {
        let arr = this.any_pool[prefab.uuid];
        if (!arr) {
            this.any_pool[prefab.uuid] = [];
            arr = [];
        }
        let node = arr.pop();
        if (!node || !node.isValid) {
            node = instantiate(prefab);
            //@ts-ignore
            node.recovery_uuid = prefab.uuid;
            //@ts-ignore
            node.is_from_pool = false;
            node_parent.addChild(node);
        } else {
            node.active = true;
            //@ts-ignore
            node.is_from_pool = true;
            this.reset_ani(node);
        }
        return node;
    }

    private static check_pool_push(arr: Node[], node: Node) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === node) {
                //@ts-ignore
                console.warn(`池子不能重复添加节点`, node.name, node.recovery_uuid);
                return;
            }
        }
        node.active = false;
        arr.push(node);
    }

    public static push_node_to_pool(node: Node) {
        //@ts-ignore
        if (!node.recovery_uuid || !this.any_pool[node.recovery_uuid]) {
            if (node.isValid) {
                node.destroy();
            }
            return;
        }
        const obj: { has: boolean } = {has: false};
        this.recursion_stop_particle(node, obj);
        if (obj.has) {
            let old_opacity = node.opacity;
            node.opacity = 0;
            setTimeout(() => {
                this.recursion_reset_particle(node);
                node.opacity = old_opacity;
                //@ts-ignore
                this.check_pool_push(this.any_pool[node.recovery_uuid], node);
            }, 500);
        } else {
            //@ts-ignore
            this.check_pool_push(this.any_pool[node.recovery_uuid], node);
        }
    }
}