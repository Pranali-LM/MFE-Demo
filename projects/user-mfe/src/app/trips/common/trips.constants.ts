export const Durations = [
  {
    title: 'Past 3 Days',
    days: 3,
  },
  {
    title: 'Past Week',
    days: 7,
  },
  {
    title: 'Past Month',
    days: 30,
  },
  {
    title: 'Past 3 Months',
    days: 90,
  },
];

// Trip table
export const TRIP_TABLE_COLUMNS = (customerName = '') => [
  'uploadStatus',
  'driverImage',
  'startTime',
  'startLocation',
  'endLocation',
  'driverName',
  'eventCount',
  'tripDistance',
  'tripDuration',
  ...(customerName === 'calamp' ? ['vehicleId'] : ['assetId']),
  'actions',
];
export const TRIPS_TABLE_PAGE_SIZE = 10;
export const DVR_INITIAL_STATUS = {
  pending: 0,
  finished: 0,
  failed: 0,
};
// active drivers table
export const DRIVER_TABLE_PAGE_SIZES = [10, 15, 20, 30];
export const DRIVER_TABLE_COLUMNS = ['driverId', 'driverName', 'eventsPer100Units', 'tripCount', 'tripDistance', 'tripDuration'];
