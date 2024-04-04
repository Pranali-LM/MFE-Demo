import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  DEFAULT_DARK_THEME_BORDER_COLOR,
  DEFAULT_DARK_THEME_TEXT_COLOR,
  DEFAULT_LIGHT_THEME_BORDER_COLOR,
  DEFAULT_LIGHT_THEME_TEXT_COLOR,
  SENSOR_PROFILE_CHART_ANNOTATION,
  SENSOR_PROFILE_CHART_OPTIONS,
} from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);
@Component({
  selector: 'app-sensor-profile',
  templateUrl: './sensor-profile.component.html',
  styleUrls: ['./sensor-profile.component.scss'],
})
export class SensorProfileComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('accProfileRef') public accProfileRef: ElementRef;
  @Input() public incidentDetails: any;
  @Input() public translateVal = 0;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public accProfileLoader = false;
  public isChartDataAvailable = false;
  public currentLanguage: string;
  public updatedTranslateVal: number;
  public currentTheme = 'light';
  public chart: Chart;
  public sensorProfileAccelerationText = 'Acceleration (g)';

  constructor(
    private tripDetailsService: TripDetailsService,
    public translate: TranslateService,
    private dataService: DataService,
    private elementRef: ElementRef
  ) {}

  public ngOnInit() {
    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
        this.changeTheme();
      }
    });
    this.translate.get('sensorProfileAcceleration').subscribe((text: string) => {
      this.sensorProfileAccelerationText = text;
    });
    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.currentLanguage = value;
    });
    this.getAccProfile();
  }

  public ngOnChanges() {
    if (this.translateVal > 0 && this.accProfileRef) {
      const accProfileWidth = this.accProfileRef.nativeElement.clientWidth - 88;
      this.updatedTranslateVal = (accProfileWidth / 100) * this.translateVal;
    }
  }

  private getAccProfile() {
    const {
      tripId = '',
      driverId = '',
      eventIndex = '',
      uploadRequestId = '',
      isDvrEvent = false,
      accProfileUploaded,
    } = this.incidentDetails || {};

    if (accProfileUploaded !== undefined && accProfileUploaded === false) {
      this.isChartDataAvailable = false;
      return;
    }

    this.accProfileLoader = true;
    const options = {
      tripId,
      driverId,
      ...(isDvrEvent ? { uploadRequestId } : { eventIndex }),
      includeInertialSensorData: true,
    };
    const API = isDvrEvent ? this.tripDetailsService.getDvrDetails(options) : this.tripDetailsService.getEventDetails(options);
    API.pipe(
      finalize(() => {
        this.accProfileLoader = false;
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      (res: any) => {
        const { eventType = '', inertialSensorData: { accelerometer: accelerometerProfile = [], accelerationThreshold = 0 } = {} } =
          res || {};
        this.isChartDataAvailable = !!(Array.isArray(accelerometerProfile) && accelerometerProfile.length);
        if (!this.isChartDataAvailable) {
          return;
        }
        const { series, timeCategory = [], minYaxis, maxYaxis } = this.prepareChartData(accelerometerProfile, eventType);
        if (series.length) {
          if (this.chart) {
            this.chart.destroy();
          }
          const [val1, val2] = this.getThresholdLines(eventType, accelerationThreshold);
          const ctx: any = this.elementRef.nativeElement.querySelector(`#incidentSensorProfileChart`);
          const chartStatus = Chart.getChart('incidentSensorProfileChart');
          if (chartStatus != undefined) {
            chartStatus.destroy();
          }
          let chartData = {
            ...SENSOR_PROFILE_CHART_OPTIONS,
          };
          chartData.options.scales.y.title = {
            ...chartData.options.scales.y.title,
            text: this.sensorProfileAccelerationText,
          };
          const chart = new Chart(ctx, {
            ...chartData,
            data: {
              labels: timeCategory,
              datasets: series,
            },
          } as any);
          this.chart = chart;
          if (val1) {
            this.chart.options.plugins.annotation.annotations[0] = {
              ...SENSOR_PROFILE_CHART_ANNOTATION,
              yMin: val1,
              yMax: val1,
            };
            this.chart.options.scales.y.min = minYaxis;
          }
          if (val2) {
            this.chart.options.plugins.annotation.annotations[1] = {
              ...SENSOR_PROFILE_CHART_ANNOTATION,
              yMin: val2,
              yMax: val2,
            };
            this.chart.options.scales.y.max = maxYaxis;
          }
          if (this.currentLanguage !== 'en') {
            chartData.options.scales.y.ticks.callback = (data) => {
              const chars = { ',': '.', '.': ',' };
              const formatNumber = data.toFixed(2);
              return formatNumber > 0 || formatNumber < 0 ? formatNumber.toString().replace(/[,.]/g, (m) => chars[m]) : formatNumber;
            };
            this.chart.options.plugins.tooltip.callbacks = {
              ...this.chart.options.plugins.tooltip.callbacks.afterBody,
              label: (tooltipItem) => {
                const chars = { ',': '.', '.': ',' };
                return `${tooltipItem.dataset.label}: ${
                  tooltipItem.formattedValue ? tooltipItem.formattedValue.toString().replace(/[,.]/g, (m) => chars[m]) : 0
                }`;
              },
            };
          } else {
            chartData.options.scales.y.ticks.callback = (data) => {
              return data.toFixed(2);
            };
            this.chart.options.plugins.tooltip.callbacks = {
              ...this.chart.options.plugins.tooltip.callbacks.afterBody,
              label: (tooltipItem) => {
                return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
              },
            };
          }
          this.changeTheme();
          this.chart.update();
        }
      },
      () => {
        this.isChartDataAvailable = false;
      }
    );
  }

  private prepareChartData(accelerometerProfile = [], eventType = '') {
    const {
      yAxis = [],
      zAxis = [],
      timeCategory = [],
    } = accelerometerProfile.reduce(
      (a, b) => {
        const { axes: { y = 0, z = 0 } = {}, timeOfDay = '' } = b || {};
        return {
          ...a,
          yAxis: [...a.yAxis, y === null ? null : this.convertFromMtrPerSecSqrToG(y)],
          zAxis: [...a.zAxis, z === null ? null : -this.convertFromMtrPerSecSqrToG(z)],
          timeCategory: [...a.timeCategory, timeOfDay],
        };
      },
      { yAxis: [], zAxis: [], timeCategory: [] }
    );

    const minYaxis = Math.min(...zAxis, ...yAxis) || -0.5;
    const maxYaxis = Math.max(...zAxis, ...yAxis) || 0.5;

    return {
      minYaxis: minYaxis > -0.5 ? -0.5 : minYaxis,
      maxYaxis: maxYaxis < 0.5 ? 0.5 : maxYaxis,
      series: [
        {
          label: this.translate.instant('sensorProfileForward'),
          data: zAxis,
          hidden: eventType === 'Cornering',
          backgroundColor: this.currentTheme === 'light' ? '#0077E4' : '#6AB8FF',
          borderColor: this.currentTheme === 'light' ? '#0077E4' : '#6AB8FF',
          pointBackgroundColor: this.currentTheme === 'light' ? '#0077E4' : '#6AB8FF',
          pointRadius: 2,
          pointHoverRadius: 4,
        },
        {
          label: this.translate.instant('sensorProfileLateral'),
          data: yAxis,
          hidden: ['Harsh-Braking', 'Harsh-Acceleration'].includes(eventType),
          backgroundColor: this.currentTheme === 'light' ? '#169F00' : '#42FF00',
          borderColor: this.currentTheme === 'light' ? '#169F00' : '#42FF00',
          pointBackgroundColor: this.currentTheme === 'light' ? '#169F00' : '#42FF00',
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
      timeCategory,
    };
  }

  private convertFromMtrPerSecSqrToG(value = 0) {
    return Number((value / 9.80665).toFixed(2));
  }

  private getThresholdLines(eventType = '', accelerationThreshold: any) {
    const eventsOfInterest = ['Cornering', 'Harsh-Braking', 'Harsh-Acceleration'];
    if (!eventType || !accelerationThreshold || !eventsOfInterest.includes(eventType)) {
      return [];
    }
    // accelerationThreshold will be in miles per hour per sec
    // Multiple by 0.44704 to convert to meters per sec per sec
    const thresholdInG = this.convertFromMtrPerSecSqrToG(accelerationThreshold * 0.44704);
    let thresholds = [];
    if (eventType === 'Cornering') {
      thresholds = [thresholdInG, -thresholdInG];
    } else if (eventType === 'Harsh-Braking') {
      thresholds = [-thresholdInG];
    } else {
      thresholds = [thresholdInG];
    }
    return thresholds;
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

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
