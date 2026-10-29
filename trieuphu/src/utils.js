import { MILESTONES, PRIZES } from './data';

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
