import { configureStore } from '@reduxjs/toolkit';
import matchesReducer from './matchesSlice';
import goalReducer from './goalSlice';
import { loadSaved, saveMatches } from '../storage';

const savedMatches = loadSaved();

const store = configureStore({
  reducer: { matches: matchesReducer, goal: goalReducer },
  preloadedState: savedMatches ? { matches: savedMatches } : undefined,
});

let prevMatches = store.getState().matches;
store.subscribe(() => {
  const currentMatches = store.getState().matches;
  if (currentMatches !== prevMatches) {
    saveMatches(currentMatches);
    prevMatches = currentMatches;
  }
});

export const hasSaved = savedMatches !== null;
export default store;