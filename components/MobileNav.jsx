"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import { Home, Search, Library } from "lucide-react";

export default function MobileNav() {
  const { activeView, navigateTo } = useAudio();

  return (
    <nav className="md:hidden h-14 bg-[#0a0715]/95 backdrop-blur-lg border-t border-[#1e1538] flex items-center justify-around px-2 z-30 select-none shrink-0">
      <button
        onClick={() => navigateTo("home")}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeView === "home" ? "text-white" : "text-[#8a81a4] hover:text-white"
        }`}
      >
        <Home
          className={`w-5 h-5 mb-0.5 ${
            activeView === "home" ? "text-purple-400" : ""
          }`}
        />
        <span className="text-[10px] font-semibold">Beranda</span>
      </button>

      <button
        onClick={() => navigateTo("search")}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeView === "search" ? "text-white" : "text-[#8a81a4] hover:text-white"
        }`}
      >
        <Search
          className={`w-5 h-5 mb-0.5 ${
            activeView === "search" ? "text-purple-400" : ""
          }`}
        />
        <span className="text-[10px] font-semibold">Cari</span>
      </button>

      <button
        onClick={() => navigateTo("playlist", { playlistId: "liked-songs" })}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeView === "playlist" ? "text-white" : "text-[#8a81a4] hover:text-white"
        }`}
      >
        <Library
          className={`w-5 h-5 mb-0.5 ${
            activeView === "playlist" ? "text-purple-400" : ""
          }`}
        />
        <span className="text-[10px] font-semibold">Koleksi Kamu</span>
      </button>
    </nav>
  );
}
