import { FormGroup } from '@angular/forms';

export const MIN_PRE_EVENT_VIDEO_DURATION = 5;
export const MAX_PRE_EVENT_VIDEO_DURATION = 9;

export const MIN_POST_EVENT_VIDEO_DURATION = 2;
export const MAX_POST_EVENT_VIDEO_DURATION = 50;

export const MIN_VIDEO_QUALITY = 0;
export const MAX_VIDEO_QUALITY = 10;

export const MIN_TG_TIME_THRESHOLD = 10;
export const MAX_TG_TIME_THRESHOLD = 30;

export const MIN_TG_TTC_THRESHOLD = 0.25;
export const MAX_TG_TTC_THRESHOLD = 3;

export const MIN_FCW_TTC_THRESHOLD = 0.25;
export const MAX_FCW_TTC_THRESHOLD = 3;

export const MIN_UPPER_SPEED_LIMIT = 0;
export const MAX_UPPER_SPEED_LIMIT = 150;

export const MIN_MINIMUM_SPEED_LIMIT = 0;
export const MAX_MINIMUM_SPEED_LIMIT = 50;

export const MIN_SPEED_LIMIT = 1;
export const MAX_SPEED_LIMIT = 40;

export const MIN_PITCH_DISTRACTION_DURATION = 2;
export const MAX_PITCH_DISTRACTION_DURATION = 15;

export const MIN_YAW_DISTRACTION_DURATION = 3;
export const MAX_YAW_DISTRACTION_DURATION = 15;

export const MIN_SHORT_PITCH_DISTRACTION_DURATION = 3;
export const MAX_SHORT_PITCH_DISTRACTION_DURATION = 10;

export const MIN_EYE_CLOSURE_DURATION_LIZARD_EYE = 3;
export const MAX_EYE_CLOSURE_DURATION_LIZARD_EYE = 20;

export const MIN_EYE_CLOSURE_DURATION_DROWSY_DRIVING = 1;
export const MAX_EYE_CLOSURE_DURATION_DROWSY_DRIVING = 10;

export const MIN_LANE_DEPARTURE_DURATION = 2;
export const MAX_LANE_DEPARTURE_DURATION = 15;

export const MIN_CELLPHONE_DURATION = 3;
export const MAX_CELLPHONE_DURATION = 10;

export const DRIVER_CONFIGURATION_TABLE_COLUMNS = ['driverId', 'driverName', 'actions'];

const NOTIFICATION_LANGUAGE_LIST = [
  { key: 'en-US', value: 'English (US)' },
  { key: 'en-GB', value: 'English (Great Britain)' },
  { key: 'en-AU', value: 'English (Australia)' },
  { key: 'en-CA', value: 'English (Canada)' },
  { key: 'es-ES', value: 'Spanish' },
  { key: 'fr-FR', value: 'French (France)' },
  { key: 'fr-CA', value: 'French (Canada)' },
  { key: 'pt-PT', value: 'Portuguese (Portugal)' },
  { key: 'pt-BR', value: 'Portuguese (Brazil)' },
];

export const inheritConfigsMapping: {
  [key: string]: { key: string; condition?: (v: any) => boolean; key2?: string; key3?: string; key4?: string; key5?: string };
} = {
  postEventVideoDurationSpeeding: {
    key: 'postEventVideoDurationMaxSpeed',
    condition: (value) => value >= MIN_POST_EVENT_VIDEO_DURATION && value <= MAX_POST_EVENT_VIDEO_DURATION,
  },
  eventVideoQualitySpeeding: {
    key: 'eventVideoQualityMaxSpeed',
  },
  eventVideoDriverCameraQualitySpeeding: {
    key: 'eventVideoDriverCameraQualityMaxSpeed',
  },
  eventVideoResolutionSpeeding: {
    key: 'eventVideoResolutionMaxSpeed',
  },
  eventVideoDriverCameraResolutionSpeeding: {
    key: 'eventVideoDriverCameraResolutionMaxSpeed',
  },
  speedingEventVideoType: {
    key: 'maxSpeedEventVideoType',
  },
  eventMediaTypeSpeeding: {
    key: 'eventMediaTypeMaxSpeed',
  },
  speedingEDVREnabled: {
    key: 'maxSpeedEDVREnabled',
  },
  laneDriftEnabled: {
    key: 'laneDepartureEnabled',
    condition: (value: boolean) => value === false,
  },
  preEventVideoDurationDistractedDriving: {
    key: 'preEventVideoDurationCellphoneDistraction',
    key2: 'preEventVideoDurationLizardEyeDistraction',
    key3: 'preEventVideoDurationSmokingDistraction',
    key4: 'preEventVideoDurationDrinkingDistraction',
    key5: 'preEventVideoDurationTextingDistraction',
  },
  postEventVideoDurationDistractedDriving: {
    key: 'postEventVideoDurationCellphoneDistraction',
    key2: 'postEventVideoDurationLizardEyeDistraction',
    key3: 'postEventVideoDurationSmokingDistraction',
    key4: 'postEventVideoDurationDrinkingDistraction',
    key5: 'postEventVideoDurationTextingDistraction',
  },
  eventVideoQualityDistractedDriving: {
    key: 'eventVideoQualityCellphoneDistraction',
    key2: 'eventVideoQualityLizardEyeDistraction',
    key3: 'eventVideoQualitySmokingDistraction',
    key4: 'eventVideoQualityDrinkingDistraction',
    key5: 'eventVideoQualityTextingDistraction',
  },
  eventVideoDriverCameraQualityDistractedDriving: {
    key: 'eventVideoDriverCameraQualityCellphoneDistraction',
    key2: 'eventVideoDriverCameraQualityLizardEyeDistraction',
    key3: 'eventVideoDriverCameraQualitySmokingDistraction',
    key4: 'eventVideoDriverCameraQualityDrinkingDistraction',
    key5: 'eventVideoDriverCameraQualityTextingDistraction',
  },
  eventVideoResolutionDistractedDriving: {
    key: 'eventVideoResolutionCellphoneDistraction',
    key2: 'eventVideoResolutionLizardEyeDistraction',
    key3: 'eventVideoResolutionSmokingDistraction',
    key4: 'eventVideoResolutionDrinkingDistraction',
    key5: 'eventVideoResolutionTextingDistraction',
  },
  eventVideoDriverCameraResolutionDistractedDriving: {
    key: 'eventVideoDriverCameraResolutionCellphoneDistraction',
    key2: 'eventVideoDriverCameraResolutionLizardEyeDistraction',
    key3: 'eventVideoDriverCameraResolutionSmokingDistraction',
    key4: 'eventVideoDriverCameraResolutionDrinkingDistraction',
    key5: 'eventVideoDriverCameraResolutionTextingDistraction',
  },
  distractedDrivingEventVideoType: {
    key: 'cellphoneDistractionEventVideoType',
    key2: 'lizardEyeDistractionEventVideoType',
    key3: 'smokingDistractionEventVideoType',
    key4: 'drinkingDistractionEventVideoType',
    key5: 'textingDistractionEventVideoType',
  },
  distractedDrivingEDVREnabled: {
    key: 'cellphoneDistractionEDVREnabled',
    key2: 'lizardEyeDistractionEDVREnabled',
    key3: 'smokingDistractionEDVREnabled',
    key4: 'drinkingDistractionEDVREnabled',
    key5: 'textingDistractionEDVREnabled',
  },
  captureMediaOnEventDistractedDriving: {
    key: 'captureMediaOnEventCellphoneDistraction',
    key2: 'captureMediaOnEventLizardEyeDistraction',
    key3: 'captureMediaOnEventSmokingDistraction',
    key4: 'captureMediaOnEventDrinkingDistraction',
    key5: 'captureMediaOnEventTextingDistraction',
  },
};

