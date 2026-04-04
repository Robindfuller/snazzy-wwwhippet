// Dial-Up Networking — manages Ollama model loading with authentic dialup UX
const DialUp = {
  connected: false,
  connecting: false,
  dialogEl: null,

  init() {
    // Desktop icon
    document.getElementById('iconDialup').addEventListener('dblclick', () => this.showDialog());

    // Tray indicator click
    document.getElementById('connectionIndicator').addEventListener('click', () => this.showDialog());

    this.updateIndicator();
  },

  updateIndicator() {
    const el = document.getElementById('connectionIndicator');
    if (this.connected) {
      el.innerHTML = '&#128279;'; // link symbol
      el.title = 'Connected — double-click to disconnect';
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
            ${this.connected ? 'Connected to AI ISP' : 'Ready to dial'}
          </div>
          <div class="dialup-info">
            <font size="1">
              Phone number: <b>1-800-AI-MODEM</b><br>
              Provider: <b id="dialupProvider">${this.getProviderName()}</b>
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

  getProviderName() {
    const sel = document.getElementById('providerSelect');
    return sel ? sel.options[sel.selectedIndex].text : 'Ollama';
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
      { msg: 'Verifying username and password...', delay: 800 },
      { msg: 'Loading AI model into memory...', delay: 0 },
    ];

    for (const stage of stages) {
      this.log(stage.msg);
      this.setStatus(stage.msg);
      if (stage.delay) await this.sleep(stage.delay);
    }

    // Actually load the model
    try {
      const res = await fetch('/api/connect', { method: 'POST' });
      const data = await res.json();

      AudioManager.stopDialup();

      if (data.ok) {
        this.log(`Model "${data.model}" loaded successfully`);
        this.log('CARRIER DETECT');
        this.log('PPP session established');
        this.log('IP address: 10.0.0.' + Math.floor(Math.random() * 254 + 1));
        this.setStatus('Connected to AI ISP');
        this.connected = true;
        this.updateIndicator();

        // Refresh dialog buttons
        const btns = this.dialogEl?.querySelector('.dialup-buttons');
        if (btns) {
          btns.innerHTML = '<button id="dialupDisconnect" class="dialup-btn">Disconnect</button><button id="dialupCancel" class="dialup-btn">Close</button>';
          btns.querySelector('#dialupDisconnect').addEventListener('click', () => this.disconnect());
          btns.querySelector('#dialupCancel').addEventListener('click', () => this.closeDialog());
        }
      } else {
        this.log('ERROR: ' + data.error);
        this.log('NO CARRIER');
        this.setStatus('Connection failed');
        if (connectBtn) connectBtn.disabled = false;
      }
    } catch (err) {
      AudioManager.stopDialup();
      this.log('ERROR: ' + err.message);
      this.log('NO CARRIER');
      this.setStatus('Connection failed');
      if (connectBtn) connectBtn.disabled = false;
    }

    this.connecting = false;
  },

  async disconnect() {
    this.log('Disconnecting...');
    this.setStatus('Disconnecting...');

    const disconnBtn = this.dialogEl?.querySelector('#dialupDisconnect');
    if (disconnBtn) disconnBtn.disabled = true;

    try {
      const res = await fetch('/api/disconnect', { method: 'POST' });
      await res.json();
    } catch {}

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
  },

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  },
};
