import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'inthinc',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/orbcomm/light-logo.svg',
    darkLogo: 'assets/orbcomm/dark-logo.svg',
    alt: 'Orbcomm',
    width: '140px',
    height: '20px',
  },
  authRoutes: ['iframe-login', 'tsplogin', 'admin-login'],
  wildcardRoute: 'iframe-login',
  ssoLocalStorageKeys: {
    authenticated: 'synergyportal.authenticated',
    accessToken: 'synergyportal.access_token',
  },
  showUserProfile: false,
  showLogo: false,
  showManageDriversTab: false,
  externalEventsLabel: 'External Trigger',
  showFeatureAnnouncement: false,
  showFeedbackButton: false,
  allowedRoutes: [
    'home',
    'safety-events',
    'trips',
    'live-view',
    'coaching',
    'video-requests',
    'drivers',
    'reports',
    'assets',
    'user-management',
    'configurations',
  ],
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
