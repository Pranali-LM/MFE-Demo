import { Component, OnInit } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { CLIENT_CONFIG } from '@config/config';
import { IframeAuthService } from '../../services/iframe-auth/iframe-auth.service';

@Component({
  selector: 'app-iframe-login',
  templateUrl: './iframe-login.component.html',
  styleUrls: ['./iframe-login.component.scss'],
})
export class IframeLoginComponent implements OnInit {
  constructor(private storageService: StorageService, private dataService: DataService, private iframeAuthService: IframeAuthService) {}

  public ngOnInit() {
    this.validateSSOAccessToken();
  }

  private validateSSOAccessToken() {
    const ssoAuthenticated = this.storageService.getStorageValue((CLIENT_CONFIG.ssoLocalStorageKeys as any).authenticated);
    const ssoAccessToken = this.storageService.getStorageValue((CLIENT_CONFIG.ssoLocalStorageKeys as any).accessToken);
    if (ssoAuthenticated && ssoAccessToken) {
      this.iframeAuthService.authenticateSSOUser(CLIENT_CONFIG.clientName, ssoAccessToken).subscribe(
        (res) => {
          const loginInfo = { ...res, loginType: 'fleetmanager' };
          this.dataService.userLogin.next({ loginInfo, redirectUrl: 'home', loginType: LoginTypes.sso });
        },
        () => {
          this.iframeAuthService.logout();
        }
      );
    } else {
      this.iframeAuthService.redirectToLoginPage();
    }
  }
}
