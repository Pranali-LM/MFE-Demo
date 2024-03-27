import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoListModule } from './todo-list/todo-list.module';
import { Todo1Component } from './todo1/todo1.component';
import { TodoListRoutingModule } from './todo-list/todo-list-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { Todo2Component } from './todo-list/todo2/todo2.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    TodoListModule,
    // TodoListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
