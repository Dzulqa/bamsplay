"use client";

import React from "react";
import { AudioProvider } from "@/context/AudioContext";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import PlayerBar from "@/components/PlayerBar";
import MobileNav from "@/components/MobileNav";
import MobilePlayerModal from "@/components/MobilePlayerModal";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";
import DeletePlaylistModal from "@/components/DeletePlaylistModal";
import EditPlaylistModal from "@/components/EditPlaylistModal";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import DeviceModal from "@/components/DeviceModal";
import AudioQualityModal from "@/components/AudioQualityModal";
import LoginModal from "@/components/LoginModal";
import EditProfileModal from "@/components/EditProfileModal";
import GlobalAudioEngine from "@/components/GlobalAudioEngine";
import Toast from "@/components/Toast";

export default function Home() {
  return (
    <AudioProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080510] text-[#e3def0]">
        {/* Main Work Area: Left Sidebar (Desktop/Tablet) + Main Viewport + Right Sidebar */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <Sidebar />
          <MainContent />
          <RightSidebar />
        </div>

        {/* Player Bar (Desktop Full Bar & Mobile Mini Player Pill) */}
        <PlayerBar />

        {/* Mobile Bottom Navigation (Only visible on screens < md) */}
        <MobileNav />

        {/* Fullscreen Mobile Player Modal (Slides up on phone when tapping mini player) */}
        <MobilePlayerModal />

        {/* Master Stream Audio Engine (100% Invisible Background Audio) */}
        <GlobalAudioEngine />

        {/* Modals & Toasts */}
        <CreatePlaylistModal />
        <DeletePlaylistModal />
        <EditPlaylistModal />
        <AddToPlaylistModal />
        <DeviceModal />
        <AudioQualityModal />
        <LoginModal />
        <EditProfileModal />
        <Toast />
      </div>
    </AudioProvider>
  );
}
