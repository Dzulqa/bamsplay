"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { initialSongs, playlistsData, topArtists } from "@/data/musicData";
import {
  saveSongOffline,
  getOfflineSongAudio,
  getOfflineSongList,
  deleteSongOffline,
  clearAllOfflineSongs,
  getOfflineStorageStats,
  isSongDownloadedOffline,
} from "@/lib/offlineStorage";

const AudioContext = createContext(null);

// Helper to safely read from localStorage (SSR-safe)
function readLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Mobile & Capacitor APK detection helper
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.Capacitor !== undefined ||
    window.location.protocol === "capacitor:" ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1)
  );
};

// Fisher-Yates array shuffle helper
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper to pick a random initial song
const getRandomSong = () => {
  if (!initialSongs || initialSongs.length === 0) return null;
  const idx = Math.floor(Math.random() * initialSongs.length);
  return initialSongs[idx] || initialSongs[0];
};

const initialRandomSong = getRandomSong();

export function AudioProvider({ children }) {
  const [songs, setSongs] = useState(initialSongs);
  // Start empty — will be restored from localStorage in the mount effect below
  const [playlists, setPlaylists] = useState(playlistsData);
  const [likedSongIds, setLikedSongIds] = useState([]);

  // Ref that flips to true once we have restored data from localStorage.
  // Persist effects check this ref so they never overwrite storage with
  // the empty initial state before restoration has happened.
  const hasRestoredRef = useRef(false);
  
  // Navigation State
  const [activeView, setActiveView] = useState("home"); // home, search, playlist, artist, lyrics, queue
  const [activeViewData, setActiveViewData] = useState(null); // { playlistId } or { artistId }
  const [historyStack, setHistoryStack] = useState([{ view: "home", data: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Playback State
  const [currentSong, setCurrentSong] = useState(initialRandomSong);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDuration] = useState(initialRandomSong?.durationSec || 192);

  // Unified clock updater: keeps both React state and ref in 100% lockstep
  const setCurrentTime = (time) => {
    if (typeof time !== "number" || isNaN(time)) return;
    currentTimeRef.current = time;
    setCurrentTimeState(time);
  };
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("bamsplay_volume");
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed)) {
            return parsed;
          }
        }
      } catch (_) {}
    }
    return 1.0;
  });
  const [prevVolume, setPrevVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(initialSongs);
  const [userQueue, setUserQueue] = useState([]); // Explicit manual Spotify-style queue
  const [playbackHistory, setPlaybackHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Responsive Panels
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isAudioQualityModalOpen, setIsAudioQualityModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPiPVideo, setIsPiPVideo] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Authentication & Gmail Data Sync States
  const [currentUser, setCurrentUser] = useState({
    name: "Bams",
    email: "bams@gmail.com",
    avatar: "",
    provider: "google",
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  
  // Offline & Downloaded Music States (Partitioned by Google account in IndexedDB)
  const [downloadedSongIds, setDownloadedSongIds] = useState([]);
  const [downloadedSongsList, setDownloadedSongsList] = useState([]);
  const [downloadingMap, setDownloadingMap] = useState({});
  const [downloadStats, setDownloadStats] = useState({ count: 0, totalBytes: 0, formattedSize: "0 MB" });
  const [isOfflineNetwork, setIsOfflineNetwork] = useState(false);

  // Audio Quality, Normalization & EQ States (Deterministic initial states for hydration safety)
  const [audioQuality, setAudioQualityState] = useState("lossless");
  const [audioNormalization, setAudioNormalizationState] = useState(true);
  const [audioNormalizationLevel, setAudioNormalizationLevelState] = useState("normal");
  const [equalizerPreset, setEqualizerPresetState] = useState("bass_boost");

  // Audio & Playback Master Refs (Prevents closure staling and ensures continuous multi-minute playback)
  const audioRef = useRef(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(initialRandomSong?.durationSec || 192);
  const isPlayingRef = useRef(false);
  const currentSongRef = useRef(initialRandomSong);
  const repeatModeRef = useRef("off");
  const isShuffleRef = useRef(false);
  const queueRef = useRef(initialSongs);
  const userQueueRef = useRef([]);
  const playbackHistoryRef = useRef([]);
  const masterTickerRef = useRef(null);

  const currentPlaylistRef = useRef(null);
  const playlistShuffleQueueRef = useRef([]);
  const playlistPlayedSongIdsRef = useRef(new Set());

  // Sync refs with state changes
  useEffect(() => {
    currentPlaylistRef.current = currentPlaylist;
  }, [currentPlaylist]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    userQueueRef.current = userQueue;
  }, [userQueue]);

  useEffect(() => {
    playbackHistoryRef.current = playbackHistory;
  }, [playbackHistory]);  const songsRef = useRef(songs);
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const playlistsRef = useRef(playlistsData);
  const currentUserRef = useRef(null);
  const likedSongIdsRef = useRef([]);

  useEffect(() => {
    playlistsRef.current = playlists;
  }, [playlists]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    likedSongIdsRef.current = likedSongIds;
  }, [likedSongIds]);

  // Register known song(s) so dynamic tracks (e.g. from search, explore, like) persist permanently
  const registerKnownSong = (songOrSongs) => {
    if (!songOrSongs) return;
    const incoming = Array.isArray(songOrSongs) ? songOrSongs : [songOrSongs];
    const valid = incoming.filter((s) => s && s.id);
    if (valid.length === 0) return;

    setSongs((prev) => {
      const map = new Map();
      prev.forEach((s) => s && s.id && map.set(s.id, s));
      valid.forEach((s) => map.set(s.id, s));
      const merged = Array.from(map.values());
      songsRef.current = merged;
      return merged;
    });

    if (typeof window !== "undefined") {
      try {
        const existing = readLS("bamsplay_custom_songs", []);
        const map = new Map();
        if (Array.isArray(existing)) {
          existing.forEach((s) => s && s.id && map.set(s.id, s));
        }
        valid.forEach((s) => map.set(s.id, s));
        const trimmed = Array.from(map.values()).slice(-500);
        window.localStorage.setItem("bamsplay_custom_songs", JSON.stringify(trimmed));

        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_custom_songs`, JSON.stringify(trimmed));
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: playlistsRef.current || playlists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
              customSongs: trimmed,
            }),
          }).catch(() => {});
        }
      } catch (err) {
        console.warn("Persist custom songs notice:", err);
      }
    }
  };

  // ── localStorage restore + sidebar init (runs once on mount, client-only) ───
  useEffect(() => {
    // Open right lyrics companion sidebar by default on desktop screens
    if (typeof window !== "undefined") {
      setIsRightSidebarOpen(window.innerWidth >= 1200);
    }

    const defaultUser = {
      name: "Bams",
      email: "bams@gmail.com",
      avatar: "",
      provider: "google",
    };
    const storedUser = readLS("bamsplay_current_user", defaultUser);
    setCurrentUser(storedUser);
    currentUserRef.current = storedUser;

    const storedAccounts = readLS("bamsplay_saved_accounts", storedUser ? [storedUser] : [defaultUser]);
    setSavedAccounts(storedAccounts);

    const safeEmailKey = storedUser?.email ? storedUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_") : "";
    const userPrefix = safeEmailKey ? `bamsplay_data_${safeEmailKey}_` : "";

    const storedLiked     = readLS(`${userPrefix}liked_songs`, readLS("bamsplay_liked_songs", []));
    const storedPlaylists = readLS(`${userPrefix}playlists`, readLS("bamsplay_playlists", playlistsData));
    const storedCustom    = readLS(`${userPrefix}custom_songs`, readLS("bamsplay_custom_songs", []));
    const storedQuality   = readLS("bamsplay_audio_quality", "lossless");
    const storedNorm      = readLS("bamsplay_audio_norm", true);
    const storedNormLvl   = readLS("bamsplay_audio_norm_lvl", "normal");
    const storedPreset    = readLS("bamsplay_eq_preset", "bass_boost");

    // Restore any previously cached/dynamic songs into songs state
    if (Array.isArray(storedCustom) && storedCustom.length > 0) {
      setSongs((prev) => {
        const map = new Map();
        storedCustom.forEach((s) => s && s.id && map.set(s.id, s));
        prev.forEach((s) => s && s.id && map.set(s.id, s));
        const merged = Array.from(map.values());
        songsRef.current = merged;
        return merged;
      });
    }

    // Apply restored values to state
    setLikedSongIds(storedLiked);
    likedSongIdsRef.current = storedLiked;
    setPlaylists(storedPlaylists);
    playlistsRef.current = storedPlaylists;
    setAudioQualityState(storedQuality);
    setAudioNormalizationState(storedNorm);
    setAudioNormalizationLevelState(storedNormLvl);
    setEqualizerPresetState(storedPreset);
    // Flip the gate AFTER restoring — persist effects will write on the NEXT render
    hasRestoredRef.current = true;

    // Fetch account cloud data from /api/auth/sync if user exists
    if (storedUser?.email) {
      fetch(`/api/auth/sync?email=${encodeURIComponent(storedUser.email)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((cloudData) => {
          if (cloudData && cloudData.found) {
            if (cloudData.user?.avatar) {
              setCurrentUser((prev) => {
                const currentAvatar = prev?.avatar || storedUser?.avatar;
                if (!currentAvatar || currentAvatar !== cloudData.user.avatar) {
                  const updated = { ...(prev || storedUser), avatar: cloudData.user.avatar };
                  currentUserRef.current = updated;
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("bamsplay_current_user", JSON.stringify(updated));
                    const accounts = readLS("bamsplay_saved_accounts", []);
                    const updatedAccs = accounts.map((acc) =>
                      acc.email?.toLowerCase() === updated.email?.toLowerCase()
                        ? { ...acc, avatar: cloudData.user.avatar }
                        : acc
                    );
                    window.localStorage.setItem("bamsplay_saved_accounts", JSON.stringify(updatedAccs));
                    setSavedAccounts(updatedAccs);
                  }
                  return updated;
                }
                return prev;
              });
            }
            if (Array.isArray(cloudData.likedSongIds)) {
              setLikedSongIds((prevLiked) => {
                const merged = Array.from(new Set([...(prevLiked || []), ...cloudData.likedSongIds]));
                likedSongIdsRef.current = merged;
                return merged;
              });
            }
            if (Array.isArray(cloudData.customSongs) && cloudData.customSongs.length > 0) {
              registerKnownSong(cloudData.customSongs);
            }
            if (Array.isArray(cloudData.playlists)) {
              setPlaylists((prevPlaylists) => {
                const map = new Map();
                const likedPl = (prevPlaylists || []).find((p) => p.id === "liked-songs") ||
                  cloudData.playlists.find((p) => p.id === "liked-songs") ||
                  playlistsData[0];
                map.set("liked-songs", likedPl);

                // Add cloud custom playlists
                cloudData.playlists.forEach((p) => {
                  if (p && p.id && p.id !== "liked-songs") {
                    map.set(p.id, p);
                  }
                });

                // Add local custom playlists (local takes priority and will NOT be deleted)
                (prevPlaylists || []).forEach((p) => {
                  if (p && p.id && p.id !== "liked-songs") {
                    map.set(p.id, p);
                  }
                });

                const merged = Array.from(map.values());
                playlistsRef.current = merged;

                if (typeof window !== "undefined") {
                  window.localStorage.setItem("bamsplay_playlists", JSON.stringify(merged));
                  const userKey = storedUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
                  window.localStorage.setItem(`bamsplay_data_${userKey}_playlists`, JSON.stringify(merged));
                  const currentCustom = readLS("bamsplay_custom_songs", []);
                  fetch("/api/auth/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user: storedUser,
                      playlists: merged,
                      likedSongIds: likedSongIdsRef.current || storedLiked,
                      customSongs: currentCustom,
                    }),
                  }).catch(() => {});
                }

                return merged;
              });
            }
          } else {
            // First time saving initial user data to server
            fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user: storedUser,
                playlists: storedPlaylists,
                likedSongIds: storedLiked,
                customSongs: readLS("bamsplay_custom_songs", []),
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    // Select a random song on startup so reopening the app features a fresh random track
    if (!isPlayingRef.current && (!currentSongRef.current || currentSongRef.current.id === "bernadya-1")) {
      const rand = getRandomSong();
      if (rand) {
        setCurrentSong(rand);
        currentSongRef.current = rand;
        const initialDur = rand.durationSec || 192;
        durationRef.current = initialDur;
        setDuration(initialDur);
      }
    }

    // Fetch official real catalog songs from /api/music/explore
    fetch("/api/music/explore")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.songs && data.songs.length > 0) {
          setSongs((prev) => {
            const map = new Map();
            // 1. Explore songs
            data.songs.forEach((s) => s && s.id && map.set(s.id, s));
            // 2. Previously in state (preserves custom songs, liked songs, etc.)
            prev.forEach((s) => s && s.id && map.set(s.id, s));
            // 3. Stored custom songs from localStorage
            const savedCustom = readLS("bamsplay_custom_songs", []);
            if (Array.isArray(savedCustom)) {
              savedCustom.forEach((s) => s && s.id && map.set(s.id, s));
            }
            const merged = Array.from(map.values());
            songsRef.current = merged;
            return merged;
          });
          setQueue((prevQ) => {
            if (prevQ && prevQ.length > 0 && prevQ !== initialSongs) return prevQ;
            return data.songs;
          });
          queueRef.current = data.songs;
          if (!isPlayingRef.current && !currentSongRef.current && data.spotlight) {
            setCurrentSong(data.spotlight);
            currentSongRef.current = data.spotlight;
            const spotDur = data.spotlight.durationSec || 192;
            durationRef.current = spotDur;
            setDuration(spotDur);
          }
        }
      })
      .catch((err) => console.warn("Load explore catalog notice:", err));
  }, []);

  // ── Persist likedSongIds whenever it changes (guarded) ──────────────────────
  useEffect(() => {
    if (!hasRestoredRef.current) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem("bamsplay_liked_songs", JSON.stringify(likedSongIds));
    const activeUser = currentUserRef.current || currentUser;
    if (activeUser?.email) {
      const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_liked_songs`, JSON.stringify(likedSongIds));
      // Cloud sync
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: activeUser,
          playlists: playlistsRef.current || playlists,
          likedSongIds,
        }),
      }).catch(() => {});
    }
  }, [likedSongIds]);

  // ── Persist playlists whenever they change (guarded) ────────────────────────
  useEffect(() => {
    if (!hasRestoredRef.current) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem("bamsplay_playlists", JSON.stringify(playlists));
    const activeUser = currentUserRef.current || currentUser;
    if (activeUser?.email) {
      const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(playlists));
      // Cloud sync
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: activeUser,
          playlists,
          likedSongIds: likedSongIdsRef.current || likedSongIds,
        }),
      }).catch(() => {});
    }
  }, [playlists]);

  // Offline network detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOfflineNetwork(!window.navigator.onLine);

    const handleOnline = () => {
      setIsOfflineNetwork(false);
      showToast("Koneksi internet terhubung kembali", "purple");
    };
    const handleOffline = () => {
      setIsOfflineNetwork(true);
      showToast("Koneksi terputus. Beralih ke Mode Offline", "default");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Global Keyboard Shortcuts (Authentic Spotify Desktop Web UX)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing inside an input or textarea
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seek(Math.min((duration || 100), currentTime + 5));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(0, currentTime - 5));
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "l" || e.key === "L") {
        if (currentSong) {
          e.preventDefault();
          toggleLike(currentSong);
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        navigateTo("search");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSong, currentTime, duration, isPlaying, volume, isMuted]);

  // Master Playback Timeline Ticker (Only active for local uploaded tracks)
  const startMasterTicker = () => {
    clearInterval(masterTickerRef.current);
    masterTickerRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      const dur = durationRef.current || 200;
      const cur = currentTimeRef.current;
      const next = cur + 0.25;

      if (next >= dur) {
        setCurrentTime(dur);
        clearInterval(masterTickerRef.current);
        handleTrackEnded();
      } else {
        setCurrentTime(next);
      }
    }, 250);
  };

  const stopMasterTicker = () => {
    clearInterval(masterTickerRef.current);
  };

  // Volume Normalization helper (Safe LUFS scaling without Web Audio CORS muting)
  const computeEffectiveVolume = (baseVol, muted, norm, normLvl) => {
    if (muted) return 0;
    if (!norm) return baseVol;
    if (normLvl === "loud") return Math.min(1.0, baseVol * 1.25);
    if (normLvl === "quiet") return baseVol * 0.8;
    return baseVol;
  };


  const setEqualizerPreset = (preset) => {
    setEqualizerPresetState(preset);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_eq_preset", JSON.stringify(preset));
    }
  };

  const setAudioNormalization = (val) => {
    setAudioNormalizationState(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_audio_norm", JSON.stringify(val));
    }
  };

  const setAudioNormalizationLevel = (lvl) => {
    setAudioNormalizationLevelState(lvl);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_audio_norm_lvl", JSON.stringify(lvl));
    }
  };

  const setAudioQuality = (q) => {
    setAudioQualityState(q);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_audio_quality", JSON.stringify(q));
    }
  };

  // Initialize Audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;

      const handleLoadedMetadata = () => {
        const isLocal =
          currentSongRef.current?.isLocal ||
          (currentSongRef.current?.audioUrl &&
            currentSongRef.current.audioUrl.startsWith("blob:"));
        if (isLocal) {
          if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
            const actualDur = Math.round(audio.duration);
            durationRef.current = actualDur;
            setDuration(actualDur);
          }
        }
      };

      const handleAudioClipEnded = () => {
        const isLocal =
          currentSongRef.current?.isLocal ||
          (currentSongRef.current?.audioUrl &&
            currentSongRef.current.audioUrl.startsWith("blob:"));
        if (isLocal) {
          handleTrackEnded();
        }
      };

      const handleAudioTimeUpdate = () => {
        const isLocal =
          currentSongRef.current?.isLocal ||
          (currentSongRef.current?.audioUrl &&
            currentSongRef.current.audioUrl.startsWith("blob:"));
        if (isLocal) {
          if (audio.currentTime !== undefined && !isNaN(audio.currentTime)) {
            currentTimeRef.current = audio.currentTime;
            setCurrentTime(audio.currentTime);
          }
        }
      };

      const handleError = (e) => {
        console.warn("Audio playback stream notice:", e);
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleAudioClipEnded);
      audio.addEventListener("timeupdate", handleAudioTimeUpdate);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleAudioClipEnded);
        audio.removeEventListener("timeupdate", handleAudioTimeUpdate);
        audio.removeEventListener("error", handleError);
        audio.pause();
        clearInterval(masterTickerRef.current);
      };
    }
  }, []);

  // Registered by GlobalAudioEngine for enhanced studio playback
  const playerEngineRef = useRef(null);
  const pendingPlayRef = useRef(null);

  const registerPlayerEngine = (engine) => {
    playerEngineRef.current = engine;
    if (pendingPlayRef.current && isPlayingRef.current) {
      const songToPlay = pendingPlayRef.current;
      pendingPlayRef.current = null;
      // Pause fallback preview audio if it was started
      if (audioRef.current && !audioRef.current.paused) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (_) {}
      }
      stopMasterTicker();
      if (songToPlay.youtubeId) {
        engine.loadAndPlay(songToPlay.youtubeId);
      } else {
        fetch(
          `/api/music/resolve?q=${encodeURIComponent(songToPlay.artist + " " + songToPlay.title)}`
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.youtubeId) {
              songToPlay.youtubeId = d.youtubeId;
              if (typeof d.lyricsOffset === "number") {
                songToPlay.lyricsOffset = d.lyricsOffset;
              }
              engine.loadAndPlay(d.youtubeId);
            }
          })
          .catch(console.warn);
      }
    }
  };

  // Update volume
  useEffect(() => {
    const effVol = computeEffectiveVolume(
      volume,
      isMuted,
      audioNormalization,
      audioNormalizationLevel
    );
    if (audioRef.current) {
      audioRef.current.volume = effVol;
    }
    if (playerEngineRef.current) {
      playerEngineRef.current.setVolume(isMuted ? 0 : Math.round(effVol * 100));
    }
  }, [volume, isMuted, audioNormalization, audioNormalizationLevel]);

  // Play a specific song (Guaranteed immediate audio, full track duration)
  const playSong = async (song, playlist = null, customContextQueue = null, keepContext = false) => {
    if (!song) return;

    registerKnownSong(song);

    currentSongRef.current = song;
    setCurrentSong(song);

    // Full studio track duration (e.g. 3:12 / 3:40 / 4:02)
    const authDur = song.durationSec || 200;
    durationRef.current = authDur;
    setDuration(authDur);

    currentTimeRef.current = 0;
    setCurrentTime(0);

    if (!keepContext) {
      if (customContextQueue && Array.isArray(customContextQueue) && customContextQueue.length > 0) {
        const ctxSongs = [...customContextQueue];
        if (playlist) {
          setCurrentPlaylist(playlist);
          currentPlaylistRef.current = playlist;
        }
        if (isShuffleRef.current) {
          const remaining = ctxSongs.filter((s) => s.id !== song.id);
          const shuffled = shuffleArray(remaining);
          playlistShuffleQueueRef.current = shuffled;
          playlistPlayedSongIdsRef.current = new Set([song.id]);
          const newQ = [song, ...shuffled];
          setQueue(newQ);
          queueRef.current = newQ;
        } else {
          setQueue(ctxSongs);
          queueRef.current = ctxSongs;
          playlistShuffleQueueRef.current = [];
        }
      } else if (playlist) {
        setCurrentPlaylist(playlist);
        currentPlaylistRef.current = playlist;
        const pIds =
          playlist.id === "liked-songs" || playlist.isLikedPlaylist
            ? (likedSongIdsRef.current || likedSongIds || playlist.songIds || [])
            : (playlist.songIds || []);
        const playlistSongs = (songsRef.current || songs).filter((s) => pIds.includes(s.id));
        if (playlistSongs.length > 0) {
          if (isShuffleRef.current) {
            const remaining = playlistSongs.filter((s) => s.id !== song.id);
            const shuffled = shuffleArray(remaining);
            playlistShuffleQueueRef.current = shuffled;
            playlistPlayedSongIdsRef.current = new Set([song.id]);
            const newQ = [song, ...shuffled];
            setQueue(newQ);
            queueRef.current = newQ;
          } else {
            setQueue(playlistSongs);
            queueRef.current = playlistSongs;
            playlistShuffleQueueRef.current = [];
          }
        }
      } else {
        // Ensure current song is present in the playback queue
        const curQ = queueRef.current || [];
        const inQueue = curQ.some(
          (s) =>
            s.id === song.id ||
            (s.title?.toLowerCase().trim() === song.title?.toLowerCase().trim() &&
              s.artist?.toLowerCase().trim() === song.artist?.toLowerCase().trim())
        );
        if (!inQueue) {
          const newQ = [...curQ, song];
          setQueue(newQ);
          queueRef.current = newQ;
        }
      }
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const effVol = computeEffectiveVolume(
      volume,
      isMuted,
      audioNormalization,
      audioNormalizationLevel
    );

    // 1. Check if song is downloaded in IndexedDB for the current Google account
    let offlineRecord = null;
    if (
      currentUser?.email &&
      (downloadedSongIds.includes(song.id) || (typeof navigator !== "undefined" && !navigator.onLine))
    ) {
      try {
        offlineRecord = await getOfflineSongAudio(currentUser.email, song.id);
      } catch (err) {
        console.warn("Offline record check error:", err);
      }
    }

    if (offlineRecord?.audioBlob) {
      if (playerEngineRef.current) {
        try {
          playerEngineRef.current.pause();
        } catch (_) {}
      }

      const blobUrl = URL.createObjectURL(offlineRecord.audioBlob);
      const offlineSong = {
        ...song,
        audioUrl: blobUrl,
        isLocal: true,
        isOffline: true,
        lyrics:
          offlineRecord.songData?.lyrics?.length > 0
            ? offlineRecord.songData.lyrics
            : song.lyrics,
        durationSec: offlineRecord.songData?.durationSec || song.durationSec || 200,
        duration: offlineRecord.songData?.duration || song.duration || "3:30",
      };

      currentSongRef.current = offlineSong;
      setCurrentSong(offlineSong);
      const offlineDur = offlineSong.durationSec;
      durationRef.current = offlineDur;
      setDuration(offlineDur);

      if (audioRef.current) {
        try {
          audioRef.current.src = blobUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = effVol;
          audioRef.current.play().catch(console.warn);
        } catch (err) {
          console.warn("Offline audio play error:", err);
        }
      }
      startMasterTicker();
      return;
    }

    // 2. If browser is completely offline and this song is not downloaded locally
    const isLocal =
      song.isLocal ||
      song.isOffline ||
      (song.audioUrl && song.audioUrl.startsWith("blob:"));

    if (typeof navigator !== "undefined" && !navigator.onLine && !isLocal) {
      showToast("Mode Offline: Lagu ini belum diunduh. Silakan putar dari menu 'Lagu Terunduh'.", "default");
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    if (isLocal) {
      if (playerEngineRef.current) {
        try {
          playerEngineRef.current.pause();
        } catch (_) {}
      }
      if (audioRef.current && song.audioUrl) {
        try {
          audioRef.current.src = song.audioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = effVol;
          audioRef.current.play().catch(console.warn);
        } catch (err) {
          console.warn("Local audio error:", err);
        }
      }
      startMasterTicker();
      return;
    }

    // For online songs: stop masterTicker so it NEVER fights with YouTube's live playback clock!
    stopMasterTicker();

    // ALL online catalog / search / explore songs play FULL STUDIO TRACKS to the end via YouTube engine!
    // Clear and pause HTML5 preview clip so it NEVER repeats or loops every 30 seconds!
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
      audioRef.current.src = "";
    }

    if (playerEngineRef.current) {
      let ytId = song.youtubeId;
      if (!ytId) {
        fetch(
          `/api/music/resolve?q=${encodeURIComponent(song.artist + " " + song.title)}&duration=${authDur || song.durationSec || 200}`
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.youtubeId && playerEngineRef.current) {
              song.youtubeId = data.youtubeId;
              if (typeof data.lyricsOffset === "number") {
                song.lyricsOffset = data.lyricsOffset;
                // Push lyricsOffset update into currentSong if this is the active song
                setCurrentSong((prev) =>
                  prev?.id === song.id ? { ...prev, lyricsOffset: data.lyricsOffset } : prev
                );
              }
              if (currentSongRef.current?.id === song.id && isPlayingRef.current) {
                playerEngineRef.current.loadAndPlay(data.youtubeId);
              }
            }
          })
          .catch((err) => console.warn("Resolve YouTube notice:", err));
      } else {
        playerEngineRef.current.loadAndPlay(ytId);
      }
    } else {
      pendingPlayRef.current = song;
      // Immediate fallback to audioUrl so user hears music without delay
      if (audioRef.current && song.audioUrl) {
        try {
          audioRef.current.src = song.audioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = isMobileDevice() ? 1.0 : effVol;
          audioRef.current.play().catch((err) => console.warn("Fallback preview playback notice:", err));
          startMasterTicker();
        } catch (_) {}
      }
    }

    // Auto-fetch authentic real lyrics for any 100M+ song if lyrics are placeholder or missing
    const isPlaceholderLyrics =
      !song.lyrics ||
      song.lyrics.length <= 2 ||
      song.lyrics.some((l) =>
        l.text?.includes("Katalog Global") ||
        l.text?.includes("Intro nada pembuka") ||
        l.text?.includes("Memuat lirik")
      );

    if (isPlaceholderLyrics) {
      fetch(
        `/api/music/lyrics?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(
          song.artist
        )}&duration=${authDur}`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.lyrics && data.lyrics.length > 0) {
            song.lyrics = data.lyrics;
            if (currentSongRef.current?.id === song.id) {
              setCurrentSong((prev) => (prev?.id === song.id ? { ...prev, lyrics: data.lyrics } : prev));
            }
            setSongs((prev) =>
              prev.map((s) => (s.id === song.id ? { ...s, lyrics: data.lyrics } : s))
            );
          }
        })
        .catch((err) => console.warn("Fetch lyrics notice:", err));
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentSongRef.current) return;

    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopMasterTicker();
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (playerEngineRef.current) {
        try {
          playerEngineRef.current.pause();
        } catch (_) {}
      }
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);

      const song = currentSongRef.current;
      const isLocal =
        song.isLocal ||
        (song.audioUrl && song.audioUrl.startsWith("blob:"));

      if (isLocal) {
        startMasterTicker();
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.play().catch(console.warn);
        }
        return;
      }

      stopMasterTicker();
      // Resume YouTube background player (YouTube drives time sync)
      if (playerEngineRef.current) {
        if (song.youtubeId) {
          playerEngineRef.current.play();
        } else {
          fetch(
            `/api/music/resolve?q=${encodeURIComponent(song.artist + " " + song.title)}&duration=${song.durationSec || 200}`
          )
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.youtubeId && playerEngineRef.current) {
                song.youtubeId = d.youtubeId;
                if (typeof d.lyricsOffset === "number") {
                  song.lyricsOffset = d.lyricsOffset;
                  setCurrentSong((prev) =>
                    prev?.id === song.id ? { ...prev, lyricsOffset: d.lyricsOffset } : prev
                  );
                }
                if (isPlayingRef.current) {
                  playerEngineRef.current.loadAndPlay(d.youtubeId);
                }
              }
            })
            .catch(console.warn);
        }
      } else {
        pendingPlayRef.current = song;
        if (audioRef.current && song.audioUrl) {
          try {
            audioRef.current.src = song.audioUrl;
            audioRef.current.play().catch(console.warn);
            startMasterTicker();
          } catch (_) {}
        }
      }
    }
  };

  // Next Track (Spotify-Style Priority Queue: User Queue -> Context Playlist)
  const nextTrack = () => {
    if (repeatModeRef.current === "one") {
      seek(0);
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (currentSongRef.current?.isLocal && audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(console.warn);
      }
      if (playerEngineRef.current) playerEngineRef.current.play();
      return;
    }

    // SPOTIFY PRIORITY 1: Consume next song from explicit User Queue (FIFO)
    if (userQueueRef.current && userQueueRef.current.length > 0) {
      const nextQueuedSong = userQueueRef.current[0];
      const remainingUserQueue = userQueueRef.current.slice(1);
      setUserQueue(remainingUserQueue);
      userQueueRef.current = remainingUserQueue;

      if (currentSongRef.current) {
        playbackHistoryRef.current.push(currentSongRef.current);
        setPlaybackHistory([...playbackHistoryRef.current]);
      }

      // keepContext = true so the underlying playlist/album context is preserved!
      playSong(nextQueuedSong, null, null, true);
      return;
    }

    // SPOTIFY PRIORITY 2: Follow regular active playlist / context queue
    if (isShuffleRef.current) {
      // 1. Play remaining unplayed tracks from the active playlist shuffle queue
      if (playlistShuffleQueueRef.current && playlistShuffleQueueRef.current.length > 0) {
        const nextSong = playlistShuffleQueueRef.current[0];
        const remainingShuffle = playlistShuffleQueueRef.current.slice(1);
        playlistShuffleQueueRef.current = remainingShuffle;
        playlistPlayedSongIdsRef.current.add(nextSong.id);

        const newQueue = [nextSong, ...remainingShuffle];
        setQueue(newQueue);
        queueRef.current = newQueue;

        if (currentSongRef.current) {
          playbackHistoryRef.current.push(currentSongRef.current);
          setPlaybackHistory([...playbackHistoryRef.current]);
        }

        playSong(nextSong, currentPlaylistRef.current || currentPlaylist, null, true);
        return;
      }

      // 2. All songs in the active playlist/favorite list have finished!
      // Transition to random songs from the wider catalog
      const allSongs = songsRef.current || [];
      if (allSongs.length > 0) {
        let unplayedSongs = allSongs.filter(
          (s) => !playlistPlayedSongIdsRef.current.has(s.id) && s.id !== currentSongRef.current?.id
        );
        if (unplayedSongs.length === 0) {
          playlistPlayedSongIdsRef.current = new Set(currentSongRef.current?.id ? [currentSongRef.current.id] : []);
          unplayedSongs = allSongs.filter((s) => s.id !== currentSongRef.current?.id);
        }
        if (unplayedSongs.length === 0) unplayedSongs = allSongs;

        const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
        const randomSong = unplayedSongs[randomIndex];
        playlistPlayedSongIdsRef.current.add(randomSong.id);

        if (currentSongRef.current) {
          playbackHistoryRef.current.push(currentSongRef.current);
          setPlaybackHistory([...playbackHistoryRef.current]);
        }

        showToast("Semua lagu playlist telah diputar • Melanjutkan ke lagu acak", "purple");
        playSong(randomSong, null);
        return;
      }
    }

    // Standard sequential playback (Shuffle is OFF)
    const q = (queueRef.current && queueRef.current.length > 0) ? queueRef.current : (songsRef.current || []);
    if (!q || q.length === 0) return;

    let currentIndex = q.findIndex((s) => s.id === currentSongRef.current?.id);
    if (currentIndex === -1 && currentSongRef.current) {
      const curT = currentSongRef.current.title?.toLowerCase().trim();
      const curA = currentSongRef.current.artist?.toLowerCase().trim();
      currentIndex = q.findIndex(
        (s) => s.title?.toLowerCase().trim() === curT && s.artist?.toLowerCase().trim() === curA
      );
    }

    let nextIndex = 0;
    if (currentIndex !== -1 && currentIndex < q.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (currentIndex === -1) {
      // Fallback: If not found in queue, check songsRef index or default to next
      const allSongs = songsRef.current || [];
      const songIdx = allSongs.findIndex(
        (s) =>
          s.id === currentSongRef.current?.id ||
          (s.title?.toLowerCase().trim() === currentSongRef.current?.title?.toLowerCase().trim() &&
            s.artist?.toLowerCase().trim() === currentSongRef.current?.artist?.toLowerCase().trim())
      );
      if (songIdx !== -1 && songIdx < allSongs.length - 1) {
        if (currentSongRef.current) {
          playbackHistoryRef.current.push(currentSongRef.current);
          setPlaybackHistory([...playbackHistoryRef.current]);
        }
        playSong(allSongs[songIdx + 1], currentPlaylistRef.current || currentPlaylist);
        return;
      }
      nextIndex = 0;
    } else {
      if (repeatModeRef.current === "all") {
        nextIndex = 0;
      } else {
        // Reached end of context queue and repeat is off
        isPlayingRef.current = false;
        setIsPlaying(false);
        stopMasterTicker();
        seek(0);
        return;
      }
    }

    if (currentSongRef.current) {
      playbackHistoryRef.current.push(currentSongRef.current);
      setPlaybackHistory([...playbackHistoryRef.current]);
    }

    playSong(q[nextIndex], currentPlaylistRef.current || currentPlaylist);
  };

  // Previous Track (Spotify History & Playlist rewind)
  const prevTrack = () => {
    if (currentTimeRef.current > 3) {
      seek(0);
      return;
    }

    // SPOTIFY: If we have playback history (e.g. from previous user queue or tracks), go back
    if (playbackHistoryRef.current && playbackHistoryRef.current.length > 0) {
      const prevSong = playbackHistoryRef.current.pop();
      setPlaybackHistory([...playbackHistoryRef.current]);

      if (isShuffleRef.current && currentSongRef.current) {
        playlistShuffleQueueRef.current = [currentSongRef.current, ...playlistShuffleQueueRef.current];
        const newQueue = [prevSong, ...playlistShuffleQueueRef.current];
        setQueue(newQueue);
        queueRef.current = newQueue;
      }

      playSong(prevSong, currentPlaylistRef.current || currentPlaylist, null, true);
      return;
    }

    const q = (queueRef.current && queueRef.current.length > 0) ? queueRef.current : (songsRef.current || []);
    if (!q || q.length === 0) return;

    let currentIndex = q.findIndex((s) => s.id === currentSongRef.current?.id);
    if (currentIndex === -1 && currentSongRef.current) {
      const curT = currentSongRef.current.title?.toLowerCase().trim();
      const curA = currentSongRef.current.artist?.toLowerCase().trim();
      currentIndex = q.findIndex(
        (s) => s.title?.toLowerCase().trim() === curT && s.artist?.toLowerCase().trim() === curA
      );
    }

    let prevIndex = q.length - 1;
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }

    playSong(q[prevIndex], currentPlaylistRef.current || currentPlaylist);
  };

  // Handle Track Ended
  const handleTrackEnded = () => {
    if (repeatModeRef.current === "one") {
      seek(0);
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (currentSongRef.current?.isLocal && audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(console.warn);
      }
      if (playerEngineRef.current) playerEngineRef.current.play();
    } else {
      nextTrack();
    }
  };

  // Seek
  const seek = (seconds) => {
    const maxDur = durationRef.current || 200;
    const validSec = Math.max(0, Math.min(seconds, maxDur));
    setCurrentTime(validSec);

    const isLocalUpload =
      currentSongRef.current?.isLocal ||
      (currentSongRef.current?.audioUrl &&
        currentSongRef.current.audioUrl.startsWith("blob:"));

    if (isLocalUpload && audioRef.current && audioRef.current.src) {
      try {
        audioRef.current.currentTime = validSec;
        if (isPlayingRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(console.warn);
        }
      } catch (e) {
        console.warn("Seek error:", e);
      }
    }

    if (playerEngineRef.current) {
      try {
        playerEngineRef.current.seekTo(validSec);
      } catch (_) {}
    }
  };

  // ── Native Media Session API for Lockscreen & Android Background Audio ──
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentSong) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album || "Bamsplay",
          artwork: [
            {
              src: currentSong.cover || "/bamsplay-logo-circle.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: currentSong.cover || "/bamsplay-logo-circle.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: currentSong.cover || "/bamsplay-logo-circle.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      } catch (err) {
        console.warn("MediaSession metadata error:", err);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch (_) {}

    const actionHandlers = [
      ["play", () => togglePlay()],
      ["pause", () => togglePlay()],
      ["previoustrack", () => prevTrack()],
      ["nexttrack", () => nextTrack()],
      [
        "seekto",
        (details) => {
          if (typeof details.seekTime === "number" && !isNaN(details.seekTime)) {
            seek(details.seekTime);
          }
        },
      ],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (_) {}
    });
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if ("setPositionState" in navigator.mediaSession && duration > 0 && currentTime >= 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, duration),
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch (_) {}
    }
  }, [currentTime, duration]);

  // Official Video / Full Audio Handlers
  const openOfficialVideo = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopMasterTicker();
    setIsVideoModalOpen(true);
  };

  const closeOfficialVideo = () => {
    setIsVideoModalOpen(false);
    setIsPiPVideo(false);
  };

  const togglePiPVideo = () => {
    setIsPiPVideo((prev) => !prev);
  };

  // Volume
  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeState(prevVolume > 0 ? prevVolume : 0.5);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolumeState(0);
    }
  };

  // Like / Save Song (Favorites)
  const toggleLike = (songOrId) => {
    const songId = typeof songOrId === "object" ? songOrId?.id : songOrId;
    let songObj = typeof songOrId === "object" ? songOrId : (songsRef.current || songs).find((s) => s.id === songId);

    // If songObj is present, register it permanently
    if (songObj) {
      registerKnownSong(songObj);
    } else if (songId) {
      // Self-heal: fetch song metadata from API by ID
      fetch(`/api/music/search?id=${encodeURIComponent(songId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.songs && data.songs.length > 0) {
            registerKnownSong(data.songs[0]);
          }
        })
        .catch(() => {});
    }

    setLikedSongIds((prev) => {
      const isLiked = prev.includes(songId);
      const next = isLiked ? prev.filter((id) => id !== songId) : [songId, ...prev];
      likedSongIdsRef.current = next;

      // Update Liked Songs Playlist in state and ref
      setPlaylists((plist) => {
        const updated = plist.map((p) =>
          p.id === "liked-songs"
            ? { ...p, totalSongs: next.length, songIds: next }
            : p
        );
        playlistsRef.current = updated;
        return updated;
      });

      showToast(
        isLiked ? "Dihapus dari Lagu Favorit" : "Disimpan ke Lagu Favorit",
        "purple"
      );
      return next;
    });
  };

  // Shuffle & Repeat
  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      isShuffleRef.current = next;

      if (next) {
        const currentPl = currentPlaylistRef.current || currentPlaylist;
        let contextSongs = [];
        if (currentPl) {
          const pIds =
            currentPl.id === "liked-songs" || currentPl.isLikedPlaylist
              ? (likedSongIdsRef.current || likedSongIds || currentPl.songIds || [])
              : (currentPl.songIds || []);
          const currentCatalog = songsRef.current || songs;
          contextSongs = pIds.map((id) => currentCatalog.find((s) => s.id === id)).filter(Boolean);
        } else if (queueRef.current && queueRef.current.length > 1) {
          contextSongs = queueRef.current;
        }

        if (contextSongs.length > 0 && currentSongRef.current) {
          const remaining = contextSongs.filter(
            (s) => s.id !== currentSongRef.current?.id && !playlistPlayedSongIdsRef.current?.has(s.id)
          );
          const pool = remaining.length > 0 ? remaining : contextSongs.filter((s) => s.id !== currentSongRef.current?.id);
          const shuffled = shuffleArray(pool);
          playlistShuffleQueueRef.current = shuffled;
          playlistPlayedSongIdsRef.current.add(currentSongRef.current.id);
          const newQ = [currentSongRef.current, ...shuffled];
          setQueue(newQ);
          queueRef.current = newQ;
        }
        showToast("Putar acak playlist diaktifkan", "purple");
      } else {
        playlistShuffleQueueRef.current = [];
        const currentPl = currentPlaylistRef.current || currentPlaylist;
        if (currentPl) {
          const pIds =
            currentPl.id === "liked-songs" || currentPl.isLikedPlaylist
              ? (likedSongIdsRef.current || likedSongIds || currentPl.songIds || [])
              : (currentPl.songIds || []);
          const currentCatalog = songsRef.current || songs;
          const naturalSongs = pIds.map((id) => currentCatalog.find((s) => s.id === id)).filter(Boolean);
          if (naturalSongs.length > 0) {
            setQueue(naturalSongs);
            queueRef.current = naturalSongs;
          }
        }
        showToast("Putar acak dinonaktifkan", "default");
      }

      return next;
    });
  };

  const playShufflePlaylist = (playlist, songList = null) => {
    let list = songList && songList.length > 0 ? songList : [];
    if (list.length === 0 && playlist) {
      const pIds =
        playlist.id === "liked-songs" || playlist.isLikedPlaylist
          ? (likedSongIdsRef.current || likedSongIds || playlist.songIds || [])
          : (playlist.songIds || []);
      const currentCatalog = songsRef.current || songs;
      list = pIds.map((id) => currentCatalog.find((s) => s.id === id)).filter(Boolean);
    }
    if (!list || list.length === 0) return;

    setIsShuffle(true);
    isShuffleRef.current = true;
    const randomIndex = Math.floor(Math.random() * list.length);
    const startSong = list[randomIndex];
    playSong(startSong, playlist, list);
    showToast(`Memutar acak: ${playlist?.title || "Playlist"}`, "purple");
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") {
        showToast("Ulangi semua aktif", "default");
        return "all";
      }
      if (prev === "all") {
        showToast("Ulangi satu aktif", "default");
        return "one";
      }
      showToast("Ulangi nonaktif", "default");
      return "off";
    });
  };

  // Add to Queue (Spotify-Style Next or End of User Queue)
  const addToQueue = (song, playNext = false) => {
    if (!song) return;

    setUserQueue((prev) => {
      let updated;
      if (playNext) {
        updated = [song, ...prev];
      } else {
        updated = [...prev, song];
      }
      userQueueRef.current = updated;
      return updated;
    });

    const currentLen = (userQueueRef.current?.length || 0);
    showToast(
      playNext
        ? `Akan diputar berikutnya: ${song.title}`
        : `Ditambahkan ke Antrean (${currentLen}): ${song.title}`,
      "purple"
    );
  };

  const removeFromUserQueue = (index) => {
    setUserQueue((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      userQueueRef.current = updated;
      return updated;
    });
    showToast("Lagu dihapus dari antrean", "default");
  };

  const removeFromQueue = (index, isFromUserQueue = true) => {
    if (isFromUserQueue) {
      removeFromUserQueue(index);
    } else {
      setQueue((prev) => {
        const q = prev.filter((_, i) => i !== index);
        queueRef.current = q;
        return q;
      });
      showToast("Lagu dihapus dari daftar putar", "default");
    }
  };

  const clearUserQueue = () => {
    setUserQueue([]);
    userQueueRef.current = [];
    showToast("Antrean berhasil dikosongkan", "default");
  };

  const clearQueue = () => {
    clearUserQueue();
  };

  const moveInUserQueue = (fromIndex, toIndex) => {
    setUserQueue((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const item = prev[fromIndex];
      const copy = [...prev];
      copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      userQueueRef.current = copy;
      return copy;
    });
  };

  const playFromUserQueue = (index) => {
    if (index < 0 || index >= userQueueRef.current.length) return;
    const targetSong = userQueueRef.current[index];
    const updated = userQueueRef.current.filter((_, i) => i !== index);
    setUserQueue(updated);
    userQueueRef.current = updated;

    if (currentSongRef.current) {
      playbackHistoryRef.current.push(currentSongRef.current);
      setPlaybackHistory([...playbackHistoryRef.current]);
    }

    playSong(targetSong, null, null, true);
  };

  // Navigation functions (Back / Forward / Direct)
  const navigateTo = (view, data = null) => {
    const nextStack = historyStack.slice(0, historyIndex + 1);
    nextStack.push({ view, data });
    setHistoryStack(nextStack);
    setHistoryIndex(nextStack.length - 1);
    setActiveView(view);
    setActiveViewData(data);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setActiveView(prev.view);
      setActiveViewData(prev.data);
    }
  };

  const goForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setActiveView(next.view);
      setActiveViewData(next.data);
    }
  };

  // Add to Playlist Modal Controls
  const openAddToPlaylistModal = (song) => {
    if (!song) return;
    setSongs((prev) => {
      if (!prev.find((s) => s.id === song.id)) {
        return [song, ...prev];
      }
      return prev;
    });
    setSelectedSongForPlaylist(song);
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedSongForPlaylist(null);
  };

  // Delete Playlist Modal Controls
  const openDeletePlaylistModal = (playlist) => {
    if (!playlist || playlist.id === "liked-songs") return;
    setPlaylistToDelete(playlist);
    setIsDeletePlaylistModalOpen(true);
  };

  const closeDeletePlaylistModal = () => {
    setIsDeletePlaylistModalOpen(false);
    setPlaylistToDelete(null);
  };

  // Edit Playlist Modal Controls
  const openEditPlaylistModal = (playlist) => {
    if (!playlist || playlist.id === "liked-songs") return;
    setPlaylistToEdit(playlist);
    setIsEditPlaylistModalOpen(true);
  };

  const closeEditPlaylistModal = () => {
    setIsEditPlaylistModalOpen(false);
    setPlaylistToEdit(null);
  };

  // Add song to playlist
  const addSongToPlaylist = (songOrId, playlistId) => {
    const songId = typeof songOrId === "object" ? songOrId?.id : songOrId;
    let songObj = typeof songOrId === "object" ? songOrId : (songsRef.current || songs).find((s) => s.id === songId);

    if (songObj) {
      registerKnownSong(songObj);
    } else if (songId) {
      fetch(`/api/music/search?id=${encodeURIComponent(songId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.songs && data.songs.length > 0) {
            registerKnownSong(data.songs[0]);
          }
        })
        .catch(() => {});
    }

    // Special case: If user adds to "liked-songs", redirect cleanly to toggleLike
    if (playlistId === "liked-songs") {
      const isLiked = (likedSongIdsRef.current || likedSongIds || []).includes(songId);
      if (!isLiked) {
        toggleLike(songObj || songId);
      } else {
        showToast('Lagu sudah ada di playlist "Lagu Favorit"', "default");
      }
      return;
    }

    const targetPlaylist = (playlistsRef.current || playlists || []).find((p) => p.id === playlistId);
    const targetPlaylistTitle = targetPlaylist?.title || "Playlist";
    let alreadyInPlaylist = (targetPlaylist?.songIds || []).includes(songId);

    setPlaylists((prev) => {
      const nextPlaylists = prev.map((pl) => {
        if (pl.id === playlistId) {
          const currentIds = pl.songIds || [];
          if (currentIds.includes(songId)) {
            alreadyInPlaylist = true;
            return pl;
          }
          const nextIds = [songId, ...currentIds];
          return {
            ...pl,
            songIds: nextIds,
            totalSongs: nextIds.length,
          };
        }
        return pl;
      });

      if (!alreadyInPlaylist && typeof window !== "undefined") {
        window.localStorage.setItem("bamsplay_playlists", JSON.stringify(nextPlaylists));
        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(nextPlaylists));
          const currentCustom = readLS("bamsplay_custom_songs", []);
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: nextPlaylists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
              customSongs: currentCustom,
            }),
          }).catch(() => {});
        }
      }

      playlistsRef.current = nextPlaylists;
      return nextPlaylists;
    });

    if (alreadyInPlaylist) {
      showToast(`Lagu sudah ada di playlist "${targetPlaylistTitle}"`, "default");
    } else {
      showToast(`Lagu telah ditambahkan ke playlist "${targetPlaylistTitle}"`, "purple");
    }
  };

  // Remove song from playlist
  const removeSongFromPlaylist = (songId, playlistId) => {
    if (playlistId === "liked-songs") {
      const isLiked = (likedSongIdsRef.current || likedSongIds || []).includes(songId);
      if (isLiked) {
        toggleLike(songId);
      }
      return;
    }

    const targetPlaylist = (playlistsRef.current || playlists || []).find((p) => p.id === playlistId);
    const targetPlaylistTitle = targetPlaylist?.title || "Playlist";

    setPlaylists((prev) => {
      const nextPlaylists = prev.map((pl) => {
        if (pl.id === playlistId) {
          const nextIds = (pl.songIds || []).filter((id) => id !== songId);
          return {
            ...pl,
            songIds: nextIds,
            totalSongs: nextIds.length,
          };
        }
        return pl;
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("bamsplay_playlists", JSON.stringify(nextPlaylists));
        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(nextPlaylists));
          const currentCustom = readLS("bamsplay_custom_songs", []);
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: nextPlaylists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
              customSongs: currentCustom,
            }),
          }).catch(() => {});
        }
      }

      playlistsRef.current = nextPlaylists;
      return nextPlaylists;
    });
    showToast(`Lagu dihapus dari playlist "${targetPlaylistTitle}"`, "default");
  };

  // Create Playlist (Always appends to existing playlists, never replaces)
  const createNewPlaylist = (title, description = "", initialSong = null) => {
    const newId = `pl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const initialSongIds = initialSong ? [initialSong.id] : [];

    if (initialSong) {
      registerKnownSong(initialSong);
    }

    const currentPlCount = (playlistsRef.current || playlists || []).filter((p) => p.id !== "liked-songs").length;
    const cleanTitle = (title || "").trim() || `Daftar Putar Baru #${currentPlCount + 1}`;

    const newPlaylist = {
      id: newId,
      title: cleanTitle,
      subtitle: "Daftar Putar Pribadi",
      type: "Daftar Putar",
      creator: currentUser?.name || "Bams",
      totalSongs: initialSongIds.length,
      duration: initialSong ? initialSong.duration : "0 min",
      cover: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
      description: description || "Daftar putar yang baru saja kamu buat di Bamsplay.",
      songIds: initialSongIds,
    };

    setPlaylists((prev) => {
      // Retain all existing playlists and prepend the new one
      const existingWithoutDupe = (prev || []).filter((p) => p.id !== newId);
      const nextPlaylists = [newPlaylist, ...existingWithoutDupe];

      // Immediately write to local storage & cloud to avoid any race conditions
      if (typeof window !== "undefined") {
        window.localStorage.setItem("bamsplay_playlists", JSON.stringify(nextPlaylists));
        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(nextPlaylists));
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: nextPlaylists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
            }),
          }).catch(() => {});
        }
      }

      playlistsRef.current = nextPlaylists;
      return nextPlaylists;
    });

    showToast(`Daftar putar "${newPlaylist.title}" berhasil dibuat!`, "purple");
    return newPlaylist;
  };

  // Delete Custom Playlist
  const deletePlaylist = (playlistId) => {
    if (!playlistId || playlistId === "liked-songs") return;

    let deletedTitle = "";
    setPlaylists((prev) => {
      const target = (prev || []).find((p) => p.id === playlistId);
      if (target) deletedTitle = target.title;
      const nextPlaylists = (prev || []).filter((p) => p.id !== playlistId);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("bamsplay_playlists", JSON.stringify(nextPlaylists));
        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(nextPlaylists));
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: nextPlaylists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
            }),
          }).catch(() => {});
        }
      }

      playlistsRef.current = nextPlaylists;
      return nextPlaylists;
    });

    closeDeletePlaylistModal();

    if (activeView === "playlist" && activeViewData?.playlistId === playlistId) {
      navigateTo("home");
    }

    showToast(`Playlist "${deletedTitle || "Playlist"}" berhasil dihapus`, "default");
  };

  // Update/Edit Custom Playlist
  const updatePlaylist = (playlistId, { title, description }) => {
    if (!playlistId || playlistId === "liked-songs") return;

    let updatedTitle = "";
    setPlaylists((prev) => {
      const nextPlaylists = (prev || []).map((p) => {
        if (p.id === playlistId) {
          updatedTitle = (title || "").trim() || p.title;
          return {
            ...p,
            title: updatedTitle,
            description: description !== undefined ? description.trim() : p.description,
          };
        }
        return p;
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("bamsplay_playlists", JSON.stringify(nextPlaylists));
        const activeUser = currentUserRef.current || currentUser;
        if (activeUser?.email) {
          const safeEmailKey = activeUser.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          window.localStorage.setItem(`bamsplay_data_${safeEmailKey}_playlists`, JSON.stringify(nextPlaylists));
          fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: activeUser,
              playlists: nextPlaylists,
              likedSongIds: likedSongIdsRef.current || likedSongIds || [],
            }),
          }).catch(() => {});
        }
      }

      playlistsRef.current = nextPlaylists;
      return nextPlaylists;
    });

    closeEditPlaylistModal();
    showToast(`Playlist "${updatedTitle}" berhasil diperbarui`, "purple");
  };

  // Add Local Audio Files (Spotify Local Files feature)
  const addLocalSongs = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newSongs = [];

    Array.from(fileList).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
      const lower = cleanFileName.toLowerCase();

      // Check if file name matches any of our catalog hits
      const matched = songs.find(
        (s) =>
          lower.includes(s.title.toLowerCase()) ||
          s.title.toLowerCase().includes(lower) ||
          lower.includes(s.artist.toLowerCase())
      );

      const songObj = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: matched ? matched.title : cleanFileName,
        artist: matched ? matched.artist : "File Lokal",
        album: matched ? matched.album : "Penyimpanan Perangkat",
        duration: "03:30",
        durationSec: 210,
        cover:
          matched?.cover ||
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        audioUrl: objectUrl,
        genre: matched?.genre || "Audio Lokal",
        year: "2024",
        addedDate: "Hari ini",
        plays: "File Lokal",
        vibe: "pop",
        audioQuality: "Master Audio • File Lokal Penuh",
        isLocal: true,
        artistInfo: matched?.artistInfo || {
          name: "File Lokal",
          monthlyListeners: "Koleksi Pribadi",
          bio: "Diputar langsung dari penyimpanan perangkat Anda.",
          avatar:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
          verified: true,
        },
        lyrics: matched?.lyrics || [
          { time: 0, text: `♪ Memutar file lokal: ${cleanFileName} ♪` },
          { time: 5, text: "♪ Kualitas audio penuh langsung dari perangkat Anda ♪" },
        ],
      };

      newSongs.push(songObj);
    });

    if (newSongs.length > 0) {
      setSongs((prev) => [...newSongs, ...prev]);

      // Add to or create Local Files playlist
      setPlaylists((prev) => {
        const existing = prev.find((p) => p.id === "pl-local-files");
        if (existing) {
          return prev.map((p) =>
            p.id === "pl-local-files"
              ? {
                  ...p,
                  totalSongs: p.totalSongs + newSongs.length,
                  songIds: [...newSongs.map((s) => s.id), ...p.songIds],
                }
              : p
          );
        } else {
          return [
            {
              id: "pl-local-files",
              title: "File Musik Lokal",
              subtitle: "Koleksi dari Perangkat",
              type: "Koleksi Lokal",
              creator: "Saya",
              totalSongs: newSongs.length,
              duration: `${newSongs.length * 3} min`,
              cover: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
              description:
                "Kumpulan file audio asli yang diunggah langsung dari penyimpanan perangkat Anda.",
              songIds: newSongs.map((s) => s.id),
            },
            ...prev,
          ];
        }
      });

      playSong(newSongs[0]);
      showToast(
        `${newSongs.length} lagu lokal berhasil dimuat & diputar! 🎵`,
        "purple"
      );
    }
  };

  // Update song lyrics dynamically (for 100M+ real lyrics sync)
  const updateSongLyrics = (songId, newLyrics) => {
    if (!songId || !newLyrics || newLyrics.length === 0) return;
    if (currentSongRef.current?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, lyrics: newLyrics } : prev));
    }
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, lyrics: newLyrics } : s))
    );
  };

  // Toast notification helper
  const showToast = (message, type = "default") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Google / Gmail Authentication & Per-Account Data Switcher
  const loginWithGoogle = async (emailInput, nameInput = "", avatarInput = "") => {
    if (!emailInput) return;
    const cleanEmail = emailInput.trim().toLowerCase();
    const defaultName = cleanEmail.split("@")[0];
    const cleanName =
      nameInput && nameInput.trim()
        ? nameInput.trim()
        : defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    const newUser = {
      name: cleanName,
      email: cleanEmail,
      avatar: avatarInput || "",
      provider: "google",
    };

    setCurrentUser(newUser);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_current_user", JSON.stringify(newUser));
      const existing = readLS("bamsplay_saved_accounts", []);
      const filtered = existing.filter((a) => a.email.toLowerCase() !== cleanEmail);
      const updatedAccounts = [newUser, ...filtered];
      window.localStorage.setItem("bamsplay_saved_accounts", JSON.stringify(updatedAccounts));
      setSavedAccounts(updatedAccounts);
    }

    const safeEmailKey = cleanEmail.replace(/[^a-z0-9]/g, "_");
    const userPrefix = `bamsplay_data_${safeEmailKey}_`;

    let userLiked = readLS(`${userPrefix}liked_songs`, null);
    let userPlaylists = readLS(`${userPrefix}playlists`, null);
    let userCustom = readLS(`${userPrefix}custom_songs`, null);
    if (Array.isArray(userCustom) && userCustom.length > 0) {
      registerKnownSong(userCustom);
    }

    try {
      const res = await fetch(`/api/auth/sync?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.found) {
          if (cloudData.user?.avatar && !newUser.avatar) {
            newUser.avatar = cloudData.user.avatar;
          }
          if (Array.isArray(cloudData.likedSongIds)) {
            userLiked = Array.from(new Set([...(userLiked || []), ...cloudData.likedSongIds]));
          }
          if (Array.isArray(cloudData.customSongs) && cloudData.customSongs.length > 0) {
            registerKnownSong(cloudData.customSongs);
          }
          if (Array.isArray(cloudData.playlists)) {
            const map = new Map();
            const likedPl = (userPlaylists || []).find((p) => p.id === "liked-songs") ||
              cloudData.playlists.find((p) => p.id === "liked-songs") ||
              playlistsData[0];
            map.set("liked-songs", likedPl);

            cloudData.playlists.forEach((p) => {
              if (p && p.id && p.id !== "liked-songs") map.set(p.id, p);
            });
            (userPlaylists || []).forEach((p) => {
              if (p && p.id && p.id !== "liked-songs") map.set(p.id, p);
            });
            userPlaylists = Array.from(map.values());
          }
        }
      }
    } catch (_) {}

    const finalLiked = userLiked || [];
    const finalPlaylists = userPlaylists && userPlaylists.length > 0 ? userPlaylists : playlistsData;

    setLikedSongIds(finalLiked);
    likedSongIdsRef.current = finalLiked;
    setPlaylists(finalPlaylists);
    playlistsRef.current = finalPlaylists;
    currentUserRef.current = newUser;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(`${userPrefix}liked_songs`, JSON.stringify(finalLiked));
      window.localStorage.setItem(`${userPrefix}playlists`, JSON.stringify(finalPlaylists));
      window.localStorage.setItem("bamsplay_liked_songs", JSON.stringify(finalLiked));
      window.localStorage.setItem("bamsplay_playlists", JSON.stringify(finalPlaylists));
    }

    // Save state to cloud
    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: newUser,
        playlists: finalPlaylists,
        likedSongIds: finalLiked,
        customSongs: readLS("bamsplay_custom_songs", []),
      }),
    }).catch(() => {});

    setIsLoginModalOpen(false);
    refreshDownloadedSongs(cleanEmail);
    showToast(`Masuk dengan akun Google (${cleanEmail})`, "purple");
  };

  const logoutUser = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("bamsplay_current_user");
    }
    setLikedSongIds([]);
    setPlaylists(playlistsData);
    setDownloadedSongIds([]);
    setDownloadedSongsList([]);
    setDownloadStats({ count: 0, totalBytes: 0, formattedSize: "0 MB" });
    showToast("Berhasil keluar dari akun Google", "default");
  };

  const switchAccount = (targetEmail) => {
    const target = savedAccounts.find(
      (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
    );
    if (target) {
      loginWithGoogle(target.email, target.name, target.avatar);
    } else {
      loginWithGoogle(targetEmail);
    }
  };

  // 14-day Username Change Status helper
  const getUsernameChangeStatus = () => {
    if (!currentUser?.lastUsernameChange) {
      return { canChange: true, remainingDays: 0, nextDate: null };
    }
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
    const lastTime = new Date(currentUser.lastUsernameChange).getTime();
    const elapsed = Date.now() - lastTime;

    if (elapsed >= FOURTEEN_DAYS_MS) {
      return { canChange: true, remainingDays: 0, nextDate: null };
    }

    const remainingDays = Math.ceil((FOURTEEN_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000));
    const nextDate = new Date(lastTime + FOURTEEN_DAYS_MS).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return { canChange: false, remainingDays, nextDate };
  };

  // Update Username with 14-Day Cooldown Enforcement
  const updateUsername = (newName) => {
    if (!currentUser?.email) {
      showToast("Kamu harus masuk terlebih dahulu", "default");
      return { success: false, message: "Belum masuk akun" };
    }

    const trimmed = (newName || "").trim();
    if (!trimmed || trimmed.length < 2) {
      showToast("Username minimal 2 karakter", "default");
      return { success: false, message: "Minimal 2 karakter" };
    }
    if (trimmed.length > 25) {
      showToast("Username maksimal 25 karakter", "default");
      return { success: false, message: "Maksimal 25 karakter" };
    }

    const status = getUsernameChangeStatus();
    if (!status.canChange) {
      showToast(`Username hanya bisa diganti 14 hari sekali. Sisa ${status.remainingDays} hari lagi.`, "default");
      return {
        success: false,
        remainingDays: status.remainingDays,
        nextDate: status.nextDate,
        message: `Cooldown aktif: sisa ${status.remainingDays} hari`,
      };
    }

    const updatedUser = {
      ...currentUser,
      name: trimmed,
      lastUsernameChange: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("bamsplay_current_user", JSON.stringify(updatedUser));
      const updatedAccounts = savedAccounts.map((acc) =>
        acc.email.toLowerCase() === updatedUser.email.toLowerCase()
          ? { ...acc, name: trimmed, lastUsernameChange: updatedUser.lastUsernameChange }
          : acc
      );
      setSavedAccounts(updatedAccounts);
      window.localStorage.setItem("bamsplay_saved_accounts", JSON.stringify(updatedAccounts));
    }

    // Server cloud sync
    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: updatedUser,
        playlists,
        likedSongIds,
      }),
    }).catch(() => {});

    showToast(`Username berhasil diubah menjadi "${trimmed}"`, "purple");
    return { success: true };
  };

  // ── Offline & Downloaded Music Engine (Per Google Account) ──────────────────
  const refreshDownloadedSongs = async (email = currentUser?.email) => {
    if (!email || typeof window === "undefined") {
      setDownloadedSongIds([]);
      setDownloadedSongsList([]);
      setDownloadStats({ count: 0, totalBytes: 0, formattedSize: "0 MB" });
      return;
    }
    try {
      const list = await getOfflineSongList(email);
      const ids = list.map((s) => s.id);
      setDownloadedSongIds(ids);
      setDownloadedSongsList(list);
      const stats = await getOfflineStorageStats(email);
      setDownloadStats(stats);
    } catch (err) {
      console.warn("Failed to load offline songs from IndexedDB:", err);
    }
  };

  // Sync offline downloads whenever currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      refreshDownloadedSongs(currentUser.email);
    } else {
      setDownloadedSongIds([]);
      setDownloadedSongsList([]);
      setDownloadStats({ count: 0, totalBytes: 0, formattedSize: "0 MB" });
    }
  }, [currentUser?.email]);

  const downloadSong = async (songToDownload) => {
    if (!currentUser?.email) {
      setIsLoginModalOpen(true);
      showToast("Masuk dengan akun Google untuk mengunduh lagu offline", "default");
      return;
    }

    const song = songToDownload || currentSongRef.current;
    if (!song || !song.id) return;

    if (downloadedSongIds.includes(song.id)) {
      showToast(`"${song.title}" sudah tersimpan offline untuk akun ${currentUser.email}`, "default");
      return;
    }

    setDownloadingMap((prev) => ({ ...prev, [song.id]: true }));
    showToast(`Mengunduh "${song.title}" untuk offline...`, "purple");

    try {
      let audioBlob = null;

      // 1. If it's a blob url
      if (song.audioUrl && song.audioUrl.startsWith("blob:")) {
        try {
          const res = await fetch(song.audioUrl);
          if (res.ok) audioBlob = await res.blob();
        } catch (_) {}
      }

      // 2. Direct fetch preview stream
      if (!audioBlob && song.audioUrl && !song.audioUrl.startsWith("blob:")) {
        try {
          const res = await fetch(song.audioUrl);
          if (res.ok) audioBlob = await res.blob();
        } catch (err) {
          console.warn("Direct stream download notice, fallback to proxy:", err);
        }
      }

      // 3. Fallback to API download proxy
      if (!audioBlob) {
        const proxyUrl = `/api/music/download?url=${encodeURIComponent(
          song.audioUrl || ""
        )}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          audioBlob = await res.blob();
        }
      }

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("Gagal mengambil audio stream untuk lagu ini");
      }

      // Also ensure synchronized lyrics are preserved
      let songWithLyrics = { ...song };
      const isPlaceholder =
        !song.lyrics ||
        song.lyrics.length <= 2 ||
        song.lyrics.some((l) => l.text?.includes("Katalog Global") || l.text?.includes("Intro"));

      if (isPlaceholder) {
        try {
          const lyrRes = await fetch(
            `/api/music/lyrics?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(
              song.artist
            )}`
          );
          if (lyrRes.ok) {
            const lyrData = await lyrRes.json();
            if (lyrData?.lyrics?.length > 0) {
              songWithLyrics.lyrics = lyrData.lyrics;
            }
          }
        } catch (_) {}
      }

      // Save into IndexedDB partitioned by Google account email
      await saveSongOffline(currentUser.email, songWithLyrics, audioBlob);
      await refreshDownloadedSongs(currentUser.email);

      showToast(`✓ "${song.title}" berhasil diunduh! Siap diputar offline`, "purple");
    } catch (err) {
      console.error("Download song error:", err);
      showToast(`Gagal mengunduh "${song.title}": ${err.message || "Koneksi bermasalah"}`, "default");
    } finally {
      setDownloadingMap((prev) => {
        const next = { ...prev };
        delete next[song.id];
        return next;
      });
    }
  };

  const removeDownloadedSong = async (songId) => {
    if (!currentUser?.email) return;
    try {
      await deleteSongOffline(currentUser.email, songId);
      await refreshDownloadedSongs(currentUser.email);
      showToast("Unduhan lagu telah dihapus dari perangkat", "default");
    } catch (err) {
      console.error("Remove download error:", err);
      showToast("Gagal menghapus unduhan", "default");
    }
  };

  const clearAllDownloads = async () => {
    if (!currentUser?.email) return;
    try {
      await clearAllOfflineSongs(currentUser.email);
      await refreshDownloadedSongs(currentUser.email);
      showToast("Semua unduhan akun ini telah dibersihkan", "purple");
    } catch (err) {
      console.error("Clear downloads error:", err);
    }
  };

  const isSongDownloaded = (songId) => {
    return downloadedSongIds.includes(songId);
  };

  return (
    <AudioContext.Provider
      value={{
        songs,
        playlists,
        likedSongIds,
        currentSong,
        currentPlaylist,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        userQueue,
        setUserQueue,
        searchQuery,
        setSearchQuery,
        activeView,
        activeViewData,
        historyIndex,
        historyStack,
        isRightSidebarOpen,
        setIsRightSidebarOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobilePlayerOpen,
        setIsMobilePlayerOpen,
        isDeviceModalOpen,
        setIsDeviceModalOpen,
        isCreatePlaylistModalOpen,
        setIsCreatePlaylistModalOpen,
        playlistToDelete,
        setPlaylistToDelete,
        isDeletePlaylistModalOpen,
        openDeletePlaylistModal,
        closeDeletePlaylistModal,
        deletePlaylist,
        playlistToEdit,
        setPlaylistToEdit,
        isEditPlaylistModalOpen,
        openEditPlaylistModal,
        closeEditPlaylistModal,
        updatePlaylist,
        isAddToPlaylistModalOpen,
        setIsAddToPlaylistModalOpen,
        selectedSongForPlaylist,
        setSelectedSongForPlaylist,
        openAddToPlaylistModal,
        closeAddToPlaylistModal,
        addSongToPlaylist,
        removeSongFromPlaylist,
        isVideoModalOpen,
        setIsVideoModalOpen,
        isAudioQualityModalOpen,
        setIsAudioQualityModalOpen,
        audioQuality,
        setAudioQuality,
        audioNormalization,
        setAudioNormalization,
        audioNormalizationLevel,
        setAudioNormalizationLevel,
        equalizerPreset,
        setEqualizerPreset,
        toastMessage,
        // Authentication & Gmail Sync
        currentUser,
        setCurrentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        savedAccounts,
        loginWithGoogle,
        logoutUser,
        switchAccount,
        updateUsername,
        getUsernameChangeStatus,
        // Offline Music & Downloads
        downloadedSongIds,
        downloadedSongsList,
        downloadingMap,
        downloadStats,
        isOfflineNetwork,
        downloadSong,
        removeDownloadedSong,
        clearAllDownloads,
        isSongDownloaded,
        refreshDownloadedSongs,
        // Actions
        playSong,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleLike,
        toggleShuffle,
        setIsShuffle,
        playShufflePlaylist,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        removeFromUserQueue,
        clearQueue,
        clearUserQueue,
        moveInUserQueue,
        playFromUserQueue,
        navigateTo,
        goBack,
        goForward,
        createNewPlaylist,
        registerKnownSong,
        addLocalSongs,
        updateSongLyrics,
        openOfficialVideo,
        closeOfficialVideo,
        togglePiPVideo,
        registerPlayerEngine,
        setCurrentTime,
        setDuration,
        setIsPlaying,
        handleTrackEnded,
        showToast,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
