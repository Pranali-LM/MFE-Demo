import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'fleetilla',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/fleetilla/light-logo.svg',
    darkLogo: 'assets/fleetilla/dark-logo.svg',
    alt: 'Fleetilla',
    width: '140px',
    height: '35px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
