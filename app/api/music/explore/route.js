import { NextResponse } from "next/server";
import { initialSongs, topArtists, searchCategories } from "@/data/musicData";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";

  const trendingIndo = initialSongs.filter(
    (s) =>
      s.vibe === "senja" ||
      s.vibe === "pop" ||
      [
        "bernadya",
        "tulus",
        "sal priadi",
        "mahalini",
        "juicy luicy",
        "hindia",
        "nadin",
        "dewa",
        "sheila",
        "feby",
        "for revenge",
        "pamungkas",
      ].some((a) => s.artist.toLowerCase().includes(a))
  );

  const trendingGlobal = initialSongs.filter((s) =>
    [
      "bruno",
      "gaga",
      "sabrina",
      "billie",
      "weeknd",
      "taylor",
      "coldplay",
      "arctic",
      "olivia",
      "joji",
      "rex",
    ].some((a) => s.artist.toLowerCase().includes(a))
  );

  const bandRock = initialSongs.filter(
    (s) =>
      s.vibe === "rock" ||
      ["dewa", "sheila", "coldplay", "arctic", "for revenge"].some((a) =>
        s.artist.toLowerCase().includes(a)
      )
  );

  const randomSpotlightIndex = Math.floor(Math.random() * initialSongs.length);
  const spotlight = initialSongs[randomSpotlightIndex] || initialSongs[0];

  const exploreData = {
    spotlight,
    songs: initialSongs,
    trendingIndo,
    trendingGlobal,
    bandRock,
    topArtists,
    categories: searchCategories,
  };

  if (filter === "indo") {
    return NextResponse.json({ ...exploreData, songs: trendingIndo });
  }
  if (filter === "global") {
    return NextResponse.json({ ...exploreData, songs: trendingGlobal });
  }
  if (filter === "rock") {
    return NextResponse.json({ ...exploreData, songs: bandRock });
  }

  return NextResponse.json(exploreData);
}

