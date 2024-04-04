import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { getCurrentAccessDetailsState } from '@app-shared/reducers';
import { State } from '@app-shared/reducers/user-permission.reducer';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appCheckUiConfigs]',
})
export class CheckUiconfigsDirective {
  @Input('appCheckUiConfigs') set checkUiConfigs(uiConfigs: any) {
    this.uiConfigs = (uiConfigs || []).filter(Boolean);
    this.updateView();
  }

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private uiConfigs = [];
  private userUiConfigs = [];

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef, private store: Store<State>) {}

  public ngOnInit() {
    this.store
      .select(getCurrentAccessDetailsState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ uiConfigurations = [] }) => {
        this.userUiConfigs = uiConfigurations;
        this.updateView();
      });
  }

  public updateView() {
    const hasUiConfigs = this.uiConfigs.every((val: string) => this.userUiConfigs.includes(val));
    if (hasUiConfigs) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
