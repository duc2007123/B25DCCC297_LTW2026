import { createSlice, createSelector } from '@reduxjs/toolkit';
import { POINTS, TEAMS } from '../data';
import { getResult } from '../utils';

const matchesSlice = createSlice({
  name: 'matches',
  initialState: [],
  reducers: {
    setMatches: (state, action) => action.payload,
    addMatch: (state, action) => {
      state.push(action.payload);
    },
    updateMatch: (state, action) => {
      const match = state.find((item) => item.id === action.payload.id);
      if (match) Object.assign(match, action.payload);
    },
    removeMatch: (state, action) => state.filter((match) => match.id !== action.payload),
  },
});

export const { addMatch, removeMatch, setMatches, updateMatch } = matchesSlice.actions;
export const selectMatches = (state) => state.matches;

export const selectStandings = createSelector([selectMatches], (matches) => {
  const teamsMap = new Map(
    TEAMS.map((team) => [
      team.id,
      { ...team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, recentResults: [] },
    ])
  );

  const teamMatches = new Map(TEAMS.map((team) => [team.id, []]));

  matches.forEach((match) => {
    const home = teamsMap.get(match.home);
    const away = teamsMap.get(match.away);
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
      teamMatches.get(match.home).push({ id: match.id, result: 'H' });
      teamMatches.get(match.away).push({ id: match.id, result: 'H' });
    } else {
      const winner = result === 'home' ? home : away;
      const loser = result === 'home' ? away : home;
      winner.won += 1;
      loser.lost += 1;
      winner.points += POINTS.win;
      loser.points += POINTS.loss;
      teamMatches.get(winner.id).push({ id: match.id, result: 'T' });
      teamMatches.get(loser.id).push({ id: match.id, result: 'B' });
    }
  });

  teamMatches.forEach((matchesList, teamId) => {
    const last3 = matchesList
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)
      .map((m) => m.result);
    const team = teamsMap.get(teamId);
    if (team) team.recentResults = last3;
  });

  return Array.from(teamsMap.values())
    .map((team) => ({
      ...team,
      diff: team.gf - team.ga,
      form: team.recentResults.join(' '),
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.diff - a.diff ||
        b.gf - a.gf ||
        a.name.localeCompare(b.name, 'vi')
    );
});

export default matchesSlice.reducer;