import { Component, Input } from '@angular/core';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { AccessService } from '@app-core/services/access/access.service';
import { GoogleTagManagerService, LogoutTypes } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  @Input()
  public fleetId = '';

  public isDropdownOpen = false;
  public config = CLIENT_CONFIG;

  constructor(
    private authService: AuthenticationService,
    private gtmService: GoogleTagManagerService,
    private accessService: AccessService
  ) {}

  public logout() {
    const { loginType = 'Unknown' } = this.accessService.getLoginInfo();
    this.gtmService.logout(loginType === 'master' ? LogoutTypes.master : LogoutTypes.fleetManager, this.fleetId);
    this.authService.logout();
  }

  public closeDropdown() {
    this.isDropdownOpen = false;
  }
}
