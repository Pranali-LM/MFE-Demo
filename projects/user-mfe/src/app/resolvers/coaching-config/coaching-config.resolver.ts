import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CoachingConfigResolver implements Resolve<boolean> {
  constructor(private commonHttpService: CommonHttpService, private storageService: StorageService) {}

  public resolve(): Observable<boolean> {
    return this.commonHttpService.getFleetCoachingConfig().pipe(
      tap((res: any) => {
        this.storageService.setStorageValue('coachingConfig', res?.value?.coachingConfig);
      }),
      catchError(() => of(false))
    );
  }
}
