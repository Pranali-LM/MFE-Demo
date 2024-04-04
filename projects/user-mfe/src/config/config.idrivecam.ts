import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'idrivecam',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/idrivecam/light-logo.png',
    darkLogo: 'assets/idrivecam/dark-logo.png',
    alt: 'IDriveCam',
    width: '96px',
    height: '40px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
