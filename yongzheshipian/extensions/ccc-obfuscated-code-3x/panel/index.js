'use strict';

const fs = require('fs');
const path = require('path');

module.exports = Editor.Panel.define({
  template: fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'),
  style: fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8'),
  $: {
    form: '#config-form',
    preset: '#preset',
    auto: '#auto',
    status: '#status',
    save: '#save',
    loadPreset: '#load-preset',
  },

  ready() {
    this.$.save.addEventListener('click', () => this.saveConfig());
    this.$.loadPreset.addEventListener('click', () => this.loadPreset());
    this.$.preset.addEventListener('change', () => this.loadPreset());
    this.$.form.addEventListener('change', () => this.updateVisibility());
    this.readConfig();
  },

  methods: {
    async readConfig() {
      try {
        const config = await Editor.Message.request('ccc-obfuscated-code-3x', 'read-config');
        this.$.auto.checked = Boolean(config.auto);
        this.$.preset.value = config.preset || 'lower';
        this.applyOptions(config.options || {});
        this.updateVisibility();
        this.setStatus('已读取项目配置');
      } catch (error) {
        this.setStatus(`读取失败: ${error.message}`, true);
      }
    },

    async saveConfig() {
      this.$.save.disabled = true;
      try {
        await Editor.Message.request('ccc-obfuscated-code-3x', 'save-config', this.collectConfig());
        this.setStatus('配置已保存');
      } catch (error) {
        this.setStatus(`保存失败: ${error.message}`, true);
      } finally {
        this.$.save.disabled = false;
      }
    },

    async loadPreset() {
      try {
        const options = await Editor.Message.request('ccc-obfuscated-code-3x', 'get-preset', this.$.preset.value);
        this.applyOptions(options || {});
        this.updateVisibility();
        this.setStatus('预设已读取，点击保存后才会写入项目');
      } catch (error) {
        this.setStatus(`预设读取失败: ${error.message}`, true);
      }
    },

    collectConfig() {
      const options = {};
      for (const input of this.$.form.querySelectorAll('[data-option]')) {
        const key = input.dataset.option;
        let value;
        if (input.type === 'checkbox') value = input.checked;
        else if (input.type === 'number') value = Number(input.value);
        else if (input.dataset.array === 'true') value = input.value.split(',').map((item) => item.trim()).filter(Boolean);
        else if (input.dataset.boolean === 'true') value = input.value === 'true';
        else value = input.value;
        options[key] = value;
      }
      return { auto: this.$.auto.checked, preset: this.$.preset.value, options };
    },

    applyOptions(options) {
      for (const input of this.$.form.querySelectorAll('[data-option]')) {
        const value = options[input.dataset.option];
        if (value === undefined) continue;
        if (input.type === 'checkbox') input.checked = Boolean(value);
        else if (input.dataset.array === 'true') input.value = Array.isArray(value) ? value.join(',') : value;
        else input.value = value;
      }
    },

    updateVisibility() {
      for (const group of this.$.form.querySelectorAll('[data-show-when]')) {
        const dependency = this.$.form.querySelector(`[data-option="${group.dataset.showWhen}"]`);
        group.hidden = !dependency || !dependency.checked;
      }
    },

    setStatus(message, isError) {
      this.$.status.textContent = message;
      this.$.status.classList.toggle('error', Boolean(isError));
    },
  },
});
