export const daysMapping = {
  week: 7,
  month: 30,
  quarter: 30 * 4,
  half: 30 * 6,
  year: 30 * 12,
};

export const SAFE_THRESHOLD = 10;

export const UNSAFE_THRESHOLD = 25;

export const MIN_DISTANCE = 100;

export const TRIP_LIST_TABLE_PAGE_SIZES = [10, 15, 20, 30];
export const TRIP_LIST_TABLE_COLUMNS = ['startTime', 'eventCount', 'tripDistance', 'tripDuration'];

export const VIDEO_LIST_TABLE_PAGE_SIZE = [5];
export const DVR_REQUEST_LIST_TABLE_COLUMNS = [
  'requestCreated',
  'requestedBy',
  'status',
  'startTime',
  'duration',
  'driverId',
  'assetId',
  'actions',
];

export const EDVR_REQUEST_LIST_TABLE_COLUMNS = ['requestType', 'requestCreated', 'status', 'driverId', 'assetId', 'actions'];
export const EXTERNAL_EVENTS_LIST_TABLE_COLUMNS = ['requestTimestamp', 'driverId', 'assetId', 'actions'];
export const BOOKMARKED_DVR_REQUEST_LIST_TABLE_COLUMNS = [
  'requestCreated',
  'startTime',
  'endTime',
  'driverId',
  'assetId',
  'actions',
  'status',
];
