import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { reducer as TripsFilterReducer, State as TripsFilterState } from './trip-filter.reducer';
import { reducer as TripsTableReducer, State as TripsTableState } from './trips-table.reducer';
import { reducer as ActiveDriverTableReducer, State as ActiveDriverTableState } from './activeDrivers-filter.reducer';

export interface State {
  tripsTable: TripsTableState;
  tripsFilter: TripsFilterState;
  activeDriverFilter: ActiveDriverTableState;
}

export { TripsTableState, TripsFilterState, ActiveDriverTableState };

export const reducers: ActionReducerMap<State> = {
  tripsTable: TripsTableReducer,
  tripsFilter: TripsFilterReducer,
  activeDriverFilter: ActiveDriverTableReducer,
};

// Selectors
export const getTripsState = createFeatureSelector<State>('trips');
export const getActiveDriverState = createFeatureSelector<State>('activeDrivers');

export const getTripsTableState = createSelector(getTripsState, (state: State) => state.tripsTable);

export const getTripsFilter = createSelector(getTripsState, (state: State) => state.tripsFilter);

export const getActiveDriverFilter = createSelector(getActiveDriverState, (state: State) => state.activeDriverFilter);
