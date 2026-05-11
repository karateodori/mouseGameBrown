"use client";

import React from 'react';
import { Play, RotateCcw, Share2, Target, Trophy, Info } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="screen-overlay bg-slate-950/80 backdrop-blur-sm">
      <div className="glass p-12 rounded-3xl text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full">
            <Target className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          MICROBE SURVIVOR
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          マウスで<span className="text-primary font-bold">緑の菌</span>を狙え！<br />
          赤に触れたら即ゲームオーバー。<br />
          取るたびに加速する世界を生き残れ。
        </p>
        <button onClick={onStart} className="btn-primary flex items-center gap-2 mx-auto">
          <Play className="w-5 h-5 fill-current" />
          開始する
        </button>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4" />
          マウス操作のみでプレイ可能
        </div>
      </div>
    </div>
  );
};

interface GameOverScreenProps {
  score: number;
  onRetry: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRetry }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Microbe Survivorでスコア ${score} を達成！ #MicrobeSurvivor`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Microbe Survivor',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
    
    // Fallback to Twitter intent
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="screen-overlay bg-danger/10 backdrop-blur-md">
      <div className="glass p-12 rounded-3xl text-center max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-danger/20 p-4 rounded-full">
            <Trophy className="w-12 h-12 text-danger" />
          </div>
        </div>
        <h2 className="text-4xl font-black mb-2 text-white">GAME OVER</h2>
        <div className="text-6xl font-black text-primary mb-8 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
          {score}
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={onRetry} className="btn-primary flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" />
            リトライ
          </button>
          <button 
            onClick={handleShare}
            className="px-8 py-3 border border-white/10 hover:bg-white/5 rounded-full font-bold transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            スコアをシェア
          </button>
        </div>
      </div>
    </div>
  );
};

interface HUDProps {
  score: number;
  lives: number;
}

import { Heart } from 'lucide-react';

export const HUD: React.FC<HUDProps> = ({ score, lives }) => {
  return (
    <div className="fixed top-8 left-0 right-0 px-8 flex justify-between items-center pointer-events-none z-40">
      <div className="flex gap-2">
        {Array.from({ length: Math.min(lives, 5) }).map((_, i) => (
          <div key={i} className="glass p-2 rounded-full animate-in zoom-in duration-300">
            <Heart className="w-5 h-5 text-danger fill-danger" />
          </div>
        ))}
        {lives > 5 && (
          <div className="glass px-3 py-2 rounded-full text-danger font-bold">
            + {lives - 5}
          </div>
        )}
      </div>
      
      <div className="glass px-8 py-3 rounded-full flex items-center gap-4">
        <span className="text-slate-400 font-bold tracking-widest text-sm">SCORE</span>
        <span className="text-3xl font-black text-primary tabular-nums">{score}</span>
      </div>
      
      <div className="w-32" /> {/* Spacer to keep score centered if possible */}
    </div>
  );
};
