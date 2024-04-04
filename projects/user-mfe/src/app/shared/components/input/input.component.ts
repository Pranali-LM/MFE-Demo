import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '@app-core/models/core.model';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  @Input()
  public form: FormGroup;

  @Input()
  public config: any = {};

  public errorStateMatcher = new MyErrorStateMatcher();
  public currentMetricUnit = null;

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
  }

  /**
   * Prevent inputting inputs other than Number, backspace
   * @param event Event
   */
  public onKeyPress(event: KeyboardEvent) {
    if (this.config && this.config.type === 'number') {
      if (event.which !== 8 && event.which !== 0 && (event.which < 48 || event.which > 57)) {
        if (this.config.allowFloat && event.which === 46) {
          return;
        }
        event.preventDefault();
      }
    }
  }
}
