import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { AccessService } from '../access/access.service';
import { CookieService } from '../cookie/cookie.service';

enum EventCategory {
  login = 'Login',
  logout = 'Logout',
  media = 'Media',
  requestVideo = 'Request video',
  filters = 'Filters',
  widgets = 'Widgets',
  links = 'Links',
  pagination = 'Pagination',
  sort = 'Sort',
  userPreference = 'User preferences',
  export = 'Export',
  sdkConfiguration = 'SDK configurations',
  download = 'Download',
  upload = 'Upload',
  tabs = 'Tabs',
}

export enum LoginTypes {
  master = 'Master login',
  admin = 'Admin login',
  fleetManager = 'Fleet manager login',
  sso = 'SSO login',
}

export enum LogoutTypes {
  master = 'Master logout',
  fleetManager = 'Fleet manager logout',
  admin = 'Admin logout',
}

export enum RequestedVideoType {
  dvr = 'DVR',
  timelapseDvr = 'Time-lapse DVR',
  edvr = 'E-DVR',
}

export enum ToggleState {
  show = 'Show',
  hide = 'Hide',
}

interface LoginEvent {
  fleetId: string;
  customerName: string;
  loginType: LoginTypes;
}

export enum SdkConfigType {
  Basic = 'basic',
  Advanced = 'advanced',
}

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerService {
  constructor(private accessService: AccessService, private cookieService: CookieService) {}

  private getPageLabel(event: PageEvent) {
    if (!event) {
      return;
    }
    const { pageIndex, pageSize, length, previousPageIndex } = event;
    const totalPages = Math.ceil(length / pageSize);
    if (pageIndex === 0) {
      return 'First page';
    }
    if (pageIndex === totalPages - 1) {
      return 'Last page';
    }
    if (pageIndex - previousPageIndex > 0) {
      return 'Next page';
    }
    return 'Previous page';
  }

  private pushEvent({ event, eventCategory, ...otherInfo }: any) {
    const { loginType = '' } = this.accessService.getLoginInfo();
    if (loginType === 'fleetmanager' && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event,
        eventCategory,
        ...otherInfo,
      });
    }
  }

  public setDataLayerVariables({ fleetId = '', customerName = '' } = {}) {
    this.pushEvent({
      fleetId,
      customerName,
    });
  }

  // Event category: Pageview
  public customPageview(pagePath = '', pageTitle = '') {
    this.pushEvent({
      event: 'Pageview',
      pagePath,
      pageTitle,
    });
  }

  // Event category: Login
  public login({ fleetId = '', customerName = '', loginType }: LoginEvent = {} as LoginEvent) {
    this.pushEvent({
      event: 'login',
      eventCategory: EventCategory.login,
      eventAction: loginType,
      eventLabel: fleetId,
      fleetId,
      customerName,
    });
  }

  // Event category: Logout
  public logout(logoutType: LogoutTypes, fleetId: string) {
    this.pushEvent({
      event: 'logout',
      eventCategory: EventCategory.logout,
      eventAction: logoutType,
      eventLabel: fleetId,
      fleetId,
    });
  }

  // Event category: Media
  public viewFleetHighlightsVideo(violationType: string) {
    this.pushEvent({
      event: 'view_fleet_recommended_incidents_video',
      eventCategory: EventCategory.media,
      eventAction: 'View Fleet Recommended Event video',
      eventLabel: violationType,
    });
  }

  public viewDriverHighlightsVideo(violationType: string) {
    this.pushEvent({
      event: 'view_driver_recommended_incidents_video',
      eventCategory: EventCategory.media,
      eventAction: 'View driver Recommended Event video',
      eventLabel: violationType,
    });
  }

  public viewRequestedVideoFromTable(videoType: string) {
    this.pushEvent({
      event: 'view_requested_video_from_video_requests_table',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Video requests table',
      eventLabel: videoType,
    });
  }

  public viewRequestedVideoFromRequestDvrSection(videoType: RequestedVideoType) {
    this.pushEvent({
      event: 'view_requested_video_from_request_dvr_section',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Request DVR section',
      eventLabel: videoType,
    });
  }

  public incidentButtonClick(violationType: string) {
    this.pushEvent({
      event: 'trip_incident_button_click',
      eventCategory: EventCategory.media,
      eventAction: 'View violation video - Trip details events table media',
      eventLabel: violationType,
    });
  }

  public incidentMarkerClick(violationType: string) {
    this.pushEvent({
      event: 'trip_incident_marker_click',
      eventCategory: EventCategory.media,
      eventAction: 'View violation video - Trip details map Marker',
      eventLabel: violationType,
    });
  }

  public viewRequestedVideoFromCoachingPanelTable(videoType: string) {
    this.pushEvent({
      event: 'view_requested_video_from_coaching_panel_table',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Coaching Panel table',
      eventLabel: videoType,
    });
  }

  public viewRequestedVideoFromChallangeTable(videoType: string) {
    this.pushEvent({
      event: 'view_requested_video_from_challenge_table',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Challenge table',
      eventLabel: videoType,
    });
  }
  public viewRequestedVideoFromDriverPanicButtonTable(videoType: string) {
    this.pushEvent({
      event: 'view_requested_video_driver_panic_button_table',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Driver Panic table',
      eventLabel: videoType,
    });
  }

  public viewIncidentsVideoIncidentPage(violationType: string) {
    this.pushEvent({
      event: 'incident_view_incident_video',
      eventCategory: EventCategory.media,
      eventAction: 'View Safety Events - Incident Video',
      eventLabel: violationType,
    });
  }

  public viewLiveViewVideoAssetListTable(assetId: string) {
    this.pushEvent({
      event: 'view_liveview_video_asset_list_table',
      eventCategory: EventCategory.media,
      eventAction: 'View LiveView Video Asset List Table',
      eventLabel: assetId,
    });
  }

  public viewLiveViewVideoMarkerAssetDetails(assetId: string) {
    this.pushEvent({
      event: 'view_liveview_video_marker_asset_details',
      eventCategory: EventCategory.media,
      eventAction: 'View LiveView Video Marker Asset',
      eventLabel: assetId,
    });
  }

  public viewRequestedVideoFromDriverCoachingPanelTable(videoType: string) {
    this.pushEvent({
      event: 'view_requested_video_from_driver_coaching_panel_table',
      eventCategory: EventCategory.media,
      eventAction: 'View requested video - Driver Coaching Panel table',
      eventLabel: videoType,
    });
  }

  public viewSafteyEventFromRequestVideoSlider(violationType: string) {
    this.pushEvent({
      event: 'view_safety_event_from_request_video_slider',
      eventCategory: EventCategory.media,
      eventAction: 'View Safety Events - Request Video Slider',
      eventLabel: violationType,
    });
  }
  public viewSafteyEventFromRequestVideoMarker(violationType: string) {
    this.pushEvent({
      event: 'view_safety_event_from_request_video_marker',
      eventCategory: EventCategory.media,
      eventAction: 'View Safety Events - Request Video Marker',
      eventLabel: violationType,
    });
  }

  public viewDriverImageRecognizedDriver(valueType: string) {
    this.pushEvent({
      event: 'view_driver_image_recognized_driver',
      eventCategory: EventCategory.media,
      eventAction: 'View Driver Image - Recognized Driver',
      eventLabel: valueType,
    });
  }

  public viewDriverImageCapturedImage(valueType: string) {
    this.pushEvent({
      event: 'view_driver_image_captured_image',
      eventCategory: EventCategory.media,
      eventAction: 'View Driver Image - Captured Image',
      eventLabel: valueType,
    });
  }

  public viewDriverImageFeedback(valueType: string) {
    this.pushEvent({
      event: 'view_driver_image_feedback',
      eventCategory: EventCategory.media,
      eventAction: 'View Driver Image - Feedback',
      eventLabel: valueType,
    });
  }

  public viewDriverImages() {
    this.pushEvent({
      event: 'view_driver_images',
      eventCategory: EventCategory.media,
      eventAction: 'View Driver Images In Driver List',
    });
  }

  // Event category: Request video
  public createDvrRequest({ assetId, dvrDurationInSec }: { assetId: string; dvrDurationInSec: number }) {
    this.pushEvent({
      event: 'create_dvr_request',
      eventCategory: EventCategory.requestVideo,
      eventAction: RequestedVideoType.dvr,
      eventLabel: assetId,
      eventValue: dvrDurationInSec,
    });
  }

  public createTimelapseDvrRequest({ assetId, dvrDurationInSec }: { assetId: string; dvrDurationInSec: number }) {
    this.pushEvent({
      event: 'create_time_lapse_dvr_request',
      eventCategory: EventCategory.requestVideo,
      eventAction: RequestedVideoType.timelapseDvr,
      eventLabel: assetId,
      eventValue: dvrDurationInSec,
    });
  }

  public createEdvrRequest(violationType: string) {
    this.pushEvent({
      event: 'create_edvr_request',
      eventCategory: EventCategory.requestVideo,
      eventAction: RequestedVideoType.edvr,
      eventLabel: violationType,
    });
  }

  // Event category: Filters
  public switchAccount(fleetId: string) {
    this.pushEvent({
      event: 'switch_account',
      eventCategory: EventCategory.filters,
      eventAction: 'Switch account',
      eventLabel: fleetId,
      fleetId,
    });
  }

  public changeFleetOverviewDurationFilter(durationInText = '', noOfDays: number) {
    this.pushEvent({
      event: 'change_fleet_overview_duration_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change fleet overview duration filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeFleetHighlightsEventTypeFilter(violationType: string) {
    this.pushEvent({
      event: 'change_fleet_recommended_incidents_event_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Fleet Recommended Event type filter',
      eventLabel: violationType,
    });
  }

  public changeDriverHighlightsEventTypeFilter(violationType: string) {
    this.pushEvent({
      event: 'change_driver_recommended_incidents_event_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change driver recommended incidents event type filter',
      eventLabel: violationType,
    });
  }

  public changeTripListDurationFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_trip_list_duration_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Trip List Duration filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeTripListDriverFilter(driverId: string) {
    this.pushEvent({
      event: 'change_trip_list_driver_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Trip List Driver filter',
      eventLabel: driverId,
    });
  }

  public changeDriverOverviewDurationFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_driver_overview_duration_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change driver overview duration filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }
  public changeDriverOverviewDriverFilter(driverId: string) {
    this.pushEvent({
      event: 'change_driver_overview_driver_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change driver overview driver filter',
      eventLabel: driverId,
    });
  }
  public changeEventSeverityFilter(severity: string) {
    this.pushEvent({
      event: 'change_event_severity_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change event severity filter - Trip details',
      eventLabel: severity.charAt(0).toUpperCase() + severity.slice(1),
    });
  }
  public changeRequestVideoTypeFilter(videoType: string) {
    this.pushEvent({
      event: 'change_request_video_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Request Video type filter',
      eventLabel: videoType,
    });
  }
  public changeChallangeVideoTypeFilter(incidentType: string) {
    this.pushEvent({
      event: 'change_challenge_video_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Challenge Video type filter',
      eventLabel: incidentType,
    });
  }
  public changeCoachingStatusTypeFilter(coachingStatus: string) {
    this.pushEvent({
      event: 'change_coaching_status_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Coaching Status filter',
      eventLabel: coachingStatus,
    });
  }
  public changeChallengeStatusTypeFilter(challengeStatus: string) {
    this.pushEvent({
      event: 'change_challenge_status_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Challenge Status filter',
      eventLabel: challengeStatus,
    });
  }
  public changeDriverVideoTypeFilter(videoType: string) {
    this.pushEvent({
      event: 'change_driver_video_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Driver Video Type Status filter',
      eventLabel: videoType,
    });
  }
  public changeDriverCoachingStatusTypeFilter(coachingStatus: string) {
    this.pushEvent({
      event: 'change_driver_coaching_status_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Driver Coaching Status filter',
      eventLabel: coachingStatus,
    });
  }
  public changeFleetReportDownloadDurationFilter(noOfDays: number) {
    this.pushEvent({
      event: 'change_fleet_Report_download_duration_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Fleet Report Download duration filter',
      eventValue: noOfDays,
    });
  }
  public searchAssetByAssetId(assetId: string) {
    this.pushEvent({
      event: 'search_asset_by_assetId_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Search Asset By Asset Id filter',
      eventLabel: assetId,
    });
  }
  public searchAssetByDeviceId(deviceId: string) {
    this.pushEvent({
      event: 'search_asset_by_deviceId_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Search Asset By Device Id filter',
      eventLabel: deviceId,
    });
  }
  public changeConfigurationDutyTypes(dutyType: string) {
    this.pushEvent({
      event: 'change_configuration_duty_types',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Configuration Duty Types',
      eventLabel: dutyType,
    });
  }

  public changeIncidentsViewDurationTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_incidents_view_duration_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Duration Type Filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeIncidentsViewAssetTypeFilter(assetId: string) {
    this.pushEvent({
      event: 'change_incidents_view_asset_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Asset Type Filter',
      eventLabel: assetId,
    });
  }

  public changeIncidentsViewDriverTypeFilter(driverId: string) {
    this.pushEvent({
      event: 'change_incidents_view_driver_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Driver Type Filter',
      eventLabel: driverId,
    });
  }

  public changeIncidentsViewFilterTypeFilter(valueType: string) {
    this.pushEvent({
      event: 'change_incidents_view_filter_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Filter Type Filter',
      eventLabel: valueType,
    });
  }

  public changeIncidentsViewViolationTypeFilter(violationType: string) {
    this.pushEvent({
      event: 'change_incidents_view_violation_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Violation Type Filter',
      eventLabel: violationType,
    });
  }

  public changeTripListAssetTypeFilter(assetId: string) {
    this.pushEvent({
      event: 'change_trip_list_asset_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Trip List Asset Type Filter',
      eventLabel: assetId,
    });
  }

  public changeActiveDriversListDurationTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_active_drivers_list_duration_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Active Drivers List Duration',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeLiveviewAssetTypeFilter(assetId: string) {
    this.pushEvent({
      event: 'change_liveview_asset_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Liveview Asset Type Filter',
      eventLabel: assetId,
    });
  }

  public changeCoachingDurationTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_coaching_duration_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Coaching Duration Type Filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeCoachingIncidentTypeFilter(violationType: string) {
    this.pushEvent({
      event: 'change_coaching_incident_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Coaching Incident Type Filter',
      eventLabel: violationType,
    });
  }

  public changeVideoRequestOverviewDurationTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_video_request_overview_duration_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Video Request Overview Duration',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeDriverIncidentTrendIncidentTypeFilter(violationType: string) {
    this.pushEvent({
      event: 'change_driver_incident_trend_incident_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Driver Incident Trend Incident Type Filter',
      eventLabel: violationType,
    });
  }

  public changeChallengeOverviewDurationTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_challenge_overview_duration_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Challenge Overview Duration Filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeArchivedReportsDuartionTypeFilter(durationInText: string, noOfDays: number) {
    this.pushEvent({
      event: 'change_archived_reports_duartion_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Archived Reports Duartion Type Filter',
      eventLabel: durationInText,
      eventValue: noOfDays,
    });
  }

  public changeUserListTableByEmailTypeFilter(fleetId: string) {
    this.pushEvent({
      event: 'change_user_list_table_by_email_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change User List Table By Email Type Filter',
      eventLabel: fleetId,
    });
  }

  public changeTripListFilterTypeFilter(valueType: string) {
    this.pushEvent({
      event: 'change_trip_list_filter_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Trip List Filter Type filter',
      eventLabel: valueType,
    });
  }

  public changeVideoRequestSearchTripDateFilter(fleetId: string) {
    this.pushEvent({
      event: 'change_video_request_search_trips_date_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Video Request Search Trip Date Type filter',
      eventLabel: fleetId,
    });
  }

  public changeVideoRequestSearchTripFilterType(valueType: string) {
    this.pushEvent({
      event: 'change_video_request_search_trips_filter_type_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Video Request Search Trip Filter Type filter',
      eventLabel: valueType,
    });
  }

  public changeVideoRequestSearchTripDriverIdFilter(driverId: string) {
    this.pushEvent({
      event: 'change_video_request_search_trips_driver_id_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Video Request Search Trip Driver ID filter',
      eventLabel: driverId,
    });
  }

  public changeVideoRequestSearchTripAssetIdFilter(assetId: string) {
    this.pushEvent({
      event: 'change_video_request_search_trips_asset_id_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Video Request Search Trip Asset ID filter',
      eventLabel: assetId,
    });
  }

  public changeRequestVideoPageAvailableDurationFilter(valueType: number) {
    this.pushEvent({
      event: 'change_request_video_page_available_duration_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Request Video Page Available Duration filter',
      eventLabel: valueType,
    });
  }

  public changeRequestVideoPageVideoResolutionFilter(valueType: string) {
    this.pushEvent({
      event: 'change_request_video_page_video_resolution_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Request Video Page Video Resolution filter',
      eventLabel: valueType,
    });
  }

  public changeRequestVideoPageVideoFormatFilter(valueType: string) {
    this.pushEvent({
      event: 'change_request_video_page_video_format_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Request Video Page Video Format filter',
      eventLabel: valueType,
    });
  }

  public changeFleetOverviewTags(valueType: string) {
    this.pushEvent({
      event: 'change_fleet_overview_tags',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Fleet Overview Tags',
      eventLabel: valueType,
    });
  }

  public changeIncidentsViewUserTagsFilter(valueType: string) {
    this.pushEvent({
      event: 'change_incidents_view_user_tags_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - User Tags Filter',
      eventLabel: valueType,
    });
  }

  public changeIncidentsViewWorkFlowStatusFilter(valueType: string) {
    this.pushEvent({
      event: 'change_incidents_view_workflow_status_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - WorkFlow Status Filter',
      eventLabel: valueType,
    });
  }

  public changeIncidentsViewDriverTagsFilter(valueType: string) {
    this.pushEvent({
      event: 'change_incidents_view_driver_tags_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Events View - Driver Tags Filter',
      eventLabel: valueType,
    });
  }

  public changeTaggingOverviewFilter(valueType: string) {
    this.pushEvent({
      event: 'change_tagging_overview_filter',
      eventCategory: EventCategory.filters,
      eventAction: 'Change Tagging Overview Filter',
      eventLabel: valueType,
    });
  }
  public searchRoles(valueType: string) {
    this.pushEvent({
      event: 'search_roles',
      eventCategory: EventCategory.filters,
      eventAction: 'Search Roles',
      eventLabel: valueType,
    });
  }
  public searchTags(valueType: string) {
    this.pushEvent({
      event: 'search_tags',
      eventCategory: EventCategory.filters,
      eventAction: 'Search Tags',
      eventLabel: valueType,
    });
  }

  // Event category: Widgets
  public toggleSideNavigation(state: ToggleState) {
    this.pushEvent({
      event: 'toggle_side_navigation',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle Side navigation',
      eventLabel: state,
    });
  }

  public viewAccelerometerProfile(isMapMode: boolean) {
    this.pushEvent({
      event: 'view_accelerometer_profile',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Accelerometer Profile',
      eventLabel: isMapMode,
    });
  }

  public viewMapMode(isMapMode: boolean) {
    this.pushEvent({
      event: 'view_map_mode',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Map Mode',
      eventLabel: isMapMode,
    });
  }

  public toggleEventsTable(state: ToggleState) {
    this.pushEvent({
      event: 'toggle_events_table_in_trip_details',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle events table - Trip details',
      eventLabel: state,
    });
  }

  public portalSearch(state?: ToggleState) {
    this.pushEvent({
      event: 'portal_search',
      eventCategory: EventCategory.widgets,
      eventAction: 'Portal Search',
      eventLabel: state,
    });
  }

  public swtchTheme(theme: string) {
    this.pushEvent({
      event: 'switch_theme',
      eventCategory: EventCategory.widgets,
      eventAction: 'Switch Theme',
      eventLabel: theme,
    });
  }

  public swtchTagsandVideoPanel(viewType: string) {
    this.pushEvent({
      event: 'switch_tags_and_videopanel',
      eventCategory: EventCategory.widgets,
      eventAction: 'Tags and VideoPanel',
      eventLabel: viewType,
    });
  }

  public editAsset(deviceId, assetId = '', dutyType = '', newDutyType = '', defaultDriverId = '') {
    this.pushEvent({
      event: 'edit_asset',
      eventCategory: EventCategory.widgets,
      eventAction: 'Edit Asset',
      eventLabel: deviceId,
      assetId,
      dutyType,
      newDutyType,
      defaultDriverId,
    });
  }

  public manageAsset(deviceId, action = '') {
    this.pushEvent({
      event: 'manage_asset',
      eventCategory: EventCategory.widgets,
      eventAction: 'Manage Asset',
      eventLabel: deviceId,
      action,
    });
  }

  public profileClick(fleetId: string) {
    this.pushEvent({
      event: 'header_profile_icon_click',
      eventCategory: EventCategory.widgets,
      eventAction: 'Profile Icon',
      eventLabel: fleetId,
    });
  }

  public updateUserPassword(fleetId: string) {
    this.pushEvent({
      event: 'update_user_password',
      eventCategory: EventCategory.widgets,
      eventAction: 'Update User Password',
      eventLabel: fleetId,
    });
  }

  public viewKeyboardShortcuts(valueType: ToggleState) {
    this.pushEvent({
      event: 'view_keyboard_shortcuts',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Keyboard Shortcuts',
      eventLabel: valueType,
    });
  }

  public viewFeatureAnnouncementModal(valueType: string) {
    this.pushEvent({
      event: 'view_feature_announcement_model',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Feature Announcement Model',
      eventLabel: valueType,
    });
  }

  public saveEditUser() {
    this.pushEvent({
      event: 'save_edit_user',
      eventCategory: EventCategory.widgets,
      eventAction: 'Save Edit User',
    });
  }

  public disableUser() {
    this.pushEvent({
      event: 'disable_user',
      eventCategory: EventCategory.widgets,
      eventAction: 'Disable User',
    });
  }

  public viewHierarchy(valueType: string) {
    this.pushEvent({
      event: 'view_hierarchy_manage_roles ',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Hierarchy - Manage Roles',
      eventLabel: valueType,
    });
  }

  public coachinginFleetIncidentList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_fleet_incident_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Fleet Recommended Event List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentInFleetIncidentList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_in_fleet_incident_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Fleet Recommended Event List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachinginIncidentViewList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_incident_view_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Events View List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentInIncidentViewList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_in_incident_view_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Events View List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachinginDriverIncidentList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_driver_incident_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Driver Recommended List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentInDriverIncidentList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_in_driver_incident_list',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Driver Recommended List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachinginFleetIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_fleet_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Fleet Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentFleetIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_fleet_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Fleet Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentFromFleetCoachingIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_incident_from_fleet_coaching_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Fleet Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachinginIncidentViewDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_incident_view_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Events View Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardEventIncidentViewDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_event_incident_view_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Events View Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentFromCoachingIncidentViewDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_incident_from_coaching_incident_view_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Events View Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachinginDriversIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_drivers_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Drivers Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentDriverIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_driver_Incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Drivers Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentFromDriversCoachingIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_incident_from_drivers_coaching_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Drivers Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentTripDetailsDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_trip_details_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Trip Details Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentCoachingPanelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_coaching_panel_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Coaching Panel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentVideoRequestPanicButtonDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_video_request_panic_button_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Video Request Panic Button Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentDriverCoachingPanelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_driver_coaching_panel_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Driver Coaching Panel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentDriverPanicButtonDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_driver_panic_button_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Driver Panic Button Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentfromCoachingPannelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_coaching_in_coaching_pannel_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Coaching Pannel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentfromVideoRequestDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_coaching_in_video_request_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Video Request Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachingInVideoRequestDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_video_request_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Video Request Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentFromDriverCoachingPannel(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_coaching_in_drivers_coaching_pannel_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Driver Coaching Pannel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public coachingInDriverPanicButtonDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_in_driver_panic_button_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Driver Panic Button Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public viewAssetDetails(deviceState: string, assetId: string) {
    this.pushEvent({
      event: 'view_asset_details_liveview_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Asset Details Liveview Page Marker',
      eventLabel: deviceState,
      eventValue: assetId,
    });
  }

  public provisionDevice(deviceId: string) {
    this.pushEvent({
      event: 'provision_device_in_devices_list_table',
      eventCategory: EventCategory.widgets,
      eventAction: 'Provision Device In Devices List Table',
      eventLabel: deviceId,
    });
  }

  public addUser(fleetId: string) {
    this.pushEvent({
      event: 'add_user',
      eventCategory: EventCategory.widgets,
      eventAction: 'Add User',
      eventLabel: fleetId,
    });
  }

  public editUser(fleetId: string) {
    this.pushEvent({
      event: 'edit_user',
      eventCategory: EventCategory.widgets,
      eventAction: 'Edit User',
      eventLabel: fleetId,
    });
  }

  public resendUserTempPassword(fleetId: string) {
    this.pushEvent({
      event: 'resend_user_temporary_password',
      eventCategory: EventCategory.widgets,
      eventAction: 'Resend User Temporary Password',
      eventLabel: fleetId,
    });
  }

  public resendDriverTempPassword(fleetId: string) {
    this.pushEvent({
      event: 'resend_Driver_temporary_password',
      eventCategory: EventCategory.widgets,
      eventAction: 'Resend Driver Temporary Password',
      eventLabel: fleetId,
    });
  }

  public deleteUser(fleetId: string) {
    this.pushEvent({
      event: 'delete_user',
      eventCategory: EventCategory.widgets,
      eventAction: 'Delete User',
      eventLabel: fleetId,
    });
  }

  public deleteDriver(fleetId: string) {
    this.pushEvent({
      event: 'delete_driver',
      eventCategory: EventCategory.widgets,
      eventAction: 'Delete Driver',
      eventLabel: fleetId,
    });
  }

  public manageSecurity(fleetId: string) {
    this.pushEvent({
      event: 'manage_security_disable_tfa',
      eventCategory: EventCategory.widgets,
      eventAction: 'Manage Security Disable TFA',
      eventLabel: fleetId,
    });
  }

  public viewFAQ(valueType: string) {
    this.pushEvent({
      event: 'view_faq',
      eventCategory: EventCategory.widgets,
      eventAction: 'View FAQ',
      eventLabel: valueType,
    });
  }

  public selectTemplateDialogAddRole(valueType: string) {
    this.pushEvent({
      event: 'select_template_dialog_add_role ',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Template Dialog Add Role',
      eventLabel: valueType,
    });
  }

  public updateAssetConfigurations(assetId: string) {
    this.pushEvent({
      event: 'update_asset_configuration',
      eventCategory: EventCategory.widgets,
      eventAction: 'Update Asset Configuration',
      eventLabel: assetId,
    });
  }

  public toggleEventsLiveViewTable(state: ToggleState) {
    this.pushEvent({
      event: 'toggle_events_table_in_liveview',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle events table - LiveView',
      eventLabel: state,
    });
  }

  public toggleFullScreenIncidentDialog(valueType: string) {
    this.pushEvent({
      event: 'toggle_full_screen_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle Full Screen Incident Dialog',
      eventLabel: valueType,
    });
  }

  public saveRole(valueType: string) {
    this.pushEvent({
      event: 'save_role ',
      eventCategory: EventCategory.widgets,
      eventAction: 'Save Role',
      eventLabel: valueType,
    });
  }

  public toggleIncidentDialogVolume(valueType: string) {
    this.pushEvent({
      event: 'toggle_incident_dialog_volume',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle Incident Dialog Volume',
      eventLabel: valueType,
    });
  }

  public addAttribute(valueType: string) {
    this.pushEvent({
      event: 'add_attribute',
      eventCategory: EventCategory.widgets,
      eventAction: 'Add Attribute',
      eventLabel: valueType,
    });
  }

  public coachingTripDetailsIncidentDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'select_coaching_trip_details_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Trip Details Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public completeCoachingCoachingPanelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'complete_coaching_coaching_panel_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Complete Coaching - Coaching Panel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public completeCoachingDriverCoachingPanelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'complete_coaching_driver_coaching_panel_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Complete Coaching - Driver Coaching Panel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public acceptChallengeInChallengeIncidentsDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'accept_challenge_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Accept Challenge - Challenge Incident Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public rejectChallengeInChallengeIncidentsDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'reject_challenge_incident_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Reject Challenge - Challenge Incident Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public viewAssetDetailsAssetTableLiveview(deviceState: string, assetId: string) {
    this.pushEvent({
      event: 'view_asset_details_liveview_page_asset_table',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Asset Details Liveview Asset table',
      eventLabel: deviceState,
      eventValue: assetId,
    });
  }

  public recenterMapInRequestVideoPage(fleetId: string) {
    this.pushEvent({
      event: 'recenter_map_in_request_video_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'Recenter Map - Request Video Page',
      eventLabel: fleetId,
    });
  }

  public toggleMarkersInRequestVideoPage(valueType: string) {
    this.pushEvent({
      event: 'toggle_marker_in_request_video_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle Marker - Request Video Page',
      eventLabel: valueType,
    });
  }

  public updateAttribute(valueType: string) {
    this.pushEvent({
      event: 'update_attribute',
      eventCategory: EventCategory.widgets,
      eventAction: 'Update Attribute',
      eventLabel: valueType,
    });
  }

  public coachingInRequestVideoDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'coaching_in_request_video_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Select Coaching - Request Video Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public deselectIncidentFromRequestVideoDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'deselect_coaching_in_request_video_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Deselect Coaching - Request Video Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public discardIncidentFromRequestVideoDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'discard_incident_from_request_video_dialog',
      eventCategory: EventCategory.widgets,
      eventAction: 'Discard Incident - Request Video Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public confirmVideoRequestInRequestVideoPage(deviceId: string) {
    this.pushEvent({
      event: 'confirm_video_request_in_request_video_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'Confirm Video Request - Request Video Page',
      eventLabel: deviceId,
    });
  }

  public requestAnotherVideoOnSuccessfulRequestVideoPage() {
    this.pushEvent({
      event: 'request_another_video_on_successful_request_video_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'Request Another Video - SuccessFull Request Video Page ',
    });
  }

  public toggleFeedbackWidget(state: ToggleState) {
    this.pushEvent({
      event: 'toggle_feedback_widget',
      eventCategory: EventCategory.widgets,
      eventAction: 'Toggle Feedback Widget',
      eventlabel: state,
    });
  }

  public feedbackWidgetsRequest(valueType: string, fleetId: string) {
    this.pushEvent({
      event: 'feedback_widget_request',
      eventCategory: EventCategory.widgets,
      eventAction: 'Feedback Widget Request',
      eventlabel: valueType,
      eventValue: fleetId,
    });
  }

  public saveIncidentModelTags(violationType: string, valueType: string) {
    this.pushEvent({
      event: 'save_incident_model_tags',
      eventCategory: EventCategory.widgets,
      eventAction: 'Incident Model - Save Tags',
      eventlabel: violationType,
      eventValue: valueType,
    });
  }

  public saveIncidentModelComments(violationType: string) {
    this.pushEvent({
      event: 'save_incident_model_comments',
      eventCategory: EventCategory.widgets,
      eventAction: 'Incident Model - Save Comments',
      eventlabel: violationType,
    });
  }

  public viewUploadImagesManageDriver(valueType: string) {
    this.pushEvent({
      event: 'view_upload_images_manage_drivers',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Upload Images Tab',
      eventLabel: valueType,
    });
  }
  public viewUploadImagesUserGuideManageDrivers(valueType: string) {
    this.pushEvent({
      event: 'view_upload_images_user_guide_manage_drivers',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Upload Images User Guide Tab',
      eventLabel: valueType,
    });
  }
  public viewCompletedCoachingSessionsDetails() {
    this.pushEvent({
      event: 'view_completed_coaching_session_details',
      eventCategory: EventCategory.widgets,
      eventAction: 'View Completed Coaching Sessions Details',
    });
  }

  public addDriverTagsInDriverPage(valueType: string) {
    this.pushEvent({
      event: 'add_driver_tags_in_driver_page',
      eventCategory: EventCategory.widgets,
      eventAction: 'Add Driver Tags in Driver Page',
      eventlabel: valueType,
    });
  }

  public openEndSessionDialogCoachingSession(valueType: string) {
    this.pushEvent({
      event: 'open_end_session_dialog_coaching_session',
      eventCategory: EventCategory.widgets,
      eventAction: 'Open End Session Dialog Coaching Session',
      eventlabel: valueType,
    });
  }

  public coachingSessionNextButton() {
    this.pushEvent({
      event: 'coaching_session_next_button',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Next Button',
    });
  }

  public coachingSessionPreviousButton() {
    this.pushEvent({
      event: 'coaching_session_previous_button',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Previous Button',
    });
  }

  public coachingSessionCompleteCoaching(valueType: string) {
    this.pushEvent({
      event: 'coaching_session_complete_coaching',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Complete Coaching Button',
      eventlabel: valueType,
    });
  }

  public coachingSessionMarkedAsCoached() {
    this.pushEvent({
      event: 'coaching_session_marked_coached',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Marked Coached',
    });
  }

  public coachingSessionSkip() {
    this.pushEvent({
      event: 'coaching_session_skip',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Skip',
    });
  }

  public coachingSessionSkipAll() {
    this.pushEvent({
      event: 'coaching_session_skip_all',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Session - Skip All',
    });
  }

  public coachingThresholdSubmit() {
    this.pushEvent({
      event: 'coaching_threshold_submit',
      eventCategory: EventCategory.widgets,
      eventAction: 'Coaching Threshold Submit',
    });
  }

  public deleteAttribute(valueType: string) {
    this.pushEvent({
      event: 'delete_attribute',
      eventCategory: EventCategory.widgets,
      eventAction: 'Delete Attribute',
      eventLabel: valueType,
    });
  }

  public addTag(valueType: string) {
    this.pushEvent({
      event: 'add_tag',
      eventCategory: EventCategory.widgets,
      eventAction: 'Add Tag',
      eventLabel: valueType,
    });
  }

  public updateTag(valueType: string) {
    this.pushEvent({
      event: 'update_tag',
      eventCategory: EventCategory.widgets,
      eventAction: 'Update Tag',
      eventLabel: valueType,
    });
  }

  public deleteTag(valueType: string) {
    this.pushEvent({
      event: 'delete_tag',
      eventCategory: EventCategory.widgets,
      eventAction: 'Delete Tag',
      eventLabel: valueType,
    });
  }

  public editEntities() {
    this.pushEvent({
      event: 'edit_entities',
      eventCategory: EventCategory.widgets,
      eventAction: 'Edit Entities',
    });
  }

  // Event category: Links
  public gotoTripDetailsFromVideoRequestsTable(requestType: RequestedVideoType) {
    this.pushEvent({
      event: 'go_to_trip_details_from_video_requests_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip details - Video requests table',
      eventLabel: requestType,
    });
  }

  public gotoTripDetailsFromTripsTable(driverId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_trips_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip details - Trips table',
      eventLabel: driverId,
    });
  }

  public gotoTripDetailsFromCoachingTable(eventType: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_coaching_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip details - Coaching table',
      eventLabel: eventType,
    });
  }

  public gotoTripDetailsFromChallangeTable(eventType: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_challange_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip details - Challange table',
      eventLabel: eventType,
    });
  }
  public gotoTripDetailsFromLiveViewTable(valueType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_live_view_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Live View Table',
      eventLabel: valueType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriverPanicTable(eventType: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_DriverPanic_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip details - Driver Panic table',
      eventLabel: eventType,
    });
  }
  public sendFeedback(driverID: string) {
    this.pushEvent({
      event: 'send_feedback_from_driverImage',
      eventCategory: EventCategory.links,
      eventAction: 'Send Feedback From Driver Image',
      eventLabel: driverID,
    });
  }
  public addDriver(driverID: string) {
    this.pushEvent({
      event: 'add_driver',
      eventCategory: EventCategory.links,
      eventAction: 'Add Driver',
      eventLabel: driverID,
    });
  }

  public privacyPolicy(fleetId: string) {
    this.pushEvent({
      event: 'privacy_policy',
      eventCategory: EventCategory.links,
      eventAction: 'Privacy Policy',
      eventLabel: fleetId,
    });
  }

  public gotoEditUserPageFromManageUser() {
    this.pushEvent({
      event: 'goto_edit_user_from_manage_user',
      eventCategory: EventCategory.links,
      eventAction: 'Goto Edit User - manage User',
    });
  }

  public gotoAddRoleFromManageRoles() {
    this.pushEvent({
      event: 'goto_add_role_from_manage_roles',
      eventCategory: EventCategory.links,
      eventAction: 'Goto Add Roles - Manage Roles',
    });
  }

  public gotoEditRoleFromManageRoles() {
    this.pushEvent({
      event: 'goto_edit_role_from_manage_roles',
      eventCategory: EventCategory.links,
      eventAction: 'Goto Edit Roles - Manage Roles',
    });
  }

  public gotoDuplicateRoleFromManageRoles() {
    this.pushEvent({
      event: 'goto_duplicate_role_from_manage_roles',
      eventCategory: EventCategory.links,
      eventAction: 'Goto Duplicate Roles - Manage Roles',
    });
  }

  public gotoDriversPageFromFleetTopDriversTable(driverId: string) {
    this.pushEvent({
      event: 'go_to_drivers_page_from_fleet_top_drivers_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Drivers - Top Drivers table',
      eventLabel: driverId,
    });
  }

  public gotoDriversPageFromFleetRequireCoachingTable(driverId: string) {
    this.pushEvent({
      event: 'go_to_drivers_page_from_fleet_required_coaching_drivers_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Drivers - Required Coaching table',
      eventLabel: driverId,
    });
  }

  public gotoTripDetailsFromFleetIncidentsList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_fleet_incident_list',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Fleet Recommended Event List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromFleetIncidentsDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_fleet_incident_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Fleet Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromIncidentsViewList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_incident_view_list',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Events View List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromIncidentsViewDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_incident_view_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Events View Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriversIncidentsList(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_drivers_incident_list',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Drivers Recommended List',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriversIncidentsDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_drivers_incident_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Drivers Recommended Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriverCoachingPannelTable(violationType: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_drivers_coaching_pannel_table',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Drivers Coaching Pannel',
      eventLabel: violationType,
    });
  }

  public gotoTripDetailsFromDVRPageDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_dvr_page_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - DVR Page Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromCoachingPannelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_coaching_page_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Coaching Page Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriverCoachingPannelDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_driver_coaching_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Driver Coaching Pannel Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromDriverPanicDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_driver_panic_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Driver Panic Button Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromChallengeDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_challenge_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Challenge Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromLiveViewMarker(valueType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_live_view_marker_details',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Live View Marker',
      eventLabel: valueType,
      eventValue: assetId,
    });
  }

  public gotoTripDetailsFromVideoRequestSearchTripList(assetId: string, driverId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_video_request_search_trip_list',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Video Request Search Trip List',
      eventLabel: assetId,
      eventValue: driverId,
    });
  }

  public gotoRequestVideoPageFromVideoRequestPage(assetId: string, driverId: string) {
    this.pushEvent({
      event: 'go_to_request_video_from_video_request_search_trip_list',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Request Video Page - Video Request Search Trip List',
      eventLabel: assetId,
      eventValue: driverId,
    });
  }

  public gotoFleetSafetyReportFromReportPage(fleetId: string) {
    this.pushEvent({
      event: 'go_to_fleet_safety_report_from_reports_page',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Fleet Safety Report - Reports Page',
      eventLabel: fleetId,
    });
  }

  public gotoRequestVideoPageFromTripsListPage(assetId: string, driverId: string) {
    this.pushEvent({
      event: 'go_to_request_video_from_trip_list_page',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Request Video Page - Trip List Page',
      eventLabel: assetId,
      eventValue: driverId,
    });
  }

  public gotoRequestVideoPageFromTripDetailsPage(assetId: string, driverId: string) {
    this.pushEvent({
      event: 'go_to_request_video_from_trip_details_page',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Request Video Page - Trip Details Page',
      eventLabel: assetId,
      eventValue: driverId,
    });
  }

  public gotoTripDetailsFromRequestVideoDialog(violationType: string, assetId: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_request_video_dialog',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Trip Details Page - Request Video Dialog',
      eventLabel: violationType,
      eventValue: assetId,
    });
  }

  public gotoVideoRequestFromSuccessfullRequestVideoConfirm() {
    this.pushEvent({
      event: 'go_to_video_request_from_successfull_request_video_confirm',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Video Request Page - Successfull Request Video Confirm',
    });
  }

  public gotoCoachingSessionFromCoachingPage() {
    this.pushEvent({
      event: 'go_to_coaching_session_from_coaching_page_coachable_drivers',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Coaching Session Page - Coaching Page',
    });
  }

  public gotoDriversFromCoachingPageCoachableDrivers() {
    this.pushEvent({
      event: 'go_to_drivers_from_coaching_page_coachable_drivers',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Drivers Page - Coaching Page',
    });
  }

  public gotoCoachingSessionFromDriversPage() {
    this.pushEvent({
      event: 'go_to_coaching_session_from_drivers_page',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Coaching Session Page - Drivers Page',
    });
  }

  public gotoCoachingPageFromCoachingCompleteModel() {
    this.pushEvent({
      event: 'go_to_coaching_page_from_coaching_complete_model',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Coaching Page - Coaching Complete Model',
    });
  }

  public gotoCoachingPageFromEndSession() {
    this.pushEvent({
      event: 'go_to_coaching_page_from_end_session',
      eventCategory: EventCategory.links,
      eventAction: 'Go to Coaching Page - End Session',
    });
  }

  // Event category: Pagination
  public fleetHighlightsPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_fleet_recommended_incidents_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Fleet Recommended Event carousel page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public safeDriversPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_safe_drivers_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change safe drivers table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public unsafeDriversPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_unsafe_drivers_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change unsafe drivers table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public videoRequestsPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_video_requests_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change video requests table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public tripListPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_trip_list_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Trips List Table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public activeDriverPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_active_drivers_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Active Drivers Table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }
  public coachingDriverTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_coaching_drivers_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change coaching drivers table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public assetListTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_asset_list_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Asset List table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }
  public challangeDriverTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'challenge_driver_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Challenge Driver Video List table page', // +
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }
  public driverHighlightsTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'driver_recommended_incidents_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Driver Recommended Events carousel page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }
  public driverPanicButtonTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'driver_panic_button_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Driver Panic Button Video List table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeAssetListLiveViewPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_asset_list_Liewview_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Asset List Liewview Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeIncidentDialogPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_incident_dialog_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Incident Dialog Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeArchivedReportsTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_archived_reports_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Archived Reports Table Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeDeviceListAssetPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_device_list_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Device List Table Asset Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeDriversListConfigurationPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_drivers_list_configuration_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Drivers List Table Configurations Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeUserListPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_user_list_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change User List Table User Management Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeDriversListDriversPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_drivers_list_drivers_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Drivers List Table Drivers Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeFeatureAnnouncementPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_feature_announcement_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Feature Announcements Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public tripDetailsTablePageChange(page: PageEvent) {
    this.pushEvent({
      event: 'trip_details_table_table_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Trip Details table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeCoachingTablePage(page: PageEvent) {
    this.pushEvent({
      event: 'change_coaching_panel_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Change Coaching Panel table page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeVideoRequestSearchTripListPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_video_request_search_trip_list_page',
      eventCategory: EventCategory.pagination,
      eventAction: 'Video Request Search Trip List Page',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeCoachingPageCoachableDriversPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_coaching_page_coachable_drivers_list',
      eventCategory: EventCategory.pagination,
      eventAction: 'Coaching Page Coachable Drivers',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  public changeCoachingPageCompletedCoachingSessionsPageChange(page: PageEvent) {
    this.pushEvent({
      event: 'change_coaching_page_completed_coaching_sessions_list',
      eventCategory: EventCategory.pagination,
      eventAction: 'Coaching Page Completed Coaching Sessions',
      eventLabel: this.getPageLabel(page),
      eventValue: page.pageIndex,
    });
  }

  // Event category: Sort
  public sortSafeDrivers(sort: Sort) {
    this.pushEvent({
      event: 'sort_safe_drivers',
      eventCategory: EventCategory.sort,
      eventAction: 'Sort safe drivers',
      eventLabel: `${sort.active} | ${sort.direction}`,
    });
  }

  public sortUnsafeDrivers(sort: Sort) {
    this.pushEvent({
      event: 'sort_unsafe_drivers',
      eventCategory: EventCategory.sort,
      eventAction: 'Sort unsafe drivers',
      eventLabel: `${sort.active} | ${sort.direction}`,
    });
  }

  public sortTripList(sort: Sort) {
    this.pushEvent({
      event: 'sort_trips',
      eventCategory: EventCategory.sort,
      eventAction: 'Sort trips',
      eventLabel: `${sort.active} | ${sort.direction}`,
    });
  }

  public sortActiveDrivers(sort: Sort) {
    this.pushEvent({
      event: 'sort_active_drivers',
      eventCategory: EventCategory.sort,
      eventAction: 'Sort active drivers',
      eventLabel: `${sort.active} | ${sort.direction}`,
    });
  }

  // Event category: user preference
  public updateTwoFactorAuthentication(valueType: string) {
    this.pushEvent({
      event: 'update_two_factor_authentication',
      eventCategory: EventCategory.userPreference,
      eventAction: 'Update Two Factor Authentication',
      eventLabel: valueType,
    });
  }

  public updateCookieConsent(valueType: string) {
    this.pushEvent({
      event: 'update_cookie_consent',
      eventCategory: EventCategory.userPreference,
      eventAction: 'Update Cookie Consent',
      eventLabel: valueType,
    });
  }

  public updateCustomizedStatisticalCookieConsent(valueType) {
    this.pushEvent({
      event: 'update_customized_statistical_cookie_consent',
      eventCategory: EventCategory.userPreference,
      eventAction: 'Customized Consent - Statistical Cookie',
      eventLabel: valueType,
    });
  }

  public updateCustomizedFunctionalCookieConsent(valueType) {
    this.pushEvent({
      event: 'update_customized_functional_cookie_consent',
      eventCategory: EventCategory.userPreference,
      eventAction: 'Customized Consent - Functional Cookie',
      eventLabel: valueType,
    });
  }

  public userPrefrenceChangeDateFormat(dateFormat: string) {
    this.pushEvent({
      event: 'user_settings_change_date_format',
      eventCategory: EventCategory.userPreference,
      eventAction: 'User Preference Settings - Date Format',
      eventLabel: dateFormat,
    });
  }

  public userPrefrenceChangeLanguageChange(language: string) {
    this.pushEvent({
      event: 'user_settings_change_language_change',
      eventCategory: EventCategory.userPreference,
      eventAction: 'User Preference Settings - Language Change',
      eventLabel: language,
    });
  }

  public userPrefrenceChangeMetricUnitChange(metricUnit: string) {
    this.pushEvent({
      event: 'user_settings_change_metric_unit_change',
      eventCategory: EventCategory.userPreference,
      eventAction: 'User Preference Settings - Metric Unit',
      eventLabel: metricUnit,
    });
  }

  public userPrefrenceChangeTimeZoneChange(timezone: string) {
    this.pushEvent({
      event: 'user_settings_change_timezone_change',
      eventCategory: EventCategory.userPreference,
      eventAction: 'User Preference Settings - TimeZone',
      eventLabel: timezone,
    });
  }

  // Event category: Export
  public downloadFleetSafetyReport(no_of_days: number) {
    this.pushEvent({
      event: 'download_fleet_safety_report',
      eventCategory: EventCategory.export,
      eventAction: 'Download Fleet Safety Report',
      eventLabel: no_of_days,
    });
  }

  public exportAssetCsv(fleetId: string) {
    this.pushEvent({
      event: 'download_export_asset_csv',
      eventCategory: EventCategory.export,
      eventAction: 'Download Export Asset CSV',
      eventLabel: fleetId,
    });
  }

  public exportTripsCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_export_trips_csv',
      eventCategory: EventCategory.export,
      eventAction: 'Download Export Trips CSV',
      eventLabel: fleetId,
    });
  }

  public exportUsersCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_export_users_list_csv',
      eventCategory: EventCategory.export,
      eventAction: 'Download Export Users List CSV',
      eventLabel: fleetId,
    });
  }

  public exportDriversCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_export_drivers_list_csv',
      eventCategory: EventCategory.export,
      eventAction: 'Download Export Drivers List CSV',
      eventLabel: fleetId,
    });
  }

  // Event category: SDK Configurations
  public saveAllDutyTypes() {
    this.pushEvent({
      event: 'save_advanced_all_duty_types',
      eventCategory: EventCategory.sdkConfiguration,
      eventAction: 'Save advanced SDK configurations',
      eventLabel: 'all',
    });
  }

  public saveBasicDutyTypes(dutyType: string) {
    this.pushEvent({
      event: 'save_basic_configuration',
      eventCategory: EventCategory.sdkConfiguration,
      eventAction: 'Save basic SDK configurations',
      eventLabel: dutyType,
    });
  }

  public saveAdvancedDutyTypes(dutyType: string) {
    this.pushEvent({
      event: 'save_advanced_configuration',
      eventCategory: EventCategory.sdkConfiguration,
      eventAction: 'Save advanced SDK configurations',
      eventLabel: dutyType,
    });
  }

  public agreeConsentDriverConfigurations(consentType: string) {
    this.pushEvent({
      event: 'agree_consent_driver_configuration',
      eventCategory: EventCategory.sdkConfiguration,
      eventAction: 'Agree Consent Driver Configurations',
      eventLabel: consentType,
    });
  }

  public saveDriverAudioRecordingConfigurations(value: string) {
    this.pushEvent({
      event: 'save_audio_recording_configuration',
      eventCategory: EventCategory.sdkConfiguration,
      eventAction: 'Driver Audio Recording',
      eventLabel: value,
    });
  }

  // Event category: Download
  public downloadSampleAssetUpdateCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_sample_asset_upate_csv',
      eventCategory: EventCategory.download,
      eventAction: 'Download Sample Asset Update CSV',
      eventLabel: fleetId,
    });
  }

  public downloadSampleProvisioningCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_sample_provisioning_csv',
      eventCategory: EventCategory.download,
      eventAction: 'Download Sample Provisioning CSV',
      eventLabel: fleetId,
    });
  }

  public downloadSampleDriversCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_sample_drivers_csv',
      eventCategory: EventCategory.download,
      eventAction: 'Download Sample Drivers CSV',
      eventLabel: fleetId,
    });
  }

  public downloadArchivedFleetSafetyReportCSV(fleetId: string) {
    this.pushEvent({
      event: 'download_archived_fleet_safety_report_csv',
      eventCategory: EventCategory.download,
      eventAction: 'Download Archived Fleet Safety Report CSV',
      eventLabel: fleetId,
    });
  }

  // Event category: Upload
  public uploadBatchAssetList(fleetId: string) {
    this.pushEvent({
      event: 'upload_batch_asset_list_csv',
      eventCategory: EventCategory.upload,
      eventAction: 'Upload Batch Asset List CSV',
      eventLabel: fleetId,
    });
  }

  public uploadBatchProvisioningDeviceList(fleetId: string) {
    this.pushEvent({
      event: 'upload_batch_provisioning_device_list_csv',
      eventCategory: EventCategory.upload,
      eventAction: 'Upload Batch Provisioning Device List CSV',
      eventLabel: fleetId,
    });
  }

  public uploadBatchDriversList(fleetId: string) {
    this.pushEvent({
      event: 'upload_batch_Drivers_list_csv',
      eventCategory: EventCategory.upload,
      eventAction: 'Upload Batch Drivers List CSV',
      eventLabel: fleetId,
    });
  }

  public uploadDriverImages(valueType: string, driverId: string) {
    this.pushEvent({
      event: 'upload_driver_images',
      eventCategory: EventCategory.widgets,
      eventAction: 'Upload Driver Images',
      eventlabel: valueType,
      eventValue: driverId,
    });
  }

  // Event category: Tabs
  public customTabs(pagePath = '', pageTitle = '', tabs = '') {
    this.pushEvent({
      event: 'Tabs',
      pagePath,
      pageTitle,
      tabs,
    });
  }

  public gotoTripDetailsFromDriverHighlights(violationType: string) {
    this.pushEvent({
      event: 'go_to_trip_details_from_driver_highlights',
      eventCategory: EventCategory.links,
      eventAction: 'Go to trip details - Driver highlights',
      eventLabel: violationType,
    });
  }

  public gtmConsent(value: string, statisticalCookies: boolean) {
    if (value === 'denied') {
      if (!statisticalCookies) {
        (window as any).clarity('stop');
        this.cookieService.deleteAllCookies();
      }
    }
    this.gtag('consent', 'update', {
      ad_storage: value,
      analytics_storage: value,
      functionality_storage: value,
      personalization_storage: value,
      security_storage: value,
    });
  }

  public gtag(..._args: any[]) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(arguments);
  }
}
