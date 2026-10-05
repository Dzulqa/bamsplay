import { NextResponse } from "next/server";

// In-memory cache for verified lyrics
const lyricsCache = new Map();

function parseLrc(lrcText) {
  if (!lrcText) return null;
  const lines = lrcText.split("\n");
  const result = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Match all [mm:ss.xx] timestamps in this line
    const timeMatches = [...line.matchAll(/\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g)];
    if (timeMatches.length === 0) continue;

    // Extract text after removing all timestamps
    const text = line.replace(/\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\]/g, "").trim();

    // Filter out metadata tags
    if (
      !text ||
      text.startsWith("ar:") ||
      text.startsWith("ti:") ||
      text.startsWith("al:") ||
      text.startsWith("by:") ||
      text.startsWith("length:")
    ) {
      continue;
    }

    const cleanT = text.trim();
    const isAnnotation =
      cleanT.startsWith("♪") ||
      cleanT.endsWith("♪") ||
      (cleanT.startsWith("(") &&
        cleanT.endsWith(")") &&
        (cleanT.toLowerCase().includes("instrumental") ||
          cleanT.toLowerCase().includes("intro") ||
          cleanT.toLowerCase().includes("petikan") ||
          cleanT.toLowerCase().includes("alunan") ||
          cleanT.toLowerCase().includes("gitar") ||
          cleanT.toLowerCase().includes("music") ||
          cleanT.toLowerCase().includes("solo")));

    if (isAnnotation) continue;

    for (const match of timeMatches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const totalSec = Math.round((minutes * 60 + seconds) * 100) / 100;
      result.push({ time: totalSec, text: cleanT });
    }
  }

  // Strictly sort chronological timestamps
  result.sort((a, b) => a.time - b.time);

  return result.length > 0 ? result : null;
}

function parsePlainLyrics(plainText, durationSec = 210) {
  if (!plainText) return null;
  const lines = plainText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("[") && !l.endsWith("]"));

  if (lines.length === 0) return null;

  // Assign evenly-distributed approximate timestamps so lyrics can scroll
  // through the song even when synced LRC is not available.
  // Reserve first 5% of the song as intro before lyrics start.
  const introBuffer = Math.max(2, durationSec * 0.05);
  const lyricsSpan = durationSec - introBuffer;
  const step = lines.length > 1 ? lyricsSpan / (lines.length - 1) : lyricsSpan;

  return lines.map((text, i) => ({
    time: Math.round((introBuffer + i * step) * 100) / 100,
    text,
    isUnsynced: true,
  }));
}

/** Strip video suffixes and feat. from title */
function cleanTitle(str) {
  if (!str) return "";
  return str
    .replace(/\s*[\(\[](official\s*(music\s*)?video|official\s*audio|lyrics?\s*video|lyric\s*video|audio|mv|hd|4k|visualizer|video|clip|live|acoustic|remaster(ed)?|deluxe|bonus|explicit|single|ep|ost|cover|remix|version|edit|karaoke|instrumental|extended|radio\s*edit)[\)\]]/gi, "")
    .replace(/\s*-\s*(official|single|album|bonus|remaster|ep|ost|lyric|audio|video|deluxe)\s*$/gi, "")
    .replace(/\s*\(feat\..*?\)/gi, "")
    .replace(/\s*\[feat\..*?\]/gi, "")
    .replace(/\s*(ft\.|feat\.)\s*.*/gi, "")
    .trim();
}

