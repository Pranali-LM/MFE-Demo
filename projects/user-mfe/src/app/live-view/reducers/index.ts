import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { reducer as LiveViewFilterReducer, State as LiveViewFilterState } from './live-view-reducer';

export interface State {
  LiveViewFilter: LiveViewFilterState;
}

export { LiveViewFilterState };

export const reducers: ActionReducerMap<State> = {
  LiveViewFilter: LiveViewFilterReducer,
};

// Selectors
export const getLiveViewState = createFeatureSelector<State>('LiveView');

export const getLiveViewFilter = createSelector(getLiveViewState, (state: State) => state.LiveViewFilter);
