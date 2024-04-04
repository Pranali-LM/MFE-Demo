import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AVAILABLE_DUTY_TYPES } from '@app-asset-config/common/asset-configuration.constants';
import { AssetDetails } from '@app-assets/models/assets.model';
import { API } from '@app-core/constants/api.constants';
import {
  DATE_FORMAT_KEY,
  DEFAULT_DATE_FORMAT,
  DEFAULT_LANGUAGE,
  DEFAULT_METRIC_UNIT,
  DEFAULT_THEME,
  DEFAULT_TIMEZONE,
  EVENTS_CONFIG,
  EVENT_TAG_KEYS,
  FLEET_KEY,
  LANGUAGE_KEY,
  METRIC_UNIT_KEY,
  THEME_KEY,
  TIMEZONE_KEY,
  COOKIES_CONSENT_KEY,
  DEFAULT_COOKIES_CONSENT,
  DELETE_COOKIES_START_TIME,
  DO_NOT_DELETE_LIST,
  INCIDENT_TYPE_LIST,
  CONFIGS_WITH_SUBCONFIGS,
} from '@app-core/constants/constants';
import { CookieConsent, FleetDriverListParams, FleetEvents, ListPermissionsResp, LoginInfo, setParams } from '@app-core/models/core.model';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { HttpCacheService } from '../cache/cache.service';
import { DateService } from '../date/date.service';
import { Location } from '@angular/common';
import { GoogleTagManagerService } from '../google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';

import { LoginTypes } from '../google-tag-manager/google-tag-manager.service';
@Injectable()
export class DataService {
  public _currentTimeZone = new BehaviorSubject(this.storageService.getStorageValue(TIMEZONE_KEY) || DEFAULT_TIMEZONE);
  public _currentMetricUnit = new BehaviorSubject(this.storageService.getStorageValue(METRIC_UNIT_KEY) || DEFAULT_METRIC_UNIT);
  public _currentDateFormat = new BehaviorSubject(this.storageService.getStorageValue(DATE_FORMAT_KEY) || DEFAULT_DATE_FORMAT);
  public _currentFleet = new BehaviorSubject(this.storageService.getStorageValue(FLEET_KEY) || '');
  public _currentLanguage = new BehaviorSubject(this.storageService.getStorageValue(LANGUAGE_KEY) || DEFAULT_LANGUAGE);
  public _currentTheme = new BehaviorSubject(this.storageService.getStorageValue(THEME_KEY) || DEFAULT_THEME);
  public _currentFeatureFaq = new BehaviorSubject('');
  public _currentConfigFaq = new BehaviorSubject('');
  public _currentCookiesConsent = new BehaviorSubject(this.storageService.getStorageValue(COOKIES_CONSENT_KEY) || DEFAULT_COOKIES_CONSENT);
  private sortedEnabledEventArray = [];
  public userLogin: Subject<void | { loginInfo: LoginInfo; redirectUrl?: string; loginType: LoginTypes }> = new Subject<void | any>();
  public userLogout: Subject<void> = new Subject<void>();

  public fullHDEnabled$: Observable<boolean>;
  public doNotDeleteList: Array<string> = DO_NOT_DELETE_LIST;

  public fleetEvents: FleetEvents;

  set currentCookiesConsent(value: CookieConsent) {
    this._currentCookiesConsent.next(value);
  }

  set currentTimeZone(value: string) {
    this._currentTimeZone.next(value);
  }

  set currentMetricUnit(value: string) {
    this._currentMetricUnit.next(value);
  }

  set currentDateFormat(value: string) {
    this._currentDateFormat.next(value);
  }

  set currentFleet(value: string) {
    this._currentFleet.next(value);
  }

  set currentLanguage(value: string) {
    this._currentLanguage.next(value);
  }

  set currentTheme(value: string) {
    this._currentTheme.next(value);
  }

  set currentFeatureFaq(value: string) {
    this._currentFeatureFaq.next(value);
  }

  set currentConfigFaq(value: string) {
    this._currentConfigFaq.next(value);
  }

