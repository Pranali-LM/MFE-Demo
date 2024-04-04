import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { AssetTags } from '@app-live-view/models/live-view.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GetAssetEntityTagsResolver implements Resolve<AssetTags[]> {
  constructor(private liveTelematicsService: LiveTelematicsService) {}

  public resolve(): Observable<AssetTags[]> {
    return this.liveTelematicsService.allAssetEntityTags().pipe(catchError(() => of([])));
  }
}
