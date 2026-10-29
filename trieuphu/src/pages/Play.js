import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MoneyLadder from '../components/MoneyLadder';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { PRIZES, TIME_PER_QUESTION } from '../data';
import { calcPrize } from '../utils';

const Play = ({ questions, loading, loadError, playerName }) => {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [remaining, setRemaining] = useState(TIME_PER_QUESTION);
  const [status, setStatus] = useState('answering');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const question = questions[questionIndex];

  useEffect(() => {
    if (status !== 'answering' || !question) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRemaining((time) => {
        if (time <= 1) {
          setIsTimedOut(true);
          setStatus('locked');
          return 0;
        }

        return time - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [question, status]);

  useEffect(() => {
    if (!question || status !== 'locked') {
      return undefined;
    }

    const revealTimeout = window.setTimeout(() => setStatus('revealed'), 1000);
    return () => window.clearTimeout(revealTimeout);
  }, [question, status]);

  useEffect(() => {
    if (!question || status !== 'revealed') {
      return undefined;
    }

    const nextStepTimeout = window.setTimeout(() => {
      if (isTimedOut || selectedAnswer !== question.answer) {
        const reason = isTimedOut ? 'timeout' : 'wrong';
        const result = {
          name: playerName.trim(),
          correctCount,
          prize: calcPrize(correctCount, reason),
          reason,
        };
        navigate('/result', { replace: true, state: result });
        return;
      }

      const nextCorrectCount = correctCount + 1;
      if (questionIndex === questions.length - 1) {
        const result = {
          name: playerName.trim(),
          correctCount: nextCorrectCount,
          prize: PRIZES[PRIZES.length - 1],
          reason: 'win',
        };
        navigate('/result', { replace: true, state: result });
        return;
      }

      setCorrectCount(nextCorrectCount);
      setQuestionIndex((index) => index + 1);
      setSelectedAnswer(null);
      setIsTimedOut(false);
      setRemaining(TIME_PER_QUESTION);
      setStatus('answering');
    }, 2000);

    return () => window.clearTimeout(nextStepTimeout);
  }, [
    correctCount,
    isTimedOut,
    navigate,
    playerName,
    question,
    questionIndex,
    questions.length,
    selectedAnswer,
    status,
  ]);

  const handleChooseAnswer = (answerIndex) => {
    if (status !== 'answering' || !question) {
      return;
    }

    setSelectedAnswer(answerIndex);
    setStatus('locked');
  };

  if (!playerName.trim()) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <p className="notice">Đang tải câu hỏi...</p>;
  }

  if (loadError) {
    return <p className="notice notice--error">Không tải được câu hỏi.</p>;
  }

  if (!question) {
    return <p className="notice notice--error">Không có câu hỏi để bắt đầu.</p>;
  }

  return (
    <section className="game-page">
      <div className="game-main">
        <div className="game-topbar">
          <div>
            <p className="eyebrow">NGƯỜI CHƠI</p>
            <strong>{playerName.trim()}</strong>
          </div>
          <Timer remaining={remaining} />
        </div>
        <QuestionCard
          question={question}
          questionNumber={questionIndex + 1}
          selectedAnswer={selectedAnswer}
          status={status}
          hiddenOptions={[]}
          onChoose={handleChooseAnswer}
        />
      </div>
      <MoneyLadder currentQuestion={questionIndex + 1} />
    </section>
  );
};

export default Play;
