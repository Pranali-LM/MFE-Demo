import { Component, OnInit } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { TAGGING_FAQ_LIST } from '../../constants/config.constants';

@Component({
  selector: 'app-tagging-faqs',
  templateUrl: './tagging-faqs.component.html',
  styleUrls: ['./tagging-faqs.component.scss'],
})
export class TaggingFaqsComponent implements OnInit {
  public taggingFaqList = TAGGING_FAQ_LIST;
  public selectedFaq = 'general';
  public selectedFaqList = [];

  constructor(public dataService: DataService) {}

  public ngOnInit() {
    this.selectedFaqList = TAGGING_FAQ_LIST.filter((x: any) => x.faqCategory === this.selectedFaq)[0].faqList;
  }

  public onSelect(event: any) {
    this.selectedFaq = event.options[0].value;
    this.selectedFaqList = TAGGING_FAQ_LIST.filter((x: any) => x.faqCategory === this.selectedFaq)[0].faqList;
  }
}
