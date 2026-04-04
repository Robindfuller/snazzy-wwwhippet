// Dial-Up Networking — must connect before browsing the WWW
const DialUp = {
  connected: false,
  connecting: false,
  dialogEl: null,
  providers: [],      // { name, label, configured }
  selectedProvider: null,

  init() {
    // Desktop icon
    document.getElementById('iconDialup').addEventListener('dblclick', () => this.showDialog());

    // Tray indicator click
    document.getElementById('connectionIndicator').addEventListener('click', () => this.showDialog());

    // Fetch available providers and their config status
    this.loadProviders();
    this.updateIndicator();
  },

  async loadProviders() {
    try {
      const [settingsRes, providerRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/provider'),
      ]);
      const settings = await settingsRes.json();
      const providerData = await providerRes.json();

      const labels = { claude: 'Claude (Anthropic)', openai: 'OpenAI', ollama: 'Ollama (Local)' };

      this.providers = providerData.available.map(name => ({
        name,
        label: labels[name] || name,
        configured: this.isConfigured(name, settings),
      }));

      // Auto-select: current provider if configured, else first configured, else first
      const current = providerData.current;
      const currentInfo = this.providers.find(p => p.name === current);
      if (currentInfo?.configured) {
        this.selectedProvider = current;
      } else {
        const firstConfigured = this.providers.find(p => p.configured);
        this.selectedProvider = firstConfigured ? firstConfigured.name : this.providers[0]?.name;
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  },

  isConfigured(name, settings) {
    if (name === 'ollama') {
      return !!(settings.ollama?.baseUrl);
    }
    const cfg = settings[name];
    if (!cfg?.apiKey) return false;
    // Masked keys contain '...' — a configured key is one that's non-empty and masked
    return cfg.apiKey.length > 4;
  },

  updateIndicator() {
    const el = document.getElementById('connectionIndicator');
    if (this.connected) {
      el.innerHTML = '&#128279;'; // link symbol
      el.title = 'Connected — click to disconnect';
      el.style.color = '#00aa00';
    } else {
      el.innerHTML = '&#128264;'; // speaker/modem
      el.title = 'Not connected — double-click Dial-Up Networking to connect';
      el.style.color = '';
    }
  },

  showDialog() {
    if (this.dialogEl) {
      this.dialogEl.remove();
      this.dialogEl = null;
    }

    const providerOptions = this.providers.map(p => {
      const selected = p.name === this.selectedProvider ? 'selected' : '';
      const suffix = p.configured ? '' : ' (not configured)';
      return `<option value="${p.name}" ${selected}>${p.label}${suffix}</option>`;
    }).join('');

    const dialog = document.createElement('div');
    dialog.className = 'dialup-dialog';
    dialog.innerHTML = `
      <div class="dialup-titlebar">
        <span>Dial-Up Networking</span>
        <button class="dialup-close">X</button>
      </div>
      <div class="dialup-body">
        <div class="dialup-icon">&#128222;</div>
        <div class="dialup-content">
          <div class="dialup-status" id="dialupStatus">
            ${this.connected ? 'Connected to ' + this.getProviderLabel() : 'Ready to dial'}
          </div>
          <div class="dialup-info">
            <font size="1">
              Phone number: <b>1-800-AI-MODEM</b><br>
              ISP: <select id="dialupProviderSelect" class="dialup-provider-select" ${this.connected ? 'disabled' : ''}>
                ${providerOptions}
              </select>
            </font>
          </div>
          <div class="dialup-log" id="dialupLog"></div>
          <div class="dialup-buttons">
            ${this.connected
              ? '<button id="dialupDisconnect" class="dialup-btn">Disconnect</button>'
              : '<button id="dialupConnect" class="dialup-btn">Connect</button>'
            }
            <button id="dialupCancel" class="dialup-btn">Close</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desktop').appendChild(dialog);
    this.dialogEl = dialog;

    // Wire buttons
    dialog.querySelector('.dialup-close').addEventListener('click', () => this.closeDialog());
    dialog.querySelector('#dialupCancel').addEventListener('click', () => this.closeDialog());

    // Provider select change
    const provSelect = dialog.querySelector('#dialupProviderSelect');
    provSelect.addEventListener('change', () => {
      this.selectedProvider = provSelect.value;
    });

    if (this.connected) {
      dialog.querySelector('#dialupDisconnect').addEventListener('click', () => this.disconnect());
    } else {
      dialog.querySelector('#dialupConnect').addEventListener('click', () => this.connect());
    }
  },

  closeDialog() {
    if (this.dialogEl) {
      this.dialogEl.remove();
      this.dialogEl = null;
    }
  },

  getProviderLabel() {
    const p = this.providers.find(p => p.name === this.selectedProvider);
    return p ? p.label : this.selectedProvider;
  },

  log(msg) {
    const logEl = this.dialogEl?.querySelector('#dialupLog');
    if (logEl) {
      logEl.innerHTML += msg + '<br>';
      logEl.scrollTop = logEl.scrollHeight;
    }
  },

  setStatus(msg) {
    const el = this.dialogEl?.querySelector('#dialupStatus');
    if (el) el.textContent = msg;
  },

  async connect() {
    if (this.connecting || this.connected) return;
    this.connecting = true;

    const connectBtn = this.dialogEl?.querySelector('#dialupConnect');
    if (connectBtn) connectBtn.disabled = true;

    const provSelect = this.dialogEl?.querySelector('#dialupProviderSelect');
    if (provSelect) provSelect.disabled = true;

    const provider = this.selectedProvider;
    const label = this.getProviderLabel();

    // Play dialup sound
    AudioManager.playDialup();

    // Authentic modem sequence
    const stages = [
      { msg: 'Initializing modem...', delay: 800 },
      { msg: 'ATZ OK', delay: 600 },
      { msg: 'ATDT 1-800-AI-MODEM', delay: 1000 },
      { msg: 'Dialing...', delay: 2000 },
      { msg: 'RING...', delay: 1500 },
      { msg: 'RING...', delay: 1500 },
      { msg: 'CONNECT 33600', delay: 1000 },
      { msg: `Authenticating with ${label}...`, delay: 800 },
      { msg: 'Verifying credentials...', delay: 0 },
    ];

    for (const stage of stages) {
      this.log(stage.msg);
      this.setStatus(stage.msg);
      if (stage.delay) await this.sleep(stage.delay);
    }

    // Switch the server to the selected provider
    try {
      const res = await fetch('/api/provider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();

      AudioManager.stopDialup();

      this.log('CARRIER DETECT');
      this.log('PPP session established');
      this.log('IP address: 10.0.0.' + Math.floor(Math.random() * 254 + 1));
      this.log(`Connected via ${label}`);
      this.setStatus('Connected to ' + label);
      this.connected = true;
      this.updateIndicator();

      // Refresh dialog buttons
      const btns = this.dialogEl?.querySelector('.dialup-buttons');
      if (btns) {
        btns.innerHTML = '<button id="dialupDisconnect" class="dialup-btn">Disconnect</button><button id="dialupCancel" class="dialup-btn">Close</button>';
        btns.querySelector('#dialupDisconnect').addEventListener('click', () => this.disconnect());
        btns.querySelector('#dialupCancel').addEventListener('click', () => this.closeDialog());
      }
    } catch (err) {
      AudioManager.stopDialup();
      this.log('ERROR: ' + err.message);
      this.log('NO CARRIER');
      this.setStatus('Connection failed');
      if (connectBtn) connectBtn.disabled = false;
      if (provSelect) provSelect.disabled = false;
    }

    this.connecting = false;
  },

  async disconnect() {
    this.log('Disconnecting...');
    this.setStatus('Disconnecting...');

    const disconnBtn = this.dialogEl?.querySelector('#dialupDisconnect');
    if (disconnBtn) disconnBtn.disabled = true;

    await this.sleep(500);

    this.log('NO CARRIER');
    this.log('ATH0 OK');
    this.log('Connection terminated.');
    this.setStatus('Disconnected');
    this.connected = false;
    this.updateIndicator();

    // Refresh dialog buttons
    const btns = this.dialogEl?.querySelector('.dialup-buttons');
    if (btns) {
      btns.innerHTML = '<button id="dialupConnect" class="dialup-btn">Connect</button><button id="dialupCancel" class="dialup-btn">Close</button>';
      btns.querySelector('#dialupConnect').addEventListener('click', () => this.connect());
      btns.querySelector('#dialupCancel').addEventListener('click', () => this.closeDialog());
    }

    // Re-enable provider select
    const provSelect = this.dialogEl?.querySelector('#dialupProviderSelect');
    if (provSelect) provSelect.disabled = false;
  },

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  },
};
