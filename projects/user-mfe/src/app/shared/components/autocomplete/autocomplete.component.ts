import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit, OnChanges, OnDestroy {
  public formCtrl = new FormControl();
  public filteredList: any[] = [];

  @ViewChild('trigger', { static: true })
  private autocompleteTrigger: MatAutocompleteTrigger;
  @Input() public isDriver: boolean;
  @Input() public list: any[] = [];
  @Input() public displayProp = '';
  @Input() public placeholder = '';
  @Input() public disabled = false;
  @Input() public customOptions = {
    showLargeInput: true,
    appearance: 'standard',
    showLabel: false,
  };
  @Input() public inputValue = '';
  @Output() public valueChange = new EventEmitter<any>();

  private subscription;

  constructor(public translate: TranslateService) {}

  public ngOnInit() {
    this.initSubscription();
  }

  public valueChanged(item) {
    const value = item.option.value;
    if (value && typeof value === 'string') {
      this.valueChange.emit(item.option.value);
    }
  }

  public initSubscription() {
    this.subscription = this.formCtrl.valueChanges
      .pipe(
        startWith(''),
        map((val) => {
          return val ? this._filterList(val) : this.list.slice();
        })
      )
      .subscribe((list) => {
        this.filteredList = list;
      });
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.isDriver) {
      this.translate.stream('All Drivers').subscribe((text: string) => {
        this.formCtrl.setValue(text);
      });
    }
    // Check whether list property exists
    if (changes.list && changes.list.currentValue) {
      this.filteredList = changes.list.currentValue.slice();
    }

    // Check whether disabled property exists
    if (changes.disabled) {
      // Enable or disable the autocomplete based on the disabled property
      changes.disabled.currentValue ? this.formCtrl.disable() : this.formCtrl.enable();
      this.formCtrl.setValue('');
    }
    // Set input value to Form control
    if (changes.inputValue) {
      this.formCtrl.setValue(this.inputValue);
    }
  }

  private _filterList(value): any[] {
    const filterValue = this.toLowercase(value);

    return this.list.filter((ele) => {
      const val = this.toLowercase(ele);
      if (val) {
        return val.indexOf(filterValue) === 0;
      }
    });
  }

  private toLowercase(ele): any {
    if (ele && ele !== 0) {
      const value = typeof ele === 'object' ? ele[this.displayProp] : ele;

      return typeof value === 'string' ? value.toLowerCase() : value.toString();
    }
    return ele;
  }

  public getValue(val) {
    if (typeof val === 'object') {
      return val[this.displayProp];
    } else {
      return val;
    }
  }

  public clearFormField(event) {
    // Button click changes focus from input field back to clear button so autocomplete is hiding immediately
    event.stopPropagation(); // To prevent closing of autocomplete panel immediately
    this.formCtrl.reset();
    this.valueChange.emit(null);
    this.autocompleteTrigger.openPanel();
  }
}
