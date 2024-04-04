import { Breakpoints } from '@angular/cdk/layout';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { API } from '@app-core/constants/api.constants';
import { CLIENT_CONFIG } from '@config/config';
import { TripDetailsViewType } from '../models/access.model';
import { CognitoRegionType } from '@app-core/models/core.model';
import * as moment from 'moment';
import 'moment-timezone';
export interface Cache {
  url: string;
  expiry?: number;
}
export const APIS_TO_CACHE: Cache[] = [
  { url: API.SECURITY_QUESTIONS },
  { url: API.GET_DRIVER_STATS_V2 },
  { url: API.GET_DRIVER_TRIPS_V2 },
  { url: API.GET_TRIP_LIST_V2 },
  { url: API.GET_DRIVER_LIST_V2 },
  { url: API.GET_UNIQUE_DRIVERS_FOR_A_USER },
  { url: API.EVENT_DETAILS },
  { url: API.TRIP_DETAILS },

  { url: API.GET_FLEET_STATS },
  { url: API.GET_DRIVER_LIST },
  { url: API.GET_FLEET_EVENT_TREND },
  { url: API.GET_DRIVER_EVENT_TREND },
  { url: API.GET_SEVERE_VIOLATIONS },
  { url: API.GET_DVR_REQUESTS },
  { url: API.GET_EDVR_REQUESTS },
  { url: API.GET_ANNOUNCEMENTS },
  { url: API.GET_DRIVER_IMAGES },
  { url: API.GET_REGISTERED_DRIVERS },
  { url: API.GET_FLEET_ASSETS },
  { url: API.GET_VIOLATIONS },
  { url: API.GEO_JSON },
  { url: API.GET_EXTERNAL_EVENTS },
  { url: API.GET_ANNOUNCEMENTS },
  { url: API.GET_FLEET_CONFIGURATION },
  { url: API.REVERSE_GEOCODE },
  { url: API.GET_COACHING_INCIDENTS },
  { url: API.GET_CHALLENGED_INCIDENTS },
  { url: API.GET_FLEET_ASSETS },
  { url: API.EXPORT_ASSETS },
  { url: API.GET_IMPROVED_DRIVERS },
  { url: API.GET_FLEET_DEVICE_STATS },
  { url: API.GET_ARCHIVED_REPORTS },
  { url: API.GET_ARCHIVED_REPORTS_AGGREGATE },
  { url: API.GET_DRIVER_PERMISSIONS },
  { url: API.CHECK_DVR_AVAIBILITY },

  { url: API.LIST_COACHING_SESSION },
  { url: API.COACHING_RECPMMENDATIONS },

  { url: API.ASSET_PLANS },
  { url: API.DEVICE_MODEL_CONFIG },
  { url: API.GET_FLEET_CUSTOM_EVENT_CONFIGURATION },
  { url: API.GET_FLEET_EVENTS_CUSTOM_EVENTS },
  { url: API.GET_COACHING_CONFIG },

  { url: API.EULA_CONSENT },
];

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

export const ROUTER_LINK_PAGE_NAME_MAP = {
  '/home': 'Home',
  '/safety-events': 'Safety Events',
  '/trips': 'Trips',
  '/live-view': 'Live View',
  '/drivers': 'Drivers',
  '/drivers/coaching-session': 'Coaching Session',
  '/reports': 'Reports',
  '/reports/fleet-safety': 'Fleet Safety Report',
  '/assets': 'Assets',
  '/configurations': 'Configurations',
  '/trip-details': 'Trip Details',
  '/request-video': 'Request Video',
  '/coaching': 'Coaching',
  '/video-requests': 'Video Requests',
  '/challenges': 'Challenges',
  '/user-management': 'User Management',
};

export const INTERNAL_ROUTES = ['/trip-details', '/request-video', '/drivers/coaching-session'];

export const DURATION_LIST = [
  {
    title: 'Past 7 days',
    days: 7,
  },
  {
    title: 'Past 30 days',
    days: 30,
  },
  {
    title: 'Past 90 days',
    days: 30 * 3,
  },
  {
    title: 'Past 180 days',
    days: 30 * 6,
  },
];

export const REPORTS_DURATION_LIST = [
  {
    title: 'Past 30 days',
    days: 30,
  },
  {
    title: 'Past 90 days',
    days: 30 * 3,
  },
];

const localTimeZone = {
  key: 'Local',
  value: 'Local',
  timezoneOffset: 0,
  customLabel: 'Local',
};

