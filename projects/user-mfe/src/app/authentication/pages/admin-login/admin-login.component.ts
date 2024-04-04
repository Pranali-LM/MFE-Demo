import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '@app-auth/services/authentication.service';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accessService: AccessService,
    private authService: AuthenticationService,
    private dataService: DataService
  ) {}

  public ngOnInit() {
    this.listenParams();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private listenParams() {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => this.validateCode(params));
  }

  private validateCode({ code, state = '' }: { code: string; state: string }) {
    if (code && state) {
      const [inputCustomerName, inputFleetId] = state.split(' ');
      this.authService
        .intermediateServerAdminLoginAs({
          code,
          customerName: inputCustomerName,
          fleetId: inputFleetId,
        })
        .subscribe(
          (loginInfo: any) => {
            this.dataService.userLogin.next({ loginInfo, redirectUrl: 'home', loginType: LoginTypes.admin });
            this.accessService.setLoginInfo(loginInfo);
          },
          () => {
            this.router.navigate(['callback']);
          }
        );
    } else if (this.accessService.hasValidToken()) {
      this.dataService.userLogin.next();
    } else {
      this.router.navigate(['callback']);
    }
  }
}
