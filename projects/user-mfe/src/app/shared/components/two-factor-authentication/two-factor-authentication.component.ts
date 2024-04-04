import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { LOGOUT_TIME_DURATION_IN_SECS } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import QRCode from 'qrcode';
import { Subject, timer } from 'rxjs';
import { finalize, scan, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-two-factor-authentication',
  templateUrl: './two-factor-authentication.component.html',
  styleUrls: ['./two-factor-authentication.component.scss'],
})
export class TwoFactorAuthenticationComponent implements OnInit, OnDestroy {
  public loader = false;
  public mfaCheckLoader = false;
  public formLoader = false;
  public qrImage: string;
  public mfaEnabled = false;
  public showError = false;
  public showSuccess = false;
  public secretCode: any;
  public setupMFA = false;
  public countdownTimer: number;
  public authenticatorAppCode = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]);

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public dataService: DataService,
    private accessService: AccessService,
    private authenticationService: AuthenticationService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    this.authenticatorAppCode.valueChanges.subscribe((val: any) => {
      this.secretCode = val;
    });

    this.checkUserMFASettings();
  }

  public onSetupMFA() {
    this.setupMFA = true;
  }

  public disableMFA() {
    this.showError = false;
    this.showSuccess = false;
    this.formLoader = true;
    const { cognitoAccessToken = '' } = this.accessService.getLoginInfo();
    this.dataService
      .disableMFA({ cognitoAccessToken, secretCode: this.secretCode })
      .pipe(
        finalize(() => {
          this.formLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.gtmService.updateTwoFactorAuthentication('Disable');
          this.showSuccess = true;
          this.logout();
        },
        () => {
          this.showError = true;
        }
      );
  }

  public enableMFA() {
    this.showError = false;
    this.showSuccess = false;
    this.formLoader = true;
    const { cognitoAccessToken = '' } = this.accessService.getLoginInfo();
    this.dataService
      .enableMFA({ cognitoAccessToken, secretCode: this.secretCode })
      .pipe(
        finalize(() => {
          this.formLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.gtmService.updateTwoFactorAuthentication('Enable');
          this.showSuccess = true;
          this.logout();
        },
        () => {
          this.showError = true;
        }
      );
  }

  public checkUserMFASettings() {
    this.mfaCheckLoader = true;
    this.showError = false;
    this.showSuccess = false;
    const { cognitoAccessToken = '', userMetadata: { mfaEnabled = false } = {} } = this.accessService.getLoginInfo();
    this.dataService
      .getUserMFASettings({ cognitoAccessToken })
      .pipe(
        finalize(() => {
          this.mfaCheckLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res = {}) => {
          const { PreferredMfaSetting, brandName } = res || {};
          if (PreferredMfaSetting || mfaEnabled) {
            this.setupMFA = true;
            this.mfaEnabled = true;
          } else {
            const URI = `otpauth://totp/${decodeURI(`${brandName} Fleet Portal`)}?secret=${res.SecretCode}`;
            QRCode.toDataURL(URI, (err: any, data: any) => {
              if (err) {
                this.showError = true;
              }
              if (data) {
                this.qrImage = data;
              } else {
                this.showError = true;
              }
            });
          }
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
