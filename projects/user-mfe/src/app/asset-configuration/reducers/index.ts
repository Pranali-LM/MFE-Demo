import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import { reducer as AssetsTableReducer, State as AssetsTableState } from './assets-table.reducer';

export interface State {
  assetsTable: AssetsTableState;
}

export const reducers: ActionReducerMap<State> = {
  assetsTable: AssetsTableReducer,
};

export { AssetsTableState };

// Selectors
export const getAssetsState = createFeatureSelector<State>('asset-configuration');

export const getAssetsTableState = createSelector(getAssetsState, (state: State) => state.assetsTable);
