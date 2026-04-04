const claude = require('./providers/claude');
const openai = require('./providers/openai');
const ollama = require('./providers/ollama');

const providers = { claude, openai, ollama };

let currentProvider = process.env.DEFAULT_PROVIDER || 'claude';

function getProvider() {
  return currentProvider;
}

function setProvider(name) {
  if (!providers[name]) {
    throw new Error(`Unknown provider: ${name}. Available: ${Object.keys(providers).join(', ')}`);
  }
  currentProvider = name;
}

function getAvailableProviders() {
  return Object.keys(providers);
}

async function generate(systemPrompt, userPrompt, opts = {}) {
  return providers[currentProvider].generate(systemPrompt, userPrompt, opts);
}

async function generateFast(systemPrompt, userPrompt, opts = {}) {
  return providers[currentProvider].generateFast(systemPrompt, userPrompt, opts);
}

function getSettings() {
  return {
    provider: currentProvider,
    claude: providers.claude.getConfig(),
    openai: providers.openai.getConfig(),
    ollama: providers.ollama.getConfig(),
  };
}

function getRawSettings() {
  return {
    provider: currentProvider,
    claude: providers.claude.getRawConfig(),
    openai: providers.openai.getRawConfig(),
    ollama: providers.ollama.getRawConfig(),
  };
}

function applySettings(settings) {
  if (settings.claude) providers.claude.setConfig(settings.claude);
  if (settings.openai) providers.openai.setConfig(settings.openai);
  if (settings.ollama) providers.ollama.setConfig(settings.ollama);
  if (settings.provider) setProvider(settings.provider);
}

async function testProvider(name) {
  if (!providers[name]) {
    throw new Error(`Unknown provider: ${name}`);
  }
  return providers[name].test();
}

module.exports = {
  getProvider, setProvider, getAvailableProviders,
  generate, generateFast,
  getSettings, getRawSettings, applySettings, testProvider,
};
