import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-asset-autocomplete',
  templateUrl: './asset-autocomplete.component.html',
  styleUrls: ['./asset-autocomplete.component.scss'],
})
export class AssetAutocompleteComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public placeholder = 'Search';
  @Input()
  public enableAutocomplete = false;
  @Input()
  public hint = '';
  @Input()
  public inputValue = '';
  @Input()
  public isRequired = false;
  @Input()
  public requiredErrorMessage = '';

  @Output()
  private assetSelection = new EventEmitter<string>();
  public inputControl = new FormControl('');
  public filteredAssets = null;
  public showSpinner = false;
  public disabled = false;

  private selectedAssetId = '';
  private ngUnSubscribe: Subject<void> = new Subject();

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.inputControl.valueChanges
      .pipe(
        takeUntil(this.ngUnSubscribe),
        debounceTime(500),
        map((val) => val.trim().toLowerCase()),
        distinctUntilChanged(),
        switchMap((searchString) => this.autoCompleteAssets(searchString)),
        catchError(() => of([]))
      )
      .subscribe((assets: string[]) => {
        this.filteredAssets = assets;
      });
  }

  public ngOnChanges() {
    this.inputControl.setValue(this.inputValue);
  }

  public ngOnDestroy() {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }

  private autoCompleteAssets(assetId = ''): Observable<string[]> {
    const selectedAssetIdInLowerCase = this.selectedAssetId && this.selectedAssetId.toLowerCase();
    if (!assetId || selectedAssetIdInLowerCase === assetId) {
      this.showSpinner = false;
      return of([]);
    }
    const params = {
      assetId: encodeURIComponent(assetId),
    };
    this.showSpinner = true;
    return this.dataService.assetsAutocomplete(params).pipe(
      tap(() => (this.showSpinner = false)),
      map((res: any) => {
        const { assets = [] } = res.data || {};
        return assets;
      }),
      catchError(() => {
        this.showSpinner = false;
        return of([]);
      })
    );
  }

  public autoCompleteOptionSelected(event: any) {
    const value = event.option.value;
    if (value && typeof value === 'string') {
      this.selectedAssetId = value;
      this.assetSelection.emit(value);
    }
  }

  public clearInput() {
    this.inputControl.patchValue('');
    this.assetSelection.emit('');
  }
}
