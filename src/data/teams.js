// The 12 team room codes — each team's "account + password" in one.
// Edit codes/names freely before the event; codes are 6 chars from the entry
// keypad's 0-9 A-Z. Avoids ambiguous 0/O and 1/I on purpose.
// NOTE: like any client-side game, codes are technically visible to someone
// who digs through the bundled JS — fine for a camp, not a bank.
//
// `startStage` is the team's first stage in the fixed cyclic order
// (R→Y→A→M→G→C→R…, see STAGE_ORDER in data/stageMeta.js). With 12 teams
// across 6 stages, two teams start at each stage so every stage gets used
// as an opening puzzle.
//
// `swapTasks` flips the encounter order of the two physical sub-tasks inside
// Y/M (see `taskGroup`-tagged beats + `getStageBeats` in data/stages.js).
// R ignores this flag — pinned to always task-1-first (館長 before 雞腿帽
// 遊民) for every team. A/G/C have no such split and ignore this flag too.
// Alternating true/false down the list means any two teams sharing a
// starting stage — who'd otherwise hit the same physical station at the
// same time — go in opposite orders (for Y/M).
const TEAMS = [
  { code: 'RX7K2M', name: '第1小隊', startStage: 'R', swapTasks: false },
  { code: 'QW4TN8', name: '第2小隊', startStage: 'R', swapTasks: true },
  { code: 'ZP3HV6', name: '第3小隊', startStage: 'Y', swapTasks: false },
  { code: 'KD8SR4', name: '第4小隊', startStage: 'Y', swapTasks: true },
  { code: 'MF2XQ7', name: '第5小隊', startStage: 'A', swapTasks: false },
  { code: 'BT6NW3', name: '第6小隊', startStage: 'A', swapTasks: true },
  { code: 'GH9PL5', name: '第7小隊', startStage: 'M', swapTasks: false },
  { code: 'VJ5CK8', name: '第8小隊', startStage: 'M', swapTasks: true },
  { code: 'NY3DZ7', name: '第9小隊', startStage: 'G', swapTasks: false },
  { code: 'SW8FM2', name: '第10小隊', startStage: 'G', swapTasks: true },
  { code: 'LC4RB9', name: '第11小隊', startStage: 'C', swapTasks: false },
  { code: 'XK6TG3', name: '第12小隊', startStage: 'C', swapTasks: true },
];

// Staff/testing code: unlocks the whole map (creator mode) and can start any stage.
const CREATOR_CODE = '000000';

function findTeam(code) {
  if (code === CREATOR_CODE) return { code, name: '工作人員', startStage: null, swapTasks: false };
  return TEAMS.find((t) => t.code === code) || null;
}

export { TEAMS, CREATOR_CODE, findTeam };
