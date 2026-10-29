import { LETTERS } from '../data';

const AnswerButton = ({
  index,
  option,
  selectedAnswer,
  correctAnswer,
  status,
  hidden,
  onChoose,
}) => {
  const isSelected = selectedAnswer === index;
  const isCorrect = correctAnswer === index;
  let stateClass = '';

  if (status === 'locked' && isSelected) {
    stateClass = 'answer-button--selected';
  } else if (status === 'revealed' && isCorrect) {
    stateClass = 'answer-button--correct';
  } else if (status === 'revealed' && isSelected && !isCorrect) {
    stateClass = 'answer-button--incorrect';
  }

  return (
    <button
      className={`answer-button ${stateClass}`}
      type="button"
      disabled={status !== 'answering' || hidden}
      onClick={() => onChoose(index)}
      aria-label={`Đáp án ${LETTERS[index]}${hidden ? ' đã bị loại' : `: ${option}`}`}
    >
      <span className="answer-letter">{LETTERS[index]}.</span>
      <span>{hidden ? '' : option}</span>
    </button>
  );
};

export default AnswerButton;
