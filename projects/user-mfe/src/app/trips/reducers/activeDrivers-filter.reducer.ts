import { DateService } from '@app-core/services/date/date.service';
import { ActiveDriverFilterActions, ActiveDriverFilterActionsTypes } from '../actions/activeDrivers-filter.actions';

export interface State {
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

function getInitialState() {
  const dateService = new DateService();
  const { from: startDate, to: endDate } = dateService.getDateRange(7);
  return {
    displayStartDate: startDate,
    displayEndDate: endDate,
    paramStartDate: dateService.toDaysStartISO(startDate),
    paramEndDate: dateService.toDaysEndISOPlusOne(endDate),
    filterType: 'driverFilter',
    driverId: '',
    driverName: '',
    assetId: '',
    tagIds: [],
  };
}

const {
  displayStartDate: from,
  displayEndDate: to,
  paramStartDate: paramFrom,
  paramEndDate: paramTo,
  filterType: filterType,
  driverId: driverId,
  driverName: driverName,
  assetId: assetId,
  tagIds: tagIds,
} = getInitialState();

export const initialState: State = {
  displayStartDate: from,
  displayEndDate: to,
  paramStartDate: paramFrom,
  paramEndDate: paramTo,
  filterType,
  driverId,
  driverName,
  assetId,
  tagIds,
};

export function reducer(state = initialState, action: ActiveDriverFilterActions): State {
  switch (action.type) {
    case ActiveDriverFilterActionsTypes.ResetActiveDriverFilter:
      return {
        ...state,
        ...initialState,
      };

    case ActiveDriverFilterActionsTypes.UpdateActveDriverFilter:
      return {
        ...state,
        ...action.payload,
      };

    case ActiveDriverFilterActionsTypes.ResetActiveDriverTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case ActiveDriverFilterActionsTypes.UpdateActveDriverFilter:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
