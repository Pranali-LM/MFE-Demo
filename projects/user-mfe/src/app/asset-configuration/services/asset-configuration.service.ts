import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import {
  ADVANCED_SETTINGS_EXPANSION_PANEL_CONFIG,
  ASSET_EXPANSION_PANEL_CONFIG,
  BASIC_SETTINGS_EXPANSION_PANEL_CONFIG,
  CUSTOM_EVENTS_EXPANSION_PANEL_CONFIG,
  inheritConfigsMapping,
  SPEED_SIGN_NUMBER_AUDIO_ALERTS,
} from '@app-asset-config/common/asset-configuration.constants';
import { API } from '@app-core/constants/api.constants';
import { KeyValuePair } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AssetConfigurationParams, FleetConfigurationParams, GetAssetsParams } from '../common/asset-configuration.model';

@Injectable({
  providedIn: 'root',
})
export class AssetConfigurationService {
  public isLoadingConfig = new BehaviorSubject<boolean>(false);
  public isUpdatingConfig = new BehaviorSubject<boolean>(false);
  public isCustomUpdatingConfig = new BehaviorSubject<boolean>(false);
  public currentDutyTypeConfig = new BehaviorSubject({});
  public currentDutyType = new BehaviorSubject<string>('heavy');
  public currentCustomDutyType = new BehaviorSubject<string>('heavy');
  public isBasicConfigDirty = new BehaviorSubject<boolean>(false);
  public isAdvancedConfigDirty = new BehaviorSubject<boolean>(false);
  public currentAssetConfig = new BehaviorSubject({});
  public isAssetConfigDirty = new BehaviorSubject<boolean>(false);
  public currentDutyTypeConfigCustomEvents = new BehaviorSubject({});
  public isCustomConfigDirty = new BehaviorSubject<boolean>(false);
  private customSettingExpansionPanelConfigCache: Map<any, any> = new Map<any, any>();

  constructor(
    private _http: HttpClient,
    private fb: FormBuilder,
    private accessService: AccessService,
    private cacheService: HttpCacheService
  ) {}

