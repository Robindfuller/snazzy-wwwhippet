const OpenAI = require('openai');

let client;
let config = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o',
  fastModel: 'gpt-4o-mini',
};

function getConfig() { return { ...config, apiKey: maskKey(config.apiKey) }; }

function setConfig(newConfig) {
  if (newConfig.apiKey !== undefined && !newConfig.apiKey.includes('...')) config.apiKey = newConfig.apiKey;
  if (newConfig.model) config.model = newConfig.model;
  if (newConfig.fastModel) config.fastModel = newConfig.fastModel;
  client = null;
}

function getRawConfig() { return config; }

function maskKey(key) {
  if (!key || key.length < 8) return key ? '****' : '';
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
}

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: config.apiKey });
  }
  return client;
}

async function generate(systemPrompt, userPrompt, { maxTokens = 4096 } = {}) {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: config.model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return response.choices[0].message.content;
}

async function generateFast(systemPrompt, userPrompt, opts = {}) {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: config.fastModel,
    max_tokens: opts.maxTokens || 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return response.choices[0].message.content;
}

async function test() {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: config.fastModel,
    max_tokens: 20,
    messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
  });
  return response.choices[0].message.content;
}

module.exports = { generate, generateFast, test, getConfig, setConfig, getRawConfig };
