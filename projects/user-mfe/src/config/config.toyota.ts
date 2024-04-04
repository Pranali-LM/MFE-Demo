import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'toyotafm',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/toyota/light-logo.png',
    darkLogo: 'assets/toyota/dark-logo.png',
    alt: 'Toyota',
    width: '168px',
    height: '40px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
