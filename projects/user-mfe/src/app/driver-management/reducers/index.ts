import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { reducer as DriverQueryReducer, State as DriverQueryState } from './driver-query.reducer';

export interface State {
  driverQuery: DriverQueryState;
}

export { DriverQueryState };

export const reducers: ActionReducerMap<State> = {
  driverQuery: DriverQueryReducer,
};

// Selectors
const getAnalyticsState = createFeatureSelector<State>('driver-management');

export const getDriverQueryState = createSelector(getAnalyticsState, (state: State) => state.driverQuery);
