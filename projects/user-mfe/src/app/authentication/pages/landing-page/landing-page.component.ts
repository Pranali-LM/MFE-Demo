import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '@app-auth/services/authentication.service';
import { AWS_COGNITO_REGION_KEY, COGNITO_REGIONS_MAPPING, USER_COUNTRY_KEY } from '@app-core/constants/constants';
import { CognitoRegionType } from '@app-core/models/core.model';
import { CookieService } from '@app-core/services/cookie/cookie.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { StorageService } from '@app-core/services/storage/storage.service';
import { FooterComponent } from '@app-shared/components/footers/footer.model';
import { FooterDirective } from '@app-shared/directives/footer/footer.directive';
import { CLIENT_CONFIG } from '@config/config';
import { environment } from '@env/environment';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  @ViewChild(FooterDirective, { static: true }) footerHost: FooterDirective;

  public clientConfig = CLIENT_CONFIG;
  public copyrightyear = new Date().getFullYear();
  public regions: CognitoRegionType[] = [];
  public regionControl = new FormControl(
    { value: '', disabled: this.clientConfig.landingPageDetails.disableRegionSelection },
    Validators.required
  );
  public showRegionSelection =
    Boolean(CLIENT_CONFIG.landingPageDetails.defaultUserCountry) || Object.keys(environment.cognitoConfigs || {}).length > 1;

  constructor(
    private authService: AuthenticationService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private storageService: StorageService,
    private snackBarService: SnackBarService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadFooterComponent();
    const { allowedRegions = [], defaultUserCountry } = this.clientConfig.landingPageDetails || {};
    this.regions = Object.keys(environment.cognitoConfigs || {})
      .reduce((a, r) => [...a, ...(COGNITO_REGIONS_MAPPING[r] || [])], [])
      .sort((a, b) => {
        if (a.value === 'OTHER') return 1;
        if (b.value === 'OTHER') return -1;
        return a.label.localeCompare(b.label);
      });
    if (allowedRegions.length) {
      this.regions = this.regions.filter((region) => allowedRegions.includes(region.value));
    }

    const previouslySelectedRegion =
      defaultUserCountry ||
      (this.showRegionSelection ? this.storageService.getStorageValue(USER_COUNTRY_KEY) : (this.regions[0] || {}).value);
    if (previouslySelectedRegion) {
      this.regionControl.patchValue(previouslySelectedRegion);
    }
    this.cookieService.deleteAllCookies();
  }

  private loadFooterComponent() {
    const viewContainerRef = this.footerHost.viewContainerRef;
    viewContainerRef.clear();

    const component = this.componentFactoryResolver.resolveComponentFactory<FooterComponent>(
      this.clientConfig.landingPageDetails.footer.component
    );
    const componentRef = viewContainerRef.createComponent<FooterComponent>(component);
    componentRef.instance.data = { copyrightyear: this.copyrightyear };
  }

  private getAwsCognitoRegion(userCountry: string): string {
    const cognitoRegionVsCountries = Object.entries(COGNITO_REGIONS_MAPPING).find(([, countries]) =>
      countries.find((c) => c.value === userCountry)
    );
    return (cognitoRegionVsCountries || [])[0];
  }

  public onSignIn() {
    const selectedRegion = this.regionControl.value;
    if (!selectedRegion && this.showRegionSelection) {
      this.snackBarService.failure('Please select your region');
      return;
    }
    const awsCognitoRegion = this.getAwsCognitoRegion(selectedRegion);
    this.storageService.setStorageValue(USER_COUNTRY_KEY, selectedRegion);
    this.storageService.setStorageValue(AWS_COGNITO_REGION_KEY, awsCognitoRegion);
    this.authService.authorizeUser();
  }
}
