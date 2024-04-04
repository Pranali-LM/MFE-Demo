import { Injectable } from '@angular/core';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LiveTelematicsResolverService {
  constructor(private liveTelematicsService: LiveTelematicsService) {}

  public resolve(): Observable<boolean> {
    return this.liveTelematicsService.liveTelematicsEnabled().pipe(catchError(() => of(false)));
  }
}
