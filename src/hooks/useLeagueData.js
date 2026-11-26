import { useMemo } from 'react';
import { calcStandings, calcMatchStats } from '../utils';

export default function useLeagueData(matches) {
  return useMemo(
    () => ({
      standings: calcStandings(matches),
      statistics: calcMatchStats(matches),
    }),
    [matches]
  );
}