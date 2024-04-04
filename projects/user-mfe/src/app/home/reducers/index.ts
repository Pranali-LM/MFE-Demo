import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { reducer as DurationFilterReducer, State as DurationFilterState } from './duration-filter.reducer';
import { reducer as HomeTagsReducer, State as HomeTagsFilterState } from './home-filter-tags.reducer';

export interface State {
  durationFilter: DurationFilterState;
  HomeTagsFilter: HomeTagsFilterState;
}

export const reducers: ActionReducerMap<State> = {
  durationFilter: DurationFilterReducer,
  HomeTagsFilter: HomeTagsReducer,
};

// Selectors
const getAnalyticsState = createFeatureSelector<State>('home');
const getHomeTagsState = createFeatureSelector<State>('home');

export const getDurationFilterState = createSelector(getAnalyticsState, (state: State) => state.durationFilter);

export const getDurationFilterDays = createSelector(getDurationFilterState, (state: DurationFilterState) => state.days);

export const getHomeTags = createSelector(getHomeTagsState, (state: State) => state.HomeTagsFilter);
