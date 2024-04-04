import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { DataService } from '@app-core/services/data/data.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';

interface AuthenticateGeotabUserBody {
  userName: string;
  database: string;
  sessionId: string;
  geotabBaseUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class IframeAuthService {
  constructor(private http: HttpClient, private dataService: DataService, private router: Router, private accessService: AccessService) {}

  public redirectToLoginPage() {
    const redirectUrl = environment.redirect_url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  public isUserAuthenticated() {
    return this.accessService.isUserAuthenticated();
  }

  public navigateToUnauthorizedErrorPage() {
    this.router.navigateByUrl('/unauthorized-error');
  }

  public redirectLoggedInUser() {
    this.router.navigate(['/home']);
  }

  public authenticateSSOUser(tspName = '', accessToken = ''): Observable<any> {
    if (!tspName) {
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    return this.http.post(API.AUTHENTICATE_SSO_USER(tspName), null, { headers });
  }

  public authenticateGeotabUser(tspName = '', body: AuthenticateGeotabUserBody): Observable<any> {
    if (!tspName) {
      return;
    }
    return this.http.post(API.AUTHENTICATE_GEOTAB_USER(tspName), body);
  }

  public authenticateRsaSsoUser(tspName = '', encryptedData = ''): Observable<any> {
    if (!tspName) {
      return;
    }
    return this.http.post(API.AUTHENTICATE_RSA_SSO_USER(tspName), { encryptedData });
  }

  public logout() {
    this.dataService.userLogout.next();
    const redirectUrl = environment.redirect_url;
    if (redirectUrl) {
      window.location.href = environment.redirect_url;
      return;
    }
  }
}
