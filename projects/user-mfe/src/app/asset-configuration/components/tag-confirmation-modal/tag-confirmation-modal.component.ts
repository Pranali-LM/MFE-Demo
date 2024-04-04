import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tag-confirmation-modal',
  templateUrl: './tag-confirmation-modal.component.html',
  styleUrls: ['./tag-confirmation-modal.component.scss'],
})
export class TagConfirmationModalComponent {
  constructor(public dialogRef: MatDialogRef<TagConfirmationModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  public onClose() {
    this.dialogRef.close(true);
  }
}
