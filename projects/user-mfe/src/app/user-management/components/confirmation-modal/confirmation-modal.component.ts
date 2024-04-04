import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  public loader = false;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService
  ) {}

  public isError = false;
  public isSuccess = false;
  public msgText = '';

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public onClose() {
    this.dialogRef.close(true);
  }

  public submit() {
    if (this.data?.apiMethod) {
      this.loader = true;
      this.data
        .apiMethod()
        .pipe(
          finalize(() => {
            this.loader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          () => {
            this.isError = false;
            this.isSuccess = true;
            this.msgText = this.data.type + 'management' + this.data.action + 'Success';
          },
          () => {
            this.isError = true;
            this.isSuccess = false;
            this.msgText = this.data.type + 'management' + this.data.action + 'Failed';
          }
        );
    } else {
      this.dialogRef.close(true);
    }
  }
}
