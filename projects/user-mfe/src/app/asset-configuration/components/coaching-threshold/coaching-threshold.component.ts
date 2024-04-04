import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { VIDEO_TYPE_LIST } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';

import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { TaggingService } from '@app-asset-config/services/tagging.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { GetCoachingConfigResponse, PostCoachingConfigResponse, configEvents } from '@app-asset-config/models/tagging.model';

@Component({
  selector: 'app-coaching-threshold',
  templateUrl: './coaching-threshold.component.html',
  styleUrls: ['./coaching-threshold.component.scss'],
})
export class CoachingThresholdComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public fleetId: string;
  public loginName: string;
  public loader: boolean = false;
  public coachConfigLoader: boolean = true;
  public eventsConfig: configEvents[];
  public othersConfig: configEvents[];
  public customEvents: configEvents[];
  public driverFacingEvents: configEvents[];

  public thresholdForm = new FormGroup({
    incidentsPer100Miles: new FormControl(null),
    coachingInterval: new FormControl(null),
    minimumEventThreshold: new FormControl(null),
  });

  constructor(
    public dataService: DataService,
    private accessService: AccessService,
    private taggingService: TaggingService,
    private snachBarService: SnackBarService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    ({ loginName: this.loginName } = this.accessService.getLoginInfo());

    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);

    const filteredCustomData = {};
    const filterStandardEvents = {};
    for (const key in modifiedEventsConfig) {
      if (!(key in EVENTS_CONFIG)) {
        filteredCustomData[key] = modifiedEventsConfig[key];
      } else {
        filterStandardEvents[key] = modifiedEventsConfig[key];
      }
    }

    const otherConfigList = VIDEO_TYPE_LIST.filter((obj) => obj.label !== 'Event On-Demand');

    this.othersConfig = this.processConfig(otherConfigList);
    this.eventsConfig = this.processConfig(filterStandardEvents);
    this.customEvents = this.processConfig(filteredCustomData);

    this.driverFacingEvents = this.eventsConfig.filter((event) => event.isDriverFacing);

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        this.getData();
      }
    });
  }

  public ngOnChanges(): void {
    this.getData();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private async getData() {
    if (!this.fleetId) {
      return;
    }
    this.getCoachingConfig();
  }

  public getCoachingConfig() {
    this.coachConfigLoader = true;
    this.storageService.setStorageValue('coachingConfig', {});
    const params = {
      fleetId: this.fleetId,
    };
    this.taggingService
      .getFleetCoachConfig(params)
      .pipe(
        finalize(() => {
          this.coachConfigLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: GetCoachingConfigResponse) => {
          const {
            eventTypes = Object.keys(EVENTS_CONFIG),
            incidentsPer100Miles = 10,
            coachingInterval = 14,
            minimumEventThreshold = 10,
          } = res?.value?.coachingConfig || {};

          this.thresholdForm.setValue({
            incidentsPer100Miles: incidentsPer100Miles,
            coachingInterval: coachingInterval,
            minimumEventThreshold: minimumEventThreshold,
          });
          this.updateEvents(eventTypes);
          this.storageService.setStorageValue('coachingConfig', res?.value?.coachingConfig);
        },
        () => {}
      );
  }

  /**
   * Stop Propogation incase of multiple selection to avoid closing of the menu
   * @param e Click event*/

  public selectEvent(e: Event) {
    console.log(e);
  }

  /**
   * Alter selcted event list array based on mat checkbox checked property
   * @param e Mat check box event
   * @param event Event type
   */
  public checkEvent(e: MatCheckboxChange, event: string) {
    this.updateCheckedStatus(this.eventsConfig, event, e.checked);
    this.updateCheckedStatus(this.othersConfig, event, e.checked);
    this.updateCheckedStatus(this.customEvents, event, e.checked);
  }

  public onSubmit() {
    this.gtmService.coachingThresholdSubmit();
    this.loader = true;
    let selectedEvents = [
      ...this.processSelectedEvents(this.eventsConfig),
      ...this.processSelectedEvents(this.othersConfig),
      ...this.processSelectedEvents(this.customEvents),
    ];
    const body = {
      ...this.thresholdForm.value,
      eventTypes: selectedEvents,
    };

    this.taggingService
      .updateFleetCoachConfig(body)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.taggingService.isUpdatingConfig.next(false);
          this.loader = false;
        })
      )
      .subscribe(
        (res: PostCoachingConfigResponse) => {
          const {
            eventTypes = [],
            incidentsPer100Miles = 0,
            coachingInterval = 0,
            minimumEventThreshold = 0,
          } = res?.value?.coachingConfigJson || {};

          this.thresholdForm.setValue({
            incidentsPer100Miles: incidentsPer100Miles,
            coachingInterval: coachingInterval,
            minimumEventThreshold: minimumEventThreshold,
          });
          this.updateEvents(eventTypes);
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateSuccess'));
          this.storageService.setStorageValue('coachingConfig', res?.value?.coachingConfigJson);
        },
        () => {
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateFailed'));
        }
      );
  }

  private updateEvents(selectedEvent: string[]) {
    this.updateCheckedStatusInArray(this.eventsConfig, selectedEvent);
    this.updateCheckedStatusInArray(this.othersConfig, selectedEvent, true);
    this.updateCheckedStatusInArray(this.customEvents, selectedEvent);
  }

  private processConfig(configObject): configEvents[] {
    return Object.entries(configObject)
      .map(([key, value]: [string, configEvents]) => ({
        key,
        checked: false,
        ...value,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
  }

  private updateCheckedStatus(configArray: configEvents[], key: string, checked: boolean) {
    configArray.forEach((element: configEvents) => {
      if (key === element.key) {
        element.checked = checked;
      }
    });
  }

  private processSelectedEvents(configArray: configEvents[]): string[] {
    const selectedEvents: string[] = [];
    configArray.forEach((event: configEvents) => {
      if (event.checked) {
        if (event.key === '0') {
          selectedEvents.push('video-requests');
        } else if (event.key === '1') {
          selectedEvents.push('panic-button');
        } else {
          selectedEvents.push(event.key);
        }
        if (event.subEvents?.length > 0) {
          selectedEvents.push(...event.subEvents);
        }
      }
    });
    return selectedEvents;
  }

  private updateCheckedStatusInArray(configArray: configEvents[], selectedEvent: string[], isOtherEvents?: boolean) {
    if (isOtherEvents) {
      configArray.forEach((element: configEvents) => {
        if (element.key === '0') {
          if (selectedEvent.includes('video-requests')) {
            element.checked = true;
          }
        } else if (element.key === '1') {
          if (selectedEvent.includes('panic-button')) {
            element.checked = true;
          }
        }
      });
    } else {
      configArray.forEach((element: configEvents) => {
        if (selectedEvent.includes(element.key)) {
          element.checked = true;
        }
      });
    }
  }
}
