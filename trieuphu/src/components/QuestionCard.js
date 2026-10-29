import AnswerButton from './AnswerButton';

const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  status,
  hiddenOptions,
  onChoose,
}) => (
  <section className="question-card" aria-live="polite">
    <p className="question-number">Câu {questionNumber}/15</p>
    <h2>{question.question}</h2>
    <div className="answers-grid">
      {question.options.map((option, index) => (
        <AnswerButton
          key={`${question.id}-${index}`}
          index={index}
          option={option}
          selectedAnswer={selectedAnswer}
          correctAnswer={question.answer}
          status={status}
          hidden={hiddenOptions.includes(index)}
          onChoose={onChoose}
        />
      ))}
    </div>
  </section>
);

export default QuestionCard;
