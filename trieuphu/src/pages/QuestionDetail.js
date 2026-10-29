import { useNavigate, useParams } from 'react-router-dom';
import { LEVELS, LETTERS } from '../data';

const QuestionDetail = ({ questions, loading, loadError }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionId = Number(id);
  const question = questions.find((item) => item.id === questionId);

  if (loading) {
    return <p className="notice">Đang tải câu hỏi...</p>;
  }

  if (loadError) {
    return <p className="notice notice--error">Không tải được câu hỏi.</p>;
  }

  if (!question) {
    return (
      <section className="content-panel">
        <p className="notice">Không tìm thấy câu hỏi.</p>
        <button className="secondary-button" type="button" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </section>
    );
  }

  return (
    <section className="content-panel detail-panel">
      <p className="eyebrow">NGÂN HÀNG CÂU HỎI</p>
      <h1>Câu hỏi số {question.id} <span>({LEVELS[question.level]})</span></h1>
      <h2>{question.question}</h2>
      <ol className="detail-options">
        {question.options.map((option, index) => (
          <li
            className={index === question.answer ? 'detail-option--correct' : ''}
            key={`${question.id}-${index}`}
          >
            <strong>{LETTERS[index]}.</strong> {option}
            {index === question.answer && <span>Đáp án đúng</span>}
          </li>
        ))}
      </ol>
      <button className="secondary-button" type="button" onClick={() => navigate(-1)}>
        Quay lại
      </button>
    </section>
  );
};

export default QuestionDetail;
