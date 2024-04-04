import { Component, OnInit } from '@angular/core';
import { COOKIE_CONSENT_EXPIRES } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { UpdateUserMetadataReqBody } from '@app-user-management/models/users.model';
import { UserManageService } from '@app-user-management/services/user-manage/user-manage.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
})
export class CookieConsentComponent implements OnInit {
  public preferCustomization = false;
  public functionalCookies: boolean = false;
  public statisticalCookies: boolean = false;
  private cookieExpires: any;
  private userId: string;

  constructor(
    public dataService: DataService,
    private accessService: AccessService,
    private gtmService: GoogleTagManagerService,
    private userManageService: UserManageService
  ) {}

  ngOnInit() {
    this.userId = this.accessService.getLoginInfo().userId;
    this.dataService._currentCookiesConsent.subscribe((value: any) => {
      if (value) {
        this.functionalCookies = value.functionalCookies;
        this.statisticalCookies = value.statisticalCookies;
        this.cookieExpires = value.cookieExpires;
      }
    });
  }

  public onSelect() {
    this.preferCustomization = !this.preferCustomization;
  }

  public acceptCookies() {
    this.updateMetadata(true, true, 'Accept');
  }

  public rejectCookies() {
    this.updateMetadata(false, false, 'Reject');
  }

  public saveCustomizedCookies() {
    this.updateMetadata(this.functionalCookies, this.statisticalCookies, 'Customized');
  }

  private updateMetadata(functional: boolean, statistical: boolean, consentType: string) {
    this.cookieExpires = new Date();

    let params = {
      cookieConsent: {
        necessaryCookies: true,
        functionalCookies: functional,
        statisticalCookies: statistical,
        cookieExpires: this.cookieExpires.getTime() + COOKIE_CONSENT_EXPIRES,
      },
    };
    const body = new UpdateUserMetadataReqBody(params);

    if (window.self != window.top) {
      const { userMetadata: oldMetadata = {} } = this.accessService.getLoginInfo();
      const userPrefChangedMessage = {
        type: 'user_preferences_changed',
        userPreferences: {
          ...oldMetadata,
          ...params,
        },
      };
      window.parent.postMessage(userPrefChangedMessage, '*');
      return;
    }
    const { userType = '' } = this.accessService.getLoginInfo();
    this.userManageService.updateUser(this.userId, body, userType).subscribe(
      (res) => {
        const { userMetadata } = res?.data?.metadata || {};
        const { cookieConsent } = userMetadata || params;

        this.updateLocalHost(userMetadata);
        this.changeUserSettings(cookieConsent);

        switch (consentType) {
          case 'Accept':
            this.gtmService.updateCookieConsent('Granted');
            this.gtmService.gtmConsent('granted', true);
            break;

          case 'Reject':
            this.gtmService.updateCookieConsent('Denied');
            this.gtmService.gtmConsent('denied', true);
            break;

          default:
            if (cookieConsent.statisticalCookies) {
              this.gtmService.gtmConsent('granted', true);
              this.gtmService.updateCustomizedStatisticalCookieConsent('Enabled');
            } else {
              this.gtmService.gtmConsent('denied', false);
              this.gtmService.updateCustomizedStatisticalCookieConsent('Disabled');
            }
            cookieConsent.functionalCookies
              ? this.gtmService.updateCustomizedFunctionalCookieConsent('Enabled')
              : this.gtmService.updateCustomizedFunctionalCookieConsent('Disabled');
            break;
        }
      },
      () => {
        this.changeUserSettings(params.cookieConsent);
      }
    );
  }

  public updateLocalHost(userMetadata: any) {
    const {
      dateFormat = 'MM/DD/YYYY HH:mm',
      timezone = 'Local',
      metricUnit = 'Miles',
      language = 'en',
      theme = 'light',
      cookieConsent = null,
    } = userMetadata;
    if (cookieConsent.functionalCookies === true) {
      this.accessService.currentTimeZone = timezone;
      this.dataService.currentTimeZone = timezone;

      this.accessService.currentMetricUnit = metricUnit;
      this.dataService.currentMetricUnit = metricUnit;

      this.accessService.currentDateFormat = dateFormat;
      this.dataService.currentDateFormat = dateFormat;

      this.accessService.currentLanguage = language;
      this.dataService.currentLanguage = language;

      this.accessService.currentTheme = theme;
      this.dataService.currentTheme = theme;

      this.accessService.currentCookiesConsent = cookieConsent;
      this.dataService.currentCookiesConsent = cookieConsent;
    }
  }

  public changeUserSettings(data: any) {
    this.accessService.currentCookiesConsent = data;
    this.dataService.currentCookiesConsent = data;
  }
}
