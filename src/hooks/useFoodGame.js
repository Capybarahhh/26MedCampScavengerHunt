import { useEffect, useMemo, useRef, useState } from 'react';
import { pickFoodOrder, makeFoodConfetti } from '../data/food.js';
import { track } from '../lib/track.js';

const TOTAL_TIME = 300;
const ORDER_TIME = 60;
const TARGET = 5;

const initialState = (run = 0) => ({
  phase: 'rules', // rules | playing | passed | failed
  slots: [],
  completed: 0,
  timeLeft: TOTAL_TIME,
  showResetConfirm: false,
  usedOrderIndices: [], // every order index shown this session, so none repeat
  run, // bumped on retry so the rules typewriter replays
});

/**
 * The whole food-delivery mini-game state machine: the 300s master clock,
 * four order slots with their own 60s timers, and the per-slot success
 * animation chain (success → poweroff → empty → entering → idle).
 * All timers are cleaned up on unmount.
 */
export function useFoodGame() {
  const [game, setGame] = useState(() => initialState());
  const stateRef = useRef(game);
  stateRef.current = game;
  const intervalRef = useRef(null);
  const slotTimersRef = useRef({});

  const clearAllTimers = () => {
    clearInterval(intervalRef.current);
    Object.values(slotTimersRef.current).forEach(clearTimeout);
    slotTimersRef.current = {};
  };
  useEffect(() => clearAllTimers, []);

  // Report the outcome once per attempt.
  useEffect(() => {
    if (game.phase === 'passed' || game.phase === 'failed') {
      track('foodgame_end', { passed: game.phase === 'passed', completed: game.completed, timeLeft: game.timeLeft });
    }
  }, [game.phase]);

  const confetti = useMemo(
    () => (game.phase === 'passed' ? makeFoodConfetti(18) : []),
    [game.phase]
  );

  const setSlot = (idx, patch) => setGame((s) => {
    if (!s.slots[idx]) return s;
    const slots = [...s.slots];
    slots[idx] = { ...slots[idx], ...(typeof patch === 'function' ? patch(slots[idx]) : patch) };
    return { ...s, slots };
  });

  const pass = () => {
    clearInterval(intervalRef.current);
    setGame((s) => ({ ...s, phase: 'passed' }));
  };

  const tick = () => setGame((s) => {
    if (s.phase !== 'playing') { clearInterval(intervalRef.current); return s; }
    const timeLeft = s.timeLeft - 1;
    let usedOrderIndices = s.usedOrderIndices;
    const slots = s.slots.map((slot) => {
      if (slot.status !== 'idle' && slot.status !== 'wrong') return slot;
      const t = slot.timeLeft - 1;
      if (t <= 0) {
        const { order, index } = pickFoodOrder(usedOrderIndices);
        usedOrderIndices = [...usedOrderIndices, index];
        return { ...slot, order, orderIndex: index, timeLeft: ORDER_TIME, input: '', status: 'idle' };
      }
      return { ...slot, timeLeft: t };
    });
    if (timeLeft <= 0) {
      clearInterval(intervalRef.current);
      if (s.completed >= TARGET) return { ...s, phase: 'passed' };
      return { ...s, timeLeft: 0, slots, usedOrderIndices, phase: 'failed' };
    }
    return { ...s, timeLeft, slots, usedOrderIndices };
  });

  const start = () => {
    clearAllTimers();
    const usedOrderIndices = [];
    const slots = [0, 1, 2, 3].map((i) => {
      const { order, index } = pickFoodOrder(usedOrderIndices);
      usedOrderIndices.push(index);
      return { id: i, order, orderIndex: index, timeLeft: ORDER_TIME, input: '', status: 'idle' };
    });
    setGame((s) => ({ ...s, phase: 'playing', slots, completed: 0, timeLeft: TOTAL_TIME, usedOrderIndices }));
    intervalRef.current = setInterval(tick, 1000);
  };

  // success → poweroff → empty → entering (new order) → idle
  const powerOffChain = (idx) => {
    setSlot(idx, { status: 'poweroff' });
    slotTimersRef.current[idx] = setTimeout(() => {
      setSlot(idx, { status: 'empty' });
      slotTimersRef.current[idx] = setTimeout(() => {
        setGame((s) => {
          if (!s.slots[idx]) return s;
          const { order, index } = pickFoodOrder(s.usedOrderIndices);
          const slots = [...s.slots];
          slots[idx] = { ...slots[idx], order, orderIndex: index, timeLeft: ORDER_TIME, input: '', status: 'entering' };
          return { ...s, slots, usedOrderIndices: [...s.usedOrderIndices, index] };
        });
        slotTimersRef.current[idx] = setTimeout(() => setSlot(idx, { status: 'idle' }), 600);
      }, 450);
    }, 420);
  };

  const submit = (idx) => {
    const s = stateRef.current;
    const slot = s.slots[idx];
    if (!slot || slot.input === '' || (slot.status !== 'idle' && slot.status !== 'wrong')) return;
    const given = parseInt(slot.input, 10);
    if (isNaN(given)) return;
    if (given === slot.order.price) {
      const completed = s.completed + 1;
      setGame((prev) => {
        const slots = [...prev.slots];
        slots[idx] = { ...slots[idx], status: 'success', input: '' };
        return { ...prev, slots, completed };
      });
      clearTimeout(slotTimersRef.current[idx]);
      slotTimersRef.current[idx] = setTimeout(
        () => (completed >= TARGET ? pass() : powerOffChain(idx)),
        900
      );
    } else {
      setSlot(idx, { status: 'wrong', input: '' });
    }
  };

  const inputChange = (idx, val) => setSlot(idx, { input: val, status: 'idle' });

  // Player-triggered "give me a different order" — reuses the same
  // poweroff → empty → entering → idle cycle a completed order already goes
  // through, just without incrementing `completed`.
  const reshuffle = (idx) => {
    const slot = stateRef.current.slots[idx];
    if (!slot || (slot.status !== 'idle' && slot.status !== 'wrong')) return;
    powerOffChain(idx);
  };

  const retry = () => {
    clearAllTimers();
    setGame((s) => initialState(s.run + 1));
  };

  return {
    ...game,
    confetti,
    start,
    submit,
    inputChange,
    reshuffle,
    retry,
    openResetConfirm: () => setGame((s) => ({ ...s, showResetConfirm: true })),
    cancelResetConfirm: () => setGame((s) => ({ ...s, showResetConfirm: false })),
    confirmReset: () => { setGame((s) => ({ ...s, showResetConfirm: false })); retry(); },
    target: TARGET,
  };
}
