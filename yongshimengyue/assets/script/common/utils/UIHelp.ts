import UIMng from "../manager/UIMng";
import UIBase, { UIClass } from "../base/UIBase";
import { ViewZorder } from "../const/ViewZOrder";

/**确定框界面参数 */
export interface DialogParams {
    title: string,
    content: string,
    certainCb?: Function,
    cancelCb?: Function
}

export default class UIHelp {
    public static SetLabel(node: cc.Node, value: string | number) {
        if (typeof value === 'number') {
            value = value.toString();
        } else if (value == undefined) {
            value = "";
        }
        // 文本和富文本只能二选一
        if (node.getComponent(cc.RichText)) {
            let defaultColor = node.color.toHEX('#rrggbb');
            node.getComponent(cc.RichText).string = `<color=${defaultColor}>${value}</c>`;
        } else {
            node.getComponent(cc.Label).string = value;
        }
    }

    /**按钮灰化，只有注册click事件，才会真正被禁用 */
    public static SetBtnGrayState(node: cc.Node, isGray) {
        let button = node.getComponent(cc.Button);
        if (!button) {
            return;
        }
        button.interactable = !isGray;
        button.enableAutoGrayEffect = isGray;
    }

    public static IsBtnGray(node: cc.Node) {
        let button = node.getComponent(cc.Button);
        if (!button) {
            return false;
        }
        return !button.interactable;
    }

    public static ShowUI<T extends UIBase>(uiClass: UIClass<T>, vOrder: number = ViewZorder.UI, callback?: Function, parent?: cc.Node, ...args: any[]) {
        UIMng.getInstance().openUI(uiClass, vOrder, callback, null, parent, ...args);
    }

    public static CloseUI<T extends UIBase>(uiClass: UIClass<T>) {
        UIMng.getInstance().closeUI(uiClass);
    }

    public static IsShowingUI<T extends UIBase>(uiClass: UIClass<T>) {
        return UIMng.getInstance().isShowing(uiClass);
    }
}