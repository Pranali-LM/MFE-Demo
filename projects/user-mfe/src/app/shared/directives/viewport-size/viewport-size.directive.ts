import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BREAKPOINTS_LARGE, BREAKPOINTS_MEDIUM, BREAKPOINTS_SMALL } from '@app-core/constants/constants';

type Size = 'SMALL' | 'MEDIUM' | 'LARGE';

const config = {
  small: BREAKPOINTS_SMALL,
  medium: BREAKPOINTS_MEDIUM,
  large: BREAKPOINTS_LARGE,
};

@Directive({
  selector: '[appViewportSize]',
})
export class ViewportSizeDirective implements OnDestroy {
  private subscription = new Subscription();

  @Input('appViewportSize') set size(value: Size) {
    this.subscription.unsubscribe();
    this.subscription = this.observer.observe(config[value.toLowerCase()]).subscribe(this.updateView);
  }

  constructor(private observer: BreakpointObserver, private vcRef: ViewContainerRef, private templateRef: TemplateRef<any>) {}

  public updateView = ({ matches }: BreakpointState) => {
    if (matches && !this.vcRef.length) {
      this.vcRef.createEmbeddedView(this.templateRef);
    } else if (!matches && this.vcRef.length) {
      this.vcRef.clear();
    }
    // eslint-disable-next-line @typescript-eslint/semi, @typescript-eslint/member-delimiter-style
  };

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
