// Browser controller — one instance per window
class BrowserInstance {
  constructor(windowEl) {
    this.el = windowEl;
    this.iframe = windowEl.querySelector('iframe');
    this.addressBar = windowEl.querySelector('.address-input');
    this.statusText = windowEl.querySelector('.status-text');
    this.titlebarText = windowEl.querySelector('.titlebar-text');
    this.btnBack = windowEl.querySelector('.btn-back');
    this.btnForward = windowEl.querySelector('.btn-forward');
    this.throbber = windowEl.querySelector('.throbber');

    this.history = [];
    this.historyIndex = -1;
    this.currentUrl = '';
    this.isNavigating = false;

    this.HOME_URL = 'http://www.wwwhippet.com/';

    // Address bar enter key
    this.addressBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.navigateTo(this.addressBar.value.trim());
      }
    });

    // Nav buttons
    this.btnBack.addEventListener('click', () => this.goBack());
    this.btnForward.addEventListener('click', () => this.goForward());
    windowEl.querySelector('.btn-reload').addEventListener('click', () => this.reload());
    windowEl.querySelector('.btn-home').addEventListener('click', () => this.goHome());
    windowEl.querySelector('.btn-search').addEventListener('click', () => this.goHome());

    // Iframe load
    this.iframe.addEventListener('load', () => this.onIframeLoad());

    // Navigate to initial URL
    const initialUrl = this.addressBar.value || this.HOME_URL;
    this.navigateTo(initialUrl, false);
  }

  navigateTo(url, addToHistory = true, linkText = null) {
    url = this.normalizeUrl(url);
    let wwwPath = this.urlToWwwPath(url);

    // Block navigation if not dialed up
    if (!DialUp.connected) {
      this.currentUrl = url;
      this.addressBar.value = url;
      this.stopThrobber();
      this.iframe.srcdoc = `<html><body bgcolor="#c0c0c0" text="#000000">
        <br><br><center>
        <table border="2" cellpadding="20" bgcolor="#ffffff" width="400"><tr><td>
        <font face="MS Sans Serif, Arial" size="2">
        <p><b>&#9888; Unable to connect</b></p>
        <p>The page cannot be displayed because your computer is not connected to the Internet.</p>
        <p>To connect, double-click the <b>Dial-Up Networking</b> icon on your desktop.</p>
        <hr>
        <p><font size="1" color="#808080">WWWhippet! Dial-Up Networking</font></p>
        </font></td></tr></table>
        </center></body></html>`;
      this.setStatus('Error: Not connected to the Internet');
      if (this.titlebarText) this.titlebarText.textContent = 'Cannot find server - Internet Browser';
      return;
    }

    // Pass referrer context
    const referrerUrl = this.currentUrl;
    const refParams = new URLSearchParams();
    if (referrerUrl && referrerUrl !== url) {
      refParams.set('_ref', referrerUrl);
      if (linkText) refParams.set('_linktext', linkText);
    }

    this.currentUrl = url;
    this.addressBar.value = url;
    this.setStatus(`Contacting ${this.getDomain(url)}...`);
    this.startThrobber();
    AudioManager.playClick();

    if (addToHistory) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(url);
      this.historyIndex = this.history.length - 1;
    }

    this.updateNavButtons();
    this.isNavigating = true;

    // Close any existing progress stream
    if (this._progressSource) {
      this._progressSource.close();
      this._progressSource = null;
    }

    // Open SSE progress stream, then load the page when ready
    const progressUrl = '/api/progress?' + new URLSearchParams({
      url: url,
      ...Object.fromEntries(refParams),
    }).toString();

    const evtSource = new EventSource(progressUrl);
    this._progressSource = evtSource;

    evtSource.addEventListener('status', (e) => {
      this.setStatus(e.data);
    });

    evtSource.addEventListener('done', (e) => {
      evtSource.close();
      this._progressSource = null;
      // Simulate transfer delay — even cached pages take a moment on 56k
      this.setStatus(`Transferring data from ${this.getDomain(url)}...`);
      setTimeout(() => {
        const sep = wwwPath.includes('?') ? '&' : '?';
        const refStr = refParams.toString();
        this.iframe.src = wwwPath + (refStr ? sep + refStr : '');
      }, 800 + Math.random() * 400);
    });

    evtSource.addEventListener('error-msg', (e) => {
      evtSource.close();
      this._progressSource = null;
      this.setStatus('Error: ' + e.data);
      this.stopThrobber();
    });

    evtSource.onerror = () => {
      evtSource.close();
      this._progressSource = null;
      // Fallback: just load the page directly
      const sep = wwwPath.includes('?') ? '&' : '?';
      const refStr = refParams.toString();
      this.iframe.src = wwwPath + (refStr ? sep + refStr : '');
    };
  }

  normalizeUrl(url) {
    url = url.trim();
    if (url.startsWith('/www/')) url = 'http://' + url.substring(5);
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'http://' + url;
    return url;
  }

  urlToWwwPath(url) {
    return '/www/' + url.replace(/^https?:\/\//, '');
  }

  getDomain(url) {
    try {
      const match = url.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    } catch { return url; }
  }

  onIframeLoad() {
    this.stopThrobber();

    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;

      // Scale for 640x480
      if (iframeDoc.body) iframeDoc.body.style.zoom = '0.75';

      const title = iframeDoc.title;
      if (title) {
        this.titlebarText.textContent = title + ' - Internet Browser';
        // Update taskbar button text too
        const winId = this.el.closest('.browser-window')?.dataset.winId;
        if (winId) {
          const ws = WindowManager.getWindow(parseInt(winId));
          if (ws?.taskBtn) ws.taskBtn.textContent = '🌐 ' + title.substring(0, 20);
        }
      }

      const iframeSrc = this.iframe.src || this.iframe.contentWindow.location.href;
      if (iframeSrc && iframeSrc.includes('/www/')) {
        const match = iframeSrc.match(/\/www\/(.+)/);
        if (match) {
          let newUrl = 'http://' + match[1];
          // Strip referrer params from displayed URL
          newUrl = newUrl.replace(/[?&]_ref=[^&]*/, '').replace(/[?&]_linktext=[^&]*/, '').replace(/\?$/, '');
          if (newUrl !== this.currentUrl && !this.isNavigating) {
            this.currentUrl = newUrl;
            this.addressBar.value = newUrl;
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(newUrl);
            this.historyIndex = this.history.length - 1;
            this.updateNavButtons();
          }
        }
      }

      this.interceptIframeLinks(iframeDoc);
    } catch (e) {}

    this.isNavigating = false;
    this.setStatus('Document: Done');
  }

  interceptIframeLinks(doc) {
    doc.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
      e.preventDefault();
      const linkText = link.textContent.trim();
      this.navigateTo(this.resolveHref(href), true, linkText);
    });

    // Show link URL in status bar on hover
    doc.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          this.setStatus(this.resolveHref(href));
        }
      }
    });

    doc.addEventListener('mouseout', (e) => {
      const link = e.target.closest('a');
      if (link) {
        this.setStatus('Document: Done');
      }
    });

    doc.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      e.preventDefault();
      let action = form.getAttribute('action') || '';
      const method = (form.getAttribute('method') || 'GET').toUpperCase();
      if (method === 'GET') {
        const params = new URLSearchParams();
        for (const el of form.elements) {
          if (el.name && el.value !== undefined) {
            if (el.type === 'radio' && !el.checked) continue;
            if (el.type === 'checkbox' && !el.checked) continue;
            if (el.type === 'submit') continue;
            params.set(el.name, el.value);
          }
        }
        action = action + (action.includes('?') ? '&' : '?') + params.toString();
      }
      this.navigateTo(this.resolveHref(action));
    });
  }

  resolveHref(href) {
    if (href.startsWith('/www/')) return 'http://' + href.substring(5);
    if (href.startsWith('http://') || href.startsWith('https://')) return href;
    try {
      const base = this.currentUrl.endsWith('/') ? this.currentUrl : this.currentUrl.substring(0, this.currentUrl.lastIndexOf('/') + 1);
      return new URL(href, base).href;
    } catch { return href; }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.navigateTo(this.history[this.historyIndex], false);
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.navigateTo(this.history[this.historyIndex], false);
    }
  }

  reload() { this.navigateTo(this.currentUrl, false); }
  goHome() { this.navigateTo(this.HOME_URL); }

  updateNavButtons() {
    this.btnBack.disabled = this.historyIndex <= 0;
    this.btnForward.disabled = this.historyIndex >= this.history.length - 1;
  }

  setStatus(text) {
    if (this.statusText) this.statusText.textContent = text;
  }

  startThrobber() { this.throbber?.classList.add('loading'); }
  stopThrobber() { this.throbber?.classList.remove('loading'); }
}

// Legacy global reference for compatibility
const Browser = {
  init() {
    // No-op — windows are created via WindowManager now
  },
};
