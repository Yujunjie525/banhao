# GameBackendSdk（分发说明）

可复用的 HTTP 封装源码位于：**`assets/GameBackendSdk/GameBackendApi.ts`**（Cocos 仅编译 `assets` 下脚本）。

发给别人联调时，请打包整个 **`assets/GameBackendSdk`** 目录（含 `.meta`）。

用法见 `GameBackendApi.ts` 文件头部注释；业务调用示例：

```ts
import { GameBackendApi } from '../GameBackendSdk/GameBackendApi';

const result = await GameBackendApi.getLogin({ appid: "app.yongshixunzhang3", username: this.username, password: this.password, type: 1 });
```
