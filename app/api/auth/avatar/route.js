import { NextResponse } from "next/server";

// GET /api/auth/avatar?url=<encoded_google_avatar_url>
// Server-side avatar proxy to bypass browser Referer restrictions from Google CDN
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url || !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Only allow verified Google user content hosts
    const parsed = new URL(url);
    const isGoogleHost =
      parsed.hostname === "lh3.googleusercontent.com" ||
      parsed.hostname.endsWith(".googleusercontent.com") ||
      parsed.hostname.endsWith(".google.com");

    if (!isGoogleHost) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch avatar" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Avatar proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
