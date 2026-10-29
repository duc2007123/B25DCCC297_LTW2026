import { Link, Navigate, useLocation } from 'react-router-dom';
import { formatMoney } from '../data';

const RESULT_HEADINGS = {
  win: 'Chúc mừng! Bạn đã trở thành triệu phú',
  wrong: 'Rất tiếc, bạn đã trả lời sai',
  timeout: 'Hết giờ!',
  quit: 'Bạn đã dừng cuộc chơi',
};

const Result = () => {
  const location = useLocation();
  const result = location.state;

  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="content-panel result-panel">
      <p className="eyebrow">KẾT QUẢ LƯỢT CHƠI</p>
      <h1>{RESULT_HEADINGS[result.reason] || 'Kết thúc lượt chơi'}</h1>
      <div className="result-prize">{formatMoney(result.prize)}</div>
      <dl className="result-details">
        <div><dt>Người chơi</dt><dd>{result.name}</dd></div>
        <div><dt>Số câu trả lời đúng</dt><dd>{result.correctCount}</dd></div>
        <div><dt>Tiền thưởng</dt><dd>{formatMoney(result.prize)}</dd></div>
      </dl>
      <div className="result-actions">
        <Link className="primary-button button-link" to="/play">Chơi lại</Link>
        <Link className="secondary-button button-link" to="/">Về trang chủ</Link>
      </div>
    </section>
  );
};

export default Result;
