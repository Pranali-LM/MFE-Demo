import { Injectable } from '@angular/core';
import { DELETE_COOKIES_START_TIME } from '@app-core/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  constructor() {}

  public deleteAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + DELETE_COOKIES_START_TIME;
    }
  }
}
