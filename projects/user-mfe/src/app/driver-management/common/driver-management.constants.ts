export const ALL_DRIVER_FOR_FLEET_COLUMNS = ['accountStatus', 'driverImages', 'driverName', 'driverId', 'email', 'actions'];
export const ALL_DRIVER_FOR_FLEET_COLUMNS_USERTYPE_EMAIL_FALSE = ['driverImages', 'driverName', 'driverId', 'email', 'actions'];

export const PAGINATE_SIZES = [5, 10, 15, 20];

export const BOOKMARKED_VIDEOS_TABLE_COLUMNS = [
  'eventType',
  'coachingInitiatedBy',
  'coachingCompletedBy',
  'eventTime',
  'driverName',
  'status',
  'actions',
];

export const CHALLENGE_INCIDENTS_TABLE_COLUMNS = ['eventType', 'challengeResolvedBy', 'eventTime', 'driverName', 'status', 'actions'];

export const DRIVER_PANIC_BUTTON_TABLE_COLUMNS = ['requestTimestamp', 'assetId', 'actions'];

export const BOOKMARKED_PANIC_BUTTON_TABLE_COLUMNS = ['timestamp', 'driverName', 'actions', 'status'];

export const DRIVERID_INPUT_PATTERN = '^(?!.*[_-]{2,})[a-zA-Z0-9_-]*[a-zA-Z0-9][a-zA-Z0-9_-]*$';
