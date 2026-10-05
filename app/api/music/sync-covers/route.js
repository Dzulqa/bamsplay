import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { initialSongs } from "@/data/musicData";

export async function GET() {
  const resolved = {};
  const failed = [];

  for (const song of initialSongs) {
    // If it's already a verified mzstatic URL that works (like bernadya-1, bernadya-2, bernadya-3, tulus-1, tulus-2)
    if (
      song.id.startsWith("bernadya-") ||
      song.id === "tulus-1" ||
      song.id === "tulus-2"
    ) {
      resolved[song.id] = song.cover;
      continue;
    }

    try {
      const query = `${song.artist} ${song.title}`;
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=song&limit=1`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const item = data.results?.[0];
        if (item?.artworkUrl100) {
          const highRes = item.artworkUrl100
            .replace(/\/\d+x\d+bb?(\.[a-zA-Z0-9]+)/, "/600x600bb$1")
            .replace(/\/\d+x\d+(\.[a-zA-Z0-9]+)/, "/600x600$1");
          resolved[song.id] = highRes;
        } else {
          failed.push(song.id);
        }
      } else {
        failed.push(song.id);
      }
    } catch (err) {
      failed.push(song.id);
    }
  }

  // Also resolve topArtists
  const artistMap = {
    "art-bernadya": resolved["bernadya-1"],
    "art-tulus": resolved["tulus-1"],
    "art-taylor": resolved["taylor-1"],
    "art-sal": resolved["sal-1"],
    "art-billie": resolved["billie-1"],
    "art-sabrina": resolved["sabrina-1"],
    "art-weeknd": resolved["weeknd-1"],
    "art-juicy": resolved["juicy-1"],
    "art-hindia": resolved["hindia-1"],
    "art-nadin": resolved["nadin-1"],
    "art-for-revenge": resolved["for-revenge-1"],
    "art-mahalini": resolved["mahalini-1"],
  };

  return NextResponse.json({
    total: initialSongs.length,
    resolvedCount: Object.keys(resolved).length,
    failed,
    resolved,
    artistMap,
  });
}
