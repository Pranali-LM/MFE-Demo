import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-select-fleet',
  templateUrl: './select-fleet.component.html',
  styleUrls: ['./select-fleet.component.scss'],
})
export class SelectFleetComponent implements OnInit {
  @Input()
  public currentFleet = '';
  @Input()
  public userFleetList = [];
  @Output()
  private fleetChange: EventEmitter<string> = new EventEmitter<string>();

  public selectedFleet = '';

  constructor() {}

  public ngOnInit() {
    this.selectedFleet = this.selectedFleet;
  }

  public onFleetChange(event) {
    this.selectedFleet = event;
    this.fleetChange.emit(this.selectedFleet);
  }
}
