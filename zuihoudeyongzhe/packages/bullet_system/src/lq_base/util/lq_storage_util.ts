export class LQStorageUtil {
    public static game_name;
    public static id;

    public static set_item(key: string, value: string) {
        if (this.id) {
            key = this.id + '-' + key;
        }
        if (this.game_name) {
            key = this.game_name + '-' + key;
        }
        cc.sys.localStorage.setItem(key, value);
    }

    public static get_item(key: string): string {
        if (this.id) {
            key = this.id + '-' + key;
        }
        if (this.game_name) {
            key = this.game_name + '-' + key;
        }
        return cc.sys.localStorage.getItem(key);
    }
}