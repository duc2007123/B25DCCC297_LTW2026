import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRemaining, setTarget, setTeamId } from '../store/goalSlice';
import { calcNeeded } from '../utils';
import { TEAMS } from '../data';

export default function GoalPlanner({ standings }) {
  const dispatch = useDispatch();
  const { teamId, target, remaining } = useSelector((state) => state.goal);

  const result = useMemo(
    () => calcNeeded(standings, teamId, target, remaining),
    [standings, teamId, target, remaining]
  );

  return (
    <section className="panel target-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">MỤC TIÊU ĐIỂM</span>
          <h2>Đội cần thêm bao nhiêu điểm</h2>
        </div>
      </div>
      <label className="field-label" htmlFor="goal-team">Đội của bạn</label>
      <select id="goal-team" value={teamId} onChange={(e) => dispatch(setTeamId(e.target.value))}>
        {TEAMS.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <label className="field-label" htmlFor="goal-target">Số điểm mục tiêu</label>
      <input
        id="goal-target"
        type="number"
        min="0"
        value={target}
        onChange={(e) => dispatch(setTarget(e.target.value))}
      />
      <label className="field-label" htmlFor="goal-remaining">Số trận còn lại</label>
      <input
        id="goal-remaining"
        type="number"
        min="1"
        value={remaining}
        onChange={(e) => dispatch(setRemaining(e.target.value))}
      />
      <p className="goal-result">{result}</p>
    </section>
  );
}
