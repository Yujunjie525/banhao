export class LQMessageUtil {
    private static node_list: Object[] = [];

    public static remove(scriptNode) {
        for (let i = 0; i < this.node_list.length; i++) {
            if (this.node_list[i] === scriptNode) {
                this.node_list.splice(i, 1);
                break;
            }
        }
    }

    public static register(scriptNode) {
        this.node_list.push(scriptNode);
    }

    public static send_message(func, ...args) {
        for (const node of this.node_list) {
            if (node[func]) {
                node[func](...args);
            }
        }
    }
}