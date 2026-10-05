"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListMusic,
  ListPlus,
  Laptop2,
  Share2,
} from "lucide-react";

export default function MobilePlayerModal() {
  const {
    currentSong,
    currentPlaylist,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    likedSongIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
    openAddToPlaylistModal,
    isMobilePlayerOpen,
    setIsMobilePlayerOpen,
    navigateTo,
    setIsDeviceModalOpen,
    showToast,
  } = useAudio();

  const [showLyricsCard, setShowLyricsCard] = useState(false);
  const activeLineRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  const cleanLyrics = useMemo(() => {
    return (currentSong?.lyrics || []).filter((l) => {
      if (!l?.text) return false;
      const t = l.text.trim();
      if (
        t.startsWith("♪") ||
        t.endsWith("♪") ||
        (t.startsWith("(") &&
          t.endsWith(")") &&
          (t.toLowerCase().includes("instrumental") ||
            t.toLowerCase().includes("petikan") ||
            t.toLowerCase().includes("intro") ||
            t.toLowerCase().includes("alunan") ||
            t.toLowerCase().includes("dentang") ||
            t.toLowerCase().includes("gesekan") ||
            t.toLowerCase().includes("suasana") ||
            t.toLowerCase().includes("irama") ||
            t.toLowerCase().includes("music") ||
            t.toLowerCase().includes("solo") ||
            t.toLowerCase().includes("gitar")))
      ) {
        return false;
      }
      return true;
    });
  }, [currentSong?.lyrics]);

  const activeIndex = useMemo(() => {
    if (!cleanLyrics || cleanLyrics.length === 0) return -1;

    // Check if lyrics have no time info at all (e.g. legacy entries)
    const hasAnyTime = cleanLyrics.some((l) => typeof l?.time === "number" && !isNaN(l.time));
    if (!hasAnyTime) return -1;

    const offset = Number(currentSong?.lyricsOffset) || 0;
    const t = Math.max(0, currentTime - offset);

    const firstTime = typeof cleanLyrics[0]?.time === "number"
      ? cleanLyrics[0].time
      : parseFloat(cleanLyrics[0]?.time);

    if (isNaN(firstTime) || t < firstTime) return -1;

    for (let i = cleanLyrics.length - 1; i >= 0; i--) {
      const rawTime = cleanLyrics[i].time;
      const lineTime = typeof rawTime === "number" ? rawTime : parseFloat(rawTime);
      if (!isNaN(lineTime) && t >= lineTime) {
        return i;
      }
    }
    return -1;
  }, [cleanLyrics, currentTime, currentSong?.lyricsOffset]);

  // Whether lyrics are unsynced (approximate scroll only)
  const isUnsyncedLyrics = cleanLyrics.length > 0 && cleanLyrics.some((l) => l?.isUnsynced);

  const prevMobileTimeRef = useRef(currentTime);

  // When track changes on mobile, immediately reset lyrics scroll to top
  useEffect(() => {
    if (lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
      lyricsContainerRef.current.scrollTop = 0;
    }
  }, [currentSong?.id]);

  // When track loops or restarts from beginning
  useEffect(() => {
    const prevTime = prevMobileTimeRef.current;
    prevMobileTimeRef.current = currentTime;

    if (prevTime > 6 && currentTime < 2 && lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      lyricsContainerRef.current.scrollTop = 0;
    }
  }, [currentTime]);

  useEffect(() => {
    if (showLyricsCard && lyricsContainerRef.current) {
      if (activeIndex <= 0) {
        lyricsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else if (activeLineRef.current) {
        const lineEl = activeLineRef.current;
        const containerEl = lyricsContainerRef.current;
        const targetScroll = Math.max(
          0,
          lineEl.offsetTop - containerEl.clientHeight / 2 + lineEl.clientHeight / 2
        );
        containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  }, [activeIndex, showLyricsCard]);

  if (!isMobilePlayerOpen || !currentSong) return null;

  const isLiked = likedSongIds.includes(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-[#241747] via-[#120a26] to-[#080512] flex flex-col p-6 animate-in slide-in-from-bottom duration-300 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => setIsMobilePlayerOpen(false)}
          className="p-2 -ml-2 text-white hover:text-purple-300"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center min-w-0 px-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/80 block">
            Memutar Dari {currentPlaylist?.type || "Playlist"}
          </span>
          <span className="text-xs font-bold text-white truncate block">
            {currentPlaylist?.title || "Bamsplay"}
          </span>
        </div>

        <button
          onClick={() => showToast("Tautan lagu disalin ke clipboard", "default")}
          className="p-2 -mr-2 text-white hover:text-purple-300"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Area: Big Cover or Synchronized Lyrics */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 min-h-[260px]">
        {showLyricsCard ? (
          <div
            ref={lyricsContainerRef}
            className="w-full h-80 bg-[#160e2e]/95 rounded-2xl p-4 border border-purple-500/30 overflow-y-auto custom-scrollbar flex flex-col scroll-smooth"
          >
            <div className="sticky top-0 z-10 bg-[#160e2e]/90 backdrop-blur-md flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20 text-xs text-purple-300 font-bold">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Mic2 className="w-3.5 h-3.5 text-purple-400" />
                <span>{isUnsyncedLyrics ? "≈ Lirik Perkiraan" : "Lirik Lagu Sinkron"}</span>
              </div>
              <button
                onClick={() => setShowLyricsCard(false)}
                className="text-white/80 hover:text-white hover:underline text-[11px] font-medium"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3.5 py-2 text-center">
              {cleanLyrics.length === 0 ? (
                <div className="py-16 text-center text-xs text-purple-300/60">
                  Lirik belum tersedia untuk lagu ini
                </div>
              ) : (
                cleanLyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <p
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => !isUnsyncedLyrics && typeof line.time === "number" && seek(line.time + (Number(currentSong?.lyricsOffset) || 0))}
                      className={`transition-colors duration-300 rounded-lg py-1.5 px-2 text-base font-semibold ${isUnsyncedLyrics ? "cursor-default" : "cursor-pointer"} ${
                        isActive
                          ? "text-white"
                          : "text-white/35 hover:text-white/60"
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 relative group">
            <img
              src={currentSong.cover || "/default-cover.svg"}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (currentSong?.fallbackCover && e.currentTarget.src !== currentSong.fallbackCover) {
                  e.currentTarget.src = currentSong.fallbackCover;
                } else if (e.currentTarget.src !== "/default-cover.svg") {
                  e.currentTarget.src = "/default-cover.svg";
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Title & Artist & Like */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0 flex-1 pr-3">
          <h2 className="text-xl font-extrabold text-white truncate">
            {currentSong.title}
          </h2>
          <p className="text-sm font-medium text-[#a39abf] truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => openAddToPlaylistModal(currentSong)}
            className="p-2 text-[#9f96bd] hover:text-purple-300 transition-colors"
            title="Tambahkan ke Playlist"
          >
            <ListPlus className="w-6 h-6" />
          </button>

          <button
            onClick={() => toggleLike(currentSong)}
            className="p-2 text-[#9f96bd] hover:text-white transition-transform active:scale-125"
            title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? "fill-purple-500 text-purple-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrubber & Timestamps */}
      <div className="mb-4">
        <div className="relative py-2 flex items-center">
          <div className="w-full h-1 bg-[#281d45] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
              style={{ width: `${progressPercent}%`, transition: "width 120ms linear" }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#8b82a6] mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2 mb-6">
        <button
          onClick={toggleShuffle}
          className={`p-2 transition-colors ${
            isShuffle ? "text-purple-400" : "text-[#978eb3]"
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={prevTrack}
          className="p-2 text-white active:scale-90 transition-transform"
        >
          <SkipBack className="w-7 h-7 fill-white" />
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white flex items-center justify-center purple-glow-lg active:scale-95 transition-transform shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-white" />
          ) : (
            <Play className="w-7 h-7 fill-white ml-1" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="p-2 text-white active:scale-90 transition-transform"
        >
          <SkipForward className="w-7 h-7 fill-white" />
        </button>

        <button
          onClick={toggleRepeat}
          className={`p-2 transition-colors ${
            repeatMode !== "off" ? "text-purple-400" : "text-[#978eb3]"
          }`}
        >
          {repeatMode === "one" ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Bottom Sub-Actions: Device, Lyrics, Queue */}
      <div className="flex items-center justify-between pt-2 border-t border-[#231742] text-[#978eb3]">
        <button
          onClick={() => setIsDeviceModalOpen(true)}
          className="flex items-center gap-1.5 text-xs hover:text-white"
        >
          <Laptop2 className="w-4 h-4 text-purple-400" />
          <span>Bamsplay Connect</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLyricsCard(!showLyricsCard)}
            className={`p-1.5 rounded-full ${
              showLyricsCard
                ? "text-purple-400 bg-purple-950/60"
                : "hover:text-white"
            }`}
            title="Lirik Lagu"
          >
            <Mic2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setIsMobilePlayerOpen(false);
              navigateTo("queue");
            }}
            className="p-1.5 hover:text-white"
            title="Antrean"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
