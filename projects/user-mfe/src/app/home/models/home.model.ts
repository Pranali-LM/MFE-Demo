import { MIN_DISTANCE, SAFE_THRESHOLD, UNSAFE_THRESHOLD } from '@app-home/constants/home.constants';
import { DriverStatsParams as DriverStats, FleetStatsParams as FleetStats, TripListParams as TripList } from '@app-core/models/core.model';
import { MILES_TO_KILOMETERS_CONVERSION } from '@app-core/constants/constants';

export class FleetStatsParams extends FleetStats {}

export class DriverStatsParams extends DriverStats {}

export class TripListParams extends TripList {}

export class SafeAndUnsafeDriverListParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public safeThreshold: number;
  public unsafeThreshold: number;
  public unit: string;
  public minDistance: number;

  constructor({ startDate, endDate, fleetId, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    if (unit === 'Miles') {
      this.unit = 'mi';
      this.safeThreshold = SAFE_THRESHOLD;
      this.unsafeThreshold = UNSAFE_THRESHOLD;
      this.minDistance = MIN_DISTANCE;
    } else {
      this.unit = 'km';
      this.safeThreshold = Number((SAFE_THRESHOLD / MILES_TO_KILOMETERS_CONVERSION).toFixed(2));
      this.unsafeThreshold = Number((UNSAFE_THRESHOLD / MILES_TO_KILOMETERS_CONVERSION).toFixed(2));
      this.minDistance = Number((MIN_DISTANCE * MILES_TO_KILOMETERS_CONVERSION).toFixed(2));
    }
  }
}

export class DriverEventTrendParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public driverId: string;
  public unit: string;

  constructor({ startDate, endDate, fleetId, driverId, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    this.driverId = driverId;
    this.unit = unit;
  }
}

export class FleetEventTrendParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public unit: string;

  constructor({ startDate, endDate, fleetId, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    this.unit = unit;
  }
}

export class SevereViolationsParams {
  public startDate: string;
  public endDate: string;
  public driverId?: string;
  public limit?: number;

  constructor({ startDate, endDate, driverId, limit }: any) {
    this.startDate = startDate;
    this.endDate = endDate;
    if (driverId) {
      this.driverId = driverId;
    }
    if (limit) {
      this.limit = limit;
    }
  }
}

// Responses
export interface SafeAndUnsafeDriverListResponse {
  safeDrivers: any[];
  unSafeDrivers: any[];
}

export interface SevereViolationsResponse {
  eventsByType: object;
  limit: number;
}

export class improvedDriverListParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public unit: string;
  public minDistance: number;

  constructor({ startDate, endDate, fleetId, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    if (unit === 'Miles') {
      this.unit = 'mi';
      this.minDistance = MIN_DISTANCE;
    } else {
      this.unit = 'km';
      this.minDistance = Number((MIN_DISTANCE * MILES_TO_KILOMETERS_CONVERSION).toFixed(2));
    }
  }
}

export interface SevereViolationsData {
  [key: string]: Array<{ [key: string]: any }>;
}
