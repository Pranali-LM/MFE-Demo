import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoListComponent } from './todo-list/todo-list.component';
import { Todo1Component } from './todo1/todo1.component';
import { TodoListModule } from './todo-list/todo-list.module';
import { loadRemoteModule } from '@angular-architects/module-federation';

const ABOUT_URL = "http://localhost:4600/remoteEntry.js";
const routes: Routes = [
  // {path: '', redirectTo: '/todo-list', pathMatch: 'full'},
  {path: 'todo-list', loadChildren: () => import('./todo-list/todo-list.module').then(m => m.TodoListModule)  },
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
