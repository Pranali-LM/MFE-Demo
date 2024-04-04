import { DateService } from '@app-core/services/date/date.service';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { DEVICE_GPS_UPDATE_TIMER_MIN } from '@app-live-view/constants/live-view.constants';
import { BehaviorSubject, Subscription, timer } from 'rxjs';

export interface GpsData {
  latitude: number;
  longitude: number;
  bearing: number;
  speed: number;
  accuracy: number;
}

export enum DeviceState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Amber = 'AMBER',
}

export interface DeviceStateInput {
  statusUpdateTimestampUTC?: string;
  lastPingTimestampUTC?: string;
  ongoing?: boolean;
}

export enum LTMessageType {
  Event = 'event',
  Gps = 'gps',
  DeviceHealth = 'deviceHealth',
}

export interface LiveTelematicsMessageValue {
  messageType: LTMessageType;
  sequenceId: string;
  tripId: string;
  fleetId: string;
  driverId: string;
  deviceId: string;
  assetId: string;
  ignitionStatus: boolean;
  gpsData: GpsData;
  distance: number;
  assetName?: string;
  eventType?: string;
  timestampUTC: string;
  sdkSchema?: number;
  parserSchema?: number;
  ingestionTimestamp?: string;
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
  asset?: any;
  recordedInfo?: any[];
  currentLocationGeocodeData: BehaviorSubject<any>;
  currentLocationGeocodeDataSub?: Subscription;
  firstLocationGeocodeData: BehaviorSubject<any>;
  firstLocationGeocodeDataSub?: Subscription;
  totalEventCount?: number;
  isAlwaysOnlineEnabled?: boolean;
  firstLocation?: GpsData;
  driverName?: string;
  assetTags: AssetTags[];
}

export class IntitialActiveDevice implements LiveDevice {
  public key: string;
  public partition: number;
  public messageType: LTMessageType;
  public tripId: string;
  public fleetId: string;
  public driverId: string;
  public deviceId: string;
  public ignitionStatus: boolean;
  public gpsData: GpsData;
  public timestampUTC: string;
  public timezoneOffset: number;
  public timestamp: string;
  public sequenceId: string;
  public assetId: string;
  public distance: number;
  public ingestionTimestamp: string;
  public ongoing: boolean;
  public statusUpdateTimestampUTC: string;
  public receivedLiveTelematicsUpdate: boolean;
  public state: BehaviorSubject<DeviceState>;
  public stateTimerSubscription: Subscription;
  public asset: any;
  public recordedInfo: any[];
  public firstLocation?: any;
  public currentLocationGeocodeData: BehaviorSubject<any>;
  public currentLocationGeocodeDataSub: Subscription;
  public firstLocationGeocodeData: BehaviorSubject<any>;
  public firstLocationGeocodeDataSub: Subscription;
  public totalEventCount?: number;
  public driverName?: string;
  public isAlwaysOnlineEnabled?: boolean;
  public assetTags: AssetTags[];

  constructor(trip: any, dateService: DateService, liveTelamaticsService: LiveTelematicsService) {
    const {
      device: { deviceId = '' } = {},
      asset: { assetId = '' } = {},
      firstLocation = {},
      lastKnownLocation = {},
      lastLocation = {},
      eventCount: { total: totalEventCount = 0 } = {},
      isAlwaysOnlineEnabled = false,
    } = trip;
    let timestampUTC: string;
    if (!trip.ongoing && trip.endTimeUTC) {
      timestampUTC = trip.endTimeUTC;
    } else if (trip.statusUpdateTimestamp) {
      timestampUTC = trip.statusUpdateTimestamp;
    } else {
      timestampUTC = trip.startTimeUTC;
    }
    const state = liveTelamaticsService.getLiveDeviceState({
      statusUpdateTimestampUTC: trip.statusUpdateTimestamp,
      ongoing: trip.ongoing,
    });

    const validLastKnownLocation = lastKnownLocation.latitude || lastKnownLocation.longitude;
    let gpsData: any;
    if (trip.ongoing) {
      gpsData = validLastKnownLocation ? lastKnownLocation : firstLocation;
    } else {
      gpsData = lastLocation;
    }
    this.key = deviceId;
    this.partition = -1;
    this.sequenceId = deviceId;
    this.messageType = LTMessageType.Gps;
    this.tripId = trip.tripId;
    this.fleetId = trip.fleetId;
    this.driverId = trip.driverId;
    this.driverName = trip.driverName;
    this.deviceId = deviceId;
    this.assetId = assetId;
    this.ignitionStatus = true;
    this.timestampUTC = timestampUTC;
    this.timestamp = dateService.getLocalTimestamp(trip.timezoneOffset, timestampUTC);
    this.timezoneOffset = trip.timezoneOffset;
    this.ingestionTimestamp = trip.ongoing ? trip.startTimeUTC : trip.endTimeUTC;
    this.distance = trip.tripDistance;
    this.ongoing = trip.ongoing;
    this.statusUpdateTimestampUTC = trip.statusUpdateTimestamp;
    this.receivedLiveTelematicsUpdate = false;
    this.gpsData = {
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      bearing: gpsData.bearing,
      speed: gpsData.speed,
      accuracy: gpsData.accuracy,
    };
    this.firstLocation = firstLocation;
    this.totalEventCount = totalEventCount;
    this.isAlwaysOnlineEnabled = isAlwaysOnlineEnabled;
    this.asset = trip.asset;
    this.recordedInfo = trip.recordedInfo;
    this.state = new BehaviorSubject(state);
    if (state === DeviceState.Active) {
      this.stateTimerSubscription = timer(DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).subscribe(() => {
        this.state.next(DeviceState.Amber);
      });
    }
    this.currentLocationGeocodeData = new BehaviorSubject({});
    this.firstLocationGeocodeData = new BehaviorSubject({});
    this.assetTags = [];
  }
}

export interface AssetTags {
  attributeId: number;
  attributeName: string;
  attributeStatus: string;
  attributeType: string;
  entityName: string;
  tagId: number;
  tagName: string;
}

export interface AssetTagsResp {
  assetId: string;
  assetTags: AssetTags[] | null;
}
