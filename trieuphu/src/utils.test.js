import {
  calcPrize,
  getAudiencePercentages,
  getPhoneSuggestion,
  selectGameQuestions,
} from './utils';
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

test('selects five questions per level and shuffles choices without changing correct answers', () => {
  const gameQuestions = selectGameQuestions(questions, () => 0.5);

  expect(gameQuestions).toHaveLength(15);
  expect(gameQuestions.map((question) => question.level)).toEqual([
    ...Array(5).fill(1),
    ...Array(5).fill(2),
    ...Array(5).fill(3),
  ]);
  expect(new Set(gameQuestions.map((question) => question.id)).size).toBe(15);

  gameQuestions.forEach((question) => {
    const originalQuestion = questions.find((item) => item.id === question.id);

    expect(question.options).toHaveLength(4);
    expect(question.options[question.answer]).toBe(
      originalQuestion.options[originalQuestion.answer],
    );
  });

  expect(gameQuestions.map(({ id }) => id)).not.toEqual(
    questions.slice(0, 15).map(({ id }) => id),
  );
});

test('phone suggestion is correct for 80 percent and selects a visible wrong answer otherwise', () => {
  const question = questions[0];

  expect(getPhoneSuggestion(question, [], () => 0.79)).toBe(question.answer);
  expect(getPhoneSuggestion(question, [], () => 0.8)).not.toBe(question.answer);
  expect(getPhoneSuggestion(question, [0, 2], () => 0.8)).toBe(3);
});
