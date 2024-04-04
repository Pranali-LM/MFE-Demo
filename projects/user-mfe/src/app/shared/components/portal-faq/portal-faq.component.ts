import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PORTAL_FAQ_MAPPING } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-portal-faq',
  templateUrl: './portal-faq.component.html',
  styleUrls: ['./portal-faq.component.scss'],
})
export class PortalFaqComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public featureId: string;
  @Input() public currentLanguage: string;
  public loader = true;
  public faqDetails: any;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private dataService: DataService) {}

  public ngOnInit(): void {
    this.getFaqDetails();
  }

  public ngOnChanges() {
    this.getFaqDetails();
  }

  public getFaqDetails() {
    if (!this.featureId) {
      return;
    }
    this.loader = true;
    const { faqId = '', faqVersion = 'v1' } = PORTAL_FAQ_MAPPING[this.featureId];
    const params = {
      faqVersion,
      language: this.currentLanguage,
    };
    this.dataService
      .getFaqDetails(faqId, params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.faqDetails = res;
        },
        () => {
          this.faqDetails = null;
        }
      );
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
