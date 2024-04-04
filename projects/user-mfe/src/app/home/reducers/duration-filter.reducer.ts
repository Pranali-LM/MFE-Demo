import { DateService } from '@app-core/services/date/date.service';
import { DurationFilterActions, DurationFilterActionTypes } from '../actions/duration-filter.actions';

function getStartAndEndTime(noOfDays) {
  return new DateService().getDateRangeInISO(noOfDays);
}

const { from, to } = getStartAndEndTime(7);

export interface State {
  days: number;
  startDate: string;
  endDate: string;
}

export const initialState: State = {
  days: 7,
  startDate: from,
  endDate: to,
};

export function reducer(state = initialState, action: DurationFilterActions): State {
  switch (action.type) {
    case DurationFilterActionTypes.UpdateDurationFilter: {
      const { days, startDate, endDate } = action.payload;
      return {
        ...state,
        days,
        startDate,
        endDate,
      };
    }

    case DurationFilterActionTypes.ResetDurationFilter: {
      return {
        ...state,
        ...initialState,
      };
    }

    default:
      return state;
  }
}
