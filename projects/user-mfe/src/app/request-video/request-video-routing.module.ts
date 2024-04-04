import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestVideoComponent } from './pages/request-video/request-video.component';

const routes: Routes = [
  {
    path: '',
    component: RequestVideoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestVideoRoutingModule {}
