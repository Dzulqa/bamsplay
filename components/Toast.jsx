"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useAudio();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1e153b] text-white text-xs font-semibold shadow-2xl border border-purple-500/40 purple-glow-sm">
        {toastMessage.type === "purple" ? (
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0" />
        )}
        <span>{toastMessage.message}</span>
      </div>
    </div>
  );
}
