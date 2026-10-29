import { getHistory, saveHistory } from './history';

const HISTORY_KEY = 'ltw_trieuphu_history';

beforeEach(() => {
  window.localStorage.clear();
});

test('saves and loads the play history from localStorage', () => {
  const history = [
    {
      id: '1',
      name: 'An',
      prize: 200000,
      correctCount: 1,
      playedAt: '29/10/2026, 08:00:00',
    },
  ];

  saveHistory(history);

  expect(window.localStorage.getItem(HISTORY_KEY)).toBe(JSON.stringify(history));
  expect(getHistory()).toEqual(history);
});

test('returns an empty history and reports invalid saved JSON', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  window.localStorage.setItem(HISTORY_KEY, '{invalid json');

  expect(getHistory()).toEqual([]);
  expect(consoleError).toHaveBeenCalledWith(
    'Không thể đọc lịch sử chơi đã lưu:',
    expect.any(SyntaxError),
  );

  consoleError.mockRestore();
});
