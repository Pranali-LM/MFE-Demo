import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { EulaConsentService } from '@app-auth/services/eula-consent/eula-consent.service';
import {
  INTERNAL_ROUTES,
  BREAKPOINTS_LANDSCAPE,
  BREAKPOINTS_MEDIUM,
  BREAKPOINTS_SMALL,
  BREAKPOINTS_XSMALL,
  FEATURE_ANNOUNCEMENT_VERSION,
  ROUTER_LINK_PAGE_NAME_MAP,
  PORTAL_RELEASE_VERSION,
} from '@app-core/constants/constants';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
import { LoginFleetInfo } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { DialogService } from '@app-core/services/dialog/dialog.service';
import { GoogleTagManagerService, LogoutTypes, ToggleState } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { UpdateSideNavigationConfig } from '@app-shared/actions/sidenavigation-config.action';
import { UpdateUserPermission } from '@app-shared/actions/user-permission.actions';
import { State } from '@app-shared/reducers/sidenavigation-config.reducer';
import { UpdateUserMetadataReqBody } from '@app-user-management/models/users.model';
import { UserManageService } from '@app-user-management/services/user-manage/user-manage.service';
import { CLIENT_CONFIG } from '@config/config';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { CookieConsentComponent } from '../cookie-consent/cookie-consent.component';
import { FeatureAnnouncementComponent } from '../feature-announcement/feature-announcement.component';
import { PortalSearchComponent } from '../portal-search/portal-search.component';
import { ShortcutsListComponent } from '../shortcuts-list/shortcuts-list.component';
import { TwoFactorAuthenticationComponent } from '../two-factor-authentication/two-factor-authentication.component';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { CookieService } from '@app-core/services/cookie/cookie.service';
import { AuthGuard } from '@app-core/guards/auth/auth.guard';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  public portalReleaseVersion = PORTAL_RELEASE_VERSION;
  public currentTimeZone = '';
  public currentMetricUnit = '';
  public currentDateFormat = '';
  public currentFleetId = '';
  public userFleetList = [];
  public currentRouteName: string;
  public navigationRoutes = [...CLIENT_CONFIG.allowedRoutes];
  public config = CLIENT_CONFIG;
  public loginName = '';
  public loginType: string;
  public userProfileIcon: string;
  public isLogout = false;
  public isTouchDevice = false;
  public isInternalRoute = false;
  public isMobile = false;
  public isTripDetails = false;
  public fleetManagerName: string;
  public currentTheme = 'light';
  public currentOS = 'windows';
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;

  public isSideNavOpen = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public currentLanguage: string;
  public currentCookieConsent = null;
  public currentFleetInfo: LoginFleetInfo;
  private userId: string;

  constructor(
    private accessService: AccessService,
    private dataService: DataService,
    private gtmService: GoogleTagManagerService,
    public router: Router,
    private store: Store<State>,
    private dialog: MatDialog,
    private storageService: StorageService,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private breakpointObserver: BreakpointObserver,
    private keyboardShortcutsService: KeyboardShortcutsService,
    private cookieService: CookieService,
    private userManageService: UserManageService,
    private authGuard: AuthGuard,
    private eulaConsentService: EulaConsentService,
    private dialogService: DialogService
  ) {}

  public ngOnInit() {
    const { loginName = '', fleets = [], name = '', loginType = '', userId } = this.accessService.getLoginInfo();
    this.userId = userId;
    this.loginName = loginName;
    this.userFleetList = fleets;
    this.fleetManagerName = name;
    this.loginType = loginType;
    this.userProfileIcon = this.loginName.slice(0, 1);

    const fullURL = this.router.url;
    const url = fullURL.includes('?') ? fullURL.substr(0, fullURL.indexOf('?')) : fullURL;
    this.currentRouteName = ROUTER_LINK_PAGE_NAME_MAP[url];
    this.isInternalRoute = INTERNAL_ROUTES.includes(url);

    this.currentOS = this.dataService.getCurrentOS();

    this.breakpointObserver.observe(BREAKPOINTS_XSMALL).subscribe((state: BreakpointState) => {
      this.isTouchDevice = state.matches;
    });

    this.breakpointObserver
      .observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM, ...BREAKPOINTS_LANDSCAPE])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentTimeZone = value;
    });

    this.dataService._currentMetricUnit.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentMetricUnit = value;
    });

    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentDateFormat = value;
    });

    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentTheme = value;
    });

    this.dataService._currentCookiesConsent.subscribe((value: string) => {
      this.currentCookieConsent = value;
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentFleetId = value;
        this.currentFleetInfo = fleets.filter((x: any) => x.fleetId === this.currentFleetId)[0];

        this.store.dispatch(
          new UpdateUserPermission({
            currentFleet: this.currentFleetId,
            permissions: this.currentFleetInfo?.role?.permissions,
            uiConfigurations: this.currentFleetInfo?.role?.uiPermissions,
          })
        );

        const { url: fullURL = '' } = this.router || {};
        const url = fullURL.includes('?') ? fullURL.substr(0, fullURL.indexOf('?')) : fullURL;
        const primaryPath = url.split('/')[1];

        const isAccessible = this.authGuard.isRouteAccessible(primaryPath);
        if (!isAccessible) {
          this.router.navigate(['home']);
          return;
        }
      }
    });

    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentLanguage = value;
      this.translate.use(value);
    });

    this.isSideNavOpen = window.innerWidth <= 1440 ? false : true;
    this.store.dispatch(
      new UpdateSideNavigationConfig({
        currentWindowWidth: window.innerWidth,
        isSideNavOpen: this.isSideNavOpen,
      })
    );

    if (url === '/smdrivers/coaching-session') {
      this.closeSideNav();
    }

    this.configureKeyboardShortcuts();
  }

  public ngAfterViewInit() {
    const showFeature = this.storageService.getStorageValue(FEATURE_ANNOUNCEMENT_VERSION);
    if (showFeature === null && !this.isTouchDevice && this.config.showFeatureAnnouncement) {
      setTimeout(() => {
        this.OpenFeatureAnnouncementModal();
        this.storageService.setStorageValue(FEATURE_ANNOUNCEMENT_VERSION, 'hide');
      }, 100);
    } else {
      if (
        (this.currentCookieConsent === null || this.currentCookieConsent?.cookieExpires < new Date().getTime()) &&
        this.loginType === 'fleetmanager'
      ) {
        this.openCookieConsent();
      }
    }
    if (this.currentCookieConsent?.statisticalCookies === false) {
      this.cookieService.deleteAllCookies();
    }
  }

  public profileClick() {
    this.gtmService.profileClick(this.currentFleetInfo.fleetId);
  }

  public async changeUserFleet(fleetId = '') {
    if (fleetId) {
      const alreadyAcceptedEula = await this.eulaConsentService.getEULAconsent(fleetId);
      if (!alreadyAcceptedEula) {
        const dialogRef = this.dialogService.openEULADialog(fleetId);
        const acceptedEULA = await dialogRef.afterClosed().toPromise();
        if (!acceptedEULA) {
          this.authService.logout();
          return;
        }
      }

      this.accessService.currentFleet = fleetId;
      this.dataService.currentFleet = fleetId;
      this.updateUserMetadata({
        preferredFleet: fleetId,
      });
      this.gtmService.switchAccount(fleetId);
    }
  }

  public OpenFeatureAnnouncementModal() {
    this.gtmService.viewFeatureAnnouncementModal(ToggleState.show);
    const dialogRef = this.dialog.open(FeatureAnnouncementComponent, {
      position: { top: '24px' },
      autoFocus: false,
      panelClass: ['custom-dialog'],
    });

    dialogRef.afterClosed().subscribe(() => {
      this.storageService.setStorageValue(FEATURE_ANNOUNCEMENT_VERSION, 'hide');
      this.gtmService.viewFeatureAnnouncementModal(ToggleState.hide);
      if (
        (this.currentCookieConsent === null || this.currentCookieConsent?.cookieExpires < new Date().getTime()) &&
        this.loginType === 'fleetmanager'
      ) {
        this.openCookieConsent();
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.unsubscribe();
  }

  public toggleSideNav() {
    this.gtmService.toggleSideNavigation(this.isSideNavOpen ? ToggleState.hide : ToggleState.show);
    this.isSideNavOpen = !this.isSideNavOpen;
    this.store.dispatch(
      new UpdateSideNavigationConfig({
        currentWindowWidth: window.innerWidth,
        isSideNavOpen: this.isSideNavOpen,
      })
    );
  }

  public privacyPolicy() {
    this.gtmService.privacyPolicy(this.currentFleetInfo.fleetId);
  }

  public updateUserMetadata(metadata: any) {
    if (window.self != window.top) {
      const { userMetadata: oldMetadata = {} } = this.accessService.getLoginInfo();
      const userPrefChangedMessage = {
        type: 'user_preferences_changed',
        userPreferences: {
          ...oldMetadata,
          ...metadata,
        },
      };
      window.parent.postMessage(userPrefChangedMessage, '*');
      return;
    }
    const params = {
      ...metadata,
    };
    const { loginType = '' } = this.accessService.getLoginInfo();
    this.userManageService
      .updateUser(this.userId, new UpdateUserMetadataReqBody(params), loginType)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {},
        () => {}
      );
  }

  public changeTheme() {
    this.gtmService.swtchTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.dataService.currentTheme = this.currentTheme;
    this.accessService.currentTheme = this.currentTheme;
    if (this.currentCookieConsent?.functionalCookies === false) {
      this.dataService.deleteFunctionalCookies();
    }
    this.updateUserMetadata({
      theme: this.currentTheme,
    });
  }

  public openPortalSearch() {
    this.gtmService.portalSearch(ToggleState.show);
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(PortalSearchComponent, {
      width: '640px',
      height: '480px',
      position: {
        top: '24px',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.gtmService.portalSearch(ToggleState.hide);
    });
  }

  public openUserSettings() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(UserSettingsComponent, {
      width: '480px',
      minHeight: '480px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      data: {
        currentDateFormat: this.currentDateFormat,
        currentMetricUnit: this.currentMetricUnit,
        currentTimeZone: this.currentTimeZone,
        currentLanguage: this.currentLanguage,
      },
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const { timezone, metricUnit, dateFormat, language } = data || {};
        this.updateUserMetadata({
          timezone,
          metricUnit,
          dateFormat,
          language,
        });

        this.changeUserSettings({
          timezone,
          metricUnit,
          dateFormat,
          language,
        });
      }
    });
  }

  public openTwoFactorAuthentication() {
    this.dialog.closeAll();
    this.dialog.open(TwoFactorAuthenticationComponent, {
      width: '480px',
      minHeight: '300px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
    });
  }

  public openCookieConsent() {
    this.dialog.closeAll();
    this.dialog.open(CookieConsentComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      width: '480px',
      minHeight: '300px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
    });
  }

  public openChangePassword() {
    this.dialog.closeAll();
    this.dialog.open(ChangePasswordComponent, {
      width: '480px',
      minHeight: '300px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
    });
  }

  public configureKeyboardShortcuts() {
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.viewSettings[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.openUserSettings();
      });

    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.portalSearch[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.openPortalSearch();
      });

    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.switchTheme[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.config.showTheme) {
          this.changeTheme();
        }
      });

    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.toggleSideMenu[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleSideNav();
      });

    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.viewKeyboardShortcuts[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.openShortcutsList();
      });

    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.logout[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (confirm(this.translate.instant('headerComponentLogoutConfirm'))) {
          this.logout();
        }
      });
  }

  public changeUserSettings(data: any) {
    const { timezone, metricUnit, dateFormat, language } = data || {};

    this.accessService.currentLanguage = language;
    this.dataService.currentLanguage = language;

    this.accessService.currentTimeZone = timezone;
    this.dataService.currentTimeZone = timezone;

    this.accessService.currentMetricUnit = metricUnit;
    this.dataService.currentMetricUnit = metricUnit;

    this.accessService.currentDateFormat = dateFormat;
    this.dataService.currentDateFormat = dateFormat;

    if (this.currentCookieConsent?.functionalCookies === false) {
      this.dataService.deleteFunctionalCookies();
    }
  }

  public openShortcutsList() {
    this.gtmService.viewKeyboardShortcuts(ToggleState.show);
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(ShortcutsListComponent, {
      width: '640px',
      minHeight: '640px',
      position: {
        top: '24px',
      },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.gtmService.viewKeyboardShortcuts(ToggleState.hide);
    });
  }

  public logout() {
    this.isLogout = true;
    const { loginType = 'Unknown' } = this.accessService.getLoginInfo();
    this.gtmService.logout(loginType === 'master' ? LogoutTypes.master : LogoutTypes.fleetManager, this.currentFleetId);
    this.authService.logout();
  }

  public closeSideNav() {
    this.isSideNavOpen = false;
    this.gtmService.toggleSideNavigation(this.isSideNavOpen ? ToggleState.hide : ToggleState.show);
    this.store.dispatch(
      new UpdateSideNavigationConfig({
        currentWindowWidth: window.innerWidth,
        isSideNavOpen: this.isSideNavOpen,
      })
    );
  }
}
