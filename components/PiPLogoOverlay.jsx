"use client";

import React, { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

/**
 * PiPLogoOverlay
 * When the Android APK enters Picture-in-Picture (PiP) mode,
 * this replaces the bulky UI with a sleek, glowing Bamsplay floating logo.
 */
export default function PiPLogoOverlay() {
  const [isPiP, setIsPiP] = useState(false);
  const { isPlaying, togglePlay } = useAudio();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Called natively by MainActivity.java onPictureInPictureModeChanged
    window.__setPiPMode = (active) => {
      setIsPiP(Boolean(active));
    };

    // Fallback: detect tiny window dimensions typical for PiP floating window
    const handleResize = () => {
      if (window.innerWidth > 0 && window.innerWidth <= 260 && window.innerHeight <= 260) {
        setIsPiP(true);
      } else if (window.innerWidth > 320) {
        setIsPiP(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      delete window.__setPiPMode;
    };
  }, []);

  if (!isPiP) return null;

  return (
    <div
      aria-hidden="true"
      onClick={togglePlay}
      className="fixed inset-0 z-[999999] bg-[#0b0813] flex items-center justify-center select-none overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "#0b0813",
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated ambient glow when playing */}
        {isPlaying && (
          <div className="absolute w-16 h-16 rounded-full bg-purple-600/35 blur-md animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bamsplay-logo-circle.png"
          alt="Bamsplay"
          className={`w-14 h-14 object-contain relative z-10 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(147,51,234,0.7)] ${
            isPlaying ? "scale-100" : "scale-90 opacity-75"
          }`}
        />
      </div>
    </div>
  );
}