export const SUPPORTED_TIMEZONES = [
  ...moment.tz.names().map((zone) => {
    const utcOffsetMinutes = moment.tz(zone).utcOffset();
    const hours = Math.abs(Math.floor(utcOffsetMinutes / 60));
    const minutes = Math.abs(utcOffsetMinutes % 60);
    const sign = utcOffsetMinutes >= 0 ? '+' : '-';

    const formattedUtcOffset = `UTC ${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const customLabel = `(${formattedUtcOffset}) ${zone}`;
    return {
      key: zone,
      value: zone,
      utcOffset: formattedUtcOffset,
      timezoneOffset: utcOffsetMinutes,
      customLabel: customLabel,
    };
  }),
  localTimeZone,
];

export const SUPPORTED_METRIC_UNITS = ['Miles', 'Kilometers'];

export const SUPPORTED_DATE_FORMATS = [
  {
    key: 'MM/DD/YYYY HH:mm:ss',
    value: 'MM/DD/YYYY',
  },
  {
    key: 'DD/MM/YYYY HH:mm:ss',
    value: 'DD/MM/YYYY',
  },
  {
    key: 'YYYY/MM/DD HH:mm:ss',
    value: 'YYYY/MM/DD',
  },
];

export const SUPPORTED_LANGUAGES = [
  {
    key: 'en',
    value: 'English - United States',
    country: 'United States',
    languageName: 'English',
  },
  {
    key: 'es',
    value: 'Español - España',
    country: 'Spain',
    languageName: 'Spanish',
  },
  {
    key: 'fr',
    value: 'Français - La France',
    country: 'France',
    languageName: 'French',
  },
  {
    key: 'pt',
    value: 'Português - Portugal',
    country: 'Portugal',
    languageName: 'Portuguese',
  },
  {
    key: 'pt-br',
    value: 'Português - Brasileiros',
    country: 'Brazil',
    languageName: 'Brazil',
  },
];

export const CSV_MIME_TYPE = [
  'text/plain',
  'text/x-csv',
  'application/vnd.ms-excel',
  'application/csv',
  'application/x-csv',
  'text/csv',
  'text/comma-separated-values',
  'text/x-comma-separated-values',
  'text/tab-separated-values',
];

export const PASSWORD_PATTERN = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{9,99}$';

export const LOGIN_INFO = 'LOGIN_INFO';

export const AUTH_INFO = 'AUTH_INFO';

export const FLEETMANAGER = 'fleetmanager';

export const TRIP_DETAILS_VIEW_TYPE_KEY = 'trip-details-view-type';

export const DEFAULT_TRIP_VIEW = TripDetailsViewType.table;

export const EVENT_MODAL_VIEW_TYPE_KEY = 'event-modal-view-type';

export const SHOW_EXTERNAL_EVENTS = true;

export const TIMEZONE_KEY = 'current-timezone';

export const DEFAULT_TIMEZONE = 'Local';

export const METRIC_UNIT_KEY = 'current-metric-unit';

export const DEFAULT_METRIC_UNIT = 'Miles';

export const DATE_FORMAT_KEY = 'current-date-format';

export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY HH:mm';

export const FLEET_KEY = 'current-fleet';

export const LANGUAGE_KEY = 'current-language';

export const DEFAULT_LANGUAGE = 'en';

export const THEME_KEY = 'current-theme';

export const DEFAULT_THEME = 'light';

export const MAX_DATE_RANGE_IN_MONTHS = 6;

export const COOKIES_CONSENT_KEY = 'current-cookies-consent';

export const DEFAULT_COOKIES_CONSENT = null;

/* eslint-disable-next-line max-len */
export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const NAME_REGEX = /^[a-z ,.'-]+$/i;

export const USER_MANAGEMENT_TABLE_COLUMNS = [
  'email',
  'name',
  'role',
  'accountStatus',
  'tags',
  'creationDate',
  // 'lastUpdatedOn',
  'lastUpdatedBy',
  'actions',
];

export const USER_COUNTRY_KEY = 'user-country';

export const AWS_COGNITO_REGION_KEY = 'aws-cognito-region';

export const US_CENTER_LAT_LNG = {
  latitude: 40.25,
  longitude: -74.5,
};

export const MAP_OPTIONS = {
  zoom: 3,
  coordinates: { lat: US_CENTER_LAT_LNG.latitude, lng: US_CENTER_LAT_LNG.longitude },
  zoomControl: false,
};

export const MAP_MARKER_ICON_OPTIONS = {
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconSize: [20, 30],
  iconAnchor: [10, 30],
};

export const MAP_CIRCLE_ICON_OPTIONS = {
  color: '#00ff00',
  fill: true,
  fillOpacity: 1,
  radius: 5,
};

export const EVENTS_CONFIG = {
  'Traffic-Speed-Violated': {
    label: 'Speed Limit Violation',
    color: '#00bfff',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
    childConfigs: {
      postedSpeed: {
        label: 'Posted Speed',
      },
      MaxSpeedExceeded: {
        label: 'Maximum Speed',
      },
    },
  },
  Cornering: {
    label: 'Harsh Cornering',
    color: '#8000ff',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Traffic-STOP-Sign-Violated': {
    label: 'Stop Sign Violation',
    color: '#b5651d',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Harsh-Braking': {
    label: 'Harsh Braking',
    color: '#ff00ff',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Tail-Gating-Detected': {
    label: 'Tailgating',
    color: '#F6BE00',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Harsh-Acceleration': {
    label: 'Harsh Acceleration',
    color: '#228B22',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Lane-Drift-Found': {
    label: 'Lane Drift',
    color: '#FFA500',
    showHighlights: false,
    showIncidentTrend: false,
    showIncidentSummary: false,
    showInFilter: false,
  },
  'Distracted-Driving': {
    label: 'Distracted Driving',
    color: '#e65000',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    isDriverFacing: true,
    showInFilter: true,
    childConfigs: {
      distractedDriving: {
        label: 'Head Pose Deviation',
      },
      'Lizard-Eye-Distracted-Driving': {
        label: 'Gaze Down Distraction',
      },
      'Smoking-Distracted-Driving': {
        label: 'Smoking Distraction',
      },
      'Drinking-Distracted-Driving': {
        label: 'Drinking Distraction',
      },
      'Texting-Distracted-Driving': {
        label: 'Texting Distraction',
      },
      'Cellphone-Distracted-Driving': {
        label: 'Cellphone Distraction',
      },
    },
  },
  'Forward-Collision-Warning': {
    label: 'Forward Collision Warning',
    color: '#000075',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Drowsy-Driving-Detected': {
    label: 'Drowsy Driving',
    color: '#d45087',
    showHighlights: true,
    showIncidentTrend: true,
    showIncidentSummary: true,
    isDriverFacing: true,
    showInFilter: true,
  },
  'Roll-Over-Detected': {
    label: 'Rollover Detection',
    color: '#f95d6a',
    showHighlights: false,
    showIncidentTrend: true,
    showIncidentSummary: true,
    showInFilter: true,
  },
  'Unbuckled-Seat-Belt': {
    label: 'Seatbelt Violation',
    color: '#003f5c',
    showHighlights: true,
    showIncidentTrend: true,
    showInFilter: true,
    isDriverFacing: true,
  },
  'Traffic-Light-Violated': {
    label: 'Traffic Light Violation',
    color: '#BA4A00',
    showHighlights: true,
    showIncidentTrend: true,
    showInFilter: true,
    showIncidentSummary: true,
  },
};

export const CONFIGS_WITH_SUBCONFIGS = {
  'Distracted-Driving': [
    'Lizard-Eye-Distracted-Driving',
    'Smoking-Distracted-Driving',
    'Drinking-Distracted-Driving',
    'Cellphone-Distracted-Driving',
    'Texting-Distracted-Driving',
  ],
  'Traffic-Speed-Violated': ['MaxSpeedExceeded'],
};

export const CUSTOMER_WITH_USER_PERMISSION_FEATURE = ['orbcomm'];

export const EVENT_SEVERITY_TYPE_LIST = {
  'Traffic-Speed-Violated': {
    severity: (event) => event.speedingValue,
    metricKey: 'speedingValue',
    high: 32,
    low: 16,
  },
  MaxSpeedExceeded: {
    severity: (event) => event.exceededSpeedingValue,
    metricKey: 'exceededSpeedingValue',
    high: 32,
    low: 16,
  },
  'Tail-Gating-Detected': {
    severity: (event) => event.tailgatingMetricValue,
    metricKey: 'tailgatingMetricValue',
    high: 1,
    low: 2,
  },
  'Traffic-STOP-Sign-Violated': {
    severity: (event) => event.lowestSpeedKmph,
    metricKey: 'lowestSpeedKmph',
    high: 24,
    low: 16,
  },
  'Harsh-Acceleration': {
    severity: (event) => event.harshAccelerationValue,
    metricKey: 'harshAccelerationValue',
    high: 3576,
    low: 2682,
  },
  'Harsh-Braking': {
    severity: (event) => event.harshBrakingAccelerationValue,
    metricKey: 'harshBrakingAccelerationValue',
    high: 3576,
    low: 2682,
  },
  Cornering: {
    severity: (event) => event.corneringAccelerationValue,
    metricKey: 'corneringAccelerationValue',
    high: 3576,
    low: 2682,
  },
  'Distracted-Driving': {
    severity: (event) => event.severity,
    metricKey: 'severity',
    high: 80,
    low: 60,
  },
  'Forward-Collision-Warning': {
    severity: (event) => event.forwardCollisionMetricValue,
    metricKey: 'forwardCollisionMetricValue',
    high: 1,
    low: 2,
  },
  'Drowsy-Driving-Detected': {
    severity: (event) => event.severity,
    metricKey: 'severity',
    high: 80,
    low: 60,
  },
  'Roll-Over-Detected': {
    severity: (event) => event.severity,
    metricKey: 'severity',
    high: 80,
    low: 60,
  },
  'Unbuckled-Seat-Belt': {
    severity: (event) => event.severity,
    metricKey: 'severity',
    high: 80,
    low: 60,
  },
  'Traffic-Light-Violated': {
    severity: (event) => event.severity,
    metricKey: 'severity',
    high: 80,
    low: 60,
  },
};

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

export const IMAGE_LIST = [
  {
    imageUrl: 'assets/common/fr-images/image1.png',
    isValid: true,
  },
  {
    imageUrl: 'assets/common/fr-images/image2.png',
    isValid: true,
  },
  {
    imageUrl: 'assets/common/fr-images/image3.png',
    isValid: true,
  },
  {
    imageUrl: 'assets/common/fr-images/image4.png',
    isValid: true,
  },
  {
    imageUrl: 'assets/common/fr-images/image5.png',
    isValid: true,
  },
  {
    imageUrl: 'assets/common/fr-images/image6.png',
    isValid: false,
  },
  {
    imageUrl: 'assets/common/fr-images/image7.png',
    isValid: false,
  },
  {
    imageUrl: 'assets/common/fr-images/image8.png',
    isValid: false,
  },
];

export const DVR_STATUS_LIST = {
  PENDING_FOR_REVIEW: {
    type: 'PENDING_FOR_REVIEW',
    description: '-',
  },
  PROCESSING: {
    type: 'PROCESSING',
    description: 'Video request is being processed and will be available soon.',
  },
  FAILED: {
    type: 'FAILED',
    description: 'Attempt to get the video failed. The device will retry.',
  },
  UNAVAILABLE: {
    type: 'UNAVAILABLE',
    description: 'Video no longer exists on the device - it has been overwritten.',
  },
  CANCELED: {
    type: 'CANCELED',
    description: 'Video request cannot be serviced. Contact your service provider.',
  },
  FINISHED: {
    type: 'FINISHED',
    description: 'Video has been fetched and is ready for viewing.',
  },
};

export const DVR_STATUS_TIMELINE_MAPPING = {
  NotificationReceived: {
    description: 'Notification received by the camera',
    type: 'success',
  },
  NotificationCancelled: {
    description: 'Notification sending cancelled',
    type: 'error',
  },
  MediaUnavailable: {
    description: 'Video unavailable',
    type: 'error',
  },
  MediaGenerationStarted: {
    description: 'Video processing started',
    type: 'success',
  },
  MediaGenerationFailed: {
    description: 'Video processing failed',
    type: 'error',
  },
  MediaGenerationSuccessful: {
    description: 'Video processing successful',
    type: 'success',
  },
  MediaUploadStarted: {
    description: 'Video upload started',
    type: 'success',
  },
  MediaUploadFailed: {
    description: 'Video upload failed',
    type: 'error',
  },
  MediaUploadCompleted: {
    description: 'Video upload completed, ready to view now',
    type: 'success',
  },
  // custom status added to inform users regarding more updates
  CustomStatusWaitingForNextUpdate: {
    description: 'Waiting for next status update',
    type: 'warn',
  },
};

export const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const EVENT_TAG_LIST = [
  {
    value: 'CELLPHONE',
    text: 'Cellphone',
  },
  {
    value: 'COLLISION',
    text: 'Collision',
  },
  {
    value: 'EATING_OR_DRINKING',
    text: 'Drinking/Eating',
  },
  {
    value: 'NO_SEATBELT',
    text: 'No seatbelt',
  },
  {
    value: 'SMOKING',
    text: 'Smoking',
  },
  {
    value: 'OTHER',
    text: 'Other',
  },
];

export const EVENT_TAG_KEYS = {
  CELLPHONE: 'Cellphone',
  COLLISION: 'Collision',
  EATING_OR_DRINKING: 'Drinking/Eating',
  NO_SEATBELT: 'No seatbelt',
  SMOKING: 'Smoking',
  OTHER: 'Other',
};

export const MEDIA_SOURCES_ENUM = {
  ROAD_FACING: 'Road facing',
  DRIVER_FACING: 'Driver facing',
  SIDE_BY_SIDE: 'Side-by-side',
  PIP_ROAD_MAJOR: 'PiP Road major',
  PIP_DRIVER_MAJOR: 'PiP Driver major',
};

// DVR
export const MININUM_DVR_DURATION_IN_SECONDS = 10;
export const MAXIMUM_DVR_DURATION_IN_SECONDS = 180;
export const SLIDER_TICK_STEP = 10;
export const DVR_RESOLUTION_OPTIONS = [
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
  {
    value: '1920x1080',
    text: '1920x1080',
  },
];
export const DVR_REQUEST_LEGENDS = [
  {
    color: '#be3d3b',
    label: 'Possible Collision',
  },
  {
    color: '#ff00ff',
    label: 'Harsh Braking',
  },
  {
    color: '#303030',
    label: 'Stopped',
  },
  {
    color: '#ff8c00',
    label: 'Video Request',
  },
  {
    color: '#005dbb',
    label: 'Safety Events',
  },
];
export const DVR_DURATION_OPTIONS = [
  {
    groupName: 'Standard Video',
    groupId: 'STANDARD',
    options: [
      {
        value: 60,
        text: '1',
        unit: 'minute',
      },
      {
        value: 120,
        text: '2',
        unit: 'minutes',
      },
      {
        value: 180,
        text: '3',
        unit: 'minutes',
      },
    ],
    showDivider: true,
  },
  {
    groupName: 'Time-lapse Video',
    groupId: 'TIMELAPSE',
    options: [
      {
        value: 300,
        text: '5',
        unit: 'minutes',
      },
      {
        value: 600,
        text: '10',
        unit: 'minutes',
      },
      {
        value: 900,
        text: '15',
        unit: 'minutes',
      },
      {
        value: 1800,
        text: '30',
        unit: 'minutes',
      },
      {
        value: 2700,
        text: '45',
        unit: 'minutes',
      },
      {
        value: 3600,
        text: '60',
        unit: 'minutes',
      },
    ],
  },
];
export const DEFAULT_DVR_DURATION = 60;
export const DEFAULT_DVR_RESOLUTION = '1280x720';
export const DEFAULT_VIDEO_FORMAT = 'sideBySide';
export const DEFAULT_PIP_FORMAT = 'road';

export const VIDEO_FORMATS = [
  {
    value: 'road',
    text: 'Road',
  },
  {
    value: 'driver',
    text: 'Driver',
  },
  {
    value: 'sideBySide',
    text: 'Side-by-side',
  },
  {
    value: 'pictureInPictureRoadSide',
    text: 'Picture-in-picture (Road Side)',
  },
  {
    value: 'pictureInPictureDriverSide',
    text: 'Picture-in-picture (Driver Side)',
  },
  {
    value: 'separate',
    text: 'Road + Driver',
  },
];

export const DVR_TYPE_LIST = [
  {
    label: 'DVR',
    value: 'dvr',
  },
  {
    label: 'Time-lapse DVR',
    value: 'timelapseDvr',
  },
];

export const VIDEO_TYPE_LIST = [
  {
    label: 'Video Requests',
    value: 'dvr',
  },
  {
    label: CLIENT_CONFIG.externalEventsLabel,
    value: 'externalEvents',
  },
  {
    label: 'Event On-Demand',
    value: 'edvr',
  },
];

export const INCIDENT_TYPE_LIST = [
  {
    label: 'Distracted Driving',
    value: 'Distracted-Driving',
    type: 'INCIDENT',
    childConfigs: {
      distractedDriving: {
        label: 'Head Pose Deviation',
      },
      'Lizard-Eye-Distracted-Driving': {
        label: 'Gaze Down Distraction',
      },
      'Smoking-Distracted-Driving': {
        label: 'Smoking Distraction',
      },
      'Drinking-Distracted-Driving': {
        label: 'Drinking Distraction',
      },
      'Texting-Distracted-Driving': {
        label: 'Texting Distraction',
      },
      'Cellphone-Distracted-Driving': {
        label: 'Cellphone Distraction',
      },
    },
  },
  {
    label: 'Drowsy Driving',
    value: 'Drowsy-Driving-Detected',
    type: 'INCIDENT',
  },
  {
    label: 'Forward Collision Warning',
    value: 'Forward-Collision-Warning',
    type: 'INCIDENT',
  },
  {
    label: 'Harsh Acceleration',
    value: 'Harsh-Acceleration',
    type: 'INCIDENT',
  },
  {
    label: 'Harsh Braking',
    value: 'Harsh-Braking',
    type: 'INCIDENT',
  },
  {
    label: 'Harsh Cornering',
    value: 'Cornering',
    type: 'INCIDENT',
  },
  {
    label: 'Lane Drift',
    value: 'Lane-Drift-Found',
    type: 'INCIDENT',
  },
  {
    label: 'Speed Limit Violation',
    value: 'Traffic-Speed-Violated',
    type: 'INCIDENT',
    childConfigs: {
      postedSpeed: {
        label: 'Posted Speed',
      },
      MaxSpeedExceeded: {
        label: 'Maximum Speed',
      },
    },
  },
  {
    label: 'Stop Sign Violation',
    value: 'Traffic-STOP-Sign-Violated',
    type: 'INCIDENT',
  },
  {
    label: 'Tailgating',
    value: 'Tail-Gating-Detected',
    type: 'INCIDENT',
  },
  {
    label: 'Rollover Detection',
    value: 'Roll-Over-Detected',
    type: 'INCIDENT',
  },
  {
    label: 'Seatbelt Violation',
    value: 'Unbuckled-Seat-Belt',
    type: 'INCIDENT',
  },
  {
    label: 'Traffic Light Violation',
    value: 'Traffic-Light-Violated',
    type: 'INCIDENT',
  },
  {
    label: 'DVR',
    value: 'dvr',
    type: 'DVR',
  },
  {
    label: CLIENT_CONFIG.externalEventsLabel,
    value: 'externalEvents',
    type: 'EXTERNAL',
  },
];

export const COACHING_STATUS_LIST = [
  {
    label: 'All',
    value: 'all',
    status: 'all',
  },
  {
    label: 'Pending',
    value: false,
    status: 'pending',
  },
  {
    label: 'Completed',
    value: true,
    status: 'completed',
  },
];

export const CHALLENGED_STATUS_LIST = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Pending', // status is 'raised'
    value: 'pending',
  },
  {
    label: 'Rejected',
    value: 'rejected',
  },
  {
    label: 'Accepted',
    value: 'accepted',
  },
];

export const VIDEO_REQUEST_PAGE_SIZE = 5;
export const COACHING_PANEL_PAGE_SIZE = 5;
export const CHALLENEGE_LIST_PAGE_SIZE = 5;
export const PANIC_BUTTON_LIST_PAGE_SIZE = 5;
export const TRIP_DETAILS_EVENT_LIST_PAGE_SIZE = 10;
export const LIVEVIEW_ASSET_LIST_PAGE_SIZE = 10;

// TIMELAPSE DVR
export const MININUM_TIMELAPSE_CAPTURE_INTERVAL = 0;
export const MAXIMUM_TIMELAPSE_CAPTURE_INTERVAL = 3600;
export const TIMELAPSE_CAPTURE_INTERVAL_TICK_STEP = 600;

export const MININUM_TIMELAPSE_DISPLAY_INTERVAL = 0.1;
export const MAXIMUM_TIMELAPSE_DISPLAY_INTERVAL = 10;

export const ASSET_MAP_MARKER_OPTIONS = {
  iconSize: [40, 50],
  popupAnchor: [0, -50],
  iconAnchor: [20, 50],
};

// LIVESTREAM
export const LIVESTREAM_VIDEO_RESOLUTIONS = ['320x180', '640x360', '1280x720'];
export const LIVESTREAM_DEFAULT_VIDEO_RESOLUTION = '320x180';
export const LIVESTREAM_DEFAULT_VIDEO_TYPE = 'road';
export const LIVESTREAM_DEFAULT_PIP_MAIN_FRAME = 'road';
export const LIVESTREAM_MODAL_CONFIG = {
  panelClass: ['livestream-modal'],
  backdropClass: 'livestream-modal-backdrop',
  position: { bottom: '0px', right: '0px' },
  disableClose: true,
};

export const BREAKPOINTS_XSMALL = [Breakpoints.XSmall];
export const BREAKPOINTS_SMALL = [Breakpoints.Small, Breakpoints.XSmall];
export const BREAKPOINTS_MEDIUM = [Breakpoints.Medium];
export const BREAKPOINTS_LARGE = [Breakpoints.Large, Breakpoints.XLarge];
export const BREAKPOINTS_LANDSCAPE = [Breakpoints.HandsetLandscape];
export const BREAKPOINTS_PORTRAIT = [Breakpoints.HandsetPortrait];

export const AWS_DOMAIN = 'amazonaws.com';
export const ARCGIS_DOMAIN = 'geocode.arcgis.com';

export const LOGOUT_TIME_DURATION_IN_SECS = 10;

export const AUTO_TAGS_LIST = {
  CELLPHONE: 'Cellphone',
  MAX_SPEED: 'Max. Speed',
  LIZARD_EYE: 'Gaze down',
  SMOKING: 'Smoking',
  DRINKING: 'Drinking',
  TEXTING: 'Texting',
  WORK_ZONE: 'Workzone (BETA)',
};

export const MAPBOX_DEFAULT_LAYER = 'streets-v12';

export const MILES_TO_KILOMETERS_CONVERSION = 1.609;

export const DEFAULT_FONT_FAMILY = `Barlow, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`;
export const DEFAULT_LIGHT_THEME_TEXT_COLOR = '#333333';
export const DEFAULT_DARK_THEME_TEXT_COLOR = '#EEEEEE';
export const DEFAULT_LIGHT_THEME_BORDER_COLOR = '#EEEEEE';
export const DEFAULT_DARK_THEME_BORDER_COLOR = '#666666';

export const INCIDENT_SUMMARY_CHART_OPTIONS = {
  type: 'pie',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          pointStyle: 'circle',
          usePointStyle: true,
          color: DEFAULT_LIGHT_THEME_TEXT_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets[0].data.map((data, i) => ({
              text: `${chart.data.labels[i]} ${data} %`,
              fillStyle: datasets[0].backgroundColor[i],
              index: i,
              fontColor: DEFAULT_LIGHT_THEME_TEXT_COLOR,
            }));
          },
        },
      },
      tooltip: {
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        cornerRadius: 4,
        usePointStyle: true,
        bodyFont: {
          family: DEFAULT_FONT_FAMILY,
        },
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} %`;
          },
        },
      },
    },
  },
};

