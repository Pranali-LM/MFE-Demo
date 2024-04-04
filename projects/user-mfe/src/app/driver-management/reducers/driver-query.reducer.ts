import { DateService } from '@app-core/services/date/date.service';
import { DriverQueryActions, DriverQueryActionTypes } from '../actions/driver-query.actions';

export interface State {
  driverId: string;
  paramStartDate: string;
  paramEndDate: string;
  displayStartDate: Date;
  displayEndDate: Date;
}

function getInitialState() {
  const dateService = new DateService();
  const { from: startDate, to: endDate } = dateService.getDateRange(7);
  return {
    displayStartDate: startDate,
    displayEndDate: endDate,
    paramStartDate: dateService.toDaysStartISO(startDate),
    paramEndDate: dateService.toDaysEndISOPlusOne(endDate),
  };
}

const { displayStartDate: from, displayEndDate: to, paramStartDate: paramFrom, paramEndDate: paramTo } = getInitialState();

export const initialState: State = {
  driverId: '',
  displayStartDate: from,
  displayEndDate: to,
  paramStartDate: paramFrom,
  paramEndDate: paramTo,
};

export function reducer(state = initialState, action: DriverQueryActions): State {
  switch (action.type) {
    case DriverQueryActionTypes.ResetDriverQuey: {
      return {
        ...state,
        ...initialState,
      };
    }

    case DriverQueryActionTypes.UpdateDriverQuery: {
      const { driverId, displayStartDate, displayEndDate, paramStartDate, paramEndDate } = action.payload;
      return {
        ...state,
        driverId,
        displayStartDate,
        displayEndDate,
        paramStartDate,
        paramEndDate,
      };
    }

    case DriverQueryActionTypes.UpdateDriverIdInDriverQuery: {
      return {
        ...state,
        driverId: action.driverId,
      };
    }

    default:
      return state;
  }
}
