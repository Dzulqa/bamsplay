async function checkDurations() {
  const list = [
    { name: "AQpEIZ8dNcU (Official MV)", id: "AQpEIZ8dNcU" },
    { name: "gu6rT1Jelis (Official Lyric Video)", id: "gu6rT1Jelis" },
    { name: "kv2WIY8RLQQ (Indolirik)", id: "kv2WIY8RLQQ" },
    { name: "dagD347CpmI (Puspa Harizah)", id: "dagD347CpmI" },
  ];

  for (const item of list) {
    const res = await fetch(`https://www.youtube.com/watch?v=${item.id}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const text = await res.text();
    const durMatch = text.match(/"approxDurationMs":"(\d+)"/);
    const durSec = durMatch ? Math.round(Number(durMatch[1]) / 1000) : "N/A";
    console.log(`${item.name} => ${durSec} seconds (${Math.floor(durSec/60)}:${(durSec%60).toString().padStart(2, '0')})`);
  }
}
checkDurations();
