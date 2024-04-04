export interface Attribute {
  attributetype: string;
  attributeName: string;
  attributeId: string;
  aDescription: string;
}

export interface configEvents {
  key: string;
  checked: boolean;
  label: string;
  value?: string;
  color?: string;
  showHighlights?: boolean;
  showIncidentTrend?: boolean;
  showIncidentSummary?: boolean;
  showInFilter?: boolean;
  childConfigs?: null;
  isDriverFacing?: null;
  subEvents?: string[];
}

export interface GetCoachingConfigResponse {
  code: number;
  value: GetCoachingConfigResponseValue;
}

export interface GetCoachingConfigResponseValue {
  fleetId: string;
  clientId: string;
  coachingConfig: CoachingConfig;
}

export interface CoachingConfig {
  eventTypes: string[];
  coachingInterval: number;
  incidentsPer100Miles: number;
  minimumEventThreshold: number;
}

export interface PostCoachingConfigResponse {
  code: number;
  value: PostCoachingConfigResponseValue;
}

export interface PostCoachingConfigResponseValue {
  fleetId: string;
  clientId: string;
  coachingConfigJson: CoachingConfig;
}
