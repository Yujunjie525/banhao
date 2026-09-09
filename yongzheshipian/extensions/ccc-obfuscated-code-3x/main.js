'use strict';

const fs = require('fs');
const path = require('path');
const { DEFAULT_OPTIONS, normalizeOptions } = require('./options.js');

const PACKAGE_NAME = 'ccc-obfuscated-code-3x';
const CONFIG_RELATIVE_PATH = path.join('local', 'ccc-obfuscated-code.json');
const PRESET_PATH = path.join(__dirname, 'preset.json');

let presets;

function projectPath() {
  return (Editor.Project && Editor.Project.path) || Editor.projectPath;
}

function configPath() {
  return path.join(projectPath(), CONFIG_RELATIVE_PATH);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getPresets() {
  if (!presets) presets = JSON.parse(fs.readFileSync(PRESET_PATH, 'utf8'));
  return presets;
}

function getConfig() {
  const file = configPath();
  if (fs.existsSync(file)) {
    try {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      return {
        auto: Boolean(saved.auto),
        preset: saved.preset || 'lower',
        options: normalizeOptions(saved.options),
      };
    } catch (error) {
      console.warn(`[${PACKAGE_NAME}] 配置文件无法读取，将使用默认配置`, error.message);
    }
  }
  return { auto: false, preset: 'lower', options: clone(DEFAULT_OPTIONS) };
}

function saveConfig(config) {
  const file = configPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = {
    auto: Boolean(config.auto),
    preset: config.preset || 'lower',
    options: normalizeOptions(config.options),
  };
  fs.writeFileSync(file, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`[${PACKAGE_NAME}] 配置已保存: ${file}`);
  return normalized;
}

module.exports = {
  load() {},
  unload() {},
  methods: {
    openPanel() {
      Editor.Panel.open(PACKAGE_NAME);
    },
    readConfig() {
      return getConfig();
    },
    saveConfig(config) {
      return saveConfig(config || {});
    },
    getPreset(name) {
      return normalizeOptions(getPresets()[name] || getPresets().off || {});
    },
    buildLog(level, message) {
      const output = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log;
      output(message);
    },
  },
};