export const INCIDENT_TREND_CHART_OPTIONS = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        offset: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Incidents / 100 (mi/km)',
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
        },
        ticks: {
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
          precision: 0,
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      spanGaps: true,
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          pointStyle: 'circle',
          usePointStyle: true,
          color: DEFAULT_LIGHT_THEME_TEXT_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
      tooltip: {
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        cornerRadius: 4,
        usePointStyle: true,
        bodyFont: {
          family: DEFAULT_FONT_FAMILY,
        },
      },
    },
  },
};

export const REPORT_INCIDENT_SUMMARY_CHART_OPTIONS = {
  type: 'bar',
  options: {
    layout: {
      padding: {
        top: 30,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        offset: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Incidents Count',
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
        },
        ticks: {
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (_val, context) => `${context.dataset.diffPercentage[context.dataIndex]}%`,
        color: DEFAULT_LIGHT_THEME_TEXT_COLOR,
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          pointStyle: 'circle',
          usePointStyle: true,
          color: DEFAULT_LIGHT_THEME_TEXT_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
      tooltip: {
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        cornerRadius: 4,
        usePointStyle: true,
        bodyFont: {
          family: DEFAULT_FONT_FAMILY,
        },
      },
    },
  },
};

export const SENSOR_PROFILE_CHART_ANNOTATION = {
  type: 'line',
  borderColor: 'red',
  borderDash: [10, 10],
  borderDashOffset: 0,
  borderWidth: 2,
};

export const SENSOR_PROFILE_CHART_OPTIONS = {
  type: 'line',
  options: {
    responsive: true,
    spanGaps: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        offset: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Acceleration (g)',
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
        },
        ticks: {
          stepSize: 0.1,
          color: DEFAULT_LIGHT_THEME_BORDER_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
          callback: (label) => {
            return label;
          },
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      spanGaps: true,
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          pointStyle: 'circle',
          usePointStyle: true,
          color: DEFAULT_LIGHT_THEME_TEXT_COLOR,
          font: {
            family: DEFAULT_FONT_FAMILY,
          },
        },
      },
      tooltip: {
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        cornerRadius: 4,
        usePointStyle: true,
        bodyFont: {
          family: DEFAULT_FONT_FAMILY,
        },
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
          },
        },
      },
    },
  },
};

