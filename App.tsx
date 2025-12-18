
import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, Blade, BattleStats, AIDifficulty, BeyName } from './types';
import Arena from './components/Arena';
import Menu from './components/Menu';
import StoryScreen from './components/StoryScreen';
import CustomizeScreen from './components/CustomizeScreen';
import ResultScreen from './components/ResultScreen';
import UIOverlay from './components/UIOverlay';
import TutorialScreen from './components/TutorialScreen';
import { sounds } from './utils/sounds';
import { STORY_CHAPTERS } from './constants';

const STORAGE_KEY = 'beyblade_turbo_save';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState({ health: 100, energy: 0 });
  const [rivalStats, setRivalStats] = useState({ health: 100, energy: 0 });
  const [battleReport, setBattleReport] = useState<{ player: BattleStats, rival: BattleStats } | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [difficulty, setDifficulty] = useState<AIDifficulty>('ACE');
  const [specialTriggered, setSpecialTriggered] = useState(false);
  
  const [playerBey, setPlayerBey] = useState<BeyName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved).playerBey as BeyName) : 'Z_ACHILLES';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ playerBey, chapterIndex }));
  }, [playerBey, chapterIndex]);

  useEffect(() => {
    const handleFirstClick = () => {
      sounds.startBGM();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const startGame = () => setStatus('STORY');
  const startBattle = () => setStatus('BATTLE');
  const nextChapter = () => {
    if (chapterIndex < STORY_CHAPTERS.length - 1) {
      setChapterIndex(prev => prev + 1);
      setStatus('STORY');
    } else {
      setStatus('MENU');
      setChapterIndex(0);
    }
  };

  const resetToMenu = useCallback(() => {
    setStatus('MENU');
    setWinnerId(null);
    setBattleReport(null);
    setPlayerStats({ health: 100, energy: 0 });
    setRivalStats({ health: 100, energy: 0 });
    setSpecialTriggered(false);
  }, []);

  const handleGameOver = (winner: string, stats: BattleStats) => {
    setWinnerId(winner);
    // Construct a dummy report for the result screen
    setBattleReport({
        player: stats,
        rival: { ...stats, damageDealt: 100 - stats.damageDealt } // Approximation
    });
    setStatus('RESULT');
  };

  const handleUpdateStats = (player: Blade, rival: Blade) => {
    setPlayerStats({ health: player.health, energy: player.energy });
    setRivalStats({ health: rival.health, energy: rival.energy });
    if (player.energy < 100 && specialTriggered) {
      setSpecialTriggered(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      {status === 'MENU' && <Menu onStart={startGame} onTutorial={() => setStatus('TUTORIAL')} />}
      
      {status === 'STORY' && (
        <StoryScreen 
          chapterIndex={chapterIndex} 
          onComplete={() => setStatus('CUSTOMIZE')} 
        />
      )}

      {status === 'TUTORIAL' && <TutorialScreen onComplete={() => setStatus('MENU')} />}

      {status === 'CUSTOMIZE' && (
        <CustomizeScreen 
          currentBey={playerBey}
          difficulty={difficulty}
          onBeyChange={setPlayerBey}
          onDifficultyChange={setDifficulty}
          onConfirm={startBattle}
        />
      )}

      {status === 'BATTLE' && (
        <>
          <Arena 
            playerBey={playerBey}
            rivalBey={STORY_CHAPTERS[chapterIndex].rivalBey}
            difficulty={difficulty}
            arenaStyle={STORY_CHAPTERS[chapterIndex].arena}
            joystickVector={joystickVector}
            onGameOver={handleGameOver}
            onUpdateStats={handleUpdateStats}
            specialTriggered={specialTriggered}
          />
          <UIOverlay 
            player={playerStats}
            rival={rivalStats}
            onJoystickMove={setJoystickVector}
            onSpecialPress={() => setSpecialTriggered(true)}
          />
        </>
      )}

      {status === 'RESULT' && (
        <ResultScreen 
          winner={winnerId}
          report={battleReport}
          onRestart={winnerId === 'Aiger' ? nextChapter : resetToMenu}
          onHome={resetToMenu}
        />
      )}
    </div>
  );
};

export default App;
