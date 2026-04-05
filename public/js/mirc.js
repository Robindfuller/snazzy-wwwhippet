// ============================================================
// mIRC Simulator — 1999 warez/IRC scene
// ============================================================

// ---- Static data ----

const MIRC_CHANNELS = ['#warez', '#mp3z', '#moviez'];

const MIRC_CHANNEL_USERS = {
  '#warez': [
    { nick: 'Kane',        mode: 'op',  isBot: false },
    { nick: 'WaReZKiNg',  mode: 'op',  isBot: false },
    { nick: 'Phweak!',    mode: '',    isBot: false },
    { nick: 'Cr4ck3r',    mode: '',    isBot: false },
    { nick: 'ph33r_me',   mode: '',    isBot: false },
    { nick: 'eggnog123',  mode: '',    isBot: false },
    { nick: 'xdcc_bot',   mode: 'op',  isBot: true  },
    { nick: 'ReleaseBot', mode: 'op',  isBot: true  },
  ],
  '#mp3z': [
    { nick: 'Kane',        mode: 'op',  isBot: false },
    { nick: 'SonicRipper', mode: 'op', isBot: false },
    { nick: 'Phweak!',     mode: '',   isBot: false },
    { nick: 'eggnog123',   mode: '',   isBot: false },
    { nick: 'mp3_junkie',  mode: '',   isBot: false },
    { nick: 'NapsterDood', mode: '',   isBot: false },
    { nick: 'xdcc_bot2',  mode: 'op',  isBot: true  },
  ],
  '#moviez': [
    { nick: 'Kane',        mode: 'op',  isBot: false },
    { nick: 'DivXRulez',  mode: 'op',  isBot: false },
    { nick: 'Phweak!',    mode: '',    isBot: false },
    { nick: 'eggnog123',  mode: '',    isBot: false },
    { nick: 'VCDking',    mode: '',    isBot: false },
    { nick: 'CAMmaster',  mode: '',    isBot: false },
    { nick: 'xdcc_bot3',  mode: 'op',  isBot: true  },
  ],
};

// XDCC bot → files mapping
const XDCC_BOTS = {
  'xdcc_bot': {
    channel: '#warez',
    files: [
      { id: 1,  name: 'Counter.Strike.Beta.5.2.zip',         size: '45 MB',  bytes: 45  * 1024 * 1024, type: 'zip' },
      { id: 2,  name: 'Half.Life.Full.Retail.zip',           size: '540 MB', bytes: 540 * 1024 * 1024, type: 'zip' },
      { id: 3,  name: 'Photoshop.5.0.Full+Serial.zip',       size: '120 MB', bytes: 120 * 1024 * 1024, type: 'zip' },
      { id: 4,  name: 'WinRAR.2.90.Registered.zip',          size: '380 KB', bytes: 380 * 1024,         type: 'zip' },
      { id: 5,  name: 'Quake2.Full.zip',                     size: '622 MB', bytes: 622 * 1024 * 1024, type: 'zip' },
      { id: 6,  name: 'ICQ_99b.exe',                         size: '2.8 MB', bytes: 2.8 * 1024 * 1024, type: 'exe' },
      { id: 7,  name: 'WinAmp.2.92.exe',                     size: '1.4 MB', bytes: 1.4 * 1024 * 1024, type: 'exe' },
      { id: 8,  name: 'Diablo2.Beta.zip',                    size: '55 MB',  bytes: 55  * 1024 * 1024, type: 'zip' },
      { id: 9,  name: 'StarCraft.Brood.War.Full.zip',        size: '493 MB', bytes: 493 * 1024 * 1024, type: 'zip' },
      { id: 10, name: 'DirectX.7.0.Full.zip',                size: '34 MB',  bytes: 34  * 1024 * 1024, type: 'zip' },
    ],
  },
  'xdcc_bot2': {
    channel: '#mp3z',
    files: [
      { id: 1,  name: 'Nirvana-Nevermind-Full_Album.zip',          size: '38 MB',  bytes: 38  * 1024 * 1024, type: 'zip' },
      { id: 2,  name: 'Nirvana-Smells_Like_Teen_Spirit.mp3',       size: '4.2 MB', bytes: 4.2 * 1024 * 1024, type: 'mp3' },
      { id: 3,  name: 'Oasis-Wonderwall.mp3',                      size: '3.8 MB', bytes: 3.8 * 1024 * 1024, type: 'mp3' },
      { id: 4,  name: 'Spice_Girls-Wannabe.mp3',                   size: '3.5 MB', bytes: 3.5 * 1024 * 1024, type: 'mp3' },
      { id: 5,  name: 'Backstreet_Boys-I_Want_It_That_Way.mp3',    size: '4.1 MB', bytes: 4.1 * 1024 * 1024, type: 'mp3' },
      { id: 6,  name: 'Eminem-My_Name_Is.mp3',                     size: '3.9 MB', bytes: 3.9 * 1024 * 1024, type: 'mp3' },
      { id: 7,  name: 'TLC-Waterfalls.mp3',                        size: '4.0 MB', bytes: 4.0 * 1024 * 1024, type: 'mp3' },
      { id: 8,  name: 'Alanis_Morissette-Ironic.mp3',              size: '3.9 MB', bytes: 3.9 * 1024 * 1024, type: 'mp3' },
      { id: 9,  name: 'The_Prodigy-Firestarter.mp3',               size: '4.5 MB', bytes: 4.5 * 1024 * 1024, type: 'mp3' },
      { id: 10, name: 'Radiohead-Creep.mp3',                       size: '3.6 MB', bytes: 3.6 * 1024 * 1024, type: 'mp3' },
      { id: 11, name: 'Eminem-The_Slim_Shady_LP-Full_Album.zip',   size: '42 MB',  bytes: 42  * 1024 * 1024, type: 'zip' },
    ],
  },
  'xdcc_bot3': {
    channel: '#moviez',
    files: [
      { id: 1,  name: 'The.Matrix.1999.CAM.DivX.avi',               size: '701 MB', bytes: 701  * 1024 * 1024, type: 'avi' },
      { id: 2,  name: 'Star.Wars.Special.Edition.1997.CAM.DivX.avi',size: '698 MB', bytes: 698  * 1024 * 1024, type: 'avi' },
      { id: 3,  name: 'Titanic.1997.VCD.part1.mpg',                  size: '654 MB', bytes: 654  * 1024 * 1024, type: 'mpg' },
      { id: 4,  name: 'Fight.Club.1999.DVDRIP.DivX.avi',             size: '702 MB', bytes: 702  * 1024 * 1024, type: 'avi' },
      { id: 5,  name: 'American.Pie.1999.CAM.avi',                   size: '512 MB', bytes: 512  * 1024 * 1024, type: 'avi' },
      { id: 6,  name: 'The.Blair.Witch.Project.1999.CAM.avi',        size: '398 MB', bytes: 398  * 1024 * 1024, type: 'avi' },
      { id: 7,  name: 'Jurassic.Park.1993.VHSRip.DivX.avi',          size: '688 MB', bytes: 688  * 1024 * 1024, type: 'avi' },
      { id: 8,  name: 'Pulp.Fiction.1994.DivX.avi',                  size: '694 MB', bytes: 694  * 1024 * 1024, type: 'avi' },
      { id: 9,  name: 'Saving.Private.Ryan.1998.VCD.part1.mpg',      size: '654 MB', bytes: 654  * 1024 * 1024, type: 'mpg' },
    ],
  },
};

