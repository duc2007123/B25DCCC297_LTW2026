import sampleMatches from '../public/data/matches.json';
import { calculateStandings, calculateStatistics, getResult, validateMatch } from './leagueUtils';

test('calculates results and a row for every team', () => {
  expect(getResult(sampleMatches[0])).toBe('home');
  expect(getResult(sampleMatches[1])).toBe('draw');
  expect(getResult(sampleMatches[2])).toBe('draw');

  const standings = calculateStandings(sampleMatches);
  const cntt = standings.find((team) => team.id === 1);

  expect(standings).toHaveLength(6);
  expect(cntt).toMatchObject({ played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7 });
});

test('summarizes match outcomes and team goals', () => {
  expect(calculateStatistics(sampleMatches)).toMatchObject({
    matchCount: 9,
    totalGoals: 24,
    averageGoals: '2.7',
    draws: 3,
    homeWins: 4,
    awayWins: 2,
  });
});

test('validates new match rules', () => {
  const availableMatch = { round: 4, home: 1, away: 2, homeGoals: '0', awayGoals: '0' };
  expect(validateMatch(availableMatch, sampleMatches)).toBe('');
  expect(validateMatch({ ...availableMatch, away: 1 }, sampleMatches)).toMatch(/khác nhau/);
  expect(validateMatch({ ...availableMatch, round: 1, home: 1, away: 3 }, sampleMatches)).toMatch(/một trận/);
  expect(validateMatch({ ...availableMatch, home: 5, away: 3 }, sampleMatches)).toMatch(/đã gặp nhau/);
  expect(validateMatch({ ...availableMatch, homeGoals: '21' }, sampleMatches)).toMatch(/0 đến 20/);
  expect(validateMatch({ ...availableMatch, round: 6 }, sampleMatches)).toMatch(/vòng từ 1 đến 5/);
});