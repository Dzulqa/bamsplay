"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { initialSongs, playlistsData, topArtists } from "@/data/musicData";

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
  const [currentSong, setCurrentSong] = useState(initialSongs[0]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDuration] = useState(initialSongs[0].durationSec || 192);

  // Unified clock updater: keeps both React state and ref in 100% lockstep
  const setCurrentTime = (time) => {
    if (typeof time !== "number" || isNaN(time)) return;
    currentTimeRef.current = time;
    setCurrentTimeState(time);
  };
  const [volume, setVolumeState] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(initialSongs);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Responsive Panels
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isAudioQualityModalOpen, setIsAudioQualityModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPiPVideo, setIsPiPVideo] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Audio Quality, Normalization & EQ States (Deterministic initial states for hydration safety)
  const [audioQuality, setAudioQualityState] = useState("lossless");
  const [audioNormalization, setAudioNormalizationState] = useState(true);
  const [audioNormalizationLevel, setAudioNormalizationLevelState] = useState("normal");
  const [equalizerPreset, setEqualizerPresetState] = useState("bass_boost");

  // Audio & Playback Master Refs (Prevents closure staling and ensures continuous multi-minute playback)
  const audioRef = useRef(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(initialSongs[0].durationSec || 192);
  const isPlayingRef = useRef(false);
  const currentSongRef = useRef(initialSongs[0]);
  const repeatModeRef = useRef("off");
  const isShuffleRef = useRef(false);
  const queueRef = useRef(initialSongs);
  const masterTickerRef = useRef(null);

  // Sync refs with state changes
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

  // ── localStorage restore + sidebar init (runs once on mount, client-only) ───
  useEffect(() => {
    // Keep right sidebar closed by default
    setIsRightSidebarOpen(false);

    const storedLiked     = readLS("bamsplay_liked_songs", []);
    const storedPlaylists = readLS("bamsplay_playlists", playlistsData);
    const storedQuality   = readLS("bamsplay_audio_quality", "lossless");
    const storedNorm      = readLS("bamsplay_audio_norm", true);
    const storedNormLvl   = readLS("bamsplay_audio_norm_lvl", "normal");
    const storedPreset    = readLS("bamsplay_eq_preset", "bass_boost");

    // Apply restored values to state
    setLikedSongIds(storedLiked);
    setPlaylists(storedPlaylists);
    setAudioQualityState(storedQuality);
    setAudioNormalizationState(storedNorm);
    setAudioNormalizationLevelState(storedNormLvl);
    setEqualizerPresetState(storedPreset);
    // Flip the gate AFTER restoring — persist effects will write on the NEXT render
    hasRestoredRef.current = true;

    // Fetch official real catalog songs from /api/music/explore
    fetch("/api/music/explore")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.songs && data.songs.length > 0) {
          setSongs(data.songs);
          if (!isPlayingRef.current && data.spotlight) {
            setCurrentSong(data.spotlight);
            currentSongRef.current = data.spotlight;
            setQueue(data.songs);
            queueRef.current = data.songs;
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
    if (!hasRestoredRef.current) return; // skip the empty-initial-state write
    if (typeof window === "undefined") return;
    window.localStorage.setItem("bamsplay_liked_songs", JSON.stringify(likedSongIds));
  }, [likedSongIds]);

  // ── Persist playlists whenever they change (guarded) ────────────────────────
  useEffect(() => {
    if (!hasRestoredRef.current) return; // skip the empty-initial-state write
    if (typeof window === "undefined") return;
    window.localStorage.setItem("bamsplay_playlists", JSON.stringify(playlists));
  }, [playlists]);

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
          toggleLike(currentSong.id);
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
  const playSong = async (song, playlist = null) => {
    if (!song) return;

    // Register into active library if not present
    setSongs((prev) => {
      if (!prev.some((s) => s.id === song.id)) {
        return [song, ...prev];
      }
      return prev;
    });

    currentSongRef.current = song;
    setCurrentSong(song);

    // Full studio track duration (e.g. 3:12 / 3:40 / 4:02)
    const authDur = song.durationSec || 200;
    durationRef.current = authDur;
    setDuration(authDur);

    currentTimeRef.current = 0;
    setCurrentTime(0);

    if (playlist) {
      setCurrentPlaylist(playlist);
      const playlistSongs = songs.filter((s) => playlist.songIds?.includes(s.id));
      if (playlistSongs.length > 0) {
        setQueue(playlistSongs);
        queueRef.current = playlistSongs;
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

    const isLocal =
      song.isLocal ||
      (song.audioUrl && song.audioUrl.startsWith("blob:"));

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
      }
    }
  };

  // Next Track
  const nextTrack = () => {
    const q = queueRef.current;
    if (!q || q.length === 0) return;

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

    let nextIndex = 0;
    const currentIndex = q.findIndex((s) => s.id === currentSongRef.current?.id);

    if (isShuffleRef.current) {
      nextIndex = Math.floor(Math.random() * q.length);
      if (q.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % q.length;
      }
    } else {
      if (currentIndex !== -1 && currentIndex < q.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        if (repeatModeRef.current === "all") {
          nextIndex = 0;
        } else {
          // Reached end and repeat is off
          isPlayingRef.current = false;
          setIsPlaying(false);
          stopMasterTicker();
          seek(0);
          return;
        }
      }
    }

    playSong(q[nextIndex], currentPlaylist);
  };

  // Previous Track
  const prevTrack = () => {
    if (currentTimeRef.current > 3) {
      seek(0);
      return;
    }

    const q = queueRef.current;
    if (!q || q.length === 0) return;
    const currentIndex = q.findIndex((s) => s.id === currentSongRef.current?.id);
    let prevIndex = q.length - 1;

    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }

    playSong(q[prevIndex], currentPlaylist);
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
    const songId = typeof songOrId === "object" ? songOrId.id : songOrId;
    const songObj = typeof songOrId === "object" ? songOrId : songs.find((s) => s.id === songId);

    // If dynamic song from search or cloud catalog, ensure it exists in songs state
    if (songObj) {
      setSongs((prev) => {
        if (!prev.find((s) => s.id === songObj.id)) {
          return [songObj, ...prev];
        }
        return prev;
      });
    }

    setLikedSongIds((prev) => {
      const isLiked = prev.includes(songId);
      const next = isLiked ? prev.filter((id) => id !== songId) : [...prev, songId];
      
      // Update Liked Songs Playlist
      setPlaylists((plist) =>
        plist.map((p) =>
          p.id === "liked-songs"
            ? { ...p, totalSongs: next.length, songIds: next }
            : p
        )
      );

      showToast(
        isLiked ? "Dihapus dari Lagu Favorit" : "Disimpan ke Lagu Favorit",
        "purple"
      );
      return next;
    });
  };

  // Shuffle & Repeat
  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
    showToast(!isShuffle ? "Acak aktif" : "Acak nonaktif", "default");
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

  // Add to Queue (Spotify-Style Next or End of Queue)
  const addToQueue = (song, playNext = false) => {
    if (!song) return;
    setQueue((prev) => {
      const q = [...prev];
      const curId = currentSongRef.current?.id;
      const curIndex = q.findIndex((s) => s.id === curId);
      if (playNext && curIndex !== -1) {
        q.splice(curIndex + 1, 0, song);
      } else {
        q.push(song);
      }
      queueRef.current = q;
      return q;
    });
    showToast(
      playNext
        ? `Akan diputar berikutnya: ${song.title}`
        : `Ditambahkan ke Antrean: ${song.title}`,
      "purple"
    );
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => {
      const q = prev.filter((_, i) => i !== index);
      queueRef.current = q;
      return q;
    });
    showToast("Lagu dihapus dari antrean", "default");
  };

  const clearQueue = () => {
    setQueue((prev) => {
      const cur = currentSongRef.current;
      const q = cur ? [cur] : [];
      queueRef.current = q;
      return q;
    });
    showToast("Antrean berhasil dikosongkan", "default");
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

  // Add song to playlist
  const addSongToPlaylist = (songOrId, playlistId) => {
    const songId = typeof songOrId === "object" ? songOrId.id : songOrId;
    const songObj = typeof songOrId === "object" ? songOrId : songs.find((s) => s.id === songId);

    if (songObj) {
      setSongs((prev) => {
        if (!prev.find((s) => s.id === songObj.id)) {
          return [songObj, ...prev];
        }
        return prev;
      });
    }

    let targetPlaylistTitle = "";
    let alreadyInPlaylist = false;

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          targetPlaylistTitle = pl.title;
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
      })
    );

    if (alreadyInPlaylist) {
      showToast(`Lagu sudah ada di "${targetPlaylistTitle}"`, "default");
    } else {
      showToast(`Ditambahkan ke "${targetPlaylistTitle}"`, "purple");
    }
  };

  // Remove song from playlist
  const removeSongFromPlaylist = (songId, playlistId) => {
    let targetPlaylistTitle = "";
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          targetPlaylistTitle = pl.title;
          const nextIds = (pl.songIds || []).filter((id) => id !== songId);
          return {
            ...pl,
            songIds: nextIds,
            totalSongs: nextIds.length,
          };
        }
        return pl;
      })
    );
    showToast(`Dihapus dari "${targetPlaylistTitle}"`, "default");
  };

  // Create Playlist
  const createNewPlaylist = (title, description = "", initialSong = null) => {
    const newId = `pl-${Date.now()}`;
    const initialSongIds = initialSong ? [initialSong.id] : [];

    if (initialSong) {
      setSongs((prev) => {
        if (!prev.find((s) => s.id === initialSong.id)) {
          return [initialSong, ...prev];
        }
        return prev;
      });
    }

    const newPlaylist = {
      id: newId,
      title: title || `Daftar Putar Baru #${playlists.length + 1}`,
      subtitle: "Daftar Putar Pribadi",
      type: "Daftar Putar",
      creator: "Bams",
      totalSongs: initialSongIds.length,
      duration: initialSong ? initialSong.duration : "0 min",
      cover: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
      description: description || "Daftar putar yang baru saja kamu buat di Bamsplay.",
      songIds: initialSongIds,
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    showToast(`Daftar putar "${newPlaylist.title}" berhasil dibuat!`, "purple");
    return newPlaylist;
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
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        navigateTo,
        goBack,
        goForward,
        createNewPlaylist,
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
