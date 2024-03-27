import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { loadRemoteModule } from '@angular-architects/module-federation';

const MFE_APP_URL = "http://localhost:4300/remoteEntry.js";
const ABOUT_URL = "http://localhost:4600/remoteEntry.js";
const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {
    path: 'todo-list', 
    loadChildren: () => {
      return loadRemoteModule({
        remoteEntry: MFE_APP_URL,
        remoteName: "mfeApp",
        exposedModule: "./TodoListModule"
      }).then(m => m.TodoListModule).catch(err => console.log(err));
    }
  },
  {
    path:'about',
    loadChildren :() =>{
      return loadRemoteModule({
        remoteEntry : ABOUT_URL,
        remoteName : "about_mfe",
        exposedModule : "./AboutModule"
      }).then(m => m.AboutModule).catch(err => console.log(err))
    }
  }
  // {
  //   path:'todo1',
  //   loadChildren :() =>{
  //     return loadRemoteModule({
  //       remoteEntry : MFE_APP_URL,
  //       remoteName : "mfeApp",
  //       exposedModule : "./Todo1Module"
  //     }).then(m => m.Todo1Module).catch(err => console.log(err))
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routeCompArr = [HomeComponent];
