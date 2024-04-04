import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
})
export class SlideToggleComponent {
  @Input()
  public form: FormGroup;

  @Input()
  public config: any = {};

  constructor() {}
}
