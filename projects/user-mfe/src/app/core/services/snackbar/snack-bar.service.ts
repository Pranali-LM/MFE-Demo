import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private options = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  constructor(private snackBar: MatSnackBar) {}

  private openSnackBar(message: string, action: string, options) {
    return this.snackBar.open(message, action, options);
  }

  public success(message, options: any = {}) {
    const op = { ...this.options, ...options, panelClass: ['bg-snackbar', 'snackbar-success'] };
    return this.openSnackBar(message, '', op);
  }

  public failure(message, options: any = {}) {
    const op = { ...this.options, ...options, panelClass: ['bg-snackbar', 'snackbar-failure'] };
    this.openSnackBar(message, '', op);
  }
}
