async function findClean(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
  const text = await res.text();
  const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let match;
  const ids = [];
  while ((match = re.exec(text)) !== null) {
    if (!ids.includes(match[1])) ids.push(match[1]);
    if (ids.length >= 10) break;
  }
  for (const id of ids) {
    try {
      const om = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`).then(r => r.json());
      console.log(id, "=>", om.author_name, ":", om.title);
    } catch (_) {}
  }
}

async function run() {
  console.log("--- Sabrina Carpenter Espresso ---");
  await findClean("Sabrina Carpenter Espresso Official Lyric Video");

  console.log("\n--- Pamungkas To the Bone ---");
  await findClean("Pamungkas To the Bone Official Lyric Video");

  console.log("\n--- Dewa 19 Pupus ---");
  await findClean("Dewa 19 Pupus Official Audio");
}
run();
