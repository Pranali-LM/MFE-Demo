import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fleet-manager-login',
  templateUrl: './fleet-manager-login.component.html',
  styleUrls: ['./fleet-manager-login.component.scss'],
})
export class FleetManagerLoginComponent implements OnInit {
  public errorOccured = false;
  public errorMessage = '';
  public clientName = CLIENT_CONFIG.clientName;
  public loading = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private accessService: AccessService,
    public authService: AuthenticationService,
    private dataService: DataService,
    public translate: TranslateService,
    public dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.authService.loader = true;
    this.listenParams();
  }

  private listenParams() {
    this.route.queryParams.subscribe((params: any) => this.validateCode(params));
  }

  private validateCode({ code, error = '' }) {
    if (error) {
      this.errorOccured = true;
      this.errorMessage = `${
        error === 'unauthorized'
          ? this.translate.instant('fleetManagerloginAccessDenied')
          : this.translate.instant('fleetManagerloginSomeThingWntWrong')
      }, ${this.translate.instant('fleetManagerloginRefreshingPage')}`;
      // Delaying logout just to give user some time to read the error message.this.translate.instant('liveViewComponentConnected')
      setTimeout(() => {
        this.authService.logout();
      }, 3000);
    } else if (code) {
      const params = {
        customerName: this.clientName,
        code,
      };
      this.authService
        .intermediateServerLogin(params)
        .pipe(
          finalize(() => (this.authService.loader = false)),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res) => {
            console.warn(res);
            this.accessService.setLoginInfo(res);
            this.dataService.userLogin.next({ loginInfo: res, loginType: LoginTypes.fleetManager });
          },
          () => {
            this.authService.logout();
          }
        );
    } else if (this.accessService.hasValidToken()) {
      this.dataService.userLogin.next();
    } else {
      this.authService.redirectToLandingPage();
    }
  }
}
