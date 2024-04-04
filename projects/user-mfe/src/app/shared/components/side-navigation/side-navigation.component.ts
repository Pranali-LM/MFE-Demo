import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, Event, NavigationEnd, NavigationStart } from '@angular/router';
import { PORTAL_RELEASE_VERSION } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { getSideNavigationConfigState } from '@app-shared/reducers';
import { State } from '@app-shared/reducers/sidenavigation-config.reducer';
import { CLIENT_CONFIG, navigationRoutes } from '@config/config';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { skip, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss'],
})
export class SideNavigationComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav', { static: true }) public sideNav: SideNavigationComponent;

  public mobileQuery: MediaQueryList;
  public navigationRoutes = [];
  public isSideNavOpen = false;
  public config = CLIENT_CONFIG;
  private ngUnsubscribe = new Subject();
  public currentTheme = 'light';
  public liveTelematicsEnabled$ = new BehaviorSubject<boolean>(false);
  public isFaqOpened = false;
  public isFaqConfigOpened: boolean = false;
  public configurationId: string;
  public currentLanguage: string;
  public featureId: string;
  public portalReleaseVersion = PORTAL_RELEASE_VERSION;
  public clientConfig = CLIENT_CONFIG;
  public backgroundColor: string;
  public color: string;

  constructor(
    private store: Store<State>,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private liveTelematicsService: LiveTelematicsService,
    private dialog: MatDialog
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 1440px)');
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  public ngOnInit() {
    this.liveTelematicsEnabled$.next(this.activatedRoute.snapshot.data['liveTelematicsEnabled']);
    this.subscribeForLiveTelematicsConfigChange();
    this.subscribeForFleetChange();
    this.subscribeForSideNavConfigChanges();

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        this.closeFaq();
        this.closeConfigFaq();
        this.dialog.closeAll();
      }
    });

    this.dataService._currentTheme.subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
        if (value === 'light' && this.clientConfig?.sideNavColor) {
          this.backgroundColor = this.clientConfig?.sideNavColor?.lightBackgroundColor;
          this.color = this.clientConfig?.sideNavColor?.lightColor;
        } else {
          this.backgroundColor = this.clientConfig?.sideNavColor?.darkBackgroundColor;
          this.color = this.clientConfig?.sideNavColor?.darkColor;
        }
      }
    });

    this.dataService._currentFeatureFaq.subscribe((value: string) => {
      if (value) {
        this.featureId = value;
        this.isFaqOpened = true;
      }
    });

    this.dataService._currentConfigFaq.subscribe((value: string) => {
      if (value) {
        this.configurationId = value;
        this.isFaqConfigOpened = true;
      }
    });

    this.dataService._currentLanguage.subscribe((value: string) => {
      if (value) {
        this.currentLanguage = value;
      }
    });
  }

  public ngOnDestroy() {
    // this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  private subscribeForFleetChange() {
    this.dataService._currentFleet
      .pipe(
        takeUntil(this.ngUnsubscribe),
        skip(1),
        switchMap((fleetId) => {
          if (fleetId) {
            return this.liveTelematicsService.liveTelematicsEnabled();
          }
        })
      )
      .subscribe((value) => this.liveTelematicsEnabled$.next(value));
  }

  private subscribeForLiveTelematicsConfigChange() {
    this.liveTelematicsEnabled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((liveTelematicsEnabled) => {
      this.updateNavigationRoutes(liveTelematicsEnabled);
    });
  }
  private updateNavigationRoutes(LiveViewEnabled?: boolean) {
    if (LiveViewEnabled) {
      this.navigationRoutes = [...navigationRoutes];
    } else {
      this.navigationRoutes = navigationRoutes.filter((r) => r.routerLink !== '/live-view');
      if (this.router.url.split('?')[0] === '/live-view') {
        this.router.navigate(['home']);
      }
    }
  }

  public subscribeForSideNavConfigChanges() {
    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sideNavigationConfigState) => {
        this.isSideNavOpen = sideNavigationConfigState.isSideNavOpen;
      });
  }

  private mobileQueryListener() {
    if (this.changeDetectorRef) {
      this.changeDetectorRef.detectChanges();
    }
  }

  public closeFaq() {
    this.isFaqOpened = false;
    this.featureId = null;
    this.dataService.currentFeatureFaq = null;
  }

  public closeConfigFaq() {
    this.isFaqConfigOpened = false;
    this.configurationId = null;
    this.dataService.currentConfigFaq = null;
  }
}
