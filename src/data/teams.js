// The 12 team room codes — each team's "account + password" in one.
// Edit codes/names freely before the event; codes are 6 chars from the entry
// keypad's 0-9 A-Z. Avoids ambiguous 0/O and 1/I on purpose.
// NOTE: like any client-side game, codes are technically visible to someone
// who digs through the bundled JS — fine for a camp, not a bank.
const TEAMS = [
  { code: 'RX7K2M', name: '第1小隊' },
  { code: 'QW4TN8', name: '第2小隊' },
  { code: 'ZP3HV6', name: '第3小隊' },
  { code: 'KD8SR4', name: '第4小隊' },
  { code: 'MF2XQ7', name: '第5小隊' },
  { code: 'BT6NW3', name: '第6小隊' },
  { code: 'GH9PL5', name: '第7小隊' },
  { code: 'VJ5CK8', name: '第8小隊' },
  { code: 'NY3DZ7', name: '第9小隊' },
  { code: 'SW8FM2', name: '第10小隊' },
  { code: 'LC4RB9', name: '第11小隊' },
  { code: 'XK6TG3', name: '第12小隊' },
];

// Staff/testing code: unlocks the whole map (creator mode).
const CREATOR_CODE = '000000';

function findTeam(code) {
  if (code === CREATOR_CODE) return { code, name: '工作人員' };
  return TEAMS.find((t) => t.code === code) || null;
}

export { TEAMS, CREATOR_CODE, findTeam };
