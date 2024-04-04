import { Injectable } from '@angular/core';
import { AWS_COGNITO_REGION_KEY, USER_COUNTRY_KEY } from '@app-core/constants/constants';
import { CLIENT_CONFIG } from '@config/config';
import { DefaultStorageType } from '@config/config.base';

@Injectable()
export class StorageService {
  private storageKeysToRetain = [USER_COUNTRY_KEY, AWS_COGNITO_REGION_KEY];
  private defaultStorage: DefaultStorageType;

  constructor() {
    this.initializeStorageService();
  }

  private initializeStorageService() {
    this.defaultStorage = CLIENT_CONFIG.defaultStorage;
  }

  public setStorageValue(key, value = {}) {
    this[`set${this.defaultStorage}Value`](key, JSON.stringify(value));
  }

  public getStorageValue(key) {
    return this[`get${this.defaultStorage}Value`](key);
  }

  public removeStorageValue(key) {
    this[`remove${this.defaultStorage}Value`](key);
  }

  public setSessionStorageValue(key, value) {
    sessionStorage.setItem(key, value);
  }

  public getSessionStorageValue(key) {
    const value = sessionStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  }

  public removeSessionStorageValue(key) {
    sessionStorage.removeItem(key);
  }

  public setLocalStorageValue(key, value) {
    localStorage.setItem(key, value);
  }

  public getLocalStorageValue(key) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  }

  public removeLocalStorageValue(key) {
    localStorage.removeItem(key);
  }

  public clearAll() {
    const retainStorageObj = this.storageKeysToRetain.reduce((a, key) => {
      return {
        ...a,
        [key]: this.getStorageValue(key),
      };
    }, {});
    localStorage.clear();
    sessionStorage.clear();
    Object.entries(retainStorageObj).forEach(([key, value]) => {
      if (value) {
        this.setStorageValue(key, value);
      }
    });
  }
}
