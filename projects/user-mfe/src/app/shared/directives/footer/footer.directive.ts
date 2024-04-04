import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appFooterHost]',
})
export class FooterDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
