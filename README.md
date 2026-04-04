# WWWhippet!

**An AI-powered time machine to the 1990s internet.**

Type any URL. Get a fully-generated, gloriously authentic mid-90s webpage — complete with `<marquee>` tags, visitor counters, "Under Construction" GIFs, and Comic Sans. Every page is unique, interconnected, and dripping with the unmistakable charm of the early web.

![HTML](https://img.shields.io/badge/HTML-tables_all_the_way_down-purple)
![Era](https://img.shields.io/badge/era-1996--1998-blue)
![Blink](https://img.shields.io/badge/%3Cblink%3E-yes-red)

## What is this?

WWWhippet simulates the entire experience of browsing the internet in the late '90s. It's not just a CSS skin or a retro theme — it's a **living, breathing fake internet** generated on the fly by AI.

- **A full desktop environment** — CRT monitor, scanlines, taskbar, Start button, draggable windows
- **Netscape Navigator** — address bar, throbber, the works
- **A search engine** — type a query, get a page of AI-generated 90s search results
- **Click any link** — every link leads to another freshly-generated page, building an entire interconnected web as you browse
- **Dial-up networking** — with authentic modem sounds (optional Ollama integration actually loads/unloads models on "connect" and "disconnect")
- **Page types** — personal homepages, fan sites, university pages, corporate sites, news portals — each with era-appropriate layouts, content, and personality
- **GIF Vault** — browse and search real animated GIFs from the 90s web
- **Settings panel** — swap AI providers on the fly

## The Experience

1. Double-click Netscape Navigator
2. Hear the modem screech (if you dare)
3. Type `www.anything-you-want.com` in the address bar
4. Watch the throbber spin as AI generates a pixel-perfect 90s webpage
5. Click links. Fall down rabbit holes. Discover someone's Buffy fan shrine. Read a university research page about Java applets. Visit a GeoCities neighbourhood.
6. Lose an hour. No regrets.

Every page is built with **real 90s HTML** — `<table>` layouts, `<font>` tags, `bgcolor` attributes, `<marquee>`, `<blink>`, nested tables within tables within tables. No CSS. No divs. Just like the creator of the original page intended.

## Quick Start

```bash
# Clone and install
git clone https://github.com/Robindfuller/snazzy-wwwhippet.git
cd snazzy-wwwhippet
npm install

# Configure your AI provider
cp .env.example .env   # then add your API key(s)

# Launch
npm start
```

Open `http://localhost:3000` and start browsing.

## AI Providers

WWWhippet supports multiple AI backends — switch between them from the system tray or settings panel:

| Provider | Model | Notes |
|----------|-------|-------|
| **Claude** | Anthropic API | Best quality 90s pages |
| **OpenAI** | GPT-4 | Great alternative |
| **Ollama** | Local models | Free, private, uses dial-up connect/disconnect to load/unload models |

## Running as a Service

```bash
# Install as a systemd service
sudo scripts/install-service.sh

# Remove the service
sudo scripts/uninstall-service.sh
```

## Project Structure

```
public/          # The "shell" — desktop, browser chrome, CRT effects
  css/           # Desktop, Netscape, CRT scanline styles
  js/            # Window manager, browser, dial-up, audio
server/          # The "internet" — AI generation engine
  prompts/       # Era-specific prompt templates (personal, fansite, corporate, etc.)
  providers/     # Claude, OpenAI, Ollama adapters
  www/           # Router, search engine, page generator, content classifier
scripts/         # systemd install/uninstall
```

## License

MIT
