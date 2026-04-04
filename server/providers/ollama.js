let config = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'mistral',
  fastModel: process.env.OLLAMA_FAST_MODEL || 'mistral',
};

function getConfig() { return { ...config }; }

function setConfig(newConfig) {
  if (newConfig.baseUrl) config.baseUrl = newConfig.baseUrl;
  if (newConfig.model) config.model = newConfig.model;
  if (newConfig.fastModel) config.fastModel = newConfig.fastModel;
}

function getRawConfig() { return config; }

async function generate(systemPrompt, userPrompt, opts = {}) {
  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model || config.model,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.message.content;
}

async function generateFast(systemPrompt, userPrompt, opts = {}) {
  return generate(systemPrompt, userPrompt, { ...opts, model: config.fastModel });
}

async function test() {
  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      stream: false,
      messages: [{ role: 'user', content: 'Say "connected" and nothing else.' }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message.content;
}

module.exports = { generate, generateFast, test, getConfig, setConfig, getRawConfig };
