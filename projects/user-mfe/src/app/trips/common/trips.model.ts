import {
  AssetStatsParams as AssetStats,
  DriverStatsParams as DriverStats,
  FleetDriverListParams as FleetDrivers,
  FleetStatsParams as FleetStats,
  TripDetailsPageQueryParams as TripsQuery,
  TripListParams as TripList,
} from '@app-core/models/core.model';

export class FleetDriverListParams extends FleetDrivers {}

export class FleetStatsParams extends FleetStats {}

export class DriverStatsParams extends DriverStats {}

export class AssetStatsParams extends AssetStats {}

export class TripListParams extends TripList {}

export class TripDetailsPageQueryParams extends TripsQuery {}

export interface RangeSliderOutput {
  startTimeUTC: string;
  endTimeUTC: string;
  videoResolution: string;
  enabledTimelapse?: boolean;
  timelapseCaptureInterval?: number;
  timelapseDisplayInterval?: number;
  dvrVideoType?: string;
  dvrVideoTypeMainFrame?: string;
}

export interface DvrReqVideoType {
  collage: string;
  sources: string[];
  resolution: string;
}

export class CreateDvrRequestBody {
  public tripId: string;
  public driverId: string;
  public startTimeUTC: string;
  public endTimeUTC: string;
  public videoResolution: string;
  public enableTimelapse?: boolean;
  public timelapseCaptureInterval?: number;
  public timelapseDisplayInterval?: number;
  public dvrVideoType?: string;
  public dvrVideoTypeMainFrame?: string;
  public dvrInitiatedMetadata?: any;
  public driverCameraVideoResolution?: string;
  public dvrVideoTypes?: DvrReqVideoType[];

  constructor({
    tripId,
    driverId,
    startTimeUTC,
    endTimeUTC,
    videoResolution,
    enabledTimelapse,
    timelapseCaptureInterval,
    timelapseDisplayInterval,
    dvrVideoType,
    dvrVideoTypeMainFrame,
    dvrInitiatedMetadata,
    driverCameraVideoResolution,
    dvrVideoTypes,
  }: {
    tripId: string;
    driverId: string;
    startTimeUTC: string;
    endTimeUTC: string;
    videoResolution: string;
    enabledTimelapse: boolean;
    timelapseCaptureInterval?: number;
    timelapseDisplayInterval?: number;
    dvrVideoType: string;
    dvrVideoTypeMainFrame?: string;
    dvrInitiatedMetadata?: any;
    driverCameraVideoResolution?: string;
    dvrVideoTypes?: DvrReqVideoType[];
  }) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.startTimeUTC = startTimeUTC;
    this.endTimeUTC = endTimeUTC;
    this.videoResolution = videoResolution;
    this.enableTimelapse = enabledTimelapse;
    this.timelapseCaptureInterval = timelapseCaptureInterval;
    this.timelapseDisplayInterval = timelapseDisplayInterval;
    this.dvrVideoType = dvrVideoType;
    this.dvrVideoTypeMainFrame = dvrVideoTypeMainFrame;
    this.dvrInitiatedMetadata = dvrInitiatedMetadata;
    this.driverCameraVideoResolution = driverCameraVideoResolution;
    if (!enabledTimelapse) {
      delete this.timelapseCaptureInterval;
      delete this.timelapseDisplayInterval;
    }
    if (dvrVideoType !== 'pictureInPicture') {
      delete this.dvrVideoTypeMainFrame;
    }
    if (dvrVideoTypes) {
      this.dvrVideoTypes = dvrVideoTypes;
      delete this.videoResolution;
    } else {
      delete this.dvrVideoTypes;
    }
  }
}
