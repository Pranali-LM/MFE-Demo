import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-driver-images',
  templateUrl: './driver-images.component.html',
  styleUrls: ['./driver-images.component.scss'],
})
export class DriverImagesComponent implements OnInit, OnDestroy {
  public driverImages = [];
  public loader = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DriverImagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private driverManagementService: DriverManagementService
  ) {}

  public ngOnInit() {
    const params = {
      personId: this.data.driver.personId,
    };
    this.loader = true;
    this.driverManagementService
      .getDriverImages(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.driverImages = res.samples;
        },
        () => {
          this.driverImages = [];
        }
      );
  }

  public onClose() {
    this.dialogRef.close();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.unsubscribe();
  }
}
