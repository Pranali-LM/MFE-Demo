import { BlockScrollStrategy, Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';

import { MAT_SELECT_SCROLL_STRATEGY } from '@angular/material/select';

import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { interval, Subject } from 'rxjs';

import { FEATURE_ANNOUNCEMENT_VERSION, ROUTER_LINK_PAGE_NAME_MAP } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { UpdateUserPermission } from '@app-shared/actions/user-permission.actions';
import { State } from '@app-shared/reducers';
import { CLIENT_CONFIG } from '@config/config';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { CookieService } from '@app-core/services/cookie/cookie.service';

export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/**
 * App component
 * TODO: Look at clearLocalIfUsingSession function in access service.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{ provide: MAT_SELECT_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] }],
})
export class AppComponent implements OnInit, AfterViewInit {
  private authRoutes = CLIENT_CONFIG.authRoutes;
  private defaultRedirectUrl = 'home';
  public loading = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @HostListener('window:logout')
  public logout() {
    this.dataService.userLogout.next();
    console.log("user logout");
  }

  constructor(
    private router: Router,
    private accessService: AccessService,
    private dataService: DataService,
    private gtmService: GoogleTagManagerService,
    private storageService: StorageService,
    private cdRef: ChangeDetectorRef,
    private store: Store<State>,
    public translate: TranslateService,
    private overlay: OverlayContainer,
    private auth: AuthenticationService,
    private cookieService: CookieService
  ) {}

  public verifyLogin(): void {
    const { url: activeRoute = '' } = this.router || {};
    const loginStatus = this.isAuthenticUser();
    // Eg., "/trip-details?tripId=abc".split('/')[1] === 'trip-details'
    const primaryPath = activeRoute.split('/')[1];
    if (!loginStatus && !this.authRoutes.includes(primaryPath)) {
      this.auth.redirectToLandingPage();
      return;
    }
  }

  public ngOnInit() {
    if (window.self != window.top) {
      window.addEventListener('message', (event) => {
        if (event?.data && event?.data?.eventType === 'navigation') {
          this.router.navigate([event.data.path]);
        }
      });
    }
    this.subscribeForUserLogin();
    this.subscribeForUserLogout();
    this.subscribeForNavigationChange();
    interval(30000).subscribe(() => this.verifyLogin());

    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value === 'dark') {
        this.overlay.getContainerElement().classList.add('dark-theme');
      } else {
        this.overlay.getContainerElement().classList.remove('dark-theme');
      }
    });

    if (this.isAuthenticUser()) {
      const { customerName } = this.accessService.getLoginInfo();
      this.gtmService.setDataLayerVariables({
        fleetId: this.accessService.currentFleet,
        customerName,
      });
    }
  }

  public ngAfterViewInit() {
    this.dataService._currentCookiesConsent.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      if (value && value.statisticalCookies === true) {
        this.gtmService.gtmConsent('granted', true);
      } else if (value?.statisticalCookies === false) {
        (window as any).clarity('stop');
        this.cookieService.deleteAllCookies();
      }

      if (value && value?.functionalCookies === false) {
        this.dataService.deleteFunctionalCookies();
      }
    });
  }

  private subscribeForNavigationChange() {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          this.cdRef.detectChanges();
          break;
        }

        case event instanceof NavigationEnd: {
          const url = (event as NavigationEnd).url && (event as NavigationEnd).url.split('?')[0];
          const pageTitle = ROUTER_LINK_PAGE_NAME_MAP[url];
          if (pageTitle) {
            this.gtmService.customPageview(url, pageTitle);
          }
        }
        /* falls through */
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          this.cdRef.detectChanges();
          break;
        }

        default:
          break;
      }
    });
  }

  private subscribeForUserLogin() {
    this.dataService.userLogin.subscribe((data) => {
      const { loginInfo, redirectUrl = this.defaultRedirectUrl, loginType } = data || {};
      if (loginInfo) {
        const { userMetadata, fleets = [], customerName = '' } = loginInfo;
        const {
          dateFormat = 'MM/DD/YYYY HH:mm',
          timezone = 'Local',
          metricUnit = 'Miles',
          preferredFleet = '',
          language = 'en',
          theme = 'light',
          cookieConsent = null,
        } = userMetadata;

        const isFleetPresent = fleets.some((fl) => fl.fleetId === preferredFleet);
        const currentUserFleetId = isFleetPresent ? preferredFleet : fleets[0].fleetId;
        const currentFleetInfo = fleets.find((f) => f.fleetId === currentUserFleetId);

        this.accessService.currentTimeZone = timezone;
        this.dataService.currentTimeZone = timezone;

        this.accessService.currentMetricUnit = metricUnit;
        this.dataService.currentMetricUnit = metricUnit;

        this.accessService.currentDateFormat = dateFormat;
        this.dataService.currentDateFormat = dateFormat;

        this.accessService.currentFleet = currentUserFleetId;
        this.dataService.currentFleet = currentUserFleetId;

        this.accessService.currentLanguage = language;
        this.dataService.currentLanguage = language;

        this.accessService.currentTheme = theme;
        this.dataService.currentTheme = theme;

        this.accessService.currentCookiesConsent = cookieConsent;
        this.dataService.currentCookiesConsent = cookieConsent;

        this.store.dispatch(
          new UpdateUserPermission({
            currentFleet: currentUserFleetId,
            permissions: currentFleetInfo?.role?.permissions,
            uiConfigurations: currentFleetInfo?.role?.uiPermissions,
          })
        );

        this.accessService.setLoginInfo(loginInfo);
        this.gtmService.login({
          fleetId: currentUserFleetId,
          customerName,
          loginType,
        });
      }
      if (this.isAuthenticUser()) {
        this.redirectLoggedInUser(redirectUrl);
      }
    });
  }

  private subscribeForUserLogout() {
    this.dataService.userLogout.subscribe(() => {
      this.storageService.clearAll();
      this.storageService.setStorageValue(FEATURE_ANNOUNCEMENT_VERSION, 'hide');
      this.dataService.resetFleetDriverList();
    });
  }

  private isAuthenticUser(): boolean {
    return this.accessService.hasValidToken();
  }

  private redirectLoggedInUser(redirectUrl = this.defaultRedirectUrl) {
    this.router.navigateByUrl(redirectUrl);
  }
}
