"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  CheckCircle2,
  Heart,
  Clock,
  Share2,
  Disc3,
  Flame,
  ListPlus,
} from "lucide-react";
import { topArtists } from "@/data/musicData";

export default function ArtistView() {
  const {
    songs,
    currentSong,
    isPlaying,
    activeViewData,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLike,
    showToast,
    openAddToPlaylistModal,
  } = useAudio();

  const [isFollowing, setIsFollowing] = useState(false);

  const artistName = activeViewData?.artistName || "Bernadya";
  const artistData = topArtists.find((a) => a.name === artistName);
  const artistSongs = songs.filter((s) => s.artist === artistName);
  const sampleSong = artistSongs[0] || songs[0];

  const artistInfo =
    activeViewData?.artistInfo ||
    sampleSong.artistInfo || {
      name: artistName,
      monthlyListeners: artistData?.monthlyListeners ? `${artistData.monthlyListeners} pendengar bulanan` : "8.4M pendengar bulanan",
      avatar: artistData?.image || sampleSong.cover,
      bio: "Musisi terkemuka dengan katalog lagu yang disukai jutaan penggemar musik.",
      verified: true,
    };

  const isPlayingArtist = isPlaying && currentSong?.artist === artistName;

  const handlePlayArtist = () => {
    if (isPlayingArtist) {
      togglePlay();
    } else {
      playSong(sampleSong);
    }
  };

  const discography = artistData?.discography || [
    `${sampleSong.album} (${sampleSong.year || "2024"})`,
  ];

  return (
    <div className="relative pb-24 md:pb-20 select-none max-w-6xl mx-auto space-y-8">
      {/* 1. Artist Hero Banner */}
      <div className="relative h-64 sm:h-80 -mx-4 sm:-mx-8 lg:-mx-10 -mt-6 rounded-b-3xl overflow-hidden flex flex-col justify-end p-6 sm:p-10 border-b border-purple-500/20 shadow-2xl">
        <img
          src={artistInfo.avatar || "/default-cover.svg"}
          alt={artistName}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== "/default-cover.svg") {
              e.currentTarget.src = "/default-cover.svg";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-[#090514]/70 to-transparent" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
            <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
            <span>Artis Terverifikasi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            {artistName}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-[#ddd7ec]">
            {artistInfo.monthlyListeners}
          </p>
        </div>
      </div>

      {/* 2. Action Controls */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handlePlayArtist}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white flex items-center justify-center purple-glow-sm hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
          title="Putar Semua"
        >
          {isPlayingArtist ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            setIsFollowing(!isFollowing);
            showToast(
              isFollowing
                ? `Berhenti mengikuti ${artistName}`
                : `Mengikuti ${artistName}! 🌟`,
              "purple"
            );
          }}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            isFollowing
              ? "bg-[#251b47] text-purple-300 border border-purple-500"
              : "border border-purple-500/30 text-white hover:border-purple-400 hover:scale-105"
          }`}
        >
          {isFollowing ? "Mengikuti" : "Ikuti"}
        </button>

        <button
          onClick={() => showToast("Tautan profil artis disalin! 🔗", "default")}
          className="text-[#988fb1] hover:text-white p-2.5 hover:bg-purple-950/30 rounded-full transition-colors"
          title="Bagikan"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Popular Tracks Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Lagu Populer ({artistSongs.length})
          </h2>
          <span className="text-xs text-[#8f87a6]">Diurutkan berdasarkan popularitas</span>
        </div>

        <div className="space-y-1">
          {artistSongs.map((song, index) => {
            const isThisPlaying = isPlaying && currentSong?.id === song.id;
            const isLiked = likedSongIds.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`grid grid-cols-12 gap-3 sm:gap-4 items-center px-4 py-2.5 rounded-xl group cursor-pointer transition-colors ${
                  isThisPlaying
                    ? "bg-purple-950/35 border border-purple-500/30 text-purple-300"
                    : "hover:bg-[#150d29] text-[#cbc4de]"
                }`}
              >
                {/* Number / Equalizer */}
                <div className="col-span-1 flex items-center justify-center font-mono text-xs text-[#8a81a4]">
                  {isThisPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-purple-400 rounded-full animate-eq-1"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-eq-2"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-eq-3"></span>
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                    </>
                  )}
                </div>

                {/* Title & Cover */}
                <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0">
                  <img
                    src={song.cover || "/default-cover.svg"}
                    alt={song.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                    onError={(e) => {
                      if (song?.fallbackCover && e.currentTarget.src !== song.fallbackCover) {
                        e.currentTarget.src = song.fallbackCover;
                      } else if (e.currentTarget.src !== "/default-cover.svg") {
                        e.currentTarget.src = "/default-cover.svg";
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <span
                      className={`font-bold text-xs sm:text-sm truncate block ${
                        isThisPlaying ? "text-purple-300 font-bold" : "text-white"
                      }`}
                    >
                      {song.title}
                    </span>
                    <span className="text-[11px] text-[#8e85a6] truncate block">
                      {song.plays} diputar
                    </span>
                  </div>
                </div>

                {/* Album */}
                <div className="col-span-2 hidden sm:block text-xs text-[#8e85a6] truncate">
                  {song.album}
                </div>

                {/* Duration & Actions */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2 sm:gap-3 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylistModal(song);
                    }}
                    className="text-[#877e9f] hover:text-purple-300 p-1"
                    title="Tambahkan ke Playlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="text-[#877e9f] hover:text-white p-1"
                    title={isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? "fill-purple-500 text-purple-500" : ""
                      }`}
                    />
                  </button>
                  <span className="font-mono text-[#8a81a4]">
                    {song.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Discography */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-purple-400" />
          <span>Diskografi & Rilis Populer</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {discography.map((albumName, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#140d28]/70 hover:bg-[#1d1338] rounded-2xl border border-purple-500/15 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                <Disc3 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs sm:text-sm text-white block truncate">
                  {albumName}
                </span>
                <span className="text-[11px] text-[#8e85a6] block">
                  Album • Rilis Resmi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Biography & About */}
      <div className="bg-[#120a22] rounded-3xl p-6 sm:p-8 border border-purple-500/15 space-y-3">
        <h3 className="text-lg font-bold text-white">Tentang {artistName}</h3>
        <p className="text-xs sm:text-sm text-[#aba3c7] leading-relaxed max-w-3xl">
          {artistInfo.bio}
        </p>
      </div>
    </div>
  );
}
