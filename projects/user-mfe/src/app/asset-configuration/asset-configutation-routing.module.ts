import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetConfigurationComponent } from '@app-asset-config/pages/asset-configuration/asset-configuration.component';
import { DirtyCheckGuard } from '@app-core/guards/dirty-check/dirty-check.guard';
import { AddAttributeComponent } from './components/add-attribute/add-attribute.component';
import { AddTagsComponent } from './components/add-tags/add-tags.component';
import { AssignAttributeComponent } from './components/assign-attribute/assign-attribute.component';
import { CustomEventsResolver } from '../resolvers/custom-events/custom-events.resolver';

const routes: Routes = [
  {
    path: '',
    canDeactivate: [DirtyCheckGuard],
    component: AssetConfigurationComponent,
    resolve: {
      customEvents: CustomEventsResolver,
    },
  },
  {
    path: 'add-attribute',
    component: AddAttributeComponent,
  },
  {
    path: 'add-tags',
    component: AddTagsComponent,
  },
  {
    path: 'assign-attributes',
    component: AssignAttributeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetConfigurationRoutingModule {}
