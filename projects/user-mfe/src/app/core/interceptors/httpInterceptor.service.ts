import { Injectable } from '@angular/core';

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { API } from '@app-core/constants/api.constants';
import { ARCGIS_DOMAIN, AWS_DOMAIN } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthenticationService } from '@app-auth/services/authentication.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  private intermediateServerHost = new URL(environment.intermediate_server_url).host;

  public currentFleet: string;

  constructor(private accessService: AccessService, private dataService: DataService, private authService: AuthenticationService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let postReq;
    /**
     * Get Token from localstorage
     */
    const loginInfo = this.accessService.getLoginInfo();
    this.dataService._currentFleet.subscribe((value: string) => {
      if (value) {
        this.currentFleet = value;
      }
    });
    /**
     * Clone the request object and set the headers
     */
    if (loginInfo && loginInfo.token) {
      let host: string;
      // new URL will throw error if relative url is passed
      if (![API.GEO_JSON, ...API.TRANSLATE_JSON].includes(req.url)) {
        host = new URL(req.url).host;
      }

      if (req.url.includes(ARCGIS_DOMAIN) || req.url.includes(AWS_DOMAIN)) {
        postReq = req.clone({
          withCredentials: host === this.intermediateServerHost,
        });
      } else {
        postReq = req.clone({
          // Set token
          headers: req.headers.set('x-access-token', loginInfo.token).set('acc_name', 'local'),
          withCredentials: host === this.intermediateServerHost,
          setParams:
            req.url.includes(API.EULA_CONSENT) && req.params.has('fleetId')
              ? {}
              : {
                  fleetId: this.currentFleet,
                },
        });
      }
    } else {
      postReq = req.clone();
    }

    return next.handle(postReq).pipe(
      map(this.handleResponse.bind(this)),
      catchError((err: any): Observable<any> => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 0) {
            // show no internet when status is 0
            return throwError('No internet');
          } else if (err.status === 401) {
            // Logout when the token expires
            this.logOut();
            return throwError(err.error || 'Unauthorized');
          }
        }
        return throwError(err);
      })
    );
  }

  /**.
   * Handle response
   */
  private handleResponse(event: HttpEvent<any>): HttpEvent<any> {
    return event;
  }

  /**
   * Handle error response
   * Check for status zero and throw no internet error
   * else forward the error
   */
  // private handleError(err: any): Observable<any> {
  //    if (err instanceof HttpErrorResponse) {
  //       if (err.status === 0) {
  //          // show no internet when status is 0
  //          return throwError('No internet');
  //       } else if (err.status === 401) {
  //          // Logout when the token expires
  //          console.log('came in', err);
  //          this.logOut();
  //          return throwError(err.error || 'Unauthorized');
  //       }
  //    }
  //    return throwError(err);
  // }

  private logOut() {
    this.authService.logout();
  }
}
