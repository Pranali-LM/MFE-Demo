export enum LivestreamUnitSystem {
  Metric = 'metric',
  Imperial = 'imperial',
}

export interface RequestLivestreamBody {
  deviceId?: string;
  tripId?: string;
  videoResolution?: string;
  videoType: string;
  videoTypeMainFrame?: string;
  unitSystem: LivestreamUnitSystem;
  collage?: string;
  resolution?: string;
  sources?: string[];
}

export interface RequestLivestreamResp {
  streamRequestId: string;
  streamSessionURL: string;
}

export interface RequestLivestreamConflict {
  message: string;
  conflictingRequestId: string;
}

export interface StopLivestreamBody {
  streamRequestId: string;
}

export interface StopLivestreamResp {
  message: string;
}

export interface ReviewLivestreamBody {
  streamRequestId: string;
}

export interface ReviewLivestreamResp {
  streamSessionURL: string;
}

export interface LivestreamDetailsBody {
  streamRequestId: string;
}

export enum LivestreamStatus {
  Pending = 'PENDING',
  Acknowledged = 'ACKNOWLEDGED',
  Started = 'STARTED',
  Unavailable = 'UNAVAILABLE',
  Failed = 'FAILED',
  Canceled = 'CANCELED',
  Finished = 'FINISHED',
}

export interface LivestreamDetailsResp {
  streamRequestId: string;
  fleetId: string;
  deviceId: string;
  status: LivestreamStatus;
  reason: string;
  startTimeUTC: string;
  endTimeUTC: string;
  views: number;
  timezoneOffset: number;
  stopNotificationTriggered: boolean;
  videoQuality: number;
  videoResolution: string;
  unitSystem: string;
  videoType: string;
  videoTypeMainFrame: string;
}
