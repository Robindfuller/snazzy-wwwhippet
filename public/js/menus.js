// Netscape-style dropdown menus + bookmarks system

const Bookmarks = {
  KEY: 'wwwhippet-bookmarks',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch { return []; }
  },

  add(title, url) {
    const bookmarks = this.getAll();
    // Don't duplicate
    if (bookmarks.some(b => b.url === url)) return false;
    bookmarks.push({ title: title.substring(0, 60), url });
    localStorage.setItem(this.KEY, JSON.stringify(bookmarks));
    return true;
  },

  remove(url) {
    const bookmarks = this.getAll().filter(b => b.url !== url);
    localStorage.setItem(this.KEY, JSON.stringify(bookmarks));
  },

  clear() {
    localStorage.setItem(this.KEY, JSON.stringify([]));
  },
};

const MenuSystem = {
  activeMenu: null,
  activeMenuBar: null,
  tracking: false, // track mouse across menu items while open

  init() {
    // Close menus on any outside click
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.menu-item') && !e.target.closest('.menu-dropdown')) {
        this.closeMenu();
      }
    });
  },

  // Wire up menus for a browser window
  attach(winEl) {
    const menubar = winEl.querySelector('.browser-menubar');
    if (!menubar) return;

    menubar.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item) return;
      e.stopPropagation();
      const menuName = item.dataset.menu;
      if (this.activeMenu && this.activeMenuBar === menubar) {
        this.closeMenu();
        return;
      }
      this.openMenu(menuName, item, winEl);
    });

    // Track across menu items while a menu is open
    menubar.addEventListener('mouseenter', (e) => {
      if (!this.activeMenu) return;
      const item = e.target.closest('.menu-item');
      if (item && item.dataset.menu) {
        this.openMenu(item.dataset.menu, item, winEl);
      }
    }, true);

    menubar.addEventListener('mouseover', (e) => {
      if (!this.activeMenu) return;
      const item = e.target.closest('.menu-item');
      if (item && item.dataset.menu) {
        this.openMenu(item.dataset.menu, item, winEl);
      }
    });
  },

  openMenu(menuName, anchorEl, winEl) {
    this.closeMenu();

    const browser = this.getBrowserInstance(winEl);
    const items = this.getMenuItems(menuName, browser);
    if (!items.length) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'menu-dropdown';

    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'menu-separator';
        dropdown.appendChild(sep);
        continue;
      }

      const row = document.createElement('div');
      row.className = 'menu-row';
      if (item.disabled) row.classList.add('disabled');

      row.innerHTML = `<span class="menu-label">${item.label}</span>${item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : ''}`;

      if (!item.disabled && item.action) {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeMenu();
          item.action();
        });
      }

      dropdown.appendChild(row);
    }

    // Position below the menu item
    const rect = anchorEl.getBoundingClientRect();
    const winRect = winEl.closest('.browser-window').getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.left = (rect.left - winRect.left) + 'px';
    dropdown.style.top = (rect.bottom - winRect.top) + 'px';
    dropdown.style.zIndex = '10000';

    winEl.closest('.browser-window').appendChild(dropdown);
    this.activeMenu = dropdown;
    this.activeMenuBar = anchorEl.closest('.browser-menubar');

    // Highlight the active menu item
    anchorEl.classList.add('active');
  },

  closeMenu() {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
    if (this.activeMenuBar) {
      this.activeMenuBar.querySelectorAll('.menu-item.active').forEach(el => el.classList.remove('active'));
      this.activeMenuBar = null;
    }
  },

  getBrowserInstance(winEl) {
    const winId = winEl.closest('.browser-window')?.dataset.winId;
    if (winId) {
      const ws = WindowManager.getWindow(parseInt(winId));
      return ws?.browser;
    }
    return null;
  },

  getMenuItems(menuName, browser) {
    const currentUrl = browser?.currentUrl || '';
    const pageTitle = browser?.titlebarText?.textContent?.replace(' - Internet Browser', '') || '';

    switch (menuName) {
      case 'file':
        return [
          { label: 'New Window', shortcut: 'Ctrl+N', action: () => openNewBrowser() },
          { separator: true },
          { label: 'Open Location...', shortcut: 'Ctrl+L', action: () => {
            browser?.addressBar?.focus();
            browser?.addressBar?.select();
          }},
          { separator: true },
          { label: 'Save As...', disabled: true },
          { separator: true },
          { label: 'Print...', disabled: true },
          { label: 'Print Preview', disabled: true },
          { separator: true },
          { label: 'Close', shortcut: 'Ctrl+W', action: () => {
            const winId = browser?.el?.closest('.browser-window')?.dataset.winId;
            if (winId) WindowManager.closeWindow(parseInt(winId));
          }},
        ];

      case 'edit':
        return [
          { label: 'Copy', shortcut: 'Ctrl+C', disabled: true },
          { label: 'Select All', shortcut: 'Ctrl+A', disabled: true },
          { separator: true },
          { label: 'Find in Page...', shortcut: 'Ctrl+F', disabled: true },
        ];

      case 'view':
        return [
          { label: 'Reload', shortcut: 'Ctrl+R', action: () => browser?.reload() },
          { separator: true },
          { label: 'Page Source', action: () => {
            if (browser?.iframe?.contentDocument) {
              const src = browser.iframe.contentDocument.documentElement.outerHTML;
              const w = window.open('', '_blank');
              w.document.write('<pre>' + src.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
            }
          }},
          { separator: true },
          { label: 'Document Info', disabled: true },
        ];

      case 'go':
        return [
          { label: 'Back', action: () => browser?.goBack(), disabled: browser?.historyIndex <= 0 },
          { label: 'Forward', action: () => browser?.goForward(), disabled: browser?.historyIndex >= (browser?.history?.length || 1) - 1 },
          { separator: true },
          { label: 'Home', action: () => browser?.goHome() },
          { separator: true },
          // Show recent history
          ...(browser?.history || []).slice(-8).reverse().map((url, i) => ({
            label: url.length > 50 ? url.substring(0, 50) + '...' : url,
            action: () => browser?.navigateTo(url),
            disabled: url === currentUrl,
          })),
        ];

      case 'bookmarks':
        return [
          { label: 'Add Bookmark', shortcut: 'Ctrl+D', action: () => {
            if (currentUrl) {
              const added = Bookmarks.add(pageTitle || currentUrl, currentUrl);
              if (!added) {
                // Already bookmarked — offer to remove
                if (confirm('This page is already bookmarked. Remove it?')) {
                  Bookmarks.remove(currentUrl);
                }
              }
            }
          }},
          { separator: true },
          ...this.getBookmarkItems(browser),
        ];

      case 'options':
        return [
          { label: 'AI Settings...', action: () => openNewBrowser('http://www.wwwhippet.com/settings') },
          { label: 'GIF Vault...', action: () => openNewBrowser('http://www.gifvault.com/') },
          { separator: true },
          { label: 'General Preferences...', disabled: true },
          { label: 'Mail & News Preferences...', disabled: true },
          { label: 'Network Preferences...', disabled: true },
          { label: 'Security Preferences...', disabled: true },
        ];

      case 'help':
        return [
          { label: 'About Internet Browser', action: () => {
            alert('WWWhippet! Internet Browser\nPowered by AI-generated 90s internet');
          }},
          { separator: true },
          { label: 'About the Internet', disabled: true },
          { label: 'Registration Information', disabled: true },
          { label: 'Software', disabled: true },
        ];

      default:
        return [];
    }
  },

  getBookmarkItems(browser) {
    const bookmarks = Bookmarks.getAll();
    if (bookmarks.length === 0) {
      return [{ label: '(No Bookmarks)', disabled: true }];
    }

    const items = bookmarks.map(b => ({
      label: b.title || b.url,
      action: () => browser?.navigateTo(b.url),
    }));

    items.push({ separator: true });
    items.push({
      label: 'Clear All Bookmarks',
      action: () => {
        if (confirm('Remove all bookmarks?')) Bookmarks.clear();
      },
    });

    return items;
  },
};
