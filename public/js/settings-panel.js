// Settings panel — opens as a desktop window
const SettingsPanel = {
  open() {
    const html = `
      <style>
        .settings-body { padding: 6px; font-family: 'MS Sans Serif', Tahoma, sans-serif; font-size: 11px; }
        .settings-body .tabs { display: flex; gap: 0; margin-bottom: -1px; position: relative; z-index: 1; }
        .settings-body .tab {
          padding: 2px 10px; background: #c0c0c0; border: 2px outset #c0c0c0;
          border-bottom: none; cursor: pointer; font-family: inherit; font-size: 11px;
        }
        .settings-body .tab.active { border-bottom: 2px solid #c0c0c0; font-weight: bold; }
        .settings-body .tab:not(.active) { background: #a0a0a0; margin-top: 2px; }
        .settings-body .tab-content { border: 2px inset #c0c0c0; padding: 8px; background: #c0c0c0; }
        .settings-body .tab-pane { display: none; }
        .settings-body .tab-pane.active { display: block; }
        .settings-body fieldset { border: 2px groove #c0c0c0; padding: 4px 8px; margin-bottom: 6px; }
        .settings-body legend { font-weight: bold; padding: 0 4px; font-size: 11px; }
        .settings-body label { display: block; margin-bottom: 2px; font-size: 11px; }
        .settings-body input[type="text"], .settings-body input[type="password"], .settings-body input[type="url"] {
          width: 100%; border: 2px inset #c0c0c0; background: #fff;
          padding: 1px 3px; font-family: inherit; font-size: 11px; margin-bottom: 4px;
        }
        .settings-body .btn {
          background: #c0c0c0; border: 2px outset #c0c0c0; padding: 2px 12px;
          font-family: inherit; font-size: 11px; cursor: pointer;
        }
        .settings-body .btn:active { border-style: inset; }
        .settings-body .btn-primary { font-weight: bold; }
        .settings-body .button-row { display: flex; justify-content: flex-end; gap: 4px; margin-top: 6px; padding-top: 4px; border-top: 1px solid #808080; }
        .settings-body .help-text { color: #666; font-size: 9px; margin-top: -2px; margin-bottom: 4px; }
        .settings-body .model-row { display: flex; gap: 6px; align-items: center; margin-bottom: 2px; }
        .settings-body .model-row label { display: inline; margin: 0; min-width: 70px; }
        .settings-body .model-row input { flex: 1; margin: 0; }
        .settings-body .status-indicator {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          border: 1px solid #808080; margin-right: 3px; vertical-align: middle;
        }
        .settings-body .status-ok { background: #00cc00; }
        .settings-body .status-error { background: #cc0000; }
        .settings-body .status-unknown { background: #cccc00; }
        .settings-body .provider-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; padding: 2px; }
        .settings-body .test-result {
          border: 2px inset #c0c0c0; background: #fff; padding: 2px 4px;
          font-family: 'Courier New', monospace; font-size: 9px;
          max-height: 32px; overflow-y: auto; margin-top: 4px; white-space: pre-wrap;
        }
      </style>
      <div class="settings-body">
        <div class="tabs" id="settingsTabs">
          <button class="tab active" data-tab="providers">Providers</button>
          <button class="tab" data-tab="claude">Claude</button>
          <button class="tab" data-tab="openai">OpenAI</button>
          <button class="tab" data-tab="ollama">Ollama</button>
        </div>

        <div class="tab-content">
          <div class="tab-pane active" id="stab-providers">
            <fieldset>
              <legend>Provider Status</legend>
              <div class="provider-row" id="sstatus-claude">
                <span class="status-indicator status-unknown" id="sdot-claude"></span>
                <b>Claude</b> — <span id="sstatus-text-claude">Not tested</span>
              </div>
              <div class="provider-row" id="sstatus-openai">
                <span class="status-indicator status-unknown" id="sdot-openai"></span>
                <b>OpenAI</b> — <span id="sstatus-text-openai">Not tested</span>
              </div>
              <div class="provider-row" id="sstatus-ollama">
                <span class="status-indicator status-unknown" id="sdot-ollama"></span>
                <b>Ollama</b> — <span id="sstatus-text-ollama">Not tested</span>
              </div>
              <div style="margin-top:8px;">
                <button class="btn" id="sTestAll">Test All</button>
              </div>
            </fieldset>
          </div>

          <div class="tab-pane" id="stab-claude">
            <fieldset>
              <legend>API Key</legend>
              <label>Anthropic API Key:</label>
              <input type="password" id="sClaudeKey" placeholder="sk-ant-...">
              <p class="help-text">Get your key from <b>console.anthropic.com</b></p>
            </fieldset>
            <fieldset>
              <legend>Models</legend>
              <div class="model-row">
                <label>Full model:</label>
                <input type="text" id="sClaudeModel">
              </div>
              <div class="model-row">
                <label>Fast model:</label>
                <input type="text" id="sClaudeFastModel">
              </div>
              <p class="help-text">Full model generates pages. Fast model generates search results.</p>
            </fieldset>
            <button class="btn" id="sTestClaude">Test Connection</button>
            <div class="test-result" id="stest-result-claude"></div>
          </div>

          <div class="tab-pane" id="stab-openai">
            <fieldset>
              <legend>API Key</legend>
              <label>OpenAI API Key:</label>
              <input type="password" id="sOpenaiKey" placeholder="sk-...">
              <p class="help-text">Get your key from <b>platform.openai.com</b></p>
            </fieldset>
            <fieldset>
              <legend>Models</legend>
              <div class="model-row">
                <label>Full model:</label>
                <input type="text" id="sOpenaiModel">
              </div>
              <div class="model-row">
                <label>Fast model:</label>
                <input type="text" id="sOpenaiFastModel">
              </div>
            </fieldset>
            <button class="btn" id="sTestOpenai">Test Connection</button>
            <div class="test-result" id="stest-result-openai"></div>
          </div>

          <div class="tab-pane" id="stab-ollama">
            <fieldset>
              <legend>Connection</legend>
              <label>Base URL:</label>
              <input type="url" id="sOllamaUrl">
              <p class="help-text">Ollama must be running locally. Install from <b>ollama.com</b></p>
            </fieldset>
            <fieldset>
              <legend>Model</legend>
              <div class="model-row">
                <label>Model:</label>
                <input type="text" id="sOllamaModel">
              </div>
              <p class="help-text">Make sure the model is pulled: <b>ollama pull llama3.1</b></p>
            </fieldset>
            <button class="btn" id="sTestOllama">Test Connection</button>
            <div class="test-result" id="stest-result-ollama"></div>
          </div>
        </div>

        <div class="button-row">
          <button class="btn btn-primary" id="sSave">Save</button>
        </div>
      </div>
    `;

    const winState = WindowManager.createGenericWindow('AI Settings', html, {
      icon: '&#9881;',
      width: '380px',
      height: '320px',
    });

    const root = winState.el;

    // Tab switching
    root.querySelectorAll('#settingsTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        root.querySelectorAll('#settingsTabs .tab').forEach(t => t.classList.remove('active'));
        root.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        root.querySelector('#stab-' + tab.dataset.tab).classList.add('active');
      });
    });

    // Load settings
    this.loadInto(root);

    // Wire buttons
    root.querySelector('#sTestAll').addEventListener('click', () => {
      this.testProvider(root, 'claude');
      this.testProvider(root, 'openai');
      this.testProvider(root, 'ollama');
    });
    root.querySelector('#sTestClaude').addEventListener('click', () => this.testProvider(root, 'claude'));
    root.querySelector('#sTestOpenai').addEventListener('click', () => this.testProvider(root, 'openai'));
    root.querySelector('#sTestOllama').addEventListener('click', () => this.testProvider(root, 'ollama'));
    root.querySelector('#sSave').addEventListener('click', () => this.save(root));
  },

  async loadInto(root) {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (data.claude) {
        if (data.claude.apiKey) root.querySelector('#sClaudeKey').value = data.claude.apiKey;
        if (data.claude.model) root.querySelector('#sClaudeModel').value = data.claude.model;
        if (data.claude.fastModel) root.querySelector('#sClaudeFastModel').value = data.claude.fastModel;
      }
      if (data.openai) {
        if (data.openai.apiKey) root.querySelector('#sOpenaiKey').value = data.openai.apiKey;
        if (data.openai.model) root.querySelector('#sOpenaiModel').value = data.openai.model;
        if (data.openai.fastModel) root.querySelector('#sOpenaiFastModel').value = data.openai.fastModel;
      }
      if (data.ollama) {
        if (data.ollama.baseUrl) root.querySelector('#sOllamaUrl').value = data.ollama.baseUrl;
        if (data.ollama.model) root.querySelector('#sOllamaModel').value = data.ollama.model;
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  },

  getSettingsFrom(root) {
    return {
      claude: {
        apiKey: root.querySelector('#sClaudeKey').value,
        model: root.querySelector('#sClaudeModel').value,
        fastModel: root.querySelector('#sClaudeFastModel').value,
      },
      openai: {
        apiKey: root.querySelector('#sOpenaiKey').value,
        model: root.querySelector('#sOpenaiModel').value,
        fastModel: root.querySelector('#sOpenaiFastModel').value,
      },
      ollama: {
        baseUrl: root.querySelector('#sOllamaUrl').value,
        model: root.querySelector('#sOllamaModel').value,
      },
    };
  },

  async save(root) {
    const settings = this.getSettingsFrom(root);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.ok) {
        // Reload dialup provider list
        DialUp.loadProviders();
        alert('Settings saved successfully.');
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async testProvider(root, provider) {
    const resultEl = root.querySelector('#stest-result-' + provider);
    const dotEl = root.querySelector('#sdot-' + provider);
    const textEl = root.querySelector('#sstatus-text-' + provider);

    if (resultEl) resultEl.textContent = 'Testing...';
    if (dotEl) dotEl.className = 'status-indicator status-unknown';

    // Save settings first so test uses latest keys
    const settings = this.getSettingsFrom(root);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    try {
      const res = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();

      if (data.ok) {
        if (resultEl) resultEl.textContent = 'SUCCESS: ' + data.message;
        if (dotEl) dotEl.className = 'status-indicator status-ok';
        if (textEl) textEl.textContent = 'Connected';
      } else {
        if (resultEl) resultEl.textContent = 'FAILED: ' + data.error;
        if (dotEl) dotEl.className = 'status-indicator status-error';
        if (textEl) textEl.textContent = 'Error';
      }
    } catch (err) {
      if (resultEl) resultEl.textContent = 'ERROR: ' + err.message;
      if (dotEl) dotEl.className = 'status-indicator status-error';
      if (textEl) textEl.textContent = 'Error';
    }
  },
};
