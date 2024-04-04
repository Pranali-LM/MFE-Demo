import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from './assets-routing.module';
import { SharedModule } from '@app-shared/shared.module';
import { AssetsComponent } from './pages/assets/assets.component';
import { AssetListComponent } from './components/asset-list/asset-list.component';
import { ManageDeviceComponent } from './components/manage-device/manage-device.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AssetUploadComponent } from './components/asset-upload/asset-upload.component';
import { AssetConfigurationsExpansionPanelComponent } from './components/asset-configurations-expansion-panel/asset-configurations-expansion-panel.component';
import { BatchProvisionComponent } from './components/batch-provision/batch-provision.component';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { ProvisionDeviceComponent } from './components/provision-device/provision-device.component';
import { EditAssetPageComponent } from './pages/edit-asset-page/edit-asset-page.component';
import { MdvrConfigComponent } from './components/mdvr-config/mdvr-config.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AssetsComponent,
    AssetListComponent,
    ManageDeviceComponent,
    AssetUploadComponent,
    BatchProvisionComponent,
    AssetConfigurationsExpansionPanelComponent,
    DeviceListComponent,
    ProvisionDeviceComponent,
    EditAssetPageComponent,
    MdvrConfigComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AssetsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  entryComponents: [ManageDeviceComponent, ProvisionDeviceComponent],
})
export class AssetsModule {}
