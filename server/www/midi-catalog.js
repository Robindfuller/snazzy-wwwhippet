// Curated MIDI files organized by category
// Uses working sources + server-side MIDI generation fallback

const MIDI_CATALOG = {
  rock: [
    { file: 'bohemian-rhapsody', title: 'Bohemian Rhapsody - Queen', notes: 'rock' },
    { file: 'stairway-to-heaven', title: 'Stairway To Heaven - Led Zeppelin', notes: 'rock' },
    { file: 'hotel-california', title: 'Hotel California - Eagles', notes: 'rock' },
    { file: 'smoke-on-the-water', title: 'Smoke On The Water - Deep Purple', notes: 'rock' },
  ],
  pop: [
    { file: 'maybe-baby', title: 'Maybe Baby', notes: 'pop' },
    { file: 'wannabe', title: 'Wannabe - Spice Girls', notes: 'pop' },
    { file: 'barbie-girl', title: 'Barbie Girl - Aqua', notes: 'pop' },
    { file: 'mmmbop', title: 'MMMBop - Hanson', notes: 'pop' },
  ],
  movie: [
    { file: 'star-wars', title: 'Star Wars Theme', notes: 'movie' },
    { file: 'jurassic-park', title: 'Jurassic Park Theme', notes: 'movie' },
    { file: 'men-in-black', title: 'Men In Black', notes: 'movie' },
    { file: 'titanic', title: 'My Heart Will Go On - Titanic', notes: 'movie' },
    { file: 'mission-impossible', title: 'Mission Impossible Theme', notes: 'movie' },
  ],
  classical: [
    { file: 'fur-elise', title: 'Fur Elise - Beethoven', url: 'https://www.mfiles.co.uk/downloads/fur-elise.mid' },
    { file: 'moonlight-sonata', title: 'Moonlight Sonata - Beethoven', url: 'https://www.mfiles.co.uk/downloads/moonlight-sonata.mid' },
    { file: 'canon-in-d', title: 'Canon in D - Pachelbel', url: 'https://www.mfiles.co.uk/downloads/canon-in-d.mid' },
  ],
  tv: [
    { file: 'x-files', title: 'X-Files Theme', notes: 'tv' },
    { file: 'friends', title: 'Friends Theme', notes: 'tv' },
    { file: 'seinfeld', title: 'Seinfeld Theme', notes: 'tv' },
    { file: 'simpsons', title: 'The Simpsons Theme', notes: 'tv' },
  ],
  christmas: [
    { file: 'jingle-bells', title: 'Jingle Bells', notes: 'christmas' },
    { file: 'silent-night', title: 'Silent Night', notes: 'christmas' },
    { file: 'deck-the-halls', title: 'Deck The Halls', notes: 'christmas' },
  ],
  videogame: [
    { file: 'super-mario', title: 'Super Mario Bros Theme', notes: 'videogame' },
    { file: 'zelda', title: 'Legend of Zelda Theme', notes: 'videogame' },
    { file: 'tetris', title: 'Tetris Theme', notes: 'videogame' },
  ],
};

// Simple note sequences for generating MIDI files
// Format: [note, duration_in_ticks, velocity] — note uses MIDI numbers
const NOTE_SEQUENCES = {
  rock: [
    // Power chord riff
    [40,240,100],[47,240,100],[52,240,90],[47,240,85],[40,480,100],
    [43,240,95],[50,240,90],[55,240,85],[50,240,80],[43,480,95],
    [45,240,100],[52,240,95],[57,240,90],[52,120,80],[50,120,75],
    [48,240,90],[45,480,100],[40,960,100],
  ],
  pop: [
    // Upbeat pop melody
    [60,240,90],[64,240,85],[67,240,90],[72,480,95],[71,240,85],
    [69,240,80],[67,480,90],[64,240,85],[60,240,80],[62,480,85],
    [64,240,90],[67,240,95],[72,240,100],[71,240,90],[69,480,85],
    [67,960,95],
  ],
  movie: [
    // Epic/cinematic melody
    [48,480,100],[55,480,95],[60,240,90],[62,240,85],[64,960,100],
    [62,240,90],[60,240,85],[55,480,95],[48,480,90],[53,480,95],
    [60,240,90],[62,240,85],[64,240,100],[67,240,95],[72,960,100],
    [67,480,90],[64,960,95],
  ],
  classical: [
    // Classical-style melody
    [64,240,80],[63,240,75],[64,240,80],[63,240,75],[64,240,85],
    [59,240,80],[62,240,75],[60,480,85],[48,240,70],[52,240,75],
    [57,240,80],[60,480,85],[52,240,70],[56,240,75],[60,240,80],
    [59,480,85],[48,960,80],
  ],
  tv: [
    // Catchy TV theme
    [67,240,90],[69,120,85],[71,120,85],[72,480,95],[69,240,85],
    [67,480,90],[64,240,80],[62,240,75],[60,480,85],[64,240,90],
    [67,240,95],[72,480,100],[74,240,90],[72,480,95],[69,960,90],
  ],
  christmas: [
    // Holiday melody
    [64,240,85],[64,240,85],[64,480,90],[64,240,85],[64,240,85],
    [64,480,90],[64,240,90],[67,240,95],[60,240,80],[62,240,80],
    [64,960,95],[65,240,85],[65,240,85],[65,240,85],[65,240,80],
    [64,240,85],[64,240,85],[64,120,80],[64,120,80],
    [67,240,90],[67,240,85],[65,240,80],[62,240,75],[60,960,90],
  ],
  videogame: [
    // 8-bit style melody
    [76,120,100],[76,120,100],[76,240,100],[72,120,90],[76,240,100],
    [79,480,100],[67,480,90],[72,240,95],[67,240,85],[64,240,90],
    [69,240,95],[71,240,90],[70,120,85],[69,240,90],[67,120,95],
    [76,240,100],[79,240,100],[81,240,100],[77,120,90],[79,240,95],
    [76,240,90],[72,240,85],[74,240,80],[71,480,85],
  ],
};

