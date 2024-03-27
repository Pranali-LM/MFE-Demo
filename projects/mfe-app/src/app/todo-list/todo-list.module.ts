import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListRoutingModule } from './todo-list-routing.module';
import { TodoListComponent } from './todo-list.component';
import { Todo1Component } from '../todo1/todo1.component';
import { Todo2Component } from './todo2/todo2.component';

@NgModule({
  declarations: [Todo1Component,
    Todo2Component,
    TodoListComponent,
  ],
  imports: [
    CommonModule,
    TodoListRoutingModule,
    // RouterModule
 
    // RouterModule.forChild([
    //   {
    //     path: '',
    //     component: TodoListComponent,
    //     children : [
    //       {path:"todo1",component : Todo1Component}
    //     ]
    //   }
    // ])
  ]
})
export class TodoListModule { }