const MIN_DEVICE_VOLUME = 0;
const MAX_DEVICE_VOLUME = 15;

const MIN_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS = 5;
const MAX_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS = 60;

const VIDEO_RESOLUTION_OPTIONS = [
  {
    key: '320x180',
    value: '320x180',
  },
  {
    key: '640x360',
    value: '640x360',
  },
  {
    key: '1280x720',
    value: '1280x720',
  },
  {
    key: '1920x1080',
    value: '1920x1080',
  },
];

const eventsEnableConfig = {
  controlType: 'toggle',
};

const getCommonThresholdConfig = (customerName = '') => {
  const commonThresholds = [
    {
      key: 4.5,
      value: 'Low 4.5 mph/sec',
      metricValue: 'Low 7.2 kmph/sec (4.5 mph/sec)',
    },
    {
      key: 6.0,
      value: 'Medium 6.0 mph/sec',
      metricValue: 'Medium 9.6 kmph/sec (6.0 mph/sec)',
    },
    {
      key: 8.0,
      value: 'High 8.0 mph/sec',
      metricValue: 'High 12.8 kmph/sec (8.0 mph/sec)',
    },
  ];
  switch (customerName) {
    case 'fleetcomplete':
      return {
        controlType: 'dropdown',
        options: [
          {
            key: 3.0,
            value: 'Lowest 3.0 mph/sec',
          },
          ...commonThresholds,
        ],
      };

    default:
      return {
        controlType: 'dropdown',
        options: [...commonThresholds],
        isUnitConversionRequired: true,
      };
  }
};

const speedingAllowanceConfig = {
  controlType: 'textbox',
  min: MIN_UPPER_SPEED_LIMIT,
  max: MAX_UPPER_SPEED_LIMIT,
  placeholder: 'Speed Over Limit (mph)',
  type: 'number',
  required: true,
  conversionFormula: 1.609,
  isUnitConversionRequired: true,
  conversionUnit: 'kmph',
  showTooltip: true,
  allowFloat: true,
  tooltipTextList: [
    'Recommended values:',
    'Low: 5 mph (8 kmph) over limit',
    'Medium: 10 mph (16 kmph) over limit',
    'High: 15 mph (24.1 kmph) over limit',
  ],
};

const speedUpperLimitConfig = {
  controlType: 'textbox',
  min: MIN_UPPER_SPEED_LIMIT,
  max: MAX_UPPER_SPEED_LIMIT,
  placeholder: 'Max. Speed Limit (mph)',
  type: 'number',
  required: true,
  conversionFormula: 1.609,
  isUnitConversionRequired: true,
  conversionUnit: 'kmph',
};

const captureMediaConfig = {
  controlType: 'toggle',
  placeholder: 'Media ON/OFF',
};

const edvrConfig = {
  controlType: 'toggle',
  placeholder: 'Event On-Demand',
  tooltip: 'Event On-Demand',
};

const videoResolutionConfig = {
  controlType: 'dropdown',
  placeholder: 'Video Resolution',
  options: VIDEO_RESOLUTION_OPTIONS,
};

const mediaResolutionConfig = {
  controlType: 'dropdown',
  placeholder: 'Media Resolution',
  options: VIDEO_RESOLUTION_OPTIONS,
};

const videoTypeConfig = {
  controlType: 'dropdown',
  placeholder: 'Video Format',
  options: [
    {
      key: 'road',
      value: 'Road',
    },
    {
      key: 'driver',
      value: 'Driver',
    },
    {
      key: 'sideBySide',
      value: 'Side-by-Side',
    },
    {
      key: 'pictureInPicture',
      value: 'Picture-in-picture',
    },
    {
      key: 'separate',
      value: 'Road + Driver',
    },
  ],
};

const mediaFormat = {
  controlType: 'dropdown',
  placeholder: 'Media Format',
  options: [
    {
      key: 'road',
      value: 'Road',
    },
    {
      key: 'driver',
      value: 'Driver',
    },
    {
      key: 'sideBySide',
      value: 'Side-by-Side',
    },
    {
      key: 'pictureInPicture',
      value: 'Picture-in-picture',
    },
    {
      key: 'separate',
      value: 'Road + Driver',
    },
  ],
};

const mediaFrameConfig = {
  controlType: 'dropdown',
  placeholder: 'Media Frame',
  options: [
    {
      key: 'road',
      value: 'Road',
    },
    {
      key: 'driver',
      value: 'Driver',
    },
    {
      key: 'sideBySide',
      value: 'Side-by-Side',
    },
    {
      key: 'pictureInPicture',
      value: 'Picture-in-picture',
    },
    {
      key: 'separate',
      value: 'Road + Driver',
    },
  ],
};

const eventMediaTypeConfig = {
  controlType: 'dropdown',
  placeholder: 'Media Type',
  options: [
    {
      key: 'video',
      value: 'Video',
    },
    {
      key: 'image',
      value: 'Image',
    },
  ],
};

const dvrConfig = {
  controlType: 'toggle',
  placeholder: 'Video On-Demand',
  tooltip: 'Video On-Demand',
};
const eventEnabledConfig = {
  controlType: 'toggle',
};
const INSCRIPTION_UNIT_SYSTEM_CONFIG = [
  {
    key: 'imperial',
    value: 'Imperial',
  },
  {
    key: 'metric',
    value: 'Metric',
  },
];
const inscriptionUnitSystemConfig = {
  controlType: 'dropdown',
  placeholder: 'Media Inscription Unit System',
  options: INSCRIPTION_UNIT_SYSTEM_CONFIG,
};

const preEventDurationConfig = {
  controlType: 'textbox',
  min: MIN_PRE_EVENT_VIDEO_DURATION,
  max: MAX_PRE_EVENT_VIDEO_DURATION,
  type: 'number',
  placeholder: 'Pre-event Video Duration (sec)',
  required: true,
};