export const DEVICE_GPS_UPDATE_TIMER_MIN = 3;

export const PORTAL_FAQ_MAPPING = {
  fleetHighlights: {
    faqId: 'FLEET_HIGHLIGHTS',
    faqVersion: 'v1',
  },
  topDrivers: {
    faqId: 'TOP_DRIVERS',
    faqVersion: 'v1',
  },
  requireCoaching: {
    faqId: 'REQUIRE_COACHING',
    faqVersion: 'v1',
  },
  incidentSummary: {
    faqId: 'INCIDENT_SUMMARY',
    faqVersion: 'v1',
  },
  incidentTrend: {
    faqId: 'INCIDENT_TREND',
    faqVersion: 'v1',
  },
  tripList: {
    faqId: 'TRIP_LIST',
    faqVersion: 'v1',
  },
  activeDrivers: {
    faqId: 'ACTIVE_DRIVERS',
    faqVersion: 'v1',
  },
  videoRequests: {
    faqId: 'VIDEO_REQUESTS',
    faqVersion: 'v1',
  },
  coachingPanel: {
    faqId: 'COACHING_PANEL',
    faqVersion: 'v1',
  },
  challengedIncidents: {
    faqId: 'CHALLENGED_INCIDENTS',
    faqVersion: 'v1',
  },
  driverHighlights: {
    faqId: 'DRIVER_HIGHLIGHTS',
    faqVersion: 'v1',
  },
  driverIncidentSummary: {
    faqId: 'DRIVER_INCIDENT_SUMMARY',
    faqVersion: 'v1',
  },
  driverIncidentTrend: {
    faqId: 'DRIVER_INCIDENT_TREND',
    faqVersion: 'v1',
  },
  driverList: {
    faqId: 'DRIVER_LIST',
    faqVersion: 'v1',
  },
  archivedReports: {
    faqId: 'ARCHIVED_REPORTS',
    faqVersion: 'v1',
  },
  mostImproved: {
    faqId: 'MOST_IMPROVED',
    faqVersion: 'v1',
  },
  assetList: {
    faqId: 'ASSET_LIST',
    faqVersion: 'v1',
  },
  basicConfigurations: {
    faqId: 'BASIC_CONFIGURATIONS',
    faqVersion: 'v1',
  },
  advancedConfigurations: {
    faqId: 'ADVANCED_CONFIGURATIONS',
    faqVersion: 'v1',
  },
  incidentsView: {
    faqId: 'INCIDENT_VIEW',
    faqVersion: 'v1',
  },
  recommendedIncidents: {
    faqId: 'RECOMMENDED_INCIDENTS',
    faqVersion: 'v1',
  },
  driverConfigurations: {
    faqId: 'DRIVER_CONFIGURATIONS',
    faqVersion: 'v1',
  },
  CoachableDrivers: {
    faqId: 'COACHABLE_DRIVERS',
    faqVersion: 'v1',
  },
  CompletedCoachingSessions: {
    faqId: 'COMPLETED_COACHING_SESSION',
    faqVersion: 'v1',
  },
  CoachingThresholds: {
    faqId: 'COACHING_THERSHOLDS',
    faqVersion: 'v1',
  },
  TaggingOverview: {
    faqId: 'TAGGING_OVERVIEW',
    faqVersion: 'v1',
  },
  AttributeList: {
    faqId: 'ATTRIBUTES_LIST',
    faqVersion: 'v1',
  },
  TagsList: {
    faqId: 'TAGS_LIST',
    faqVersion: 'v1',
  },
  EntityList: {
    faqId: 'ENTITY_LIST',
    faqVersion: 'v1',
  },
  ManageRoles: {
    faqId: 'MANAGE_ROLES',
    faqVersion: 'v1',
  },
  ManageUsers: {
    faqId: 'MANAGE_USERS',
    faqVersion: 'v1',
  },
  SemiProvisionedDevices: {
    faqId: 'SEMI_PROVISIONED_DEVICES',
    faqVersion: 'v1',
  },
};

