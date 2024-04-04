import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '@app-core/services/data/data.service';
import { PageEvent } from '@angular/material/paginator';
import { TagsOnboardingComponent } from '../tags-onboarding/tags-onboarding.component';
import { TaggingExamplesComponent } from '../tagging-examples/tagging-examples.component';
import { TaggingFaqsComponent } from '../tagging-faqs/tagging-faqs.component';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';

export enum ManageAction {
  Add = 'add',
  Edit = 'edit',
}

@Component({
  selector: 'app-tagging',
  templateUrl: './tagging.component.html',
  styleUrls: ['./tagging.component.scss'],
})
export class TaggingComponent implements OnInit, OnDestroy {
  public selectedEventType = new FormControl([]);
  public optionList = ['Overview', 'Attributes', 'Tags', 'Entities'];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public selectedOption: any = 'Overview';
  public fleetId: string;
  public getAttributesLoader = true;
  public attributeList = [];
  public totalAttributesCount = 0;
  public noOverviewDetailsFound = false;
  public perPagelimit = 10;
  public skip = 0;

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    private taggingService: TaggingService,
    private gtmService: GoogleTagManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedOption = this.taggingService.optionType || 'Overview';
    this.selectedEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      this.selectedOption = value;
      this.taggingService.optionType = value;
      this.gtmService.changeTaggingOverviewFilter(this.selectedOption);
      if (this.selectedOption === 'Overview' || this.selectedOption === 'Attributes') {
        this.skip = 0;
        this.getAttributes();
      }
    });
    this.selectedEventType.patchValue(this.selectedOption);
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        this.getData();
      }
    });
  }

  private async getData() {
    if (!this.fleetId) {
      return;
    }
    this.getAttributes();
  }

  public addAttribute(action, event?) {
    this.taggingService.attributeDetails = event || '';
    this.router.navigate(['/configurations/add-attribute'], {
      queryParams: {
        action: action,
        attributeId: event?.attributeId || '',
      },
    });
  }

  public openTagsOnboarding() {
    this.dialog.open(TagsOnboardingComponent, {
      width: '720px',
      minHeight: '400px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
    });
  }

  public openTaggingExamples() {
    this.dialog.open(TaggingExamplesComponent, {
      width: '640px',
      minHeight: '300px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
    });
  }

  public openTaggingFaqs() {
    this.dialog.open(TaggingFaqsComponent, {
      width: '800px',
      minHeight: '640px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
    });
  }

  public getAttributes() {
    this.getAttributesLoader = true;
    const params = {
      fleetId: this.fleetId,
      limit: this.perPagelimit,
      offset: this.skip,
    };
    this.taggingService
      .getAttributes(params)
      .pipe(
        finalize(() => {
          this.getAttributesLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.attributeList = res?.data;
          this.totalAttributesCount = res?.totalAttribute;
          if (this.totalAttributesCount === 0) {
            this.noOverviewDetailsFound = true;
          }
        },
        () => {}
      );
  }

  public onOverviewPageChange(event: PageEvent) {
    this.skip = event.pageIndex * this.perPagelimit;
    this.getAttributes();
  }

  public onRefreshOverview() {
    this.skip = 0;
    this.getAttributes();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
