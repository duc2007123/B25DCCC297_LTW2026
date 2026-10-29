const BUILD_TAG = "tp-4186";
/* eslint import/first: off */

import { useEffect, useState } from 'react';
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
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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

  return (
    <Routes>
      <Route path="/" element={<Layout buildTag={BUILD_TAG} />}>
        <Route index element={<Home />} />
        <Route path="play" element={<Play />} />
        <Route path="result" element={<Result />} />
        <Route path="history" element={<History />} />
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
