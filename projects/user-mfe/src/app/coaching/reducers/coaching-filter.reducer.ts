import { CoachingFilterActionTypes, CoachingFilterActions } from '@app-coaching/actions/coaching-filter.actions';

export interface State {
  tagIds: any[];
}

export const initialState: State = {
  tagIds: [],
};

export function reducer(state = initialState, action: CoachingFilterActions): State {
  switch (action.type) {
    case CoachingFilterActionTypes.ResetCoachingTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case CoachingFilterActionTypes.UpdateCoachingTagsFilters:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
