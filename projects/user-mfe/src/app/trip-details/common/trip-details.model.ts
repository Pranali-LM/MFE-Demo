interface TripDetailsApiParam {
  tripId: string;
  driverId?: string;
  includeViolations?: boolean;
  includePathInfo?: boolean;
  includeCustomEvents?: boolean;
  includeUploadRequests?: boolean;
  includeInertialSensorData?: boolean;
  includeTripConfig?: boolean;
  includeFRResults?: boolean;
  includeDebugEvents?: boolean;
  excludeChallengeAcceptedViolations?: boolean;
  includePolylinePathInfo?: boolean;
}

export class GetTripDetailsParams {
  public tripId: string;
  public driverId: string;
  public includeViolations: boolean;
  public includePathInfo: boolean;
  public includeCustomEvents: boolean;
  public includeUploadRequests: boolean;
  public includeInertialSensorData?: boolean;
  public includeTripConfig?: boolean;
  public includeFRResults?: boolean;
  public includeDebugEvents?: boolean;
  public excludeChallengeAcceptedViolations?: boolean;
  public includePolylinePathInfo?: boolean;

  constructor({
    tripId = '',
    driverId = '',
    includeViolations = false,
    includePathInfo = false,
    includeCustomEvents = false,
    includeUploadRequests = false,
    includeInertialSensorData = false,
    includeTripConfig = false,
    includeFRResults = false,
    includeDebugEvents = false,
    excludeChallengeAcceptedViolations = false,
    includePolylinePathInfo = false,
  }: TripDetailsApiParam) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.includeViolations = includeViolations;
    this.includePathInfo = includePathInfo;
    this.includeCustomEvents = includeCustomEvents;
    this.includeUploadRequests = includeUploadRequests;
    this.includeInertialSensorData = includeInertialSensorData;
    this.includeTripConfig = includeTripConfig;
    this.includeFRResults = includeFRResults;
    this.includeDebugEvents = includeDebugEvents;
    this.excludeChallengeAcceptedViolations = excludeChallengeAcceptedViolations;
    this.includePolylinePathInfo = includePolylinePathInfo;
  }
}

export class GetEventDetailsParams {
  public tripId: string;
  public driverId: string;
  public eventIndex?: number;
  public includeInertialSensorData: boolean;

  constructor({ tripId = '', driverId = '', eventIndex = 0, includeInertialSensorData = false }) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.eventIndex = eventIndex;
    this.includeInertialSensorData = includeInertialSensorData;
  }
}

export class GetDvrDetailsParams {
  public tripId: string;
  public driverId: string;
  public uploadRequestId?: string;
  public includeInertialSensorData: boolean;

  constructor({ tripId = '', driverId = '', uploadRequestId = '', includeInertialSensorData = false }) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.uploadRequestId = uploadRequestId;
    this.includeInertialSensorData = includeInertialSensorData;
  }
}

export class GetEventListParams {
  public tripId: string;
  public driverId: string;
  public includeViolations: boolean;

  constructor({ tripId = '', driverId = '', includeViolations = false }) {
    this.tripId = tripId;
    this.driverId = driverId;
    this.includeViolations = includeViolations;
  }
}

export class CreateEdvrRequestBody {
  public tripId: string;
  public fleetId: string;
  public driverId: string;
  public eventIndex: number;
  public videoQuality: number;
  public videoResolution: string;

  constructor({ tripId, fleetId, driverId, eventIndex, videoQuality, videoResolution }) {
    this.tripId = tripId;
    this.fleetId = fleetId;
    this.driverId = driverId;
    this.eventIndex = eventIndex;
    this.videoQuality = videoQuality;
    this.videoResolution = videoResolution;
  }
}
