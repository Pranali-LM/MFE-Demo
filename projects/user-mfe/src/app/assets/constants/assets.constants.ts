import { ClientConfig, DevicePrimaryKey } from '@config/config.base';

export const ASSET_LIST_COLUMNS = (clientConfig: ClientConfig): string[] => {
  return ['assetId', 'assetName', 'tags', clientConfig.devicePrimaryKey, 'dutyType', 'defaultDriver', 'actions', 'configurations'];
};

export const ASSET_FILTER_TYPES = (clientConfig: ClientConfig): { key: string; label: string }[] => {
  const commonFilterTypes = [
    {
      key: 'assetIdFilter',
      label: 'Asset',
    },
    {
      key: 'filterByTags',
      label: 'Tags',
    },
  ];
  if (clientConfig.devicePrimaryKey === DevicePrimaryKey.DeviceId) {
    return [
      ...commonFilterTypes,
      {
        key: 'deviceIdFilter',
        label: 'Device ID',
      },
    ];
  }
  return [
    ...commonFilterTypes,
    {
      key: 'serialNumberFilter',
      label: 'Serial No.',
    },
  ];
};

export const ASSET_LEGACY_LIST_COLUMNS: string[] = ['assetId', 'dutyType', 'actions'];

export const DEFAULT_DUTY_TYPE = 'heavy';

export const REMOTE_ACTION_LIST = [
  {
    value: 'formatSDCard',
    label: 'Format SD Card',
    type: 'remoteAction',
  },
  {
    value: 'reboot',
    label: 'Reboot Device',
    type: 'remoteAction',
  },
];

export const STOP_RECORDING_EXPIRY_OPTIONS = [
  {
    value: 1,
    label: '1 day',
  },
  {
    value: 3,
    label: '3 days',
  },
  {
    value: 7,
    label: '1 week',
  },
  {
    value: 14,
    label: '2 weeks',
  },
];

export const ASSETID_ALLOWED_CHARACTERS = '([A-Za-z0-9-_]+)';

export const ASSETNAME_ALLOWED_CHARACTERS = '^(?=.*[a-zA-Z0-9])[ -~]*$';

export const ASSETNAME_ALLOWED_MAX_LENGTH = 255;

export const AVAILABLE_DUTY_TYPES = [
  {
    label: 'Heavy',
    value: 'heavy',
  },
  {
    label: 'Medium',
    value: 'medium',
  },
  {
    label: 'Light',
    value: 'light',
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

export const DEVICES_LIST_COLUMNS: string[] = ['deviceId', 'assetId', 'actions'];

export const MDVR_AVAILBLE_VIEWS = [
  {
    label: 'Left Blind Spot',
    value: 'LEFT_BLIND_SPOT',
  },
  {
    label: 'Right Blind Spot',
    value: 'RIGHT_BLIND_SPOT',
  },
  {
    label: 'Front Blind Spot',
    value: 'FRONT_BLIND_SPOT',
  },
  {
    label: 'Rear Blind Spot',
    value: 'REAR_BLIND_SPOT',
  },
  {
    label: 'Left Side Camera',
    value: 'LEFT_SIDE_CAMERA',
  },
  {
    label: 'Right Side Camera',
    value: 'RIGHT_SIDE_CAMERA',
  },
];
