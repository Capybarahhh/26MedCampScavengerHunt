import { useEffect, useRef, useState } from 'react';
import { STAGES } from './data/stages.js';
import { STAGE_META, STAGE_ORDER } from './data/stageMeta.js';
import { findTeam, CREATOR_CODE } from './data/teams.js';
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
  startStageKey: null, // team's first stage in the cyclic STAGE_ORDER
  completedStages: [], // stage keys finished so far
  collectedFragments: [],
  creatorMode: false,
  stageKey: null,
  beatIndex: 0,
  arrivedBack: false, // current beat reached via 上一頁 → render text fully typed
};

// The team's next playable stage: STAGE_ORDER stepped forward from their
// start by however many they've completed, wrapping around the circle.
// null once all six are done (that's when the center ending unlocks).
function computeCurrentStageKey(startStageKey, completedStages) {
  if (!startStageKey || completedStages.length >= STAGE_ORDER.length) return null;
  const startIdx = STAGE_ORDER.indexOf(startStageKey);
  return STAGE_ORDER[(startIdx + completedStages.length) % STAGE_ORDER.length];
}

function stageName(key) {
  return STAGE_META.find((m) => m.key === key)?.name || key;
}

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
      const roomCode = Array.isArray(saved.room) ? saved.room.join('') : saved.room || '';
      return {
        ...initialGame,
        screen: saved.screen,
        roomCode,
        startStageKey: saved.startStageKey ?? null,
        completedStages: saved.completedStages || [],
        collectedFragments: saved.collectedFragments || [],
        creatorMode: roomCode === CREATOR_CODE,
      };
    }
    return initialGame;
  });
  const [toastMsg, setToastMsg] = useState('');
  const [unlockBanner, setUnlockBanner] = useState('');
  const toastTimer = useRef(null);
  const bannerTimer = useRef(null);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(bannerTimer.current); }, []);
  useEffect(() => {
    setTrackedRoom(game.roomCode, findTeam(game.roomCode)?.name || '');
  }, [game.roomCode]);
  useEffect(() => { track('session_start'); }, []);

  const persist = (g) => saveProgress({
    room: g.roomCode.split(''),
    screen: g.screen,
    startStageKey: g.startStageKey,
    completedStages: g.completedStages,
    collectedFragments: g.collectedFragments,
  });

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800);
  };

  const showUnlockBanner = (label) => {
    clearTimeout(bannerTimer.current);
    setUnlockBanner(`${label} 已解鎖`);
    bannerTimer.current = setTimeout(() => setUnlockBanner(''), 2600);
  };

  // Shows the banner for whatever the team's next stop is: their next stage
  // in the cyclic order, or 終章 once all six stages are complete.
  const showNextUnlockBanner = (startStageKey, completedStages) => {
    const cur = computeCurrentStageKey(startStageKey, completedStages);
    showUnlockBanner(cur ? stageName(cur) : '終章');
  };

  // Returns false when the code doesn't match any team → EntryScreen shows an error.
  const confirmRoom = (code) => {
    const team = findTeam(code);
    if (!team) {
      track('room_rejected', { roomCode: code });
      return false;
    }
    setTrackedRoom(code, team.name);
    track('room_confirmed', { roomCode: code });
    if (code === CREATOR_CODE) {
      setGame((g) => ({ ...g, roomCode: code, screen: 'map', creatorMode: true }));
      return true;
    }
    setGame((g) => ({ ...g, roomCode: code, screen: 'intro', startStageKey: team.startStage }));
    return true;
  };

  const enterMap = () => setGame((g) => {
    const next = { ...g, screen: 'map' };
    persist(next);
    showNextUnlockBanner(next.startStageKey, next.completedStages);
    return next;
  });

  const startStage = (key) => {
    track('stage_start', { stageKey: key });
    setGame((g) => ({ ...g, screen: 'stage', stageKey: key, beatIndex: 0, arrivedBack: false }));
  };

  // meta is a STAGE_META entry (a stage node, or the center ending node).
  const onNodeClick = (meta) => {
    if (meta.kind === 'ending') {
      const allDone = game.completedStages.length >= STAGE_ORDER.length;
      if (!game.creatorMode && !allDone) return;
      startStage('END');
      return;
    }
    if (!STAGES[meta.key]) { showToast('此關卡頁面尚未製作,敬請期待'); return; }
    if (!game.creatorMode) {
      const cur = computeCurrentStageKey(game.startStageKey, game.completedStages);
      if (meta.key !== cur) return;
    }
    startStage(meta.key);
  };

  const advanceBeat = () => setGame((g) => {
    const beat = STAGES[g.stageKey].beats[g.beatIndex];
    if (beat.leadsToAssembly) return { ...g, beatIndex: g.beatIndex + 1, screen: 'assembly', arrivedBack: false };
    if (beat.endingChoice) return g;
    if (beat.isLast) {
      const completedStages = g.completedStages.includes(g.stageKey)
        ? g.completedStages
        : [...g.completedStages, g.stageKey];
      const next = { ...g, screen: 'map', stageKey: null, completedStages };
      persist(next);
      showNextUnlockBanner(next.startStageKey, completedStages);
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

  // Creator-only shortcut to blow through content while testing. Bypasses
  // whatever gate the current beat/screen normally requires (correct answer,
  // drag-drop completion, etc.) instead of re-deriving each one.
  const handleSkip = () => {
    if (game.screen === 'intro') { enterMap(); return; }
    if (game.screen === 'backpack') { setGame((g) => ({ ...g, screen: 'map' })); return; }
    if (game.screen === 'assembly') { onAssemblyComplete(); return; }
    if (game.screen === 'stage' && game.stageKey) {
      const beat = STAGES[game.stageKey].beats[game.beatIndex];
      if (beat.endingChoice) { chooseEnding('keep'); return; }
      if (beat.type === 'fragment') { collectFragment(beat.letter); return; }
      advanceBeat();
    }
  };
  const canSkip = game.creatorMode && ['intro', 'stage', 'backpack', 'assembly'].includes(game.screen);

  // Fragments assembled in collection order; all six for creator/demo runs.
  const assemblyLetters = game.collectedFragments.length
    ? FRAGMENT_ORDER.filter((l) => game.collectedFragments.includes(l))
    : [...FRAGMENT_ORDER];

  return (
    <div style={{
      width: '100vw', height: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0,
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{
        width: 700, height: 800, position: 'relative', transform: `scale(${scale})`,
        transformOrigin: 'center center', background: 'var(--bg)', overflow: 'hidden',
        boxShadow: '0 0 60px rgba(var(--purple-rgb),0.15)',
      }}>
        <CityBackdrop />

        {game.screen === 'entry' && <EntryScreen onConfirm={confirmRoom} onReset={reset} />}
        {game.screen === 'intro' && <IntroScreen onDone={enterMap} />}
        {game.screen === 'map' && (
          <MapScreen
            startStageKey={game.startStageKey}
            completedStages={game.completedStages}
            creatorMode={game.creatorMode}
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

        {canSkip && (
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 999,
              padding: '5px 10px', fontSize: 11, letterSpacing: 1,
              fontFamily: "'Share Tech Mono', monospace",
              background: 'rgba(0,0,0,0.55)', color: 'var(--gold-text, #e8c96a)',
              border: '1px solid var(--gold, #c9a94a)', borderRadius: 6, cursor: 'pointer',
              opacity: 0.7,
            }}
            title="創作者專用：跳過此頁"
          >
            ⏭ 跳過
          </button>
        )}
      </div>
    </div>
  );
}