const preEventDurationConfigCustom = {
  controlType: 'textbox',
  min: MIN_PRE_EVENT_VIDEO_DURATION,
  max: MAX_PRE_EVENT_VIDEO_DURATION,
  type: 'number',
  placeholder: 'Pre-event Media Duration (sec)',
  required: true,
};

const postEventDurationConfig = {
  controlType: 'textbox',
  min: MIN_POST_EVENT_VIDEO_DURATION,
  max: MAX_POST_EVENT_VIDEO_DURATION,
  type: 'number',
  placeholder: 'Post-event Video Duration (sec)',
  required: true,
};

const postEventDurationConfigCustom = {
  controlType: 'textbox',
  min: MIN_POST_EVENT_VIDEO_DURATION,
  max: MAX_POST_EVENT_VIDEO_DURATION,
  type: 'number',
  placeholder: 'Post-event Media Duration (sec)',
  required: true,
};

const videoQualityConfig = {
  controlType: 'textbox',
  min: MIN_VIDEO_QUALITY,
  max: MAX_VIDEO_QUALITY,
  type: 'number',
  placeholder: 'Video Quality',
  required: true,
};

const mediaQualityConfig = {
  controlType: 'textbox',
  min: MIN_VIDEO_QUALITY,
  max: MAX_VIDEO_QUALITY,
  type: 'number',
  placeholder: 'Media Quality',
  required: true,
};

const videoQualityDriverCameraConfig = {
  ...videoQualityConfig,
  placeholder: 'Video Quality (Driver Camera)',
};

const mediaQualityDriverCameraConfig = {
  ...videoQualityConfig,
  placeholder: 'Media Quality (Driver Camera)',
};

const videoResolutionDriverCameraConfig = {
  controlType: 'dropdown',
  placeholder: 'Video Resolution (Driver Camera)',
  options: VIDEO_RESOLUTION_OPTIONS.filter(({ key }) => key !== '1920x1080'),
};

const mediaResolutionDriverCameraConfig = {
  controlType: 'dropdown',
  placeholder: 'Media Resolution (Driver Camera)',
  options: VIDEO_RESOLUTION_OPTIONS.filter(({ key }) => key !== '1920x1080'),
};

const pitchDistractionConfig = {
  controlType: 'textbox',
  min: MIN_PITCH_DISTRACTION_DURATION,
  max: MAX_PITCH_DISTRACTION_DURATION,
  type: 'number',
  placeholder: 'Min Pitch Distraction (sec)',
  required: true,
  allowFloat: true,
  showTooltip: true,
  tooltipTextList: ['The maximum value will be capped to 10 seconds', ' for camera app versions prior to 1.14.0'],
};
const yawDistractionConfig = {
  controlType: 'textbox',
  min: MIN_YAW_DISTRACTION_DURATION,
  max: MAX_YAW_DISTRACTION_DURATION,
  type: 'number',
  placeholder: 'Min Yaw Distraction (sec)',
  required: true,
  showTooltip: true,
  allowFloat: true,
  tooltipTextList: ['The maximum value will be capped to 10 seconds', ' for camera app versions prior to 1.14.0'],
};

const shortDistractionConfig = {
  controlType: 'textbox',
  min: MIN_SHORT_PITCH_DISTRACTION_DURATION,
  max: MAX_SHORT_PITCH_DISTRACTION_DURATION,
  type: 'number',
  placeholder: 'Min Short Pitch Duration (sec)',
  required: true,
  allowFloat: true,
};

const eyeClosureConfigLizardEye = {
  controlType: 'textbox',
  min: MIN_EYE_CLOSURE_DURATION_LIZARD_EYE,
  max: MAX_EYE_CLOSURE_DURATION_LIZARD_EYE,
  type: 'number',
  placeholder: 'Min Eye Closure Duration (sec)',
  required: true,
  allowFloat: true,
};

const eyeClosureConfigDrowsyDriving = {
  controlType: 'textbox',
  min: MIN_EYE_CLOSURE_DURATION_DROWSY_DRIVING,
  max: MAX_EYE_CLOSURE_DURATION_DROWSY_DRIVING,
  type: 'number',
  placeholder: 'Min Eye Closure Duration (sec)',
  required: true,
  allowFloat: true,
};

const minDurationThresholdForSmokingObj = {
  controlType: 'textbox',
  min: 20,
  max: 60,
  type: 'number',
  placeholder: 'Min Smoking Duration (sec)',
  required: true,
};

const minDurationThresholdForDrinkingObj = {
  controlType: 'textbox',
  min: 3,
  max: 10,
  type: 'number',
  placeholder: 'Min Drinking Duration (sec)',
  required: true,
};

const minDurationThresholdForTextingObj = {
  controlType: 'textbox',
  min: 3,
  max: 10,
  type: 'number',
  placeholder: 'Min Texting Duration (sec)',
  required: true,
};

const laneDepartureDurationConfig = {
  controlType: 'textbox',
  min: MIN_LANE_DEPARTURE_DURATION,
  max: MAX_LANE_DEPARTURE_DURATION,
  type: 'number',
  placeholder: 'Lane Departure Detection (sec)',
  required: true,
  allowFloat: true,
};

const minDurationThresholdForCellphone = {
  controlType: 'textbox',
  min: MIN_CELLPHONE_DURATION,
  max: MAX_CELLPHONE_DURATION,
  type: 'number',
  placeholder: 'Min Cellphone Distraction (sec)',
  required: true,
  allowFloat: true, 
}

