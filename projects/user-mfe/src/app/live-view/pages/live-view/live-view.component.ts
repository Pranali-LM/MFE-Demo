import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { State } from '@app-home/reducers';
import { DataService } from '@app-core/services/data/data.service';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { getSideNavigationConfigState } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Layer } from 'leaflet';
import { BehaviorSubject, EMPTY, forkJoin, fromEvent, of, Subject, timer } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  groupBy,
  ignoreElements,
  map,
  mergeMap,
  skip,
  switchMap,
  takeUntil,
  timeoutWith,
} from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import { LiveViewService } from '@app-live-view/services/live-view/live-view.service';
import { LiveViewMapService } from '@app-live-view/services/live-view-map/live-view-map.service';
import { LiveViewMapComponent } from '@app-live-view/components/live-view-map/live-view-map.component';
import { AssetTags, DeviceState, LiveDevice, LiveTelematicsMessage, LTMessageType } from '@app-live-view/models/live-view.model';
import { GoogleTagManagerService, ToggleState } from '@app-core/services/google-tag-manager/google-tag-manager.service';

import { OrientationBlockerComponent } from '@app-shared/components/orientation-blocker/orientation-blocker.component';
import { BREAKPOINTS_PORTRAIT } from '@app-core/constants/constants';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateLiveViewTagsFilter } from '@app-live-view/actions/live-view.action';
import { State as liveViewState } from '@app-live-view/reducers';
// import { AssetDetailsModalComponent } from '@app-live-view/components/asset-details-modal/asset-details-modal.component';
import { MatDrawer } from '@angular/material/sidenav';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { LIVEVIEW_ASSET_LIST_PAGE_SIZE } from '@app-core/constants/constants';
import { MapboxLiveviewComponent } from '@app-live-view/components/mapbox-liveview/mapbox-liveview.component';
import { LoginFleetInfo } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';

