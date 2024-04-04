import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SaveChangesOutput } from '@app-asset-config/common/asset-configuration.model';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { ConfigurationsExpansionPanelComponent } from '../configurations-expansion-panel/configurations-expansion-panel.component';

@Component({
  selector: 'app-basic-configurations',
  templateUrl: './basic-configurations.component.html',
  styleUrls: ['./basic-configurations.component.scss'],
})
export class BasicConfigurationsComponent implements AfterViewInit {
  @ViewChild(ConfigurationsExpansionPanelComponent, { static: true })
  public configExpansionPanel: ConfigurationsExpansionPanelComponent;

  @Output()
  private saveChanges: EventEmitter<SaveChangesOutput> = new EventEmitter();

  constructor(public assetConfigService: AssetConfigurationService) {}

  public ngAfterViewInit() {
    setTimeout(() => {
      this.settingsForm = () => this.configExpansionPanel.settingsForm;
    });
  }

  public settingsForm(): FormGroup {
    return new FormGroup({});
  }

  public onFormChanged(e: boolean) {
    this.assetConfigService.isBasicConfigDirty.next(e);
  }

  public onSaveChanges() {
    const newConfig = this.settingsForm().getRawValue();
    this.saveChanges.emit({ newConfig, saveForAllDutyTypes: false });
  }
}
