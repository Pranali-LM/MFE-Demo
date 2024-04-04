import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';
import {
  DEFAULT_DARK_THEME_TEXT_COLOR,
  DEFAULT_LIGHT_THEME_TEXT_COLOR,
  EVENTS_CONFIG,
  INCIDENT_SUMMARY_CHART_OPTIONS,
} from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-incident-summary',
  templateUrl: './incident-summary.component.html',
  styleUrls: ['./incident-summary.component.scss'],
})
export class IncidentSummaryComponent implements OnChanges {
  @Input()
  private eventDiff = {};
  @Input()
  public loader = true;
  @Input()
  public type = 'fleet';
  @Input()
  public currentTheme = 'light';
  public showChart = false;
  public ngUnsubscribe = new Subject<void>();
  public currentLanguage: string;
  public chart: Chart;

  constructor(public translate: TranslateService, public dataService: DataService, private elementRef: ElementRef) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.currentTheme) {
      this.changeTheme();
    }
    if (changes.eventDiff) {
      this.generateChart();
    }
  }

  private generateChart() {
    this.translate.stream('incidentSummary').subscribe((langData: string) => {
      const { total: { current: totalIncidentCount = 0 } = {}, ...otherEventsDiff } = this.eventDiff || ({} as any);
      const combinedEventsList = this.dataService.modifyFleeEvents(true);
      const combinedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };
      const eventsToShow = Object.keys({ ...EVENTS_CONFIG, ...combinedEventsConfig });
      const seriesData = Object.entries(otherEventsDiff)
        .filter(([eventType, value]: [string, any]) => eventsToShow.includes(eventType) && value.current > 0)
        .map(([eventType, value]: [string, any]) => {
          return {
            label: combinedEventsConfig[eventType].label,
            backgroundColor: combinedEventsConfig[eventType].color,
            value: Number(((value.current / (totalIncidentCount || 1)) * 100).toFixed(2)),
            eventCount: value.current,
            diffPercentage: value.percent,
          };
        })
        .sort((a, b) => (b.value - a.value > 0 ? 1 : -1));
      this.showChart = !!totalIncidentCount;

      if (seriesData.length) {
        this.updateIncidentSummaryGraph(langData, seriesData);
      }
    });
  }
  public updateIncidentSummaryGraph(langData, seriesData) {
    seriesData.map((seriesDataKey, seriesindex) => {
      if (langData.mapData) {
        langData.mapData.map((languageDataKey, languageIndex) => {
          if (seriesDataKey.label === languageDataKey.name) {
            seriesData[seriesindex].label = langData.mapData[languageIndex].Key;
          }
        });
      }
    });
    if (this.chart) {
      this.chart.destroy();
    }
    const ctx: any = this.elementRef.nativeElement.querySelector(`#incidentSummaryChart`);
    const chartStatus = Chart.getChart('incidentSummaryChart');
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    if (ctx) {
      const chart = new Chart(ctx, {
        ...INCIDENT_SUMMARY_CHART_OPTIONS,
        data: {
          labels: seriesData.map((x) => x.label),
          datasets: [
            {
              label: langData.incidentSummaryGraphValuesToolip,
              data: seriesData.map((x) => x.value),
              backgroundColor: seriesData.map((x) => x.backgroundColor),
              eventCount: seriesData.map((x) => x.eventCount),
              diffPercentage: seriesData.map((x) => x.diffPercentage),
            },
          ],
        },
      } as any);
      this.chart = chart;
    }
    this.chart.options.plugins.tooltip.callbacks = {
      ...this.chart.options.plugins.tooltip.callbacks.afterBody,
      label: (tooltipItem) => {
        return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} %`;
      },
    };
    this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
      const { dataset = [], dataIndex = 0 } = data[0] || {};
      const { eventCount = [], diffPercentage = [] } = dataset;
      return [
        `${langData.incidentSummaryGraphCountToolip}: ${eventCount[dataIndex]}`,
        `${langData.incidentSummaryGraphDiffereceoolip}: ${diffPercentage[dataIndex]}%`,
      ];
    };
    this.chart.options.plugins.legend.labels = {
      ...this.chart.options.plugins.legend.labels,
      generateLabels: (chart) => {
        const datasets = chart.data.datasets;
        return datasets[0].data.map((data, i) => ({
          text: `${chart.data.labels[i]} ${data}%`,
          fillStyle: datasets[0].backgroundColor[i],
          index: i,
          fontColor: this.currentTheme === 'light' ? DEFAULT_LIGHT_THEME_TEXT_COLOR : DEFAULT_DARK_THEME_TEXT_COLOR,
        }));
      },
    };
    this.chart.update();
    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentLanguage = value;
        if (this.currentLanguage !== 'en') {
          const chars = { ',': '.', '.': ',' };
          this.chart.options.plugins.tooltip.callbacks = {
            ...this.chart.options.plugins.tooltip.callbacks.afterBody,
            label: (tooltipItem) => {
              return `${tooltipItem.dataset.label}: ${
                tooltipItem.formattedValue ? tooltipItem.formattedValue.toString().replace(/[,.]/g, (m) => chars[m]) : 0
              } %`;
            },
          };
          this.chart.options.plugins.tooltip.callbacks.afterBody = (data: any) => {
            const { dataset = [], dataIndex = 0 } = data[0] || {};
            const { eventCount = [], diffPercentage = [] } = dataset;
            const chars = { ',': '.', '.': ',' };
            const eveCount = eventCount[dataIndex] ? eventCount[dataIndex].toString().replace(/[,.]/g, (m) => chars[m]) : 0;
            const diffPer = diffPercentage[dataIndex] ? diffPercentage[dataIndex].toString().replace(/[,.]/g, (m) => chars[m]) : 0;
            return [
              `${langData.incidentSummaryGraphCountToolip}: ${eveCount}`,
              `${langData.incidentSummaryGraphDiffereceoolip}: ${diffPer}%`,
            ];
          };

          this.chart.options.plugins.legend.labels = {
            ...this.chart.options.plugins.legend.labels,
            generateLabels: (chart) => {
              const datasets = chart.data.datasets;
              const chars = { ',': '.', '.': ',' };
              return datasets[0].data.map((data, i) => ({
                text: `${chart.data.labels[i]} ${data ? data.toString().replace(/[,.]/g, (m) => chars[m]) : 0}%`,
                fillStyle: datasets[0].backgroundColor[i],
                index: i,
                fontColor: this.currentTheme === 'light' ? DEFAULT_LIGHT_THEME_TEXT_COLOR : DEFAULT_DARK_THEME_TEXT_COLOR,
              }));
            },
          };
        }
        this.chart.update();
      }
    });
  }

  public changeTheme() {
    if (this.chart) {
      this.chart.options.plugins.legend.labels.color =
        this.currentTheme === 'light' ? DEFAULT_LIGHT_THEME_TEXT_COLOR : DEFAULT_DARK_THEME_TEXT_COLOR;
      this.chart.options.plugins.legend.labels = {
        ...this.chart.options.plugins.legend.labels,
        generateLabels: (chart) => {
          const datasets = chart.data.datasets;
          return datasets[0].data.map((data, i) => ({
            text: `${chart.data.labels[i]} ${data}%`,
            fillStyle: datasets[0].backgroundColor[i],
            index: i,
            fontColor: this.currentTheme === 'light' ? DEFAULT_LIGHT_THEME_TEXT_COLOR : DEFAULT_DARK_THEME_TEXT_COLOR,
          }));
        },
      };
      this.chart.update();
    }
  }
}
