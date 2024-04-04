import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { BREAKPOINTS_PORTRAIT } from '@app-core/constants/constants';

@Component({
  selector: 'app-orientation-blocker',
  templateUrl: './orientation-blocker.component.html',
  styleUrls: ['./orientation-blocker.component.scss'],
})
export class OrientationBlockerComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<OrientationBlockerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver
  ) {}

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_PORTRAIT).subscribe((state: BreakpointState) => {
      if (!state.matches) {
        this.dialogRef.close();
      }
    });
  }
}
