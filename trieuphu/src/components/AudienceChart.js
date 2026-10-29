import { LETTERS } from '../data';

const AudienceChart = ({ percentages }) => (
  <section className="audience-chart" aria-label="Kết quả bình chọn của khán giả">
    <h3>Khán giả bình chọn</h3>
    <div className="audience-chart__bars">
      {percentages.map((percentage, index) => (
        <div className="audience-chart__row" key={LETTERS[index]}>
          <span>{LETTERS[index]}: {percentage}%</span>
          <div
            className="audience-chart__track"
            role="img"
            aria-label={`${LETTERS[index]}: ${percentage}%`}
          >
            <div style={{ width: `${percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default AudienceChart;
