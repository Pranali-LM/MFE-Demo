import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Todo1Component } from '../todo1/todo1.component';
import { TodoListComponent } from './todo-list.component';
import { Todo2Component } from './todo2/todo2.component';


const routes: Routes = [
  {path:'' ,component:TodoListComponent ,
children :[
  {path:"todo1" ,component:Todo1Component },
  {path:"todo2", component:Todo2Component},
]
},

  // {path:'todo1',component:Todo1Component}
  // {path:"todo2", component:Todo2Component}
];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class TodoListRoutingModule { }
