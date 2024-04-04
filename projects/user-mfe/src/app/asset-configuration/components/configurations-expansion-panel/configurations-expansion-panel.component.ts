import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { dirtyCheck, DirtyComponent } from '@app-core/models/dirty-check';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { DataService } from '@app-core/services/data/data.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { map, pairwise, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-configurations-expansion-panel',
  templateUrl: './configurations-expansion-panel.component.html',
  styleUrls: ['./configurations-expansion-panel.component.scss'],
})
export class ConfigurationsExpansionPanelComponent implements OnInit, OnDestroy, DirtyComponent {
  @Input()
  private expansionPanelConfig = {};
  @Input()
  private isBasic: boolean;
  @Output()
  private formChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  public expansionPanels = [];
  public settingsForm: FormGroup = new FormGroup({});

  private currentDutyTypeConfig = {};
  private ngUnsubscribe = new Subject<void>();
  private formValueChangesUnsubscribe: Subject<void> = new Subject<void>();
  public isDirty$: Observable<boolean> = of(false);

  constructor(
    public assetConfigService: AssetConfigurationService,
    private dataService: DataService,
    private commonHttpService: CommonHttpService
  ) {}

  public ngOnInit(): void {
    this.expansionPanels = this.getPanels(this.expansionPanelConfig);

    if (this.isBasic) {
      const combinedEventsList = this.dataService.modifyFleeEvents();
      this.expansionPanels = this.expansionPanels.filter((e) => combinedEventsList.some((event) => event.key === e.eventType));
      const disabledEventTypes = this.getDisabledEventTypes();
      // Filter the internalPanel array of each object in expansionPanels
      this.expansionPanels.forEach((panel) => {
        panel.internalPanel = panel.internalPanel.filter((internalItem) => {
          // Only keep the internalItem if its eventType is not disabled
          return !disabledEventTypes.has(internalItem.eventType);
        });
      });
    } else {
      const disabledEventTypes = this.getDisabledEventTypes();
      this.expansionPanels = this.expansionPanels.filter((e) => !disabledEventTypes.has(e.eventType));
    }

    this.createForm();
    this.subscribeForToogleButtons();
    this.subscribeForDutyTypeConfig();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.formValueChangesUnsubscribe.next();
    this.formValueChangesUnsubscribe.complete();
  }

  private getDisabledEventTypes(): Set<Object> {
    let standardEvents;
    this.commonHttpService.getFleetEvents().subscribe((res) => {
      standardEvents = res.standardEvents;
    });

    // Create a set of eventTypes from array standardEvents for faster lookup
    const disabledEventTypes = new Set(standardEvents.filter((item) => item.state === 'DISABLED').map((item) => item.eventType));
    return disabledEventTypes;
  }

  private getPanels(panelConfig = {}) {
    return Object.entries(panelConfig).reduce((a, b: any) => {
      return [
        ...a,
        {
          panelKey: b[0],
          ...(b[1] as object),
          internalPanel: this.getPanels(b[1].internalPanel || {}),
        },
      ];
    }, []);
  }

  private subscribeForDutyTypeConfig() {
    this.assetConfigService.currentDutyTypeConfig.pipe(takeUntil(this.ngUnsubscribe)).subscribe((config) => {
      this.currentDutyTypeConfig = config;
      const newForm = this.assetConfigService.toFormGroup(this.expansionPanelConfig, this.currentDutyTypeConfig);

      this.formValueChangesUnsubscribe.next();
      this.settingsForm.patchValue(newForm.getRawValue());
      this.toggle1080pVideoResoltutionOption();
      this.formValueChanges();
    });
  }

  private formValueChanges() {
    if (this.settingsForm) {
      this.isDirty$ = this.settingsForm.valueChanges.pipe(
        takeUntil(this.formValueChangesUnsubscribe),
        map((obj) => this.assetConfigService.flattenObject(obj)),
        dirtyCheck(of(this.currentDutyTypeConfig || {}))
      );
      this.isDirty$.pipe(takeUntil(this.formValueChangesUnsubscribe)).subscribe((dirty) => this.formChanged.emit(dirty));
    }
  }

