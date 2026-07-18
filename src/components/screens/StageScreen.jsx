import { STAGES, getStageBeats } from '../../data/stages.js';
import { makeStageGlyphs } from '../../lib/backdrop.js';
import { StoryBeat } from '../beats/StoryBeat.jsx';
import { PuzzleBeat } from '../beats/PuzzleBeat.jsx';
import { ColorPickBeat } from '../beats/ColorPickBeat.jsx';
import { FragmentBeat } from '../beats/FragmentBeat.jsx';
import { FoodGameBeat } from '../beats/FoodGameBeat.jsx';
import { css } from '../../lib/css.js';

const GLYPHS = makeStageGlyphs(14);

// A puzzle whose answer is the fragment code gets the letter-blank keypad UI:
// true when the next non-story beat is a fragment beat. A puzzle can opt out
// with `fragmentKeypad: false` to use a plain passphrase input instead.
function isFragmentAnswer(beats, beatIndex) {
  if (beats[beatIndex].fragmentKeypad === false) return false;
  let i = beatIndex + 1;
  while (beats[i] && beats[i].type === 'story') i++;
  return !!(beats[i] && beats[i].type === 'fragment');
}

/**
 * One stage = a sequence of beats (story / puzzle / foodgame / fragment).
 * Dispatches the current beat to its component; each beat remounts on
 * navigation (keyed by stage+index) so its local state starts fresh.
 * `arrivedBack` renders the beat's text fully typed (came via 上一頁).
 */
export function StageScreen({ stageKey, beatIndex, arrivedBack, swapTasks, onAdvance, onPrev, onChooseEnding, onCollectFragment, onCorrect, onWrong, onFoodGameFail, wrongCount, hintUsed, onUseHint }) {
  const stage = STAGES[stageKey];
  const beats = getStageBeats(stageKey, swapTasks);
  const beat = beats[beatIndex];
  // Can't navigate back INTO an already-solved puzzle/colorpick.
  const prevType = beatIndex > 0 ? beats[beatIndex - 1].type : null;
  const hasPrev = beatIndex > 0 && prevType !== 'puzzle' && prevType !== 'colorpick';
  const beatKey = `${stageKey}-${beatIndex}`;

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:50px 34px 30px;display:flex;flex-direction:column;')}>
      <div style={css('position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1;')}>
        {GLYPHS.map((g, i) => <span key={i} style={css(g.style)}>{g.ch}</span>)}
      </div>
      <div style={css('position:absolute;top:18px;left:24px;color:var(--purple-text-dim);font-size:11px;letter-spacing:3px;z-index:1;')}>{stage.name}</div>

      {beat.type === 'story' && (
        <StoryBeat key={beatKey} beat={beat} hasPrev={hasPrev} startDone={arrivedBack} onNext={onAdvance} onPrev={onPrev} onChooseEnding={onChooseEnding} />
      )}
      {beat.type === 'puzzle' && (
        <PuzzleBeat
          key={beatKey}
          stageKey={stageKey}
          beat={beat}
          beatIndex={beatIndex}
          isFragmentAnswer={isFragmentAnswer(beats, beatIndex)}
          hasPrev={hasPrev}
          startDone={arrivedBack}
          onAdvance={onAdvance}
          onPrev={onPrev}
          onCorrect={onCorrect}
          onWrong={onWrong}
          wrongCount={wrongCount}
          hintUsed={hintUsed}
          onUseHint={onUseHint}
        />
      )}
      {beat.type === 'colorpick' && (
        <ColorPickBeat
          key={beatKey}
          stageKey={stageKey}
          beat={beat}
          beatIndex={beatIndex}
          hasPrev={hasPrev}
          startDone={arrivedBack}
          onAdvance={onAdvance}
          onPrev={onPrev}
          onCorrect={onCorrect}
          onWrong={onWrong}
          wrongCount={wrongCount}
          hintUsed={hintUsed}
          onUseHint={onUseHint}
        />
      )}
      {beat.type === 'foodgame' && (
        <FoodGameBeat key={beatKey} beat={beat} startDone={arrivedBack} onContinue={onAdvance} onPass={onCorrect} onFail={onFoodGameFail} />
      )}
      {beat.type === 'fragment' && (
        <FragmentBeat key={beatKey} beat={beat} onCollect={() => onCollectFragment(beat.letter)} />
      )}
    </div>
  );
}
