import { MILESTONES, PRIZES } from './data';

const shuffle = (items, random) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
};

export const selectGameQuestions = (questions, random = Math.random) => (
  [1, 2, 3].flatMap((level) => {
    const levelQuestions = questions.filter((question) => question.level === level);

    return shuffle(levelQuestions, random)
      .slice(0, 5)
      .map((question) => {
        const options = shuffle(
          question.options.map((option, index) => ({ option, index })),
          random,
        );
        const answer = options.findIndex((option) => option.index === question.answer);

        return {
          ...question,
          options: options.map(({ option }) => option),
          answer,
        };
      });
  })
);

export const calcPrize = (correctCount, reason) => {
  if (reason === 'win') {
    return PRIZES[PRIZES.length - 1];
  }

  if (reason === 'quit') {
    return correctCount > 0 ? PRIZES[correctCount - 1] : 0;
  }

  const passedMilestones = MILESTONES.filter((milestone) => milestone <= correctCount);
  const lastMilestone = passedMilestones[passedMilestones.length - 1];

  return lastMilestone ? PRIZES[lastMilestone - 1] : 0;
};

export const getAudiencePercentages = (question, hiddenOptions = []) => {
  const incorrectOptions = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.answer && !hiddenOptions.includes(index));
  const percentages = [0, 0, 0, 0];

  if (incorrectOptions.length === 0) {
    percentages[question.answer] = 100;
    return percentages;
  }

  const minimumCorrect = incorrectOptions.length === 1 ? 51 : 40;
  const correctPercentage = Math.floor(
    Math.random() * (70 - minimumCorrect + 1) + minimumCorrect,
  );
  percentages[question.answer] = correctPercentage;

  let remaining = 100 - correctPercentage;
  while (remaining > 0) {
    const availableOptions = incorrectOptions.filter(
      (index) => percentages[index] < correctPercentage - 1,
    );
    const target = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    percentages[target] += 1;
    remaining -= 1;
  }

  return percentages;
};

export const getPhoneSuggestion = (question, hiddenOptions = [], random = Math.random) => {
  if (random() < 0.8) {
    return question.answer;
  }

  const visibleWrongOptions = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.answer && !hiddenOptions.includes(index));

  if (visibleWrongOptions.length === 0) {
    return question.answer;
  }

  return visibleWrongOptions[Math.floor(random() * visibleWrongOptions.length)];
};