  public refreshIncidentsList = new Subject<void>();
  refreshIncidentsList$ = this.refreshIncidentsList.asObservable();
  // List of drivers in past 6 months for a fleet
  private fleetDriverListSource: BehaviorSubject<any> = new BehaviorSubject([]);
  public fleetDriverList$ = this.fleetDriverListSource.asObservable();
  // private eventsConfig = EVENTS_CONFIG;
  public eventsConfig;

  constructor(
    private dateService: DateService,
    private storageService: StorageService,
    private commonHttpService: CommonHttpService,
    private http: HttpClient,
    private cacheService: HttpCacheService,
    private location: Location,
    private gtmService: GoogleTagManagerService
  ) {}

  public getCurrentOS() {
    if (navigator.platform.indexOf('Mac') != -1 || navigator.appVersion.indexOf('Mac') != -1) {
      return 'mac';
    }
    return 'windows';
  }

  /**
   * Get list of unique drivers in past 6 month for a fleet
   * @param fleetId Fleet ID
   */
  private getUniqueDriversList(fleetId = '') {
    return new Promise((resolve) => {
      if (!fleetId) {
        resolve(false);
      }
      const { from: driversStartDate, to: driversEndDate } = this.dateService.getDateRangeInISO(30 * 6); // Past 6 months
      const params = new FleetDriverListParams({
        fleetId,
        startDate: driversStartDate,
        endDate: driversEndDate,
      });
      this.commonHttpService.getFleetDriverList(params).subscribe(
        (result: any) => {
          const { data: { drivers = [] } = {} } = result;
          // this.driverList = drivers;
          this.resetFleetDriverList();
          this.fleetDriverListSource.next(drivers);
          resolve(true);
        },
        (err) => {
          console.log('Could not get fleet Driver list', err);
          resolve(err);
        }
      );
    });
  }

  /**
   * Update the unique drivers list for a fleet
   * @param fleetId Fleet ID
   */
  public updateFleetDriverList(fleetId = '') {
    return new Promise((resolve) => {
      if (!fleetId) {
        resolve(false);
        return;
      }
      this.getUniqueDriversList(fleetId)
        .then(() => resolve(true))
        .catch((err) => resolve(err));
    });
  }

  /**
   * Reset unique drivers list
   */
  public resetFleetDriverList() {
    this.fleetDriverListSource.next([]);
  }

  public getCarouselConfiguration(carouselContainerWidth: number) {
    if (carouselContainerWidth <= 480) {
      return {
        carouselCardWidth: carouselContainerWidth,
        totalCardsInDisplay: 1,
      };
    } else if (carouselContainerWidth <= 768) {
      return {
        carouselCardWidth: carouselContainerWidth / 2,
        totalCardsInDisplay: 2,
      };
    } else if (carouselContainerWidth <= 960) {
      return {
        carouselCardWidth: carouselContainerWidth / 3,
        totalCardsInDisplay: 3,
      };
    } else if (carouselContainerWidth <= 1440) {
      return {
        carouselCardWidth: carouselContainerWidth / 4,
        totalCardsInDisplay: 4,
      };
    } else if (carouselContainerWidth <= 1680) {
      return {
        carouselCardWidth: carouselContainerWidth / 5,
        totalCardsInDisplay: 5,
      };
    } else if (carouselContainerWidth <= 1920) {
      return {
        carouselCardWidth: carouselContainerWidth / 5,
        totalCardsInDisplay: 5,
      };
    } else if (carouselContainerWidth > 1920) {
      return {
        carouselCardWidth: carouselContainerWidth / 6,
        totalCardsInDisplay: 6,
      };
    }
  }

  public getAllDriversForAFleet(): Observable<any> {
    return this.http.get(API.GET_REGISTERED_DRIVERS);
  }

  public sendTripFrFeedback(body: any): Observable<any> {
    return this.http.post(API.TRIP_FR_FEEDBACK, body);
  }

  public updateEventMetadata(body: any): Observable<any> {
    return this.http.post(API.UPDATE_EVENT_METADATA, body);
  }

  public updateDvrMetadata(body: any): Observable<any> {
    return this.http.post(API.UPDATE_DVR_METADATA, body);
  }

