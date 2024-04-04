import { LiveViewTagsFilterActionTypes, LiveViewTagsFilterActions } from '@app-live-view/actions/live-view.action';

export interface State {
  tagIds: any[];
}

export const initialState: State = {
  tagIds: [],
};

export function reducer(state = initialState, action: LiveViewTagsFilterActions): State {
  switch (action.type) {
    case LiveViewTagsFilterActionTypes.ResetLiveViewTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case LiveViewTagsFilterActionTypes.UpdateLiveViewTagsFilter:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
