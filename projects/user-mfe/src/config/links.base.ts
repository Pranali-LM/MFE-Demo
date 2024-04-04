/**
 * All navigation routes available in the over all application including
 * admin, master and fleet
 */

export interface RouteParams {
  label: string; // Label to display in navigation header
  routerLink: string; // Router link
  icon: string;
  showDivider?: boolean;
  uiConfigKey?: string;
}

export const navigationRoutes: { [key: string]: RouteParams } = {
  home: {
    label: 'Home',
    routerLink: '/home',
    icon: 'home',
    // uiConfigKey: 'home_page',
  },
  'safety-events': {
    label: 'Safety Events',
    routerLink: '/safety-events',
    icon: 'warning',
    uiConfigKey: 'incidents_page',
  },
  trips: {
    label: 'Trips',
    routerLink: '/trips',
    icon: 'location_on',
    uiConfigKey: 'trips_page',
  },
  'live-view': {
    label: 'Live View',
    routerLink: '/live-view',
    icon: 'live_tv',
    uiConfigKey: 'live_view_page',
  },
  coaching: {
    label: 'Coaching',
    routerLink: '/coaching',
    icon: 'school',
    uiConfigKey: 'coaching_page',
  },
  'video-requests': {
    label: 'Video Requests',
    routerLink: '/video-requests',
    icon: 'subscriptions',
    uiConfigKey: 'video_request_page',
  },
  drivers: {
    label: 'Drivers',
    routerLink: '/drivers',
    icon: 'group',
    uiConfigKey: 'driver_page',
  },
  challenges: {
    label: 'Challenges',
    routerLink: '/challenges',
    icon: 'content_paste_search',
    showDivider: true,
    uiConfigKey: 'challenges_page',
  },
  reports: {
    label: 'Reports',
    routerLink: '/reports',
    icon: 'description',
    uiConfigKey: 'reports_page',
  },
  assets: {
    label: 'Assets',
    routerLink: '/assets',
    icon: 'local_shipping',
    uiConfigKey: 'assets_page',
  },
  'user-management': {
    label: 'Users',
    routerLink: '/user-management',
    icon: 'manage_accounts',
    uiConfigKey: 'user_management_page',
  },
  configurations: {
    label: 'Configurations',
    routerLink: '/configurations',
    icon: 'video_settings',
    uiConfigKey: 'configuration_page',
  },
  diagnostics: {
    label: 'Diagnostics',
    routerLink: '/diagnostics',
    icon: 'construction',
    uiConfigKey: 'home_page',
  },
};
