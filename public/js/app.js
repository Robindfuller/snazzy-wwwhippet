// Scale the CRT monitor to fill the viewport on small screens.
// Uses transform: scale() so fonts render at correct px sizes first,
// then the whole monitor is scaled down uniformly.
function scaleCRTMonitor() {
  const monitor = document.querySelector('.crt-monitor');
  if (!monitor) return;
  // Clear any existing transform to read natural dimensions
  monitor.style.transform = '';
  const W = monitor.offsetWidth;
  const H = monitor.offsetHeight + parseFloat(getComputedStyle(monitor).marginBottom || 0);
  const scale = Math.min(1, window.innerWidth / W, window.innerHeight / H);
  monitor.style.transform = scale < 1 ? `scale(${scale})` : '';
}
window.addEventListener('resize', scaleCRTMonitor);

// Boot sequence
document.addEventListener('DOMContentLoaded', () => {
  scaleCRTMonitor();

  // Run boot screen animation, then show desktop
  runBootScreen(() => {
    document.getElementById('bootScreen').classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');

    // Play Windows 95 startup sound
    try {
      const startupSound = new Audio('/audio/windows-95.mp3');
      startupSound.volume = 0.4;
      startupSound.play().catch(() => {});
    } catch {}

    AudioManager.init();
    WindowManager.init();
    MenuSystem.init();
    DialUp.init();
    MyComputer.loadFromServer();
    StartMenu.init();
    updateClock();
    setInterval(updateClock, 30000);

    // Show Settings on first ever run
    if (!localStorage.getItem('wwwhippet_booted')) {
      localStorage.setItem('wwwhippet_booted', '1');
      setTimeout(() => SettingsPanel.open(), 500);
    }
  });

  // Desktop icon — double click to open new browser
  document.getElementById('iconBrowser').addEventListener('dblclick', () => {
    openNewBrowser();
  });

  // Settings icon — opens as a desktop window
  document.getElementById('iconSettings').addEventListener('dblclick', () => {
    SettingsPanel.open();
  });

  // mIRC icon
  document.getElementById('iconMirc').addEventListener('dblclick', () => {
    openMirc();
  });

  // My Computer icon — opens file explorer
  document.getElementById('iconMyComputer').addEventListener('dblclick', () => {
    openMyComputer();
  });

  // ICQ icon
  document.getElementById('iconICQ').addEventListener('dblclick', () => {
    openICQ();
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
        const title = topWin.browser.titlebarText?.textContent?.replace(' - Whippet Browser', '') || url;
        if (url) Bookmarks.add(title, url);
      }
    }
  });

});

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  document.getElementById('taskbarClock').textContent = `${h}:${minutes} ${ampm}`;
}

function runBootScreen(onDone) {
  const bar = document.getElementById('bootProgressBar');
  if (!bar) { onDone(); return; }

  let progress = 0;
  const steps = [
    { to: 15, delay: 400 },
    { to: 30, delay: 600 },
    { to: 45, delay: 300 },
    { to: 55, delay: 800 },
    { to: 70, delay: 400 },
    { to: 80, delay: 500 },
    { to: 90, delay: 300 },
    { to: 100, delay: 600 },
  ];

  let i = 0;
  function nextStep() {
    if (i >= steps.length) {
      setTimeout(onDone, 400);
      return;
    }
    const step = steps[i++];
    bar.style.width = step.to + '%';
    setTimeout(nextStep, step.delay);
  }
  setTimeout(nextStep, 800);
}

function openNewBrowser(url) {
  const winState = WindowManager.createBrowserWindow(url || 'http://www.wwwhippet.com/');
  // Create a BrowserInstance for this window
  const browserEl = winState.el.querySelector('.browser');
  winState.browser = new BrowserInstance(browserEl);
  // Attach dropdown menus
  MenuSystem.attach(browserEl);
}
