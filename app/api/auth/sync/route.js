import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "user-profiles");

function getProfilePath(email) {
  if (!email || typeof email !== "string") return null;
  // Sanitize email for safe filesystem usage
  const safeEmail = email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
  return path.join(DATA_DIR, `${safeEmail}.json`);
}

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// GET /api/auth/sync?email=user@gmail.com
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    ensureDirectoryExists();
    const filePath = getProfilePath(email);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({
        found: false,
        user: null,
        playlists: null,
        likedSongIds: null,
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      found: true,
      user: data.user || null,
      playlists: data.playlists || [],
      likedSongIds: data.likedSongIds || [],
      customSongs: data.customSongs || [],
      updatedAt: data.updatedAt || null,
    });
  } catch (error) {
    console.error("GET /api/auth/sync error:", error);
    return NextResponse.json({ error: "Failed to read user profile" }, { status: 500 });
  }
}

// POST /api/auth/sync
export async function POST(request) {
  try {
    const body = await request.json();
    const userObj = body.user || {
      email: body.email,
      name: body.name,
      avatar: body.avatar,
    };
    const playlists = body.playlists;
    const likedSongIds = body.likedSongIds;
    const customSongs = body.customSongs;

    if (!userObj || !userObj.email) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    ensureDirectoryExists();
    const filePath = getProfilePath(userObj.email);
    if (!filePath) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let existingAvatar = "";
    if (fs.existsSync(filePath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        existingAvatar = prev?.user?.avatar || "";
      } catch (_) {}
    }

    const payload = {
      user: {
        email: userObj.email.toLowerCase().trim(),
        name: userObj.name || userObj.email.split("@")[0],
        avatar: userObj.avatar || existingAvatar || "",
        provider: "google",
      },
      playlists: Array.isArray(playlists) ? playlists : [],
      likedSongIds: Array.isArray(likedSongIds) ? likedSongIds : [],
      customSongs: Array.isArray(customSongs) ? customSongs : [],
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      user: payload.user,
      savedAt: payload.updatedAt,
    });
  } catch (error) {
    console.error("POST /api/auth/sync error:", error);
    return NextResponse.json({ error: "Failed to save user profile" }, { status: 500 });
  }
}
