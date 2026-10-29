import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEVELS } from '../data';

const QuestionBank = ({ questions, loading, loadError }) => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [query, setQuery] = useState('');

  const handleQueryShift = (event) => {
    setQuery(event.target.value);
  };

  if (loading) {
    return <p className="notice">Đang tải câu hỏi...</p>;
  }

  if (loadError) {
    return <p className="notice notice--error">Không tải được câu hỏi.</p>;
  }

  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  const filteredQuestions = questions.filter((question) => {
    const matchesLevel = selectedLevel === 'all'
      || question.level === Number(selectedLevel);
    const matchesQuery = question.question
      .toLocaleLowerCase('vi')
      .includes(normalizedQuery);

    return matchesLevel && matchesQuery;
  });

  return (
    <section className="content-panel">
      <div className="section-heading">
        <p className="eyebrow">ÔN TẬP KIẾN THỨC</p>
        <h1>Ngân hàng câu hỏi</h1>
      </div>
      <div className="question-filters">
        <label>
          <span>Mức độ</span>
          <select
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(event.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="1">Dễ</option>
            <option value="2">Trung bình</option>
            <option value="3">Khó</option>
          </select>
        </label>
        <label className="search-field">
          <span>Tìm theo nội dung câu hỏi</span>
          <input
            type="search"
            value={query}
            onChange={handleQueryShift}
            placeholder="Nhập từ khóa..."
          />
        </label>
      </div>
      <p className="question-count">Có {filteredQuestions.length} câu hỏi</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mức độ</th>
              <th>Câu hỏi</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question, index) => (
              <tr key={question.id}>
                <td>{index + 1}</td>
                <td>
                  <span className={`level-badge level-badge--${question.level}`}>
                    {LEVELS[question.level]}
                  </span>
                </td>
                <td>
                  <Link to={`/questions/${question.id}`}>
                    {question.question}
                  </Link>
                </td>
              </tr>
            ))}
            {filteredQuestions.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="3">
                  Không có câu hỏi phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default QuestionBank;
