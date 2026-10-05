// Bamsplay Offline Audio & Song Storage Engine (IndexedDB)
// Per-Google-Account partitioned music database for offline playback

const DB_NAME = "bamsplay_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "offline_songs";

function sanitizeEmail(email) {
  if (!email) return "guest";
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("by_email", "email", { unique: false });
        store.createIndex("by_songId", "songId", { unique: false });
        store.createIndex("by_downloadedAt", "downloadedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save song audio blob and metadata partitioned by user email
 */
export async function saveSongOffline(email, song, audioBlob, mimeType = "audio/mp4") {
  const safeEmail = sanitizeEmail(email);
  const key = `${safeEmail}::${song.id}`;

  const cleanSong = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album || "Single",
    cover: song.cover || "/default-cover.svg",
    fallbackCover: song.fallbackCover || "/default-cover.svg",
    duration: song.duration || "3:30",
    durationSec: song.durationSec || 210,
    genre: song.genre || "Pop",
    year: song.year || "2024",
    lyrics: Array.isArray(song.lyrics) ? song.lyrics : [],
    lyricsOffset: typeof song.lyricsOffset === "number" ? song.lyricsOffset : 0,
    meaning: song.meaning || null,
    audioQuality: song.audioQuality || "Lossless • 24-bit / 48kHz",
    artistInfo: song.artistInfo || null,
    isOffline: true,
  };

  const record = {
    key,
    email: safeEmail,
    originalEmail: email,
    songId: song.id,
    songData: cleanSong,
    audioBlob,
    mimeType: mimeType || audioBlob.type || "audio/mp4",
    size: audioBlob.size || 0,
    downloadedAt: Date.now(),
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(record);

    putReq.onsuccess = () => resolve(record);
    putReq.onerror = () => reject(putReq.error);
  });
}

/**
 * Retrieve audio Blob and metadata for a specific song and account
 */
export async function getOfflineSongAudio(email, songId) {
  const safeEmail = sanitizeEmail(email);
  const key = `${safeEmail}::${songId}`;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);

    req.onsuccess = () => {
      const record = req.result;
      if (!record || !record.audioBlob) {
        resolve(null);
      } else {
        resolve({
          audioBlob: record.audioBlob,
          mimeType: record.mimeType,
          songData: record.songData,
          size: record.size,
          downloadedAt: record.downloadedAt,
        });
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all downloaded songs metadata for a given user email
 */
export async function getOfflineSongList(email) {
  const safeEmail = sanitizeEmail(email);
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("by_email");
    const req = index.getAll(IDBKeyRange.only(safeEmail));

    req.onsuccess = () => {
      const records = req.result || [];
      const list = records
        .sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0))
        .map((r) => ({
          ...r.songData,
          downloadedAt: r.downloadedAt,
          storageSize: r.size,
          isOffline: true,
        }));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Check if a song is downloaded for a specific user
 */
export async function isSongDownloadedOffline(email, songId) {
  const safeEmail = sanitizeEmail(email);
  const key = `${safeEmail}::${songId}`;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getKey(key);

    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

/**
 * Delete a downloaded song for a specific user
 */
export async function deleteSongOffline(email, songId) {
  const safeEmail = sanitizeEmail(email);
  const key = `${safeEmail}::${songId}`;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all downloaded songs for a specific user
 */
export async function clearAllOfflineSongs(email) {
  const safeEmail = sanitizeEmail(email);
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("by_email");
    const req = index.openCursor(IDBKeyRange.only(safeEmail));

    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve(true);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Calculate total offline storage usage for a user
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export async function getOfflineStorageStats(email) {
  const songs = await getOfflineSongList(email);
  const count = songs.length;
  const totalBytes = songs.reduce((acc, s) => acc + (s.storageSize || 0), 0);
  return {
    count,
    totalBytes,
    formattedSize: formatBytes(totalBytes),
  };
}
