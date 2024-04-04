import { DateService } from '@app-core/services/date/date.service';
import { DurationFilterActions, DurationFilterActionTypes } from '../actions/duration-filter.actions';
export interface State {
  paramStartDate: string;
  paramEndDate: string;
  displayStartDate: Date;
  displayEndDate: Date;
  tagIds: any[];
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
  displayStartDate: from,
  displayEndDate: to,
  paramStartDate: paramFrom,
  paramEndDate: paramTo,
  tagIds: [],
};

export function reducer(state = initialState, action: DurationFilterActions): State {
  switch (action.type) {
    case DurationFilterActionTypes.UpdateDurationFilter:
      return {
        ...state,
        ...action.payload,
      };

    case DurationFilterActionTypes.ResetDurationFilter:
      return {
        ...state,
        ...initialState,
      };
    case DurationFilterActionTypes.ResetCoachingTagsFilter:
      return {
        ...state,
        ...initialState,
      };

    case DurationFilterActionTypes.UpdateCoachingTagsFilter:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
