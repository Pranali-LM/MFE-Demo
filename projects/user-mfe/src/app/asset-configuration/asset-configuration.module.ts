import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@app-shared/shared.module';
import { AssetConfigurationRoutingModule } from './asset-configutation-routing.module';

import { StoreModule } from '@ngrx/store';
import { AdvancedConfigurationsComponent } from './components/advanced-configurations/advanced-configurations.component';
import { BasicConfigurationsComponent } from './components/basic-configurations/basic-configurations.component';
import { ConfigurationsExpansionPanelComponent } from './components/configurations-expansion-panel/configurations-expansion-panel.component';
import { DutyTypeConfigurationComponent } from './components/duty-type-configuration/duty-type-configuration.component';
import { AssetConfigurationComponent } from './pages/asset-configuration/asset-configuration.component';
import { reducers } from './reducers';
import { AssetConfigurationService } from './services/asset-configuration.service';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DriverConfigurationsComponent } from './components/driver-configurations/driver-configurations.component';
import { CoachingThresholdComponent } from './components/coaching-threshold/coaching-threshold.component';
import { TaggingComponent } from './components/tagging/tagging.component';
import { AttributeTableComponent } from './components/attribute-table/attribute-table.component';
import { TaggingExamplesComponent } from './components/tagging-examples/tagging-examples.component';
import { TaggingFaqsComponent } from './components/tagging-faqs/tagging-faqs.component';
import { TagsOnboardingComponent } from './components/tags-onboarding/tags-onboarding.component';
import { TagsTableComponent } from './components/tags-table/tags-table.component';
import { OverviewTableComponent } from './components/overview-table/overview-table.component';
import { EntityTableComponent } from './components/entity-table/entity-table.component';
import { AddAttributeComponent } from './components/add-attribute/add-attribute.component';
import { AddTagsComponent } from './components/add-tags/add-tags.component';
import { AssignAttributeComponent } from './components/assign-attribute/assign-attribute.component';
import { TagConfirmationModalComponent } from './components/tag-confirmation-modal/tag-confirmation-modal.component';
import { CustomConfigurationsComponent } from './components/custom-configurations/custom-configurations.component';
import { CustomConfigurationsExpansionPanelComponent } from './components/custom-configurations-expansion-panel/custom-configurations-expansion-panel.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AssetConfigurationRoutingModule,
    StoreModule.forFeature('asset-configuration', reducers),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    AssetConfigurationComponent,
    DutyTypeConfigurationComponent,
    BasicConfigurationsComponent,
    AdvancedConfigurationsComponent,
    ConfigurationsExpansionPanelComponent,
    DriverConfigurationsComponent,
    CoachingThresholdComponent,
    TaggingComponent,
    AttributeTableComponent,
    TaggingExamplesComponent,
    TaggingFaqsComponent,
    TagsOnboardingComponent,
    OverviewTableComponent,
    TagsTableComponent,
    EntityTableComponent,
    AddAttributeComponent,
    AddTagsComponent,
    AssignAttributeComponent,
    TagConfirmationModalComponent,
    CustomConfigurationsComponent,
    CustomConfigurationsExpansionPanelComponent,
  ],
  providers: [AssetConfigurationService],
})
export class AssetConfigurationModule {}
