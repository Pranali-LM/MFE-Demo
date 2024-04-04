import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';
import { IframeAuthService } from '../../services/iframe-auth/iframe-auth.service';

interface ImplicitLoginParams {
  access_token: string;
  redirect_path?: string;
}

@Component({
  selector: 'app-iframe-implicit-login',
  templateUrl: './iframe-implicit-login.component.html',
  styleUrls: ['./iframe-implicit-login.component.scss'],
})
export class IframeImplicitLoginComponent implements OnInit {
  constructor(private route: ActivatedRoute, private dataService: DataService, private iframeAuthService: IframeAuthService) {}

  public ngOnInit() {
    this.listenParams();
  }

  private listenParams() {
    this.route.queryParams.subscribe((params: ImplicitLoginParams) => this.validateSSOAccessToken(params));
  }

  private validateSSOAccessToken(params: ImplicitLoginParams) {
    const { access_token: ssoAccessToken, redirect_path = 'home' } = params;
    if (ssoAccessToken) {
      this.iframeAuthService.authenticateSSOUser(CLIENT_CONFIG.clientName, ssoAccessToken).subscribe(
        (res) => {
          const loginInfo = { ...res, loginType: 'fleetmanager' };
          this.dataService.userLogin.next({ loginInfo, redirectUrl: redirect_path, loginType: LoginTypes.sso });
        },
        () => {
          this.iframeAuthService.navigateToUnauthorizedErrorPage();
        }
      );
    } else if (this.iframeAuthService.isUserAuthenticated()) {
      this.iframeAuthService.redirectLoggedInUser();
    } else {
      this.iframeAuthService.navigateToUnauthorizedErrorPage();
    }
  }
}
