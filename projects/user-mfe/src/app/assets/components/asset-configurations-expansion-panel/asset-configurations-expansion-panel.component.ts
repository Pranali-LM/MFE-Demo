import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { dirtyCheck, DirtyComponent } from '@app-core/models/dirty-check';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-configurations-expansion-panel',
  templateUrl: './asset-configurations-expansion-panel.component.html',
  styleUrls: ['./asset-configurations-expansion-panel.component.scss'],
})
export class AssetConfigurationsExpansionPanelComponent implements OnInit, OnDestroy, DirtyComponent, AfterViewInit {
  @Input()
  private expansionPanelConfig = {};
  @Input()
  public assetId;

  public expansionPanels = [];
  public assetConfigForm: FormGroup = new FormGroup({});
  public config = {};
  private currentAssetConfig = {};
  private ngUnsubscribe = new Subject<void>();
  private formValueChangesUnsubscribe: Subject<void> = new Subject<void>();
  public isDirty$: Observable<boolean> = of(false);

  constructor(
    public assetConfigService: AssetConfigurationService,
    private snachBarService: SnackBarService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit(): void {
    this.expansionPanels = this.getPanels(this.expansionPanelConfig);
    this.createForm();
    this.subscribeForAssetConfig();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.formValueChangesUnsubscribe.next();
    this.formValueChangesUnsubscribe.complete();
  }
  public ngAfterViewInit() {
    setTimeout(() => {
      this.assetConfigFormCheck = () => this.assetConfigForm;
    });
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

  private subscribeForAssetConfig() {
    this.assetConfigService.currentAssetConfig.pipe(takeUntil(this.ngUnsubscribe)).subscribe((config) => {
      this.currentAssetConfig = config;
      const newForm = this.assetConfigService.toFormGroup(this.expansionPanelConfig, this.currentAssetConfig);

      this.formValueChangesUnsubscribe.next();
      this.assetConfigForm.patchValue(newForm.getRawValue());
      this.formValueChanges();
    });
  }

  private formValueChanges() {
    if (this.assetConfigForm) {
      this.isDirty$ = this.assetConfigForm.valueChanges.pipe(
        takeUntil(this.formValueChangesUnsubscribe),
        map((obj) => this.assetConfigService.flattenObject(obj)),
        dirtyCheck(of(this.currentAssetConfig || {}))
      );
      this.isDirty$
        .pipe(takeUntil(this.formValueChangesUnsubscribe))
        .subscribe((dirty) => this.assetConfigService.isAssetConfigDirty.next(dirty));
    }
  }

  private createForm() {
    this.assetConfigForm = this.assetConfigService.toFormGroup(this.expansionPanelConfig, this.currentAssetConfig);
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

  public onSaveChanges(assetId: any) {
    this.gtmService.updateAssetConfigurations(assetId);
    const newConfig = this.assetConfigForm.getRawValue();
    const originalConfig = this.assetConfigService.currentAssetConfig.getValue();
    const updatedConfig = this.assetConfigService.getChangedConfigs(
      originalConfig,
      this.assetConfigService.flattenObject(newConfig?.asset)
    );
    const body = {
      configuration: {},
    };
    body.configuration = updatedConfig;
    const params = {
      assetId: this.assetId,
    };
    this.assetConfigService.isUpdatingConfig.next(true);
    this.assetConfigService
      .updateAssetConfiguration(body, params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetConfigService.formatConfig({ ...this.config });
          this.assetConfigService.isUpdatingConfig.next(false);
        })
      )
      .subscribe(
        () => {
          const params = {
            assetId,
          };
          this.assetConfigService.isLoadingConfig.next(true);
          this.assetConfigService
            .getAssetConfiguration(params)
            .pipe(
              takeUntil(this.ngUnsubscribe),
              finalize(() => {
                this.assetConfigService.isLoadingConfig.next(false);
              })
            )
            .subscribe((res: any) => {
              this.config = res.configuration;
              this.assetConfigService.currentAssetConfig.next(this.config);
            });
          this.snachBarService.success(this.translate.instant('assetConfigurationsUpdateSuccess'));
        },
        () => {
          this.snachBarService.success(this.translate.instant('assetConfigurationsUpdateFailed'));
        }
      );
  }
  public assetConfigFormCheck(): FormGroup {
    return new FormGroup({});
  }
}
