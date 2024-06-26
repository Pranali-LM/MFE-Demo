import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

const ITEMS_PER_PAGE = 'Items per page:';
const NEXT_PAGE = 'Next page';
const PREV_PAGE = 'Previous page';
const FIRST_PAGE = 'First page';
const LAST_PAGE = 'Last page';

@Injectable()
export class MatPaginatorI18nService extends MatPaginatorIntl {
  itemsPerPageLabel: any;
  previousPageLabel: any;
  nextPageLabel: any;
  firstPageLabel: any;
  lastPageLabel: any;
  changes: any;
  public constructor(private translate: TranslateService) {
    super();

    this.translate.onLangChange.subscribe((_e: Event) => {
      this.getAndInitTranslations();
    });

    this.getAndInitTranslations();
  }

  public getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 / ${length}`;
    }

    length = Math.max(length, 0);

    const startIndex: number = page * pageSize;
    const endIndex: number = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} / ${length}`;
  };

  public getAndInitTranslations(): void {
    this.translate.get([ITEMS_PER_PAGE, NEXT_PAGE, PREV_PAGE, FIRST_PAGE, LAST_PAGE]).subscribe((translation: any) => {
      this.itemsPerPageLabel = translation[ITEMS_PER_PAGE];
      this.nextPageLabel = translation[NEXT_PAGE];
      this.previousPageLabel = translation[PREV_PAGE];
      this.firstPageLabel = translation[FIRST_PAGE];
      this.lastPageLabel = translation[LAST_PAGE];

      this.changes.next();
    });
  }
}
