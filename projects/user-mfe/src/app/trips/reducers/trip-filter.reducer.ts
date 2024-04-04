import { DateService } from '@app-core/services/date/date.service';
import { TripFilterActions, TripFilterActionTypes } from './../actions/trip-filter.actions';

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
  includeInsignificantTrips: boolean;
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
    includeInsignificantTrips: false,
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
  includeInsignificantTrips: includeInsignificantTrips,
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
  includeInsignificantTrips,
};

export function reducer(state = initialState, action: TripFilterActions): State {
  switch (action.type) {
    case TripFilterActionTypes.ResetTripFilter:
      return {
        ...state,
        ...initialState,
      };

    case TripFilterActionTypes.UpdateTripFilter:
      return {
        ...state,
        ...action.payload,
      };

    case TripFilterActionTypes.ResetTripsTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case TripFilterActionTypes.UpdateTripsTagsFilter:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