  private subscribeForToogleButtons() {
    if (!this.settingsForm) {
      return;
    }
    const toggleButtonsData = this.expansionPanels
      .map((x) => {
        const internalToggleButtons = x.internalPanel
          .filter((y) => !!y.key)
          .map((y) => ({
            [`${x.panelKey}.internalPanel.${y.panelKey}.${y.key}`]: y,
          }))
          .reduce((a, b) => ({ ...a, ...b }), {});
        return {
          ...(x.key ? { [`${x.panelKey}.${x.key}`]: x } : {}),
          ...internalToggleButtons,
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {});

    // Merge all toggle buttons' value changes observable into one observable and subscribe to it
    const toggleButtonsObservable = merge(
      ...Object.keys(toggleButtonsData).map((x) =>
        this.settingsForm.get(x).valueChanges.pipe(
          startWith(this.settingsForm.get(x).value),
          pairwise(),
          map(([previousState, state]) => ({ state, previousState, key: x })),
          takeUntil(this.ngUnsubscribe)
        )
      )
    );

    toggleButtonsObservable.subscribe(({ key, state, previousState }) => {
      const [externalPanelKey, , internalPanelKey] = key.split('.'); // pattern: externalPanelKey?.internalPanel?.internalPanelKey
      const externalPanel = this.expansionPanels.find((e) => e.panelKey === externalPanelKey);
      let currentPanel = externalPanel;
      if (internalPanelKey && externalPanel) {
        currentPanel = (externalPanel.internalPanel || []).find((e) => e.panelKey === internalPanelKey);
        const allInternalPanelsStates = (externalPanel.internalPanel || []).map((ip) => {
          const internalPanelState = this.settingsForm.get(`${externalPanel.panelKey}.internalPanel.${ip.panelKey}.${ip.key}`).value;
          return internalPanelState;
        });
        const parentPanelState = allInternalPanelsStates.some((s) => !!s);
        this.settingsForm
          .get(`${externalPanel.panelKey}.${externalPanel.key}`)
          .patchValue(parentPanelState, { emitEvent: true, onlySelf: false });
        externalPanel.disabled = !parentPanelState;
      }
      if (!currentPanel) {
        return;
      }
      currentPanel.disabled = !state;
      (currentPanel.description || []).forEach((desc) => {
        if (!desc.shouldDisable) {
          return;
        }
        if (state) {
          this.settingsForm.get(`${currentPanel.panelKey}.${desc.key}`).enable({ emitEvent: true, onlySelf: false });
        } else {
          this.settingsForm.get(`${currentPanel.panelKey}.${desc.key}`).disable({ emitEvent: true, onlySelf: false });
        }
      });

      const internalPanels = Object.values(currentPanel.internalPanel);
      if (internalPanels.length) {
        (internalPanels || []).forEach((panel: any) => {
          (panel.description || []).forEach((desc: any) => {
            if (!previousState && state) {
              this.settingsForm
                .get(`${currentPanel.panelKey}.internalPanel.${panel.panelKey}.${desc.key}`)
                .patchValue(true, { emitEvent: false, onlySelf: false });
              panel.disabled = false;
            } else if (!state) {
              this.settingsForm
                .get(`${currentPanel.panelKey}.internalPanel.${panel.panelKey}.${desc.key}`)
                .patchValue(false, { emitEvent: false, onlySelf: false });
              panel.disabled = true;
            }
          });
        });
      }
    });
  }

  private createForm() {
    this.settingsForm = this.assetConfigService.toFormGroup(this.expansionPanelConfig, this.currentDutyTypeConfig);
  }

  public closePanel(e: MatExpansionPanel): true {
    e.close();
    return true;
  }

  public getFormGroup(formGroup = '' as any, key = ''): FormGroup {
    if (key && formGroup) {
      return formGroup.get(key) as FormGroup;
    }
  }

  public toggle1080pVideoResoltutionOption() {
    if (!this.currentDutyTypeConfig) {
      return;
    }
    const disable1080p = (this.currentDutyTypeConfig as any).dvrStoredVideoResolutionRoad === '1280x720';
    const toggle = (panel) => {
      const newContent = (panel.content || []).map((content) => {
        if (content.key.startsWith('eventVideoResolution')) {
          const options = content.options.map((option) => {
            if (option.key === '1920x1080') {
              return {
                ...option,
                disabled: disable1080p,
              };
            }
            return option;
          });
          return {
            ...content,
            options,
          };
        }
        return content;
      });
      return {
        ...panel,
        content: newContent,
        internalPanel: panel.internalPanel.map(toggle),
      };
    };
    const newExpansionPanels = this.expansionPanels.map(toggle);
    this.expansionPanels = newExpansionPanels;
  }
}
