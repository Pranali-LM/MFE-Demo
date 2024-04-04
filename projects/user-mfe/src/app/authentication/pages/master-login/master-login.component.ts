import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '@app-auth/services/authentication.service';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-master-login',
  templateUrl: './master-login.component.html',
  styleUrls: ['./master-login.component.scss'],
})
export class MasterLoginComponent implements OnInit {
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

  private listenParams() {
    this.route.queryParams.subscribe((params: any) => this.validateCode(params));
  }

  private validateCode({ code, state = '' }) {
    if (code && state) {
      const [inputCustomerName, inputFleetId] = state.split(' ');
      this.authService
        .intermediateServerMasterLoginAs({
          code,
          customerName: inputCustomerName,
          fleetId: inputFleetId,
        })
        .subscribe(
          (loginInfo: any) => {
            this.dataService.userLogin.next({ loginInfo, redirectUrl: 'home', loginType: LoginTypes.master });
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
