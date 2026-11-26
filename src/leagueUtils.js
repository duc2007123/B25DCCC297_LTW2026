import { MAX_GOALS, POINTS, ROUNDS, TEAMS } from './data';

export function getResult(match) {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
}

export function calculateStandings(matches) {
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
    .map((team) => ({ ...team, goalDifference: team.gf - team.ga }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.gf - a.gf ||
        a.name.localeCompare(b.name, 'vi')
    );
}

export function calculateStatistics(matches) {
  const totalGoals = matches.reduce(
    (total, match) => total + match.homeGoals + match.awayGoals,
    0
  );
  const teamGoals = TEAMS.map((team) => ({
    ...team,
    goals: matches.reduce((total, match) => {
      if (match.home === team.id) return total + match.homeGoals;
      if (match.away === team.id) return total + match.awayGoals;
      return total;
    }, 0),
  })).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'vi'));

  return {
    matchCount: matches.length,
    totalGoals,
    averageGoals: matches.length ? (totalGoals / matches.length).toFixed(1) : '0.0',
    draws: matches.filter((match) => getResult(match) === 'draw').length,
    homeWins: matches.filter((match) => getResult(match) === 'home').length,
    awayWins: matches.filter((match) => getResult(match) === 'away').length,
    teamGoals,
  };
}

export function validateMatch(match, matches, ignoredMatchId) {
  const round = Number(match.round);
  const home = Number(match.home);
  const away = Number(match.away);
  const homeGoals = Number(match.homeGoals);
  const awayGoals = Number(match.awayGoals);

  if (!ROUNDS.includes(round)) return 'Vui lòng chọn vòng từ 1 đến 5.';
  if (!TEAMS.some((team) => team.id === home) || !TEAMS.some((team) => team.id === away)) {
    return 'Vui lòng chọn hai đội hợp lệ.';
  }
  if (home === away) return 'Đội nhà và đội khách phải khác nhau.';
  if (
    match.homeGoals === '' ||
    match.awayGoals === '' ||
    !Number.isInteger(homeGoals) ||
    !Number.isInteger(awayGoals) ||
    homeGoals < 0 ||
    awayGoals < 0 ||
    homeGoals > MAX_GOALS ||
    awayGoals > MAX_GOALS
  ) {
    return `Tỷ số phải là số nguyên từ 0 đến ${MAX_GOALS}.`;
  }

  const otherMatches = matches.filter((item) => item.id !== ignoredMatchId);
  const teamsAlreadyPlaying = otherMatches.some(
    (item) =>
      Number(item.round) === round &&
      [Number(item.home), Number(item.away)].some((teamId) => teamId === home || teamId === away)
  );
  if (teamsAlreadyPlaying) return 'Mỗi đội chỉ có thể đá một trận trong một vòng.';

  const pairingAlreadyPlayed = otherMatches.some(
    (item) =>
      (Number(item.home) === home && Number(item.away) === away) ||
      (Number(item.home) === away && Number(item.away) === home)
  );
  if (pairingAlreadyPlayed) return 'Hai đội này đã gặp nhau trong giải.';

  return '';
}