export const PAGINATE_SIZES = [10, 15, 20, 30];

export const STATISTICS_TABLE_COLUMNS = ['year', 'distance', 'duration'];

export const RECENT_TRIP_TABLE_COLUMNS = ['tripID', 'driverID', 'startTime', 'User', 'tripDistance'];

export const VIOLATION_LIST = [
  'Traffic-Speed-Violated',
  'Cornering',
  'Traffic-STOP-Sign-Violated',
  'Harsh-Braking',
  'Tail-Gating-Detected',
  'Harsh-Acceleration',
  'Lane-Drift-Found',
  'Tail-Gating-Voice-Notification',
  'Lane-Departure-Found',
  'Traffic-Speed-Sign_0',
  'Speed-Bump',
  'Traffic-STOP-Sign',
  'DASH_CAM_WIFI_CONNECTION_LOST',
  'CONNECTED_TO_DASH_CAM_WIFI',
  'Idling',
  'Anomaly',
  'binFile',
  'WIFI_CONNECTION_ATTEMPT_END',
  'ERROR_FOUND_EVENT',
];

// Driver analytics
export const INCIDENTS_TABLE_COLUMNS = ['tripID'];

// Trip Details
export const TRIP_EVENTS_TABLE_COLUMNS = ['eventType', 'timestamp'];

export const ACC_METER_PROFILE_CHART_OPTIONS = {
  title: {
    text: null,
  },
  yAxis: {
    title: {
      text: 'Acceleration (g)',
    },
    tickInterval: 0.1,
    min: -0.5,
    max: 0.5,
    plotLines: [],
  },
  xAxis: {
    type: 'category',
    categories: [],
    labels: {
      enabled: false,
    },
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false,
      },
    },
  },
  chart: {
    marginTop: 30,
  },
  series: [],
  credits: {
    enabled: false,
  },
};

// EDVR
export const EDVR_RESOLUTION_OPTIONS = [
  {
    value: '320x180',
    text: '320x180',
  },
  {
    value: '640x360',
    text: '640x360',
  },
  {
    value: '1280x720',
    text: '1280x720',
  },
];
export const DEFAULT_EDVR_RESOLUTION = '1280x720';
export const DEFAULT_VIDEO_QUALITY = 10;
