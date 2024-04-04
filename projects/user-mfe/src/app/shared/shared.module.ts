import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { NgxMatDateAdap } from '@app-core/services/custom-date-adapters/date-adapter';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorI18nService } from '../paginatorTranslate';
import { MaterialModule } from '../material.module';
import { reducers } from './reducers';
import { DatePipe } from '@angular/common';

// Components
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { CustomTooltipComponent } from './components/custom-tooltip/custom-tooltip.component';
import { HeaderComponent } from './components/header/header.component';
import { InputComponent } from './components/input/input.component';
import { LivestreamModalComponent } from './components/livestream-modal/livestream-modal.component';
import { LivestreamTimerComponent } from './components/livestream-timer/livestream-timer.component';
import { MapComponent } from './components/map/map.component';
import { MediaPlayerComponent } from './components/media-player/media-player.component';
import { NetworkStatusComponent } from './components/network-status/network-status.component';
import { SearchTripComponent } from './components/search-trip/search-trip.component';
import { SelectComponent } from './components/select/select.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TaggingFilterV2Component } from './components/tagging-filter-v2/tagging-filter-v2.component';
import { ConfiguartionFaqComponent } from './components/configuartion-faq/configuartion-faq.component';

// Pipes
import { AbbreviateNumberPipe } from './pipes/abbreviate-number/abbreviate-number.pipe';
import { DateConversionPipe } from './pipes/date-conversion/date-conversion.pipe';
import { DateFormatPipe } from './pipes/date-format/date-format.pipe';
import { DistancePipe } from './pipes/distance/distance.pipe';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { Duration2Pipe } from './pipes/durationV2/duration2.pipe';
import { MinuteSecondsPipe } from './pipes/minute-seconds/minute-seconds.pipe';
import { FormatNumberPipe } from './pipes/format-number/format-number.pipe';

// Directives
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
  NgxMatDateAdapter,
} from '@angular-material-components/datetime-picker';

import { AssetAutocompleteComponent } from './components/asset-autocomplete/asset-autocomplete.component';
import { BookmarkedVideosComponent } from './components/bookmarked-videos/bookmarked-videos.component';
import { DriverImageComponent } from './components/driver-image/driver-image.component';
import { FeatureAnnouncementComponent } from './components/feature-announcement/feature-announcement.component';
import { IncidentModalComponent } from './components/incident-modal/incident-modal.component';
import { OrientationBlockerComponent } from './components/orientation-blocker/orientation-blocker.component';
import { SelectFleetComponent } from './components/select-fleet/select-fleet.component';
import { SensorProfileComponent } from './components/sensor-profile/sensor-profile.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ShortcutsListComponent } from './components/shortcuts-list/shortcuts-list.component';
import { AlertComponent } from './components/alert/alert.component';
import { PortalSearchComponent } from './components/portal-search/portal-search.component';
import { IncidentSummaryComponent } from './components/incident-summary/incident-summary.component';
import { TimerComponent } from './components/timer/timer.component';
import { ChallengedIncidentsComponent } from './components/challenged-incidents/challenged-incidents.component';

