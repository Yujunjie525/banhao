const {ccclass, property} = cc._decorator;
import mGameData from '../Data/GameData';
import TipsManager from './TipsManager';

@ccclass
export default class ShopManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null; 
    
    @property(cc.Label)
    zs_num: cc.Label = null; 

    @property(cc.Node)
    btn_1: cc.Node = null; // 开局冲刺buff购买按钮

    @property(cc.Node)
    btn_2: cc.Node = null; // 开局保护盾购买按钮

    @property(cc.Node)
    btn_3: cc.Node = null; // 十点体力购买按钮

    // 按钮正常状态图片
    @property(cc.SpriteFrame)
    btn1Normal: cc.SpriteFrame = null;
    // 按钮禁用状态图片
    @property(cc.SpriteFrame)
    btn1Disabled: cc.SpriteFrame = null;
    
    @property(cc.Label)
    num_1: cc.Label = null; // 开局冲刺buff库存显示

    @property(cc.Label)
    num_2: cc.Label = null; // 开局保护盾库存显示

    @property(cc.Label)
    num_3: cc.Label = null; // 体力数量显示 (xx/30)
    
    private itemPrice: number = 200; // 所有道具价格统一为200钻石
    
    onLoad () {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        this.btn_1.on(cc.Node.EventType.TOUCH_END, this.buyShop1, this);
        this.btn_2.on(cc.Node.EventType.TOUCH_END, this.buyShop2, this);
        this.btn_3.on(cc.Node.EventType.TOUCH_END, this.buyShop3, this);
    }
    
    onEnable() {
        // 当面板显示时更新UI
        this.updateUI();
    }

    onBackClick() {
        this.node.active = false;
        // 发送钻石数量更新事件
        cc.director.emit('goldUpdated');
    }
    
    /**
     * 更新商店UI
     */
    updateUI() {
        // 更新钻石数量
        if (this.zs_num) {
            this.zs_num.string = mGameData.currentGold.toString();
        }
        
        // 更新道具1库存
        if (this.num_1) {
            const item1Stock = mGameData.getItemStock(1);
            this.num_1.string = item1Stock.toString();
            // 设置颜色：数量大于0显示绿色#008923，0的时候显示红色#be2b1a
            this.num_1.node.color = item1Stock > 0 ? cc.color(0, 137, 35) : cc.color(190, 43, 26);
        }
        
        // 更新道具2库存
        if (this.num_2) {
            const item2Stock = mGameData.getItemStock(2);
            this.num_2.string = item2Stock.toString();
            // 设置颜色：数量大于0显示绿色#008923，0的时候显示红色#be2b1a
            this.num_2.node.color = item2Stock > 0 ? cc.color(0, 137, 35) : cc.color(190, 43, 26);
        }
        
        // 更新体力显示
        if (this.num_3) {
            this.num_3.string = `${mGameData.currentStamina}/${mGameData.maxStamina}`;
            this.num_3.node.color = mGameData.currentStamina >= mGameData.maxStamina ? cc.color(0, 137, 35) : cc.color(190, 43, 26);
        }
        
        // 更新按钮状态
        this.updateBtnStates();
    }
    
    /**
     * 更新按钮状态（是否可用）
     */
    updateBtnStates() {
        // 按钮1：开局冲刺buff
        const canBuyItem1 = mGameData.currentGold >= this.itemPrice;
        this.setBtnState(this.btn_1, canBuyItem1);
        
        // 按钮2：开局保护盾
        const canBuyItem2 = mGameData.currentGold >= this.itemPrice;
        this.setBtnState(this.btn_2, canBuyItem2);
        
        // 按钮3：十点体力
        const canBuyItem3 = mGameData.currentGold >= this.itemPrice && mGameData.currentStamina < mGameData.maxStamina;
        this.setBtnState(this.btn_3, canBuyItem3);
    }
    
    /**
     * 设置按钮状态
     */
    setBtnState(btn: cc.Node, enabled: boolean) {
        if (btn) {
            // 处理Button组件（如果存在）
            const buttonComponent = btn.getComponent(cc.Button);
            if (buttonComponent) {
                buttonComponent.interactable = enabled;
            }
            
            // 处理Sprite组件（图片按钮）
            const spriteComponent = btn.getComponent(cc.Sprite);
            if (spriteComponent) {
                // 根据按钮名称选择对应的图片
                let targetSpriteFrame: cc.SpriteFrame = null;
                targetSpriteFrame = enabled ? this.btn1Normal : this.btn1Disabled;
                // 如果找到对应的图片，则设置
                if (targetSpriteFrame) {
                    spriteComponent.spriteFrame = targetSpriteFrame;
                }
            }
            
            // 为图片按钮设置触摸可用性标记
            btn['_isEnabled'] = enabled;
        }
    }

    /**
     * 购买开局冲刺buff
     */
    async buyShop1() {
        // 检查按钮是否可用
        // if (this.btn_1 && this.btn_1['_isEnabled'] === false) {
        //     return;
        // }
        
        if (mGameData.currentGold < this.itemPrice) {
            TipsManager.show('钻石不足。')
            return;
        }
        

        // 购买道具1
        try {
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            const result = await this.postBuyGoods("app.shenyuanlieshou", savedUsername, 2002);
            console.log("postBuyGoods:", result);
            
            if (result.code === 0 && result.data) {
                // // 扣除钻石
                mGameData.currentGold -= this.itemPrice;
                
                // 增加道具1库存
                mGameData.addItemStock(1, 1);
                
                // 更新UI
                this.updateUI();
                
                // 保存数据
                mGameData.SaveGoldData();
                mGameData.SaveItemStockData();
                
                // 发送钻石数量更新事件
                cc.director.emit('goldUpdated');
                
                TipsManager.show('购买开局冲刺成功。')
            } else {
           
            }
        } catch (error) {
            console.error("购买道具1失败:", error);
        }
    }

    /**
     * 购买开局保护盾
     */
    async buyShop2() {
        // 检查按钮是否可用
        // if (this.btn_2 && this.btn_2['_isEnabled'] === false) {
        //     return;
        // }
        
        if (mGameData.currentGold < this.itemPrice) {
            TipsManager.show('钻石不足。')
            return;
        }
    

        // 购买道具2
        try {
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            const result = await this.postBuyGoods("app.shenyuanlieshou", savedUsername, 1001);
            console.log("postBuyGoods:", result);
            
            if (result.code === 0 && result.data) {
                // 扣除钻石
                mGameData.currentGold -= this.itemPrice;
                
                // 增加道具2库存
                mGameData.addItemStock(2, 1);
                
                // 更新UI
                this.updateUI();
                
                // 保存数据
                mGameData.SaveGoldData();
                mGameData.SaveItemStockData();
                
                // 发送钻石数量更新事件
                cc.director.emit('goldUpdated');
                
                TipsManager.show('购买保命气泡成功。')
            } else {
           
            }
        } catch (error) {
            console.error("购买道具2失败:", error);
        }
    }

    /**
     * 购买十点体力
     */
    async buyShop3() {
        // 检查按钮是否可用
        // if (this.btn_3 && this.btn_3['_isEnabled'] === false) {
        //     return;
        // }
        
        if (mGameData.currentGold < this.itemPrice) {
            TipsManager.show('钻石不足。')
            return;
        }
        
        if (mGameData.currentStamina >= mGameData.maxStamina) {
            TipsManager.show('体力已满。')
            return;
        }
        
    
        // 购买道具3
        try {
            const savedUsername = cc.sys.localStorage.getItem('SLS_USERNAME');
            const result = await this.postBuyGoods("app.shenyuanlieshou", savedUsername, 3003);
            console.log("postBuyGoods:", result);
            
            if (result.code === 0 && result.data) {
                // 扣除钻石
                mGameData.currentGold -= this.itemPrice;
                
                // 增加体力，不超过最大值
                const oldStamina = mGameData.currentStamina;
                mGameData.currentStamina = Math.min(mGameData.maxStamina, mGameData.currentStamina + 10);
                const addedStamina = mGameData.currentStamina - oldStamina;
                
                // 更新UI
                this.updateUI();
                
                // 保存数据
                mGameData.SaveGoldData();
                mGameData.SaveStaminaData();
                
                // 发送钻石数量更新事件
                cc.director.emit('goldUpdated');
                
                TipsManager.show(`购买体力成功，增加了${addedStamina}点体力。`)
            } else {
           
            }
        } catch (error) {
            console.error("购买道具3失败:", error);
        }
    }


    //购买请求
    async postBuyGoods(appid: string, username: string, goods_id: number): Promise<any> {
        const url = "https://pay.szvi-bo.com/v1/testapp/BuyGoods";
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            
            xhr.send(JSON.stringify({ appid, username, goods_id }));
        });
    }
}