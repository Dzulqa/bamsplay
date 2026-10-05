"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import { Mic2, Loader2, ArrowDown } from "lucide-react";

export default function LyricsView() {
  const { currentSong, currentTime, seek, updateSongLyrics } = useAudio();
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isUserScrolledAway, setIsUserScrolledAway] = useState(false);
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

  // When song changes (e.g. previous track ended and next track started):
  // IMMEDIATELY reset lyrics view to the very top so the user never has to scroll up manually!
  useEffect(() => {
    scrollToTop(false);
  }, [currentSong?.id]);

  // When the current song finishes and loops or restarts from beginning:
  useEffect(() => {
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = currentTime;

    // Track looped back from near-end to start (e.g. repeat-one mode or replayed track)
    if (prevTime > 6 && currentTime < 2) {
      scrollToTop(true);
    }
  }, [currentTime]);

  // Clean lyric lines: filter out any musical/sound annotations like ♪ (intro...) ♪ or (Instrumental)
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

  // Pure, authentic lyric synchronization:
  // Evaluates strictly against true track timestamps.
  // Stays steady on the current line and never jumps erratically during instrumental solos.
  // For unsynced (plain) lyrics that have approximate timestamps, still tries to scroll.
  const activeIndex = useMemo(() => {
    if (!cleanLyrics || cleanLyrics.length === 0) return -1;

    // Check if lyrics have no time info at all
    const hasAnyTime = cleanLyrics.some((l) => typeof l?.time === "number" && !isNaN(l.time));
    if (!hasAnyTime) return -1;

    // Use song's specific offset if specified (e.g. video intro compensation), default 0
    const offset = Number(currentSong?.lyricsOffset) || 0;
    const t = Math.max(0, currentTime - offset);

    // If before first lyric line starts
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

  // Real user interaction detection (wheel / touch) so programmatic scrolling never blocks auto-scroll
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
  };

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
      containerEl.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [activeIndex, isUserScrolledAway]);

  return (
    <div
      ref={containerRef}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      className="relative h-full pb-36 pt-6 sm:pt-8 px-6 sm:px-12 select-none overflow-y-auto custom-scrollbar scroll-smooth bg-gradient-to-b from-[#1b102e] via-[#120b20] to-[#0c0716]"
    >
      {/* Header - Spotify Style */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 max-w-4xl">
        <div className="flex items-center gap-4">
          <img
            src={currentSong?.cover || "/default-cover.svg"}
            alt={currentSong?.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-cover.svg";
            }}
            className="w-14 h-14 rounded-lg object-cover shadow-md shrink-0"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentSong?.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5 font-medium">
              {currentSong?.artist} {currentSong?.album ? `• ${currentSong.album}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold shrink-0">
          <Mic2 className="w-3.5 h-3.5 text-white/80" />
          <span>{isUnsyncedLyrics ? "≈ Lirik" : "Lirik"}</span>
          {isLoadingLyrics && (
            <Loader2 className="w-3 h-3 animate-spin text-white/60 ml-1" />
          )}
        </div>
      </div>

      {/* Floating Spotify-style "Kembali ke baris aktif" pill */}
      {isUserScrolledAway && activeIndex >= 0 && (
        <button
          onClick={scrollToActive}
          className="fixed bottom-28 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[#282828]/95 hover:bg-[#383838] text-white text-xs font-semibold backdrop-blur-md border border-white/15 shadow-xl transition-all"
        >
          <ArrowDown className="w-3.5 h-3.5 text-white/80" />
          <span>Kembali ke baris aktif</span>
        </button>
      )}

      {/* Synchronized Lyrics List - Authentic Spotify Feel */}
      <div className="space-y-3 sm:space-y-4 max-w-4xl py-4">
        {cleanLyrics.length === 0 || isLoadingLyrics ? (
          <div className="py-28 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/40 mx-auto" />
            <p className="text-sm font-semibold text-white/70">
              Menyelaraskan lirik...
            </p>
          </div>
        ) : (
          cleanLyrics.map((line, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => !isUnsyncedLyrics && typeof line.time === "number" && seek(line.time + (Number(currentSong?.lyricsOffset) || 0))}
                className={`transition-colors duration-300 ease-out select-none py-1 px-2 rounded-lg ${isUnsyncedLyrics ? "cursor-default" : "cursor-pointer"} text-2xl sm:text-3xl md:text-[34px] font-bold leading-snug tracking-tight ${
                  isActive
                    ? "text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
