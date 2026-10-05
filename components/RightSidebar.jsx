"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Mic2,
  Heart,
  Maximize2,
  Sparkles,
  Music2,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";

export default function RightSidebar() {
  const {
    currentSong,
    currentTime,
    duration,
    isPlaying,
    togglePlay,
    seek,
    likedSongIds,
    toggleLike,
    navigateTo,
    updateSongLyrics,
    activeView,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
  } = useAudio();

  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isUserScrolledAway, setIsUserScrolledAway] = useState(false);
  const [isMeaningOpen, setIsMeaningOpen] = useState(false);

  const containerRef = useRef(null);
  const activeLineRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const prevTimeRef = useRef(currentTime);

  const isLiked = currentSong ? likedSongIds.includes(currentSong.id) : false;

  // Format mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Reset scroll to top on song switch
  useEffect(() => {
    setIsUserScrolledAway(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentSong?.id]);

  // Clean lyric lines (remove raw filler instrumental notes)
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
            t.toLowerCase().includes("music") ||
            t.toLowerCase().includes("solo") ||
            t.toLowerCase().includes("gitar")))
      ) {
        return false;
      }
      return true;
    });
  }, [currentSong?.lyrics]);

  // Check if current lyrics are placeholder or missing
  const needsFetch =
    !cleanLyrics ||
    cleanLyrics.length <= 2 ||
    cleanLyrics.some(
      (l) =>
        l.text?.includes("Memuat lirik") ||
        l.text?.includes("Katalog Global") ||
        l.text?.includes("Intro nada pembuka")
    );

  // Auto-fetch authentic lyrics for this song if needed
  useEffect(() => {
    if (!currentSong) return;

    if (needsFetch) {
      setIsLoadingLyrics(true);
      fetch(
        `/api/music/lyrics?title=${encodeURIComponent(
          currentSong.title
        )}&artist=${encodeURIComponent(currentSong.artist)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.lyrics && data.lyrics.length > 0) {
            updateSongLyrics(currentSong.id, data.lyrics, data.lyricsOffset || 0);
          }
        })
        .catch(() => { })
        .finally(() => setIsLoadingLyrics(false));
    }
  }, [currentSong?.id, needsFetch]);

  // Calculate currently active lyric line index based on song currentTime
  const activeIndex = useMemo(() => {
    if (!cleanLyrics || cleanLyrics.length === 0) return -1;

    const hasAnyTime = cleanLyrics.some(
      (l) => typeof l?.time === "number" && !isNaN(l.time)
    );
    if (!hasAnyTime) return -1;

    const offset = Number(currentSong?.lyricsOffset) || 0;
    const t = Math.max(0, currentTime - offset);

    const firstTime =
      typeof cleanLyrics[0]?.time === "number"
        ? cleanLyrics[0].time
        : parseFloat(cleanLyrics[0]?.time);

    if (isNaN(firstTime) || t < firstTime) return -1;

    for (let i = cleanLyrics.length - 1; i >= 0; i--) {
      const rawTime = cleanLyrics[i].time;
      const lineTime =
        typeof rawTime === "number" ? rawTime : parseFloat(rawTime);
      if (!isNaN(lineTime) && t >= lineTime) {
        return i;
      }
    }
    return -1;
  }, [cleanLyrics, currentTime, currentSong?.lyricsOffset]);

  // User manual scroll detection
  const handleUserInteraction = () => {
    setIsUserScrolledAway(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolledAway(false);
    }, 4500);
  };

  const scrollToActive = () => {
    setIsUserScrolledAway(false);
    if (activeIndex <= 0) {
      if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeLineRef.current && containerRef.current) {
      const lineEl = activeLineRef.current;
      const containerEl = containerRef.current;
      const targetScroll = Math.max(
        0,
        lineEl.offsetTop - containerEl.clientHeight / 2 + lineEl.clientHeight / 2
      );
      containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  // Smooth auto-scroll to keep active line centered
  useEffect(() => {
    if (isUserScrolledAway) return;
    if (activeIndex >= 0 && activeLineRef.current && containerRef.current) {
      const lineEl = activeLineRef.current;
      const containerEl = containerRef.current;
      const targetScroll = Math.max(
        0,
        lineEl.offsetTop - containerEl.clientHeight / 2 + lineEl.clientHeight / 2
      );
      containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [activeIndex, isUserScrolledAway]);

  if (!currentSong || activeView === "lyrics" || !isRightSidebarOpen) return null;

  return (
    <aside className="hidden xl:flex select-none flex-col h-full min-h-0 w-80 2xl:w-96 bg-[#0b0517]/95 border-l border-purple-500/15 backdrop-blur-xl shrink-0 z-10 relative">
      {/* 1. SIDEBAR HEADER */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-purple-500/15 shrink-0 bg-[#0d071d]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Mic2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                Lirik Lagu
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-purple-300/70 font-medium">
              Sinkronisasi Karaoke
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Equalizer soundwave indicator */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 px-2 py-1 mr-1">
              <span className="w-0.5 bg-purple-400 rounded-full animate-eq-1"></span>
              <span className="w-0.5 bg-purple-400 rounded-full animate-eq-2"></span>
              <span className="w-0.5 bg-purple-400 rounded-full animate-eq-3"></span>
              <span className="w-0.5 bg-purple-400 rounded-full animate-eq-4"></span>
            </div>
          )}

          {/* Expand to Fullscreen Lyrics */}
          <button
            onClick={() => navigateTo("lyrics")}
            className="p-1.5 rounded-lg text-[#958dae] hover:text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            title="Perbesar ke Mode Panggung Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close / Hide Right Sidebar */}
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[#958dae] hover:text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            title="Tutup Panel Lirik"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. STICKY MINI NOW-PLAYING CARD */}
      <div className="p-3 shrink-0 bg-gradient-to-b from-[#130b28]/70 to-transparent">
        <div className="bg-[#170e30]/80 rounded-xl p-2.5 border border-purple-500/20 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 shadow bg-[#080410] border border-white/10">
              <img
                src={currentSong.cover || "/default-cover.svg"}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== "/default-cover.svg") {
                    e.currentTarget.src = "/default-cover.svg";
                  }
                }}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <h4 className="font-bold text-xs text-white truncate">
                {currentSong.title}
              </h4>
              <p className="text-[11px] text-purple-300/80 truncate">
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={() => toggleLike(currentSong)}
              className="p-1 text-[#9f96ba] hover:text-white transition-transform active:scale-125 cursor-pointer"
              title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-purple-500 text-purple-500" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Bamsplay Exclusive: Story / Meaning Accordion */}
        {currentSong?.meaning?.summary && (
          <div className="mt-2">
            <button
              onClick={() => setIsMeaningOpen(!isMeaningOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/15 text-[11px] text-purple-300 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">

                <span>Makna Lagu</span>
              </div>
              {isMeaningOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isMeaningOpen && (
              <div className="mt-1.5 p-3 rounded-lg bg-black/40 border border-purple-500/20 text-xs text-[#c2b9d9] leading-relaxed italic animate-fadeIn">
                &ldquo;{currentSong.meaning.summary}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. SCROLLABLE LYRICS STREAM */}
      <div
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar relative"
      >
        {isLoadingLyrics ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-purple-300/80">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-medium">Menghubungkan lirik resmi...</p>
          </div>
        ) : cleanLyrics && cleanLyrics.length > 0 ? (
          cleanLyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = activeIndex !== -1 && idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (typeof line.time === "number" && !isNaN(line.time)) {
                    seek(line.time);
                  }
                }}
                className={`group relative p-2 rounded-lg transition-all duration-300 cursor-pointer ${isActive
                  ? "bg-purple-600/15 border-l-4 border-purple-500 pl-3 scale-[1.02] shadow-sm"
                  : "hover:bg-white/[0.03] pl-2"
                  }`}
              >
                <p
                  className={`leading-relaxed transition-colors ${isActive
                    ? "text-white font-extrabold text-sm sm:text-base drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                    : isPast
                      ? "text-purple-300/50 text-xs sm:text-sm font-semibold group-hover:text-purple-200"
                      : "text-[#6c6288] text-xs sm:text-sm font-medium group-hover:text-gray-300"
                    }`}
                >
                  {line.text}
                </p>

                {/* Timestamp Cue on Hover */}
                {typeof line.time === "number" && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-purple-400/80 mt-0.5 inline-block">
                    Lompat ke {formatTime(line.time)}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-52 text-center p-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-300">
              <Music2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-300">
              Lirik Belum Tersedia
            </p>
            <p className="text-[11px] text-[#8e85a6] max-w-[200px]">
              Nikmati alunan melodi dan instrumen dari lagu ini.
            </p>
          </div>
        )}
      </div>

      {/* Floating Return to Active Lyric Line Button */}
      {isUserScrolledAway && activeIndex >= 0 && (
        <div className="p-3 absolute bottom-3 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <button
            onClick={scrollToActive}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xl border border-purple-400/40 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Ikuti Lagu</span>
          </button>
        </div>
      )}
    </aside>
  );
}
