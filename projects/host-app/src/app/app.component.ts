import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'host-app';
  sendData(){
    const busEvent = new CustomEvent('busEvent', {
      bubbles: true,
      detail: {
        customData: 'some data here'
      }
    });
    dispatchEvent(busEvent); 
  }
   
}
