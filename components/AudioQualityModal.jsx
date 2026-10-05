"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  X,
  Sliders,
  Sparkles,
  Volume2,
  Check,
  Zap,
  Activity,
  ShieldCheck,
  Radio,
  Music4,
  Layers,
} from "lucide-react";

export default function AudioQualityModal() {
  const {
    isAudioQualityModalOpen,
    setIsAudioQualityModalOpen,
    audioQuality,
    setAudioQuality,
    audioNormalization,
    setAudioNormalization,
    audioNormalizationLevel,
    setAudioNormalizationLevel,
    equalizerPreset,
    setEqualizerPreset,
    showToast,
  } = useAudio();

  const [activeTab, setActiveTab] = useState("quality"); // "quality" | "normalization" | "equalizer"

  if (!isAudioQualityModalOpen) return null;

  const qualityOptions = [
    {
      id: "auto",
      title: "Otomatis (Direkomendasikan)",
      bitrate: "Dinamis",
      desc: "Menyesuaikan otomatis bitrate sesuai stabilitas koneksi internet.",
      badge: "Smart Sync",
    },
    {
      id: "lossless",
      title: "Sangat Tinggi (Master HiFi)",
      bitrate: "320 kbps • 24-bit / 96kHz",
      desc: "Kualitas studio master audio murni tanpa kompresi, detail instrumen penuh.",
    },
    {
      id: "high",
      title: "Tinggi (High Quality)",
      bitrate: "160 kbps",
      desc: "Audio jernih seimbang dengan dynamic range luas untuk headphone & speaker.",
      badge: "Standar Pro",
    },
    {
      id: "normal",
      title: "Normal (Medium)",
      bitrate: "96 kbps",
      desc: "Kualitas audio standar jernih dengan konsumsi bandwidth moderat.",
    },
    {
      id: "low",
      title: "Rendah (Hemat Kuota)",
      bitrate: "24 kbps",
      desc: "Sangat hemat data seluler dan hemat baterai saat bepergian.",
    },
  ];

  const eqPresets = [
    {
      id: "bass_boost",
      name: "Bass Booster",
      desc: "Sub-bass lebih dalam & punchy (+6dB) untuk beat hip-hop & pop modern.",
      frequencies: [85, 75, 50, 40, 55, 65],
    },
    {
      id: "vocal",
      name: "Vocal Booster",
      desc: "Memperjelas artikulasi vokal penyanyi dan lirik emosional.",
      frequencies: [35, 45, 80, 88, 70, 50],
    },
    {
      id: "acoustic",
      name: "Acoustic Live",
      desc: "Mengangkat petikan gitar akustik, denting piano, dan suasana panggung.",
      frequencies: [45, 55, 65, 75, 85, 80],
    },
    {
      id: "rock",
      name: "Rock & Metal",
      desc: "Distorsi gitar elektrik bertenaga dan dentuman drum solid.",
      frequencies: [80, 70, 45, 60, 75, 85],
    },
    {
      id: "pop",
      name: "Pop Nusantara",
      desc: "Kurva senyum (smile curve) ceria dengan bass empuk dan treble renyah.",
      frequencies: [65, 70, 55, 60, 75, 80],
    },
    {
      id: "flat",
      name: "Datar (Flat Studio Reference)",
      desc: "Respons frekuensi netral sesuai rekaman mastering produser asli.",
      frequencies: [50, 50, 50, 50, 50, 50],
    },
  ];

  // Instant Web Audio acoustic feedback for tangible sound difference
  const playAcousticPreview = (type, param) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "quality") {
        if (param === "lossless") {
          // Master HiFi: Crystal harmonic chime
          [523.25, 659.25, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.09 / (idx + 1), ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          });
        } else if (param === "high") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(660, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (param === "low") {
          // Low 24k: Muffled data-saver low-pass tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } else if (type === "eq") {
        if (param === "bass_boost") {
          // Sub-bass 55Hz pulse
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(65, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } else if (param === "vocal") {
          // Vocal presence 1.4kHz chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1400, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.28);
        } else if (param === "rock") {
          [165, 330].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          });
        } else if (param === "acoustic") {
          [523.25, 659.25].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          });
        }
      } else if (type === "norm") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(param === "loud" ? 880 : param === "quiet" ? 330 : 550, ctx.currentTime);
        gain.gain.setValueAtTime(param === "loud" ? 0.12 : param === "quiet" ? 0.04 : 0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (_) {}
  };

  const handleSelectQuality = (id, title) => {
    playAcousticPreview("quality", id);
    setAudioQuality(id);
    showToast(`Kualitas Audio diatur ke: ${title}`, "success");
  };

  const handleSelectEQ = (id, name) => {
    playAcousticPreview("eq", id);
    setEqualizerPreset(id);
    showToast(`Equalizer diubah ke: ${name}`, "success");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsAudioQualityModalOpen(false)}
    >
      <div
        className="relative w-full max-w-xl bg-gradient-to-b from-[#1c1236] to-[#0f091f] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg purple-glow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Pengaturan Kualitas Suara
                </h2>
              </div>
              <p className="text-xs text-purple-300/80">
                Optimalkan bitrate streaming, dynamic range & profil audio
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAudioQualityModalOpen(false)}
            className="p-1.5 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-500/20 bg-[#120a24]/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("quality")}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === "quality"
                ? "text-white"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Bitrate Streaming</span>
            </div>
            {activeTab === "quality" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("equalizer")}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === "equalizer"
                ? "text-white"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Equalizer DSP</span>
            </div>
            {activeTab === "equalizer" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("normalization")}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === "normalization"
                ? "text-white"
                : "text-purple-300/60 hover:text-purple-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Normalisasi Volume</span>
            </div>
            {activeTab === "normalization" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* TAB 1: Kualitas Streaming */}
          {activeTab === "quality" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300/70 mb-1">
                <span>Pilih tingkat resolusi audio yang dialirkan:</span>
                <span className="text-[11px] font-mono text-purple-400">
                  Aktif: {audioQuality.toUpperCase()}
                </span>
              </div>

              {qualityOptions.map((opt) => {
                const isSelected = audioQuality === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectQuality(opt.id, opt.title)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50"
                        : "bg-[#140b29]/50 border-purple-500/10 hover:border-purple-500/30 hover:bg-[#1a0f35]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              opt.premium
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-purple-900/40 text-purple-300 border border-purple-500/20"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-300/70 mt-0.5 line-clamp-1">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-semibold text-purple-400">
                        {opt.bitrate}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-purple-600 border-purple-500 text-white"
                            : "border-purple-500/30 bg-purple-950/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Equalizer DSP */}
          {activeTab === "equalizer" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-950/40 border border-purple-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Hardware Web Audio API DSP
                    </span>
                    <span className="text-[11px] text-purple-300/70 block">
                      Pemrosesan sinyal audio 6-band aktif secara real-time
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold">
                  AKTIF
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eqPresets.map((preset) => {
                  const isSelected = equalizerPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectEQ(preset.id, preset.name)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-purple-950/70 border-purple-500 shadow-md ring-1 ring-purple-500/50"
                          : "bg-[#140b29]/50 border-purple-500/10 hover:border-purple-500/30 hover:bg-[#1a0f35]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-purple-300/70 mb-3 line-clamp-2">
                        {preset.desc}
                      </p>

                      {/* Visual Frequency Response Indicator */}
                      <div className="h-8 bg-[#0d071a] rounded-lg p-1.5 flex items-end justify-between gap-1">
                        {preset.frequencies.map((val, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-purple-600 to-fuchsia-400 rounded-sm transition-all duration-300"
                            style={{ height: `${val}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Normalisasi Volume */}
          {activeTab === "normalization" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/40 border border-purple-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Normalisasi Volume Audio
                  </h3>
                  <p className="text-xs text-purple-300/70 mt-0.5">
                    Menjaga kenyamanan pendengaran dengan menyamakan desibel antar lagu berbeda
                  </p>
                </div>

                <button
                  onClick={() => {
                    const nextVal = !audioNormalization;
                    setAudioNormalization(nextVal);
                    showToast(
                      `Normalisasi Audio ${nextVal ? "Diaktifkan" : "Dinonaktifkan"}`,
                      "default"
                    );
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    audioNormalization ? "bg-purple-600" : "bg-purple-950/80 border border-purple-500/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      audioNormalization ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {audioNormalization && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Tingkat Normalisasi Desibel
                  </h4>

                  {[
                    { id: "quiet", label: "Santai (Quiet)", lufs: "-14 LUFS (Kamar Tenang / Headphone Studio)" },
                    { id: "normal", label: "Normal (Standard)", lufs: "-11 LUFS (Seimbang untuk Penggunaan Harian)" },
                    { id: "loud", label: "Keras (Loud)", lufs: "-8 LUFS (Lingkungan Ramai / Speaker Mobil)" },
                  ].map((lvl) => {
                    const isSelected = audioNormalizationLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => {
                          playAcousticPreview("norm", lvl.id);
                          setAudioNormalizationLevel(lvl.id);
                          showToast(`Tingkat Normalisasi: ${lvl.label}`, "success");
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-950/60 border-purple-500 text-white"
                            : "bg-[#140b29]/50 border-purple-500/10 text-purple-300/70 hover:bg-[#1a0f35]"
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold block text-white">
                            {lvl.label}
                          </span>
                          <span className="text-xs text-purple-300/60 block font-mono">
                            {lvl.lufs}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-purple-600 border-purple-500 text-white"
                              : "border-purple-500/30"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-purple-950/40 flex items-center justify-between text-xs text-purple-300/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Format Master: AAC 256kbps VBR / Flac 24-bit 96kHz</span>
          </div>

          <button
            onClick={() => setIsAudioQualityModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
