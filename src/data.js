export const TEAMS = [
  { id: 1, name: 'Khoa CNTT' },
  { id: 2, name: 'Khoa Viễn thông' },
  { id: 3, name: 'Khoa Điện tử' },
  { id: 4, name: 'Khoa An toàn TT' },
  { id: 5, name: 'Khoa Đa phương tiện' },
  { id: 6, name: 'Khoa Marketing' },
];

export const ROUNDS = [1, 2, 3, 4, 5];
export const POINTS = { win: 3, draw: 1, loss: 0 };
export const MAX_GOALS = 20;

export const RESULT_LABELS = {
  home: 'Đội nhà thắng',
  draw: 'Hòa',
  away: 'Đội khách thắng',
};

export const formatDiff = (value) => (value > 0 ? `+${value}` : String(value));