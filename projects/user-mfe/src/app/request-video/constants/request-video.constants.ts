export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGlnaHRtZXRyaWNzIiwiYSI6ImNsZXIzNjJmeDBvZHIzd3AyZzRxeTlybXkifQ.bkvbQRH0c2P3chHj04cXeQ';

export const VIDEO_REQUEST_EVENTS_CONFIG = {
  'Traffic-Speed-Violated': {
    label: 'Speed Limit Violation',
    color: '#005dbb',
    showEvent: true,
  },
  Cornering: {
    label: 'Harsh Cornering',
    color: '#005dbb',
    showEvent: true,
  },
  'Traffic-STOP-Sign-Violated': {
    label: 'Stop Sign Violation',
    color: '#005dbb',
    showEvent: true,
  },
  'Harsh-Braking': {
    label: 'Harsh Braking',
    color: '#ff00ff',
    showEvent: true,
  },
  'Tail-Gating-Detected': {
    label: 'Tailgating',
    color: '#005dbb',
    showEvent: true,
  },
  'Harsh-Acceleration': {
    label: 'Harsh Acceleration',
    color: '#005dbb',
    showEvent: true,
  },
  'Lane-Drift-Found': {
    label: 'Lane Drift',
    color: '#005dbb',
    showEvent: true,
  },
  'Distracted-Driving': {
    label: 'Distracted Driving',
    color: '#005dbb',
    showEvent: true,
  },
  'Forward-Collision-Warning': {
    label: 'Forward Collision Warning',
    color: '#005dbb',
    showEvent: true,
  },
  'Drowsy-Driving-Detected': {
    label: 'Drowsy Driving',
    color: '#005dbb',
    showEvent: true,
  },
  'Roll-Over-Detected': {
    label: 'Rollover Detection',
    color: '#005dbb',
    showEvent: true,
  },
  'Unbuckled-Seat-Belt': {
    label: 'Seatbelt Violation',
    color: '#003f5c',
    showEvent: true,
  },
  'Traffic-Light-Violated': {
    label: 'Traffic Light Violation',
    color: '#005dbb',
    showEvent: true,
  },
};

export const MDVR_COLLAGE_CONFIG = [
  {
    collage: 'C1x1',
    validSources: 1,
    resolution: ['320x180', '640x360', '1280x720', '1920x1080'],
    liveStreamResolution: ['320x180', '640x360', '1280x720'],
    defaultResolution: '640x360',
  },
  {
    collage: 'C1x2',
    validSources: 2,
    resolution: ['640x180', '1280x360', '2560x720'],
    defaultResolution: '1280x360',
  },
  {
    collage: 'C3_1',
    validSources: 3,
    resolution: ['960x360', '1920x720'],
    defaultResolution: '960x360',
  },
  {
    collage: 'C2x2',
    validSources: 4,
    resolution: ['640x360', '1280x720', '2560x1440'],
    defaultResolution: '640x360',
  },
  {
    collage: 'C5_1',
    validSources: 5,
    resolution: ['1280x360', '2560x720'],
    defaultResolution: '1280x360',
  },
  {
    collage: 'C2x3',
    validSources: 6,
    resolution: ['960x360', '1920x720'],
    defaultResolution: '960x360',
  },
  {
    collage: 'C7_1',
    validSources: 7,
    resolution: ['1280x720', '2560x1440'],
    defaultResolution: '1280x720',
  },
];

export const MDVR_COLLAGE_SORTING_ARR = [
  'ROAD',
  'DRIVER',
  'UVC',
  'TVI1',
  'TVI2',
  'TVI3',
  'TVI4',
  'CONVOY_CH1',
  'CONVOY_CH2',
  'CONVOY_CH3',
  'CONVOY_CH4',
];
