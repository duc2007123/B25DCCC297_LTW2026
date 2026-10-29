import { formatMoney } from '../data';

const History = ({ history, onClear }) => {
  const sortedHistory = [...history].sort(
    (first, second) => second.prize - first.prize,
  );
  const totalPrize = history.reduce((total, record) => total + record.prize, 0);
  const highestPrize = history.reduce(
    (highest, record) => Math.max(highest, record.prize),
    0,
  );

  return (
    <section className="content-panel">
      <div className="section-heading section-heading--row">
        <div>
          <p className="eyebrow">THÀNH TÍCH CỦA BẠN</p>
          <h1>Lịch sử chơi</h1>
        </div>
        {history.length > 0 && (
          <button className="secondary-button danger-button" type="button" onClick={onClear}>
            Xóa lịch sử
          </button>
        )}
      </div>
      <div className="history-stats">
        <p>
          Số lượt chơi: <strong>{history.length}</strong>
        </p>
        <p>
          Tiền thưởng cao nhất: <strong>{formatMoney(highestPrize)}</strong>
        </p>
        <p>
          Tổng tiền thưởng: <strong>{formatMoney(totalPrize)}</strong>
        </p>
      </div>
      {history.length === 0 ? (
        <p className="empty-state">Chưa có lượt chơi nào.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người chơi</th>
                <th>Số câu đúng</th>
                <th>Tiền thưởng</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((record) => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.correctCount}/15</td>
                  <td>{formatMoney(record.prize)}</td>
                  <td>{record.playedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default History;
