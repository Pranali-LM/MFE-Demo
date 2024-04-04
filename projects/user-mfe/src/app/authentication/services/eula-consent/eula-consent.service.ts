import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { setParams } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root',
})
export class EulaConsentService {
  constructor(
    private translate: TranslateService,
    private snackbarService: SnackBarService,
    private authService: AuthenticationService,
    private accessService: AccessService,
    private http: HttpClient,
    private cacheService: HttpCacheService
  ) {}

  private getCurrentEULAstatus(fleetId?: string): Observable<any> {
    const httpOptions = {
      params: fleetId ? setParams({ fleetId }) : {},
    };
    return this.http.get(API.EULA_CONSENT, httpOptions);
  }

  public saveEULAConsent(body: any, fleetId?: string): Observable<any> {
    const httpOptions = {
      params: fleetId ? setParams({ fleetId }) : {},
    };
    return this.http.post(API.EULA_CONSENT, body, httpOptions).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.EULA_CONSENT);
      })
    );
  }

  public getEULAconsent(fleetId?: string): Promise<boolean> {
    const isLoggedIn = this.accessService.hasValidToken();
    const isEULArequired = this.isEULArequired();
    if (!isLoggedIn || !isEULArequired) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      this.authService.loader = true;
      this.getCurrentEULAstatus(fleetId)
        .pipe(finalize(() => (this.authService.loader = false)))
        .subscribe(
          (res) => {
            const { EULAConsent } = res?.data || {};
            if (EULAConsent === 'ACCEPTED') {
              return resolve(true);
            }
            return resolve(false);
          },
          () => {
            this.snackbarService.failure(this.translate.instant('userEULAfailed'));
            resolve(false);
          }
        );
    });
  }

  private isEULArequired() {
    const loginInfo = this.accessService.getLoginInfo();
    if (
      loginInfo?.customerName === 'platformscience' &&
      !(loginInfo?.loginName?.includes('lightmetrics.co') || loginInfo?.loginName?.includes('platformscience.com'))
    ) {
      return true;
    } else {
      return false;
    }
  }

  public logout() {
    this.authService.logout();
  }
}
