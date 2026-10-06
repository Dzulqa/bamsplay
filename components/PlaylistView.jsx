"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  Heart,
  Clock,
  MoreHorizontal,
  Share2,
  Check,
  Search,
  ListPlus,
  ListMusic,
  Trash2,
  Edit3,
  Shuffle,
} from "lucide-react";

export default function PlaylistView() {
  const {
    playlists,
    songs,
    currentSong,
    isPlaying,
    activeViewData,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLike,
    addToQueue,
    navigateTo,
    showToast,
    openAddToPlaylistModal,
    removeSongFromPlaylist,
    openDeletePlaylistModal,
    openEditPlaylistModal,
    isSidebarCollapsed,
    isRightSidebarOpen,
    activeView,
    isShuffle,
    toggleShuffle,
    playShufflePlaylist,
    registerKnownSong,
  } = useAudio();

  const [playlistSearch, setPlaylistSearch] = useState("");
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);

  // Ditambahkan / Added Date column is only displayed when there is sufficient horizontal space:
  // i.e., when at least one sidebar is collapsed/closed.
  const isRightSidebarVisible = isRightSidebarOpen && !!currentSong && activeView !== "lyrics";
  const isBothSidebarsOpen = !isSidebarCollapsed && isRightSidebarVisible;
  const showAddedDate = !isBothSidebarsOpen;

  const playlistId = activeViewData?.playlistId || "liked-songs";
  const playlist =
    playlists.find((p) => p.id === playlistId) ||
    playlists.find((p) => p.id === "liked-songs");

  const isLikedView = playlist?.id === "liked-songs" || playlist?.isLikedPlaylist;
  const currentSongIds = isLikedView ? likedSongIds : playlist?.songIds || [];
  const playlistSongs = currentSongIds.map((id) => songs.find((s) => s.id === id)).filter(Boolean);

  // Self-healing: if any song ID in currentSongIds is not yet loaded into songs state,
  // fetch it immediately from /api/music/search?id=... and register it!
  React.useEffect(() => {
    if (!currentSongIds || currentSongIds.length === 0) return;
    const missingIds = currentSongIds.filter((id) => !songs.some((s) => s.id === id));
    if (missingIds.length === 0) return;

    missingIds.forEach((id) => {
      fetch(`/api/music/search?id=${encodeURIComponent(id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.songs && data.songs.length > 0) {
            registerKnownSong(data.songs[0]);
          }
        })
        .catch(() => {});
    });
  }, [currentSongIds, songs, registerKnownSong]);

  if (!playlist) return null;

  const filteredSongs = playlistSearch
    ? playlistSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
          s.artist.toLowerCase().includes(playlistSearch.toLowerCase()) ||
          s.album.toLowerCase().includes(playlistSearch.toLowerCase())
      )
    : playlistSongs;

  const isCurrentPlaylistPlaying =
    isPlaying && currentSong && currentSongIds.includes(currentSong.id);

  const handleShuffleClick = () => {
    if (playlistSongs.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      toggleShuffle();
    } else {
      if (playShufflePlaylist) {
        playShufflePlaylist(playlist, playlistSongs);
      } else {
        playSong(playlistSongs[0], playlist, playlistSongs);
      }
    }
  };

  const handlePlayAll = () => {
    if (playlistSongs.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      if (isShuffle) {
        if (playShufflePlaylist) {
          playShufflePlaylist(playlist, playlistSongs);
        } else {
          const randomIndex = Math.floor(Math.random() * playlistSongs.length);
          playSong(playlistSongs[randomIndex], playlist, playlistSongs);
        }
      } else {
        playSong(playlistSongs[0], playlist, playlistSongs);
      }
    }
  };

  return (
    <div className="relative pb-24 md:pb-20 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 p-4 sm:p-6 -mx-3 sm:-mx-6 -mt-3 sm:-mt-6 bg-gradient-to-b from-purple-950/60 via-[#150e2d]/80 to-[#0c0817] border-b border-[#20153d] relative">
        {/* Cover Art */}
        <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-md sm:rounded-lg overflow-hidden shrink-0 shadow-2xl border border-white/10">
          {playlist.cover.startsWith("http") ? (
            <img
              src={playlist.cover}
              alt={playlist.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src !== "/default-cover.svg") {
                  e.currentTarget.src = "/default-cover.svg";
                }
              }}
            />
          ) : (
            <div
              style={{ background: playlist.cover }}
              className="w-full h-full flex items-center justify-center text-white"
            >
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1 text-center sm:text-left">
          <span className="text-[11px] uppercase font-bold tracking-wider text-purple-300">
            {playlist.type || "Daftar Putar"}
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {playlist.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#aba3c3] max-w-xl leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#cbc5dc] mt-1 font-medium">
            <span className="font-bold text-white">{playlist.creator}</span>
            {playlist.id !== "liked-songs" && !playlist.isLikedPlaylist && (
              <>
                <span>•</span>
                <span>{playlistSongs.length} lagu</span>
                <span>•</span>
                <span className="text-[#8e85a6]">{playlist.duration || "24 min"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between py-4 sm:py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center purple-glow-sm hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
            title={isCurrentPlaylistPlaying ? "Jeda" : isShuffle ? "Putar Acak Playlist" : "Putar Semua"}
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Spotify-style Shuffle Button */}
          <button
            onClick={handleShuffleClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer relative ${
              isShuffle
                ? "bg-purple-600/30 border-purple-500 text-purple-300 shadow-md shadow-purple-600/30 hover:bg-purple-600/40 hover:scale-105"
                : "border-[#312554] text-[#9a91b4] hover:text-white hover:border-purple-500/40 hover:bg-[#1a1233]"
            }`}
            title={isShuffle ? "Acak Playlist (Aktif)" : "Acak Playlist"}
          >
            <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {isShuffle && (
              <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_6px_#a855f7]" />
            )}
          </button>

          <button
            onClick={() => showToast("Tautan playlist disalin! 📋", "default")}
            className="text-[#9a91b4] hover:text-white p-2 hover:bg-[#1a1233] rounded-full transition-colors"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Edit & Delete for Custom User Playlists */}
          {!isLikedView && playlist.id !== "liked-songs" && (
            <>
              <button
                onClick={() => openEditPlaylistModal(playlist)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/60 transition-all cursor-pointer shadow-sm"
                title="Edit Nama & Deskripsi"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                onClick={() => openDeletePlaylistModal(playlist)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-300/80 hover:text-white hover:bg-rose-600/20 hover:border-rose-500/60 transition-all cursor-pointer shadow-sm"
                title="Hapus Playlist Ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </>
          )}
        </div>

        {/* Search within playlist */}
        <div className="relative w-36 sm:w-56">
          <input
            type="text"
            value={playlistSearch}
            onChange={(e) => setPlaylistSearch(e.target.value)}
            placeholder="Cari lagu..."
            className="w-full bg-[#181132] text-xs text-white placeholder-[#786e97] rounded-full pl-3 pr-3 py-1.5 border border-[#271d47] focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tracks List */}
      <div className="w-full">
        {/* Table Header (Hidden on small mobile) */}
        <div className="hidden sm:grid grid-cols-12 gap-3 sm:gap-4 px-3 sm:px-4 py-2 border-b border-[#20163b] text-xs font-semibold text-[#8a81a4] uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className={showAddedDate ? "col-span-5 md:col-span-4" : "col-span-6 md:col-span-5"}>
            Judul
          </div>
          <div className="col-span-3 hidden md:block truncate">Album</div>
          {showAddedDate && (
            <div className="col-span-2 hidden xl:block truncate">Ditambahkan</div>
          )}
          <div
            className={`${
              showAddedDate
                ? "col-span-6 sm:col-span-6 md:col-span-4 xl:col-span-2"
                : "col-span-5 md:col-span-3"
            } flex justify-end pr-2`}
          >
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Songs Items */}
        <div className="mt-2 space-y-1">
          {filteredSongs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#8e85a8] text-xs sm:text-sm">
              {currentSongIds.length > 0 && playlistSongs.length === 0 ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span>Memuat lagu playlist...</span>
                </>
              ) : playlistSearch ? (
                <span>Tidak ada lagu yang cocok dengan pencarian &quot;{playlistSearch}&quot;.</span>
              ) : (
                <span>Belum ada lagu dalam playlist ini.</span>
              )}
            </div>
          ) : (
            filteredSongs.map((song, index) => {
              const isThisPlaying = isPlaying && currentSong?.id === song.id;
              const isLiked = likedSongIds.includes(song.id);

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, playlist, playlistSongs)}
                  className={`flex sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg group cursor-pointer transition-colors ${
                    currentSong?.id === song.id
                      ? "bg-purple-950/30 text-purple-300"
                      : "hover:bg-[#181133] text-[#cbc4de]"
                  }`}
                >
                  {/* Track Index (Desktop) */}
                  <div className="hidden sm:flex col-span-1 items-center justify-center font-mono text-xs text-[#8a81a4]">
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
                  <div
                    className={`${
                      showAddedDate
                        ? "col-span-5 md:col-span-4"
                        : "col-span-6 md:col-span-5"
                    } flex items-center gap-3 min-w-0 flex-1`}
                  >
                    <img
                      src={song.cover || "/default-cover.svg"}
                      alt={song.title}
                      className="w-10 h-10 sm:w-10 sm:h-10 rounded object-cover shrink-0 shadow"
                      onError={(e) => {
                        if (song?.fallbackCover && e.currentTarget.src !== song.fallbackCover) {
                          e.currentTarget.src = song.fallbackCover;
                        } else if (e.currentTarget.src !== "/default-cover.svg") {
                          e.currentTarget.src = "/default-cover.svg";
                        }
                      }}
                    />
                    <div className="min-w-0 flex flex-col">
                      <span
                        className={`font-semibold text-xs sm:text-sm truncate ${
                          currentSong?.id === song.id
                            ? "text-purple-300 font-bold"
                            : "text-white group-hover:text-purple-200"
                        }`}
                      >
                        {song.title}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo("artist", {
                            artistName: song.artist,
                            artistInfo: song.artistInfo,
                          });
                        }}
                        className="text-[11px] sm:text-xs text-[#958dae] hover:text-white hover:underline truncate cursor-pointer"
                      >
                        {song.artist}
                      </span>
                    </div>
                  </div>

                  {/* Album Name (Desktop) */}
                  <div className="col-span-3 hidden md:block text-xs text-[#958dae] truncate min-w-0">
                    {song.album}
                  </div>

                  {/* Date Added (Desktop) - only when at least one sidebar is closed */}
                  {showAddedDate && (
                    <div className="col-span-2 hidden xl:block text-xs text-[#7e759a] truncate min-w-0 pr-2">
                      {song.addedDate || "Baru saja"}
                    </div>
                  )}

                  {/* Actions: Add to Playlist, Like & Duration */}
                  <div
                    className={`${
                      showAddedDate
                        ? "col-span-6 sm:col-span-6 md:col-span-4 xl:col-span-2"
                        : "col-span-5 md:col-span-3"
                    } flex items-center justify-end gap-1.5 sm:gap-2 text-xs shrink-0 pr-1`}
                  >

                    {/* Add to Queue Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(song);
                      }}
                      className="text-[#877e9f] hover:text-purple-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Tambahkan ke Antrean"
                    >
                      <ListMusic className="w-4 h-4" />
                    </button>

                    {/* Add to Playlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(song);
                      }}
                      className="text-[#877e9f] hover:text-purple-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Tambahkan ke Playlist"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    {/* Remove from this custom playlist (if user-created) */}
                    {playlist.id !== "liked-songs" && playlist.creator === "Bams" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSongFromPlaylist(song.id, playlist.id);
                        }}
                        className="text-[#877e9f] hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus dari Playlist Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

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
                          isLiked
                            ? "fill-purple-500 text-purple-500"
                            : "opacity-70 group-hover:opacity-100"
                        }`}
                      />
                    </button>

                    <span className="font-mono text-[#8a81a4] text-xs">
                      {song.duration}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