export const PORTAL_CONFIG_FAQ_MAPPING = {
  'Harsh Acceleration': {
    faqId: 'HARSH_ACCELERATION',
    faqVersion: 'v1',
  },
  'Harsh Braking': {
    faqId: 'HARSH_BREAKING',
    faqVersion: 'v1',
  },
  'Harsh Cornering': {
    faqId: 'HARSH_CORNERING',
    faqVersion: 'v1',
  },
  'Speed Limit Violation': {
    faqId: 'SPEEDLIMIT_VIOLATION',
    faqVersion: 'v1',
  },
  'Posted Speed': {
    faqId: 'POSTED_SPEED',
    faqVersion: 'v1',
  },
  'Maximum Speed': {
    faqId: 'MAXIMUM_SPEED',
    faqVersion: 'v1',
  },
  'Lane Drift': {
    faqId: 'LANE_DRIFT',
    faqVersion: 'v1',
  },
  Tailgating: {
    faqId: 'TAILGATING',
    faqVersion: 'v1',
  },
  'Stop Sign Violation': {
    faqId: 'STOP_SIGN_VIOLATION',
    faqVersion: 'v1',
  },
  'Distracted Driving': {
    faqId: 'DISTRACTED_DRIVING',
    faqVersion: 'v1',
  },
  'Head Pose Deviation': {
    faqId: 'HEAD_POSE_DEVIATION',
    faqVersion: 'v1',
  },
  'Gaze Down Distraction': {
    faqId: 'GAZE_DOWN_DISTRACTION',
    faqVersion: 'v1',
  },
  'Smoking Distraction': {
    faqId: 'SMOKING_DISTRACTION',
    faqVersion: 'v1',
  },
  'Drinking Distraction': {
    faqId: 'DRINKING_DISTRACTION',
    faqVersion: 'v1',
  },
  'Texting Distraction': {
    faqId: 'TEXTING_DISTRACTION',
    faqVersion: 'v1',
  },
  'Cellphone Distraction': {
    faqId: 'CELLPHONE_DISTRACTION',
    faqVersion: 'v1',
  },
  'Forward Collision Warning': {
    faqId: 'FORWARD_COLLISION',
    faqVersion: 'v1',
  },
  'Drowsy Driving': {
    faqId: 'DROWSY_DRIVING',
    faqVersion: 'v1',
  },
  'Seatbelt Violation': {
    faqId: 'SEATBELT_VIOLATION',
    faqVersion: 'v1',
  },
  'Traffic Light Violation': {
    faqId: 'TRAFFIC_LIGHT_VIOLATION',
    faqVersion: 'v1',
  },
  'Rollover Detection': {
    faqId: 'ROLLOVER_DETECTION',
    faqVersion: 'v1',
  },
  Device: {
    faqId: 'DEVICE',
    faqVersion: 'v1',
  },
  Location: {
    faqId: 'LOCATION',
    faqVersion: 'v1',
  },
  Other: {
    faqId: 'OTHER',
    faqVersion: 'v1',
  },
};

