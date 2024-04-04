import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { dirtyCheck } from '@app-core/models/dirty-check';
import { Observable, Subject, merge, of } from 'rxjs';
import { map, pairwise, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-custom-configurations-expansion-panel',
  templateUrl: './custom-configurations-expansion-panel.component.html',
  styleUrls: ['./custom-configurations-expansion-panel.component.scss'],
})
export class CustomConfigurationsExpansionPanelComponent implements OnInit {
  @Input()
  private expansionPanelConfig = {};
  @Output()
  private formChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  public expansionPanels = [];

  public formBuilder = new FormBuilder();
  public settingsForm: FormGroup = new FormGroup({});

  private currentDutyTypeConfig = {};
  private ngUnsubscribe = new Subject<void>();
  private formValueChangesUnsubscribe: Subject<void> = new Subject<void>();
  public isDirty$: Observable<boolean> = of(false);

  constructor(public assetConfigService: AssetConfigurationService) {}

  ngOnInit(): void {
    this.expansionPanels = this.getPanels(this.expansionPanelConfig);

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
    this.assetConfigService.currentDutyTypeConfigCustomEvents.subscribe((config) => {
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
        return {
          ...(x.key ? { [`${x.panelKey}`]: x } : {}),
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {});

    // Merge all toggle buttons' value changes observable into one observable and subscribe to it
    const toggleButtonsObservable = merge(
      ...Object.keys(toggleButtonsData).map((x) =>
        this.settingsForm.get(x).valueChanges.pipe(
          startWith(this.settingsForm.get(x).value),
          pairwise(),
          map(([previousState, state]) => ({ state: state[`${x}eventEnabled`], previousState, key: x })),
          takeUntil(this.ngUnsubscribe)
        )
      )
    );

    toggleButtonsObservable.subscribe(({ key, state }) => {
      const externalPanel = this.expansionPanels.find((e) => e.panelKey === key);
      let currentPanel = externalPanel;

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