// TODO: Remove disabled and shouldDisable property if better approach is found
export const BASIC_SETTINGS_EXPANSION_PANEL_CONFIG = (customerName = '') => {
  const commonThresholdConfig = getCommonThresholdConfig(customerName);
  const basicConfig = {
    acceleration: {
      key: 'harshAccelerationEnabled',
      eventType: 'Harsh-Acceleration',
      disabled: false,
      title: 'Harsh Acceleration',
      showFAQ: true,
      description: [
        {
          key: 'harshAccelerationThreshold',
          shouldDisable: true,
          ...commonThresholdConfig,
        },
        {
          key: 'harshAccelerationEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationHarshAcceleration',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationHarshAcceleration',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityHarshAcceleration',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityHarshAcceleration',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.harshAccelerationEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityHarshAcceleration.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityHarshAcceleration.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionHarshAcceleration',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionHarshAcceleration',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.harshAccelerationEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionHarshAcceleration.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionHarshAcceleration.disable();
            }
            return true;
          },
        },
        {
          key: 'harshAccelerationEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'harshAccelerationEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventHarshAcceleration',
          ...captureMediaConfig,
        },
      ],
    },
    braking: {
      key: 'hardBrakingEnabled',
      eventType: 'Harsh-Braking',
      disabled: false,
      title: 'Harsh Braking',
      showFAQ: true,
      description: [
        {
          key: 'hardBrakingThreshold',
          shouldDisable: true,
          ...commonThresholdConfig,
        },
        {
          key: 'hardBrakingEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationHardBraking',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationHardBraking',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityHardBraking',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityHardBraking',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.hardBrakingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityHardBraking.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityHardBraking.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionHardBraking',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionHardBraking',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.hardBrakingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionHardBraking.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionHardBraking.disable();
            }
            return true;
          },
        },
        {
          key: 'hardBrakingEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'hardBrakingEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventHardBraking',
          ...captureMediaConfig,
        },
      ],
    },
    cornering: {
      key: 'corneringEnabled',
      eventType: 'Cornering',
      disabled: false,
      title: 'Harsh Cornering',
      showFAQ: true,
      description: [
        {
          key: 'corneringThreshold',
          shouldDisable: true,
          ...commonThresholdConfig,
        },
        {
          key: 'corneringEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationCornering',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationCornering',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityCornering',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityCornering',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.corneringEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityCornering.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityCornering.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionCornering',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionCornering',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.corneringEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionCornering.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionCornering.disable();
            }
            return true;
          },
        },
        {
          key: 'corneringEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'corneringEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventCornering',
          ...captureMediaConfig,
        },
      ],
    },
    speeding: {
      key: 'postedAndMaxSpeedEnabled',
      eventType: 'Traffic-Speed-Violated',
      disabled: false,
      title: 'Speed Limit Violation',
      showFAQ: true,
      description: [
        {
          key: 'speedingAllowance',
          shouldDisable: true,
        },
        {
          key: 'postedAndMaxSpeedEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'speedingAllowance',
          ...speedingAllowanceConfig,
          min: 1,
          max: 40,
        },
        {
          key: 'postEventVideoDurationSpeeding',
          ...postEventDurationConfig,
          min: 1,
          max: 50,
        },
        {
          key: 'eventVideoQualitySpeeding',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualitySpeeding',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.speedingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualitySpeeding.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualitySpeeding.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionSpeeding',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionSpeeding',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.speedingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionSpeeding.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionSpeeding.disable();
            }
            return true;
          },
        },
        {
          key: 'speedingEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'eventMediaTypeSpeeding',
          ...eventMediaTypeConfig,
        },
        {
          key: 'speedingEDVREnabled',
          ...edvrConfig,
        },
      ],
      internalPanel: {
        postedSpeed: {
          key: 'speedingEnabled',
          disabled: false,
          title: 'Posted Speed',
          showFAQ: true,
          description: [
            {
              key: 'speedingEnabled',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'minimumPostedSpeedEnforced',
              min: MIN_MINIMUM_SPEED_LIMIT,
              max: MAX_MINIMUM_SPEED_LIMIT,
              type: 'number',
              controlType: 'textbox',
              placeholder: 'Min. Speed Enforced (Board Value)',
              required: true,
            },
            {
              key: 'captureMediaOnEventSpeeding',
              ...captureMediaConfig,
            },
          ],
        },
        maxSpeed: {
          key: 'maxSpeedEnabled',
          eventType: 'MaxSpeedExceeded',
          disabled: false,
          title: 'Maximum Speed',
          showFAQ: true,
          description: [
            {
              key: 'maxSpeedEnabled',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'speedUpperLimit',
              ...speedUpperLimitConfig,
            },
            {
              key: 'captureMediaOnEventMaxSpeed',
              ...captureMediaConfig,
            },
          ],
        },
      },
    },
    laneDrift: {
      key: 'laneDriftEnabled',
      eventType: 'Lane-Drift-Found',
      disabled: false,
      title: 'Lane Drift',
      showFAQ: true,
      description: [
        {
          key: 'laneDriftEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationLaneDrift',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationLaneDrift',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityLaneDrift',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityLaneDrift',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.laneDriftEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityLaneDrift.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityLaneDrift.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionLaneDrift',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionLaneDrift',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.laneDriftEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionLaneDrift.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionLaneDrift.disable();
            }
            return true;
          },
        },
        {
          key: 'laneDriftEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'laneDepartureDetectionDurationInSec',
          ...laneDepartureDurationConfig,
        },
        {
          key: 'laneDriftEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventLaneDrift',
          ...captureMediaConfig,
        },
      ],
    },
    tailgating: {
      key: 'tailgatingEnabled',
      eventType: 'Tail-Gating-Detected',
      disabled: false,
      title: 'Tailgating',
      showFAQ: true,
      description: [
        {
          key: 'tailgatingEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationTailgating',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationTailgating',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityTailgating',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityTailgating',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.tailgatingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityTailgating.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityTailgating.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionTailgating',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionTailgating',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.tailgatingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionTailgating.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionTailgating.disable();
            }
            return true;
          },
        },
        {
          key: 'tailgatingEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'tailgatingTimeThreshold',
          min: MIN_TG_TIME_THRESHOLD,
          max: MAX_TG_TIME_THRESHOLD,
          type: 'number',
          controlType: 'textbox',
          placeholder: 'Duration Threshold (secs)',
          required: true,
          allowFloat: true,
        },
        {
          key: 'tailgatingTTCThreshold',
          min: MIN_TG_TTC_THRESHOLD,
          max: MAX_TG_TTC_THRESHOLD,
          type: 'number',
          controlType: 'textbox',
          placeholder: 'TTC Threshold (secs)',
          required: true,
          allowFloat: true,
        },
        {
          key: 'tailgatingEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventTailgating',
          ...captureMediaConfig,
        },
      ],
    },
    stopSign: {
      key: 'stopSignEnabled',
      eventType: 'Traffic-STOP-Sign-Violated',
      disabled: false,
      title: 'Stop Sign Violation',
      showFAQ: true,
      description: [
        {
          key: 'stopSignEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'postEventVideoDurationStopSign',
          ...postEventDurationConfig,
          min: 1,
        },
        {
          key: 'eventVideoQualityStopSignViolation',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityStopSignViolation',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.stopSignEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityStopSignViolation.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityStopSignViolation.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionStopSignViolation',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionStopSignViolation',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.stopSignEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionStopSignViolation.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionStopSignViolation.disable();
            }
            return true;
          },
        },
        {
          key: 'stopSignEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'stopSignEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventStopSignViolation',
          ...captureMediaConfig,
        },
      ],
    },
    distractedDriving: {
      key: 'distractedAndSubEventsEnabled',
      eventType: 'Distracted-Driving',
      disabled: false,
      title: 'Distracted Driving',
      showFAQ: true,
      description: [
        {
          key: 'distractedAndSubEventsEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationDistractedDriving',
          ...preEventDurationConfig,
          min: 7,
        },
        {
          key: 'postEventVideoDurationDistractedDriving',
          ...postEventDurationConfig,
          min: 3,
        },
        {
          key: 'eventVideoQualityDistractedDriving',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityDistractedDriving',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.distractedDrivingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityDistractedDriving.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityDistractedDriving.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionDistractedDriving',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionDistractedDriving',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.distractedDrivingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionDistractedDriving.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionDistractedDriving.disable();
            }
            return true;
          },
        },
        {
          key: 'distractedDrivingEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'distractedDrivingEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventDistractedDriving',
          ...captureMediaConfig,
        },
      ],
      internalPanel: {
        distractedDriving: {
          key: 'distractedDrivingEnabled',
          disabled: false,
          title: 'Head Pose Deviation',
          showFAQ: true,
          description: [
            {
              key: 'distractedDrivingEnabled',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'minYawDistractionDurationSeconds',
              ...yawDistractionConfig,
            },
            {
              key: 'minimumPitchDistractionDurationSeconds',
              ...pitchDistractionConfig,
            },
            {
              key: 'minDistractionDurationShortPitch',
              ...shortDistractionConfig,
            },
            {
              key: 'yawDistractionSpeedThresholdMph',
              controlType: 'textbox',
              min: 0,
              max: 100,
              type: 'number',
              placeholder: 'Yaw Distraction Threshold (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
            {
              key: 'pitchDistractionSpeedThresholdMph',
              controlType: 'textbox',
              min: 0,
              max: 10,
              type: 'number',
              placeholder: 'Pitch Distraction Threshold (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
          ],
        },
        lizardEyeDistraction: {
          key: 'lizardEyeDistractionEnabled',
          eventType: 'Lizard-Eye-Distracted-Driving',
          disabled: false,
          title: 'Gaze Down Distraction',
          beta: false,
          showFAQ: true,
          description: [
            {
              key: 'lizardEyeDistractionEnabled',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'minEyeCloseDurationForLizardEye',
              ...eyeClosureConfigLizardEye,
            },
            {
              key: 'triggerMinimumSpeedLizardEyeDistractionMph',
              controlType: 'textbox',
              min: 0,
              max: 20,
              type: 'number',
              placeholder: 'Min. Eye Distraction Speed (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
          ],
        },
        smoking: {
          key: 'enableSmokingDistraction',
          eventType: 'Smoking-Distracted-Driving',
          disabled: false,
          title: 'Smoking Distraction',
          beta: true,
          showFAQ: true,
          description: [
            {
              key: 'enableSmokingDistraction',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'triggerMinimumSpeedSmokingDistractionMph',
              controlType: 'textbox',
              min: 0,
              max: 100,
              type: 'number',
              placeholder: 'Smoking Min. Speed (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
            {
              key: 'minDurationThresholdForSmoking',
              ...minDurationThresholdForSmokingObj,
            },
          ],
        },
        drinking: {
          key: 'enableDrinkingDistraction',
          eventType: 'Drinking-Distracted-Driving',
          disabled: false,
          title: 'Drinking Distraction',
          beta: true,
          showFAQ: true,
          description: [
            {
              key: 'enableDrinkingDistraction',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'triggerMinimumSpeedDrinkingDistractionMph',
              controlType: 'textbox',
              min: 0,
              max: 100,
              type: 'number',
              placeholder: 'Drinking Min. Speed (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
            {
              key: 'minDurationThresholdForDrinking',
              ...minDurationThresholdForDrinkingObj,
              min: 3,
              max: 10,
            },
          ],
        },
        texting: {
          key: 'enableTextingDistraction',
          eventType: 'Texting-Distracted-Driving',
          disabled: false,
          title: 'Texting Distraction',
          beta: true,
          showFAQ: true,
          description: [
            {
              key: 'enableTextingDistraction',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'triggerMinimumSpeedTextingDistractionMph',
              controlType: 'textbox',
              min: 0,
              max: 100,
              type: 'number',
              placeholder: 'Texting Min. Speed (mph)',
              required: true,
              allowFloat: true,
              conversionFormula: 1.609,
              isUnitConversionRequired: true,
              conversionUnit: 'kmph',
            },
            {
              key: 'minDurationThresholdForTexting',
              ...minDurationThresholdForTextingObj,
              min: 3,
              max: 10,
            },
          ],
        },
        cellphoneDistraction: {
          key: 'enableCellphoneDistraction',
          eventType: 'Cellphone-Distracted-Driving',
          disabled: false,
          title: 'Cellphone Distraction',
          beta: false,
          showFAQ: true,
          description: [
            {
              key: 'enableCellphoneDistraction',
              ...eventsEnableConfig,
            },
          ],
          content: [
            {
              key: 'minDurationThresholdForCellphone',
              ...minDurationThresholdForCellphone
            },
            {
              key: 'eventMediaTypeCellphoneDistraction',
              ...eventMediaTypeConfig,
            },
          ],
        },
      },
    },
    forwardCollisionWarning: {
      key: 'forwardCollisionWarningEnabled',
      eventType: 'Forward-Collision-Warning',
      disabled: false,
      title: 'Forward Collision Warning',
      showFAQ: true,
      description: [
        {
          key: 'forwardCollisionWarningEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationForwardCollisionWarning',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationForwardCollisionWarning',
          ...postEventDurationConfig,
        },
        {
          key: 'eventVideoQualityForwardCollisionWarning',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityForwardCollisionWarning',
          ...videoQualityDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.forwardCollisionWarningEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityForwardCollisionWarning.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraQualityForwardCollisionWarning.disable();
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionForwardCollisionWarning',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionForwardCollisionWarning',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.forwardCollisionWarningEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionForwardCollisionWarning.enable();
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionForwardCollisionWarning.disable();
            }
            return true;
          },
        },
        {
          key: 'forwardCollisionWarningEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'eventMediaTypeForwardCollisionWarning',
          ...eventMediaTypeConfig,
        },
        {
          key: 'forwardCollisionWarningTTCThreshold',
          min: MIN_FCW_TTC_THRESHOLD,
          max: MAX_FCW_TTC_THRESHOLD,
          type: 'number',
          controlType: 'textbox',
          placeholder: 'TTC Threshold (secs)',
          required: true,
          allowFloat: true,
        },
        {
          key: 'forwardCollisionWarningEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventForwardCollisionWarning',
          ...captureMediaConfig,
        },
      ],
    },
    drowsyDriving: {
      key: 'drowsyDrivingEnabled',
      eventType: 'Drowsy-Driving-Detected',
      disabled: false,
      title: 'Drowsy Driving',
      beta: true,
      showFAQ: true,
      description: [
        {
          key: 'drowsyDrivingEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationDrowsyDriving',
          ...preEventDurationConfig,
          min: 7,
        },
        {
          key: 'postEventVideoDurationDrowsyDriving',
          ...postEventDurationConfig,
          min: 1,
        },
        {
          key: 'eventVideoQualityDrowsyDriving',
          ...videoQualityConfig,
        },
        {
          key: 'eventVideoDriverCameraQualityDrowsyDriving',
          ...videoQualityConfig,
          placeholder: 'Video Quality (Driver Camera)',
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.drowsyDrivingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityDrowsyDriving.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraQualityDrowsyDriving.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionDrowsyDriving',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionDrowsyDriving',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.drowsyDrivingEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionDrowsyDriving.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionDrowsyDriving.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'drowsyDrivingEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'triggerMinimumSpeedDrowsinessMph',
          controlType: 'textbox',
          min: 0,
          max: 20,
          type: 'number',
          placeholder: 'Drowsiness Min. Speed (mph)',
          required: true,
          allowFloat: true,
          conversionFormula: 1.609,
          isUnitConversionRequired: true,
          conversionUnit: 'kmph',
        },
        {
          key: 'drowsyDrivingEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventDrowsyDriving',
          ...captureMediaConfig,
        },
        {
          key: 'minEyeCloseDurationForDrowsiness',
          ...eyeClosureConfigDrowsyDriving,
        },
      ],
    },
    noSeatbelt: {
      key: 'enableUnbuckledSeatBelt',
      eventType: 'Unbuckled-Seat-Belt',
      disabled: false,
      title: 'Seatbelt Violation',
      beta: true,
      showFAQ: true,
      description: [
        {
          key: 'enableUnbuckledSeatBelt',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationUnbuckledSeatBelt',
          ...preEventDurationConfig,
          min: 3,
          max: 9,
        },
        {
          key: 'postEventVideoDurationUnbuckledSeatBelt',
          ...postEventDurationConfig,
          min: 2,
          max: 50,
        },
        {
          key: 'eventVideoQualityUnbuckledSeatBelt',
          ...videoQualityConfig,
          min: 0,
          max: 10,
        },
        {
          key: 'eventVideoDriverCameraQualityUnbuckledSeatBelt',
          ...videoQualityConfig,
          min: 0,
          max: 10,
          placeholder: 'Video Quality (Driver Camera)',
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.unbuckledSeatBeltEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityUnbuckledSeatBelt.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraQualityUnbuckledSeatBelt.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionUnbuckledSeatBelt',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionUnbuckledSeatBelt',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.unbuckledSeatBeltEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionUnbuckledSeatBelt.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionUnbuckledSeatBelt.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'unbuckledSeatBeltEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'unbuckledSeatBeltEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'triggerMinimumSpeedUnbuckledSeatBeltMph',
          controlType: 'textbox',
          min: 0,
          max: 100,
          type: 'number',
          placeholder: 'Min. Speed (mph)',
          required: true,
          allowFloat: true,
          conversionFormula: 1.609,
          isUnitConversionRequired: true,
          conversionUnit: 'kmph',
        },
        {
          key: 'captureMediaOnEventUnbuckledSeatBelt',
          ...captureMediaConfig,
        },
      ],
    },
    trafficLightViolation: {
      key: 'trafficLightEnabled',
      eventType: 'Traffic-Light-Violated',
      disabled: false,
      title: 'Traffic Light Violation',
      beta: true,
      showFAQ: true,
      description: [
        {
          key: 'trafficLightEnabled',
          ...eventsEnableConfig,
        },
      ],
      content: [
        {
          key: 'preEventVideoDurationTrafficLightViolation',
          ...preEventDurationConfig,
        },
        {
          key: 'postEventVideoDurationTrafficLightViolation',
          ...postEventDurationConfig,
          min: 5,
          max: 50,
        },
        {
          key: 'eventVideoQualityTrafficLightViolation',
          ...videoQualityConfig,
          min: 1,
          max: 10,
        },
        {
          key: 'eventVideoDriverCameraQualityTrafficLightViolation',
          ...videoQualityConfig,
          min: 1,
          max: 10,
          placeholder: 'Video Quality (Driver Camera)',
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.trafficLightEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraQualityTrafficLightViolation.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraQualityTrafficLightViolation.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'eventVideoResolutionTrafficLightViolation',
          ...videoResolutionConfig,
        },
        {
          key: 'eventVideoDriverCameraResolutionTrafficLightViolation',
          ...videoResolutionDriverCameraConfig,
          ngIf: (formGroup: FormGroup) => {
            if (formGroup.value.trafficLightEventVideoType === 'separate') {
              formGroup.controls.eventVideoDriverCameraResolutionTrafficLightViolation.enable({ onlySelf: true, emitEvent: false });
            } else {
              formGroup.controls.eventVideoDriverCameraResolutionTrafficLightViolation.disable({ onlySelf: true, emitEvent: false });
            }
            return true;
          },
        },
        {
          key: 'trafficLightEventVideoType',
          ...videoTypeConfig,
        },
        {
          key: 'trafficLightEDVREnabled',
          ...edvrConfig,
        },
        {
          key: 'captureMediaOnEventTrafficLightViolation',
          ...captureMediaConfig,
        },
        {
          key: 'eventMediaTypeTrafficLightViolation',
          ...eventMediaTypeConfig,
        },
      ],
    },
  };
  const sortedKeys = Object.keys(basicConfig).sort((a, b) => basicConfig[a].title.localeCompare(basicConfig[b].title));
  const sortedData = {};
  for (const key of sortedKeys) {
    sortedData[key] = basicConfig[key];
  }
  return sortedData;
};

