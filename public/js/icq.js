// ============================================================
// ICQ 99 — Instant Messenger Simulator
// ============================================================

// Contact definitions per user — each user sees the other two
// Custom/other users see all three characters
const ICQ_KNOWN_USERS = ['eggnog123', 'Phweak!', 'Incon'];

const ICQ_ALL_CONTACTS = [
  { nick: 'eggnog123', uin: '18224561', status: 'Online', flower: '🌼' },
  { nick: 'Phweak!',   uin: '24891037', status: 'Online', flower: '🌼' },
  { nick: 'Incon',     uin: '31045882', status: 'Online', flower: '🌼' },
];

function _icqGetContacts(user) {
  // Known users see the other two; custom users see all three
  if (ICQ_KNOWN_USERS.includes(user)) {
    return ICQ_ALL_CONTACTS.filter(c => c.nick !== user);
  }
  return ICQ_ALL_CONTACTS;
}

// UIN for each user
const ICQ_UINS = {
  'eggnog123': '18224561',
  'Phweak!':   '24891037',
  'Incon':     '31045882',
};

// Chat history stored per conversation pair
const ICQ_HISTORY = {};

function _icqHistoryKey(user, contact) {
  return [user, contact].sort().join('|');
}

function _icqGetHistory(user, contact) {
  const key = _icqHistoryKey(user, contact);
  if (!ICQ_HISTORY[key]) ICQ_HISTORY[key] = [];
  return ICQ_HISTORY[key];
}

// ============================================================
// ICQ Main Window (contact list)
// ============================================================

