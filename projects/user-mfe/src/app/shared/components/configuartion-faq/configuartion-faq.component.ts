import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PORTAL_CONFIG_FAQ_MAPPING } from '@app-core/constants/constants';
import { ConfigFAQDescription } from '@app-core/models/core.model';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-configuartion-faq',
  templateUrl: './configuartion-faq.component.html',
  styleUrls: ['./configuartion-faq.component.scss'],
})
export class ConfiguartionFaqComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public configurationId: string;
  @Input() public currentLanguage: string;

  public loader = true;
  public configFaqDetails: any;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private dataService: DataService) {}

  public ngOnInit(): void {
    this.getConfigFaqDetails();
  }

  public ngOnChanges() {
    this.getConfigFaqDetails();
  }

  public getConfigFaqDetails() {
    if (!this.configurationId) {
      return;
    }
    this.loader = true;
    const { faqId = '', faqVersion = 'v1' } = PORTAL_CONFIG_FAQ_MAPPING[this.configurationId];
    const params = {
      faqVersion,
      language: this.currentLanguage,
      userType: 'fleetmanager',
    };
    this.dataService
      .getConfigFaqDetails(params, faqId)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: ConfigFAQDescription) => {
          this.configFaqDetails = res;
        },
        () => {
          this.configFaqDetails = null;
        }
      );
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
