'use strict';

const fs = require('fs');
const path = require('path');
// Keep the obfuscator self-contained. Creator 3.8.x loads builder plugins as
// CommonJS and cannot parse the ESM entry point pulled in by class-validator.
const JavaScriptObfuscator = require('./obfuscator.bundle.js');
const { normalizeOptions } = require('./options.js');

const PACKAGE_NAME = 'ccc-obfuscated-code-3x';
const CONFIG_RELATIVE_PATH = path.join('local', 'ccc-obfuscated-code.json');

function report(message, level = 'log') {
  const output = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log;
  output(message);
  try {
    const pending = Editor.Message.send(PACKAGE_NAME, 'build-log', level, message);
    if (pending && typeof pending.catch === 'function') pending.catch(() => {});
  } catch (error) {
    console.warn(`[${PACKAGE_NAME}] 无法转发构建日志: ${error.message}`);
  }
}

function readConfig() {
  const projectPath = Editor.Project && Editor.Project.path;
  if (!projectPath) return null;
  const file = path.join(projectPath, CONFIG_RELATIVE_PATH);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`[${PACKAGE_NAME}] 配置读取失败: ${error.message}`);
    return null;
  }
}

function obfuscateFile(filePath, options) {
  const source = fs.readFileSync(filePath, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(source, options || {});
  fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
}

function isJavaScriptFile(filePath) {
  return fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.js';
}

function obfuscateBundleScripts(dirPath, options, changedFiles, failedFiles) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'internal' || entry.name === 'resources') continue;
      obfuscateBundleScripts(entryPath, options, changedFiles, failedFiles);
    } else if (entry.isFile() && entry.name === 'index.js' && isJavaScriptFile(entryPath)) {
      try {
        obfuscateFile(entryPath, options);
        changedFiles.push(entryPath);
      } catch (error) {
        failedFiles.push(entryPath);
        report(`[${PACKAGE_NAME}] 跳过无法解析的脚本: ${entryPath} (${error.message})`, 'warn');
      }
    }
  }
}

function enabledOptionNames(options) {
  return Object.entries(options || {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}

exports.throwError = true;

exports.load = function() {};

exports.onAfterBuild = async function(options, result) {
  const projectConfig = readConfig();
  const packageOptions = options.packages && options.packages[PACKAGE_NAME];
  const enabled = packageOptions && packageOptions.auto || projectConfig && projectConfig.auto;
  if (!enabled) {
    report(`[${PACKAGE_NAME}] 自动混淆未启用`);
    return;
  }

  const obfuscationOptions = normalizeOptions(projectConfig && projectConfig.options);
  const preset = projectConfig && projectConfig.preset || '未指定';
  const enabledOptions = enabledOptionNames(obfuscationOptions);
  report(`[${PACKAGE_NAME}] 开始混淆，预设: ${preset}，已开启: ${enabledOptions.join(', ') || '仅基础参数'}`);
  const roots = [result && result.paths && result.paths.assets, result && result.paths && result.paths.subpackages];
  const changedFiles = [];
  const failedFiles = [];
  for (const root of roots) {
    if (root) obfuscateBundleScripts(root, obfuscationOptions, changedFiles, failedFiles);
  }
  report(`[${PACKAGE_NAME}] 已混淆 ${changedFiles.length} 个脚本`);
  if (failedFiles.length) {
    report(`[${PACKAGE_NAME}] 有 ${failedFiles.length} 个脚本未混淆，请根据上面的文件路径处理语法兼容性`, 'warn');
  }
};

exports.unload = function() {};
