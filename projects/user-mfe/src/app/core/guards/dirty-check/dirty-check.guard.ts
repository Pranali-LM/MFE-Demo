import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { DirtyComponent } from '@app-core/models/dirty-check';
import { DialogService } from '@app-core/services/dialog/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DirtyCheckGuard implements CanDeactivate<DirtyComponent> {
  constructor(private dialogService: DialogService, public translate: TranslateService) {}

  public canDeactivate(component: DirtyComponent) {
    return (component.isDirty$ || of(false)).pipe(
      switchMap((dirty) => {
        if (dirty === false) {
          return of(true);
        }

        return this.dialogService.confirm(this.translate.instant('dirtyCheckUnSaveChanges')).pipe(map((status) => status));
      }),
      take(1)
    );
  }
}
