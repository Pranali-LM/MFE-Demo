import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-filter',
  templateUrl: './page-filter.component.html',
  styleUrls: ['./page-filter.component.scss'],
})
export class PageFilterComponent {
  @Input()
  public durationDays: number;
  @Input()
  public durationList: any[] = [];
  @Input()
  public homeTags: any[] = [];

  /**
   * Output event emitted on change of duration filter
   */
  @Output()
  public changeDuration: EventEmitter<any> = new EventEmitter();
  @Output()
  public changeSearchByTags: EventEmitter<any> = new EventEmitter();

  public entityType = ['asset', 'driver'];

  constructor() {}

  /**
   * Function called on Change of duration filter.
   *
   * Emit changeDuration event if the selected duration is in the duration list
   * @param {any} duration Selected duration
   */
  public durationChange(duration: any): void {
    this.changeDuration.emit(duration.value);
  }

  /**
   * Function called on Change of tag filter.
   *
   * Emit changeSearchTags event if the selected tag is in the tag list
   * @param {any} tag Selected tag
   */
  public selectedTags(tag: any): void {
    this.changeSearchByTags.emit(tag);
  }
}
