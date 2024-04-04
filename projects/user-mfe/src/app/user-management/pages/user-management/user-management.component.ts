import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
// import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const tabNameIndexMapping = {
  users: 0,
  roles: 1,
};
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public currentTabIndex = 0;
  public currentOS = 'windows';
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;
  public fleetId: string;

  constructor(
    private dataService: DataService,
    // private accessService: AccessService,
    private route: ActivatedRoute,
    private router: Router,
    private keyboardShortcutsService: KeyboardShortcutsService,
    private cdRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    debugger
    this.currentOS = this.dataService.getCurrentOS();
    this.configureKeyboardShortcuts();
  }

  public ngAfterViewInit(): void {
    /* Has to be in AfterViewInit and trigger chage detection since we have structural directive for one of our mat-tab*/
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: any) => {
      const currentTab = param.tab;
      this.currentTabIndex = tabNameIndexMapping[currentTab] || 0;
      this.cdRef.detectChanges();
    });
  }

  public onPageTabChange(event: MatTabChangeEvent) {
    const [tabName = 'users'] = Object.entries(tabNameIndexMapping).find(([, index]) => index === event.index);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  private configureKeyboardShortcuts() {
    // const { customerName = '' } = this.accessService.getLoginInfo();
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
      .addShortcut({ keys: this.keyboardShortcuts.goToTab2[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(2);
      });
  }

  private onKeyboardTabChange(tabIndex: number) {
    const [tabName = 'overview'] = Object.entries(tabNameIndexMapping).find(([, idx]) => idx === tabIndex);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
