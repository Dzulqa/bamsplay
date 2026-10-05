async function checkPlayable(id) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
  const text = await res.text();
  const isUnplayable = text.includes('"playabilityStatus":{"status":"UNPLAYABLE"') || text.includes('"status":"ERROR"');
  const titleMatch = text.match(/<title>(.*?)<\/title>/);
  return { id, isPlayable: !isUnplayable, title: titleMatch ? titleMatch[1] : "" };
}

async function run() {
  const candidates = [
    "AQpEIZ8dNcU", // MV (has na na na intro)
    "gu6rT1Jelis", // Official Lyric Video
    "kv2WIY8RLQQ", // Indolirik
    "dagD347CpmI", // Puspa Harizah
    "gerlya7HNeQ", // AF Music Lyric
    "OXmWrBw2ZvM", // Animasi Lirik
  ];

  for (const c of candidates) {
    const status = await checkPlayable(c);
    console.log(status.id, "Playable:", status.isPlayable, "Title:", status.title);
  }
}
run();
