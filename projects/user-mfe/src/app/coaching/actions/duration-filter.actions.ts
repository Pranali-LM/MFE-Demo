import { Action } from '@ngrx/store';

export enum DurationFilterActionTypes {
  UpdateDurationFilter = '[Coaching] Update Duration Filter',
  ResetDurationFilter = '[Coaching] Reset Duration Filter',
  UpdateCoachingTagsFilter = '[CoachingTags] Update Filter',
  ResetCoachingTagsFilter = '[CoachingTags] Reset Filter',
}

export class UpdateDurationFilter implements Action {
  public readonly type = DurationFilterActionTypes.UpdateDurationFilter;

  constructor(
    public payload: {
      paramStartDate: string;
      paramEndDate: string;
      displayStartDate: Date;
      displayEndDate: Date;
    }
  ) {}
}

export class ResetDurationFilter implements Action {
  public readonly type = DurationFilterActionTypes.ResetDurationFilter;
}

export class ResetCoachingTagsFilter implements Action {
  public readonly type = DurationFilterActionTypes.ResetCoachingTagsFilter;
}

export class UpdateCoachingTagsFilter implements Action {
  public readonly type = DurationFilterActionTypes.UpdateCoachingTagsFilter;

  constructor(
    public payload: {
      tagIds: any[];
    }
  ) {}
}

export type DurationFilterActions = UpdateDurationFilter | ResetDurationFilter | ResetCoachingTagsFilter | UpdateCoachingTagsFilter;
