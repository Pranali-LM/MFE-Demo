import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit {
  @Input()
  public form: FormGroup;
  @Input()
  public config: any = {};
  public currentMetricUnit = null;

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
  }
}
