import { Action } from '@ngrx/store';

export enum TripsTableActionTypes {
  UpdateTripsTablePageIndex = '[Trips] Update Trips Table Page Index',
  ResetTripsTablePageIndex = '[Trips] Reset Trips Table Page Index',
  UpdateTripsTableSort = '[Trips] Update Trips Table Sorting',
  ResetTripsTableState = '[Trips] Reset Trips Table State',
}

export class UpdateTripsTablePageIndex implements Action {
  public readonly type = TripsTableActionTypes.UpdateTripsTablePageIndex;

  constructor(
    public payload: {
      pageIndex: number;
    }
  ) {}
}

export class UpdateTripsTableSort implements Action {
  public readonly type = TripsTableActionTypes.UpdateTripsTableSort;

  constructor(
    public payload: {
      sortKey: string;
      sortDirection: string;
    }
  ) {}
}

export class ResetTripsTableState implements Action {
  public readonly type = TripsTableActionTypes.ResetTripsTableState;
}

export type TripsTableActions = UpdateTripsTablePageIndex | UpdateTripsTableSort | ResetTripsTableState;
