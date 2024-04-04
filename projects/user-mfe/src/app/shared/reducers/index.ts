import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { reducer as SideNavigationConfigReducer, State as SideNavigationConfigState } from './sidenavigation-config.reducer';
import { reducer as UserPermissionReducer, State as UserPermissionState } from './user-permission.reducer';
import { reducer as TagsReducer, State as TagsState } from './tags.reducer';

export interface State {
  sideNavigationConfig: SideNavigationConfigState;
  currentAccessDetails: UserPermissionState;
  Tags: TagsState;
}

export const reducers: ActionReducerMap<State> = {
  sideNavigationConfig: SideNavigationConfigReducer,
  currentAccessDetails: UserPermissionReducer,
  Tags: TagsReducer,
};

export { UserPermissionState };

// Selectors
const getSharedState = createFeatureSelector<State>('shared');

export const getSideNavigationConfigState = createSelector(getSharedState, (state: State) => state.sideNavigationConfig);

export const getCurrentAccessDetailsState = createSelector(getSharedState, (state: State) => state.currentAccessDetails);

export const getTags = createSelector(getSharedState, (state: State) => state.Tags);
