import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  let targetUrl = audioUrl;

  // If no direct URL provided, try finding the track preview via iTunes API
  if (!targetUrl && title) {
    try {
      const q = encodeURIComponent(`${title} ${artist || ""}`.trim());
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=3&country=ID`);
      if (itunesRes.ok) {
        const data = await itunesRes.json();
        const found = data.results?.find((r) => r.previewUrl);
        if (found?.previewUrl) {
          targetUrl = found.previewUrl;
        }
      }
    } catch (e) {
      console.warn("iTunes lookup for download fallback error:", e);
    }
  }

  if (!targetUrl) {
    return NextResponse.json({ error: "URL audio tidak ditemukan" }, { status: 400 });
  }

  try {
    const audioRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!audioRes.ok) {
      return NextResponse.json(
        { error: `Gagal mengunduh audio: status ${audioRes.status}` },
        { status: audioRes.status }
      );
    }

    const contentType = audioRes.headers.get("content-type") || "audio/mp4";
    const arrayBuffer = await audioRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Audio download error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses unduhan audio" },
      { status: 500 }
    );
  }
}
