import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  constructor(private http: HttpClient) {}

  public getAnnouncements(): Observable<any> {
    return this.http.get(API.GET_ANNOUNCEMENTS);
  }
}
