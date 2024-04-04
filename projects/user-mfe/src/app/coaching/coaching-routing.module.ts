import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoachingComponent } from './pages/coaching/coaching.component';

const routes: Routes = [
  {
    path: '',
    component: CoachingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoachingRoutingModule {}
