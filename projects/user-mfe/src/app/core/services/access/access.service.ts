import { Injectable } from '@angular/core';
import {
  DATE_FORMAT_KEY,
  DEFAULT_TRIP_VIEW,
  FLEET_KEY,
  FLEETMANAGER,
  LOGIN_INFO,
  METRIC_UNIT_KEY,
  TIMEZONE_KEY,
  TRIP_DETAILS_VIEW_TYPE_KEY,
  LANGUAGE_KEY,
  THEME_KEY,
  AWS_COGNITO_REGION_KEY,
  USER_COUNTRY_KEY,
  COOKIES_CONSENT_KEY,
} from '@app-core/constants/constants';
import { TripDetailsViewType } from '@app-core/models/access.model';
import { CookieConsent, LoginInfo } from '@app-core/models/core.model';
import { StorageService } from '@app-core/services/storage/storage.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  constructor(private _storage: StorageService) {}

  public setLoginInfo(info: LoginInfo) {
    this._storage.setStorageValue(LOGIN_INFO, info);
    this.tripDetailsViewType = DEFAULT_TRIP_VIEW;
  }

  public set tripDetailsViewType(viewType: TripDetailsViewType) {
    this._storage.setStorageValue(TRIP_DETAILS_VIEW_TYPE_KEY, viewType);
  }

  public get tripDetailsViewType(): TripDetailsViewType {
    return this._storage.getStorageValue(TRIP_DETAILS_VIEW_TYPE_KEY);
  }

  public set currentCookiesConsent(consent: CookieConsent) {
    this._storage.setStorageValue(COOKIES_CONSENT_KEY, consent);
  }

  public get currentCookiesConsent() {
    return this._storage.getStorageValue(COOKIES_CONSENT_KEY);
  }

  public set currentTimeZone(timeZone: string) {
    this._storage.setStorageValue(TIMEZONE_KEY, timeZone);
  }

  public get currentTimeZone() {
    return this._storage.getStorageValue(TIMEZONE_KEY);
  }

  public set currentMetricUnit(metricUnit: string) {
    this._storage.setStorageValue(METRIC_UNIT_KEY, metricUnit);
  }

  public get currentMetricUnit() {
    return this._storage.getStorageValue(METRIC_UNIT_KEY);
  }

  public set currentDateFormat(dateFormat: string) {
    this._storage.setStorageValue(DATE_FORMAT_KEY, dateFormat);
  }

  public get currentDateFormat() {
    return this._storage.getStorageValue(DATE_FORMAT_KEY);
  }

  public set currentFleet(fleetId: string) {
    this._storage.setStorageValue(FLEET_KEY, fleetId);
  }

  public get currentFleet() {
    return this._storage.getStorageValue(FLEET_KEY);
  }

  public set currentLanguage(language: string) {
    this._storage.setStorageValue(LANGUAGE_KEY, language);
  }

  public get currentLanguage() {
    return this._storage.getStorageValue(LANGUAGE_KEY);
  }

  public set currentTheme(theme: string) {
    this._storage.setStorageValue(THEME_KEY, theme);
  }

  public get currentTheme() {
    return this._storage.getStorageValue(THEME_KEY);
  }

  public getLoginInfo(): LoginInfo {
    return this._storage.getStorageValue(LOGIN_INFO) || {};
  }

  public getUserPermissions(): string[] {
    const { fleets = [] } = this.getLoginInfo();
    const currentFleet = fleets.length && fleets.filter((x: any) => x.fleetId === this.currentFleet)[0];
    return currentFleet?.role?.permissions || [];
  }

  public isAdminRole(): boolean {
    const { fleets = [] } = this.getLoginInfo();
    const currentFleet = fleets.length && fleets.filter((x: any) => x.fleetId === this.currentFleet)[0];
    return currentFleet?.role?.isAdmin || false;
  }

  public isUserAuthenticated(): boolean {
    return this.hasValidToken();
  }

  public isLoggedIn() {
    const loginInfo = this.getLoginInfo();
    return loginInfo && Object.entries(loginInfo).length ? true : false;
  }

  public isFleetManager(): boolean {
    const { userType = '' } = this.getLoginInfo();
    return userType === FLEETMANAGER;
  }

  public hasValidToken(): boolean {
    // Note: Not important to decrypt token and use the value
    // Even if the value is manipulated the user will still be logged in but can't make any API requests - 401
    const { tokenExpiresAt = 0 } = this.getLoginInfo() || {};
    return tokenExpiresAt > Date.now();
  }

  public clearLocalStorage() {
    this._storage.clearAll();
  }

  public getAwsCognitoRegion(): string {
    const defaultAwsCognitoRegion = Object.keys(environment.cognitoConfigs)[0];
    return this._storage.getStorageValue(AWS_COGNITO_REGION_KEY) || defaultAwsCognitoRegion;
  }

  public getUserCountry(): string {
    return this._storage.getStorageValue(USER_COUNTRY_KEY);
  }
}
