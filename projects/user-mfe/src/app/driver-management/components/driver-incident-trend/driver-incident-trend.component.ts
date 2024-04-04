import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';
import { FormControl } from '@angular/forms';
import { DriverEventTrendParams, FleetEventTrendParams } from '@app-home/models/home.model';
import { HomeService } from '@app-home/services/home.service';
import {
  DEFAULT_DARK_THEME_BORDER_COLOR,
  DEFAULT_DARK_THEME_TEXT_COLOR,
  DEFAULT_LIGHT_THEME_BORDER_COLOR,
  DEFAULT_LIGHT_THEME_TEXT_COLOR,
  INCIDENT_TREND_CHART_OPTIONS,
  MILES_TO_KILOMETERS_CONVERSION,
} from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { AbbreviateNumberPipe } from '@app-shared/pipes/abbreviate-number/abbreviate-number.pipe';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-driver-incident-trend',
  templateUrl: './driver-incident-trend.component.html',
  styleUrls: ['./driver-incident-trend.component.scss'],
})
export class DriverIncidentTrendComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public startDate: string;
  @Input()
  public endDate: string;
  @Input()
  public fleetId: string;
  @Input()
  public driverId: string;
  @Input()
  public enableEventSelection = false;
  @Input()
  public currentTheme = 'light';

  public loader = true;
  private unsubscribeOnChanges: Subject<void> = new Subject<void>();
  private unsubscribeOnDestroy: Subject<void> = new Subject<void>();
  private abbreviateNumberPipe = new AbbreviateNumberPipe();
  public ngUnsubscribe = new Subject<void>();

  public driverEventTrend: any[] = [];
  public fleetEventTrend: any[] = [];
  public eventsList = [];

  public selectedEventType = new FormControl('Total');
  public currentMetricUnit = null;
  public currentLanguage: string;
  public isSuppressed = new FormControl(false);
  public isSuppressedChecked = false;
  public hasInsignificantDistance = false;
  public chart: Chart;
  public modifiedEventList;

  constructor(
    private homeService: HomeService,
    public dataService: DataService,
    public translate: TranslateService,
    private elementRef: ElementRef,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    this.modifiedEventList = combinedEventsList.filter((r) => r['showIncidentTrend']).map((k) => k['label']);
    this.eventsList = ['Total', ...this.modifiedEventList];

    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
        this.getData();
      }
    });

    this.selectedEventType.valueChanges.pipe(takeUntil(this.unsubscribeOnDestroy)).subscribe(() => {
      this.gtmService.changeDriverIncidentTrendIncidentTypeFilter(this.selectedEventType.value);
      this.translate.stream('driverFleetEventGraph').subscribe((langData: string) => {
        this.setUpChart(langData, this.isSuppressedChecked);
      });
    });

    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentLanguage = value;
    });

    this.isSuppressed.valueChanges.pipe(takeUntil(this.unsubscribeOnDestroy)).subscribe((value) => {
      this.isSuppressedChecked = value;
      this.translate.stream('driverFleetEventGraph').subscribe((langData: string) => {
        this.setUpChart(langData, this.isSuppressedChecked);
      });
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    const changedInputs = Object.keys(changes);
    const isOnlyThemeChanged = changedInputs.length === 1 && changedInputs[0] === 'currentTheme';
    if (isOnlyThemeChanged) {
      this.changeTheme();
      return;
    }
    this.unsubscribeOnChanges.next();
    this.getData();
    if (changes.currentTheme) {
      this.changeTheme();
    }
  }

  private async getData() {
    this.loader = true;
    const hasAllRequiredParams = !!(this.startDate && this.endDate && this.fleetId && this.driverId && this.currentMetricUnit);
    if (!hasAllRequiredParams) {
      this.loader = false;
      return;
    }
    await Promise.all([this.getDriverEventTrend(), this.getFleetEventTrend()]);
    this.loader = false;
    this.translate.stream('driverFleetEventGraph').subscribe((langData: string) => {
      this.setUpChart(langData, this.isSuppressedChecked);
    });
  }

  public ngOnDestroy() {
    this.unsubscribeOnChanges.next();
    this.unsubscribeOnChanges.complete();

    this.unsubscribeOnDestroy.next();
    this.unsubscribeOnDestroy.complete();
  }

  private getDriverEventTrend() {
    return new Promise<void>((resolve) => {
      const driverEventTrendParams = new DriverEventTrendParams({
        startDate: this.startDate,
        endDate: this.endDate,
        fleetId: this.fleetId,
        driverId: this.driverId,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });
      this.homeService
        .getDriverEventTrend(driverEventTrendParams)
        .pipe(
          finalize(() => {
            resolve();
          }),
          takeUntil(this.unsubscribeOnChanges)
        )
        .subscribe(
          (res: any = {}) => {
            this.driverEventTrend = res.eventTrend;
          },
          () => {
            this.driverEventTrend = [];
          }
        );
    });
  }

  private getFleetEventTrend() {
    return new Promise<void>((resolve) => {
      const fleetEventTrendParams = new FleetEventTrendParams({
        startDate: this.startDate,
        endDate: this.endDate,
        fleetId: this.fleetId,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });
      this.homeService
        .getFleetEventTrend(fleetEventTrendParams)
        .pipe(
          finalize(() => {
            resolve();
          }),
          takeUntil(this.unsubscribeOnChanges)
        )
        .subscribe(
          (res: any = {}) => {
            this.fleetEventTrend = res.eventTrend;
          },
          () => {
            this.fleetEventTrend = [];
          }
        );
    });
  }

  private setUpChart(langData, isSuppressed?: boolean) {
    const eventType = this.selectedEventType.value || 'Total';
    const [fleetTrendTotal = {}] = this.fleetEventTrend.filter((y) => y.name === eventType);

    const fleetData = fleetTrendTotal?.data?.map(({ date, eventCount, tripDistance, insignificantDistance }) => {
      if (eventCount === null) {
        return { label: date, data: null, tripDistance: 0 };
      }
      const distanceInMiles = this.currentMetricUnit === 'Miles' ? tripDistance / MILES_TO_KILOMETERS_CONVERSION : tripDistance;
      const eventsPer100Units = Math.round(((eventCount * 100) / (distanceInMiles || 1)) * 100) / 100;
      const abbreviatedDistance = this.abbreviateNumberPipe.transform(distanceInMiles, this.currentLanguage);
      const distanceUnit = this.currentMetricUnit === 'Miles' ? 'mi' : 'km';
      if (insignificantDistance) {
        this.hasInsignificantDistance = true;
      }
      return {
        tripDistance: distanceInMiles.toFixed(2),
        abbreviatedDistance,
        distanceUnit,
        label: date,
        data: insignificantDistance ? (isSuppressed ? 0 : null) : eventsPer100Units,
        unit: distanceUnit,
      };
    });
    const [driverTrendTotal = {}] = this.driverEventTrend.filter((y) => y.name === eventType);

    const driverData = (driverTrendTotal.data || []).map(({ date, eventCount, tripDistance, insignificantDistance }) => {
      if (eventCount === null) {
        return { label: date, data: null, tripDistance: 0 };
      }
      const distanceInMiles = this.currentMetricUnit === 'Miles' ? tripDistance / MILES_TO_KILOMETERS_CONVERSION : tripDistance;
      const eventsPer100Units = Math.round(((eventCount * 100) / (distanceInMiles || 1)) * 100) / 100;
      const abbreviatedDistance = this.abbreviateNumberPipe.transform(distanceInMiles);
      const distanceUnit = this.currentMetricUnit === 'Miles' ? 'mi' : 'km';
      if (insignificantDistance) {
        this.hasInsignificantDistance = true;
      }
      return {
        tripDistance: distanceInMiles.toFixed(2),
        abbreviatedDistance,
        distanceUnit,
        label: date,
        data: insignificantDistance ? (isSuppressed ? 0 : null) : eventsPer100Units,
        unit: distanceUnit,
      };
    });

    if (fleetData?.length && driverData?.length) {
      if (this.chart) {
        this.chart.destroy();
      }
      const ctx: any = this.elementRef.nativeElement.querySelector(`#driverIncidentTrendChart`);
      const chartStatus = Chart.getChart('driverIncidentTrendChart');
      if (chartStatus != undefined) {
        chartStatus.destroy();
      }
      let chartData = {
        ...INCIDENT_TREND_CHART_OPTIONS,
      };
      chartData.options.scales.y.title = {
        ...chartData.options.scales.y.title,
        text:
          this.currentMetricUnit === 'Miles' ? `${langData.incidentTrendGraphYAxisMiles}` : `${langData.incidentTrendGraphYAxiskilometers}`,
      };
      const chart = new Chart(ctx, {
        ...chartData,
        data: {
          labels: fleetData.map((x: any) => x.label),
          datasets: [
            {
              label: `${langData.incidentTrendGraphFleetToolip}`,
              data: fleetData.map((x: any) => x.data),
              fill: true,
              backgroundColor: '#7BB4EC2D',
              pointBackgroundColor: '#7BB4EC',
              color: '#7BB4EC',
              tripDistance: fleetData.map((x: any) => x.tripDistance),
            },
            {
              label: `${langData.incidentTrendGraphDriverToolip}`,
              data: driverData.map((x: any) => x.data),
              fill: true,
              backgroundColor: '#FFA5002D',
              pointBackgroundColor: '#FFA500',
              color: '#FFA500',
              tripDistance: driverData.map((x: any) => x.tripDistance),
            },
          ],
        },
      } as any);
      this.chart = chart;
      if (this.currentLanguage !== 'en') {
        this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
          const { dataset = [], dataIndex = 0 } = data[0] || {};
          const { tripDistance = [] } = dataset;
          const chars = { ',': '.', '.': ',' };
          const distance = tripDistance[dataIndex] ? tripDistance[dataIndex].toString().replace(/[,.]/g, (m) => chars[m]) : 0;
          return [`${langData.driverFleetEventGraphDistanceToolip}: ${distance} ${this.currentMetricUnit === 'Miles' ? 'mi' : 'km'}`];
        };
        this.chart.update();
      } else {
        this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
          const { dataset = [], dataIndex = 0 } = data[0] || {};
          const { tripDistance = [] } = dataset;
          return [
            `${langData.driverFleetEventGraphDistanceToolip}: ${tripDistance[dataIndex]} ${
              this.currentMetricUnit === 'Miles' ? 'mi' : 'km'
            }`,
          ];
        };
      }
      this.changeTheme();
      this.chart.update();
    }
  }

  public changeTheme() {
    if (this.chart) {
      if (this.currentTheme === 'light') {
        this.chart.options.plugins.legend.labels.color = DEFAULT_LIGHT_THEME_TEXT_COLOR;
        this.chart.options.scales.y.grid.color = DEFAULT_LIGHT_THEME_BORDER_COLOR;
        this.chart.options.scales.x.ticks.color = DEFAULT_LIGHT_THEME_TEXT_COLOR;
        this.chart.options.scales.y.ticks.color = DEFAULT_LIGHT_THEME_TEXT_COLOR;
      } else {
        this.chart.options.plugins.legend.labels.color = DEFAULT_DARK_THEME_TEXT_COLOR;
        this.chart.options.scales.y.grid.color = DEFAULT_DARK_THEME_BORDER_COLOR;
        this.chart.options.scales.x.ticks.color = DEFAULT_DARK_THEME_TEXT_COLOR;
        this.chart.options.scales.y.ticks.color = DEFAULT_DARK_THEME_TEXT_COLOR;
      }
      this.chart.update();
    }
  }
}
