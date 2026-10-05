"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { X, Laptop2, Smartphone, Speaker, Check, Wifi } from "lucide-react";

export default function DeviceModal() {
  const { isDeviceModalOpen, setIsDeviceModalOpen, showToast } = useAudio();
  const [selectedDevice, setSelectedDevice] = useState("web-player");

  if (!isDeviceModalOpen) return null;

  const devices = [
    {
      id: "web-player",
      name: "Bamsplay Web Player",
      type: "Perangkat ini (Browser Web)",
      icon: Laptop2,
      active: true,
    },
    {
      id: "bams-phone",
      name: "iPhone 15 Pro - Bams",
      type: "Bamsplay Connect",
      icon: Smartphone,
      active: false,
    },
    {
      id: "bams-speaker",
      name: "Marshall Acton III Bluetooth",
      type: "Speaker Ruang Kerja",
      icon: Speaker,
      active: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#17102e] border border-purple-500/30 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2252]">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">
              Hubungkan ke Perangkat
            </h3>
          </div>
          <button
            onClick={() => setIsDeviceModalOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#251a4a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {devices.map((dev) => {
            const Icon = dev.icon;
            const isSelected = selectedDevice === dev.id;

            return (
              <div
                key={dev.id}
                onClick={() => {
                  setSelectedDevice(dev.id);
                  showToast(
                    `Beralih output audio ke: ${dev.name} 🔊`,
                    "purple"
                  );
                }}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-purple-900/40 border border-purple-500/40 text-purple-200"
                    : "bg-[#120a22] hover:bg-[#1e143b] text-[#b3abc9]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-[#21163e] text-[#8e85aa]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">
                      {dev.name}
                    </div>
                    <div className="text-xs text-[#8e85aa]">{dev.type}</div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-purple-400" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-[#7d739b] text-center pt-2">
          Bamsplay Connect memungkinkanmu mengontrol pemutaran di semua perangkatmu dengan lancar.
        </p>
      </div>
    </div>
  );
}
