const Anthropic = require('@anthropic-ai/sdk');

let client;
let config = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-20250514',
  fastModel: 'claude-haiku-4-5-20251001',
};

function getConfig() { return { ...config, apiKey: maskKey(config.apiKey) }; }

function setConfig(newConfig) {
  if (newConfig.apiKey !== undefined && !newConfig.apiKey.includes('...')) config.apiKey = newConfig.apiKey;
  if (newConfig.model) config.model = newConfig.model;
  if (newConfig.fastModel) config.fastModel = newConfig.fastModel;
  client = null; // Force re-create client with new key
}

function getRawConfig() { return config; }

function maskKey(key) {
  if (!key || key.length < 8) return key ? '****' : '';
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
}

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: config.apiKey });
  }
  return client;
}

async function generate(systemPrompt, userPrompt, { maxTokens = 4096 } = {}) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return response.content[0].text;
}

async function generateFast(systemPrompt, userPrompt, opts = {}) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: config.fastModel,
    max_tokens: opts.maxTokens || 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return response.content[0].text;
}

async function test() {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: config.fastModel,
    max_tokens: 20,
    messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
  });
  return response.content[0].text;
}

module.exports = { generate, generateFast, test, getConfig, setConfig, getRawConfig };
