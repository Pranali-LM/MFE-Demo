import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'magtec',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/magtec/light-logo.png',
    darkLogo: 'assets/magtec/dark-logo.png',
    alt: 'Magtec',
    width: '165px',
    height: '43px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
