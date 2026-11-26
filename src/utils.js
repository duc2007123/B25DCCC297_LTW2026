import { MAX_GOALS, POINTS, TEAMS } from './data';

export function getTeamName(id) {
  const team = TEAMS.find((t) => t.id === id);
  return team ? team.name : '';
}

export function getResult(match) {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
}

export function isValidGoals(n) {
  return Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;
}

export function calcStandings(matches) {
  const standings = new Map(
    TEAMS.map((team) => [
      team.id,
      { ...team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    ])
  );

  matches.forEach((match) => {
    const home = standings.get(match.home);
    const away = standings.get(match.away);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.gf += match.homeGoals;
    home.ga += match.awayGoals;
    away.gf += match.awayGoals;
    away.ga += match.homeGoals;

    const result = getResult(match);
    if (result === 'draw') {
      home.drawn += 1;
      away.drawn += 1;
      home.points += POINTS.draw;
      away.points += POINTS.draw;
    } else {
      const winner = result === 'home' ? home : away;
      const loser = result === 'home' ? away : home;
      winner.won += 1;
      loser.lost += 1;
      winner.points += POINTS.win;
      loser.points += POINTS.loss;
    }
  });

  return Array.from(standings.values())
    .map((team) => ({ ...team, diff: team.gf - team.ga }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.diff - a.diff ||
        b.gf - a.gf ||
        a.name.localeCompare(b.name, 'vi')
    );
}

export function calcMatchStats(matches) {
  const totalGoals = matches.reduce(
    (total, match) => total + match.homeGoals + match.awayGoals,
    0
  );
  const averageGoals = matches.length
    ? Math.round((totalGoals / matches.length) * 100) / 100
    : 0;

  const counts = { home: 0, draw: 0, away: 0 };
  matches.forEach((match) => {
    const result = getResult(match);
    counts[result] += 1;
  });

  const standings = calcStandings(matches);
  const leader = standings.length > 0 ? standings[0] : null;

  return {
    matchCount: matches.length,
    totalGoals,
    averageGoals,
    leader,
    counts,
  };
}

export function calcNeeded(standings, teamId, target, remaining) {
  const team = standings.find((t) => t.id === Number(teamId));
  if (!team) return 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';

  const targetNum = Number(target);
  const remainingNum = Number(remaining);

  if (!Number.isInteger(targetNum) || targetNum < 0) {
    return 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';
  }
  if (!Number.isInteger(remainingNum) || remainingNum < 1) {
    return 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';
  }

  const need = targetNum - team.points;
  if (need === 0) return 'Đội đã đạt mục tiêu';
  if (need > 3 * remainingNum) return 'Không thể đạt mục tiêu này';

  const w = Math.max(0, Math.ceil((need - remainingNum) / 2));
  return `Cần thêm ${need} điểm ở ${remainingNum} trận còn lại, tối thiểu ${w} trận thắng`;
}
