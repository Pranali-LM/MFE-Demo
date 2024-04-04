import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-security',
  templateUrl: './user-security.component.html',
  styleUrls: ['./user-security.component.scss'],
})
export class UserSecurityComponent implements OnDestroy {
  public loader = false;
  public showError = false;
  public showSuccess = false;
  private fleetId: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<UserSecurityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gtmService: GoogleTagManagerService
  ) {}

  public adminDisableMFA() {
    this.loader = true;
    this.showError = false;
    this.showSuccess = false;
    const { email = '', name } = this.data || {};
    const params = {
      userType: 'fleetmanager',
      name,
    };
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
    this.gtmService.manageSecurity(this.fleetId);
    this.dataService
      .adminDisableMFA(params, email)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.showSuccess = true;
        },
        () => {
          this.showError = true;
        }
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
