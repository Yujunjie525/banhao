'use strict';

module.exports = {
  configs: {
    '*': {
      hooks: './hooks.js',
      options: {
        auto: {
          label: '构建后自动混淆',
          description: '构建完成后混淆 Web/小游戏构建产物中的脚本。详细参数在扩展面板中配置。',
          default: false,
          render: { ui: 'ui-checkbox' },
        },
      },
    },
  },
};
