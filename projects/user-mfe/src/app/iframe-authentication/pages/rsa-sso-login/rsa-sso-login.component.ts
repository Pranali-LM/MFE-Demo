import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';
import { IframeAuthService } from '../../services/iframe-auth/iframe-auth.service';

interface RsaSsoLoginParams {
  encrypted_data: string;
}

@Component({
  selector: 'app-rsa-sso-login',
  templateUrl: './rsa-sso-login.component.html',
  styleUrls: ['./rsa-sso-login.component.scss'],
})
export class RsaSsoLoginComponent implements OnInit {
  constructor(private route: ActivatedRoute, private dataService: DataService, private iframeAuthService: IframeAuthService) {}

  public ngOnInit() {
    this.listenParams();
  }

  private listenParams() {
    this.route.queryParams.subscribe((params: RsaSsoLoginParams) => this.validateEncryptedData(params));
  }

  private validateEncryptedData(params: RsaSsoLoginParams) {
    const { encrypted_data: encryptedData } = params;
    if (encryptedData) {
      this.iframeAuthService.authenticateRsaSsoUser(CLIENT_CONFIG.clientName, encryptedData).subscribe(
        (res) => {
          const loginInfo = { ...res, loginType: 'fleetmanager' };
          this.dataService.userLogin.next({ loginInfo, redirectUrl: 'home', loginType: LoginTypes.sso });
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
