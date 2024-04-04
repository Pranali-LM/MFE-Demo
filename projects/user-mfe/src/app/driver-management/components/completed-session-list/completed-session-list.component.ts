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
import { COACHED_SESSION_TABLE } from '@app-coaching/constants/coaching.constants';
import { SessionDetailsModalComponent } from '@app-coaching/components/session-details-modal/session-details-modal.component';

@Component({
  selector: 'app-completed-session-list',
  templateUrl: './completed-session-list.component.html',
  styleUrls: ['./completed-session-list.component.scss'],
})
export class CompletedSessionListComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('sort', { static: true }) public sort: MatSort;
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;

  @Input() public startDate: string;
  @Input() public endDate: string;
  @Input() public fleetId: string;
  @Input() public driverId: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public displayedColumns: string[] = COACHED_SESSION_TABLE;
  public coachableDriverDataSource = new MatTableDataSource<any>([]);
  public eventConfig = EVENTS_CONFIG;
  public tablePageSize = 5;
  public coachedDriverList = [];
  public skip = 0;
  public totalCount = 0;
  public loader = true;

  constructor(public dataService: DataService, private coachingService: CoachingService, public dialog: MatDialog) {}

  ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.skip = event.pageIndex * this.tablePageSize;
      this.getSessionList();
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.startDate && changes.startDate.currentValue) ||
      (changes.endDate && changes.endDate.currentValue) ||
      (changes.fleetId && changes.fleetId.currentValue) ||
      (changes.driverId && changes.driverId.currentValue)
    ) {
      this.getSessionList();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sessionDetails(sessionDetails: any) {
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
    if (this.driverId) {
      params['driverIds[]'] = this.driverId;
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
              duration: this.calculateDuration(item.startTime, item.endTime),
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

  private calculateDuration(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Calculate the difference in milliseconds
    const durationS = (end.getTime() - start.getTime()) / 1000;

    return durationS;
  }

  padNumber(number: number, length: number): string {
    return String(number).padStart(length, '0');
  }
}
