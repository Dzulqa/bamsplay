"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";
import { Mic2, Loader2, ArrowDown, ArrowUp, Minimize2 } from "lucide-react";

export default function LyricsView() {
  const {
    currentSong,
    currentTime,
    seek,
    updateSongLyrics,
    isPlaying,
    navigateTo,
    goBack,
    historyIndex,
    setIsRightSidebarOpen,
  } = useAudio();
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isUserScrolledAway, setIsUserScrolledAway] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const prevTimeRef = useRef(currentTime);

  // Smoothly or immediately reset lyrics scroll position back to the very top
  const scrollToTop = (smooth = false) => {
    setIsUserScrolledAway(false);
    if (containerRef.current) {
      try {
        containerRef.current.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      } catch (_) {
        containerRef.current.scrollTop = 0;
      }
    }
  };

  // When song changes: IMMEDIATELY reset lyrics view to the top
  useEffect(() => {
    scrollToTop(false);
  }, [currentSong?.id]);

  // When track loops back:
  useEffect(() => {
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = currentTime;

    if (prevTime > 6 && currentTime < 2) {
      scrollToTop(true);
    }
  }, [currentTime]);

  // Clean lyric lines
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
        )}&artist=${encodeURIComponent(currentSong.artist)}&duration=${
          currentSong.durationSec || 210
        }`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.lyrics && data.lyrics.length > 0) {
            updateSongLyrics(currentSong.id, data.lyrics);
          }
        })
        .catch(console.warn)
        .finally(() => {
          setIsLoadingLyrics(false);
        });
    }
  }, [currentSong?.id, needsFetch]);

  // Active lyric line index
  const activeIndex = useMemo(() => {
    if (!cleanLyrics || cleanLyrics.length === 0) return -1;

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

  const isUnsyncedLyrics = cleanLyrics.length > 0 && cleanLyrics.some((l) => l?.isUnsynced);

  const isAutoScrollingRef = useRef(false);

  // Calculate whether active lyric is above or below current viewport
  const updateScrollDirection = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (activeLineRef.current) {
      const line = activeLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();

      const containerCenter = containerRect.top + containerRect.height / 2;
      const lineCenter = lineRect.top + lineRect.height / 2;

      setScrollDirection(lineCenter < containerCenter ? "up" : "down");
    } else if (cleanLyrics && cleanLyrics.length > 0) {
      const targetIdx = activeIndex >= 0 ? activeIndex : 0;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollRatio = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
      const activeRatio = targetIdx / (cleanLyrics.length - 1 || 1);
      setScrollDirection(activeRatio < scrollRatio ? "up" : "down");
    }
  }, [activeIndex, cleanLyrics]);

  const handleUserInteraction = () => {
    if (!isAutoScrollingRef.current) {
      setIsUserScrolledAway(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolledAway(false);
      }, 5000);
    }
    setTimeout(updateScrollDirection, 50);
  };

  const handleScroll = () => {
    if (!isAutoScrollingRef.current) {
      setIsUserScrolledAway(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolledAway(false);
      }, 5000);
    }
    updateScrollDirection();
  };

  const scrollToActive = () => {
    setIsUserScrolledAway(false);
    isAutoScrollingRef.current = true;
    if (activeIndex <= 0) {
      scrollToTop(true);
    } else if (activeLineRef.current && containerRef.current) {
      const lineEl = activeLineRef.current;
      const containerEl = containerRef.current;
      const targetScroll = Math.max(
        0,
        lineEl.offsetTop - containerEl.clientHeight / 2 + lineEl.clientHeight / 2
      );
      containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 600);
  };

  // Update direction when active index changes while scrolled away
  useEffect(() => {
    if (isUserScrolledAway) {
      updateScrollDirection();
    }
  }, [activeIndex, isUserScrolledAway, updateScrollDirection]);

  // Smooth auto-scroll: centers active line cleanly in containerRef
  useEffect(() => {
    if (isUserScrolledAway) return;

    if (activeIndex <= 0) {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (activeLineRef.current && containerRef.current) {
      const lineEl = activeLineRef.current;
      const containerEl = containerRef.current;
      const targetScroll = Math.max(
        0,
        lineEl.offsetTop - containerEl.clientHeight / 2 + lineEl.clientHeight / 2
      );
      isAutoScrollingRef.current = true;
      containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
      const timer = setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, isUserScrolledAway]);



  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-gradient-to-b from-[#180e2b] via-[#10081e] to-[#090512]">
      {/* Dynamic Ambient Glowing Aura (Eliminates dead void) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-fuchsia-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Right: Button to shrink full-screen lyrics back into right sidebar companion */}
      <div className="absolute top-3.5 right-4 sm:top-5 sm:right-8 z-30 flex items-center gap-2">
        <button
          onClick={() => {
            setIsRightSidebarOpen(true);
            if (historyIndex > 0) {
              goBack();
            } else {
              navigateTo("home");
            }
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#1e1238]/90 hover:bg-[#2c1a52] text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 shadow-xl backdrop-blur-md transition-all cursor-pointer group text-xs font-bold active:scale-95"
          title="Kecilkan ke Panel Samping (Right Sidebar)"
        >
          <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Kecilkan ke Sidebar</span>
        </button>
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-12">
        {/* Two-Column Responsive Layout: Left Fixed Track Showcase + Right Synchronized Scrolling Lyrics Stream */}
        <div className="flex flex-col lg:flex-row h-full gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Fixed Song Showcase & Music Visualizer (Does not scroll) */}
          <div className="w-full lg:w-5/12 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 sm:space-y-3.5 pt-3 sm:pt-5 lg:pt-6 pb-4 select-none">
            <div className="relative group w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 xl:w-60 xl:h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-[#120a22]">
              <img
                src={currentSong?.cover || "/default-cover.svg"}
                alt={currentSong?.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-cover.svg";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-1.5 w-full max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Lirik</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight line-clamp-2">
                {currentSong?.title}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80 font-medium line-clamp-2">
                {currentSong?.artist} {currentSong?.album ? `• ${currentSong.album}` : ""}
              </p>
            </div>

            {/* Live Equalizer Visualizer Bars */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 shrink-0 shadow-md">
              <div className="flex items-end gap-1 h-3.5">
                <span className={`w-0.5 sm:w-1 bg-purple-400 rounded-full ${isPlaying ? "animate-eq-1 h-3" : "h-1"}`} />
                <span className={`w-0.5 sm:w-1 bg-purple-400 rounded-full ${isPlaying ? "animate-eq-2 h-3.5" : "h-1.5"}`} />
                <span className={`w-0.5 sm:w-1 bg-purple-400 rounded-full ${isPlaying ? "animate-eq-3 h-2" : "h-1"}`} />
                <span className={`w-0.5 sm:w-1 bg-purple-400 rounded-full ${isPlaying ? "animate-eq-4 h-3" : "h-1.5"}`} />
              </div>
              <span className="text-xs font-semibold text-purple-200/90 ml-1">
                {isPlaying ? "Sedang Mengalun" : "Musik Dijeda"}
              </span>
            </div>

          </div>

          {/* Right Column: Independently Scrollable Synchronized Lyrics Stream */}
          <div
            ref={containerRef}
            onWheel={handleUserInteraction}
            onTouchMove={handleUserInteraction}
            onScroll={handleScroll}
            className="flex-1 w-full h-full relative overflow-y-auto custom-scrollbar scroll-smooth pt-3 sm:pt-5 lg:pt-6 pb-44 space-y-4 sm:space-y-6"
          >
            {cleanLyrics.length === 0 || isLoadingLyrics ? (
              <div className="py-28 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                <p className="text-sm font-semibold text-purple-200/80">
                  Menyelaraskan lirik karaoke...
                </p>
              </div>
            ) : (
              cleanLyrics.map((line, idx) => {
                const isActive = idx === activeIndex;

                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() =>
                      !isUnsyncedLyrics &&
                      typeof line.time === "number" &&
                      seek(line.time + (Number(currentSong?.lyricsOffset) || 0))
                    }
                    className={`transition-all duration-300 ease-out select-none py-1.5 px-3 rounded-lg ${
                      isUnsyncedLyrics ? "cursor-default" : "cursor-pointer"
                    } text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-tight ${
                      isActive
                        ? "text-white scale-[1.02] origin-left drop-shadow-[0_0_24px_rgba(168,85,247,0.4)]"
                        : "text-white/30 hover:text-white/70"
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Spotify-style "Kembali ke baris aktif" pill */}
      {isUserScrolledAway && cleanLyrics && cleanLyrics.length > 0 && (
        <button
          onClick={scrollToActive}
          className="fixed bottom-28 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1338]/95 hover:bg-[#281b4a] text-white text-xs font-semibold backdrop-blur-md border border-purple-500/30 shadow-xl transition-all cursor-pointer animate-fadeIn"
        >
          {scrollDirection === "up" ? (
            <ArrowUp className="w-3.5 h-3.5 text-purple-300" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-purple-300" />
          )}
          <span>Kembali ke baris aktif</span>
        </button>
      )}
    </div>
  );
}