@Component({
  selector: 'app-live-view',
  templateUrl: './live-view.component.html',
  styleUrls: ['./live-view.component.scss'],
  providers: [LiveViewService, LiveViewMapService],
})
export class LiveViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('paginator', { static: true })
  private paginator: MatPaginator;
  @ViewChild('liveViewMap', { static: true })
  private liveViewMap: LiveViewMapComponent;
  @ViewChild(MatDrawer) drawer: MatDrawer;
  @ViewChild('mapboxLiveView', { static: true })
  private mapboxLiveView: MapboxLiveviewComponent;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeSocketEvents = new Subject<void>();
  private zoomedOutViewSocket: Socket;
  private selectedDevice = new BehaviorSubject<LiveDevice>(null);
  private deviceListUpdates$ = new Subject<LiveDevice[]>();

  public allAssets: LiveDevice[] = [];
  public selectedDevice$ = this.selectedDevice.asObservable();
  public viewType = 'table';
  public assetListDataSource = new MatTableDataSource<LiveDevice>([]);
  public dummyAssetListDataSource = new MatTableDataSource(new Array(10).fill({}));
  public loader = false;
  public displayedColumns: string[] = ['assetId', 'actions'];
  public tablePageSize = LIVEVIEW_ASSET_LIST_PAGE_SIZE;
  public currentPageDevices: LiveDevice[] = [];
  public searchAssetIdControl = new FormControl({ value: '', disabled: true });
  public mapWidth: string;
  public translateVal = 0;
  public isSideNavOpen = false;
  public currentTheme = 'light';
  public deviceState = DeviceState;
  public assetCategories = this.fb.group({
    [DeviceState.Active]: true,
    [DeviceState.Inactive]: true,
    [DeviceState.Amber]: true,
  });
  public optionList = [
    {
      id: 'assetId',
      label: 'Search By Asset',
    },
    {
      id: 'tags',
      label: 'Search By Tags',
    },
  ];
  public selectedFilter = new FormControl('assetId');
  private tagIds = [];
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();
  public liveViewTags: any[];
  public zoom = 12;
  public pageIndex = 0;
  private currentFleetInfo: LoginFleetInfo;
  private allAssetEntityTags = new BehaviorSubject<AssetTags[]>([]);
  private unsubscribeLatestTripApi = new Subject<void>();

  constructor(
    private snackBarService: SnackBarService,
    private liveTelematicsService: LiveTelematicsService,
    private liveViewService: LiveViewService,
    private store: Store<State>,
    private liveViewStore: Store<liveViewState>,
    private fb: FormBuilder,
    private dataService: DataService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router,
    private tripDetailsService: TripDetailsService,
    private accessService: AccessService,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit() {
    const { fleets = [] } = this.accessService.getLoginInfo();
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentFleetInfo = fleets.filter((x: any) => x.fleetId === value)[0];
      }
    });
    this.allAssetEntityTags.next(this.activatedRoute.snapshot.data['allAssetEntityTags'] || []);

    this.breakpointObserver
      .observe(BREAKPOINTS_PORTRAIT)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((state: BreakpointState) => {
        if (state.matches && this.router.url === '/live-view') {
          this.dialog.closeAll();
          this.dialog.open(OrientationBlockerComponent, {
            panelClass: ['orientation-modal'],
            data: {
              title: this.translate.instant('appRotateYourDevice'),
              description: this.translate.instant('appRotateYourDeviceToLandscapeDescription'),
              imageUrl: 'assets/common/mobile-rotation-icon.svg',
            },
          });
        }
      });
    this.initializePaginator();
    this.subscribeForSideNavChange();
    this.subscribeSearchByAssetIdFilter();
    this.subscribeForSelectedDeviceChange();
    this.subscribeForDeviceListUpdates();
    this.subscribeForAssetCategoriesChange();
    this.subscribeForFleetChange();

    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.pageIndex = event.pageIndex;
      this.gtmService.changeAssetListLiveViewPageChange(event);
      this.mapboxLiveView.shouldFitBounds = true;
    });
  }

  public ngOnDestroy() {
    if (this.zoomedOutViewSocket.connected) {
      this.zoomedOutViewSocket.disconnect();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeSocketEvents.next();
    this.unsubscribeSocketEvents.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
    this.unsubscribeLatestTripApi.next();
    this.unsubscribeLatestTripApi.complete();
  }

  private searchByAssetFilterPredicate(device: LiveDevice, assetId: string) {
    const assetIdMatches = (device.assetId || '').toLowerCase().startsWith(assetId.toLowerCase());
    const assetNameMatches = (device?.assetName || device?.asset?.assetName || '').toLowerCase().startsWith(assetId.toLowerCase());
    return assetIdMatches || assetNameMatches;
  }

  private moveToFirstPage() {
    this.assetListDataSource.paginator.firstPage();
    // Emitting page event explicitly due to https://github.com/angular/components/issues/8417
    this.assetListDataSource.paginator.page.emit({
      length: this.paginator.length,
      pageIndex: 0,
      pageSize: this.tablePageSize,
    });
  }

  private initializePaginator() {
    this.assetListDataSource.filterPredicate = this.searchByAssetFilterPredicate;
    this.assetListDataSource.paginator = this.paginator;
    this.assetListDataSource.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      if (this.selectedDevice.getValue()) {
        this.selectedDevice.next(null);
      }
    });
  }

  private subscribeForSideNavChange() {
    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sideNavigationConfigState) => {
        const { currentWindowWidth, isSideNavOpen } = sideNavigationConfigState;
        if (currentWindowWidth > 1024 && isSideNavOpen === false) {
          this.isSideNavOpen = false;
        } else if (currentWindowWidth > 1024 && isSideNavOpen) {
          this.isSideNavOpen = true;
        }
        this.adjustMapWidth(currentWindowWidth);
      });
  }

  private subscribeSearchByAssetIdFilter() {
    this.searchAssetIdControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(500),
        map((val) => (val || '').trim()),
        distinctUntilChanged()
      )
      .subscribe((assetId) => {
        this.gtmService.changeLiveviewAssetTypeFilter(assetId);
        this.assetListDataSource.filter = assetId;
        this.moveToFirstPage();
      });
  }

  private subscribeForSelectedDeviceChange() {
    let pointFeatureLayer: Layer;
    this.selectedDevice$.pipe(takeUntil(this.ngUnsubscribe), skip(1)).subscribe((device) => {
      if (pointFeatureLayer) {
        pointFeatureLayer.closePopup();
        pointFeatureLayer = null;
        this.liveViewMap?.recenterMarkers();
      }
      if (device) {
        pointFeatureLayer = this.liveViewMap?.getRealtimeLayer(device.assetId);
      }
    });
  }

  private subscribeForDeviceListUpdates() {
    this.deviceListUpdates$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((updatedDeviceList) => {
      this.assetListDataSource.data = updatedDeviceList;
      if (!updatedDeviceList.length) {
        this.searchAssetIdControl.disable();
      } else {
        this.searchAssetIdControl.enable();
      }
    });
  }

  private subscribeForAssetCategoriesChange() {
    this.assetCategories.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((categoriesState) => {
      const filteredData = this.filterAssetsByCategories(categoriesState);
      this.moveToFirstPage();
      this.deviceListUpdates$.next(filteredData);
    });
  }

  private subscribeForFleetChange() {
    this.dataService._currentFleet
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((fleetId) => {
          if (fleetId) {
            this.moveToFirstPage();
            this.deviceListUpdates$.next([]);
            this.allAssets = [];
            this.searchAssetIdControl.reset();
            this.selectedDevice.next(null);
            this.zoomedOutViewSocket = this.liveTelematicsService.zoomedOutViewSocket;
            this.unsubscribeSocketEvents.next();
            this.unsubscribeLatestTripApi.next();
            this.listenToLiveDevices();
            this.loader = true;
            return forkJoin([this.liveTelematicsService.liveTelematicsEnabled(), this.liveTelematicsService.allAssetEntityTags()]);
          }
        }),
        catchError(() => of([false, []]))
      )
      .subscribe(([liveTelematicsEnabled, allAssetEntityTags]: [boolean, AssetTags[]]) => {
        this.allAssetEntityTags.next(allAssetEntityTags);
        if (liveTelematicsEnabled) {
          this.getLatestTripByAssets();
        }
      });
  }

  private filterAssetsByCategories(categoriesState: { [key: string]: boolean }) {
    const allowedStates = Object.keys(categoriesState).filter((key) => !!categoriesState[key]);
    const filteredData = this.allAssets.filter((device) => {
      return allowedStates.includes(device.state.getValue());
    });
    return filteredData;
  }

  private refreshLiveDevicesList(device: LiveDevice) {
    const { assetId, eventType } = device;
    const updatedDeviceList = [...this.allAssets];
    const existingDeviceIndex = updatedDeviceList.findIndex((d) => d.assetId === assetId);
    const isNewDevice = existingDeviceIndex === -1 && eventType !== 'Vehicle-Ignition-Off';
    const isChangedDevice = existingDeviceIndex > -1 && eventType !== 'Vehicle-Ignition-Off';
    const isRemovedDevice = existingDeviceIndex > -1 && eventType === 'Vehicle-Ignition-Off';
    if (isNewDevice) {
      updatedDeviceList.push(device);
    } else if (isChangedDevice) {
      updatedDeviceList.splice(existingDeviceIndex, 1, device);
    } else if (isRemovedDevice) {
      updatedDeviceList.splice(existingDeviceIndex, 1, device);
    }
    this.allAssets = [...updatedDeviceList];
    const filteredData = this.filterAssetsByCategories(this.assetCategories.value);
    this.updateSelectedDevice(device);
    this.deviceListUpdates$.next(filteredData);
  }

  private updateSelectedDevice(device: LiveDevice) {
    const currentSelectedDevice = this.selectedDevice.getValue();
    const { assetId: currentSelectedAssetId = '' } = currentSelectedDevice || {};
    if (currentSelectedAssetId === device.assetId) {
      this.selectedDevice.next(device);
    }
  }

  private listenToLiveDevices() {
    fromEvent(this.zoomedOutViewSocket, 'connect')
      .pipe(takeUntil(this.unsubscribeSocketEvents))
      .subscribe(() => {
        this.snackBarService.success(this.translate.instant('liveViewComponentConnected'));
      });
    fromEvent(this.zoomedOutViewSocket, 'disconnect')
      .pipe(takeUntil(this.unsubscribeSocketEvents))
      .subscribe(() => {
        this.snackBarService.failure(this.translate.instant('liveViewComponentDisconnected'));
      });
    fromEvent<LiveTelematicsMessage>(this.zoomedOutViewSocket, 'device-update')
      .pipe(
        takeUntil(this.unsubscribeSocketEvents),
        filter((msg) => {
          const { messageType, assetId } = msg.value || {};
          const validMsgType = messageType === LTMessageType.Event || messageType === LTMessageType.Gps;
          return validMsgType && Boolean(assetId);
        }),
        groupBy(
          (msg) => msg.value && msg.value.assetId,
          (msg) => msg,
          (msgsByAssetId$) => msgsByAssetId$.pipe(timeoutWith(30000, EMPTY), ignoreElements())
        ),
        mergeMap((msgsByAssetId$) =>
          msgsByAssetId$.pipe(switchMap((message) => this.liveViewService.formatLiveTelematicsMessage(message)))
        ),
        filter((liveDevice) => {
          const { userTags = [] } = this.currentFleetInfo;
          const userTagIds = userTags.map((t) => t.tagId);
          const allowedTagIds = this.tagIds.length ? this.tagIds : userTagIds;

          if (!allowedTagIds.length) {
            return true;
          }
          const allowedTagsByAttr: { [key: string]: number[] } = allowedTagIds.reduce((acc, tagId) => {
            const attrId = (this.allAssetEntityTags.value || []).find((t) => t.tagId === tagId).attributeId;
            return {
              ...acc,
              [attrId]: [...(acc[attrId] || []), tagId],
            };
          }, {});

          const deviceTagsByAttr: { [key: string]: number[] } = liveDevice.assetTags.reduce((acc, t) => {
            return {
              ...acc,
              [t.attributeId]: [...(acc[t.attributeId] || []), t.tagId],
            };
          }, {});

          const hasAccess = Object.entries(allowedTagsByAttr)
            .map(([attrId, tagIds]) => {
              const attrTagIds = deviceTagsByAttr[attrId] || [];
              const value = attrTagIds.some((tagId) => tagIds.includes(tagId));
              return value;
            })
            .reduce((acc, value) => acc && value);
          return hasAccess;
        })
      )
      .subscribe((liveDevice) => this.refreshLiveDevicesList(liveDevice));
  }

  private getLatestTripByAssets() {
    this.loader = true;
    this.moveToFirstPage();
    this.deviceListUpdates$.next([]);
    this.allAssets = [];
    this.searchAssetIdControl.reset();
    this.selectedDevice.next(null);

    this.liveViewService
      .getLatestTripsByAssets()
      .pipe(
        takeUntil(this.unsubscribeLatestTripApi),
        finalize(() => {
          this.loader = false;
          this.zoomedOutViewSocket.connect();
        })
      )
      .subscribe((activeDevices: LiveDevice[]) => {
        activeDevices.forEach((d) => {
          this.refreshLiveDevicesList(d);
        });
        this.liveViewMap?.recenterMarkers();
        this.mapboxLiveView.shouldFitBounds = true;
      });
  }

  private openSelectedDeviceMarkerPopup() {
    const currentSelectedDevice = this.selectedDevice.getValue();
    if (!currentSelectedDevice) {
      return;
    }
    const pointFeatureLayer = this.liveViewMap?.getRealtimeLayer(currentSelectedDevice.assetId);
    if (pointFeatureLayer) {
      this.liveViewMap.focusDevice(currentSelectedDevice);
      pointFeatureLayer.openPopup();
    } else {
      this.snackBarService.failure(this.translate.instant('liveViewComponentMarkerNotAvailbale'));
    }
  }

  private adjustMapWidth(windowWidth: number) {
    if (windowWidth > 1024) {
      if (this.isSideNavOpen) {
        this.mapWidth = this.viewType === 'table' ? 'calc(100vw - 620px)' : '100vw';
      } else {
        this.mapWidth = this.viewType === 'table' ? 'calc(100vw - 400px)' : '100vw';
      }
    } else {
      this.mapWidth = this.viewType === 'table' ? 'calc(100vw - 400px)' : '100vw';
    }
    this.liveViewMap?.invalidateMapSize();
  }

  public toggleTable() {
    this.viewType = this.viewType === 'table' ? 'map' : 'table';
    this.translateVal = this.viewType === 'table' ? 0 : 400;
    const windowWidth = window.innerWidth;
    this.gtmService.toggleEventsLiveViewTable(this.viewType === 'table' ? ToggleState.show : ToggleState.hide);
    this.adjustMapWidth(windowWidth);
  }

  public onMarkerClick(device: LiveDevice) {
    const currentSelectedDevice = this.selectedDevice.getValue();
    const { assetId: currentSelectedAssetId = '' } = currentSelectedDevice || {};
    switch (device.state.getValue()) {
      case 'AMBER':
        this.gtmService.viewAssetDetails('AMBER', device.assetId);
        break;

      case 'ACTIVE':
        this.gtmService.viewAssetDetails('ACTIVE', device.assetId);
        break;

      default:
        this.gtmService.viewAssetDetails('INACTIVE', device.assetId);
        break;
    }
    if (currentSelectedAssetId !== device.assetId) {
      this.selectedDevice.next(device);
      this.openSelectedDeviceMarkerPopup();
    }
  }

  public async onTableRowClick(device: LiveDevice) {
    const currentSelectedDevice = this.selectedDevice.getValue();
    const { assetId: currentSelectedAssetId = '' } = currentSelectedDevice || {};
    if (currentSelectedAssetId !== device.assetId) {
      this.selectedDevice.next(device);

      const { longitude = 0, latitude = 0 } = device.gpsData || {};
      if (longitude == 0 && latitude == 0) {
        this.snackBarService.failure(this.translate.instant('liveViewComponentMarkerNotAvailbale'));
      } else {
        this.zoom = 22;
        this.assetListDataSource.filter = device.assetId;
      }

      if (device.currentLocationGeocodeDataSub) {
        device.currentLocationGeocodeDataSub.unsubscribe();
      }

      if (device?.state?.getValue() === DeviceState.Active) {
        device.currentLocationGeocodeDataSub = timer(0, 10 * 1000).subscribe(async () => {
          const params = {
            location: `${longitude},${latitude}`,
          };
          const currentGeocodedData = await this.getGeoLocation(params);
          device.currentLocationGeocodeData.next({ location: currentGeocodedData });
        });
      } else {
        const params = {
          location: `${longitude},${latitude}`,
        };
        if (longitude == 0 && latitude == 0) {
          device.currentLocationGeocodeData.next({ location: '' });
        } else {
          const currentGeocodedData = await this.getGeoLocation(params);
          device.currentLocationGeocodeData.next({ location: currentGeocodedData });
        }
      }

      const { longitude: firstLongitude = 0, latitude: firstLatitude = 0 } = device.firstLocation || {};
      if (firstLongitude == 0 && firstLatitude == 0) {
        device.firstLocationGeocodeData.next({ location: '' });
      } else {
        const params = {
          location: `${firstLongitude},${firstLatitude}`,
        };
        const firstGeocodedData = await this.getGeoLocation(params);
        device.firstLocationGeocodeData.next({ location: firstGeocodedData });
      }
      this.drawer.open();
      return;
    }
  }

  public onRecenterBtnClick() {
    this.selectedDevice.next(null);
    this.liveViewMap?.recenterMarkers();
  }

  public navigateToTripDetailsPage(device: LiveDevice) {
    this.liveViewService.navigateToTripDetailsPage(device, 'table');
  }

  public requestLivestreamAction(device: LiveDevice, event?: MouseEvent) {
    const currentSelectedDevice = this.selectedDevice.getValue();
    const { assetId: currentSelectedAssetId = '' } = currentSelectedDevice || {};
    this.gtmService.viewLiveViewVideoAssetListTable(device.assetId);
    this.liveViewService.openLivestreamModal(device);
    const pointFeatureLayer = this.liveViewMap?.getRealtimeLayer(device.assetId);
    if (currentSelectedAssetId === device.assetId || !pointFeatureLayer) {
      event.stopPropagation();
    }
  }

  public selectedTags(tags) {
    this.liveViewStore.dispatch(new UpdateLiveViewTagsFilter({ tagIds: tags }));
    this.tagIds = [];
    if (!this.tagIds.includes(tags)) {
      this.tagIds.push(...tags);
      const uniqueTagIds = Array.from(new Set(this.tagIds));
      this.tagIds = uniqueTagIds;
      this.liveViewService.tagIds = this.tagIds;
      this.unsubscribeLatestTripApi.next();
      this.getLatestTripByAssets();
    }
  }
  public selectFilter(_event) {
    this.liveViewTags = [];
    const result = this.tagIds.map((tagId) => ({ tagId }));
    this.liveViewTags = result;
  }

  public deviceMarkerClick(deviceDetails) {
    this.onTableRowClick(deviceDetails);
  }

  public closeAssetDetails() {
    this.assetListDataSource.filter = '';
    this.moveToFirstPage();
    this.zoom = 12;
    this.drawer.close();
    const currentSelectedDevice = this.selectedDevice.getValue();
    if (currentSelectedDevice?.currentLocationGeocodeDataSub) {
      currentSelectedDevice?.currentLocationGeocodeDataSub.unsubscribe();
    }
  }

  private getGeoLocation(params) {
    this.loader = true;
    return new Promise((resolve, reject) => {
      this.tripDetailsService.getLocationData(params).subscribe(
        (res) => {
          this.loader = false;
          resolve(res);
        },
        (error) => {
          this.loader = false;
          reject(error);
        }
      );
    });
  }
}
