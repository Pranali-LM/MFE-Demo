import { Action } from '@ngrx/store';

export enum HomeTagsFilterActionTypes {
  UpdateHomeTagsFilter = '[HomeTags] Update Filter',
  ResetHomeTagsFilter = '[HomeTags] Reset Filter',
}

export class ResetHomeTagsFilter implements Action {
  public readonly type = HomeTagsFilterActionTypes.ResetHomeTagsFilter;
}

export class UpdateHomeTagsFilter implements Action {
  public readonly type = HomeTagsFilterActionTypes.UpdateHomeTagsFilter;

  constructor(
    public payload: {
      tagIds: string[];
    }
  ) {}
}

export type HomeTagsFilterActions = UpdateHomeTagsFilter | ResetHomeTagsFilter;
