import { useEffect, useRef, useState } from 'react';
import { STAGES } from './data/stages.js';
import { STAGE_META } from './data/stageMeta.js';
import { FRAGMENT_ORDER } from './lib/pieces.js';
import { loadProgress, saveProgress, clearProgress } from './lib/progress.js';
import { track, setTrackedRoom } from './lib/track.js';
import { useScale } from './hooks/useScale.js';
import { CityBackdrop } from './components/CityBackdrop.jsx';
import { EntryScreen } from './components/screens/EntryScreen.jsx';
import { IntroScreen } from './components/screens/IntroScreen.jsx';
import { MapScreen } from './components/screens/MapScreen.jsx';
import { StageScreen } from './components/screens/StageScreen.jsx';
import { BackpackScreen } from './components/screens/BackpackScreen.jsx';
import { AssemblyScreen } from './components/screens/AssemblyScreen.jsx';
import { EndingScreen, Ending1Screen, Ending2Screen } from './components/screens/EndingScreens.jsx';

const initialGame = {
  screen: 'entry', // entry | intro | map | stage | backpack | assembly | ending | ending1 | ending2
  roomCode: '',
  unlockedIndex: 1,
  collectedFragments: [],
  creatorMode: false,
  stageKey: null,
  beatIndex: 0,
  arrivedBack: false, // current beat reached via 上一頁 → render text fully typed
};

/**
 * Game controller: owns the screen router and all cross-screen progress
 * (unlocks, fragments, current stage/beat). Everything beat-local
 * (typewriters, puzzle inputs, mini-game clocks) lives in the screens.
 */
