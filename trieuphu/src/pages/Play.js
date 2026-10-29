import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AudienceChart from '../components/AudienceChart';
import Lifelines from '../components/Lifelines';
import MoneyLadder from '../components/MoneyLadder';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { TIME_PER_QUESTION } from '../data';
import {
  calcPrize,
  getAudiencePercentages,
  getPhoneSuggestion,
  selectGameQuestions,
} from '../utils';

const Play = ({ questions, loading, loadError, playerName, onFinish }) => {
  const navigate = useNavigate();
  const [gameQuestions, setGameQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [remaining, setRemaining] = useState(TIME_PER_QUESTION);
  const [status, setStatus] = useState('answering');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [audiencePercentages, setAudiencePercentages] = useState(null);
  const [usedLifelines, setUsedLifelines] = useState({
    fiftyFifty: false,
    audience: false,
    phone: false,
  });
  const [phoneCallStatus, setPhoneCallStatus] = useState('idle');
  const [phoneSuggestion, setPhoneSuggestion] = useState(null);
  const gameInitializedRef = useRef(false);
  const remainingRef = useRef(TIME_PER_QUESTION);
  const finishedRef = useRef(false);
  const question = gameQuestions[questionIndex];

  useEffect(() => {
    if (loading || gameInitializedRef.current || questions.length === 0) {
      return;
    }

    setGameQuestions(selectGameQuestions(questions));
    gameInitializedRef.current = true;
  }, [loading, questions]);

  const finishGame = useCallback((reason, finalCorrectCount) => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    const result = {
      name: playerName.trim(),
      correctCount: finalCorrectCount,
      prize: calcPrize(finalCorrectCount, reason),
      reason,
    };

    onFinish(result);
    navigate('/result', { replace: true, state: result });
  }, [navigate, onFinish, playerName]);

  useEffect(() => {
    if (status !== 'answering' || !question) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextRemaining = remainingRef.current - 1;
      remainingRef.current = nextRemaining;
      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        setIsTimedOut(true);
        setStatus('locked');
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [question, questionIndex, status]);

  useEffect(() => {
    if (!question) {
      return undefined;
    }

    if (status === 'locked') {
      const revealTimeout = window.setTimeout(() => setStatus('revealed'), 1000);
      return () => window.clearTimeout(revealTimeout);
    }

    if (status !== 'revealed') {
      return undefined;
    }

    const nextStepTimeout = window.setTimeout(() => {
      if (isTimedOut) {
        finishGame('timeout', correctCount);
        return;
      }

      if (selectedAnswer !== question.answer) {
        finishGame('wrong', correctCount);
        return;
      }

      const nextCorrectCount = correctCount + 1;
      if (questionIndex === questions.length - 1) {
        finishGame('win', nextCorrectCount);
        return;
      }

      setCorrectCount(nextCorrectCount);
      setQuestionIndex((currentIndex) => currentIndex + 1);
      setSelectedAnswer(null);
      setHiddenOptions([]);
      setAudiencePercentages(null);
      setPhoneCallStatus('idle');
      setPhoneSuggestion(null);
      setIsTimedOut(false);
      remainingRef.current = TIME_PER_QUESTION;
      setRemaining(TIME_PER_QUESTION);
      setStatus('answering');
    }, 2000);

    return () => window.clearTimeout(nextStepTimeout);
  }, [
    correctCount,
    finishGame,
    isTimedOut,
    question,
    questionIndex,
    questions.length,
    selectedAnswer,
    status,
  ]);

  useEffect(() => {
    if (status !== 'answering' || phoneCallStatus !== 'calling' || !question) {
      return undefined;
    }

    const phoneTimeout = window.setTimeout(() => {
      setPhoneSuggestion(getPhoneSuggestion(question, hiddenOptions));
      setPhoneCallStatus('suggested');
    }, 3000);

    return () => window.clearTimeout(phoneTimeout);
  }, [hiddenOptions, phoneCallStatus, question, status]);

  useEffect(() => {
    if (!question || !playerName.trim()) {
      return undefined;
    }

    document.title = `Câu ${questionIndex + 1}/15 – ${playerName.trim()}`;
    return () => {
      document.title = 'Ai là triệu phú';
    };
  }, [playerName, question, questionIndex]);

  const handleChooseAnswer = useCallback((answerIndex) => {
    if (
      status !== 'answering'
      || hiddenOptions.includes(answerIndex)
      || !question
    ) {
      return;
    }

    setSelectedAnswer(answerIndex);
    setStatus('locked');
  }, [hiddenOptions, question, status]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || event.target.isContentEditable) {
          return;
        }
      }

      const answerIndex = ['a', 'b', 'c', 'd'].indexOf(event.key.toLowerCase());
      if (answerIndex !== -1) {
        handleChooseAnswer(answerIndex);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleChooseAnswer]);

  const handleFiftyFifty = () => {
    if (usedLifelines.fiftyFifty || status !== 'answering' || !question) {
      return;
    }

    const wrongOptions = question.options
      .map((_, index) => index)
      .filter((index) => index !== question.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    setHiddenOptions(wrongOptions);
    if (usedLifelines.audience) {
      setAudiencePercentages(getAudiencePercentages(question, wrongOptions));
    }
    setUsedLifelines((previous) => ({ ...previous, fiftyFifty: true }));
  };

  const handleAskAudience = () => {
    if (usedLifelines.audience || status !== 'answering' || !question) {
      return;
    }

    setAudiencePercentages(getAudiencePercentages(question, hiddenOptions));
    setUsedLifelines((previous) => ({ ...previous, audience: true }));
  };

  const handleCallFriend = () => {
    if (usedLifelines.phone || status !== 'answering' || !question) {
      return;
    }

    setUsedLifelines((previous) => ({ ...previous, phone: true }));
    setPhoneCallStatus('calling');
  };

  const handleQuit = () => finishGame('quit', correctCount);

  if (!playerName.trim()) {
    return <Navigate to="/" replace />;
  }

  if (loading || gameQuestions.length === 0) {
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
          hiddenOptions={hiddenOptions}
          onChoose={handleChooseAnswer}
        />
        <Lifelines
          usedLifelines={usedLifelines}
          status={status}
          onFiftyFifty={handleFiftyFifty}
          onAskAudience={handleAskAudience}
          onCallFriend={handleCallFriend}
          onQuit={handleQuit}
        />
        {phoneCallStatus === 'calling' && (
          <p className="phone-suggestion" role="status">
            Đang gọi cho người thân...
          </p>
        )}
        {phoneCallStatus === 'suggested' && phoneSuggestion !== null && (
          <p className="phone-suggestion" role="status">
            Người thân gợi ý đáp án {'ABCD'[phoneSuggestion]}.
          </p>
        )}
        {audiencePercentages && <AudienceChart percentages={audiencePercentages} />}
      </div>
      <MoneyLadder currentQuestion={questionIndex + 1} />
    </section>
  );
};

export default Play;
