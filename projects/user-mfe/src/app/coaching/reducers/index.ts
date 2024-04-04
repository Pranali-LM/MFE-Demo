import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { reducer as DurationFilterReducer, State as DurationFilterState } from './duration-filter.reducer';
import { reducer as CoachingTagsFilterReducer, State as CoachingTagsFilterState } from './coaching-filter.reducer';

export interface State {
  durationFilter: DurationFilterState;
  coachingTagsFilter: CoachingTagsFilterState;
}

export const reducers: ActionReducerMap<State> = {
  durationFilter: DurationFilterReducer,
  coachingTagsFilter: CoachingTagsFilterReducer,
};

// Selectors
const getAnalyticsState = createFeatureSelector<State>('coaching');

export const getDurationFilterState = createSelector(getAnalyticsState, (state: State) => state.durationFilter);

export const getCoachingTags = createSelector(getAnalyticsState, (state: State) => state.coachingTagsFilter);
