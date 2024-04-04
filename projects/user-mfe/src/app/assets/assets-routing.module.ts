import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsComponent } from './pages/assets/assets.component';
import { EditAssetPageComponent } from './pages/edit-asset-page/edit-asset-page.component';

const routes: Routes = [
  {
    path: '',
    component: AssetsComponent,
  },
  {
    path: 'edit-asset',
    component: EditAssetPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsRoutingModule {}
