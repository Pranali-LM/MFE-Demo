import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DriverStatsParams } from '@app-home/models/home.model';
import { HomeService } from '@app-home/services/home.service';
import { DataService } from '@app-core/services/data/data.service';
import { CLIENT_CONFIG } from '@config/config';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-driver-query-result',
  templateUrl: './driver-query-result.component.html',
  styleUrls: ['./driver-query-result.component.scss'],
})
export class DriverQueryResultComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public showViolationCharts = true;
  @Input()
  public fleetId = '';
  @Input()
  public driverId = '';
  @Input()
  public startDate = '';
  @Input()
  public endDate = '';
  @Input()
  public loader = true;
  @Input()
  public driverTags;
  @Input()
  public driverTagsLoader = true;

  @Output()
  public noOfTrips = new EventEmitter();
  @Output()
  public isCoachingRequired = new EventEmitter();

  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  public currentTimeZone: string;
  public currentDateFormat: string;
  public currentTheme = 'light';

  public driverDetails: any = {};
  public driverIncidents: any[] = [];

  public show = '';
  public loadCharts = false;
  public incidentsChartOptions = {
    title: {
      text: 'Incidents / 100 Miles',
      style: {
        color: 'purple',
      },
    },
    yAxis: {
      title: {
        text: '',
      },
    },
    xAxis: {
      title: {
        text: 'Week',
      },
      categories: [],
    },
    series: [
      {
        data: [],
        name: 'Fleet',
      },
      {
        data: [],
        name: 'Driver',
      },
    ],
  };

  public chartConstructor = 'chart';
  public updateChart = false;
  public tripsLength = 0;
  public driverEventDiffrence = {};
  public totalEventDiff = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeApis: Subject<void> = new Subject<void>();
  public eventList = [];
  public currentMetricUnit = null;
  public clientConfig = CLIENT_CONFIG;

  constructor(private homeService: HomeService, public dataService: DataService) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();

    this.eventList = [
      {
        key: '',
        label: 'All',
      },
      ...combinedEventsList,
    ];

    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
    });
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
    this.dataService._currentDateFormat.subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.dataService._currentTheme.subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeApis.next();
    this.unsubscribeApis.complete();
  }

  public ngOnChanges(): void {
    this.unsubscribeApis.next();
    this.tripsLength = 0;
    this.loadCharts = true;
    this.getData();
  }

  private async getData() {
    this.show = 'loading';
    if (this.driverId) {
      await Promise.all([this.getDriverStats()]);
      this.show = 'content';
    }
  }

  /**
   * @description: Search
   */
  public getDriverStats() {
    this.loader = true;
    return new Promise<void>((resolve) => {
      const driverStatsParams = new DriverStatsParams({
        fleetId: this.fleetId,
        driverId: this.driverId,
        startDate: this.startDate,
        endDate: this.endDate,
        includeEventDiff: true,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });

      this.homeService
        .getDriverStats(driverStatsParams)
        .pipe(
          takeUntil(this.unsubscribeApis),
          finalize(() => {
            resolve();
            this.loader = false;
          })
        )
        .subscribe(
          (result) => {
            const { aggregate: { eventDiff = {}, ...otherDriverDetails } = {} } = result;

            ({ total: { percent: this.totalEventDiff = 0 } = {} } = eventDiff);
            this.driverEventDiffrence = eventDiff;
            this.driverDetails = { ...otherDriverDetails, driverId: this.driverId };
            this.tripsLength = this.driverDetails.tripCount || 0;
            this.noOfTrips.emit(this.tripsLength);
          },
          (err) => {
            this.show = err;
          }
        );
    });
  }

  public coachingRequired(coachReq) {
    this.isCoachingRequired.emit(coachReq);
  }
}
