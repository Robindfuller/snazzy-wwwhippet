// Boot sequence
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();
  WindowManager.init();
  MenuSystem.init();
  DialUp.init();
  ProviderSwitcher.init();

  // Open first browser window
  openNewBrowser();

  // Desktop icon — double click to open new browser
  document.getElementById('iconNetscape').addEventListener('dblclick', () => {
    openNewBrowser();
  });

  // Settings icon — opens in a fake browser window
  document.getElementById('iconSettings').addEventListener('dblclick', () => {
    openNewBrowser('http://www.wwwhippet.com/settings');
  });

  // GIF Vault icon — opens in a fake browser window
  document.getElementById('iconGifVault').addEventListener('dblclick', () => {
    openNewBrowser('http://www.gifvault.com/');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      openNewBrowser();
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      // Find the focused browser window
      const topWin = WindowManager.windows.reduce((a, b) =>
        parseInt(a.el.style.zIndex) > parseInt(b.el.style.zIndex) ? a : b, WindowManager.windows[0]);
      if (topWin?.browser) {
        const url = topWin.browser.currentUrl;
        const title = topWin.browser.titlebarText?.textContent?.replace(' - Netscape', '') || url;
        if (url) Bookmarks.add(title, url);
      }
    }
  });

  // Taskbar clock
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    document.getElementById('taskbarClock').textContent = `${h}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Dialup is now manual via the Dial-Up Networking icon
});

function openNewBrowser(url) {
  const winState = WindowManager.createBrowserWindow(url || 'http://www.wwwhippet.com/');
  // Create a BrowserInstance for this window
  const browserEl = winState.el.querySelector('.browser');
  winState.browser = new BrowserInstance(browserEl);
  // Attach dropdown menus
  MenuSystem.attach(browserEl);
}
