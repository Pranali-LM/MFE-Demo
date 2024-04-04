import { Component, ViewChild, Input, SimpleChanges, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataService } from '@app-core/services/data/data.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { CoachingService } from '@app-coaching/services/coaching/coaching.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionDetailsModalComponent } from '../session-details-modal/session-details-modal.component';
import { COACHED_DRIVER_TABLE } from '@app-coaching/constants/coaching.constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Store } from '@ngrx/store';
import { getCoachingTags, State } from '@app-coaching/reducers';
@Component({
  selector: 'app-sessions-lists',
  templateUrl: './sessions-lists.component.html',
  styleUrls: ['./sessions-lists.component.scss'],
})
export class SessionsListsComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('sort', { static: true }) public sort: MatSort;
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;

  @Input() public startDate: string;
  @Input() public endDate: string;
  @Input() public fleetId: string;
  @Input() private tagIds: number[] = [];
  @Input() private coachingTags: any[] = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();

  public displayedColumns: string[] = COACHED_DRIVER_TABLE;
  public coachableDriverDataSource = new MatTableDataSource<any>([]);
  public eventConfig = EVENTS_CONFIG;
  public tablePageSize = 5;
  public coachedDriverList = [];
  public skip = 0;
  public totalCount = 0;
  public loader = true;

  constructor(
    public dataService: DataService,
    private coachingService: CoachingService,
    public dialog: MatDialog,
    public gtmService: GoogleTagManagerService,
    private store: Store<State>
  ) {}

  ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.skip = event.pageIndex * this.tablePageSize;
      this.gtmService.changeCoachingPageCompletedCoachingSessionsPageChange(event);
      this.getSessionList();
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
      this.getSessionList();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  public sessionDetails(sessionDetails: any) {
    this.gtmService.viewCompletedCoachingSessionsDetails();
    this.dialog.open(SessionDetailsModalComponent, {
      width: '720px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
      data: {
        details: sessionDetails,
      },
    });
  }

  private getSessionList() {
    this.coachedDriverList = [];
    const params = {
      fleetId: this.fleetId,
      skip: this.skip,
      limit: 5,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    if (this.tagIds && this.tagIds?.length) {
      params['tagIds[]'] = this.tagIds;
    }

    this.loader = true;
    this.coachableDriverDataSource.data = new Array(this.tablePageSize).fill(undefined);
    this.coachingService
      .getSessionList(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          const response = res?.rows || [];
          response?.map((item) => {
            const row = {
              ...item,
            };
            this.coachedDriverList.push(row);
          });
          this.totalCount = res?.totalRows;
          this.coachableDriverDataSource.data = this.coachedDriverList;
          this.coachableDriverDataSource.sort = this.sort;
        },
        () => {
          this.coachedDriverList = [];
          this.coachableDriverDataSource.data = this.coachedDriverList;
          this.totalCount = 0;
        }
      ),
      (error) => {
        console.error(error);
        this.coachedDriverList = [];
        this.coachableDriverDataSource.data = this.coachedDriverList;
        this.totalCount = 0;
      };
  }
}
