import { useNavigate } from 'react-router-dom';
import { PRIZES, formatMoney } from '../data';

const Home = ({ history, playerName, onPlayerNameChange }) => {
  const navigate = useNavigate();
  const recordHolder = [...history].sort((first, second) => second.prize - first.prize)[0];

  const handleStart = (event) => {
    event.preventDefault();

    if (!playerName.trim()) {
      return;
    }

    navigate('/play');
  };

  return (
    <div className="home-page">
      <section className="hero-panel">
        <p className="eyebrow">THỬ THÁCH KIẾN THỨC LẬP TRÌNH WEB</p>
        <h1>Ai là <span>triệu phú?</span></h1>
        <p className="hero-copy">
          15 câu hỏi, 30 giây mỗi câu và cơ hội chinh phục giải thưởng
          {' '}{formatMoney(PRIZES[PRIZES.length - 1])}.
        </p>
        <form className="start-form" onSubmit={handleStart}>
          <label htmlFor="player-name">Tên người chơi</label>
          <div className="start-form__row">
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              placeholder="Nhập tên của bạn"
              maxLength={40}
              required
            />
            <button
              className="primary-button"
              type="submit"
              disabled={!playerName.trim()}
            >
              Bắt đầu
            </button>
          </div>
        </form>
        {recordHolder && (
          <p className="record-banner">
            Kỷ lục: <strong>{formatMoney(recordHolder.prize)} – {recordHolder.name}</strong>
          </p>
        )}
      </section>

      <section className="rules-panel">
        <h2>Luật chơi</h2>
        <div className="rule-grid">
          <article>
            <span className="rule-icon">15</span>
            <h3>15 câu hỏi</h3>
            <p>Trả lời lần lượt các câu hỏi về HTML, CSS, ES6 và React.</p>
          </article>
          <article>
            <span className="rule-icon">30s</span>
            <h3>Đua với thời gian</h3>
            <p>Mỗi câu có 30 giây. Hết giờ được tính như trả lời sai.</p>
          </article>
          <article>
            <span className="rule-icon">3</span>
            <h3>Quyền trợ giúp</h3>
            <p>Dùng 50:50, hỏi khán giả hoặc dừng để mang tiền về.</p>
          </article>
        </div>
        <p className="milestone-note">
          Mốc an toàn ở câu 5, 10 và 15. Trả lời sai, bạn nhận tiền ở mốc cao nhất đã vượt qua.
        </p>
      </section>
    </div>
  );
};

export default Home;
