import { Component, Input } from '@angular/core';
import { FooterComponent, FooterComponentData } from '../footer.model';

@Component({
  selector: 'app-solera-footer',
  templateUrl: './solera-footer.component.html',
  styleUrls: ['./solera-footer.component.scss'],
})
export class SoleraFooterComponent implements FooterComponent {
  @Input() data: FooterComponentData;
}