// Pre-loaded channel messages (displayed on join)
const MIRC_PRELOAD = {
  '#warez': [
    { type: 'server', text: '*** Now talking in #warez' },
    { type: 'server', text: '*** Topic is: | NO BEGGING | Ratio 1:3 enforced | Use GetRight | /msg xdcc_bot !list for files |' },
    { type: 'server', text: '*** Set by Kane on Thu Sep 16 22:14:31 1999' },
    { type: 'bot',    nick: 'xdcc_bot',   text: '[NEW] The.Matrix.1999.CAM.DivX.avi - 701 MB - /msg xdcc_bot !get 1', xdcc: { bot: 'xdcc_bot', id: 1 } },
    { type: 'bot',    nick: 'xdcc_bot',   text: '[NEW] Quake2.Full.zip - 622 MB - /msg xdcc_bot !get 5', xdcc: { bot: 'xdcc_bot', id: 5 } },
    { type: 'bot',    nick: 'ReleaseBot', text: '** RELEASE ** Counter.Strike.Beta.5.2 [WIN98] [45MB] - /msg xdcc_bot !get 1', xdcc: { bot: 'xdcc_bot', id: 1 } },
    { type: 'chat',   nick: 'eggnog123',  text: 'hey guys!! how do i see what files are available' },
    { type: 'chat',   nick: 'Kane',       text: 'read the topic' },
    { type: 'chat',   nick: 'Phweak!',    text: 'lmao dude its literally right there' },
    { type: 'chat',   nick: 'eggnog123',  text: 'oh! ok so i do /msg xdcc_bot !list?? is that right' },
    { type: 'chat',   nick: 'Kane',       text: '...' },
    { type: 'chat',   nick: 'Phweak!',    text: 'omg yes thats what it says haha' },
    { type: 'chat',   nick: 'eggnog123',  text: 'ok ok sorry!! doing it now!!' },
    { type: 'chat',   nick: 'Cr4ck3r',    text: 'photoshop 5 serial dropping tonight btw, keep an eye on releases' },
    { type: 'chat',   nick: 'Kane',       text: 'about time. the keygen has been broken for 2 weeks' },
    { type: 'chat',   nick: 'Phweak!',    text: 'yea Kane was getting rly pissed about that lol' },
    { type: 'chat',   nick: 'ph33r_me',   text: 'HOW LONG DID IT TAKE ON 56K???? mine keeps disconnecting from quake2' },
    { type: 'chat',   nick: 'Kane',       text: 'use getright' },
    { type: 'chat',   nick: 'eggnog123',  text: 'wait what is getright?? is that a download manager??' },
    { type: 'chat',   nick: 'Kane',       text: 'eggnog123 i swear to god' },
    { type: 'chat',   nick: 'Phweak!',    text: 'HAHAHAHA' },
    { type: 'chat',   nick: 'eggnog123',  text: 'sorry sorry!! ill google it!!' },
    { type: 'bot',    nick: 'xdcc_bot',   text: '[XDCC] Pack #5: 22 gets so far. [Quake2.Full.zip] [622 MB]', xdcc: { bot: 'xdcc_bot', id: 5 } },
    { type: 'chat',   nick: 'ph33r_me',   text: 'my mom picked up the phone and killed my 4 hour download aaaaaaaa' },
    { type: 'chat',   nick: 'Phweak!',    text: 'lmaooo tell ur mom getright resumes it automatically' },
  ],
  '#mp3z': [
    { type: 'server', text: '*** Now talking in #mp3z' },
    { type: 'server', text: '*** Topic is: | 128kbps minimum | No fake files | Use WinAmp 2.8+ | Share or get banned |' },
    { type: 'server', text: '*** Set by Kane on Fri Oct 01 19:55:12 1999' },
    { type: 'bot',    nick: 'xdcc_bot2',  text: '[MP3] Eminem-The_Slim_Shady_LP-Full_Album.zip - 42 MB - /msg xdcc_bot2 !get 11', xdcc: { bot: 'xdcc_bot2', id: 11 } },
    { type: 'bot',    nick: 'xdcc_bot2',  text: '[MP3] Nirvana-Nevermind-Full_Album.zip - 38 MB - /msg xdcc_bot2 !get 1', xdcc: { bot: 'xdcc_bot2', id: 1 } },
    { type: 'chat',   nick: 'eggnog123',  text: 'hey!! quick question is 128kbps good quality or bad quality' },
    { type: 'chat',   nick: 'Kane',       text: 'read the topic' },
    { type: 'chat',   nick: 'Phweak!',    text: 'hahaha topic says 128 minimum, so. figure it out' },
    { type: 'chat',   nick: 'eggnog123',  text: 'ohhh so its like the minimum!! got it!! thanks Kane ur the best' },
    { type: 'chat',   nick: 'Kane',       text: "don't" },
    { type: 'chat',   nick: 'SonicRipper', text: '128 minimum means 192 is ideal. anything less than 192 on headphones sounds like a tin can' },
    { type: 'chat',   nick: 'Phweak!',    text: 'Kane what bitrate do u encode at' },
    { type: 'chat',   nick: 'Kane',       text: '256 vbr. only option' },
    { type: 'chat',   nick: 'Phweak!',    text: 'omg thats so sick. that settles it 256 vbr' },
    { type: 'chat',   nick: 'mp3_junkie',  text: 'anyone have the full prodigy fat of the land?? cant find it on napster' },
    { type: 'chat',   nick: 'eggnog123',  text: 'wait what IS napster?? is that like a website' },
    { type: 'chat',   nick: 'Kane',       text: '...' },
    { type: 'chat',   nick: 'Phweak!',    text: 'LMAOOO eggnog are you serious right now' },
    { type: 'chat',   nick: 'eggnog123',  text: 'sorry sorry!! i just got the internet like 2 months ago haha' },
    { type: 'chat',   nick: 'Kane',       text: 'i am so close' },
  ],
  '#moviez': [
    { type: 'server', text: '*** Now talking in #moviez' },
    { type: 'server', text: '*** Topic is: | DivX 3.11alpha REQUIRED for AVIs | Name releases properly | No sub-600MB DVDRips |' },
    { type: 'server', text: '*** Set by Kane on Sat Oct 09 01:23:44 1999' },
    { type: 'bot',    nick: 'xdcc_bot3',  text: '[MOVIE] The.Matrix.1999.CAM.DivX.avi - 701 MB - /msg xdcc_bot3 !get 1', xdcc: { bot: 'xdcc_bot3', id: 1 } },
    { type: 'bot',    nick: 'xdcc_bot3',  text: '[MOVIE] Fight.Club.1999.DVDRIP.DivX.avi - 702 MB - /msg xdcc_bot3 !get 4', xdcc: { bot: 'xdcc_bot3', id: 4 } },
    { type: 'chat',   nick: 'eggnog123',  text: 'hey!! i downloaded the matrix but when i open it it says codec not found??' },
    { type: 'chat',   nick: 'Kane',       text: 'install divx 3.11. its in the topic.' },
    { type: 'chat',   nick: 'Phweak!',    text: 'omg it is literally in the topic lmao' },
    { type: 'chat',   nick: 'eggnog123',  text: 'ohh ok!! where do i get divx from??' },
    { type: 'chat',   nick: 'Kane',       text: 'divx.com' },
    { type: 'chat',   nick: 'eggnog123',  text: 'omg thanks!! also wait is pack 1 the matrix or is that a different one' },
    { type: 'chat',   nick: 'Kane',       text: 'eggnog123' },
    { type: 'chat',   nick: 'eggnog123',  text: 'sorry!! nvm i see it now!!' },
    { type: 'chat',   nick: 'Phweak!',    text: 'hahaha i counted that was like 4 questions in a row' },
    { type: 'chat',   nick: 'DivXRulez',  text: 'matrix encode is 2-pass 780kbps btw, basically dvd quality at 700mb' },
    { type: 'chat',   nick: 'Kane',       text: 'good encode. who did it' },
    { type: 'chat',   nick: 'DivXRulez',  text: 'me. pentium 3 450, took 6 hours' },
    { type: 'chat',   nick: 'Phweak!',    text: 'thats so sick, p3 450 is so fast' },
    { type: 'chat',   nick: 'VCDking',    text: 'still think vcd plays better on my standalone player tho no cap' },
    { type: 'chat',   nick: 'Kane',       text: 'buy a real dvd player' },
    { type: 'chat',   nick: 'eggnog123',  text: 'wait do i need a dvd player for this or just the codec?? asking for a friend haha' },
    { type: 'chat',   nick: 'Kane',       text: 'last warning' },
    { type: 'chat',   nick: 'Phweak!',    text: 'LMAOOOO' },
    { type: 'chat',   nick: 'eggnog123',  text: 'ok ok ok sorry!!' },
  ],
};

// Periodic bot ad messages
const MIRC_BOT_ADS = {
  '#warez': [
    { nick: 'xdcc_bot',   text: '[XDCC] Serving 10 packs. /msg xdcc_bot !list for full listing', xdcc: null },
    { nick: 'xdcc_bot',   text: '[NEW] StarCraft.Brood.War.Full.zip - 493 MB - /msg xdcc_bot !get 9', xdcc: { bot: 'xdcc_bot', id: 9 } },
    { nick: 'ReleaseBot', text: '** HOT ** Half.Life.Full.Retail.zip [540MB] fresh from the scene - /msg xdcc_bot !get 2', xdcc: { bot: 'xdcc_bot', id: 2 } },
    { nick: 'xdcc_bot',   text: '[XDCC] Photoshop.5.0.Full+Serial.zip [120MB] Pack #3 - 89 gets - /msg xdcc_bot !get 3', xdcc: { bot: 'xdcc_bot', id: 3 } },
  ],
  '#mp3z': [
    { nick: 'xdcc_bot2', text: '[XDCC] Serving 11 MP3 packs. /msg xdcc_bot2 !list', xdcc: null },
    { nick: 'xdcc_bot2', text: '[MP3] Backstreet_Boys-I_Want_It_That_Way.mp3 - 4.1 MB - /msg xdcc_bot2 !get 5', xdcc: { bot: 'xdcc_bot2', id: 5 } },
    { nick: 'xdcc_bot2', text: '[MP3] The_Prodigy-Firestarter.mp3 - 4.5 MB - /msg xdcc_bot2 !get 9', xdcc: { bot: 'xdcc_bot2', id: 9 } },
  ],
  '#moviez': [
    { nick: 'xdcc_bot3', text: '[XDCC] Serving 9 movie packs. /msg xdcc_bot3 !list', xdcc: null },
    { nick: 'xdcc_bot3', text: '[MOVIE] Saving.Private.Ryan.1998.VCD.part1.mpg - 654 MB - /msg xdcc_bot3 !get 9', xdcc: { bot: 'xdcc_bot3', id: 9 } },
    { nick: 'xdcc_bot3', text: '[MOVIE] Star.Wars.Special.Edition.1997.CAM.DivX.avi - 698 MB - /msg xdcc_bot3 !get 2', xdcc: { bot: 'xdcc_bot3', id: 2 } },
  ],
};

