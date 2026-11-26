import { useCallback, useEffect, memo, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeMatch, setMatches, updateMatch, selectStandings } from './store/matchesSlice';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import { MAX_GOALS, RESULT_LABELS, ROUNDS, TEAMS } from './data';
import { getResult, isValidGoals, calcMatchStats } from './utils';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import useDebounce from './hooks/useDebounce';
import StandingsTable from './components/StandingsTable';
import GoalPlanner from './components/GoalPlanner';
import AddMatchForm from './components/AddMatchForm';
import { hasSaved } from './store/store';
import './LeagueApp.css';

export default function LeagueDashboard() {
  const dispatch = useDispatch();
  const matches = useSelector((state) => state.matches);
  const standings = useSelector(selectStandings);
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const [selectedRound, setSelectedRound] = useLocalStorage('ltw_bongda_round', 'all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const debouncedSearch = useDebounce(teamSearch, 300);
  const searchInputRef = useRef(null);

  const { data: initialData, loading, error } = useFetch('/data/matches.json');

  useEffect(() => {
    if (!hasSaved && initialData && matches.length === 0) {
      dispatch(setMatches(initialData));
    }
  }, [initialData, matches.length, dispatch]);

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? 'rgb(31, 36, 48)' : '#ffffff';
  }, [theme]);



  const statistics = useMemo(() => calcMatchStats(matches), [matches]);
  const roundMatches = useMemo(
    () =>
      matches.filter(
        (match) => selectedRound === 'all' || match.round === Number(selectedRound)
      ),
    [matches, selectedRound]
  );
  const roundStatistics = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);
  const filteredMatches = useMemo(() => {
    const search = debouncedSearch.trim().toLocaleLowerCase('vi');
    return matches
      .filter((match) => selectedRound === 'all' || match.round === Number(selectedRound))
      .filter(
        (match) =>
          selectedTeam === 'all' ||
          match.home === Number(selectedTeam) ||
          match.away === Number(selectedTeam)
      )
      .filter((match) => {
        if (!search) return true;
        const home = TEAMS.find((team) => team.id === match.home)?.name || '';
        const away = TEAMS.find((team) => team.id === match.away)?.name || '';
        return `${home} ${away}`.toLocaleLowerCase('vi').includes(search);
      })
      .sort((a, b) => a.round - b.round || a.id - b.id);
  }, [matches, selectedRound, selectedTeam, debouncedSearch]);

  const handleTeamShift = (event) => {
    setTeamSearch(event.target.value);
  };

  const handleGoalsChange = useCallback((updatedMatch) => {
    dispatch(updateMatch(updatedMatch));
  }, [dispatch]);

  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  const handleRemove = useCallback((matchId) => {
    const match = matchesRef.current.find((m) => m.id === matchId);
    const home = TEAMS.find((t) => t.id === match?.home)?.name || '';
    const away = TEAMS.find((t) => t.id === match?.away)?.name || '';
    dispatch(removeMatch(matchId));
    showNotice(`Đã xóa trận ${home} - ${away}`);
  }, [dispatch, showNotice]);

  const handleResetData = useCallback(() => {
    if (initialData) {
      dispatch(setMatches(initialData));
      showNotice('Đã đặt lại dữ liệu mẫu');
    }
  }, [dispatch, initialData, showNotice]);

  useEffect(() => {
    if (statistics.leader) {
      document.title = `${statistics.leader.name} dẫn đầu – Giải bóng đá khoa`;
    } else {
      document.title = 'Giải bóng đá khoa';
    }
  }, [statistics.leader]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setTeamSearch('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className={`league-app theme-${theme}`}>
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Trang chủ giải đấu">
            <span className="brand-mark" aria-hidden="true">⚽</span>
            <span>SPORT<span className="brand-accent">BOARD</span></span>
          </a>
          <nav className="top-nav" aria-label="Điều hướng chính">
            <a href="#standings">Xếp hạng</a>
            <a href="#fixtures">Lịch thi đấu</a>
            <a href="#statistics">Thống kê</a>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Đổi giao diện sáng tối">
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
            <span>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
          </button>
        </header>

        <main id="top">
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="eyebrow"><span className="live-dot" /> MÙA GIẢI 2026 · VÒNG TRÒN MỘT LƯỢT</span>
              <h1>Giải bóng đá khoa</h1>
              <p>Sân chơi thể thao kết nối các khoa · 6 đội · 5 vòng đấu</p>
              <a className="hero-link" href="#fixtures">Khám phá lịch đấu <span aria-hidden="true">↘</span></a>
            </div>
            <div className="hero-ball" aria-hidden="true">⚽</div>
            <div className="hero-season"><span>ĐANG DIỄN RA</span><strong>SEASON<br />2026</strong></div>
          </section>

          {!hasSaved && loading && <p className="notice" role="status">Đang tải lịch thi đấu...</p>}
          {!hasSaved && error && <p className="notice notice-error" role="alert">Không tải được lịch thi đấu</p>}

          <section className="overview-grid" aria-label="Tổng quan giải đấu">
            <div className="overview-card"><span className="overview-icon icon-green">▦</span><div><span className="overview-label">ĐỘI THAM GIA</span><strong>06</strong></div><span className="overview-foot">Khoa · tranh tài</span></div>
            <div className="overview-card"><span className="overview-icon icon-blue">◷</span><div><span className="overview-label">TRẬN ĐÃ ĐẤU</span><strong>{statistics.matchCount}<small> / 15</small></strong></div><span className="overview-foot">{Math.round((statistics.matchCount / 15) * 100)}% mùa giải</span></div>
            <div className="overview-card"><span className="overview-icon icon-orange">⚽</span><div><span className="overview-label">TỔNG BÀN THẮNG</span><strong>{statistics.totalGoals}</strong></div><span className="overview-foot">{statistics.averageGoals.toFixed(2)} bàn / trận</span></div>
            <div className="overview-card"><span className="overview-icon icon-purple">▤</span><div><span className="overview-label">SỐ VÒNG ĐẤU</span><strong>05</strong></div><span className="overview-foot">Mỗi đội gặp nhau 1 lần</span></div>
          </section>

          <div className="main-grid">
            <section className="panel standings-panel" id="standings">
              <PanelHeading eyebrow="BẢNG ĐIỂM" title="Bảng xếp hạng" detail="Cập nhật sau mỗi trận đấu" />
              <div className="table-scroll">
                <StandingsTable standings={standings} />
              </div>
              <div className="table-legend"><span><i className="legend-dot legend-first" /> Dẫn đầu</span><span>Đ · Đã đấu</span><span>HS · Hiệu số</span></div>
            </section>

            <GoalPlanner standings={standings} />
          </div>

          <div className="lower-grid">
            <section className="panel fixtures-panel" id="fixtures">
              <PanelHeading eyebrow="THEO DÕI TRẬN ĐẤU" title="Các trận đấu" detail="Lịch thi đấu và kết quả các vòng" />
              <div className="fixture-filters">
                <label className="filter-control"><span>Vòng đấu</span><select aria-label="Lọc theo vòng" value={selectedRound} onChange={(event) => setSelectedRound(event.target.value)}><option value="all">Tất cả vòng</option>{ROUNDS.map((round) => <option value={round} key={round}>Vòng {round}</option>)}</select></label>
                <label className="filter-control"><span>Tìm đội</span><input ref={searchInputRef} aria-label="Tìm đội" type="search" placeholder="Nhập tên đội..." value={teamSearch} onChange={handleTeamShift} /></label>
                <label className="filter-control team-filter"><span>Đội bóng</span><select aria-label="Lọc theo đội" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}><option value="all">Tất cả đội</option>{TEAMS.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label>
              </div>
              <div className="match-list">
                {filteredMatches.length > 0 ? (
                  <table className="matches-table">
                    <thead>
                      <tr>
                        <th>Vòng</th>
                        <th>Đội nhà</th>
                        <th>BT nhà</th>
                        <th>BT khách</th>
                        <th>Đội khách</th>
                        <th>Kết quả</th>
                        <th>Số lần render</th>
                        <th>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatches.map((match) => <MatchRow key={match.id} match={match} onGoals={handleGoalsChange} onRemove={handleRemove} />)}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-state">Chưa có trận đấu nào</p>
                )}
              </div>
              <p className="fixture-count">Tìm thấy {filteredMatches.length} trận</p>
              {initialData && <button className="secondary-button" onClick={handleResetData} type="button">Đặt lại dữ liệu mẫu</button>}
            </section>

            <aside className="side-column">
              <section className="panel stats-panel" id="statistics">
                <PanelHeading eyebrow="CON SỐ NỔI BẬT" title="Thống kê" detail="Tổng hợp toàn giải đấu" />
                <p>Số trận: {roundStatistics.matchCount}</p>
                <p>Tổng số bàn thắng: {roundStatistics.totalGoals}</p>
                <p>Bàn thắng mỗi trận: {roundStatistics.averageGoals.toFixed(2)}</p>
                <p>Đội dẫn đầu: {statistics.leader ? `${statistics.leader.name} (${statistics.leader.points} điểm)` : '—'}</p>
                <h3 className="scorer-title">Phân bố kết quả</h3>
                <ul className="result-distribution">
                  {Object.entries(RESULT_LABELS).map(([key, label]) => (
                    <li key={key}>
                      <span>{label}: {roundStatistics.counts[key]}</span>
                      <span style={{ backgroundColor: '#4caf50', height: '10px', width: `${roundStatistics.counts[key] * 24}px`, display: 'inline-block' }} />
                    </li>
                  ))}
                </ul>
              </section>

              <AddMatchForm />
            </aside>
          </div>

          <footer className="app-footer"><span>⚽ <strong>SPORTBOARD</strong> · GIẢI BÓNG ĐÁ KHOA 2026</span><span>Thi đấu hết mình · Kết nối đam mê</span></footer>
        </main>
      </div>
    </div>
  );
}

