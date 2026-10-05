const { initialSongs } = require('../data/musicData.js');

// Read resolve/route.js to get resolvedCache
const fs = require('fs');
const resolveCode = fs.readFileSync('app/api/music/resolve/route.js', 'utf8');

const regex = /\["([^"]+)",\s*"([^"]+)"\]/g;
let m;
const cacheEntries = [];
while ((m = regex.exec(resolveCode)) !== null) {
  cacheEntries.push({ key: m[1], ytId: m[2] });
}

console.log(`Found ${cacheEntries.length} entries in resolvedCache.`);

async function checkEntry(entry) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(entry.key + " official audio")}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const html = await res.text();
  const vRegex = /"videoRenderer":\s*\{\s*"videoId":\s*"([a-zA-Z0-9_-]{11})"(?:.*?)"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/g;
  let match;
  const candidates = [];
  while ((match = vRegex.exec(html)) !== null && candidates.length < 5) {
    candidates.push({ id: match[1], title: match[2] });
  }

  // Find candidate for current ytId
  const currentMatch = candidates.find(c => c.id === entry.ytId);
  const audioCandidate = candidates.find(c => {
    const t = c.title.toLowerCase();
    return (t.includes("audio") || t.includes("lyric") || t.includes("topic")) && !t.includes("music video") && !t.includes("official video");
  });

  return {
    key: entry.key,
    currentId: entry.ytId,
    currentTitle: currentMatch ? currentMatch.title : 'Not in top 5',
    audioId: audioCandidate ? audioCandidate.id : null,
    audioTitle: audioCandidate ? audioCandidate.title : null,
  };
}

async function run() {
  const results = [];
  // Test first 15 entries
  for (let i = 0; i < Math.min(20, cacheEntries.length); i++) {
    const r = await checkEntry(cacheEntries[i]);
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
