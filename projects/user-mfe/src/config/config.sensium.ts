import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'sensium',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/sensium/light-logo.svg',
    darkLogo: 'assets/sensium/dark-logo.svg',
    alt: 'Sensium',
    width: '144px',
    height: '40px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
