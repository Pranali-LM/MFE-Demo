import { Injectable } from '@angular/core';
import { setParams } from '@app-core/models/core.model';
import { API } from '@app-core/constants/api.constants';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TaggingService {
  public isUpdatingConfig = new BehaviorSubject<boolean>(false);
  public attributeDetails;
  public tagsDetails;
  public entityDetails;
  public optionType;

  constructor(private http: HttpClient, private cacheService: HttpCacheService, private _http: HttpClient) {}

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

  public getFleetCoachConfig(params) {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_COACHING_CONFIG, httpOptions);
  }

  public updateFleetCoachConfig(body: any): Observable<any> {
    const url = API.UPDATE_COACHING_CONFIG;
    return this.patchData(url, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  public addAttributes(body: any): Observable<any> {
    const url = API.ADD_ATTRIBUTES;
    return this.http.post(url, body);
  }

  public deactivateAttributes(body: any, attributeId): Observable<any> {
    const url = API.DEACTIVATE_ATTRIBUTE(attributeId);
    return this.patchData(url, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  public deleteAttributes(attributeId): Observable<any> {
    const url = API.DELETE_ATTRIBUTE_NAME(attributeId);
    return this.http.delete(url);
  }

  public linkAtrributeToEntity(body: any): Observable<any> {
    const url = API.LINK_ATTRIBUTES;
    return this.http.post(url, body);
  }

  public updateTag(tagId: any, body: any, params: any): Observable<any> {
    const url = API.UPDATE_TAGS(tagId);
    return this.patchData(url, body, params).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  public deleteTag(tagId: any, params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    const url = API.DELETE_TAGS(tagId);
    return this.http.delete(url, httpOptions);
  }

  public addTags(body: any): Observable<any> {
    const url = API.ADD_TAGS_TO_ATTRIBUTE;
    return this.http.post(url, body);
  }

  public getAllTagList(params) {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ALL_TAGLIST, httpOptions);
  }

  public getUniqueTagList(params): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_UNIQUE_TAGLIST, httpOptions);
  }

  public getAttributes(params): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ATTRIBUTES_V2, httpOptions);
  }

  public getEntityDetails(params): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ENTITY_DETAILS, httpOptions);
  }

  public addDetails(params: any, body: any): Observable<any> {
    const url = API.ADD_ATTRIBUTES;
    return this.http.post(url, body, params);
  }

  public getAttributeDetails(attributeId: string): Observable<any> {
    const url = API.GET_ATTRIBUTE_DETAILS(attributeId);
    return this.http.get(url);
  }

  public getTagDetails(params, rootTagId: string): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    const url = API.GET_TAG_DETAILS(rootTagId);
    return this.http.get(url, httpOptions);
  }
}