/** Take only the primary/first artist */
function cleanArtist(str) {
  if (!str) return "";
  return str
    .replace(/\s*,.*$/, "")
    .replace(/\s*(feat\.|ft\.|&)\s+.*/gi, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();
}

const LRCLIB_HEADERS = {
  "Lrclib-Client": "BamsplayMusicPlayer/1.0 (https://bamsplay.app)",
};

async function lrclibGet(title, artist, duration) {
  let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
  if (duration) url += `&duration=${duration}`;
  try {
    const res = await fetch(url, { headers: LRCLIB_HEADERS, signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const d = await res.json();
    return d?.code === 404 ? null : d;
  } catch (_) { return null; }
}

async function lrclibSearch(q, dur) {
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`,
      { headers: LRCLIB_HEADERS, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return null;
    const synced = list.filter((x) => x.syncedLyrics);
    const pool = synced.length > 0 ? synced : list;
    if (dur > 0) pool.sort((a, b) => Math.abs((a.duration || 0) - dur) - Math.abs((b.duration || 0) - dur));
    return pool[0];
  } catch (_) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawTitle  = searchParams.get("title")  || searchParams.get("track") || "";
  const rawArtist = searchParams.get("artist") || "";
  const dur = parseInt(searchParams.get("duration") || "0", 10);

  if (!rawTitle.trim()) {
    return NextResponse.json({ lyrics: [] }, { status: 400 });
  }

  const cacheKey = `${rawTitle.toLowerCase().trim()}---${rawArtist.toLowerCase().trim()}`;
  if (lyricsCache.has(cacheKey)) {
    return NextResponse.json(lyricsCache.get(cacheKey));
  }

  const t = cleanTitle(rawTitle);
  const a = cleanArtist(rawArtist);

  // Curated override for Bernadya - Satu Bulan (Synced with instant-start YouTube video)
  if (
    (t.toLowerCase().includes("satu bulan") || rawTitle.toLowerCase().includes("satu bulan")) &&
    (a.toLowerCase().includes("bernadya") || rawArtist.toLowerCase().includes("bernadya"))
  ) {
    const curatedSatuBulan = {
      lyrics: [
        { time: 0.5, text: "Belum ada satu bulan" },
        { time: 5.6, text: "Ku yakin masih ada sisa wangiku di bajumu" },
        { time: 11.7, text: "Namun kau tampak baik saja" },
        { time: 15.7, text: "Bahkan senyummu lebih lepas" },
        { time: 18.5, text: "Sedang aku di sini hampir gila" },
        { time: 24.3, text: "Kita tak temukan jalan" },
        { time: 29.9, text: "Sepakat akhiri setelah beribu debat panjang" },
        { time: 36.2, text: "Namun kau tampak baik saja" },
        { time: 40.8, text: "Bahkan senyummu lebih lepas" },
        { time: 43.1, text: "Sedang aku di sini belum terima" },
        { time: 48.9, text: "Bohong kah tangismu sore itu di pelukku?" },
        { time: 54.8, text: "Nyatanya pergi ku pun tak lagi mengangganggumu" },
        { time: 59.9, text: "Apa sudah ada kabar lain yang kau tunggu?" },
        { time: 65.1, text: "Sudah adakah yang gantikanku?" },
        { time: 70.4, text: "Yang khawatirkanmu setiap waktu?" },
        { time: 76.5, text: "Yang cerita tentang apapun sampai hal-hal tak perlu?" },
        { time: 82.4, text: "Kalau bisa jangan buru-buru, kalau bisa jangan ada dulu" },
        { time: 96.7, text: "Baru lewat satu bulan" },
        { time: 108.8, text: "Kemarin ulang tahunku tak ada pesan darimu" },
        { time: 114.5, text: "Tak apa, mungkin kau lupa" },
        { time: 119.2, text: "Atau sudah ada hati yang harus kau jaga?" },
        { time: 125.2, text: "Sudah adakah yang gantikanku?" },
        { time: 129.9, text: "Yang kau antar jemput setiap sabtu?" },
        { time: 135.4, text: "Yang s'lalu ingatkan untuk pakai sabuk pengamanmu" },
        { time: 141.3, text: "Kalau bisa jangan buru-buru" },
        { time: 146.2, text: "Sudah adakah yang gantikanku?" },
        { time: 151.4, text: "Yang khawatirkanmu setiap waktu" },
        { time: 157.1, text: "Yang cerita tentang apapun sampai hal-hal tak perlu" },
        { time: 163.0, text: "Kalau bisa jangan buru-buru, kalau bisa jangan ada dulu" },
        { time: 182.7, text: "Huuu" },
      ],
      isSynced: true,
      source: "curated_studio_synced",
    };
    lyricsCache.set(cacheKey, curatedSatuBulan);
    return NextResponse.json(curatedSatuBulan);
  }

  // 8-strategy cascade — stops as soon as synced LRC is found
  const strategies = [
    () => lrclibGet(t, a, dur),
    () => lrclibGet(t, a, 0),
    () => lrclibGet(rawTitle, rawArtist, dur),
    () => lrclibGet(rawTitle, rawArtist, 0),
    () => lrclibSearch(`${t} ${a}`, dur),
    () => lrclibSearch(t, dur),
    () => lrclibSearch(`${rawTitle} ${a}`, dur),
    () => lrclibSearch(`${t} ${rawArtist}`, dur),
  ];

  let lrclibData = null;
  for (const strategy of strategies) {
    const data = await strategy();
    if (!data) continue;
    if (data.syncedLyrics) { lrclibData = data; break; }           // synced found — stop
    if (!lrclibData && data.plainLyrics) lrclibData = data;        // save plain as backup
  }

  let parsed = null;
  let isSynced = false;

  if (lrclibData?.syncedLyrics) {
    parsed = parseLrc(lrclibData.syncedLyrics);
    if (parsed && parsed.length > 0) isSynced = true;
  }

  if (!parsed && lrclibData?.plainLyrics) {
    parsed = parsePlainLyrics(lrclibData.plainLyrics, dur || 210);
    isSynced = false;
  }

  // Last resort: lyrics.ovh
  if (!parsed) {
    try {
      const res = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(a || rawArtist)}/${encodeURIComponent(t || rawTitle)}`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (res.ok) {
        const d = await res.json();
        if (d?.lyrics) {
          parsed = parsePlainLyrics(d.lyrics, dur || 210);
          isSynced = false;
        }
      }
    } catch (_) {}
  }

  if (parsed && parsed.length > 0) {
    const payload = {
      lyrics: parsed,
      isSynced,
      source: isSynced ? "lrclib_synced" : "plain_text",
    };
    lyricsCache.set(cacheKey, payload);
    return NextResponse.json(payload);
  }

  return NextResponse.json({
    lyrics: [],
    isSynced: false,
    notFound: true,
    message: "Lirik belum tersedia untuk lagu ini",
  });
}
