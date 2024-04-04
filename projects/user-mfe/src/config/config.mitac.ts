import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'mitac',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/mitac/light-logo.svg',
    darkLogo: 'assets/mitac/dark-logo.svg',
    alt: 'Mitac',
    width: '160px',
    height: '40px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