// Corruption errors by file type
const MIRC_CORRUPT_ERRORS = {
  avi: [
    'Cannot render file.\n\nThe filter graph manager cannot render the file:\nC:\\Downloads\\{filename}\n\nThe codec required to decompress this file is not installed on your computer.\n\nMissing codec: DIVX (DivX MPEG-4 Video Codec v3.11alpha)\n\nPlease visit www.divx.com to download and install the DivX codec.',
    'Windows Media Player cannot play the file.\n\nA codec is required to play this file. To determine if this codec is available to download from the Web, click Web Help.\n\nCodec: DIVX  —  DivX MPEG-4 Low-Motion\nFourCC: DIVX  Status: Not installed',
  ],
  mpg: [
    'Windows Media Player cannot play the file.\n\nThe codec needed to decompress the file C:\\Downloads\\{filename} is not installed on your computer.\n\nCodec: MPEG-1 Video Decoder\nNote: This VCD title may be split across multiple discs. Ensure you have obtained all parts before playing.',
    'Media Player Error\n\nCannot play back the video stream: no suitable decompressor found.\n\nVCD MPEG-1 decoder not found or not registered. The file may also be incomplete — downloaded 621 MB of expected 654 MB.',
  ],
  mp3: [
    'Windows Media Player cannot play the file.\n\nThe codec needed to decompress the audio format MP3 is not installed on your computer. Contact the content provider or the application vendor for a codec that supports this audio format.\n\nCodec: MPEG Layer-3 (MP3) Audio\nSample rate: 44100 Hz  Bitrate: 128 kbps\nStatus: Decompressor not found',
    "WinAmp v2.92 — in_mp3.dll Error\n\nUnable to open: C:\\Downloads\\{filename}\n\nThe MPEG Layer-3 input plugin encountered an error reading this file. The frame sync header is missing or corrupt. This usually means the file was not fully downloaded.\n\nExpected file size: 4,408,320 bytes\nActual file size:   1,835,008 bytes",
  ],
  zip: [
    'WinZip Self-Extractor\n\nCannot open archive: C:\\Downloads\\{filename}\n\nThe archive header is corrupt or the file is not a valid ZIP archive.\nCRC Error: CRC mismatch in {filename}\n  Expected: 4A 2C 1F 88\n  Found:    00 00 00 00\n\nThe file may have been incompletely downloaded. Please re-download.',
    'WinZip Error\n\nBad CRC  C:\\Downloads\\{filename}.\n\nWinZip cannot guarantee that the file is correct. There may be an error in the archive or the file may be incomplete.',
  ],
  exe: [
    'This program has performed an illegal operation and will be shut down.\n\nIf the problem persists, contact the program vendor.\n\nSETUP caused an invalid page fault in module KERNEL32.DLL\nat 0177:bff9db73.\n\nRegisters:\nEAX=00000000  CS=017f  EIP=bff9db73  EFLGS=00010246\nEBX=00000000  SS=0187  ESP=0063fa70  EBP=0063fb08',
    'InstallShield Wizard Error\n\nAn error occurred while extracting the installation files.\n\nError Code: 0x80004005 (Unspecified error)\nModule: C:\\WINDOWS\\SYSTEM\\MSVBVM60.DLL\n\nThe installation package may be corrupt or incomplete. Please re-download from the original source.',
  ],
};

// ============================================================
// MyComputer — virtual file explorer
// ============================================================

const MyComputer = {
  downloads: [], // { name, size, type, addedAt }
  winState: null,

  open() {
    // Only one instance
    if (this.winState && !this.winState.el.classList.contains('closed')) {
      WindowManager.focusWindow(this.winState.id);
      return;
    }

    this.winState = WindowManager.createGenericWindow(
      'My Computer',
      this._buildHtml(),
      { icon: '&#128187;', width: '560px', height: '380px' }
    );

    // Remove default overflow from browser-content
    const content = this.winState.el.querySelector('.browser-content');
    if (content) { content.style.overflow = 'hidden'; content.style.padding = '0'; }

    this._wireEvents();
  },

  addDownload(file) {
    this.downloads.push({ ...file, addedAt: Date.now() });
    this._saveToServer();
    if (this.winState && document.contains(this.winState.el)) {
      this._refresh();
    }
  },

  async loadFromServer() {
    try {
      const res = await fetch('/api/downloads');
      if (!res.ok) return;
      const list = await res.json();
      if (Array.isArray(list)) this.downloads = list;
    } catch (_) { /* non-fatal */ }
  },

  _saveToServer() {
    fetch('/api/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.downloads),
    }).catch(() => { /* non-fatal */ });
  },

  _buildHtml() {
    return `<div class="mycomp-app">
      <div class="mycomp-menubar">
        <span class="mycomp-menu-item">File</span>
        <span class="mycomp-menu-item">Edit</span>
        <span class="mycomp-menu-item">View</span>
        <span class="mycomp-menu-item">Help</span>
      </div>
      <div class="mycomp-toolbar">
        <button class="mycomp-tb-btn" title="Back" disabled>&#9664;</button>
        <button class="mycomp-tb-btn" title="Forward" disabled>&#9654;</button>
        <button class="mycomp-tb-btn" title="Up" disabled>&#8593;</button>
        <div style="width:1px;height:18px;background:#808080;border-right:1px solid #fff;margin:0 3px;"></div>
        <button class="mycomp-tb-btn" title="Views">&#9776;</button>
      </div>
      <div class="mycomp-address-bar">
        <span class="mycomp-address-label">Address</span>
        <input class="mycomp-address-input" value="C:\\Downloads" readonly>
      </div>
      <div class="mycomp-body">
        <div class="mycomp-tree">
          <div class="mycomp-tree-item mycomp-tree-root">&#128187; My Computer</div>
          <div class="mycomp-tree-item" style="padding-left:20px;">&#128190; 3&#189; Floppy (A:)</div>
          <div class="mycomp-tree-item" style="padding-left:20px;">&#128190; Hard Disk (C:)</div>
          <div class="mycomp-tree-item" style="padding-left:36px;" id="mycompTreeDownloads">&#128193; Downloads</div>
          <div class="mycomp-tree-item" style="padding-left:20px;">&#128191; CD-ROM (D:)</div>
        </div>
        <div class="mycomp-files" id="mycompFiles">
          <div class="mycomp-files-header">
            <span>Name</span><span>Size</span><span>Type</span><span>Modified</span>
          </div>
          ${this._buildFileList()}
        </div>
      </div>
      <div class="mycomp-statusbar">
        <span class="mycomp-status-cell" id="mycompStatusCount">${this.downloads.length} object(s)</span>
        <span class="mycomp-status-cell" id="mycompStatusSize">${this._totalSize()}</span>
      </div>
    </div>`;
  },

  _buildFileList() {
    if (this.downloads.length === 0) {
      return '<div class="mycomp-empty">This folder is empty.</div>';
    }
    return this.downloads.map(f => {
      const icon = this._iconFor(f.type);
      const typeLabel = this._typeLabel(f.type);
      const date = new Date(f.addedAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
      return `<div class="mycomp-file-row" data-filename="${f.name}" data-type="${f.type}">
        <div class="mycomp-file-name">
          <span class="mycomp-file-icon">${icon}</span>
          <span>${f.name}</span>
        </div>
        <span>${f.size}</span>
        <span>${typeLabel}</span>
        <span>${date}</span>
      </div>`;
    }).join('');
  },

  _iconFor(type) {
    const icons = { avi: '🎬', mpg: '🎬', mp3: '🎵', mid: '🎹', midi: '🎹', zip: '📦', exe: '⚙️', rar: '📦' };
    return icons[type] || '📄';
  },

  _typeLabel(type) {
    const labels = { avi: 'AVI File', mpg: 'MPEG Video', mp3: 'MP3 Audio', mid: 'MIDI Sequence', midi: 'MIDI Sequence', zip: 'WinZip Archive', exe: 'Application', rar: 'WinRAR Archive' };
    return labels[type] || 'File';
  },

  _totalSize() {
    if (this.downloads.length === 0) return '';
    return this.downloads.reduce((sum, f) => sum + f.bytes, 0) > 1024 * 1024 * 1024
      ? (this.downloads.reduce((sum, f) => sum + f.bytes, 0) / (1024 * 1024 * 1024)).toFixed(1) + ' GB total'
      : (this.downloads.reduce((sum, f) => sum + f.bytes, 0) / (1024 * 1024)).toFixed(0) + ' MB total';
  },

  _refresh() {
    const filesEl = this.winState.el.querySelector('#mycompFiles');
    const statusCount = this.winState.el.querySelector('#mycompStatusCount');
    const statusSize = this.winState.el.querySelector('#mycompStatusSize');
    if (!filesEl) return;

    filesEl.innerHTML = `<div class="mycomp-files-header">
      <span>Name</span><span>Size</span><span>Type</span><span>Modified</span>
    </div>` + this._buildFileList();
    if (statusCount) statusCount.textContent = `${this.downloads.length} object(s)`;
    if (statusSize) statusSize.textContent = this._totalSize();

    this._wireFileClicks();
  },

  _wireEvents() {
    this._wireFileClicks();
    const treeDownloads = this.winState.el.querySelector('#mycompTreeDownloads');
    if (treeDownloads) {
      treeDownloads.addEventListener('click', () => this._refresh());
    }
  },

  _wireFileClicks() {
    const filesEl = this.winState.el.querySelector('#mycompFiles');
    if (!filesEl) return;
    filesEl.querySelectorAll('.mycomp-file-row').forEach(row => {
      row.addEventListener('dblclick', () => {
        const filename = row.dataset.filename;
        const type = row.dataset.type;
        if (type === 'mid' || type === 'midi') {
          // Find the download record to get the MIDI URL
          const dl = this.downloads.find(d => d.name === filename);
          if (dl && dl.midiUrl) {
            MediaPlayer.open(filename, dl.midiUrl, dl.midiTitle);
          } else {
            this._showCorruptError(filename, type);
          }
        } else {
          this._showCorruptError(filename, type);
        }
      });
    });
  },

  _showCorruptError(filename, type) {
    const errors = MIRC_CORRUPT_ERRORS[type] || MIRC_CORRUPT_ERRORS['exe'];
    const template = errors[Math.floor(Math.random() * errors.length)];
    const msg = template.replace('{filename}', filename);

    const win95Icon = type === 'exe' ? '💣' : (type === 'mp3' || type === 'avi' || type === 'mpg' ? '🎬' : '💥');
    const title = type === 'mp3' ? 'WinAmp Error' :
                  (type === 'avi' || type === 'mpg') ? 'Windows Media Player Error' :
                  (type === 'exe') ? 'Illegal Operation' : 'WinZip Error';

    const ws = WindowManager.createGenericWindow(
      title,
      `<div class="win95-error-body">
        <div class="win95-error-content">
          <div class="win95-error-icon">${win95Icon}</div>
          <div class="win95-error-text" style="white-space:pre-wrap;">${msg}</div>
        </div>
        <div class="win95-error-btns">
          <button class="win95-error-btn" id="errOk">OK</button>
          ${type === 'exe' ? '<button class="win95-error-btn" id="errDetails">Details...</button>' : ''}
        </div>
      </div>`,
      { icon: '&#9888;', width: '380px', height: 'auto' }
    );

    const okBtn = ws.el.querySelector('#errOk');
    if (okBtn) okBtn.addEventListener('click', () => WindowManager.closeWindow(ws.id));

    const detBtn = ws.el.querySelector('#errDetails');
    if (detBtn) {
      detBtn.addEventListener('click', () => {
        detBtn.closest('.win95-error-btns').insertAdjacentHTML('beforebegin',
          `<div style="border:2px inset #c0c0c0;background:#fff;padding:4px;margin-top:8px;font-family:Courier New,monospace;font-size:9px;height:60px;overflow:auto;">
            DIVX.EXE caused a fault in module KERNEL32.DLL<br>
            EAX=00000000 CS=017f EIP=bff9db73 EFLGS=00010246<br>
            EBX=00000000 SS=0187 ESP=0063fa70 EBP=0063fb08<br>
            ECX=81e34a70 DS=0187 ESI=81e30030 FS=2d6f<br>
            EDX=81e34a78 ES=0187 EDI=00000000 GS=0000<br>
            Bytes at CS:EIP: 8b 44 24 04 8b 4c 24 08 89 08 c2 08 00
          </div>`
        );
        detBtn.disabled = true;
      });
    }
  },
};

