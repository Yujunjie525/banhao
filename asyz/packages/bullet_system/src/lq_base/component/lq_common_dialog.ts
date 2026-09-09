const {ccclass, property} = cc._decorator;

@ccclass
export class LQCommonDialog extends cc.Component {
    @property(cc.Node)
    private btn_cancel: cc.Node = undefined;
    @property(cc.Label)
    private text_content: cc.Label = undefined;
    private confirm_callback_func: Function;
    private cancel_callback_func: Function;

    protected onLoad() {
        this.node.width = cc.visibleRect.width;
        this.node.height = cc.visibleRect.height;
    }

    protected confirm_click() {
        this.node.active = false;
        if (this.confirm_callback_func) {
            this.confirm_callback_func();
        }
    }

    protected cancel_click() {
        this.node.active = false;
        if (this.cancel_callback_func) {
            this.cancel_callback_func();
        }
    }

    public init_data(show_cancel_btn: boolean, textContent: string, cb: Function, cb2: Function) {
        this.btn_cancel.active = show_cancel_btn;
        this.text_content.string = textContent;
        this.confirm_callback_func = cb;
        this.cancel_callback_func = cb2;
        this.node.x = cc.visibleRect.width / 2;
        this.node.y = cc.visibleRect.height / 2;
    }
}