export const ADVANCED_SETTINGS_EXPANSION_PANEL_CONFIG = {
  rollover: {
    key: 'rollOverEnabled',
    eventType: 'Roll-Over-Detected',
    disabled: false,
    title: 'Rollover Detection',
    beta: false,
    showFAQ: true,
    description: [
      {
        key: 'rollOverEnabled',
        ...eventsEnableConfig,
      },
    ],
    content: [
      {
        key: 'preEventVideoDurationRollOver',
        ...preEventDurationConfig,
        min: 5,
        max: 9,
      },
      {
        key: 'postEventVideoDurationRollOver',
        ...postEventDurationConfig,
        min: 2,
        max: 50,
      },
      {
        key: 'eventVideoQualityRollOver',
        ...videoQualityConfig,
        min: 0,
        max: 10,
      },
      {
        key: 'eventVideoDriverCameraQualityRollOver',
        ...videoQualityConfig,
        min: 0,
        max: 10,
        placeholder: 'Video Quality (Driver Camera)',
        ngIf: (formGroup: FormGroup) => {
          if (formGroup.value.rollOverEventVideoType === 'separate') {
            formGroup.controls.eventVideoDriverCameraQualityRollOver.enable({ onlySelf: true, emitEvent: false });
          } else {
            formGroup.controls.eventVideoDriverCameraQualityRollOver.disable({ onlySelf: true, emitEvent: false });
          }
          return true;
        },
      },
      {
        key: 'eventVideoResolutionRollOver',
        ...videoResolutionConfig,
      },
      {
        key: 'eventVideoDriverCameraResolutionRollOver',
        ...videoResolutionDriverCameraConfig,
        ngIf: (formGroup: FormGroup) => {
          if (formGroup.value.rollOverEventVideoType === 'separate') {
            formGroup.controls.eventVideoDriverCameraResolutionRollOver.enable({ onlySelf: true, emitEvent: false });
          } else {
            formGroup.controls.eventVideoDriverCameraResolutionRollOver.disable({ onlySelf: true, emitEvent: false });
          }
          return true;
        },
      },
      {
        key: 'rollOverEventVideoType',
        ...videoTypeConfig,
      },
      {
        key: 'rollOverEDVREnabled',
        ...edvrConfig,
      },
      {
        key: 'captureMediaOnEventRollOver',
        ...captureMediaConfig,
      },
    ],
  },
  device: {
    disabled: false,
    title: 'Device',
    eventType: 'Device',
    showFAQ: true,
    description: [],
    content: [
      {
        key: 'defaultLanguageCode',
        controlType: 'dropdown',
        options: NOTIFICATION_LANGUAGE_LIST,
        placeholder: 'Default Language (Notifications)',
      },
      {
        key: 'deviceAudioVolume',
        controlType: 'textbox',
        min: MIN_DEVICE_VOLUME,
        max: MAX_DEVICE_VOLUME,
        type: 'number',
        placeholder: 'Device Volume',
        required: true,
      },
      {
        key: 'enableDriverCamera',
        controlType: 'toggle',
        placeholder: 'Driver Camera',
      },
      {
        key: 'enableDetectionOfDriverFaceBasedOnDriveSideZone',
        controlType: 'toggle',
        placeholder: 'Automatic Driver Side Selection',
        tooltipText: "Disable if driver facing camera is mounted near the driver's face",
      },
      {
        key: 'dvrAudioEnabled',
        controlType: 'toggle',
        placeholder: 'Audio Recording',
      },
      {
        key: 'ignoreDriverConsentForAudio',
        controlType: 'toggle',
        placeholder: 'Ignore Driver Consent For Audio',
      },
      {
        key: 'tripEndDetectorEnabled',
        controlType: 'toggle',
        placeholder: 'End Trip On Idling',
      },
      {
        key: 'tripEndDetectorTrackingDurationInMins',
        controlType: 'textbox',
        min: MIN_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS,
        max: MAX_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS,
        type: 'number',
        placeholder: 'End Trip On Idling Duration (mins)',
        required: true,
      },
    ],
  },
  location: {
    disabled: false,
    title: 'Location',
    eventType: 'Location',
    showFAQ: true,
    description: [],
    content: [
      {
        key: 'defaultDriverSeatSide',
        controlType: 'dropdown',
        placeholder: 'Driver Side in Cabin',
        options: [
          { key: 'left', value: 'Left' },
          { key: 'right', value: 'Right' },
        ],
      },
    ],
  },
  other: {
    disabled: false,
    title: 'Other',
    eventType: 'Other',
    showFAQ: true,
    description: [],
    content: [
      {
        key: 'driverIdSource',
        controlType: 'dropdown',
        placeholder: 'Driver ID Source',
        options: [
          { key: 'wifiDirect', value: 'Wi-Fi Direct' },
          { key: 'bluetooth', value: 'Bluetooth' },
          { key: 'NFC', value: 'NFC' },
          { key: 'none', value: 'None' },
        ],
      },
      {
        key: 'driverPersistenceEnabled',
        controlType: 'toggle',
        placeholder: 'Driver Persistence',
      },
    ],
  },
};

