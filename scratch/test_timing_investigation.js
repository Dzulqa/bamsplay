const testQueries = [
  "bernadya satu bulan",
  "lady gaga bruno mars die with a smile",
  "billie eilish birds of a feather",
  "sal priadi gala bunga matahari",
  "tulus hati hati di jalan"
];

async function check() {
  for (const q of testQueries) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " audio")}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const html = await res.text();
    const regex = /"videoRenderer":\s*\{\s*"videoId":\s*"([a-zA-Z0-9_-]{11})"(?:.*?)"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/g;
    let match;
    console.log(`\n=== QUERY: ${q} ===`);
    let count = 0;
    while ((match = regex.exec(html)) !== null && count < 5) {
      console.log(`  [${match[1]}] ${match[2]}`);
      count++;
    }
  }
}

check();
