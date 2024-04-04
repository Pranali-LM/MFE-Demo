import { AssetsTableActions, AssetsTableActionTypes } from '../actions/assets-table.actions';

export interface State {
  pageIndex: number;
  sortKey: string;
  sortDirection: string;
}

export const initialState: State = {
  pageIndex: 0,
  sortKey: 'assetId',
  sortDirection: 'asc',
};

export function reducer(state = initialState, action: AssetsTableActions): State {
  switch (action.type) {
    case AssetsTableActionTypes.UpdateAssetsTablePageIndex:
      return {
        ...state,
        pageIndex: action.payload.pageIndex,
      };

    case AssetsTableActionTypes.UpdateAssetsTableSort:
      return {
        ...state,
        pageIndex: 0,
        sortKey: action.payload.sortKey,
        sortDirection: action.payload.sortDirection,
      };

    case AssetsTableActionTypes.ResetAssetsTableState:
      return {
        ...state,
        ...initialState,
      };

    default:
      return state;
  }
}
