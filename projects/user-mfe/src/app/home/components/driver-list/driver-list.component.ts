import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss'],
})
export class DriverListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('sort', { static: true })
  public sort: MatSort;
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  @Input()
  public driverList;
  @Input() totalCount: number | undefined;
  @Input()
  public title = 'Driver List';
  @Input()
  public showTopIncident = false;
  @Input()
  public loader = true;
  @Input()
  public listType: string;

  @Output()
  public pageChange = new EventEmitter<PageEvent>();
  @Output()
  private sortChange = new EventEmitter<Sort>();

  public tablePageSize = 5;
  public displayedColumns: string[] = ['driverName', 'eventsPer100Units', 'distance'];
  // public eventsConfig = EVENTS_CONFIG;
  public eventsConfig;
  public driverListDataSource = new MatTableDataSource<any>([]);
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(public dataService: DataService, private gtmService: GoogleTagManagerService) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
    if (this.loader) {
      this.driverListDataSource.data = new Array(5).fill(undefined);
    }
    if (this.showTopIncident) {
      this.displayedColumns.push('topIncident');
    }
    this.driverListDataSource.paginator = this.paginator;
    this.driverListDataSource.sort = this.sort;
    this.sort.sortChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((sort) => {
      this.paginator.firstPage();
      this.sortChange.emit(sort);
    });
  }

  public ngAfterViewInit() {
    /**
     * Set the sort after the view init since this component will
     * be able to query its view for the initialized sort.
     */
    this.driverListDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'driverName':
          return item.driverName || item.driverId || '-';

        case 'topIncident':
          return item.topIncident.value ? this.eventsConfig[item.topIncident.type].label : '-';

        default:
          return item[property];
      }
    };
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.loader) {
      this.driverListDataSource.data = new Array(5).fill(undefined);
    }
    if (changes.driverList && changes.driverList.currentValue) {
      const filteredDriverList = this.driverList;
      this.driverListDataSource.data = filteredDriverList;
      this.driverListDataSource.paginator = this.paginator;
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onDriverClick(driverId: string) {
    if (this.listType === 'topDrivers') {
      this.gtmService.gotoDriversPageFromFleetTopDriversTable(driverId);
    } else {
      this.gtmService.gotoDriversPageFromFleetRequireCoachingTable(driverId);
    }
  }
}
