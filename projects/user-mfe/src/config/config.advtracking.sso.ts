import { ClientConfig, DefaultStorageType, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'advtracking',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/advtracking/light-logo.png',
    darkLogo: 'assets/advtracking/dark-logo.png',
    alt: 'Advantage One Vision',
    width: '250px',
    height: '50px',
  },
  authRoutes: ['iframe-implicit-login'],
  wildcardRoute: 'iframe-implicit-login',
  showLogoutButton: false,
  showFeatureAnnouncement: false,
  defaultStorage: DefaultStorageType.SessionStorage,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
