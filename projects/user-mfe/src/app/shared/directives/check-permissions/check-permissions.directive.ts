import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { getCurrentAccessDetailsState } from '@app-shared/reducers';
import { State } from '@app-shared/reducers/user-permission.reducer';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appCheckPermissions]',
})
export class CheckPermissionsDirective implements OnInit, OnDestroy {
  @Input('appCheckPermissions') set checkPermissions(permissions) {
    this.permissions = permissions;
    this.updateView();
  }

  @Input('appCheckPermissionsShowError') set showError(value: boolean) {
    if (value) {
      this.showErrorMessage = true;
      this.updateView();
    }
  }

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private permissions = [];
  private showErrorMessage = false;
  private userPermissions = [];

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef, private store: Store<State>) {}

  public ngOnInit() {
    this.store
      .select(getCurrentAccessDetailsState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ permissions = [] }) => {
        this.userPermissions = permissions;
        this.updateView();
      });
  }

  public updateView() {
    const hasPermissions = this.permissions.every((val: string) => this.userPermissions.includes(val));
    if (hasPermissions) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.showErrorMessage) {
      // this to display error message when there is no valid permissions
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }

    if (hasPermissions && this.showErrorMessage) {
      this.viewContainer.clear();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
