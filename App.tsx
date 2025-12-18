
import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, Blade, ArenaStyle, BattleStats, AIDifficulty, BladeArchetype, BitbeastType } from './types';
import Arena from './components/Arena';
import Menu from './components/Menu';
import StoryScreen from './components/StoryScreen';
import CustomizeScreen from './components/CustomizeScreen';
import ResultScreen from './components/ResultScreen';
import UIOverlay from './components/UIOverlay';
import TutorialScreen from './components/TutorialScreen';
import { sounds } from './utils/sounds';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState({ health: 100, energy: 0 });
  const [rivalStats, setRivalStats] = useState({ health: 100, energy: 0 });
  const [battleReport, setBattleReport] = useState<{ player: BattleStats, rival: BattleStats } | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [difficulty, setDifficulty] = useState<AIDifficulty>('ACE');
  
  const [playerCustom, setPlayerCustom] = useState<{
    color: string;
    glowColor: string;
    stylePattern: 'DRAGON' | 'PHOENIX' | 'TIGER' | 'TURTLE';
    arenaStyle: ArenaStyle;
    archetype: BladeArchetype;
    bitbeast: BitbeastType;
  }>({
    color: '#3b82f6',
    glowColor: '#60a5fa',
    stylePattern: 'DRAGON',
    arenaStyle: 'CLASSIC',
    archetype: 'PHANTOM',
    bitbeast: 'DRAGOON'
  });

  useEffect(() => {
    const handleFirstClick = () => {
      sounds.startBGM();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const startGame = () => setStatus('STORY');
  const startTutorial = () => setStatus('TUTORIAL');
  const goToCustomize = () => setStatus('CUSTOMIZE');
  const startBattle = () => setStatus('BATTLE');
  
  const resetToMenu = useCallback(() => {
    setStatus('MENU');
    setWinnerId(null);
    setBattleReport(null);
    setPlayerStats({ health: 100, energy: 0 });
    setRivalStats({ health: 100, energy: 0 });
  }, []);

  const handleGameOver = (winner: string, stats: { player: BattleStats, rival: BattleStats }) => {
    setWinnerId(winner);
    setBattleReport(stats);
    setStatus('RESULT');
  };

  const handleUpdateStats = (player: Blade, rival: Blade) => {
    setPlayerStats({ health: player.health, energy: player.energy });
    setRivalStats({ health: rival.health, energy: rival.energy });
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      {status === 'MENU' && <Menu onStart={startGame} onTutorial={startTutorial} />}
      
      {status === 'STORY' && <StoryScreen onComplete={startTutorial} />}

      {status === 'TUTORIAL' && <TutorialScreen onComplete={goToCustomize} />}

      {status === 'CUSTOMIZE' && (
        <CustomizeScreen 
          config={playerCustom}
          difficulty={difficulty}
          onChange={(cfg) => setPlayerCustom(prev => ({...prev, ...cfg}))}
          onDifficultyChange={setDifficulty}
          onConfirm={startBattle}
        />
      )}

      {status === 'BATTLE' && (
        <>
          <Arena 
            playerConfig={playerCustom}
            difficulty={difficulty}
            joystickVector={joystickVector}
            onGameOver={handleGameOver}
            onUpdateStats={handleUpdateStats}
          />
          <UIOverlay 
            player={playerStats}
            rival={rivalStats}
            onJoystickMove={setJoystickVector}
          />
        </>
      )}

      {status === 'RESULT' && (
        <ResultScreen 
          winner={winnerId}
          report={battleReport}
          onRestart={resetToMenu}
          onHome={resetToMenu}
        />
      )}
    </div>
  );
};

export default App;
