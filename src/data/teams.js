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
const TEAMS = [
  { code: 'RX7K2M', name: '第1小隊', startStage: 'R' },
  { code: 'QW4TN8', name: '第2小隊', startStage: 'R' },
  { code: 'ZP3HV6', name: '第3小隊', startStage: 'Y' },
  { code: 'KD8SR4', name: '第4小隊', startStage: 'Y' },
  { code: 'MF2XQ7', name: '第5小隊', startStage: 'A' },
  { code: 'BT6NW3', name: '第6小隊', startStage: 'A' },
  { code: 'GH9PL5', name: '第7小隊', startStage: 'M' },
  { code: 'VJ5CK8', name: '第8小隊', startStage: 'M' },
  { code: 'NY3DZ7', name: '第9小隊', startStage: 'G' },
  { code: 'SW8FM2', name: '第10小隊', startStage: 'G' },
  { code: 'LC4RB9', name: '第11小隊', startStage: 'C' },
  { code: 'XK6TG3', name: '第12小隊', startStage: 'C' },
];

// Staff/testing code: unlocks the whole map (creator mode) and can start any stage.
const CREATOR_CODE = '000000';

function findTeam(code) {
  if (code === CREATOR_CODE) return { code, name: '工作人員', startStage: null };
  return TEAMS.find((t) => t.code === code) || null;
}

export { TEAMS, CREATOR_CODE, findTeam };
