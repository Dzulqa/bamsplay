"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  X,
  Plus,
  Check,
  Music,
  ListMusic,
  Search,
  Sparkles,
} from "lucide-react";

export default function AddToPlaylistModal() {
  const {
    isAddToPlaylistModalOpen,
    closeAddToPlaylistModal,
    selectedSongForPlaylist,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    createNewPlaylist,
    showToast,
  } = useAudio();

  const [searchFilter, setSearchFilter] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");

  if (!isAddToPlaylistModalOpen || !selectedSongForPlaylist) return null;

  // Filter user playlists (exclude system liked-songs playlist)
  const availablePlaylists = playlists.filter((p) => p.id !== "liked-songs");

  const filteredPlaylists = searchFilter
    ? availablePlaylists.filter((p) =>
        p.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : availablePlaylists;

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    const created = createNewPlaylist(
      newPlaylistTitle.trim(),
      "Daftar putar pribadi yang dibuat di Bamsplay.",
      selectedSongForPlaylist
    );

    setNewPlaylistTitle("");
    setIsCreatingNew(false);
    showToast(`Ditambahkan ke "${created.title}"`, "purple");
  };

  const handleToggleSongInPlaylist = (playlist) => {
    const isAlreadyIn = playlist.songIds?.includes(selectedSongForPlaylist.id);
    if (isAlreadyIn) {
      removeSongFromPlaylist(selectedSongForPlaylist.id, playlist.id);
    } else {
      addSongToPlaylist(selectedSongForPlaylist, playlist.id);
    }
  };

  return (
    <div
      onClick={closeAddToPlaylistModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#150d29] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#281b47]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                Tambahkan ke Playlist
              </h2>
              <p className="text-[11px] text-[#938ba8]">
                Pilih atau buat playlist untuk lagu ini
              </p>
            </div>
          </div>
          <button
            onClick={closeAddToPlaylistModal}
            className="p-1.5 rounded-full text-[#938ba8] hover:text-white hover:bg-purple-900/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Song Preview Pill */}
        <div className="px-4 sm:px-5 py-3 bg-[#100921]/80 border-b border-[#22163e] flex items-center gap-3">
          <img
            src={selectedSongForPlaylist.cover || "/default-cover.svg"}
            alt={selectedSongForPlaylist.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-cover.svg";
            }}
            className="w-11 h-11 rounded-md object-cover shadow border border-white/10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs sm:text-sm text-white truncate block">
              {selectedSongForPlaylist.title}
            </span>
            <span className="text-[11px] text-purple-300/80 truncate block">
              {selectedSongForPlaylist.artist}
            </span>
          </div>
        </div>

        {/* Action: Create New Playlist Quick Form */}
        <div className="p-4 sm:px-5 border-b border-[#22163e]">
          {isCreatingNew ? (
            <form onSubmit={handleCreateAndAdd} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Nama playlist baru..."
                  className="flex-1 bg-[#0c0718] text-xs sm:text-sm text-white placeholder-[#786e97] rounded-xl px-3 py-2 border border-purple-500/40 focus:border-purple-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md shrink-0"
                >
                  Buat & Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewPlaylistTitle("");
                  }}
                  className="p-2 text-[#938ba8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Buat Playlist Baru untuk Lagu Ini</span>
            </button>
          )}
        </div>

        {/* Search Playlists Filter */}
        {availablePlaylists.length > 4 && (
          <div className="px-4 sm:px-5 pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#7c7398] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari dalam playlist..."
                className="w-full bg-[#0d071b] text-xs text-white placeholder-[#7c7398] pl-8 pr-3 py-1.5 rounded-lg border border-[#2b1f4c] focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1.5 custom-scrollbar min-h-[160px] max-h-[300px]">
          {filteredPlaylists.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8d84a7]">
              {searchFilter
                ? "Tidak ada playlist yang cocok."
                : "Belum ada playlist kustom. Silakan buat playlist baru di atas."}
            </div>
          ) : (
            filteredPlaylists.map((pl) => {
              const isInPlaylist = pl.songIds?.includes(
                selectedSongForPlaylist.id
              );

              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleSongInPlaylist(pl)}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-md cursor-pointer transition-colors border ${
                    isInPlaylist
                      ? "bg-purple-950/40 border-purple-500/40 text-purple-200"
                      : "bg-[#110a24]/50 hover:bg-[#1f153a] border-transparent hover:border-white/5 text-[#cbc5dc]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Cover */}
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-white/10 shadow-sm flex items-center justify-center">
                      {pl.cover?.startsWith("http") ? (
                        <img
                          src={pl.cover}
                          alt={pl.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-cover.svg";
                          }}
                          className="w-full h-full object-cover"
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
                          <Music className="w-4 h-4 text-purple-200" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-white truncate block">
                        {pl.title}
                      </span>
                      <span className="text-[11px] text-[#8e85a6] truncate block">
                        {pl.songIds ? pl.songIds.length : pl.totalSongs || 0} lagu
                      </span>
                    </div>
                  </div>

                  {/* Toggle Check / Plus Button */}
                  <button
                    type="button"
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isInPlaylist
                        ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                        : "border border-purple-500/30 text-[#8e85a6] hover:text-white hover:border-purple-400"
                    }`}
                    title={
                      isInPlaylist
                        ? "Hapus dari playlist"
                        : "Tambahkan ke playlist"
                    }
                  >
                    {isInPlaylist ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#0e071c] border-t border-[#231740] flex items-center justify-end">
          <button
            onClick={closeAddToPlaylistModal}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
