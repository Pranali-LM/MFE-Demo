import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SaveChangesOutput } from '@app-asset-config/common/asset-configuration.model';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { ConfigurationsExpansionPanelComponent } from '../configurations-expansion-panel/configurations-expansion-panel.component';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DialogService } from '@app-core/services/dialog/dialog.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-advanced-configurations',
  templateUrl: './advanced-configurations.component.html',
  styleUrls: ['./advanced-configurations.component.scss'],
})
export class AdvancedConfigurationsComponent implements AfterViewInit {
  @ViewChild(ConfigurationsExpansionPanelComponent, { static: true })
  public configExpansionPanel: ConfigurationsExpansionPanelComponent;
  public isDirty$: Observable<boolean> = of(false);
  public dutyTypeChange$ = new Subject();
  public currentDutyType = '';

  @Output()
  private saveChanges: EventEmitter<SaveChangesOutput> = new EventEmitter();

  constructor(
    public assetConfigService: AssetConfigurationService,
    private gtmService: GoogleTagManagerService,
    private dialogService: DialogService,
    public translate: TranslateService
  ) {}

  public ngAfterViewInit() {
    setTimeout(() => {
      this.settingsForm = () => this.configExpansionPanel.settingsForm;
    });
  }

  public settingsForm(): FormGroup {
    return new FormGroup({});
  }

  public onFormChanged(e: boolean) {
    this.assetConfigService.isAdvancedConfigDirty.next(e);
  }

  public onSaveChanges(saveForAllDutyTypes = false) {
    const newConfig = this.settingsForm().getRawValue();
    this.saveChanges.emit({ newConfig, saveForAllDutyTypes });
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
}
