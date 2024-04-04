import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { US_CENTER_LAT_LNG } from '@app-core/constants/constants';
import { UserRole } from '@app-user-management/models/user-roles.model';
import { BehaviorSubject, Subscription } from 'rxjs';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

export function setParams(params) {
  return new HttpParams({
    fromObject: params,
  });
}

export class TripDetailsPageQueryParams {
  public tripId: string;
  public driverId: string;
  public latitude: number;
  public longitude: number;
  public deviceId: string;

  constructor({
    tripId,
    driverId,
    deviceId,
    latitude = US_CENTER_LAT_LNG.latitude,
    longitude = US_CENTER_LAT_LNG.longitude,
  }: {
    tripId: string;
    driverId: string;
    deviceId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.deviceId = deviceId;
  }
}

export class FleetStatsParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public includeEventDiff: boolean;
  public groupBy?: string;
  public unit: string;

  constructor({
    startDate,
    endDate,
    fleetId,
    includeEventDiff = false,
    groupBy,
    unit,
  }: {
    startDate: string;
    endDate: string;
    fleetId: string;
    includeEventDiff: boolean;
    groupBy?: string;
    unit: string;
  }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    this.includeEventDiff = includeEventDiff;
    if (groupBy) {
      this.groupBy = groupBy;
    } else {
      delete this.groupBy;
    }
    this.unit = unit;
  }
}

export class DriverStatsParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public driverId: string;
  public includeEventDiff: boolean;
  public unit: string;

  constructor({ startDate, endDate, driverId, fleetId, includeEventDiff = false, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    this.driverId = driverId;
    this.includeEventDiff = includeEventDiff;
    this.unit = unit;
  }
}

export class AssetStatsParams {
  public startDate: string;
  public endDate: string;
  public fleetId: string;
  public assetId: string;
  public unit: string;

  constructor({ startDate, endDate, assetId, fleetId, unit }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fleetId = fleetId;
    this.assetId = assetId;
    this.unit = unit;
  }
}

export class TripListParams {
  public startDate: string;
  public endDate: string;
  public limit: number;
  public offset: number;
  public sort: string;
  public sortBy: string;
  public fleetId: string;
  public driverId?: string;
  public assetId?: string;
  // public tagIds?:number[];
  public includeInsignificantTrips?: boolean;

  constructor({
    startDate,
    endDate,
    limit = 10,
    offset = 0,
    sort = 'desc',
    sortBy = 'startTime',
    fleetId,
    driverId,
    assetId,
    includeInsignificantTrips,
  }) {
    this.endDate = endDate;
    this.startDate = startDate;
    this.limit = limit;
    this.offset = offset;
    this.sortBy = sortBy;
    this.sort = sort;
    this.fleetId = fleetId;
    if (driverId) {
      this.driverId = driverId;
    }
    if (assetId) {
      this.assetId = assetId;
    }
    if (includeInsignificantTrips) {
      this.includeInsignificantTrips = includeInsignificantTrips;
    }
    // if(tagIds) {
    //   this.tagIds = tagIds
    // } else {
    //   delete this.tagIds
    // }
  }
}

export class FleetDriverListParams {
  public startDate: string;
  public endDate: string;
  public limit: number;
  public offset: number;
  public fleetId: string;
  // public tagIds?:number[];

  constructor({ startDate, endDate, limit = 100, offset = 0, fleetId }: any) {
    this.endDate = endDate;
    this.startDate = startDate;
    this.limit = limit;
    this.offset = offset;
    this.fleetId = fleetId;
    // if(tagIds) {
    //   this.tagIds = tagIds
    // } else {
    //   delete this.tagIds
    // }
  }
}

export class GetAllDriversForAFleetParams {
  constructor(public loginName: string) {}
}

export class LatestTripByAssetIdParams {
  public limit: number;
  public offset: number;
  public minStartDate: string;
  public sort?: string;
  public includeInsignificantTrips: boolean;

  constructor({
    limit = 100,
    offset = 0,
    sort = 'asc',
    minStartDate,
    includeInsignificantTrips = true,
  }: {
    limit: number;
    offset: number;
    sort?: string;
    minStartDate: string;
    includeInsignificantTrips: boolean;
  }) {
    this.limit = limit;
    this.offset = offset;
    this.sort = sort;
    this.minStartDate = minStartDate;
    this.includeInsignificantTrips = includeInsignificantTrips;
  }
}

export interface KeyValuePair {
  [key: string]: any;
}

export interface GpsData {
  latitude: number;
  longitude: number;
  bearing: number;
  speed: number;
  accuracy: number;
}

export interface LiveTelematicsMessageValue {
  messageType: string;
  sequenceId: string;
  tripId: string;
  fleetId: string;
  driverId: string;
  deviceId: string;
  assetId: string;
  ignitionStatus: boolean;
  gpsData: GpsData;
  distance: number;
  eventType?: string;
  timestampUTC: string;
  sdkSchema?: number;
  parserSchema?: number;
  ingestionTimestamp?: string;
}

export enum DeviceState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Amber = 'AMBER',
}

export interface LiveTelematicsMessage {
  key: string;
  partition: number;
  value: LiveTelematicsMessageValue;
}

export interface LiveDevice extends LiveTelematicsMessageValue {
  key: string;
  partition: number;
  timezoneOffset: number;
  timestamp: string;
  ongoing: boolean;
  state: BehaviorSubject<DeviceState>;
  statusUpdateTimestampUTC: string;
  receivedLiveTelematicsUpdate: boolean;
  stateTimerSubscription?: Subscription;
}

export interface CognitoRegionType {
  label: string;
  value: string;
}

// Permissions
export interface PermissionRow {
  id: number;
  description: string;
  portalId: number;
  portalName: string;
  isPermission: true;
  permissions: MainPermission[];
}

export interface Permission {
  permission: string;
  description: string;
  isChecked?: boolean;
}

export interface SubPermission extends Permission {
  childPermissions?: Permission[];
}

export interface MainPermission extends Permission {
  subPermissions?: SubPermission[];
}

export interface ListPermissionsResp {
  code: number;
  rows: PermissionRow[];
}

export interface UserTag {
  attributeId: number;
  attributeName: string;
  attributeType: string;
  entityName: string;
  tagId: number;
  tagName: string;
}

export interface LoginFleetInfo {
  fleetId: string;
  fleetName?: string;
  role: UserRole;
  userTags?: UserTag[];
}

export interface CookieConsent {
  necessaryCookies: boolean;
  functionalCookies: boolean;
  statisticalCookies: boolean;
  cookieExpires: boolean;
}

export interface LoginUserMetadata {
  dateFormat: string;
  language: string;
  metricUnit: string;
  mfaEnabled: string;
  theme: string;
  timezone: string;
  preferredFleet?: string;
  cookieConsent?: CookieConsent;
}

// Auth
export interface LoginInfo {
  userId: string;
  cognitoAccessToken: string;
  customerName: string;
  loginName: string;
  loginType: string;
  userType: string;
  name: string;
  token: string;
  tokenExpiresAt: number;
  userMetadata: LoginUserMetadata;
  fleets: LoginFleetInfo[];
}

interface FleetEventsObjects {
  eventType: string;
  state: string;
  eventName: string;
}
export interface FleetEvents {
  customExternalEvents: FleetEventsObjects[];
  standardEvents: FleetEventsObjects[];
}

export interface ChildConfigs {
  key: string;
  label: string;
}

export interface ConfigFAQDescription {
  eventHeading: string;
  eventDescription: string[];
  configDescription: ConfigDescription[];
}

export interface ConfigDescription {
  eventId: string;
  event: string;
  description: string;
}
