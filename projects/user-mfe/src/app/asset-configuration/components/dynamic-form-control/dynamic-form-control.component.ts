import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  styleUrls: ['./dynamic-form-control.component.scss'],
})
export class DynamicFormControlComponent {
  @Input()
  public form: FormGroup;

  @Input()
  public config: any;

  constructor() {}
}
