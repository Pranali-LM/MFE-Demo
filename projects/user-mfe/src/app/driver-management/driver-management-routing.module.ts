import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DriverManagementComponent } from './pages/driver-management/driver-management.component';
import { CoachingSessionComponent } from './components/coaching-session/coaching-session.component';

const routes: Routes = [
  {
    path: '',
    component: DriverManagementComponent,
  },
  {
    path: 'coaching-session',
    component: CoachingSessionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverManagementRoutingModule {}