  public flattenObject(obj: KeyValuePair) {
    const flattendObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
        Object.assign(flattendObj, this.flattenObject(value));
      } else {
        flattendObj[key] = value;
      }
    });
    return flattendObj;
  }

  private inheritSpeedingConfigs(config: KeyValuePair): KeyValuePair {
    return {
      postEventVideoDurationMaxSpeed: config.postEventVideoDurationSpeeding,
      eventVideoQualityMaxSpeed: config.eventVideoQualitySpeeding,
      eventVideoDriverCameraQualityMaxSpeed: config.eventVideoDriverCameraQualitySpeeding,
      eventVideoResolutionMaxSpeed: config.eventVideoResolutionSpeeding,
      eventVideoDriverCameraResolutionMaxSpeed: config.eventVideoDriverCameraResolutionSpeeding,
      maxSpeedEventVideoType: config.speedingEventVideoType,
      eventMediaTypeMaxSpeed: config.eventMediaTypeSpeeding,
      maxSpeedEDVREnabled: config.speedingEDVREnabled,
    };
  }

  private inheritDistractedDrivingConfigs(config: KeyValuePair): KeyValuePair {
    return {
      // cellphone
      preEventVideoDurationCellphoneDistraction: config.preEventVideoDurationDistractedDriving,
      postEventVideoDurationCellphoneDistraction: config.postEventVideoDurationDistractedDriving,
      eventVideoQualityCellphoneDistraction: config.eventVideoQualityDistractedDriving,
      eventVideoDriverCameraQualityCellphoneDistraction: config.eventVideoDriverCameraQualityDistractedDriving,
      eventVideoResolutionCellphoneDistraction: config.eventVideoResolutionDistractedDriving,
      eventVideoDriverCameraResolutionCellphoneDistraction: config.eventVideoDriverCameraResolutionDistractedDriving,
      cellphoneDistractionEventVideoType: config.distractedDrivingEventVideoType,
      cellphoneDistractionEDVREnabled: config.distractedDrivingEDVREnabled,
      captureMediaOnEventCellphoneDistraction: config.captureMediaOnEventDistractedDriving,

      // lizard-eye
      preEventVideoDurationLizardEyeDistraction: config.preEventVideoDurationDistractedDriving,
      postEventVideoDurationLizardEyeDistraction: config.postEventVideoDurationDistractedDriving,
      eventVideoQualityLizardEyeDistraction: config.eventVideoQualityDistractedDriving,
      eventVideoDriverCameraQualityLizardEyeDistraction: config.eventVideoDriverCameraQualityDistractedDriving,
      eventVideoResolutionLizardEyeDistraction: config.eventVideoResolutionDistractedDriving,
      eventVideoDriverCameraResolutionLizardEyeDistraction: config.eventVideoDriverCameraResolutionDistractedDriving,
      lizardEyeDistractionEventVideoType: config.distractedDrivingEventVideoType,
      lizardEyeDistractionEDVREnabled: config.distractedDrivingEDVREnabled,
      captureMediaOnEventLizardEyeDistraction: config.captureMediaOnEventDistractedDriving,

      // smoking
      preEventVideoDurationSmokingDistraction: config.preEventVideoDurationDistractedDriving,
      postEventVideoDurationSmokingDistraction: config.postEventVideoDurationDistractedDriving,
      eventVideoQualitySmokingDistraction: config.eventVideoQualityDistractedDriving,
      eventVideoDriverCameraQualitySmokingDistraction: config.eventVideoDriverCameraQualityDistractedDriving,
      eventVideoResolutionSmokingDistraction: config.eventVideoResolutionDistractedDriving,
      eventVideoDriverCameraResolutionSmokingDistraction: config.eventVideoDriverCameraResolutionDistractedDriving,
      smokingDistractionEventVideoType: config.distractedDrivingEventVideoType,
      smokingDistractionEDVREnabled: config.distractedDrivingEDVREnabled,
      captureMediaOnEventSmokingDistraction: config.captureMediaOnEventDistractedDriving,

      // drinking
      preEventVideoDurationDrinkingDistraction: config.preEventVideoDurationDistractedDriving,
      postEventVideoDurationDrinkingDistraction: config.postEventVideoDurationDistractedDriving,
      eventVideoQualityDrinkingDistraction: config.eventVideoQualityDistractedDriving,
      eventVideoDriverCameraQualityDrinkingDistraction: config.eventVideoDriverCameraQualityDistractedDriving,
      eventVideoResolutionDrinkingDistraction: config.eventVideoResolutionDistractedDriving,
      eventVideoDriverCameraResolutionDrinkingDistraction: config.eventVideoDriverCameraResolutionDistractedDriving,
      drinkingDistractionEventVideoType: config.distractedDrivingEventVideoType,
      drinkingDistractionEDVREnabled: config.distractedDrivingEDVREnabled,
      captureMediaOnEventDrinkingDistraction: config.captureMediaOnEventDistractedDriving,

      // texting
      preEventVideoDurationTextingDistraction: config.preEventVideoDurationDistractedDriving,
      postEventVideoDurationTextingDistraction: config.postEventVideoDurationDistractedDriving,
      eventVideoQualityTextingDistraction: config.eventVideoQualityDistractedDriving,
      eventVideoDriverCameraQualityTextingDistraction: config.eventVideoDriverCameraQualityDistractedDriving,
      eventVideoResolutionTextingDistraction: config.eventVideoResolutionDistractedDriving,
      eventVideoDriverCameraResolutionTextingDistraction: config.eventVideoDriverCameraResolutionDistractedDriving,
      textingDistractionEventVideoType: config.distractedDrivingEventVideoType,
      textingDistractionEDVREnabled: config.distractedDrivingEDVREnabled,
      captureMediaOnEventTextingDistraction: config.captureMediaOnEventDistractedDriving,
    };
  }

  public getChangedConfigs(originalConfig: KeyValuePair = {}, newConfig: KeyValuePair = {}, isCustomConfig?: boolean): KeyValuePair {
    return Object.entries(newConfig)
      .filter(([key, value]) => {
        if (Array.isArray(originalConfig[key]) && Array.isArray(value) && originalConfig[key].length !== value.length) {
          return true;
        } else if (typeof originalConfig[key] !== 'object' && typeof value !== 'object' && originalConfig[key] !== value) {
          return true;
        } else {
          return false;
        }
      })
      .map(([key, value]) => {
        let updatedValue: any;
        if (key === 'ignoreSchoolZoneSpeedingViolations') {
          updatedValue = !value;
        } else if (key === 'audioAlertsEnabled') {
          updatedValue = [...(value as Array<string>), ...SPEED_SIGN_NUMBER_AUDIO_ALERTS];
        } else if (key === 'captureMediaOnEventMaxSpeed' && !!value) {
          return {
            [key]: newConfig.captureMediaOnEventSpeeding,
            ...(newConfig.captureMediaOnEventSpeeding ? this.inheritSpeedingConfigs(newConfig) : {}),
          };
        } else if (key === 'postedAndMaxSpeedEnabled' && value === false) {
          return {
            speedingEnabled: value,
            maxSpeedEnabled: value,
            postedAndMaxSpeedEnabled: undefined,
            ...(newConfig.speedingEnabled ? this.inheritSpeedingConfigs(newConfig) : {}),
          };
        } else if (key === 'distractedAndSubEventsEnabled' && value === false) {
          return {
            distractedDrivingEnabled: value,
            enableCellphoneDistraction: value,
            distractedAndSubEventsEnabled: undefined,
            ...(newConfig.distractedDrivingEnabled ? this.inheritDistractedDrivingConfigs(newConfig) : {}),
          };
        } else if (
          Object.keys(inheritConfigsMapping).includes(key) &&
          (!inheritConfigsMapping[key].condition || inheritConfigsMapping[key].condition(value))
        ) {
          return {
            [key]: value,
            [inheritConfigsMapping[key].key]: value,
            ...(Object(inheritConfigsMapping[key]).hasOwnProperty('key2') ? { [inheritConfigsMapping[key].key2]: value } : {}),
            ...(Object(inheritConfigsMapping[key]).hasOwnProperty('key3') ? { [inheritConfigsMapping[key].key3]: value } : {}),
            ...(Object(inheritConfigsMapping[key]).hasOwnProperty('key4') ? { [inheritConfigsMapping[key].key4]: value } : {}),
            ...(Object(inheritConfigsMapping[key]).hasOwnProperty('key5') ? { [inheritConfigsMapping[key].key5]: value } : {}),
          };
        } else {
          updatedValue = value;
        }
        if (isCustomConfig) {
          return { [key]: updatedValue };
        }
        return {
          [key]: updatedValue,
          postedAndMaxSpeedEnabled: undefined,
          distractedAndSubEventsEnabled: undefined,
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  public get basicSettingsExpansionPanelConfig(): any {
    const { customerName = '' } = this.accessService.getLoginInfo() || {};
    return BASIC_SETTINGS_EXPANSION_PANEL_CONFIG(customerName);
  }

  public get advancedSettingsExpansionPanelConfig(): any {
    return ADVANCED_SETTINGS_EXPANSION_PANEL_CONFIG;
  }

  public formatConfig(dutyTypeConfig = {}) {
    const formattedConfig = Object.entries(dutyTypeConfig)
      .map(([key, value]) => {
        let updatedValue: any;
        if (key === 'ignoreSchoolZoneSpeedingViolations') {
          updatedValue = !value;
        } else if (key === 'audioAlertsEnabled') {
          updatedValue = [...((value || []) as Array<string>).filter((v) => !SPEED_SIGN_NUMBER_AUDIO_ALERTS.includes(v))];
        } else {
          updatedValue = value;
        }
        return {
          [key]: updatedValue,
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {});
    const {
      speedingEnabled = false,
      maxSpeedEnabled = false,
      distractedDrivingEnabled = false,
      enableCellphoneDistraction = false,
    } = formattedConfig || {};
    const postedAndMaxSpeedEnabled = speedingEnabled || maxSpeedEnabled;
    const distractedAndSubEventsEnabled = distractedDrivingEnabled || enableCellphoneDistraction;
    return {
      ...formattedConfig,
      postedAndMaxSpeedEnabled,
      distractedAndSubEventsEnabled,
    };
  }

  public get expansionPanelConfig(): any {
    const { customerName = '' } = this.accessService.getLoginInfo() || {};
    return BASIC_SETTINGS_EXPANSION_PANEL_CONFIG(customerName);
  }

  private setParams(params) {
    return new HttpParams({
      fromObject: params,
    });
  }

  private getData(url: string, params: any, options: any = {}) {
    const op = {
      params: this.setParams(params),
      ...options,
    };
    return this._http.get(url, op);
  }

  /**
   * Patch data
   * @description Make Http request with PATCH method
   * @param url API endpoint
   * @param body Request body
   * @param params Other parameters
   */
  private patchData(url: string, body: any, params?: any) {
    const options = {
      params: this.setParams(params),
    };
    return this._http.patch(url, body, options);
  }

  public getAssets(param: GetAssetsParams): Observable<any> {
    return this.getData(API.GET_FLEET_ASSETS, param);
  }

  /**
   * Patch asset info
   * @description Service to add new asset, edit existing asset or to update the status of the exsting asset
   * @param body Request body (Asset to be updated or added)
   * @param param Query params
   */
  public patchAsset(body: any, params?: FleetConfigurationParams): Observable<any> {
    return this.patchData(API.PATCH_ASSET, body, params).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_FLEET_ASSETS);
      })
    );
  }

  public getFleetConfiguration(params?: FleetConfigurationParams): Observable<any> {
    return this.getData(API.GET_FLEET_CONFIGURATION, params).pipe(
      map((res) => {
        const { lastUpdated = '', ...configuration } = (res || {}) as any;
        const formattedConfig = Object.entries(configuration)
          .map(([dutyType, dutyTypeConfig]) => {
            return { [dutyType]: this.formatConfig(dutyTypeConfig) };
          })
          .reduce((a, b) => ({ ...a, ...b }), {});
        return {
          ...res,
          configuration: formattedConfig,
        };
      })
    );
  }

  public updateFleetConfiguration(body: any): Observable<any> {
    const url = API.UPDATE_FLEET_CONFIGURATION;
    return this.patchData(url, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_FLEET_CONFIGURATION);
      })
    );
  }

  private getFormControl(options: any, value: string | number): FormControl {
    const { required = true, min, max } = options || { min: undefined, max: undefined };
    const validators = [];
    if (required) {
      validators.push(Validators.required);
    }
    if (min !== undefined) {
      validators.push(Validators.min(min));
    }
    if (max !== undefined) {
      validators.push(Validators.max(max));
    }
    return this.fb.control(value, validators);
  }

  private getFormArrayControl(options = {} as any, value = []) {
    const { childFormControlClass = 'FormControl', childFormControlConfig = [] } = options;
    const childControlsConfig = value.map((v) => {
      if (childFormControlClass === 'FormGroup') {
        const formGroupConfig = childFormControlConfig
          .map((childConfig) => ({ [childConfig.key]: this.getFormControl(childConfig, v[childConfig.key]) }))
          .reduce((a, b) => ({ ...a, ...b }));
        return this.fb.group(formGroupConfig);
      }
      return this.getFormControl(childFormControlConfig[0], v[childFormControlConfig[0].key]);
    });
    const formArrayControl = this.fb.array(childControlsConfig);
    return formArrayControl;
  }

  private getFormGroupConfig(controls = [], internalPanel = {}, config = {}) {
    const formControls = controls.reduce((acc, b: any) => {
      const { formControlClass = 'FormControl' } = b || {};
      if (formControlClass === 'FormArray') {
        return {
          ...acc,
          [b.key]: this.getFormArrayControl(b, config[b.key]),
        };
      }
      return {
        ...acc,
        [b.key]: this.getFormControl(b, config[b.key]),
      };
    }, {});
    return {
      ...formControls,
      ...(Object.keys(internalPanel).length > 0 ? { internalPanel: this.toFormGroup(internalPanel, config) } : {}),
    };
  }

  public toFormGroup(expansionPanelConfig = {}, config = {}): FormGroup {
    const subGroups = Object.entries(expansionPanelConfig).reduce((a, [key, value]) => {
      const { description = [], content = [], internalPanel = {} } = value as any;
      const controls = description.concat(content);
      const formGroupConfig = this.getFormGroupConfig(controls, internalPanel, config);
      return {
        ...a,
        [key]: this.fb.group(formGroupConfig),
      };
    }, {});
    return this.fb.group(subGroups);
  }

  public getAssetConfiguration(params?: AssetConfigurationParams): Observable<any> {
    return this.getData(API.GET_ASSET_CONFIGURATION, params).pipe(
      map((res) => {
        const { configuration } = (res || {}) as any;
        return {
          ...res,
          configuration,
        };
      })
    );
  }

  public get assetExpansionPanelConfig(): any {
    return ASSET_EXPANSION_PANEL_CONFIG;
  }

  public updateAssetConfiguration(body: any, params?: AssetConfigurationParams): Observable<any> {
    const url = API.UPDATE_ASSET_CONFIGURATION;
    return this.patchData(url, body, params).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_ASSET_CONFIGURATION);
      })
    );
  }

  public updateDriverPermissions(params: any, body: any): Observable<any> {
    const httpOptions = {
      params: this.setParams(params),
    };
    return this._http.patch(API.UPDATE_DRIVER_PERMISSIONS, body, httpOptions);
  }

  public getDriverPermissions(params: any): Observable<any> {
    return this.getData(API.GET_DRIVER_PERMISSIONS, params);
  }

  public get customSettingExpansionPanelConfig(): any {
    if (this.customSettingExpansionPanelConfigCache.has(this.currentDutyTypeConfigCustomEvents.value)) {
      return this.customSettingExpansionPanelConfigCache.get(this.currentDutyTypeConfigCustomEvents.value);
    }

    const expandedConfig = CUSTOM_EVENTS_EXPANSION_PANEL_CONFIG(this.currentDutyTypeConfigCustomEvents.value);
    this.customSettingExpansionPanelConfigCache.set(this.currentDutyTypeConfigCustomEvents.value, expandedConfig);
    return expandedConfig;
  }

  public getFleetCustomEvents(): Observable<any> {
    return this._http.get(API.GET_FLEET_CUSTOM_EVENT_CONFIGURATION);
  }

  public getAllEvents(): Observable<any> {
    return this._http.get(API.GET_FLEET_EVENTS_CUSTOM_EVENTS);
  }

  public updateCustomEventsConfiguration(body: any): Observable<any> {
    const url = API.UPDATE_CUSTOM_EVENT_CONFIGURATION;
    return this.patchData(url, body);
  }
}
