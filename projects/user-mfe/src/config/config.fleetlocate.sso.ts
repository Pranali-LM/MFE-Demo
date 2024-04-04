import { ClientConfig, DefaultStorageType, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'fleetlocate',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/fleetlocate/light-logo.svg',
    darkLogo: 'assets/fleetlocate/dark-logo.svg',
    alt: 'FleetLocate',
    width: '144px',
    height: '48px',
  },
  authRoutes: ['rsa-sso-login'],
  wildcardRoute: 'rsa-sso-login',
  defaultStorage: DefaultStorageType.SessionStorage,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
