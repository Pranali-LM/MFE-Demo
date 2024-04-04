import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'intellitrac',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/intellitrac/light-logo.png',
    darkLogo: 'assets/intellitrac/dark-logo.png',
    alt: 'IntelliTrac',
    width: '140px',
    height: '33px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
