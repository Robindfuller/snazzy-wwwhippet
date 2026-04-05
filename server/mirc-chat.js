// mIRC AI chat handler — generates period-authentic 1999 IRC responses

const ai = require('./ai');

const CHANNEL_PERSONAS = {
  '#warez': [
    { nick: 'WaReZKiNg', style: 'veteran of the warez scene since BBS days, condescending toward n00bs but knowledgeable, uses terms like "scene rules" and "ratios"' },
    { nick: 'd00dz', style: 'perpetually switching between away statuses, obsessed with GetRight download manager, talks about leaving downloads running overnight on 56k' },
    { nick: 'Cr4ck3r', style: 'proud serial/keygen cracker, dismissive of people who buy software, warns about Norton AntiVirus false positives on keygens' },
    { nick: 'ph33r_me', style: 'teenage boy on 56k modem, constantly complaining about disconnects and slow speeds, excited and uses lots of exclamation marks' },
  ],
  '#mp3z': [
    { nick: 'SonicRipper', style: 'audiophile who uses Exact Audio Copy, angry about low-quality rips, debates 128kbps vs 192kbps endlessly' },
    { nick: 'l33tMP3', style: 'has a 15GB hard drive almost full of MP3s, recommends WinAmp skins and visualizations, debates bitrates' },
    { nick: 'NapsterDood', style: 'just discovered Napster and now trying IRC, amazed at free music, asks lots of newbie questions' },
    { nick: 'mp3_junkie', style: 'claims to have 20000+ MP3s, recommends rare tracks, complains about fake files on Napster' },
  ],
  '#moviez': [
    { nick: 'DivXRulez', style: 'DivX codec evangelist, explains encoding parameters to everyone, has a Pentium III 450MHz encoding rig, hates VCD' },
    { nick: 'CAMmaster', style: 'claims to sneak cameras into theaters for CAM rips, talks about Sony nightshot and audio sync issues' },
    { nick: 'CinemaStar', style: 'actual movie buff who reviews films, but still downloads CAMs because he "can\'t wait for the DVD", references Roger Ebert' },
    { nick: 'VCDking', style: 'loyal to VCD format, burns VCDs with Nero and distributes to friends, argues VCD plays in standalone DVD players unlike DivX' },
  ],
};

async function generateChatResponse(channel, userMessage, history) {
  const personas = CHANNEL_PERSONAS[channel] || CHANNEL_PERSONAS['#warez'];

  const systemPrompt = `You are roleplaying as multiple users in a 1999 underground warez/piracy IRC channel called ${channel} on irc.dal.net.

The characters you can play are:
${personas.map(p => `- ${p.nick}: ${p.style}`).join('\n')}

RULES:
- Use authentic 1999 internet/IRC slang: lol, brb, afk, omg, wtf, n00b, l33t, r0x, j00, u, 2, 4, plz, lmao, rofl, brb, np, gg, imo, imho, tbh, ftw, etc.
- Reference period-accurate things ONLY: 56k modems, AOL, Netscape Navigator 4, ICQ, WinAmp, Windows 98, GetRight, DirectConnect, mIRC scripts, real player, Kazaa (just launching), Napster
- Stay in character — these are teenagers and young adults in 1999 pirating software/media
- Keep messages SHORT — 1 to 2 sentences MAX, like real IRC chat
- Not all characters need to respond every time — pick 1 to 3 that would naturally reply
- React naturally to what was said — be helpful, snarky, excited, or dismissive as fits each character
- NEVER break character or reference anything post-1999
- Return ONLY a valid JSON array, nothing else`;

  const recentHistory = history.slice(-8).map(m => `<${m.nick}> ${m.text}`).join('\n');
  const userPrompt = `Recent chat:
${recentHistory}

The user (who just joined) says: ${userMessage}

Respond as 1-3 characters. Return ONLY JSON like: [{"nick":"WaReZKiNg","message":"lol n00b"},{"nick":"ph33r_me","message":"omg same!!!"}]`;

  try {
    const response = await ai.generateFast(systemPrompt, userPrompt);
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Validate structure
      if (Array.isArray(parsed) && parsed.every(r => r.nick && r.message)) {
        return parsed.slice(0, 3); // max 3 responses
      }
    }
    return [];
  } catch (err) {
    console.error('mIRC chat AI error:', err.message);
    return [];
  }
}

module.exports = { generateChatResponse, CHANNEL_PERSONAS };
