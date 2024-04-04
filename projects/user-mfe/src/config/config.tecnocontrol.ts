import { ClientConfig, DefaultStorageType, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'tcvsat',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/tecnocontrol/light-logo.png',
    darkLogo: 'assets/tecnocontrol/dark-logo.png',
    alt: 'Tecnocontrol',
    width: '96px',
    height: '56px',
  },
  authRoutes: ['iframe-implicit-login', 'tsplogin', 'admin-login'],
  wildcardRoute: 'iframe-implicit-login',
  defaultStorage: DefaultStorageType.SessionStorage,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
