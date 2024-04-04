import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { setParams } from '@app-core/models/core.model';
import {
  LivestreamDetailsBody,
  LivestreamDetailsResp,
  RequestLivestreamBody,
  RequestLivestreamResp,
  ReviewLivestreamBody,
  ReviewLivestreamResp,
  StopLivestreamBody,
  StopLivestreamResp,
} from '@app-core/models/livestream';
import { Observable } from 'rxjs';

@Injectable()
export class LivestreamService {
  constructor(private http: HttpClient) {}

  public requestLivestream(body: RequestLivestreamBody): Observable<HttpResponse<RequestLivestreamResp>> {
    return this.http.post<RequestLivestreamResp>(API.requestLivestream, body, { observe: 'response' });
  }

  public stopLivestream(body: StopLivestreamBody): Observable<StopLivestreamResp> {
    return this.http.post<StopLivestreamResp>(API.stopLivestream, body);
  }

  public reviewLiveStream(body: ReviewLivestreamBody): Observable<ReviewLivestreamResp> {
    return this.http.post<ReviewLivestreamResp>(API.REVIEW_LIVESTREAM, body);
  }

  public getLivestreamDetails(params: LivestreamDetailsBody): Observable<LivestreamDetailsResp> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get<LivestreamDetailsResp>(API.LIVESTREAM_DETAILS, httpOptions);
  }
}
