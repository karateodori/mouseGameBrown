"use client";

import React, { useState, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { StartScreen, GameOverScreen, HUD } from './UIComponents';
import { BackgroundMusic } from './BackgroundMusic';

type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export default function MicrobeSurvivor() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(0);
    setGameState('PLAYING');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('GAMEOVER');
  }, []);

  const handleScore = useCallback(() => {
    setScore(prev => prev + 1);
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  }, []);

  return (
    <main className={`min-h-screen flex items-center justify-center bg-slate-950 transition-all duration-300 ${isShaking ? 'shake' : ''}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {gameState === 'START' && <StartScreen onStart={startGame} />}
        
        {gameState === 'PLAYING' && (
          <>
            <HUD score={score} lives={lives} />
            <GameCanvas 
              onScore={handleScore} 
              onGameOver={handleGameOver} 
              onShake={triggerShake}
              lives={lives}
              onLifeChange={setLives}
              isPaused={false} 
            />
          </>
        )}

        {gameState === 'GAMEOVER' && (
          <GameOverScreen score={score} onRetry={startGame} />
        )}
      </div>

      {/* Footer info */}
      <footer className="fixed bottom-6 left-6 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
        MICROBE SURVIVOR • V1.0.0
      </footer>

      <BackgroundMusic isPlaying={gameState === 'PLAYING'} />
    </main>
  );
}
