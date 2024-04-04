import { Component, OnInit } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { LoginTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { CLIENT_CONFIG } from '@config/config';
import { GeotabSsoStorageMapping } from '@config/config.base';
import { IframeAuthService } from '../../services/iframe-auth/iframe-auth.service';

@Component({
  selector: 'app-geotab-login',
  templateUrl: './geotab-login.component.html',
  styleUrls: ['./geotab-login.component.scss'],
})
export class GeotabLoginComponent implements OnInit {
  constructor(private storageService: StorageService, private dataService: DataService, private iframeAuthService: IframeAuthService) {}

  public ngOnInit() {
    this.validateSSOState();
  }

  private validateSSOState() {
    const credentials = this.storageService.getStorageValue((CLIENT_CONFIG.ssoLocalStorageKeys as GeotabSsoStorageMapping).credentials);
    const server = this.storageService.getStorageValue((CLIENT_CONFIG.ssoLocalStorageKeys as GeotabSsoStorageMapping).server);
    const { userName = '', sessionId = '', database = '' } = credentials || {};
    if (userName && sessionId && database) {
      const body = { userName, sessionId, database, geotabBaseUrl: `https://${server}` };
      this.iframeAuthService.authenticateGeotabUser(CLIENT_CONFIG.clientName, body).subscribe(
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
