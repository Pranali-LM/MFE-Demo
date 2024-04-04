export class PatchAssetParam {
  constructor(public fleetId: string) {}
}

export enum Packages {
  dvr = 'DVR',
}

enum CameraType {
  ridecam = 'RIDECAM',
  ridecamPlus = 'RIDECAM_PLUS',
}

interface MdvrChannelMapping {
  fps?: number; // Not required as of now
  resolution?: string; // No need to send of CONVOY since only one resolution is supported
  source: string;
  view: string;
  hflip?: boolean;
  vflip?: boolean;
}

export interface MdvrConfig {
  serialId?: string;
  wifiSsid?: string;
  channelMappings: MdvrChannelMapping[];
  mdvrConfigUpdatedAt: string;
}

export interface AssetDetails {
  active: boolean;
  assetId: string;
  fleetId: string;
  dutyType: string;
  assetName?: string;
  cameraType?: CameraType;
  pilotActive?: boolean;
  pilotAvailable?: boolean;
  start?: string;
  packages?: string[];
  plusPackages?: string[];
  ridecamPlusPlan?: string;
  recurringLivestreamExtraMinutes?: number;
  end?: string;
  tags?: string[];
  metadata?: { [key: string]: string };
  mdvrConfig?: MdvrConfig;
  deviceId?: string;
  defaultDriverId?: string;
  serialNumber?: string;
  customPackages?: string[];
}

export interface Device {
  assetId: string | null;
  deviceId: string;
  serialNumber: string | null;
  deviceModel: string;
  fleetId: string | null;
  provisioned: boolean;
  provisionedAt: string | null;
  vendorId: string;
  assetName?: string;
  asset?: AssetDetails;
  deprovisionLoader?: boolean;
  firmware1Semver?: string;
  firmware2Semver: string;
}

export interface EditDeviceInfo {
  vendorId: string;
  fleetId: string;
  deviceIds: string[];
  assetIds: string[];
  newProvision: boolean;
  dutyType?: string;
  ridecamPlusPlan?: string;
}

export class ManageDeviceReqParams {
  public action: string;
}

export class getDeviceTaskReqParams {
  public taskType: string;
}

export class TriggerDeviceTaskReqParams {
  public taskType: string;
  public temporaryTripBlocking: boolean;
  public temporaryTripBlockingEndTimestamp?: string;
}

export class ManageDeviceReqBody {
  public deviceId: string;
  public action: string;
}

export interface EditProvisionDeviceInfo {
  assetId: string;
  dutyType?: string;
  defaultDriverId?: string;
}

export interface UpdateMdvrConfigReqBody {
  channelMappings: MdvrChannelMapping[];
  serialId?: string;
}

export interface AssetPlans {
  plans: {
    [key: string]: string[];
  };
  customPackages: {
    STANDARD: string[];
  };
}

export interface MdvrCameraConfig {
  sources: string[];
  resolution: {
    enum: string[];
    default: string;
  };
  fps: {
    enum: string[];
    default: string;
  };
  hflip?: boolean;
  vflip?: boolean;
  cameraInterface: 'CONVOY' | 'TVI' | 'UVC';
}

export interface DeviceModelConfig {
  mdvrCameras: MdvrCameraConfig[];
  deviceModel: string;
}
