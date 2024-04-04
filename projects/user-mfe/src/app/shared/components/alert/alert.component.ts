import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit {
  @Input() public alertType: string;
  @Input() public alertActionText: string;
  @Input() public insideTable: boolean;
  @Input() public removeMargin: boolean;
  @Input() public requireBorder: boolean;
  @Output() public alertAction = new EventEmitter();

  public currentTheme = 'light';

  constructor(private dataService: DataService) {}

  public alertActionEvent() {
    this.alertAction.emit();
  }

  public ngOnInit() {
    this.dataService._currentTheme.subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });
  }
}
