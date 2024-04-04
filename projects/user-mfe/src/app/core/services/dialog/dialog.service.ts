import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EulaComponent } from '@app-auth/pages/eula/eula.component';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Ask user to confirm an action. `message` explains the action and choices.
   * Returns observable resolving to `true`=confirm or `false`=cancel
   */
  public confirm(message?: string): Observable<boolean> {
    const confirmation = window.confirm(message || 'Is it OK?');

    return of(confirmation);
  }

  public openEULADialog(fleetId?: string) {
    const dialogRef = this.dialog.open(EulaComponent, {
      width: '720px',
      position: { top: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        fleetId,
      },
    });

    return dialogRef;
  }
}
