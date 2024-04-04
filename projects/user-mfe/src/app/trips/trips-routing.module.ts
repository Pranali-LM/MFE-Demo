import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TripsComponent } from './pages/trips/trips.component';
import { EditTripComponent } from './components/edit-trip/edit-trip.component';

const routes: Routes = [
  {
    path: '',
    component: TripsComponent,
  },
  {
    path: 'edit-trip',
    component: EditTripComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripsRoutingModule {}
