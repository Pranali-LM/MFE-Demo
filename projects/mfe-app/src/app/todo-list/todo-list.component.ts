import { Component } from '@angular/core';
import { fromEvent } from 'rxjs';
@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {

  ngOnInit(): void {
    
    fromEvent(window , 'busEvent').subscribe((event)=>{
      console.log(event);
    })
  }
}
