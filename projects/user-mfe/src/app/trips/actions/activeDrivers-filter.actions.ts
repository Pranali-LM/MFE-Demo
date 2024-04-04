import { Action } from '@ngrx/store';

export enum ActiveDriverFilterActionsTypes {
  UpdateActveDriverFilter = '[Drivers] Update Filter',
  ResetActiveDriverFilter = '[Drivers] Reset Filter',
  UpdateActiveDriverTagsFilter = '[Drivers] Update Filter',
  ResetActiveDriverTagsFilter = '[Drivers] Reset Filter',
}

export class ResetActiveDriverFilter implements Action {
  public readonly type = ActiveDriverFilterActionsTypes.ResetActiveDriverFilter;
}

export class UpdateActiveDriverFilter implements Action {
  public readonly type = ActiveDriverFilterActionsTypes.UpdateActveDriverFilter;

  constructor(
    public payload: {
      paramStartDate: string;
      paramEndDate: string;
      displayStartDate: Date;
      displayEndDate: Date;
      filterType: string;
      driverId: string;
      driverName: string;
      assetId: string;
      tagIds: number[];
    }
  ) {}
}

export type ActiveDriverFilterActions = UpdateActiveDriverFilter | ResetActiveDriverFilter;

export class ResetActiveDriverTagsFilter implements Action {
  public readonly type = ActiveDriverFilterActionsTypes.ResetActiveDriverTagsFilter;
}

export class UpdateActiveDriverTagsFilter implements Action {
  public readonly type = ActiveDriverFilterActionsTypes.UpdateActiveDriverTagsFilter;

  constructor(
    public payload: {
      tagIds: string[];
    }
  ) {}
}

export type ActiveDriverTagsFilterActions = UpdateActiveDriverTagsFilter | ResetActiveDriverTagsFilter;
