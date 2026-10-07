"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  Heart,
  Sparkles,
  ArrowRight,
  Globe2,
  ListPlus,
  ListMusic,
  Music,
  Trash2,
} from "lucide-react";
import { initialSongs, topArtists } from "@/data/musicData";

export default function HomeView() {
  const {
    songs,
    playlists,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLike,
    navigateTo,
    addToQueue,
    openAddToPlaylistModal,
    openDeletePlaylistModal,
    isSidebarCollapsed,
  } = useAudio();

  const [selectedVibe, setSelectedVibe] = useState("all");

  // Dynamic grid columns: 3 columns when both sidebars are open, 4 columns when left sidebar is collapsed
  const songGridCols = isSidebarCollapsed
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4"
    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4";

  // Spotlight follows the currently playing song; falls back to first curated song
  const spotlightSong = currentSong || songs[0] || initialSongs[0];
  const isSpotlightPlaying = isPlaying && currentSong?.id === spotlightSong?.id;
  const isSpotlightLiked = spotlightSong ? likedSongIds.includes(spotlightSong.id) : false;

  // Vibe filtering
  const filteredSongs =
    selectedVibe === "all"
      ? songs
      : songs.filter((s) => s.vibe === selectedVibe);

  const vibes = [
    { id: "all", label: "Semua Frekuensi", icon: "✨" },
    { id: "senja", label: "Indie Senja", icon: "🍂" },
    { id: "synthwave", label: "Midnight Drive", icon: "🌙" },
    { id: "focus", label: "Deep Focus", icon: "☕" },
    { id: "pop", label: "Pop Nusantara", icon: "🎧" },
  ];

  return (
    <div className="relative pb-32 md:pb-16 select-none space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. BAMSPLAY SIGNATURE SPOTLIGHT HERO BANNER — follows currently playing song */}
      <div suppressHydrationWarning className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1c113b] via-[#160d2e] to-[#0d071d] border border-purple-500/20 p-4 sm:p-7 shadow-2xl">
        {/* Ambient atmospheric aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div key={spotlightSong?.id} suppressHydrationWarning className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-5 sm:gap-6 animate-fadeIn">
          {/* Left Info & Actions */}
          <div className="flex-1 space-y-2.5 sm:space-y-3 text-center md:text-left min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] sm:text-xs font-bold tracking-wide">
              {currentSong ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>SEDANG DIPUTAR</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>BAMSPLAY SPOTLIGHT</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
              {spotlightSong.title}
            </h1>

            <p className="text-xs sm:text-base text-purple-200/80 font-medium">
              {spotlightSong.artist} •{" "}
              <span className="text-purple-300/60">{spotlightSong.album}</span>
            </p>

            <p className="text-xs sm:text-sm text-[#a59cb8] max-w-xl line-clamp-2 leading-relaxed">
              {spotlightSong?.meaning?.summary
                ? `"${spotlightSong.meaning.summary}"`
                : '"Dengarkan musik terbaik eksklusif di Bamsplay."'}
            </p>

            {/* Banner Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
              <button
                onClick={() => {
                  if (isSpotlightPlaying) togglePlay();
                  else playSong(spotlightSong, null, filteredSongs);
                }}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs sm:text-sm purple-glow-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isSpotlightPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Jeda Musik</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                    <span>Putar Sekarang</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleLike(spotlightSong)}
                className={`p-3 rounded-full border transition-all ${
                  isSpotlightLiked
                    ? "bg-purple-900/40 border-purple-500 text-purple-400"
                    : "border-purple-500/30 text-white/80 hover:text-white hover:border-purple-400"
                }`}
                title={isSpotlightLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSpotlightLiked ? "fill-purple-500 text-purple-500" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => openAddToPlaylistModal(spotlightSong)}
                className="p-3 rounded-full border border-purple-500/30 text-white/80 hover:text-white hover:border-purple-400 transition-all hover:bg-purple-900/20"
                title="Tambahkan ke Playlist"
              >
                <ListPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Cover Art with Bamsplay Waveform Aura */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 group">
              <img
                src={spotlightSong.cover}
                alt={spotlightSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  if (e.currentTarget.src !== "/default-cover.svg") {
                    e.currentTarget.src = "/default-cover.svg";
                  }
                }}
              />
            </div>

            {/* Live Audio Soundwave Pulse (Bamsplay Unique Visual) */}
            {isPlaying && (
              <div className="absolute -bottom-3 bg-[#170e30]/90 border border-purple-500/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <span className="w-1 bg-purple-400 rounded-full animate-eq-1"></span>
                <span className="w-1 bg-purple-400 rounded-full animate-eq-2"></span>
                <span className="w-1 bg-purple-400 rounded-full animate-eq-3"></span>
                <span className="w-1 bg-purple-400 rounded-full animate-eq-4"></span>
                <span className="text-[10px] font-bold tracking-wider text-purple-300 ml-1">
                  PLAYING
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BAMSPLAY VIBE & FREQUENCY SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Pilih Suasana (Vibe)</span>
          </h2>
          <span className="text-xs text-purple-300/70 font-medium">
            Filter musik instan
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {vibes.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVibe(v.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedVibe === v.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50 scale-105"
                  : "bg-[#181130] text-[#a9a1c2] hover:bg-[#231a44] hover:text-white border border-purple-500/15"
              }`}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. TRACKS LIST (Clean, spacious, un-squished) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Lagu Pilihan Hari Ini
            </h2>
            <p className="text-xs text-[#8f87a6] mt-0.5">
              Menampilkan {filteredSongs.length} lagu sesuai suasana pilihanmu
            </p>
          </div>

          <button
            onClick={() => navigateTo("search")}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Jelajahi Lebih Banyak</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`grid ${songGridCols}`}>
          {filteredSongs.map((song) => {
            const isThisPlaying = isPlaying && currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, null, filteredSongs)}
                className="group p-2.5 sm:p-3.5 bg-[#140d29]/80 hover:bg-[#1f153d] rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer border border-purple-500/10 hover:border-purple-500/30 flex flex-col relative shadow-sm"
              >
                <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 shadow-md">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      if (e.currentTarget.src !== "/default-cover.svg") {
                        e.currentTarget.src = "/default-cover.svg";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top hover action buttons: Add to Queue, Playlist & Like */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                      className={`w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-90 ${
                        likedSongIds.includes(song.id) ? "text-purple-400" : "text-white"
                      }`}
                      title={likedSongIds.includes(song.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedSongIds.includes(song.id) ? "fill-purple-500 text-purple-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isThisPlaying) togglePlay();
                      else playSong(song);
                    }}
                    className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center purple-glow-sm shadow-xl transition-all ${
                      isThisPlaying
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
      </section>



      {/* 5. PLAYLIST PRIBADI (Hanya muncul jika ada playlist buatan user) */}
      {playlists.filter((p) => p.id !== "liked-songs").length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Daftar Putar Kamu
              </h2>
              <p className="text-xs text-[#8f87a6] mt-0.5">
                Koleksi playlist kustom buatanmu sendiri
              </p>
            </div>
          </div>

          <div className={`grid ${songGridCols}`}>
            {playlists
              .filter((p) => p.id !== "liked-songs")
              .slice(0, 4)
              .map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => navigateTo("playlist", { playlistId: pl.id })}
                  className="group p-3.5 bg-[#140d29]/80 hover:bg-[#1f153d] rounded-2xl transition-all duration-200 cursor-pointer border border-purple-500/10 hover:border-purple-500/30 flex flex-col relative shadow-sm"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                    {/* Delete Playlist Quick Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeletePlaylistModal(pl);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600/90 backdrop-blur-md text-[#aba3c3] hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg z-10 cursor-pointer"
                      title={`Hapus "${pl.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {pl.cover?.startsWith("http") ? (
                      <img
                        src={pl.cover}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (e.currentTarget.src !== "/default-cover.svg") {
                            e.currentTarget.src = "/default-cover.svg";
                          }
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          background:
                            pl.cover ||
                            "linear-gradient(135deg, #6366f1 0%, #4c1d95 100%)",
                        }}
                        className="w-full h-full flex items-center justify-center text-white"
                      >
                        <Music className="w-12 h-12 text-purple-200" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white truncate mb-1">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-[#9d94b8] line-clamp-2 leading-relaxed">
                    {pl.description}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 100M+ Global Music Catalog Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#180f33] to-[#0d071d] border border-purple-500/25 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Globe2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Terhubung ke 100.000.000+ Lagu di Dunia
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/40 text-purple-200 border border-purple-500/30 hidden sm:inline">
                Live Cloud Catalog
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-0.5">
              Cari artis, lagu, atau album apa saja yang ada di Spotify & Apple Music. Semua trek resmi siap diputar langsung.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo("search")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
        >
          <span>Jelajahi 100 Juta+ Lagu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. ARTIS FAVORIT (Clean & Tasteful) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Artis Terpopuler
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {topArtists.map((artist) => (
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
              className="group p-3 bg-[#140d29]/60 hover:bg-[#1f153d] rounded-2xl transition-all cursor-pointer border border-purple-500/10 hover:border-purple-500/30 flex flex-col items-center text-center"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 shadow-md">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (e.currentTarget.src !== "/default-cover.svg") {
                      e.currentTarget.src = "/default-cover.svg";
                    }
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
      </section>
    </div>
  );
}