export const COGNITO_REGIONS_MAPPING: { [key: string]: CognitoRegionType[] } = {
  'us-east-1': [
    { label: 'USA', value: 'USA' },
    { label: 'Canada', value: 'CAN' },
    { label: 'LATAM', value: 'LATAM' },
    { label: 'Africa', value: 'AFRICA' },
    { label: 'Other', value: 'OTHER' },
  ],
  'ap-southeast-2': [{ label: 'Australia', value: 'AUS' }],
  'eu-central-1': [{ label: 'EU', value: 'EU' }],
  'eu-west-2': [{ label: 'UK', value: 'UK' }],
  'me-south-1': [{ label: 'Middle East', value: 'ME' }],
  'ap-south-1': [{ label: 'India', value: 'IND' }],
};

export const FEATURE_ANNOUNCEMENT_LIST = [
  {
    featureImage: 'assets/common/feature1-fp.svg',
    featureName: 'Cellphone Distraction Configurations',
    featureDescriptionList: [
      {
        description: 'Support for configurations related to cellphone distraction has been added for better safety event settings.',
      },
    ],
  },
  {
    featureImage: 'assets/common/feature2-fp.svg',
    featureName: 'Driver-initiated Video Requests',
    featureDescriptionList: [
      {
        description: 'Easily request video for viewing driver-initiated video requests raised from the companion app.',
      },
      {
        description: 'Please note this feature is only applicable to fleets using the companion app.',
      },
    ],
  },
];

