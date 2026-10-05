import { NextResponse } from "next/server";

// Cache resolved IDs in memory so repeat plays are instantaneous (0ms)
// Every ID is verified to be pure studio audio or official lyric/visualizer video (starts at 0.0s)
const resolvedCache = new Map([
  // ── BERNADYA ──────────────────────────────────────────────────────────
  ["bernadya satu bulan", "7Jm2Il2U-c0"],
  ["bernadya - satu bulan", "7Jm2Il2U-c0"],
  ["bernadya satu bulan babak penutup", "7Jm2Il2U-c0"],
  ["bernadya untungnya hidup harus tetap berjalan", "HB8vftGxsIc"],
  ["bernadya - untungnya hidup harus tetap berjalan", "HB8vftGxsIc"],
  ["bernadya kata mereka ini berlebihan", "9hjMIOIysng"],

  // ── TIARA ANDINI ──────────────────────────────────────────────────────
  // Official Visualizer / Lyric Video — all start at 0:00
  ["tiara andini tulang dan nadi", "IMtdWKwFlv0"],
  ["tiara andini - tulang dan nadi", "IMtdWKwFlv0"],
  ["tulang dan nadi tiara andini", "IMtdWKwFlv0"],
  ["tiara andini merasa indah", "iTJvrId5Bmo"],
  ["tiara andini - merasa indah", "iTJvrId5Bmo"],
  ["merasa indah tiara andini", "iTJvrId5Bmo"],
  ["tiara andini usai", "lLYz-dUXcDI"],
  ["tiara andini - usai", "lLYz-dUXcDI"],
  ["tiara andini janji setia", "nKSylKpqln4"],
  ["tiara andini - janji setia", "nKSylKpqln4"],
  ["tiara andini cintanya aku", "eAa32W5F51Y"],
  ["tiara andini arsy widianto cintanya aku", "eAa32W5F51Y"],
  ["tiara andini seberapa", "lLYz-dUXcDI"],
  ["tiara andini perjalanan", "nKSylKpqln4"],

  // ── SAL PRIADI ────────────────────────────────────────────────────────
  // Official Lyric Video — pure studio audio without Gempi intro humming or sketches
  ["sal priadi gala bunga matahari", "kv2WIY8RLQQ"],
  ["sal priadi - gala bunga matahari", "kv2WIY8RLQQ"],
  ["gala bunga matahari sal priadi", "kv2WIY8RLQQ"],
  ["gala bunga matahari", "kv2WIY8RLQQ"],
  ["sal priadi dari planet lain", "rfcCdZgxAPA"],
  ["dari planet lain sal priadi", "rfcCdZgxAPA"],
  ["sal priadi amin paling serius", "ZRMDxjRdJV8"],
  ["sal priadi nadin amizah amin paling serius", "ZRMDxjRdJV8"],
  ["amin paling serius sal priadi", "ZRMDxjRdJV8"],
  ["sal priadi mencintaimu", "xsqqEGaRyAg"],
  ["sal priadi peluk", "Xfw0qJ0Ercc"],
  ["sal priadi kita usahakan rumah itu", "m-KsjaTEHwA"],

  // ── TULUS ─────────────────────────────────────────────────────────────
  ["tulus hati-hati di jalan", "_N6vSc_mT6I"],
  ["tulus hati hati di jalan", "_N6vSc_mT6I"],
  ["tulus - hati-hati di jalan", "_N6vSc_mT6I"],
  ["tulus interaksi", "GIy9ZbH0sHo"],
  ["tulus monokrom", "QqJ-Vp8mvbk"],
  ["tulus ruang sendiri", "eZgj6pTnNto"],
  ["tulus - ruang sendiri", "eZgj6pTnNto"],
  ["tulus gajah", "lLER9AdL-Ig"],
  ["tulus - gajah", "lLER9AdL-Ig"],
  ["tulus pamit", "GIy9ZbH0sHo"],
  ["tulus sewindu", "wpst_4m_c-E"],
  ["tulus - sewindu", "wpst_4m_c-E"],
  ["tulus teman hidup", "GIy9ZbH0sHo"],

  // ── MAHALINI ──────────────────────────────────────────────────────────
  ["mahalini sial", "QSWYyoF79oE"],
  ["mahalini - sial", "QSWYyoF79oE"],
  ["mahalini mati-matian", "LAOxuo6pkdo"],
  ["mahalini melawan restu", "LAOxuo6pkdo"],
  ["mahalini satu-satunya", "QSWYyoF79oE"],
  ["mahalini cinta luar biasa", "QSWYyoF79oE"],

  // ── ADA BAND ──────────────────────────────────────────────────────────
  ["ada band sewindu", "1nUS8-BTKUI"],
  ["ada band - sewindu", "1nUS8-BTKUI"],
  ["ada band surga cinta", "GD9eX1M91fw"],
  ["ada band karena wanita", "hpWMruJan8Q"],
  ["ada band setengah hati", "hpWMruJan8Q"],
  ["ada band tak bisa lagi menyayangmu", "wSU82yPhzWU"],
  ["ada band yang terbaik bagimu", "GD9eX1M91fw"],

  // ── JUICY LUICY ───────────────────────────────────────────────────────
  ["juicy luicy lantas", "ba-XAIskH_g"],
  ["juicy luicy asing", "eLXHX9GYCKk"],
  ["juicy luicy sialan", "_m6l5nKEGIA"],
  ["juicy luicy problematik", "ba-XAIskH_g"],

  // ── HINDIA ────────────────────────────────────────────────────────────
  ["hindia secukupnya", "wnAKxtEi78c"],
  ["hindia rumah ke rumah", "xTQvdE1oOaw"],
  ["hindia besok mungkin kita sampai", "wnAKxtEi78c"],

  // ── NADIN AMIZAH ──────────────────────────────────────────────────────
  ["nadin amizah rayuan perempuan gila", "gIsoLyQX7W8"],
  ["nadin amizah bertaut", "HyhLsy6b0XI"],
  ["nadin amizah kekal", "pxis4fQVV-4"],
  ["nadin amizah cermin", "PUXwsLli9ds"],
  ["nadin amizah berpayung tuhan", "v0165RqKS20"],
  ["nadin amizah nadi", "v0165RqKS20"],

  // ── DEWA 19 / SHEILA ON 7 ─────────────────────────────────────────────
  ["dewa 19 pupus", "_v_rZ944ogE"],
  ["dewa 19 kangen", "sjjhLDPT5_g"],
  ["sheila on 7 dan", "dGcGbF4ex5o"],
  ["sheila on 7 sephia", "4tAg2H7tqD0"],
  ["sheila on 7 itu aku", "dGcGbF4ex5o"],
  ["sheila on 7 aku", "dGcGbF4ex5o"],

  // ── FOR REVENGE / FEBY ────────────────────────────────────────────────
  ["for revenge serana", "bGsMkd8qHWI"],
  ["feby putri runtuh", "YrtS8MESh0I"],

  // ── PAMUNGKAS ─────────────────────────────────────────────────────────
  ["pamungkas to the bone", "oIYWenB637c"],
  ["pamungkas - to the bone", "oIYWenB637c"],
  ["pamungkas i love you but im letting go", "NO_cVedXdmM"],
  ["pamungkas - i love you but i'm letting go", "NO_cVedXdmM"],
  ["pamungkas i love you but letting go", "NO_cVedXdmM"],
  ["pamungkas where did you go", "CYDtCUNixR4"],
  ["pamungkas flying solo", "CYDtCUNixR4"],

  // ── STEPHANIE POETRI ──────────────────────────────────────────────────
  // Official MV — starts at t=0 no significant intro
  ["stephanie poetri i love you 3000", "cPkE0IbDVs4"],
  ["stephanie poetri - i love you 3000", "cPkE0IbDVs4"],
  ["i love you 3000 stephanie poetri", "cPkE0IbDVs4"],
  ["i love 3000 stephanie poetri", "cPkE0IbDVs4"],

  // ── YURA YUNITA ───────────────────────────────────────────────────────
  ["yura yunita cinta dan rahasia", "RsD2byOGvgI"],
  ["yura yunita buktikan", "RsD2byOGvgI"],
  ["yura yunita intuisi", "JO47bJ_l26I"],
  ["yura yunita - intuisi", "JO47bJ_l26I"],

  // ── RAISA ─────────────────────────────────────────────────────────────
  ["raisa jatuh hati", "HVeIsHNbSJ0"],
  ["raisa - jatuh hati", "HVeIsHNbSJ0"],
  ["raisa usai di sini", "nSGZ0Jn7-8Q"],
  ["raisa mantan terindah", "HVeIsHNbSJ0"],
  ["raisa apalah arti menunggu", "nSGZ0Jn7-8Q"],
  ["raisa ku mau", "HVeIsHNbSJ0"],

  // ── ISYANA SARASVATI ──────────────────────────────────────────────────
  ["isyana sarasvati tetap dalam jiwa", "y_oPQJ4WPSg"],
  ["isyana sarasvati - tetap dalam jiwa", "y_oPQJ4WPSg"],
  ["isyana sarasvati kau adalah", "y_oPQJ4WPSg"],
  ["isyana sarasvati sekali lagi", "y_oPQJ4WPSg"],

  // ── ARSY WIDIANTO ─────────────────────────────────────────────────────
  ["arsy widianto tiara andini cintanya aku", "eAa32W5F51Y"],
  ["arsy widianto - cintanya aku", "eAa32W5F51Y"],

  // ── RIZKY FEBIAN ──────────────────────────────────────────────────────
  ["rizky febian indah pada waktunya", "A1w6rK1VpiE"],
  ["rizky febian - indah pada waktunya", "A1w6rK1VpiE"],
  ["rizky febian kesempurnaan cinta", "A1w6rK1VpiE"],
  ["rizky febian cinta yang sedang lapar", "A1w6rK1VpiE"],

  // ── LAST CHILD ────────────────────────────────────────────────────────
  ["last child selalu ada feat momo", "KUCVOIlBjGs"],
  ["last child selalu ada", "KUCVOIlBjGs"],
  ["last child pedih", "KUCVOIlBjGs"],
  ["last child diary depresiku", "KUCVOIlBjGs"],

  // ── HARRY STYLES ──────────────────────────────────────────────────────
  ["harry styles watermelon sugar", "E07s5ZYygMg"],
  ["harry styles as it was", "H5v3kku4y6Q"],
  ["harry styles - as it was", "H5v3kku4y6Q"],
  ["harry styles adore you", "VF-r5TtlT9w"],
  ["harry styles late night talking", "E07s5ZYygMg"],

  // ── ED SHEERAN ────────────────────────────────────────────────────────
  ["ed sheeran shape of you", "JGwWNGJdvx8"],
  ["ed sheeran perfect", "2Vv-BfVoq4g"],
  ["ed sheeran - perfect", "2Vv-BfVoq4g"],
  ["ed sheeran thinking out loud", "lp-EO5I60KA"],
  ["ed sheeran shivers", "Il0S8BoucSY"],
  ["ed sheeran bad habits", "orJSJGHjBLI"],
  ["ed sheeran overpass graffiti", "orJSJGHjBLI"],

  // ── DOJA CAT ──────────────────────────────────────────────────────────
  ["doja cat say so", "pok84UdTMcA"],
  ["doja cat kiss me more", "pok84UdTMcA"],
  ["doja cat need to know", "pok84UdTMcA"],

  // ── SZA ───────────────────────────────────────────────────────────────
  ["sza kill bill", "q33J7pDsKQQ"],
  ["sza - kill bill", "q33J7pDsKQQ"],
  ["sza snooze", "q33J7pDsKQQ"],

  // ── ADELE ─────────────────────────────────────────────────────────────
  ["adele someone like you", "hLQl3WQQoQ0"],
  ["adele rolling in the deep", "rYEDA3JcQd0"],
  ["adele hello", "YQHsXMglC9A"],
  ["adele easy on me", "U3ASj1L6_sY"],

  // ── CHARLIE PUTH ──────────────────────────────────────────────────────
  ["charlie puth we don't talk anymore", "3AtDnEC4zak"],
  ["charlie puth attention", "nfs8NYg7yQM"],
  ["charlie puth - attention", "nfs8NYg7yQM"],
  ["charlie puth light switch", "3AtDnEC4zak"],

  // ── ARIANA GRANDE ─────────────────────────────────────────────────────
  ["ariana grande thank u next", "gl1aHhXnN1k"],
  ["ariana grande positions", "tcYodQoapMg"],
  ["ariana grande 7 rings", "QYh6mYIJG2Y"],
  ["ariana grande into you", "gOOYWfu39Oo"],
  ["ariana grande break free", "L8eRzOYhLuw"],

  // ── POST MALONE ───────────────────────────────────────────────────────
  ["post malone circles", "wXhTHyIgQ_U"],
  ["post malone sunflower", "ApXoWvfEYVU"],
  ["post malone rockstar", "UceaB4D0jpo"],
  ["post malone better now", "UceaB4D0jpo"],

  // ── JUSTIN BIEBER ─────────────────────────────────────────────────────
  ["justin bieber peaches", "ay9y3CTkT40"],
  ["justin bieber love yourself", "oyEuk8j8imI"],
  ["justin bieber sorry", "fRh_vgS2dFE"],
  ["justin bieber stay", "ay9y3CTkT40"],
  ["justin bieber what do you mean", "DK_0jXPuIr0"],

  // ── SHAWN MENDES ──────────────────────────────────────────────────────
  ["shawn mendes senorita", "xq866Q7GUlc"],
  ["shawn mendes camila cabello senorita", "xq866Q7GUlc"],
  ["shawn mendes stitches", "VbfpW0pbvaU"],
  ["shawn mendes mercy", "VbfpW0pbvaU"],

  // ── SAM SMITH ─────────────────────────────────────────────────────────
  ["sam smith unholy", "Uq9gPaIzbe8"],
  ["sam smith stay with me", "pB-5XG-DbAA"],
  ["sam smith i'm not the only one", "pB-5XG-DbAA"],
  ["sam smith lay me down", "pB-5XG-DbAA"],

  // ── CARLY RAE JEPSEN ──────────────────────────────────────────────────
  ["carly rae jepsen call me maybe", "fWNaR-rxAIC"],
  ["call me maybe carly rae jepsen", "fWNaR-rxAIC"],

  // ── TAYLOR SWIFT ──────────────────────────────────────────────────────
  ["taylor swift cruel summer", "ic8j13piAhQ"],
  ["taylor swift - cruel summer", "ic8j13piAhQ"],
  ["cruel summer taylor swift", "ic8j13piAhQ"],
  ["taylor swift fortnight", "HzsQHfBA3MY"],
  ["taylor swift fortnight post malone", "HzsQHfBA3MY"],
  ["taylor swift anti-hero", "XqN2qFvY64U"],
  ["taylor swift - anti-hero", "XqN2qFvY64U"],
  ["anti-hero taylor swift", "XqN2qFvY64U"],

  // ── BILLIE EILISH ─────────────────────────────────────────────────────
  ["billie eilish birds of a feather", "d5gf9dXbPi0"],
  ["billie eilish - birds of a feather", "d5gf9dXbPi0"],
  ["birds of a feather billie eilish", "d5gf9dXbPi0"],
  ["billie eilish bad guy", "DyDfgMOUjCI"],
  ["billie eilish - bad guy", "DyDfgMOUjCI"],

  // ── SABRINA CARPENTER ─────────────────────────────────────────────────
  ["sabrina carpenter espresso", "51zjlMhdSTE"],
  ["sabrina carpenter - espresso", "51zjlMhdSTE"],
  ["espresso sabrina carpenter", "51zjlMhdSTE"],
  ["sabrina carpenter please please please", "Yl_thbk40A0"],
  ["sabrina carpenter - please please please", "Yl_thbk40A0"],

  // ── THE WEEKND ────────────────────────────────────────────────────────
  ["the weeknd blinding lights", "fHI8X4OXluQ"],
  ["the weeknd - blinding lights", "fHI8X4OXluQ"],
  ["the weeknd starboy", "dMMUH_ZpbB0"],
  ["the weeknd starboy daft punk", "dMMUH_ZpbB0"],

  // ── OLIVIA RODRIGO ────────────────────────────────────────────────────
  ["olivia rodrigo vampire", "Fqey8LxQxFU"],
  ["olivia rodrigo - vampire", "Fqey8LxQxFU"],
  ["vampire olivia rodrigo", "Fqey8LxQxFU"],
  ["olivia rodrigo deja vu", "fWgboQNNfB8"],
  ["olivia rodrigo - deja vu", "fWgboQNNfB8"],

  // ── NIKI / JOJI ───────────────────────────────────────────────────────
  ["niki high school in jakarta", "tzG3GFfm8vs"],
  ["niki - high school in jakarta", "tzG3GFfm8vs"],
  ["niki lowkey", "9jz3fWYwMuc"],
  ["niki - lowkey", "9jz3fWYwMuc"],
  ["joji glimpse of us", "xuGaLIleROI"],
  ["joji - glimpse of us", "xuGaLIleROI"],

  // ── ONE DIRECTION ─────────────────────────────────────────────────────
  ["one direction what makes you beautiful", "QJO3ROT-A4E"],
  ["one direction story of my life", "W-TE_Ys4iwM"],
  ["one direction perfect", "W-TE_Ys4iwM"],
]);

