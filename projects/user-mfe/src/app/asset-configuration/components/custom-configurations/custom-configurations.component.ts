import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { SaveChangesCustomEventOutput } from '@app-asset-config/common/asset-configuration.model';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { FormGroup } from '@angular/forms';
import { CustomConfigurationsExpansionPanelComponent } from '../custom-configurations-expansion-panel/custom-configurations-expansion-panel.component';

@Component({
  selector: 'app-custom-configurations',
  templateUrl: './custom-configurations.component.html',
  styleUrls: ['./custom-configurations.component.scss'],
})
export class CustomConfigurationsComponent implements AfterViewInit {
  @ViewChild(CustomConfigurationsExpansionPanelComponent, { static: true })
  public configExpansionPanel: CustomConfigurationsExpansionPanelComponent;
  @Output()
  private saveChanges: EventEmitter<SaveChangesCustomEventOutput> = new EventEmitter();

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
    this.assetConfigService.isCustomConfigDirty.next(e);
  }

  public onSaveChanges() {
    const newConfig = this.settingsForm().getRawValue();
    this.saveChanges.emit({ newConfig });
  }
}
