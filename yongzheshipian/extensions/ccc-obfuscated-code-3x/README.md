# Cocos Creator 3.x 代码混淆工具

这是 `ccc-obfuscated-code` 的 Creator 3.x 项目内版本，使用 `javascript-obfuscator@4.1.1`，支持构建产物中的可选链和空值合并语法。运行时使用目录内的 `obfuscator.bundle.js`，目标项目不需要安装 npm 依赖。

## 使用

1. 关闭并重新打开当前项目，让 Creator 重新扫描 `extensions/ccc-obfuscated-code-3x`。
2. 从顶部菜单 **扩展 -> 代码混淆工具 -> 打开配置面板** 打开面板。
3. 选择预设或调整参数，点击 **保存配置**。
4. 需要自动处理构建产物时勾选 **构建后自动混淆**，然后重新构建。

配置文件为项目根目录下的 `local/ccc-obfuscated-code.json`。扩展只修改构建目录中的 `assets/**/index.js` 和 `subpackages/**/index.js`，不会修改 `assets` 源码；`internal` 和 `resources` bundle 会跳过。

扩展会兼容旧配置中的布尔值：`debugProtectionInterval` 会转换为毫秒数（`true` 为 4000，`false` 为 0），`stringArrayEncoding` 会转换为数组（可选 `base64` 或 `rc4`）。

构建时的开始、完成和处理数量会同时写入 Builder 任务日志和 Creator 控制台。

如需重新生成内置混淆器（仅扩展开发者需要），在本目录执行：

```powershell
npm.cmd install --no-save --package-lock=false javascript-obfuscator@4.1.1 esbuild --ignore-scripts --no-audit --no-fund
npx.cmd esbuild node_modules/javascript-obfuscator/dist/index.js --bundle --platform=node --format=cjs --target=node12 --outfile=obfuscator.bundle.js --legal-comments=none
```

混淆器要求 Node.js `>=12.22.0`；Creator 3.x 的编辑器环境通常满足此要求。

自动混淆默认关闭。建议先用轻度预设完成一次目标平台运行测试，再逐步提高强度；`selfDefending`、`debugProtection` 等选项可能影响调试和运行时兼容性。
