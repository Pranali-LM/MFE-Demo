import { Action } from '@ngrx/store';

export enum AssetsTableActionTypes {
  UpdateAssetsTablePageIndex = '[Assets] Update Assets Table Page Index',
  ResetAssetsTablePageIndex = '[Assets] Reset Assets Table Page Index',
  UpdateAssetsTableSort = '[Assets] Update Assets Table Sorting',
  ResetAssetsTableState = '[Assets] Reset Assets Table State',
}

export class UpdateAssetsTablePageIndex implements Action {
  public readonly type = AssetsTableActionTypes.UpdateAssetsTablePageIndex;

  constructor(
    public payload: {
      pageIndex: number;
    }
  ) {}
}

export class UpdateAssetsTableSort implements Action {
  public readonly type = AssetsTableActionTypes.UpdateAssetsTableSort;

  constructor(
    public payload: {
      sortKey: string;
      sortDirection: string;
    }
  ) {}
}

export class ResetAssetsTableState implements Action {
  public readonly type = AssetsTableActionTypes.ResetAssetsTableState;
}

export type AssetsTableActions = UpdateAssetsTablePageIndex | UpdateAssetsTableSort | ResetAssetsTableState;
