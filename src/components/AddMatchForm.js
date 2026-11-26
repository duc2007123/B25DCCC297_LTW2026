import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMatch } from '../store/matchesSlice';
import { MAX_GOALS, ROUNDS, TEAMS } from '../data';
import { useNotice } from '../context/NoticeContext';
import { isValidGoals } from '../utils';

const emptyForm = { round: '1', home: '', away: '', homeGoals: '', awayGoals: '' };

export default function AddMatchForm() {
  const dispatch = useDispatch();
  const matches = useSelector((state) => state.matches);
  const showNotice = useNotice();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const homeRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!form.home) {
      newErrors.home = 'Hãy chọn đội nhà';
    }
    if (!form.away && !newErrors.home) {
      newErrors.away = 'Hãy chọn đội khách';
    } else if (!form.away) {
      newErrors.away = 'Hãy chọn đội khách';
    } else if (form.home && form.home === form.away) {
      newErrors.away = 'Hai đội phải khác nhau';
    } else if (form.home && form.away) {
      const homeId = Number(form.home);
      const awayId = Number(form.away);
      const alreadyPlayed = matches.some(
        (m) =>
          (m.home === homeId && m.away === awayId) ||
          (m.home === awayId && m.away === homeId)
      );
      if (alreadyPlayed) {
        newErrors.away = 'Hai đội đã đá với nhau rồi';
      }
    }

    if (!isValidGoals(Number(form.homeGoals)) || form.homeGoals === '') {
      newErrors.homeGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }
    if (!isValidGoals(Number(form.awayGoals)) || form.awayGoals === '') {
      newErrors.awayGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const nextId = matches.reduce((maxId, m) => Math.max(maxId, m.id), 0) + 1;
    dispatch(
      addMatch({
        id: nextId,
        round: Number(form.round),
        home: Number(form.home),
        away: Number(form.away),
        homeGoals: Number(form.homeGoals),
        awayGoals: Number(form.awayGoals),
      })
    );

    const homeName = TEAMS.find((t) => t.id === Number(form.home))?.name || '';
    const awayName = TEAMS.find((t) => t.id === Number(form.away))?.name || '';
    showNotice(`Đã thêm trận ${homeName} - ${awayName}`);
    setForm(emptyForm);
    setErrors({});
    homeRef.current?.focus();
  };

  return (
    <section className="panel add-match-panel">
      <div className="add-match-heading">
        <div>
          <span className="panel-eyebrow">LỊCH THI ĐẤU</span>
          <h2>Thêm trận đấu</h2>
        </div>
        <span className="add-icon" aria-hidden="true">＋</span>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="match-round">Vòng</label>
        <select
          id="match-round"
          value={form.round}
          onChange={(e) => setForm({ ...form, round: e.target.value })}
        >
          {ROUNDS.map((round) => (
            <option key={round} value={round}>Vòng {round}</option>
          ))}
        </select>

        <label className="field-label" htmlFor="match-home">Đội nhà</label>
        <select
          id="match-home"
          ref={homeRef}
          value={form.home}
          onChange={(e) => setForm({ ...form, home: e.target.value })}
        >
          <option value="">-- Chọn đội --</option>
          {TEAMS.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        {errors.home && <p role="alert" className="form-message form-error">{errors.home}</p>}

        <label className="field-label" htmlFor="match-away">Đội khách</label>
        <select
          id="match-away"
          value={form.away}
          onChange={(e) => setForm({ ...form, away: e.target.value })}
        >
          <option value="">-- Chọn đội --</option>
          {TEAMS.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        {errors.away && <p role="alert" className="form-message form-error">{errors.away}</p>}

        <label className="field-label" htmlFor="match-home-goals">Bàn thắng đội nhà</label>
        <input
          id="match-home-goals"
          type="number"
          min="0"
          max={MAX_GOALS}
          step="1"
          placeholder="0"
          value={form.homeGoals}
          onChange={(e) => setForm({ ...form, homeGoals: e.target.value })}
        />
        {errors.homeGoals && <p role="alert" className="form-message form-error">{errors.homeGoals}</p>}

        <label className="field-label" htmlFor="match-away-goals">Bàn thắng đội khách</label>
        <input
          id="match-away-goals"
          type="number"
          min="0"
          max={MAX_GOALS}
          step="1"
          placeholder="0"
          value={form.awayGoals}
          onChange={(e) => setForm({ ...form, awayGoals: e.target.value })}
        />
        {errors.awayGoals && <p role="alert" className="form-message form-error">{errors.awayGoals}</p>}

        <button className="primary-button" type="submit">
          Thêm trận <span aria-hidden="true">↗</span>
        </button>
      </form>
    </section>
  );
}