// ============================================================
// Windows Media Player — retro WMP 6.4 style MIDI player
// ============================================================

const MediaPlayer = {
  _currentWin: null,
  _audioCtx: null,
  _isPlaying: false,
  _tickTimer: null,
  _volume: 0.7,

  async open(filename, midiUrl, title) {
    if (this._currentWin && document.contains(this._currentWin.el)) {
      this.stop();
      WindowManager.closeWindow(this._currentWin.id);
    }

    const displayTitle = title || filename.replace(/\.midi?$/i, '');

    this._currentWin = WindowManager.createGenericWindow(
      'Windows Media Player',
      this._buildHtml(displayTitle, filename),
      { icon: '&#9654;', width: '340px', height: '200px' }
    );

    const contentEl = this._currentWin.el.querySelector('.browser-content');
    if (contentEl) { contentEl.style.padding = '0'; contentEl.style.overflow = 'hidden'; }

    this._wireControls(midiUrl, displayTitle);
    this._loadAndPlay(midiUrl, displayTitle);
  },

  _buildHtml(title, filename) {
    return `<div class="wmp-body">
      <div class="wmp-menubar">
        <span class="wmp-menu-item">File</span>
        <span class="wmp-menu-item">View</span>
        <span class="wmp-menu-item">Play</span>
        <span class="wmp-menu-item">Help</span>
      </div>
      <div class="wmp-display">
        <div class="wmp-display-title">${title}</div>
        <div class="wmp-display-status">Loading...</div>
      </div>
      <div class="wmp-seekbar">
        <div class="wmp-seek-track">
          <div class="wmp-seek-fill"></div>
        </div>
        <div class="wmp-time">
          <span class="wmp-time-current">0:00</span>
          <span class="wmp-time-sep">/</span>
          <span class="wmp-time-total">0:00</span>
        </div>
      </div>
      <div class="wmp-controls">
        <button class="wmp-ctrl-btn wmp-btn-stop" title="Stop">&#9632;</button>
        <button class="wmp-ctrl-btn wmp-btn-play" title="Play">&#9654;</button>
        <div class="wmp-vol">
          <span class="wmp-vol-icon">&#128264;</span>
          <input type="range" class="wmp-vol-slider" min="0" max="100" value="70">
        </div>
      </div>
      <div class="wmp-statusbar">
        <span class="wmp-status-text">${filename}</span>
        <span class="wmp-status-format">MIDI</span>
      </div>
    </div>`;
  },

  _wireControls(midiUrl, title) {
    const el = this._currentWin.el;
    const playBtn = el.querySelector('.wmp-btn-play');
    const stopBtn = el.querySelector('.wmp-btn-stop');
    const volSlider = el.querySelector('.wmp-vol-slider');

    playBtn.addEventListener('click', () => {
      if (this._isPlaying) {
        this.pause();
        playBtn.textContent = '\u25B6';
      } else if (this._parsedNotes) {
        this.resume();
        playBtn.textContent = '\u275A\u275A';
      } else {
        this._loadAndPlay(midiUrl, title);
      }
    });

    stopBtn.addEventListener('click', () => {
      this.stop();
      playBtn.textContent = '\u25B6';
    });

    if (volSlider) {
      volSlider.addEventListener('input', () => {
        this._volume = volSlider.value / 100;
        if (this._gainNode) this._gainNode.gain.value = this._volume;
      });
    }

    el.querySelector('.win-close')?.addEventListener('click', () => this.stop());
  },

  async _loadAndPlay(midiUrl, title) {
    const el = this._currentWin?.el;
    if (!el) return;
    const statusEl = el.querySelector('.wmp-display-status');
    const playBtn = el.querySelector('.wmp-btn-play');

    try {
      if (statusEl) statusEl.textContent = 'Buffering...';

      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this._audioCtx.state === 'suspended') await this._audioCtx.resume();

      this._gainNode = this._audioCtx.createGain();
      this._gainNode.gain.value = this._volume;
      this._gainNode.connect(this._audioCtx.destination);

      if (statusEl) statusEl.textContent = 'Loading MIDI...';
      const resp = await fetch(midiUrl);
      if (!resp.ok) throw new Error('Failed to fetch MIDI');
      const arrayBuf = await resp.arrayBuffer();
      const midiData = new Uint8Array(arrayBuf);

      // Parse MIDI into note list
      this._parsedNotes = this._parseMidi(midiData);
      if (!this._parsedNotes || this._parsedNotes.length === 0) {
        throw new Error('No notes found in MIDI');
      }

      // Sort by time
      this._parsedNotes.sort((a, b) => a.time - b.time);
      this._totalDuration = this._parsedNotes[this._parsedNotes.length - 1].time + 0.5;
      this._noteIndex = 0;
      this._playbackStart = this._audioCtx.currentTime;
      this._pauseOffset = 0;
      this._isPlaying = true;

      if (playBtn) playBtn.textContent = '\u275A\u275A';
      if (statusEl) statusEl.textContent = 'Playing';

      const totalEl = el.querySelector('.wmp-time-total');
      if (totalEl) totalEl.textContent = this._formatTime(this._totalDuration);

      // Start the rolling scheduler
      this._startScheduler();
    } catch (err) {
      console.error('MediaPlayer error:', err);
      if (statusEl) statusEl.textContent = 'Error: ' + err.message;
    }
  },

  _startScheduler() {
    // Schedule notes in small batches, look 0.5s ahead
    const LOOK_AHEAD = 0.5;

    const tick = () => {
      if (!this._isPlaying) return;

      const ctx = this._audioCtx;
      const elapsed = ctx.currentTime - this._playbackStart + this._pauseOffset;

      // Schedule notes within the look-ahead window
      while (this._noteIndex < this._parsedNotes.length) {
        const note = this._parsedNotes[this._noteIndex];
        if (note.time > elapsed + LOOK_AHEAD) break;

        const playAt = this._playbackStart - this._pauseOffset + note.time;
        if (playAt > ctx.currentTime - 0.05) {
          this._playNote(note, playAt);
        }
        this._noteIndex++;
      }

      // Update UI
      const progress = Math.min(1, elapsed / this._totalDuration);
      const seekFill = this._currentWin?.el?.querySelector('.wmp-seek-fill');
      if (seekFill) seekFill.style.width = (progress * 100) + '%';
      const timeEl = this._currentWin?.el?.querySelector('.wmp-time-current');
      if (timeEl) timeEl.textContent = this._formatTime(elapsed);

      // Check if done
      if (elapsed >= this._totalDuration + 1) {
        this._isPlaying = false;
        const playBtn = this._currentWin?.el?.querySelector('.wmp-btn-play');
        if (playBtn) playBtn.textContent = '\u25B6';
        const statusEl = this._currentWin?.el?.querySelector('.wmp-display-status');
        if (statusEl) statusEl.textContent = 'Stopped';
        return;
      }

      this._tickTimer = setTimeout(tick, 50);
    };
    tick();
  },

  _playNote(note, time) {
    const ctx = this._audioCtx;
    const freq = 440 * Math.pow(2, (note.note - 69) / 12);
    const vel = note.velocity / 127;
    const dur = note.duration || 0.15;

    // Skip percussion channel (10) for cleaner sound
    if (note.channel === 9) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vel * 0.12, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this._gainNode);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  },

  _parseMidi(data) {
    let pos = 0;
    const view = new DataView(data.buffer);

    function readStr(n) { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(data[pos++]); return s; }
    function read16() { const v = view.getUint16(pos); pos += 2; return v; }
    function read32() { const v = view.getUint32(pos); pos += 4; return v; }
    function readVarLen() {
      let r = 0, b;
      do { b = data[pos++]; r = (r << 7) | (b & 0x7f); } while (b & 0x80);
      return r;
    }

    if (readStr(4) !== 'MThd') return null;
    read32();
    const format = read16();
    const numTracks = read16();
    const ticksPerBeat = read16();

    // Collect all note events with absolute times across all tracks
    const allNotes = [];
    // Track tempo changes globally (from track 0 in format 1)
    const tempoMap = [{ tick: 0, tempo: 500000 }];

    for (let t = 0; t < numTracks; t++) {
      if (pos >= data.length) break;
      if (readStr(4) !== 'MTrk') { pos += read32(); continue; }
      const trackLen = read32();
      const trackEnd = pos + trackLen;
      let tick = 0;
      let runningStatus = 0;
      const noteOns = {}; // track active notes for duration calc

      while (pos < trackEnd && pos < data.length) {
        const deltaTime = readVarLen();
        tick += deltaTime;
        let statusByte = data[pos];

        if (statusByte < 0x80) {
          statusByte = runningStatus;
        } else {
          pos++;
          if (statusByte < 0xf0) runningStatus = statusByte;
        }

        const eventType = statusByte >> 4;
        const channel = statusByte & 0x0f;

        if (statusByte === 0xff) {
          const metaType = data[pos++];
          const metaLen = readVarLen();
          if (metaType === 0x51 && metaLen === 3) {
            const usPerBeat = (data[pos] << 16) | (data[pos + 1] << 8) | data[pos + 2];
            tempoMap.push({ tick, tempo: usPerBeat });
          }
          pos += metaLen;
        } else if (statusByte === 0xf0 || statusByte === 0xf7) {
          pos += readVarLen();
        } else if (eventType === 0x9) {
          const noteNum = data[pos++];
          const velocity = data[pos++];
          if (velocity > 0) {
            const key = `${channel}-${noteNum}`;
            noteOns[key] = { tick, noteNum, velocity, channel };
          } else {
            // Note on with vel 0 = note off
            const key = `${channel}-${noteNum}`;
            if (noteOns[key]) {
              noteOns[key].offTick = tick;
              allNotes.push({ ...noteOns[key] });
              delete noteOns[key];
            }
          }
        } else if (eventType === 0x8) {
          const noteNum = data[pos++];
          data[pos++]; // velocity (ignored for off)
          const key = `${channel}-${noteNum}`;
          if (noteOns[key]) {
            noteOns[key].offTick = tick;
            allNotes.push({ ...noteOns[key] });
            delete noteOns[key];
          }
        } else if (eventType === 0xa || eventType === 0xb || eventType === 0xe) {
          pos += 2;
        } else if (eventType === 0xc || eventType === 0xd) {
          pos += 1;
        } else {
          break;
        }
      }
      // Flush any remaining note-ons (give them a default duration)
      for (const key of Object.keys(noteOns)) {
        noteOns[key].offTick = noteOns[key].tick + ticksPerBeat;
        allNotes.push({ ...noteOns[key] });
      }
      pos = trackEnd;
    }

    // Sort tempo map
    tempoMap.sort((a, b) => a.tick - b.tick);

    // Convert ticks to seconds using tempo map
    function tickToSeconds(tick) {
      let seconds = 0;
      let prevTick = 0;
      let tempo = 500000;
      for (const tc of tempoMap) {
        if (tc.tick >= tick) break;
        seconds += ((Math.min(tc.tick, tick) - prevTick) / ticksPerBeat) * (tempo / 1000000);
        prevTick = tc.tick;
        tempo = tc.tempo;
      }
      seconds += ((tick - prevTick) / ticksPerBeat) * (tempo / 1000000);
      return seconds;
    }

    return allNotes.map(n => ({
      time: tickToSeconds(n.tick),
      duration: Math.min(2, Math.max(0.05, tickToSeconds(n.offTick || n.tick + ticksPerBeat) - tickToSeconds(n.tick))),
      note: n.noteNum,
      velocity: n.velocity,
      channel: n.channel,
    }));
  },

  _formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  pause() {
    this._isPlaying = false;
    this._pauseOffset = this._audioCtx.currentTime - this._playbackStart + this._pauseOffset;
    if (this._tickTimer) clearTimeout(this._tickTimer);
    if (this._audioCtx) this._audioCtx.suspend();
    const statusEl = this._currentWin?.el?.querySelector('.wmp-display-status');
    if (statusEl) statusEl.textContent = 'Paused';
  },

  resume() {
    if (this._audioCtx) this._audioCtx.resume();
    this._playbackStart = this._audioCtx.currentTime;
    // Rewind note index to current position
    const elapsed = this._pauseOffset;
    this._noteIndex = 0;
    while (this._noteIndex < this._parsedNotes.length && this._parsedNotes[this._noteIndex].time < elapsed) {
      this._noteIndex++;
    }
    this._isPlaying = true;
    this._startScheduler();
    const statusEl = this._currentWin?.el?.querySelector('.wmp-display-status');
    if (statusEl) statusEl.textContent = 'Playing';
    const playBtn = this._currentWin?.el?.querySelector('.wmp-btn-play');
    if (playBtn) playBtn.textContent = '\u275A\u275A';
  },

  stop() {
    this._isPlaying = false;
    if (this._tickTimer) clearTimeout(this._tickTimer);
    this._parsedNotes = null;
    this._noteIndex = 0;
    this._pauseOffset = 0;

    const seekFill = this._currentWin?.el?.querySelector('.wmp-seek-fill');
    if (seekFill) seekFill.style.width = '0%';
    const timeEl = this._currentWin?.el?.querySelector('.wmp-time-current');
    if (timeEl) timeEl.textContent = '0:00';
    const statusEl = this._currentWin?.el?.querySelector('.wmp-display-status');
    if (statusEl) statusEl.textContent = 'Stopped';
  },
};

