import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '@app-core/constants/api.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MFAServiceService {
  constructor(private http: HttpClient) {}

  public getUserMFASettings(params: any): Observable<any> {
    return this.http.post(API.USER_MFA_SETTINGS, params);
  }
  public enableMFA(params: any): Observable<any> {
    return this.http.post(API.MFA_ENABLE, params);
  }
  public disableMFA(params: any): Observable<any> {
    return this.http.post(API.MFA_DISABLE, params);
  }
}
