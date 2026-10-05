"use client";

import React from "react";

/**
 * BamsplayLogo
 * Minimalist, Spotify-inspired circular brand mark.
 * Features a distinct, tall lowercase letter 'b' (Bams)
 * with its loop shaped into a forward-pointing Play triangle (▶ Play).
 * 
 * In-app usage: Directly circular ("circle") by default.
 * APK usage: Can render "apk" (kotak putih dengan lingkaran di dalam).
 */
export default function BamsplayLogo({
  className = "w-9 h-9",
  variant = "circle", // "circle" (langsung lingkaran ungu di dalam app) | "apk" (kotak putih + lingkaran)
  withGlow = true,
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        withGlow ? "drop-shadow-[0_0_12px_rgba(139,92,246,0.55)]" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="bamsplayPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="bamsplayGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {variant === "apk" ? (
          <>
            {/* Outer Box: White rounded container (for APK / PWA icon export) */}
            <rect x="0" y="0" width="100" height="100" rx="20" fill="#FFFFFF" />

            {/* Inner Circle: Purple Circle centered inside */}
            <circle cx="50" cy="50" r="38" fill="url(#bamsplayPurpleGrad)" />
            <circle cx="50" cy="50" r="38" fill="url(#bamsplayGleam)" />

            {/* Glyph scaled inside circle with prominent tall ascender */}
            <g transform="translate(50, 50) scale(0.78) translate(-50, -50)">
              <path
                d="M 37 18 L 37 72 C 37 78.5 42.5 81 48 77 L 70 60 C 73 57.5 73 54.5 70 52 L 48 35 C 42.5 31 37 33.5 37 42"
                stroke="#FFFFFF"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          </>
        ) : (
          <>
            {/* Direct Circle Variant (For In-App UI: Sidebar, Header, etc.) */}
            <circle cx="50" cy="50" r="48" fill="url(#bamsplayPurpleGrad)" />
            <circle cx="50" cy="50" r="48" fill="url(#bamsplayGleam)" />

            {/* The Unmistakable Play-B Glyph: Tall vertical stem + Play ▶ triangle */}
            <path
              d="M 37 18 L 37 72 C 37 78.5 42.5 81 48 77 L 70 60 C 73 57.5 73 54.5 70 52 L 48 35 C 42.5 31 37 33.5 37 42"
              stroke="#FFFFFF"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
      </svg>
    </div>
  );
}