export default function App() {
  const scale = useScale();
  const [game, setGame] = useState(() => {
    const saved = loadProgress();
    if (saved) {
      return {
        ...initialGame,
        screen: saved.screen,
        roomCode: Array.isArray(saved.room) ? saved.room.join('') : saved.room || '',
        unlockedIndex: saved.unlockedIndex ?? 1,
        collectedFragments: saved.collectedFragments || [],
      };
    }
    return initialGame;
  });
  const [toastMsg, setToastMsg] = useState('');
  const [unlockBanner, setUnlockBanner] = useState('');
  const toastTimer = useRef(null);
  const bannerTimer = useRef(null);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(bannerTimer.current); }, []);
  useEffect(() => { setTrackedRoom(game.roomCode); }, [game.roomCode]);
  useEffect(() => { track('session_start'); }, []);

  const persist = (g) => saveProgress({
    // legacy shape: `room` is an array of 6 chars
    room: g.roomCode.split(''),
    unlockedIndex: g.unlockedIndex,
    screen: g.screen,
    collectedFragments: g.collectedFragments,
  });

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800);
  };

  const showUnlockBanner = (index) => {
    const meta = STAGE_META[index];
    if (!meta) return;
    const label = meta.name && meta.name !== '?' ? meta.name : `第${index}關`;
    clearTimeout(bannerTimer.current);
    setUnlockBanner(`${label} 已解鎖`);
    bannerTimer.current = setTimeout(() => setUnlockBanner(''), 2600);
  };

  const confirmRoom = (code) => {
    track('room_confirmed', { roomCode: code });
    if (code === '000000') {
      setGame((g) => ({ ...g, roomCode: code, screen: 'map', creatorMode: true, unlockedIndex: STAGE_META.length }));
      return;
    }
    setGame((g) => ({ ...g, roomCode: code, screen: 'intro' }));
  };

  const enterMap = () => setGame((g) => {
    const next = { ...g, screen: 'map' };
    persist(next);
    showUnlockBanner(next.unlockedIndex);
    return next;
  });

  const startStage = (key) => {
    track('stage_start', { stageKey: key });
    setGame((g) => ({ ...g, screen: 'stage', stageKey: key, beatIndex: 0, arrivedBack: false }));
  };

  const onNodeClick = (index) => {
    if (!game.creatorMode && index !== game.unlockedIndex) return;
    const meta = STAGE_META[index];
    if (meta.kind === 'ending') { startStage('END'); return; }
    if (meta.key && STAGES[meta.key]) { startStage(meta.key); return; }
    showToast('此關卡頁面尚未製作,敬請期待');
  };

  const advanceBeat = () => setGame((g) => {
    const beat = STAGES[g.stageKey].beats[g.beatIndex];
    if (beat.leadsToAssembly) return { ...g, beatIndex: g.beatIndex + 1, screen: 'assembly', arrivedBack: false };
    if (beat.endingChoice) return g;
    if (beat.isLast) {
      const next = { ...g, screen: 'map', stageKey: null, unlockedIndex: g.unlockedIndex + 1 };
      persist(next);
      showUnlockBanner(next.unlockedIndex);
      return next;
    }
    return { ...g, beatIndex: g.beatIndex + 1, arrivedBack: false };
  });

  const prevBeat = () => setGame((g) => (
    g.beatIndex <= 0 ? g : { ...g, beatIndex: g.beatIndex - 1, arrivedBack: true }
  ));

  const collectFragment = (letter) => {
    track('fragment_collected', { letter });
    setGame((g) => {
      const collectedFragments = g.collectedFragments.includes(letter)
        ? g.collectedFragments
        : [...g.collectedFragments, letter];
      const next = { ...g, collectedFragments };
      persist(next);
      return next;
    });
    advanceBeat();
  };

  const onAssemblyComplete = () => setGame((g) => {
    if (g.stageKey === 'END') return { ...g, screen: 'stage', arrivedBack: false };
    const next = { ...g, screen: 'ending' };
    persist(next);
    return next;
  });

  const chooseEnding = (choice) => {
    track('ending_choice', { choice });
    setGame((g) => {
      const next = { ...g, screen: choice === 'keep' ? 'ending1' : 'ending2' };
      persist(next);
      return next;
    });
  };

  const reset = () => {
    track('reset');
    clearProgress();
    setGame(initialGame);
  };

  // Fragments assembled in collection order; all six for creator/demo runs.
  const assemblyLetters = game.collectedFragments.length
    ? FRAGMENT_ORDER.filter((l) => game.collectedFragments.includes(l))
    : [...FRAGMENT_ORDER];

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#08030f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0,
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{
        width: 700, height: 800, position: 'relative', transform: `scale(${scale})`,
        transformOrigin: 'center center', background: '#08030f', overflow: 'hidden',
        boxShadow: '0 0 60px rgba(192,96,255,0.15)',
      }}>
        <CityBackdrop />

        {game.screen === 'entry' && <EntryScreen onConfirm={confirmRoom} onReset={reset} />}
        {game.screen === 'intro' && <IntroScreen onDone={enterMap} />}
        {game.screen === 'map' && (
          <MapScreen
            unlockedIndex={game.unlockedIndex}
            onNodeClick={onNodeClick}
            onOpenBackpack={() => setGame((g) => ({ ...g, screen: 'backpack' }))}
            onReset={reset}
            toastMsg={toastMsg}
            unlockBanner={unlockBanner}
          />
        )}
        {game.screen === 'stage' && game.stageKey && (
          <StageScreen
            stageKey={game.stageKey}
            beatIndex={game.beatIndex}
            arrivedBack={game.arrivedBack}
            onAdvance={advanceBeat}
            onPrev={prevBeat}
            onChooseEnding={chooseEnding}
            onCollectFragment={collectFragment}
          />
        )}
        {game.screen === 'backpack' && (
          <BackpackScreen collectedFragments={game.collectedFragments} onClose={() => setGame((g) => ({ ...g, screen: 'map' }))} />
        )}
        {game.screen === 'assembly' && (
          <AssemblyScreen letters={assemblyLetters} scale={scale} onComplete={onAssemblyComplete} />
        )}
        {game.screen === 'ending' && <EndingScreen onReset={reset} />}
        {game.screen === 'ending1' && <Ending1Screen onReset={reset} />}
        {game.screen === 'ending2' && <Ending2Screen onReset={reset} />}
      </div>
    </div>
  );
}
