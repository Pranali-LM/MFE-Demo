import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { KEYBOARD_SHORTCUTS_LIST } from '@app-core/constants/keyboard-shortcuts.constants';

import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shortcuts-list',
  templateUrl: './shortcuts-list.component.html',
  styleUrls: ['./shortcuts-list.component.scss'],
})
export class ShortcutsListComponent implements OnInit, OnDestroy {
  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public tableColumns = ['action', 'shortcutKey'];

  public currentTheme = 'light';
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    const currentOS = this.dataService.getCurrentOS();
    const updatedKeyboardShortcuts = KEYBOARD_SHORTCUTS_LIST.map((x) => {
      return {
        ...x,
        keys: currentOS === 'mac' ? x.macKeys : x.windowsKeys,
      };
    });
    this.tableSource = new MatTableDataSource(updatedKeyboardShortcuts);
    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
