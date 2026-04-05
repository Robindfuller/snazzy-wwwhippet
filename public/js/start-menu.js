// Windows 95 Start Menu
const StartMenu = {
  menuEl: null,
  subMenuEl: null,

  init() {
    const btn = document.getElementById('startBtn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
        this.close();
      }
    });
  },

  toggle() {
    if (this.menuEl) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    this.close();

    const menu = document.createElement('div');
    menu.className = 'start-menu';
    menu.innerHTML = `
      <div class="start-menu-sidebar">
        <span class="start-menu-sidebar-text">WWWhippet!<b>95</b></span>
      </div>
      <div class="start-menu-items">
        <div class="start-menu-item has-submenu" data-submenu="programs">
          <span class="start-menu-icon">&#128194;</span>
          <span class="start-menu-label">Programs</span>
          <span class="start-menu-arrow">&#9654;</span>
        </div>
        <div class="start-menu-separator"></div>
        <div class="start-menu-item" data-action="settings">
          <span class="start-menu-icon">&#9881;</span>
          <span class="start-menu-label">AI Settings</span>
        </div>
        <div class="start-menu-item" data-action="dialup">
          <span class="start-menu-icon">&#128222;</span>
          <span class="start-menu-label">Dial-Up Networking</span>
        </div>
        <div class="start-menu-separator"></div>
        <div class="start-menu-item" data-action="mycomputer">
          <span class="start-menu-icon">&#128187;</span>
          <span class="start-menu-label">My Computer</span>
        </div>
      </div>
    `;

    document.getElementById('desktop').appendChild(menu);
    this.menuEl = menu;

    // Wire item clicks
    menu.querySelectorAll('.start-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action) {
          this.doAction(action);
          this.close();
        }
      });

      // Submenu hover
      if (item.dataset.submenu) {
        item.addEventListener('mouseenter', () => this.openSubmenu(item.dataset.submenu, item));
      } else {
        item.addEventListener('mouseenter', () => this.closeSubmenu());
      }
    });
  },

  openSubmenu(name, anchorEl) {
    this.closeSubmenu();

    const items = this.getSubmenuItems(name);
    if (!items.length) return;

    const sub = document.createElement('div');
    sub.className = 'start-menu start-submenu';
    sub.innerHTML = `<div class="start-menu-items">
      ${items.map(item => item.separator
        ? '<div class="start-menu-separator"></div>'
        : `<div class="start-menu-item" data-action="${item.action}">
            <span class="start-menu-icon">${item.icon}</span>
            <span class="start-menu-label">${item.label}</span>
          </div>`
      ).join('')}
    </div>`;

    // Position to the right of the parent menu
    const menuRect = this.menuEl.getBoundingClientRect();
    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();

    sub.style.left = (menuRect.right - desktopRect.left - 2) + 'px';
    sub.style.bottom = (desktopRect.bottom - anchorRect.bottom) + 'px';

    document.getElementById('desktop').appendChild(sub);
    this.subMenuEl = sub;

    sub.querySelectorAll('.start-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.dataset.action) {
          this.doAction(item.dataset.action);
          this.close();
        }
      });
    });
  },

  closeSubmenu() {
    if (this.subMenuEl) {
      this.subMenuEl.remove();
      this.subMenuEl = null;
    }
  },

  getSubmenuItems(name) {
    if (name === 'programs') {
      return [
        { icon: '&#127760;', label: 'Whippet Browser', action: 'browser' },
        { icon: '&#9889;',   label: 'mIRC',             action: 'mirc' },
        { separator: true },
        { icon: '&#128196;', label: 'GIF Vault',        action: 'gifvault' },
      ];
    }
    return [];
  },

  doAction(action) {
    switch (action) {
      case 'browser':
        openNewBrowser();
        break;
      case 'mirc':
        openMirc();
        break;
      case 'mycomputer':
        openMyComputer();
        break;
      case 'settings':
        SettingsPanel.open();
        break;
      case 'dialup':
        DialUp.showDialog();
        break;
      case 'gifvault':
        openNewBrowser('http://www.gifvault.com/');
        break;
    }
  },

  close() {
    this.closeSubmenu();
    if (this.menuEl) {
      this.menuEl.remove();
      this.menuEl = null;
    }
  },
};
