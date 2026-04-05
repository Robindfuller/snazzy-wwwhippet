// Win95-style window manager — spawns, drags, resizes, minimizes, maximizes, focuses, closes
const WindowManager = {
  windows: [],
  nextId: 1,
  topZ: 10,
  desktop: null,
  taskbarTasks: null,

  init() {
    this.desktop = document.getElementById('desktop');
    this.taskbarTasks = document.getElementById('taskbarTasks');

    // Global mouse handlers for drag/resize
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
  },

  // Create a new browser window, returns the window info object
  createBrowserWindow(url) {
    const id = this.nextId++;
    const offset = ((id - 1) % 5) * 20; // Cascade new windows

    // Build the DOM
    const win = document.createElement('div');
    win.className = 'browser-window';
    win.dataset.winId = id;
    win.style.top = (4 + offset) + 'px';
    win.style.left = (70 + offset) + 'px';
    win.style.width = 'calc(100% - ' + (74 + offset) + 'px)';
    win.style.height = 'calc(100% - ' + (28 + offset) + 'px)';
    win.style.zIndex = ++this.topZ;

    win.innerHTML = `
      <div class="resize-n"></div>
      <div class="resize-s"></div>
      <div class="resize-e"></div>
      <div class="resize-w"></div>
      <div class="resize-handle"></div>
      <div class="browser">
        <div class="browser-titlebar">
          <span class="titlebar-text">Whippet Browser</span>
          <div class="titlebar-buttons">
            <button class="titlebar-btn minimize">_</button>
            <button class="titlebar-btn maximize">&#9633;</button>
            <button class="titlebar-btn close">X</button>
          </div>
        </div>
        <div class="browser-menubar">
          <span class="menu-item" data-menu="file">File</span>
          <span class="menu-item" data-menu="edit">Edit</span>
          <span class="menu-item" data-menu="view">View</span>
          <span class="menu-item" data-menu="go">Go</span>
          <span class="menu-item" data-menu="bookmarks">Bookmarks</span>
          <span class="menu-item" data-menu="options">Options</span>
          <span class="menu-item" data-menu="help">Help</span>
        </div>
        <div class="browser-toolbar">
          <div class="toolbar-buttons">
            <button class="nav-btn btn-back" title="Back" disabled>
              <span class="nav-icon">&#9664;</span>
              <span class="nav-label">Back</span>
            </button>
            <button class="nav-btn btn-forward" title="Forward" disabled>
              <span class="nav-icon">&#9654;</span>
              <span class="nav-label">Forward</span>
            </button>
            <button class="nav-btn btn-reload" title="Reload">
              <span class="nav-icon">&#8635;</span>
              <span class="nav-label">Reload</span>
            </button>
            <button class="nav-btn btn-home" title="Home">
              <span class="nav-icon">&#8962;</span>
              <span class="nav-label">Home</span>
            </button>
            <button class="nav-btn btn-search" title="Search">
              <span class="nav-icon">&#128269;</span>
              <span class="nav-label">Search</span>
            </button>
          </div>
          <div class="throbber">
            <span class="throbber-n">N</span>
          </div>
        </div>
        <div class="browser-addressbar">
          <span class="address-label">Location:</span>
          <input type="text" class="address-input" value="${url || 'http://www.wwwhippet.com/'}" spellcheck="false">
        </div>
        <div class="browser-viewport">
          <iframe src="/www/${(url || 'http://www.wwwhippet.com/').replace(/^https?:\/\//, '')}" frameborder="0"></iframe>
        </div>
        <div class="browser-statusbar">
          <span class="status-text">Document: Done</span>
          <div class="status-security">
            <span class="security-icon" title="No Security">&#128275;</span>
          </div>
        </div>
      </div>
    `;

    // Insert before taskbar
    const taskbar = this.desktop.querySelector('.taskbar');
    this.desktop.insertBefore(win, taskbar);

    // Create taskbar button
    const taskBtn = document.createElement('button');
    taskBtn.className = 'taskbar-task active';
    taskBtn.dataset.winId = id;
    taskBtn.textContent = '🌐 Whippet Browser';
    this.taskbarTasks.appendChild(taskBtn);

    // Window state
    const winState = {
      id,
      el: win,
      taskBtn,
      isMaximized: false,
      isMinimized: false,
      preMaxState: null,
      browser: null, // will be set by Browser.initWindow()
    };
    this.windows.push(winState);

    // --- Event wiring ---
    const titlebar = win.querySelector('.browser-titlebar');
    const btnMin = win.querySelector('.titlebar-btn.minimize');
    const btnMax = win.querySelector('.titlebar-btn.maximize');
    const btnClose = win.querySelector('.titlebar-btn.close');

    // Focus on click anywhere in window
    win.addEventListener('mousedown', () => this.focusWindow(id));

    // Minimize
    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    // Maximize/restore
    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.titlebar-btn')) return;
      this.toggleMaximize(id);
    });

    // Close
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    // Taskbar button
    taskBtn.addEventListener('click', () => {
      if (winState.isMinimized) {
        this.restoreWindow(id);
      } else if (parseInt(win.style.zIndex) === this.topZ) {
        this.minimizeWindow(id);
      } else {
        this.focusWindow(id);
      }
    });

    // Drag by titlebar
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.titlebar-btn')) return;
      if (winState.isMaximized) return;
      this.startDrag(id, e);
    });

    // Resize handles
    win.querySelector('.resize-handle').addEventListener('mousedown', (e) => this.startResize(id, 'se', e));
    win.querySelector('.resize-n').addEventListener('mousedown', (e) => this.startResize(id, 'n', e));
    win.querySelector('.resize-s').addEventListener('mousedown', (e) => this.startResize(id, 's', e));
    win.querySelector('.resize-e').addEventListener('mousedown', (e) => this.startResize(id, 'e', e));
    win.querySelector('.resize-w').addEventListener('mousedown', (e) => this.startResize(id, 'w', e));

    // Deactivate other taskbar buttons
    this.focusWindow(id);

    return winState;
  },

  // Create a generic (non-browser) window with custom HTML content
  createGenericWindow(title, contentHtml, opts = {}) {
    const id = this.nextId++;
    const offset = ((id - 1) % 5) * 20;
    const icon = opts.icon || '&#128196;';
    const width = opts.width || 'calc(100% - 120px)';
    const height = opts.height || 'calc(100% - 60px)';

    const win = document.createElement('div');
    win.className = 'browser-window';
    win.dataset.winId = id;
    win.style.top = (20 + offset) + 'px';
    win.style.left = (90 + offset) + 'px';
    win.style.width = width;
    win.style.height = height;
    win.style.zIndex = ++this.topZ;

    win.innerHTML = `
      <div class="resize-n"></div>
      <div class="resize-s"></div>
      <div class="resize-e"></div>
      <div class="resize-w"></div>
      <div class="resize-handle"></div>
      <div class="browser" style="display:flex;flex-direction:column;height:100%;">
        <div class="browser-titlebar">
          <span class="titlebar-text">${title}</span>
          <div class="titlebar-buttons">
            <button class="titlebar-btn minimize">_</button>
            <button class="titlebar-btn maximize">&#9633;</button>
            <button class="titlebar-btn close">X</button>
          </div>
        </div>
        <div class="generic-window-body" style="flex:1;overflow:auto;background:#c0c0c0;padding:0;">
          ${contentHtml}
        </div>
      </div>
    `;

    const taskbar = this.desktop.querySelector('.taskbar');
    this.desktop.insertBefore(win, taskbar);

    const taskBtn = document.createElement('button');
    taskBtn.className = 'taskbar-task active';
    taskBtn.dataset.winId = id;
    taskBtn.textContent = icon.replace(/&#\d+;/, '') + ' ' + title.substring(0, 20);
    this.taskbarTasks.appendChild(taskBtn);

    const winState = { id, el: win, taskBtn, isMaximized: false, isMinimized: false, preMaxState: null, browser: null };
    this.windows.push(winState);

    // Event wiring (same as browser windows)
    const titlebar = win.querySelector('.browser-titlebar');
    const btnMin = win.querySelector('.titlebar-btn.minimize');
    const btnMax = win.querySelector('.titlebar-btn.maximize');
    const btnClose = win.querySelector('.titlebar-btn.close');

    win.addEventListener('mousedown', () => this.focusWindow(id));
    btnMin.addEventListener('click', (e) => { e.stopPropagation(); this.minimizeWindow(id); });
    btnMax.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMaximize(id); });
    titlebar.addEventListener('dblclick', (e) => { if (!e.target.closest('.titlebar-btn')) this.toggleMaximize(id); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); this.closeWindow(id); });

    taskBtn.addEventListener('click', () => {
      if (winState.isMinimized) this.restoreWindow(id);
      else if (parseInt(win.style.zIndex) === this.topZ) this.minimizeWindow(id);
      else this.focusWindow(id);
    });

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.titlebar-btn')) return;
      if (winState.isMaximized) return;
      this.startDrag(id, e);
    });

    win.querySelector('.resize-handle').addEventListener('mousedown', (e) => this.startResize(id, 'se', e));
    win.querySelector('.resize-n').addEventListener('mousedown', (e) => this.startResize(id, 'n', e));
    win.querySelector('.resize-s').addEventListener('mousedown', (e) => this.startResize(id, 's', e));
    win.querySelector('.resize-e').addEventListener('mousedown', (e) => this.startResize(id, 'e', e));
    win.querySelector('.resize-w').addEventListener('mousedown', (e) => this.startResize(id, 'w', e));

    this.focusWindow(id);
    return winState;
  },

  getWindow(id) {
    return this.windows.find(w => w.id === id);
  },

  focusWindow(id) {
    const win = this.getWindow(id);
    if (!win) return;
    win.el.style.zIndex = ++this.topZ;
    // Update taskbar active state
    this.taskbarTasks.querySelectorAll('.taskbar-task').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.winId) === id);
    });
    // Update titlebar colors — focused vs unfocused
    this.windows.forEach(w => {
      const tb = w.el.querySelector('.browser-titlebar');
      if (w.id === id) {
        tb.style.background = 'linear-gradient(90deg, #000080, #1084d0)';
      } else {
        tb.style.background = '#808080';
      }
    });
  },

  minimizeWindow(id) {
    const win = this.getWindow(id);
    if (!win) return;
    win.isMinimized = true;
    win.el.classList.add('minimized');
    win.taskBtn.classList.remove('active');
  },

  restoreWindow(id) {
    const win = this.getWindow(id);
    if (!win) return;
    win.isMinimized = false;
    win.el.classList.remove('minimized');
    this.focusWindow(id);
  },

  toggleMaximize(id) {
    const win = this.getWindow(id);
    if (!win) return;

    if (win.isMaximized) {
      // Restore
      win.el.classList.remove('maximized');
      if (win.preMaxState) {
        win.el.style.top = win.preMaxState.top;
        win.el.style.left = win.preMaxState.left;
        win.el.style.width = win.preMaxState.width;
        win.el.style.height = win.preMaxState.height;
      }
      win.isMaximized = false;
    } else {
      // Maximize
      win.preMaxState = {
        top: win.el.style.top || win.el.offsetTop + 'px',
        left: win.el.style.left || win.el.offsetLeft + 'px',
        width: win.el.style.width || win.el.offsetWidth + 'px',
        height: win.el.style.height || win.el.offsetHeight + 'px',
      };
      win.el.classList.add('maximized');
      win.isMaximized = true;
    }
    this.focusWindow(id);
  },

  closeWindow(id) {
    const win = this.getWindow(id);
    if (!win) return;
    if (win.onClose) win.onClose();
    win.el.remove();
    win.taskBtn.remove();
    this.windows = this.windows.filter(w => w.id !== id);
  },

  // --- Ghost outline for drag/resize ---
  _ghost: null,

  createGhost(win) {
    const ghost = document.createElement('div');
    ghost.className = 'window-ghost';
    ghost.style.position = 'absolute';
    ghost.style.left = win.el.offsetLeft + 'px';
    ghost.style.top = win.el.offsetTop + 'px';
    ghost.style.width = win.el.offsetWidth + 'px';
    ghost.style.height = win.el.offsetHeight + 'px';
    ghost.style.border = '2px dotted #000000';
    ghost.style.background = 'transparent';
    ghost.style.zIndex = 9999;
    ghost.style.pointerEvents = 'none';
    this.desktop.appendChild(ghost);
    this._ghost = ghost;
    return ghost;
  },

  removeGhost() {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  },

  // --- Drag ---
  _drag: null,

  startDrag(id, e) {
    const win = this.getWindow(id);
    if (!win) return;
    const desktopRect = this.desktop.getBoundingClientRect();
    const ghost = this.createGhost(win);
    this._drag = {
      id,
      ghost,
      offsetX: e.clientX - win.el.getBoundingClientRect().left + desktopRect.left,
      offsetY: e.clientY - win.el.getBoundingClientRect().top + desktopRect.top,
      origLeft: win.el.offsetLeft,
      origTop: win.el.offsetTop,
    };
    e.preventDefault();
  },

  // --- Resize ---
  _resize: null,

  startResize(id, dir, e) {
    const win = this.getWindow(id);
    if (!win || win.isMaximized) return;
    const ghost = this.createGhost(win);
    this._resize = {
      id, dir, ghost,
      startX: e.clientX,
      startY: e.clientY,
      startW: win.el.offsetWidth,
      startH: win.el.offsetHeight,
      startL: win.el.offsetLeft,
      startT: win.el.offsetTop,
    };
    e.preventDefault();
  },

  onMouseMove(e) {
    // Drag — move ghost outline only
    if (this._drag) {
      const d = this._drag;
      const desktopRect = this.desktop.getBoundingClientRect();
      const ghostW = parseInt(d.ghost.style.width);
      let newLeft = e.clientX - d.offsetX;
      let newTop = e.clientY - d.offsetY;
      newLeft = Math.max(-ghostW + 60, Math.min(newLeft, desktopRect.width - 40));
      newTop = Math.max(0, Math.min(newTop, desktopRect.height - 24));
      d.ghost.style.left = newLeft + 'px';
      d.ghost.style.top = newTop + 'px';
    }

    // Resize — resize ghost outline only
    if (this._resize) {
      const r = this._resize;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      const minW = 200, minH = 150;

      let l = r.startL, t = r.startT, w = r.startW, h = r.startH;

      if (r.dir === 'se' || r.dir === 'e') w = Math.max(minW, r.startW + dx);
      if (r.dir === 'se' || r.dir === 's') h = Math.max(minH, r.startH + dy);
      if (r.dir === 'n') {
        h = Math.max(minH, r.startH - dy);
        t = r.startT + r.startH - h;
      }
      if (r.dir === 'w') {
        w = Math.max(minW, r.startW - dx);
        l = r.startL + r.startW - w;
      }

      r.ghost.style.left = l + 'px';
      r.ghost.style.top = t + 'px';
      r.ghost.style.width = w + 'px';
      r.ghost.style.height = h + 'px';
    }
  },

  onMouseUp() {
    // Drag — snap window to ghost position
    if (this._drag) {
      const win = this.getWindow(this._drag.id);
      if (win) {
        win.el.style.left = this._drag.ghost.style.left;
        win.el.style.top = this._drag.ghost.style.top;
        win.el.style.right = 'auto';
        win.el.style.bottom = 'auto';
      }
      this.removeGhost();
      this._drag = null;
    }

    // Resize — snap window to ghost size
    if (this._resize) {
      const win = this.getWindow(this._resize.id);
      if (win) {
        win.el.style.left = this._resize.ghost.style.left;
        win.el.style.top = this._resize.ghost.style.top;
        win.el.style.width = this._resize.ghost.style.width;
        win.el.style.height = this._resize.ghost.style.height;
        win.el.style.right = 'auto';
        win.el.style.bottom = 'auto';
      }
      this.removeGhost();
      this._resize = null;
    }
  },
};
