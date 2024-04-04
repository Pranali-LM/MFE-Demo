import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IMAGE_LIST } from '@app-core/constants/constants';
@Component({
  selector: 'app-enrollment-faq',
  templateUrl: './enrollment-faq.component.html',
  styleUrls: ['./enrollment-faq.component.scss'],
})
export class EnrollmentFaqComponent {
  public imageList = IMAGE_LIST;

  constructor(public dialogRef: MatDialogRef<EnrollmentFaqComponent>) {}

  public onClose() {
    this.dialogRef.close();
  }
}
