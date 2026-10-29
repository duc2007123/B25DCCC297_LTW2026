const BUILD_TAG = "tp-4186";
/* eslint import/first: off */

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import NotFound from './pages/NotFound';
import Play from './pages/Play';
import QuestionBank from './pages/QuestionBank';
import QuestionDetail from './pages/QuestionDetail';
import Result from './pages/Result';
import { getHistory, saveHistory } from './services/history';
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [history, setHistory] = useState(getHistory);

  useEffect(() => {
    const controller = new AbortController();

    axios.get('/data/questions.json', { signal: controller.signal })
      .then(({ data }) => {
        setQuestions(data);
        setLoadError(false);
      })
      .catch((error) => {
        if (axios.isCancel(error) || error.name === 'CanceledError') {
          return;
        }

        console.error('Không thể tải ngân hàng câu hỏi:', error);
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleGameComplete = useCallback((result) => {
    const { name, prize, correctCount } = result;
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      prize,
      correctCount,
      playedAt: new Date().toLocaleString('vi-VN'),
    };

    setHistory((previousHistory) => [...previousHistory, record]);
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <Routes>
      <Route path="/" element={<Layout buildTag={BUILD_TAG} />}>
        <Route
          index
          element={(
            <Home
              history={history}
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
            />
          )}
        />
        <Route
          path="play"
          element={(
            <Play
              questions={questions}
              loading={loading}
              loadError={loadError}
              playerName={playerName}
              onFinish={handleGameComplete}
            />
          )}
        />
        <Route path="result" element={<Result />} />
        <Route
          path="history"
          element={(
            <History
              history={history}
              onClear={handleClearHistory}
            />
          )}
        />
        <Route
          path="questions"
          element={(
            <QuestionBank
              questions={questions}
              loading={loading}
              loadError={loadError}
            />
          )}
        />
        <Route
          path="questions/:id"
          element={(
            <QuestionDetail
              questions={questions}
              loading={loading}
              loadError={loadError}
            />
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