// Generate a MIDI file buffer from a note sequence
function generateMidiBuffer(genre) {
  const notes = NOTE_SEQUENCES[genre] || NOTE_SEQUENCES.pop;
  const ticksPerBeat = 480;
  const tempo = genre === 'videogame' ? 400000 : genre === 'rock' ? 500000 : 600000;

  // Build MIDI file
  const trackData = [];

  // Tempo meta event
  trackData.push(0x00); // delta time
  trackData.push(0xFF, 0x51, 0x03); // set tempo
  trackData.push((tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF);

  // Program change (instrument)
  trackData.push(0x00); // delta
  const instrument = genre === 'videogame' ? 80 : genre === 'rock' ? 29 : genre === 'classical' ? 0 : 4;
  trackData.push(0xC0, instrument);

  // Note events
  for (const [note, dur, vel] of notes) {
    // Note on (delta 0 for first, then duration for off)
    trackData.push(0x00); // delta
    trackData.push(0x90, note, vel); // note on
    pushVarLen(trackData, dur);
    trackData.push(0x80, note, 0); // note off
  }

  // End of track
  trackData.push(0x00, 0xFF, 0x2F, 0x00);

  // Assemble MIDI file
  const header = [
    0x4D, 0x54, 0x68, 0x64, // MThd
    0x00, 0x00, 0x00, 0x06, // header length
    0x00, 0x00,             // format 0
    0x00, 0x01,             // 1 track
    (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF,
  ];

  const trackHeader = [
    0x4D, 0x54, 0x72, 0x6B, // MTrk
    (trackData.length >> 24) & 0xFF,
    (trackData.length >> 16) & 0xFF,
    (trackData.length >> 8) & 0xFF,
    trackData.length & 0xFF,
  ];

  return Buffer.from([...header, ...trackHeader, ...trackData]);
}

function pushVarLen(arr, value) {
  if (value < 0x80) {
    arr.push(value);
  } else if (value < 0x4000) {
    arr.push(((value >> 7) & 0x7F) | 0x80, value & 0x7F);
  } else {
    arr.push(((value >> 14) & 0x7F) | 0x80, ((value >> 7) & 0x7F) | 0x80, value & 0x7F);
  }
}

function getRandomMidi(genre) {
  const normalizedGenre = genre.toLowerCase().trim();
  const catalog = MIDI_CATALOG[normalizedGenre] || MIDI_CATALOG.pop;
  const midi = catalog[Math.floor(Math.random() * catalog.length)];

  // Use external URL if available, otherwise use generated endpoint
  const url = midi.url || `generated`;
  return {
    url: midi.url ? `/api/img?url=${encodeURIComponent(midi.url)}` : `/api/midi/play/${midi.notes || normalizedGenre}/${midi.file}.mid`,
    title: midi.title,
  };
}

function replaceMidiPlaceholders(html) {
  const regex = /<!--MIDI:(\w+)-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const midi = getRandomMidi(match[1]);
    const midiTags = `
<!-- Now Playing: ${midi.title} -->
<bgsound src="${midi.url}" loop="-1">
<embed src="${midi.url}" autostart="true" hidden="true" loop="true" type="audio/midi">
<noembed><p><font face="Arial" size="1" color="#888888">&#9835; Now playing: ${midi.title}</font></p></noembed>`;
    html = html.replace(match[0], midiTags);
  }

  return html;
}

module.exports = { getRandomMidi, replaceMidiPlaceholders, MIDI_CATALOG, generateMidiBuffer, NOTE_SEQUENCES };
