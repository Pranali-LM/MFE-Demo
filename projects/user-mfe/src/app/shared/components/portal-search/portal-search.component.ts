import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QUICK_LINK_LIST, SEARCH_AUTOCOMPLETE_LIST } from '@app-core/constants/search.constant';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-portal-search',
  templateUrl: './portal-search.component.html',
  styleUrls: ['./portal-search.component.scss'],
})
export class PortalSearchComponent implements OnInit, OnDestroy {
  public searchString = new FormControl('');
  public searchAutocompleteList = [];
  public isSearchActive = false;
  public currentLanguage = 'en';
  public quickLinkList = QUICK_LINK_LIST['en'];

  private ngUnsubscribe: Subject<void> = new Subject();
  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentLanguage = value;
        this.quickLinkList = QUICK_LINK_LIST[this.currentLanguage];
      }
    });

    this.searchString.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(300),
        map((val) => val.trim().toLowerCase())
      )
      .subscribe((val) => {
        this.isSearchActive = true;
        this.filterSearchResults(val);
      });
  }

  public filterSearchResults(val: string) {
    if (val.length) {
      this.searchAutocompleteList = SEARCH_AUTOCOMPLETE_LIST[this.currentLanguage].filter((x) => {
        return x.featureName.toLowerCase().includes(val);
      });
    } else {
      this.searchAutocompleteList = [];
      this.isSearchActive = false;
    }
  }

  public clearInput() {
    this.isSearchActive = false;
    this.searchString.patchValue('');
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
