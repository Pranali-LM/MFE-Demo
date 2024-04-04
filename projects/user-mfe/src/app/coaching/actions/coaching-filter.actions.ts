import { Action } from '@ngrx/store';

export enum CoachingFilterActionTypes {
  UpdateCoachingTagsFilters = '[CoachingTags] Update Filter',
  ResetCoachingTagsFilter = '[CoachingTags] Reset Filter',
}

export class ResetCoachingTagsFilter implements Action {
  public readonly type = CoachingFilterActionTypes.ResetCoachingTagsFilter;
}

export class UpdateCoachingTagsFilters implements Action {
  public readonly type = CoachingFilterActionTypes.UpdateCoachingTagsFilters;

  constructor(
    public payload: {
      tagIds: any[];
    }
  ) {}
}

export type CoachingFilterActions = ResetCoachingTagsFilter | UpdateCoachingTagsFilters;