import { ButtonLoaderDirective } from './directives/button-loader/button-loader.directive';
import { CheckPermissionsDirective } from './directives/check-permissions/check-permissions.directive';
import { ClickElsewhereDirective } from './directives/click-elsewhere/click-elsewhere.directive';
import { CustomTooltipDirective } from './directives/custom-tooltip/custom-tooltip.directive';
import { FixToggleDisableFormControlDirective } from './directives/fix-toggle-disable-form-control/fix-toggle-disable-form-control.directive';
import { FullScreenDirective } from './directives/full-screen/full-screen.directive';
import { HlsVideoPlayerDirective } from './directives/hls-video-player/hls-video-player.directive';
import { RefreshDatepickerDirective } from './directives/refresh-datepicker/refresh-datepicker.directive';
import { ViewportSizeDirective } from './directives/viewport-size/viewport-size.directive';
import { LivestreamService } from '@app-core/services/livestream/livestream.service';
import { PortalFaqComponent } from './components/portal-faq/portal-faq.component';
import { TwoFactorAuthenticationComponent } from './components/two-factor-authentication/two-factor-authentication.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { DynamicFormControlComponent } from '@app-asset-config/components/dynamic-form-control/dynamic-form-control.component';
import { LmFooterComponent } from './components/footers/lm-footer/lm-footer.component';
import { FooterDirective } from './directives/footer/footer.directive';
import { UserSecurityComponent } from './components/user-security/user-security.component';
import { SoleraFooterComponent } from './components/footers/solera-footer/solera-footer.component';
import { AudioConsentComponent } from './components/audio-consent/audio-consent.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { FeedbackwidgetComponent } from './components/feedback-widget/feedback-widget.component';
import { DurationConversionPipe } from './pipes/durationConversion/duration-conversion.pipe';
import { CheckUiconfigsDirective } from './directives/check-uiconfigs/check-uiconfigs.directive';
import { AttributeAssignComponent } from './components/attribute-assign/attribute-assign.component';
import { ZcdemoFooterComponent } from './footers/zcdemo-footer/zcdemo-footer.component';
import { DriverAutoCompleteComponent } from './components/driver-auto-complete/driver-auto-complete.component';
import { StatusTimelineComponent } from './components/status-timeline/status-timeline.component';
import { MapBoxMapComponent } from './components/map-box-map/map-box-map.component';
import { IncidentRatioPipe } from './pipes/incident-ratio/incident-ratio.pipe';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    HeaderComponent,
    UserProfileComponent,
    AutocompleteComponent,
    SpinnerComponent,
    MapComponent,
    DistancePipe,
    DurationPipe,
    Duration2Pipe,
    DateFormatPipe,
    SelectComponent,
    InputComponent,
    MediaPlayerComponent,
    AbbreviateNumberPipe,
    DateConversionPipe,
    FormatNumberPipe,
    ClickElsewhereDirective,
    SlideToggleComponent,
    FixToggleDisableFormControlDirective,
    ButtonLoaderDirective,
    SearchTripComponent,
    CustomTooltipComponent,
    CustomTooltipDirective,
    SideNavigationComponent,
    DriverImageComponent,
    NetworkStatusComponent,
    FeatureAnnouncementComponent,
    BookmarkedVideosComponent,
    RefreshDatepickerDirective,
    AssetAutocompleteComponent,
    FullScreenDirective,
    SelectFleetComponent,
    HlsVideoPlayerDirective,
    LivestreamModalComponent,
    LivestreamTimerComponent,
    MinuteSecondsPipe,
    CheckPermissionsDirective,
    IncidentModalComponent,
    SensorProfileComponent,
    ViewportSizeDirective,
    OrientationBlockerComponent,
    AlertComponent,
    UserSettingsComponent,
    ShortcutsListComponent,
    PortalSearchComponent,
    IncidentSummaryComponent,
    TimerComponent,
    ChallengedIncidentsComponent,
    PortalFaqComponent,
    TwoFactorAuthenticationComponent,
    ChangePasswordComponent,
    DynamicFormControlComponent,
    LmFooterComponent,
    SoleraFooterComponent,
    FooterDirective,
    UserSecurityComponent,
    AudioConsentComponent,
    CookieConsentComponent,
    FeedbackwidgetComponent,
    DurationConversionPipe,
    CheckUiconfigsDirective,
    TaggingFilterV2Component,
    AttributeAssignComponent,
    ZcdemoFooterComponent,
    DriverAutoCompleteComponent,
    StatusTimelineComponent,
    MapBoxMapComponent,
    ConfiguartionFaqComponent,
    IncidentRatioPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    LayoutModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    StoreModule.forFeature('shared', reducers),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    // Modules
    MaterialModule,
    FlexLayoutModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,

    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    // Components
    HeaderComponent,
    AutocompleteComponent,
    SpinnerComponent,
    SelectComponent,
    InputComponent,
    MapComponent,
    SlideToggleComponent,
    CustomTooltipComponent,
    SideNavigationComponent,
    NetworkStatusComponent,
    DriverImageComponent,
    BookmarkedVideosComponent,
    AssetAutocompleteComponent,
    LivestreamModalComponent,
    LivestreamTimerComponent,
    IncidentModalComponent,
    SensorProfileComponent,
    OrientationBlockerComponent,
    AlertComponent,
    UserSettingsComponent,
    ShortcutsListComponent,
    PortalSearchComponent,
    IncidentSummaryComponent,
    ChallengedIncidentsComponent,
    DynamicFormControlComponent,
    LmFooterComponent,
    CookieConsentComponent,
    FeedbackwidgetComponent,
    TimerComponent,
    TaggingFilterV2Component,
    AttributeAssignComponent,
    ZcdemoFooterComponent,
    DriverAutoCompleteComponent,
    StatusTimelineComponent,
    SoleraFooterComponent,
    MapBoxMapComponent,
    ConfiguartionFaqComponent,
    // Pipes
    DistancePipe,
    DurationPipe,
    Duration2Pipe,
    DateFormatPipe,
    DateConversionPipe,
    AbbreviateNumberPipe,
    FormatNumberPipe,
    DurationConversionPipe,
    MinuteSecondsPipe,
    IncidentRatioPipe,
    // Directives
    ClickElsewhereDirective,
    FixToggleDisableFormControlDirective,
    CustomTooltipDirective,
    ButtonLoaderDirective,
    RefreshDatepickerDirective,
    FullScreenDirective,
    HlsVideoPlayerDirective,
    CheckPermissionsDirective,
    ViewportSizeDirective,
    FooterDirective,
    CheckUiconfigsDirective,
  ],
  entryComponents: [
    CustomTooltipComponent,
    FeatureAnnouncementComponent,
    DriverImageComponent,
    LivestreamModalComponent,
    IncidentModalComponent,
    OrientationBlockerComponent,
    ShortcutsListComponent,
    PortalSearchComponent,
    UserSettingsComponent,
    ChangePasswordComponent,
    TwoFactorAuthenticationComponent,
    UserSecurityComponent,
    AudioConsentComponent,
    CookieConsentComponent,
    FeedbackwidgetComponent,
    StatusTimelineComponent,
  ],
  providers: [
    { provide: NgxMatDateAdapter, useClass: NgxMatDateAdap },
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginatorI18nService,
    },
    LivestreamService,
    DatePipe,
  ],
})
export class SharedModule {}
