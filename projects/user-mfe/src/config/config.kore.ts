import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'kore',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/kore/light-logo.png',
    darkLogo: 'assets/kore/dark-logo.png',
    alt: 'KORE',
    width: '96px',
    height: '36px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
