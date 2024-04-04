import { Action } from '@ngrx/store';

export enum DurationFilterActionTypes {
  UpdateDurationFilter = '[Analytics] Update Duration Filter',
  ResetDurationFilter = '[Analytics] Reset Duration Filter',
}

export class UpdateDurationFilter implements Action {
  public readonly type = DurationFilterActionTypes.UpdateDurationFilter;

  constructor(
    public payload: {
      days: number;
      startDate: string;
      endDate: string;
    }
  ) {}
}

export class ResetDurationFilter implements Action {
  public readonly type = DurationFilterActionTypes.ResetDurationFilter;
}

export type DurationFilterActions = UpdateDurationFilter | ResetDurationFilter;
