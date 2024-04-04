import { Action } from '@ngrx/store';

export enum TripFilterActionTypes {
  UpdateTripFilter = '[Trips] Update Filter',
  ResetTripFilter = '[Trips] Reset Filter',
  UpdateTripsTagsFilter = '[Trips] Update Filter',
  ResetTripsTagsFilter = '[Trips] Reset Filter',
}

export class ResetTripsFilter implements Action {
  public readonly type = TripFilterActionTypes.ResetTripFilter;
}

export class UpdateTripsFilter implements Action {
  public readonly type = TripFilterActionTypes.UpdateTripFilter;

  constructor(
    public payload: {
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
  ) {}
}

export type TripFilterActions = UpdateTripsFilter | ResetTripsFilter;

export class ResetTripsTagsFilter implements Action {
  public readonly type = TripFilterActionTypes.ResetTripsTagsFilter;
}

export class UpdateTripsTagsFilter implements Action {
  public readonly type = TripFilterActionTypes.UpdateTripsTagsFilter;

  constructor(
    public payload: {
      tagIds: string[];
    }
  ) {}
}

export type TripsTagsFilterActions = UpdateTripsTagsFilter | ResetTripsTagsFilter;
