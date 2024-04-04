import { Component, Input } from '@angular/core';
import { FooterComponent, FooterComponentData } from '../footer.model';

@Component({
  selector: 'app-lm-footer',
  templateUrl: './lm-footer.component.html',
  styleUrls: ['./lm-footer.component.scss'],
})
export class LmFooterComponent implements FooterComponent {
  @Input() data: FooterComponentData;
}
