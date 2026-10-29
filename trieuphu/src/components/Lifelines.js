const Lifelines = ({
  usedLifelines,
  status,
  onFiftyFifty,
  onAskAudience,
  onQuit,
}) => (
  <section className="lifelines" aria-label="Quyền trợ giúp">
    <h3>Quyền trợ giúp</h3>
    <div className="lifelines__buttons">
      <button
        type="button"
        disabled={status !== 'answering' || usedLifelines.fiftyFifty}
        onClick={onFiftyFifty}
      >
        50:50 {usedLifelines.fiftyFifty ? '· Đã dùng' : ''}
      </button>
      <button
        type="button"
        disabled={status !== 'answering' || usedLifelines.audience}
        onClick={onAskAudience}
      >
        Hỏi khán giả {usedLifelines.audience ? '· Đã dùng' : ''}
      </button>
      <button
        className="lifeline-quit"
        type="button"
        disabled={status !== 'answering'}
        onClick={onQuit}
      >
        Dừng cuộc chơi
      </button>
    </div>
  </section>
);

export default Lifelines;
