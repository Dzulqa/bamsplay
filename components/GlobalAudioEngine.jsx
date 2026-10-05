"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAudio } from "@/context/AudioContext";

/**
 * GlobalAudioEngine
 * Pure headless background audio engine.
 * Streams full studio recording from start to finish completely in the background.
 * Zero YouTube visual UI or docks shown — 100% native Bamsplay feel.
 * Automatically enforces 144p ("tiny") lowest resolution for bandwidth efficiency.
 */
export default function GlobalAudioEngine() {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    audioQuality,
    equalizerPreset,
    audioNormalization,
    audioNormalizationLevel,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    handleTrackEnded,
    registerPlayerEngine,
  } = useAudio();

  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef(null);
  const pendingLoadYtIdRef = useRef(null);
  const activeYtIdRef = useRef(null);
  const timeSyncIntervalRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const currentSongRef = useRef(currentSong);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
  }, [isMuted, volume]);

  // Calculate master dynamic acoustic volume reflecting Quality, EQ and Normalization
  const computeMasterVol = () => {
    if (isMuted) return 0;

    let multiplier = 1.0;

    // 1. Bitrate & Quality Profile
    if (audioQuality === "lossless") {
      multiplier *= 1.15; // 320kbps full dynamic master loudness
    } else if (audioQuality === "high") {
      multiplier *= 1.0;  // 160kbps balanced
    } else if (audioQuality === "normal") {
      multiplier *= 0.85; // 96kbps standard
    } else if (audioQuality === "low") {
      multiplier *= 0.58; // 24kbps data-saver capped loudness
    } else {
      multiplier *= 1.0;
    }

    // 2. Equalizer DSP Acoustic Presence
    if (equalizerPreset === "bass_boost") {
      multiplier *= 1.14; // punchy heavy sub-bass drive
    } else if (equalizerPreset === "rock") {
      multiplier *= 1.18; // maximum aggressive drive
    } else if (equalizerPreset === "vocal") {
      multiplier *= 1.08; // speech & vocal articulation focus
    } else if (equalizerPreset === "pop") {
      multiplier *= 1.04; // bouncy smile curve
    } else if (equalizerPreset === "acoustic") {
      multiplier *= 0.86; // soft organic headroom
    } else if (equalizerPreset === "flat") {
      multiplier *= 0.95; // flat reference
    }

    // 3. Spotify Volume Normalization
    if (audioNormalization) {
      if (audioNormalizationLevel === "loud") {
        multiplier *= 1.18;
      } else if (audioNormalizationLevel === "quiet") {
        multiplier *= 0.70;
      } else {
        multiplier *= 0.90; // normal target
      }
    }

    return Math.max(5, Math.min(100, Math.round(volume * multiplier * 100)));
  };

  // Real-time audio engine adaptation to quality, EQ and normalization changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      try {
        const finalVol = computeMasterVol();
        playerRef.current.setVolume(finalVol);

        if (typeof playerRef.current.setPlaybackQuality === "function") {
          if (audioQuality === "lossless") {
            playerRef.current.setPlaybackQuality("highres");
          } else if (audioQuality === "high") {
            playerRef.current.setPlaybackQuality("hd720");
          } else if (audioQuality === "normal") {
            playerRef.current.setPlaybackQuality("medium");
          } else if (audioQuality === "low") {
            playerRef.current.setPlaybackQuality("tiny");
          } else {
            playerRef.current.setPlaybackQuality("default");
          }
        }
      } catch (_) {}
    }
  }, [volume, isMuted, audioQuality, equalizerPreset, audioNormalization, audioNormalizationLevel]);

  // Load YouTube IFrame Player API in background
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById("yt-iframe-api");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        setIsApiReady(true);
      };

      document.body.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setIsApiReady(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Synchronize playback timeline smoothly (50ms = 20fps for ultra-responsive lyric sync)
  const startTimeSync = () => {
    clearInterval(timeSyncIntervalRef.current);
    timeSyncIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          if (typeof t === "number" && !isNaN(t) && t >= 0) {
            setCurrentTime(t);
          }
          if (typeof d === "number" && !isNaN(d) && d > 30) {
            setDuration(Math.round(d));
          }
        } catch (_) {}
      }
    }, 50);
  };

  const stopTimeSync = () => {
    clearInterval(timeSyncIntervalRef.current);
  };

  // Initialize background player instance
  useEffect(() => {
    if (!isApiReady || typeof window === "undefined" || playerRef.current) return;

    const initialYtId = currentSong?.youtubeId || "";
    if (initialYtId) {
      activeYtIdRef.current = initialYtId;
    }

    try {
      playerRef.current = new window.YT.Player("bamsplay-master-stream-player", {
        height: "100%",
        width: "100%",
        videoId: initialYtId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
          vq: "tiny", // Request 144p lowest resolution at initial handshake
        },
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            const vol = computeMasterVol();
            try {
              event.target.unMute();
              event.target.setVolume(vol);
            } catch (_) {}

            // Handle any play command received before onReady
            if (pendingLoadYtIdRef.current) {
              const pendingId = pendingLoadYtIdRef.current;
              pendingLoadYtIdRef.current = null;
              activeYtIdRef.current = pendingId;
              try {
                event.target.loadVideoById({
                  videoId: pendingId,
                  startSeconds: 0,
                  suggestedQuality: "tiny",
                });
                event.target.playVideo();
                startTimeSync();
              } catch (e) {
                console.warn("Deferred load error:", e);
              }
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              try {
                event.target.unMute();
                const vol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);
                event.target.setVolume(vol);
              } catch (_) {}
              setIsPlaying(true);
              startTimeSync();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              stopTimeSync();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              stopTimeSync();
              handleTrackEnded();
            }
          },
          onError: async (err) => {
            console.warn("Background audio engine notice:", err?.data);
            const current = currentSongRef.current;
            if (!current || !playerRef.current) return;

            // If video restricted (101/150) or missing (100), dynamically resolve alternate video for THIS song
            // NEVER fallback to Bernadya Satu Bulan or any static unrelated song!
            if (err?.data === 101 || err?.data === 150 || err?.data === 100) {
              try {
                const res = await fetch(
                  `/api/music/resolve?q=${encodeURIComponent(
                    current.artist + " " + current.title + " lyrics"
                  )}`
                );
                if (res.ok) {
                  const data = await res.json();
                  if (data?.youtubeId && data.youtubeId !== activeYtIdRef.current) {
                    activeYtIdRef.current = data.youtubeId;
                    current.youtubeId = data.youtubeId;
                    if (typeof data.lyricsOffset === "number") {
                      current.lyricsOffset = data.lyricsOffset;
                    }
                    playerRef.current?.loadVideoById({
                      videoId: data.youtubeId,
                      startSeconds: 0,
                      suggestedQuality: "tiny",
                    });
                    playerRef.current?.playVideo();
                  }
                }
              } catch (e) {
                console.warn("Could not load alternate track for current song:", e);
              }
            }
          },
        },
      });
    } catch (e) {
      console.warn("Failed to instantiate background stream:", e);
    }

    return () => {
      stopTimeSync();
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (_) {}
      }
      playerRef.current = null;
    };
  }, [isApiReady]);

  // Register master controls into AudioContext
  useEffect(() => {
    registerPlayerEngine({
      loadAndPlay: (ytId) => {
        if (!ytId) return;
        activeYtIdRef.current = ytId;

        if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
          try {
            playerRef.current.unMute();
            const vol = computeMasterVol();
            playerRef.current.setVolume(vol);

            const targetQuality =
              audioQuality === "lossless"
                ? "highres"
                : audioQuality === "high"
                ? "hd720"
                : audioQuality === "normal"
                ? "medium"
                : "tiny";

            playerRef.current.loadVideoById({
              videoId: ytId,
              startSeconds: 0,
              suggestedQuality: targetQuality,
            });
            playerRef.current.playVideo();
            setIsPlaying(true);
            startTimeSync();
          } catch (e) {
            console.warn("Error playing background stream:", e);
          }
        } else {
          // If player instance is still booting up, queue it
          pendingLoadYtIdRef.current = ytId;
        }
      },
      play: () => {
        if (playerRef.current && typeof playerRef.current.playVideo === "function") {
          try {
            playerRef.current.unMute();
            const vol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);
            playerRef.current.setVolume(vol);

            const curYt = currentSongRef.current?.youtubeId;
            if (curYt && (!activeYtIdRef.current || activeYtIdRef.current !== curYt)) {
              activeYtIdRef.current = curYt;
              playerRef.current.loadVideoById({
                videoId: curYt,
                startSeconds: 0,
                suggestedQuality: "tiny",
              });
            }

            playerRef.current.playVideo();
            setIsPlaying(true);
            startTimeSync();
          } catch (e) {
            console.warn(e);
          }
        }
      },
      pause: () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
          try {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            stopTimeSync();
          } catch (e) {
            console.warn(e);
          }
        }
      },
      seekTo: (seconds) => {
        if (playerRef.current && typeof playerRef.current.seekTo === "function") {
          try {
            playerRef.current.seekTo(seconds, true);
          } catch (e) {
            console.warn(e);
          }
        }
      },
      setVolume: (vol) => {
        if (playerRef.current && typeof playerRef.current.setVolume === "function") {
          try {
            playerRef.current.setVolume(vol);
          } catch (e) {
            console.warn(e);
          }
        }
      },
    });
  }, [isPlayerReady, registerPlayerEngine, setIsPlaying, setCurrentTime, setDuration]);

  // Sync volume adjustments
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      const vol = isMuted ? 0 : Math.round(volume * 100);
      try {
        playerRef.current.setVolume(vol);
      } catch (_) {}
    }
  }, [volume, isMuted]);

  // 100% Invisible background container:
  // Placed at bottom-right viewport behind the PlayerBar (zIndex 50).
  // Standard 200x200 dimensions ensure Chromium prioritizes the media clock without subpixel throttling.
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "200px",
        height: "200px",
        opacity: 0.001,
        pointerEvents: "none",
        zIndex: 1, // Behind player bar (zIndex: 50)
        overflow: "hidden",
      }}
    >
      <div id="bamsplay-master-stream-player" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
