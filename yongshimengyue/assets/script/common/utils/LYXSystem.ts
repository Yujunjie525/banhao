class LYXSystem {

    /*====================================================================================================*/
    /**
     * 获取硬件分辨率
     */
    /*====================================================================================================*/
    getFrameSizeWidthRatio() {
        let sizeframe = cc.view.getFrameSize();
        let ratio = sizeframe.height / sizeframe.width;
        return ratio;
    }


    fixDesignResolutionSize(canvas: cc.Canvas) {
        /*====================================================================================================*/
        /**
         * 如果是屏幕是横屏幕则使用cavas720*1334 高适配 ratio < 1
         * 如果是屏幕是竖屏，分三种屏幕比例 1< ratio < 1.5; 1.5 < ratio < 1.86 (普通手机) radio > 1.86(全面屏幕) 宽适配 
         */
        /*====================================================================================================*/
        /*let ratio = this.getFrameSizeWidthRatio();

        if (ratio <= 1) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else if (1 < ratio && ratio < 1.5) {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
            canvas.designResolution = cc.size(720, 1334)
        } else if (1.5 <= ratio && ratio <= 1.86) {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        } else if (ratio > 1.86) {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }*/

        canvas.designResolution = cc.size(720, 1334);
        canvas.fitHeight = true;
        canvas.fitWidth = false;
    }

    isIphoneXSceen() {
        return this.getFrameSizeWidthRatio() > 1.86;
    }

    isIpadSceen() {
        return 1 < this.getFrameSizeWidthRatio() && this.getFrameSizeWidthRatio() < 1.5;
    }
}

export let lyx_system = new LYXSystem();
