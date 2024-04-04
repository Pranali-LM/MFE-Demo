import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { finalize, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import { AVAILABLE_DUTY_TYPES } from '@app-asset-config/common/asset-configuration.constants';
import { SaveChangesCustomEventOutput, SaveChangesOutput } from '@app-asset-config/common/asset-configuration.model';
import { DirtyComponent } from '@app-core/models/dirty-check';
import { DataService } from '@app-core/services/data/data.service';
import { DialogService } from '@app-core/services/dialog/dialog.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { AssetConfigurationService } from '../../services/asset-configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { GoogleTagManagerService, SdkConfigType } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { CLIENT_CONFIG } from '@config/config';

const tabNameIndexMapping = {
  basic: 0,
  advanced: 1,
  coaching: 2,
  tagging: 3,
};

/**
 * Component for duty type settings configuration.
 */
@Component({
  selector: 'app-duty-type-configuration',
  templateUrl: './duty-type-configuration.component.html',
  styleUrls: ['./duty-type-configuration.component.scss'],
})
export class DutyTypeConfigurationComponent implements OnInit, AfterViewInit, OnDestroy, DirtyComponent {
  @Output()
  private formChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private dutyTypes: string[] = AVAILABLE_DUTY_TYPES.reduce((a, b) => [...a, b.key], []);

  public currentDutyType = '';
  public dutyTypeChange$ = new Subject();
  public customDutyTypeChange$ = new Subject();
  public currentCustomDutyType = '';
  public isDirty$: Observable<boolean> = of(false);
  public config = {};
  public customConfig = {};
  public availableDutyTypes = AVAILABLE_DUTY_TYPES;
  public fleetId: string;
  public currentTabIndex = 0;
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;
  public clientConfig = CLIENT_CONFIG;
  public currentOS = 'windows';
  public isShowCustomConfig: boolean;
  public isShowBasicConfig: boolean;
  public isLoadingConfig: boolean = true;

  constructor(
    public assetConfigService: AssetConfigurationService,
    private dialogService: DialogService,
    private snachBarService: SnackBarService,
    public dataService: DataService,
    public translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private keyboardShortcutsService: KeyboardShortcutsService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    this.isDirty$ = combineLatest([
      this.assetConfigService.isBasicConfigDirty,
      this.assetConfigService.isAdvancedConfigDirty,
      this.assetConfigService.isCustomConfigDirty,
    ]).pipe(map(([d1, d2, d3]) => d1 || d2 || d3));
    this.isDirty$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((dirty) => this.formChanged.emit(dirty));
    this.subscribeForDutyTypeChanges();

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.getConfigurations();
      }
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.currentOS = this.dataService.getCurrentOS();
    this.configureKeyboardShortcuts();

    this.assetConfigService.isLoadingConfig.pipe(takeUntil(this.ngUnsubscribe)).subscribe((isLoading) => {
      this.isLoadingConfig = isLoading;
    });
  }
  public ngAfterViewInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: any) => {
      const currentTab = param.tab;
      this.currentTabIndex = tabNameIndexMapping[currentTab] || 0;
    });
    if (this.currentTabIndex === 0) {
      this.gtmService.customTabs('/configurations', 'Configurations', 'Basic');
    }
    if (this.currentTabIndex === 1) {
      this.gtmService.customTabs('/configurations', 'Configurations', 'Advanced');
    }
    if (this.currentTabIndex === 2) {
      this.gtmService.customTabs('/configurations', 'Configurations', 'coaching');
    }
    if (this.currentTabIndex === 3) {
      this.gtmService.customTabs('/configurations', 'Configurations', 'tagging');
    }
  }

  public onPageTabChange(event: MatTabChangeEvent) {
    const [tabName = 'basic'] = Object?.entries(tabNameIndexMapping).find(([, index]) => index === event.index);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  private subscribeForDutyTypeChanges() {
    this.dutyTypeChange$
      .pipe(startWith({ dutyType: AVAILABLE_DUTY_TYPES[0].key } as any), takeUntil(this.ngUnsubscribe))
      .subscribe(({ dutyType } = {} as any) => {
        this.currentDutyType = dutyType;
        this.assetConfigService.currentDutyType.next(dutyType);
        this.assetConfigService.currentDutyTypeConfig.next(this.config[dutyType]);
      });

    this.customDutyTypeChange$
      .pipe(startWith({ dutyType: AVAILABLE_DUTY_TYPES[0].key } as any), takeUntil(this.ngUnsubscribe))
      .subscribe(({ dutyType } = {} as any) => {
        this.currentCustomDutyType = dutyType;
        this.assetConfigService.currentCustomDutyType.next(dutyType);
        this.assetConfigService.currentDutyTypeConfigCustomEvents.next(this.customConfig[this.currentCustomDutyType]);
      });
  }

  private getConfigurations() {
    this.assetConfigService.isLoadingConfig.next(true);
    this.assetConfigService
      .getFleetConfiguration()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetConfigService.isLoadingConfig.next(false);
        })
      )
      .subscribe((res: any) => {
        const { configuration = {} } = res || {};
        this.config = this.dutyTypes
          .map((dutyType) => ({
            [dutyType]: {
              ...(configuration.default || {}),
              ...configuration[dutyType],
            },
          }))
          .reduce((a, b) => ({ ...a, ...b }), {});
        this.assetConfigService.currentDutyTypeConfig.next(this.config[this.currentDutyType]);
        this.checkBasicConfigEmpty();
      });

    this.assetConfigService
      .getFleetCustomEvents()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {
        const { configuration = {} } = this.getMergedObject(res);
        if (
          configuration &&
          configuration['default'] &&
          typeof configuration['default'] === 'object' &&
          Object.keys(configuration['default']).length > 0
        ) {
          this.isShowCustomConfig = true;
        } else {
          this.isShowCustomConfig = false;
        }
        this.customConfig = this.dutyTypes
          .map((dutyType) => ({
            [dutyType]: {
              ...(configuration.default || {}),
              ...configuration[dutyType],
            },
          }))
          .reduce((a, b) => ({ ...a, ...b }), {});
        this.assetConfigService.currentDutyTypeConfigCustomEvents.next(this.customConfig[this.currentCustomDutyType]);
      });
  }

  private checkBasicConfigEmpty() {
    const filteredPanels = Object.values(this.assetConfigService.basicSettingsExpansionPanelConfig).filter((panel: any) =>
      this.dataService.modifyFleeEvents().some((element) => panel.eventType === element.key)
    );
    this.isShowBasicConfig = filteredPanels.length > 0;
  }

  public onDutyTypeChange(event: MatButtonToggleChange) {
    if (event.value) {
      this.gtmService.changeConfigurationDutyTypes(event.value);
      this.isDirty$
        .pipe(
          take(1),
          switchMap((dirty) => {
            if (!dirty) {
              return of(true);
            }
            return this.dialogService.confirm(this.translate.instant('dutyTypeChangesNotSaved')).pipe(map((status) => status));
          }),
          take(1)
        )
        .subscribe((dispatchAction) => {
          if (dispatchAction) {
            this.dutyTypeChange$.next({ dutyType: event.value });
          } else {
            // Assign previous duty type to mat selection value
            event.source.value = this.currentDutyType;
          }
        });
    }
  }

  public onCustomDutyTypeChange(event: MatButtonToggleChange) {
    if (event.value) {
      this.isDirty$
        .pipe(
          take(1),
          switchMap((dirty) => {
            if (!dirty) {
              return of(true);
            }
            return this.dialogService.confirm(this.translate.instant('dutyTypeChangesNotSaved')).pipe(map((status) => status));
          }),
          take(1)
        )
        .subscribe((dispatchAction) => {
          if (dispatchAction) {
            this.customDutyTypeChange$.next({ dutyType: event.value });
          } else {
            // Assign previous duty type to mat selection value
            event.source.value = this.currentCustomDutyType;
          }
        });
    }
  }

  public saveChanges(event: SaveChangesOutput, configType: SdkConfigType) {
    const { newConfig = {}, saveForAllDutyTypes = false } = event;
    const originalConfig = this.assetConfigService.currentDutyTypeConfig.getValue();
    const updatedConfig = this.assetConfigService.getChangedConfigs(originalConfig, this.assetConfigService.flattenObject(newConfig));
    const body = {
      configuration: {},
    };
    if (saveForAllDutyTypes) {
      this.gtmService.saveAllDutyTypes();
      body.configuration = this.dutyTypes
        .map((dutyType) => {
          return {
            [dutyType]: updatedConfig,
          };
        })
        .reduce((a, b) => ({ ...a, ...b }), {});
    } else {
      if (configType === SdkConfigType.Basic) {
        this.gtmService.saveBasicDutyTypes(this.currentDutyType);
      } else {
        this.gtmService.saveAdvancedDutyTypes(this.currentDutyType);
      }
      body.configuration = {
        [this.currentDutyType]: updatedConfig,
      };
    }
    this.assetConfigService.isUpdatingConfig.next(true);
    this.assetConfigService
      .updateFleetConfiguration(body)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetConfigService.isUpdatingConfig.next(false);
        })
      )
      .subscribe(
        () => {
          this.config = this.dutyTypes
            .map((dutyType) => ({
              [dutyType]: {
                ...(saveForAllDutyTypes
                  ? this.assetConfigService.formatConfig({ ...this.config[dutyType], ...updatedConfig })
                  : dutyType === this.currentDutyType
                  ? this.assetConfigService.formatConfig({ ...this.config[dutyType], ...updatedConfig })
                  : { ...this.config[dutyType] }),
              },
            }))
            .reduce((a, b) => ({ ...a, ...b }), {});
          this.assetConfigService.currentDutyTypeConfig.next(this.config[this.currentDutyType]);
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateSuccess'));
        },
        () => {
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateFailed'));
        }
      );
  }

  public configureKeyboardShortcuts() {
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab0[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(0);
      });
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab1[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(1);
      });
  }

  public onKeyboardTabChange(tabIndex: number) {
    const [tabName = 'basic'] = Object.entries(tabNameIndexMapping).find(([, idx]) => idx === tabIndex);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  public getMergedObject(res: any) {
    const { rows = [] } = res;
    const filteredRows = rows.filter((row: any) => row.state !== 'DISABLED');
    const deleteKey = ['eventType', 'state', 'eventDescription', 'eventName'];

    if (filteredRows.length) {
      filteredRows.forEach((obj: any) => {
        const { eventType, eventName = '', eventDescription = '', state = '' } = obj;

        if (eventType) {
          Object.values(obj.configuration).forEach((row: any, index: number, theArray: any[]) => {
            Object.keys(row).forEach((key) => {
              theArray[index][`${eventType}${key}`] = theArray[index][key];
              delete theArray[index][key];
            });

            theArray[index][`${eventType}eventType`] = eventType;
            theArray[index][`${eventType}enabled`] = state === 'ENABLED' ? true : false;
            theArray[index][`${eventType}eventDescription`] = eventDescription;
            theArray[index][`${eventType}eventName`] = eventName;
          });
        }

        deleteKey.forEach((element) => {
          delete obj[element];
        });
      });

      const mergedObject = filteredRows.reduce((result, obj) => {
        for (const key in obj.configuration) {
          if (!result.configuration[key]) {
            result.configuration[key] = {};
          }
          Object.assign(result.configuration[key], obj.configuration[key]);
        }
        return result;
      });
      return mergedObject;
    } else {
      return {};
    }
  }

  public saveCustomEventChanges(event: SaveChangesCustomEventOutput) {
    const { newConfig = {} } = event;
    const originalConfig = this.assetConfigService.currentDutyTypeConfigCustomEvents.getValue();
    const updatedConfig = this.assetConfigService.getChangedConfigs(originalConfig, this.assetConfigService.flattenObject(newConfig), true);

    const keys = Object.keys(newConfig);
    const result = keys.reduce((acc, key) => {
      const matchingKeys = Object.keys(updatedConfig).filter((bKey) => bKey.startsWith(key));
      if (matchingKeys.length > 0) {
        const configuration = {
          [this.currentCustomDutyType]: {},
        };
        for (const mKey of matchingKeys) {
          const subKey = mKey.slice(key.length);
          configuration[this.currentCustomDutyType][subKey] = updatedConfig[mKey];
        }
        acc.push({
          eventType: key,
          configuration: {
            ...configuration,
          },
        });
      }
      return acc;
    }, []);
    const body = {
      eventTypes: [...result],
    };
    this.assetConfigService.isCustomUpdatingConfig.next(true);
    this.assetConfigService
      .updateCustomEventsConfiguration(body)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetConfigService.isCustomUpdatingConfig.next(false);
        })
      )
      .subscribe(
        () => {
          const newCustomConfig = {
            ...originalConfig,
            ...updatedConfig,
          };
          this.customConfig = this.dutyTypes
            .map((dutyType) => ({
              [dutyType]: {
                ...(dutyType === this.currentCustomDutyType
                  ? { ...this.customConfig[this.currentCustomDutyType], ...newCustomConfig }
                  : { ...this.customConfig[dutyType] }),
              },
            }))
            .reduce((a, b) => ({ ...a, ...b }), {});
          this.assetConfigService.currentDutyTypeConfigCustomEvents.next(this.customConfig[this.currentCustomDutyType]);
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateSuccess'));
        },
        () => {
          this.snachBarService.success(this.translate.instant('dutyTypeConfigurationUpdateFailed'));
        }
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
