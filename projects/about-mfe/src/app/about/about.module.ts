import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AboutComponent } from './about.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forChild([
      {path:'',component:AboutComponent}
    ])
  ]
})
export class AboutModule { }