// Different duty types available with there display string
export const AVAILABLE_DUTY_TYPES = [
  {
    key: 'heavy',
    display: 'Heavy',
  },
  {
    key: 'medium',
    display: 'Medium',
  },
  {
    key: 'light',
    display: 'Light',
  },
];

export const ASSETS_TABLE_COLUMNS = ['assetId', 'dutyType'];

export const SPEED_SIGN_NUMBER_AUDIO_ALERTS = [
  'NUMBER_10',
  'NUMBER_15',
  'NUMBER_20',
  'NUMBER_25',
  'NUMBER_30',
  'NUMBER_35',
  'NUMBER_40',
  'NUMBER_45',
  'NUMBER_50',
  'NUMBER_55',
  'NUMBER_60',
  'NUMBER_65',
  'NUMBER_70',
  'NUMBER_75',
  'NUMBER_80',
  'NUMBER_85',
  'NUMBER_90',
  'NUMBER_95',
  'NUMBER_100',
  'NUMBER_105',
  'NUMBER_110',
  'NUMBER_115',
  'NUMBER_120',
];

const AUDIO_ALERTS = [
  {
    key: 'NEW_DRIVER_ID',
    value: 'New Driver ID',
  },
  {
    key: 'TRIP_STARTED',
    value: 'Trip Started',
  },
  {
    key: 'TRIP_ENDED',
    value: 'Trip Ended',
  },
  {
    key: 'CALIBRATION_COMPLETE',
    value: 'Calibration Complete',
  },
  {
    key: 'LANE_DRIFT',
    value: 'Lane Drift',
  },
  {
    key: 'TAILGATING_WARNING',
    value: 'Tailgating Warning',
  },
  {
    key: 'TAILGATING_VIOLATED',
    value: 'Tailgating Violated',
  },
  {
    key: 'STOP_SIGN_DETECTED',
    value: 'Stop Sign Detected',
  },
  {
    key: 'STOP_SIGN_VIOLATED',
    value: 'Stop Sign Violated',
  },
  {
    key: 'SPEED_SIGN_DETECTED',
    value: 'Speed Sign Detected',
  },
  {
    key: 'SPEED_SIGN_DETECTED_SCHOOL_ZONE',
    value: 'School Zone Speed Sign Detected',
  },
  {
    key: 'SPEEDING_VIOLATION',
    value: 'Speeding Violation',
  },
  {
    key: 'HARSH_CORNERING',
    value: 'Cornering',
  },
  {
    key: 'HARSH_BRAKING',
    value: 'Harsh Braking',
  },
  {
    key: 'HARSH_ACCELERATION',
    value: 'Harsh Acceleration',
  },
  {
    key: 'ANOMALY',
    value: 'Anomaly',
  },
  {
    key: 'SPEED_UPPER_LIMIT_REACHED',
    value: 'Speed Upper Limit Reached',
  },
  {
    key: 'DRIVER_DISTRACTION_WARNING',
    value: 'Driver Distraction Warning',
  },
  {
    key: 'DRIVER_DISTRACTION_VIOLATION',
    value: 'Driver Distraction Violation',
  },
  {
    key: 'SHUTTING_DOWN',
    value: 'Shutting Down',
  },
  {
    key: 'WIFI_CONNECTED',
    value: 'Wi-Fi Connected',
  },
  {
    key: 'WIFI_DISCONNECTED',
    value: 'Wi-Fi Disconnected',
  },
  {
    key: 'EXTERNAL_VIDEO_CAPTURE_STARTED',
    value: 'External Video Capture Started',
  },
  {
    key: 'EXTERNAL_IMAGE_CAPTURED',
    value: 'External Image Captured',
  },
  {
    key: 'STOPPING_DVR',
    value: 'Stopping DVR',
  },
  {
    key: 'SPEEDING_WARNING',
    value: 'Speeding Warning',
  },
  {
    key: 'DROWSY_DRIVING_VIOLATION',
    value: 'Drowsy Driving Violation',
  },
  {
    key: 'DRIVER_CELLPHONE_DISTRACTION',
    value: 'Driver Cellphone Distraction',
  },
  {
    key: 'FORWARD_COLLISION_WARNING',
    value: 'Forward Collision Warning',
  },
  {
    key: 'FCW_BEEP_ALERT',
    value: 'Forward Collision Warning Beep Alert',
  },
  {
    key: 'AUDIO_RECORDING_ENABLED',
    value: 'Audio Recording Enabled',
  },
  {
    key: 'ROLL_OVER_DETECTED',
    value: 'Rollover Detection',
  },
  {
    key: 'UNBUCKLED_SEAT_BELT',
    value: 'Seatbelt Violation',
  },
  {
    key: 'DRIVER_SMOKING_DISTRACTION',
    value: 'Smoking Distraction',
  },
  {
    key: 'DRIVER_DRINKING_DISTRACTION',
    value: 'Drinking Distraction',
  },
  {
    key: 'DRIVER_TEXTING_DISTRACTION',
    value: 'Texting Distraction',
  },

  {
    key: 'TRIP_UPLOAD_CRITERIA_MET',
    value: 'Trip Upload Criteria Met',
  },

  {
    key: 'TRIP_WITH_UPLOAD_CRITERIA_ENDED',
    value: 'Trip Upload Criteria Ended',
  },
  {
    key: 'DRIVER_LIZARD_EYE_DISTRACTION',
    value: 'Gaze down',
  },
];