  /**
   * Get asset list for the provided search string.
   */
  public assetsAutocomplete(params: any): Observable<any> {
    const httpOptions = {
      params,
    };
    return this.http.get(API.ASSETS_AUTOCOMPLETE, httpOptions);
  }

  public driversAutocomplete(params: any): Observable<any> {
    const httpOptions = {
      params,
    };
    return this.http.get(API.DRIVERS_AUTOCOMPLETE, httpOptions);
  }

  public fullHDEnabled(): Observable<boolean> {
    this.fullHDEnabled$ = this.commonHttpService.getFleetSdkConfigurations().pipe(
      map((res) => {
        const fullHDEnabledResolution = AVAILABLE_DUTY_TYPES.map(({ key: dutyType }) => {
          return (res[dutyType] || {}).dvrStoredVideoResolutionRoad;
        });
        return fullHDEnabledResolution.some((e) => e === '1920x1080');
      }),
      catchError(() => {
        return of(false);
      }),
      finalize(() => {
        this.fullHDEnabled$ = null;
      }),
      share()
    );
    return this.fullHDEnabled$;
  }

  public modifyDataBasedOnPageSize(data: any[], positionIndex: number, pageSize: number) {
    if (positionIndex < pageSize) {
      return data.slice(0, pageSize);
    } else if (positionIndex === pageSize) {
      return data.slice(positionIndex, positionIndex + pageSize);
    } else {
      const dataBatchPosition = Math.floor(positionIndex / pageSize);
      const sliceStartIndex = pageSize * dataBatchPosition;
      const sliceEndIndex = sliceStartIndex + pageSize;
      return data.slice(sliceStartIndex, sliceEndIndex);
    }
  }

  public modifyPageIndexBasedOnPageSize(positionIndex: number, pageSize: number) {
    if (positionIndex < pageSize) {
      return positionIndex;
    } else {
      const index = positionIndex % pageSize;
      return index;
    }
  }

  public openFaq(value: string) {
    this.currentFeatureFaq = value;
    this.gtmService.viewFAQ(value);
  }

  public openConfigDescription(desc: string) {
    this.currentConfigFaq = desc;
  }

  public getFaqDetails(faqId: string, params: any): Observable<any> {
    const httpOptions = {
      params,
    };
    return this.http.get(API.GET_FAQ_DETAILS(faqId), httpOptions);
  }

