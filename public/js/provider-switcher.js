// AI provider switcher
const ProviderSwitcher = {
  select: null,

  async init() {
    this.select = document.getElementById('providerSelect');

    // Load current provider from server
    try {
      const res = await fetch('/api/provider');
      const data = await res.json();
      this.select.value = data.current;
    } catch {}

    // Handle change
    this.select.addEventListener('change', async () => {
      const provider = this.select.value;
      try {
        await fetch('/api/provider', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider }),
        });
        // Reload the current page with new provider
        Browser.reload();
      } catch (err) {
        console.error('Failed to switch provider:', err);
      }
    });
  },
};
