import { Action } from '@ngrx/store';

export enum TagsActionTypes {
  UpdateTags = '[Tags] Update Filter',
  ResetTags = '[Tags] Reset Filter',
}

export class ResetTags implements Action {
  public readonly type = TagsActionTypes.ResetTags;
}

export class UpdateTags implements Action {
  public readonly type = TagsActionTypes.UpdateTags;

  constructor(
    public payload: {
      allTags: any[];
    }
  ) {}
}

export type TagsActions = UpdateTags | ResetTags;
