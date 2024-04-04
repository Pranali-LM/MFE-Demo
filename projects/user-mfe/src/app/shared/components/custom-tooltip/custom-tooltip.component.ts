import { Component, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-custom-tooltip',
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent {
  public contentTemplate: TemplateRef<any>;
  public templateContext: any = {};

  constructor() {}
}
