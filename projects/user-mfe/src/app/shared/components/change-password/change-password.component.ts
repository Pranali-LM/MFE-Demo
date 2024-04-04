import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { LOGOUT_TIME_DURATION_IN_SECS, PASSWORD_PATTERN } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject, timer } from 'rxjs';
import { finalize, scan, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public hidePreviousPassword = true;
  public hideProposedPassword = true;
  public hideConfirmPassword = true;
  public loader = false;
  public showError = false;
  public showSuccess = false;
  public countdownTimer: number;
  private fleetId: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public changePasswordForm = new FormGroup({
    previousPassword: new FormControl('', Validators.required),
    proposedPassword: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]),
    confirmProposedPassword: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]),
  });

  constructor(
    private dataService: DataService,
    private accessService: AccessService,
    private authenticationService: AuthenticationService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit(): void {
    this.changePasswordForm.valueChanges.subscribe((val) => {
      const { proposedPassword, confirmProposedPassword } = val || {};
      if (proposedPassword !== confirmProposedPassword) {
        this.changePasswordForm.controls['confirmProposedPassword'].setErrors({ incorrect: true });
      } else {
        this.changePasswordForm.controls['confirmProposedPassword'].setErrors(null);
      }
    });
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  public onSubmit() {
    this.loader = true;
    this.showError = false;
    this.showSuccess = false;
    const { cognitoAccessToken = '' } = this.accessService.getLoginInfo();
    const { previousPassword, proposedPassword, confirmProposedPassword } = this.changePasswordForm.getRawValue();
    const params = {
      previousPassword,
      proposedPassword,
      confirmProposedPassword,
      cognitoAccessToken,
    };
    this.gtmService.updateUserPassword(this.fleetId);
    this.dataService
      .changePassword(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        () => {
          this.showSuccess = true;
          this.logout();
        },
        () => {
          this.showError = true;
        }
      );
  }

  private logout() {
    timer(0, 1000)
      .pipe(
        scan((acc) => --acc, LOGOUT_TIME_DURATION_IN_SECS),
        takeWhile((x) => x >= 0)
      )
      .subscribe((val) => {
        this.countdownTimer = val;
        if (val <= 0) {
          this.authenticationService.logout();
        }
      });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