  public getFleetIncidents(params: any, isRefresh?: Boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };

    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_VIOLATIONS);
    }
    return this.http.get(API.GET_VIOLATIONS, httpOptions).pipe(
      map((res: any) => {
        const { rows = [] } = res || {};
        return {
          ...res,
          rows: this.modifyIncidentResponse(rows),
        };
      })
    );
  }

  public requestedVideos(params: any): Observable<any> {
    return this.http.post(API.REQUESTED_VIDEOS, params);
  }

  public getAssetIncidents(params: any, isRefresh?: Boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_ASSET_VIOLATIONS);
    }
    return this.http.get(API.GET_ASSET_VIOLATIONS, httpOptions).pipe(
      map((res: any) => {
        const { rows = [] } = res || {};
        return {
          ...res,
          rows: this.modifyIncidentResponse(rows),
        };
      })
    );
  }

  public modifyIncidentResponse(incidents: any) {
    const combinedEventsList = this.modifyFleeEvents();
    const modifiedEventsConfig = this.transformObject(combinedEventsList);
    this.eventsConfig = modifiedEventsConfig;
    const coachingConfig = this.storageService.getStorageValue('coachingConfig') || {};
    return incidents
      .filter((event: any) => {
        const { eventType } = event || {};
        return this.eventsConfig.hasOwnProperty(eventType);
      })
      .map((event: any, index: number) => {
        const {
          tags = [],
          eventVideoFile = '',
          eventType = '',
          challengeResolvedTimestamp = '',
          timestamp = '',
          timestampUTC = '',
          mediaFiles = [],
        } = event;
        const { uploadStats = {} } = mediaFiles.length && mediaFiles[0];
        const { status } = uploadStats || {};
        const eventTypeLabel = this.eventsConfig[eventType].label || {};
        const mappedTags = tags.map((tag: any) => {
          return EVENT_TAG_KEYS[tag];
        });
        const timeDiff = new Date(timestamp).getTime() - new Date(timestampUTC).getTime();
        const challengeResolvedTimestampLocal = new Date(new Date(challengeResolvedTimestamp).getTime() + timeDiff);
        let enableSelectForCoaching;
        if (Object.keys(coachingConfig).length === 0) {
          enableSelectForCoaching = true;
        } else {
          enableSelectForCoaching = (coachingConfig?.eventTypes || []).includes(eventType);
        }
        return {
          ...event,
          eventTypeLabel,
          eventTags: mappedTags,
          eventVideoFilename: eventVideoFile,
          isVideo: event.videoDetails ? true : false,
          positionIndex: index,
          challengeResolvedTimestampLocal,
          actionLoader: false,
          hasMedia: status == 'UPLOADED',
          enableSelectForCoaching,
        };
      });
  }

  public getAllowedPermissionList(params: any): Observable<ListPermissionsResp> {
    const httpOptions = {
      params: setParams({ ...params, userType: 'fleetmanager' }),
    };
    return this.http.get<ListPermissionsResp>(API.GET_ALLOWED_PERMISSION_LIST, httpOptions);
  }

  public getUsers(params: any, isRefresh?: boolean, isSearch?: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh || isSearch) {
      this.cacheService.burstCache$.next(API.GET_USERS);
    }
    return this.http.get<any>(API.GET_USERS, httpOptions);
  }
  public getSpecificUser(params: any, email: string): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get<any>(API.GET_SPECIFIC_USER(email), httpOptions);
  }

  public createUser(body: any, params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params || {}),
    };
    return this.http.post<any>(API.CREATE_USER, body, httpOptions);
  }

  public updateUser(body: any, params: any, email: string): Observable<any> {
    const httpOptions = {
      params: setParams(params || {}),
    };
    return this.http.patch<any>(API.UPDATE_USER(email), body, httpOptions);
  }

  public deleteUser(params: any, email: string): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.delete<any>(API.DELETE_USER(email), httpOptions);
  }

  public resendTempPassword(params: any, email: string): Observable<any> {
    const httpOptions = {
      params: setParams(params || {}),
    };
    return this.http.post<any>(API.RESEND_TEMP_PASSWORD(email), {}, httpOptions);
  }

  public exportUsers(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get<any>(API.EXPORT_USERS, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  public extractFilename(contentDispositionHeader: string): string {
    return contentDispositionHeader.split(';')[1].trim().split('=')[1].replace(/"/g, '');
  }

  public downloadFile(data: any, filename = 'data', type: string) {
    const blob = new Blob([data], { type });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {
      // if Safari open in new window to save file with random filename.
      downloadLink.setAttribute('target', '_blank');
    }
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', filename);
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  public getUserMFASettings(params: any): Observable<any> {
    return this.http.post(API.USER_MFA_SETTINGS, params);
  }

  public enableMFA(params: any): Observable<any> {
    return this.http.post(API.MFA_ENABLE, params);
  }

  public disableMFA(params: any): Observable<any> {
    return this.http.post(API.MFA_DISABLE, params);
  }

  public changePassword(params: any): Observable<any> {
    return this.http.post(API.CHANGE_PASSWORD, params);
  }

  public adminDisableMFA(params: any, email: string): Observable<any> {
    const httpOptions = {
      params: setParams(params || {}),
    };
    return this.http.post<any>(API.adminDisableMFA(email), {}, httpOptions);
  }

  public updateDriverDetails(body: any): Observable<any> {
    return this.http.patch(API.UPDATE_DRIVER_DETAILS, body);
  }

  public saveDriverConfigConsent(): Observable<any> {
    return this.http.post(API.SAVE_DRIVER_CONFIG_CONSENT, null);
  }

  public getDriverConfigConsent(): Observable<any> {
    return this.http.get(API.GET_DRIVER_CONFIG_CONSENT);
  }

  public back(): void {
    this.location.back();
  }

  public deleteAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + DELETE_COOKIES_START_TIME;
    }
  }

  public deleteFunctionalCookies() {
    const allKeys = Object.keys(localStorage);
    var toBeDeleted = allKeys.filter((value) => {
      return this.doNotDeleteList.every((el) => {
        return value.indexOf(el) === -1;
      });
    });
    toBeDeleted.forEach((value) => {
      localStorage.removeItem(value);
    });
  }

  public submitFeedback(body: any): Observable<any> {
    return this.http.post(API.ADD_WIDGET_TICKET, body);
  }

  public getAssetDetails(params: any) {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get<AssetDetails>(API.GET_ASSET_DETAILS, httpOptions);
  }

  public setFleetEvents(fleetEvents: FleetEvents) {
    this.fleetEvents = fleetEvents;
  }

  public getFleetEvents(): FleetEvents {
    return this.fleetEvents;
  }

  public modifyFleeEvents(rawData?: boolean) {
    const eventConfig = EVENTS_CONFIG;
    let fleetEvents;
    this.commonHttpService.getFleetEvents().subscribe((res) => {
      fleetEvents = res;
      this.setFleetEvents(res);
      const externalPanel = this.mapExternalPanelsWithEnabledInternalPanels(fleetEvents, eventConfig, false);
      const sortedEventConfig = Object.keys(eventConfig)
        .filter((key) => fleetEvents?.standardEvents.some((event) => event?.eventType === key && event?.state === 'ENABLED'))
        .map((key) => this.mapBasicEventConfig(key, eventConfig[key]))
        .sort((a, b) => a?.label.localeCompare(b?.label));

      let customExternalEvents;
      // Filter and sort custom external events
      customExternalEvents = fleetEvents?.customExternalEvents
        .filter((event) => event?.state === 'ENABLED')
        .map(this.mapCustomExternalEvent.bind(this));

      if (rawData) {
        // Filter and map custom external events (reusing the same function)
        customExternalEvents = fleetEvents?.customExternalEvents.map(this.mapCustomExternalEvent.bind(this));
      }

      // Combine EVENT_CONFIG objects and custom external events
      const combinedArray = [...sortedEventConfig, ...customExternalEvents, ...externalPanel];
      const combinedEvents: Array<any> = Object.values(
        combinedArray.reduce((acc, event) => {
          acc[event?.key] = acc[event?.key] || event;
          return acc;
        }, {})
      );
      this.sortedEnabledEventArray = combinedEvents.sort((a, b) => a.label.localeCompare(b.label));
    });
    return this.sortedEnabledEventArray;
  }

  private mapBasicEventConfig(key, config) {
    return {
      key,
      color: config?.color,
      showHighlights: config?.showHighlights,
      showIncidentTrend: config?.showIncidentTrend,
      showIncidentSummary: config?.showIncidentSummary,
      label: config?.label,
      childConfigs: config?.childConfigs || null,
      isDriverFacing: config?.isDriverFacing || null,
    };
  }

  private mapCustomExternalEvent(event) {
    const eventType = event?.eventType;
    const eventName = event?.eventName;
    const color = this.getRandomColor();
    return {
      key: eventType,
      color,
      showHighlights: true,
      showIncidentTrend: true,
      showIncidentSummary: true,
      label: eventName ? eventName : eventType,
    };
  }

  private mapExternalPanelsWithEnabledInternalPanels(fleetEvents: any, eventConfig: any, isIncidentTypeList: boolean) {
    const enabledEventTypes = fleetEvents?.standardEvents.filter((event) => event?.state === 'ENABLED');

    const externalPanelWithInternalPanelEnabled = [];
    const eventTypeSet = new Set(enabledEventTypes.map((item) => item?.eventType));

    for (const key in CONFIGS_WITH_SUBCONFIGS) {
      const subconfig = CONFIGS_WITH_SUBCONFIGS[key];
      for (const eventType of subconfig) {
        if (eventTypeSet.has(eventType)) {
          externalPanelWithInternalPanelEnabled.push(key);
          break;
        }
      }
    }
    if (isIncidentTypeList) {
      const externalPanelWithInternalPanelEnabledMappedArray = externalPanelWithInternalPanelEnabled.map((key) => {
        const foundItem = eventConfig.find((item) => item?.value === key);
        return foundItem;
      });
      return externalPanelWithInternalPanelEnabledMappedArray;
    } else {
      const externalPanelWithInternalPanelEnabledMappedArray = externalPanelWithInternalPanelEnabled.map((key) =>
        this.mapBasicEventConfig(key, eventConfig[key])
      );
      return externalPanelWithInternalPanelEnabledMappedArray;
    }
  }

  public getRandomColor() {
    const predefinedColors = Object.values(EVENTS_CONFIG).map((event) => event.color);
    const letters = '0123456789ABCDEF';
    let color = '#';

    // Try generating a new color up to 100 times
    for (let attempts = 0; attempts < 100; attempts++) {
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      // Check if the generated color is not in the predefined colors and not too dark
      if (!predefinedColors.includes(color) && this.isColorBrightEnough(color)) {
        return color;
      }

      color = '#'; // Reset color if it doesn't meet the criteria
    }

    // If no suitable color is found after 100 attempts, return a default color
    return '#CCCCCC';
  }

  private isColorBrightEnough(hexColor) {
    // Convert hex color to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // calculate relative brightness
    const relativeLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Check if the relative luminance is above a threshold (0.3 in this case)
    return relativeLuminance > 0.3;
  }

  public transformObject(originalData: any[]): any {
    const transformedObject: any = {};

    for (const item of originalData) {
      const key = item.key;
      transformedObject[key] = {
        label: item.label,
        color: item.color,
        showHighlights: item.showHighlights,
        showIncidentTrend: item.showIncidentTrend,
        showIncidentSummary: item.showIncidentSummary,
        showInFilter: item.showInFilter ? item.showInFilter : true,
        childConfigs: item?.childConfigs || null,
        isDriverFacing: item?.isDriverFacing || null,
      };
    }

    const orderedTransformedObject: any = {};

    for (const item of originalData) {
      const key = item.key;
      orderedTransformedObject[key] = transformedObject[key];
    }

    return orderedTransformedObject;
  }

  public modifyIncidentTypeList() {
    const eventConfig = INCIDENT_TYPE_LIST;

    let fleetEvents;
    this.commonHttpService.getFleetEvents().subscribe((res) => {
      fleetEvents = res;
    });

    const externalPanel = this.mapExternalPanelsWithEnabledInternalPanels(fleetEvents, eventConfig, true);

    const filteredEvents = eventConfig
      .filter((value) => {
        // Check if there is any event in fleetEvents.standardEvents that matches the condition
        return fleetEvents.standardEvents.some((event) => event.eventType === value.value && event.state === 'ENABLED');
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const customExternalEvents = fleetEvents.customExternalEvents
      .filter((event) => event.state === 'ENABLED')
      .map((event) => {
        const eventType = event.eventType;
        const eventName = event.eventName;
        return {
          value: eventType,
          label: eventName ? eventName : eventType,
          type: 'INCIDENT',
        };
      });

    const combinedArray = [...filteredEvents, ...customExternalEvents, ...externalPanel];
    const combinedEvents: Array<any> = Object.values(
      combinedArray.reduce((acc, event) => {
        acc[event?.value] = acc[event?.value] || event;
        return acc;
      }, {})
    );

    const sortedEnabledEvents = combinedEvents.sort((a, b) => a.label.localeCompare(b.label));

    if (sortedEnabledEvents.length > 0) {
      sortedEnabledEvents[sortedEnabledEvents.length - 1].showDivider = true;
    }

    const updatedSortedEvents = sortedEnabledEvents.concat(
      {
        label: 'Video Request',
        value: 'dvr',
        type: 'DVR',
      },
      {
        label: CLIENT_CONFIG.externalEventsLabel,
        value: 'externalEvents',
        type: 'EXTERNAL',
        showDivider: true,
      }
    );
    return updatedSortedEvents;
  }

  public getConfigFaqDetails(params: any, eventType: string): Observable<any> {
    const httpOptions = {
      params,
    };
    return this.http.get(API.GET_COFIG_FAQ_DETAILS(eventType), httpOptions);
  }
}
