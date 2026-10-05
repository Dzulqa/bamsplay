import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("term") || "";
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const country = searchParams.get("country") || "ID";

  if (!query.trim()) {
    return NextResponse.json({ songs: [], total: 0 });
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=${Math.min(limit, 50)}&country=${country}`;

    const res = await fetch(itunesUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }, // Cache search queries for 1 hour
    });

    if (!res.ok) {
      throw new Error(`iTunes API responded with status ${res.status}`);
    }

    const data = await res.json();
    const results = data.results || [];

    const formatDuration = (millis) => {
      if (!millis) return "3:30";
      const totalSec = Math.round(millis / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const isSearchingKaraoke = query.toLowerCase().includes("karaoke");

    const getCleanCover = (url) => {
      if (!url) return "/default-cover.svg";
      return url
        .replace(/\/\d+x\d+bb?(\.[a-zA-Z0-9]+)/, "/600x600bb$1")
        .replace(/\/\d+x\d+(\.[a-zA-Z0-9]+)/, "/600x600$1");
    };

    const songs = results
      .filter((track) => {
        if (!track.trackName || !track.artistName) return false;
        if (!isSearchingKaraoke) {
          const lowerArtist = track.artistName.toLowerCase();
          const lowerTitle = track.trackName.toLowerCase();
          if (
            lowerArtist.includes("karaoke") ||
            lowerTitle.includes("originally performed by") ||
            lowerTitle.includes("(karaoke version)")
          ) {
            return false;
          }
        }
        return true;
      })
      .map((track) => {
        const durationSec = track.trackTimeMillis
          ? Math.round(track.trackTimeMillis / 1000)
          : 210;
        const duration = formatDuration(track.trackTimeMillis);
        const cover = getCleanCover(track.artworkUrl100);
        const year = track.releaseDate ? track.releaseDate.substring(0, 4) : "2024";

        return {
          id: `global-${track.trackId}`,
          trackId: track.trackId,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName || track.trackName,
          duration,
          durationSec,
          cover: cover || track.artworkUrl100 || "/default-cover.svg",
          fallbackCover: track.artworkUrl100 || "/default-cover.svg",
          audioUrl: track.previewUrl,
          genre: track.primaryGenreName || "Pop",
          year,
          addedDate: "Katalog Global",
          plays: `${(Math.floor(Math.random() * 60) + 15).toLocaleString("id-ID")}.000.000`,
          vibe: "hits",
          audioQuality: "Master Audio • Lossless 24-bit / 48kHz",
          isGlobalCatalog: true,
          label: track.collectionArtistName || track.artistName,
          artistInfo: {
            name: track.artistName,
            monthlyListeners: "Artis Global Terverifikasi",
            bio: `${track.artistName} adalah salah satu artis terkemuka dengan katalog lagu yang telah didengarkan puluhan juta kali secara global.`,
            avatar: cover || "/default-cover.svg",
            verified: true,
          },
          lyrics: [],
        };
      });

    return NextResponse.json({
      songs,
      total: songs.length,
      query,
    });
  } catch (error) {
    console.error("Global search API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat katalog global", details: error.message, songs: [] },
      { status: 500 }
    );
  }
}