const ICQ = {
  winState: null,
  chatWindows: {},  // nick → winState
  unread: {},       // nick → count

  open() {
    if (this.winState && document.contains(this.winState.el)) {
      WindowManager.focusWindow(this.winState.id);
      return;
    }

    const user = DialUp.currentUser || 'eggnog123';
    const uin = ICQ_UINS[user] || '00000000';

    this.winState = WindowManager.createGenericWindow(
      'ICQ',
      this._buildHtml(user, uin),
      { icon: '&#127804;', width: '180px', height: '320px' }
    );

    const contentEl = this.winState.el.querySelector('.generic-window-body');
    if (contentEl) { contentEl.style.padding = '0'; contentEl.style.overflow = 'hidden'; }

    this.winState.onClose = () => { this.winState = null; };
    this._wireEvents(user);

    // eggnog123 will message anyone. Phweak! will message Incon.
    if (user !== 'eggnog123') {
      setTimeout(() => this._sendGreeting(user, 'eggnog123'), 5000 + Math.random() * 10000);
    }
    if (user === 'Incon') {
      setTimeout(() => this._sendPhweakGreeting(user), 8000 + Math.random() * 15000);
    }
  },

  _buildHtml(user, uin) {
    const contacts = _icqGetContacts(user);
    const contactHtml = contacts.map(c => `
      <div class="icq-contact" data-nick="${c.nick}">
        <span class="icq-contact-flower">${c.flower}</span>
        <div class="icq-contact-info">
          <div class="icq-contact-nick">${c.nick}</div>
          <div class="icq-contact-status">${c.status}</div>
        </div>
      </div>
    `).join('');

    return `<div class="icq-app">
      <div class="icq-banner">
        <span class="icq-flower">🌼</span>
        <span class="icq-banner-text">ICQ</span>
        <span class="icq-banner-num">#${uin}</span>
      </div>
      <div class="icq-my-status">
        <span class="icq-status-dot"></span>
        <span>${user} — Online</span>
      </div>
      <div class="icq-contacts">
        <div class="icq-group-header">Online (${contacts.length})</div>
        ${contactHtml}
      </div>
      <div class="icq-bottom-bar">
        <button class="icq-bottom-btn">Add</button>
        <button class="icq-bottom-btn">Search</button>
        <button class="icq-bottom-btn icq-status-btn">Status</button>
      </div>
    </div>`;
  },

  _wireEvents(user) {
    const el = this.winState.el;

    el.querySelectorAll('.icq-contact').forEach(contactEl => {
      contactEl.addEventListener('dblclick', () => {
        const nick = contactEl.dataset.nick;
        this.openChat(user, nick);
      });
    });
  },

  // Open a chat window with a contact
  openChat(user, contactNick) {
    if (this.chatWindows[contactNick] && document.contains(this.chatWindows[contactNick].el)) {
      WindowManager.focusWindow(this.chatWindows[contactNick].id);
      return;
    }

    // Clear unread
    this.unread[contactNick] = 0;
    this._updateContactBadge(contactNick);

    const history = _icqGetHistory(user, contactNick);

    const chatWin = WindowManager.createGenericWindow(
      `ICQ — ${contactNick}`,
      this._buildChatHtml(user, contactNick, history),
      { icon: '&#127804;', width: '300px', height: '280px' }
    );

    const contentEl = chatWin.el.querySelector('.generic-window-body');
    if (contentEl) { contentEl.style.padding = '0'; contentEl.style.overflow = 'hidden'; }

    this.chatWindows[contactNick] = chatWin;
    chatWin.onClose = () => { delete this.chatWindows[contactNick]; };

    this._wireChatEvents(chatWin, user, contactNick);

    // Scroll to bottom
    const msgEl = chatWin.el.querySelector('.icq-chat-messages');
    if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
  },

  _buildChatHtml(user, contactNick, history) {
    const msgs = history.map(m => this._renderMsg(m, user)).join('');

    return `<div class="icq-chat">
      <div class="icq-chat-header">
        <span class="icq-chat-header-flower">🌼</span>
        <span class="icq-chat-header-nick">${contactNick}</span>
        <span class="icq-chat-header-status">Online</span>
      </div>
      <div class="icq-chat-messages">${msgs}</div>
      <div class="icq-typing"></div>
      <div class="icq-chat-input-row">
        <input type="text" class="icq-chat-input" placeholder="Type a message..." spellcheck="false">
        <button class="icq-chat-send">Send</button>
      </div>
      <div class="icq-chat-statusbar">Ready</div>
    </div>`;
  },

  _renderMsg(m, currentUser) {
    const isMe = m.from === currentUser;
    const nickClass = isMe ? 'me' : 'them';
    const ts = m.time || '';
    return `<div class="icq-msg">
      <span class="icq-msg-nick ${nickClass}">${m.from}:</span>
      <span class="icq-msg-text">${this._esc(m.text)}</span>
      <span class="icq-msg-time">${ts}</span>
    </div>`;
  },

  _wireChatEvents(chatWin, user, contactNick) {
    const el = chatWin.el;
    const input = el.querySelector('.icq-chat-input');
    const sendBtn = el.querySelector('.icq-chat-send');

    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const msg = { from: user, text, time: this._ts() };
      const history = _icqGetHistory(user, contactNick);
      history.push(msg);

      // Append to chat
      const msgEl = el.querySelector('.icq-chat-messages');
      msgEl.insertAdjacentHTML('beforeend', this._renderMsg(msg, user));
      msgEl.scrollTop = msgEl.scrollHeight;

      // Get AI reply
      this._getReply(user, contactNick, text, history);
    };

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    // Focus input
    setTimeout(() => input.focus(), 100);
  },

  async _getReply(user, contactNick, message, history) {
    const chatWin = this.chatWindows[contactNick];

    // Show typing indicator
    const typingEl = chatWin?.el?.querySelector('.icq-typing');
    if (typingEl) typingEl.textContent = `${contactNick} is typing...`;

    try {
      const recentHistory = history.slice(-10).map(m => ({ from: m.from, text: m.text }));

      const resp = await fetch('/api/icq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          contact: contactNick,
          message,
          history: recentHistory,
        }),
      });

      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();

      if (typingEl) typingEl.textContent = '';

      if (data.reply) {
        // Simulate typing time — roughly 40-80ms per character plus a think delay
        const thinkDelay = 1000 + Math.random() * 2000;
        const typeDelay = data.reply.length * (40 + Math.random() * 40);
        const totalDelay = Math.min(thinkDelay + typeDelay, 8000); // cap at 8 seconds

        // Show typing indicator during the simulated typing
        if (typingEl) typingEl.textContent = `${contactNick} is typing...`;
        await new Promise(r => setTimeout(r, totalDelay));

        if (typingEl) typingEl.textContent = '';

        const replyMsg = { from: contactNick, text: data.reply, time: this._ts() };
        history.push(replyMsg);

        // Play uh-oh sound
        AudioManager.playIcqMessage();

        // If chat window is open, append
        if (this.chatWindows[contactNick] && document.contains(this.chatWindows[contactNick].el)) {
          const msgEl = this.chatWindows[contactNick].el.querySelector('.icq-chat-messages');
          msgEl.insertAdjacentHTML('beforeend', this._renderMsg(replyMsg, user));
          msgEl.scrollTop = msgEl.scrollHeight;
        } else {
          // Chat closed — show unread badge
          this.unread[contactNick] = (this.unread[contactNick] || 0) + 1;
          this._updateContactBadge(contactNick);
        }
      }
    } catch (err) {
      console.error('ICQ chat error:', err);
      if (typingEl) typingEl.textContent = '';
    }
  },

  // Send an initial greeting message from a contact
  _sendGreeting(user, contactNick) {
    const history = _icqGetHistory(user, contactNick);

    // Only send if no history yet
    if (history.length > 0) return;

    // eggnog123 talks to Incon about simple stuff, to Phweak about general things
    const eggnogToIncon = [
      'hey!! have you heard that star trek midi its well good',
      'do you know where i can get star trek desktop themes',
      'i found this midi of the x files theme its so cool',
      'have you seen that website with all the midi files',
      'do you know how to change your desktop wallpaper',
      'i got a star trek screensaver its class',
    ];
    const eggnogGeneral = [
      'hey!!',
      'hiii',
      'omg hi are you there',
      'hello!!',
      'hey hey hey',
      'ohhh you online!!',
    ];
    const greetings = contactNick === 'Incon' ? eggnogToIncon : eggnogGeneral;
    const text = greetings[Math.floor(Math.random() * greetings.length)];
    const greetMsg = { from: contactNick, text, time: this._ts() };
    history.push(greetMsg);

    // Play sound
    AudioManager.playIcqMessage();

    // Show unread if chat not open
    if (!this.chatWindows[contactNick] || !document.contains(this.chatWindows[contactNick].el)) {
      this.unread[contactNick] = (this.unread[contactNick] || 0) + 1;
      this._updateContactBadge(contactNick);
    } else {
      const msgEl = this.chatWindows[contactNick].el.querySelector('.icq-chat-messages');
      msgEl.insertAdjacentHTML('beforeend', this._renderMsg(greetMsg, user));
      msgEl.scrollTop = msgEl.scrollHeight;
    }
  },

  _sendPhweakGreeting(user) {
    const contactNick = 'Phweak!';
    const history = _icqGetHistory(user, contactNick);
    if (history.length > 0) return;

    const greetings = [
      'have you seen the voodoo 3 benchmarks',
      'reckon half life or quake 2 has better deathmatch',
      'whats your fps like in quake on that riva tnt',
      'did you see that new geforce card',
      'you playing half life yet or still on quake',
      'how much was your voodoo 2',
    ];
    const text = greetings[Math.floor(Math.random() * greetings.length)];
    const greetMsg = { from: contactNick, text, time: this._ts() };
    history.push(greetMsg);

    AudioManager.playIcqMessage();

    if (!this.chatWindows[contactNick] || !document.contains(this.chatWindows[contactNick].el)) {
      this.unread[contactNick] = (this.unread[contactNick] || 0) + 1;
      this._updateContactBadge(contactNick);
    } else {
      const msgEl = this.chatWindows[contactNick].el.querySelector('.icq-chat-messages');
      msgEl.insertAdjacentHTML('beforeend', this._renderMsg(greetMsg, user));
      msgEl.scrollTop = msgEl.scrollHeight;
    }
  },

  _updateContactBadge(nick) {
    if (!this.winState || !document.contains(this.winState.el)) return;
    const contactEl = this.winState.el.querySelector(`.icq-contact[data-nick="${nick}"]`);
    if (!contactEl) return;

    // Remove existing badge
    const existing = contactEl.querySelector('.icq-contact-unread');
    if (existing) existing.remove();

    const count = this.unread[nick] || 0;
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'icq-contact-unread';
      badge.textContent = count;
      contactEl.appendChild(badge);
    }
  },

  _ts() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },

  _esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};

function openICQ() {
  if (typeof DialUp !== 'undefined' && DialUp.connected) {
    ICQ.open();
  } else if (typeof DialUp !== 'undefined') {
    DialUp.showDialogAndConnect(() => ICQ.open());
  } else {
    ICQ.open();
  }
}
