import { TripsTableActions, TripsTableActionTypes } from '../actions/trips-table.actions';

export interface State {
  pageIndex: number;
  sortKey: string;
  sortDirection: string;
}

export const initialState: State = {
  pageIndex: 0,
  sortKey: 'startTime',
  sortDirection: 'desc',
};

export function reducer(state = initialState, action: TripsTableActions): State {
  switch (action.type) {
    case TripsTableActionTypes.UpdateTripsTablePageIndex:
      return {
        ...state,
        pageIndex: action.payload.pageIndex,
      };

    case TripsTableActionTypes.UpdateTripsTableSort:
      return {
        ...state,
        pageIndex: 0,
        sortKey: action.payload.sortKey,
        sortDirection: action.payload.sortDirection,
      };

    case TripsTableActionTypes.ResetTripsTableState:
      return {
        ...state,
        ...initialState,
      };

    default:
      return state;
  }
}
