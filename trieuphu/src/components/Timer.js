const Timer = ({ remaining }) => (
  <div
    className={`timer ${remaining <= 10 ? 'timer--urgent' : ''}`}
    role="timer"
    aria-live="off"
  >
    <span className="timer-icon" aria-hidden="true">◷</span>
    <span>Còn {remaining} giây</span>
  </div>
);

export default Timer;
