import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const tabNameIndexMapping = {
  overview: 0,
  manage: 1,
  devices: 2,
};
@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;
  public currentOS = 'windows';
  public currentTabIndex = 0;
  public fleetId: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private keyboardShortcutsService: KeyboardShortcutsService,
    private gtmService: GoogleTagManagerService
  ) {}

  ngOnInit() {
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: any) => {
      const currentTab = param.tab;
      this.currentTabIndex = tabNameIndexMapping[currentTab] || 0;
      switch (this.currentTabIndex) {
        case 0:
          this.gtmService.customTabs('/assets', 'Assets', 'Assets Overview');
          break;
        case 1:
          this.gtmService.customTabs('/assets', 'Assets', 'Manage Assets');
          break;
        default:
          this.gtmService.customTabs('/assets', 'Assets', 'Devices');
          break;
      }
    });

    this.currentOS = this.dataService.getCurrentOS();
    this.configureKeyboardShortcuts();
  }

  public onPageTabChange(event: MatTabChangeEvent) {
    const [tabName = 'overview'] = Object.entries(tabNameIndexMapping).find(([, index]) => index === event.index);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  public configureKeyboardShortcuts() {
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab0[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(0);
      });
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab1[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(1);
      });
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab1[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(2);
      });
  }

  public onKeyboardTabChange(tabIndex: number) {
    const [tabName = 'overview'] = Object.entries(tabNameIndexMapping).find(([, idx]) => idx === tabIndex);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }
}
