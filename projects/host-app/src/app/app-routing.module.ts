import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { HomeComponent } from './home/home.component';
const MFE_APP_URL = "http://localhost:4200/remoteEntry.js";
const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {
    path: 'usermfe',
    loadChildren: () => {
      return loadRemoteModule({
        remoteEntry: MFE_APP_URL,
        remoteName: "usermfe",
        exposedModule: "./AppModule"
      }).then(m => m.AppModule).catch(err => console.log(err));
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
