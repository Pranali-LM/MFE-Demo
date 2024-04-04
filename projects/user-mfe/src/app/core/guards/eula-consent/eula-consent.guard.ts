import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { EulaConsentService } from '@app-auth/services/eula-consent/eula-consent.service';
import { DialogService } from '@app-core/services/dialog/dialog.service';

@Injectable({
  providedIn: 'root',
})
export class EulaConsentGuard implements CanActivate {
  constructor(private eulaConsentService: EulaConsentService, private dialogService: DialogService) {}

  public async canActivate(): Promise<boolean> {
    const alreadyAcceptedEula = await this.eulaConsentService.getEULAconsent();
    if (alreadyAcceptedEula) {
      return true;
    }

    const dialogRef = this.dialogService.openEULADialog();
    const acceptedEULA = await dialogRef.afterClosed().toPromise();
    if (acceptedEULA) {
      return true;
    }

    this.eulaConsentService.logout();
    return false;
  }
}
