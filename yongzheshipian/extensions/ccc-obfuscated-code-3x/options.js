'use strict';

const DEFAULT_OPTIONS = {
  compact: true,
  controlFlowFlattening: false,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: false,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  domainLock: [],
  identifierNamesGenerator: 'hexadecimal',
  identifiersDictionary: [],
  identifiersPrefix: '',
  renameGlobals: false,
  reservedNames: [],
  reservedStrings: [],
  seed: 0,
  selfDefending: false,
  splitStrings: false,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: [],
  stringArrayThreshold: 0.75,
  shuffleStringArray: true,
  rotateStringArray: true,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeDebugProtectionInterval(value) {
  if (value === true) return 4000;
  if (value === false || value === null || value === undefined || value === '') return 0;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function normalizeStringArrayEncoding(value) {
  const allowed = new Set(['none', 'base64', 'rc4']);
  if (value === true) return ['base64'];
  if (value === false || value === null || value === undefined || value === '') return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map(String).filter((item) => allowed.has(item)))];
}

function normalizeOptions(options) {
  const normalized = Object.assign(clone(DEFAULT_OPTIONS), options || {});
  normalized.debugProtectionInterval = normalizeDebugProtectionInterval(normalized.debugProtectionInterval);
  normalized.stringArrayEncoding = normalizeStringArrayEncoding(normalized.stringArrayEncoding);
  return normalized;
}

module.exports = { DEFAULT_OPTIONS, normalizeOptions };
