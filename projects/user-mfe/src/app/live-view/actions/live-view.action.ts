import { Action } from '@ngrx/store';

export enum LiveViewTagsFilterActionTypes {
  UpdateLiveViewTagsFilter = '[LiveViewTags] Update Filter',
  ResetLiveViewTagsFilter = '[LiveViewTags] Reset Filter',
}

export class ResetLiveViewTagsFilter implements Action {
  public readonly type = LiveViewTagsFilterActionTypes.ResetLiveViewTagsFilter;
}

export class UpdateLiveViewTagsFilter implements Action {
  public readonly type = LiveViewTagsFilterActionTypes.UpdateLiveViewTagsFilter;

  constructor(
    public payload: {
      tagIds: string[];
    }
  ) {}
}

export type LiveViewTagsFilterActions = UpdateLiveViewTagsFilter | ResetLiveViewTagsFilter;