function PanelHeading({ eyebrow, title, detail }) {
  return <div className="panel-heading"><div><span className="panel-eyebrow">{eyebrow}</span><h2>{title}</h2></div><p>{detail}</p></div>;
}

const MatchRow = memo(function MatchRow({ match, onGoals, onRemove }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const home = TEAMS.find((team) => team.id === match.home)?.name || 'Đội nhà';
  const away = TEAMS.find((team) => team.id === match.away)?.name || 'Đội khách';
  const result = RESULT_LABELS[getResult(match)];

  const handleHomeGoalsChange = (e) => {
    const value = e.target.valueAsNumber;
    if (isValidGoals(value)) {
      onGoals({ ...match, homeGoals: value });
    }
  };

  const handleAwayGoalsChange = (e) => {
    const value = e.target.valueAsNumber;
    if (isValidGoals(value)) {
      onGoals({ ...match, awayGoals: value });
    }
  };

  return (
    <tr style={getResult(match) === 'draw' ? { backgroundColor: 'rgba(255, 193, 7, 0.25)' } : {}}>
      <td>Vòng {match.round}</td>
      <td>{home}</td>
      <td>
        <input
          type="number"
          min="0"
          max={MAX_GOALS}
          value={match.homeGoals}
          onChange={handleHomeGoalsChange}
          aria-label={`Bàn thắng nhà ${home} - ${away}`}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          max={MAX_GOALS}
          value={match.awayGoals}
          onChange={handleAwayGoalsChange}
          aria-label={`Bàn thắng khách ${home} - ${away}`}
        />
      </td>
      <td>{away}</td>
      <td>{result}</td>
      <td className="render-count">{renderCount.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(match.id)}>Xóa</button>
      </td>
    </tr>
  );
});
