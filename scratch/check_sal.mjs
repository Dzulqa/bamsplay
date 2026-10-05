async function searchVideos(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
  const text = await res.text();
  const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let match;
  const ids = [];
  while ((match = re.exec(text)) !== null) {
    if (!ids.includes(match[1])) ids.push(match[1]);
    if (ids.length >= 8) break;
  }
  const results = [];
  for (const id of ids) {
    try {
      const om = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`).then(r => r.json());
      if (om?.title) results.push({ id, author: om.author_name, title: om.title });
    } catch (_) {}
  }
  return results;
}

async function run() {
  console.log("--- 1. Sal Priadi - Gala Bunga Matahari ---");
  const gala = await searchVideos("Sal Priadi Gala Bunga Matahari Topic");
  gala.forEach(r => console.log(r.id, "=>", r.author, ":", r.title));

  console.log("\n--- 2. Sal Priadi - Dari Planet Lain ---");
  const planet = await searchVideos("Sal Priadi Dari Planet Lain Topic");
  planet.forEach(r => console.log(r.id, "=>", r.author, ":", r.title));

  console.log("\n--- 3. Bernadya - Satu Bulan ---");
  const bernadya = await searchVideos("Bernadya Satu Bulan Topic");
  bernadya.forEach(r => console.log(r.id, "=>", r.author, ":", r.title));
}

run();
