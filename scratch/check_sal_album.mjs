async function checkAlbum() {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent("MARKERS AND SUCH PENS FLASHDISKS Sal Priadi Topic")}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
  const text = await res.text();
  const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let match;
  const ids = [];
  while ((match = re.exec(text)) !== null) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  for (const id of ids.slice(0, 15)) {
    try {
      const om = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`).then(r => r.json());
      if (om?.author_name?.includes("Topic")) {
        console.log("TOPIC:", id, "=>", om.title);
      }
    } catch (_) {}
  }
}
checkAlbum();
