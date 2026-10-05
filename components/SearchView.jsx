"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import { searchCategories, topArtists } from "@/data/musicData";
import {
  Play,
  Pause,
  Heart,
  Search as SearchIcon,
  Music,
  Globe2,
  Sparkles,
  Loader2,
  TrendingUp,
  Disc3,
  Flame,
  CheckCircle2,
  ListPlus,
  ListMusic,
  ArrowDownToLine,
} from "lucide-react";

export default function SearchView() {
  const {
    songs,
    playlists,
    searchQuery,
    setSearchQuery,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLike,
    downloadedSongIds,
    downloadingMap,
    downloadSong,
    removeDownloadedSong,
    navigateTo,
    addToQueue,
    openAddToPlaylistModal,
  } = useAudio();

  const [globalSongs, setGlobalSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeExploreTab, setActiveExploreTab] = useState("all");
  const cacheRef = useRef(new Map());
  const debounceTimerRef = useRef(null);

  const query = searchQuery.toLowerCase().trim();

  // Filter songs for Explore canvas when not actively searching
  const exploreSongs = useMemo(() => {
    if (activeExploreTab === "indo") {
      return songs.filter(
        (s) =>
          s.vibe === "senja" ||
          s.vibe === "pop" ||
          ["bernadya", "tulus", "sal priadi", "mahalini", "hindia", "juicy luicy", "nadin", "dewa", "sheila", "feby", "tiara"].some((a) =>
            s.artist.toLowerCase().includes(a)
          )
      );
    }
    if (activeExploreTab === "global") {
      return songs.filter(
        (s) =>
          ["bruno", "gaga", "sabrina", "billie", "weeknd", "taylor", "coldplay", "arctic", "olivia", "joji", "rex"].some((a) =>
            s.artist.toLowerCase().includes(a)
          )
      );
    }
    if (activeExploreTab === "senja") {
      return songs.filter(
        (s) =>
          s.vibe === "senja" ||
          ["sal priadi", "hindia", "nadin", "juicy luicy", "pamungkas", "feby", "bernadya"].some((a) =>
            s.artist.toLowerCase().includes(a)
          )
      );
    }
    if (activeExploreTab === "galau") {
      return songs.filter(
        (s) =>
          ["bernadya", "mahalini", "juicy luicy", "for revenge", "nadin", "feby", "joji", "tulus", "tiara"].some((a) =>
            s.artist.toLowerCase().includes(a)
          )
      );
    }
    if (activeExploreTab === "rock") {
      return songs.filter(
        (s) =>
          s.vibe === "rock" ||
          ["dewa", "sheila", "for revenge", "coldplay", "arctic"].some((a) =>
            s.artist.toLowerCase().includes(a)
          )
      );
    }
    return songs;
  }, [songs, activeExploreTab]);

  // Local song matches for instant 0ms response
  const localMatches = query
    ? songs.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        s.album?.toLowerCase().includes(query) ||
        s.genre?.toLowerCase().includes(query)
    )
    : [];

  const matchedPlaylists = query
    ? playlists.filter((p) => p.title.toLowerCase().includes(query))
    : [];

  // Live Query into the Global 100M+ Music Catalog
  useEffect(() => {
    if (!query) {
      setGlobalSongs([]);
      setIsLoading(false);
      return;
    }

    // Check in-memory cache
    if (cacheRef.current.has(query)) {
      setGlobalSongs(cacheRef.current.get(query));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/music/search?q=${encodeURIComponent(query)}&limit=30`
        );
        if (res.ok) {
          const data = await res.json();
          const fetched = data.songs || [];
          cacheRef.current.set(query, fetched);
          setGlobalSongs(fetched);
        } else {
          setGlobalSongs([]);
        }
      } catch (err) {
        console.warn("Global catalog search failed:", err);
        setGlobalSongs([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query]);

  // Merge local curated matches + global 100M+ catalog matches (avoiding duplicate IDs/titles)
  const combinedSongs = React.useMemo(() => {
    const seen = new Set();
    const result = [];

    const getNormKey = (s) =>
      (s.title || "").toLowerCase().replace(/[^a-z0-9]/g, "") +
      "---" +
      (s.artist || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Prioritize curated/local matches first
    for (const song of localMatches) {
      const key = getNormKey(song);
      seen.add(key);
      result.push(song);
    }

    // Then append global 100M+ catalog matches
    for (const song of globalSongs) {
      const key = getNormKey(song);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(song);
      }
    }

    return result;
  }, [localMatches, globalSongs]);

  const topResult = combinedSongs[0];

  // Quick Trending Explore Pills
  const quickTrends = [
    { label: "🇮🇩 Top 50 Indonesia", q: "bernadya mahalini tulus" },
    { label: "🌍 Global Billboard Hot 100", q: "taylor swift bruno mars billie eilish" },
    { label: "🇰🇷 K-Pop Daebak", q: "newjeans bts blackpink" },
    { label: "🎸 Rock & Metal Legends", q: "queen coldplay radiohead" },
    { label: "☕ Indie Senja Nusantara", q: "sal priadi hindia juicy luicy" },
    { label: "🌃 R&B & Synthwave", q: "the weeknd sza drake" },
    { label: "⚡ EDM & Dance", q: "avicii alan walker daft punk" },
    { label: "🎹 Jazz & Chill", q: "laufey ardhito pamungkas" },
  ];

  return (
    <div className="relative pb-24 md:pb-16 select-none">
      {/* 1. When User is Actively Searching */}
      {query ? (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
          {/* Header Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-500/15">
            <div className="text-xs sm:text-sm text-[#9f96bb] flex items-center gap-2">
              <span>Hasil pencarian untuk:</span>
              <span className="text-white font-bold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                "{searchQuery}"
              </span>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-purple-400 font-medium animate-pulse ml-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mencari di antara 100.000.000+ lagu...</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-purple-300/80 font-mono bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/20 w-fit">
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>100M+ Global Catalog</span>
            </div>
          </div>

          {/* Empty State */}
          {!isLoading && combinedSongs.length === 0 && matchedPlaylists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#130b26]/50 rounded-3xl border border-purple-500/20 p-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Lagu Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#8c84a4] max-w-md leading-relaxed mb-6">
                Tidak ada lagu yang cocok dengan kata kunci "{searchQuery}". Coba ketikkan nama artis lain, judul lagu, atau pilih dari kategori rekomendasi di bawah.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                {quickTrends.slice(0, 4).map((trend) => (
                  <button
                    key={trend.label}
                    onClick={() => setSearchQuery(trend.q)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1d1238] hover:bg-purple-800/50 border border-purple-500/30 text-purple-200 transition-colors"
                  >
                    {trend.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Top Result & Songs List */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Hasil Teratas Hero Card */}
                {topResult && (
                  <div className="lg:col-span-2">
                    <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Hasil Teratas</span>
                    </h2>

                    <div
                      onClick={() => playSong(topResult, null, combinedSongs)}
                      className="group p-5 bg-gradient-to-b from-[#1b1035] to-[#120a24] hover:from-[#241547] hover:to-[#170c2e] rounded-xl transition-all duration-300 cursor-pointer border border-purple-500/20 hover:border-purple-500/30 relative shadow-xl flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden shadow-lg border border-white/10">
                        <img
                          src={topResult.cover}
                          alt={topResult.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            if (topResult.fallbackCover && e.currentTarget.src !== topResult.fallbackCover) {
                              e.currentTarget.src = topResult.fallbackCover;
                            } else if (e.currentTarget.src !== "/default-cover.svg") {
                              e.currentTarget.src = "/default-cover.svg";
                            }
                          }}
                        />
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xl sm:text-2xl font-black text-white truncate group-hover:text-purple-300 transition-colors">
                          {topResult.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#9d94b8]">
                          <span className="text-white font-bold">
                            {topResult.artist}
                          </span>
                          <span>•</span>
                          <span className="text-[#a8a0c2] truncate">
                            {topResult.album}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                            {topResult.isGlobalCatalog ? "100M+ Global" : "Katalog Unggulan"}
                          </span>
                          <span className="text-[10px] text-purple-400/80 font-mono">
                            {topResult.duration}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentSong?.id === topResult.id) togglePlay();
                          else playSong(topResult, null, combinedSongs);
                        }}
                        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white flex items-center justify-center purple-glow-sm shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-110 active:scale-95 transition-all"
                        title={isPlaying && currentSong?.id === topResult.id ? "Jeda" : "Putar"}
                      >
                        {isPlaying && currentSong?.id === topResult.id ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Matching Songs List */}
                <div className={`${topResult ? "lg:col-span-3" : "lg:col-span-5"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span>Lagu ({combinedSongs.length})</span>
                    </h2>
                    <span className="text-[11px] text-purple-300/70">
                      Klik lagu apa saja untuk memutar
                    </span>
                  </div>

                  <div className="space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {combinedSongs.slice(0, 25).map((song, idx) => {
                      const isThisPlaying =
                        isPlaying && currentSong?.id === song.id;
                      const isLiked = likedSongIds.includes(song.id);
                      const isSongDl = downloadedSongIds?.includes(song.id);
                      const isSongDling = !!downloadingMap?.[song.id];

                      return (
                        <div
                          key={song.id || idx}
                          onClick={() => playSong(song, null, combinedSongs)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-all border ${isThisPlaying
                            ? "bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-md"
                            : "bg-[#140b28]/40 hover:bg-[#1f123d] border-transparent hover:border-purple-500/20 text-[#cdc7e0]"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                            <span className="w-5 text-center text-xs font-mono text-[#7b7296] shrink-0">
                              {idx + 1}
                            </span>

                            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 shadow-md border border-purple-500/20">
                              <img
                                src={song.cover}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  if (song.fallbackCover && e.currentTarget.src !== song.fallbackCover) {
                                    e.currentTarget.src = song.fallbackCover;
                                  } else if (e.currentTarget.src !== "/default-cover.svg") {
                                    e.currentTarget.src = "/default-cover.svg";
                                  }
                                }}
                              />
                              {isThisPlaying && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                                  <span className="w-0.5 h-3 bg-purple-400 animate-eq-1 rounded-full"></span>
                                  <span className="w-0.5 h-3 bg-purple-400 animate-eq-2 rounded-full"></span>
                                  <span className="w-0.5 h-3 bg-purple-400 animate-eq-3 rounded-full"></span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-bold text-xs sm:text-sm truncate ${isThisPlaying
                                  ? "text-purple-300 font-extrabold"
                                  : "text-white group-hover:text-purple-200"
                                  }`}
                              >
                                {song.title}
                              </div>
                              <div className="text-[11px] text-[#938ba8] truncate mt-0.5 flex items-center gap-1.5">
                                <span className="hover:underline">{song.artist}</span>
                                {song.album && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#7d7596] truncate hidden sm:inline">
                                      {song.album}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-2.5 text-xs shrink-0">
                            {/* Add to Queue */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(song);
                              }}
                              className="p-1.5 text-[#958dae] hover:text-purple-300 transition-colors"
                              title="Tambahkan ke Antrean"
                            >
                              <ListMusic className="w-4 h-4" />
                            </button>

                            {/* Add to Playlist */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddToPlaylistModal(song);
                              }}
                              className="p-1.5 text-[#958dae] hover:text-purple-300 transition-colors"
                              title="Tambahkan ke Playlist"
                            >
                              <ListPlus className="w-4 h-4" />
                            </button>

                            {/* Like / Save */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(song);
                              }}
                              className="p-1.5 text-[#958dae] hover:text-white transition-transform active:scale-125"
                              title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                            >
                              <Heart
                                className={`w-4 h-4 ${isLiked
                                  ? "fill-purple-500 text-purple-500"
                                  : ""
                                  }`}
                              />
                            </button>

                            {/* Download button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSongDl) removeDownloadedSong(song.id);
                                else downloadSong(song);
                              }}
                              className={`p-1.5 transition-colors ${
                                isSongDl
                                  ? "text-emerald-400"
                                  : isSongDling
                                  ? "text-purple-400"
                                  : "text-[#958dae] hover:text-white"
                              }`}
                              title={
                                isSongDl
                                  ? "Lagu terunduh (Klik untuk hapus dari offline)"
                                  : isSongDling
                                  ? "Sedang mengunduh lagu..."
                                  : "Unduh untuk putar offline"
                              }
                            >
                              {isSongDling ? (
                                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                              ) : isSongDl ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ArrowDownToLine className="w-4 h-4" />
                              )}
                            </button>

                            <span className="font-mono text-[#8a81a6] text-[11px] w-9 text-right">
                              {song.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Matching Playlists */}
              {matchedPlaylists.length > 0 && (
                <div className="pt-4 border-t border-purple-500/15">
                  <h2 className="text-base font-bold text-white mb-3">
                    Daftar Putar Terkait
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {matchedPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() =>
                          navigateTo("playlist", { playlistId: pl.id })
                        }
                        className="p-3 bg-[#150f29] hover:bg-[#22183f] rounded-xl cursor-pointer border border-[#22183e] transition-all group shadow-md"
                      >
                        <div className="aspect-square w-full rounded-lg overflow-hidden mb-2">
                          {pl.cover.startsWith("http") ? (
                            <img
                              src={pl.cover}
                              alt={pl.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div
                              style={{ background: pl.cover }}
                              className="w-full h-full flex items-center justify-center text-white"
                            >
                              <Music className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                          {pl.title}
                        </h4>
                        <p className="text-[11px] text-[#8f87a8] truncate">
                          {pl.creator} • {pl.totalSongs} lagu
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* 2. When Search Bar is Empty (Browse Canvas for 100M+ Songs) */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Global Catalog Hero Banner */}
          <div className="relative rounded-xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#21113e] via-[#160a2b] to-[#0d061c] border border-purple-500/25 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-bold w-fit mb-4">
                <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Katalog Musik Global • 100.000.000+ Lagu Resmi</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Jelajahi & Dengarkan Lagu Asli dari Artis Favoritmu
              </h1>

              <p className="text-xs sm:text-sm text-purple-300/80 mt-2 leading-relaxed">
                Semua lagu di bawah menggunakan cover album asli beresolusi tinggi dan audio resmi berkualitas studio. Klik lagu apa saja untuk mendengarkan langsung.
              </p>

              {/* Quick Trends Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#8f87ab] font-medium mr-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  Tren Populer:
                </span>
                {quickTrends.map((trend) => (
                  <button
                    key={trend.label}
                    onClick={() => setSearchQuery(trend.q)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1d1238]/90 hover:bg-purple-700/50 border border-purple-500/30 text-purple-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {trend.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real Songs Showcase (Lagu Populer & Trending) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-purple-400" />
                  <span>Lagu Populer & Sedang Tren</span>
                </h2>
                <p className="text-xs text-[#9d94b8] mt-0.5">
                  Lagu resmi dengan audio studio dan cover album asli
                </p>
              </div>

              {/* Explore Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "all", label: "🔥 Semua Tren" },
                  { id: "indo", label: "🇮🇩 Top 50 Indonesia" },
                  { id: "global", label: "🌍 Global Hits" },
                  { id: "senja", label: "☕ Indie Senja" },
                  { id: "galau", label: "💔 Lagu Galau" },
                  { id: "rock", label: "🎸 Rock & Band" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveExploreTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeExploreTab === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40 scale-105"
                      : "bg-[#181130] text-[#a9a1c2] hover:bg-[#231a44] hover:text-white border border-purple-500/15"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {exploreSongs.slice(0, 16).map((song) => {
                const isThisPlaying = isPlaying && currentSong?.id === song.id;
                const isLiked = likedSongIds.includes(song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, null, exploreSongs)}
                    className="group p-3 sm:p-3.5 bg-[#140d29]/70 hover:bg-[#1f153d] rounded-md sm:rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-white/5 flex flex-col relative shadow-sm"
                  >
                    <div className="relative aspect-square w-full rounded-md overflow-hidden mb-3 shadow-md bg-[#0a0515]">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (song.fallbackCover && e.currentTarget.src !== song.fallbackCover) {
                            e.currentTarget.src = song.fallbackCover;
                          } else if (e.currentTarget.src !== "/default-cover.svg") {
                            e.currentTarget.src = "/default-cover.svg";
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Equalizer animation when playing */}
                      {isThisPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1 z-10 backdrop-blur-[2px]">
                          <span className="w-1 h-6 bg-purple-400 animate-eq-1 rounded-full"></span>
                          <span className="w-1 h-8 bg-purple-400 animate-eq-2 rounded-full"></span>
                          <span className="w-1 h-5 bg-purple-400 animate-eq-3 rounded-full"></span>
                          <span className="w-1 h-7 bg-purple-400 animate-eq-4 rounded-full"></span>
                        </div>
                      )}

                      {/* Top Action Buttons (Queue, Playlist & Like) */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(song);
                          }}
                          className="w-7 h-7 rounded-full bg-black/70 hover:bg-purple-600 text-white flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-90"
                          title="Tambahkan ke Antrean"
                        >
                          <ListMusic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddToPlaylistModal(song);
                          }}
                          className="w-7 h-7 rounded-full bg-black/70 hover:bg-purple-600 text-white flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-90"
                          title="Tambahkan ke Playlist"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song);
                          }}
                          className={`w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-90 ${isLiked ? "text-purple-400" : "text-white"
                            }`}
                          title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isLiked ? "fill-purple-500 text-purple-500" : ""
                              }`}
                          />
                        </button>
                      </div>

                      {/* Play/Pause Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisPlaying) togglePlay();
                          else playSong(song, null, exploreSongs);
                        }}
                        className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center purple-glow-sm shadow-xl transition-all z-20 ${isThisPlaying
                          ? "opacity-100 scale-100"
                          : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105"
                          }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-white truncate mb-0.5">
                      {song.title}
                    </h3>
                    <p className="text-xs text-[#9d94b8] truncate mb-2">
                      {song.artist}
                    </p>

                    <div className="mt-auto flex items-center justify-between text-[11px] text-[#7d7396]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/20 text-purple-300 font-medium text-[10px]">
                        {song.genre}
                      </span>
                      <span className="font-mono">{song.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browse All Genres & Categories Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-purple-400" />
                <span>Jelajahi Berdasarkan Genre & Kategori</span>
              </h2>
              <span className="text-xs text-purple-300/70">
                100M+ Trek Siap Diputar
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {searchCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSearchQuery(category.name)}
                  className={`relative h-28 sm:h-36 md:h-40 rounded-lg p-3 sm:p-4 overflow-hidden cursor-pointer shadow-lg bg-gradient-to-br ${category.color} border border-white/10 hover:scale-[1.02] transition-all duration-200 select-none group`}
                >
                  <h3 className="font-extrabold text-sm sm:text-base md:text-lg text-white max-w-[85%] leading-tight drop-shadow-sm">
                    {category.name}
                  </h3>

                  <div className="absolute -bottom-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden shadow-2xl rotate-[25deg] group-hover:rotate-[28deg] group-hover:scale-105 transition-all duration-300 border border-white/10">
                    <img
                      src={category.iconCover}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/default-cover.svg";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists in Explore */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Artis Populer di Bamsplay</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {topArtists.slice(0, 12).map((artist) => (
                <div
                  key={artist.id}
                  onClick={() =>
                    navigateTo("artist", {
                      artistName: artist.name,
                      artistInfo: {
                        name: artist.name,
                        monthlyListeners: `${artist.monthlyListeners} pendengar bulanan`,
                        avatar: artist.image,
                        bio: `Artis populer di Bamsplay.`,
                        verified: true,
                      },
                    })
                  }
                  className="group p-3 bg-[#140d29]/60 hover:bg-[#1f153d] rounded-md sm:rounded-lg transition-all cursor-pointer border border-transparent hover:border-white/5 flex flex-col items-center text-center"
                >
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 shadow-md">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/default-cover.svg";
                      }}
                    />
                  </div>

                  <h4 className="font-bold text-xs text-white truncate w-full mb-0.5">
                    {artist.name}
                  </h4>
                  <span className="text-[10px] text-[#8e85a6]">
                    {artist.monthlyListeners}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
