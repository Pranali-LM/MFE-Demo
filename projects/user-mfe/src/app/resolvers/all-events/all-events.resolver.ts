import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AllEventsResolver implements Resolve<boolean> {
  constructor(private commonHttpService: CommonHttpService) {}

  public resolve(): Observable<boolean> {
    return this.commonHttpService.getFleetEvents().pipe(catchError(() => of(false)));
  }
}