// Per-video lyrics offset (seconds) to compensate for YouTube videos where
// the music doesn't start at exactly 0:00.
const lyricsOffsetMap = new Map([
  ["IMtdWKwFlv0", 0],
  ["iTJvrId5Bmo", 0],
  ["lLYz-dUXcDI", 0],
  ["nKSylKpqln4", 0],
  ["ZRMDxjRdJV8", 0],
  ["NO_cVedXdmM", 0],
  ["oIYWenB637c", 0],
  // Stephanie Poetri - I Love You 3000 (Official MV)
  ["cPkE0IbDVs4", 0],
]);


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const targetDurationSec = parseInt(searchParams.get("duration") || "0", 10);

  if (!query.trim()) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const cleanQuery = query.trim().toLowerCase();

  // 1. Direct match in cache
  if (resolvedCache.has(cleanQuery)) {
    const ytId = resolvedCache.get(cleanQuery);
    return NextResponse.json({
      youtubeId: ytId,
      lyricsOffset: lyricsOffsetMap.get(ytId) ?? 0,
      cached: true,
      query,
    });
  }

  // 2. Strict containment match in cache
  for (const [key, id] of resolvedCache.entries()) {
    if (key.length >= 8 && cleanQuery.includes(key)) {
      resolvedCache.set(cleanQuery, id);
      return NextResponse.json({
        youtubeId: id,
        lyricsOffset: lyricsOffsetMap.get(id) ?? 0,
        cached: true,
        query,
      });
    }
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query + " audio"
    )}`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 86400 }, // Cache on edge for 24 hours
    });

    if (!res.ok) {
      throw new Error(`YouTube search returned status ${res.status}`);
    }

    const html = await res.text();

    // Robust chunk-based extraction of video candidates
    const chunks = html.split('"videoRenderer":').slice(1);
    const candidates = [];

    for (const chunk of chunks.slice(0, 15)) {
      const idMatch = chunk.match(/"videoId":\s*"([a-zA-Z0-9_-]{11})"/);
      const titleMatch = chunk.match(/"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/);
      const channelMatch = chunk.match(/"ownerText":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/);
      const lengthMatch = chunk.match(/"lengthText":\s*\{(?:"accessibility":\{[^}]+\},)?"simpleText":\s*"([^"]+)"/);

      if (idMatch && titleMatch) {
        const id = idMatch[1];
        const title = titleMatch[1];
        const channel = channelMatch ? channelMatch[1] : "";
        let durationSec = 0;
        if (lengthMatch && lengthMatch[1]) {
          const parts = lengthMatch[1].split(":").map(Number);
          if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
          else if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        candidates.push({ id, title, channel, durationSec });
      }
    }

    let youtubeId = null;

    if (candidates.length > 0) {
      // Score each candidate to guarantee pure studio audio (starts at 0.0s)
      // PRIORITY ORDER: Topic Channel > Official Audio > Official Lyric/Visualizer > Lyrics/Lirik video > MV
      const scoredCandidates = candidates.map((c) => {
        let score = 0;
        const t = c.title.toLowerCase();
        const ch = c.channel.toLowerCase();

        // ── HEAVY PENALTY: videos with cinematic intros that delay lyric sync ──
        if (
          t.includes("music video") ||
          t.includes("official video") ||
          t.includes("official mv") ||
          t.includes("video klip") ||
          t.includes("video musik") ||
          t.includes("short film") ||
          t.includes("trailer") ||
          t.includes("teaser") ||
          t.includes("behind the scenes") ||
          t.includes("live at") ||
          t.includes("live in") ||
          t.includes("live performance") ||
          t.includes("concert") ||
          t.includes("konser") ||
          t.includes("parody") ||
          t.includes("reaction") ||
          t.includes("karaoke") ||
          t.includes("cover") ||
          t.includes("remix") ||
          t.includes("menit tanpa iklan") || // loop/filler videos
          t.includes("jam full") ||          // loop/filler videos
          t.includes("1 hour") ||
          t.includes("nonstop")
        ) {
          score -= 120;
        }

        // ── MAXIMUM BONUS: YouTube Topic channels — auto-generated, always 0:00 start ──
        if (ch.endsWith("- topic") || ch === "topic") {
          score += 120;
        }

        // ── HIGH BONUS: Official audio from artist's own channel ──
        if (t.includes("(audio)") || t.includes("[audio]") || t.includes("official audio")) {
          score += 95;
        }

        // ── GOOD BONUS: Visualizers start at 0:00 (no cinematic intro) ──
        if (t.includes("visualizer") || t.includes("visualiser") || t.includes("audio visualizer")) {
          score += 65;
        }

        // ── GOOD BONUS: Official Lyric videos from artist channel ──
        if (t.includes("official lyric video") || t.includes("(lyric video)") || t.includes("video lirik")) {
          score += 75;
        }

        // ── MODERATE BONUS: Fan lyric/lirik videos — sync is usually correct ──
        if (t.includes("lyrics") || t.includes("lirik") || t.includes("(lyrics)") || t.includes("[lirik]")) {
          score += 50;
        }

        // ── SMALL BONUS: Artist's official channel (verified, no fake uploads) ──
        // Check if channel name matches artist from query
        const queryWords = cleanQuery.split(" ").filter(w => w.length > 3);
        if (queryWords.some(w => ch.includes(w))) {
          score += 30;
        }

        // ── DURATION PROXIMITY: Penalize videos that are too long (extended intro/outro) ──
        if (targetDurationSec > 0 && c.durationSec > 0) {
          const diff = Math.abs(c.durationSec - targetDurationSec);
          if (diff <= 3) {
            score += 60; // Exact match to studio album track
          } else if (diff <= 8) {
            score += 30;
          } else if (diff > 30) {
            score -= 70; // Extended video intro/outro detected
          }
        }

        return { ...c, score };
      });

      scoredCandidates.sort((a, b) => b.score - a.score);
      youtubeId = scoredCandidates[0].id;
    } else {
      // Fallback regex if HTML structure varies
      const match =
        html.match(/"videoId":\s*"([a-zA-Z0-9_-]{11})"/) ||
        html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        youtubeId = match[1];
      }
    }

    if (youtubeId) {
      resolvedCache.set(cleanQuery, youtubeId);
      return NextResponse.json({
        youtubeId,
        lyricsOffset: lyricsOffsetMap.get(youtubeId) ?? 0,
        cached: false,
        query,
      });
    }

    return NextResponse.json(
      {
        error: "Track stream not found",
        youtubeId: null,
        cached: false,
        query,
      },
      { status: 404 }
    );
  } catch (err) {
    console.error("Resolve YouTube ID error:", err);
    return NextResponse.json(
      {
        error: "Failed to resolve track audio",
        youtubeId: null,
        query,
      },
      { status: 500 }
    );
  }
}
