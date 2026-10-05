import { initialSongs } from "../data/musicData.js";

async function audit() {
  console.log(`Auditing all ${initialSongs.length} songs in catalog...`);
  const suspicious = [];

  for (const song of initialSongs) {
    if (!song.youtubeId) continue;
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${song.youtubeId}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const text = await res.text();
      const durMatch = text.match(/"approxDurationMs":"(\d+)"/);
      const ytSec = durMatch ? Math.round(Number(durMatch[1]) / 1000) : 0;
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      const ytTitle = titleMatch ? titleMatch[1] : "";
      
      const expectedSec = song.durationSec || 200;
      const diff = ytSec - expectedSec;

      if (diff > 25 || diff < -25 || ytTitle.toLowerCase().includes("music video") || ytTitle.toLowerCase().includes("official video") || ytTitle.toLowerCase().includes("short movie")) {
        suspicious.push({
          id: song.id,
          title: song.title,
          artist: song.artist,
          youtubeId: song.youtubeId,
          expectedSec,
          ytSec,
          diff,
          ytTitle,
        });
      }
    } catch (e) {
      console.error(song.title, e.message);
    }
  }

  console.log(`\nFound ${suspicious.length} songs with MV / large duration differences:`);
  suspicious.forEach(s => {
    console.log(`- [${s.artist} - ${s.title}] (expected ${s.expectedSec}s vs YT ${s.ytSec}s, diff: +${s.diff}s) => ${s.ytTitle}`);
  });
}

audit();
