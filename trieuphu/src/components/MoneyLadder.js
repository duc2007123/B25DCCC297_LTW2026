import { MILESTONES, PRIZES, formatMoney } from '../data';

const MoneyLadder = ({ currentQuestion }) => (
  <aside className="money-ladder" aria-label="Thang tiền thưởng">
    <h2>Tiền thưởng</h2>
    <ol>
      {PRIZES.map((prize, index) => {
        const questionNumber = index + 1;
        const isCurrent = currentQuestion === questionNumber;
        const isMilestone = MILESTONES.includes(questionNumber);

        return (
          <li
            key={questionNumber}
            className={[
              isCurrent ? 'money-ladder__current' : '',
              isMilestone ? 'money-ladder__milestone' : '',
            ].filter(Boolean).join(' ')}
          >
            <span>{questionNumber}.</span>
            <span>{formatMoney(prize)}</span>
          </li>
        );
      }).reverse()}
    </ol>
  </aside>
);

export default MoneyLadder;
