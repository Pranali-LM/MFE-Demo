import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
@Injectable({
  providedIn: 'root',
})
export class IncidentDetailsService {
  constructor(private http: HttpClient, private cacheService: HttpCacheService, private _http: HttpClient) {}

  /**
   * @description: Creating request object for GET requests
   * @param params
   */
  private setParams(params) {
    return new HttpParams({
      fromObject: params,
    });
  }

  private patchData(url: string, body: any, params?: any) {
    const options = {
      params: this.setParams(params),
    };
    return this._http.patch(url, body, options);
  }

  private getData(url: string, params: any = {}) {
    const options = {
      params: this.setParams(params || {}),
    };
    return this.http.get(url, options);
  }

  public getIncidentDetails(queryParams: any) {
    return this.getData(API.EVENT_DETAILS, queryParams);
  }

  public updateEventTags(body: any, tripId: any, eventIndex: any): Observable<any> {
    const url = API.UPDATE_TAGS_FOR_EVENT(tripId, eventIndex);
    return this.patchData(url, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  public getTagListForEvent(tripId, eventIndex) {
    const url = API.UPDATE_TAGS_FOR_EVENT(tripId, eventIndex);
    return this.http.get(url);
  }
}