const assetSpeedUpperLimitConfig = {
  controlType: 'textbox',
  min: MIN_UPPER_SPEED_LIMIT,
  max: MAX_UPPER_SPEED_LIMIT,
  placeholder: 'Max. Speed Limit (mph)',
  type: 'number',
  required: true,
  conversionFormula: 1.609,
  isUnitConversionRequired: true,
  conversionUnit: 'kmph',
};

export const ASSET_EXPANSION_PANEL_CONFIG = {
  asset: {
    disabled: false,
    title: 'Asset Configuration',
    description: [],
    content: [
      {
        key: 'defaultLanguageCode',
        controlType: 'dropdown',
        options: NOTIFICATION_LANGUAGE_LIST,
        placeholder: 'Default Language (Notifications)',
      },
      {
        key: 'deviceAudioVolume',
        controlType: 'textbox',
        min: MIN_DEVICE_VOLUME,
        max: MAX_DEVICE_VOLUME,
        type: 'number',
        placeholder: 'Device Volume',
        required: true,
      },
      {
        key: 'audioAlertsEnabled',
        controlType: 'dropdown',
        multiple: true,
        placeholder: 'Audio Alerts',
        options: AUDIO_ALERTS,
      },
      {
        key: 'speedUpperLimit',
        ...assetSpeedUpperLimitConfig,
      },
      {
        key: 'dvrAudioEnabled',
        controlType: 'toggle',
        placeholder: 'Audio Recording',
      },
      {
        key: 'tripEndDetectorEnabled',
        controlType: 'toggle',
        placeholder: 'End Trip On Idling',
      },
      {
        key: 'tripEndDetectorTrackingDurationInMins',
        controlType: 'textbox',
        min: MIN_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS,
        max: MAX_TRIP_END_DETECTOR_TRACKING_DURATION_IN_MINS,
        type: 'number',
        placeholder: 'End Trip On Idling Duration (mins)',
        required: true,
      },
    ],
  },
};