// increment the version number when showing new feature announcement
export const FEATURE_ANNOUNCEMENT_VERSION = 'feature-announcement-v9';

export const PORTAL_RELEASE_VERSION = 'v9.5.0';

export const ENTITIES = {
  trip: {
    key: 'trip',
    label: 'Trip',
  },
  event: {
    key: 'event',
    label: 'Event',
  },
  driver: {
    key: 'driver',
    label: 'Driver',
  },
  asset: {
    key: 'asset',
    label: 'Asset',
  },
};

export const COOKIE_CONSENT_EXPIRES = 180 * 24 * 60 * 60 * 1000;

export const DELETE_COOKIES_START_TIME = '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';

export const DO_NOT_DELETE_LIST = ['LOGIN_INFO', 'current-cookies-consent', 'feature-announcement-v', 'current-fleet'];
export const MANAGE_USERS_TABLE_COLUMNS = ['email', 'name', 'role', 'status', 'fleets', 'creationDate', 'actions'];
export const MANAGE_ROLES_TABLE_COLUMNS = [
  'name',
  'level',
  'attributes',
  'createdOn',
  'createdBy',
  'lastUpdatedOn',
  'lastUpdatedBy',
  'status',
  'actions',
];

export const speedSignTagFilter = [
  {
    key: 'Work',
    label: 'Workzone (BETA)',
  },
];

export enum speedSignTag {
  Work = 'Work',
  School = 'School',
}

export const FLEETMANAGER_MAX_COMMENT = 10;
