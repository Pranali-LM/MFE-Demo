import { Component, ViewChild, Input, SimpleChanges, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataService } from '@app-core/services/data/data.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { CoachingService } from '@app-coaching/services/coaching/coaching.service';
import { COACHABLE_DRIVER_TABLE } from '@app-coaching/constants/coaching.constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Store } from '@ngrx/store';
import { getCoachingTags, State } from '@app-coaching/reducers';
import { StorageService } from '@app-core/services/storage/storage.service';
@Component({
  selector: 'app-coachable-drivers',
  templateUrl: './coachable-drivers.component.html',
  styleUrls: ['./coachable-drivers.component.scss'],
})
export class CoachableDriversComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('sort', { static: true }) public sort: MatSort;
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;

  @Input() public startDate: string;
  @Input() public endDate: string;
  @Input() public fleetId: string;
  @Input() public currentMetricUnit: string;
  @Input() private tagIds: number[] = [];
  @Input() private coachingTags: any[] = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public displayedColumns: string[] = COACHABLE_DRIVER_TABLE;
  public coachableDriverDataSource = new MatTableDataSource<any>([]);
  public eventConfig = EVENTS_CONFIG;
  public tablePageSize = 5;
  public coachableDriverList = [];
  public skip = 0;
  public totalCount = 0;
  public loader = true;
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();

  constructor(
    public dataService: DataService,
    private coachingService: CoachingService,
    private router: Router,
    private gtmService: GoogleTagManagerService,
    private store: Store<State>,
    private storageService: StorageService
  ) {}

  ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.skip = event.pageIndex * this.tablePageSize;
      this.gtmService.changeCoachingPageCoachableDriversPageChange(event);
      this.getCoachReccomendList();
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.coachingTags.length === 0) {
      this.store
        .select(getCoachingTags)
        .pipe(takeUntil(this.ngUnsubscribeOnChanges))
        .subscribe((tagFilter) => {
          const { tagIds } = tagFilter;
          this.tagIds = tagIds;
        });
      this.coachingTags = this.tagIds.length ? this.tagIds.map((tagid) => ({ tagId: tagid })) : [];
    }
    if (
      (changes.startDate && changes.startDate.currentValue) ||
      (changes.endDate && changes.endDate.currentValue) ||
      (changes.fleetId && changes.fleetId.currentValue) ||
      (changes.tagIds && changes.tagIds.currentValue && this.tagIds && this.tagIds?.length) ||
      (changes.coachingTags && changes.coachingTags.currentValue && this.coachingTags) ||
      this.coachingTags?.length
    ) {
      this.skip = 0;
      this.getCoachReccomendList();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  public navigateToCoachingSession(element) {
    this.gtmService.gotoCoachingSessionFromCoachingPage();
    this.router.navigate(['drivers/coaching-session'], {
      queryParams: {
        driverId: element?.driverId || '',
      },
    });
  }

  public navigateToDrivers() {
    this.gtmService.gotoDriversFromCoachingPageCoachableDrivers();
  }

  public getCoachReccomendList() {
    this.loader = true;
    this.coachableDriverDataSource.data = new Array(this.tablePageSize).fill(undefined);
    const coachingConfig = this.storageService.getStorageValue('coachingConfig') || {};
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      fleetId: this.fleetId,
      incidentThreshold: coachingConfig?.minimumEventThreshold || 0,
      limit: this.tablePageSize,
      skip: this.skip,
    };

    if (this.tagIds && this.tagIds?.length) {
      params['tagIds[]'] = this.tagIds;
    }

    this.coachingService
      .getCoachReccomendList(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          const filteredDriverList = res?.rows || [];
          this.coachableDriverList = filteredDriverList;
          this.coachableDriverDataSource.data = this.coachableDriverList;
          this.totalCount = res?.totalCount || 0;
        },
        () => {
          this.coachableDriverList = [];
          this.coachableDriverDataSource.data = this.coachableDriverList;
          this.totalCount = 0;
        }
      ),
      () => {
        this.coachableDriverList = [];
        this.coachableDriverDataSource.data = this.coachableDriverList;
        this.totalCount = 0;
      };
  }
}
