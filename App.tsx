
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, BeyName, AIDifficulty, ArenaStyle, BattleStats, Blade } from './types';
import Menu from './components/Menu';
import CustomizeScreen from './components/CustomizeScreen';
import StoryScreen from './components/StoryScreen';
import TutorialScreen from './components/TutorialScreen';
import Arena from './components/Arena';
import UIOverlay from './components/UIOverlay';
import ResultScreen from './components/ResultScreen';
import { sounds } from './utils/sounds';
import { STORY_CHAPTERS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [playerBey, setPlayerBey] = useState<BeyName>('Z_ACHILLES');
  const [rivalBey, setRivalBey] = useState<BeyName>('EMPEROR_FORNEUS');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('ACE');
  const [arenaStyle, setArenaStyle] = useState<ArenaStyle>('CLASSIC');
  const [chapterIndex, setChapterIndex] = useState(0);
  
  const [playerStats, setPlayerStats] = useState({ health: 100, energy: 0 });
  const [rivalStats, setRivalStats] = useState({ health: 100, energy: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [battleReport, setBattleReport] = useState<{ player: BattleStats, rival: BattleStats } | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [specialTriggered, setSpecialTriggered] = useState(false);

  useEffect(() => {
    if (state === 'BATTLE') {
      sounds.startBGM();
    } else {
      sounds.stopBGM();
    }
  }, [state]);

  const startTournament = () => {
    setChapterIndex(0);
    setState('STORY');
  };

  const handleStoryComplete = () => {
    const chapter = STORY_CHAPTERS[chapterIndex];
    setRivalBey(chapter.rivalBey as BeyName);
    setArenaStyle(chapter.arena as ArenaStyle || 'CLASSIC');
    setState('BATTLE');
  };

  const handleGameOver = (winningName: string, stats: BattleStats) => {
    setWinner(winningName);
    // Simple mock report for now based on winner
    setBattleReport({
      player: stats,
      rival: { ...stats, damageDealt: stats.damageTaken, damageTaken: stats.damageDealt }
    });
    setState('RESULT');
  };

  const handleUpdateStats = useCallback((p: Blade, r: Blade) => {
    setPlayerStats({ health: p.health, energy: p.energy });
    setRivalStats({ health: r.health, energy: r.energy });
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden font-press-start">
      {state === 'IDLE' && <Menu onStart={startTournament} onTutorial={() => setState('TUTORIAL')} />}
      
      {state === 'TUTORIAL' && <TutorialScreen onComplete={() => setState('IDLE')} />}
      
      {state === 'STORY' && (
        <StoryScreen 
          chapterIndex={chapterIndex} 
          onComplete={handleStoryComplete} 
        />
      )}
      
      {state === 'CUSTOMIZE' && (
        <CustomizeScreen 
          currentBey={playerBey}
          difficulty={difficulty}
          onBeyChange={setPlayerBey}
          onDifficultyChange={setDifficulty}
          onConfirm={() => setState('STORY')}
        />
      )}
      
      {state === 'BATTLE' && (
        <>
          <Arena 
            playerBey={playerBey}
            rivalBey={rivalBey}
            difficulty={difficulty}
            arenaStyle={arenaStyle}
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
          {/* Reset special trigger after frame */}
          {specialTriggered && <div className="hidden">{setTimeout(() => setSpecialTriggered(false), 50)}</div>}
        </>
      )}
      
      {state === 'RESULT' && (
        <ResultScreen 
          winner={winner}
          report={battleReport}
          onRestart={() => setState('BATTLE')}
          onHome={() => setState('IDLE')}
        />
      )}

      {/* Retro HUD Decoration */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-20">
         <div className="text-[10px] text-blue-500">SYSTEM: V-BIOS 1.0.0</div>
         <div className="text-[10px] text-blue-500">LINK: TURBO_CHIP_ACTIVE</div>
      </div>
    </div>
  );
};

export default App;
