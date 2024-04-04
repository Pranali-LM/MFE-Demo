import { HomeTagsFilterActionTypes, HomeTagsFilterActions } from '@app-home/actions/home-filter-tags.action';

export interface State {
  tagIds: any[];
}

export const initialState: State = {
  tagIds: [],
};

export function reducer(state = initialState, action: HomeTagsFilterActions): State {
  switch (action.type) {
    case HomeTagsFilterActionTypes.ResetHomeTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case HomeTagsFilterActionTypes.UpdateHomeTagsFilter:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
