import { getAudiencePercentages, calcPrize } from './utils';
import questions from '../public/data/questions.json';

test.each([
  [4, 'wrong', 0],
  [6, 'timeout', 2000000],
  [12, 'wrong', 22000000],
  [6, 'quit', 3000000],
  [15, 'win', 250000000],
])('calculates the prize for %i correct answers with reason %s', (correctCount, reason, prize) => {
  expect(calcPrize(correctCount, reason)).toBe(prize);
});

test('audience percentages sum to 100 and hidden answers receive no votes', () => {
  const percentages = getAudiencePercentages(questions[0], [0, 2]);

  expect(percentages.reduce((total, percentage) => total + percentage, 0)).toBe(100);
  expect(percentages[0]).toBe(0);
  expect(percentages[2]).toBe(0);
  expect(percentages[1]).toBeGreaterThan(percentages[3]);
  expect(percentages[1]).toBeGreaterThanOrEqual(51);
  expect(percentages[1]).toBeLessThanOrEqual(70);
});
