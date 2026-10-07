"use client";

import React, { useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import TopNav from "./TopNav";
import HomeView from "./HomeView";
import SearchView from "./SearchView";
import PlaylistView from "./PlaylistView";
import ArtistView from "./ArtistView";
import LyricsView from "./LyricsView";
import QueueView from "./QueueView";
import LibraryView from "./LibraryView";
import DownloadedView from "./DownloadedView";

export default function MainContent() {
  const { activeView, currentSong } = useAudio();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeView]); // scroll ke atas hanya saat pindah view, bukan saat ganti lagu

  return (
    <main className="flex-1 h-full min-w-0 bg-gradient-to-b from-[#150a2e]/60 via-[#0a0515] to-[#080410] flex flex-col overflow-hidden relative">
      <TopNav />

      <div
        ref={scrollContainerRef}
        className={`flex-1 relative ${
          activeView === "lyrics"
            ? "overflow-hidden p-0"
            : "overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-6"
        }`}
      >
        {activeView === "home" && <HomeView />}
        {activeView === "search" && <SearchView />}
        {activeView === "playlist" && <PlaylistView />}
        {activeView === "artist" && <ArtistView />}
        {activeView === "lyrics" && <LyricsView />}
        {activeView === "queue" && <QueueView />}
        {activeView === "library" && <LibraryView />}
        {activeView === "downloaded" && <DownloadedView />}
      </div>
    </main>
  );
}
