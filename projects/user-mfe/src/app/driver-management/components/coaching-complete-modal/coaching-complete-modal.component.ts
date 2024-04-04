import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-coaching-complete-modal',
  templateUrl: './coaching-complete-modal.component.html',
  styleUrls: ['./coaching-complete-modal.component.scss'],
})
export class CoachingCompleteModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CoachingCompleteModalComponent>,
    public dataService: DataService,
    private router: Router,
    private gtmService: GoogleTagManagerService
  ) {}

  public navigateToCoachingPage() {
    this.gtmService.gotoCoachingPageFromCoachingCompleteModel();
    this.dialogRef.close();
    this.router.navigate(['/coaching']);
  }
}
