// Curated MIDI files from midiworld.com organized by category
// These are real MIDI file paths on midiworld.com

const MIDI_CATALOG = {
  rock: [
    { file: 'classic-rock/BohemianRhapsody.mid', title: 'Bohemian Rhapsody - Queen' },
    { file: 'classic-rock/StairwayToHeaven.mid', title: 'Stairway To Heaven - Led Zeppelin' },
    { file: 'classic-rock/HotelCalifornia.mid', title: 'Hotel California - Eagles' },
    { file: 'classic-rock/Smoke_On_The_Water.mid', title: 'Smoke On The Water - Deep Purple' },
  ],
  pop: [
    { file: 'pop/MaybeBaby.mid', title: 'Maybe Baby' },
    { file: 'pop/Wannabe.mid', title: 'Wannabe - Spice Girls' },
    { file: 'pop/Barbie_Girl.mid', title: 'Barbie Girl - Aqua' },
    { file: 'pop/MMMBop.mid', title: 'MMMBop - Hanson' },
  ],
  movie: [
    { file: 'movie-themes/StarWars.mid', title: 'Star Wars Theme' },
    { file: 'movie-themes/JurassicPark.mid', title: 'Jurassic Park Theme' },
    { file: 'movie-themes/MenInBlack.mid', title: 'Men In Black' },
    { file: 'movie-themes/Titanic.mid', title: 'My Heart Will Go On - Titanic' },
    { file: 'movie-themes/MissionImpossible.mid', title: 'Mission Impossible Theme' },
  ],
  classical: [
    { file: 'classical/FurElise.mid', title: 'Fur Elise - Beethoven' },
    { file: 'classical/Moonlight.mid', title: 'Moonlight Sonata - Beethoven' },
    { file: 'classical/CanonInD.mid', title: 'Canon in D - Pachelbel' },
  ],
  tv: [
    { file: 'tv-themes/XFiles.mid', title: 'X-Files Theme' },
    { file: 'tv-themes/Friends.mid', title: 'Friends Theme' },
    { file: 'tv-themes/Seinfeld.mid', title: 'Seinfeld Theme' },
    { file: 'tv-themes/Simpsons.mid', title: 'The Simpsons Theme' },
  ],
  christmas: [
    { file: 'christmas/JingleBells.mid', title: 'Jingle Bells' },
    { file: 'christmas/SilentNight.mid', title: 'Silent Night' },
    { file: 'christmas/DeckTheHalls.mid', title: 'Deck The Halls' },
  ],
  videogame: [
    { file: 'video-game/SuperMario.mid', title: 'Super Mario Bros Theme' },
    { file: 'video-game/Zelda.mid', title: 'Legend of Zelda Theme' },
    { file: 'video-game/Tetris.mid', title: 'Tetris Theme' },
  ],
};

function getRandomMidi(genre) {
  const normalizedGenre = genre.toLowerCase().trim();
  const catalog = MIDI_CATALOG[normalizedGenre] || MIDI_CATALOG.pop;
  const midi = catalog[Math.floor(Math.random() * catalog.length)];
  return {
    url: `https://www.midiworld.com/download/${midi.file}`,
    title: midi.title,
  };
}

function replaceMidiPlaceholders(html) {
  const regex = /<!--MIDI:(\w+)-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const midi = getRandomMidi(match[1]);
    const proxiedUrl = `/api/img?url=${encodeURIComponent(midi.url)}`;
    const midiTags = `
<!-- Now Playing: ${midi.title} -->
<bgsound src="${proxiedUrl}" loop="-1">
<embed src="${proxiedUrl}" autostart="true" hidden="true" loop="true" type="audio/midi">
<noembed><p><font face="Arial" size="1" color="#888888">&#9835; Now playing: ${midi.title}</font></p></noembed>`;
    html = html.replace(match[0], midiTags);
  }

  return html;
}

module.exports = { getRandomMidi, replaceMidiPlaceholders, MIDI_CATALOG };
