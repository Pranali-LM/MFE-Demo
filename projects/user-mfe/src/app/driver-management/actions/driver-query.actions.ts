import { Action } from '@ngrx/store';

export enum DriverQueryActionTypes {
  UpdateDriverQuery = '[DriverQuery] Update Driver Query',
  UpdateDriverIdInDriverQuery = '[DriverQuery] Update Driver Id in Driver Query',
  ResetDriverQuey = '[DriverQyery] Reset Driver Query',
}

export class UpdateDriverQuery implements Action {
  public readonly type = DriverQueryActionTypes.UpdateDriverQuery;

  constructor(
    public payload: {
      driverId: string;
      displayStartDate: Date;
      displayEndDate: Date;
      paramStartDate: string;
      paramEndDate: string;
    }
  ) {}
}

export class UpdateDriverIdInDriverQuery implements Action {
  public readonly type = DriverQueryActionTypes.UpdateDriverIdInDriverQuery;

  constructor(public driverId: string) {}
}

export class ResetDriverQuery implements Action {
  public readonly type = DriverQueryActionTypes.ResetDriverQuey;
}

export type DriverQueryActions = UpdateDriverQuery | UpdateDriverIdInDriverQuery | ResetDriverQuery;