// ============================================================
// MircClient — main mIRC simulator
// ============================================================

const MircClient = {
  winState: null,
  currentChannel: '#warez',
  myNick: 'user_' + Math.floor(Math.random() * 8999 + 1000),

  // Per-channel chat history (for AI context)
  history: { '#warez': [], '#mp3z': [], '#moviez': [] },

  // Per-channel unread counts
  unread: { '#warez': 0, '#mp3z': 0, '#moviez': 0 },

  // Bot ad timer
  _adTimer: null,
  _aiCooldown: false,

  open() {
    // Singleton — reuse if open
    if (this.winState && document.contains(this.winState.el)) {
      WindowManager.focusWindow(this.winState.id);
      return;
    }

    this.winState = WindowManager.createGenericWindow(
      'mIRC - [irc.dal.net] - #warez',
      this._buildHtml(),
      { icon: '&#9889;', width: 'calc(100% - 100px)', height: 'calc(100% - 50px)' }
    );

    // Override content area overflow so mIRC manages its own scrolling
    const contentEl = this.winState.el.querySelector('.browser-content');
    if (contentEl) { contentEl.style.overflow = 'hidden'; contentEl.style.padding = '0'; }

    this._wireEvents();
    this._loadPreload('#warez');
    this._updateTitle();
    this._renderUserlist();
    this._renderTabs();

    // Start periodic bot ads
    this._adTimer = setInterval(() => this._postBotAd(), 55000 + Math.random() * 30000);

    // Watch for window close to clean up timer
    const closeBtn = this.winState.el.querySelector('.titlebar-btn.close');
    if (closeBtn) {
      const origClick = closeBtn.onclick;
      closeBtn.addEventListener('click', () => {
        clearInterval(this._adTimer);
        this._adTimer = null;
      });
    }
  },

  _buildHtml() {
    return `<div class="mirc-app" id="mircApp">
      <div class="mirc-menubar">
        <span class="mirc-menu-item">File</span>
        <span class="mirc-menu-item">Edit</span>
        <span class="mirc-menu-item">View</span>
        <span class="mirc-menu-item">mIRC</span>
        <span class="mirc-menu-item">Favorites</span>
        <span class="mirc-menu-item">Tools</span>
        <span class="mirc-menu-item">Window</span>
        <span class="mirc-menu-item">Help</span>
      </div>
      <div class="mirc-toolbar">
        <button class="mirc-tb-btn" title="Connect">&#128225;</button>
        <button class="mirc-tb-btn" title="Options">&#9881;</button>
        <div class="mirc-tb-sep"></div>
        <button class="mirc-tb-btn" title="Channel List">&#9776;</button>
        <button class="mirc-tb-btn" title="Query">&#128172;</button>
        <div class="mirc-tb-sep"></div>
        <span class="mirc-server-label">irc.dal.net (lag: 89ms)</span>
      </div>
      <div class="mirc-main">
        <div class="mirc-chat-panel">
          <div class="mirc-chat-header" id="mircChatHeader">#warez — 2154 users — No begging, use GetRight</div>
          <div class="mirc-messages" id="mircMessages"></div>
        </div>
        <div class="mirc-userlist">
          <div class="mirc-userlist-header" id="mircUserlistHeader">Users</div>
          <div class="mirc-userlist-body" id="mircUserlistBody"></div>
        </div>
      </div>
      <div class="mirc-bottom-bar">
        <div class="mirc-channel-tabs" id="mircTabs"></div>
        <div class="mirc-input-row">
          <span class="mirc-input-prefix" id="mircInputPrefix">#warez&gt;</span>
          <input class="mirc-input" id="mircInput" type="text" spellcheck="false" placeholder="Type a message or /command..." autocomplete="off">
          <button class="mirc-send-btn" id="mircSendBtn">Send</button>
        </div>
      </div>
      <div class="mirc-statusbar">
        <span class="mirc-status-cell">irc.dal.net</span>
        <span class="mirc-status-cell" id="mircStatusChannel">#warez</span>
        <span class="mirc-status-cell" id="mircStatusUsers">2154 users</span>
        <span class="mirc-status-cell">lag: 89ms</span>
      </div>
    </div>`;
  },

  _wireEvents() {
    const input = this._el('mircInput');
    const sendBtn = this._el('mircSendBtn');
    if (!input || !sendBtn) return;

    sendBtn.addEventListener('click', () => this._handleSend());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this._handleSend(); }
    });
    // Focus input on window click
    this.winState.el.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) input.focus();
    });

    // File menu dropdown
    const menubar = this.winState.el.querySelector('.mirc-menubar');
    if (menubar) {
      const fileItem = menubar.querySelector('.mirc-menu-item');
      if (fileItem) {
        fileItem.addEventListener('click', (e) => {
          e.stopPropagation();
          const existing = menubar.querySelector('.mirc-file-dropdown');
          if (existing) { existing.remove(); fileItem.classList.remove('open'); return; }

          fileItem.classList.add('open');
          const drop = document.createElement('div');
          drop.className = 'mirc-file-dropdown';
          drop.innerHTML = `
            <div class="mirc-dropdown-item" id="mircMenuDisconnect">Disconnect</div>
            <div class="mirc-dropdown-sep"></div>
            <div class="mirc-dropdown-item" id="mircMenuClose">Close</div>
          `;
          menubar.appendChild(drop);

          drop.querySelector('#mircMenuClose').addEventListener('click', () => {
            clearInterval(this._adTimer);
            this._adTimer = null;
            WindowManager.closeWindow(this.winState.id);
          });
          drop.querySelector('#mircMenuDisconnect').addEventListener('click', () => {
            drop.remove(); fileItem.classList.remove('open');
            this._addMsg(this.currentChannel, { type: 'server', text: '*** Disconnected from irc.dal.net (Connection reset by peer)' });
          });

          // Close dropdown on outside click
          const dismiss = (ev) => {
            if (!drop.contains(ev.target) && ev.target !== fileItem) {
              drop.remove(); fileItem.classList.remove('open');
              document.removeEventListener('click', dismiss);
            }
          };
          setTimeout(() => document.addEventListener('click', dismiss), 0);
        });
      }
    }
  },

  _el(id) {
    return this.winState ? this.winState.el.querySelector('#' + id) : null;
  },

  _handleSend() {
    const input = this._el('mircInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    if (text.startsWith('/')) {
      this._handleCommand(text);
    } else {
      this._postUserMessage(text);
    }
  },

  _handleCommand(text) {
    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === '/join' && parts[1]) {
      const ch = parts[1].startsWith('#') ? parts[1] : '#' + parts[1];
      if (MIRC_CHANNELS.includes(ch)) {
        this._switchChannel(ch);
      } else {
        this._addMsg(this.currentChannel, { type: 'error', text: `*** Cannot join ${ch}: Channel not found on this server` });
      }
    } else if (cmd === '/msg' && parts[1] && parts[2]) {
      const botNick = parts[1];
      const botCmd = parts[2].toLowerCase();
      const arg = parts[3];
      this._handleBotMsg(botNick, botCmd, arg);
    } else if (cmd === '/nick' && parts[1]) {
      const oldNick = this.myNick;
      this.myNick = parts[1];
      this._addMsg(this.currentChannel, { type: 'server', text: `*** ${oldNick} is now known as ${this.myNick}` });
    } else if (cmd === '/me' && parts.length > 1) {
      const action = parts.slice(1).join(' ');
      this._addMsg(this.currentChannel, { type: 'action', nick: this.myNick, text: `* ${this.myNick} ${action}` });
    } else if (cmd === '/list') {
      this._addMsg(this.currentChannel, { type: 'notice', text: '*** Channel listing: #warez (2154), #mp3z (892), #moviez (1437)' });
    } else if (cmd === '/help') {
      this._addMsg(this.currentChannel, { type: 'notice', text: '*** Commands: /join #channel | /msg bot !list | /msg bot !get N | /nick name | /me action' });
    } else {
      this._addMsg(this.currentChannel, { type: 'error', text: `*** Unknown command: ${cmd}` });
    }
  },

  _handleBotMsg(botNick, botCmd, arg) {
    // Find bot
    const bot = XDCC_BOTS[botNick];
    if (!bot) {
      this._addMsg(this.currentChannel, { type: 'notice', text: `*** ${botNick} is not online` });
      return;
    }

    if (botCmd === '!list') {
      // Show file list as private notice
      this._addMsg(this.currentChannel, { type: 'notice', text: `*** /msg from ${botNick}: Pack listing:` });
      bot.files.forEach(f => {
        this._addMsg(this.currentChannel, { type: 'notice', text: `  #${f.id}  [${f.size.padEnd(8)}]  ${f.name}` });
      });
      this._addMsg(this.currentChannel, { type: 'notice', text: `*** End of pack list` });
    } else if (botCmd === '!get' && arg) {
      const id = parseInt(arg);
      const file = bot.files.find(f => f.id === id);
      if (file) {
        this._startDcc(botNick, file);
      } else {
        this._addMsg(this.currentChannel, { type: 'notice', text: `*** ${botNick}: Pack #${id} not found. /msg ${botNick} !list to see available packs.` });
      }
    } else {
      this._addMsg(this.currentChannel, { type: 'notice', text: `*** ${botNick}: Unknown command. Try !list or !get <packnum>` });
    }
  },

  _postUserMessage(text) {
    const msg = { type: 'self', nick: this.myNick, text };
    this._addMsg(this.currentChannel, msg);
    this.history[this.currentChannel].push({ nick: this.myNick, text });

    // Trigger AI response after a short delay
    if (!this._aiCooldown) {
      this._aiCooldown = true;
      const channel = this.currentChannel;
      const delay = 1200 + Math.random() * 2000;
      setTimeout(() => this._fetchAiResponse(channel, text), delay);
    }
  },

  async _fetchAiResponse(channel, userMessage) {
    try {
      const resp = await fetch('/api/mirc/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          message: userMessage,
          history: this.history[channel].slice(-10),
          userNick: this.myNick,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.responses && Array.isArray(data.responses)) {
        let delay = 0;
        data.responses.forEach(r => {
          delay += 500 + Math.random() * 900;
          setTimeout(() => {
            if (!this.winState || !document.contains(this.winState.el)) return;

            // Handle kick action from Kane
            if (r.kick) {
              const target = r.kick;
              // Show the kick reason message first
              this._addMsg(channel, { type: 'chat', nick: r.nick, text: r.message });
              this.history[channel].push({ nick: r.nick, text: r.message });
              // Then show the kick server message
              setTimeout(() => {
                if (!this.winState || !document.contains(this.winState.el)) return;
                this._addMsg(channel, { type: 'join', text: `*** Kane has kicked ${target} from ${channel} (${r.message})` });
                // If eggnog was kicked, have them rejoin after 8-15 seconds
                if (target === 'eggnog123') {
                  setTimeout(() => {
                    if (!this.winState || !document.contains(this.winState.el)) return;
                    this._addMsg(channel, { type: 'join', text: '*** eggnog123 has joined ' + channel });
                    setTimeout(() => {
                      if (!this.winState || !document.contains(this.winState.el)) return;
                      this._addMsg(channel, { type: 'chat', nick: 'eggnog123', text: 'sorry sorry!! im back!! i wont do it again!!' });
                      this.history[channel].push({ nick: 'eggnog123', text: 'sorry sorry!! im back!! i wont do it again!!' });
                    }, 2000);
                  }, 8000 + Math.random() * 7000);
                }
              }, 300);
              return;
            }

            this._addMsg(channel, { type: 'chat', nick: r.nick, text: r.message });
            this.history[channel].push({ nick: r.nick, text: r.message });
          }, delay);
        });
      }
    } catch (err) {
      // Silently fail — AI is optional
    } finally {
      setTimeout(() => { this._aiCooldown = false; }, 3000);
    }
  },

  _startDcc(botNick, file) {
    this._addMsg(this.currentChannel, { type: 'dcc', text: `*** DCC SEND from ${botNick}: "${file.name}" (${file.size}) - Accepting...` });

    const duration = this._downloadDuration(file.bytes);
    const fakeSpeedKbs = (file.bytes / 1024 / duration).toFixed(1);

    // Open DCC progress window
    const dccWin = WindowManager.createGenericWindow(
      `DCC Get session`,
      this._buildDccHtml(file, botNick),
      { icon: '&#8681;', width: '340px', height: '260px' }
    );

    const contentEl = dccWin.el.querySelector('.browser-content');
    if (contentEl) contentEl.style.padding = '0';

    // Animate the progress bar
    const fill = dccWin.el.querySelector('.mirc-dcc-fill');
    const pct = dccWin.el.querySelector('.mirc-dcc-pct');
    const timeEl = dccWin.el.querySelector('.mirc-dcc-time');
    const rcvdEl = dccWin.el.querySelector('.mirc-dcc-rcvd');
    const leftEl = dccWin.el.querySelector('.mirc-dcc-left');
    const cpsEl = dccWin.el.querySelector('.mirc-dcc-cps');
    const connStatus = dccWin.el.querySelector('.mirc-dcc-conn-status');
    const recvStatus = dccWin.el.querySelector('.mirc-dcc-recv-status');
    const cancelBtn = dccWin.el.querySelector('.mirc-dcc-cancel');
    const completeMsg = dccWin.el.querySelector('.mirc-dcc-complete-msg');

    let progress = 0;
    let cancelled = false;
    const startTime = Date.now();
    const interval = 300;
    const steps = (duration * 1000) / interval;
    const increment = 100 / steps;

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        cancelled = true;
        clearInterval(timer);
        this._addMsg(this.currentChannel, { type: 'error', text: `*** DCC SEND "${file.name}" cancelled.` });
        WindowManager.closeWindow(dccWin.id);
      });
    }

    // Simulate speed fluctuations (56k style)
    const speeds = [1.8, 2.1, 2.4, 2.9, 3.1, 3.4, 2.8, 3.2, 1.2, 2.7, 3.5, 0.9, 3.1, 2.5];
    let speedIdx = 0;

    const fmtTime = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    const timer = setInterval(() => {
      if (cancelled) return;
      progress = Math.min(100, progress + increment + (Math.random() - 0.5) * increment * 0.5);

      const elapsed = (Date.now() - startTime) / 1000;
      const received = Math.floor((progress / 100) * file.bytes);
      const speed = speeds[speedIdx % speeds.length];
      speedIdx++;
      const cps = Math.floor(speed * 1024);
      const etaSecs = Math.max(0, Math.round((file.bytes - received) / cps));

      // Update connection status after first tick
      if (connStatus && elapsed > 0.5) connStatus.textContent = 'Connection established';
      if (recvStatus && elapsed > 1) recvStatus.textContent = 'Receiving file...';

      // Update stat cells
      if (timeEl) timeEl.textContent = fmtTime(elapsed);
      if (rcvdEl) rcvdEl.textContent = received.toLocaleString();
      if (leftEl) leftEl.textContent = fmtTime(etaSecs);
      if (cpsEl) cpsEl.textContent = cps.toLocaleString();

      if (fill) fill.style.width = progress.toFixed(1) + '%';
      if (pct) pct.textContent = Math.floor(progress) + '%';

      if (progress >= 100) {
        clearInterval(timer);
        if (fill) fill.style.background = '#008000';
        if (pct) pct.textContent = '100%';
        if (rcvdEl) rcvdEl.textContent = file.bytes.toLocaleString();
        if (leftEl) leftEl.textContent = '00:00:00';
        if (connStatus) connStatus.textContent = 'Transfer complete';
        if (recvStatus) recvStatus.textContent = '';
        if (cancelBtn) cancelBtn.textContent = 'Close';
        if (completeMsg) {
          completeMsg.textContent = `\u2714 File saved to C:\\Downloads\\${file.name}`;
          completeMsg.style.display = 'block';
        }

        // Add to My Computer downloads
        MyComputer.addDownload({ name: file.name, size: file.size, bytes: file.bytes, type: file.type });
        this._addMsg(this.currentChannel, { type: 'dcc', text: `*** DCC RECV "${file.name}" complete. File saved to C:\\Downloads` });
      }
    }, interval);
  },

  _buildDccHtml(file, botNick) {
    return `<div class="mirc-dcc-body">
      <div class="mirc-dcc-section">
        <div class="mirc-dcc-title">DCC Get session</div>
        <div class="mirc-dcc-row"><span class="mirc-dcc-label">From:</span><span class="mirc-dcc-value">${botNick || 'unknown'}</span></div>
        <div class="mirc-dcc-row"><span class="mirc-dcc-label">File:</span><span class="mirc-dcc-value" style="word-break:break-all;font-size:10px;">${file.name}</span></div>
        <div class="mirc-dcc-row"><span class="mirc-dcc-label">Size:</span><span class="mirc-dcc-value">${file.bytes.toLocaleString()} bytes</span></div>
      </div>
      <div class="mirc-dcc-stats-grid">
        <div class="mirc-dcc-stat-cell"><span class="mirc-dcc-stat-label">Time:</span><span class="mirc-dcc-stat-val mirc-dcc-time">00:00:00</span></div>
        <div class="mirc-dcc-stat-cell"><span class="mirc-dcc-stat-label">Rcvd:</span><span class="mirc-dcc-stat-val mirc-dcc-rcvd">0</span></div>
        <div class="mirc-dcc-stat-cell"><span class="mirc-dcc-stat-label">Left:</span><span class="mirc-dcc-stat-val mirc-dcc-left">--:--:--</span></div>
        <div class="mirc-dcc-stat-cell"><span class="mirc-dcc-stat-label">Cps:</span><span class="mirc-dcc-stat-val mirc-dcc-cps">0</span></div>
      </div>
      <div class="mirc-dcc-status">
        <div class="mirc-dcc-status-line mirc-dcc-conn-status">Connecting...</div>
        <div class="mirc-dcc-status-line mirc-dcc-recv-status"></div>
      </div>
      <div class="mirc-dcc-track">
        <div class="mirc-dcc-fill"></div>
        <div class="mirc-dcc-pct">0%</div>
      </div>
      <div class="mirc-dcc-complete-msg" style="display:none;color:#008000;font-weight:bold;margin-top:4px;"></div>
      <div class="mirc-dcc-btns">
        <button class="mirc-dcc-btn mirc-dcc-cancel">Cancel</button>
      </div>
    </div>`;
  },

  _downloadDuration(bytes) {
    // Realistically slow but not torture
    const mb = bytes / (1024 * 1024);
    if (mb < 5)   return 12 + Math.random() * 8;
    if (mb < 50)  return 25 + Math.random() * 15;
    if (mb < 200) return 45 + Math.random() * 20;
    return 70 + Math.random() * 30;
  },

  _loadPreload(channel) {
    const msgs = MIRC_PRELOAD[channel] || [];
    msgs.forEach(m => {
      this.history[channel].push({ nick: m.nick || 'Server', text: m.text });
      this._appendMsg(m, false);
    });
    this._scrollToBottom();
  },

  _addMsg(channel, msg) {
    if (channel === this.currentChannel) {
      this._appendMsg(msg, true);
    } else {
      // Mark tab as having activity
      this.unread[channel] = (this.unread[channel] || 0) + 1;
      this._updateTab(channel);
    }
  },

  _appendMsg(msg, scroll) {
    const el = this._el('mircMessages');
    if (!el) return;

    const ts = this._ts();
    const line = document.createElement('span');
    line.className = 'mirc-msg';

    if (msg.type === 'server' || msg.type === 'topic') {
      line.className += ' mirc-msg-server';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> ${this._esc(msg.text)}`;
    } else if (msg.type === 'join' || msg.type === 'part') {
      line.className += ' mirc-msg-join';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> <span style="color:#00aa00;">${this._esc(msg.text)}</span>`;
    } else if (msg.type === 'bot' || msg.type === 'notice') {
      line.className += msg.type === 'bot' ? ' mirc-msg-bot' : ' mirc-msg-notice';
      let text = this._esc(msg.text);
      // Make XDCC !get links clickable
      if (msg.xdcc) {
        const { bot, id } = msg.xdcc;
        text = text.replace(
          /\/msg (\S+) !get (\d+)/g,
          `<span class="mirc-xdcc-link" data-bot="${bot}" data-id="${id}">/msg $1 !get $2</span>`
        );
      }
      line.innerHTML = `<span class="mirc-ts">${ts}</span> <span class="mirc-nick">&lt;${this._esc(msg.nick || '***')}&gt;</span> <span class="mirc-text">${text}</span>`;
    } else if (msg.type === 'chat') {
      line.className += ' mirc-msg-chat';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> <span class="mirc-nick">&lt;${this._esc(msg.nick)}&gt;</span> <span class="mirc-text">${this._esc(msg.text)}</span>`;
    } else if (msg.type === 'self') {
      line.className += ' mirc-msg-self';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> <span class="mirc-nick">&lt;${this._esc(msg.nick)}&gt;</span> <span class="mirc-text">${this._esc(msg.text)}</span>`;
    } else if (msg.type === 'action') {
      line.className += ' mirc-msg-action';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> ${this._esc(msg.text)}`;
    } else if (msg.type === 'dcc') {
      line.className += ' mirc-msg-dcc';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> ${this._esc(msg.text)}`;
    } else if (msg.type === 'error') {
      line.className += ' mirc-msg-error';
      line.innerHTML = `<span class="mirc-ts">${ts}</span> ${this._esc(msg.text)}`;
    } else {
      line.innerHTML = `<span class="mirc-ts">${ts}</span> ${this._esc(msg.text)}`;
    }

    el.appendChild(line);

    // Wire XDCC click links
    line.querySelectorAll('.mirc-xdcc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        const botName = link.dataset.bot;
        const packId = parseInt(link.dataset.id);
        const bot = XDCC_BOTS[botName];
        if (bot) {
          const file = bot.files.find(f => f.id === packId);
          if (file) this._startDcc(botName, file);
        }
      });
    });

    if (scroll) this._scrollToBottom();
  },

  _scrollToBottom() {
    const el = this._el('mircMessages');
    if (el) el.scrollTop = el.scrollHeight;
  },

  _ts() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `[${h}:${m}]`;
  },

  _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  _switchChannel(channel) {
    if (channel === this.currentChannel) return;
    this.currentChannel = channel;
    this.unread[channel] = 0;

    // Update UI
    this._updateTitle();
    this._renderTabs();
    this._renderUserlist();

    const prefix = this._el('mircInputPrefix');
    if (prefix) prefix.textContent = channel + '>';

    const statusCh = this._el('mircStatusChannel');
    if (statusCh) statusCh.textContent = channel;

    const header = this._el('mircChatHeader');
    if (header) {
      const topics = {
        '#warez': '#warez — No begging, use GetRight, ratio 1:3',
        '#mp3z':  '#mp3z — 128kbps minimum, no fake files',
        '#moviez': '#moviez — DivX 3.11 required for AVI files',
      };
      header.textContent = topics[channel] || channel;
    }

    // Clear and reload messages for this channel
    const msgsEl = this._el('mircMessages');
    if (msgsEl) {
      msgsEl.innerHTML = '';
      this._loadPreload(channel);
    }
  },

  _renderTabs() {
    const tabsEl = this._el('mircTabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    MIRC_CHANNELS.forEach(ch => {
      const tab = document.createElement('div');
      tab.className = 'mirc-tab' + (ch === this.currentChannel ? ' active' : '') + (this.unread[ch] ? ' has-activity' : '');
      tab.textContent = ch + (this.unread[ch] ? ` (${this.unread[ch]})` : '');
      tab.addEventListener('click', () => this._switchChannel(ch));
      tabsEl.appendChild(tab);
    });
  },

  _updateTab(channel) {
    const tabsEl = this._el('mircTabs');
    if (!tabsEl) return;
    tabsEl.querySelectorAll('.mirc-tab').forEach((tab, i) => {
      if (MIRC_CHANNELS[i] === channel) {
        tab.classList.add('has-activity');
        tab.textContent = channel + (this.unread[channel] ? ` (${this.unread[channel]})` : '');
      }
    });
  },

  _renderUserlist() {
    const body = this._el('mircUserlistBody');
    const header = this._el('mircUserlistHeader');
    const users = MIRC_CHANNEL_USERS[this.currentChannel] || [];
    const statusUsers = this._el('mircStatusUsers');

    if (header) header.textContent = users.length + ' users';
    if (statusUsers) statusUsers.textContent = users.length + ' users';
    if (!body) return;

    body.innerHTML = '';
    // Ops first
    const sorted = [
      ...users.filter(u => u.mode === 'op'),
      ...users.filter(u => u.mode !== 'op'),
    ];
    sorted.forEach(u => {
      const div = document.createElement('div');
      div.className = 'mirc-user-item' + (u.mode === 'op' ? ' is-op' : '') + (u.isBot ? ' is-bot' : '');
      div.textContent = (u.mode === 'op' ? '@' : ' ') + u.nick;
      body.appendChild(div);
    });
    // Add yourself at bottom
    const selfDiv = document.createElement('div');
    selfDiv.className = 'mirc-user-item';
    selfDiv.textContent = ' ' + this.myNick;
    selfDiv.style.color = '#008000';
    body.appendChild(selfDiv);
  },

  _updateTitle() {
    const titleEl = this.winState.el.querySelector('.titlebar-text');
    if (titleEl) titleEl.textContent = `mIRC - [irc.dal.net] - ${this.currentChannel}`;
  },

  _postBotAd() {
    if (!this.winState || !document.contains(this.winState.el)) {
      clearInterval(this._adTimer);
      return;
    }
    const ads = MIRC_BOT_ADS[this.currentChannel];
    if (!ads || ads.length === 0) return;
    const ad = ads[Math.floor(Math.random() * ads.length)];
    this._addMsg(this.currentChannel, { type: 'bot', nick: ad.nick, text: ad.text, xdcc: ad.xdcc });
  },
};

