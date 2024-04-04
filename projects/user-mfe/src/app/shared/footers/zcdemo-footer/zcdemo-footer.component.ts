import { Component, Input } from '@angular/core';
import { FooterComponent, FooterComponentData } from '@app-shared/components/footers/footer.model';

@Component({
  selector: 'app-zcdemo-footer',
  templateUrl: './zcdemo-footer.component.html',
  styleUrls: ['./zcdemo-footer.component.scss'],
})
export class ZcdemoFooterComponent implements FooterComponent {
  @Input() data: FooterComponentData;
}
