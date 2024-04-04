import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-end-session-confirmation',
  templateUrl: './end-session-confirmation.component.html',
  styleUrls: ['./end-session-confirmation.component.scss'],
})
export class EndSessionConfirmationComponent {
  constructor(public dialogRef: MatDialogRef<EndSessionConfirmationComponent>) {}

  public onSubmit(isEndingSession: boolean) {
    this.dialogRef.close(isEndingSession);
  }
}
