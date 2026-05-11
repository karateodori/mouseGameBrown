"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const BackgroundMusic: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      if (isPlaying) {
        audioRef.current.currentTime = 0; // Restart from the beginning
        if (!isMuted) {
          audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        src="/bgm.mp3"
        loop
      />
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="p-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-slate-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary" />
        )}
      </button>
    </div>
  );
};
