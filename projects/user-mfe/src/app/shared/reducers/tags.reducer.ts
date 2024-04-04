import { TagsActionTypes, TagsActions } from '@app-shared/actions/tags.action';

export interface State {
  allTags: any[];
}

export const initialState: State = {
  allTags: [],
};

export function reducer(state = initialState, action: TagsActions): State {
  switch (action.type) {
    case TagsActionTypes.ResetTags:
      return {
        ...state,
        ...initialState,
      };

    case TagsActionTypes.UpdateTags:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
