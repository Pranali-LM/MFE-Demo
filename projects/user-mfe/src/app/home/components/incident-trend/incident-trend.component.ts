import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';
// import { FleetEventTrendParams } from '@app-home/models/home.model';
import { FleetEventTrendParams } from '@app-home/models/home.model';
import { HomeService } from '@app-home/services/home.service';
import {
  MILES_TO_KILOMETERS_CONVERSION,
  DEFAULT_DARK_THEME_BORDER_COLOR,
  DEFAULT_DARK_THEME_TEXT_COLOR,
  DEFAULT_LIGHT_THEME_BORDER_COLOR,
  DEFAULT_LIGHT_THEME_TEXT_COLOR,
  INCIDENT_TREND_CHART_OPTIONS,
} from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { AbbreviateNumberPipe } from '@app-shared/pipes/abbreviate-number/abbreviate-number.pipe';
@Component({
  selector: 'app-incident-trend',
  templateUrl: './incident-trend.component.html',
  styleUrls: ['./incident-trend.component.scss'],
})
export class IncidentTrendComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public startDate;
  @Input()
  public endDate;
  @Input()
  public fleetId;
  @Input()
  public currentTheme = 'light';
  @Input()
  private selectedTags: number[] = [];

  private unsubscribeOnChanges: Subject<void> = new Subject<void>();
  private unsubscribeOnDestroy: Subject<void> = new Subject<void>();
  private abbreviateNumberPipe = new AbbreviateNumberPipe();

  public ngUnsubscribe = new Subject<void>();
  public data: any = '';
  public loader = true;
  public selectedEventType = new FormControl([]);
  public currentMetricUnit = null;
  public currentLanguage: string;
  public mapTooltipformat: any;
  public eventsPer100Units: any;
  public dataSeries = [];
  public isSuppressed = new FormControl(false);
  public isSuppressedChecked = false;
  public hasInsignificantDistance = false;
  public chart: Chart;
  public eventsConfig = [];

  constructor(
    private homeService: HomeService,
    public dataService: DataService,
    public translate: TranslateService,
    private elementRef: ElementRef
  ) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    this.eventsConfig = combinedEventsList.filter((r) => r['showIncidentTrend']);

    this.dataService._currentMetricUnit.pipe(takeUntil(this.unsubscribeOnDestroy)).subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
        this.getData();
      }
    });

    this.handleEventSelection();
  }

  private handleEventSelection() {
    this.selectedEventType.valueChanges.pipe(takeUntil(this.unsubscribeOnDestroy)).subscribe(() => {
      this.translate.stream('incidentTrend').subscribe((text: string) => {
        this.showData(text, this.isSuppressedChecked);
      });
    });

    this.isSuppressed.valueChanges.pipe(takeUntil(this.unsubscribeOnDestroy)).subscribe((value) => {
      this.isSuppressedChecked = value;
      this.translate.stream('incidentTrend').subscribe((text: string) => {
        this.showData(text, this.isSuppressedChecked);
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

  public ngOnDestroy() {
    this.unsubscribeOnChanges.next();
    this.unsubscribeOnChanges.complete();

    this.unsubscribeOnDestroy.next();
    this.unsubscribeOnDestroy.complete();
  }

  public showData(text: any, isSuppressed?: boolean) {
    if (!this.data) {
      return;
    }
    const labelColorMapping = Object.values(this.eventsConfig).reduce((a, b) => ({ ...a, [b.label]: b.color }), {});
    this.dataSeries = this.data
      .filter(
        (y: any) => (this.selectedEventType.value.length === 0 && y.name === 'Total') || this.selectedEventType.value.includes(y.name)
      )
      .map((x: any) => ({
        ...x,
        data: [
          ...x.data.map(({ date, eventCount, tripDistance, insignificantDistance }) => {
            if (eventCount === null) {
              return { name: date, y: null, tripDistance: 0 };
            }
            const distanceInMiles = this.currentMetricUnit === 'Miles' ? tripDistance / MILES_TO_KILOMETERS_CONVERSION : tripDistance;
            this.eventsPer100Units = Math.round(((eventCount * 100) / (distanceInMiles || 1)) * 100) / 100;
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
              data: insignificantDistance ? (isSuppressed ? 0 : null) : this.eventsPer100Units,
              unit: distanceUnit,
              color: labelColorMapping[x.name] || '#999999',
            };
          }),
        ],

        color: labelColorMapping[x.name],
      }));
    this.dataSeries.map((seriesDataKey, seriesindex) => {
      if (text.trendMapData) {
        text.trendMapData.map((languageDataKey, languageIndex) => {
          if (seriesDataKey.name === languageDataKey.name) {
            this.dataSeries[seriesindex].name = text.trendMapData[languageIndex].Key;
          }
        });
      }
    });
    if (this.dataSeries.length) {
      if (this.chart) {
        this.chart.destroy();
      }
      let labels = [];
      const dataSets = this.dataSeries.map((x, index) => {
        const { data = [] } = x || {};
        labels = [];
        labels = data.map((y: any) => y.label);
        return {
          label: this.dataSeries.map((y: any) => y.name)[index],
          data: data.map((y: any) => y.data),
          tripDistance: data.map((y: any) => y.tripDistance),
          fill: true,
          backgroundColor: data.map((y: any) => {
            return `${y.color}2D`;
          }),
          borderColor: data.map((y: any) => y.color),
          pointBackgroundColor: data.map((y: any) => y.color),
        };
      });
      const ctx: any = this.elementRef.nativeElement.querySelector(`#incidentTrendChart`);
      const chartStatus = Chart.getChart('incidentTrendChart');
      if (chartStatus != undefined) {
        chartStatus.destroy();
      }
      let chartData = {
        ...INCIDENT_TREND_CHART_OPTIONS,
      };
      chartData.options.scales.y.title = {
        ...chartData.options.scales.y.title,
        text: this.currentMetricUnit === 'Miles' ? `${text.incidentTrendGraphYAxisMiles}` : `${text.incidentTrendGraphYAxiskilometers}`,
      };
      const chart = new Chart(ctx, {
        ...chartData,
        data: {
          labels: labels,
          datasets: dataSets,
        },
      } as any);
      this.chart = chart;
      this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value) {
          this.currentLanguage = value;
          if (this.currentLanguage !== 'en') {
            this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
              const { dataset = [], dataIndex = 0 } = data[0] || {};
              const { tripDistance = [] } = dataset;
              const chars = { ',': '.', '.': ',' };
              const distance = tripDistance[dataIndex] ? tripDistance[dataIndex].toString().replace(/[,.]/g, (m) => chars[m]) : 0;
              return [`${text.incidentTrendGraphDistanceToolip}: ${distance} ${this.currentMetricUnit === 'Miles' ? 'mi' : 'km'}`];
            };
            this.chart.update();
          } else {
            this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
              const { dataset = [], dataIndex = 0 } = data[0] || {};
              const { tripDistance = [] } = dataset;
              return [
                `${text.incidentTrendGraphDistanceToolip}: ${tripDistance[dataIndex]} ${this.currentMetricUnit === 'Miles' ? 'mi' : 'km'}`,
              ];
            };
          }
        }
        this.chart.update();
      });

      this.changeTheme();
      this.chart.update();
    }
  }

  public getData() {
    this.loader = true;
    const hasAllRequiredParams = !!(this.startDate && this.endDate && this.fleetId && this.currentMetricUnit);
    if (!hasAllRequiredParams) {
      this.loader = false;
      return;
    }
    const fleetEventTrendParams = new FleetEventTrendParams({
      startDate: this.startDate,
      endDate: this.endDate,
      fleetId: this.fleetId,
      unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
    });
    if (this.selectedTags.length) {
      fleetEventTrendParams['tagIds[]'] = this.selectedTags;
    }
    this.homeService
      .getFleetEventTrend(fleetEventTrendParams)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.unsubscribeOnChanges)
      )
      .subscribe(
        (res: any = {}) => {
          this.data = res.eventTrend;
          // set total fleet event trend in service
          this.homeService.fleetEventsTrendData = this.data
            .filter((y: any) => y.name === 'Total')
            .map((z: any) => ({
              ...z,
              name: 'Fleet',
              data: [
                ...z.data.map(({ date, eventCount, tripDistance }) => {
                  const convertedDistance =
                    this.currentMetricUnit === 'Miles' ? tripDistance / MILES_TO_KILOMETERS_CONVERSION : tripDistance;
                  const eventsPer100Units = Math.round(((eventCount * 100) / (convertedDistance || 1)) * 100) / 100;
                  return [date, eventsPer100Units];
                }),
              ],
            }));
          this.translate.stream('incidentTrend').subscribe((text: string) => {
            this.showData(text, this.isSuppressedChecked);
          });
        },
        () => {
          this.data = [];
          this.loader = false;
        }
      );
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
