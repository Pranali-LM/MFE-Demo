import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '@app-core/constants/api.constants';
import { DataService } from '@app-core/services/data/data.service';
import { environment } from '@env/environment';
import { CLIENT_CONFIG } from '@config/config';
import { Router } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';
import { LoginInfo } from '@app-core/models/core.model';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public loader = false;
  private defaultRedirectUrl = 'home';

  constructor(private http: HttpClient, private dataService: DataService, private router: Router, private accessService: AccessService) {}

  public intermediateServerLogin(params: any): Observable<LoginInfo> {
    const awsCognitoRegion = this.accessService.getAwsCognitoRegion();
    return this.http.post<LoginInfo>(API.INTERMEDIATE_SERVER_LOGIN, { ...params, region: awsCognitoRegion });
  }

  public intermediateServerMasterLoginAs(params: any): Observable<LoginInfo> {
    return this.http.post<LoginInfo>(API.INTERMEDIATE_SERVER_MASTER_LOGIN_AS, params);
  }

  public intermediateServerAdminLoginAs(params: any): Observable<LoginInfo> {
    return this.http.post<LoginInfo>(API.INTERMEDIATE_SERVER_ADMIN_LOGIN_AS, params);
  }

  public async logout() {
    this.dataService.userLogout.next();
    this.redirectToLandingPage(true);
  }

  private constructQueryParam(query: { [key: string]: any }) {
    return Object.entries(query)
      .filter(([, value]) => typeof value !== 'undefined')
      .map(([key, value]) => {
        if (Array.isArray(value) && value.length) {
          return value
            .filter((v) => typeof v !== 'undefined')
            .map((v) => `${key}[]=${v}`)
            .join('&');
        }
        return `${key}=${value}`;
      })
      .reduce((a, b) => `${a}&${b}`);
  }

  private async getAuthorizationParams(logout = false) {
    const awsCognitoRegion = this.accessService.getAwsCognitoRegion();
    const { domain, clientID } = environment.cognitoConfigs[awsCognitoRegion];
    if (logout && CLIENT_CONFIG.showLandingPage) {
      return {
        domain,
        client_id: clientID,
        logout_uri: environment.callbackURL.replace('/callback', ''),
      };
    }
    return {
      client_id: clientID,
      domain,
      response_type: 'code',
      scope: (environment.scopes || []).join('+'),
      redirect_uri: environment.callbackURL,
    };
  }

  public async authorizeUser() {
    const { domain, ...authorizationParams } = await this.getAuthorizationParams();
    window.location.href = `${API.oauth2Authorization(domain)}?${this.constructQueryParam(authorizationParams)}`;
  }

  public async redirectToLandingPage(logout = false) {
    if (logout) {
      const { domain, ...authorizationParams } = await this.getAuthorizationParams(true);
      window.location.href = `${API.oauth2Logout(domain)}?${this.constructQueryParam(authorizationParams)}`;
    } else if (CLIENT_CONFIG.showLandingPage) {
      this.router.navigate(['/login']);
    } else {
      this.authorizeUser();
    }
  }

  public redirectLoggedInUser(redirectUrl = this.defaultRedirectUrl) {
    this.router.navigateByUrl(redirectUrl);
  }
}