// ============================================================
// MircDialup — Win95 "Connect To" dialog shown before opening mIRC
// ============================================================

const MircDialup = {
  winState: null,

  show(onConnected) {
    if (this.winState && document.contains(this.winState.el)) {
      WindowManager.focusWindow(this.winState.id);
      return;
    }
    this.winState = WindowManager.createGenericWindow(
      'Connect To',
      this._buildHtml(),
      { icon: '&#128222;', width: '320px', height: 'auto' }
    );
    const content = this.winState.el.querySelector('.browser-content');
    if (content) content.style.padding = '0';
    this._wireEvents(onConnected);
  },

  _buildHtml() {
    const user = typeof MircClient !== 'undefined' ? MircClient.myNick : 'user_1234';
    return `<style>
      .mcd { padding: 10px 12px; background: #c0c0c0; font-family: 'MS Sans Serif', Arial, sans-serif; font-size: 11px; }
      .mcd-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
      .mcd-header-icon { font-size: 28px; line-height: 1; }
      .mcd-header-text { font-weight: bold; font-size: 12px; }
      .mcd-header-sub { font-size: 10px; color: #444; }
      .mcd-sep { height: 1px; background: #808080; border-bottom: 1px solid #fff; margin: 8px 0; }
      .mcd-row { display: flex; align-items: center; margin-bottom: 5px; gap: 6px; }
      .mcd-label { width: 88px; text-align: right; flex-shrink: 0; }
      .mcd-input { flex: 1; border: 2px inset #c0c0c0; padding: 1px 3px; font-family: 'MS Sans Serif', Arial, sans-serif; font-size: 11px; background: #fff; }
      .mcd-check-row { display: flex; align-items: center; gap: 4px; margin: 4px 0 4px 96px; font-size: 11px; }
      .mcd-btns { display: flex; justify-content: flex-end; gap: 5px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #808080; }
      .mcd-btn { background: #c0c0c0; border: 2px outset #c0c0c0; padding: 3px 14px; font-family: inherit; font-size: 11px; cursor: pointer; min-width: 72px; }
      .mcd-btn:active { border-style: inset; }
      .mcd-btn:disabled { color: #808080; cursor: default; }
      .mcd-log-area { display: none; border: 2px inset #c0c0c0; background: #000; color: #00ff00; font-family: 'Courier New', monospace; font-size: 10px; padding: 4px; height: 90px; overflow-y: auto; margin: 6px 0; }
      .mcd-log-area.visible { display: block; }
      .mcd-status { font-weight: bold; color: #000080; margin: 4px 0; min-height: 14px; font-size: 11px; }
    </style>
    <div class="mcd">
      <div class="mcd-header">
        <div class="mcd-header-icon">&#128222;</div>
        <div>
          <div class="mcd-header-text">WWWhippet! Online Services</div>
          <div class="mcd-header-sub">Dial-Up Connection</div>
        </div>
      </div>
      <div class="mcd-sep"></div>
      <div class="mcd-row">
        <span class="mcd-label">User name:</span>
        <input class="mcd-input" id="mcdUser" value="${user}" autocomplete="off">
      </div>
      <div class="mcd-row">
        <span class="mcd-label">Password:</span>
        <input class="mcd-input" id="mcdPass" type="password" value="hunter2" autocomplete="off">
      </div>
      <div class="mcd-check-row">
        <input type="checkbox" id="mcdSavePw" checked>
        <label for="mcdSavePw">Save password</label>
      </div>
      <div class="mcd-sep"></div>
      <div class="mcd-row">
        <span class="mcd-label">Phone number:</span>
        <input class="mcd-input" id="mcdPhone" value="1-800-555-0191" autocomplete="off">
      </div>
      <div class="mcd-row">
        <span class="mcd-label">Dialing from:</span>
        <input class="mcd-input" value="My Location" readonly>
      </div>
      <div class="mcd-status" id="mcdStatus"></div>
      <div class="mcd-log-area" id="mcdLog"></div>
      <div class="mcd-btns">
        <button class="mcd-btn" id="mcdConnect">Connect</button>
        <button class="mcd-btn" id="mcdCancel">Cancel</button>
        <button class="mcd-btn" id="mcdProps">Properties...</button>
      </div>
    </div>`;
  },

  _wireEvents(onConnected) {
    const el = (id) => this.winState.el.querySelector('#' + id);
    el('mcdCancel').addEventListener('click', () => WindowManager.closeWindow(this.winState.id));
    el('mcdProps').addEventListener('click', () => {
      el('mcdStatus').textContent = 'Properties not available in this version.';
    });
    el('mcdConnect').addEventListener('click', () => this._doConnect(onConnected));
    // Enter key in any field triggers connect
    this.winState.el.querySelectorAll('.mcd-input').forEach(inp => {
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._doConnect(onConnected); });
    });
  },

  async _doConnect(onConnected) {
    const el = (id) => this.winState.el.querySelector('#' + id);
    const connectBtn = el('mcdConnect');
    const statusEl   = el('mcdStatus');
    const logEl      = el('mcdLog');

    if (!connectBtn || connectBtn.disabled) return;

    // Disable form
    connectBtn.disabled = true;
    el('mcdCancel').textContent = 'Cancel';
    this.winState.el.querySelectorAll('.mcd-input').forEach(i => i.disabled = true);
    logEl.classList.add('visible');

    const log = (msg) => { logEl.innerHTML += msg + '<br>'; logEl.scrollTop = logEl.scrollHeight; };
    const status = (msg) => { if (statusEl) statusEl.textContent = msg; };
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Play dial-up modem sound
    if (typeof AudioManager !== 'undefined') AudioManager.playDialup();

    const phone = el('mcdPhone')?.value || '1-800-555-0191';

    const stages = [
      { log: 'Initializing modem...', status: 'Initializing modem...', delay: 700 },
      { log: 'ATZ', delay: 300 },
      { log: 'OK', delay: 400 },
      { log: `ATDT ${phone}`, status: `Dialing ${phone}...`, delay: 900 },
      { log: 'Dialing...', delay: 1200 },
      { log: 'RING...', status: 'Calling...', delay: 1400 },
      { log: 'RING...', delay: 1200 },
      { log: 'CONNECT 33600', status: 'Connected at 33,600 bps. Verifying...', delay: 700 },
      { log: 'Verifying username and password...', delay: 1100 },
      { log: 'Registering your computer on the network...', status: 'Registering your computer on the network...', delay: 1000 },
      { log: 'CARRIER DETECT', delay: 400 },
      { log: 'PPP session established', delay: 300 },
      { log: 'IP address: 10.0.0.' + Math.floor(Math.random() * 254 + 1), delay: 300 },
    ];

    for (const stage of stages) {
      if (stage.log)    log(stage.log);
      if (stage.status) status(stage.status);
      if (stage.delay)  await sleep(stage.delay);
    }

    // Set the AI provider on the server
    try {
      const provider = (typeof DialUp !== 'undefined' && DialUp.selectedProvider) || 'claude';
      await fetch('/api/provider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
    } catch (_) { /* non-fatal */ }

    if (typeof AudioManager !== 'undefined') AudioManager.stopDialup();

    log('Connected!');
    status('Connected at 33,600 bps');

    // Mark global dial-up state as connected
    if (typeof DialUp !== 'undefined') {
      DialUp.connected = true;
      DialUp.updateIndicator();
    }

    await sleep(700);
    WindowManager.closeWindow(this.winState.id);
    onConnected();
  },
};

// ============================================================
// Expose open functions for app.js / start-menu.js
// ============================================================

function openMirc() {
  if (typeof DialUp !== 'undefined' && DialUp.connected) {
    MircClient.open();
  } else {
    MircDialup.show(() => MircClient.open());
  }
}

function openMyComputer() {
  MyComputer.open();
}