const customEventsConfigCache = new Map<any, any>();
export const CUSTOM_EVENTS_EXPANSION_PANEL_CONFIG = (customData) => {
  if (customEventsConfigCache.has(customData)) {
    return customEventsConfigCache.get(customData);
  }

  const transformedData = {};

  for (const prop in customData) {
    if (prop.endsWith('eventType')) {
      const eventName = customData[customData[prop] + 'eventName'] ? customData[customData[prop] + 'eventName'] : customData[prop];
      const eventType = customData[prop];

      transformedData[eventType] = {
        key: eventType,
        disabled: !`${eventType}eventEnabled`,
        title: eventName,
        description: [
          {
            key: `${eventType}eventEnabled`,
            ...eventEnabledConfig,
          },
        ],
        content: [
          {
            key: `${eventType}mediaType`,
            ...mediaFormat,
          },
          {
            key: `${eventType}mediaFrameType`,
            ...mediaFrameConfig,
          },
          {
            key: `${eventType}mediaResolution`,
            ...mediaResolutionConfig,
          },
          {
            key: `${eventType}mediaQuality`,
            ...mediaQualityConfig,
          },
          {
            key: `${eventType}mediaQualityDriverCamera`,
            ...mediaQualityDriverCameraConfig,
          },
          {
            key: `${eventType}mediaResolutionDriverCamera`,
            ...mediaResolutionDriverCameraConfig,
          },
          {
            key: `${eventType}inscriptionUnitSystem`,
            ...inscriptionUnitSystemConfig,
          },
          {
            key: `${eventType}preEventMediaDuration`,
            ...preEventDurationConfigCustom,
          },
          {
            key: `${eventType}postEventMediaDuration`,
            ...postEventDurationConfigCustom,
          },
          {
            key: `${eventType}dvrEnabled`,
            ...dvrConfig,
          },
        ],
      };
    }
  }
  customEventsConfigCache.set(customData, transformedData);
  const sortedKeys = Object.keys(transformedData).sort((a, b) => transformedData[a].title.localeCompare(transformedData[b].title));
  const sortedData = {};
  for (const key of sortedKeys) {
    sortedData[key] = transformedData[key];
  }
  return sortedData;
};
