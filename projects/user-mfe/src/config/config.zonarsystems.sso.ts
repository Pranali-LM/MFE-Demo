import { ClientConfig, DefaultStorageType, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'zonarsystems',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/zonarsystems/light-logo.svg',
    darkLogo: 'assets/zonarsystems/dark-logo.svg',
    alt: 'Zonar',
    width: '108px',
    height: '28px',
  },
  authRoutes: ['iframe-implicit-login', 'unauthorized-error'],
  wildcardRoute: 'iframe-implicit-login',
  showLogoutButton: false,
  defaultStorage: DefaultStorageType.SessionStorage,
  showFeatureAnnouncement: false,
  showFeedbackButton: false,
  sideNavColor: {
    lightBackgroundColor: '#005481',
    lightColor: '#bcd7ed',
    darkBackgroundColor: '#005481',
    darkColor: '#bcd7ed',
  },
  showUserTypeEmail: false,
  showTheme: false,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
