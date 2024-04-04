import { Directive, DoCheck } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFixToggleDisableFormControl]',
})
export class FixToggleDisableFormControlDirective implements DoCheck {
  private enabled: boolean;

  constructor(private ngControl: NgControl) {
    this.enabled = this.ngControl && this.ngControl.control && this.ngControl.control.enabled;
  }

  public ngDoCheck() {
    if (this.ngControl && this.ngControl.control) {
      if (this.ngControl.control.enabled !== this.enabled) {
        if (this.ngControl.control.enabled && !this.enabled) {
          this.ngControl.control.enable();
        } else if (!this.ngControl.control.enabled && this.enabled) {
          this.ngControl.control.disable();
        }
        this.enabled = this.ngControl.control.enabled;
      }
    }
  }
}
